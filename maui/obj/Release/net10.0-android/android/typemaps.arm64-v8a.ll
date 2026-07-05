; ModuleID = 'typemaps.arm64-v8a.ll'
source_filename = "typemaps.arm64-v8a.ll"
target datalayout = "e-m:e-i8:8:32-i16:16:32-i64:64-i128:128-n32:64-S128"
target triple = "aarch64-unknown-linux-android21"

%struct.TypeMapJava = type {
	i32, ; uint32_t module_index
	i32, ; uint32_t type_token_id
	i32 ; uint32_t java_name_index
}

%struct.TypeMapModule = type {
	[16 x i8], ; uint8_t module_uuid[16]
	i32, ; uint32_t entry_count
	i32, ; uint32_t duplicate_count
	ptr, ; TypeMapModuleEntry map
	ptr, ; TypeMapModuleEntry duplicate_map
	ptr, ; char* assembly_name
	ptr, ; MonoImage image
	i32, ; uint32_t java_name_width
	ptr ; uint8_t java_map
}

%struct.TypeMapModuleEntry = type {
	i32, ; uint32_t type_token_id
	i32 ; uint32_t java_map_index
}

@map_module_count = dso_local local_unnamed_addr constant i32 3, align 4

@java_type_count = dso_local local_unnamed_addr constant i32 108, align 4

; Managed modules map
@map_modules = dso_local local_unnamed_addr global [3 x %struct.TypeMapModule] [
	%struct.TypeMapModule {
		[16 x i8] [ i8 u0x80, i8 u0x96, i8 u0x20, i8 u0x10, i8 u0xe3, i8 u0x6d, i8 u0xaf, i8 u0x4b, i8 u0x93, i8 u0x7c, i8 u0x94, i8 u0x80, i8 u0x39, i8 u0x75, i8 u0x34, i8 u0x5c ], ; module_uuid: 10209680-6de3-4baf-937c-94803975345c
		i32 14, ; uint32_t entry_count
		i32 2, ; uint32_t duplicate_count
		ptr @module0_managed_to_java, ; TypeMapModuleEntry* map
		ptr @module0_managed_to_java_duplicates, ; TypeMapModuleEntry* duplicate_map
		ptr @.TypeMapModule.0_assembly_name, ; assembly_name: Java.Interop
		ptr null, ; MonoImage* image
		i32 0, ; uint32_t java_name_width
		ptr null; uint8_t* java_map
	}, ; 0
	%struct.TypeMapModule {
		[16 x i8] [ i8 u0xc5, i8 u0x0c, i8 u0x88, i8 u0x52, i8 u0x09, i8 u0x52, i8 u0xcb, i8 u0x4e, i8 u0x84, i8 u0xbf, i8 u0x55, i8 u0x93, i8 u0x3b, i8 u0xb8, i8 u0xbb, i8 u0x9b ], ; module_uuid: 52880cc5-5209-4ecb-84bf-55933bb8bb9b
		i32 5, ; uint32_t entry_count
		i32 0, ; uint32_t duplicate_count
		ptr @module1_managed_to_java, ; TypeMapModuleEntry* map
		ptr null, ; TypeMapModuleEntry* duplicate_map
		ptr @.TypeMapModule.1_assembly_name, ; assembly_name: maui
		ptr null, ; MonoImage* image
		i32 0, ; uint32_t java_name_width
		ptr null; uint8_t* java_map
	}, ; 1
	%struct.TypeMapModule {
		[16 x i8] [ i8 u0xc5, i8 u0xf2, i8 u0xf2, i8 u0xdf, i8 u0x3c, i8 u0xb6, i8 u0x4f, i8 u0x4f, i8 u0x99, i8 u0x53, i8 u0xa4, i8 u0x3c, i8 u0xd4, i8 u0xc3, i8 u0x1e, i8 u0x96 ], ; module_uuid: dff2f2c5-b63c-4f4f-9953-a43cd4c31e96
		i32 91, ; uint32_t entry_count
		i32 28, ; uint32_t duplicate_count
		ptr @module2_managed_to_java, ; TypeMapModuleEntry* map
		ptr @module2_managed_to_java_duplicates, ; TypeMapModuleEntry* duplicate_map
		ptr @.TypeMapModule.2_assembly_name, ; assembly_name: Mono.Android
		ptr null, ; MonoImage* image
		i32 0, ; uint32_t java_name_width
		ptr null; uint8_t* java_map
	} ; 2
], align 8

