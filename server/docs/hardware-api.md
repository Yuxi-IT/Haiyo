# 硬件模块通信协议 v1.0

## 概述

本文档定义智能管家服务器与局域网内硬件模块（ESP32 / 树莓派）之间的标准通信协议。

- **方向**：服务器作为 HTTP/SSE **客户端**，主动向硬件模块发起请求拉取数据
- **传输**：HTTP/1.1 REST + SSE（Server-Sent Events）
- **编码**：UTF-8，JSON 格式，二进制数据用 Base64 编码
- **设备发现**：mDNS（`_smarthome._tcp.local`）或手动配置 IP

---

## 1. 设备发现（mDNS）

硬件模块启动后需注册 mDNS 服务：

| 字段 | 值 |
|------|-----|
| 服务类型 | `_smarthome._tcp` |
| 实例名 | `{device-type}-{device-id}`（如 `esp32-a1b2c3d4`） |
| TXT `type` | `esp32` 或 `rpi` |
| TXT `ver` | 协议版本，当前 `1.0` |
| TXT `cap` | 能力位，逗号分隔：`camera,temp,humidity,servo` |

服务器通过 `bonjour` / `mdns` 包扫描局域网设备，解析出 IP:Port 后存入 device 表。

---

## 2. 端点总览

| 方法 | 路径 | 类型 | 说明 |
|------|------|------|------|
| `GET` | `/api/frame` | 轮询 | 获取摄像头当前帧（Base64 JPEG） |
| `GET` | `/api/sensor/temperature` | 轮询 | 获取当前温度 |
| `GET` | `/api/sensor/humidity` | 轮询 | 获取当前湿度 |
| `GET` | `/api/status` | 轮询 | 设备心跳/状态 |
| `GET` | `/api/stream/frame` | SSE | 摄像头帧流（支持帧差优化） |
| `GET` | `/api/stream/temperature` | SSE | 温度数据流 |
| `GET` | `/api/stream/humidity` | SSE | 湿度数据流 |
| `POST` | `/api/command` | 控制 | 下发控制指令（舵机等） |

基地址：`http://{device-ip}:{port}`，默认端口 `8080`。

---

## 3. 轮询接口

### 3.1 获取摄像头帧

```
GET /api/frame
```

**响应 200：**

```json
{
  "deviceId": "esp32-a1b2c3d4",
  "timestamp": 1712345678000,
  "frame": "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBD...",
  "format": "jpeg",
  "width": 640,
  "height": 480,
  "seq": 142
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `deviceId` | string | 设备唯一标识 |
| `timestamp` | number | Unix 毫秒时间戳 |
| `frame` | string | Base64 编码的 JPEG 图像数据 |
| `format` | string | 图像格式，当前固定 `"jpeg"` |
| `width` | number | 图像宽度（像素） |
| `height` | number | 图像高度（像素） |
| `seq` | number | 帧序号，单调递增，溢出归零 |

**频率建议**：不超过 1 req/s，高帧率场景使用 SSE 流。

---

### 3.2 获取温度

```
GET /api/sensor/temperature
```

**响应 200：**

```json
{
  "deviceId": "esp32-a1b2c3d4",
  "type": "temperature",
  "value": 25.4,
  "unit": "celsius",
  "timestamp": 1712345678000
}
```

**误差要求**：±0.5°C

---

### 3.3 获取湿度

```
GET /api/sensor/humidity
```

**响应 200：**

```json
{
  "deviceId": "esp32-a1b2c3d4",
  "type": "humidity",
  "value": 62.1,
  "unit": "percent",
  "timestamp": 1712345678000
}
```

**误差要求**：±5% RH

---

### 3.4 设备状态（心跳）

```
GET /api/status
```

**响应 200：**

```json
{
  "deviceId": "esp32-a1b2c3d4",
  "type": "esp32",
  "uptime": 86400,
  "freeHeap": 124000,
  "wifiRssi": -42,
  "sensors": ["temperature", "humidity", "infrared"],
  "actuators": ["servo-1", "servo-2"],
  "version": "1.2.0"
}
```

服务器每 30s 向所有已知设备发送一次心跳检测，连续 3 次无响应标记为 `offline`。

---

## 4. SSE 流接口

### 4.1 通用约定

- Content-Type: `text/event-stream`
- 连接断开后客户端（服务器）自动重连，间隔指数退避（1s → 2s → 4s → 8s → 上限 30s）
- 硬件模块应每 15s 发送一次 `ping` 事件保活
- 支持 `Last-Event-ID` 请求头用于断线续传

### 4.2 摄像头帧流

```
GET /api/stream/frame
```

**查询参数：**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `mode` | string | `full` | `full` = 完整帧，`diff` = 帧差异 |
| `interval` | number | 200 | 推送间隔（毫秒），最小值 100 |
| `quality` | number | 70 | JPEG 质量（1-100） |
| `resolution` | string | `640x480` | 可选 `320x240`、`640x480`、`1280x720` |

**完整帧模式（`mode=full`）：**

```
event: frame
data: {"seq":1,"timestamp":1712345678000,"frame":"/9j/4AAQ...","format":"jpeg"}

event: frame
data: {"seq":2,"timestamp":1712345678200,"frame":"/9j/4AAQ...","format":"jpeg"}
```

**帧差模式（`mode=diff`）：**

```
event: keyframe
data: {"seq":0,"timestamp":1712345678000,"frame":"/9j/4AAQ...","format":"jpeg"}

