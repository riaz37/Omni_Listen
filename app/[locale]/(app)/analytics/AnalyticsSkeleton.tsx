function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-muted rounded ${className}`} />;
}

export function AnalyticsSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">View and manage all your meeting events and deadlines</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-card-2 rounded-lg border border-border p-5">
            <SkeletonBlock className="h-8 w-16 mb-2" />
            <SkeletonBlock className="h-4 w-24" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-card-2 rounded-lg border border-border p-5">
            <SkeletonBlock className="h-6 w-3/4 mb-4" />
            <SkeletonBlock className="h-4 w-full mb-2" />
            <SkeletonBlock className="h-4 w-5/6 mb-2" />
            <SkeletonBlock className="h-4 w-4/6" />
          </div>
        ))}
      </div>
      <div className="bg-card-2 rounded-lg border border-border p-5">
        <SkeletonBlock className="h-6 w-32 mb-4" />
        {[...Array(4)].map((_, i) => (
          <SkeletonBlock key={i} className="h-14 w-full mb-2" />
        ))}
      </div>
    </div>
  );
}