; Java types name hashes
@map_java_hashes = dso_local local_unnamed_addr constant [108 x i64] [
	i64 u0x01cd624f1e38cc9f, ; 0 => java/lang/Byte
	i64 u0x0304e457b1d15194, ; 1 => android/view/ViewGroup$MarginLayoutParams
	i64 u0x087c7bab5804609d, ; 2 => android/hardware/camera2/CaptureRequest$Builder
	i64 u0x0b1da699fb29019a, ; 3 => android/os/BaseBundle
	i64 u0x0c44130caa233945, ; 4 => mono/android/runtime/JavaObject
	i64 u0x0d9335f0988cd796, ; 5 => java/util/HashMap
	i64 u0x194b32fbae047fc7, ; 6 => net/dot/jni/internal/JavaProxyObject
	i64 u0x1b8f3c5dc6e5ee7b, ; 7 => crc642bf9dc2dd4ff72c8/SensorService
	i64 u0x1e04bf19f9c14045, ; 8 => android/util/AttributeSet
	i64 u0x1e69018626ef9ffb, ; 9 => android/os/Handler
	i64 u0x225c20a45cb91cd7, ; 10 => java/lang/Error
	i64 u0x23a6af814fb8b8db, ; 11 => android/net/wifi/WifiManager
	i64 u0x332031975eda7654, ; 12 => java/lang/Boolean
	i64 u0x35e989807a64bcd9, ; 13 => java/lang/IllegalStateException
	i64 u0x39f1c81500ddb55b, ; 14 => [F
	i64 u0x406e54c64b3bee74, ; 15 => android/runtime/JavaProxyThrowable
	i64 u0x40c05cff47992547, ; 16 => android/view/ViewGroup
	i64 u0x4e68485b1f68b8f6, ; 17 => android/hardware/SensorManager
	i64 u0x505b1379ff157a72, ; 18 => android/view/Surface
	i64 u0x5181b129b1a25949, ; 19 => java/lang/Class
	i64 u0x5238ad63b58da994, ; 20 => java/lang/ClassCastException
	i64 u0x529da4201fa0d461, ; 21 => net/dot/jni/internal/JavaProxyThrowable
	i64 u0x54e75191bbca79dd, ; 22 => java/nio/ByteBuffer
	i64 u0x551ac881eb4466c0, ; 23 => java/lang/Number
	i64 u0x560a92597b121e00, ; 24 => [C
	i64 u0x56365290d5a06704, ; 25 => java/lang/LinkageError
	i64 u0x59dfe723c73206ad, ; 26 => crc642bf9dc2dd4ff72c8/CameraService_ImageListener
	i64 u0x5a6af884fe3c181e, ; 27 => android/os/Bundle
	i64 u0x5b905726d9bc975f, ; 28 => android/widget/TextView
	i64 u0x5bfd65ae1a6e6ffc, ; 29 => android/app/Activity
	i64 u0x5ecb4f9acecde0d5, ; 30 => android/hardware/camera2/CameraManager
	i64 u0x5f5a9fc3430795a4, ; 31 => android/content/ContextWrapper
	i64 u0x5f7e709faf8646e0, ; 32 => java/lang/Short
	i64 u0x61428f9f249ac534, ; 33 => [Z
	i64 u0x63655144c8397d37, ; 34 => android/hardware/camera2/CameraDevice
	i64 u0x65f6b14b7e978927, ; 35 => java/io/IOException
	i64 u0x6e0fb15bd0f04d15, ; 36 => java/lang/StackTraceElement
	i64 u0x720cd712e1248c34, ; 37 => java/util/Iterator
	i64 u0x75591c18ddf5e52d, ; 38 => mono/android/TypeManager
	i64 u0x76cbd2104dd555ed, ; 39 => android/content/Context
	i64 u0x7b90c42bde036cae, ; 40 => [I
	i64 u0x7b925bdca68a0101, ; 41 => java/util/ArrayList
	i64 u0x7daf15fe7ed6f09e, ; 42 => crc642bf9dc2dd4ff72c8/CameraService_SessionCallback
	i64 u0x7f3bed6c968c9887, ; 43 => android/hardware/SensorEventListener
	i64 u0x84f94178aab6cc34, ; 44 => java/lang/CharSequence
	i64 u0x852b5457ebdd5c87, ; 45 => android/view/ViewGroup$LayoutParams
	i64 u0x888700b03d541d93, ; 46 => java/lang/RuntimeException
	i64 u0x88f7510c649f4a97, ; 47 => java/io/InputStream
	i64 u0x89bb78ecf66b1453, ; 48 => android/view/SurfaceControl
	i64 u0x8a3ea3c274e8ce68, ; 49 => java/lang/Character
	i64 u0x90b4aeb45636cd6a, ; 50 => mono/android/runtime/OutputStreamAdapter
	i64 u0x92188d393e2af2d2, ; 51 => java/lang/Throwable
	i64 u0x92b59c839bc46278, ; 52 => java/lang/Thread
	i64 u0x965bfaf1ff1da014, ; 53 => java/lang/ReflectiveOperationException
	i64 u0x97e2e9121179cb48, ; 54 => android/graphics/SurfaceTexture
	i64 u0x982f3d167b6b494a, ; 55 => android/hardware/camera2/CameraCaptureSession$CaptureCallback
	i64 u0x98ba110c6c57da31, ; 56 => java/lang/Float
	i64 u0x99df91bab800c287, ; 57 => mono/android/runtime/InputStreamAdapter
	i64 u0x9e10a0b3efa170dc, ; 58 => android/view/ContextThemeWrapper
	i64 u0x9fa1370a1b1093fa, ; 59 => java/lang/NullPointerException
	i64 u0xa569d34f63e173fb, ; 60 => android/media/Image
	i64 u0xa865adbdd81d9951, ; 61 => java/io/OutputStream
	i64 u0xaa1e83a09f2fc981, ; 62 => java/nio/Buffer
	i64 u0xab1ff9cf39c17306, ; 63 => android/hardware/SensorEvent
	i64 u0xabc3cd0f40f748aa, ; 64 => java/lang/String
	i64 u0xac9902bb0e4c5217, ; 65 => java/lang/IllegalArgumentException
	i64 u0xacaf4fe23af1f72a, ; 66 => [S
	i64 u0xada6872f699d2ae8, ; 67 => [J
	i64 u0xafe151dded911985, ; 68 => android/hardware/camera2/CameraCaptureSession
	i64 u0xb02badeb1c97535c, ; 69 => java/lang/Integer
	i64 u0xb17995fbc7351342, ; 70 => android/media/Image$Plane
	i64 u0xb18d71343ca8e96f, ; 71 => java/lang/Exception
	i64 u0xb259b48abce95d10, ; 72 => android/hardware/camera2/CameraMetadata
	i64 u0xb6c4749da9477c3a, ; 73 => [B
	i64 u0xb8df224d6b778ca3, ; 74 => android/view/View
	i64 u0xbb84ccbe48f6c18b, ; 75 => android/os/Looper
	i64 u0xbc0f5862b0fe462b, ; 76 => android/hardware/camera2/CameraCaptureSession$StateCallback
	i64 u0xbc72db372291090a, ; 77 => android/media/ImageReader$OnImageAvailableListener
	i64 u0xbf6d427143271cb3, ; 78 => java/lang/Object
	i64 u0xc00f4c2f11efdcff, ; 79 => java/lang/ClassNotFoundException
	i64 u0xc1082d88c9720be5, ; 80 => android/hardware/camera2/CaptureRequest
	i64 u0xc2a8e50a5f08afc6, ; 81 => mono/java/lang/RunnableImplementor
	i64 u0xc4e3e82a9c9f507c, ; 82 => android/hardware/Sensor
	i64 u0xca35caf567cfa745, ; 83 => java/util/Collection
	i64 u0xcc306823503920e9, ; 84 => android/app/Application
	i64 u0xd0e722c3b0bde16f, ; 85 => android/graphics/Typeface
	i64 u0xd1b288a9c7bb8f53, ; 86 => java/lang/Double
	i64 u0xd2fc750314fd2213, ; 87 => [D
	i64 u0xd36a60f9c561a28d, ; 88 => crc642bf9dc2dd4ff72c8/CameraService_CameraStateCallback
	i64 u0xdd812f1d4afa427b, ; 89 => java/lang/UnsupportedOperationException
	i64 u0xdfabd9351f4351a6, ; 90 => [Ljava/lang/Object;
	i64 u0xe024b538ad65ea66, ; 91 => java/util/function/Consumer
	i64 u0xe0446bf91fb0c2dd, ; 92 => java/lang/NoClassDefFoundError
	i64 u0xe1b3c5871398eb28, ; 93 => java/nio/channels/FileChannel
	i64 u0xe5abbaa9de37d34b, ; 94 => net/dot/jni/ManagedPeer
	i64 u0xea7f173bd4159678, ; 95 => crc64ebab215de862fb6d/MainActivity
	i64 u0xeb82145dcac4c559, ; 96 => java/lang/Long
	i64 u0xed1e2ee1ba8b4d67, ; 97 => android/hardware/camera2/CameraDevice$StateCallback
	i64 u0xed49ed70aa9be1b3, ; 98 => java/nio/channels/spi/AbstractInterruptibleChannel
	i64 u0xeda8588bea0219b3, ; 99 => android/media/ImageReader
	i64 u0xef2f2996a1d369cc, ; 100 => java/io/FileInputStream
	i64 u0xefd8c7aa4b48418e, ; 101 => android/widget/LinearLayout
	i64 u0xf11f22a6441fcfbc, ; 102 => java/lang/IndexOutOfBoundsException
	i64 u0xf38608385d689955, ; 103 => mono/android/runtime/JavaArray
	i64 u0xfbc1bdfc9f95b651, ; 104 => android/net/wifi/WifiInfo
	i64 u0xfbe9bfa5cc50fed6, ; 105 => java/util/HashSet
	i64 u0xfd2b1a3de667eb51, ; 106 => java/lang/Runnable
	i64 u0xfe07df0b35277433 ; 107 => android/widget/LinearLayout$LayoutParams
], align 8

@module0_managed_to_java = internal dso_local constant [14 x %struct.TypeMapModuleEntry] [
	%struct.TypeMapModuleEntry {
		i32 u0x02000006, ; uint32_t type_token_id
		i32 90; uint32_t java_map_index
	}, ; 0
	%struct.TypeMapModuleEntry {
		i32 u0x0200000b, ; uint32_t type_token_id
		i32 51; uint32_t java_map_index
	}, ; 1
	%struct.TypeMapModuleEntry {
		i32 u0x0200000c, ; uint32_t type_token_id
		i32 78; uint32_t java_map_index
	}, ; 2
	%struct.TypeMapModuleEntry {
		i32 u0x0200002c, ; uint32_t type_token_id
		i32 33; uint32_t java_map_index
	}, ; 3
	%struct.TypeMapModuleEntry {
		i32 u0x02000030, ; uint32_t type_token_id
		i32 73; uint32_t java_map_index
	}, ; 4
	%struct.TypeMapModuleEntry {
		i32 u0x02000034, ; uint32_t type_token_id
		i32 24; uint32_t java_map_index
	}, ; 5
	%struct.TypeMapModuleEntry {
		i32 u0x02000038, ; uint32_t type_token_id
		i32 66; uint32_t java_map_index
	}, ; 6
	%struct.TypeMapModuleEntry {
		i32 u0x0200003c, ; uint32_t type_token_id
		i32 40; uint32_t java_map_index
	}, ; 7
	%struct.TypeMapModuleEntry {
		i32 u0x02000040, ; uint32_t type_token_id
		i32 67; uint32_t java_map_index
	}, ; 8
	%struct.TypeMapModuleEntry {
		i32 u0x02000044, ; uint32_t type_token_id
		i32 14; uint32_t java_map_index
	}, ; 9
	%struct.TypeMapModuleEntry {
		i32 u0x02000048, ; uint32_t type_token_id
		i32 87; uint32_t java_map_index
	}, ; 10
	%struct.TypeMapModuleEntry {
		i32 u0x0200004b, ; uint32_t type_token_id
		i32 6; uint32_t java_map_index
	}, ; 11
	%struct.TypeMapModuleEntry {
		i32 u0x0200004c, ; uint32_t type_token_id
		i32 21; uint32_t java_map_index
	}, ; 12
	%struct.TypeMapModuleEntry {
		i32 u0x02000094, ; uint32_t type_token_id
		i32 94; uint32_t java_map_index
	} ; 13
], align 4

@module0_managed_to_java_duplicates = internal dso_local constant [2 x %struct.TypeMapModuleEntry] [
	%struct.TypeMapModuleEntry {
		i32 u0x0200000a, ; uint32_t type_token_id
		i32 90; uint32_t java_map_index
	}, ; 0
	%struct.TypeMapModuleEntry {
		i32 u0x0200000d, ; uint32_t type_token_id
		i32 90; uint32_t java_map_index
	} ; 1
], align 4

@module1_managed_to_java = internal dso_local constant [5 x %struct.TypeMapModuleEntry] [
	%struct.TypeMapModuleEntry {
		i32 u0x02000007, ; uint32_t type_token_id
		i32 95; uint32_t java_map_index
	}, ; 0
	%struct.TypeMapModuleEntry {
		i32 u0x0200000a, ; uint32_t type_token_id
		i32 26; uint32_t java_map_index
	}, ; 1
	%struct.TypeMapModuleEntry {
		i32 u0x0200000b, ; uint32_t type_token_id
		i32 88; uint32_t java_map_index
	}, ; 2
	%struct.TypeMapModuleEntry {
		i32 u0x0200000c, ; uint32_t type_token_id
		i32 42; uint32_t java_map_index
	}, ; 3
	%struct.TypeMapModuleEntry {
		i32 u0x02000011, ; uint32_t type_token_id
		i32 7; uint32_t java_map_index
	} ; 4
], align 4

@module2_managed_to_java = internal dso_local constant [91 x %struct.TypeMapModuleEntry] [
	%struct.TypeMapModuleEntry {
		i32 u0x02000042, ; uint32_t type_token_id
		i32 28; uint32_t java_map_index
	}, ; 0
	%struct.TypeMapModuleEntry {
		i32 u0x02000043, ; uint32_t type_token_id
		i32 101; uint32_t java_map_index
	}, ; 1
	%struct.TypeMapModuleEntry {
		i32 u0x02000044, ; uint32_t type_token_id
		i32 107; uint32_t java_map_index
	}, ; 2
	%struct.TypeMapModuleEntry {
		i32 u0x02000046, ; uint32_t type_token_id
		i32 8; uint32_t java_map_index
	}, ; 3
	%struct.TypeMapModuleEntry {
		i32 u0x02000048, ; uint32_t type_token_id
		i32 9; uint32_t java_map_index
	}, ; 4
	%struct.TypeMapModuleEntry {
		i32 u0x02000049, ; uint32_t type_token_id
		i32 3; uint32_t java_map_index
	}, ; 5
	%struct.TypeMapModuleEntry {
		i32 u0x0200004a, ; uint32_t type_token_id
		i32 27; uint32_t java_map_index
	}, ; 6
	%struct.TypeMapModuleEntry {
		i32 u0x0200004b, ; uint32_t type_token_id
		i32 75; uint32_t java_map_index
	}, ; 7
	%struct.TypeMapModuleEntry {
		i32 u0x0200004c, ; uint32_t type_token_id
		i32 60; uint32_t java_map_index
	}, ; 8
	%struct.TypeMapModuleEntry {
		i32 u0x0200004d, ; uint32_t type_token_id
		i32 70; uint32_t java_map_index
	}, ; 9
	%struct.TypeMapModuleEntry {
		i32 u0x02000050, ; uint32_t type_token_id
		i32 99; uint32_t java_map_index
	}, ; 10
	%struct.TypeMapModuleEntry {
		i32 u0x02000051, ; uint32_t type_token_id
		i32 77; uint32_t java_map_index
	}, ; 11
	%struct.TypeMapModuleEntry {
		i32 u0x02000053, ; uint32_t type_token_id
		i32 74; uint32_t java_map_index
	}, ; 12
	%struct.TypeMapModuleEntry {
		i32 u0x02000054, ; uint32_t type_token_id
		i32 58; uint32_t java_map_index
	}, ; 13
	%struct.TypeMapModuleEntry {
		i32 u0x02000055, ; uint32_t type_token_id
		i32 18; uint32_t java_map_index
	}, ; 14
	%struct.TypeMapModuleEntry {
		i32 u0x02000056, ; uint32_t type_token_id
		i32 48; uint32_t java_map_index
	}, ; 15
	%struct.TypeMapModuleEntry {
		i32 u0x02000057, ; uint32_t type_token_id
		i32 16; uint32_t java_map_index
	}, ; 16
	%struct.TypeMapModuleEntry {
		i32 u0x02000058, ; uint32_t type_token_id
		i32 45; uint32_t java_map_index
	}, ; 17
	%struct.TypeMapModuleEntry {
		i32 u0x02000059, ; uint32_t type_token_id
		i32 1; uint32_t java_map_index
	}, ; 18
	%struct.TypeMapModuleEntry {
		i32 u0x0200006d, ; uint32_t type_token_id
		i32 57; uint32_t java_map_index
	}, ; 19
	%struct.TypeMapModuleEntry {
		i32 u0x0200006f, ; uint32_t type_token_id
		i32 103; uint32_t java_map_index
	}, ; 20
	%struct.TypeMapModuleEntry {
		i32 u0x02000071, ; uint32_t type_token_id
		i32 83; uint32_t java_map_index
	}, ; 21
	%struct.TypeMapModuleEntry {
		i32 u0x02000073, ; uint32_t type_token_id
		i32 5; uint32_t java_map_index
	}, ; 22
	%struct.TypeMapModuleEntry {
		i32 u0x0200007c, ; uint32_t type_token_id
		i32 41; uint32_t java_map_index
	}, ; 23
	%struct.TypeMapModuleEntry {
		i32 u0x0200007e, ; uint32_t type_token_id
		i32 4; uint32_t java_map_index
	}, ; 24
	%struct.TypeMapModuleEntry {
		i32 u0x0200007f, ; uint32_t type_token_id
		i32 15; uint32_t java_map_index
	}, ; 25
	%struct.TypeMapModuleEntry {
		i32 u0x02000080, ; uint32_t type_token_id
		i32 105; uint32_t java_map_index
	}, ; 26
	%struct.TypeMapModuleEntry {
		i32 u0x0200008c, ; uint32_t type_token_id
		i32 50; uint32_t java_map_index
	}, ; 27
	%struct.TypeMapModuleEntry {
		i32 u0x02000094, ; uint32_t type_token_id
		i32 11; uint32_t java_map_index
	}, ; 28
	%struct.TypeMapModuleEntry {
		i32 u0x02000095, ; uint32_t type_token_id
		i32 104; uint32_t java_map_index
	}, ; 29
	%struct.TypeMapModuleEntry {
		i32 u0x02000096, ; uint32_t type_token_id
		i32 17; uint32_t java_map_index
	}, ; 30
	%struct.TypeMapModuleEntry {
		i32 u0x02000097, ; uint32_t type_token_id
		i32 43; uint32_t java_map_index
	}, ; 31
	%struct.TypeMapModuleEntry {
		i32 u0x02000099, ; uint32_t type_token_id
		i32 82; uint32_t java_map_index
	}, ; 32
	%struct.TypeMapModuleEntry {
		i32 u0x0200009b, ; uint32_t type_token_id
		i32 63; uint32_t java_map_index
	}, ; 33
	%struct.TypeMapModuleEntry {
		i32 u0x0200009f, ; uint32_t type_token_id
		i32 68; uint32_t java_map_index
	}, ; 34
	%struct.TypeMapModuleEntry {
		i32 u0x020000a0, ; uint32_t type_token_id
		i32 55; uint32_t java_map_index
	}, ; 35
	%struct.TypeMapModuleEntry {
		i32 u0x020000a2, ; uint32_t type_token_id
		i32 76; uint32_t java_map_index
	}, ; 36
	%struct.TypeMapModuleEntry {
		i32 u0x020000a5, ; uint32_t type_token_id
		i32 34; uint32_t java_map_index
	}, ; 37
	%struct.TypeMapModuleEntry {
		i32 u0x020000a6, ; uint32_t type_token_id
		i32 97; uint32_t java_map_index
	}, ; 38
	%struct.TypeMapModuleEntry {
		i32 u0x020000aa, ; uint32_t type_token_id
		i32 30; uint32_t java_map_index
	}, ; 39
	%struct.TypeMapModuleEntry {
		i32 u0x020000ab, ; uint32_t type_token_id
		i32 72; uint32_t java_map_index
	}, ; 40
	%struct.TypeMapModuleEntry {
		i32 u0x020000ae, ; uint32_t type_token_id
		i32 80; uint32_t java_map_index
	}, ; 41
	%struct.TypeMapModuleEntry {
		i32 u0x020000af, ; uint32_t type_token_id
		i32 2; uint32_t java_map_index
	}, ; 42
	%struct.TypeMapModuleEntry {
		i32 u0x020000b3, ; uint32_t type_token_id
		i32 54; uint32_t java_map_index
	}, ; 43
	%struct.TypeMapModuleEntry {
		i32 u0x020000b4, ; uint32_t type_token_id
		i32 85; uint32_t java_map_index
	}, ; 44
	%struct.TypeMapModuleEntry {
		i32 u0x020000b6, ; uint32_t type_token_id
		i32 39; uint32_t java_map_index
	}, ; 45
	%struct.TypeMapModuleEntry {
		i32 u0x020000b8, ; uint32_t type_token_id
		i32 31; uint32_t java_map_index
	}, ; 46
	%struct.TypeMapModuleEntry {
		i32 u0x020000bb, ; uint32_t type_token_id
		i32 29; uint32_t java_map_index
	}, ; 47
	%struct.TypeMapModuleEntry {
		i32 u0x020000bc, ; uint32_t type_token_id
		i32 84; uint32_t java_map_index
	}, ; 48
	%struct.TypeMapModuleEntry {
		i32 u0x020000c0, ; uint32_t type_token_id
		i32 62; uint32_t java_map_index
	}, ; 49
	%struct.TypeMapModuleEntry {
		i32 u0x020000c2, ; uint32_t type_token_id
		i32 22; uint32_t java_map_index
	}, ; 50
	%struct.TypeMapModuleEntry {
		i32 u0x020000c4, ; uint32_t type_token_id
		i32 93; uint32_t java_map_index
	}, ; 51
	%struct.TypeMapModuleEntry {
		i32 u0x020000c6, ; uint32_t type_token_id
		i32 98; uint32_t java_map_index
	}, ; 52
	%struct.TypeMapModuleEntry {
		i32 u0x020000c8, ; uint32_t type_token_id
		i32 100; uint32_t java_map_index
	}, ; 53
	%struct.TypeMapModuleEntry {
		i32 u0x020000c9, ; uint32_t type_token_id
		i32 47; uint32_t java_map_index
	}, ; 54
	%struct.TypeMapModuleEntry {
		i32 u0x020000cb, ; uint32_t type_token_id
		i32 35; uint32_t java_map_index
	}, ; 55
	%struct.TypeMapModuleEntry {
		i32 u0x020000cc, ; uint32_t type_token_id
		i32 61; uint32_t java_map_index
	}, ; 56
	%struct.TypeMapModuleEntry {
		i32 u0x020000ce, ; uint32_t type_token_id
		i32 37; uint32_t java_map_index
	}, ; 57
	%struct.TypeMapModuleEntry {
		i32 u0x020000d0, ; uint32_t type_token_id
		i32 91; uint32_t java_map_index
	}, ; 58
	%struct.TypeMapModuleEntry {
		i32 u0x020000d2, ; uint32_t type_token_id
		i32 12; uint32_t java_map_index
	}, ; 59
	%struct.TypeMapModuleEntry {
		i32 u0x020000d3, ; uint32_t type_token_id
		i32 0; uint32_t java_map_index
	}, ; 60
	%struct.TypeMapModuleEntry {
		i32 u0x020000d4, ; uint32_t type_token_id
		i32 49; uint32_t java_map_index
	}, ; 61
	%struct.TypeMapModuleEntry {
		i32 u0x020000d5, ; uint32_t type_token_id
		i32 19; uint32_t java_map_index
	}, ; 62
	%struct.TypeMapModuleEntry {
		i32 u0x020000d6, ; uint32_t type_token_id
		i32 79; uint32_t java_map_index
	}, ; 63
	%struct.TypeMapModuleEntry {
		i32 u0x020000d7, ; uint32_t type_token_id
		i32 86; uint32_t java_map_index
	}, ; 64
	%struct.TypeMapModuleEntry {
		i32 u0x020000d8, ; uint32_t type_token_id
		i32 71; uint32_t java_map_index
	}, ; 65
	%struct.TypeMapModuleEntry {
		i32 u0x020000d9, ; uint32_t type_token_id
		i32 56; uint32_t java_map_index
	}, ; 66
	%struct.TypeMapModuleEntry {
		i32 u0x020000da, ; uint32_t type_token_id
		i32 69; uint32_t java_map_index
	}, ; 67
	%struct.TypeMapModuleEntry {
		i32 u0x020000db, ; uint32_t type_token_id
		i32 96; uint32_t java_map_index
	}, ; 68
	%struct.TypeMapModuleEntry {
		i32 u0x020000dc, ; uint32_t type_token_id
		i32 78; uint32_t java_map_index
	}, ; 69
	%struct.TypeMapModuleEntry {
		i32 u0x020000dd, ; uint32_t type_token_id
		i32 46; uint32_t java_map_index
	}, ; 70
	%struct.TypeMapModuleEntry {
		i32 u0x020000de, ; uint32_t type_token_id
		i32 32; uint32_t java_map_index
	}, ; 71
	%struct.TypeMapModuleEntry {
		i32 u0x020000df, ; uint32_t type_token_id
		i32 64; uint32_t java_map_index
	}, ; 72
	%struct.TypeMapModuleEntry {
		i32 u0x020000e1, ; uint32_t type_token_id
		i32 52; uint32_t java_map_index
	}, ; 73
	%struct.TypeMapModuleEntry {
		i32 u0x020000e2, ; uint32_t type_token_id
		i32 81; uint32_t java_map_index
	}, ; 74
	%struct.TypeMapModuleEntry {
		i32 u0x020000e3, ; uint32_t type_token_id
		i32 51; uint32_t java_map_index
	}, ; 75
	%struct.TypeMapModuleEntry {
		i32 u0x020000e4, ; uint32_t type_token_id
		i32 20; uint32_t java_map_index
	}, ; 76
	%struct.TypeMapModuleEntry {
		i32 u0x020000e5, ; uint32_t type_token_id
		i32 10; uint32_t java_map_index
	}, ; 77
	%struct.TypeMapModuleEntry {
		i32 u0x020000e6, ; uint32_t type_token_id
		i32 44; uint32_t java_map_index
	}, ; 78
	%struct.TypeMapModuleEntry {
		i32 u0x020000e8, ; uint32_t type_token_id
		i32 65; uint32_t java_map_index
	}, ; 79
	%struct.TypeMapModuleEntry {
		i32 u0x020000e9, ; uint32_t type_token_id
		i32 13; uint32_t java_map_index
	}, ; 80
	%struct.TypeMapModuleEntry {
		i32 u0x020000ea, ; uint32_t type_token_id
		i32 102; uint32_t java_map_index
	}, ; 81
	%struct.TypeMapModuleEntry {
		i32 u0x020000eb, ; uint32_t type_token_id
		i32 106; uint32_t java_map_index
	}, ; 82
	%struct.TypeMapModuleEntry {
		i32 u0x020000ed, ; uint32_t type_token_id
		i32 25; uint32_t java_map_index
	}, ; 83
	%struct.TypeMapModuleEntry {
		i32 u0x020000ee, ; uint32_t type_token_id
		i32 92; uint32_t java_map_index
	}, ; 84
	%struct.TypeMapModuleEntry {
		i32 u0x020000ef, ; uint32_t type_token_id
		i32 59; uint32_t java_map_index
	}, ; 85
	%struct.TypeMapModuleEntry {
		i32 u0x020000f0, ; uint32_t type_token_id
		i32 23; uint32_t java_map_index
	}, ; 86
	%struct.TypeMapModuleEntry {
		i32 u0x020000f2, ; uint32_t type_token_id
		i32 53; uint32_t java_map_index
	}, ; 87
	%struct.TypeMapModuleEntry {
		i32 u0x020000f3, ; uint32_t type_token_id
		i32 36; uint32_t java_map_index
	}, ; 88
	%struct.TypeMapModuleEntry {
		i32 u0x020000f4, ; uint32_t type_token_id
		i32 89; uint32_t java_map_index
	}, ; 89
	%struct.TypeMapModuleEntry {
		i32 u0x02000103, ; uint32_t type_token_id
		i32 38; uint32_t java_map_index
	} ; 90
], align 4

@module2_managed_to_java_duplicates = internal dso_local constant [28 x %struct.TypeMapModuleEntry] [
	%struct.TypeMapModuleEntry {
		i32 u0x02000047, ; uint32_t type_token_id
		i32 8; uint32_t java_map_index
	}, ; 0
	%struct.TypeMapModuleEntry {
		i32 u0x0200004e, ; uint32_t type_token_id
		i32 70; uint32_t java_map_index
	}, ; 1
	%struct.TypeMapModuleEntry {
		i32 u0x0200004f, ; uint32_t type_token_id
		i32 60; uint32_t java_map_index
	}, ; 2
	%struct.TypeMapModuleEntry {
		i32 u0x02000052, ; uint32_t type_token_id
		i32 77; uint32_t java_map_index
	}, ; 3
	%struct.TypeMapModuleEntry {
		i32 u0x0200005a, ; uint32_t type_token_id
		i32 16; uint32_t java_map_index
	}, ; 4
	%struct.TypeMapModuleEntry {
		i32 u0x02000072, ; uint32_t type_token_id
		i32 83; uint32_t java_map_index
	}, ; 5
	%struct.TypeMapModuleEntry {
		i32 u0x02000078, ; uint32_t type_token_id
		i32 5; uint32_t java_map_index
	}, ; 6
	%struct.TypeMapModuleEntry {
		i32 u0x0200007d, ; uint32_t type_token_id
		i32 41; uint32_t java_map_index
	}, ; 7
	%struct.TypeMapModuleEntry {
		i32 u0x02000081, ; uint32_t type_token_id
		i32 105; uint32_t java_map_index
	}, ; 8
	%struct.TypeMapModuleEntry {
		i32 u0x02000098, ; uint32_t type_token_id
		i32 43; uint32_t java_map_index
	}, ; 9
	%struct.TypeMapModuleEntry {
		i32 u0x0200009c, ; uint32_t type_token_id
		i32 17; uint32_t java_map_index
	}, ; 10
	%struct.TypeMapModuleEntry {
		i32 u0x020000a1, ; uint32_t type_token_id
		i32 55; uint32_t java_map_index
	}, ; 11
	%struct.TypeMapModuleEntry {
		i32 u0x020000a3, ; uint32_t type_token_id
		i32 76; uint32_t java_map_index
	}, ; 12
	%struct.TypeMapModuleEntry {
		i32 u0x020000a4, ; uint32_t type_token_id
		i32 68; uint32_t java_map_index
	}, ; 13
	%struct.TypeMapModuleEntry {
		i32 u0x020000a7, ; uint32_t type_token_id
		i32 97; uint32_t java_map_index
	}, ; 14
	%struct.TypeMapModuleEntry {
		i32 u0x020000a8, ; uint32_t type_token_id
		i32 34; uint32_t java_map_index
	}, ; 15
	%struct.TypeMapModuleEntry {
		i32 u0x020000ac, ; uint32_t type_token_id
		i32 72; uint32_t java_map_index
	}, ; 16
	%struct.TypeMapModuleEntry {
		i32 u0x020000b7, ; uint32_t type_token_id
		i32 39; uint32_t java_map_index
	}, ; 17
	%struct.TypeMapModuleEntry {
		i32 u0x020000c1, ; uint32_t type_token_id
		i32 62; uint32_t java_map_index
	}, ; 18
	%struct.TypeMapModuleEntry {
		i32 u0x020000c3, ; uint32_t type_token_id
		i32 22; uint32_t java_map_index
	}, ; 19
	%struct.TypeMapModuleEntry {
		i32 u0x020000c5, ; uint32_t type_token_id
		i32 93; uint32_t java_map_index
	}, ; 20
	%struct.TypeMapModuleEntry {
		i32 u0x020000c7, ; uint32_t type_token_id
		i32 98; uint32_t java_map_index
	}, ; 21
	%struct.TypeMapModuleEntry {
		i32 u0x020000ca, ; uint32_t type_token_id
		i32 47; uint32_t java_map_index
	}, ; 22
	%struct.TypeMapModuleEntry {
		i32 u0x020000cd, ; uint32_t type_token_id
		i32 61; uint32_t java_map_index
	}, ; 23
	%struct.TypeMapModuleEntry {
		i32 u0x020000cf, ; uint32_t type_token_id
		i32 37; uint32_t java_map_index
	}, ; 24
	%struct.TypeMapModuleEntry {
		i32 u0x020000d1, ; uint32_t type_token_id
		i32 91; uint32_t java_map_index
	}, ; 25
	%struct.TypeMapModuleEntry {
		i32 u0x020000ec, ; uint32_t type_token_id
		i32 106; uint32_t java_map_index
	}, ; 26
	%struct.TypeMapModuleEntry {
		i32 u0x020000f1, ; uint32_t type_token_id
		i32 23; uint32_t java_map_index
	} ; 27
], align 4

; Java to managed map
@map_java = dso_local local_unnamed_addr constant [108 x %struct.TypeMapJava] [
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x020000d3, ; uint32_t type_token_id
		i32 60; uint32_t java_name_index
	}, ; 0
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x02000059, ; uint32_t type_token_id
		i32 18; uint32_t java_name_index
	}, ; 1
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x020000af, ; uint32_t type_token_id
		i32 42; uint32_t java_name_index
	}, ; 2
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x02000049, ; uint32_t type_token_id
		i32 5; uint32_t java_name_index
	}, ; 3
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x0200007e, ; uint32_t type_token_id
		i32 24; uint32_t java_name_index
	}, ; 4
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x02000073, ; uint32_t type_token_id
		i32 22; uint32_t java_name_index
	}, ; 5
	%struct.TypeMapJava {
		i32 0, ; uint32_t module_index
		i32 u0x0200004b, ; uint32_t type_token_id
		i32 100; uint32_t java_name_index
	}, ; 6
	%struct.TypeMapJava {
		i32 1, ; uint32_t module_index
		i32 u0x02000011, ; uint32_t type_token_id
		i32 107; uint32_t java_name_index
	}, ; 7
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x00000000, ; uint32_t type_token_id
		i32 3; uint32_t java_name_index
	}, ; 8
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x02000048, ; uint32_t type_token_id
		i32 4; uint32_t java_name_index
	}, ; 9
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x020000e5, ; uint32_t type_token_id
		i32 77; uint32_t java_name_index
	}, ; 10
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x02000094, ; uint32_t type_token_id
		i32 28; uint32_t java_name_index
	}, ; 11
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x020000d2, ; uint32_t type_token_id
		i32 59; uint32_t java_name_index
	}, ; 12
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x020000e9, ; uint32_t type_token_id
		i32 80; uint32_t java_name_index
	}, ; 13
	%struct.TypeMapJava {
		i32 0, ; uint32_t module_index
		i32 u0x02000044, ; uint32_t type_token_id
		i32 98; uint32_t java_name_index
	}, ; 14
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x0200007f, ; uint32_t type_token_id
		i32 25; uint32_t java_name_index
	}, ; 15
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x02000057, ; uint32_t type_token_id
		i32 16; uint32_t java_name_index
	}, ; 16
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x02000096, ; uint32_t type_token_id
		i32 30; uint32_t java_name_index
	}, ; 17
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x02000055, ; uint32_t type_token_id
		i32 14; uint32_t java_name_index
	}, ; 18
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x020000d5, ; uint32_t type_token_id
		i32 62; uint32_t java_name_index
	}, ; 19
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x020000e4, ; uint32_t type_token_id
		i32 76; uint32_t java_name_index
	}, ; 20
	%struct.TypeMapJava {
		i32 0, ; uint32_t module_index
		i32 u0x0200004c, ; uint32_t type_token_id
		i32 101; uint32_t java_name_index
	}, ; 21
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x020000c2, ; uint32_t type_token_id
		i32 50; uint32_t java_name_index
	}, ; 22
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x020000f0, ; uint32_t type_token_id
		i32 86; uint32_t java_name_index
	}, ; 23
	%struct.TypeMapJava {
		i32 0, ; uint32_t module_index
		i32 u0x02000034, ; uint32_t type_token_id
		i32 94; uint32_t java_name_index
	}, ; 24
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x020000ed, ; uint32_t type_token_id
		i32 83; uint32_t java_name_index
	}, ; 25
	%struct.TypeMapJava {
		i32 1, ; uint32_t module_index
		i32 u0x0200000a, ; uint32_t type_token_id
		i32 104; uint32_t java_name_index
	}, ; 26
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x0200004a, ; uint32_t type_token_id
		i32 6; uint32_t java_name_index
	}, ; 27
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x02000042, ; uint32_t type_token_id
		i32 0; uint32_t java_name_index
	}, ; 28
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x020000bb, ; uint32_t type_token_id
		i32 47; uint32_t java_name_index
	}, ; 29
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x020000aa, ; uint32_t type_token_id
		i32 39; uint32_t java_name_index
	}, ; 30
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x020000b8, ; uint32_t type_token_id
		i32 46; uint32_t java_name_index
	}, ; 31
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x020000de, ; uint32_t type_token_id
		i32 71; uint32_t java_name_index
	}, ; 32
	%struct.TypeMapJava {
		i32 0, ; uint32_t module_index
		i32 u0x0200002c, ; uint32_t type_token_id
		i32 92; uint32_t java_name_index
	}, ; 33
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x020000a5, ; uint32_t type_token_id
		i32 37; uint32_t java_name_index
	}, ; 34
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x020000cb, ; uint32_t type_token_id
		i32 55; uint32_t java_name_index
	}, ; 35
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x020000f3, ; uint32_t type_token_id
		i32 88; uint32_t java_name_index
	}, ; 36
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x00000000, ; uint32_t type_token_id
		i32 57; uint32_t java_name_index
	}, ; 37
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x02000103, ; uint32_t type_token_id
		i32 90; uint32_t java_name_index
	}, ; 38
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x020000b6, ; uint32_t type_token_id
		i32 45; uint32_t java_name_index
	}, ; 39
	%struct.TypeMapJava {
		i32 0, ; uint32_t module_index
		i32 u0x0200003c, ; uint32_t type_token_id
		i32 96; uint32_t java_name_index
	}, ; 40
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x0200007c, ; uint32_t type_token_id
		i32 23; uint32_t java_name_index
	}, ; 41
	%struct.TypeMapJava {
		i32 1, ; uint32_t module_index
		i32 u0x0200000c, ; uint32_t type_token_id
		i32 106; uint32_t java_name_index
	}, ; 42
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x00000000, ; uint32_t type_token_id
		i32 31; uint32_t java_name_index
	}, ; 43
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x020000e6, ; uint32_t type_token_id
		i32 78; uint32_t java_name_index
	}, ; 44
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x02000058, ; uint32_t type_token_id
		i32 17; uint32_t java_name_index
	}, ; 45
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x020000dd, ; uint32_t type_token_id
		i32 70; uint32_t java_name_index
	}, ; 46
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x020000c9, ; uint32_t type_token_id
		i32 54; uint32_t java_name_index
	}, ; 47
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x02000056, ; uint32_t type_token_id
		i32 15; uint32_t java_name_index
	}, ; 48
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x020000d4, ; uint32_t type_token_id
		i32 61; uint32_t java_name_index
	}, ; 49
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x0200008c, ; uint32_t type_token_id
		i32 27; uint32_t java_name_index
	}, ; 50
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x020000e3, ; uint32_t type_token_id
		i32 75; uint32_t java_name_index
	}, ; 51
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x020000e1, ; uint32_t type_token_id
		i32 73; uint32_t java_name_index
	}, ; 52
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x020000f2, ; uint32_t type_token_id
		i32 87; uint32_t java_name_index
	}, ; 53
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x020000b3, ; uint32_t type_token_id
		i32 43; uint32_t java_name_index
	}, ; 54
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x020000a0, ; uint32_t type_token_id
		i32 35; uint32_t java_name_index
	}, ; 55
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x020000d9, ; uint32_t type_token_id
		i32 66; uint32_t java_name_index
	}, ; 56
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x0200006d, ; uint32_t type_token_id
		i32 19; uint32_t java_name_index
	}, ; 57
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x02000054, ; uint32_t type_token_id
		i32 13; uint32_t java_name_index
	}, ; 58
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x020000ef, ; uint32_t type_token_id
		i32 85; uint32_t java_name_index
	}, ; 59
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x0200004c, ; uint32_t type_token_id
		i32 8; uint32_t java_name_index
	}, ; 60
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x020000cc, ; uint32_t type_token_id
		i32 56; uint32_t java_name_index
	}, ; 61
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x020000c0, ; uint32_t type_token_id
		i32 49; uint32_t java_name_index
	}, ; 62
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x0200009b, ; uint32_t type_token_id
		i32 33; uint32_t java_name_index
	}, ; 63
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x020000df, ; uint32_t type_token_id
		i32 72; uint32_t java_name_index
	}, ; 64
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x020000e8, ; uint32_t type_token_id
		i32 79; uint32_t java_name_index
	}, ; 65
	%struct.TypeMapJava {
		i32 0, ; uint32_t module_index
		i32 u0x02000038, ; uint32_t type_token_id
		i32 95; uint32_t java_name_index
	}, ; 66
	%struct.TypeMapJava {
		i32 0, ; uint32_t module_index
		i32 u0x02000040, ; uint32_t type_token_id
		i32 97; uint32_t java_name_index
	}, ; 67
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x0200009f, ; uint32_t type_token_id
		i32 34; uint32_t java_name_index
	}, ; 68
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x020000da, ; uint32_t type_token_id
		i32 67; uint32_t java_name_index
	}, ; 69
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x0200004d, ; uint32_t type_token_id
		i32 9; uint32_t java_name_index
	}, ; 70
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x020000d8, ; uint32_t type_token_id
		i32 65; uint32_t java_name_index
	}, ; 71
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x020000ab, ; uint32_t type_token_id
		i32 40; uint32_t java_name_index
	}, ; 72
	%struct.TypeMapJava {
		i32 0, ; uint32_t module_index
		i32 u0x02000030, ; uint32_t type_token_id
		i32 93; uint32_t java_name_index
	}, ; 73
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x02000053, ; uint32_t type_token_id
		i32 12; uint32_t java_name_index
	}, ; 74
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x0200004b, ; uint32_t type_token_id
		i32 7; uint32_t java_name_index
	}, ; 75
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x020000a2, ; uint32_t type_token_id
		i32 36; uint32_t java_name_index
	}, ; 76
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x00000000, ; uint32_t type_token_id
		i32 11; uint32_t java_name_index
	}, ; 77
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x020000dc, ; uint32_t type_token_id
		i32 69; uint32_t java_name_index
	}, ; 78
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x020000d6, ; uint32_t type_token_id
		i32 63; uint32_t java_name_index
	}, ; 79
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x020000ae, ; uint32_t type_token_id
		i32 41; uint32_t java_name_index
	}, ; 80
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x020000e2, ; uint32_t type_token_id
		i32 74; uint32_t java_name_index
	}, ; 81
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x02000099, ; uint32_t type_token_id
		i32 32; uint32_t java_name_index
	}, ; 82
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x02000071, ; uint32_t type_token_id
		i32 21; uint32_t java_name_index
	}, ; 83
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x020000bc, ; uint32_t type_token_id
		i32 48; uint32_t java_name_index
	}, ; 84
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x020000b4, ; uint32_t type_token_id
		i32 44; uint32_t java_name_index
	}, ; 85
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x020000d7, ; uint32_t type_token_id
		i32 64; uint32_t java_name_index
	}, ; 86
	%struct.TypeMapJava {
		i32 0, ; uint32_t module_index
		i32 u0x02000048, ; uint32_t type_token_id
		i32 99; uint32_t java_name_index
	}, ; 87
	%struct.TypeMapJava {
		i32 1, ; uint32_t module_index
		i32 u0x0200000b, ; uint32_t type_token_id
		i32 105; uint32_t java_name_index
	}, ; 88
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x020000f4, ; uint32_t type_token_id
		i32 89; uint32_t java_name_index
	}, ; 89
	%struct.TypeMapJava {
		i32 0, ; uint32_t module_index
		i32 u0x00000000, ; uint32_t type_token_id
		i32 91; uint32_t java_name_index
	}, ; 90
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x00000000, ; uint32_t type_token_id
		i32 58; uint32_t java_name_index
	}, ; 91
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x020000ee, ; uint32_t type_token_id
		i32 84; uint32_t java_name_index
	}, ; 92
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x020000c4, ; uint32_t type_token_id
		i32 51; uint32_t java_name_index
	}, ; 93
	%struct.TypeMapJava {
		i32 0, ; uint32_t module_index
		i32 u0x02000094, ; uint32_t type_token_id
		i32 102; uint32_t java_name_index
	}, ; 94
	%struct.TypeMapJava {
		i32 1, ; uint32_t module_index
		i32 u0x02000007, ; uint32_t type_token_id
		i32 103; uint32_t java_name_index
	}, ; 95
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x020000db, ; uint32_t type_token_id
		i32 68; uint32_t java_name_index
	}, ; 96
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x020000a6, ; uint32_t type_token_id
		i32 38; uint32_t java_name_index
	}, ; 97
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x020000c6, ; uint32_t type_token_id
		i32 52; uint32_t java_name_index
	}, ; 98
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x02000050, ; uint32_t type_token_id
		i32 10; uint32_t java_name_index
	}, ; 99
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x020000c8, ; uint32_t type_token_id
		i32 53; uint32_t java_name_index
	}, ; 100
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x02000043, ; uint32_t type_token_id
		i32 1; uint32_t java_name_index
	}, ; 101
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x020000ea, ; uint32_t type_token_id
		i32 81; uint32_t java_name_index
	}, ; 102
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x00000000, ; uint32_t type_token_id
		i32 20; uint32_t java_name_index
	}, ; 103
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x02000095, ; uint32_t type_token_id
		i32 29; uint32_t java_name_index
	}, ; 104
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x02000080, ; uint32_t type_token_id
		i32 26; uint32_t java_name_index
	}, ; 105
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x00000000, ; uint32_t type_token_id
		i32 82; uint32_t java_name_index
	}, ; 106
	%struct.TypeMapJava {
		i32 2, ; uint32_t module_index
		i32 u0x02000044, ; uint32_t type_token_id
		i32 2; uint32_t java_name_index
	} ; 107
], align 4

