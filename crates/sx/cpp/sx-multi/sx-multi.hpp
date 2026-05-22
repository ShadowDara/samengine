#pragma once

#include <iostream>
#include <random>
#include <chrono>
#include <filesystem>

#include <sx_lib/sx_lib.hpp>
#include "sx-multi_config.hpp"

#include <kvpdb/kvp_int_db.hpp>


// Function to print the help message for the Multi Tool
int printhelp_multi();

// Function to run the number guessing game
void numberguess(int min, int max);

// Function to check the Time it took to load the config file
void loadtime(bool useOtherConfig, const std::string& content);

// Function to calculate the size of a folder
std::uintmax_t folder_size(const std::filesystem::path& path);

// Function to check the size of a folder
void foldersize(const std::string& path);

// Function to view every empty folder
void remove_empty_dirs(const std::filesystem::path& dir, bool dry_run);

/*
// Function to add Stats
void addstats(std::string stats);

// View stats
void viewstats();
*/
