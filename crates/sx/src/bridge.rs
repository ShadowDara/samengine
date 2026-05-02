#[cxx::bridge]
pub mod ffi {
    // Rust Functions
    // 
    // Load Commands from configuration file
    // Execute Command by name with arguments
    
    unsafe extern "C++" {
        include!("rustffi/ffi.hpp");

        // Load all commands from the SX configuration file
        // Returns: 0 on success, non-zero on error
        pub fn load_commands() -> i32;

        // Execute a command by its shortcut name
        // command_name: the shortcut name of the command to execute
        // args: space-separated arguments to pass to the command
        // Returns: the exit code of the executed command
        pub fn execute_command(command_name: &str, args: &str) -> i32;

        // Get all loaded commands as a string (for debugging)
        // Returns: a comma-separated list of all command names
        pub fn get_loaded_commands() -> String;

        // Check if a specific command exists
        // command_name: the shortcut name to check
        // Returns: true if the command exists, false otherwise
        pub fn command_exists(command_name: &str) -> bool;

        // Initialize the SX system with default config
        // Returns: 0 on success, non-zero on error
        pub fn init_sx() -> i32;
    }
}
