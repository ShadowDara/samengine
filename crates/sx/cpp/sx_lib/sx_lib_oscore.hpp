#pragma once

//#define NOMINMAX
//#define WIN32_LEAN_AND_MEAN
//#include <windows.h>

#include <cstdlib>
#include <string>


// Function to get the user's home directory
// in a cross-platform way
std::string getHomeDirectory();

// Function to run a command in the system shell
int runCommand(
	const std::string& command,
	const std::string& terminal,
	const std::string& linuxterminal
);

// Function to enable UTF-8 support in the console
void enableUTF8Support();
