import { format } from 'date-fns';

interface CalendarToolbarProps {
  view: 'month' | 'week' | 'day' | 'yearly';
  currentDate: Date;
  onViewChange: (view: 'month' | 'week' | 'day' | 'yearly') => void;
  onNavigate: (date: Date) => void;
}

export function CalendarToolbar({ view, currentDate, onViewChange, onNavigate }: CalendarToolbarProps) {
  const handlePrev = () => {
    const d = new Date(currentDate);
    if (view === 'yearly') {
      d.setFullYear(d.getFullYear() - 1);
    } else if (view === 'month') {
      d.setMonth(d.getMonth() - 1);
    } else if (view === 'week') {
      d.setDate(d.getDate() - 7);
    } else {
      d.setDate(d.getDate() - 1);
    }
    onNavigate(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (view === 'yearly') {
      d.setFullYear(d.getFullYear() + 1);
    } else if (view === 'month') {
      d.setMonth(d.getMonth() + 1);
    } else if (view === 'week') {
      d.setDate(d.getDate() + 7);
    } else {
      d.setDate(d.getDate() + 1);
    }
    onNavigate(d);
  };

  return (
    <div className="mb-4 flex flex-wrap justify-between items-center gap-3">
      <div className="flex items-center gap-3">
        <div className="flex gap-1">
          <button
            onClick={handlePrev}
            className="px-3 py-1.5 text-sm font-medium rounded border border-primary text-primary hover:bg-primary/10 transition-colors"
          >
            &lt;
          </button>
          <button
            onClick={handleNext}
            className="px-3 py-1.5 text-sm font-medium rounded border border-primary text-primary hover:bg-primary/10 transition-colors"
          >
            &gt;
          </button>
        </div>
        <h2 className="text-lg font-bold text-foreground">
          {view === 'yearly'
            ? format(currentDate, 'yyyy')
            : format(currentDate, 'MMMM yyyy')}
        </h2>
      </div>
      <div className="flex gap-1">
        {(['month', 'week', 'day', 'yearly'] as const).map((v) => (
          <button
            key={v}
            onClick={() => onViewChange(v)}
            className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${view === v ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground hover:bg-accent'}`}
          >
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}
