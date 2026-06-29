// app/packages/page.tsx

'use client';

// Make it static!
export const dynamic = "force-static";

import Link from "next/link";

const packages = [
  {
    name: "samengine",
    description: "Core framework for building lightweight webgames.",
    link: "https://npmjs.com/package/samengine",
  },
  {
    name: "samengine-cli",
    description: "Some CLI tools which should with the Game Making Process. (The Package is in Progress)",
    link: "https://npmjs.com/package/samengine-build",
  },
  {
    name: "@shadowdara/seg",
    description: "The new CLI Tool for samengine. Written in Rust for speed!",
    link: "https://npmjs.com/package/@shadowdara/seg",
  },
  {
    name: "automatic-md-index",
    description: "Automatically generate a table of contents from headings in Markdown files.",
    link: "https://npmjs.com/package/automatic-md-index",
  },
  {
    name: "canvasinput-ts",
    description: "This project is a TypeScript port of the original CanvasInput library by James Simpson (GoldFire Studios).",
    link: "https://npmjs.com/package/canvasinput-ts",
  },
  {
    name: "create-samengine-project",
    description: "the project creator for samengine",
    link: "https://npmjs.com/package/create-samengine-project",
  },
];

export default function Packages() {
  return (
    <main className="min-h-screen bg-black text-white px-4 md:px-6 py-16 md:py-24">
      
      {/* Header */}
      <section className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
          Packages
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Explore the modular ecosystem of samengine. Use only what you need.
        </p>
      </section>

      {/* Packages Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {packages.map((pkg, i) => (
          <div
            key={i}
            className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-white transition flex flex-col justify-between"
          >
            <div>
              <h2 className="text-xl font-semibold mb-3">{pkg.name}</h2>
              <p className="text-gray-400 text-sm mb-6">
                {pkg.description}
              </p>
            </div>

            <a href={pkg.link} target="_blank">
              <button className="w-full bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition">
                View Package
              </button>
            </a>
          </div>
        ))}
      </section>

      {/* Back Link */}
      <div className="text-center mt-16">
        <Link href="/">
          <button className="border border-white px-6 py-3 rounded-xl hover:bg-white hover:text-black transition">
            Back to Home
          </button>
        </Link>
      </div>
    </main>
  );
}
