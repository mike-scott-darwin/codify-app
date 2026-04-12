"use client";

import { useCallback, useEffect, useRef } from "react";

interface ResizeHandleProps {
  onResize: (delta: number) => void;
  onResizeEnd?: () => void;
}

export default function ResizeHandle({ onResize, onResizeEnd }: ResizeHandleProps) {
  const dragging = useRef(false);
  const lastX = useRef(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
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
      className="w-1 shrink-0 cursor-col-resize hover:bg-blue/30 active:bg-blue/50 transition-colors relative group"
    >
      <div className="absolute inset-y-0 -left-1 -right-1" />
    </div>
  );
}
