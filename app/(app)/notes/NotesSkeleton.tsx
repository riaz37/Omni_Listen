export function NotesSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="h-8 bg-muted rounded w-24 animate-pulse mb-2" />
          <div className="h-4 bg-muted rounded w-56 animate-pulse mt-1" />
        </div>
        <div className="h-9 w-28 bg-muted rounded-lg animate-pulse" />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-border pb-px">
        {['All', 'General', 'Decision', 'Budget'].map((t) => (
          <div key={t} className="flex items-center gap-2 px-4 py-2.5">
            <div className="h-3.5 w-12 bg-muted rounded animate-pulse" />
            <div className="h-4 w-6 bg-muted rounded-full animate-pulse" />
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="h-[44px] bg-surface/50 rounded-lg border border-border/60 mb-6 animate-pulse" />

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-card rounded-lg border border-border p-4 space-y-3 animate-pulse">
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 bg-muted rounded flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="h-4 bg-muted rounded w-3/4 mb-1" />
                <div className="h-3.5 bg-muted rounded w-1/2" />
              </div>
              <div className="h-5 w-16 bg-muted rounded-full flex-shrink-0" />
            </div>
            <div className="ml-6">
              <div className="h-3.5 bg-muted rounded w-full mb-1.5" />
              <div className="h-3.5 bg-muted rounded w-4/5" />
            </div>
            <div className="flex items-center gap-3 ml-6 pt-1">
              <div className="h-3 bg-muted rounded w-24" />
              <div className="h-3 bg-muted rounded w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
