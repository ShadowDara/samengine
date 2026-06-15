// app/showcase/page.tsx

'use client';

export const dynamic = "force-static";

import Link from "next/link";

export default function Showcase() {
  return (
    <main className="min-h-screen bg-black text-white">

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center py-20 md:py-32 px-4 md:px-6">
        <span className="text-sm uppercase tracking-widest text-gray-500 mb-4">
          Desktop Application
        </span>

        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6">
          Webtools Desktop
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mb-10">
          A modern desktop application built for speed, simplicity and productivity.
          Available for Windows, macOS and Linux.
        </p>

        <Link href="/downloads/MyDesktopApp.zip">
          <button className="bg-white text-black px-8 py-4 rounded-xl font-semibold hover:bg-gray-200 transition text-lg">
            Download Now
          </button>
        </Link>

        <p className="text-sm text-gray-500 mt-4">
          Version 1.0.0 • Free Download
        </p>
      </section>

      {/* Preview */}
      <section className="px-4 md:px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="aspect-video rounded-3xl border border-zinc-800 bg-zinc-900 flex items-center justify-center">
            <span className="text-gray-500">
              Screenshot / Preview Image
            </span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-zinc-900">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          Features
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            {
              title: "Fast",
              desc: "Optimized for performance and low resource usage."
            },
            {
              title: "Modern UI",
              desc: "Clean interface designed for efficiency and comfort."
            },
            {
              title: "Cross Platform",
              desc: "Runs on Windows, macOS and Linux."
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl bg-black border border-zinc-800 hover:border-white transition"
            >
              <h3 className="text-xl font-semibold mb-3">
                {feature.title}
              </h3>

              <p className="text-gray-400">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Specs */}
      <section className="py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            System Requirements
          </h2>

          <div className="rounded-2xl border border-zinc-800 overflow-hidden">
            <div className="grid grid-cols-2 border-b border-zinc-800">
              <div className="p-4 text-gray-400">Operating System</div>
              <div className="p-4">Windows / macOS / Linux</div>
            </div>

            <div className="grid grid-cols-2 border-b border-zinc-800">
              <div className="p-4 text-gray-400">RAM</div>
              <div className="p-4">4 GB+</div>
            </div>

            <div className="grid grid-cols-2 border-b border-zinc-800">
              <div className="p-4 text-gray-400">Storage</div>
              <div className="p-4">200 MB</div>
            </div>

            <div className="grid grid-cols-2">
              <div className="p-4 text-gray-400">Processor</div>
              <div className="p-4">Dual-Core CPU</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 md:px-6 text-center">
        <h2 className="text-3xl md:text-5xl font-bold mb-6">
          Ready to try it?
        </h2>

        <p className="text-gray-400 mb-8">
          Download the latest version and get started today.
        </p>

        <Link href="https://github.com/ShadowDara/samengine/releases">
          <button className="bg-white text-black px-8 py-4 rounded-xl font-semibold hover:bg-gray-200 transition">
            Download
          </button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} MyDesktopApp. All rights reserved.
      </footer>

    </main>
  );
}
