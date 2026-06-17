
// Project File for the Game

import type { buildconfig } from "samengine-build";
import { new_buildconfig } from "samengine-build";

export default function defineConfig(): buildconfig {
    let config: buildconfig = new_buildconfig();
    config.title = "new2";
    // config.samegui.show_button = true;
    config.dev_server_port = 3001;
    // config.markdown_notes = [{ title: "", content: ""}];

    // EXAMPLE

    config.htmlMenu.enable_menu = true;

    config.htmlMenu.settings.push({
        id: "graphics",
        title: "Graphics",

        default_value: "low",

        options: [
            {
                text: "Low",
                value: "low",
            },

            {
                text: "High",
                value: "high",
            },
        ],
    });

    config.htmlMenu.settings.push({
        id: "sound",
        title: "Sound",

        default_value: "on",

        options: [
            {
                text: "ON",
                value: "on",
            },

            {
                text: "OFF",
                value: "off",
            },
        ],
    });

    config.releaseMode.singlefile = true;

    return config;
}
