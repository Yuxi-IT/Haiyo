/**
 * 豆包（ByteDance）ASR WebSocket 代理服务
 *
 * 浏览器前端 ⇄ 本服务(Elysia WS) ⇄ 字节跳动大模型语音识别 API
 *
 * 二进制协议实现参考：sauc_python/sauc_websocket_demo.py
 */

import { gzipSync, gunzipSync } from 'bun';
import { getDoubaoConfig } from './voice';

// ─── 协议常量 ───────────────────────────────────────────────

const PROTOCOL_VERSION = 0x01;
const HEADER_SIZE = 1; // 以 4 字节为单位，即 4 bytes

/** 消息类型 */
const enum MsgType {
  CLIENT_FULL_REQUEST = 0x01,
  CLIENT_AUDIO_ONLY = 0x02,
  SERVER_FULL_RESPONSE = 0x09,
  SERVER_ERROR = 0x0f,
}

/** 消息类型标志位 */
const enum MsgFlags {
  NO_SEQUENCE = 0x00,
  POS_SEQUENCE = 0x01,
  NEG_SEQUENCE = 0x02,
  NEG_WITH_SEQUENCE = 0x03,
}

const SERIALIZATION_JSON = 0x01;
const COMPRESSION_GZIP = 0x01;

const UPSTREAM_URL = 'wss://openspeech.bytedance.com/api/v3/sauc/bigmodel';
const DEFAULT_RESOURCE_ID = 'volc.bigasr.sauc.duration';

// ─── 二进制构建工具 ─────────────────────────────────────────

/** 构建 4 字节协议头 */
function buildHeader(msgType: number, flags: number): Uint8Array {
  const buf = new Uint8Array(4);
  buf[0] = (PROTOCOL_VERSION << 4) | HEADER_SIZE;
  buf[1] = (msgType << 4) | flags;
  buf[2] = (SERIALIZATION_JSON << 4) | COMPRESSION_GZIP;
  buf[3] = 0x00; // reserved
  return buf;
}

/** 写入 big-endian int32 */
function writeInt32BE(value: number): Uint8Array {
  const buf = new Uint8Array(4);
  const dv = new DataView(buf.buffer);
  dv.setInt32(0, value, false);
  return buf;
}

/** 写入 big-endian uint32 */
function writeUint32BE(value: number): Uint8Array {
  const buf = new Uint8Array(4);
  const dv = new DataView(buf.buffer);
  dv.setUint32(0, value, false);
  return buf;
}

/** 拼接多个 Uint8Array */
function concat(...parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((s, p) => s + p.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const p of parts) {
    result.set(p, offset);
    offset += p.length;
  }
  return result;
}

// ─── 请求构建 ───────────────────────────────────────────────

/** 构建 full_client_request（初始配置请求） */
function buildFullClientRequest(seq: number): Uint8Array {
  const header = buildHeader(MsgType.CLIENT_FULL_REQUEST, MsgFlags.POS_SEQUENCE);

  const payload = {
    user: { uid: 'smarthome_user' },
    audio: {
      format: 'pcm',
      codec: 'raw',
      rate: 16000,
      bits: 16,
      channel: 1,
    },
    request: {
      model_name: 'bigmodel',
      enable_itn: true,
      enable_punc: true,
      enable_ddc: true,
      show_utterances: true,
      enable_nonstream: false,
    },
  };

  const payloadBytes = new TextEncoder().encode(JSON.stringify(payload));
  const compressed = gzipSync(payloadBytes);
  const compressedArr = new Uint8Array(compressed);

  return concat(
    header,
    writeInt32BE(seq),
    writeUint32BE(compressedArr.length),
    compressedArr,
  );
}

/** 构建 audio_only_request（音频数据包） */
function buildAudioOnlyRequest(seq: number, pcmData: Uint8Array, isLast: boolean): Uint8Array {
  const flags = isLast ? MsgFlags.NEG_WITH_SEQUENCE : MsgFlags.POS_SEQUENCE;
  const header = buildHeader(MsgType.CLIENT_AUDIO_ONLY, flags);

  const compressed = gzipSync(pcmData);
  const compressedArr = new Uint8Array(compressed);

  // 最后一个包 seq 取负值
  const seqValue = isLast ? -seq : seq;

  return concat(
    header,
    writeInt32BE(seqValue),
    writeUint32BE(compressedArr.length),
    compressedArr,
  );
}

