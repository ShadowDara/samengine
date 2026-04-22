// app/changelog/page.tsx

import fs from "fs";
import path from "path";
import ReactMarkdown from "react-markdown";

export default function ChangelogPage() {
  const filePath = path.join(process.cwd(), "..", "CHANGELOG.md");
  const markdown = fs.readFileSync(filePath, "utf-8");

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <article className="prose prose-invert prose-neutral max-w-none">
          <ReactMarkdown>{markdown}</ReactMarkdown>
        </article>
      </div>
    </main>
  );
}
