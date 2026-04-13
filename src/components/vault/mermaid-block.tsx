"use client";

import { useEffect, useState, useId } from "react";

interface MermaidBlockProps {
  code: string;
}

export default function MermaidBlock({ code }: MermaidBlockProps) {
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const reactId = useId();
  const safeId = "mermaid-" + reactId.replace(/:/g, "-");

  useEffect(() => {
    let cancelled = false;

    async function renderDiagram() {
      try {
        const mermaid = (await import("mermaid")).default;

        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          themeVariables: {
            primaryColor: "#1a1a1a",
            primaryTextColor: "#e0e0e0",
            primaryBorderColor: "#4a9eff",
            lineColor: "#6b6b6b",
            secondaryColor: "#111111",
            tertiaryColor: "#0a0a0a",
            fontFamily: "Space Grotesk, system-ui, sans-serif",
          },
        });

        const { svg: rendered } = await mermaid.render(safeId, code);

        if (!cancelled) {
          setSvg(rendered);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to render diagram");
          setSvg(null);
        }
      }
    }

    renderDiagram();

    return () => {
      cancelled = true;
    };
  }, [code, safeId]);

  return (
    <div className="bg-surface border border-border rounded-lg p-4 my-3 overflow-x-auto">
      {error ? (
        <div>
          <p className="text-sm text-red-400 mb-2">Diagram render error: {error}</p>
          <pre className="text-xs text-neutral-400 bg-neutral-900 rounded p-3 overflow-x-auto">
            <code>{code}</code>
          </pre>
        </div>
      ) : svg ? (
        <div
          className="text-center"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <div className="text-center text-sm text-neutral-500 py-4">
          Rendering diagram...
        </div>
      )}
    </div>
  );
}
