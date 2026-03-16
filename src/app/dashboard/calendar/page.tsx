"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { TYPE_LABELS, TYPE_COLORS, STATUS_COLORS } from "@/lib/output-constants";

interface CalendarOutput {
  id: string;
  output_type: string;
  title: string;
  content: string;
  is_favorite: boolean;
  created_at: string;
  scheduled_date: string | null;
  schedule_status: string;
}

function formatMonth(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function toDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getMonthDays(year: number, month: number): Date[] {
  const days: Date[] = [];
  // Find the Monday on or before the 1st of the month
  const first = new Date(year, month, 1);
  const startDay = first.getDay(); // 0=Sun
  const mondayOffset = startDay === 0 ? -6 : 1 - startDay;
  const start = new Date(year, month, 1 + mondayOffset);

  // Always show 6 weeks (42 days) for consistent grid height
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

function truncate(s: string, max: number): string {
  return s.length > max ? s.substring(0, max) + "..." : s;
}

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [scheduled, setScheduled] = useState<CalendarOutput[]>([]);
  const [unscheduled, setUnscheduled] = useState<CalendarOutput[]>([]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  const todayStr = toDateStr(new Date());

  const fetchOutputs = useCallback(async () => {
    setLoading(true);
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    // Fetch a wider range to cover the visible grid
    const start = new Date(year, month, -6);
    const end = new Date(year, month + 1, 7);
    const params = new URLSearchParams({
      start: toDateStr(start),
      end: toDateStr(end),
    });
    const res = await fetch("/api/outputs/calendar?" + params.toString());
    if (res.ok) {
      const data = await res.json();
      setScheduled(data.scheduled || []);
      setUnscheduled(data.unscheduled || []);
    }
    setLoading(false);
  }, [currentMonth]);

  useEffect(() => {
    fetchOutputs();
  }, [fetchOutputs]);

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  const goToday = () => {
    const now = new Date();
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
  };

  const patchOutput = async (id: string, updates: Record<string, unknown>) => {
    const res = await fetch("/api/outputs/" + id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    return res.ok;
  };

  const handleDrop = async (e: React.DragEvent, dateStr: string) => {
    e.preventDefault();
    const outputId = e.dataTransfer.getData("outputId");
    if (!outputId) return;

    // Optimistic update
    const fromUnscheduled = unscheduled.find((o) => o.id === outputId);
    const fromScheduled = scheduled.find((o) => o.id === outputId);
    const output = fromUnscheduled || fromScheduled;
    if (!output) return;

    const updated = { ...output, scheduled_date: dateStr, schedule_status: output.schedule_status === "draft" ? "scheduled" : output.schedule_status };

    if (fromUnscheduled) {
      setUnscheduled((prev) => prev.filter((o) => o.id !== outputId));
    } else {
      setScheduled((prev) => prev.filter((o) => o.id !== outputId));
    }
    setScheduled((prev) => [...prev, updated]);

    const ok = await patchOutput(outputId, {
      scheduled_date: dateStr,
      schedule_status: updated.schedule_status,
    });
    if (!ok) {
      // Revert on error
      fetchOutputs();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragStart = (e: React.DragEvent, outputId: string) => {
    e.dataTransfer.setData("outputId", outputId);
    e.dataTransfer.effectAllowed = "move";
  };

  const removeFromCalendar = async (id: string) => {
    // Optimistic
    const output = scheduled.find((o) => o.id === id);
    if (!output) return;
    setScheduled((prev) => prev.filter((o) => o.id !== id));
    setUnscheduled((prev) => [{ ...output, scheduled_date: null, schedule_status: "draft" }, ...prev]);

    const ok = await patchOutput(id, { scheduled_date: null, schedule_status: "draft" });
    if (!ok) fetchOutputs();
  };

  const toggleStatus = async (id: string, current: string) => {
    const next = current === "draft" ? "scheduled" : current === "scheduled" ? "published" : current === "published" ? "draft" : "draft";
    setScheduled((prev) =>
      prev.map((o) => (o.id === id ? { ...o, schedule_status: next } : o))
    );
    const ok = await patchOutput(id, { schedule_status: next });
    if (!ok) fetchOutputs();
  };

  const days = getMonthDays(currentMonth.getFullYear(), currentMonth.getMonth());
  const dayHeaders = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const getOutputsForDay = (dateStr: string) => {
    let items = scheduled.filter((o) => o.scheduled_date === dateStr);
    if (filter !== "all") items = items.filter((o) => o.output_type === filter);
    return items;
  };

  const filteredUnscheduled = filter === "all" ? unscheduled : unscheduled.filter((o) => o.output_type === filter);

  const selectedDayOutputs = selectedDay ? getOutputsForDay(selectedDay) : [];

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={prevMonth}
            className="font-mono text-sm text-[#6b6b6b] hover:text-white transition-colors px-2 py-1"
          >
            &larr;
          </button>
          <h1 className="font-mono text-xl font-bold min-w-[220px] text-center">
            {formatMonth(currentMonth)}
          </h1>
          <button
            onClick={nextMonth}
            className="font-mono text-sm text-[#6b6b6b] hover:text-white transition-colors px-2 py-1"
          >
            &rarr;
          </button>
          <button
            onClick={goToday}
            className="font-mono text-[10px] uppercase tracking-wider px-3 py-1.5 border border-[#1a1a1a] text-[#6b6b6b] hover:text-[#22c55e] hover:border-[#22c55e] transition-colors"
          >
            Today
          </button>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="font-mono text-[10px] uppercase tracking-wider bg-[#111111] border border-[#1a1a1a] text-[#6b6b6b] px-3 py-1.5 focus:outline-none focus:border-[#4a9eff]"
          >
            <option value="all">All Types</option>
            {Object.entries(TYPE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-4">
        {/* Calendar Grid */}
        <div className="flex-1 min-w-0">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-px mb-px">
            {dayHeaders.map((d) => (
              <div
                key={d}
                className="font-mono text-[10px] uppercase tracking-wider text-[#6b6b6b] text-center py-2"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <p className="font-mono text-sm text-[#6b6b6b] animate-pulse">Loading...</p>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-px">
              {days.map((day) => {
                const dateStr = toDateStr(day);
                const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                const isToday = dateStr === todayStr;
                const dayOutputs = getOutputsForDay(dateStr);
                const visibleOutputs = dayOutputs.slice(0, 3);
                const overflow = dayOutputs.length - 3;

                return (
                  <div
                    key={dateStr}
                    className="bg-[#111111] border min-h-[100px] p-1.5 cursor-pointer transition-colors hover:bg-[#161616]"
                    style={{
                      borderColor: isToday ? "#22c55e" : "#1a1a1a",
                      opacity: isCurrentMonth ? 1 : 0.3,
                    }}
                    onClick={() => setSelectedDay(dateStr)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, dateStr)}
                  >
                    <div className="font-mono text-[10px] text-[#6b6b6b] mb-1">
                      {day.getDate()}
                    </div>
                    <div className="space-y-0.5">
                      {visibleOutputs.map((output) => (
                        <div
                          key={output.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, output.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 px-1 py-0.5 cursor-grab active:cursor-grabbing"
                          style={{
                            backgroundColor: (TYPE_COLORS[output.output_type] || "#6b6b6b") + "15",
                            borderLeft: `2px solid ${TYPE_COLORS[output.output_type] || "#6b6b6b"}`,
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{
                              backgroundColor: STATUS_COLORS[output.schedule_status] || "#6b6b6b",
                            }}
                          />
                          <span
                            className="font-mono text-[9px] truncate"
                            style={{ color: TYPE_COLORS[output.output_type] || "#6b6b6b" }}
                          >
                            {truncate(output.title, 18)}
                          </span>
                        </div>
                      ))}
                      {overflow > 0 && (
                        <div className="font-mono text-[9px] text-[#6b6b6b] px-1">
                          +{overflow} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Unscheduled Panel */}
        <div className="w-56 flex-shrink-0">
          <h2 className="font-mono text-[10px] uppercase tracking-wider text-[#6b6b6b] mb-3">
            Unscheduled
          </h2>
          <div className="space-y-1.5 max-h-[calc(100vh-200px)] overflow-y-auto">
            {filteredUnscheduled.length === 0 ? (
              <p className="font-mono text-[10px] text-[#6b6b6b]">No unscheduled outputs</p>
            ) : (
              filteredUnscheduled.map((output) => (
                <div
                  key={output.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, output.id)}
                  className="bg-[#111111] border border-[#1a1a1a] p-2 cursor-grab active:cursor-grabbing hover:border-[#333] transition-colors"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: TYPE_COLORS[output.output_type] || "#6b6b6b",
                      }}
                    />
                    <span
                      className="font-mono text-[9px] uppercase tracking-wider"
                      style={{ color: TYPE_COLORS[output.output_type] || "#6b6b6b" }}
                    >
                      {TYPE_LABELS[output.output_type] || output.output_type}
                    </span>
                  </div>
                  <p className="font-mono text-[10px] text-[#a0a0a0] truncate">
                    {output.title}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Day Modal */}
      {selectedDay && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setSelectedDay(null)}
        >
          <div
            className="bg-[#0a0a0a] border border-[#1a1a1a] w-full max-w-lg max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a1a]">
              <h2 className="font-mono text-sm font-bold">
                {new Date(selectedDay + "T12:00:00").toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </h2>
              <button
                onClick={() => setSelectedDay(null)}
                className="font-mono text-sm text-[#6b6b6b] hover:text-white transition-colors"
              >
                &times;
              </button>
            </div>

            {/* Modal body */}
            <div className="px-5 py-4 space-y-3">
              {selectedDayOutputs.length === 0 ? (
                <p className="font-mono text-xs text-[#6b6b6b]">No content scheduled for this day.</p>
              ) : (
                selectedDayOutputs.map((output) => (
                  <div
                    key={output.id}
                    className="bg-[#111111] border border-[#1a1a1a] p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 border"
                          style={{
                            color: TYPE_COLORS[output.output_type] || "#6b6b6b",
                            borderColor: TYPE_COLORS[output.output_type] || "#1a1a1a",
                          }}
                        >
                          {TYPE_LABELS[output.output_type] || output.output_type}
                        </span>
                        <span
                          className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 border flex items-center gap-1"
                          style={{
                            color: STATUS_COLORS[output.schedule_status] || "#6b6b6b",
                            borderColor: STATUS_COLORS[output.schedule_status] || "#1a1a1a",
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: STATUS_COLORS[output.schedule_status] || "#6b6b6b" }}
                          />
                          {output.schedule_status}
                        </span>
                      </div>
                    </div>
                    <p className="font-mono text-xs text-white mb-3">{output.title}</p>
                    <div className="flex items-center gap-2">
                      <Link
                        href={"/dashboard/outputs/" + output.id}
                        className="font-mono text-[10px] text-[#4a9eff] hover:text-white transition-colors"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => toggleStatus(output.id, output.schedule_status)}
                        className="font-mono text-[10px] text-[#8b5cf6] hover:text-white transition-colors"
                      >
                        Toggle Status
                      </button>
                      <button
                        onClick={() => removeFromCalendar(output.id)}
                        className="font-mono text-[10px] text-[#ef4444] hover:text-white transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal footer */}
            <div className="px-5 py-3 border-t border-[#1a1a1a]">
              <Link
                href="/dashboard/generate"
                className="font-mono text-[10px] uppercase tracking-wider text-[#22c55e] hover:text-white transition-colors"
              >
                + Create Content
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
