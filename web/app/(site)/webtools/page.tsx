'use client';

// Make it static!
export const dynamic = "force-static";

import Link from "next/link";
import { webtools } from "@/lib/webtools";
import { tool } from "@/lib/types";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="text-5xl font-bold mb-4">
          Webtools
        </h1>

        <p className="text-slate-400 mb-12">
          Sammlung kleiner Tools und Helfer.
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {webtools.map((tool: tool) => (
            <Link
              key={tool.slug}
              href={`/webtools/${tool.slug}`}
              className="
                group
                rounded-3xl
                border
                border-slate-800
                bg-slate-900
                p-6
                transition-all
                hover:border-blue-500
                hover:-translate-y-1
                hover:shadow-xl
                hover:shadow-blue-500/10
              "
            >
              <div className="text-4xl mb-4">
                {tool.icon}
              </div>

              <h2 className="text-xl font-semibold mb-2 group-hover:text-blue-400">
                {tool.title}
              </h2>

              <p className="text-slate-400">
                {tool.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
