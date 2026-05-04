// Main file for the Multi Tool

#include <iostream>
#include <charconv>
#include <filesystem>

#include "../sx-multi/sx-multi_config.hpp"
#include "../sx-multi/sx-multi.hpp"
#include <sx_lib/sx_lib.hpp>


namespace fs = std::filesystem;


// Main function for the Multi Tool
int main(int argc, char* argv[])
{
	if (argc >= 2)
	{
		// Print Help if requested
		if (std::string(argv[1]) == "--help" || std::string(argv[1]) == "-h")
		{
			return printhelp_multi();
		}
	}
	
	// Config
	auto config = loadConfig();

	// Check if Argumentsare here
	if (argc < 2)
	{
		std::cout << RED "Please run with at least one argument or --help or -h." END "\n";
		return 1;
	}

	// Check if the numberguess game should be started
	if (std::string(argv[1]) == "--numberguess" || std::string(argv[1]) == "-n")
	{
		// Number Guess Config
		auto numberguessConfig = SXLibConfig("numberguess");

		//std::cout << numberguessConfig.getSetting("lol", config);
		
		std::string minS = numberguessConfig.getSetting("min", config);
		std::string maxS = numberguessConfig.getSetting("max", config);
		
		int min;
		int max;
		
		auto result = std::from_chars(minS.data(), minS.data() + minS.size(), min);
		auto result2 = std::from_chars(maxS.data(), maxS.data() + maxS.size(), max);
		
		if (result.ec == std::errc() && result2.ec == std::errc())
		{
			numberguess(min, max);
		}
		else
		{
			numberguess(1, 1000);
		}

		return 0;
	}

	// Check for the loadtime function
	if (std::string(argv[1]) == "--loadtime" || std::string(argv[1]) == "-l")
	{
		std::string content = "";
		bool useOtherConfig = true;

		if (argc > 2)
		{
			std::string filename = argv[2];

			std::cout << "Trying to load file: " << filename << std::endl;

			std::ifstream file{ filename };
			if (!file) {
				perror("Could not open Config File\n");
				useOtherConfig = false;
			}

			content = std::string(
				(std::istreambuf_iterator<char>(file)),
				std::istreambuf_iterator<char>()
			);
		}
		else
		{
			useOtherConfig = false;
		}

		loadtime(useOtherConfig, content);
		return 0;
	}

	// Check for Foldersize
	if (std::string(argv[1]) == "--foldersize" || std::string(argv[1]) == "-f")
	{
		std::string path = ".";
		if (argc > 2)
		{
			path = argv[2];
		}
		foldersize(path);
		return 0;
	}

	// View Current Folder
	if (std::string(argv[1]) == "--viewfolder")
	{
		std::cout << fs::current_path() << std::endl;
		return 0;
	}

	// Create a File
	if (std::string(argv[1]) == "f" || std::string(argv[1]) == "--file")
	{
		if (argc > 2)
		{
			std::string filename = argv[2];
			std::ofstream file{ filename };
			if (!file) {
				perror("Could not create file\n");
				return 1;
			}
			std::cout << "File created: " << filename << std::endl;
			return 0;
		}
		else
		{
			std::cerr << "Please provide a filename.\n";
		}
	}

	// View / delete empty Folders
	if (std::string(argv[1]) == "viewempty")
	{
		if (argc > 2)
		{
			remove_empty_dirs(argv[2], true);
			return 0;
		}
		else
		{
			std::cerr << "Please Provide a start path as the 2nd Argument!\n";
		}
	}

	// Delete Empty
	if (std::string(argv[1]) == "rmempty")
	{
		if (argc > 2)
		{
			remove_empty_dirs(argv[2], false);
			return 0;
		}
		else
		{
			std::cerr << "Please Provide a start path as the 2nd Argument!\n";
		}
	}

	// Create a File
	if (std::string(argv[1]) == "c")
	{
		if (argc > 2)
		{
			std::string filename = argv[2];
			std::ofstream file{ filename };
			if (!file) {
				perror("Could not create file\n");
				return 1;
			}
			std::cout << "File created: " << filename << std::endl;
			return 0;
		}
		else
		{
			std::cerr << "Please provide a filename.\n";
		}
	}

	// TODO
	// find greatest folders
	if (std::string(argv[1]) == "findgreatest")
	{
		if (argc <= 2)
		{
			std::cerr << "Please provide a second Argument for the Start Dir";
		}

		for (auto& entry : fs::directory_iterator(argv[2])) {
			if (fs::is_directory(entry.path())) {
				uintmax_t size = folder_size(entry.path());

				std::cout << entry.path() << " -> "
					<< (size / (1024 * 1024)) << " MB\n";
			}
		}
	}

	// stats DB
	/*
	if (std::string(argv[1]) == "stats")
	{
		// Load DB
		// add value
		// Save DB
		if (argc <= 2)
		{
			return 1;
		}

		addstats(argv[2]);
	}

	// View the Stats from SX
	if (std::string(argv[1]) == "viewstats")
	{
		viewstats();
	}
	*/

	return 1;
}
