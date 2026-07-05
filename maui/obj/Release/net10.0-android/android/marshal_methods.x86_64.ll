; ModuleID = 'marshal_methods.x86_64.ll'
source_filename = "marshal_methods.x86_64.ll"
target datalayout = "e-m:e-p270:32:32-p271:32:32-p272:64:64-i64:64-f80:128-n8:16:32:64-S128"
target triple = "x86_64-unknown-linux-android21"

%struct.MarshalMethodName = type {
	i64, ; uint64_t id
	ptr ; char* name
}

%struct.MarshalMethodsManagedClass = type {
	i32, ; uint32_t token
	ptr ; MonoClass klass
}

@assembly_image_cache = dso_local local_unnamed_addr global [33 x ptr] zeroinitializer, align 16

; Each entry maps hash of an assembly name to an index into the `assembly_image_cache` array
@assembly_image_cache_hashes = dso_local local_unnamed_addr constant [99 x i64] [
	i64 u0x02abedc11addc1ed, ; 0: lib_Mono.Android.Runtime.dll.so => 31
	i64 u0x0517ef04e06e9f76, ; 1: System.Net.Primitives => 14
	i64 u0x0581db89237110e9, ; 2: lib_System.Collections.dll.so => 5
	i64 u0x07dcdc7460a0c5e4, ; 3: System.Collections.NonGeneric => 3
	i64 u0x092266563089ae3e, ; 4: lib_System.Collections.NonGeneric.dll.so => 3
	i64 u0x09d144a7e214d457, ; 5: System.Security.Cryptography => 24
	i64 u0x0c59ad9fbbd43abe, ; 6: Mono.Android => 32
	i64 u0x0e14e73a54dda68e, ; 7: lib_System.Net.NameResolution.dll.so => 13
	i64 u0x0f5e7abaa7cf470a, ; 8: System.Net.HttpListener => 12
	i64 u0x13f1e5e209e91af4, ; 9: lib_Java.Interop.dll.so => 30
	i64 u0x17f9358913beb16a, ; 10: System.Text.Encodings.Web => 25
	i64 u0x19a4c090f14ebb66, ; 11: System.Security.Claims => 23
	i64 u0x1a91866a319e9259, ; 12: lib_System.Collections.Concurrent.dll.so => 2
	i64 u0x1c753b5ff15bce1b, ; 13: Mono.Android.Runtime.dll => 31
	i64 u0x1e6f91e5ea11e52e, ; 14: lib_maui.dll.so => 1
	i64 u0x2174319c0d835bc9, ; 15: System.Runtime => 22
	i64 u0x237be844f1f812c7, ; 16: System.Threading.Thread.dll => 27
	i64 u0x2407aef2bbe8fadf, ; 17: System.Console => 6
	i64 u0x27b410442fad6cf1, ; 18: Java.Interop.dll => 30
	i64 u0x2801845a2c71fbfb, ; 19: System.Net.Primitives.dll => 14
	i64 u0x2afc1c4f898552ee, ; 20: lib_System.Formats.Asn1.dll.so => 8
	i64 u0x2d169d318a968379, ; 21: System.Threading.dll => 28
	i64 u0x2db915caf23548d2, ; 22: System.Text.Json.dll => 26
	i64 u0x31195fef5d8fb552, ; 23: _Microsoft.Android.Resource.Designer.dll => 0
	i64 u0x341abc357fbb4ebf, ; 24: lib_System.Net.Sockets.dll.so => 17
	i64 u0x38869c811d74050e, ; 25: System.Net.NameResolution.dll => 13
	i64 u0x434c4e1d9284cdae, ; 26: Mono.Android.dll => 32
	i64 u0x4b7b6532ded934b7, ; 27: System.Text.Json => 26
	i64 u0x4c1e3dfc7f0c54f1, ; 28: maui => 1
	i64 u0x4e32f00cb0937401, ; 29: Mono.Android.Runtime => 31
	i64 u0x526ce79eb8e90527, ; 30: lib_System.Net.Primitives.dll.so => 14
	i64 u0x5435e6f049e9bc37, ; 31: System.Security.Claims.dll => 23
	i64 u0x54795225dd1587af, ; 32: lib_System.Runtime.dll.so => 22
	i64 u0x5588627c9a108ec9, ; 33: System.Collections.Specialized => 4
	i64 u0x571c5cfbec5ae8e2, ; 34: System.Private.Uri => 19
	i64 u0x579a06fed6eec900, ; 35: System.Private.CoreLib.dll => 29
	i64 u0x57c542c14049b66d, ; 36: System.Diagnostics.DiagnosticSource => 7
	i64 u0x5a8f6699f4a1caa9, ; 37: lib_System.Threading.dll.so => 28
	i64 u0x5d0a4a29b02d9d3c, ; 38: System.Net.WebHeaderCollection.dll => 18
	i64 u0x5db0cbbd1028510e, ; 39: lib_System.Runtime.InteropServices.dll.so => 20
	i64 u0x5e467bc8f09ad026, ; 40: System.Collections.Specialized.dll => 4
	i64 u0x5ea92fdb19ec8c4c, ; 41: System.Text.Encodings.Web.dll => 25
	i64 u0x5eee1376d94c7f5e, ; 42: System.Net.HttpListener.dll => 12
	i64 u0x60f62d786afcf130, ; 43: System.Memory => 11
	i64 u0x622eef6f9e59068d, ; 44: System.Private.CoreLib => 29
	i64 u0x65ece51227bfa724, ; 45: lib_System.Runtime.Numerics.dll.so => 21
	i64 u0x6692e924eade1b29, ; 46: lib_System.Console.dll.so => 6
	i64 u0x68fbbbe2eb455198, ; 47: System.Formats.Asn1 => 8
	i64 u0x6a4d7577b2317255, ; 48: System.Runtime.InteropServices.dll => 20
	i64 u0x6ffb210f7c70f10a, ; 49: maui.dll => 1
	i64 u0x73e4ce94e2eb6ffc, ; 50: lib_System.Memory.dll.so => 11
	i64 u0x76ca07b878f44da0, ; 51: System.Runtime.Numerics.dll => 21
	i64 u0x7dfc3d6d9d8d7b70, ; 52: System.Collections => 5
	i64 u0x7e302e110e1e1346, ; 53: lib_System.Security.Claims.dll.so => 23
	i64 u0x87c69b87d9283884, ; 54: lib_System.Threading.Thread.dll.so => 27
	i64 u0x8b4ff5d0fdd5faa1, ; 55: lib_System.Diagnostics.DiagnosticSource.dll.so => 7
	i64 u0x8d7b8ab4b3310ead, ; 56: System.Threading => 28
	i64 u0x8da188285aadfe8e, ; 57: System.Collections.Concurrent => 2
	i64 u0x903101b46fb73a04, ; 58: _Microsoft.Android.Resource.Designer => 0
	i64 u0x9157bd523cd7ed36, ; 59: lib_System.Text.Json.dll.so => 26
	i64 u0x91a74f07b30d37e2, ; 60: System.Linq.dll => 10
	i64 u0x97e144c9d3c6976e, ; 61: System.Collections.Concurrent.dll => 2
	i64 u0xa0d8259f4cc284ec, ; 62: lib_System.Security.Cryptography.dll.so => 24
	i64 u0xa2572680829d2c7c, ; 63: System.IO.Pipelines.dll => 9
	i64 u0xa5f1ba49b85dd355, ; 64: System.Security.Cryptography.dll => 24
	i64 u0xac2af3fa195a15ce, ; 65: System.Runtime.Numerics => 21
	i64 u0xadf511667bef3595, ; 66: System.Net.Security => 16
	i64 u0xae282bcd03739de7, ; 67: Java.Interop => 30
	i64 u0xb4bd7015ecee9d86, ; 68: System.IO.Pipelines => 9
	i64 u0xb81a2c6e0aee50fe, ; 69: lib_System.Private.CoreLib.dll.so => 29
	i64 u0xba48785529705af9, ; 70: System.Collections.dll => 5
	i64 u0xbb65706fde942ce3, ; 71: System.Net.Sockets => 17
	i64 u0xbd3fbd85b9e1cb29, ; 72: lib_System.Net.HttpListener.dll.so => 12
	i64 u0xc0d928351ab5ca77, ; 73: System.Console.dll => 6
	i64 u0xc12b8b3afa48329c, ; 74: lib_System.Linq.dll.so => 10
	i64 u0xc519125d6bc8fb11, ; 75: lib_System.Net.Requests.dll.so => 15
	i64 u0xc5a0f4b95a699af7, ; 76: lib_System.Private.Uri.dll.so => 19
	i64 u0xc858a28d9ee5a6c5, ; 77: lib_System.Collections.Specialized.dll.so => 4
	i64 u0xcbd4fdd9cef4a294, ; 78: lib__Microsoft.Android.Resource.Designer.dll.so => 0
	i64 u0xcd10a42808629144, ; 79: System.Net.Requests => 15
	i64 u0xcf23d8093f3ceadf, ; 80: System.Diagnostics.DiagnosticSource.dll => 7
	i64 u0xd333d0af9e423810, ; 81: System.Runtime.InteropServices => 20
	i64 u0xd3651b6fc3125825, ; 82: System.Private.Uri.dll => 19
	i64 u0xdad05a11827959a3, ; 83: System.Collections.NonGeneric.dll => 3
	i64 u0xdbf9607a441b4505, ; 84: System.Linq => 10
	i64 u0xdd2b722d78ef5f43, ; 85: System.Runtime.dll => 22
	i64 u0xdd67031857c72f96, ; 86: lib_System.Text.Encodings.Web.dll.so => 25
	i64 u0xe192a588d4410686, ; 87: lib_System.IO.Pipelines.dll.so => 9
	i64 u0xe1ecfdb7fff86067, ; 88: System.Net.Security.dll => 16
	i64 u0xe2420585aeceb728, ; 89: System.Net.Requests.dll => 15
	i64 u0xe5434e8a119ceb69, ; 90: lib_Mono.Android.dll.so => 32
	i64 u0xedc4817167106c23, ; 91: System.Net.Sockets.dll => 17
	i64 u0xedc632067fb20ff3, ; 92: System.Memory.dll => 11
	i64 u0xf09e47b6ae914f6e, ; 93: System.Net.NameResolution => 13
	i64 u0xf0de2537ee19c6ca, ; 94: lib_System.Net.WebHeaderCollection.dll.so => 18
	i64 u0xf1c4b4005493d871, ; 95: System.Formats.Asn1.dll => 8
	i64 u0xf5fc7602fe27b333, ; 96: System.Net.WebHeaderCollection => 18
	i64 u0xfa3f278f288b0e84, ; 97: lib_System.Net.Security.dll.so => 16
	i64 u0xfa645d91e9fc4cba ; 98: System.Threading.Thread => 27
], align 16

