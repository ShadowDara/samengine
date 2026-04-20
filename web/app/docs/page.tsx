// app/docs/page.tsx

// Make it static!
export const dynamic = "force-static";

import { getDocBySlug } from "@/lib/docs";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";

export default function DocsHome() {
  const { slug, content } = getDocBySlug("readme");

  return (
    <div className="prose dark:prose-invert">
      <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
