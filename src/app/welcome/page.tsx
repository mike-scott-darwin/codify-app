export default function Welcome() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="max-w-[600px] mx-auto px-6 text-center">
        <div className="text-5xl mb-6">&#x2705;</div>
        <h1 className="font-bold text-white text-3xl md:text-4xl mb-4">
          You&apos;re In.
        </h1>
        <p className="text-muted text-lg leading-relaxed mb-6">
          Payment confirmed. We&apos;re setting up your system now.
          You&apos;ll get a WhatsApp message within the next few hours
          to start your onboarding.
        </p>
        <div className="bg-surface border border-border rounded-xl p-6 text-left mb-8">
          <p className="font-semibold text-white text-sm mb-3">
            What happens next:
          </p>
          <ol className="space-y-3 text-sm text-muted">
            <li className="flex gap-3">
              <span className="text-blue font-bold shrink-0">1.</span>
              <span>We&apos;ll reach out on WhatsApp to schedule your onboarding session</span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue font-bold shrink-0">2.</span>
              <span>We capture your expertise — your offer, audience, voice, and business knowledge</span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue font-bold shrink-0">3.</span>
              <span>You start getting ads, proposals, and content that sound like you — not a machine</span>
            </li>
          </ol>
        </div>
        <p className="text-sm text-dim">
          Questions? Message us at{" "}
          <a href="mailto:hello@codify.build" className="text-blue hover:underline">
            hello@codify.build
          </a>
        </p>
      </div>
    </main>
  );
}