@assembly_image_cache_indices = dso_local local_unnamed_addr constant [99 x i32] [
	i32 31, i32 14, i32 5, i32 3, i32 3, i32 24, i32 32, i32 13,
	i32 12, i32 30, i32 25, i32 23, i32 2, i32 31, i32 1, i32 22,
	i32 27, i32 6, i32 30, i32 14, i32 8, i32 28, i32 26, i32 0,
	i32 17, i32 13, i32 32, i32 26, i32 1, i32 31, i32 14, i32 23,
	i32 22, i32 4, i32 19, i32 29, i32 7, i32 28, i32 18, i32 20,
	i32 4, i32 25, i32 12, i32 11, i32 29, i32 21, i32 6, i32 8,
	i32 20, i32 1, i32 11, i32 21, i32 5, i32 23, i32 27, i32 7,
	i32 28, i32 2, i32 0, i32 26, i32 10, i32 2, i32 24, i32 9,
	i32 24, i32 21, i32 16, i32 30, i32 9, i32 29, i32 5, i32 17,
	i32 12, i32 6, i32 10, i32 15, i32 19, i32 4, i32 0, i32 15,
	i32 7, i32 20, i32 19, i32 3, i32 10, i32 22, i32 25, i32 9,
	i32 16, i32 15, i32 32, i32 17, i32 11, i32 13, i32 18, i32 8,
	i32 18, i32 16, i32 27
], align 16

@marshal_methods_number_of_classes = dso_local local_unnamed_addr constant i32 10, align 4

@marshal_methods_class_cache = dso_local local_unnamed_addr global [10 x %struct.MarshalMethodsManagedClass] [
	%struct.MarshalMethodsManagedClass {
		i32 u0x020000c9, ; class name: Java.IO.InputStream, Mono.Android, Version=0.0.0.0, Culture=neutral, PublicKeyToken=84e04ff9cfb79065
		ptr null; MonoClass* klass
	}, ; 0
	%struct.MarshalMethodsManagedClass {
		i32 u0x020000dc, ; class name: Java.Lang.Object, Mono.Android, Version=0.0.0.0, Culture=neutral, PublicKeyToken=84e04ff9cfb79065
		ptr null; MonoClass* klass
	}, ; 1
	%struct.MarshalMethodsManagedClass {
		i32 u0x020000cc, ; class name: Java.IO.OutputStream, Mono.Android, Version=0.0.0.0, Culture=neutral, PublicKeyToken=84e04ff9cfb79065
		ptr null; MonoClass* klass
	}, ; 2
	%struct.MarshalMethodsManagedClass {
		i32 u0x020000ec, ; class name: Java.Lang.IRunnableInvoker, Mono.Android, Version=0.0.0.0, Culture=neutral, PublicKeyToken=84e04ff9cfb79065
		ptr null; MonoClass* klass
	}, ; 3
	%struct.MarshalMethodsManagedClass {
		i32 u0x020000bb, ; class name: Android.App.Activity, Mono.Android, Version=0.0.0.0, Culture=neutral, PublicKeyToken=84e04ff9cfb79065
		ptr null; MonoClass* klass
	}, ; 4
	%struct.MarshalMethodsManagedClass {
		i32 u0x02000052, ; class name: Android.Media.ImageReader/IOnImageAvailableListenerInvoker, Mono.Android, Version=0.0.0.0, Culture=neutral, PublicKeyToken=84e04ff9cfb79065
		ptr null; MonoClass* klass
	}, ; 5
	%struct.MarshalMethodsManagedClass {
		i32 u0x020000a6, ; class name: Android.Hardware.Camera2.CameraDevice/StateCallback, Mono.Android, Version=0.0.0.0, Culture=neutral, PublicKeyToken=84e04ff9cfb79065
		ptr null; MonoClass* klass
	}, ; 6
	%struct.MarshalMethodsManagedClass {
		i32 u0x020000a2, ; class name: Android.Hardware.Camera2.CameraCaptureSession/StateCallback, Mono.Android, Version=0.0.0.0, Culture=neutral, PublicKeyToken=84e04ff9cfb79065
		ptr null; MonoClass* klass
	}, ; 7
	%struct.MarshalMethodsManagedClass {
		i32 u0x02000098, ; class name: Android.Hardware.ISensorEventListenerInvoker, Mono.Android, Version=0.0.0.0, Culture=neutral, PublicKeyToken=84e04ff9cfb79065
		ptr null; MonoClass* klass
	}, ; 8
	%struct.MarshalMethodsManagedClass {
		i32 u0x02000103, ; class name: Java.Interop.TypeManager/JavaTypeManager, Mono.Android, Version=0.0.0.0, Culture=neutral, PublicKeyToken=84e04ff9cfb79065
		ptr null; MonoClass* klass
	} ; 9
], align 16

; Names of classes in which marshal methods reside
@mm_class_names = dso_local local_unnamed_addr constant [10 x ptr] [
	ptr @.mm.0, ; 0 ('Java.IO.InputStream, Mono.Android, Version=0.0.0.0, Culture=neutral, PublicKeyToken=84e04ff9cfb79065')
	ptr @.mm.1, ; 1 ('Java.Lang.Object, Mono.Android, Version=0.0.0.0, Culture=neutral, PublicKeyToken=84e04ff9cfb79065')
	ptr @.mm.2, ; 2 ('Java.IO.OutputStream, Mono.Android, Version=0.0.0.0, Culture=neutral, PublicKeyToken=84e04ff9cfb79065')
	ptr @.mm.3, ; 3 ('Java.Lang.IRunnableInvoker, Mono.Android, Version=0.0.0.0, Culture=neutral, PublicKeyToken=84e04ff9cfb79065')
	ptr @.mm.4, ; 4 ('Android.App.Activity, Mono.Android, Version=0.0.0.0, Culture=neutral, PublicKeyToken=84e04ff9cfb79065')
	ptr @.mm.5, ; 5 ('Android.Media.ImageReader/IOnImageAvailableListenerInvoker, Mono.Android, Version=0.0.0.0, Culture=neutral, PublicKeyToken=84e04ff9cfb79065')
	ptr @.mm.6, ; 6 ('Android.Hardware.Camera2.CameraDevice/StateCallback, Mono.Android, Version=0.0.0.0, Culture=neutral, PublicKeyToken=84e04ff9cfb79065')
	ptr @.mm.7, ; 7 ('Android.Hardware.Camera2.CameraCaptureSession/StateCallback, Mono.Android, Version=0.0.0.0, Culture=neutral, PublicKeyToken=84e04ff9cfb79065')
	ptr @.mm.8, ; 8 ('Android.Hardware.ISensorEventListenerInvoker, Mono.Android, Version=0.0.0.0, Culture=neutral, PublicKeyToken=84e04ff9cfb79065')
	ptr @.mm.9 ; 9 ('Java.Interop.TypeManager/JavaTypeManager, Mono.Android, Version=0.0.0.0, Culture=neutral, PublicKeyToken=84e04ff9cfb79065')
], align 16

@mm_method_names = dso_local local_unnamed_addr constant [26 x %struct.MarshalMethodName] [
	%struct.MarshalMethodName {
		i64 u0x00000020060005d8, ; name: n_Close_mm_wrapper(IntPtr,IntPtr)
		ptr @.MarshalMethodName.0_name; char* name
	}, ; 0
	%struct.MarshalMethodName {
		i64 u0x00000020060005d9, ; name: n_Read_mm_wrapper(IntPtr,IntPtr)
		ptr @.MarshalMethodName.1_name; char* name
	}, ; 1
	%struct.MarshalMethodName {
		i64 u0x00000020060005da, ; name: n_Read_arrayB_mm_wrapper(IntPtr,IntPtr,IntPtr)
		ptr @.MarshalMethodName.2_name; char* name
	}, ; 2
	%struct.MarshalMethodName {
		i64 u0x00000020060005db, ; name: n_Read_arrayBII_mm_wrapper(IntPtr,IntPtr,IntPtr,Int32,Int32)
		ptr @.MarshalMethodName.3_name; char* name
	}, ; 3
	%struct.MarshalMethodName {
		i64 u0x000000200600075a, ; name: n_Equals_Ljava_lang_Object__mm_wrapper(IntPtr,IntPtr,IntPtr)
		ptr @.MarshalMethodName.4_name; char* name
	}, ; 4
	%struct.MarshalMethodName {
		i64 u0x000000200600075b, ; name: n_GetHashCode_mm_wrapper(IntPtr,IntPtr)
		ptr @.MarshalMethodName.5_name; char* name
	}, ; 5
	%struct.MarshalMethodName {
		i64 u0x000000200600075c, ; name: n_ToString_mm_wrapper(IntPtr,IntPtr)
		ptr @.MarshalMethodName.6_name; char* name
	}, ; 6
	%struct.MarshalMethodName {
		i64 u0x00000020060005f9, ; name: n_Close_mm_wrapper(IntPtr,IntPtr)
		ptr @.MarshalMethodName.0_name; char* name
	}, ; 7
	%struct.MarshalMethodName {
		i64 u0x00000020060005fa, ; name: n_Flush_mm_wrapper(IntPtr,IntPtr)
		ptr @.MarshalMethodName.7_name; char* name
	}, ; 8
	%struct.MarshalMethodName {
		i64 u0x00000020060005fb, ; name: n_Write_arrayB_mm_wrapper(IntPtr,IntPtr,IntPtr)
		ptr @.MarshalMethodName.8_name; char* name
	}, ; 9
	%struct.MarshalMethodName {
		i64 u0x00000020060005fc, ; name: n_Write_arrayBII_mm_wrapper(IntPtr,IntPtr,IntPtr,Int32,Int32)
		ptr @.MarshalMethodName.9_name; char* name
	}, ; 10
	%struct.MarshalMethodName {
		i64 u0x00000020060005fd, ; name: n_Write_I_mm_wrapper(IntPtr,IntPtr,Int32)
		ptr @.MarshalMethodName.10_name; char* name
	}, ; 11
	%struct.MarshalMethodName {
		i64 u0x00000020060007ee, ; name: n_Run_mm_wrapper(IntPtr,IntPtr)
		ptr @.MarshalMethodName.11_name; char* name
	}, ; 12
	%struct.MarshalMethodName {
		i64 u0x0000002006000565, ; name: n_OnCreate_Landroid_os_Bundle__mm_wrapper(IntPtr,IntPtr,IntPtr)
		ptr @.MarshalMethodName.12_name; char* name
	}, ; 13
	%struct.MarshalMethodName {
		i64 u0x0000002006000566, ; name: n_OnRequestPermissionsResult_IarrayLjava_lang_String_arrayI_mm_wrapper(IntPtr,IntPtr,Int32,IntPtr,IntPtr)
		ptr @.MarshalMethodName.13_name; char* name
	}, ; 14
	%struct.MarshalMethodName {
		i64 u0x0000002006000567, ; name: n_OnDestroy_mm_wrapper(IntPtr,IntPtr)
		ptr @.MarshalMethodName.14_name; char* name
	}, ; 15
	%struct.MarshalMethodName {
		i64 u0x0000002006000176, ; name: n_OnImageAvailable_Landroid_media_ImageReader__mm_wrapper(IntPtr,IntPtr,IntPtr)
		ptr @.MarshalMethodName.15_name; char* name
	}, ; 16
	%struct.MarshalMethodName {
		i64 u0x00000020060004d8, ; name: n_OnOpened_Landroid_hardware_camera2_CameraDevice__mm_wrapper(IntPtr,IntPtr,IntPtr)
		ptr @.MarshalMethodName.16_name; char* name
	}, ; 17
	%struct.MarshalMethodName {
		i64 u0x00000020060004d9, ; name: n_OnDisconnected_Landroid_hardware_camera2_CameraDevice__mm_wrapper(IntPtr,IntPtr,IntPtr)
		ptr @.MarshalMethodName.17_name; char* name
	}, ; 18
	%struct.MarshalMethodName {
		i64 u0x00000020060004da, ; name: n_OnError_Landroid_hardware_camera2_CameraDevice_I_mm_wrapper(IntPtr,IntPtr,IntPtr,Int32)
		ptr @.MarshalMethodName.18_name; char* name
	}, ; 19
	%struct.MarshalMethodName {
		i64 u0x00000020060004ad, ; name: n_OnConfigured_Landroid_hardware_camera2_CameraCaptureSession__mm_wrapper(IntPtr,IntPtr,IntPtr)
		ptr @.MarshalMethodName.19_name; char* name
	}, ; 20
	%struct.MarshalMethodName {
		i64 u0x00000020060004ae, ; name: n_OnConfigureFailed_Landroid_hardware_camera2_CameraCaptureSession__mm_wrapper(IntPtr,IntPtr,IntPtr)
		ptr @.MarshalMethodName.20_name; char* name
	}, ; 21
	%struct.MarshalMethodName {
		i64 u0x0000002006000477, ; name: n_OnAccuracyChanged_Landroid_hardware_Sensor_I_mm_wrapper(IntPtr,IntPtr,IntPtr,Int32)
		ptr @.MarshalMethodName.21_name; char* name
	}, ; 22
	%struct.MarshalMethodName {
		i64 u0x0000002006000478, ; name: n_OnSensorChanged_Landroid_hardware_SensorEvent__mm_wrapper(IntPtr,IntPtr,IntPtr)
		ptr @.MarshalMethodName.22_name; char* name
	}, ; 23
	%struct.MarshalMethodName {
		i64 u0x0000002006000896, ; name: n_Activate_mm(IntPtr,IntPtr,IntPtr,IntPtr,IntPtr,IntPtr)
		ptr @.MarshalMethodName.23_name; char* name
	}, ; 24
	%struct.MarshalMethodName {
		i64 u0x0000000000000000, ; name: 
		ptr @.MarshalMethodName.24_name; char* name
	} ; 25
], align 16

