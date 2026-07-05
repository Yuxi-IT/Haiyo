/**
 * 豆包 TTS WebSocket 代理服务
 *
 * 实现火山引擎 Seed-TTS 2.0 的二进制 WebSocket 协议，
 * 在前端 WebSocket 和豆包 TTS 服务之间做桥接。
 *
 * 协议参考: websocket unidirectional/protocols.py
 */

import { getDoubaoConfig } from './voice';

// ─── 协议常量 ─────────────────────────────────────

const TTS_ENDPOINT = 'wss://openspeech.bytedance.com/api/v3/tts/unidirectional/stream';
const TTS_RESOURCE_ID = 'seed-tts-2.0';

/** 协议版本 */
const PROTOCOL_VERSION = 0x01;
/** header 占 1 个 4-byte 单元 */
const HEADER_SIZE = 0x01;

// ─── Message Types ────────────────────────────────
const MSG_FULL_CLIENT_REQUEST = 0x01;
const MSG_FULL_SERVER_RESPONSE = 0x09;
const MSG_AUDIO_ONLY_SERVER = 0x0b;
const MSG_ERROR = 0x0f;

// ─── Flags ────────────────────────────────────────
const FLAG_NO_SEQ = 0x00;
const FLAG_POSITIVE_SEQ = 0x01;
const FLAG_LAST_NO_SEQ = 0x02;
const FLAG_NEGATIVE_SEQ = 0x03;
const FLAG_WITH_EVENT = 0x04;

// ─── Serialization ────────────────────────────────
const SERIAL_JSON = 0x01;
const SERIAL_NONE = 0x00;

// ─── Compression ──────────────────────────────────
const COMPRESS_NONE = 0x00;
const COMPRESS_GZIP = 0x01;

// ─── Event Types ──────────────────────────────────
const EVT_START_CONNECTION = 1;
const EVT_FINISH_CONNECTION = 2;
const EVT_CONNECTION_STARTED = 50;
const EVT_CONNECTION_FAILED = 51;
const EVT_CONNECTION_FINISHED = 52;
const EVT_START_SESSION = 100;
const EVT_FINISH_SESSION = 102;
const EVT_SESSION_STARTED = 150;
const EVT_SESSION_FINISHED = 152;
const EVT_TASK_REQUEST = 200;
const EVT_TTS_SENTENCE_START = 350;
const EVT_TTS_SENTENCE_END = 351;
const EVT_TTS_RESPONSE = 352;
const EVT_TTS_ENDED = 359;

/** 这些事件不携带 session_id */
const CONNECTION_LEVEL_EVENTS = new Set([
  EVT_START_CONNECTION,
  EVT_FINISH_CONNECTION,
  EVT_CONNECTION_STARTED,
  EVT_CONNECTION_FAILED,
  EVT_CONNECTION_FINISHED,
]);

// ─── 编码辅助 ─────────────────────────────────────

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

/** 构建 4 字节协议头 */
function buildHeader(
  msgType: number,
  flag: number,
  serialization: number = SERIAL_JSON,
  compression: number = COMPRESS_NONE,
): Buffer {
  const buf = Buffer.alloc(HEADER_SIZE * 4);
  buf[0] = (PROTOCOL_VERSION << 4) | HEADER_SIZE;
  buf[1] = (msgType << 4) | flag;
  buf[2] = (serialization << 4) | compression;
  buf[3] = 0x00; // reserved
  return buf;
}

/** 编码带 event 的客户端消息 */
function marshalWithEvent(
  event: number,
  sessionId: string | null,
  payload: object | null,
): Buffer {
  const header = buildHeader(MSG_FULL_CLIENT_REQUEST, FLAG_WITH_EVENT);
  const parts: Buffer[] = [header];

  // 4-byte event
  const evtBuf = Buffer.alloc(4);
  evtBuf.writeInt32BE(event);
  parts.push(evtBuf);

  // session_id (连接级事件不带)
  if (!CONNECTION_LEVEL_EVENTS.has(event) && sessionId !== null) {
    const sidBytes = textEncoder.encode(sessionId);
    const lenBuf = Buffer.alloc(4);
    lenBuf.writeUInt32BE(sidBytes.length);
    parts.push(lenBuf, Buffer.from(sidBytes));
  }

  // payload
  const payloadBytes = payload ? textEncoder.encode(JSON.stringify(payload)) : new Uint8Array(0);
  const plenBuf = Buffer.alloc(4);
  plenBuf.writeUInt32BE(payloadBytes.length);
  parts.push(plenBuf, Buffer.from(payloadBytes));

  return Buffer.concat(parts);
}

