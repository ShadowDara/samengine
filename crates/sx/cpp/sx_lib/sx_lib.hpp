// SX Libary
//
// This is the header file for the SX Library,
// which provides functions for loading the Settings and
// other useful functions for the extensions for theSX Tool.
//


#pragma once

#include <kvp/kvp2.hpp>

#include <sx_lib/sx_lib_oscore.hpp>

#include <sx_lib/ansicolors.hpp>

#include <string>
#include <vector>
#include <unordered_map>
#include <filesystem>


// for the unordered Map
// to change it easily here
using MAP = std::unordered_map<std::string, std::string>;
using KVPMAP = KeyValueParser2::KeyValueStore<MAP>;


// Function to load the Config File and return a Map with the Settings
KVPMAP loadConfig();

// Function to load the LocalConfig
KVPMAP loadLocalConfig();

// Load the Config File and return a Map with the Settings from
// the Argument given
KVPMAP loadConfigfromString(std::string arg);


// Config for SX Addons and Extensions
struct SXLibConfig {
	// Prefix for the Settings
	std::string programName;

	std::string getSetting(const std::string& key,
		KVPMAP settings);

	SXLibConfig(const std::string& name) : programName(name) {}
};


// Function to check a Boolean Entry from the Config
bool checkBoolEntry(const KVPMAP& result,
	const std::string& name);

// Function to check an Integer Entry from the Config
// Default return is Zero when a problems occures
int checkIntEntry(const KVPMAP& result,
	const std::string& name);
