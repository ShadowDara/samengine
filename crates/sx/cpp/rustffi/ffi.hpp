#pragma once

#include <string>
#include <memory>

#include <unordered_map>
#include <sstream>

#include "../sx/sx.hpp"

// Forward declarations for cxx bridge
namespace rust {
    template<typename T>
    class Box;
}

// C++ FFI functions for Rust
// These functions load and execute SX commands

/// Load all commands from the SX configuration file
/// @return 0 on success, non-zero on error
int load_commands();

/// Execute a command by its shortcut name with additional arguments
/// @param command_name The shortcut name of the command to execute
/// @param args Space-separated arguments to pass to the command
/// @return The exit code of the executed command
int execute_command(const char* command_name, const char* args);

/// Get all loaded commands as a string (for debugging/listing)
/// @return A comma-separated list of all command names
const char* get_loaded_commands();

/// Check if a specific command exists in the loaded configuration
/// @param command_name The shortcut name to check
/// @return true if the command exists, false otherwise
bool command_exists(const char* command_name);

/// Initialize the SX system with default configuration
/// @return 0 on success, non-zero on error
int init_sx();
