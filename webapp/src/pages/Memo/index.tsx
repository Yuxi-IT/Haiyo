import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { Widget } from '@components/widget';
import { Markdown } from '@components/markdown';
import { staggerContainer, fadeUpItem } from '../../shared/lib/animations';
import { useQuery } from '../../shared/hooks/use-api';
import { Button, Chip, Skeleton, Modal, useOverlayState, TextField, Label, TextArea, Select, ListBox } from '@heroui/react';
import { api } from '../../shared/lib/api';
import { Pin, Plus, TrashBin } from '@gravity-ui/icons';

interface MemoItem {
  _id: string;
  content: string;
  type: 'memo' | 'note';
  pinned: boolean;
  color?: string;
  createdBy?: { _id: string; name: string };
  createdAt: string;
}

const memoColors = [
  { key: 'yellow', label: '黄色', bg: 'bg-yellow-50 border-yellow-200' },
  { key: 'blue', label: '蓝色', bg: 'bg-blue-50 border-blue-200' },
  { key: 'green', label: '绿色', bg: 'bg-green-50 border-green-200' },
  { key: 'pink', label: '粉色', bg: 'bg-pink-50 border-pink-200' },
  { key: 'purple', label: '紫色', bg: 'bg-purple-50 border-purple-200' },
];

const typeOptions = [
  { key: 'note', label: '留言' },
  { key: 'memo', label: '备忘' },
];

function getMemoColorClass(color?: string) {
  return memoColors.find((c) => c.key === color)?.bg || 'bg-white border-neutral-200';
}

export function MemoPage() {
  const { data: memos, loading, refetch, setData: setMemos } = useQuery<MemoItem[]>('/memos');
  const [form, setForm] = useState({ content: '', type: 'note', color: 'yellow' });
  const [saving, setSaving] = useState(false);
  const modalState = useOverlayState();

  const openAdd = useCallback(() => {
    setForm({ content: '', type: 'note', color: 'yellow' });
    modalState.open();
  }, [modalState]);

  const handleSave = useCallback(async () => {
    if (!form.content.trim()) return;
    setSaving(true);
    await api.post('/memos', { content: form.content.trim(), type: form.type, color: form.color });
    setSaving(false);
    modalState.close();
    refetch();
  }, [form, modalState, refetch]);

  const handlePin = useCallback(async (id: string) => {
    setMemos((prev) => prev?.map((m) => (m._id === id ? { ...m, pinned: !m.pinned } : m)) ?? null);
    await api.patch(`/memos/${id}/pin`);
  }, [setMemos]);

  const handleDelete = useCallback(async (id: string) => {
    setMemos((prev) => prev?.filter((m) => m._id !== id) ?? null);
    await api.del(`/memos/${id}`);
  }, [setMemos]);

  return (
    <motion.div
      animate="show"
      className="space-y-6"
      initial="hidden"
      variants={staggerContainer}
    >
      <motion.div variants={fadeUpItem} className="flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-lg font-semibold">
          <Pin className="size-5" />
          家庭备忘录
        </h2>
        <Modal state={modalState}>
          <Button size="sm" variant="primary" onPress={openAdd}>
            <Plus className="size-3.5" />
            新建备忘
          </Button>
          <Modal.Backdrop>
            <Modal.Container>
              <Modal.Dialog>
                <Modal.CloseTrigger />
                <Modal.Header>
                  <Modal.Heading>新建备忘录</Modal.Heading>
                </Modal.Header>
                <Modal.Body>
                  <div className="space-y-4">
                    <TextField value={form.content} onChange={(value) => setForm({ ...form, content: value })} isRequired>
                      <Label>内容（支持 Markdown）</Label>
                      <TextArea placeholder="请输入内容..." rows={4} />
                    </TextField>
                    <Select
                      selectedKey={form.type}
                      onSelectionChange={(key) => setForm({ ...form, type: String(key) })}
                    >
                      <Label>类型</Label>
                      <Select.Trigger>
                        <Select.Value />
                        <Select.Indicator />
                      </Select.Trigger>
                      <Select.Popover>
                        <ListBox>
                          {typeOptions.map((t) => (
                            <ListBox.Item key={t.key} id={t.key} textValue={t.label}>
                              <Label>{t.label}</Label>
                            </ListBox.Item>
                          ))}
                        </ListBox>
                      </Select.Popover>
                    </Select>
                    <div>
                      <Label className="text-sm mb-2 block">颜色标签</Label>
                      <div className="flex gap-2">
                        {memoColors.map((c) => (
                          <button
                            key={c.key}
                            type="button"
                            className={`w-8 h-8 rounded-full border-2 ${c.bg} ${form.color === c.key ? 'ring-2 ring-offset-1 ring-primary-400' : ''}`}
                            onClick={() => setForm({ ...form, color: c.key })}
                            aria-label={c.label}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </Modal.Body>
                <Modal.Footer>
                  <Button slot="close">取消</Button>
                  <Button variant="primary" onPress={handleSave} isDisabled={!form.content.trim() || saving}>
                    {saving ? '创建中...' : '创建'}
                  </Button>
                </Modal.Footer>
              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
        </Modal>
      </motion.div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Widget key={i}>
              <Widget.Content>
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-3/4 rounded mt-2" />
                <Skeleton className="h-4 w-1/2 rounded mt-2" />
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
          {memos?.map((memo) => (
            <motion.div key={memo._id} variants={fadeUpItem}>
              <Widget className={`border ${getMemoColorClass(memo.color)}`}>
                <Widget.Content>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <Markdown className="text-sm">{memo.content}</Markdown>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        className={`p-1 rounded hover:bg-black/5 ${memo.pinned ? 'text-primary-500' : 'text-neutral-400'}`}
                        onClick={() => handlePin(memo._id)}
                        aria-label={memo.pinned ? '取消置顶' : '置顶'}
                      >
                        <Pin className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        className="p-1 rounded hover:bg-black/5 text-neutral-400 hover:text-red-500"
                        onClick={() => handleDelete(memo._id)}
                        aria-label="删除"
                      >
                        <TrashBin className="size-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 pt-2 border-t border-neutral-100">
                    <Chip size="sm" variant="soft">{memo.type === 'memo' ? '备忘' : '留言'}</Chip>
                    {memo.createdBy && <Chip size="sm" variant="soft" color="primary">{memo.createdBy.name}</Chip>}
                    {memo.pinned && <Chip size="sm" variant="soft" color="warning">置顶</Chip>}
                  </div>
                </Widget.Content>
              </Widget>
            </motion.div>
          ))}
        </motion.div>
      )}

      {!loading && (!memos || memos.length === 0) && (
        <motion.div variants={fadeUpItem} className="text-center py-12">
          <p className="text-neutral-500">暂无备忘录，点击"新建备忘"开始记录</p>
        </motion.div>
      )}
    </motion.div>
  );
}