; get_function_pointer (uint32_t mono_image_index, uint32_t class_index, uint32_t method_token, void*& target_ptr)
@get_function_pointer = internal dso_local unnamed_addr global ptr null, align 8

; Marshal methods backing fields, pointers to native functions
@native_cb_close_0_0_60005d8 = internal dso_local unnamed_addr global ptr null, align 8
@native_cb_read_0_0_60005d9 = internal dso_local unnamed_addr global ptr null, align 8
@native_cb_read_0_0_60005da = internal dso_local unnamed_addr global ptr null, align 8
@native_cb_read_0_0_60005db = internal dso_local unnamed_addr global ptr null, align 8
@native_cb_equals_0_1_600075a = internal dso_local unnamed_addr global ptr null, align 8
@native_cb_hashCode_0_1_600075b = internal dso_local unnamed_addr global ptr null, align 8
@native_cb_toString_0_1_600075c = internal dso_local unnamed_addr global ptr null, align 8
@native_cb_close_0_2_60005f9 = internal dso_local unnamed_addr global ptr null, align 8
@native_cb_flush_0_2_60005fa = internal dso_local unnamed_addr global ptr null, align 8
@native_cb_write_0_2_60005fb = internal dso_local unnamed_addr global ptr null, align 8
@native_cb_write_0_2_60005fc = internal dso_local unnamed_addr global ptr null, align 8
@native_cb_write_0_2_60005fd = internal dso_local unnamed_addr global ptr null, align 8
@native_cb_run_0_3_60007ee = internal dso_local unnamed_addr global ptr null, align 8
@native_cb_onCreate_0_4_6000565 = internal dso_local unnamed_addr global ptr null, align 8
@native_cb_onRequestPermissionsResult_0_4_6000566 = internal dso_local unnamed_addr global ptr null, align 8
@native_cb_onDestroy_0_4_6000567 = internal dso_local unnamed_addr global ptr null, align 8
@native_cb_onImageAvailable_0_5_6000176 = internal dso_local unnamed_addr global ptr null, align 8
@native_cb_onOpened_0_6_60004d8 = internal dso_local unnamed_addr global ptr null, align 8
@native_cb_onDisconnected_0_6_60004d9 = internal dso_local unnamed_addr global ptr null, align 8
@native_cb_onError_0_6_60004da = internal dso_local unnamed_addr global ptr null, align 8
@native_cb_onConfigured_0_7_60004ad = internal dso_local unnamed_addr global ptr null, align 8
@native_cb_onConfigureFailed_0_7_60004ae = internal dso_local unnamed_addr global ptr null, align 8
@native_cb_onAccuracyChanged_0_8_6000477 = internal dso_local unnamed_addr global ptr null, align 8
@native_cb_onSensorChanged_0_8_6000478 = internal dso_local unnamed_addr global ptr null, align 8
@native_cb_activate_0_9_6000896 = internal dso_local unnamed_addr global ptr null, align 8

; Functions

; Function attributes: memory(write, argmem: none, inaccessiblemem: none) "min-legal-vector-width"="0" mustprogress "no-trapping-math"="true" nofree norecurse nosync nounwind "stack-protector-buffer-size"="8" uwtable willreturn
define void @xamarin_app_init(ptr nocapture noundef readnone %env, ptr noundef %fn) local_unnamed_addr #0
{
	%fnIsNull = icmp eq ptr %fn, null
	br i1 %fnIsNull, label %1, label %2

1: ; preds = %0
	%putsResult = call noundef i32 @puts(ptr @.mm.10)
	call void @abort()
	unreachable 

2: ; preds = %1, %0
	store ptr %fn, ptr @get_function_pointer, align 8, !tbaa !3
	ret void
}

; Method: System.Void Java.IO.InputStream::n_Close_mm_wrapper(System.IntPtr,System.IntPtr)
; Assembly: Mono.Android, Version=0.0.0.0, Culture=neutral, PublicKeyToken=84e04ff9cfb79065
; Registered: System.Void Java.IO.InputStream::Close()
; Implemented: System.Void Android.Runtime.InputStreamAdapter::Close()
;
; Function attributes: "min-legal-vector-width"="0" mustprogress "no-trapping-math"="true" "stack-protector-buffer-size"="8" uwtable
define void @Java_mono_android_runtime_InputStreamAdapter_n_1close(ptr noundef %env, ptr noundef %klass) local_unnamed_addr #3
{
	%cb1 = load ptr, ptr @native_cb_close_0_0_60005d8, align 8, !tbaa !3
	%isNull = icmp eq ptr %cb1, null
	br i1 %isNull, label %loadCallback, label %callbackLoaded

loadCallback: ; preds = %0
	%get_func_ptr = load ptr, ptr @get_function_pointer, align 8, !tbaa !3
	call void %get_func_ptr(i32 noundef 32, i32 noundef 0, i32 noundef 100664792, ptr nonnull noundef align(8) dereferenceable(8) @native_cb_close_0_0_60005d8)
	%cb2 = load ptr, ptr @native_cb_close_0_0_60005d8, align 8, !tbaa !3
	br label %callbackLoaded

callbackLoaded: ; preds = %loadCallback, %0
	%fn = phi ptr
		 [%cb2, %loadCallback],
		 [%cb1, %0]
	tail call void %fn(ptr noundef %env, ptr noundef %klass)
	ret void
}

; Method: System.Int32 Java.IO.InputStream::n_Read_mm_wrapper(System.IntPtr,System.IntPtr)
; Assembly: Mono.Android, Version=0.0.0.0, Culture=neutral, PublicKeyToken=84e04ff9cfb79065
; Registered: System.Int32 Java.IO.InputStream::Read()
; Implemented: System.Int32 Android.Runtime.InputStreamAdapter::Read()
;
; Function attributes: "min-legal-vector-width"="0" mustprogress "no-trapping-math"="true" "stack-protector-buffer-size"="8" uwtable
define i32 @Java_mono_android_runtime_InputStreamAdapter_n_1read__(ptr noundef %env, ptr noundef %klass) local_unnamed_addr #3
{
	%cb1 = load ptr, ptr @native_cb_read_0_0_60005d9, align 8, !tbaa !3
	%isNull = icmp eq ptr %cb1, null
	br i1 %isNull, label %loadCallback, label %callbackLoaded

loadCallback: ; preds = %0
	%get_func_ptr = load ptr, ptr @get_function_pointer, align 8, !tbaa !3
	call void %get_func_ptr(i32 noundef 32, i32 noundef 0, i32 noundef 100664793, ptr nonnull noundef align(8) dereferenceable(8) @native_cb_read_0_0_60005d9)
	%cb2 = load ptr, ptr @native_cb_read_0_0_60005d9, align 8, !tbaa !3
	br label %callbackLoaded

callbackLoaded: ; preds = %loadCallback, %0
	%fn = phi ptr
		 [%cb2, %loadCallback],
		 [%cb1, %0]
	%1 = tail call noundef i32 %fn(ptr noundef %env, ptr noundef %klass)
	ret i32 %1
}

