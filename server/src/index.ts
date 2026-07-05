import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { staticPlugin } from '@elysiajs/static';
import { connectDB, disconnectDB } from './config/database';
import { dashboardRoutes } from './routes/dashboard';
import { cameraRoutes } from './routes/cameras';
import { familyRoutes } from './routes/family';
import { settingsRoutes } from './routes/settings';
import { providerRoutes } from './routes/providers';
import { mcpRoutes } from './routes/mcp';
import { hardwareRoutes } from './routes/hardware';
import { chatRoutes } from './routes/chat';
import { albumRoutes } from './routes/albums';
import { memoRoutes } from './routes/memos';
import { authRoutes } from './routes/auth';
import { voiceRoutes } from './routes/voice';
import { streamWs } from './ws/stream';
import { startDevicePoller } from './services/device-poller';

const PORT = Number(process.env.PORT) || 3000;

await connectDB();

const app = new Elysia()
  .onAfterHandle(({ set }) => {
    set.headers['content-type'] = 'application/json; charset=utf-8';
  })
  .use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'] }))
  .use(swagger({ path: '/docs', documentation: { info: { title: '智能管家 API', version: '1.0.0' } } }))
  .use(staticPlugin({ assets: './uploads', prefix: '/uploads' }))
  .use(dashboardRoutes)
  .use(cameraRoutes)
  .use(familyRoutes)
  .use(settingsRoutes)
  .use(providerRoutes)
  .use(mcpRoutes)
  .use(hardwareRoutes)
  .use(chatRoutes)
  .use(authRoutes)
  .use(voiceRoutes)
  .use(albumRoutes)
  .use(memoRoutes)
  .use(streamWs)
  .get('/', () => ({ name: '智能管家 API', version: '1.0.0', status: 'running' }))
  .listen(PORT);

console.log(`[Server] Running at http://localhost:${PORT}`);
console.log(`[Server] Swagger docs at http://localhost:${PORT}/docs`);

startDevicePoller();

process.on('SIGINT', async () => {
  await disconnectDB();
  process.exit(0);
});
