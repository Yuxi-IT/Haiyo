import mongoose, { Schema, Document } from 'mongoose';
import type { ISensorData } from '../types';

export interface SensorDataDocument extends Omit<ISensorData, '_id'>, Document {}

const SensorDataSchema = new Schema<SensorDataDocument>({
  deviceId: { type: String, required: true, index: true },
  type: {
    type: String,
    enum: ['temperature', 'humidity', 'infrared'],
    required: true,
  },
  value: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  metadata: { type: Schema.Types.Mixed },
});

SensorDataSchema.index({ deviceId: 1, type: 1, timestamp: -1 });
SensorDataSchema.index({ timestamp: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export const SensorData = mongoose.model<SensorDataDocument>('SensorData', SensorDataSchema);