; Method: System.Int32 Java.IO.InputStream::n_Read_arrayB_mm_wrapper(System.IntPtr,System.IntPtr,System.IntPtr)
; Assembly: Mono.Android, Version=0.0.0.0, Culture=neutral, PublicKeyToken=84e04ff9cfb79065
; Registered: System.Int32 Java.IO.InputStream::Read(System.Byte[])
; Implemented: System.Int32 Android.Runtime.InputStreamAdapter::Read(System.Byte[])
;
; Function attributes: "min-legal-vector-width"="0" mustprogress "no-trapping-math"="true" "stack-protector-buffer-size"="8" uwtable
define i32 @Java_mono_android_runtime_InputStreamAdapter_n_1read___3B(ptr noundef %env, ptr noundef %klass, ptr noundef %bytes) local_unnamed_addr #3
{
	%cb1 = load ptr, ptr @native_cb_read_0_0_60005da, align 8, !tbaa !3
	%isNull = icmp eq ptr %cb1, null
	br i1 %isNull, label %loadCallback, label %callbackLoaded

loadCallback: ; preds = %0
	%get_func_ptr = load ptr, ptr @get_function_pointer, align 8, !tbaa !3
	call void %get_func_ptr(i32 noundef 32, i32 noundef 0, i32 noundef 100664794, ptr nonnull noundef align(8) dereferenceable(8) @native_cb_read_0_0_60005da)
	%cb2 = load ptr, ptr @native_cb_read_0_0_60005da, align 8, !tbaa !3
	br label %callbackLoaded

callbackLoaded: ; preds = %loadCallback, %0
	%fn = phi ptr
		 [%cb2, %loadCallback],
		 [%cb1, %0]
	%1 = tail call noundef i32 %fn(ptr noundef %env, ptr noundef %klass, ptr noundef %bytes)
	ret i32 %1
}

; Method: System.Int32 Java.IO.InputStream::n_Read_arrayBII_mm_wrapper(System.IntPtr,System.IntPtr,System.IntPtr,System.Int32,System.Int32)
; Assembly: Mono.Android, Version=0.0.0.0, Culture=neutral, PublicKeyToken=84e04ff9cfb79065
; Registered: System.Int32 Java.IO.InputStream::Read(System.Byte[],System.Int32,System.Int32)
; Implemented: System.Int32 Android.Runtime.InputStreamAdapter::Read(System.Byte[],System.Int32,System.Int32)
;
; Function attributes: "min-legal-vector-width"="0" mustprogress "no-trapping-math"="true" "stack-protector-buffer-size"="8" uwtable
define i32 @Java_mono_android_runtime_InputStreamAdapter_n_1read___3BII(ptr noundef %env, ptr noundef %klass, ptr noundef %bytes, i32 noundef %offset, i32 noundef %length) local_unnamed_addr #3
{
	%cb1 = load ptr, ptr @native_cb_read_0_0_60005db, align 8, !tbaa !3
	%isNull = icmp eq ptr %cb1, null
	br i1 %isNull, label %loadCallback, label %callbackLoaded

loadCallback: ; preds = %0
	%get_func_ptr = load ptr, ptr @get_function_pointer, align 8, !tbaa !3
	call void %get_func_ptr(i32 noundef 32, i32 noundef 0, i32 noundef 100664795, ptr nonnull noundef align(8) dereferenceable(8) @native_cb_read_0_0_60005db)
	%cb2 = load ptr, ptr @native_cb_read_0_0_60005db, align 8, !tbaa !3
	br label %callbackLoaded

callbackLoaded: ; preds = %loadCallback, %0
	%fn = phi ptr
		 [%cb2, %loadCallback],
		 [%cb1, %0]
	%1 = tail call noundef i32 %fn(ptr noundef %env, ptr noundef %klass, ptr noundef %bytes, i32 noundef %offset, i32 noundef %length)
	ret i32 %1
}

; Method: System.SByte Java.Lang.Object::n_Equals_Ljava_lang_Object__mm_wrapper(System.IntPtr,System.IntPtr,System.IntPtr)
; Assembly: Mono.Android, Version=0.0.0.0, Culture=neutral, PublicKeyToken=84e04ff9cfb79065
; Registered: System.Boolean Java.Lang.Object::Equals(Java.Lang.Object)
; Implemented: System.Boolean Android.Runtime.JavaObject::Equals(Java.Lang.Object)
;
; Function attributes: "min-legal-vector-width"="0" mustprogress "no-trapping-math"="true" "stack-protector-buffer-size"="8" uwtable
define i1 @Java_mono_android_runtime_JavaObject_n_1equals(ptr noundef %env, ptr noundef %klass, ptr noundef %0) local_unnamed_addr #3
{
	%cb1 = load ptr, ptr @native_cb_equals_0_1_600075a, align 8, !tbaa !3
	%isNull = icmp eq ptr %cb1, null
	br i1 %isNull, label %loadCallback, label %callbackLoaded

loadCallback: ; preds = %1
	%get_func_ptr = load ptr, ptr @get_function_pointer, align 8, !tbaa !3
	call void %get_func_ptr(i32 noundef 32, i32 noundef 1, i32 noundef 100665178, ptr nonnull noundef align(8) dereferenceable(8) @native_cb_equals_0_1_600075a)
	%cb2 = load ptr, ptr @native_cb_equals_0_1_600075a, align 8, !tbaa !3
	br label %callbackLoaded

callbackLoaded: ; preds = %loadCallback, %1
	%fn = phi ptr
		 [%cb2, %loadCallback],
		 [%cb1, %1]
	%2 = tail call noundef i1 %fn(ptr noundef %env, ptr noundef %klass, ptr noundef %0)
	ret i1 %2
}

; Method: System.Int32 Java.Lang.Object::n_GetHashCode_mm_wrapper(System.IntPtr,System.IntPtr)
; Assembly: Mono.Android, Version=0.0.0.0, Culture=neutral, PublicKeyToken=84e04ff9cfb79065
; Registered: System.Int32 Java.Lang.Object::GetHashCode()
; Implemented: System.Int32 Android.Runtime.JavaObject::GetHashCode()
;
; Function attributes: "min-legal-vector-width"="0" mustprogress "no-trapping-math"="true" "stack-protector-buffer-size"="8" uwtable
define i32 @Java_mono_android_runtime_JavaObject_n_1hashCode(ptr noundef %env, ptr noundef %klass) local_unnamed_addr #3
{
	%cb1 = load ptr, ptr @native_cb_hashCode_0_1_600075b, align 8, !tbaa !3
	%isNull = icmp eq ptr %cb1, null
	br i1 %isNull, label %loadCallback, label %callbackLoaded

loadCallback: ; preds = %0
	%get_func_ptr = load ptr, ptr @get_function_pointer, align 8, !tbaa !3
	call void %get_func_ptr(i32 noundef 32, i32 noundef 1, i32 noundef 100665179, ptr nonnull noundef align(8) dereferenceable(8) @native_cb_hashCode_0_1_600075b)
	%cb2 = load ptr, ptr @native_cb_hashCode_0_1_600075b, align 8, !tbaa !3
	br label %callbackLoaded

callbackLoaded: ; preds = %loadCallback, %0
	%fn = phi ptr
		 [%cb2, %loadCallback],
		 [%cb1, %0]
	%1 = tail call noundef i32 %fn(ptr noundef %env, ptr noundef %klass)
	ret i32 %1
}

; Method: System.IntPtr Java.Lang.Object::n_ToString_mm_wrapper(System.IntPtr,System.IntPtr)
; Assembly: Mono.Android, Version=0.0.0.0, Culture=neutral, PublicKeyToken=84e04ff9cfb79065
; Registered: System.String Java.Lang.Object::ToString()
; Implemented: System.String Android.Runtime.JavaObject::ToString()
;
; Function attributes: "min-legal-vector-width"="0" mustprogress "no-trapping-math"="true" "stack-protector-buffer-size"="8" uwtable
define ptr @Java_mono_android_runtime_JavaObject_n_1toString(ptr noundef %env, ptr noundef %klass) local_unnamed_addr #3
{
	%cb1 = load ptr, ptr @native_cb_toString_0_1_600075c, align 8, !tbaa !3
	%isNull = icmp eq ptr %cb1, null
	br i1 %isNull, label %loadCallback, label %callbackLoaded

loadCallback: ; preds = %0
	%get_func_ptr = load ptr, ptr @get_function_pointer, align 8, !tbaa !3
	call void %get_func_ptr(i32 noundef 32, i32 noundef 1, i32 noundef 100665180, ptr nonnull noundef align(8) dereferenceable(8) @native_cb_toString_0_1_600075c)
	%cb2 = load ptr, ptr @native_cb_toString_0_1_600075c, align 8, !tbaa !3
	br label %callbackLoaded

callbackLoaded: ; preds = %loadCallback, %0
	%fn = phi ptr
		 [%cb2, %loadCallback],
		 [%cb1, %0]
	%1 = tail call noundef ptr %fn(ptr noundef %env, ptr noundef %klass)
	ret ptr %1
}

; Method: System.Void Java.IO.OutputStream::n_Close_mm_wrapper(System.IntPtr,System.IntPtr)
; Assembly: Mono.Android, Version=0.0.0.0, Culture=neutral, PublicKeyToken=84e04ff9cfb79065
; Registered: System.Void Java.IO.OutputStream::Close()
; Implemented: System.Void Android.Runtime.OutputStreamAdapter::Close()
;
; Function attributes: "min-legal-vector-width"="0" mustprogress "no-trapping-math"="true" "stack-protector-buffer-size"="8" uwtable
define void @Java_mono_android_runtime_OutputStreamAdapter_n_1close(ptr noundef %env, ptr noundef %klass) local_unnamed_addr #3
{
	%cb1 = load ptr, ptr @native_cb_close_0_2_60005f9, align 8, !tbaa !3
	%isNull = icmp eq ptr %cb1, null
	br i1 %isNull, label %loadCallback, label %callbackLoaded

loadCallback: ; preds = %0
	%get_func_ptr = load ptr, ptr @get_function_pointer, align 8, !tbaa !3
	call void %get_func_ptr(i32 noundef 32, i32 noundef 2, i32 noundef 100664825, ptr nonnull noundef align(8) dereferenceable(8) @native_cb_close_0_2_60005f9)
	%cb2 = load ptr, ptr @native_cb_close_0_2_60005f9, align 8, !tbaa !3
	br label %callbackLoaded

callbackLoaded: ; preds = %loadCallback, %0
	%fn = phi ptr
		 [%cb2, %loadCallback],
		 [%cb1, %0]
	tail call void %fn(ptr noundef %env, ptr noundef %klass)
	ret void
}

