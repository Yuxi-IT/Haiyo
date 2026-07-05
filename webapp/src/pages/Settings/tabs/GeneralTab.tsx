import { useEffect, useState, useCallback } from 'react';
import { Switch, TextField, Input, TextArea, Label, Select, ListBox, Description, Skeleton } from '@heroui/react';
import { api } from '../../../shared/lib/api';
import { Gear, Bell, Globe, Comment, FaceSmile } from '@gravity-ui/icons';

interface Setting {
  _id: string;
  key: string;
  value: unknown;
  category: string;
  description?: string;
}

export function GeneralTab() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<{ success: boolean; data: Setting[] }>('/settings?category=general'),
      api.get<{ success: boolean; data: Setting[] }>('/settings?category=notification'),
    ]).then(([gen, notif]) => {
      setSettings([...gen.data, ...notif.data]);
    }).finally(() => setLoading(false));
  }, []);

  const getVal = useCallback((key: string, fallback: unknown = '') =>
    settings.find((s) => s.key === key)?.value ?? fallback, [settings]);

  const updateSetting = async (key: string, value: unknown, category = 'general') => {
    await api.put(`/settings/${key}`, { value, category });
    setSettings((prev) =>
      prev.map((s) => (s.key === key ? { ...s, value } : s))
    );
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-lg">
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <div className="pt-4 border-t border-neutral-100 space-y-3">
          <Skeleton className="h-5 w-24 rounded" />
          <div className="flex items-center justify-between py-1">
            <Skeleton className="h-4 w-16 rounded" />
            <Skeleton className="h-6 w-10 rounded-full" />
          </div>
          <div className="flex items-center justify-between py-1">
            <Skeleton className="h-4 w-16 rounded" />
            <Skeleton className="h-6 w-10 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-lg">
      <TextField
        defaultValue={String(getVal('system.name', '智能管家'))}
        onBlur={(e) => updateSetting('system.name', (e.target as HTMLInputElement).value)}
      >
        <Label className="flex items-center gap-1.5">
          <Gear className="size-3.5" />
          系统名称
        </Label>
        <Input />
      </TextField>

      <Select
        selectedKey={String(getVal('system.language', 'zh-CN'))}
        onSelectionChange={(key) => updateSetting('system.language', String(key))}
      >
        <Label className="flex items-center gap-1.5">
          <Globe className="size-3.5" />
          系统语言
        </Label>
        <Select.Trigger>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            <ListBox.Item id="zh-CN">
              <Label>中文（简体）</Label>
            </ListBox.Item>
            <ListBox.Item id="en-US">
              <Label>English</Label>
            </ListBox.Item>
          </ListBox>
        </Select.Popover>
      </Select>

      <div className="space-y-3 pt-4 border-t border-neutral-100">
        <h3 className="flex items-center gap-1.5 text-sm font-medium text-neutral-700">
          <FaceSmile className="size-3.5" />
          AI 人格设定
        </h3>
        <TextField
          defaultValue={String(getVal('ai.nickname', '小智'))}
          onBlur={(e) => updateSetting('ai.nickname', (e.target as HTMLInputElement).value, 'general')}
        >
          <Label>AI 昵称（自称）</Label>
          <Description>AI 如何称呼自己，如"小管家"、"小智"</Description>
          <Input placeholder="小智" />
        </TextField>

        <TextField
          defaultValue={String(getVal('ai.personality', '你是一个温柔细心的家庭管家，关心每个家庭成员的生活。你性格开朗，说话带点俏皮，喜欢用日常口语交流。'))}
          onBlur={(e) => updateSetting('ai.personality', (e.target as HTMLTextAreaElement).value, 'general')}
        >
          <Label>人格设定</Label>
          <Description>简短描述 AI 的身份和性格</Description>
          <TextArea placeholder="你是一个..." rows={3} className="resize-none" />
        </TextField>

        <TextField
          defaultValue={String(getVal('ai.reply_style', '回复简短温馨，口语化，像家人聊天一样自然。不要长篇大论。偶尔用表情语气词。'))}
          onBlur={(e) => updateSetting('ai.reply_style', (e.target as HTMLTextAreaElement).value, 'general')}
        >
          <Label>说话风格</Label>
          <Description>AI 回复时的语气和风格</Description>
          <TextArea placeholder="回复简短温馨..." rows={2} className="resize-none" />
        </TextField>

        <TextField
          defaultValue={String(getVal('ai.style_variants', ''))}
          onBlur={(e) => updateSetting('ai.style_variants', (e.target as HTMLTextAreaElement).value, 'general')}
        >
          <Label>备用风格库</Label>
          <Description>每行一个风格，AI 会随机切换增加趣味性（可选）</Description>
          <TextArea placeholder="有时候毒舌吐槽，但不要太过分&#10;今天心情好，多说两句&#10;用古风语气说话" rows={3} className="resize-none" />
        </TextField>

        <div className="flex items-center justify-between py-1">
          <Description>随机切换风格</Description>
          <Switch
            isSelected={getVal('ai.style_random', false) as boolean}
            onChange={() => updateSetting('ai.style_random', !getVal('ai.style_random', false), 'general')}
            size="sm"
          />
        </div>
        <div className="flex items-center justify-between py-1">
          <Description>AI 记忆库</Description>
          <Switch
            isSelected={getVal('ai.memory_enabled', true) as boolean}
            onChange={() => updateSetting('ai.memory_enabled', !getVal('ai.memory_enabled', true), 'general')}
            size="sm"
          />
        </div>
      </div>

      <div className="space-y-3 pt-4 border-t border-neutral-100">
        <h3 className="flex items-center gap-1.5 text-sm font-medium text-neutral-700">
          <Comment className="size-3.5" />
          AI 系统提示词
        </h3>
        <TextField
          defaultValue={String(getVal('system.prompt', ''))}
          onBlur={(e) => updateSetting('system.prompt', (e.target as HTMLTextAreaElement).value, 'general')}
        >
          <Label className="sr-only">系统提示词</Label>
          <TextArea
            placeholder="设置 AI 助手的系统提示词，例如：你是一个智能管家 AI 助手..."
            rows={4}
            className="resize-none"
          />
        </TextField>
      </div>

      <div className="space-y-3 pt-4 border-t border-neutral-100">
        <h3 className="flex items-center gap-1.5 text-sm font-medium text-neutral-700">
          <Bell className="size-3.5" />
          通知设置
        </h3>
        <div className="flex items-center justify-between py-1">
          <Description>推送通知</Description>
          <Switch
            isSelected={getVal('notification.push', true) as boolean}
            onChange={() => updateSetting('notification.push', !getVal('notification.push', true), 'notification')}
            size="sm"
          />
        </div>
        <div className="flex items-center justify-between py-1">
          <Description>声音通知</Description>
          <Switch
            isSelected={getVal('notification.sound', true) as boolean}
            onChange={() => updateSetting('notification.sound', !getVal('notification.sound', true), 'notification')}
            size="sm"
          />
        </div>
      </div>
    </div>
  );
}
