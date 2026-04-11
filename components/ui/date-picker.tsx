'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  parse,
} from 'date-fns';

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export default function DatePicker({
  value,
  onChange,
  placeholder = 'Select date',
  className = '',
  required,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (value) {
      try {
        return startOfMonth(parse(value, 'yyyy-MM-dd', new Date()));
      } catch {
        return startOfMonth(new Date());
      }
    }
    return startOfMonth(new Date());
  });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [open]);

  // Sync currentMonth when value changes externally
  useEffect(() => {
    if (value) {
      try {
        const parsed = parse(value, 'yyyy-MM-dd', new Date());
        setCurrentMonth(startOfMonth(parsed));
      } catch {
        // ignore invalid
      }
    }
  }, [value]);

  const selectedDate = value
    ? (() => {
        try {
          return parse(value, 'yyyy-MM-dd', new Date());
        } catch {
          return null;
        }
      })()
    : null;

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const handleSelect = useCallback(
    (day: Date) => {
      onChange(format(day, 'yyyy-MM-dd'));
      setOpen(false);
    },
    [onChange],
  );

  const displayValue = selectedDate ? format(selectedDate, 'MMM d, yyyy') : '';

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2.5 border border-border rounded-lg bg-background text-foreground hover:bg-muted/50 transition-colors text-sm cursor-pointer text-left"
      >
        <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <span className={displayValue ? 'text-foreground' : 'text-muted-foreground'}>
          {displayValue || placeholder}
        </span>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-[280px] bg-card border border-border rounded-xl shadow-lg z-50 p-3">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-foreground" />
            </button>
            <span className="text-sm font-medium text-foreground">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <button
              type="button"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-foreground" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-1">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-muted-foreground py-1.5"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7">
            {days.map((day) => {
              const inMonth = isSameMonth(day, currentMonth);
              const selected = selectedDate && isSameDay(day, selectedDate);
              const today = isToday(day);

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => handleSelect(day)}
                  className={`
                    h-9 w-full rounded-lg text-sm transition-colors
                    ${!inMonth ? 'text-muted-foreground/40' : 'text-foreground'}
                    ${selected ? 'bg-primary text-primary-foreground font-medium' : ''}
                    ${!selected && today ? 'border border-primary/50 font-medium' : ''}
                    ${!selected && inMonth ? 'hover:bg-muted' : ''}
                    ${!selected && !inMonth ? 'hover:bg-muted/50' : ''}
                  `}
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </div>

          {/* Today shortcut */}
          <div className="flex justify-end mt-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={() => handleSelect(new Date())}
              className="text-xs font-medium text-primary hover:text-primary-hover transition-colors px-2 py-1"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
