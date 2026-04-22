// app/changelog/page.tsx

// Make it static!
export const dynamic = "force-static";

import fs from "fs";
import path from "path";
import ReactMarkdown from "react-markdown";
import Link from "next/link";

export default function ChangelogPage() {
  const filePath = path.join(process.cwd(), "..", "CHANGELOG.md");
  const markdown = fs.readFileSync(filePath, "utf-8");

  // Remove HTML Comments
  const clean = markdown.replace(/<!--[\s\S]*?-->/g, "");

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 px-6 py-16">
      <div className="max-w-3xl mx-auto">
        
        {/* 🔙 Home Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition mb-8"
        >
          ← Back to the Homepage
        </Link>

        <article className="prose prose-invert prose-neutral max-w-none">
          <ReactMarkdown
            components={{
              h2: ({ children }) => (
                <h2 className="text-2xl font-bold mt-10 mb-4 border-b border-neutral-700 pb-2">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-lg font-semibold mt-6 mb-2 text-indigo-400">
                  {children}
                </h3>
              ),
              li: ({ children }) => (
                <li className="ml-4 list-disc text-neutral-300">{children}</li>
              ),
              hr: () => <hr className="my-8 border-neutral-800" />,
            }}
          >
            {clean}
          </ReactMarkdown>
        </article>
      </div>
    </main>
  );
}
