"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface ResizeHandleProps {
  onResize: (delta: number) => void;
  onResizeEnd?: () => void;
}

export default function ResizeHandle({ onResize, onResizeEnd }: ResizeHandleProps) {
  const [active, setActive] = useState(false);
  const dragging = useRef(false);
  const lastX = useRef(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    setActive(true);
    lastX.current = e.clientX;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (!dragging.current) return;
      const delta = e.clientX - lastX.current;
      lastX.current = e.clientX;
      onResize(delta);
    }

    function handleMouseUp() {
      if (!dragging.current) return;
      dragging.current = false;
      setActive(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      onResizeEnd?.();
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [onResize, onResizeEnd]);

  return (
    <div
      onMouseDown={handleMouseDown}
      className={`w-1.5 shrink-0 cursor-col-resize transition-colors relative ${
        active ? "bg-blue/50" : "bg-transparent hover:bg-blue/20"
      }`}
    >
      {/* Wider invisible hit area */}
      <div className="absolute inset-y-0 -left-2 -right-2 z-10" onMouseDown={handleMouseDown} />
      {/* Visible center line on hover */}
      <div className={`absolute inset-y-0 left-1/2 -translate-x-1/2 w-px ${
        active ? "bg-blue" : "bg-border"
      }`} />
    </div>
  );
}
