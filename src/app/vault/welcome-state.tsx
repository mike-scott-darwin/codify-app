import WelcomeActions from "./welcome-actions";

const steps = [
  {
    number: "1",
    name: "Soul",
    question: "Why does your business exist?",
    outcome: "Your origin story, beliefs, and what makes you different — so AI never sounds generic.",
  },
  {
    number: "2",
    name: "Offer",
    question: "What do you actually sell?",
    outcome: "Your products, pricing, and the transformation you deliver — so every proposal hits.",
  },
  {
    number: "3",
    name: "Audience",
    question: "Who are you selling to?",
    outcome: "Their pain points, language, and buying triggers — so your ads speak directly to them.",
  },
  {
    number: "4",
    name: "Voice",
    question: "How do you naturally communicate?",
    outcome: "Your tone, phrases, and style — so everything reads like you wrote it.",
  },
];

export default function WelcomeState() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Hero — outcome focused */}
      <h1 className="text-2xl font-sans font-bold text-foreground mb-3">
        Let's teach AI how your business works
      </h1>
      <p className="text-base text-muted leading-relaxed mb-2">
        After this, every ad, proposal, email, and piece of content will sound like you wrote it — because AI will actually understand your business, not guess at it.
      </p>
      <p className="text-sm text-dim mb-10">
        It's a conversation, not a form. Takes about 30 minutes.
      </p>

      {/* Primary CTAs */}
      <WelcomeActions />

      {/* What we'll cover — business questions, not file names */}
      <div className="mt-12">
        <h2 className="text-sm font-sans font-bold text-foreground mb-2">What we'll cover</h2>
        <p className="text-xs text-muted mb-5">
          Four conversations that become the foundation for everything AI creates for you.
        </p>

        <div className="space-y-4">
          {steps.map((step) => (
            <div key={step.name} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-blue/10 border border-blue/20 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-blue">{step.number}</span>
                </div>
                {step.number !== "4" && <div className="w-px h-full bg-border mt-1" />}
              </div>
              <div className="pb-4">
                <p className="text-sm font-bold text-foreground">{step.question}</p>
                <p className="text-xs text-muted mt-1 leading-relaxed">{step.outcome}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* What happens after */}
      <div className="mt-10 bg-surface border border-border rounded-xl p-5">
        <h3 className="text-sm font-sans font-bold text-foreground mb-2">What you get when this is done</h3>
        <ul className="space-y-2">
          <li className="flex items-start gap-2.5">
            <span className="text-green text-sm mt-0.5">&#10003;</span>
            <span className="text-sm text-muted">Facebook and Google ads written in your voice, targeting your actual audience</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="text-green text-sm mt-0.5">&#10003;</span>
            <span className="text-sm text-muted">Proposals and emails that explain your value the way you would</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="text-green text-sm mt-0.5">&#10003;</span>
            <span className="text-sm text-muted">Content and landing pages that convert — because they actually know your offer</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="text-green text-sm mt-0.5">&#10003;</span>
            <span className="text-sm text-muted">A living system that gets sharper every time you add a decision or insight</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
