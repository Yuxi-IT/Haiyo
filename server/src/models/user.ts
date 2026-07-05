import mongoose, { Schema, Document } from 'mongoose';

export interface UserDocument extends Document {
  username: string;
  password: string;
  role: 'admin' | 'member';
  memberId?: string;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<UserDocument>(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'member'], default: 'member' },
    memberId: { type: String },
    refreshToken: { type: String },
  },
  { timestamps: true }
);

export const User = mongoose.model<UserDocument>('User', UserSchema);
