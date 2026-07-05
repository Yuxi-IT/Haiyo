import mongoose, { Schema, Document } from 'mongoose';
import type { IFamilyMember } from '../types';

export interface FamilyMemberDocument extends Omit<IFamilyMember, '_id'>, Document {}

const EmotionRecordSchema = new Schema(
  {
    emotion: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    context: { type: String },
    sensorSnapshot: {
      temperature: { type: Number },
      humidity: { type: Number },
    },
  },
  { _id: false }
);

const HealthStatusSchema = new Schema(
  {
    overall: { type: String, enum: ['good', 'warning', 'alert'], default: 'good' },
    lastCheck: { type: Date },
    notes: { type: String },
  },
  { _id: false }
);

const FamilyMemberSchema = new Schema<FamilyMemberDocument>(
  {
    uid: { type: String, unique: true },
    name: { type: String, required: true },
    gender: {
      type: String,
      enum: ['male', 'female'],
      default: 'male',
    },
    avatar: { type: String },
    birthday: { type: Date },
    email: { type: String },
    faceId: { type: String },
    rfidTag: { type: String },
    accessLevel: {
      type: String,
      enum: ['full', 'restricted', 'guest'],
      default: 'full',
    },
    healthStatus: { type: HealthStatusSchema, default: () => ({ overall: 'good' }) },
    emotionRecords: { type: [EmotionRecordSchema], default: [] },
    isHome: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const FamilyMember = mongoose.model<FamilyMemberDocument>(
  'FamilyMember',
  FamilyMemberSchema
);