/** 解析服务端返回的二进制帧 */
interface ServerFrame {
  version: number;
  headerSize: number;
  msgType: number;
  flag: number;
  serialization: number;
  compression: number;
  sequence?: number;
  event?: number;
  sessionId?: string;
  connectId?: string;
  errorCode?: number;
  payload: Buffer;
}

function unmarshal(data: Buffer): ServerFrame {
  const version = data[0] >> 4;
  const headerSize = data[0] & 0x0f;
  const msgType = data[1] >> 4;
  const flag = data[1] & 0x0f;
  const serialization = data[2] >> 4;
  const compression = data[2] & 0x0f;

  let offset = headerSize * 4;

  const frame: ServerFrame = {
    version,
    headerSize,
    msgType,
    flag,
    serialization,
    compression,
    payload: Buffer.alloc(0),
  };

  // Error 类型先读 4-byte error_code
  if (msgType === MSG_ERROR) {
    frame.errorCode = data.readUInt32BE(offset);
    offset += 4;
  }

  // FullServerResponse / AudioOnlyServer 带序列号
  if (
    (msgType === MSG_FULL_SERVER_RESPONSE || msgType === MSG_AUDIO_ONLY_SERVER) &&
    (flag === FLAG_POSITIVE_SEQ || flag === FLAG_NEGATIVE_SEQ)
  ) {
    frame.sequence = data.readInt32BE(offset);
    offset += 4;
  }

  // WithEvent 标志
  if (flag === FLAG_WITH_EVENT) {
    frame.event = data.readInt32BE(offset);
    offset += 4;

    if (frame.event !== undefined) {
      // 连接级事件读 connect_id
      if (
        frame.event === EVT_CONNECTION_STARTED ||
        frame.event === EVT_CONNECTION_FAILED ||
        frame.event === EVT_CONNECTION_FINISHED
      ) {
        const cidLen = data.readUInt32BE(offset);
        offset += 4;
        frame.connectId = textDecoder.decode(data.subarray(offset, offset + cidLen));
        offset += cidLen;
      } else if (!CONNECTION_LEVEL_EVENTS.has(frame.event)) {
        // 会话级事件读 session_id
        const sidLen = data.readUInt32BE(offset);
        offset += 4;
        frame.sessionId = textDecoder.decode(data.subarray(offset, offset + sidLen));
        offset += sidLen;
      }
    }
  }

  // 读 payload
  if (offset + 4 <= data.length) {
    const payloadSize = data.readUInt32BE(offset);
    offset += 4;
    if (payloadSize > 0 && offset + payloadSize <= data.length) {
      frame.payload = data.subarray(offset, offset + payloadSize) as Buffer;
    }
  }

  return frame;
}

/** 解压 payload（如果需要） */
function decompressPayload(frame: ServerFrame): Uint8Array {
  if (frame.compression === COMPRESS_GZIP && frame.payload.length > 0) {
    const gz = Bun.gunzipSync(new Uint8Array(frame.payload) as Uint8Array<ArrayBuffer>);
    return new Uint8Array(gz) as Uint8Array<ArrayBuffer>;
  }
  return new Uint8Array(frame.payload) as Uint8Array<ArrayBuffer>;
}

// ─── 主处理函数 ────────────────────────────────────

