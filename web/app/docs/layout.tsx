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
    <div style={{ display: "flex" }}>
      <aside style={{ width: "250px", padding: "20px" }} className="bg-zinc-900 min-h-screen">
        
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
        className="mb-13 mt-8 ml-5"
      >
        {children}
      </main>
    </div>
  );
}
