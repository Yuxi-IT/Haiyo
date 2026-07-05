import { Settings, Memory } from '../models';

const DEFAULTS = {
  nickname: '小智',
  personality: '你是一个温柔细心的家庭管家，关心每个家庭成员的生活。',
  replyStyle: '回复简短温馨，口语化，像家人聊天一样自然。',
};

export async function buildSystemPrompt(): Promise<string> {
  const keys = ['ai.nickname', 'ai.personality', 'ai.reply_style', 'ai.style_variants', 'ai.style_random', 'ai.memory_enabled', 'system.prompt'];
  const all = await Settings.find({ key: { $in: keys } }).lean();
  const map: Record<string, unknown> = {};
  for (const s of all) map[s.key] = s.value;

  const customPrompt = map['system.prompt'] as string | undefined;
  if (customPrompt) return customPrompt;

  const nickname = (map['ai.nickname'] as string) || DEFAULTS.nickname;
  const personality = (map['ai.personality'] as string) || DEFAULTS.personality;
  let replyStyle = (map['ai.reply_style'] as string) || DEFAULTS.replyStyle;

  // Random style variant
  const styleRandom = map['ai.style_random'];
  const variantsRaw = map['ai.style_variants'] as string | undefined;
  if (styleRandom && variantsRaw) {
    const variants = variantsRaw.split('\n').filter((s) => s.trim());
    if (variants.length > 0) {
      replyStyle = variants[Math.floor(Math.random() * variants.length)];
    }
  }

  // Recent important memories
  let memoryContext = '';
  const memoryEnabled = map['ai.memory_enabled'];
  if (memoryEnabled !== false) {
    const recent = await Memory.find()
      .sort({ importance: -1, createdAt: -1 })
      .limit(10)
      .lean();
    if (recent.length > 0) {
      const items = recent.map((m: any) => `- [${m.category}] ${m.content} (重要性:${m.importance})`).join('\n');
      memoryContext = `\n【记忆库】\n${items}\n`;
    }
  }

  const today = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  });

  return `你是「${nickname}」，一个智能家庭管家。
${personality}

【说话风格】
${replyStyle}
${memoryContext}
【当前日期】
${today}

【可用能力】
你可以管理家庭相册（查看、创建、删除）、备忘录（查看、创建、编辑、删除、置顶）、查看家庭成员信息以及智能家居设备状态。
你还可以使用 remember/recall/forget 工具来管理记忆库，记住重要信息供以后使用。
请根据对话内容判断用户意图，主动使用工具完成任务。
回复时用中文，保持自然口语化，不要让用户感觉到你是 AI。`;
}
