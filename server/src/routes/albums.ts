import { Elysia, t } from 'elysia';
import { Album, FamilyMember } from '../models';
import { authGuard } from '../middleware/auth-guard';
import path from 'path';
import { mkdir } from 'fs/promises';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'photos');
await mkdir(UPLOAD_DIR, { recursive: true });

export const albumRoutes = new Elysia({ prefix: '/api/albums' })
  .use(authGuard)
  .get('/', async () => {
    const albums = await Album.find()
      .populate('createdBy', 'name uid')
      .lean();
    const data = albums.map((a) => ({
      ...a,
      photoCount: a.photos?.length || 0,
    }));
    return { success: true, data };
  })
  .post('/', async ({ body, user }) => {
    if (!user) return { success: false, error: '请先登录' };
    const member = await FamilyMember.findOne({ uid: user.uid }).lean();
    const album = await Album.create({ title: body.title, description: body.description, createdBy: member?._id });
    return { success: true, data: album };
  }, {
    body: t.Object({
      title: t.String(),
      description: t.Optional(t.String()),
    }),
  })
  .get('/:id', async ({ params: { id } }) => {
    const album = await Album.findById(id)
      .populate('createdBy', 'name')
      .populate('photos.uploadedBy', 'name')
      .lean();
    if (!album) return { success: false, error: 'Album not found' };
    return { success: true, data: album };
  })
  .put('/:id', async ({ params: { id }, body }) => {
    const album = await Album.findByIdAndUpdate(id, body, { new: true }).lean();
    if (!album) return { success: false, error: 'Album not found' };
    return { success: true, data: album };
  }, {
    body: t.Object({
      title: t.Optional(t.String()),
      description: t.Optional(t.String()),
    }),
  })
  .delete('/:id', async ({ params: { id } }) => {
    const album = await Album.findByIdAndDelete(id);
    if (!album) return { success: false, error: 'Album not found' };
    return { success: true, data: { deleted: true } };
  })
  .post('/:id/photos', async ({ params: { id }, body, user }) => {
    const file = body.file;
    const caption = body.caption || '';
    const member = user?.uid ? await FamilyMember.findOne({ uid: user.uid }).lean() : null;

    const ext = path.extname(file.name || 'photo.jpg');
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    const buffer = await file.arrayBuffer();
    await Bun.write(filepath, buffer);

    const photoUrl = `/uploads/photos/${filename}`;
    const album = await Album.findByIdAndUpdate(
      id,
      {
        $push: { photos: { url: photoUrl, caption, uploadedBy: member?._id, createdAt: new Date() } },
        $set: { coverUrl: photoUrl },
      },
      { new: true }
    ).lean();

    if (!album) return { success: false, error: 'Album not found' };
    return { success: true, data: album.photos[album.photos.length - 1] };
  }, {
    body: t.Object({
      file: t.File(),
      caption: t.Optional(t.String()),
    }),
  })
  .delete('/:id/photos/:photoId', async ({ params: { id, photoId } }) => {
    const album = await Album.findByIdAndUpdate(
      id,
      { $pull: { photos: { _id: photoId } } },
      { new: true }
    ).lean();
    if (!album) return { success: false, error: 'Album not found' };
    return { success: true, data: { deleted: true } };
  });
