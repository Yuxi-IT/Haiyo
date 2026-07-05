import mongoose, { Schema, Document } from 'mongoose';
import type { IDevice } from '../types';

export interface DeviceDocument extends Omit<IDevice, '_id'>, Document {}

const DeviceSchema = new Schema<DeviceDocument>(
  {
    deviceId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['esp32', 'rpi', 'sensor', 'actuator'],
      required: true,
    },
    room: { type: String, required: true, index: true },
    status: { type: String, enum: ['online', 'offline'], default: 'offline' },
    value: { type: Schema.Types.Mixed },
    unit: { type: String },
    lastSeen: { type: Date, default: Date.now },
    config: { type: Schema.Types.Mixed },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

DeviceSchema.index({ type: 1, room: 1 });

export const Device = mongoose.model<DeviceDocument>('Device', DeviceSchema);
