// app/start/page.tsx

"use client";

export const dynamic = "force-static";

import { useState } from "react";

const commands = {
  npm:
`npm init
npm install samengine samengine-build @shadowdara/samtool
npx samengine-build --new newprojcet
npx samengine-build
`,

  bun:
`bun init
bun install samengine samengine-build @shadowdara/samtool
bun samengine-build --new newprojcet
bun samengine-build`,

  yarn:
`yarn init
yarn install samengine samengine-build @shadowdara/samtool
yarn samengine-build --new newprojcet
yarn samengine-build`,

  pnpm:
`pnpm init
pnpm install samengine samengine-build @shadowdara/samtool
pnpm samengine-build --new newprojcet
pnpm samengine-build`,
};

export default function StartPage() {
  const [manager, setManager] = useState<
    "npm" | "bun" | "yarn" | "pnpm"
  >("npm");

  const copyCommand = async () => {
    await navigator.clipboard.writeText(commands[manager]);
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-4xl">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Start now
          </h1>

          <p className="text-gray-400 text-lg">
            Create your first samengine project in seconds.
          </p>
        </div>

        {/* Package Manager Selection */}
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          {(["npm", "bun", "yarn", "pnpm"] as const).map((pkg) => (
            <button
              key={pkg}
              onClick={() => setManager(pkg)}
              className={`px-5 py-2 rounded-xl border transition capitalize
                ${
                  manager === pkg
                    ? "bg-white text-black border-white"
                    : "border-zinc-700 hover:border-white"
                }`}
            >
              {pkg}
            </button>
          ))}
        </div>

        {/* Multiline Command Box */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">

          <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
            <p className="text-sm text-gray-400">
              Terminal
            </p>

            <button
              onClick={copyCommand}
              className="text-sm bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition"
            >
              Copy
            </button>
          </div>

          <textarea
            readOnly
            value={commands[manager]}
            className="
              w-full
              h-52
              bg-black
              text-green-400
              font-mono
              text-sm
              p-5
              resize-none
              outline-none
            "
          />
        </div>

      </div>
    </main>
  );
}
