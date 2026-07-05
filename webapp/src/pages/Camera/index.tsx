import { useState, useCallback, useMemo } from 'react';
import { motion } from 'motion/react';
import { Widget } from '@components/widget';
import { staggerContainer, fadeUpItem } from '../../shared/lib/animations';
import { useQuery } from '../../shared/hooks/use-api';
import { Button, Chip, Skeleton, Modal, TextField, Input, Label, CheckboxGroup, Checkbox, Description } from '@heroui/react';
import { api } from '../../shared/lib/api';
import { Cpu, Display, Sun, Droplet, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, CircleStop, TrashBin, ArrowRotateLeft } from '@gravity-ui/icons';
import { CameraViewModal } from './CameraViewModal';

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

const capabilityIcons: Record<string, typeof Display> = {
  camera: Display,
  temperature: Sun,
  humidity: Droplet,
};

const capabilityLabels: Record<string, string> = {
  camera: '摄像头',
  temperature: '温度',
  humidity: '湿度',
  servo: '舵机',
};

const capabilityOptions = [
  { key: 'camera', label: '摄像头', description: '视频监控与帧采集', icon: Display },
  { key: 'temperature', label: '温度监测', description: '环境温度实时采集', icon: Sun },
  { key: 'humidity', label: '湿度检测', description: '环境湿度实时采集', icon: Droplet },
  { key: 'servo', label: '舵机云台', description: '摄像头角度控制', icon: ChevronUp },
];

const capabilityIconSmall: Record<string, typeof Display> = {
  camera: Display,
  temperature: Sun,
  humidity: Droplet,
  servo: ChevronUp,
};

