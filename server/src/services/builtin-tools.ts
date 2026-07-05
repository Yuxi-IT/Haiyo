import type { ToolDefinition } from '../types';
import { Album, Memo, FamilyMember, Memory } from '../models';

export interface ToolContext {
  userId?: string;
  username?: string;
  role?: string;
  uid?: string;
}

export interface BuiltinTool {
  definition: ToolDefinition;
  execute(input: Record<string, unknown>, ctx?: ToolContext): Promise<string>;
}

export const builtinTools: BuiltinTool[] = [
  // ─── User ────────────────────────────────────────────────────────
  {
    definition: {
      name: 'get_current_user',
      description: '获取当前对话用户的信息，包括用户名、角色等',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    execute: async (_, ctx) => {
      if (!ctx?.username) return JSON.stringify({ error: '未登录' });
      return JSON.stringify({
        username: ctx.username,
        uid: ctx.uid,
        role: ctx.role || 'member',
        isAdmin: ctx.role === 'admin',
      });
    },
  },

  // ─── Albums ──────────────────────────────────────────────────────
  // ─── Albums ──────────────────────────────────────────────────────
  {
    definition: {
      name: 'list_albums',
      description: '列出所有家庭相册，包含标题、封面、照片数量、创建者',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    execute: async () => {
      const albums = await Album.find().populate('createdBy', 'name').lean();
      return JSON.stringify(albums.map((a: any) => ({
        _id: a._id,
        title: a.title,
        description: a.description,
        photoCount: a.photos?.length || 0,
        createdBy: a.createdBy?.name,
        createdAt: a.createdAt,
      })));
    },
  },
  {
    definition: {
      name: 'create_album',
      description: '创建新的家庭相册。只需要 title，创建者自动从当前用户获取。description 为可选',
      inputSchema: {
        type: 'object',
        properties: {
          title: { type: 'string', description: '相册标题' },
          description: { type: 'string', description: '相册描述（可选）' },
        },
        required: ['title'],
      },
    },
    execute: async (input, ctx) => {
      const cid = ctx?.uid ? await FamilyMember.findOne({ uid: ctx.uid }).lean().then(m => m?._id?.toString()) : null;
      if (!cid) return JSON.stringify({ error: '无法确定当前用户对应的家庭成员，请先添加家庭成员' });
      const album = await Album.create({ ...input, createdBy: cid });
      return JSON.stringify({ _id: album._id, title: album.title, message: '相册创建成功' });
    },
  },
  {
    definition: {
      name: 'delete_album',
      description: '删除指定家庭相册',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'string', description: '相册 ID' },
        },
        required: ['id'],
      },
    },
    execute: async (input) => {
      const album = await Album.findByIdAndDelete(input.id);
      if (!album) return '相册不存在';
      return JSON.stringify({ message: `相册「${album.title}」已删除` });
    },
  },

  // ─── Memos ───────────────────────────────────────────────────────
  {
    definition: {
      name: 'list_memos',
      description: '列出所有家庭备忘录/留言，置顶优先按时间倒序',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    execute: async () => {
      const memos = await Memo.find().populate('createdBy', 'name').sort({ pinned: -1, createdAt: -1 }).lean();
      return JSON.stringify(memos.map((m: any) => ({
        _id: m._id,
        content: m.content,
        type: m.type,
        pinned: m.pinned,
        color: m.color,
        createdBy: m.createdBy?.name,
        createdAt: m.createdAt,
      })));
    },
  },
  {
    definition: {
      name: 'create_memo',
      description: '创建新的家庭备忘录或留言。content 为内容（支持 Markdown），type 为 memo（备忘）或 note（留言），color 为颜色标签（yellow/blue/green/pink/purple），pinned 可选默认 false。创建者自动从当前用户获取',
      inputSchema: {
        type: 'object',
        properties: {
          content: { type: 'string', description: '备忘录内容，支持 Markdown' },
          type: { type: 'string', enum: ['memo', 'note'], description: '类型' },
          color: { type: 'string', enum: ['yellow', 'blue', 'green', 'pink', 'purple'], description: '颜色标签' },
          pinned: { type: 'boolean', description: '是否置顶' },
        },
        required: ['content'],
      },
    },
    execute: async (input, ctx) => {
      const cid = ctx?.uid ? await FamilyMember.findOne({ uid: ctx.uid }).lean().then(m => m?._id?.toString()) : null;
      if (!cid) return JSON.stringify({ error: '无法确定当前用户对应的家庭成员，请先添加家庭成员' });
      const memo = await Memo.create({
        content: input.content,
        type: input.type || 'note',
        color: input.color || 'yellow',
        pinned: input.pinned || false,
        createdBy: cid,
      });
      return JSON.stringify({ _id: memo._id, content: memo.content, message: '备忘录创建成功' });
    },
  },
  {
    definition: {
      name: 'update_memo',
      description: '更新已有备忘录的内容、颜色或类型',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'string', description: '备忘录 ID' },
          content: { type: 'string', description: '新内容（支持 Markdown）' },
          type: { type: 'string', enum: ['memo', 'note'] },
          color: { type: 'string', enum: ['yellow', 'blue', 'green', 'pink', 'purple'] },
        },
        required: ['id'],
      },
    },
    execute: async (input) => {
      const { id, ...update } = input;
      const memo = await Memo.findByIdAndUpdate(id, update, { new: true });
      if (!memo) return '备忘录不存在';
      return JSON.stringify({ _id: memo._id, content: memo.content, message: '备忘录已更新' });
    },
  },
  {
    definition: {
      name: 'delete_memo',
      description: '删除指定备忘录',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'string', description: '备忘录 ID' },
        },
        required: ['id'],
      },
    },
    execute: async (input) => {
      const memo = await Memo.findByIdAndDelete(input.id);
      if (!memo) return '备忘录不存在';
      return JSON.stringify({ message: '备忘录已删除' });
    },
  },
  {
    definition: {
      name: 'toggle_memo_pin',
      description: '切换备忘录置顶状态',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'string', description: '备忘录 ID' },
        },
        required: ['id'],
      },
    },
    execute: async (input) => {
      const memo = await Memo.findById(input.id);
      if (!memo) return '备忘录不存在';
      memo.pinned = !memo.pinned;
      await memo.save();
      return JSON.stringify({ _id: memo._id, pinned: memo.pinned, message: memo.pinned ? '已置顶' : '已取消置顶' });
    },
  },

  // ─── Memory ───────────────────────────────────────────────────────
  {
    definition: {
      name: 'remember',
      description: '记住一段重要信息。content 为要记住的内容，category 为分类（可选，如 preference/fact/habit/schedule），importance 为重要程度 1-5（默认 3），tags 为标签数组（可选）',
      inputSchema: {
        type: 'object',
        properties: {
          content: { type: 'string', description: '要记住的信息' },
          category: { type: 'string', description: '分类', enum: ['general', 'preference', 'fact', 'habit', 'schedule'] },
          importance: { type: 'number', description: '重要程度 1-5' },
          tags: { type: 'array', items: { type: 'string' }, description: '标签' },
        },
        required: ['content'],
      },
    },
    execute: async (input) => {
      const m = await Memory.create({
        content: input.content,
        category: input.category || 'general',
        importance: input.importance || 3,
        tags: input.tags || [],
      });
      return JSON.stringify({ _id: m._id, message: '已记住' });
    },
  },
  {
    definition: {
      name: 'recall',
      description: '从记忆中搜索相关信息。query 为搜索关键词，category 可按分类过滤，limit 限制返回条数（默认 5）',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: '搜索关键词' },
          category: { type: 'string', description: '分类过滤' },
          limit: { type: 'number', description: '返回条数，默认 5' },
        },
        required: ['query'],
      },
    },
    execute: async (input) => {
      const filter: any = {};
      if (input.category) filter.category = input.category;
      if (input.query) filter.$or = [
        { content: { $regex: input.query as string, $options: 'i' } },
        { tags: { $regex: input.query as string, $options: 'i' } },
      ];
      const limit = (input.limit as number) || 5;
      const results = await Memory.find(filter).sort({ importance: -1, createdAt: -1 }).limit(limit).lean();
      if (results.length === 0) return JSON.stringify({ found: 0, results: [] });
      return JSON.stringify({
        found: results.length,
        results: results.map((r: any) => ({ _id: r._id, content: r.content, category: r.category, importance: r.importance, createdAt: r.createdAt })),
      });
    },
  },
  {
    definition: {
      name: 'forget',
      description: '删除一条记忆',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'string', description: '记忆 ID' },
        },
        required: ['id'],
      },
    },
    execute: async (input) => {
      const m = await Memory.findByIdAndDelete(input.id);
      if (!m) return JSON.stringify({ error: '记忆不存在' });
      return JSON.stringify({ message: '已删除' });
    },
  },
];

export function getBuiltinTool(name: string): BuiltinTool | undefined {
  return builtinTools.find((t) => t.definition.name === name);
}
