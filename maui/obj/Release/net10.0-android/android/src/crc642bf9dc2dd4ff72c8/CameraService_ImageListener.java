package crc642bf9dc2dd4ff72c8;


public class CameraService_ImageListener
	extends java.lang.Object
	implements
		mono.android.IGCUserPeer,
		android.media.ImageReader.OnImageAvailableListener
{

	public CameraService_ImageListener ()
	{
		super ();
		if (getClass () == CameraService_ImageListener.class) {
			mono.android.TypeManager.Activate ("maui.Services.CameraService+ImageListener, maui", "", this, new java.lang.Object[] {  });
		}
	}

	public void onImageAvailable (android.media.ImageReader p0)
	{
		n_onImageAvailable (p0);
	}

	private native void n_onImageAvailable (android.media.ImageReader p0);

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
