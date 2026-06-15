// app/docs/layout.tsx

import Link from "next/link";
import { getDocSlugs } from "@/lib/docs";
import { ReactNode } from "react";

export default function DocsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const slugs = getDocSlugs();

  const filteredSlugs = slugs.filter(
    (slug) => slug.toLowerCase() !== "readme.md"
  );

  return (
    <div className="flex h-screen overflow-hidden">
      <aside
        style={{ width: "250px", padding: "20px" }}
        className="bg-zinc-900 h-screen overflow-y-auto p-5 shrink-0"
      >
        
        {/* Get back to the Homepage */}
        <p className="mb-2">
          <Link href="/" className="hover:underline p-1">Home</Link>
        </p>

        <h2>
          <Link href="/docs" className="hover:underline p-1">Docs</Link>
        </h2>

        <ul>
          {filteredSlugs.map((slug) => {
            const name = slug.replace(".md", "");

            return (
              <li key={slug} className="hover:underline p-1">
                <Link href={`/docs/${name}`}>{name}</Link>
              </li>
            );
          })}
        </ul>
      </aside>

      <main
        style={{ padding: "20px", flex: 1 }}
        className=" ml-5 flex-1 overflow-y-auto p-5"
      >
        <div className="mb-13 mt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
