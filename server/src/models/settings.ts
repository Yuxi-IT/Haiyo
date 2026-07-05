import mongoose, { Schema, Document } from 'mongoose';
import type { ISystemSettings } from '../types';

export interface SettingsDocument extends Omit<ISystemSettings, '_id'>, Document {}

const SettingsSchema = new Schema<SettingsDocument>(
  {
    key: { type: String, required: true, unique: true },
    value: { type: Schema.Types.Mixed, required: true },
    category: {
      type: String,
      enum: ['general', 'security', 'notification', 'hardware', 'automation', 'voice'],
      default: 'general',
      index: true,
    },
    description: { type: String },
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

export const Settings = mongoose.model<SettingsDocument>('Settings', SettingsSchema);
