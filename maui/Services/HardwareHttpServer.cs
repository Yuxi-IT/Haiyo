using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Text.Json;
using Android.Content;
using Android.Graphics;
using Android.Hardware.Camera2;
using Android.OS;

namespace maui.Services;

public class HardwareHttpServer
{
    private TcpListener? _listener;
    private readonly int _port;
    private readonly string _deviceName;
    private readonly string[] _capabilities;
    private readonly SensorService _sensors;
    private readonly CameraService _camera;
    private bool _running;
    private bool _flashlightOn;

    // Frame diffing state
    private byte[]? _prevThumb;
    private const int THUMB_W = 20;
    private const int THUMB_H = 15;
    private const int THUMB_PIXELS = THUMB_W * THUMB_H;
    private const float DIFF_FULL_THRESHOLD = 0.60f;

    public string DeviceId => $"device-android-{_port}";
    public bool IsRunning => _running;
    public int Port => _port;

    public HardwareHttpServer(int port, string deviceName, string[] capabilities, SensorService sensors, CameraService camera)
    {
        _port = port;
        _deviceName = deviceName;
        _capabilities = capabilities;
        _sensors = sensors;
        _camera = camera;
    }

    public void Start()
    {
        if (_running) return;
        _running = true;
        _listener = new TcpListener(IPAddress.Any, _port);
        _listener.Start();
        _ = ListenLoop();
    }

    public void Stop()
    {
        _running = false;
        try { _listener?.Stop(); } catch { }
    }

    private async Task ListenLoop()
    {
        while (_running)
        {
            try
            {
                var client = await _listener!.AcceptTcpClientAsync();
                _ = Task.Run(() => HandleClient(client));
            }
            catch (ObjectDisposedException) { break; }
            catch (SocketException) { break; }
        }
    }

    private void HandleClient(TcpClient client)
    {
        using var stream = client.GetStream();
        try
        {
            var (method, path, headers, body) = ParseRequest(stream);

            if (method == "OPTIONS")
            {
                WriteResponse(stream, 204, "No Content", null, "text/plain");
                return;
            }

            switch (path)
            {
                case "/api/ping": HandlePing(stream); break;
                case "/api/sensors": HandleSensors(stream); break;
                case "/api/stream": HandleStream(stream); break;
                case "/api/command": HandleCommand(stream, body); break;
                default: WriteJson(stream, 404, new { error = "Not found" }); break;
            }
        }
        catch { }
        finally { try { client.Close(); } catch { } }
    }

    private static (string method, string path, Dictionary<string, string> headers, string body) ParseRequest(NetworkStream stream)
    {
        var reader = new StreamReader(stream, Encoding.UTF8, leaveOpen: true);
        var requestLine = reader.ReadLine() ?? "";
        var parts = requestLine.Split(' ');
        var method = parts.Length > 0 ? parts[0] : "GET";
        var path = parts.Length > 1 ? parts[1] : "/";

        if (path.Contains('?'))
            path = path[..path.IndexOf('?')];

        var headers = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        string? line;
        while (!string.IsNullOrEmpty(line = reader.ReadLine()))
        {
            var colon = line.IndexOf(':');
            if (colon > 0)
                headers[line[..colon].Trim()] = line[(colon + 1)..].Trim();
        }

        var body = "";
        if (headers.TryGetValue("Content-Length", out var cl) && int.TryParse(cl, out var len) && len > 0)
        {
            var buffer = new char[len];
            reader.ReadBlock(buffer, 0, len);
            body = new string(buffer);
        }

        return (method, path, headers, body);
    }

    private void HandlePing(NetworkStream stream)
    {
        WriteJson(stream, 200, new { online = true, deviceId = DeviceId, name = _deviceName, capabilities = _capabilities });
    }

    private void HandleSensors(NetworkStream stream)
    {
        var data = new Dictionary<string, object>();
        if (_capabilities.Contains("temperature"))
            data["temperature"] = new { value = _sensors.Temperature, unit = "°C" };
        if (_capabilities.Contains("humidity"))
            data["humidity"] = new { value = _sensors.Humidity, unit = "%" };
        if (_capabilities.Contains("light"))
            data["light"] = new { value = _sensors.Light, unit = "lux" };
        if (_capabilities.Contains("infrared"))
            data["infrared"] = new { value = _sensors.Proximity ? 1 : 0, unit = "" };
        WriteJson(stream, 200, data);
    }

