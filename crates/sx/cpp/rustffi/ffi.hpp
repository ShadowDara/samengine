#pragma once

#include "../sx/sx.hpp"
#include "../kvp/kvp2.hpp"

#include <string>
#include <fstream>
#include <iostream>

#include "rust/cxx.h"

// C++ FFI functions for Rust
// These functions load and execute SX commands

/// Load all commands from the SX configuration file
/// Reads from homeDir/sx.conf following the same pattern as sx_lib.cpp
/// @return 0 on success, non-zero on error
int load_commands();

/// Execute a command by its shortcut name with additional arguments
/// @param command_name The shortcut name of the command to execute
/// @param args Space-separated arguments to pass to the command
/// @return The exit code of the executed command
int execute_command(rust::Str command_name, rust::Str args);

/// Get all loaded commands as a string (for debugging/listing)
/// @return A comma-separated list of all command names
rust::String get_loaded_commands();

/// Check if a specific command exists in the loaded configuration
/// @param command_name The shortcut name to check
/// @return true if the command exists, false otherwise
bool command_exists(rust::Str command_name);

/// Initialize the SX system with default configuration
/// @return 0 on success, non-zero on error
int init_sx();

/// Delete the Data from the RAM
/// Executing Commands afterwards will lead to an Error because
/// they are not loaded anymore!
/// @return 0 on success, non-zero on error
int deinit_sx();
