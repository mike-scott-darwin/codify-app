"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { saveAnswers, loadAllAnswers } from "@/lib/db";
import type { FileType } from "@/lib/db";
import { CORE_FILE_KEYS } from "@/lib/types";

export default function EditFilePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const fileType = params.type as string;

  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const validTypes = [...CORE_FILE_KEYS];
  const isValid = validTypes.includes(fileType as typeof CORE_FILE_KEYS[number]);

  useEffect(() => {
    if (!isValid) return;
    const init = async () => {
      if (user) await loadAllAnswers();
      const enriched = sessionStorage.getItem("codify-enriched-" + fileType);
      if (enriched) {
        setContent(enriched);
      }
    };
    init();
  }, [user, fileType, isValid]);

  if (!isValid) {
    return (
      <div>
        <p className="font-mono text-sm text-[#ef4444]">Invalid file type: {fileType}</p>
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    sessionStorage.setItem("codify-enriched-" + fileType, content);

    const rawStr = sessionStorage.getItem("codify-interview-" + fileType);
    const answers = rawStr ? JSON.parse(rawStr) : {};
    await saveAnswers(fileType as FileType, answers, content);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-mono text-xl font-bold mb-1">Edit {fileType}.md</h1>
          <p className="text-sm text-[#6b6b6b]">
            Direct editing of your enriched reference file
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push("/dashboard/files")}
            className="font-mono text-xs px-4 py-2 border border-[#1a1a1a] text-[#6b6b6b] hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="font-mono text-xs font-bold px-4 py-2 hover:brightness-110 transition-all"
            style={{ backgroundColor: saved ? "#22c55e" : "#4a9eff", color: "#000", borderRadius: 0 }}
          >
            {saving ? "Saving..." : saved ? "Saved!" : "Save"}
          </button>
        </div>
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full min-h-[60vh] bg-[#111111] border border-[#1a1a1a] p-6 font-mono text-sm text-[#a0a0a0] leading-relaxed resize-y focus:outline-none focus:border-[#4a9eff]"
        placeholder="No enriched content yet. Run the interview and enrich first."
      />
    </>
  );
}
