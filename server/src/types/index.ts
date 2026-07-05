import type { Types } from 'mongoose';

// ─── Common ─────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: { total?: number; page?: number; limit?: number };
}

// ─── Device ─────────────────────────────────────────────────────────

export interface IDevice {
  _id?: string;
  deviceId: string;
  name: string;
  type: 'esp32' | 'rpi' | 'sensor' | 'actuator';
  room: string;
  status: 'online' | 'offline';
  value?: number | string;
  unit?: string;
  lastSeen: Date;
  config?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
}

// ─── Camera ─────────────────────────────────────────────────────────

export interface ICamera {
  _id?: string;
  name: string;
  room: string;
  url: string;
  status: 'online' | 'offline';
  streamType: 'rtsp' | 'webrtc' | 'mjpeg' | 'hls';
  resolution: string;
  linkedServo?: string;
  lastFrame?: string;
  lastSeen: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// ─── Family Member ──────────────────────────────────────────────────

export interface IEmotionRecord {
  emotion: string;
  timestamp: Date;
  context?: string;
  sensorSnapshot?: { temperature?: number; humidity?: number };
}

export interface IHealthStatus {
  overall: 'good' | 'warning' | 'alert';
  lastCheck?: Date;
  notes?: string;
}

export interface IFamilyMember {
  _id?: string;
  name: string;
  gender: 'male' | 'female';
  avatar?: string;
  birthday?: Date;
  email?: string;
  faceId?: string;
  rfidTag?: string;
  accessLevel: 'full' | 'restricted' | 'guest';
  healthStatus?: IHealthStatus;
  emotionRecords?: IEmotionRecord[];
  isHome: boolean;
  lastSeen: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// ─── Sensor Data ────────────────────────────────────────────────────

export type SensorType = 'temperature' | 'humidity' | 'infrared';

export interface ISensorData {
  _id?: string;
  deviceId: string;
  type: SensorType;
  value: number;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

// ─── Settings ───────────────────────────────────────────────────────

export interface ISystemSettings {
  _id?: string;
  key: string;
  value: unknown;
  category: 'general' | 'security' | 'notification' | 'hardware' | 'automation';
  description?: string;
  updatedAt?: Date;
}

// ─── API Provider ───────────────────────────────────────────────────

export type AIProtocol = 'claude' | 'openai-chat' | 'openai-reasoning' | 'deepseek-reasoning';

export interface IApiProvider {
  _id?: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  protocol: AIProtocol;
  models: string[];
  enabled: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// ─── MCP Server ─────────────────────────────────────────────────────

export interface IMcpTool {
  name: string;
  description: string;
  inputSchema?: Record<string, unknown>;
}

export interface IMcpServer {
  _id?: string;
  name: string;
  url: string;
  tools: IMcpTool[];
  status: 'online' | 'offline' | 'error';
  lastChecked?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// ─── WebSocket Messages ─────────────────────────────────────────────

export type HardwareMessageType = 'register' | 'heartbeat' | 'event' | 'command' | 'response' | 'state';

export interface HardwareMessage {
  type: HardwareMessageType;
  deviceId: string;
  data?: unknown;
  requestId?: string;
  timestamp?: number;
}

export interface HardwareCommand {
  type: 'command';
  deviceId: string;
  command: string;
  params?: Record<string, unknown>;
  requestId: string;
}

export interface HardwareEvent {
  type: 'event';
  deviceId: string;
  event: string;
  data: Record<string, unknown>;
  timestamp: string;
}

// ─── Album ─────────────────────────────────────────────────────────

export interface IAlbumPhoto {
  _id?: string;
  url: string;
  caption?: string;
  uploadedBy?: string;
  createdAt?: Date;
}

export interface IAlbum {
  _id?: string;
  title: string;
  description?: string;
  coverUrl?: string;
  createdBy: string;
  photos: IAlbumPhoto[];
  createdAt?: Date;
  updatedAt?: Date;
}

// ─── Memo ──────────────────────────────────────────────────────────

export interface IMemo {
  _id?: string;
  content: string;
  type: 'memo' | 'note';
  pinned: boolean;
  color?: string;
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// ─── AI Protocol ────────────────────────────────────────────────────

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export interface ToolUseBlock {
  id: string;
  name: string;
  input: Record<string, unknown>;
}

export interface ToolResultBlock {
  toolUseId: string;
  content: string;
  isError?: boolean;
}

export interface CompletionMessage {
  role: 'system' | 'user' | 'assistant' | 'tool_result';
  content: string;
  toolUse?: ToolUseBlock[];
  toolResults?: ToolResultBlock[];
}

export interface CompletionRequest {
  messages: CompletionMessage[];
  model: string;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
  tools?: ToolDefinition[];
}

export interface CompletionResponse {
  content: string;
  reasoning?: string;
  toolUse?: ToolUseBlock[];
  stopReason?: 'end_turn' | 'tool_use' | 'max_tokens';
  model: string;
  usage: { inputTokens: number; outputTokens: number };
}
