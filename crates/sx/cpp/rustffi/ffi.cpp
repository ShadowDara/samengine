#include "ffi.hpp"

// Global state for loaded commands
static KVPMAP* g_loaded_commands = nullptr;
static bool g_initialized = false;

// Helper function to get the configuration file path
static std::string get_config_path() {
    // Typically the config is in the home directory with filename sx.conf
    return getHomeDirectory() + "/sx.conf";
}

// Initialize the SX system
int init_sx() {
    if (g_initialized) {
        return 0; // Already initialized
    }

    try {
        // Create a new KVPMAP for storing commands
        g_loaded_commands = new KVPMAP();
        g_initialized = true;
        return 0;
    }
    catch (const std::exception& e) {
        std::cerr << "Error initializing SX: " << e.what() << "\n";
        return 1;
    }
}

// Load all commands from the SX configuration file
int load_commands() {
    if (!g_initialized) {
        if (init_sx() != 0) {
            return 1;
        }
    }

    try {
        std::string config_path = get_config_path();
        
        // Load the configuration file
        // The KVPMAP will parse the file and store key-value pairs
        if (!g_loaded_commands->load(config_path)) {
            std::cerr << "Error loading configuration file: " << config_path << "\n";
            return 1;
        }

        std::cout << "Commands loaded successfully from: " << config_path << "\n";
        return 0;
    }
    catch (const std::exception& e) {
        std::cerr << "Error loading commands: " << e.what() << "\n";
        return 1;
    }
}

// Execute a command by its shortcut name
int execute_command(const char* command_name, const char* args) {
    if (!g_initialized || !g_loaded_commands) {
        std::cerr << "SX system not initialized. Call init_sx() and load_commands() first.\n";
        return 1;
    }

    if (!command_name || command_name[0] == '\0') {
        std::cerr << "Error: command_name cannot be null or empty\n";
        return 1;
    }

    try {
        // Check if the command exists
        auto val = g_loaded_commands->get(command_name);
        if (!val) {
            std::cerr << "Shortcut not found: " << command_name << "\n";
            return 1;
        }

        // Get the base command
        std::string command = *val;

        // Append additional arguments if provided
        if (args && args[0] != '\0') {
            command += " ";
            command += args;
        }

        // Get the shell preferences from config
        std::string linux_shell = g_loaded_commands->get("--linux-default-shell").value_or("bash");
        std::string windows_shell = g_loaded_commands->get("--windows-default-shell").value_or("cmd");

        // Check if we should echo the command
        auto echo_val = g_loaded_commands->get("--echo-commands");
        if (echo_val && *echo_val == "true") {
            std::cout << command << "\n";
        }

        // Execute the command
        int return_code = runCommand(command, linux_shell, windows_shell);
        
        return return_code;
    }
    catch (const std::exception& e) {
        std::cerr << "Error executing command: " << e.what() << "\n";
        return 1;
    }
}

// Get all loaded commands as a string
const char* get_loaded_commands() {
    if (!g_initialized || !g_loaded_commands) {
        static const char* error_msg = "SX system not initialized";
        return error_msg;
    }

    try {
        // Create a static string to hold the result
        static std::string commands_list;
        commands_list.clear();

        // Iterate through all commands and build a comma-separated list
        // Note: This depends on the KVPMAP interface - adjust based on actual API
        bool first = true;
        
        // The actual implementation depends on how KVPMAP exposes its data
        // For now, we'll return a placeholder that would need to be adapted
        // to the actual KVPMAP API
        
        if (commands_list.empty()) {
            commands_list = "Commands loaded successfully";
        }
        
        return commands_list.c_str();
    }
    catch (const std::exception& e) {
        std::cerr << "Error getting commands list: " << e.what() << "\n";
        static const char* error_msg = "Error retrieving commands";
        return error_msg;
    }
}

// Check if a specific command exists
bool command_exists(const char* command_name) {
    if (!g_initialized || !g_loaded_commands) {
        std::cerr << "SX system not initialized\n";
        return false;
    }

    if (!command_name || command_name[0] == '\0') {
        return false;
    }

    try {
        auto val = g_loaded_commands->get(command_name);
        return val.has_value();
    }
    catch (const std::exception& e) {
        std::cerr << "Error checking command existence: " << e.what() << "\n";
        return false;
    }
}