; Java type names
@java_type_names = dso_local local_unnamed_addr constant [108 x ptr] [
	ptr @.tmr.0, ; 0 ('android/widget/TextView')
	ptr @.tmr.1, ; 1 ('android/widget/LinearLayout')
	ptr @.tmr.2, ; 2 ('android/widget/LinearLayout$LayoutParams')
	ptr @.tmr.3, ; 3 ('android/util/AttributeSet')
	ptr @.tmr.4, ; 4 ('android/os/Handler')
	ptr @.tmr.5, ; 5 ('android/os/BaseBundle')
	ptr @.tmr.6, ; 6 ('android/os/Bundle')
	ptr @.tmr.7, ; 7 ('android/os/Looper')
	ptr @.tmr.8, ; 8 ('android/media/Image')
	ptr @.tmr.9, ; 9 ('android/media/Image$Plane')
	ptr @.tmr.10, ; 10 ('android/media/ImageReader')
	ptr @.tmr.11, ; 11 ('android/media/ImageReader$OnImageAvailableListener')
	ptr @.tmr.12, ; 12 ('android/view/View')
	ptr @.tmr.13, ; 13 ('android/view/ContextThemeWrapper')
	ptr @.tmr.14, ; 14 ('android/view/Surface')
	ptr @.tmr.15, ; 15 ('android/view/SurfaceControl')
	ptr @.tmr.16, ; 16 ('android/view/ViewGroup')
	ptr @.tmr.17, ; 17 ('android/view/ViewGroup$LayoutParams')
	ptr @.tmr.18, ; 18 ('android/view/ViewGroup$MarginLayoutParams')
	ptr @.tmr.19, ; 19 ('mono/android/runtime/InputStreamAdapter')
	ptr @.tmr.20, ; 20 ('mono/android/runtime/JavaArray')
	ptr @.tmr.21, ; 21 ('java/util/Collection')
	ptr @.tmr.22, ; 22 ('java/util/HashMap')
	ptr @.tmr.23, ; 23 ('java/util/ArrayList')
	ptr @.tmr.24, ; 24 ('mono/android/runtime/JavaObject')
	ptr @.tmr.25, ; 25 ('android/runtime/JavaProxyThrowable')
	ptr @.tmr.26, ; 26 ('java/util/HashSet')
	ptr @.tmr.27, ; 27 ('mono/android/runtime/OutputStreamAdapter')
	ptr @.tmr.28, ; 28 ('android/net/wifi/WifiManager')
	ptr @.tmr.29, ; 29 ('android/net/wifi/WifiInfo')
	ptr @.tmr.30, ; 30 ('android/hardware/SensorManager')
	ptr @.tmr.31, ; 31 ('android/hardware/SensorEventListener')
	ptr @.tmr.32, ; 32 ('android/hardware/Sensor')
	ptr @.tmr.33, ; 33 ('android/hardware/SensorEvent')
	ptr @.tmr.34, ; 34 ('android/hardware/camera2/CameraCaptureSession')
	ptr @.tmr.35, ; 35 ('android/hardware/camera2/CameraCaptureSession$CaptureCallback')
	ptr @.tmr.36, ; 36 ('android/hardware/camera2/CameraCaptureSession$StateCallback')
	ptr @.tmr.37, ; 37 ('android/hardware/camera2/CameraDevice')
	ptr @.tmr.38, ; 38 ('android/hardware/camera2/CameraDevice$StateCallback')
	ptr @.tmr.39, ; 39 ('android/hardware/camera2/CameraManager')
	ptr @.tmr.40, ; 40 ('android/hardware/camera2/CameraMetadata')
	ptr @.tmr.41, ; 41 ('android/hardware/camera2/CaptureRequest')
	ptr @.tmr.42, ; 42 ('android/hardware/camera2/CaptureRequest$Builder')
	ptr @.tmr.43, ; 43 ('android/graphics/SurfaceTexture')
	ptr @.tmr.44, ; 44 ('android/graphics/Typeface')
	ptr @.tmr.45, ; 45 ('android/content/Context')
	ptr @.tmr.46, ; 46 ('android/content/ContextWrapper')
	ptr @.tmr.47, ; 47 ('android/app/Activity')
	ptr @.tmr.48, ; 48 ('android/app/Application')
	ptr @.tmr.49, ; 49 ('java/nio/Buffer')
	ptr @.tmr.50, ; 50 ('java/nio/ByteBuffer')
	ptr @.tmr.51, ; 51 ('java/nio/channels/FileChannel')
	ptr @.tmr.52, ; 52 ('java/nio/channels/spi/AbstractInterruptibleChannel')
	ptr @.tmr.53, ; 53 ('java/io/FileInputStream')
	ptr @.tmr.54, ; 54 ('java/io/InputStream')
	ptr @.tmr.55, ; 55 ('java/io/IOException')
	ptr @.tmr.56, ; 56 ('java/io/OutputStream')
	ptr @.tmr.57, ; 57 ('java/util/Iterator')
	ptr @.tmr.58, ; 58 ('java/util/function/Consumer')
	ptr @.tmr.59, ; 59 ('java/lang/Boolean')
	ptr @.tmr.60, ; 60 ('java/lang/Byte')
	ptr @.tmr.61, ; 61 ('java/lang/Character')
	ptr @.tmr.62, ; 62 ('java/lang/Class')
	ptr @.tmr.63, ; 63 ('java/lang/ClassNotFoundException')
	ptr @.tmr.64, ; 64 ('java/lang/Double')
	ptr @.tmr.65, ; 65 ('java/lang/Exception')
	ptr @.tmr.66, ; 66 ('java/lang/Float')
	ptr @.tmr.67, ; 67 ('java/lang/Integer')
	ptr @.tmr.68, ; 68 ('java/lang/Long')
	ptr @.tmr.69, ; 69 ('java/lang/Object')
	ptr @.tmr.70, ; 70 ('java/lang/RuntimeException')
	ptr @.tmr.71, ; 71 ('java/lang/Short')
	ptr @.tmr.72, ; 72 ('java/lang/String')
	ptr @.tmr.73, ; 73 ('java/lang/Thread')
	ptr @.tmr.74, ; 74 ('mono/java/lang/RunnableImplementor')
	ptr @.tmr.75, ; 75 ('java/lang/Throwable')
	ptr @.tmr.76, ; 76 ('java/lang/ClassCastException')
	ptr @.tmr.77, ; 77 ('java/lang/Error')
	ptr @.tmr.78, ; 78 ('java/lang/CharSequence')
	ptr @.tmr.79, ; 79 ('java/lang/IllegalArgumentException')
	ptr @.tmr.80, ; 80 ('java/lang/IllegalStateException')
	ptr @.tmr.81, ; 81 ('java/lang/IndexOutOfBoundsException')
	ptr @.tmr.82, ; 82 ('java/lang/Runnable')
	ptr @.tmr.83, ; 83 ('java/lang/LinkageError')
	ptr @.tmr.84, ; 84 ('java/lang/NoClassDefFoundError')
	ptr @.tmr.85, ; 85 ('java/lang/NullPointerException')
	ptr @.tmr.86, ; 86 ('java/lang/Number')
	ptr @.tmr.87, ; 87 ('java/lang/ReflectiveOperationException')
	ptr @.tmr.88, ; 88 ('java/lang/StackTraceElement')
	ptr @.tmr.89, ; 89 ('java/lang/UnsupportedOperationException')
	ptr @.tmr.90, ; 90 ('mono/android/TypeManager')
	ptr @.tmr.91, ; 91 ('[Ljava/lang/Object;')
	ptr @.tmr.92, ; 92 ('[Z')
	ptr @.tmr.93, ; 93 ('[B')
	ptr @.tmr.94, ; 94 ('[C')
	ptr @.tmr.95, ; 95 ('[S')
	ptr @.tmr.96, ; 96 ('[I')
	ptr @.tmr.97, ; 97 ('[J')
	ptr @.tmr.98, ; 98 ('[F')
	ptr @.tmr.99, ; 99 ('[D')
	ptr @.tmr.100, ; 100 ('net/dot/jni/internal/JavaProxyObject')
	ptr @.tmr.101, ; 101 ('net/dot/jni/internal/JavaProxyThrowable')
	ptr @.tmr.102, ; 102 ('net/dot/jni/ManagedPeer')
	ptr @.tmr.103, ; 103 ('crc64ebab215de862fb6d/MainActivity')
	ptr @.tmr.104, ; 104 ('crc642bf9dc2dd4ff72c8/CameraService_ImageListener')
	ptr @.tmr.105, ; 105 ('crc642bf9dc2dd4ff72c8/CameraService_CameraStateCallback')
	ptr @.tmr.106, ; 106 ('crc642bf9dc2dd4ff72c8/CameraService_SessionCallback')
	ptr @.tmr.107 ; 107 ('crc642bf9dc2dd4ff72c8/SensorService')
], align 8

