// app/docs/page.tsx

// Make it static!
export const dynamic = "force-static";

import { getDocBySlug } from "@/lib/docs";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";

export default function DocsHome() {
  const { slug, content } = getDocBySlug("README");

  // Remove HTML Comments
  const clean = content.replace(/<!--[\s\S]*?-->/g, "");

  return (
    <div className="prose dark:prose-invert">
      <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
        {clean}
      </ReactMarkdown>
    </div>
  );
}
