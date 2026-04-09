"use client";

import { useState, useRef, FormEvent, useEffect } from "react";

const LEAD_API = "/api/lead";
const MAX_RECORDING_SECONDS = 180;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = ".pdf,.doc,.docx,.txt";

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

    if (uploadedFile) {
      formData.append("file", uploadedFile);
    }

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
            See What Your AI Gets Wrong.
          </h1>
          <p className="text-muted text-base md:text-lg leading-relaxed">
            Tell us about your business in one paragraph. You&apos;ll get back a
            context profile, 3 actionable opportunities, and a clear picture
            of what your AI is getting wrong about your business. Free. 48 hours.
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
                Your Opportunity Scan is underway.
              </h2>
              <p className="text-muted text-sm leading-relaxed">
                We&apos;re building a context profile from your business
                summary — your identity, positioning, audience, and
                differentiator. Then we&apos;ll use it to find 3 specific
                opportunities. Expect your scan in your inbox within 24–48
                hours.
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
                    Email (where we send your results)
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

                {/* Tell us about your business */}
                <div className="border-t border-border pt-5">
                  <p className="text-sm font-medium text-white mb-1">
                    Tell us about your business
                  </p>
                  <p className="text-xs text-muted mb-4">
                    Type, upload, record — use any combination. The more context
                    you share, the sharper your results.
                  </p>
                </div>

                {/* Text fields */}
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
                      required
                      rows={2}
                      className={inputClass + " resize-none"}
                      placeholder="e.g. Fractional CFO for SaaS startups doing $2M–$20M ARR"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="audience"
                      className="block text-xs text-muted mb-1.5"
                    >
                      Who is your ideal client?
                    </label>
                    <textarea
                      id="audience"
                      name="audience"
                      rows={2}
                      className={inputClass + " resize-none"}
                      placeholder="e.g. Series A founders who've outgrown their bookkeeper"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="differentiator"
                      className="block text-xs text-muted mb-1.5"
                    >
                      What makes you different?
                    </label>
                    <textarea
                      id="differentiator"
                      name="differentiator"
                      rows={2}
                      className={inputClass + " resize-none"}
                      placeholder="e.g. We embed into their financial stack — live dashboards, not monthly PDFs"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="challenge"
                      className="block text-xs text-muted mb-1.5"
                    >
                      What&apos;s your biggest growth challenge?
                    </label>
                    <textarea
                      id="challenge"
                      name="challenge"
                      rows={2}
                      className={inputClass + " resize-none"}
                      placeholder="e.g. Prospects think they'll hire a full-time CFO 'eventually'"
                    />
                  </div>
                </div>

                {/* Upload + Voice — optional extras */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Upload */}
                  <div className="bg-background border border-border rounded-lg p-4">
                    <p className="text-xs font-medium text-white mb-2">
                      Attach a file
                      <span className="text-dim font-normal ml-1">(optional)</span>
                    </p>
                    {uploadedFile ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-blue text-sm">&#128196;</span>
                          <p className="text-xs text-white truncate">
                            {uploadedFile.name}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={clearFile}
                          className="text-xs text-muted hover:text-white transition-colors shrink-0 ml-2"
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
                          className={`border border-dashed rounded-lg p-3 text-center transition-colors ${
                            dragOver
                              ? "border-blue/60 bg-blue/5"
                              : "border-border hover:border-blue/40"
                          }`}
                        >
                          <p className="text-xs text-muted">
                            Drop or click — PDF, DOC, TXT
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
                  </div>

                  {/* Voice */}
                  <div className="bg-background border border-border rounded-lg p-4">
                    <p className="text-xs font-medium text-white mb-2">
                      Record a voice note
                      <span className="text-dim font-normal ml-1">(optional)</span>
                    </p>
                    {!audioBlob ? (
                      <div className="text-center">
                        {recording ? (
                          <div className="flex items-center justify-center gap-2">
                            <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            <span className="text-white text-sm font-mono">
                              {formatTime(recordingTime)}
                            </span>
                            <button
                              type="button"
                              onClick={stopRecording}
                              className="text-xs text-red-400 hover:text-red-300 ml-2"
                            >
                              Stop
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={startRecording}
                            className="text-xs text-blue hover:text-blue/80 transition-colors"
                          >
                            Tap to record (up to 3 min)
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-white">
                            {formatTime(recordingTime)} recorded
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
                          <audio controls src={audioUrl} className="w-full h-7" />
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {error && <p className="text-red-400 text-xs">{error}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue text-black font-semibold text-sm py-3.5 rounded-lg hover:brightness-110 transition-all disabled:opacity-50"
                >
                  {submitting ? "Submitting your scan..." : "Try for Free"}
                </button>

                <p className="text-[11px] text-dim text-center">
                  Free. No credit card. Delivered in 24–48 hours.
                </p>
              </form>
            </div>
          )}
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
