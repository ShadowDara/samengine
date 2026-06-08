
// Project File for the Game

import type { buildconfig } from "samengine-build";
import { new_buildconfig } from "samengine-build";

export default function defineConfig(): buildconfig {
    let config: buildconfig = new_buildconfig();
    config.title = "newprojcet";
    // config.enable_audio = false;
    config.entryname = "main.tsx";
    config.sfb.active = true;
    return config;
}
