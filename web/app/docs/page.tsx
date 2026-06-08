// app/docs/page.tsx

'use client';

// Make it static!
export const dynamic = "force-static";

import { getDocBySlug } from "@/lib/docs";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from 'rehype-slug';

export default function DocsHome() {
  const { slug, content } = getDocBySlug("README");

  // Remove HTML Comments
  const clean = content.replace(/<!--[\s\S]*?-->/g, "");

  return (
    <div className="prose dark:prose-invert">
      <ReactMarkdown rehypePlugins={
        [rehypeHighlight, rehypeSlug]
      }>
        {clean}
      </ReactMarkdown>
    </div>
  );
}
