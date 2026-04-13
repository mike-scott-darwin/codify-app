"use client";

import Link from "next/link";

interface ContextMapProps {
  depth: {
    file: string;
    label: string;
    words: number;
    level: "deep" | "growing" | "needs-attention";
  }[];
}

interface NodePosition {
  left: number;
  top: number;
  width: number;
  height: number;
}

const POSITIONS: Record<string, NodePosition> = {
  Soul: { left: 170, top: 0, width: 160, height: 80 },
  Audience: { left: 0, top: 150, width: 160, height: 80 },
  Offer: { left: 340, top: 150, width: 160, height: 80 },
  Voice: { left: 170, top: 300, width: 160, height: 80 },
};

const EDGES: {
  from: string;
  to: string;
  label: string;
  fromAnchor: string;
  toAnchor: string;
}[] = [
  { from: "Soul", to: "Audience", label: "shapes", fromAnchor: "bottom-left", toAnchor: "top-right" },
  { from: "Soul", to: "Offer", label: "drives", fromAnchor: "bottom-right", toAnchor: "top-left" },
  { from: "Audience", to: "Offer", label: "validates", fromAnchor: "right", toAnchor: "left" },
  { from: "Audience", to: "Voice", label: "speaks to", fromAnchor: "bottom", toAnchor: "left" },
  { from: "Offer", to: "Voice", label: "delivers through", fromAnchor: "bottom", toAnchor: "right" },
  { from: "Voice", to: "Soul", label: "expresses", fromAnchor: "top", toAnchor: "bottom" },
];

function getAnchorPoint(
  pos: NodePosition,
  anchor: string
): { x: number; y: number } {
  const cx = pos.left + pos.width / 2;
  const cy = pos.top + pos.height / 2;

  switch (anchor) {
    case "top":
      return { x: cx, y: pos.top };
    case "top-left":
      return { x: pos.left + 30, y: pos.top };
    case "top-right":
      return { x: pos.left + pos.width - 30, y: pos.top };
    case "bottom":
      return { x: cx, y: pos.top + pos.height };
    case "bottom-left":
      return { x: pos.left + 30, y: pos.top + pos.height };
    case "bottom-right":
      return { x: pos.left + pos.width - 30, y: pos.top + pos.height };
    case "left":
      return { x: pos.left, y: cy };
    case "right":
      return { x: pos.left + pos.width, y: cy };
    default:
      return { x: cx, y: cy };
  }
}

function getLevelStyles(level: "deep" | "growing" | "needs-attention") {
  switch (level) {
    case "deep":
      return {
        border: "border-green-500/60",
        bg: "bg-green-950/20",
        bar: "bg-green-500",
        barWidth: "100%",
      };
    case "growing":
      return {
        border: "border-amber-500/60",
        bg: "bg-amber-950/20",
        bar: "bg-amber-500",
        barWidth: "60%",
      };
    case "needs-attention":
      return {
        border: "border-neutral-600",
        bg: "bg-neutral-900/30",
        bar: "bg-neutral-500",
        barWidth: "20%",
      };
  }
}

function NodeCard({
  file,
  label,
  words,
  level,
  position,
}: {
  file: string;
  label: string;
  words: number;
  level: "deep" | "growing" | "needs-attention";
  position: NodePosition;
}) {
  const styles = getLevelStyles(level);

  return (
    <Link
      href={`/vault/${file}`}
      className={`absolute block rounded-lg border p-3 transition-colors hover:opacity-90 ${styles.border} ${styles.bg}`}
      style={{
        left: position.left,
        top: position.top,
        width: position.width,
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-neutral-100">{label}</span>
        {level === "needs-attention" && words < 100 && (
          <span className="rounded bg-neutral-700/60 px-1.5 py-0.5 text-[10px] text-neutral-400">
            Empty
          </span>
        )}
      </div>
      <span className="text-xs text-neutral-400">{words.toLocaleString()} words</span>
      <div className="mt-2 h-1 w-full rounded-full bg-neutral-800">
        <div
          className={`h-1 rounded-full ${styles.bar}`}
          style={{ width: styles.barWidth }}
        />
      </div>
    </Link>
  );
}

export default function ContextMap({ depth }: ContextMapProps) {
  const nodeMap = new Map(depth.map((d) => [d.label, d]));

  return (
    <div className="relative mx-auto" style={{ width: 500, height: 400 }}>
      {/* Center label */}
      <div
        className="absolute text-center text-xs font-medium text-neutral-500"
        style={{ left: 150, top: 200, width: 200 }}
      >
        Your Context Architecture
      </div>

      {/* SVG edges */}
      <svg
        className="pointer-events-none absolute inset-0"
        width={500}
        height={400}
        style={{ zIndex: 0 }}
      >
        {EDGES.map((edge) => {
          const fromPos = POSITIONS[edge.from];
          const toPos = POSITIONS[edge.to];
          if (!fromPos || !toPos) return null;

          const start = getAnchorPoint(fromPos, edge.fromAnchor);
          const end = getAnchorPoint(toPos, edge.toAnchor);
          const midX = (start.x + end.x) / 2;
          const midY = (start.y + end.y) / 2;

          return (
            <g key={`${edge.from}-${edge.to}`}>
              <line
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke="#1a1a1a"
                strokeWidth={1}
              />
              <text
                x={midX}
                y={midY - 4}
                textAnchor="middle"
                fill="#6b6b6b"
                fontSize={10}
                fontFamily="inherit"
              >
                {edge.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Node cards */}
      {["Soul", "Audience", "Offer", "Voice"].map((label) => {
        const data = nodeMap.get(label);
        const pos = POSITIONS[label];
        if (!data || !pos) return null;

        return (
          <NodeCard
            key={label}
            file={data.file}
            label={data.label}
            words={data.words}
            level={data.level}
            position={pos}
          />
        );
      })}
    </div>
  );
}
