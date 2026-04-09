export default function TermsPage() {
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
          <div className="flex items-center gap-6">
            <a
              href="/"
              className="text-sm text-muted hover:text-white transition-colors"
            >
              Home
            </a>
            <a
              href="/get-started"
              className="text-sm font-semibold bg-blue text-black px-4 py-2 rounded-lg hover:brightness-110 transition-all"
            >
              Try for Free
            </a>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-28 pb-12 md:pt-36 md:pb-16">
        <div className="max-w-[700px] mx-auto px-6 md:px-12 text-center">
          <h1 className="font-bold text-white leading-[1.1] mb-4 text-[clamp(1.75rem,5vw,2.5rem)]">
            Terms of Service
          </h1>
          <p className="text-dim text-xs">Last updated: 29 March 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="pb-16 md:pb-20">
        <div className="max-w-[680px] mx-auto px-6 md:px-12 space-y-10">
          <div>
            <h2 className="font-bold text-white text-xl mb-3">
              Agreement to Terms
            </h2>
            <p className="text-muted text-base md:text-sm leading-relaxed">
              By accessing or using codify.build (&quot;the Service&quot;),
              operated by Codify (&quot;we&quot;, &quot;us&quot;,
              &quot;our&quot;), you agree to be bound by these terms. If you
              don&apos;t agree, don&apos;t use the Service.
            </p>
          </div>

          <div>
            <h2 className="font-bold text-white text-xl mb-3">The Service</h2>
            <p className="text-muted text-base md:text-sm leading-relaxed">
              Codify provides a reference architecture and skill system that
              helps you extract, structure, and operationalise your business
              knowledge for use with AI tools. The Service includes context
              extraction, content generation, competitive intelligence, lead
              generation, CRM integration, and website building capabilities
              depending on your subscription tier.
            </p>
          </div>

          <div>
            <h2 className="font-bold text-white text-xl mb-3">Accounts</h2>
            <div className="space-y-4">
              <p className="text-muted text-base md:text-sm leading-relaxed">
                You are responsible for maintaining the security of your account
                credentials and any activity that occurs under your account. You
                must provide accurate information when creating an account.
              </p>
              <p className="text-muted text-base md:text-sm leading-relaxed">
                You must be at least 18 years old to use the Service. By using
                Codify, you represent that you meet this requirement.
              </p>
            </div>
          </div>

          <div>
            <h2 className="font-bold text-white text-xl mb-3">
              Subscriptions &amp; Payments
            </h2>
            <div className="space-y-4">
              <p className="text-muted text-base md:text-sm leading-relaxed">
                <span className="text-white font-semibold">Free trial.</span>{" "}
                The free trial includes 5 context extractions and 3 content
                outputs. No credit card required.
              </p>
              <p className="text-muted text-base md:text-sm leading-relaxed">
                <span className="text-white font-semibold">Paid tiers.</span>{" "}
                Build ($99/mo), Pro ($199/mo), and VIP ($497/mo) are billed
                monthly or annually. Annual plans are discounted. Prices are in
                USD.
              </p>
              <p className="text-muted text-base md:text-sm leading-relaxed">
                <span className="text-white font-semibold">Cancellation.</span>{" "}
                You can cancel anytime. Your subscription remains active until
                the end of your current billing period. No refunds for partial
                months.
              </p>
              <p className="text-muted text-base md:text-sm leading-relaxed">
                <span className="text-white font-semibold">Price changes.</span>{" "}
                We may change pricing with 30 days&apos; notice. Existing
                subscribers keep their current rate until the end of their
                billing cycle.
              </p>
            </div>
          </div>

          <div>
            <h2 className="font-bold text-white text-xl mb-3">
              Your Content &amp; Intellectual Property
            </h2>
            <div className="space-y-4">
              <p className="text-muted text-base md:text-sm leading-relaxed">
                <span className="text-white font-semibold">You own your vault.</span>{" "}
                All reference files, context documents, and generated outputs
                created through the Service belong to you. Your vault lives in
                your own repository. If you cancel, your files stay with you.
              </p>
              <p className="text-muted text-base md:text-sm leading-relaxed">
                <span className="text-white font-semibold">
                  We don&apos;t train on your data.
                </span>{" "}
                Your vault contents are never used to train AI models, improve
                our service for other customers, or shared with third parties.
              </p>
              <p className="text-muted text-base md:text-sm leading-relaxed">
                <span className="text-white font-semibold">
                  Sovereign Vault (VIP).
                </span>{" "}
                VIP tier customers get self-hosted infrastructure. You control
                the server, the encryption, and the access. We help you set it
                up but the infrastructure is yours.
              </p>
            </div>
          </div>

          <div>
            <h2 className="font-bold text-white text-xl mb-3">
              Acceptable Use
            </h2>
            <p className="text-muted text-base md:text-sm leading-relaxed mb-3">
              You agree not to use the Service to:
            </p>
            <ul className="space-y-2 text-muted text-base md:text-sm leading-relaxed">
              <li className="flex gap-2">
                <span className="text-blue shrink-0">&bull;</span>
                <span>Violate any applicable laws or regulations</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue shrink-0">&bull;</span>
                <span>
                  Generate content that is illegal, harmful, or infringes on
                  others&apos; rights
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue shrink-0">&bull;</span>
                <span>
                  Attempt to reverse-engineer, copy, or redistribute the Codify
                  skill system or vault architecture
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue shrink-0">&bull;</span>
                <span>
                  Resell or redistribute access to the Service without written
                  permission
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue shrink-0">&bull;</span>
                <span>
                  Interfere with or disrupt the Service or its infrastructure
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-bold text-white text-xl mb-3">
              AI-Generated Content
            </h2>
            <p className="text-muted text-base md:text-sm leading-relaxed">
              The Service uses AI (including Claude and other models) to generate
              content based on your reference files. While we design the system
              for high accuracy, AI-generated content may contain errors. You are
              responsible for reviewing and approving all outputs before use. We
              are not liable for decisions made based on AI-generated content.
            </p>
          </div>

          <div>
            <h2 className="font-bold text-white text-xl mb-3">
              Third-Party Services
            </h2>
            <p className="text-muted text-base md:text-sm leading-relaxed">
              The Service integrates with third-party tools (GoHighLevel, GitHub,
              Stripe, etc.). Your use of those services is governed by their
              respective terms. We are not responsible for third-party service
              outages or changes.
            </p>
          </div>

          <div>
            <h2 className="font-bold text-white text-xl mb-3">
              Limitation of Liability
            </h2>
            <p className="text-muted text-base md:text-sm leading-relaxed">
              The Service is provided &quot;as is&quot; without warranties of
              any kind. To the maximum extent permitted by law, Codify shall not
              be liable for any indirect, incidental, special, consequential, or
              punitive damages, or any loss of profits or revenue, whether
              incurred directly or indirectly. Our total liability for any claim
              arising from the Service is limited to the amount you paid us in
              the 12 months preceding the claim.
            </p>
          </div>

          <div>
            <h2 className="font-bold text-white text-xl mb-3">Termination</h2>
            <p className="text-muted text-base md:text-sm leading-relaxed">
              We may suspend or terminate your access to the Service if you
              violate these terms. You can terminate your account at any time by
              cancelling your subscription and emailing us. Upon termination,
              your vault files remain in your own repository &mdash; we
              don&apos;t delete your work.
            </p>
          </div>

          <div>
            <h2 className="font-bold text-white text-xl mb-3">
              Governing Law
            </h2>
            <p className="text-muted text-base md:text-sm leading-relaxed">
              These terms are governed by the laws of the Northern Territory,
              Australia. Any disputes will be resolved in the courts of the
              Northern Territory.
            </p>
          </div>

          <div>
            <h2 className="font-bold text-white text-xl mb-3">Changes</h2>
            <p className="text-muted text-base md:text-sm leading-relaxed">
              We may update these terms from time to time. We&apos;ll notify you
              via email if changes are significant. Continued use of the Service
              after changes constitutes acceptance of the updated terms.
            </p>
          </div>

          <div>
            <h2 className="font-bold text-white text-xl mb-3">Contact</h2>
            <p className="text-muted text-base md:text-sm leading-relaxed">
              Questions about these terms? Email us at{" "}
              <a
                href="mailto:hello@codify.build"
                className="text-blue hover:underline"
              >
                hello@codify.build
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="max-w-[1000px] mx-auto px-6 md:px-12 text-center">
          <span className="text-xs text-dim">
            &copy; {new Date().getFullYear()} Codify &middot; Context &gt;
            Prompts.
          </span>
        </div>
      </footer>
    </main>
  );
}