; Method: System.Void Java.IO.OutputStream::n_Flush_mm_wrapper(System.IntPtr,System.IntPtr)
; Assembly: Mono.Android, Version=0.0.0.0, Culture=neutral, PublicKeyToken=84e04ff9cfb79065
; Registered: System.Void Java.IO.OutputStream::Flush()
; Implemented: System.Void Android.Runtime.OutputStreamAdapter::Flush()
;
; Function attributes: "min-legal-vector-width"="0" mustprogress "no-trapping-math"="true" "stack-protector-buffer-size"="8" uwtable
define void @Java_mono_android_runtime_OutputStreamAdapter_n_1flush(ptr noundef %env, ptr noundef %klass) local_unnamed_addr #3
{
	%cb1 = load ptr, ptr @native_cb_flush_0_2_60005fa, align 8, !tbaa !3
	%isNull = icmp eq ptr %cb1, null
	br i1 %isNull, label %loadCallback, label %callbackLoaded

loadCallback: ; preds = %0
	%get_func_ptr = load ptr, ptr @get_function_pointer, align 8, !tbaa !3
	call void %get_func_ptr(i32 noundef 32, i32 noundef 2, i32 noundef 100664826, ptr nonnull noundef align(8) dereferenceable(8) @native_cb_flush_0_2_60005fa)
	%cb2 = load ptr, ptr @native_cb_flush_0_2_60005fa, align 8, !tbaa !3
	br label %callbackLoaded

callbackLoaded: ; preds = %loadCallback, %0
	%fn = phi ptr
		 [%cb2, %loadCallback],
		 [%cb1, %0]
	tail call void %fn(ptr noundef %env, ptr noundef %klass)
	ret void
}

; Method: System.Void Java.IO.OutputStream::n_Write_arrayB_mm_wrapper(System.IntPtr,System.IntPtr,System.IntPtr)
; Assembly: Mono.Android, Version=0.0.0.0, Culture=neutral, PublicKeyToken=84e04ff9cfb79065
; Registered: System.Void Java.IO.OutputStream::Write(System.Byte[])
; Implemented: System.Void Android.Runtime.OutputStreamAdapter::Write(System.Byte[])
;
; Function attributes: "min-legal-vector-width"="0" mustprogress "no-trapping-math"="true" "stack-protector-buffer-size"="8" uwtable
define void @Java_mono_android_runtime_OutputStreamAdapter_n_1write___3B(ptr noundef %env, ptr noundef %klass, ptr noundef %buffer) local_unnamed_addr #3
{
	%cb1 = load ptr, ptr @native_cb_write_0_2_60005fb, align 8, !tbaa !3
	%isNull = icmp eq ptr %cb1, null
	br i1 %isNull, label %loadCallback, label %callbackLoaded

loadCallback: ; preds = %0
	%get_func_ptr = load ptr, ptr @get_function_pointer, align 8, !tbaa !3
	call void %get_func_ptr(i32 noundef 32, i32 noundef 2, i32 noundef 100664827, ptr nonnull noundef align(8) dereferenceable(8) @native_cb_write_0_2_60005fb)
	%cb2 = load ptr, ptr @native_cb_write_0_2_60005fb, align 8, !tbaa !3
	br label %callbackLoaded

callbackLoaded: ; preds = %loadCallback, %0
	%fn = phi ptr
		 [%cb2, %loadCallback],
		 [%cb1, %0]
	tail call void %fn(ptr noundef %env, ptr noundef %klass, ptr noundef %buffer)
	ret void
}

; Method: System.Void Java.IO.OutputStream::n_Write_arrayBII_mm_wrapper(System.IntPtr,System.IntPtr,System.IntPtr,System.Int32,System.Int32)
; Assembly: Mono.Android, Version=0.0.0.0, Culture=neutral, PublicKeyToken=84e04ff9cfb79065
; Registered: System.Void Java.IO.OutputStream::Write(System.Byte[],System.Int32,System.Int32)
; Implemented: System.Void Android.Runtime.OutputStreamAdapter::Write(System.Byte[],System.Int32,System.Int32)
;
; Function attributes: "min-legal-vector-width"="0" mustprogress "no-trapping-math"="true" "stack-protector-buffer-size"="8" uwtable
define void @Java_mono_android_runtime_OutputStreamAdapter_n_1write___3BII(ptr noundef %env, ptr noundef %klass, ptr noundef %buffer, i32 noundef %offset, i32 noundef %length) local_unnamed_addr #3
{
	%cb1 = load ptr, ptr @native_cb_write_0_2_60005fc, align 8, !tbaa !3
	%isNull = icmp eq ptr %cb1, null
	br i1 %isNull, label %loadCallback, label %callbackLoaded

loadCallback: ; preds = %0
	%get_func_ptr = load ptr, ptr @get_function_pointer, align 8, !tbaa !3
	call void %get_func_ptr(i32 noundef 32, i32 noundef 2, i32 noundef 100664828, ptr nonnull noundef align(8) dereferenceable(8) @native_cb_write_0_2_60005fc)
	%cb2 = load ptr, ptr @native_cb_write_0_2_60005fc, align 8, !tbaa !3
	br label %callbackLoaded

callbackLoaded: ; preds = %loadCallback, %0
	%fn = phi ptr
		 [%cb2, %loadCallback],
		 [%cb1, %0]
	tail call void %fn(ptr noundef %env, ptr noundef %klass, ptr noundef %buffer, i32 noundef %offset, i32 noundef %length)
	ret void
}

; Method: System.Void Java.IO.OutputStream::n_Write_I_mm_wrapper(System.IntPtr,System.IntPtr,System.Int32)
; Assembly: Mono.Android, Version=0.0.0.0, Culture=neutral, PublicKeyToken=84e04ff9cfb79065
; Registered: System.Void Java.IO.OutputStream::Write(System.Int32)
; Implemented: System.Void Android.Runtime.OutputStreamAdapter::Write(System.Int32)
;
; Function attributes: "min-legal-vector-width"="0" mustprogress "no-trapping-math"="true" "stack-protector-buffer-size"="8" uwtable
define void @Java_mono_android_runtime_OutputStreamAdapter_n_1write__I(ptr noundef %env, ptr noundef %klass, i32 noundef %oneByte) local_unnamed_addr #3
{
	%cb1 = load ptr, ptr @native_cb_write_0_2_60005fd, align 8, !tbaa !3
	%isNull = icmp eq ptr %cb1, null
	br i1 %isNull, label %loadCallback, label %callbackLoaded

loadCallback: ; preds = %0
	%get_func_ptr = load ptr, ptr @get_function_pointer, align 8, !tbaa !3
	call void %get_func_ptr(i32 noundef 32, i32 noundef 2, i32 noundef 100664829, ptr nonnull noundef align(8) dereferenceable(8) @native_cb_write_0_2_60005fd)
	%cb2 = load ptr, ptr @native_cb_write_0_2_60005fd, align 8, !tbaa !3
	br label %callbackLoaded

callbackLoaded: ; preds = %loadCallback, %0
	%fn = phi ptr
		 [%cb2, %loadCallback],
		 [%cb1, %0]
	tail call void %fn(ptr noundef %env, ptr noundef %klass, i32 noundef %oneByte)
	ret void
}

; Method: System.Void Java.Lang.IRunnableInvoker::n_Run_mm_wrapper(System.IntPtr,System.IntPtr)
; Assembly: Mono.Android, Version=0.0.0.0, Culture=neutral, PublicKeyToken=84e04ff9cfb79065
; Registered: System.Void Java.Lang.IRunnable::Run()
; Implemented: System.Void Java.Lang.IRunnable::Run()
;
; Function attributes: "min-legal-vector-width"="0" mustprogress "no-trapping-math"="true" "stack-protector-buffer-size"="8" uwtable
define void @Java_mono_java_lang_RunnableImplementor_n_1run(ptr noundef %env, ptr noundef %klass) local_unnamed_addr #3
{
	%cb1 = load ptr, ptr @native_cb_run_0_3_60007ee, align 8, !tbaa !3
	%isNull = icmp eq ptr %cb1, null
	br i1 %isNull, label %loadCallback, label %callbackLoaded

loadCallback: ; preds = %0
	%get_func_ptr = load ptr, ptr @get_function_pointer, align 8, !tbaa !3
	call void %get_func_ptr(i32 noundef 32, i32 noundef 3, i32 noundef 100665326, ptr nonnull noundef align(8) dereferenceable(8) @native_cb_run_0_3_60007ee)
	%cb2 = load ptr, ptr @native_cb_run_0_3_60007ee, align 8, !tbaa !3
	br label %callbackLoaded

callbackLoaded: ; preds = %loadCallback, %0
	%fn = phi ptr
		 [%cb2, %loadCallback],
		 [%cb1, %0]
	tail call void %fn(ptr noundef %env, ptr noundef %klass)
	ret void
}

; Method: System.Void Android.App.Activity::n_OnCreate_Landroid_os_Bundle__mm_wrapper(System.IntPtr,System.IntPtr,System.IntPtr)
; Assembly: Mono.Android, Version=0.0.0.0, Culture=neutral, PublicKeyToken=84e04ff9cfb79065
; Registered: System.Void Android.App.Activity::OnCreate(Android.OS.Bundle)
; Implemented: System.Void maui.MainActivity::OnCreate(Android.OS.Bundle)
;
; Function attributes: "min-legal-vector-width"="0" mustprogress "no-trapping-math"="true" "stack-protector-buffer-size"="8" uwtable
define void @Java_crc64ebab215de862fb6d_MainActivity_n_1onCreate(ptr noundef %env, ptr noundef %klass, ptr noundef %savedInstanceState) local_unnamed_addr #3
{
	%cb1 = load ptr, ptr @native_cb_onCreate_0_4_6000565, align 8, !tbaa !3
	%isNull = icmp eq ptr %cb1, null
	br i1 %isNull, label %loadCallback, label %callbackLoaded

loadCallback: ; preds = %0
	%get_func_ptr = load ptr, ptr @get_function_pointer, align 8, !tbaa !3
	call void %get_func_ptr(i32 noundef 32, i32 noundef 4, i32 noundef 100664677, ptr nonnull noundef align(8) dereferenceable(8) @native_cb_onCreate_0_4_6000565)
	%cb2 = load ptr, ptr @native_cb_onCreate_0_4_6000565, align 8, !tbaa !3
	br label %callbackLoaded

callbackLoaded: ; preds = %loadCallback, %0
	%fn = phi ptr
		 [%cb2, %loadCallback],
		 [%cb1, %0]
	tail call void %fn(ptr noundef %env, ptr noundef %klass, ptr noundef %savedInstanceState)
	ret void
}

