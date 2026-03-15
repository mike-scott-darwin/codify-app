"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface OutputDetail {
  id: string;
  output_type: string;
  title: string;
  content: string;
  prompt_config: Record<string, string>;
  is_favorite: boolean;
  created_at: string;
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

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/outputs/" + id);
      if (res.ok) {
        const data = await res.json();
        setOutput(data.output);
      }
    };
    load();
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

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/dashboard/outputs"
          className="font-mono text-xs text-[#6b6b6b] hover:text-white transition-colors"
        >
          ← Back
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

      <p className="font-mono text-[10px] text-[#6b6b6b] mt-4">
        Generated {new Date(output.created_at).toLocaleString()}
      </p>
    </>
  );
}
