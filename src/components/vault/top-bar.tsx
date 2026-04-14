"use client";

export default function VaultTopBar({
  onMenuToggle,
}: {
  clientName?: string;
  onMenuToggle: () => void;
}) {
  return (
    <div className="h-12 border-b border-border bg-surface flex items-center px-4">
      <button
        onClick={onMenuToggle}
        className="md:hidden text-muted hover:text-foreground"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 5h14M3 10h14M3 15h14" />
        </svg>
      </button>
    </div>
  );
}