; Method: System.Void Android.App.Activity::n_OnRequestPermissionsResult_IarrayLjava_lang_String_arrayI_mm_wrapper(System.IntPtr,System.IntPtr,System.Int32,System.IntPtr,System.IntPtr)
; Assembly: Mono.Android, Version=0.0.0.0, Culture=neutral, PublicKeyToken=84e04ff9cfb79065
; Registered: System.Void Android.App.Activity::OnRequestPermissionsResult(System.Int32,System.String[],Android.Content.PM.Permission[])
; Implemented: System.Void maui.MainActivity::OnRequestPermissionsResult(System.Int32,System.String[],Android.Content.PM.Permission[])
;
; Function attributes: "min-legal-vector-width"="0" mustprogress "no-trapping-math"="true" "stack-protector-buffer-size"="8" uwtable
define void @Java_crc64ebab215de862fb6d_MainActivity_n_1onRequestPermissionsResult(ptr noundef %env, ptr noundef %klass, i32 noundef %requestCode, ptr noundef %permissions, ptr noundef %grantResults) local_unnamed_addr #3
{
	%cb1 = load ptr, ptr @native_cb_onRequestPermissionsResult_0_4_6000566, align 8, !tbaa !3
	%isNull = icmp eq ptr %cb1, null
	br i1 %isNull, label %loadCallback, label %callbackLoaded

loadCallback: ; preds = %0
	%get_func_ptr = load ptr, ptr @get_function_pointer, align 8, !tbaa !3
	call void %get_func_ptr(i32 noundef 32, i32 noundef 4, i32 noundef 100664678, ptr nonnull noundef align(8) dereferenceable(8) @native_cb_onRequestPermissionsResult_0_4_6000566)
	%cb2 = load ptr, ptr @native_cb_onRequestPermissionsResult_0_4_6000566, align 8, !tbaa !3
	br label %callbackLoaded

callbackLoaded: ; preds = %loadCallback, %0
	%fn = phi ptr
		 [%cb2, %loadCallback],
		 [%cb1, %0]
	tail call void %fn(ptr noundef %env, ptr noundef %klass, i32 noundef %requestCode, ptr noundef %permissions, ptr noundef %grantResults)
	ret void
}

; Method: System.Void Android.App.Activity::n_OnDestroy_mm_wrapper(System.IntPtr,System.IntPtr)
; Assembly: Mono.Android, Version=0.0.0.0, Culture=neutral, PublicKeyToken=84e04ff9cfb79065
; Registered: System.Void Android.App.Activity::OnDestroy()
; Implemented: System.Void maui.MainActivity::OnDestroy()
;
; Function attributes: "min-legal-vector-width"="0" mustprogress "no-trapping-math"="true" "stack-protector-buffer-size"="8" uwtable
define void @Java_crc64ebab215de862fb6d_MainActivity_n_1onDestroy(ptr noundef %env, ptr noundef %klass) local_unnamed_addr #3
{
	%cb1 = load ptr, ptr @native_cb_onDestroy_0_4_6000567, align 8, !tbaa !3
	%isNull = icmp eq ptr %cb1, null
	br i1 %isNull, label %loadCallback, label %callbackLoaded

loadCallback: ; preds = %0
	%get_func_ptr = load ptr, ptr @get_function_pointer, align 8, !tbaa !3
	call void %get_func_ptr(i32 noundef 32, i32 noundef 4, i32 noundef 100664679, ptr nonnull noundef align(8) dereferenceable(8) @native_cb_onDestroy_0_4_6000567)
	%cb2 = load ptr, ptr @native_cb_onDestroy_0_4_6000567, align 8, !tbaa !3
	br label %callbackLoaded

callbackLoaded: ; preds = %loadCallback, %0
	%fn = phi ptr
		 [%cb2, %loadCallback],
		 [%cb1, %0]
	tail call void %fn(ptr noundef %env, ptr noundef %klass)
	ret void
}

; Method: System.Void Android.Media.ImageReader/IOnImageAvailableListenerInvoker::n_OnImageAvailable_Landroid_media_ImageReader__mm_wrapper(System.IntPtr,System.IntPtr,System.IntPtr)
; Assembly: Mono.Android, Version=0.0.0.0, Culture=neutral, PublicKeyToken=84e04ff9cfb79065
; Registered: System.Void Android.Media.ImageReader/IOnImageAvailableListener::OnImageAvailable(Android.Media.ImageReader)
; Implemented: System.Void Android.Media.ImageReader/IOnImageAvailableListener::OnImageAvailable(Android.Media.ImageReader)
;
; Function attributes: "min-legal-vector-width"="0" mustprogress "no-trapping-math"="true" "stack-protector-buffer-size"="8" uwtable
define void @Java_crc642bf9dc2dd4ff72c8_CameraService_1ImageListener_n_1onImageAvailable(ptr noundef %env, ptr noundef %klass, ptr noundef %0) local_unnamed_addr #3
{
	%cb1 = load ptr, ptr @native_cb_onImageAvailable_0_5_6000176, align 8, !tbaa !3
	%isNull = icmp eq ptr %cb1, null
	br i1 %isNull, label %loadCallback, label %callbackLoaded

loadCallback: ; preds = %1
	%get_func_ptr = load ptr, ptr @get_function_pointer, align 8, !tbaa !3
	call void %get_func_ptr(i32 noundef 32, i32 noundef 5, i32 noundef 100663670, ptr nonnull noundef align(8) dereferenceable(8) @native_cb_onImageAvailable_0_5_6000176)
	%cb2 = load ptr, ptr @native_cb_onImageAvailable_0_5_6000176, align 8, !tbaa !3
	br label %callbackLoaded

callbackLoaded: ; preds = %loadCallback, %1
	%fn = phi ptr
		 [%cb2, %loadCallback],
		 [%cb1, %1]
	tail call void %fn(ptr noundef %env, ptr noundef %klass, ptr noundef %0)
	ret void
}

; Method: System.Void Android.Hardware.Camera2.CameraDevice/StateCallback::n_OnOpened_Landroid_hardware_camera2_CameraDevice__mm_wrapper(System.IntPtr,System.IntPtr,System.IntPtr)
; Assembly: Mono.Android, Version=0.0.0.0, Culture=neutral, PublicKeyToken=84e04ff9cfb79065
; Registered: System.Void Android.Hardware.Camera2.CameraDevice/StateCallback::OnOpened(Android.Hardware.Camera2.CameraDevice)
; Implemented: System.Void maui.Services.CameraService/CameraStateCallback::OnOpened(Android.Hardware.Camera2.CameraDevice)
;
; Function attributes: "min-legal-vector-width"="0" mustprogress "no-trapping-math"="true" "stack-protector-buffer-size"="8" uwtable
define void @Java_crc642bf9dc2dd4ff72c8_CameraService_1CameraStateCallback_n_1onOpened(ptr noundef %env, ptr noundef %klass, ptr noundef %camera) local_unnamed_addr #3
{
	%cb1 = load ptr, ptr @native_cb_onOpened_0_6_60004d8, align 8, !tbaa !3
	%isNull = icmp eq ptr %cb1, null
	br i1 %isNull, label %loadCallback, label %callbackLoaded

loadCallback: ; preds = %0
	%get_func_ptr = load ptr, ptr @get_function_pointer, align 8, !tbaa !3
	call void %get_func_ptr(i32 noundef 32, i32 noundef 6, i32 noundef 100664536, ptr nonnull noundef align(8) dereferenceable(8) @native_cb_onOpened_0_6_60004d8)
	%cb2 = load ptr, ptr @native_cb_onOpened_0_6_60004d8, align 8, !tbaa !3
	br label %callbackLoaded

callbackLoaded: ; preds = %loadCallback, %0
	%fn = phi ptr
		 [%cb2, %loadCallback],
		 [%cb1, %0]
	tail call void %fn(ptr noundef %env, ptr noundef %klass, ptr noundef %camera)
	ret void
}

; Method: System.Void Android.Hardware.Camera2.CameraDevice/StateCallback::n_OnDisconnected_Landroid_hardware_camera2_CameraDevice__mm_wrapper(System.IntPtr,System.IntPtr,System.IntPtr)
; Assembly: Mono.Android, Version=0.0.0.0, Culture=neutral, PublicKeyToken=84e04ff9cfb79065
; Registered: System.Void Android.Hardware.Camera2.CameraDevice/StateCallback::OnDisconnected(Android.Hardware.Camera2.CameraDevice)
; Implemented: System.Void maui.Services.CameraService/CameraStateCallback::OnDisconnected(Android.Hardware.Camera2.CameraDevice)
;
; Function attributes: "min-legal-vector-width"="0" mustprogress "no-trapping-math"="true" "stack-protector-buffer-size"="8" uwtable
define void @Java_crc642bf9dc2dd4ff72c8_CameraService_1CameraStateCallback_n_1onDisconnected(ptr noundef %env, ptr noundef %klass, ptr noundef %camera) local_unnamed_addr #3
{
	%cb1 = load ptr, ptr @native_cb_onDisconnected_0_6_60004d9, align 8, !tbaa !3
	%isNull = icmp eq ptr %cb1, null
	br i1 %isNull, label %loadCallback, label %callbackLoaded

loadCallback: ; preds = %0
	%get_func_ptr = load ptr, ptr @get_function_pointer, align 8, !tbaa !3
	call void %get_func_ptr(i32 noundef 32, i32 noundef 6, i32 noundef 100664537, ptr nonnull noundef align(8) dereferenceable(8) @native_cb_onDisconnected_0_6_60004d9)
	%cb2 = load ptr, ptr @native_cb_onDisconnected_0_6_60004d9, align 8, !tbaa !3
	br label %callbackLoaded

callbackLoaded: ; preds = %loadCallback, %0
	%fn = phi ptr
		 [%cb2, %loadCallback],
		 [%cb1, %0]
	tail call void %fn(ptr noundef %env, ptr noundef %klass, ptr noundef %camera)
	ret void
}

