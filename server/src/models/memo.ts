import mongoose, { Schema, Document } from 'mongoose';
import type { IMemo } from '../types';

export interface MemoDocument extends Omit<IMemo, '_id'>, Document {}

const MemoSchema = new Schema<MemoDocument>(
  {
    content: { type: String, required: true },
    type: { type: String, enum: ['memo', 'note'], default: 'note' },
    pinned: { type: Boolean, default: false },
    color: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'FamilyMember', required: true },
  },
  { timestamps: true }
);

export const Memo = mongoose.model<MemoDocument>('Memo', MemoSchema);
