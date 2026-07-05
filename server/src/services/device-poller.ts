import { Device, SensorData, Camera } from '../models';

const POLL_INTERVAL = 30_000;

export function startDevicePoller() {
  pollAll();
  setInterval(pollAll, POLL_INTERVAL);
  console.log(`[Poller] 设备轮询已启动 (每${POLL_INTERVAL / 1000}秒)`);
}

async function pollAll() {
  const devices = await Device.find().lean();
  for (const device of devices) {
    const ip = device.metadata?.ip as string;
    if (!ip) continue;
    await pollDevice(device.deviceId, ip);
  }
}

async function pollDevice(deviceId: string, ip: string) {
  const url = ip.startsWith('http') ? ip : `http://${ip}`;
  try {
    const res = await fetch(`${url}/api/ping`, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json() as any;

    await Device.findOneAndUpdate(
      { deviceId },
      { status: 'online', lastSeen: new Date(), name: data.name || deviceId }
    );

    // Fetch sensors if available
    const caps = data.capabilities || [];
    if (caps.includes('temperature') || caps.includes('humidity') || caps.includes('infrared')) {
      try {
        const sRes = await fetch(`${url}/api/sensors`, { signal: AbortSignal.timeout(5000) });
        if (sRes.ok) {
          const sensors = await sRes.json() as Record<string, { value: number; unit: string }>;
          for (const [type, reading] of Object.entries(sensors)) {
            await SensorData.create({
              deviceId,
              type,
              value: reading.value,
              timestamp: new Date(),
              metadata: { unit: reading.unit },
            });
          }
        }
      } catch {}
    }

    // Update camera status
    if (caps.includes('camera')) {
      await Camera.findOneAndUpdate({ deviceId }, { status: 'online', lastSeen: new Date() });
    }
  } catch {
    await Device.findOneAndUpdate({ deviceId }, { status: 'offline' });
    await Camera.findOneAndUpdate({ deviceId }, { status: 'offline' });
  }
}
