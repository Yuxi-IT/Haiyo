import { useEffect, useState, useCallback } from 'react';
import { Switch, TextField, Input, TextArea, Label, Select, ListBox, Description, Skeleton } from '@heroui/react';
import { api } from '../../../shared/lib/api';
import { Microphone, Key } from '@gravity-ui/icons';

interface VoiceSetting {
  _id: string;
  key: string;
  value: unknown;
  category: string;
}

const voiceOptions = [
  { key: 'cixingnansheng', label: '磁性男声' },
  { key: 'wenrounvsheng', label: '温柔女声' },
  { key: 'qinglangnansheng', label: '晴朗男声' },
  { key: 'tianmeinvsheng', label: '甜美女生' },
  { key: 'chenshunansheng', label: '沉稳男声' },
];

const doubaoSpeakerOptions = [
  { key: 'zh_female_cancan', label: '灿灿（女声）' },
  { key: 'zh_male_chunhou', label: '淳厚（男声）' },
  { key: 'zh_female_shuangkuai', label: '爽快（女声）' },
  { key: 'zh_male_qingse', label: '青涩（男声）' },
  { key: 'zh_female_gentle', label: '温柔（女声）' },
];

export function VoiceTab() {
  const [settings, setSettings] = useState<VoiceSetting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ success: boolean; data: VoiceSetting[] }>('/settings?category=voice')
      .then((res) => setSettings(res.data))
      .finally(() => setLoading(false));
  }, []);

  const getVal = useCallback((key: string, fallback: unknown = '') =>
    settings.find((s) => s.key === key)?.value ?? fallback, [settings]);

  const updateSetting = async (key: string, value: unknown) => {
    await api.put(`/settings/${key}`, { value, category: 'voice' });
    setSettings((prev) =>
      prev.some((s) => s.key === key)
        ? prev.map((s) => (s.key === key ? { ...s, value } : s))
        : [...prev, { _id: '', key, value, category: 'voice' }]
    );
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-lg">
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-lg">
      <TextField
        defaultValue={String(getVal('voice.stepfun_api_key', ''))}
        onBlur={(e) => updateSetting('voice.stepfun_api_key', (e.target as HTMLInputElement).value)}
      >
        <Label className="flex items-center gap-1.5">
          <Key className="size-3.5" />
          StepFun API Key
        </Label>
        <Description>在 StepFun 控制台获取 API Key</Description>
        <Input type="password" placeholder="sk-..." />
      </TextField>

      <Select
        selectedKey={String(getVal('voice.tts_voice', 'cixingnansheng'))}
        onSelectionChange={(key) => updateSetting('voice.tts_voice', String(key))}
      >
        <Label className="flex items-center gap-1.5">
          <Microphone className="size-3.5" />
          TTS 语音角色
        </Label>
        <Description>选择语音合成的声音风格</Description>
        <Select.Trigger>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            {voiceOptions.map((v) => (
              <ListBox.Item key={v.key} id={v.key}>
                <Label>{v.label}</Label>
              </ListBox.Item>
            ))}
          </ListBox>
        </Select.Popover>
      </Select>

      <TextField
        defaultValue={String(getVal('voice.tts_instruction', ''))}
        onBlur={(e) => updateSetting('voice.tts_instruction', (e.target as HTMLTextAreaElement).value)}
      >
        <Label>语音指令</Label>
        <Description>指导语音的语气、语速、情感等（如"语气温柔，语速适中"）</Description>
        <TextArea placeholder="语气温柔，语速适中" rows={2} className="resize-none" />
      </TextField>

      <div className="space-y-3 pt-4 border-t border-neutral-100">
        <h3 className="flex items-center gap-1.5 text-sm font-medium text-neutral-700">
          <Microphone className="size-3.5" />
          语音功能开关
        </h3>
        <div className="flex items-center justify-between py-1">
          <Description>语音输入（ASR）</Description>
          <Switch
            isSelected={getVal('voice.enabled_input', true) as boolean}
            onChange={() => updateSetting('voice.enabled_input', !getVal('voice.enabled_input', true))}
            size="sm"
          />
        </div>
        <div className="flex items-center justify-between py-1">
          <Description>语音输出（TTS）</Description>
          <Switch
            isSelected={getVal('voice.enabled_output', true) as boolean}
            onChange={() => updateSetting('voice.enabled_output', !getVal('voice.enabled_output', true))}
            size="sm"
          />
        </div>
      </div>

      <div className="space-y-4 pt-6 border-t border-neutral-200">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold text-neutral-800">
          🎙️ 豆包语音（对话模式）
        </h3>
        <p className="text-xs text-neutral-400">配置豆包大模型 ASR/TTS，用于 Chat 页面的连续语音对话</p>

        <TextField
          defaultValue={String(getVal('voice.doubao_api_key', ''))}
          onBlur={(e) => updateSetting('voice.doubao_api_key', (e.target as HTMLInputElement).value)}
        >
          <Label className="flex items-center gap-1.5">
            <Key className="size-3.5" />
            豆包 Access Key
          </Label>
          <Description>在火山引擎控制台获取 Access Key</Description>
          <Input type="password" placeholder="输入 Access Key..." />
        </TextField>

        <TextField
          defaultValue={String(getVal('voice.doubao_app_key', ''))}
          onBlur={(e) => updateSetting('voice.doubao_app_key', (e.target as HTMLInputElement).value)}
        >
          <Label className="flex items-center gap-1.5">
            <Key className="size-3.5" />
            豆包 App Key
          </Label>
          <Description>在火山引擎控制台获取 App Key</Description>
          <Input type="password" placeholder="输入 App Key..." />
        </TextField>

        <TextField
          defaultValue={String(getVal('voice.doubao_asr_resource_id', 'volc.bigasr.sauc.duration'))}
          onBlur={(e) => updateSetting('voice.doubao_asr_resource_id', (e.target as HTMLInputElement).value)}
        >
          <Label>ASR 资源 ID</Label>
          <Description>ASR 服务的资源标识符</Description>
          <Input placeholder="volc.bigasr.sauc.duration" />
        </TextField>

        <Select
          selectedKey={String(getVal('voice.doubao_tts_speaker', 'zh_female_cancan'))}
          onSelectionChange={(key) => updateSetting('voice.doubao_tts_speaker', String(key))}
        >
          <Label className="flex items-center gap-1.5">
            <Microphone className="size-3.5" />
            TTS 说话人
          </Label>
          <Description>选择语音合成的声音角色</Description>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {doubaoSpeakerOptions.map((v) => (
                <ListBox.Item key={v.key} id={v.key}>
                  <Label>{v.label}</Label>
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
      </div>
    </div>
  );
}
