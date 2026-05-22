#include <sx_lib/sx_lib.hpp>


using namespace KeyValueParser2;


// for the unordered Map
// to change it easily here
using MAP = std::unordered_map<std::string, std::string>;
using KVPMAP = KeyValueParser2::KeyValueStore<MAP>;


// Load the Config File and return a Map with the Settings
KVPMAP loadConfig()
{
	// Get Home Directory
	auto homeDir = getHomeDirectory();

	// Load KVP File
	std::ifstream file{ homeDir + "/sx.conf" };
	if (!file) {
		std::cerr << RED "Could not open Config File" END << std::endl;
		return {};
	}

	std::string content(
		(std::istreambuf_iterator<char>(file)), std::istreambuf_iterator<char>()
	);

	auto result = parse_kvp2(content);

	return result;
}


// Function to load the LocalConfig
KVPMAP loadLocalConfig()
{
	// Get Home Directory
	std::string currenrDir = std::filesystem::current_path().string();
	//std::cout << "Current Directory: " << currenrDir << std::endl;

	// Load KVP File
	std::ifstream file{ currenrDir + "/localsx.conf" };
	if (!file) {
		//std::cerr << RED "Could not open Config File" END << std::endl;
		return {};
	}

	std::string content(
		(std::istreambuf_iterator<char>(file)), std::istreambuf_iterator<char>()
	);

	auto result = parse_kvp2(content);

	return result;
}


// Load the Config File and return a Map with the Settings from
// the Argument given
KVPMAP loadConfigfromString(std::string arg)
{
	auto store = parse_kvp2(arg);

	return store;
}


// Load the Config and return the value for the given key
std::string SXLibConfig::getSetting(const std::string& key,
	KVPMAP settings)
{
	if (auto val = settings.get("--" + programName + "-" + key))
	{
		return val.value_or("");
	}
	return "";
}


// Function to check a Boolean Entry from the Config
bool checkBoolEntry(const KVPMAP& result,
	const std::string& name)
{
	// Check for Standard print overwriting
	if (auto val = result.get(name))
    {
        return val.value() == "true";
    }
    return false;
}


// Function to check an Integer Entry from the Config
// Default return is Zero when a problems occures
int checkIntEntry(const KVPMAP& result,
	const std::string& name)
{
	// Check for Standard print overwriting
	if (auto val = result.get(name))
	{
		int num = std::atoi(result.get(name).value_or("0").c_str());
	}

	return 0;
}
