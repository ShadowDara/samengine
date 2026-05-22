// Rust Lib for SX with bindings

mod bridge;

/// Load all commands from the SX configuration file
/// Returns: 0 on success, non-zero on error
pub fn load_commands() -> i32 {
    return bridge::ffi::load_commands();
}

/// Execute a command by its shortcut name
/// command_name: the shortcut name of the command to execute
/// args: space-separated arguments to pass to the command
/// Returns: the exit code of the executed command
pub fn execute_command(command_name: &str, args: &str) -> i32 {
    return bridge::ffi::execute_command(command_name, args);
}

/// Get all loaded commands as a string (for debugging)
/// Returns: a comma-separated list of all command names
pub fn get_loaded_commands() -> String {
    return bridge::ffi::get_loaded_commands();
}

/// Check if a specific command exists
/// command_name: the shortcut name to check
/// Returns: true if the command exists, false otherwise
pub fn command_exists(command_name: &str) -> bool {
    return bridge::ffi::command_exists(command_name);
}

/// Initialize the SX system with default config
/// Returns: 0 on success, non-zero on error
pub fn init_sx() -> i32 {
    return bridge::ffi::init_sx();
}

/// Delete the Data from the RAM
/// Executing Commands afterwards will lead to an Error because
/// they are not loaded anymore!
/// Rreturns:  0 on success, non-zero on error
pub fn deinit_sx() -> i32 {
    return bridge::ffi::deinit_sx();
}
