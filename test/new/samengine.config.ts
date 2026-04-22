
// Project File for the Game

import type { buildconfig } from "samengine-build";
import { new_buildconfig } from "samengine-build";

export default function defineConfig(): buildconfig {
    let config: buildconfig = new_buildconfig();
    config.title = "new2";
    config.settings.show_button = true;
    // config.markdown_notes = [{ title: "", content: ""}];
    return config;
}
