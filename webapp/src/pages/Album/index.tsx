import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { Widget } from '@components/widget';
import { staggerContainer, fadeUpItem } from '../../shared/lib/animations';
import { useQuery } from '../../shared/hooks/use-api';
import { Button, Chip, Skeleton, Modal, useOverlayState, TextField, Input, Label } from '@heroui/react';
import { api } from '../../shared/lib/api';
import { Picture, Plus, TrashBin } from '@gravity-ui/icons';
import { useNavigate } from 'react-router-dom';

interface AlbumItem {
  _id: string;
  title: string;
  description?: string;
  coverUrl?: string;
  photoCount: number;
  createdBy?: { _id: string; name: string };
  createdAt: string;
}

export function AlbumPage() {
  const navigate = useNavigate();
  const { data: albums, loading, refetch, setData: setAlbums } = useQuery<AlbumItem[]>('/albums');
  const [form, setForm] = useState({ title: '', description: '' });
  const [saving, setSaving] = useState(false);
  const modalState = useOverlayState();

  const openAdd = useCallback(() => {
    setForm({ title: '', description: '' });
    modalState.open();
  }, [modalState]);

  const handleDeleteAlbum = useCallback(async (albumId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAlbums((prev) => prev?.filter((a) => a._id !== albumId) ?? null);
    await api.del(`/albums/${albumId}`);
  }, [setAlbums]);

  const handleSave = useCallback(async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    await api.post('/albums', { title: form.title.trim(), description: form.description.trim() || undefined });
    setSaving(false);
    modalState.close();
    refetch();
  }, [form, modalState, refetch]);

  return (
    <motion.div
      animate="show"
      className="space-y-6"
      initial="hidden"
      variants={staggerContainer}
    >
      <motion.div variants={fadeUpItem} className="flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-lg font-semibold">
          <Picture className="size-5" />
          家庭相册
        </h2>
        <Modal state={modalState}>
          <Button size="sm" variant="primary" onPress={openAdd}>
            <Plus className="size-3.5" />
            新建相册
          </Button>
          <Modal.Backdrop>
            <Modal.Container>
              <Modal.Dialog>
                <Modal.CloseTrigger />
                <Modal.Header>
                  <Modal.Heading>新建相册</Modal.Heading>
                </Modal.Header>
                <Modal.Body>
                  <div className="space-y-4">
                    <TextField value={form.title} onChange={(value) => setForm({ ...form, title: value })} isRequired>
                      <Label>相册标题</Label>
                      <Input placeholder="请输入相册标题" />
                    </TextField>
                    <TextField value={form.description} onChange={(value) => setForm({ ...form, description: value })}>
                      <Label>描述（选填）</Label>
                      <Input placeholder="请输入描述" />
                    </TextField>
                  </div>
                </Modal.Body>
                <Modal.Footer>
                  <Button slot="close">取消</Button>
                  <Button variant="primary" onPress={handleSave} isDisabled={!form.title.trim() || saving}>
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
          {Array.from({ length: 3 }).map((_, i) => (
            <Widget key={i}>
              <Widget.Content>
                <Skeleton className="w-full h-32 rounded" />
                <div className="mt-3 space-y-2">
                  <Skeleton className="h-5 w-24 rounded" />
                  <Skeleton className="h-4 w-16 rounded" />
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
          {albums?.map((album) => (
            <motion.div key={album._id} variants={fadeUpItem}>
              <Widget className="cursor-pointer hover:shadow-md transition-shadow relative group/album" onClick={() => navigate(`/album/${album._id}`)}>
                <button
                  type="button"
                  className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/40 text-white opacity-0 group-hover/album:opacity-100 transition-opacity hover:bg-red-500 z-10"
                  onClick={(e) => handleDeleteAlbum(album._id, e)}
                  aria-label="删除相册"
                >
                  <TrashBin className="size-3.5" />
                </button>
                <Widget.Content>
                  {album.coverUrl ? (
                    <img src={album.coverUrl} alt={album.title} className="w-full h-32 object-cover rounded" />
                  ) : (
                    <div className="w-full h-32 bg-neutral-100 rounded flex items-center justify-center">
                      <Picture className="size-8 text-neutral-300" />
                    </div>
                  )}
                  <div className="mt-3">
                    <h3 className="font-medium text-base">{album.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Chip size="sm" variant="soft">{album.photoCount} 张照片</Chip>
                      {album.createdBy && <Chip size="sm" variant="soft" color="accent">{album.createdBy.name}</Chip>}
                    </div>
                    {album.description && <p className="text-sm text-neutral-500 mt-1 line-clamp-2">{album.description}</p>}
                  </div>
                </Widget.Content>
              </Widget>
            </motion.div>
          ))}
        </motion.div>
      )}

      {!loading && (!albums || albums.length === 0) && (
        <motion.div variants={fadeUpItem} className="text-center py-12">
          <p className="text-neutral-500">暂无相册，点击"新建相册"创建第一个相册</p>
        </motion.div>
      )}
    </motion.div>
  );
}
