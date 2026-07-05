package crc642bf9dc2dd4ff72c8;


public class SensorService
	extends java.lang.Object
	implements
		mono.android.IGCUserPeer,
		android.hardware.SensorEventListener
{

	public SensorService ()
	{
		super ();
		if (getClass () == SensorService.class) {
			mono.android.TypeManager.Activate ("maui.Services.SensorService, maui", "", this, new java.lang.Object[] {  });
		}
	}

	public SensorService (android.content.Context p0)
	{
		super ();
		if (getClass () == SensorService.class) {
			mono.android.TypeManager.Activate ("maui.Services.SensorService, maui", "Android.Content.Context, Mono.Android", this, new java.lang.Object[] { p0 });
		}
	}

	public void onAccuracyChanged (android.hardware.Sensor p0, int p1)
	{
		n_onAccuracyChanged (p0, p1);
	}

	private native void n_onAccuracyChanged (android.hardware.Sensor p0, int p1);

	public void onSensorChanged (android.hardware.SensorEvent p0)
	{
		n_onSensorChanged (p0);
	}

	private native void n_onSensorChanged (android.hardware.SensorEvent p0);

	private java.util.ArrayList refList;
	public void monodroidAddReference (java.lang.Object obj)
	{
		if (refList == null)
			refList = new java.util.ArrayList ();
		refList.add (obj);
	}

	public void monodroidClearReferences ()
	{
		if (refList != null)
			refList.clear ();
	}
}
