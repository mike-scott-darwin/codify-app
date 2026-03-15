"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { Platform, IntegrationConnection, PublishLogEntry } from "@/lib/integrations/types";
import { PLATFORM_CONFIGS, ALL_PLATFORMS } from "@/lib/integrations/types";

interface OutputDetail {
  id: string;
  output_type: string;
  title: string;
  content: string;
  prompt_config: Record<string, string>;
  is_favorite: boolean;
  created_at: string;
  publish_log?: PublishLogEntry[];
}

const TYPE_LABELS: Record<string, string> = {
  ad_copy: "Ad Copy",
  social_post: "Social Post",
  email_sequence: "Email Sequence",
  vsl_script: "VSL Script",
  landing_page: "Landing Page",
};

export default function OutputDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [output, setOutput] = useState<OutputDetail | null>(null);
  const [copied, setCopied] = useState(false);
  const [integrations, setIntegrations] = useState<IntegrationConnection[]>([]);
  const [publishing, setPublishing] = useState<Platform | null>(null);
  const [publishFeedback, setPublishFeedback] = useState<Record<string, { type: "success" | "error"; msg: string } | null>>({});

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/outputs/" + id);
      if (res.ok) {
        const data = await res.json();
        setOutput(data.output);
      }
    };
    load();

    fetch("/api/integrations")
      .then((r) => r.json())
      .then((data) => {
        if (data.integrations) setIntegrations(data.integrations);
      })
      .catch(() => {});
  }, [id]);

  if (!output) {
    return <p className="font-mono text-sm text-[#6b6b6b] animate-pulse">Loading...</p>;
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDownload = () => {
    const blob = new Blob([output.content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = output.output_type + "-" + new Date(output.created_at).toISOString().split("T")[0] + ".md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async () => {
    await fetch("/api/outputs/" + id, { method: "DELETE" });
    router.push("/dashboard/outputs");
  };

  function wasPublishedTo(platform: Platform): boolean {
    return (output?.publish_log || []).some(
      (log) => log.platform === platform && log.success
    );
  }

  const applicablePlatforms = ALL_PLATFORMS.filter((p) => {
    const config = PLATFORM_CONFIGS[p];
    const connected = integrations.some((i) => i.platform === p && i.enabled);
    return connected && config.supportedOutputTypes.includes(output.output_type);
  });

  async function handlePublish(platform: Platform) {
    setPublishing(platform);
    setPublishFeedback((prev) => ({ ...prev, [platform]: null }));
    try {
      const res = await fetch("/api/integrations/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          outputId: output!.id,
          content: output!.content,
          outputType: output!.output_type,
          metadata: { title: output!.title },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPublishFeedback((prev) => ({ ...prev, [platform]: { type: "success", msg: data.message } }));
        // Update local publish log
        setOutput((prev) =>
          prev
            ? {
                ...prev,
                publish_log: [
                  ...(prev.publish_log || []),
                  {
                    platform,
                    publishedAt: new Date().toISOString(),
                    externalId: data.externalId,
                    success: true,
                  },
                ],
              }
            : prev
        );
      } else {
        setPublishFeedback((prev) => ({
          ...prev,
          [platform]: { type: "error", msg: data.message || data.error || "Failed" },
        }));
      }
    } catch {
      setPublishFeedback((prev) => ({ ...prev, [platform]: { type: "error", msg: "Network error" } }));
    }
    setPublishing(null);
  }

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/dashboard/outputs"
          className="font-mono text-xs text-[#6b6b6b] hover:text-white transition-colors"
        >
          {String.fromCharCode(8592)} Back
        </Link>
        <span className="text-[#1a1a1a]">/</span>
        <span className="font-mono text-xs text-[#4a9eff]">
          {TYPE_LABELS[output.output_type] || output.output_type}
        </span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="font-mono text-xl font-bold">{output.title}</h1>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="font-mono text-xs px-3 py-1.5 border border-[#1a1a1a] text-[#a0a0a0] hover:text-white transition-colors"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            onClick={handleDownload}
            className="font-mono text-xs px-3 py-1.5 border border-[#1a1a1a] text-[#a0a0a0] hover:text-white transition-colors"
          >
            Download
          </button>
          <button
            onClick={handleDelete}
            className="font-mono text-xs px-3 py-1.5 border border-[#1a1a1a] text-[#ef4444] hover:text-white hover:bg-[#ef4444] transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="bg-[#111111] border border-[#1a1a1a] p-6">
        <pre className="whitespace-pre-wrap font-mono text-sm text-[#a0a0a0] leading-relaxed">
          {output.content}
        </pre>
      </div>

      <p className="font-mono text-[10px] text-[#6b6b6b] mt-4 mb-6">
        Generated {new Date(output.created_at).toLocaleString()}
      </p>

      {/* Publish Section */}
      {applicablePlatforms.length > 0 && (
        <div className="bg-[#111111] border border-[#1a1a1a] p-6 mt-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#4a9eff] mb-4">
            Publish
          </p>
          <div className="space-y-3">
            {applicablePlatforms.map((platform) => {
              const config = PLATFORM_CONFIGS[platform];
              const published = wasPublishedTo(platform);
              const fb = publishFeedback[platform];

              return (
                <div
                  key={platform}
                  className="flex items-center justify-between py-2 border-b border-[#1a1a1a] last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{config.icon}</span>
                    <span className="font-mono text-sm text-white">{config.label}</span>
                    {published && (
                      <span className="font-mono text-[10px] text-[#22c55e]">
                        {String.fromCharCode(10003)} Published
                      </span>
                    )}
                    {fb && (
                      <span
                        className={
                          "font-mono text-[10px] " +
                          (fb.type === "success" ? "text-[#22c55e]" : "text-red-400")
                        }
                      >
                        {fb.msg}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handlePublish(platform)}
                    disabled={publishing === platform}
                    className="bg-[#4a9eff] text-white font-mono text-xs font-bold px-4 py-1.5 hover:bg-[#4a9eff]/80 disabled:opacity-50 transition-colors"
                  >
                    {publishing === platform
                      ? "Publishing..."
                      : published
                        ? "Publish Again"
                        : "Publish"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
