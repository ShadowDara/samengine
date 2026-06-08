// app/not-found.tsx

'use client';

import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="text-center max-w-2xl">

        {/* 404 */}
        <p className="text-zinc-500 text-sm tracking-[0.3em] uppercase mb-4">
          Error 404
        </p>

        <h1 className="text-6xl md:text-8xl font-bold mb-6">
          Page not found
        </h1>

        <p className="text-zinc-400 text-lg md:text-xl mb-10 leading-relaxed">
          The page you are looking for does not exist, was removed
          or never existed in the first place.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">

          <Link href="/">
            <button className="w-full sm:w-auto bg-white text-black px-8 py-4 rounded-2xl font-semibold hover:bg-zinc-200 transition">
              Back Home
            </button>
          </Link>

          <Link href="/docs">
            <button className="w-full sm:w-auto border border-zinc-700 px-8 py-4 rounded-2xl hover:bg-white hover:text-black transition">
              Documentation
            </button>
          </Link>

        </div>

        {/* Decorative Glow */}
        <div className="relative mt-20 flex justify-center">
          <div className="w-64 h-64 bg-white/5 blur-3xl rounded-full absolute" />

          <div className="relative text-[120px] md:text-[180px] font-black text-zinc-900 select-none">
            404
          </div>
        </div>

      </div>
    </main>
  );
}
