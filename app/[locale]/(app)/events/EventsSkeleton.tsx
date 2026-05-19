export function EventsSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Skeleton Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="h-7 bg-muted rounded w-36 animate-pulse mb-1"></div>
            <div className="h-4 bg-muted rounded w-64 animate-pulse"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-20 bg-muted rounded-lg animate-pulse"></div>
            <div className="h-9 w-20 bg-muted rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
      {/* Skeleton Search + Actions */}
      <div className="mb-6 flex gap-4">
        <div className="h-9 w-[280px] bg-muted rounded-lg animate-pulse"></div>
        <div className="flex gap-2 ml-auto">
          <div className="h-9 w-24 bg-muted rounded-lg animate-pulse"></div>
          <div className="h-9 w-16 bg-muted rounded-lg animate-pulse"></div>
          <div className="h-9 w-20 bg-muted rounded-lg animate-pulse"></div>
          <div className="h-9 w-20 bg-muted rounded-lg animate-pulse"></div>
        </div>
      </div>
      {/* Skeleton Tabs */}
      <div className="flex border-b border-border mb-6">
        <div className="h-9 w-12 bg-muted rounded animate-pulse mr-4"></div>
        <div className="h-9 w-14 bg-muted rounded animate-pulse mr-4"></div>
        <div className="h-9 w-20 bg-muted rounded animate-pulse mr-4"></div>
        <div className="h-9 w-12 bg-muted rounded animate-pulse"></div>
      </div>
      {/* Skeleton Event Cards */}
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 py-2">
            <div className="w-4 h-4 bg-muted rounded-full animate-pulse"></div>
            <div className="h-4 w-28 bg-muted rounded animate-pulse"></div>
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-muted rounded-full animate-pulse mt-1"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-muted rounded w-2/3 animate-pulse"></div>
                  <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
                  <div className="flex justify-between">
                    <div className="flex gap-3">
                      <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
                      <div className="h-4 w-12 bg-muted rounded animate-pulse"></div>
                      <div className="h-5 w-16 bg-muted rounded-full animate-pulse"></div>
                    </div>
                    <div className="flex gap-3">
                      <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
                      <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
