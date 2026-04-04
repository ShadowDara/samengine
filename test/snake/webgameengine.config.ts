// Project File for the Game

import type { buildconfig } from "webgameengine/build";
import { new_buildconfig } from "webgameengine/build";

export default function defineConfig(): buildconfig {
    let config: buildconfig = new_buildconfig();
    return config;
}
