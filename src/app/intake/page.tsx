"use client";

import { useState, FormEvent, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function IntakeForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("t") || "";

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [answers, setAnswers] = useState({
    identity: "",
    contrarian: "",
    style: "",
    origin: "",
  });

  function update(field: keyof typeof answers, value: string) {
    setAnswers((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const filled = Object.values(answers).filter((v) => v.trim().length > 0);
    if (filled.length === 0) {
      setError("Answer at least one question — even a sentence helps.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, answers }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }

      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4">
        <div className="max-w-lg text-center">
          <div className="text-4xl mb-4">&#10003;</div>
          <h1
            className="text-2xl font-bold mb-3"
            style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
          >
            Got it — thank you.
          </h1>
          <p className="text-[#666] text-lg leading-relaxed">
            Your input will make your Snapshot significantly sharper.
            You&apos;ll have it in your inbox within 24 hours.
          </p>
        </div>
      </main>
    );
  }

  const questions = [
    {
      key: "identity" as const,
      label: "What do you do and who do you do it for?",
      hint: "In your own words — not the website version.",
    },
    {
      key: "contrarian" as const,
      label: "What does your industry get wrong that you refuse to do?",
      hint: "The thing competitors happily offer that you won't touch.",
    },
    {
      key: "style" as const,
      label: "How would you describe your style — how do you actually talk to clients?",
      hint: "Direct? Warm? Technical? Irreverent? Give us a feel.",
    },
    {
      key: "origin" as const,
      label: "What made you start this business?",
      hint: "The real reason, not the press release version.",
    },
  ];

  return (
    <main className="min-h-screen bg-[#fafafa]">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="mb-10">
          <p
            className="text-sm font-medium tracking-widest text-[#888] uppercase mb-2"
            style={{ fontFamily: "var(--font-jetbrains), monospace" }}
          >
            Codify Snapshot
          </p>
          <h1
            className="text-3xl font-bold mb-3"
            style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
          >
            A few questions to sharpen your Snapshot
          </h1>
          <p className="text-[#666] text-lg leading-relaxed">
            I&apos;m already researching your business. Answer any of these to
            make the output significantly better. Use your phone&apos;s
            dictation — just tap the mic and talk. Skip what doesn&apos;t
            resonate — even one answer helps.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {questions.map((q) => (
            <div key={q.key}>
              <label className="block text-[15px] font-semibold text-[#1a1a1a] mb-1">
                {q.label}
              </label>
              <p className="text-sm text-[#888] mb-2">{q.hint}</p>
              <textarea
                value={answers[q.key]}
                onChange={(e) => update(q.key, e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-[#ddd] rounded-lg text-[15px] text-[#1a1a1a] bg-white resize-y focus:outline-none focus:border-[#1a1a1a] transition-colors"
                placeholder="Type here..."
              />
            </div>
          ))}

          {error && (
            <p className="text-red-600 text-sm font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-[#1a1a1a] text-white font-semibold rounded-lg text-[15px] hover:bg-[#333] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? "Sending..." : "Submit Answers"}
          </button>

          <p className="text-center text-sm text-[#999]">
            Your answers go directly to the person building your Snapshot.
            Nothing is shared or stored beyond this project.
          </p>
        </form>
      </div>
    </main>
  );
}

export default function IntakePage() {
  return (
    <Suspense>
      <IntakeForm />
    </Suspense>
  );
}
