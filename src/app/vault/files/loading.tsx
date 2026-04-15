export default function FilesLoading() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8 animate-pulse">
      <div className="h-7 w-28 bg-surface rounded mb-6" />
      <div className="space-y-1">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-lg">
            <div className="w-4 h-4 bg-surface rounded" />
            <div className="h-4 bg-surface rounded flex-1" style={{ width: `${40 + Math.random() * 30}%` }} />
            <div className="h-3 w-12 bg-surface rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
