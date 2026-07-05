# 智能管家 硬件端接口文档

> 本文档定义了硬件设备（传感器节点/摄像头/控制器）需要实现的 HTTP REST API。
> 智能管家服务器会主动请求这些接口，硬件端只需开放端口等待连接。

---

## 架构概览

```
┌──────────────────┐         HTTP 请求          ┌──────────────┐
│  智能管家 Server  │ ──── GET /api/ping ──────→ │  硬件设备     │
│  (Node/Bun)      │ ──── GET /api/sensors ───→ │  (ESP32/RPi/ │
│  :3000           │ ──── GET /api/stream ────→ │   C# 模拟器) │
│                  │ ──── POST /api/command ──→ │  :8080       │
│                  │ ←──── JSON 响应 ─────────── │              │
└──────────────────┘                            └──────────────┘

通信方向：服务器 → 硬件（硬件不需要主动连服务器）
轮询频率：每 30 秒
视频流：SSE (Server-Sent Events)
```

---

## 接口列表

| 方法 | 路径 | 说明 | 必须实现 |
|------|------|------|----------|
| GET | `/api/ping` | 健康检查 + 设备信息 | ✅ 必须 |
| GET | `/api/sensors` | 传感器数据 | 有传感器时必须 |
| GET | `/api/stream` | 摄像头 SSE 视频流 | 有摄像头时必须 |
| POST | `/api/command` | 接收执行命令 | 有执行器时必须 |

---

## 1. GET /api/ping

服务器每 30 秒调用一次，用于检测设备在线状态和获取设备元信息。

### 响应

```json
{
  "online": true,
  "deviceId": "device-127-0-0-1-8080",
  "name": "客厅传感器",
  "capabilities": ["temperature", "humidity", "camera"]
}
```

### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `online` | boolean | 固定返回 `true`（能响应就是在线） |
| `deviceId` | string | 设备唯一标识符（建议格式：`device-{ip}-{port}`） |
| `name` | string | 设备显示名称 |
| `capabilities` | string[] | 设备能力列表 |

### 支持的 capabilities

| 值 | 说明 |
|----|------|
| `temperature` | 温度传感器 |
| `humidity` | 湿度传感器 |
| `infrared` | 人体红外检测 |
| `camera` | 摄像头 |
| `servo` | 舵机云台 |
| `light` | 灯光控制 |
| `switch` | 开关控制 |

### 超时

服务器等待最多 **5 秒**。超时则标记设备为离线。

---

## 2. GET /api/sensors

服务器每 30 秒调用一次（仅对有传感器能力的设备），获取当前传感器读数。

### 响应

```json
{
  "temperature": {
    "value": 25.6,
    "unit": "°C"
  },
  "humidity": {
    "value": 55.3,
    "unit": "%"
  },
  "infrared": {
    "value": 0,
    "unit": ""
  }
}
```

### 字段说明

每个键对应一个传感器类型，值为对象：

| 字段 | 类型 | 说明 |
|------|------|------|
| `value` | number | 当前读数 |
| `unit` | string | 单位（如 `°C`、`%`、空字符串） |

只需返回设备实际具有的传感器数据，不需要全部返回。

---

## 3. GET /api/stream

摄像头视频流，使用 **Server-Sent Events (SSE)** 协议持续推送 JPEG 帧。

### 响应头

```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

### 事件格式

```
event: frame
data: {"jpeg":"<base64 编码的 JPEG 图像>","timestamp":"2026-07-04T12:00:00.000Z"}

event: frame
data: {"jpeg":"<base64>","timestamp":"..."}

