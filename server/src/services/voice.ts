import { Settings } from '../models';

interface VoiceConfig {
  apiKey: string;
  ttsVoice: string;
  ttsInstruction: string;
  asrLanguage: string;
}

export interface DoubaoConfig {
  apiKey: string;
  appKey: string;
  asrResourceId: string;
  ttsSpeaker: string;
}

export async function getVoiceConfig(): Promise<VoiceConfig> {
  const settings = await Settings.find({ category: 'voice' }).lean();
  const map: Record<string, unknown> = {};
  for (const s of settings) map[s.key] = s.value;

  return {
    apiKey: (map['voice.stepfun_api_key'] as string) || '',
    ttsVoice: (map['voice.tts_voice'] as string) || 'cixingnansheng',
    ttsInstruction: (map['voice.tts_instruction'] as string) || '',
    asrLanguage: (map['voice.asr_language'] as string) || 'zh',
  };
}

export async function getDoubaoConfig(): Promise<DoubaoConfig> {
  const settings = await Settings.find({ category: 'voice' }).lean();
  const map: Record<string, unknown> = {};
  for (const s of settings) map[s.key] = s.value;

  return {
    apiKey: (map['voice.doubao_api_key'] as string) || '',
    appKey: (map['voice.doubao_app_key'] as string) || '',
    asrResourceId: (map['voice.doubao_asr_resource_id'] as string) || 'volc.bigasr.sauc.duration',
    ttsSpeaker: (map['voice.doubao_tts_speaker'] as string) || 'zh_female_cancan',
  };
}

export async function transcribeAudio(audioBase64: string, language?: string): Promise<string> {
  const config = await getVoiceConfig();
  if (!config.apiKey) throw new Error('StepFun API Key 未配置');

  const lang = language || config.asrLanguage;

  const body = JSON.stringify({
    audio: {
      data: audioBase64,
      input: {
        transcription: {
          model: 'stepaudio-2.5-asr',
          language: lang,
          enable_itn: true,
        },
        format: {
          type: 'pcm',
          codec: 'pcm_s16le',
          rate: 16000,
          bits: 16,
          channel: 1,
        },
      },
    },
  });

  const res = await fetch('https://api.stepfun.com/step_plan/v1/audio/asr/sse', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body,
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`ASR 请求失败: ${res.status} ${errText}`);
  }

  if (!res.body) throw new Error('ASR 响应无内容');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let text = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const json = JSON.parse(line.slice(6));
          if (json.result?.text) text += json.result.text;
        } catch { /* skip malformed */ }
      }
    }
  }

  return text || '';
}

export async function synthesizeSpeech(
  text: string,
  voice?: string,
  instruction?: string,
): Promise<ArrayBuffer> {
  const config = await getVoiceConfig();
  if (!config.apiKey) throw new Error('StepFun API Key 未配置');

  const res = await fetch('https://api.stepfun.com/step_plan/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: 'stepaudio-2.5-tts',
      input: text.slice(0, 2000),
      voice: voice || config.ttsVoice,
      instruction: instruction || config.ttsInstruction || undefined,
      response_format: 'mp3',
    }),
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`TTS 请求失败: ${res.status} ${errText}`);
  }

  return res.arrayBuffer();
}
