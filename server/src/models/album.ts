import mongoose, { Schema, Document } from 'mongoose';
import type { IAlbum } from '../types';

export interface AlbumDocument extends Omit<IAlbum, '_id'>, Document {}

const PhotoSchema = new Schema(
  {
    url: { type: String, required: true },
    caption: { type: String },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'FamilyMember' },
    createdAt: { type: Date, default: Date.now },
  },
);

const AlbumSchema = new Schema<AlbumDocument>(
  {
    title: { type: String, required: true },
    description: { type: String },
    coverUrl: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'FamilyMember', required: true },
    photos: { type: [PhotoSchema], default: [] },
  },
  { timestamps: true }
);

export const Album = mongoose.model<AlbumDocument>('Album', AlbumSchema);
