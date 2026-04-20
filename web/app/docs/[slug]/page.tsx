// app/docs/[slug]/page.tsx

// Make it static!
export const dynamic = "force-static";

import "highlight.js/styles/github-dark.css";

import { getDocBySlug, getDocSlugs } from "@/lib/docs";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

export async function generateStaticParams() {
  const slugs = getDocSlugs();

  return slugs.map((slug) => ({
    slug: slug.replace(".md", ""),
  }));
}

export default async function DocPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const doc = getDocBySlug(slug);

  return (
    <div className="prose dark:prose-invert">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
      >
        {doc.content}
      </ReactMarkdown>
    </div>
  );
}
