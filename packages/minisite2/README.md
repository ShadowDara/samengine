# MiniSite

> TSX rein — eine HTML-Datei raus.

Ein minimalistischer Static Site Generator ohne Konfiguration, ohne Runtime, ohne Magie.

---

## Install

```bash
npm install minisite
```

---

## Usage

```bash
npx minisite build
```

Erzeugt `dist/index.html`.

---

## Projektstruktur

```
project/
├── pages/
│   ├── index.tsx        →  #/
│   ├── about.tsx        →  #/about
│   └── blog/
│       ├── index.tsx    →  #/blog
│       └── first-post.tsx  →  #/blog/first-post
├── components/
│   ├── Header.tsx
│   └── Link.tsx
└── tsconfig.json
```

---

## Seiten

Jede Datei in `pages/` exportiert eine Default-Komponente:

```tsx
import { h } from "minisite/jsx-runtime";

export default function Home() {
    return (
        <main>
            <h1>Home</h1>
        </main>
    );
}
```

---

## Navigation

```tsx
import { Link } from "../components/Link.js";

<Link to="/about">About</Link>
// → <a href="#/about">About</a>
```

---

## tsconfig.json

```json
{
  "compilerOptions": {
    "jsx": "react",
    "jsxFactory": "h",
    "jsxFragmentFactory": "Fragment"
  }
}
```

---

## Was es nicht gibt

- Dev Server
- Hot Reload
- State / Hooks
- SSR / Hydration
- Plugins
- Konfigurationsdatei

---

## Architektur

```
src/
├── jsx-runtime/   JSX h() + Fragment + VNode   (~30 Zeilen)
├── renderer/      VNode → HTML string          (~60 Zeilen)
├── router/        Client-seitiger Hash-Router  (~15 Zeilen)
├── build/         Seiten finden + kompilieren  (~80 Zeilen)
└── cli/           CLI-Einstiegspunkt           (~15 Zeilen)
```

---

"HTML erzeugen, nicht Framework spielen."
