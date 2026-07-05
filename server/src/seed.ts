import { connectDB, disconnectDB } from './config/database';
import { Settings } from './models';

await connectDB();

// Upsert system defaults — only these are essential
const defaults = [
  { key: 'system.name', value: '智能管家', category: 'general', description: '系统名称' },
  { key: 'system.language', value: 'zh-CN', category: 'general', description: '系统语言' },
  { key: 'notification.push', value: true, category: 'notification', description: '推送通知' },
  { key: 'notification.sound', value: true, category: 'notification', description: '声音通知' },
];

for (const s of defaults) {
  await Settings.findOneAndUpdate({ key: s.key }, s, { upsert: true });
}

console.log('[Seed] System defaults upserted.');
await disconnectDB();
