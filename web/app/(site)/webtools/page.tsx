'use client';

// Make it static!
export const dynamic = "force-static";

import { useState } from "react";
import Link from "next/link";
import { webtools } from "@/lib/webtools";
import { tool } from "@/lib/types";

export default function HomePage() {
  const [search, setSearch] = useState("");

  const filteredTools = webtools.filter((tool) =>
    [tool.title, tool.description]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="text-5xl font-bold mb-4">
          Webtools
        </h1>

        <p className="text-slate-400 mb-8">
          A Collection with little Webtools!
        </p>

        <div className="mb-12">
          <input
            type="text"
            placeholder="Tool suchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              w-full
              rounded-2xl
              border
              border-slate-800
              bg-slate-900
              px-4
              py-3
              text-white
              placeholder:text-slate-500
              outline-none
              transition
              focus:border-blue-500
              focus:ring-2
              focus:ring-blue-500/20
            "
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTools.map((tool: tool) => (
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

        {filteredTools.length === 0 && (
          <p className="mt-8 text-center text-slate-500">
            No Tools found.
          </p>
        )}
      </div>
    </main>
  );
}
