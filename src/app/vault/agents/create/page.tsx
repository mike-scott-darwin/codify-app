"use client";

import { useState } from "react";

export default function CreateAgentPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
          <span className="text-lg">✦</span>
        </div>
        <h1 className="text-xl font-sans font-bold text-foreground">Agent Builder</h1>
      </div>
      <p className="text-sm text-muted mb-8">
        Create a custom agent tailored to your workflow. Describe what you need and we&apos;ll configure it.
      </p>

      {/* Builder form */}
      <div className="space-y-6">
        <div>
          <label className="text-xs font-medium text-dim uppercase tracking-wider block mb-2">Agent Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Proposal Writer, Onboarding Coach..."
            className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-dim focus:outline-none focus:border-purple/40 transition-colors"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-dim uppercase tracking-wider block mb-2">What should this agent do?</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the job this agent should handle. Be specific about what it reads, writes, and decides..."
            rows={4}
            className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-dim resize-none focus:outline-none focus:border-purple/40 transition-colors"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-dim uppercase tracking-wider block mb-2">Knowledge Sources</label>
          <p className="text-xs text-muted mb-3">Which vault files should this agent read?</p>
          <div className="grid grid-cols-2 gap-2">
            {["reference/core/soul.md", "reference/core/offer.md", "reference/core/audience.md", "reference/core/voice.md", "decisions/", "research/", "outputs/", "content/"].map((source) => (
              <label key={source} className="flex items-center gap-2 px-3 py-2 bg-surface border border-border rounded-lg hover:border-purple/20 transition-colors cursor-pointer">
                <input type="checkbox" className="rounded border-border" />
                <span className="text-xs text-muted font-mono">{source}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          disabled={!name.trim() || !description.trim()}
          className="w-full px-6 py-3 text-sm font-medium text-white bg-purple rounded-xl disabled:opacity-30 hover:bg-purple/80 transition-colors"
        >
          Create Agent
        </button>

        <p className="text-xs text-dim text-center">
          Custom agents are saved to your vault and available in Orchestrate workflows.
        </p>
      </div>
    </div>
  );
}
