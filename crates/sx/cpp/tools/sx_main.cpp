// Shortcuter.cpp: Definiert den Einstiegspunkt für die Anwendung.
//

#include <sx_lib/sx_lib_oscore.hpp>
#include "sx_lib/sx_lib.hpp"

#include <kvp/kvp2.hpp>

#include <iostream>
#include <string>

// Include the Shortcuter Header File
#include "../sx/sx.hpp"
#include "../sx/sx_config.hpp"


// Main function for Shortcuter
int main(int argc, char *argv[])
{
	// Enable UTF8 on Windows
	enableUTF8Support();

	// Create a new Config
	Config config;

	if (argc >= 2)
	{
		// Print Info
		if (std::string(argv[1]) == "--info" || std::string(argv[1]) == "-i")
		{
			return printinfo();
		}

		// Print Version
		if (std::string(argv[1]) == "--version" || std::string(argv[1]) == "-v")
		{
			std::cout << Version "\n";
			return 0;
		}

		// Print Help if requested
		if (std::string(argv[1]) == "--help" || std::string(argv[1]) == "-h")
		{
			return printhelp();
		}
	}

	// Load the Shortcuts
	auto result = loadConfig();

	config.NewStartMessage = checkBoolEntry(result, "--overwrite-start-message");
	config.EnableLocalCommands = checkBoolEntry(result, "--enable-local-commands");
	config.OverrideGlobalCommands = checkBoolEntry(result, "--override-global-commands");

	// Check if Local Commands are enable
	if (config.EnableLocalCommands == true)
	{
		auto localConfig = loadLocalConfig();
		if (config.OverrideGlobalCommands == true)
		{
			merge_maps(result, localConfig);
		}
		else
		{
			merge_maps(localConfig, result);
			result = localConfig;
		}
	}

	// Check if Argumentsare here
	if (argc < 2)
	{
		// When the New start Message is False
		if (!config.NewStartMessage)
		{
			std::cout << "Please run with at least one argument or --help or -h.\n";
		}
		else
		{
			// printf("New Message should be added here\n");
			printNewStartMessage(result);
		}
		return 1;
	}

	// Print View
	// Iterate over the result and print the key-value pairs
	if (std::string(argv[1]) == "--view" || std::string(argv[1]) == "-vi")
	{
		// Iterieren und ausgeben
		for (const auto& [key, value] : result.get_data()) {
			std::cout << key << " => " << value << '\n';
		}

		return 0;
	}

	// Run a Command to overwrite the other
	if (std::string(argv[1]) == "--command" || std::string(argv[1]) == "-c")
	{
		// Remove the --command from the Array
		if (argc > 1)
		{
			for (int i = 1; i < argc - 1; ++i)
			{
				argv[i] = argv[i + 1];
			}
			argv[argc - 1] = nullptr;
			--argc;
		}

		return runShortcut(argc, argv, result);
	}

	// // Change a Command
	// if (std::string(argv[1]) == "--change-command")
	// {
	// 	return changeCommand(argc, argv);
	// }

	// Run Shortcut
	return runShortcut(argc, argv, result);
}