event: diff
data: {"seq":1,"ref":0,"regions":[{"x":100,"y":50,"w":32,"h":32,"frame":"..."}]}

event: diff
data: {"seq":2,"ref":1,"regions":[{"x":120,"y":60,"w":16,"h":16,"frame":"..."},{"x":200,"y":80,"w":48,"h":24,"frame":"..."}]}
```

帧差模式说明：
- `keyframe`：完整帧，作为后续 diff 的参考基准
- `diff`：仅传输变化区域的 Base64 数据，`ref` 指向参考帧的 seq
- 每 30 帧或累积变化超过 60% 像素时强制发送一次 `keyframe`
- `regions` 为变化矩形区域数组，硬件端通过运动检测算法计算

**心跳：**

```
event: ping
data: 1712345678000
```

### 4.3 温度流

```
GET /api/stream/temperature
```

**查询参数：**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `interval` | number | 5000 | 推送间隔（毫秒），最小值 1000 |

```
event: sensor
data: {"deviceId":"esp32-a1b2c3d4","type":"temperature","value":25.4,"unit":"celsius","timestamp":1712345678000}

event: sensor
data: {"deviceId":"esp32-a1b2c3d4","type":"temperature","value":25.6,"unit":"celsius","timestamp":1712345683000}
```

### 4.4 湿度流

```
GET /api/stream/humidity
```

**查询参数：**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `interval` | number | 5000 | 推送间隔（毫秒），最小值 1000 |

```
event: sensor
data: {"deviceId":"esp32-a1b2c3d4","type":"humidity","value":62.1,"unit":"percent","timestamp":1712345678000}
```

---

## 5. 控制指令

### 5.1 下发命令

```
POST /api/command
Content-Type: application/json
```

**请求体：**

```json
{
  "command": "servo",
  "params": {
    "servoId": "servo-1",
    "angle": 90,
    "speed": 50
  },
  "requestId": "uuid-xxxx"
}
```

**响应 200：**

```json
{
  "requestId": "uuid-xxxx",
  "success": true,
  "result": {
    "servoId": "servo-1",
    "angle": 90
  }
}
```

**支持的指令：**

| command | params | 说明 |
|---------|--------|------|
| `servo` | `servoId`, `angle` (0-180), `speed?` (1-100) | 舵机角度控制 |
| `servo-calibrate` | `servoId` | 舵机回零校准 |
| `restart` | - | 重启设备 |
| `config` | `key`, `value` | 动态修改设备配置 |

---

## 6. 错误格式

所有错误统一返回：

```json
{
  "error": true,
  "code": "SENSOR_NOT_FOUND",
  "message": "温度传感器未连接"
}
```

**错误码：**

| HTTP 状态码 | code | 说明 |
|-------------|------|------|
| 400 | `BAD_REQUEST` | 请求参数错误 |
| 404 | `NOT_FOUND` | 端点或资源不存在 |
| 503 | `SENSOR_NOT_FOUND` | 传感器外设未连接 |
| 503 | `CAMERA_NOT_FOUND` | 摄像头模块未连接 |
| 500 | `INTERNAL_ERROR` | 设备内部错误 |
| 429 | `RATE_LIMITED` | 请求频率过高 |

---

## 7. 服务器端实现建议

```
server/src/services/
├── hardware-discovery.ts   # mDNS 扫描 + 设备注册
├── hardware-poller.ts      # 定时轮询温度/湿度/状态
└── stream-consumer.ts      # SSE 客户端，消费帧流/温度流/湿度流
```

**数据流向：**

```
[硬件设备] --SSE/HTTP--> [hardware-poller.ts] --写入--> [MongoDB SensorData]
                              |
                          [deviceRegistry.setLastSeen()]
                              |
                          [broadcast via WebSocket] --> [前端 Dashboard]
```

**SSE 客户端实现要点：**

```typescript
// stream-consumer.ts 核心逻辑
const source = new EventSource(`http://${ip}:${port}/api/stream/temperature`);

source.addEventListener('sensor', (e) => {
  const data = JSON.parse(e.data);
  SensorData.create(data);                    // 持久化
  deviceRegistry.updateLastSeen(data.deviceId);
  hardwareWs.broadcast('sensor:update', data); // 推送到前端
});

source.addEventListener('error', () => {
  // 自动重连由 EventSource 内置机制处理
  // 也可切换到手动 fetch + ReadableStream 实现更精细的重连策略
});
```

---

## 8. 硬件端实现参考

### ESP32 最低要求

| 模块 | 规格 |
|------|------|
| MCU | ESP32-S3（推荐）或 ESP32 |
| WiFi | 2.4GHz 802.11 b/g/n |
| HTTP Server | 基于 ESP-IDF `esp_http_server` |
| 摄像头 | OV2640 / OV5640（若支持 camera 能力） |
| 温湿度 | DHT22 或 SHT30（I2C） |
| 舵机 | PCA9685 PWM 驱动板 |

**端点实现清单：**

- [ ] `GET /api/status` — 必选
- [ ] `GET /api/sensor/temperature` — 如连接 DHT/SHT 传感器
- [ ] `GET /api/sensor/humidity` — 如连接 DHT/SHT 传感器
- [ ] `GET /api/frame` — 如连接摄像头
- [ ] SSE 流接口 — 推荐实现以减少服务器轮询开销
- [ ] `POST /api/command` — 如连接执行器（舵机等）
- [ ] mDNS 注册 — 推荐实现以支持自动发现
