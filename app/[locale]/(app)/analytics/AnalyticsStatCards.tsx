import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/use-translation';

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
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="bg-card-2 rounded-lg border border-border p-5 flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{t('analytics.stat_total_meetings')}</p>
          <p className="text-3xl font-semibold text-foreground mt-2">{totalMeetings}</p>
          <p className="text-sm text-muted-foreground mt-1">{t('analytics.stat_all_time')}</p>
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
          <p className="text-sm text-muted-foreground font-medium">{t('analytics.stat_total_events')}</p>
          <p className="text-3xl font-semibold text-foreground mt-2">{totalEvents}</p>
          <p className="text-sm text-muted-foreground mt-1">{t('analytics.stat_all_time')}</p>
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
          <p className="text-sm text-muted-foreground font-medium">{t('analytics.stat_avg_duration')}</p>
          <p className="text-3xl font-semibold text-foreground mt-2">{avgDuration}</p>
          <p className="text-sm text-muted-foreground mt-1">{t('analytics.stat_per_meeting')}</p>
        </div>
      </div>

      <div className="bg-card-2 rounded-lg border border-border p-5 flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{t('analytics.stat_last_30')}</p>
          <p className="text-3xl font-semibold text-foreground mt-2">{last30Days}</p>
          <p className="text-sm text-muted-foreground mt-1">{t('analytics.stat_recent_meetings')}</p>
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
