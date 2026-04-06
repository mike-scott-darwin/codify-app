"use client";

import { useState, useRef, FormEvent, useEffect } from "react";

const LEAD_API = "/api/lead";
const MAX_RECORDING_SECONDS = 180;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = ".pdf,.doc,.docx,.txt";

// Guided prompts for voice mode
const VOICE_PROMPTS = [
  "What does your business do — in plain English?",
  "Who is your ideal client and what keeps them up at night?",
  "What makes you different from the obvious alternatives?",
  "What's the one thing slowing your growth right now?",
];

export default function GetStarted() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Voice recording state
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // File upload state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Input mode
  const [inputMode, setInputMode] = useState<"write" | "upload" | "voice">(
    "write"
  );

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

  // ---- File Upload ----

  function handleFileSelect(file: File) {
    if (file.size > MAX_FILE_SIZE) {
      setError("File too large. Maximum size is 10MB.");
      return;
    }
    setError("");
    setUploadedFile(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  }

  function clearFile() {
    setUploadedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // ---- Form Submit ----

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const form = e.currentTarget;
    const formData = new FormData();

    // Contact fields
    formData.append(
      "firstName",
      (form.elements.namedItem("firstName") as HTMLInputElement).value
    );
    formData.append(
      "lastName",
      (form.elements.namedItem("lastName") as HTMLInputElement).value
    );
    formData.append(
      "email",
      (form.elements.namedItem("email") as HTMLInputElement).value
    );
    formData.append(
      "phone",
      (form.elements.namedItem("phone") as HTMLInputElement).value
    );

    // Business answers (from write mode fields)
    const businessEl = form.elements.namedItem("business") as HTMLInputElement;
    const audienceEl = form.elements.namedItem("audience") as HTMLInputElement;
    const differentiatorEl = form.elements.namedItem(
      "differentiator"
    ) as HTMLInputElement;
    const challengeEl = form.elements.namedItem(
      "challenge"
    ) as HTMLInputElement;

    formData.append("business", businessEl?.value || "");
    formData.append("audience", audienceEl?.value || "");
    formData.append("differentiator", differentiatorEl?.value || "");
    formData.append("challenge", challengeEl?.value || "");

    formData.append("inputMode", inputMode);

    // File upload
    if (uploadedFile) {
      formData.append("file", uploadedFile);
    }

    // Voice note
    if (audioBlob) {
      formData.append("voiceNote", audioBlob, "voice-note.webm");
      formData.append("voiceDuration", String(recordingTime));
    }

    try {
      const res = await fetch(LEAD_API, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setError(err.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
    } catch {
      setSubmitted(true);
    }
  }

  // ---- Shared styles ----

  const inputClass =
    "w-full bg-background border border-border rounded-lg px-4 py-3 text-base md:text-sm text-white placeholder:text-dim outline-none focus:border-blue transition-colors";

  const modeTab = (
    mode: "write" | "upload" | "voice",
    label: string,
    icon: string
  ) => (
    <button
      type="button"
      onClick={() => setInputMode(mode)}
      className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium rounded-lg transition-colors ${
        inputMode === mode
          ? "bg-blue/20 text-blue border border-blue/40"
          : "text-muted hover:text-white border border-border hover:border-border/80"
      }`}
    >
      <span>{icon}</span>
      {label}
    </button>
  );

  return (
    <main>
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-[1000px] mx-auto px-6 md:px-12 flex items-center justify-between h-14">
          <a href="/" className="flex items-center gap-2">
            <span className="text-lg font-bold text-white tracking-tight">
              codify
            </span>
          </a>
          <a
            href="/"
            className="text-sm text-muted hover:text-white transition-colors"
          >
            Back to site
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-20 pb-8 md:pt-36 md:pb-12">
        <div className="max-w-[700px] mx-auto px-6 md:px-12 text-center">
          <p className="text-xs tracking-[0.2em] uppercase text-blue mb-3">
            FREE OPPORTUNITY SCAN
          </p>
          <h1 className="font-bold text-white leading-[1.1] mb-4 text-[clamp(1.75rem,5vw,2.5rem)]">
            What Revenue Are You{"\n"}Leaving on the Table?
          </h1>
          <p className="text-muted text-base md:text-lg leading-relaxed">
            Tell us about your business. Google, Claude, and Codex scan your
            market simultaneously — and show you exactly where the money is.
            Free. 15 minutes.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="pb-16 md:pb-24">
        <div className="max-w-[520px] mx-auto px-6 md:px-12">
          {submitted ? (
            <div className="bg-surface border border-green/30 rounded-xl p-6 md:p-8 text-center">
              <p className="text-2xl mb-3">&#x2713;</p>
              <h2 className="font-bold text-white text-xl mb-2">
                We&apos;re scanning your market now.
              </h2>
              <p className="text-muted text-sm leading-relaxed">
                Three AI models are scanning your market right now — Google for
                real-time data, Claude for strategic analysis, Codex for
                competitive patterns. Your 3 opportunities will land in your
                inbox within 15 minutes.
              </p>
            </div>
          ) : (
            <div className="bg-surface border border-blue/30 rounded-xl p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Contact fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-xs text-muted mb-1.5"
                    >
                      First name
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      className={inputClass}
                      placeholder="Jane"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-xs text-muted mb-1.5"
                    >
                      Last name
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      className={inputClass}
                      placeholder="Smith"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs text-muted mb-1.5"
                  >
                    Email (where we send your opportunities)
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className={inputClass}
                    placeholder="jane@example.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-xs text-muted mb-1.5"
                  >
                    Phone
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    className={inputClass}
                    placeholder="+1 555 123 4567"
                  />
                </div>

                {/* Divider + mode selector */}
                <div className="border-t border-border pt-5">
                  <p className="text-sm font-medium text-white mb-1">
                    Tell us about your business
                  </p>
                  <p className="text-xs text-muted mb-3">
                    Pick whichever way is easiest for you. The more detail you
                    share, the better your opportunities will be.
                  </p>
                  <div className="flex gap-2 mb-4">
                    {modeTab("write", "Type it", "\u270D")}
                    {modeTab("upload", "Upload", "\u{1F4CE}")}
                    {modeTab("voice", "Voice note", "\u{1F3A4}")}
                  </div>
                </div>

                {/* Mode: Write — guided questions with examples */}
                {inputMode === "write" && (
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="business"
                        className="block text-xs text-muted mb-1.5"
                      >
                        What does your business do?
                      </label>
                      <textarea
                        id="business"
                        name="business"
                        required={inputMode === "write"}
                        rows={2}
                        className={inputClass + " resize-none"}
                        placeholder="e.g. We run a fractional CFO practice for SaaS startups — we handle financial modeling, fundraise prep, and board reporting for companies between $2M and $20M ARR."
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="audience"
                        className="block text-xs text-muted mb-1.5"
                      >
                        Who is your ideal client and what do they struggle with?
                      </label>
                      <textarea
                        id="audience"
                        name="audience"
                        rows={2}
                        className={inputClass + " resize-none"}
                        placeholder="e.g. Series A founders who've outgrown their bookkeeper but can't justify a $250K full-time CFO. They're flying blind on cash runway and investor reporting."
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="differentiator"
                        className="block text-xs text-muted mb-1.5"
                      >
                        What makes you different from competitors?
                      </label>
                      <textarea
                        id="differentiator"
                        name="differentiator"
                        rows={2}
                        className={inputClass + " resize-none"}
                        placeholder="e.g. We embed directly into their financial stack — Stripe, QBO, Carta — instead of working from spreadsheets. Founders get a live dashboard, not a monthly PDF."
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="challenge"
                        className="block text-xs text-muted mb-1.5"
                      >
                        What&apos;s your biggest growth challenge right now?
                      </label>
                      <textarea
                        id="challenge"
                        name="challenge"
                        rows={2}
                        className={inputClass + " resize-none"}
                        placeholder="e.g. Getting past the 'we'll hire a full-time CFO eventually' objection. By the time they realize they need us, they've already made costly financial mistakes."
                      />
                    </div>
                  </div>
                )}

                {/* Mode: Upload */}
                {inputMode === "upload" && (
                  <div>
                    <p className="text-xs text-muted mb-3">
                      Upload a pitch deck, proposal, one-pager, or website copy.
                      We&apos;ll extract your positioning and run a deeper scan.
                    </p>
                    {uploadedFile ? (
                      <div className="bg-background border border-border rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-blue text-lg">&#128196;</span>
                          <div>
                            <p className="text-sm text-white">
                              {uploadedFile.name}
                            </p>
                            <p className="text-xs text-dim">
                              {(uploadedFile.size / 1024).toFixed(0)} KB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={clearFile}
                          className="text-xs text-muted hover:text-white transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label
                        className="block cursor-pointer"
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragOver(true);
                        }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                      >
                        <div
                          className={`bg-background border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                            dragOver
                              ? "border-blue/60 bg-blue/5"
                              : "border-border hover:border-blue/40"
                          }`}
                        >
                          <p className="text-sm text-muted mb-1">
                            Drop a file here or click to upload
                          </p>
                          <p className="text-xs text-dim">
                            PDF, DOC, DOCX, or TXT — max 10MB
                          </p>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept={ACCEPTED_FILE_TYPES}
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    )}
                    {/* Still ask the core question */}
                    <div className="mt-4">
                      <label
                        htmlFor="business"
                        className="block text-xs text-muted mb-1.5"
                      >
                        In one sentence — what does your business do?
                      </label>
                      <input
                        id="business"
                        name="business"
                        type="text"
                        required
                        className={inputClass}
                        placeholder="e.g. Fractional CFO for SaaS companies doing $2M-$20M ARR"
                      />
                    </div>
                  </div>
                )}

                {/* Mode: Voice */}
                {inputMode === "voice" && (
                  <div>
                    <div className="bg-background border border-border rounded-lg p-4 mb-4">
                      <p className="text-xs text-muted mb-2.5">
                        Hit record and walk through these four questions. 2-3
                        minutes is perfect.
                      </p>
                      <ol className="space-y-1.5">
                        {VOICE_PROMPTS.map((prompt, i) => (
                          <li
                            key={i}
                            className="text-xs text-white/80 flex gap-2"
                          >
                            <span className="text-blue font-bold shrink-0">
                              {i + 1}.
                            </span>
                            {prompt}
                          </li>
                        ))}
                      </ol>
                    </div>

                    {!audioBlob ? (
                      <div className="bg-background border border-border rounded-lg p-6 text-center">
                        {recording ? (
                          <>
                            <div className="flex items-center justify-center gap-3 mb-3">
                              <span className="inline-block w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                              <span className="text-white text-lg font-mono">
                                {formatTime(recordingTime)}
                              </span>
                              <span className="text-xs text-dim">
                                / {formatTime(MAX_RECORDING_SECONDS)}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={stopRecording}
                              className="bg-red-500/20 text-red-400 border border-red-500/40 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-colors"
                            >
                              Stop Recording
                            </button>
                          </>
                        ) : (
                          <>
                            <p className="text-muted text-sm mb-3">
                              Tap to start recording
                            </p>
                            <button
                              type="button"
                              onClick={startRecording}
                              className="bg-blue/20 text-blue border border-blue/40 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue/30 transition-colors"
                            >
                              Record Voice Note
                            </button>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="bg-background border border-border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white">
                            Voice note — {formatTime(recordingTime)}
                          </span>
                          <button
                            type="button"
                            onClick={clearRecording}
                            className="text-xs text-muted hover:text-white transition-colors"
                          >
                            Re-record
                          </button>
                        </div>
                        {audioUrl && (
                          <audio controls src={audioUrl} className="w-full h-8" />
                        )}
                      </div>
                    )}

                    {/* Core question for search */}
                    <div className="mt-4">
                      <label
                        htmlFor="business"
                        className="block text-xs text-muted mb-1.5"
                      >
                        In one sentence — what does your business do?
                      </label>
                      <input
                        id="business"
                        name="business"
                        type="text"
                        required
                        className={inputClass}
                        placeholder="e.g. Fractional CFO for SaaS companies doing $2M-$20M ARR"
                      />
                    </div>
                  </div>
                )}

                {error && <p className="text-red-400 text-xs">{error}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue text-black font-semibold text-sm py-3.5 rounded-lg hover:brightness-110 transition-all disabled:opacity-50"
                >
                  {submitting ? "3 AI models scanning your market..." : "Find My Missing Revenue"}
                </button>

                <p className="text-[11px] text-dim text-center">
                  Free. No credit card. Results in under 15 minutes.
                </p>
              </form>
            </div>
          )}

          {/* How it works */}
          <div className="mt-6 space-y-3">
            <p className="text-xs text-dim uppercase tracking-wider text-center">
              How it works
            </p>
            <div className="grid grid-cols-1 gap-3">
              <div className="bg-surface border border-border rounded-lg p-4 flex items-start gap-3">
                <span className="text-blue shrink-0 mt-0.5 font-bold text-sm">
                  1
                </span>
                <div>
                  <p className="text-sm font-medium text-white">
                    Tell us about your business
                  </p>
                  <p className="text-xs text-muted">
                    Answer 4 quick questions, upload a document, or record a
                    voice note. Whatever&apos;s easiest.
                  </p>
                </div>
              </div>
              <div className="bg-surface border border-border rounded-lg p-4 flex items-start gap-3">
                <span className="text-blue shrink-0 mt-0.5 font-bold text-sm">
                  2
                </span>
                <div>
                  <p className="text-sm font-medium text-white">
                    3 AI models scan your market simultaneously
                  </p>
                  <p className="text-xs text-muted">
                    Google pulls real-time market data and competitor ads. Claude
                    analyzes your positioning and finds strategic gaps. Codex
                    matches competitive patterns across your industry.
                  </p>
                </div>
              </div>
              <div className="bg-surface border border-border rounded-lg p-4 flex items-start gap-3">
                <span className="text-blue shrink-0 mt-0.5 font-bold text-sm">
                  3
                </span>
                <div>
                  <p className="text-sm font-medium text-white">
                    3 opportunities in your inbox
                  </p>
                  <p className="text-xs text-muted">
                    Specific, non-obvious plays delivered within 15 minutes. Not
                    generic advice — evidence-based opportunities.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-surface border border-border rounded-lg p-4 text-center mt-4">
              <p className="text-xs text-muted italic">
                &ldquo;These 3 came from a paragraph. Imagine what happens with
                your full expertise codified.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="max-w-[1000px] mx-auto px-6 md:px-12 text-center">
          <span className="text-xs text-dim">
            &copy; {new Date().getFullYear()} Codify &middot; Your expertise,
            structured. Your AI, transformed.
          </span>
        </div>
      </footer>
    </main>
  );
}
