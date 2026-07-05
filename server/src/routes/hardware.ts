import { Elysia, t } from 'elysia';
import { Device, SensorData, Camera } from '../models';

export const hardwareRoutes = new Elysia({ prefix: '/api/hardware' })
  .get('/devices', async () => {
    const devices = await Device.find().lean();
    return { success: true, data: devices };
  })
  .get('/sensors', async ({ query }) => {
    const { deviceId, type, from, to, limit: limitStr } = query;
    const filter: Record<string, unknown> = {};
    if (deviceId) filter.deviceId = deviceId;
    if (type) filter.type = type;
    if (from || to) {
      filter.timestamp = {};
      if (from) (filter.timestamp as any).$gte = new Date(from as string);
      if (to) (filter.timestamp as any).$lte = new Date(to as string);
    }
    const limit = Number(limitStr) || 100;
    const data = await SensorData.find(filter).sort({ timestamp: -1 }).limit(limit).lean();
    return { success: true, data };
  })
  .post('/devices', async ({ body }) => {
    const { ip, name, capabilities } = body;
    const caps = capabilities || [];
    const deviceId = `device-${ip.replace(/[.:]/g, '-')}`;
    const url = ip.startsWith('http') ? ip : `http://${ip}`;

    // Ping to verify connectivity
    let pingOk = false;
    let pingData: any = {};
    try {
      const res = await fetch(`${url}/api/ping`, { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        pingData = await res.json();
        pingOk = true;
      }
    } catch {}

    const device = await Device.findOneAndUpdate(
      { deviceId },
      {
        deviceId,
        name: pingData.name || name || ip,
        type: 'esp32',
        room: '默认',
        status: pingOk ? 'online' : 'offline',
        lastSeen: new Date(),
        metadata: { ip, capabilities: pingData.capabilities || caps },
      },
      { upsert: true, new: true }
    ).lean();

    const resolvedCaps = pingData.capabilities || caps;
    if (resolvedCaps.includes('camera')) {
      await Camera.findOneAndUpdate(
        { deviceId },
        {
          deviceId,
          name: `${pingData.name || name || ip} 摄像头`,
          room: '默认',
          url: `${url}/api/stream`,
          status: pingOk ? 'online' : 'offline',
          streamType: 'sse',
          resolution: '320x240',
          lastSeen: new Date(),
        },
        { upsert: true, new: true }
      );
    }

    return { success: true, data: device };
  }, {
    body: t.Object({
      ip: t.String(),
      name: t.Optional(t.String()),
      capabilities: t.Optional(t.Array(t.String())),
    }),
  })

  // ─── SSE 视频流中继 ──────────────────────────────────────────
  .get('/devices/:deviceId/stream', async ({ params: { deviceId } }) => {
    const device = await Device.findOne({ deviceId }).lean();
    if (!device) return new Response('Device not found', { status: 404 });

    const ip = device.metadata?.ip as string;
    if (!ip) return new Response('No IP configured', { status: 400 });

    const url = ip.startsWith('http') ? ip : `http://${ip}`;

    try {
      const upstream = await fetch(`${url}/api/stream`, { signal: AbortSignal.timeout(60000) });
      if (!upstream.ok || !upstream.body) {
        return new Response('Failed to connect to device stream', { status: 502 });
      }

      return new Response(upstream.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'X-Accel-Buffering': 'no',
        },
      });
    } catch (e: any) {
      return new Response(`Stream error: ${e.message}`, { status: 502 });
    }
  })

  // ─── 命令转发 ────────────────────────────────────────────────
  .post('/command', async ({ body }) => {
    const { deviceId, command, params } = body;
    const device = await Device.findOne({ deviceId }).lean();
    if (!device) return { success: false, error: 'Device not found' };

    const ip = device.metadata?.ip as string;
    if (!ip) return { success: false, error: 'No IP configured' };

    const url = ip.startsWith('http') ? ip : `http://${ip}`;

    try {
      const res = await fetch(`${url}/api/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, params }),
        signal: AbortSignal.timeout(10000),
      });
      const data = await res.json();
      return { success: true, data };
    } catch (e: any) {
      return { success: false, error: `Command failed: ${e.message}` };
    }
  }, {
    body: t.Object({
      deviceId: t.String(),
      command: t.String(),
      params: t.Optional(t.Record(t.String(), t.Unknown())),
    }),
  })

  .delete('/devices/:id', async ({ params: { id } }) => {
    const device = await Device.findByIdAndDelete(id);
    if (!device) return { success: false, error: 'Device not found' };
    await Camera.findOneAndDelete({ deviceId: device.deviceId });
    return { success: true, data: { deleted: true } };
  });
