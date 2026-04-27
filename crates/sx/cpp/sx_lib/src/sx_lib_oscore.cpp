#include <sx_lib/sx_lib_oscore.hpp>


// Function to get the user's home directory in a cross-platform way
std::string getHomeDirectory()
{
#ifdef _WIN32
    const char* home = std::getenv("USERPROFILE");
#else
    const char* home = std::getenv("HOME");
#endif

    if (home)
    {
        return std::string(home);
    }

    return "";
}


// Function to run a command in the system shell
int runCommand(
    const std::string& command,
    const std::string& windowsterminal,
    const std::string& linuxterminal
)
{
    std::string fullCommand;

#ifdef _WIN32

    if (windowsterminal.empty())
    {
        fullCommand = "cmd /C \"" + command + "\"";
    }
    else if (windowsterminal.find("powershell") != std::string::npos)
    {
        fullCommand = windowsterminal + " -Command \"" + command + "\"";
    }
    else if (windowsterminal.find("bash") != std::string::npos)
    {
        fullCommand = windowsterminal + " -c \"" + command + "\"";
    }
    else if (windowsterminal.find("wsl") != std::string::npos)
    {
        fullCommand = windowsterminal + " -e \"" + command + "\"";
    }
    else
    {
        // fallback
        fullCommand = windowsterminal + " /C \"" + command + "\"";
    }

#else

     if (linuxterminal.empty())
     {
         fullCommand = command;
     }
     else
     {
         fullCommand = linuxterminal + " -e \"" + command + "\"";
     }

     fullCommand = command;

#endif

    return std::system(fullCommand.c_str());
}


// Function to enable UTF-8 support in the console
void enableUTF8Support()
{
#ifdef _WIN32
    // Enable UTF-8 support in the Windows console
	//SetConsoleOutputCP(CP_UTF8);
#endif
}
