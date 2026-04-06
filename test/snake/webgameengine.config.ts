// Project File for the Game

import type { buildconfig } from "@shadowdara/webgameengine/build";
import { new_buildconfig } from "@shadowdara/webgameengine/build";

export default function defineConfig(): buildconfig {
    let config: buildconfig = new_buildconfig();
    config.show_fullscreen_button = false;
    return config;
}
