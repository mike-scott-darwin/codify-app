"use client";

import React, { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Callout from "@/components/vault/callout";
import MermaidBlock from "@/components/vault/mermaid-block";

const CALLOUT_REGEX = /^\[!(\w+[-\w]*)\]([+-])?\s*(.*)/;

function extractTextContent(node: ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractTextContent).join("");
  if (React.isValidElement(node) && node.props) {
    return extractTextContent((node.props as { children?: ReactNode }).children ?? "");
  }
  return "";
}

function stripCalloutHeader(children: ReactNode): ReactNode[] {
  const childArray = React.Children.toArray(children);
  if (childArray.length === 0) return [];

  // The first child is typically a <p> containing the [!type] line and possibly more text
  const first = childArray[0];
  if (!React.isValidElement(first)) return childArray;

  const pChildren = React.Children.toArray(
    (first.props as { children?: ReactNode }).children ?? []
  );

  // Find and remove the callout marker from the first text node
  const cleaned: ReactNode[] = [];
  let markerRemoved = false;

  for (const child of pChildren) {
    if (!markerRemoved && typeof child === "string") {
      // Remove the [!type] line — it may be followed by a newline and more content
      const lines = child.split("\n");
      if (CALLOUT_REGEX.test(lines[0])) {
        markerRemoved = true;
        const remaining = lines.slice(1).join("\n").trim();
        if (remaining) cleaned.push(remaining);
        continue;
      }
    }
    cleaned.push(child);
  }

  if (cleaned.length > 0) {
    // Reconstruct the paragraph with the header stripped
    const reconstructed = React.cloneElement(
      first as React.ReactElement<{ children?: ReactNode }>,
      {},
      ...cleaned
    );
    return [reconstructed, ...childArray.slice(1)];
  }

  // If the first paragraph is now empty, skip it entirely
  return childArray.slice(1);
}

function processWikiLinks(content: string): string {
  // [[path|display]] → [display](/vault/path)
  // [[path]] → [path](/vault/path)
  return content.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, path, display) => {
    const cleanPath = path.trim();
    const label = display?.trim() || cleanPath.split("/").pop()?.replace(".md", "") || cleanPath;
    return `[${label}](/vault/${cleanPath})`;
  });
}

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="vault-prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          blockquote({ children }) {
            // Extract text from the first child to check for callout pattern
            const childArray = React.Children.toArray(children);
            const firstChild = childArray.find((c) => React.isValidElement(c));

            if (firstChild && React.isValidElement(firstChild)) {
              const text = extractTextContent(
                (firstChild.props as { children?: ReactNode }).children ?? ""
              );
              const match = text.match(CALLOUT_REGEX);

              if (match) {
                const type = match[1];
                const foldMarker = match[2];
                const title = match[3] || "";
                const foldable = foldMarker === "+" || foldMarker === "-";
                const defaultOpen = foldMarker !== "-";

                const body = stripCalloutHeader(children);

                return (
                  <Callout
                    type={type}
                    title={title}
                    foldable={foldable}
                    defaultOpen={defaultOpen}
                  >
                    {body}
                  </Callout>
                );
              }
            }

            return <blockquote>{children}</blockquote>;
          },
          code({ className, children, ...props }) {
            const match = className?.match(/language-(\w+)/);
            if (match?.[1] === "mermaid") {
              return <MermaidBlock code={String(children).trim()} />;
            }
            return <code className={className} {...props}>{children}</code>;
          },
        }}
      >
        {processWikiLinks(content)}
      </ReactMarkdown>
    </div>
  );
}