...
```

### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `jpeg` | string | Base64 编码的 JPEG 图像数据 |
| `timestamp` | string | ISO 8601 时间戳 |

### 帧率

建议 **2~5 FPS**。每帧之间间隔 200~500ms。

### 分辨率

建议 **640x480**，可根据硬件性能调整。JPEG 质量建议 60~75。

### 连接生命周期

- 客户端（服务器）连接后持续接收帧
- 客户端断开时，硬件端停止推流并释放资源
- 服务器设置 60 秒连接超时

---

## 4. POST /api/command

服务器下发控制命令给硬件执行。

### 请求体

```json
{
  "command": "set_led",
  "params": {
    "state": 1
  }
}
```

### 响应

```json
{
  "success": true,
  "command": "set_led",
  "executed": true
}
```

失败时：

```json
{
  "success": false,
  "error": "Unknown command"
}
```

### 标准命令

| command | params | 说明 | 需要 capability |
|---------|--------|------|-----------------|
| `set_led` | `{ "state": 0\|1 }` | 开关 LED | `light` |
| `set_switch` | `{ "state": 0\|1 }` | 开关继电器 | `switch` |
| `set_angle` | `{ "angle": 0-180 }` | 舵机转向 | `servo` |
| `beep` | `{ "duration": 500 }` | 蜂鸣器响 N 毫秒 | 任意 |

硬件端可以自定义扩展 command，服务器会原样转发。

---

## CORS

所有接口必须支持 CORS（服务器可能从不同源请求）：

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

对 `OPTIONS` 请求返回 `204 No Content`。

---

## 设备注册流程

```
1. 用户在前端 Camera 页面输入 ip:port（如 127.0.0.1:8080）
2. 服务器立即 GET http://127.0.0.1:8080/api/ping 验证连通性
3. 连通则保存设备信息（deviceId、name、capabilities），标记在线
4. 之后每 30 秒轮询，自动采集传感器数据
5. 前端请求视频流时，服务器连接硬件 /api/stream 并中继给浏览器
```

---

## 硬件端设计指南

### 最小实现（仅传感器）

只需实现 2 个接口即可接入系统：

```
GET /api/ping     → 设备信息
GET /api/sensors  → 传感器读数
```

### 带摄像头

额外实现：

```
GET /api/stream   → SSE 视频流
```

### 带控制能力

额外实现：

```
POST /api/command → 接收命令
```

### 硬件端实现要点

1. **HTTP 服务器**：设备上电后监听指定端口（如 8080）
2. **无需主动连接**：不用连服务器，只需等待被请求
3. **保持轻量**：响应体 JSON 格式，结构简单
4. **SSE 推流**：摄像头用 `text/event-stream`，每帧一个 `event: frame`
5. **超时容忍**：ping 超时 5 秒，命令超时 10 秒，流超时 60 秒

### ESP32 / Arduino 参考

```cpp
// 伪代码 - ESP32 WebServer
server.on("/api/ping", HTTP_GET, [](AsyncWebServerRequest *req) {
    String json = "{\"online\":true,\"deviceId\":\"device-192-168-1-100-8080\",";
    json += "\"name\":\"客厅\",\"capabilities\":[\"temperature\",\"humidity\"]}";
    req->send(200, "application/json", json);
});

server.on("/api/sensors", HTTP_GET, [](AsyncWebServerRequest *req) {
    float temp = readTemp();
    float humid = readHumid();
    String json = "{\"temperature\":{\"value\":" + String(temp) + ",\"unit\":\"°C\"},";
    json += "\"humidity\":{\"value\":" + String(humid) + ",\"unit\":\"%\"}}";
    req->send(200, "application/json", json);
});
```

### Raspberry Pi / Python 参考

```python
from flask import Flask, Response, jsonify
import json, time, base64

app = Flask(__name__)

@app.route('/api/ping')
def ping():
    return jsonify(online=True, deviceId="device-rpi-001", name="树莓派", capabilities=["camera","temperature"])

@app.route('/api/stream')
def stream():
    def generate():
        while True:
            frame = capture_frame()  # OpenCV / PiCamera
            b64 = base64.b64encode(frame).decode()
            yield f"event: frame\ndata: {json.dumps({'jpeg': b64, 'timestamp': datetime.utcnow().isoformat()})}\n\n"
            time.sleep(0.4)
    return Response(generate(), content_type='text/event-stream')
```

---

## C# 模拟器

项目位置：`HardwareSimulator/`

```bash
# 温湿度传感器
dotnet run -- --port 8080 --name "客厅" --caps temperature,humidity

# 摄像头 + 传感器
dotnet run -- --port 8081 --name "门口" --caps temperature,humidity,camera

# 纯摄像头
dotnet run -- --port 8082 --name "车库" --caps camera
```

---

## 错误处理约定

| HTTP 状态码 | 场景 |
|-------------|------|
| 200 | 正常响应 |
| 204 | OPTIONS 预检 |
| 404 | 不支持的路径/能力 |
| 500 | 内部错误 |