; Strings
@.tmr.0 = private unnamed_addr constant [24 x i8] c"android/widget/TextView\00", align 1
@.tmr.1 = private unnamed_addr constant [28 x i8] c"android/widget/LinearLayout\00", align 1
@.tmr.2 = private unnamed_addr constant [41 x i8] c"android/widget/LinearLayout$LayoutParams\00", align 1
@.tmr.3 = private unnamed_addr constant [26 x i8] c"android/util/AttributeSet\00", align 1
@.tmr.4 = private unnamed_addr constant [19 x i8] c"android/os/Handler\00", align 1
@.tmr.5 = private unnamed_addr constant [22 x i8] c"android/os/BaseBundle\00", align 1
@.tmr.6 = private unnamed_addr constant [18 x i8] c"android/os/Bundle\00", align 1
@.tmr.7 = private unnamed_addr constant [18 x i8] c"android/os/Looper\00", align 1
@.tmr.8 = private unnamed_addr constant [20 x i8] c"android/media/Image\00", align 1
@.tmr.9 = private unnamed_addr constant [26 x i8] c"android/media/Image$Plane\00", align 1
@.tmr.10 = private unnamed_addr constant [26 x i8] c"android/media/ImageReader\00", align 1
@.tmr.11 = private unnamed_addr constant [51 x i8] c"android/media/ImageReader$OnImageAvailableListener\00", align 1
@.tmr.12 = private unnamed_addr constant [18 x i8] c"android/view/View\00", align 1
@.tmr.13 = private unnamed_addr constant [33 x i8] c"android/view/ContextThemeWrapper\00", align 1
@.tmr.14 = private unnamed_addr constant [21 x i8] c"android/view/Surface\00", align 1
@.tmr.15 = private unnamed_addr constant [28 x i8] c"android/view/SurfaceControl\00", align 1
@.tmr.16 = private unnamed_addr constant [23 x i8] c"android/view/ViewGroup\00", align 1
@.tmr.17 = private unnamed_addr constant [36 x i8] c"android/view/ViewGroup$LayoutParams\00", align 1
@.tmr.18 = private unnamed_addr constant [42 x i8] c"android/view/ViewGroup$MarginLayoutParams\00", align 1
@.tmr.19 = private unnamed_addr constant [40 x i8] c"mono/android/runtime/InputStreamAdapter\00", align 1
@.tmr.20 = private unnamed_addr constant [31 x i8] c"mono/android/runtime/JavaArray\00", align 1
@.tmr.21 = private unnamed_addr constant [21 x i8] c"java/util/Collection\00", align 1
@.tmr.22 = private unnamed_addr constant [18 x i8] c"java/util/HashMap\00", align 1
@.tmr.23 = private unnamed_addr constant [20 x i8] c"java/util/ArrayList\00", align 1
@.tmr.24 = private unnamed_addr constant [32 x i8] c"mono/android/runtime/JavaObject\00", align 1
@.tmr.25 = private unnamed_addr constant [35 x i8] c"android/runtime/JavaProxyThrowable\00", align 1
@.tmr.26 = private unnamed_addr constant [18 x i8] c"java/util/HashSet\00", align 1
@.tmr.27 = private unnamed_addr constant [41 x i8] c"mono/android/runtime/OutputStreamAdapter\00", align 1
@.tmr.28 = private unnamed_addr constant [29 x i8] c"android/net/wifi/WifiManager\00", align 1
@.tmr.29 = private unnamed_addr constant [26 x i8] c"android/net/wifi/WifiInfo\00", align 1
@.tmr.30 = private unnamed_addr constant [31 x i8] c"android/hardware/SensorManager\00", align 1
@.tmr.31 = private unnamed_addr constant [37 x i8] c"android/hardware/SensorEventListener\00", align 1
@.tmr.32 = private unnamed_addr constant [24 x i8] c"android/hardware/Sensor\00", align 1
@.tmr.33 = private unnamed_addr constant [29 x i8] c"android/hardware/SensorEvent\00", align 1
@.tmr.34 = private unnamed_addr constant [46 x i8] c"android/hardware/camera2/CameraCaptureSession\00", align 1
@.tmr.35 = private unnamed_addr constant [62 x i8] c"android/hardware/camera2/CameraCaptureSession$CaptureCallback\00", align 1
@.tmr.36 = private unnamed_addr constant [60 x i8] c"android/hardware/camera2/CameraCaptureSession$StateCallback\00", align 1
@.tmr.37 = private unnamed_addr constant [38 x i8] c"android/hardware/camera2/CameraDevice\00", align 1
@.tmr.38 = private unnamed_addr constant [52 x i8] c"android/hardware/camera2/CameraDevice$StateCallback\00", align 1
@.tmr.39 = private unnamed_addr constant [39 x i8] c"android/hardware/camera2/CameraManager\00", align 1
@.tmr.40 = private unnamed_addr constant [40 x i8] c"android/hardware/camera2/CameraMetadata\00", align 1
@.tmr.41 = private unnamed_addr constant [40 x i8] c"android/hardware/camera2/CaptureRequest\00", align 1
@.tmr.42 = private unnamed_addr constant [48 x i8] c"android/hardware/camera2/CaptureRequest$Builder\00", align 1
@.tmr.43 = private unnamed_addr constant [32 x i8] c"android/graphics/SurfaceTexture\00", align 1
@.tmr.44 = private unnamed_addr constant [26 x i8] c"android/graphics/Typeface\00", align 1
@.tmr.45 = private unnamed_addr constant [24 x i8] c"android/content/Context\00", align 1
@.tmr.46 = private unnamed_addr constant [31 x i8] c"android/content/ContextWrapper\00", align 1
@.tmr.47 = private unnamed_addr constant [21 x i8] c"android/app/Activity\00", align 1
@.tmr.48 = private unnamed_addr constant [24 x i8] c"android/app/Application\00", align 1
@.tmr.49 = private unnamed_addr constant [16 x i8] c"java/nio/Buffer\00", align 1
@.tmr.50 = private unnamed_addr constant [20 x i8] c"java/nio/ByteBuffer\00", align 1
@.tmr.51 = private unnamed_addr constant [30 x i8] c"java/nio/channels/FileChannel\00", align 1
@.tmr.52 = private unnamed_addr constant [51 x i8] c"java/nio/channels/spi/AbstractInterruptibleChannel\00", align 1
@.tmr.53 = private unnamed_addr constant [24 x i8] c"java/io/FileInputStream\00", align 1
@.tmr.54 = private unnamed_addr constant [20 x i8] c"java/io/InputStream\00", align 1
@.tmr.55 = private unnamed_addr constant [20 x i8] c"java/io/IOException\00", align 1
@.tmr.56 = private unnamed_addr constant [21 x i8] c"java/io/OutputStream\00", align 1
@.tmr.57 = private unnamed_addr constant [19 x i8] c"java/util/Iterator\00", align 1
@.tmr.58 = private unnamed_addr constant [28 x i8] c"java/util/function/Consumer\00", align 1
@.tmr.59 = private unnamed_addr constant [18 x i8] c"java/lang/Boolean\00", align 1
@.tmr.60 = private unnamed_addr constant [15 x i8] c"java/lang/Byte\00", align 1
@.tmr.61 = private unnamed_addr constant [20 x i8] c"java/lang/Character\00", align 1
@.tmr.62 = private unnamed_addr constant [16 x i8] c"java/lang/Class\00", align 1
@.tmr.63 = private unnamed_addr constant [33 x i8] c"java/lang/ClassNotFoundException\00", align 1
@.tmr.64 = private unnamed_addr constant [17 x i8] c"java/lang/Double\00", align 1
@.tmr.65 = private unnamed_addr constant [20 x i8] c"java/lang/Exception\00", align 1
@.tmr.66 = private unnamed_addr constant [16 x i8] c"java/lang/Float\00", align 1
@.tmr.67 = private unnamed_addr constant [18 x i8] c"java/lang/Integer\00", align 1
@.tmr.68 = private unnamed_addr constant [15 x i8] c"java/lang/Long\00", align 1
@.tmr.69 = private unnamed_addr constant [17 x i8] c"java/lang/Object\00", align 1
@.tmr.70 = private unnamed_addr constant [27 x i8] c"java/lang/RuntimeException\00", align 1
@.tmr.71 = private unnamed_addr constant [16 x i8] c"java/lang/Short\00", align 1
@.tmr.72 = private unnamed_addr constant [17 x i8] c"java/lang/String\00", align 1
@.tmr.73 = private unnamed_addr constant [17 x i8] c"java/lang/Thread\00", align 1
@.tmr.74 = private unnamed_addr constant [35 x i8] c"mono/java/lang/RunnableImplementor\00", align 1
@.tmr.75 = private unnamed_addr constant [20 x i8] c"java/lang/Throwable\00", align 1
@.tmr.76 = private unnamed_addr constant [29 x i8] c"java/lang/ClassCastException\00", align 1
@.tmr.77 = private unnamed_addr constant [16 x i8] c"java/lang/Error\00", align 1
@.tmr.78 = private unnamed_addr constant [23 x i8] c"java/lang/CharSequence\00", align 1
@.tmr.79 = private unnamed_addr constant [35 x i8] c"java/lang/IllegalArgumentException\00", align 1
@.tmr.80 = private unnamed_addr constant [32 x i8] c"java/lang/IllegalStateException\00", align 1
@.tmr.81 = private unnamed_addr constant [36 x i8] c"java/lang/IndexOutOfBoundsException\00", align 1
@.tmr.82 = private unnamed_addr constant [19 x i8] c"java/lang/Runnable\00", align 1
@.tmr.83 = private unnamed_addr constant [23 x i8] c"java/lang/LinkageError\00", align 1
@.tmr.84 = private unnamed_addr constant [31 x i8] c"java/lang/NoClassDefFoundError\00", align 1
@.tmr.85 = private unnamed_addr constant [31 x i8] c"java/lang/NullPointerException\00", align 1
@.tmr.86 = private unnamed_addr constant [17 x i8] c"java/lang/Number\00", align 1
@.tmr.87 = private unnamed_addr constant [39 x i8] c"java/lang/ReflectiveOperationException\00", align 1
@.tmr.88 = private unnamed_addr constant [28 x i8] c"java/lang/StackTraceElement\00", align 1
@.tmr.89 = private unnamed_addr constant [40 x i8] c"java/lang/UnsupportedOperationException\00", align 1
@.tmr.90 = private unnamed_addr constant [25 x i8] c"mono/android/TypeManager\00", align 1
@.tmr.91 = private unnamed_addr constant [20 x i8] c"[Ljava/lang/Object;\00", align 1
@.tmr.92 = private unnamed_addr constant [3 x i8] c"[Z\00", align 1
@.tmr.93 = private unnamed_addr constant [3 x i8] c"[B\00", align 1
@.tmr.94 = private unnamed_addr constant [3 x i8] c"[C\00", align 1
@.tmr.95 = private unnamed_addr constant [3 x i8] c"[S\00", align 1
@.tmr.96 = private unnamed_addr constant [3 x i8] c"[I\00", align 1
@.tmr.97 = private unnamed_addr constant [3 x i8] c"[J\00", align 1
@.tmr.98 = private unnamed_addr constant [3 x i8] c"[F\00", align 1
@.tmr.99 = private unnamed_addr constant [3 x i8] c"[D\00", align 1
@.tmr.100 = private unnamed_addr constant [37 x i8] c"net/dot/jni/internal/JavaProxyObject\00", align 1
@.tmr.101 = private unnamed_addr constant [40 x i8] c"net/dot/jni/internal/JavaProxyThrowable\00", align 1
@.tmr.102 = private unnamed_addr constant [24 x i8] c"net/dot/jni/ManagedPeer\00", align 1
@.tmr.103 = private unnamed_addr constant [35 x i8] c"crc64ebab215de862fb6d/MainActivity\00", align 1
@.tmr.104 = private unnamed_addr constant [50 x i8] c"crc642bf9dc2dd4ff72c8/CameraService_ImageListener\00", align 1
@.tmr.105 = private unnamed_addr constant [56 x i8] c"crc642bf9dc2dd4ff72c8/CameraService_CameraStateCallback\00", align 1
@.tmr.106 = private unnamed_addr constant [52 x i8] c"crc642bf9dc2dd4ff72c8/CameraService_SessionCallback\00", align 1
@.tmr.107 = private unnamed_addr constant [36 x i8] c"crc642bf9dc2dd4ff72c8/SensorService\00", align 1

