import mongoose, { Schema, Document } from 'mongoose';

export interface MemoryDocument extends Document {
  content: string;
  category: string;
  tags: string[];
  importance: number;
  createdAt: Date;
  updatedAt: Date;
}

const MemorySchema = new Schema<MemoryDocument>(
  {
    content: { type: String, required: true },
    category: { type: String, default: 'general' },
    tags: { type: [String], default: [] },
    importance: { type: Number, default: 1, min: 1, max: 5 },
  },
  { timestamps: true }
);

MemorySchema.index({ category: 1 });
MemorySchema.index({ tags: 1 });
MemorySchema.index({ importance: -1 });
MemorySchema.index({ createdAt: -1 });
MemorySchema.index({ content: 'text' });

export const Memory = mongoose.model<MemoryDocument>('Memory', MemorySchema);
