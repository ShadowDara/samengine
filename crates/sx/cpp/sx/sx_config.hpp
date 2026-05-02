#pragma once

#include <vector>


// Config Struct for SX
struct Config {
    // to Override the Start Message
    bool NewStartMessage = false;

    // To enable local Commands in every Directory
    bool EnableLocalCommands = false;
    // To decide which Commands should be overwritten
    bool OverrideGlobalCommands = true;
};

// Version and ca Buildtime
#define Version "0.2.3"
#define BuildTime "March 2026"
