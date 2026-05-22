#include "sx-multi.hpp"

namespace fs = std::filesystem;

#pragma region Help

// Function to print the help message for the Multi Tool
int printhelp_multi()
{
	std::cout 
		<< "This is the Multi Tool. It is a collection of small tools and games.\n"
		<< "\n"
		<< "Currently it includes:\n"
		<< " --numberguess, -n: A simple number guessing game.\n"
		<< " --loadtime, -l: Check the time it took to load the config file.\n"
		<< " --foldersize, -f: Check the size of a folder.\n"
		<< " --viewfolder: Display the Current Excution Folder in the Terminal\n"
		<< " --file, f: create a file\n"
		<< " viewempty: view every empty folder from a startpath\n"
		<< " rmempty: remove empty Folders\n"
		<< " c: create a file with the next argument as the filename\n"
		//<< " viewstats: view the stats for commands from SX\n"
		<< "\n"
		<< "Usage:\n"
		<< " - Run the program and follow the instructions for the selected tool or game.\n"
		<< "\n"
		<< GREEN "SX Multi Version " << Version << " Built at " << BuildTime << "\n" END
	;
	return 0;
}

#pragma endregion

#pragma region NumberGuess

// Function to run the number guessing game
void numberguess(int min, int max)
{
	// Gen random Number
	std::random_device rd;
	std::mt19937 gen(rd()); // Zufallsgenerator

	// Zahlen von 1 bis 1000
	std::uniform_int_distribution<> dist(min, max);

	int zufall = dist(gen);

	std::cout << "Guess the Number between " << min << " and "
		<< max << " \n";

	while (true)
	{
		int zahl;
		std::cin >> zahl;

		if (zahl == zufall)
		{
			std::cout << "Correct! The number was " << zufall << ".\n";
			break;
		}
		else if (zahl < zufall)
		{
			std::cout << "Too low! Try again.\n";
		}
		else
		{
			std::cout << "Too high! Try again.\n";
		}
	}
}

#pragma endregion

#pragma region LoadTime

// Function to check the Time it took to load the config file
void loadtime(bool useOtherConfig, const std::string& content)
{
	if (useOtherConfig)
	{
		std::cout << "Loading config from file: " << content << "\n";

		auto start = std::chrono::high_resolution_clock::now();

		auto config = loadConfigfromString(content);

		auto end = std::chrono::high_resolution_clock::now();

		std::chrono::duration<double> elapsed = end - start;

		std::cout << "Time to load config: " << elapsed.count() << " seconds\n";
	}
	else
	{
		std::cout << "Loading config from default file: sx.conf\n";

		auto start = std::chrono::high_resolution_clock::now();

		auto config = loadConfig();

		auto end = std::chrono::high_resolution_clock::now();

		std::chrono::duration<double> elapsed = end - start;

		std::cout << "Time to load config: " << elapsed.count() << " seconds\n";
	}

	return;
}

#pragma endregion

#pragma region FolderSize

std::uintmax_t folder_size(const fs::path& path)
{
	std::uintmax_t size = 0;

	for (const auto& entry : fs::recursive_directory_iterator(path))
	{
		if (fs::is_regular_file(entry))
		{
			size += fs::file_size(entry);
		}
	}

	return size;
}


// Function to check the size of a folder
void foldersize(const std::string& path)
{
	try
	{
		auto size = folder_size(path);
		std::cout << "Ordnergröße: " << size << " Bytes\n";
	}
	catch (const fs::filesystem_error& e)
	{
		std::cerr << "Fehler: " << e.what() << '\n';
	}
}

#pragma endregion

// Function to view every empty Folder
void remove_empty_dirs(const fs::path& dir, bool dry_run) {
	std::error_code ec;

	for (const auto& entry : fs::directory_iterator(dir, ec)) {
		if (entry.is_directory(ec) && !ec) {
			remove_empty_dirs(entry.path(), dry_run);
		}
	}

	// Nach den Unterordnern prüfen (bottom-up)
	if (fs::is_empty(dir, ec) && !ec) {
		if (dry_run) {
			std::cout << "[DRY] Würde löschen: " << dir << '\n';
		}
		else {
			std::cout << "Lösche: " << dir << '\n';
			fs::remove(dir, ec);

			if (ec) {
				std::cerr << "Fehler beim Löschen: " << ec.message() << '\n';
			}
		}
	}
}

/*
// Stats
void addstats(const std::string& stats) {
    std::string filename = "stats.bin";
    std::string lockfile = filename + ".lock";

    // Lock holen
    if (!KeyValueDBSInt::acquire_lock(lockfile, 5000)) { // z.B. 5 Sekunden Timeout
        std::cerr << "Datei wird gerade von einem anderen Prozess benutzt.\n";
        return;
    }

    try {
        // Map einlesen
        auto data = KeyValueDBSInt::read_map(filename);

        // Key erhöhen oder neu anlegen
        if (data.find(stats) != data.end()) {
            data[stats] += 1;
        } else {
            data[stats] = 1;
        }

        // Map wieder schreiben
        KeyValueDBSInt::write_map(data, filename);

    } catch (const std::exception& e) {
        KeyValueDBSInt::release_lock(lockfile);
        throw; // Fehler weitergeben
    }

    // Lock freigeben
    KeyValueDBSInt::release_lock(lockfile);
}

// View Stats
void viewstats()
{
    std::string filename = "stats.bin";

    try {
        // Map einlesen
        auto data = KeyValueDBSInt::read_map(filename);

        if (data.empty()) {
            std::cout << "Keine Stats vorhanden.\n";
            return;
        }

        // Stats ausgeben
        std::cout << "=== Stats ===\n";
        for (const auto& [key, value] : data) {
            std::cout << key << " : " << value << "\n";
        }
        std::cout << "=============\n";

    } catch (const std::exception& e) {
        std::cerr << "Fehler beim Einlesen der Stats: " << e.what() << "\n";
    }
}
*/
