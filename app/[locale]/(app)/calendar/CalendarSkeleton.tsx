export function CalendarSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <div className="h-8 bg-muted rounded w-56 mb-2" />
          <div className="h-4 bg-muted rounded w-80 mt-2" />
        </div>
        <div className="h-10 bg-muted rounded-lg w-36" />
      </div>

      {/* Search & Actions Skeleton */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex-1 h-10 bg-muted rounded-lg max-w-md" />
        <div className="flex items-center gap-3">
          <div className="h-10 bg-muted rounded-lg w-28" />
          <div className="h-4 bg-muted rounded w-16" />
          <div className="h-10 bg-muted rounded-lg w-28" />
        </div>
      </div>

      {/* Full-width Calendar Skeleton */}
      <div className="bg-card rounded-lg border border-border shadow-sm p-6">
        {/* Toolbar */}
        <div className="mb-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <div className="h-8 bg-muted rounded w-10" />
              <div className="h-8 bg-muted rounded w-10" />
            </div>
            <div className="h-6 bg-muted rounded w-32" />
          </div>
          <div className="flex gap-1">
            <div className="h-8 bg-muted rounded w-16" />
            <div className="h-8 bg-muted rounded w-14" />
            <div className="h-8 bg-muted rounded w-12" />
            <div className="h-8 bg-muted rounded w-16" />
          </div>
        </div>
        {/* Calendar grid */}
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="grid grid-cols-7 border-b border-border">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="py-3 px-2 bg-muted text-center">
                <div className="h-3 bg-muted-foreground/20 rounded w-8 mx-auto" />
              </div>
            ))}
          </div>
          {[...Array(5)].map((_, row) => (
            <div key={row} className="grid grid-cols-7 border-b border-border last:border-b-0">
              {[...Array(7)].map((_, col) => (
                <div key={col} className="h-20 p-2 border-r border-border last:border-r-0">
                  <div className="h-3 bg-muted rounded w-5" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
