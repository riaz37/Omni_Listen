import { useMemo } from 'react';
import { format } from 'date-fns';

interface YearMonth {
  name: string;
  year: number;
  month: number;
  days: { day: number; isCurrentMonth: boolean; isToday: boolean; isWeekend: boolean }[];
  startDay: number;
}

function getYearMonths(year: number): YearMonth[] {
  const months: YearMonth[] = [];
  const today = new Date();

  for (let m = 0; m < 12; m++) {
    const firstDay = new Date(year, m, 1);
    const lastDay = new Date(year, m + 1, 0);
    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days: { day: number; isCurrentMonth: boolean; isToday: boolean; isWeekend: boolean }[] = [];

    // Fill leading blanks
    for (let i = 0; i < startDay; i++) {
      days.push({ day: 0, isCurrentMonth: false, isToday: false, isWeekend: false });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, m, d);
      const dayOfWeek = date.getDay();
      days.push({
        day: d,
        isCurrentMonth: true,
        isToday: date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate(),
        isWeekend: dayOfWeek === 5 || dayOfWeek === 6, // Friday and Saturday
      });
    }

    months.push({
      name: format(firstDay, 'MMMM'),
      year,
      month: m,
      days,
      startDay,
    });
  }

  return months;
}

interface YearlyViewProps {
  currentDate: Date;
}

export function YearlyView({ currentDate }: YearlyViewProps) {
  const yearMonths = useMemo(() => getYearMonths(currentDate.getFullYear()), [currentDate]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {yearMonths.map((month) => (
        <div key={month.month} className="border border-border rounded-lg p-3">
          <h3 className="text-sm font-semibold text-foreground mb-2 text-center">
            {month.name} {month.year}
          </h3>
          <div className="grid grid-cols-7 gap-0 text-center">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <div
                key={d}
                className={`text-xs font-medium py-1 ${d === 'Fr' || d === 'Sa' ? 'text-primary' : 'text-muted-foreground'}`}
              >
                {d}
              </div>
            ))}
            {month.days.map((day, idx) => (
              <div
                key={idx}
                className={`text-xs py-1 ${
                  !day.isCurrentMonth
                    ? ''
                    : day.isToday
                      ? 'bg-primary text-primary-foreground rounded-full font-bold'
                      : day.isWeekend
                        ? 'text-primary'
                        : 'text-foreground'
                }`}
              >
                {day.isCurrentMonth ? day.day : ''}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