export async function handleTtsWebSocket(ws: any): Promise<void> {
  let upstreamWs: WebSocket | null = null;

  /** 向前端发送 JSON 消息 */
  function sendJson(obj: object) {
    try {
      ws.send(JSON.stringify(obj));
    } catch {
      // 前端可能已断开
    }
  }

  /** 向前端发送错误并关闭 */
  function sendError(message: string) {
    sendJson({ type: 'error', message });
  }

  /** 清理上游连接 */
  function cleanup() {
    if (upstreamWs) {
      try {
        upstreamWs.close();
      } catch {
        // ignore
      }
      upstreamWs = null;
    }
  }

  // 监听前端消息
  ws.data = {
    onMessage: async (msg: string | Buffer) => {
      try {
        // 只处理文本 JSON 消息
        if (typeof msg !== 'string') return;
        const parsed = JSON.parse(msg);

        if (parsed.type === 'synthesize' && typeof parsed.text === 'string') {
          await startSynthesis(parsed.text);
        }
      } catch (err: any) {
        sendError(`消息处理失败: ${err.message}`);
      }
    },
    onClose: () => {
      cleanup();
    },
  };

  // Elysia ws 事件绑定（兼容不同写法）
  if (typeof ws.subscribe === 'function') {
    // Elysia 风格已在路由层绑定 message/close
  }

  /** 执行 TTS 合成流程 */
  async function startSynthesis(text: string) {
    // 清理之前的连接
    cleanup();

    const config = await getDoubaoConfig();
    if (!config.apiKey) {
      sendError('豆包 API Key 未配置');
      return;
    }

    const requestId = crypto.randomUUID();
    const sessionId = crypto.randomUUID();

    // 连接上游豆包 TTS 服务
    return new Promise<void>((resolve) => {
      upstreamWs = new WebSocket(TTS_ENDPOINT, {
        headers: {
          'X-Api-Key': config.apiKey,
          'X-Api-Resource-Id': TTS_RESOURCE_ID,
          'X-Api-Request-Id': requestId,
        },
      } as any);

      upstreamWs.binaryType = 'arraybuffer';

      let handshakeStage = 0; // 0=connecting, 1=connectionStarted, 2=sessionStarted

      upstreamWs.onopen = () => {
        // 步骤 1: 发送 StartConnection
        const msg = marshalWithEvent(EVT_START_CONNECTION, null, {});
        upstreamWs!.send(msg);
      };

      upstreamWs.onmessage = (event: MessageEvent) => {
        try {
          const raw = Buffer.from(event.data as ArrayBuffer);
          const frame = unmarshal(raw);

          // 处理错误
          if (frame.msgType === MSG_ERROR) {
            const payload = decompressPayload(frame);
            const errMsg = payload.length > 0 ? textDecoder.decode(payload) : `错误码: ${frame.errorCode}`;
            sendError(`TTS 服务错误: ${errMsg}`);
            cleanup();
            resolve();
            return;
          }

          const evt = frame.event;

          // 步骤 2: 收到 ConnectionStarted → 发送 StartSession
          if (evt === EVT_CONNECTION_STARTED && handshakeStage === 0) {
            handshakeStage = 1;

            const sessionPayload = {
              req_params: {
                text,
                speaker: config.ttsSpeaker || 'zh_female_cancan',
                audio_params: {
                  format: 'mp3',
                  sample_rate: 24000,
                },
              },
            };
            const msg = marshalWithEvent(EVT_START_SESSION, sessionId, sessionPayload);
            upstreamWs!.send(msg);
            return;
          }

          // 步骤 3: 收到 SessionStarted → 发送 TaskRequest
          if (evt === EVT_SESSION_STARTED && handshakeStage === 1) {
            handshakeStage = 2;

            const taskPayload = { text };
            const msg = marshalWithEvent(EVT_TASK_REQUEST, sessionId, taskPayload);
            upstreamWs!.send(msg);
            return;
          }

          // 步骤 4: 处理音频数据
          if (evt === EVT_TTS_RESPONSE) {
            const audioData = decompressPayload(frame);
            if (audioData.length > 0) {
              try {
                // 直接发送原始音频二进制给前端
                ws.send(new Uint8Array(audioData));
              } catch {
                // 前端可能已断开
              }
            }
            return;
          }

          // TTS 合成句子开始/结束 (可忽略)
          if (evt === EVT_TTS_SENTENCE_START || evt === EVT_TTS_SENTENCE_END) {
            return;
          }

          // 步骤 5: TTS 结束
          if (evt === EVT_TTS_ENDED) {
            sendJson({ type: 'tts_end' });

            // 发送 FinishSession
            const finishSession = marshalWithEvent(EVT_FINISH_SESSION, sessionId, {});
            try {
              upstreamWs!.send(finishSession);
            } catch {
              // ignore
            }
            return;
          }

          // SessionFinished → 发送 FinishConnection 并关闭
          if (evt === EVT_SESSION_FINISHED) {
            const finishConn = marshalWithEvent(EVT_FINISH_CONNECTION, null, {});
            try {
              upstreamWs!.send(finishConn);
            } catch {
              // ignore
            }
            // 稍作延迟后关闭
            setTimeout(() => {
              cleanup();
              resolve();
            }, 200);
            return;
          }

          // ConnectionFailed
          if (evt === EVT_CONNECTION_FAILED) {
            const payload = decompressPayload(frame);
            const errMsg = payload.length > 0 ? textDecoder.decode(payload) : '连接失败';
            sendError(`TTS 连接失败: ${errMsg}`);
            cleanup();
            resolve();
            return;
          }
        } catch (err: any) {
          sendError(`协议解析错误: ${err.message}`);
          cleanup();
          resolve();
        }
      };

      upstreamWs.onerror = (event: Event) => {
        sendError('TTS 上游连接异常');
        cleanup();
        resolve();
      };

      upstreamWs.onclose = () => {
        upstreamWs = null;
        resolve();
      };

      // 超时保护 (30 秒)
      setTimeout(() => {
        if (upstreamWs) {
          sendError('TTS 请求超时');
          cleanup();
          resolve();
        }
      }, 30000);
    });
  }
}
