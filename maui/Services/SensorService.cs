using Android.Content;
using Android.Hardware;

namespace maui.Services;

public class SensorService : Java.Lang.Object, ISensorEventListener
{
    private readonly SensorManager? _sensorManager;
    private readonly Sensor? _tempSensor;
    private readonly Sensor? _humiditySensor;
    private readonly Sensor? _lightSensor;
    private readonly Sensor? _proximitySensor;

    public float Temperature { get; private set; } = 25f;
    public float Humidity { get; private set; } = 55f;
    public float Light { get; private set; } = 300f;
    public bool Proximity { get; private set; }

    public bool HasTemperature => _tempSensor != null;
    public bool HasHumidity => _humiditySensor != null;
    public bool HasLight => _lightSensor != null;
    public bool HasProximity => _proximitySensor != null;

    public SensorService(Context context)
    {
        _sensorManager = (SensorManager?)context.GetSystemService(Context.SensorService);
        if (_sensorManager == null) return;

        _tempSensor = _sensorManager.GetDefaultSensor(SensorType.AmbientTemperature);
        _humiditySensor = _sensorManager.GetDefaultSensor(SensorType.RelativeHumidity);
        _lightSensor = _sensorManager.GetDefaultSensor(SensorType.Light);
        _proximitySensor = _sensorManager.GetDefaultSensor(SensorType.Proximity);

        if (_tempSensor == null)
            _tempSensor = _sensorManager.GetDefaultSensor(SensorType.Temperature);
    }

    public void Start()
    {
        if (_sensorManager == null) return;
        if (_tempSensor != null) _sensorManager.RegisterListener(this, _tempSensor, SensorDelay.Normal);
        if (_humiditySensor != null) _sensorManager.RegisterListener(this, _humiditySensor, SensorDelay.Normal);
        if (_lightSensor != null) _sensorManager.RegisterListener(this, _lightSensor, SensorDelay.Normal);
        if (_proximitySensor != null) _sensorManager.RegisterListener(this, _proximitySensor, SensorDelay.Normal);
    }

    public void Stop()
    {
        _sensorManager?.UnregisterListener(this);
    }

    public void OnSensorChanged(SensorEvent? e)
    {
        if (e == null) return;
        switch (e.Sensor?.Type)
        {
            case SensorType.AmbientTemperature:
            case SensorType.Temperature:
                Temperature = e.Values![0];
                break;
            case SensorType.RelativeHumidity:
                Humidity = e.Values![0];
                break;
            case SensorType.Light:
                Light = e.Values![0];
                break;
            case SensorType.Proximity:
                Proximity = e.Values![0] < 5f;
                break;
        }
    }

    public void OnAccuracyChanged(Sensor? sensor, SensorStatus accuracy) { }
}
