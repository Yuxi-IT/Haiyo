using Android;
using Android.Content.PM;
using Android.Net.Wifi;
using Android.OS;
using Android.Widget;
using maui.Services;

namespace maui;

[Activity(Label = "智能管家硬件端", MainLauncher = true)]
public class MainActivity : Activity
{
    private SensorService? _sensors;
    private CameraService? _camera;
    private HardwareHttpServer? _server;
    private TextView? _statusText;
    private Timer? _uiTimer;

    private const int PORT = 8080;
    private const int PERMISSION_REQUEST = 100;

    protected override void OnCreate(Bundle? savedInstanceState)
    {
        base.OnCreate(savedInstanceState);

        var layout = new LinearLayout(this)
        {
            Orientation = Orientation.Vertical,
            LayoutParameters = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MatchParent,
                LinearLayout.LayoutParams.MatchParent)
        };
        layout.SetPadding(32, 64, 32, 32);

        var title = new TextView(this)
        {
            Text = "智能管家 · 硬件端",
            TextSize = 24,
        };
        title.SetTextColor(Android.Graphics.Color.White);
        layout.AddView(title);

        var subtitle = new TextView(this) { Text = $"\n设备作为 HTTP 服务器运行\n端口: {PORT}\n" };
        subtitle.SetTextColor(Android.Graphics.Color.LightGray);
        layout.AddView(subtitle);

        _statusText = new TextView(this) { Text = "正在启动..." };
        _statusText.SetTextColor(Android.Graphics.Color.Rgb(100, 255, 100));
        _statusText.SetTypeface(Android.Graphics.Typeface.Monospace, Android.Graphics.TypefaceStyle.Normal);
        layout.AddView(_statusText);

        layout.SetBackgroundColor(Android.Graphics.Color.Rgb(30, 30, 40));
        SetContentView(layout);

        RequestPermissions(new[]
        {
            Manifest.Permission.Camera,
            Manifest.Permission.Internet,
        }, PERMISSION_REQUEST);
    }

    public override void OnRequestPermissionsResult(int requestCode, string[] permissions, Permission[] grantResults)
    {
        base.OnRequestPermissionsResult(requestCode, permissions, grantResults);
        StartServices();
    }

    private void StartServices()
    {
        _sensors = new SensorService(this);
        _sensors.Start();

        _camera = new CameraService(this);
        _camera.Start();

        var caps = new List<string>();
        if (_sensors.HasTemperature) caps.Add("temperature");
        if (_sensors.HasHumidity) caps.Add("humidity");
        if (_sensors.HasLight) caps.Add("light");
        if (_sensors.HasProximity) caps.Add("infrared");
        caps.Add("camera");

        _server = new HardwareHttpServer(PORT, "Android传感器", caps.ToArray(), _sensors, _camera);
        _server.Start();

        _uiTimer = new Timer(_ => UpdateUI(), null, 0, 2000);
    }

    private void UpdateUI()
    {
        RunOnUiThread(() =>
        {
            if (_statusText == null || _sensors == null) return;
            var ip = GetLocalIp();
            _statusText.Text = $"状态: 运行中\n" +
                $"地址: http://{ip}:{PORT}\n\n" +
                $"── 传感器 ──────────\n" +
                $"温度: {_sensors.Temperature:F1}°C\n" +
                $"湿度: {_sensors.Humidity:F0}%\n" +
                $"光照: {_sensors.Light:F0} lux\n" +
                $"接近: {(_sensors.Proximity ? "是" : "否")}\n\n" +
                $"── 能力 ────────────\n" +
                $"摄像头: {(_camera != null ? "就绪" : "无")}\n" +
                $"手电筒: POST /api/command\n\n" +
                $"在智能管家 Camera 页面\n添加设备: {ip}:{PORT}";
        });
    }

    private string GetLocalIp()
    {
        try
        {
            var wifiManager = (WifiManager?)GetSystemService(WifiService);
            var ip = wifiManager?.ConnectionInfo?.IpAddress ?? 0;
            if (ip == 0) return "127.0.0.1";
            return $"{ip & 0xFF}.{(ip >> 8) & 0xFF}.{(ip >> 16) & 0xFF}.{(ip >> 24) & 0xFF}";
        }
        catch { return "127.0.0.1"; }
    }

    protected override void OnDestroy()
    {
        _uiTimer?.Dispose();
        _server?.Stop();
        _camera?.Stop();
        _sensors?.Stop();
        base.OnDestroy();
    }
}
