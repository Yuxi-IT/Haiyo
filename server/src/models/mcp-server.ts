import mongoose, { Schema, Document } from 'mongoose';
import type { IMcpServer } from '../types';

export interface McpServerDocument extends Omit<IMcpServer, '_id'>, Document {}

const McpToolSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
    inputSchema: { type: Schema.Types.Mixed },
  },
  { _id: false }
);

const McpServerSchema = new Schema<McpServerDocument>(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    tools: { type: [McpToolSchema], default: [] },
    status: {
      type: String,
      enum: ['online', 'offline', 'error'],
      default: 'offline',
    },
    lastChecked: { type: Date },
  },
  { timestamps: true }
);

export const McpServer = mongoose.model<McpServerDocument>('McpServer', McpServerSchema);
