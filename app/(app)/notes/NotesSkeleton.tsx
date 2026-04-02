import Navigation from '@/components/Navigation';

export function NotesSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-1">
            <div>
              <div className="h-7 bg-muted rounded w-28 animate-pulse mb-1"></div>
              <div className="h-4 bg-muted rounded w-64 animate-pulse"></div>
            </div>
            <div className="h-9 w-28 bg-muted rounded-lg animate-pulse"></div>
          </div>
        </div>
        {/* Tabs skeleton */}
        <div className="flex border-b border-border mb-6">
          {['All', 'General', 'Decision', 'Budget'].map(t => (
            <div key={t} className="h-9 w-16 bg-muted rounded animate-pulse mr-4"></div>
          ))}
        </div>
        {/* Search skeleton */}
        <div className="mb-6 flex gap-4">
          <div className="h-9 w-[240px] bg-muted rounded-lg animate-pulse"></div>
          <div className="flex gap-2 ml-auto">
            <div className="h-9 w-24 bg-muted rounded-lg animate-pulse"></div>
            <div className="h-9 w-16 bg-muted rounded-lg animate-pulse"></div>
            <div className="h-9 w-20 bg-muted rounded-lg animate-pulse"></div>
          </div>
        </div>
        {/* Grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-card rounded-lg border border-border p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-muted rounded animate-pulse"></div>
                  <div className="h-5 w-40 bg-muted rounded animate-pulse"></div>
                </div>
                <div className="h-5 w-16 bg-muted rounded-full animate-pulse"></div>
              </div>
              <div className="h-4 w-full bg-muted rounded animate-pulse"></div>
              <div className="flex justify-between">
                <div className="h-3 w-24 bg-muted rounded animate-pulse"></div>
                <div className="h-3 w-16 bg-muted rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
