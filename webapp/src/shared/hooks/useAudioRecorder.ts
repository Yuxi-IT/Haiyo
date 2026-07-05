import { useState, useRef, useCallback } from 'react';

interface RecorderState {
  status: 'idle' | 'recording' | 'processing';
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string | null>;
}

const SAMPLE_RATE = 16000;

export function useAudioRecorder(maxDurationMs = 30000): RecorderState {
  const [status, setStatus] = useState<'idle' | 'recording' | 'processing'>('idle');
  const [error, setError] = useState<string | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Int16Array[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cleanup = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    processorRef.current?.disconnect();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    ctxRef.current?.close();
    ctxRef.current = null;
    processorRef.current = null;
    streamRef.current = null;
  }, []);

  const startRecording = useCallback(async () => {
    setError(null);
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { sampleRate: SAMPLE_RATE, channelCount: 1, echoCancellation: true, noiseSuppression: true },
      });
      streamRef.current = stream;

      const ctx = new AudioContext({ sampleRate: SAMPLE_RATE });
      ctxRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const processor = ctx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        const input = e.inputBuffer.getChannelData(0);
        const int16 = new Int16Array(input.length);
        for (let i = 0; i < input.length; i++) {
          const s = Math.max(-1, Math.min(1, input[i]));
          int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        chunksRef.current.push(int16);
      };

      source.connect(processor);
      processor.connect(ctx.destination);
      setStatus('recording');

      timerRef.current = setTimeout(() => { stopRecording(); }, maxDurationMs);
    } catch (e: any) {
      if (e.name === 'NotAllowedError') {
        setError('麦克风权限被拒绝');
      } else {
        setError(e.message || '无法启动录音');
      }
    }
  }, [maxDurationMs]);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    if (status !== 'recording') return null;
    setStatus('processing');

    cleanup();

    const totalLen = chunksRef.current.reduce((s, c) => s + c.length, 0);
    if (totalLen === 0) {
      setStatus('idle');
      return null;
    }

    const merged = new Int16Array(totalLen);
    let offset = 0;
    for (const c of chunksRef.current) {
      merged.set(c, offset);
      offset += c.length;
    }

    // Convert Int16 to base64
    const bytes = new Uint8Array(merged.buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);

    setStatus('idle');
    return base64;
  }, [status, cleanup]);

  return { status, error, startRecording, stopRecording };
}
