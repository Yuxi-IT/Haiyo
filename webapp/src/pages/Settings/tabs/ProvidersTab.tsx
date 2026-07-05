import { useEffect, useState, useCallback } from 'react';
import { Button, Chip, TextField, Input, Label, Select, ListBox, Modal, useOverlayState, Skeleton } from '@heroui/react';
import { Widget } from '@components/widget';
import { api } from '../../../shared/lib/api';
import { Cloud, PlugConnection, TrashBin, Pencil, CircleCheck, CircleXmark } from '@gravity-ui/icons';

interface Provider {
  _id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  protocol: string;
  models: string[];
  enabled: boolean;
}

const protocolOptions = [
  { key: 'claude', label: 'Claude (Anthropic)' },
  { key: 'openai-chat', label: 'OpenAI Chat' },
  { key: 'openai-reasoning', label: 'OpenAI Reasoning (o1/o3)' },
  { key: 'deepseek-reasoning', label: 'DeepSeek Reasoning (R1)' },
];

const emptyForm: Partial<Provider> = { name: '', baseUrl: '', apiKey: '', protocol: 'openai-chat', models: [], enabled: true };

export function ProvidersTab() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Provider> | null>(null);
  const [testResult, setTestResult] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const modalState = useOverlayState();

  const fetchProviders = useCallback(() => {
    api.get<{ success: boolean; data: Provider[] }>('/providers')
      .then((r) => setProviders(r.data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchProviders(); }, [fetchProviders]);

  const openAdd = () => {
    setEditing({ ...emptyForm });
    modalState.open();
  };

  const openEdit = (p: Provider) => {
    setEditing({ ...p });
    modalState.open();
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    if (editing._id) {
      await api.put(`/providers/${editing._id}`, editing);
    } else {
      await api.post('/providers', editing);
    }
    setSaving(false);
    modalState.close();
    fetchProviders();
  };

  const handleTest = async (id: string) => {
    setTestResult((prev) => ({ ...prev, [id]: '测试中...' }));
    try {
      const res = await api.post<{ success: boolean; data?: { response: string }; error?: string }>(`/providers/${id}/test`, {});
      setTestResult((prev) => ({ ...prev, [id]: (res as any).success ? '连接成功' : (res as any).error || '失败' }));
    } catch (e: any) {
      setTestResult((prev) => ({ ...prev, [id]: e.message }));
    }
  };

  const handleDelete = async (id: string) => {
    await api.del(`/providers/${id}`);
    fetchProviders();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <Skeleton className="h-8 w-28 rounded-lg" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Widget key={i}>
              <Widget.Content>
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-24 rounded" />
                    <Skeleton className="h-4 w-48 rounded" />
                    <Skeleton className="h-3 w-32 rounded" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-7 w-14 rounded-lg" />
                    <Skeleton className="h-7 w-14 rounded-lg" />
                    <Skeleton className="h-7 w-14 rounded-lg" />
                  </div>
                </div>
              </Widget.Content>
            </Widget>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Modal state={modalState}>
          <Button size="sm" variant="primary" onPress={openAdd}>
            <Cloud className="size-3.5" />
            添加供应商
          </Button>
          <Modal.Backdrop>
            <Modal.Container>
              <Modal.Dialog>
                <Modal.CloseTrigger />
                <Modal.Header>
                  <Modal.Heading>{editing?._id ? '编辑供应商' : '添加供应商'}</Modal.Heading>
                </Modal.Header>
                <Modal.Body>
                  <div className="space-y-4">
                    <TextField value={editing?.name || ''} onChange={(value) => setEditing((e) => ({ ...e, name: value }))}>
                      <Label>名称</Label>
                      <Input />
                    </TextField>
                    <TextField value={editing?.baseUrl || ''} onChange={(value) => setEditing((e) => ({ ...e, baseUrl: value }))}>
                      <Label>Base URL</Label>
                      <Input />
                    </TextField>
                    <TextField value={(editing?.apiKey === '***' ? '' : editing?.apiKey) || ''} onChange={(value) => setEditing((e) => ({ ...e, apiKey: value }))}>
                      <Label>API Key</Label>
                      <Input type="password" />
                    </TextField>
                    <Select
                      selectedKey={editing?.protocol || 'openai-chat'}
                      onSelectionChange={(key) => setEditing((e) => ({ ...e, protocol: String(key) }))}
                    >
                      <Label>协议</Label>
                      <Select.Trigger>
                        <Select.Value />
                        <Select.Indicator />
                      </Select.Trigger>
                      <Select.Popover>
                        <ListBox>
                          {protocolOptions.map((p) => (
                            <ListBox.Item key={p.key} id={p.key} textValue={p.label}>
                              <Label>{p.label}</Label>
                            </ListBox.Item>
                          ))}
                        </ListBox>
                      </Select.Popover>
                    </Select>
                    <TextField value={editing?.models?.join(', ') || ''} onChange={(value) => setEditing((e) => ({ ...e, models: value.split(',').map((s) => s.trim()).filter(Boolean) }))}>
                      <Label>模型（逗号分隔）</Label>
                      <Input />
                    </TextField>
                  </div>
                </Modal.Body>
                <Modal.Footer>
                  <Button slot="close">取消</Button>
                  <Button variant="primary" onPress={handleSave} isDisabled={!editing?.name || saving}>
                    {saving ? '保存中...' : '保存'}
                  </Button>
                </Modal.Footer>
              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
        </Modal>
      </div>

      <div className="space-y-3">
        {providers.map((p) => (
          <Widget key={p._id}>
            <Widget.Content>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Cloud className="size-4 text-neutral-500" />
                    <h3 className="font-medium">{p.name}</h3>
                    <Chip size="sm" variant="soft" color={p.enabled ? 'success' : 'default'}>
                      {p.enabled ? '启用' : '禁用'}
                    </Chip>
                  </div>
                  <p className="text-sm text-neutral-500 mt-0.5">{p.baseUrl}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {protocolOptions.find((o) => o.key === p.protocol)?.label} · {p.models.join(', ')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" onPress={() => handleTest(p._id)}>
                    <PlugConnection className="size-3.5" />
                    测试
                  </Button>
                  <Button size="sm" variant="ghost" onPress={() => openEdit(p)}>
                    <Pencil className="size-3.5" />
                    编辑
                  </Button>
                  <Button size="sm" variant="danger" onPress={() => handleDelete(p._id)}>
                    <TrashBin className="size-3.5" />
                    删除
                  </Button>
                </div>
              </div>
              {testResult[p._id] && (
                <div className="flex items-center gap-1.5 mt-2 text-sm">
                  {testResult[p._id] === '连接成功' ? <CircleCheck className="size-3.5 text-success" /> : testResult[p._id] === '测试中...' ? null : <CircleXmark className="size-3.5 text-danger" />}
                  <span className="text-neutral-600">{testResult[p._id]}</span>
                </div>
              )}
            </Widget.Content>
          </Widget>
        ))}
      </div>

      {providers.length === 0 && (
        <p className="text-center py-8 text-neutral-500">暂无 API 供应商</p>
      )}
    </div>
  );
}
