import { Elysia } from 'elysia';

export const streamWs = new Elysia()
  .ws('/ws/stream', {
    open(ws) {
      console.log('[WS:Stream] Client connected');
    },
    message(ws, raw) {
      // Client sends camera ID to subscribe
      // In production, this would open an upstream connection to the camera's stream URL
      // and relay MJPEG frames as binary WebSocket messages
      const msg = typeof raw === 'string' ? JSON.parse(raw) : raw as any;
      if (msg.action === 'subscribe' && msg.cameraId) {
        (ws as any).__cameraId = msg.cameraId;
        ws.send(JSON.stringify({ type: 'subscribed', cameraId: msg.cameraId }));
        console.log(`[WS:Stream] Subscribed to camera: ${msg.cameraId}`);
      }
    },
    close(ws) {
      console.log('[WS:Stream] Client disconnected');
    },
  });
