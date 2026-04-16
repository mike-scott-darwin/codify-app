import WelcomeActions from "./welcome-actions";

export default function WelcomeState({ businessName }: { businessName?: string | null }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6">
      <div className="max-w-md text-center">
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue to-purple flex items-center justify-center mx-auto mb-8 shadow-lg shadow-purple-500/20">
          <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
          </svg>
        </div>

        {/* Headline */}
        <h1 className="text-2xl font-sans font-bold text-foreground mb-5">
          {businessName ? `Let's set up ${businessName}` : "Teach AI your business"}
        </h1>

        {/* Single clear explanation */}
        <p className="text-base text-muted leading-relaxed mb-10">
          We'll have a <span className="text-foreground font-medium">30-minute conversation</span> about
          {businessName ? ` ${businessName}` : " your business"} — what you sell, who you sell to, and how you talk about it.
          From that, Codify builds a profile so every
          <span className="text-blue"> ad</span>,
          <span className="text-green"> proposal</span>,
          <span className="text-amber"> email</span>, and
          <span className="text-purple"> piece of content</span> sounds
          like you wrote it.
        </p>

        {/* Single CTA */}
        <WelcomeActions />

        <p className="text-xs text-dim mt-4">You talk. AI listens. That's it.</p>
      </div>
    </div>
  );
}