export function CameraPage() {
  const { data: devices, loading, refetch, setData: setDevices } = useQuery<DeviceItem[]>('/hardware/devices');
  const [form, setForm] = useState({ ip: '', name: '', capabilities: [] as string[] });
  const [saving, setSaving] = useState(false);
  const [viewDeviceId, setViewDeviceId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const addModalState = useMemo(() => ({
    isOpen: addOpen,
    setOpen: setAddOpen,
    open: () => setAddOpen(true),
    close: () => setAddOpen(false),
    toggle: () => setAddOpen((v) => !v),
  }), [addOpen]);

  const handleDeleteDevice = useCallback(async (id: string) => {
    setDevices((prev) => prev?.filter((d) => d._id !== id) ?? null);
    await api.del(`/hardware/devices/${id}`);
  }, [setDevices]);

  const openAdd = useCallback(() => {
    setForm({ ip: '', name: '', capabilities: [] });
    setAddOpen(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!form.ip.trim()) return;
    setSaving(true);
    await api.post('/hardware/devices', {
      ip: form.ip.trim(),
      name: form.name.trim() || undefined,
      capabilities: form.capabilities,
    });
    setSaving(false);
    setAddOpen(false);
    refetch();
  }, [form, refetch]);

  return (
    <motion.div
      animate="show"
      className="space-y-6"
      initial="hidden"
      variants={staggerContainer}
    >
      <motion.div variants={fadeUpItem} className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-1.5 text-lg font-semibold">
            <Cpu className="size-5" />
            硬件设备
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">摄像头、传感器均为开发板功能模块，添加设备后自动注册</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" isIconOnly onPress={refetch} aria-label="刷新状态">
            <ArrowRotateLeft className="size-4" />
          </Button>
          <Button size="sm" variant="primary" onPress={openAdd}>
              <Cpu className="size-3.5" />
              添加设备
            </Button>
          <Modal state={addModalState}>
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
                      <Input placeholder="如：客厅开发板" />
                    </TextField>
                    <CheckboxGroup
                      value={form.capabilities}
                      onChange={(v) => setForm({ ...form, capabilities: v as string[] })}
                    >
                      <Label>功能模块</Label>
                      <Description>选择设备上可用的传感器/模块</Description>
                      <div className="mt-2 space-y-2">
                        {capabilityOptions.map((cap) => (
                          <Checkbox key={cap.key} value={cap.key}>
                            <Checkbox.Content>
                              <Checkbox.Control>
                                <Checkbox.Indicator />
                              </Checkbox.Control>
                            </Checkbox.Content>
                            <Description>{cap.description}</Description>
                          </Checkbox>
                        ))}
                      </div>
                    </CheckboxGroup>
                  </div>
                </Modal.Body>
                <Modal.Footer>
                  <Button onPress={() => addModalState.close()}>取消</Button>
                  <Button variant="primary" onPress={handleSave} isDisabled={!form.ip.trim() || saving}>
                    {saving ? '保存中...' : '保存'}
                  </Button>
                </Modal.Footer>
              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
        </Modal>
        </div>
      </motion.div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Widget key={i}>
              <Widget.Content>
                <Skeleton className="aspect-video w-full rounded-lg mb-3" />
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24 rounded" />
                    <Skeleton className="h-3 w-32 rounded" />
                  </div>
                  <Skeleton className="h-5 w-12 rounded-full" />
                </div>
              </Widget.Content>
            </Widget>
          ))}
        </div>
      )}

      {!loading && (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={staggerContainer}
        >
          {devices?.map((device) => {
            const caps = device.metadata?.capabilities || [];
            const hasCamera = caps.includes('camera');
            const hasServo = caps.includes('servo');

            return (
              <motion.div key={device._id} variants={fadeUpItem}>
                <Widget className="group/cam">
                  <Widget.Header>
                    <Widget.Title>{device.name}</Widget.Title>
                    <button
                      type="button"
                      className="p-1 rounded text-neutral-400 opacity-0 group-hover/cam:opacity-100 transition-opacity hover:text-red-500 hover:bg-red-50"
                      onClick={() => handleDeleteDevice(device._id)}
                      aria-label="删除设备"
                    >
                      <TrashBin className="size-3.5" />
                    </button>
                  </Widget.Header>
                  <Widget.Content>
                    {hasCamera && (
                      <div className="mb-3">
                        <Button
                          size="sm"
                          variant="secondary"
                          isDisabled={device.status !== 'online'}
                          onPress={() => setViewDeviceId(device.deviceId)}
                        >
                          <Display className="size-3.5" />
                          查看画面
                        </Button>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm text-neutral-600">{device.room}</p>
                        <p className="text-xs text-neutral-400">{device.deviceId}</p>
                        {device.metadata?.ip && (
                          <p className="text-xs text-neutral-400">IP: {device.metadata.ip}</p>
                        )}
                      </div>
                      <Chip
                        size="sm"
                        color={device.status === 'online' ? 'success' : 'default'}
                        variant="soft"
                      >
                        {device.status === 'online' ? '在线' : '离线'}
                      </Chip>
                    </div>

                    {caps.length > 0 && (
                      <div className="flex gap-1 mt-3 flex-wrap">
                        {caps.map((cap) => {
                          const Icon = capabilityIconSmall[cap];
                          return (
                            <Chip key={cap} size="sm" variant="soft" color="accent">
                              <span className="flex items-center gap-0.5">
                                {Icon && <Icon className="size-3" />}
                                {capabilityLabels[cap] || cap}
                              </span>
                            </Chip>
                          );
                        })}
                      </div>
                    )}

                    {hasServo && device.config && (
                      <div className="mt-3 pt-3 border-t border-neutral-100">
                        <p className="text-xs text-neutral-500 mb-2">云台控制</p>
                        <div className="flex flex-col items-center gap-1">
                          <Button size="sm" isIconOnly variant="ghost" isDisabled={device.status !== 'online'}>
                            <ChevronUp className="size-4" />
                          </Button>
                          <div className="flex gap-1">
                            <Button size="sm" isIconOnly variant="ghost" isDisabled={device.status !== 'online'}>
                              <ChevronLeft className="size-4" />
                            </Button>
                            <Button size="sm" isIconOnly variant="secondary" isDisabled={device.status !== 'online'}>
                              <CircleStop className="size-3.5" />
                            </Button>
                            <Button size="sm" isIconOnly variant="ghost" isDisabled={device.status !== 'online'}>
                              <ChevronRight className="size-4" />
                            </Button>
                          </div>
                          <Button size="sm" isIconOnly variant="ghost" isDisabled={device.status !== 'online'}>
                            <ChevronDown className="size-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                          <div className="flex justify-between px-2 py-1 bg-neutral-50 rounded">
                            <span className="text-neutral-500">最小</span>
                            <span>{device.config.minAngle ?? 0}°</span>
                          </div>
                          <div className="flex justify-between px-2 py-1 bg-neutral-50 rounded">
                            <span className="text-neutral-500">最大</span>
                            <span>{device.config.maxAngle ?? 180}°</span>
                          </div>
                          <div className="flex justify-between px-2 py-1 bg-neutral-50 rounded">
                            <span className="text-neutral-500">中心</span>
                            <span>{device.config.centerAngle ?? 90}°</span>
                          </div>
                          <div className="flex justify-between px-2 py-1 bg-neutral-50 rounded">
                            <span className="text-neutral-500">速度</span>
                            <span>{device.config.speed ?? 50}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </Widget.Content>
                </Widget>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {!loading && (!devices || devices.length === 0) && (
        <motion.div variants={fadeUpItem} className="text-center py-12">
          <p className="text-neutral-500">暂无硬件设备</p>
          <p className="text-xs text-neutral-400 mt-1">点击「添加设备」通过 IP 地址注册开发板</p>
        </motion.div>
      )}

      <CameraViewModal
        deviceId={viewDeviceId ?? ''}
        isOpen={viewDeviceId !== null}
        onClose={() => setViewDeviceId(null)}
      />
    </motion.div>
  );
}
