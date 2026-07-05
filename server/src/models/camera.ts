import mongoose, { Schema, Document } from 'mongoose';
import type { ICamera } from '../types';

export interface CameraDocument extends Omit<ICamera, '_id'>, Document {}

const CameraSchema = new Schema<CameraDocument>(
  {
    name: { type: String, required: true },
    room: { type: String, required: true, index: true },
    url: { type: String, required: true },
    status: { type: String, enum: ['online', 'offline'], default: 'offline' },
    streamType: {
      type: String,
      enum: ['rtsp', 'webrtc', 'mjpeg', 'hls'],
      default: 'hls',
    },
    resolution: { type: String, default: '1920x1080' },
    linkedServo: { type: String },
    lastFrame: { type: String },
    lastSeen: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Camera = mongoose.model<CameraDocument>('Camera', CameraSchema);
