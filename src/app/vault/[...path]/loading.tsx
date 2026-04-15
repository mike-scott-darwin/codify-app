export default function FileLoading() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8 animate-pulse">
      {/* Breadcrumb */}
      <div className="h-4 w-48 bg-surface rounded mb-4" />

      {/* Title */}
      <div className="h-8 w-64 bg-surface rounded mb-6" />

      {/* Content lines */}
      <div className="space-y-3">
        <div className="h-4 w-full bg-surface rounded" />
        <div className="h-4 w-5/6 bg-surface rounded" />
        <div className="h-4 w-4/6 bg-surface rounded" />
        <div className="h-4 w-full bg-surface rounded" />
        <div className="h-4 w-3/4 bg-surface rounded" />
        <div className="h-4 w-5/6 bg-surface rounded" />
        <div className="h-4 w-2/3 bg-surface rounded" />
      </div>
    </div>
  );
}
