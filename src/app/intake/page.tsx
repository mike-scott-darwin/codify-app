"use client";

import { useState, useRef, FormEvent, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const MAX_RECORDING_SECONDS = 180;

function IntakeForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("t") || "";

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Voice recording state
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [answers, setAnswers] = useState({
    identity: "",
    contrarian: "",
    style: "",
    origin: "",
  });

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  // ---- Voice Recording ----

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/mp4",
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: mediaRecorder.mimeType,
        });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start(1000);
      setRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= MAX_RECORDING_SECONDS - 1) {
            stopRecording();
            return MAX_RECORDING_SECONDS;
          }
          return prev + 1;
        });
      }, 1000);
    } catch {
      setError(
        "Microphone access denied. Please allow microphone access and try again."
      );
    }
  }

  function stopRecording() {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function clearRecording() {
    setAudioBlob(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setRecordingTime(0);
  }

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  function update(field: keyof typeof answers, value: string) {
    setAnswers((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const filled = Object.values(answers).filter((v) => v.trim().length > 0);
    if (filled.length === 0 && !audioBlob) {
      setError("Answer at least one question or record a voice note.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("token", token);
      formData.append("answers", JSON.stringify(answers));

      if (audioBlob) {
        formData.append("voiceNote", audioBlob, "voice-note.webm");
        formData.append("voiceDuration", String(recordingTime));
      }

      const res = await fetch("/api/intake", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }

      setSubmitted(true);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Try again."
      );
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
            Your input will make your Snapshot significantly sharper. You&apos;ll
            have it in your inbox within 24 hours.
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
            make the output significantly better. Type, dictate, or record a
            voice note below. Skip what doesn&apos;t resonate — even one answer
            helps.
          </p>
        </div>

        {/* Voice note recorder */}
        <div className="mb-8 p-5 bg-white border border-[#e5e5e5] rounded-xl">
          <p className="text-[15px] font-semibold text-[#1a1a1a] mb-1">
            Prefer to talk?
          </p>
          <p className="text-sm text-[#888] mb-3">
            Hit record and answer any of the questions below out loud. Up to 3
            minutes.
          </p>

          {!audioBlob ? (
            <div>
              {recording ? (
                <div className="flex items-center gap-3">
                  <span className="inline-block w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-[#1a1a1a] text-sm font-mono">
                    {formatTime(recordingTime)}
                  </span>
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="ml-auto px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors"
                  >
                    Stop Recording
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={startRecording}
                  className="flex items-center gap-2 px-5 py-3 bg-[#1a1a1a] text-white text-sm font-medium rounded-lg hover:bg-[#333] transition-colors"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                  Record Voice Note
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#1a1a1a] font-medium">
                  {formatTime(recordingTime)} recorded
                </span>
                <button
                  type="button"
                  onClick={clearRecording}
                  className="text-sm text-[#888] hover:text-[#1a1a1a] transition-colors"
                >
                  Re-record
                </button>
              </div>
              {audioUrl && (
                <audio controls src={audioUrl} className="w-full h-10" />
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 mb-8">
          <div className="flex-1 h-px bg-[#e5e5e5]" />
          <span className="text-sm text-[#aaa]">or type your answers</span>
          <div className="flex-1 h-px bg-[#e5e5e5]" />
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
                placeholder="Type or dictate here..."
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
            {submitting ? "Sending..." : "Submit"}
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