; Method: System.Void Android.Hardware.Camera2.CameraDevice/StateCallback::n_OnError_Landroid_hardware_camera2_CameraDevice_I_mm_wrapper(System.IntPtr,System.IntPtr,System.IntPtr,System.Int32)
; Assembly: Mono.Android, Version=0.0.0.0, Culture=neutral, PublicKeyToken=84e04ff9cfb79065
; Registered: System.Void Android.Hardware.Camera2.CameraDevice/StateCallback::OnError(Android.Hardware.Camera2.CameraDevice,Android.Hardware.Camera2.CameraError)
; Implemented: System.Void maui.Services.CameraService/CameraStateCallback::OnError(Android.Hardware.Camera2.CameraDevice,Android.Hardware.Camera2.CameraError)
;
; Function attributes: "min-legal-vector-width"="0" mustprogress "no-trapping-math"="true" "stack-protector-buffer-size"="8" uwtable
define void @Java_crc642bf9dc2dd4ff72c8_CameraService_1CameraStateCallback_n_1onError(ptr noundef %env, ptr noundef %klass, ptr noundef %camera, i32 noundef %error) local_unnamed_addr #3
{
	%cb1 = load ptr, ptr @native_cb_onError_0_6_60004da, align 8, !tbaa !3
	%isNull = icmp eq ptr %cb1, null
	br i1 %isNull, label %loadCallback, label %callbackLoaded

loadCallback: ; preds = %0
	%get_func_ptr = load ptr, ptr @get_function_pointer, align 8, !tbaa !3
	call void %get_func_ptr(i32 noundef 32, i32 noundef 6, i32 noundef 100664538, ptr nonnull noundef align(8) dereferenceable(8) @native_cb_onError_0_6_60004da)
	%cb2 = load ptr, ptr @native_cb_onError_0_6_60004da, align 8, !tbaa !3
	br label %callbackLoaded

callbackLoaded: ; preds = %loadCallback, %0
	%fn = phi ptr
		 [%cb2, %loadCallback],
		 [%cb1, %0]
	tail call void %fn(ptr noundef %env, ptr noundef %klass, ptr noundef %camera, i32 noundef %error)
	ret void
}

; Method: System.Void Android.Hardware.Camera2.CameraCaptureSession/StateCallback::n_OnConfigured_Landroid_hardware_camera2_CameraCaptureSession__mm_wrapper(System.IntPtr,System.IntPtr,System.IntPtr)
; Assembly: Mono.Android, Version=0.0.0.0, Culture=neutral, PublicKeyToken=84e04ff9cfb79065
; Registered: System.Void Android.Hardware.Camera2.CameraCaptureSession/StateCallback::OnConfigured(Android.Hardware.Camera2.CameraCaptureSession)
; Implemented: System.Void maui.Services.CameraService/SessionCallback::OnConfigured(Android.Hardware.Camera2.CameraCaptureSession)
;
; Function attributes: "min-legal-vector-width"="0" mustprogress "no-trapping-math"="true" "stack-protector-buffer-size"="8" uwtable
define void @Java_crc642bf9dc2dd4ff72c8_CameraService_1SessionCallback_n_1onConfigured(ptr noundef %env, ptr noundef %klass, ptr noundef %session) local_unnamed_addr #3
{
	%cb1 = load ptr, ptr @native_cb_onConfigured_0_7_60004ad, align 8, !tbaa !3
	%isNull = icmp eq ptr %cb1, null
	br i1 %isNull, label %loadCallback, label %callbackLoaded

loadCallback: ; preds = %0
	%get_func_ptr = load ptr, ptr @get_function_pointer, align 8, !tbaa !3
	call void %get_func_ptr(i32 noundef 32, i32 noundef 7, i32 noundef 100664493, ptr nonnull noundef align(8) dereferenceable(8) @native_cb_onConfigured_0_7_60004ad)
	%cb2 = load ptr, ptr @native_cb_onConfigured_0_7_60004ad, align 8, !tbaa !3
	br label %callbackLoaded

callbackLoaded: ; preds = %loadCallback, %0
	%fn = phi ptr
		 [%cb2, %loadCallback],
		 [%cb1, %0]
	tail call void %fn(ptr noundef %env, ptr noundef %klass, ptr noundef %session)
	ret void
}

; Method: System.Void Android.Hardware.Camera2.CameraCaptureSession/StateCallback::n_OnConfigureFailed_Landroid_hardware_camera2_CameraCaptureSession__mm_wrapper(System.IntPtr,System.IntPtr,System.IntPtr)
; Assembly: Mono.Android, Version=0.0.0.0, Culture=neutral, PublicKeyToken=84e04ff9cfb79065
; Registered: System.Void Android.Hardware.Camera2.CameraCaptureSession/StateCallback::OnConfigureFailed(Android.Hardware.Camera2.CameraCaptureSession)
; Implemented: System.Void maui.Services.CameraService/SessionCallback::OnConfigureFailed(Android.Hardware.Camera2.CameraCaptureSession)
;
; Function attributes: "min-legal-vector-width"="0" mustprogress "no-trapping-math"="true" "stack-protector-buffer-size"="8" uwtable
define void @Java_crc642bf9dc2dd4ff72c8_CameraService_1SessionCallback_n_1onConfigureFailed(ptr noundef %env, ptr noundef %klass, ptr noundef %session) local_unnamed_addr #3
{
	%cb1 = load ptr, ptr @native_cb_onConfigureFailed_0_7_60004ae, align 8, !tbaa !3
	%isNull = icmp eq ptr %cb1, null
	br i1 %isNull, label %loadCallback, label %callbackLoaded

loadCallback: ; preds = %0
	%get_func_ptr = load ptr, ptr @get_function_pointer, align 8, !tbaa !3
	call void %get_func_ptr(i32 noundef 32, i32 noundef 7, i32 noundef 100664494, ptr nonnull noundef align(8) dereferenceable(8) @native_cb_onConfigureFailed_0_7_60004ae)
	%cb2 = load ptr, ptr @native_cb_onConfigureFailed_0_7_60004ae, align 8, !tbaa !3
	br label %callbackLoaded

callbackLoaded: ; preds = %loadCallback, %0
	%fn = phi ptr
		 [%cb2, %loadCallback],
		 [%cb1, %0]
	tail call void %fn(ptr noundef %env, ptr noundef %klass, ptr noundef %session)
	ret void
}

; Method: System.Void Android.Hardware.ISensorEventListenerInvoker::n_OnAccuracyChanged_Landroid_hardware_Sensor_I_mm_wrapper(System.IntPtr,System.IntPtr,System.IntPtr,System.Int32)
; Assembly: Mono.Android, Version=0.0.0.0, Culture=neutral, PublicKeyToken=84e04ff9cfb79065
; Registered: System.Void Android.Hardware.ISensorEventListener::OnAccuracyChanged(Android.Hardware.Sensor,Android.Hardware.SensorStatus)
; Implemented: System.Void Android.Hardware.ISensorEventListener::OnAccuracyChanged(Android.Hardware.Sensor,Android.Hardware.SensorStatus)
;
; Function attributes: "min-legal-vector-width"="0" mustprogress "no-trapping-math"="true" "stack-protector-buffer-size"="8" uwtable
define void @Java_crc642bf9dc2dd4ff72c8_SensorService_n_1onAccuracyChanged(ptr noundef %env, ptr noundef %klass, ptr noundef %0, i32 noundef %1) local_unnamed_addr #3
{
	%cb1 = load ptr, ptr @native_cb_onAccuracyChanged_0_8_6000477, align 8, !tbaa !3
	%isNull = icmp eq ptr %cb1, null
	br i1 %isNull, label %loadCallback, label %callbackLoaded

loadCallback: ; preds = %2
	%get_func_ptr = load ptr, ptr @get_function_pointer, align 8, !tbaa !3
	call void %get_func_ptr(i32 noundef 32, i32 noundef 8, i32 noundef 100664439, ptr nonnull noundef align(8) dereferenceable(8) @native_cb_onAccuracyChanged_0_8_6000477)
	%cb2 = load ptr, ptr @native_cb_onAccuracyChanged_0_8_6000477, align 8, !tbaa !3
	br label %callbackLoaded

callbackLoaded: ; preds = %loadCallback, %2
	%fn = phi ptr
		 [%cb2, %loadCallback],
		 [%cb1, %2]
	tail call void %fn(ptr noundef %env, ptr noundef %klass, ptr noundef %0, i32 noundef %1)
	ret void
}

; Method: System.Void Android.Hardware.ISensorEventListenerInvoker::n_OnSensorChanged_Landroid_hardware_SensorEvent__mm_wrapper(System.IntPtr,System.IntPtr,System.IntPtr)
; Assembly: Mono.Android, Version=0.0.0.0, Culture=neutral, PublicKeyToken=84e04ff9cfb79065
; Registered: System.Void Android.Hardware.ISensorEventListener::OnSensorChanged(Android.Hardware.SensorEvent)
; Implemented: System.Void Android.Hardware.ISensorEventListener::OnSensorChanged(Android.Hardware.SensorEvent)
;
; Function attributes: "min-legal-vector-width"="0" mustprogress "no-trapping-math"="true" "stack-protector-buffer-size"="8" uwtable
define void @Java_crc642bf9dc2dd4ff72c8_SensorService_n_1onSensorChanged(ptr noundef %env, ptr noundef %klass, ptr noundef %0) local_unnamed_addr #3
{
	%cb1 = load ptr, ptr @native_cb_onSensorChanged_0_8_6000478, align 8, !tbaa !3
	%isNull = icmp eq ptr %cb1, null
	br i1 %isNull, label %loadCallback, label %callbackLoaded

loadCallback: ; preds = %1
	%get_func_ptr = load ptr, ptr @get_function_pointer, align 8, !tbaa !3
	call void %get_func_ptr(i32 noundef 32, i32 noundef 8, i32 noundef 100664440, ptr nonnull noundef align(8) dereferenceable(8) @native_cb_onSensorChanged_0_8_6000478)
	%cb2 = load ptr, ptr @native_cb_onSensorChanged_0_8_6000478, align 8, !tbaa !3
	br label %callbackLoaded

callbackLoaded: ; preds = %loadCallback, %1
	%fn = phi ptr
		 [%cb2, %loadCallback],
		 [%cb1, %1]
	tail call void %fn(ptr noundef %env, ptr noundef %klass, ptr noundef %0)
	ret void
}

; Method: System.Void Java.Interop.TypeManager/JavaTypeManager::n_Activate_mm(System.IntPtr,System.IntPtr,System.IntPtr,System.IntPtr,System.IntPtr,System.IntPtr)
; Assembly: Mono.Android, Version=0.0.0.0, Culture=neutral, PublicKeyToken=84e04ff9cfb79065
; Registered: none
; Implemented: none
;
; Function attributes: "min-legal-vector-width"="0" mustprogress "no-trapping-math"="true" "stack-protector-buffer-size"="8" uwtable
define void @Java_mono_android_TypeManager_n_1activate(ptr noundef %env, ptr noundef %klass, ptr noundef %jnienv, ptr noundef %jclass, ptr noundef %typename_ptr, ptr noundef %signature_ptr) local_unnamed_addr #3
{
	%cb1 = load ptr, ptr @native_cb_activate_0_9_6000896, align 8, !tbaa !3
	%isNull = icmp eq ptr %cb1, null
	br i1 %isNull, label %loadCallback, label %callbackLoaded

loadCallback: ; preds = %0
	%get_func_ptr = load ptr, ptr @get_function_pointer, align 8, !tbaa !3
	call void %get_func_ptr(i32 noundef 32, i32 noundef 9, i32 noundef 100665494, ptr nonnull noundef align(8) dereferenceable(8) @native_cb_activate_0_9_6000896)
	%cb2 = load ptr, ptr @native_cb_activate_0_9_6000896, align 8, !tbaa !3
	br label %callbackLoaded

callbackLoaded: ; preds = %loadCallback, %0
	%fn = phi ptr
		 [%cb2, %loadCallback],
		 [%cb1, %0]
	tail call void %fn(ptr noundef %env, ptr noundef %klass, ptr noundef %jnienv, ptr noundef %jclass, ptr noundef %typename_ptr, ptr noundef %signature_ptr)
	ret void
}

