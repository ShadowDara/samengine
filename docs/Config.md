# samengine Config

<!--$$MD_INDEX_START$$-->
<!-- 
    Index by Automatic MD Index
    a simple Tool to Index your Markdown files like this

    More Infos:
    https://github.com/ShadowDara/automatic-md-index

    DO NOT REMOVE THIS CREDIT !!!

    Last Update Time of the Index:
    2026-04-22T15:30:23.305Z
-->

## Index
- [samengine Config](#samengine-config)
  - [Paragraphs](#paragraphs)
    - [How to add them](#how-to-add-them)
<!-- Index by Automatic MD Index -->
<!--$$MD_INDEX_END$$-->

Basic Config for samengine.

```ts
import type { buildconfig } from "samengine-build";
import { new_buildconfig } from "samengine-build";

export default function defineConfig(): buildconfig {
    let config: buildconfig = new_buildconfig();
    config.title = "New Game";
    return config;
}
```

other Values for the Build Config are:

```ts
export default function defineConfig(): buildconfig {
    let config: buildconfig = new_buildconfig();

    // Change the Ouput Directory
    config.outdir = "dist";

    // a Button which enabled to play your Game in Fullscreen
    config.show_fullscreen_button = true;

    // Version of your Game
    config.version = "0.0.0";

    // Insert Stuff to the HEAD Element of the HTML Export
    // for example an Browser Page Icon
    config.htmlhead = "";

    // The Game Author (will be mentioned on the Game startpage)
    config.author = "you";

    // The Webserver Port for the Develepment Server
    config.dev_server_port = 3000;

    return config;
}
```

## Paragraphs

You can add Paragraphs which will then be displayed on the Game Startpage,
for exapmle for Credits, Infos about the Game ... Just be creative, write
there what ever you want

### How to add them

```ts
export default function defineConfig(): buildconfig {
    let config: buildconfig = new_buildconfig();

    config.markdown_notes = [
        {
            title: "New Note",
            content: `# Here can you write markdown`
        },

        // You can althogh add optinal Styles here
        {
            title: "Note 2",
            content: "Content 2",
            style: {
                color: "",
                bg_color: ""
            }
        }
    ];

    return config;
}
```
