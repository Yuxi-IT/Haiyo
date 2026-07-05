; ModuleID = 'compressed_assemblies.arm64-v8a.ll'
source_filename = "compressed_assemblies.arm64-v8a.ll"
target datalayout = "e-m:e-i8:8:32-i16:16:32-i64:64-i128:128-n32:64-S128"
target triple = "aarch64-unknown-linux-android21"

%struct.CompressedAssemblyDescriptor = type {
	i32, ; uint32_t uncompressed_file_size
	i1, ; bool loaded
	i32 ; uint32_t buffer_offset
}

@compressed_assembly_count = dso_local local_unnamed_addr constant i32 33, align 4

@compressed_assembly_descriptors = dso_local local_unnamed_addr global [33 x %struct.CompressedAssemblyDescriptor] [
	%struct.CompressedAssemblyDescriptor {
		i32 2560, ; uint32_t uncompressed_file_size
		i1 false, ; bool loaded
		i32 0; uint32_t buffer_offset
	}, ; 0: _Microsoft.Android.Resource.Designer
	%struct.CompressedAssemblyDescriptor {
		i32 24064, ; uint32_t uncompressed_file_size
		i1 false, ; bool loaded
		i32 2560; uint32_t buffer_offset
	}, ; 1: maui
	%struct.CompressedAssemblyDescriptor {
		i32 18944, ; uint32_t uncompressed_file_size
		i1 false, ; bool loaded
		i32 26624; uint32_t buffer_offset
	}, ; 2: System.Collections.Concurrent
	%struct.CompressedAssemblyDescriptor {
		i32 7168, ; uint32_t uncompressed_file_size
		i1 false, ; bool loaded
		i32 45568; uint32_t buffer_offset
	}, ; 3: System.Collections.NonGeneric
	%struct.CompressedAssemblyDescriptor {
		i32 9216, ; uint32_t uncompressed_file_size
		i1 false, ; bool loaded
		i32 52736; uint32_t buffer_offset
	}, ; 4: System.Collections.Specialized
	%struct.CompressedAssemblyDescriptor {
		i32 8192, ; uint32_t uncompressed_file_size
		i1 false, ; bool loaded
		i32 61952; uint32_t buffer_offset
	}, ; 5: System.Collections
	%struct.CompressedAssemblyDescriptor {
		i32 11776, ; uint32_t uncompressed_file_size
		i1 false, ; bool loaded
		i32 70144; uint32_t buffer_offset
	}, ; 6: System.Console
	%struct.CompressedAssemblyDescriptor {
		i32 44544, ; uint32_t uncompressed_file_size
		i1 false, ; bool loaded
		i32 81920; uint32_t buffer_offset
	}, ; 7: System.Diagnostics.DiagnosticSource
	%struct.CompressedAssemblyDescriptor {
		i32 60416, ; uint32_t uncompressed_file_size
		i1 false, ; bool loaded
		i32 126464; uint32_t buffer_offset
	}, ; 8: System.Formats.Asn1
	%struct.CompressedAssemblyDescriptor {
		i32 6144, ; uint32_t uncompressed_file_size
		i1 false, ; bool loaded
		i32 186880; uint32_t buffer_offset
	}, ; 9: System.IO.Pipelines
	%struct.CompressedAssemblyDescriptor {
		i32 13824, ; uint32_t uncompressed_file_size
		i1 false, ; bool loaded
		i32 193024; uint32_t buffer_offset
	}, ; 10: System.Linq
	%struct.CompressedAssemblyDescriptor {
		i32 13824, ; uint32_t uncompressed_file_size
		i1 false, ; bool loaded
		i32 206848; uint32_t buffer_offset
	}, ; 11: System.Memory
	%struct.CompressedAssemblyDescriptor {
		i32 62976, ; uint32_t uncompressed_file_size
		i1 false, ; bool loaded
		i32 220672; uint32_t buffer_offset
	}, ; 12: System.Net.HttpListener
	%struct.CompressedAssemblyDescriptor {
		i32 23040, ; uint32_t uncompressed_file_size
		i1 false, ; bool loaded
		i32 283648; uint32_t buffer_offset
	}, ; 13: System.Net.NameResolution
	%struct.CompressedAssemblyDescriptor {
		i32 40960, ; uint32_t uncompressed_file_size
		i1 false, ; bool loaded
		i32 306688; uint32_t buffer_offset
	}, ; 14: System.Net.Primitives
	%struct.CompressedAssemblyDescriptor {
		i32 8192, ; uint32_t uncompressed_file_size
		i1 false, ; bool loaded
		i32 347648; uint32_t buffer_offset
	}, ; 15: System.Net.Requests
	%struct.CompressedAssemblyDescriptor {
		i32 117248, ; uint32_t uncompressed_file_size
		i1 false, ; bool loaded
		i32 355840; uint32_t buffer_offset
	}, ; 16: System.Net.Security
	%struct.CompressedAssemblyDescriptor {
		i32 90624, ; uint32_t uncompressed_file_size
		i1 false, ; bool loaded
		i32 473088; uint32_t buffer_offset
	}, ; 17: System.Net.Sockets
	%struct.CompressedAssemblyDescriptor {
		i32 11776, ; uint32_t uncompressed_file_size
		i1 false, ; bool loaded
		i32 563712; uint32_t buffer_offset
	}, ; 18: System.Net.WebHeaderCollection
	%struct.CompressedAssemblyDescriptor {
		i32 65536, ; uint32_t uncompressed_file_size
		i1 false, ; bool loaded
		i32 575488; uint32_t buffer_offset
	}, ; 19: System.Private.Uri
	%struct.CompressedAssemblyDescriptor {
		i32 9216, ; uint32_t uncompressed_file_size
		i1 false, ; bool loaded
		i32 641024; uint32_t buffer_offset
	}, ; 20: System.Runtime.InteropServices
	%struct.CompressedAssemblyDescriptor {
		i32 66560, ; uint32_t uncompressed_file_size
		i1 false, ; bool loaded
		i32 650240; uint32_t buffer_offset
	}, ; 21: System.Runtime.Numerics
	%struct.CompressedAssemblyDescriptor {
		i32 6656, ; uint32_t uncompressed_file_size
		i1 false, ; bool loaded
		i32 716800; uint32_t buffer_offset
	}, ; 22: System.Runtime
	%struct.CompressedAssemblyDescriptor {
		i32 12288, ; uint32_t uncompressed_file_size
		i1 false, ; bool loaded
		i32 723456; uint32_t buffer_offset
	}, ; 23: System.Security.Claims
	%struct.CompressedAssemblyDescriptor {
		i32 152576, ; uint32_t uncompressed_file_size
		i1 false, ; bool loaded
		i32 735744; uint32_t buffer_offset
	}, ; 24: System.Security.Cryptography
	%struct.CompressedAssemblyDescriptor {
		i32 29696, ; uint32_t uncompressed_file_size
		i1 false, ; bool loaded
		i32 888320; uint32_t buffer_offset
	}, ; 25: System.Text.Encodings.Web
	%struct.CompressedAssemblyDescriptor {
		i32 143872, ; uint32_t uncompressed_file_size
		i1 false, ; bool loaded
		i32 918016; uint32_t buffer_offset
	}, ; 26: System.Text.Json
	%struct.CompressedAssemblyDescriptor {
		i32 5120, ; uint32_t uncompressed_file_size
		i1 false, ; bool loaded
		i32 1061888; uint32_t buffer_offset
	}, ; 27: System.Threading.Thread
	%struct.CompressedAssemblyDescriptor {
		i32 12288, ; uint32_t uncompressed_file_size
		i1 false, ; bool loaded
		i32 1067008; uint32_t buffer_offset
	}, ; 28: System.Threading
	%struct.CompressedAssemblyDescriptor {
		i32 1588736, ; uint32_t uncompressed_file_size
		i1 false, ; bool loaded
		i32 1079296; uint32_t buffer_offset
	}, ; 29: System.Private.CoreLib
	%struct.CompressedAssemblyDescriptor {
		i32 161792, ; uint32_t uncompressed_file_size
		i1 false, ; bool loaded
		i32 2668032; uint32_t buffer_offset
	}, ; 30: Java.Interop
	%struct.CompressedAssemblyDescriptor {
		i32 11776, ; uint32_t uncompressed_file_size
		i1 false, ; bool loaded
		i32 2829824; uint32_t buffer_offset
	}, ; 31: Mono.Android.Runtime
	%struct.CompressedAssemblyDescriptor {
		i32 342016, ; uint32_t uncompressed_file_size
		i1 false, ; bool loaded
		i32 2841600; uint32_t buffer_offset
	} ; 32: Mono.Android
], align 4

@uncompressed_assemblies_data_size = dso_local local_unnamed_addr constant i32 3183616, align 4

@uncompressed_assemblies_data_buffer = dso_local local_unnamed_addr global [3183616 x i8] zeroinitializer, align 1

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
