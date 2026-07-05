import { Elysia } from 'elysia';
import { Camera } from '../models';

export const cameraRoutes = new Elysia({ prefix: '/api/cameras' })
  .get('/', async () => {
    const cameras = await Camera.find().lean();
    return { success: true, data: cameras };
  })
  .get('/:id', async ({ params: { id } }) => {
    const camera = await Camera.findById(id).lean();
    if (!camera) return { success: false, error: 'Camera not found' };
    return { success: true, data: camera };
  });
