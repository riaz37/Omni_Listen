import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AnalyticsStatCardsProps {
  totalMeetings: number;
  totalEvents: number;
  avgDuration: string;
  last30Days: number;
  onNavigate: (path: string) => void;
}

export function AnalyticsStatCards({
  totalMeetings,
  totalEvents,
  avgDuration,
  last30Days,
  onNavigate,
}: AnalyticsStatCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="bg-card-2 rounded-lg border border-border p-5 flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">Total Meetings</p>
          <p className="text-3xl font-semibold text-foreground mt-2">{totalMeetings}</p>
          <p className="text-xs text-muted-foreground mt-1">All time</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onNavigate('/history')}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowUpRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="bg-card-2 rounded-lg border border-border p-5 flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">Total Events</p>
          <p className="text-3xl font-semibold text-foreground mt-2">{totalEvents}</p>
          <p className="text-xs text-muted-foreground mt-1">All time</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onNavigate('/events')}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowUpRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="bg-card-2 rounded-lg border border-border p-5 flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">Avg Duration</p>
          <p className="text-3xl font-semibold text-foreground mt-2">{avgDuration}</p>
          <p className="text-xs text-muted-foreground mt-1">Per Meeting</p>
        </div>
      </div>

      <div className="bg-card-2 rounded-lg border border-border p-5 flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">Last 30 Days</p>
          <p className="text-3xl font-semibold text-foreground mt-2">{last30Days}</p>
          <p className="text-xs text-muted-foreground mt-1">Recent Meetings</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onNavigate('/history')}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowUpRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