;TypeMapModule
@.TypeMapModule.0_assembly_name = private unnamed_addr constant [13 x i8] c"Java.Interop\00", align 1
@.TypeMapModule.1_assembly_name = private unnamed_addr constant [5 x i8] c"maui\00", align 1
@.TypeMapModule.2_assembly_name = private unnamed_addr constant [13 x i8] c"Mono.Android\00", align 1

; Metadata
!llvm.module.flags = !{!0, !1, !7, !8, !9, !10}
!0 = !{i32 1, !"wchar_size", i32 4}
!1 = !{i32 7, !"PIC Level", i32 2}
!llvm.ident = !{!2}
!2 = !{!".NET for Android remotes/origin/release/10.0.1xx @ d549e1dc4e2a083b08b4f24cb5495e81b99d79b5"}
!3 = !{!4, !4, i64 0}
!4 = !{!"any pointer", !5, i64 0}
!5 = !{!"omnipotent char", !6, i64 0}
!6 = !{!"Simple C++ TBAA"}
!7 = !{i32 1, !"branch-target-enforcement", i32 0}
!8 = !{i32 1, !"sign-return-address", i32 0}
!9 = !{i32 1, !"sign-return-address-all", i32 0}
!10 = !{i32 1, !"sign-return-address-with-bkey", i32 0}
