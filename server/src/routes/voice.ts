import { Elysia, t } from 'elysia';
import { transcribeAudio, synthesizeSpeech, getVoiceConfig } from '../services/voice';
import { handleAsrWebSocket } from '../services/doubao-asr';
import { handleTtsWebSocket } from '../services/doubao-tts';

export const voiceRoutes = new Elysia({ prefix: '/api/voice' })

  .post('/asr', async ({ body }) => {
    try {
      const text = await transcribeAudio(body.audio, body.language);
      return { success: true, data: { text } };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }, {
    body: t.Object({
      audio: t.String(),
      language: t.Optional(t.String()),
    }),
  })

  .post('/tts', async ({ body }) => {
    try {
      const audioBuf = await synthesizeSpeech(body.text, body.voice, body.instruction);
      return new Response(audioBuf, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': String(audioBuf.byteLength),
        },
      });
    } catch (e: any) {
      return Response.json({ success: false, error: e.message }, { status: 500 });
    }
  }, {
    body: t.Object({
      text: t.String(),
      voice: t.Optional(t.String()),
      instruction: t.Optional(t.String()),
    }),
  })

  .get('/config', async () => {
    const config = await getVoiceConfig();
    return {
      success: true,
      data: {
        asrLanguage: config.asrLanguage,
        ttsVoice: config.ttsVoice,
        ttsInstruction: config.ttsInstruction,
        hasApiKey: !!config.apiKey,
      },
    };
  })

  // 豆包 ASR WebSocket 代理
  .ws('/asr-ws', {
    open(ws) {
      console.log('[Voice] ASR WebSocket 已连接');
      handleAsrWebSocket(ws).catch((e) => {
        console.error('[Voice] ASR 代理错误:', e);
        try { ws.close(); } catch {}
      });
    },
    message(ws, raw) {
      const data = (ws as any).data;
      if (data?.onMessage) data.onMessage(raw);
    },
    close(ws) {
      console.log('[Voice] ASR WebSocket 已断开');
      const data = (ws as any).data;
      if (data?.onClose) data.onClose();
    },
  })

  // 豆包 TTS WebSocket 代理
  .ws('/tts-ws', {
    open(ws) {
      console.log('[Voice] TTS WebSocket 已连接');
      handleTtsWebSocket(ws).catch((e) => {
        console.error('[Voice] TTS 代理错误:', e);
        try { ws.close(); } catch {}
      });
    },
    message(ws, raw) {
      const data = (ws as any).data;
      if (data?.onMessage) data.onMessage(raw);
    },
    close(ws) {
      console.log('[Voice] TTS WebSocket 已断开');
      const data = (ws as any).data;
      if (data?.onClose) data.onClose();
    },
  });
