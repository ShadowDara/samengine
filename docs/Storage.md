# Storage

Save String

```ts
import { StorageLib } from "./storage";

StorageLib.set("name", "Max");

const name = StorageLib.get<string>("name");

console.log(name);
// Max
```

Save Object

```ts
StorageLib.set("user", {
  id: 1,
  name: "Max",
  age: 25
});

const user = StorageLib.get<{
  id: number;
  name: string;
  age: number;
}>("user");

console.log(user?.name);
// Max
```

Export 

```ts
const json = StorageLib.exportToJson();

const blob = new Blob([json], {
  type: "application/json"
});

const url = URL.createObjectURL(blob);

const a = document.createElement("a");
a.href = url;
a.download = "storage-backup.json";
a.click();

URL.revokeObjectURL(url);
```

Import

```ts
const json = `
{
  "name": "Lisa",
  "age": 30
}
`;

StorageLib.importFromJson(json);
```

import from file

```js
const input = document.querySelector<HTMLInputElement>("#file");

input?.addEventListener("change", async (e) => {
  const file = (e.target as HTMLInputElement).files?.[0];

  if (!file) return;

  const text = await file.text();

  StorageLib.importFromJson(text);
});
```
