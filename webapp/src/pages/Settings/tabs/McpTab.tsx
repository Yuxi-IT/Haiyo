import { useEffect, useState, useCallback } from 'react';
import { Button, Chip, TextField, Input, Label, Modal, useOverlayState, Skeleton } from '@heroui/react';
import { Widget } from '@components/widget';
import { api } from '../../../shared/lib/api';
import { Server, PlugConnection, TrashBin } from '@gravity-ui/icons';

interface McpServerItem {
  _id: string;
  name: string;
  url: string;
  tools: { name: string; description: string }[];
  status: 'online' | 'offline' | 'error';
  lastChecked?: string;
}

export function McpTab() {
  const [servers, setServers] = useState<McpServerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', url: '' });
  const [saving, setSaving] = useState(false);
  const modalState = useOverlayState();

  const fetchServers = useCallback(() => {
    api.get<{ success: boolean; data: McpServerItem[] }>('/mcp')
      .then((r) => setServers(r.data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchServers(); }, [fetchServers]);

  const openAdd = () => {
    setForm({ name: '', url: '' });
    modalState.open();
  };

  const handleAdd = async () => {
    if (!form.name || !form.url) return;
    setSaving(true);
    await api.post('/mcp', form);
    setSaving(false);
    modalState.close();
    fetchServers();
  };

  const handleTest = async (id: string) => {
    await api.post(`/mcp/${id}/test`, {});
    fetchServers();
  };

  const handleDelete = async (id: string) => {
    await api.del(`/mcp/${id}`);
    fetchServers();
  };

  const statusColors: Record<string, 'success' | 'default' | 'danger'> = {
    online: 'success', offline: 'default', error: 'danger',
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <Skeleton className="h-8 w-36 rounded-lg" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Widget key={i}>
              <Widget.Content>
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-24 rounded" />
                    <Skeleton className="h-4 w-48 rounded" />
                  </div>
                  <div className="flex items-center gap-2">
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
            <Server className="size-3.5" />
            添加 MCP 服务器
          </Button>
          <Modal.Backdrop>
            <Modal.Container>
              <Modal.Dialog>
                <Modal.CloseTrigger />
                <Modal.Header>
                  <Modal.Heading>添加 MCP 服务器</Modal.Heading>
                </Modal.Header>
                <Modal.Body>
                  <div className="space-y-4">
                    <TextField value={form.name} onChange={(value) => setForm({ ...form, name: value })} isRequired>
                      <Label>名称</Label>
                      <Input />
                    </TextField>
                    <TextField value={form.url} onChange={(value) => setForm({ ...form, url: value })} isRequired>
                      <Label>URL</Label>
                      <Input />
                    </TextField>
                  </div>
                </Modal.Body>
                <Modal.Footer>
                  <Button slot="close">取消</Button>
                  <Button variant="primary" onPress={handleAdd} isDisabled={!form.name || !form.url || saving}>
                    {saving ? '添加中...' : '添加'}
                  </Button>
                </Modal.Footer>
              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
        </Modal>
      </div>

      <div className="space-y-3">
        {servers.map((s) => (
          <Widget key={s._id}>
            <Widget.Content>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Server className="size-4 text-neutral-500" />
                    <h3 className="font-medium">{s.name}</h3>
                    <Chip size="sm" variant="soft" color={statusColors[s.status]}>
                      {s.status}
                    </Chip>
                  </div>
                  <p className="text-sm text-neutral-500 mt-0.5">{s.url}</p>
                  {s.tools.length > 0 && (
                    <p className="text-xs text-neutral-400 mt-1">
                      工具: {s.tools.map((t) => t.name).join(', ')}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" onPress={() => handleTest(s._id)}>
                    <PlugConnection className="size-3.5" />
                    测试
                  </Button>
                  <Button size="sm" variant="danger" onPress={() => handleDelete(s._id)}>
                    <TrashBin className="size-3.5" />
                    删除
                  </Button>
                </div>
              </div>
            </Widget.Content>
          </Widget>
        ))}
      </div>

      {servers.length === 0 && (
        <p className="text-center py-8 text-neutral-500">暂无 MCP 服务器</p>
      )}
    </div>
  );
}
