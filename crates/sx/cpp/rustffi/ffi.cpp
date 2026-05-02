#include "ffi.hpp"
#include <fstream>
#include <iostream>

// Global state for loaded commands
static KVPMAP* g_loaded_commands = nullptr;
static bool g_initialized = false;

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

// Load all commands from the SX configuration file (following sx_lib.cpp pattern)
int load_commands() {
    if (!g_initialized) {
        if (init_sx() != 0) {
            return 1;
        }
    }

    try {
        // Get Home Directory
        auto homeDir = getHomeDirectory();

        // Load KVP File
        std::ifstream file{ homeDir + "/sx.conf" };
        if (!file) {
            std::cerr << RED "Could not open Config File" END << std::endl;
            return 1;
        }

        // Read the entire file content
        std::string content(
            (std::istreambuf_iterator<char>(file)), std::istreambuf_iterator<char>()
        );

        // Parse the KVP content
        *g_loaded_commands = parse_kvp2(content);

        std::cout << "Commands loaded successfully from: " << homeDir << "/sx.conf\n";
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
std::string get_loaded_commands() {
    if (!g_initialized || !g_loaded_commands) {
        return "SX system not initialized";
    }

    try {
        std::string result;
        bool first = true;

        // Iterate through all commands and build a comma-separated list
        for (const auto& [key, value] : g_loaded_commands->get_data()) {
            if (!first) {
                result += ", ";
            }
            result += key;
            first = false;
        }

        return result;
    }
    catch (const std::exception& e) {
        std::cerr << "Error getting commands list: " << e.what() << "\n";
        return "Error retrieving commands";
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
