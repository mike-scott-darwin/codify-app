export default function VaultLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="h-7 w-40 bg-surface rounded" />
        <div className="h-8 w-20 bg-surface rounded-lg" />
      </div>

      {/* Context Score skeleton */}
      <div className="bg-surface border border-border rounded-lg p-5 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="h-3 w-24 bg-background rounded mb-2" />
            <div className="h-10 w-20 bg-background rounded" />
          </div>
          <div className="text-right space-y-1">
            <div className="h-3 w-28 bg-background rounded" />
            <div className="h-3 w-16 bg-background rounded ml-auto" />
          </div>
        </div>
        <div className="h-2 bg-background rounded-full" />
      </div>

      {/* Section cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-surface border border-border rounded-lg p-3">
            <div className="h-3 w-16 bg-background rounded mb-2" />
            <div className="h-6 w-10 bg-background rounded" />
          </div>
        ))}
      </div>

      {/* Content area */}
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 bg-surface border border-border rounded-lg" />
          ))}
        </div>
        <div className="lg:col-span-2">
          <div className="h-40 bg-surface border border-border rounded-lg" />
        </div>
      </div>
    </div>
  );
}
