import Navigation from '@/components/Navigation';
import { StatCardSkeleton, CardSkeleton } from '@/components/Skeleton';
import { Skeleton } from '@/components/Skeleton';

export function AnalyticsSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">View and manage all your meeting events and deadlines</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {[...Array(4)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <div className="bg-card-2 rounded-lg shadow-sm border border-border p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-14 w-full mb-2" />
          ))}
        </div>
      </div>
    </div>
  );
}
