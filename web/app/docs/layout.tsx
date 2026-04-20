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
      <aside style={{ width: "250px", padding: "20px" }}>
        <h2>
          <Link href="/docs">Docs</Link>
        </h2>

        <ul>
          {filteredSlugs.map((slug) => {
            const name = slug.replace(".md", "");

            return (
              <li key={slug}>
                <Link href={`/docs/${name}`}>{name}</Link>
              </li>
            );
          })}
        </ul>
      </aside>

      <main style={{ padding: "20px", flex: 1 }}>{children}</main>
    </div>
  );
}
