#include "sx.hpp"


using namespace KeyValueParser2;


// for the unordered Map
// to change it easily here
using MAP = std::unordered_map<std::string, std::string>;
using KVPMAP = KeyValueParser2::KeyValueStore<MAP>;


// Function to print the help message
int printhelp()
{
	std::cout
		<< GREEN "Usage: shortcuter [Command Shortcut] {Arguments ...}\n" END
		<< "\n"
		<< YELLOW "Example Configuration File:\n" END
		<< "\n"
		<< "# Config File for shortcuter\n"
		<< "# \n"
		<< "# Lines which start with #, are comments!\n"
		<< "# \n"
		<< "# Add KeyValuePairs here not for command shortcuts\n"
		<< "# The left is the shortcut and the right is the long command\n"
		<< "# which will be executed!\n"
		<< "#\n"
		<< "# All Arguments after the the shortcut command will be added\n"
		<< "# to the runned command!\n"
		<< "#\n"
		<< "hi=echo Hallo World\n"
		<< "\n"
		<< "Save the Config File at:\n"
		<< getHomeDirectory() << "\n"
		<< "\n"
		<< CYAN "[OPTIONS]" END "\n"
		<< "--view, -vi\tView all shortcuts\n"
		<< "--version, -v\tprint the Version\n"
		<< "--info, -i\tget Info about the Program Data\n"
		<< "--command, -c\tstart a command\n"
		<< "\n"
		<< GREEN "SX Version " << Version << " Built at " << BuildTime << "\n" END
	;
	return 0;
}


// Function to print Info
int printinfo()
{
	std::cout << "SX by Shadowdara Version " << Version << " Built at " << BuildTime << "\n";
	return 0;
}


// Function to run the shortcut command
int runShortcut(int argc, char* argv[],
	KVPMAP& result)
{
	// Check if shortcut exists
	auto val = result.get(argv[1]);
	if (!val)
	{
		std::cout << "Shortcut not found: " << argv[1] << "\n";
		return 1;
	}
	
	// Base command from config
	std::string command = *val;

	auto val2 = result.get("--echo-commands");

	if (*val2 == "true")
	{
		std::cout << command << "\n";
	}

	// Append additional arguments
	for (int i = 2; i < argc; ++i)
	{
		command += " ";
		command += argv[i];
	}

	std::string linshell = result.get("--windows-default-shell").value_or("");
	std::string winshell = result.get("--linux-default-shell").value_or("");

	// Execute
	auto returncode = runCommand(
		command,
		linshell,
		winshell
	);

	//printf("Command returned with code %d\n", returncode);

	return returncode;
}


// Function to print the new Start Message
// while be first searched for the file path from the hash map and then
// the File path will be loaded, and file content will be written to the
// Terminal
void printNewStartMessage(KVPMAP& result)
{
	auto val = result.get("--start-message-file");
	if (!val)
	{
		std::cout << "Start Message File Entry not found!\n";
		return;
	}

	std::string NewStartMessageFile = *val;

	std::ifstream file(getHomeDirectory() + "/" + NewStartMessageFile); // Datei öffnen

	if (!file) { // Prüfen, ob die Datei existiert
        std::cerr << "Error while opening the File " << NewStartMessageFile
			<< "! Does it exist?\n";
        return;
    }

#pragma region Color

	std::string color = WHITE;

	// Get the Color
	auto it3 = result.get("--start-message-color");
	if (!it3)
	{
		
	}
	else
	{
		if (*it3 == "Black")
		{
			color = BLACK;
		}
		else if (*it3 == "Red")
		{
			color = RED;
		}
		else if (*it3 == "Green")
		{
			color = GREEN;
		}
		else if (*it3 == "Yellow")
		{
			color = YELLOW;
		}
		else if (*it3 == "Blue")
		{
			color = BLUE;
		}
		else if (*it3 == "Purple")
		{
			color = PURPLE;
		}
		else if (*it3 == "Cyan")
		{
			color = CYAN;
		}
	}

#pragma endregion

    std::string line;
    while (std::getline(file, line))
	{
		// Zeilenweise lesen
        std::cout << color << line << END << std::endl;      // In die Konsole ausgeben
    }

    file.close(); // optional, da Destruktor automatisch schließt

	auto it2 = result.get("--add-info-to-start-message");
	if (!it2)
	{
		return;
	}

	if (*it2 == "true")
	{
		std::cout << GREEN "SX Version " Version " - BuildTime " BuildTime END"\n";
	}

    return;
}


// // Function to change a Command
// int changeCommand(int argc, char* argv[])
// {
// 	// 0 Name
// 	// 1 call this
// 	// 2 Mode
// 	// 3 Entryname

// 	if (argc < 4)
// 	{
// 		return 1;
// 	}

// 	std::string mode = argv[2];
// 	std::string entryname = argv[3];

// 	// Delete an Entry
// 	if (mode == "delete") {}

// 	// Append an Entry
// 	if (mode == "append") {}

// 	// Modify an Entry
// 	if (mode == "modify") {}
// }
