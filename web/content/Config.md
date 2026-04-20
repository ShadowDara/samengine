# samengine Config

Basic Config

```js
import type { buildconfig } from "samengine-build";
import { new_buildconfig } from "samengine-build";

export default function defineConfig(): buildconfig {
    let config: buildconfig = new_buildconfig();
    config.title = "New Game";
    return config;
}
```
