import { useState, useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import { staggerContainer, fadeUpItem } from '../../shared/lib/animations';
import { useQuery } from '../../shared/hooks/use-api';
import { Button, Chip, Skeleton, Modal, useOverlayState, Label } from '@heroui/react';
import { api } from '../../shared/lib/api';
import { Picture, Plus, ArrowLeft, TrashBin, Xmark } from '@gravity-ui/icons';
import { useNavigate, useParams } from 'react-router-dom';

interface PhotoItem {
  _id: string;
  url: string;
  caption?: string;
  uploadedBy?: { _id: string; name: string };
  createdAt: string;
}

interface AlbumDetail {
  _id: string;
  title: string;
  description?: string;
  coverUrl?: string;
  createdBy?: { _id: string; name: string };
  photos: PhotoItem[];
}

interface PendingFile {
  file: File;
  previewUrl: string;
}

export function AlbumDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: album, loading, refetch, setData: setAlbum } = useQuery<AlbumDetail>(`/albums/${id}`);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 });
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadModalState = useOverlayState();

  const openUpload = useCallback(() => {
    setPendingFiles([]);
    uploadModalState.open();
  }, [uploadModalState]);

  const handleFilesSelected = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles: PendingFile[] = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setPendingFiles((prev) => [...prev, ...newFiles]);
    if (fileRef.current) fileRef.current.value = '';
  }, []);

  const removePendingFile = useCallback((idx: number) => {
    setPendingFiles((prev) => {
      const next = [...prev];
      URL.revokeObjectURL(next[idx].previewUrl);
      next.splice(idx, 1);
      return next;
    });
  }, []);

  const handleUpload = useCallback(async () => {
    if (pendingFiles.length === 0) return;
    setUploading(true);
    setUploadProgress({ done: 0, total: pendingFiles.length });

    for (let i = 0; i < pendingFiles.length; i++) {
      const { file } = pendingFiles[i];
      const formData = new FormData();
      formData.append('file', file);

      await fetch(`/api/albums/${id}/photos`, { method: 'POST', body: formData });
      setUploadProgress({ done: i + 1, total: pendingFiles.length });
    }

    // Cleanup
    pendingFiles.forEach((f) => URL.revokeObjectURL(f.previewUrl));
    setPendingFiles([]);
    setUploading(false);
    uploadModalState.close();
    refetch();
  }, [pendingFiles, id, uploadModalState, refetch]);

  const handleModalClose = useCallback(() => {
    pendingFiles.forEach((f) => URL.revokeObjectURL(f.previewUrl));
    setPendingFiles([]);
  }, [pendingFiles]);

  const handleDeletePhoto = useCallback(async (photoId: string) => {
    setAlbum((prev) => prev ? { ...prev, photos: prev.photos.filter((p) => p._id !== photoId) } : null);
    await api.del(`/albums/${id}/photos/${photoId}`);
  }, [id, setAlbum]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 rounded" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500">相册不存在</p>
        <Button size="sm" variant="ghost" className="mt-4" onPress={() => navigate('/album')}>返回相册列表</Button>
      </div>
    );
  }

  return (
    <motion.div
      animate="show"
      className="space-y-6"
      initial="hidden"
      variants={staggerContainer}
    >
      <motion.div variants={fadeUpItem} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button size="sm" variant="ghost" onPress={() => navigate('/album')}>
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold">{album.title}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              {album.createdBy && <Chip size="sm" variant="soft" color="primary">{album.createdBy.name}</Chip>}
              <span className="text-sm text-neutral-500">{album.photos.length} 张照片</span>
            </div>
          </div>
        </div>
        <Modal state={uploadModalState}>
          <Button size="sm" variant="primary" onPress={openUpload}>
            <Plus className="size-3.5" />
            上传照片
          </Button>
          <Modal.Backdrop>
            <Modal.Container>
              <Modal.Dialog className="w-full max-w-lg">
                <Modal.CloseTrigger onPress={handleModalClose} />
                <Modal.Header>
                  <Modal.Heading>上传照片</Modal.Heading>
                </Modal.Header>
                <Modal.Body>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm mb-2 block">选择图片（支持多选）</Label>
                      <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-neutral-300 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-primary-50/50 transition-colors group/file">
                        <Plus className="size-5 text-neutral-400 group-hover/file:text-primary-500 transition-colors" />
                        <span className="text-sm text-neutral-500 group-hover/file:text-primary-600 transition-colors">点击选择图片</span>
                        <input
                          ref={fileRef}
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleFilesSelected}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Preview strip — horizontal scroll, tilted overlapping cards */}
                    {pendingFiles.length > 0 && (
                      <div className="overflow-x-auto pb-2">
                        <div className="flex gap-2 w-max min-w-full">
                          {pendingFiles.map((pf, idx) => (
                            <div
                              key={idx}
                              className="group/preview relative shrink-0 w-22 rounded-lg overflow-hidden bg-neutral-100"
                            >
                              <img
                                src={pf.previewUrl}
                                alt={`预览 ${idx + 1}`}
                                className="w-full aspect-[3/4] object-cover"
                              />
                              <button
                                type="button"
                                className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover/preview:opacity-100 transition-opacity hover:bg-red-500"
                                onClick={(e) => { e.stopPropagation(); removePendingFile(idx); }}
                                aria-label="移除"
                              >
                                <Xmark className="size-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {pendingFiles.length > 0 && (
                      <p className="text-xs text-neutral-500 text-center">共 {pendingFiles.length} 张照片待上传</p>
                    )}

                    {uploading && (
                      <div className="flex items-center gap-2 text-sm text-neutral-600">
                        <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-500 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress.total > 0 ? (uploadProgress.done / uploadProgress.total) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="shrink-0 text-xs">{uploadProgress.done}/{uploadProgress.total}</span>
                      </div>
                    )}
                  </div>
                </Modal.Body>
                <Modal.Footer>
                  <Button slot="close" onPress={handleModalClose}>取消</Button>
                  <Button variant="primary" onPress={handleUpload} isDisabled={pendingFiles.length === 0 || uploading}>
                    {uploading ? `上传中 ${uploadProgress.done}/${uploadProgress.total}` : `上传 ${pendingFiles.length} 张`}
                  </Button>
                </Modal.Footer>
              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
        </Modal>
      </motion.div>

      {album.description && (
        <motion.div variants={fadeUpItem}>
          <p className="text-sm text-neutral-600">{album.description}</p>
        </motion.div>
      )}

      {album.photos.length === 0 && (
        <motion.div variants={fadeUpItem} className="text-center py-12">
          <Picture className="size-12 text-neutral-300 mx-auto" />
          <p className="text-neutral-500 mt-3">还没有照片，点击"上传照片"添加</p>
        </motion.div>
      )}

      {(() => {
        // Group photos by date
        const grouped = new Map<string, PhotoItem[]>();
        for (const p of album.photos) {
          const date = new Date(p.createdAt).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
          if (!grouped.has(date)) grouped.set(date, []);
          grouped.get(date)!.push(p);
        }
        return Array.from(grouped.entries()).map(([date, photos]) => (
          <motion.div key={date} variants={fadeUpItem}>
            <h3 className="text-sm font-medium text-neutral-500 mb-2 sticky top-0 bg-neutral-50 py-1 z-10">{date}</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {photos.map((photo) => (
                <div key={photo._id} className="group relative aspect-square rounded-lg overflow-hidden bg-neutral-100">
                  <img
                    src={photo.url}
                    alt={photo.caption || '照片'}
                    className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setPreview(photo.url)}
                  />
                  <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    {photo.caption && <p className="text-xs text-white truncate">{photo.caption}</p>}
                    {photo.uploadedBy && <p className="text-xs text-white/70">{photo.uploadedBy.name}</p>}
                  </div>
                  <button
                    type="button"
                    className="absolute top-2 right-2 p-1 rounded bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                    onClick={() => handleDeletePhoto(photo._id)}
                    aria-label="删除照片"
                  >
                    <TrashBin className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        ));
      })()}

      {preview && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <button
            type="button"
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 text-white hover:bg-white/30"
            onClick={() => setPreview(null)}
            aria-label="关闭预览"
          >
            <Xmark className="size-6" />
          </button>
          <img src={preview} alt="预览" className="max-w-full max-h-full object-contain rounded" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </motion.div>
  );
}
