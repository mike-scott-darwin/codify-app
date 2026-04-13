"use client";

import { useState, ReactNode } from "react";

interface CalloutProps {
  type: string;
  title: string;
  children: ReactNode;
  foldable?: boolean;
  defaultOpen?: boolean;
}

interface CalloutConfig {
  color: string;
  icon: string;
}

const CALLOUT_TYPES: Record<string, CalloutConfig> = {
  soul: { color: "#22c55e", icon: "🧠" },
  audience: { color: "#ef4444", icon: "👥" },
  offer: { color: "#a855f7", icon: "💎" },
  voice: { color: "#4a9eff", icon: "🎙" },
  action: { color: "#f59e0b", icon: "⚡" },
  metric: { color: "#a0a0a0", icon: "📊" },
  wins: { color: "#22c55e", icon: "🏆" },
  tip: { color: "#06b6d4", icon: "💡" },
  warning: { color: "#f59e0b", icon: "⚠️" },
  note: { color: "#4a9eff", icon: "📝" },
  info: { color: "#4a9eff", icon: "ℹ️" },
  success: { color: "#22c55e", icon: "✅" },
  danger: { color: "#ef4444", icon: "🔴" },
  example: { color: "#a855f7", icon: "📋" },
  quote: { color: "#a0a0a0", icon: "💬" },
} as const;

const DEFAULT_CONFIG: CalloutConfig = { color: "#4a9eff", icon: "📝" };

function getConfig(type: string): CalloutConfig {
  return CALLOUT_TYPES[type.toLowerCase()] ?? DEFAULT_CONFIG;
}

export default function Callout({
  type,
  title,
  children,
  foldable = false,
  defaultOpen = true,
}: CalloutProps) {
  const [open, setOpen] = useState(defaultOpen);
  const config = getConfig(type);

  const displayTitle = title || type.charAt(0).toUpperCase() + type.slice(1);

  return (
    <div
      className="rounded-lg p-4 my-3"
      style={{
        borderLeft: `3px solid ${config.color}`,
        backgroundColor: `${config.color}0D`,
      }}
    >
      <div
        className={`flex items-center gap-2 font-bold ${foldable ? "cursor-pointer select-none" : ""}`}
        style={{ color: config.color }}
        onClick={foldable ? () => setOpen((prev) => !prev) : undefined}
      >
        {foldable && (
          <span className="text-xs" style={{ color: config.color }}>
            {open ? "▼" : "▶"}
          </span>
        )}
        <span>{config.icon}</span>
        <span>{displayTitle}</span>
      </div>
      {(!foldable || open) && (
        <div className="mt-2 text-sm opacity-90">{children}</div>
      )}
    </div>
  );
}
