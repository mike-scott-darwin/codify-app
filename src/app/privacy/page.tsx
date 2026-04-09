export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-dim text-xs">Last updated: 29 March 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="pb-16 md:pb-20">
        <div className="max-w-[680px] mx-auto px-6 md:px-12 space-y-10">
          <div>
            <h2 className="font-bold text-white text-xl mb-3">Overview</h2>
            <p className="text-muted text-base md:text-sm leading-relaxed">
              Codify (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates
              codify.build. This policy explains what data we collect, why we
              collect it, and how we protect it. We keep things simple because
              your trust matters more than legalese.
            </p>
          </div>

          <div>
            <h2 className="font-bold text-white text-xl mb-3">
              What We Collect
            </h2>
            <div className="space-y-4">
              <p className="text-muted text-base md:text-sm leading-relaxed">
                <span className="text-white font-semibold">
                  Account information.
                </span>{" "}
                When you sign up or start a free trial, we collect your name and
                email address. If you upgrade to a paid tier, our payment
                processor (Stripe via GoHighLevel) handles your billing details
                &mdash; we never store your card number.
              </p>
              <p className="text-muted text-base md:text-sm leading-relaxed">
                <span className="text-white font-semibold">
                  Vault contents.
                </span>{" "}
                Your reference files (business profile, audience insights, voice
                guide, etc.) are stored in your own private secure storage. We
                do not access, read, or train on your vault contents. Your intellectual property is
                yours.
              </p>
              <p className="text-muted text-base md:text-sm leading-relaxed">
                <span className="text-white font-semibold">Usage data.</span>{" "}
                We collect basic analytics (pages visited, feature usage) to
                improve the product. We use privacy-respecting analytics and do
                not sell this data to third parties.
              </p>
              <p className="text-muted text-base md:text-sm leading-relaxed">
                <span className="text-white font-semibold">
                  Communications.
                </span>{" "}
                If you contact us via email or WhatsApp, we retain those
                messages to provide support and improve our service.
              </p>
            </div>
          </div>

          <div>
            <h2 className="font-bold text-white text-xl mb-3">
              How We Use Your Data
            </h2>
            <ul className="space-y-2 text-muted text-base md:text-sm leading-relaxed">
              <li className="flex gap-2">
                <span className="text-blue shrink-0">&bull;</span>
                <span>To provide and maintain the Codify service</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue shrink-0">&bull;</span>
                <span>
                  To process payments and manage your subscription
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue shrink-0">&bull;</span>
                <span>
                  To send product updates and support communications (you can
                  opt out anytime)
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue shrink-0">&bull;</span>
                <span>To improve the product based on aggregate usage patterns</span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-bold text-white text-xl mb-3">
              What We Don&apos;t Do
            </h2>
            <ul className="space-y-2 text-muted text-base md:text-sm leading-relaxed">
              <li className="flex gap-2">
                <span className="text-blue shrink-0">&bull;</span>
                <span>
                  We do not sell your personal data to anyone. Ever.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue shrink-0">&bull;</span>
                <span>
                  We do not read, access, or train AI models on your vault
                  contents
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue shrink-0">&bull;</span>
                <span>
                  We do not share your information with third parties for
                  marketing purposes
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-bold text-white text-xl mb-3">
              Third-Party Services
            </h2>
            <p className="text-muted text-base md:text-sm leading-relaxed">
              We use the following third-party services that may process your
              data according to their own privacy policies:
            </p>
            <ul className="mt-3 space-y-2 text-muted text-base md:text-sm leading-relaxed">
              <li className="flex gap-2">
                <span className="text-blue shrink-0">&bull;</span>
                <span>
                  <span className="text-white font-semibold">
                    GoHighLevel
                  </span>{" "}
                  &mdash; CRM, email delivery, and payment processing
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue shrink-0">&bull;</span>
                <span>
                  <span className="text-white font-semibold">Stripe</span>{" "}
                  &mdash; payment processing (via GoHighLevel)
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue shrink-0">&bull;</span>
                <span>
                  <span className="text-white font-semibold">Vercel</span>{" "}
                  &mdash; website hosting
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue shrink-0">&bull;</span>
                <span>
                  <span className="text-white font-semibold">GitHub</span>{" "}
                  &mdash; secure cloud storage for vault files
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-bold text-white text-xl mb-3">Data Security</h2>
            <p className="text-muted text-base md:text-sm leading-relaxed">
              We use industry-standard security measures to protect your data.
              VIP tier customers benefit from sovereign vault infrastructure
              &mdash; your own private server, fully encrypted, with audit
              trails and instant access revocation.
            </p>
          </div>

          <div>
            <h2 className="font-bold text-white text-xl mb-3">
              Your Rights
            </h2>
            <p className="text-muted text-base md:text-sm leading-relaxed">
              You can request access to, correction of, or deletion of your
              personal data at any time by emailing{" "}
              <a
                href="mailto:hello@codify.build"
                className="text-blue hover:underline"
              >
                hello@codify.build
              </a>
              . If you cancel your subscription, your vault files remain in your
              own secure storage &mdash; we don&apos;t hold your data hostage.
            </p>
          </div>

          <div>
            <h2 className="font-bold text-white text-xl mb-3">Cookies</h2>
            <p className="text-muted text-base md:text-sm leading-relaxed">
              We use essential cookies to keep the site functional and analytics
              cookies to understand how people use the product. No advertising
              cookies. No tracking pixels from third-party ad networks.
            </p>
          </div>

          <div>
            <h2 className="font-bold text-white text-xl mb-3">Changes</h2>
            <p className="text-muted text-base md:text-sm leading-relaxed">
              We may update this policy from time to time. We&apos;ll notify you
              via email if changes are significant. The latest version will
              always be available at this page.
            </p>
          </div>

          <div>
            <h2 className="font-bold text-white text-xl mb-3">Contact</h2>
            <p className="text-muted text-base md:text-sm leading-relaxed">
              Questions about this policy? Email us at{" "}
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
