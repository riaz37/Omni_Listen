'use client';

export function SkeletonCard() {
  return (
    <div className="bg-card rounded-lg border border-border shadow-sm p-6 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-5 h-5 bg-muted rounded mt-1 flex-shrink-0"></div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-5 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-24"></div>
          </div>
          <div className="h-4 bg-muted rounded w-full mb-2"></div>
          <div className="h-4 bg-muted rounded w-2/3 mb-4"></div>
          <div className="flex items-center gap-4">
            <div className="h-4 bg-muted rounded w-20"></div>
            <div className="h-4 bg-muted rounded w-28"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
      <div className="animate-pulse">
        {/* Header */}
        <div className="flex gap-4 p-4 border-b border-border">
          <div className="h-4 bg-muted rounded w-1/4"></div>
          <div className="h-4 bg-muted rounded w-1/4"></div>
          <div className="h-4 bg-muted rounded w-1/4"></div>
          <div className="h-4 bg-muted rounded w-1/4"></div>
        </div>
        {/* Rows */}
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 p-4 border-b border-border">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-4 bg-muted rounded w-1/4"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-card rounded-lg border border-border shadow-sm p-6 animate-pulse">
          <div className="h-4 bg-muted rounded w-3/4 mb-3"></div>
          <div className="h-3 bg-muted rounded w-full mb-2"></div>
          <div className="h-3 bg-muted rounded w-5/6"></div>
        </div>
      ))}
    </div>
  );
}