    private void HandleStream(NetworkStream stream)
    {
        if (!_capabilities.Contains("camera"))
        {
            WriteJson(stream, 404, new { error = "No camera" });
            return;
        }

        var header = "HTTP/1.1 200 OK\r\n" +
                     "Content-Type: text/event-stream\r\n" +
                     "Cache-Control: no-cache\r\n" +
                     "Connection: keep-alive\r\n" +
                     "Access-Control-Allow-Origin: *\r\n" +
                     "\r\n";
        stream.Write(Encoding.UTF8.GetBytes(header));
        stream.Flush();

        try
        {
            while (_running)
            {
                var jpeg = _camera.GetLatestFrame();
                if (jpeg != null && jpeg.Length > 0)
                {
                    var (eventType, payload) = BuildFrameEvent(jpeg);
                    var msg = Encoding.UTF8.GetBytes($"event: {eventType}\ndata: {payload}\n\n");
                    stream.Write(msg, 0, msg.Length);
                    stream.Flush();
                }
                Thread.Sleep(350);
            }
        }
        catch { }
    }

    private (string eventType, string payload) BuildFrameEvent(byte[] jpeg)
    {
        try
        {
            using var bmp = BitmapFactory.DecodeByteArray(jpeg, 0, jpeg.Length);
            if (bmp == null) return ("frame", JsonSerializer.Serialize(new { jpeg = Convert.ToBase64String(jpeg) }));

            var currThumb = BuildThumbnail(bmp);

            if (_prevThumb != null)
            {
                var diffRatio = CompareThumbnails(_prevThumb, currThumb);

                if (diffRatio < DIFF_FULL_THRESHOLD)
                {
                    // Delta: find dirty rect and crop
                    var (rx, ry, rw, rh) = FindDirtyRect(_prevThumb, currThumb, bmp.Width, bmp.Height);
                    if (rw > 0 && rh > 0)
                    {
                        using var crop = Bitmap.CreateBitmap(bmp, rx, ry, rw, rh);
                        using var ms = new MemoryStream();
                        crop!.Compress(Bitmap.CompressFormat.Jpeg!, 40, ms);
                        var cropBytes = ms.ToArray();
                        _prevThumb = currThumb;
                        var payload = JsonSerializer.Serialize(new {
                            type = "delta",
                            x = rx, y = ry, w = rw, h = rh,
                            jpeg = Convert.ToBase64String(cropBytes)
                        });
                        return ("delta", payload);
                    }
                    // No change, skip
                    _prevThumb = currThumb;
                    return ("skip", "{}");
                }
            }

            // Full frame
            _prevThumb = currThumb;
            {
                using var ms = new MemoryStream();
                bmp.Compress(Bitmap.CompressFormat.Jpeg!, 40, ms);
                var fullBytes = ms.ToArray();
                var payload = JsonSerializer.Serialize(new {
                    type = "full",
                    width = bmp.Width,
                    height = bmp.Height,
                    jpeg = Convert.ToBase64String(fullBytes)
                });
                return ("frame", payload);
            }
        }
        catch
        {
            return ("frame", JsonSerializer.Serialize(new { jpeg = Convert.ToBase64String(jpeg) }));
        }
    }

    private static byte[] BuildThumbnail(Bitmap bmp)
    {
        using var thumb = Bitmap.CreateScaledBitmap(bmp, THUMB_W, THUMB_H, false);
        var pixels = new int[THUMB_PIXELS];
        thumb!.GetPixels(pixels, 0, THUMB_W, 0, 0, THUMB_W, THUMB_H);
        var result = new byte[THUMB_PIXELS * 3];
        for (int i = 0; i < THUMB_PIXELS; i++)
        {
            var c = pixels[i];
            result[i * 3] = (byte)((c >> 16) & 0xFF);
            result[i * 3 + 1] = (byte)((c >> 8) & 0xFF);
            result[i * 3 + 2] = (byte)(c & 0xFF);
        }
        return result;
    }

    private static float CompareThumbnails(byte[] a, byte[] b)
    {
        if (a.Length != b.Length) return 1f;
        int diff = 0;
        for (int i = 0; i < a.Length; i += 3)
        {
            var dr = Math.Abs(a[i] - b[i]);
            var dg = Math.Abs(a[i + 1] - b[i + 1]);
            var db = Math.Abs(a[i + 2] - b[i + 2]);
            if (dr > 25 || dg > 25 || db > 25)
                diff++;
        }
        return (float)diff / THUMB_PIXELS;
    }

