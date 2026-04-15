export default function ResearchLoading() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8 animate-pulse">
      <div className="h-7 w-32 bg-surface rounded mb-6" />
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3 bg-surface border border-border rounded-lg">
            <div className="h-3 w-20 bg-background rounded" />
            <div className="h-4 w-48 bg-background rounded flex-1" />
            <div className="h-3 w-16 bg-background rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
