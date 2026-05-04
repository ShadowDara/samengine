# CMakeList.txt: CMake-Projekt für "sx". Schließen Sie die Quelle ein, und definieren Sie
# projektspezifische Logik hier.
#
cmake_minimum_required (VERSION 3.10)

# Aktivieren Sie Hot Reload für MSVC-Compiler, sofern unterstützt.
if (POLICY CMP0141)
  cmake_policy(SET CMP0141 NEW)
  set(CMAKE_MSVC_DEBUG_INFORMATION_FORMAT "$<IF:$<AND:$<C_COMPILER_ID:MSVC>,$<CXX_COMPILER_ID:MSVC>>,$<$<CONFIG:Debug,RelWithDebInfo>:EditAndContinue>,$<$<CONFIG:Debug,RelWithDebInfo>:ProgramDatabase>>")
endif()

# Options for MSVC to use UTF-8 encoding for source files
if (MSVC)
  add_compile_options(/utf-8)		# add UTF-8
  add_compile_options(/arch:AVX2)	# make sure SIMD optimizations take place
  add_compile_options(/Gy)   # function-level linking
  add_link_options(/OPT:REF) # remove unused functions
endif()

# Link Time Optimization (LTO) aktivieren für Release-Builds
set(CMAKE_INTERPROCEDURAL_OPTIMIZATION_RELEASE TRUE)

# Add the KVP Lib
add_subdirectory(kvp)
add_subdirectory(kvpdb)
add_subdirectory(sx_lib)


# Shortcuter Executable
project ("sx")

# Fügen Sie der ausführbaren Datei dieses Projekts eine Quelle hinzu.
add_executable (sx
	"tools/sx_main.cpp"
	"sx_lib/src/sx_lib_oscore.cpp"
	"sx_lib/src/sx_lib.cpp"
	"sx/sx.cpp"
)

# Link the Libarys to the Target
target_link_libraries(sx kvp sx_lib)

if (CMAKE_VERSION VERSION_GREATER 3.12)
  set_property(TARGET sx PROPERTY CXX_STANDARD 20)
endif()


# MultiTool Executable
project("sx-multi")

add_executable(sx-multi
	"tools/sx-multi_main.cpp"
	"sx-multi/sx-multi.cpp"
	"sx_lib/src/sx_lib.cpp"
	"sx_lib/src/sx_lib_oscore.cpp"
)

# Link the Libarys to the Target
target_link_libraries(sx-multi kvp sx_lib kvpdb)

if (CMAKE_VERSION VERSION_GREATER 3.12)
  set_property(TARGET sx-multi PROPERTY CXX_STANDARD 20)
endif()


# Test Project
project("test")

add_executable(test
	"tools/test.cpp"
	"sx-multi/sx-multi.cpp"
	"sx_lib/src/sx_lib.cpp"
	"sx_lib/src/sx_lib_oscore.cpp"
)

# Link the Libarys to the Target
target_link_libraries(test kvp sx_lib kvpdb)

if (CMAKE_VERSION VERSION_GREATER 3.12)
  set_property(TARGET test PROPERTY CXX_STANDARD 20)
endif()
