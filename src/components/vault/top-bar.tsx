"use client";

import { useEffect, useState } from "react";

export default function VaultTopBar({
  onMenuToggle,
}: {
  clientName?: string;
  onMenuToggle: () => void;
}) {
  const [name, setName] = useState("");

  useEffect(() => {
    fetch("/api/vault?action=client")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.client_name) setName(data.client_name);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="h-12 border-b border-border bg-surface flex items-center px-4 gap-3">
      <button
        onClick={onMenuToggle}
        className="md:hidden text-muted hover:text-foreground"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 5h14M3 10h14M3 15h14" />
        </svg>
      </button>

      {/* Breadcrumb / workspace name */}
      {name && (
        <span className="hidden md:block text-sm font-sans font-medium text-foreground truncate">
          {name}
        </span>
      )}
    </div>
  );
}
