import { useCallback, useEffect } from 'react';
import { Button } from '@heroui/react';
import { useAudioRecorder } from '../../shared/hooks/useAudioRecorder';
import { api } from '../../shared/lib/api';

interface Props {
  onTranscription: (text: string) => void;
  disabled?: boolean;
}

export function VoiceInputButton({ onTranscription, disabled }: Props) {
  const { status, error, startRecording, stopRecording } = useAudioRecorder(30000);

  const isRecording = status === 'recording';
  const isProcessing = status === 'processing';

  const handleClick = useCallback(async () => {
    if (isRecording) {
      const base64 = await stopRecording();
      if (!base64) return;

      try {
        const res = await api.post<{ success: boolean; data: { text: string } }>('/voice/asr', { audio: base64 });
        if (res.data?.text) {
          onTranscription(res.data.text);
        }
      } catch { /* ASR failed silently */ }
    } else {
      await startRecording();
    }
  }, [isRecording, startRecording, stopRecording, onTranscription]);

  useEffect(() => {
    if (error) console.warn('Voice input error:', error);
  }, [error]);

  return (
    <Button
      size="sm"
      variant="ghost"
      isIconOnly
      onPress={handleClick}
      isDisabled={disabled || isProcessing}
      aria-label={isRecording ? '停止录音' : '语音输入'}
      className={isRecording ? 'text-red-500 animate-pulse' : ''}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
        {isRecording ? (
          <rect x="6" y="6" width="12" height="12" rx="1" />
        ) : (
          <>
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </>
        )}
      </svg>
    </Button>
  );
}