// ─── 响应解析 ───────────────────────────────────────────────

interface AsrResponse {
  code: number;
  event: number;
  isLast: boolean;
  sequence: number;
  payloadMsg: any;
}

/** 解析上游二进制响应 */
function parseResponse(data: Uint8Array): AsrResponse {
  const result: AsrResponse = {
    code: 0,
    event: 0,
    isLast: false,
    sequence: 0,
    payloadMsg: null,
  };

  const headerSize = data[0] & 0x0f; // 以 4 字节为单位
  const messageType = data[1] >> 4;
  const flags = data[1] & 0x0f;
  const compression = data[2] & 0x0f;

  let offset = headerSize * 4;

  // 解析 flags
  if (flags & 0x01) {
    // 有 sequence number
    const dv = new DataView(data.buffer, data.byteOffset + offset, 4);
    result.sequence = dv.getInt32(0, false);
    offset += 4;
  }
  if (flags & 0x02) {
    result.isLast = true;
  }
  if (flags & 0x04) {
    // event 字段
    const dv = new DataView(data.buffer, data.byteOffset + offset, 4);
    result.event = dv.getInt32(0, false);
    offset += 4;
  }

  // 按 messageType 解析 payload 大小
  if (messageType === MsgType.SERVER_FULL_RESPONSE) {
    // 4 bytes payload_size
    offset += 4;
  } else if (messageType === MsgType.SERVER_ERROR) {
    const dv = new DataView(data.buffer, data.byteOffset + offset, 8);
    result.code = dv.getInt32(0, false);
    // 4 bytes payload_size
    offset += 8;
  }

  let payload = data.slice(offset);
  if (payload.length === 0) return result;

  // 解压
  if (compression === COMPRESSION_GZIP) {
    try {
      payload = new Uint8Array(gunzipSync(payload));
    } catch (e) {
      console.error('[doubao-asr] 解压响应失败:', e);
      return result;
    }
  }

  // JSON 解析
  try {
    const text = new TextDecoder().decode(payload);
    result.payloadMsg = JSON.parse(text);
  } catch (e) {
    console.error('[doubao-asr] 解析响应 JSON 失败:', e);
  }

  return result;
}

// ─── WebSocket 代理主逻辑 ───────────────────────────────────

/**
 * 处理来自前端的 ASR WebSocket 连接
 *
 * @param ws Elysia WebSocket 对象，需要有 ws.send() / ws.close()
 */
