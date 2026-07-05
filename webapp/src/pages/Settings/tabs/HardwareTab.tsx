import { useEffect, useState, useCallback } from 'react';
import { Button, Chip, CheckboxGroup, Checkbox, Label, Description, Modal, useOverlayState, TextField, Input, Skeleton } from '@heroui/react';
import { Widget } from '@components/widget';
import { api } from '../../../shared/lib/api';
import { Cpu, CircleCheck, CircleMinus, Display, Sun, Droplet, TrashBin } from '@gravity-ui/icons';

interface DeviceItem {
  _id: string;
  deviceId: string;
  name: string;
  type: string;
  room: string;
  status: 'online' | 'offline';
  lastSeen: string;
  config?: { minAngle?: number; maxAngle?: number; centerAngle?: number; speed?: number };
  metadata?: { ip?: string; capabilities?: string[] };
}

const capabilityOptions = [
  { key: 'camera', label: '摄像头', description: '视频监控与帧采集', icon: Display },
  { key: 'temperature', label: '温度监测', description: '环境温度实时采集', icon: Sun },
  { key: 'humidity', label: '湿度检测', description: '环境湿度实时采集', icon: Droplet },
];

const capabilityIcon: Record<string, typeof Display> = {
  camera: Display,
  temperature: Sun,
  humidity: Droplet,
};

export function HardwareTab() {
  const [devices, setDevices] = useState<DeviceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ip: '', name: '', capabilities: [] as string[] });
  const modalState = useOverlayState();

  const fetchDevices = useCallback(() => {
    api.get<{ success: boolean; data: DeviceItem[] }>('/hardware/devices')
      .then((r) => setDevices(r.data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchDevices(); }, [fetchDevices]);

  const openModal = () => {
    setForm({ ip: '', name: '', capabilities: [] });
    modalState.open();
  };

  const handleDelete = async (id: string) => {
    setDevices((prev) => prev.filter((d) => d._id !== id));
    await api.del(`/hardware/devices/${id}`);
  };

  const handleSave = async () => {
    if (!form.ip.trim()) return;
    setSaving(true);
    await api.post('/hardware/devices', form);
    setSaving(false);
    modalState.close();
    setLoading(true);
    fetchDevices();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-20 rounded" />
          <Skeleton className="h-8 w-28 rounded-lg" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Widget key={i}>
              <Widget.Content>
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-28 rounded" />
                      <Skeleton className="h-5 w-12 rounded-full" />
                      <Skeleton className="h-5 w-12 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-40 rounded" />
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
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-neutral-700">已连接设备</h3>
        <Modal state={modalState}>
          <Button size="sm" variant="primary" onPress={openModal}>
            <Cpu className="size-3.5" />
            添加设备
          </Button>
          <Modal.Backdrop>
            <Modal.Container>
              <Modal.Dialog>
                <Modal.CloseTrigger />
                <Modal.Header>
                  <Modal.Heading>添加设备</Modal.Heading>
                </Modal.Header>
                <Modal.Body>
                  <div className="space-y-4">
                    <TextField value={form.ip} onChange={(value) => setForm({ ...form, ip: value })} isRequired>
                      <Label>IP 地址</Label>
                      <Input placeholder="127.0.0.1:3000" />
                    </TextField>
                    <TextField value={form.name} onChange={(value) => setForm({ ...form, name: value })}>
                      <Label>设备名称（选填）</Label>
                      <Input placeholder="如：客厅传感器" />
                    </TextField>
                    <CheckboxGroup
                      value={form.capabilities}
                      onChange={(v) => setForm({ ...form, capabilities: v as string[] })}
                    >
                      <Label>子模块</Label>
                      <Description>选择设备上可用的传感器/模块</Description>
                      <div className="mt-2 space-y-2">
                        {capabilityOptions.map((cap) => (
                          <Checkbox key={cap.key} value={cap.key}>
                            <Checkbox.Content>
                              <Checkbox.Control>
                                <Checkbox.Indicator />
                              </Checkbox.Control>
                              {cap.label}
                            </Checkbox.Content>
                            <Description>{cap.description}</Description>
                          </Checkbox>
                        ))}
                      </div>
                    </CheckboxGroup>
                  </div>
                </Modal.Body>
                <Modal.Footer>
                  <Button slot="close">取消</Button>
                  <Button variant="primary" onPress={handleSave} isDisabled={!form.ip.trim() || saving}>
                    {saving ? '保存中...' : '保存'}
                  </Button>
                </Modal.Footer>
              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
        </Modal>
      </div>

      <div className="space-y-3">
        {devices.map((d) => (
          <Widget key={d._id} className="group/hw">
            <Widget.Content>
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Cpu className="size-4 text-neutral-500" />
                    <h3 className="font-medium">{d.name}</h3>
                    <Chip size="sm" variant="soft" color={d.status === 'online' ? 'success' : 'default'}>
                      {d.status === 'online' ? '在线' : '离线'}
                    </Chip>
                    <Chip size="sm" variant="secondary">{d.type}</Chip>
                  </div>
                  <p className="text-sm text-neutral-500 mt-0.5">
                    {d.room} · {d.deviceId}
                    {d.metadata?.ip && <span className="ml-2 text-xs text-neutral-400">IP: {d.metadata.ip}</span>}
                  </p>
                  {d.metadata?.capabilities && d.metadata.capabilities.length > 0 && (
                    <div className="flex gap-1 mt-1.5">
                      {d.metadata.capabilities.map((c) => {
                        const Icon = capabilityIcon[c];
                        return (
                          <Chip key={c} size="sm" variant="soft" color="accent">
                            <span className="flex items-center gap-0.5">
                              {Icon && <Icon className="size-3" />}
                              {capabilityOptions.find((o) => o.key === c)?.label || c}
                            </span>
                          </Chip>
                        );
                      })}
                    </div>
                  )}
                  <p className="text-xs text-neutral-400 mt-0.5">
                    最后连接: {new Date(d.lastSeen).toLocaleString('zh-CN')}
                  </p>
                </div>
                <button
                  type="button"
                  className="p-1 rounded text-neutral-400 opacity-0 group-hover/hw:opacity-100 transition-opacity hover:text-red-500 hover:bg-red-50 shrink-0"
                  onClick={() => handleDelete(d._id)}
                  aria-label="删除设备"
                >
                  <TrashBin className="size-3.5" />
                </button>
              </div>
              {d.config && d.type === 'actuator' && (
                <div className="mt-3 pt-3 border-t border-neutral-100">
                  <p className="text-xs text-neutral-400 mb-2">舵机校准</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between px-2 py-1 bg-neutral-50 rounded">
                      <span className="text-neutral-500">最小角度</span>
                      <span>{d.config.minAngle ?? 0}°</span>
                    </div>
                    <div className="flex justify-between px-2 py-1 bg-neutral-50 rounded">
                      <span className="text-neutral-500">最大角度</span>
                      <span>{d.config.maxAngle ?? 180}°</span>
                    </div>
                    <div className="flex justify-between px-2 py-1 bg-neutral-50 rounded">
                      <span className="text-neutral-500">中心角度</span>
                      <span>{d.config.centerAngle ?? 90}°</span>
                    </div>
                    <div className="flex justify-between px-2 py-1 bg-neutral-50 rounded">
                      <span className="text-neutral-500">速度</span>
                      <span>{d.config.speed ?? 50}</span>
                    </div>
                  </div>
                </div>
              )}
            </Widget.Content>
          </Widget>
        ))}
      </div>

      {devices.length === 0 && (
        <p className="text-center py-8 text-neutral-500">暂无已连接设备</p>
      )}
    </div>
  );
}
