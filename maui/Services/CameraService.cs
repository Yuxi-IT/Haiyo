using Android.Content;
using Android.Graphics;
using Android.Hardware.Camera2;
using Android.Media;
using Android.OS;
using Android.Views;
using Java.Nio;

namespace maui.Services;

public class CameraService
{
    private CameraDevice? _camera;
    private CameraCaptureSession? _session;
    private ImageReader? _imageReader;
    private byte[]? _latestFrame;
    private readonly object _lock = new();
    private readonly Context _context;
    private bool _running;

    public const int WIDTH = 320;
    public const int HEIGHT = 240;
    public const int JPEG_QUALITY = 45;

    public CameraService(Context context)
    {
        _context = context;
    }

    public byte[]? GetLatestFrame()
    {
        lock (_lock) return _latestFrame;
    }

    public void Start()
    {
        if (_running) return;
        _running = true;
        _ = Task.Run(OpenCamera);
    }

    public void Stop()
    {
        _running = false;
        _session?.Close();
        _camera?.Close();
        _imageReader?.Close();
    }

    private void OpenCamera()
    {
        var manager = (CameraManager?)_context.GetSystemService(Context.CameraService);
        if (manager == null) return;

        var cameraId = manager.GetCameraIdList()?.FirstOrDefault();
        if (cameraId == null) return;

        _imageReader = ImageReader.NewInstance(WIDTH, HEIGHT, ImageFormatType.Jpeg, 2);
        _imageReader.SetOnImageAvailableListener(new ImageListener(this), new Handler(Looper.MainLooper!));

        manager.OpenCamera(cameraId, new CameraStateCallback(this), new Handler(Looper.MainLooper!));
    }

    internal void OnCameraOpened(CameraDevice camera)
    {
        _camera = camera;
        var surface = _imageReader!.Surface!;
        var builder = camera.CreateCaptureRequest(CameraTemplate.Preview)!;
        builder.AddTarget(surface);

        camera.CreateCaptureSession(new[] { surface }, new SessionCallback(this, builder), new Handler(Looper.MainLooper!));
    }

    internal void OnSessionConfigured(CameraCaptureSession session, CaptureRequest.Builder builder)
    {
        _session = session;
        var request = builder.Build()!;
        session.SetRepeatingRequest(request, null, new Handler(Looper.MainLooper!));
    }

    internal void OnImageAvailable(Image image)
    {
        try
        {
            var buffer = image.GetPlanes()![0].Buffer!;
            var raw = new byte[buffer.Remaining()];
            buffer.Get(raw);

            // Re-compress at lower quality with forced resize
            using var bmp = BitmapFactory.DecodeByteArray(raw, 0, raw.Length);
            if (bmp != null)
            {
                using var scaled = Bitmap.CreateScaledBitmap(bmp, WIDTH, HEIGHT, true);
                using var ms = new MemoryStream();
                scaled!.Compress(Bitmap.CompressFormat.Jpeg!, JPEG_QUALITY, ms);
                lock (_lock) _latestFrame = ms.ToArray();
            }
        }
        finally { image.Close(); }
    }

    private class ImageListener(CameraService svc) : Java.Lang.Object, ImageReader.IOnImageAvailableListener
    {
        public void OnImageAvailable(ImageReader? reader)
        {
            var image = reader?.AcquireLatestImage();
            if (image != null) svc.OnImageAvailable(image);
        }
    }

    private class CameraStateCallback(CameraService svc) : CameraDevice.StateCallback
    {
        public override void OnOpened(CameraDevice camera) => svc.OnCameraOpened(camera);
        public override void OnDisconnected(CameraDevice camera) => camera.Close();
        public override void OnError(CameraDevice camera, CameraError error) => camera.Close();
    }

    private class SessionCallback(CameraService svc, CaptureRequest.Builder builder) : CameraCaptureSession.StateCallback
    {
        public override void OnConfigured(CameraCaptureSession session) => svc.OnSessionConfigured(session, builder);
        public override void OnConfigureFailed(CameraCaptureSession session) { }
    }
}
