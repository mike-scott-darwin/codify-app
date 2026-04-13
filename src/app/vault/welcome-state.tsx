import WelcomeActions from "./welcome-actions";

const contextFiles = [
  { name: "Soul", description: "Who you are — beliefs, origin story, framework" },
  { name: "Audience", description: "Who buys — pain points, triggers, their language" },
  { name: "Offer", description: "What you deliver — transformation, deliverables, guarantee" },
  { name: "Voice", description: "How you sound — tone, phrases, anti-language" },
];

export default function WelcomeState() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-sans font-bold text-foreground mb-3">
        Welcome to Your Context Architecture
      </h1>
      <p className="text-base text-muted leading-relaxed mb-10">
        Your vault is empty — that's the point. Everything that goes in is yours.
        Let's start building.
      </p>

      <WelcomeActions />

      <div className="mt-12">
        <h2 className="text-sm font-sans font-bold text-foreground mb-4">Your Four Files</h2>
        <ul className="space-y-3">
          {contextFiles.map((file) => (
            <li key={file.name} className="flex items-start gap-3">
              <span className="text-muted mt-0.5">&#9675;</span>
              <div>
                <span className="text-sm font-bold text-foreground">{file.name}</span>
                <span className="text-sm text-dim"> — {file.description}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-10 text-sm text-muted">
        Start with Soul. Everything else builds from identity.
      </p>
    </div>
  );
}