; Strings
@.mm.0 = private unnamed_addr constant [101 x i8] c"Java.IO.InputStream, Mono.Android, Version=0.0.0.0, Culture=neutral, PublicKeyToken=84e04ff9cfb79065\00", align 16
@.mm.1 = private unnamed_addr constant [98 x i8] c"Java.Lang.Object, Mono.Android, Version=0.0.0.0, Culture=neutral, PublicKeyToken=84e04ff9cfb79065\00", align 16
@.mm.2 = private unnamed_addr constant [102 x i8] c"Java.IO.OutputStream, Mono.Android, Version=0.0.0.0, Culture=neutral, PublicKeyToken=84e04ff9cfb79065\00", align 16
@.mm.3 = private unnamed_addr constant [108 x i8] c"Java.Lang.IRunnableInvoker, Mono.Android, Version=0.0.0.0, Culture=neutral, PublicKeyToken=84e04ff9cfb79065\00", align 16
@.mm.4 = private unnamed_addr constant [102 x i8] c"Android.App.Activity, Mono.Android, Version=0.0.0.0, Culture=neutral, PublicKeyToken=84e04ff9cfb79065\00", align 16
@.mm.5 = private unnamed_addr constant [140 x i8] c"Android.Media.ImageReader/IOnImageAvailableListenerInvoker, Mono.Android, Version=0.0.0.0, Culture=neutral, PublicKeyToken=84e04ff9cfb79065\00", align 16
@.mm.6 = private unnamed_addr constant [133 x i8] c"Android.Hardware.Camera2.CameraDevice/StateCallback, Mono.Android, Version=0.0.0.0, Culture=neutral, PublicKeyToken=84e04ff9cfb79065\00", align 16
@.mm.7 = private unnamed_addr constant [141 x i8] c"Android.Hardware.Camera2.CameraCaptureSession/StateCallback, Mono.Android, Version=0.0.0.0, Culture=neutral, PublicKeyToken=84e04ff9cfb79065\00", align 16
@.mm.8 = private unnamed_addr constant [126 x i8] c"Android.Hardware.ISensorEventListenerInvoker, Mono.Android, Version=0.0.0.0, Culture=neutral, PublicKeyToken=84e04ff9cfb79065\00", align 16
@.mm.9 = private unnamed_addr constant [122 x i8] c"Java.Interop.TypeManager/JavaTypeManager, Mono.Android, Version=0.0.0.0, Culture=neutral, PublicKeyToken=84e04ff9cfb79065\00", align 16
@.mm.10 = private unnamed_addr constant [40 x i8] c"get_function_pointer MUST be specified\0A\00", align 16

;MarshalMethodName
@.MarshalMethodName.0_name = private unnamed_addr constant [34 x i8] c"n_Close_mm_wrapper(IntPtr,IntPtr)\00", align 16
@.MarshalMethodName.1_name = private unnamed_addr constant [33 x i8] c"n_Read_mm_wrapper(IntPtr,IntPtr)\00", align 16
@.MarshalMethodName.2_name = private unnamed_addr constant [47 x i8] c"n_Read_arrayB_mm_wrapper(IntPtr,IntPtr,IntPtr)\00", align 16
@.MarshalMethodName.3_name = private unnamed_addr constant [61 x i8] c"n_Read_arrayBII_mm_wrapper(IntPtr,IntPtr,IntPtr,Int32,Int32)\00", align 16
@.MarshalMethodName.4_name = private unnamed_addr constant [61 x i8] c"n_Equals_Ljava_lang_Object__mm_wrapper(IntPtr,IntPtr,IntPtr)\00", align 16
@.MarshalMethodName.5_name = private unnamed_addr constant [40 x i8] c"n_GetHashCode_mm_wrapper(IntPtr,IntPtr)\00", align 16
@.MarshalMethodName.6_name = private unnamed_addr constant [37 x i8] c"n_ToString_mm_wrapper(IntPtr,IntPtr)\00", align 16
@.MarshalMethodName.7_name = private unnamed_addr constant [34 x i8] c"n_Flush_mm_wrapper(IntPtr,IntPtr)\00", align 16
@.MarshalMethodName.8_name = private unnamed_addr constant [48 x i8] c"n_Write_arrayB_mm_wrapper(IntPtr,IntPtr,IntPtr)\00", align 16
@.MarshalMethodName.9_name = private unnamed_addr constant [62 x i8] c"n_Write_arrayBII_mm_wrapper(IntPtr,IntPtr,IntPtr,Int32,Int32)\00", align 16
@.MarshalMethodName.10_name = private unnamed_addr constant [42 x i8] c"n_Write_I_mm_wrapper(IntPtr,IntPtr,Int32)\00", align 16
@.MarshalMethodName.11_name = private unnamed_addr constant [32 x i8] c"n_Run_mm_wrapper(IntPtr,IntPtr)\00", align 16
@.MarshalMethodName.12_name = private unnamed_addr constant [64 x i8] c"n_OnCreate_Landroid_os_Bundle__mm_wrapper(IntPtr,IntPtr,IntPtr)\00", align 16
@.MarshalMethodName.13_name = private unnamed_addr constant [106 x i8] c"n_OnRequestPermissionsResult_IarrayLjava_lang_String_arrayI_mm_wrapper(IntPtr,IntPtr,Int32,IntPtr,IntPtr)\00", align 16
@.MarshalMethodName.14_name = private unnamed_addr constant [38 x i8] c"n_OnDestroy_mm_wrapper(IntPtr,IntPtr)\00", align 16
@.MarshalMethodName.15_name = private unnamed_addr constant [80 x i8] c"n_OnImageAvailable_Landroid_media_ImageReader__mm_wrapper(IntPtr,IntPtr,IntPtr)\00", align 16
@.MarshalMethodName.16_name = private unnamed_addr constant [84 x i8] c"n_OnOpened_Landroid_hardware_camera2_CameraDevice__mm_wrapper(IntPtr,IntPtr,IntPtr)\00", align 16
@.MarshalMethodName.17_name = private unnamed_addr constant [90 x i8] c"n_OnDisconnected_Landroid_hardware_camera2_CameraDevice__mm_wrapper(IntPtr,IntPtr,IntPtr)\00", align 16
@.MarshalMethodName.18_name = private unnamed_addr constant [90 x i8] c"n_OnError_Landroid_hardware_camera2_CameraDevice_I_mm_wrapper(IntPtr,IntPtr,IntPtr,Int32)\00", align 16
@.MarshalMethodName.19_name = private unnamed_addr constant [96 x i8] c"n_OnConfigured_Landroid_hardware_camera2_CameraCaptureSession__mm_wrapper(IntPtr,IntPtr,IntPtr)\00", align 16
@.MarshalMethodName.20_name = private unnamed_addr constant [101 x i8] c"n_OnConfigureFailed_Landroid_hardware_camera2_CameraCaptureSession__mm_wrapper(IntPtr,IntPtr,IntPtr)\00", align 16
@.MarshalMethodName.21_name = private unnamed_addr constant [86 x i8] c"n_OnAccuracyChanged_Landroid_hardware_Sensor_I_mm_wrapper(IntPtr,IntPtr,IntPtr,Int32)\00", align 16
@.MarshalMethodName.22_name = private unnamed_addr constant [82 x i8] c"n_OnSensorChanged_Landroid_hardware_SensorEvent__mm_wrapper(IntPtr,IntPtr,IntPtr)\00", align 16
@.MarshalMethodName.23_name = private unnamed_addr constant [57 x i8] c"n_Activate_mm(IntPtr,IntPtr,IntPtr,IntPtr,IntPtr,IntPtr)\00", align 16
@.MarshalMethodName.24_name = private unnamed_addr constant [1 x i8] c"\00", align 1

; External functions

; Function attributes: "no-trapping-math"="true" noreturn nounwind "stack-protector-buffer-size"="8"
declare void @abort() local_unnamed_addr #2

; Function attributes: nofree nounwind
declare noundef i32 @puts(ptr noundef) local_unnamed_addr #1
attributes #0 = { memory(write, argmem: none, inaccessiblemem: none) "min-legal-vector-width"="0" mustprogress "no-trapping-math"="true" nofree norecurse nosync nounwind "stack-protector-buffer-size"="8" "target-cpu"="x86-64" "target-features"="+crc32,+cx16,+cx8,+fxsr,+mmx,+popcnt,+sse,+sse2,+sse3,+sse4.1,+sse4.2,+ssse3,+x87" "tune-cpu"="generic" uwtable willreturn }
attributes #1 = { nofree nounwind }
attributes #2 = { "no-trapping-math"="true" noreturn nounwind "stack-protector-buffer-size"="8" "target-cpu"="x86-64" "target-features"="+crc32,+cx16,+cx8,+fxsr,+mmx,+popcnt,+sse,+sse2,+sse3,+sse4.1,+sse4.2,+ssse3,+x87" "tune-cpu"="generic" }
attributes #3 = { "min-legal-vector-width"="0" mustprogress "no-trapping-math"="true" "stack-protector-buffer-size"="8" "target-cpu"="x86-64" "target-features"="+crc32,+cx16,+cx8,+fxsr,+mmx,+popcnt,+sse,+sse2,+sse3,+sse4.1,+sse4.2,+ssse3,+x87" "tune-cpu"="generic" uwtable }

; Metadata
!llvm.module.flags = !{!0, !1}
!0 = !{i32 1, !"wchar_size", i32 4}
!1 = !{i32 7, !"PIC Level", i32 2}
!llvm.ident = !{!2}
!2 = !{!".NET for Android remotes/origin/release/10.0.1xx @ d549e1dc4e2a083b08b4f24cb5495e81b99d79b5"}
!3 = !{!4, !4, i64 0}
!4 = !{!"any pointer", !5, i64 0}
!5 = !{!"omnipotent char", !6, i64 0}
!6 = !{!"Simple C++ TBAA"}
