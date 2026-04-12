"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Backlink {
  path: string;
  name: string;
  context: string;
  type: "link" | "mention";
}

export default function Backlinks({ filePath }: { filePath: string }) {
  const [backlinks, setBacklinks] = useState<Backlink[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(
          `/api/vault?action=backlinks&path=${encodeURIComponent(filePath)}`
        );
        if (res.ok) {
          setBacklinks(await res.json());
        }
      } catch {
        // silently fail
      }
      setLoading(false);
    }
    load();
  }, [filePath]);

  const links = backlinks.filter((b) => b.type === "link");
  const mentions = backlinks.filter((b) => b.type === "mention");
  const total = backlinks.length;

  return (
    <div className="mt-6">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm font-sans font-bold text-foreground mb-3 hover:text-blue transition-colors"
      >
        <span className="text-xs text-dim">{expanded ? "▼" : "▶"}</span>
        Backlinks
        {!loading && (
          <span className="text-xs text-muted font-normal">
            {total} {total === 1 ? "reference" : "references"}
          </span>
        )}
      </button>

      {expanded && (
        <div className="space-y-4">
          {loading && (
            <p className="text-xs text-dim">Scanning vault for references...</p>
          )}

          {!loading && total === 0 && (
            <p className="text-xs text-dim">No other files reference this document yet.</p>
          )}

          {/* Linked references */}
          {links.length > 0 && (
            <div>
              <p className="text-xs text-dim uppercase tracking-wider mb-2">
                Linked references ({links.length})
              </p>
              <div className="space-y-1">
                {links.map((bl) => (
                  <Link
                    key={bl.path}
                    href={`/vault/${bl.path}`}
                    className="block p-3 bg-surface border border-border rounded-lg hover:border-blue/30 transition-colors group"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-blue text-xs">◆</span>
                      <span className="text-sm text-foreground group-hover:text-blue transition-colors">
                        {bl.name}
                      </span>
                      <span className="text-xs text-dim ml-auto">
                        {bl.path.split("/").slice(0, -1).join("/")}
                      </span>
                    </div>
                    <p className="text-xs text-muted truncate pl-5">{bl.context}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Unlinked mentions */}
          {mentions.length > 0 && (
            <div>
              <p className="text-xs text-dim uppercase tracking-wider mb-2">
                Unlinked mentions ({mentions.length})
              </p>
              <div className="space-y-1">
                {mentions.map((bl) => (
                  <Link
                    key={bl.path}
                    href={`/vault/${bl.path}`}
                    className="block p-3 bg-surface border border-border/50 rounded-lg hover:border-border transition-colors group"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-dim text-xs">◇</span>
                      <span className="text-sm text-muted group-hover:text-foreground transition-colors">
                        {bl.name}
                      </span>
                      <span className="text-xs text-dim ml-auto">
                        {bl.path.split("/").slice(0, -1).join("/")}
                      </span>
                    </div>
                    <p className="text-xs text-dim truncate pl-5">{bl.context}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
