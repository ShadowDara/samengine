// Project File for the Game

import { buildconfig, new_buildconfig } from "./engine/build/buildconfig";

export function defineConfig(): buildconfig {
    let config: buildconfig = new_buildconfig();
    return config;
}
