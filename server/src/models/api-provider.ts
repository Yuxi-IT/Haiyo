import mongoose, { Schema, Document } from 'mongoose';
import type { IApiProvider } from '../types';

export interface ApiProviderDocument extends Omit<IApiProvider, '_id'>, Document {}

const ApiProviderSchema = new Schema<ApiProviderDocument>(
  {
    name: { type: String, required: true },
    baseUrl: { type: String, required: true },
    apiKey: { type: String, required: true },
    protocol: {
      type: String,
      enum: ['claude', 'openai-chat', 'openai-reasoning', 'deepseek-reasoning'],
      required: true,
      index: true,
    },
    models: { type: [String], default: [] },
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const ApiProvider = mongoose.model<ApiProviderDocument>('ApiProvider', ApiProviderSchema);
