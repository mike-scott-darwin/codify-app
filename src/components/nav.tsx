"use client";

import { useState } from "react";

const navLinks = [
  { label: "How it works", href: "#mechanism" },
  { label: "Results", href: "#proof" },
  { label: "Pricing", href: "#engagement" },
  { label: "FAQ", href: "#faq" },
];

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 flex items-center justify-between h-14">
        <a href="#" className="flex items-center gap-2">
          <span className="text-lg font-bold text-white tracking-tight">
            codify
          </span>
        </a>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
          <a
            href="/get-started"
            className="text-sm font-semibold bg-blue text-black px-5 py-2 rounded-lg hover:brightness-110 transition-all"
          >
            Start Free Trial
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-muted text-sm"
          onClick={() => setOpen(!open)}
        >
          {open ? "\u2715" : "\u2630"}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-surface border-t border-border px-6 py-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted hover:text-white transition-colors"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <a
            href="/get-started"
            className="text-sm font-semibold bg-blue text-black px-5 py-2 rounded-lg text-center"
            onClick={() => setOpen(false)}
          >
            Start Free Trial
          </a>
        </div>
      )}
    </nav>
  );
}