    private static (int x, int y, int w, int h) FindDirtyRect(byte[] a, byte[] b, int fullW, int fullH)
    {
        int minX = THUMB_W, minY = THUMB_H, maxX = 0, maxY = 0;
        for (int ty = 0; ty < THUMB_H; ty++)
        {
            for (int tx = 0; tx < THUMB_W; tx++)
            {
                int i = (ty * THUMB_W + tx) * 3;
                var dr = Math.Abs(a[i] - b[i]);
                var dg = Math.Abs(a[i + 1] - b[i + 1]);
                var db = Math.Abs(a[i + 2] - b[i + 2]);
                if (dr > 25 || dg > 25 || db > 25)
                {
                    if (tx < minX) minX = tx;
                    if (tx > maxX) maxX = tx;
                    if (ty < minY) minY = ty;
                    if (ty > maxY) maxY = ty;
                }
            }
        }
        if (maxX < minX) return (0, 0, 0, 0);

        // Expand by 1 thumbnail pixel to capture edge details, then clamp
        minX = Math.Max(0, minX - 1);
        minY = Math.Max(0, minY - 1);
        maxX = Math.Min(THUMB_W - 1, maxX + 1);
        maxY = Math.Min(THUMB_H - 1, maxY + 1);

        int x = minX * fullW / THUMB_W;
        int y = minY * fullH / THUMB_H;
        int w = (maxX + 1) * fullW / THUMB_W - x;
        int h = (maxY + 1) * fullH / THUMB_H - y;

        return (x, y, w, h);
    }

    private void HandleCommand(NetworkStream stream, string body)
    {
        try
        {
            var doc = JsonDocument.Parse(body);
            var command = doc.RootElement.TryGetProperty("command", out var c) ? c.GetString() : "";

            switch (command)
            {
                case "set_flashlight":
                    var state = doc.RootElement.TryGetProperty("params", out var p) &&
                                p.TryGetProperty("state", out var s) && s.GetInt32() == 1;
                    SetFlashlight(state);
                    WriteJson(stream, 200, new { success = true, command, executed = true });
                    break;
                default:
                    WriteJson(stream, 200, new { success = true, command, executed = true });
                    break;
            }
        }
        catch { WriteJson(stream, 400, new { error = "Invalid JSON" }); }
    }

    private void SetFlashlight(bool on)
    {
        _flashlightOn = on;
        new Handler(Looper.MainLooper!).Post(() =>
        {
            try
            {
                var manager = (CameraManager?)Android.App.Application.Context.GetSystemService(Android.Content.Context.CameraService);
                manager?.SetTorchMode("0", on);
            }
            catch { }
        });
    }

    private static void WriteJson(NetworkStream stream, int statusCode, object data)
    {
        var json = JsonSerializer.Serialize(data);
        var body = Encoding.UTF8.GetBytes(json);
        var statusText = statusCode switch
        {
            200 => "OK",
            204 => "No Content",
            400 => "Bad Request",
            404 => "Not Found",
            _ => "OK"
        };
        var header = $"HTTP/1.1 {statusCode} {statusText}\r\n" +
                     "Content-Type: application/json\r\n" +
                     $"Content-Length: {body.Length}\r\n" +
                     "Access-Control-Allow-Origin: *\r\n" +
                     "Access-Control-Allow-Methods: GET,POST,OPTIONS\r\n" +
                     "Access-Control-Allow-Headers: Content-Type\r\n" +
                     "Connection: close\r\n" +
                     "\r\n";
        var headerBytes = Encoding.UTF8.GetBytes(header);
        stream.Write(headerBytes, 0, headerBytes.Length);
        stream.Write(body, 0, body.Length);
        stream.Flush();
    }

    private static void WriteResponse(NetworkStream stream, int statusCode, string statusText, byte[]? body, string contentType)
    {
        body ??= Array.Empty<byte>();
        var header = $"HTTP/1.1 {statusCode} {statusText}\r\n" +
                     $"Content-Type: {contentType}\r\n" +
                     $"Content-Length: {body.Length}\r\n" +
                     "Access-Control-Allow-Origin: *\r\n" +
                     "Access-Control-Allow-Methods: GET,POST,OPTIONS\r\n" +
                     "Access-Control-Allow-Headers: Content-Type\r\n" +
                     "Connection: close\r\n" +
                     "\r\n";
        var headerBytes = Encoding.UTF8.GetBytes(header);
        stream.Write(headerBytes, 0, headerBytes.Length);
        if (body.Length > 0)
            stream.Write(body, 0, body.Length);
        stream.Flush();
    }
}
