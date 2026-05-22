# SX_LIB
#
# Standard Libary for SX by Shadowdara
#
# licensed under MIT 2026 by Shadowdara
#

cmake_minimum_required(VERSION 3.13)
project(sx_lib)

add_library(sx_lib)
target_include_directories(sx_lib PUBLIC "${CMAKE_CURRENT_SOURCE_DIR}/include/")
target_sources(sx_lib PRIVATE
	"${CMAKE_CURRENT_SOURCE_DIR}/src/sx_lib.cpp"
	"${CMAKE_CURRENT_SOURCE_DIR}/src/sx_lib_oscore.cpp"
)
set_property(TARGET sx_lib PROPERTY CXX_STANDARD 20)

# Linken gegen kvp_lib
target_link_libraries(sx_lib PUBLIC kvp)