export async function handleAsrWebSocket(ws: any): Promise<void> {
  let upstream: WebSocket | null = null;
  let seq = 1;
  let closed = false;

  const cleanup = () => {
    closed = true;
    if (upstream && upstream.readyState <= WebSocket.OPEN) {
      try { upstream.close(); } catch {}
    }
  };

  try {
    // 1. 读取豆包 ASR 配置
    const config = await getDoubaoConfig();
    if (!config.accessToken || !config.appId) {
      ws.send(JSON.stringify({ type: 'error', message: '豆包 ASR 未配置 Access Token / APP ID' }));
      ws.close();
      return;
    }

    // 2. 建立到字节跳动的上游 WebSocket 连接
    const requestId = crypto.randomUUID();
    upstream = new WebSocket(UPSTREAM_URL, {
      headers: {
        'X-Api-Resource-Id': config.asrResourceId || DEFAULT_RESOURCE_ID,
        'X-Api-Request-Id': requestId,
        'X-Api-Access-Key': config.accessToken,
        'X-Api-App-Key': config.appId,
      },
    } as any);

    // Bun WebSocket 默认以 string 接收，需要设置 binaryType
    upstream.binaryType = 'arraybuffer';

    // 等待上游连接打开
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('上游连接超时')), 10000);
      upstream!.onopen = () => {
        clearTimeout(timeout);
        resolve();
      };
      upstream!.onerror = (e) => {
        clearTimeout(timeout);
        reject(new Error(`上游连接失败: ${e}`));
      };
    });

    console.log(`[doubao-asr] 上游连接已建立 (requestId=${requestId})`);

    // 3. 发送 full_client_request (seq=1)
    const fullReq = buildFullClientRequest(seq);
    seq++;
    upstream.send(fullReq);

    // 4. 等待上游确认响应
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('等待上游确认超时')), 10000);

      const onMsg = (event: MessageEvent) => {
        clearTimeout(timeout);
        upstream!.removeEventListener('message', onMsg);

        const data = new Uint8Array(event.data as ArrayBuffer);
        const resp = parseResponse(data);

        if (resp.code !== 0) {
          reject(new Error(`上游返回错误: code=${resp.code}, msg=${JSON.stringify(resp.payloadMsg)}`));
          return;
        }

        console.log('[doubao-asr] 收到上游确认，准备就绪');
        resolve();
      };

      upstream!.addEventListener('message', onMsg);
    });

    // 5. 通知前端已就绪
    ws.send(JSON.stringify({ type: 'ready' }));

    // 6. 设置上游消息持续监听 → 转发识别结果到前端
    upstream.onmessage = (event: MessageEvent) => {
      if (closed) return;

      try {
        const data = new Uint8Array(event.data as ArrayBuffer);
        const resp = parseResponse(data);

        if (resp.code !== 0) {
          console.error('[doubao-asr] 上游错误:', resp.code, resp.payloadMsg);
          ws.send(JSON.stringify({
            type: 'error',
            message: `ASR 错误: ${resp.code}`,
            detail: resp.payloadMsg,
          }));
          return;
        }

        // 提取识别文本
        const text = resp.payloadMsg?.result?.text ?? '';
        const utterances = resp.payloadMsg?.result?.utterances ?? [];

        ws.send(JSON.stringify({
          type: 'asr',
          text,
          utterances,
          is_last: resp.isLast,
        }));

        if (resp.isLast) {
          console.log('[doubao-asr] 收到最终结果，关闭连接');
          cleanup();
        }
      } catch (e) {
        console.error('[doubao-asr] 处理上游消息出错:', e);
      }
    };

    upstream.onerror = (e) => {
      if (closed) return;
      console.error('[doubao-asr] 上游 WebSocket 错误:', e);
      ws.send(JSON.stringify({ type: 'error', message: '上游连接异常' }));
      cleanup();
    };

    upstream.onclose = () => {
      if (closed) return;
      console.log('[doubao-asr] 上游连接已关闭');
      closed = true;
    };

    // 7. 监听前端消息
    ws.data = {
      /** 处理前端发来的消息 */
      onMessage: (message: any) => {
        if (closed || !upstream || upstream.readyState !== WebSocket.OPEN) return;

        try {
          // 文本消息（JSON 控制指令）
          if (typeof message === 'string') {
            const parsed = JSON.parse(message);

            if (parsed.type === 'end') {
              // 发送最后一个空音频包（NEG_WITH_SEQUENCE）
              const lastReq = buildAudioOnlyRequest(seq, new Uint8Array(0), true);
              upstream.send(lastReq);
              console.log(`[doubao-asr] 发送结束包 (seq=${seq})`);
              return;
            }

            console.warn('[doubao-asr] 未知前端指令:', parsed);
            return;
          }

          // 二进制消息（原始 PCM 音频数据）
          const pcmData = new Uint8Array(
            message instanceof ArrayBuffer ? message : message.buffer ?? message,
          );

          const audioReq = buildAudioOnlyRequest(seq, pcmData, false);
          seq++;
          upstream.send(audioReq);
        } catch (e) {
          console.error('[doubao-asr] 处理前端消息出错:', e);
        }
      },

      /** 前端断开连接 */
      onClose: () => {
        console.log('[doubao-asr] 前端连接已关闭');
        cleanup();
      },
    };
  } catch (e: any) {
    console.error('[doubao-asr] 初始化失败:', e);
    try {
      ws.send(JSON.stringify({ type: 'error', message: e.message || '初始化失败' }));
      ws.close();
    } catch {}
    cleanup();
  }
}
