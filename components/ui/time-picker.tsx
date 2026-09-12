'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Clock, X } from 'lucide-react';

interface TimePickerProps {
  value: string; // HH:mm (24h)
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  interval?: number; // minutes between options (default 15)
  /** Offer an "all day" row and a clear control; onChange('') means no time. */
  allowEmpty?: boolean;
  /** Label for the all-day row (default "All day"). */
  emptyLabel?: string;
}

function generateTimeOptions(interval: number): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += interval) {
      const value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      const hour12 = h % 12 || 12;
      const ampm = h < 12 ? 'AM' : 'PM';
      const label = `${hour12}:${String(m).padStart(2, '0')} ${ampm}`;
      options.push({ value, label });
    }
  }
  return options;
}

function formatTimeDisplay(value: string): string {
  if (!value) return '';
  const [hStr, mStr] = value.split(':');
  const h = parseInt(hStr, 10);
  const m = mStr || '00';
  const hour12 = h % 12 || 12;
  const ampm = h < 12 ? 'AM' : 'PM';
  return `${hour12}:${m} ${ampm}`;
}

export default function TimePicker({
  value,
  onChange,
  placeholder = 'Select time',
  className = '',
  interval = 15,
  allowEmpty = false,
  emptyLabel = 'All day',
}: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const options = useMemo(() => generateTimeOptions(interval), [interval]);

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

  // Scroll to selected time when opening
  useEffect(() => {
    if (open && listRef.current && value) {
      const selectedEl = listRef.current.querySelector('[data-selected="true"]');
      if (selectedEl && selectedEl.scrollIntoView) {
        selectedEl.scrollIntoView({ block: 'center' });
      }
    }
  }, [open, value]);

  const displayValue = value ? formatTimeDisplay(value) : '';

  return (
    <div ref={ref} className={`relative ${className}`}>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={`w-full flex items-center gap-2 px-3 py-2.5 border border-border rounded-lg bg-background text-foreground hover:bg-muted/50 transition-colors text-sm cursor-pointer text-start ${allowEmpty && value ? 'pe-9' : ''}`}
        >
          <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <span className={displayValue ? 'text-foreground' : 'text-muted-foreground'}>
            {displayValue || placeholder}
          </span>
        </button>
        {allowEmpty && value && (
          <button
            type="button"
            aria-label="Clear time"
            onClick={() => {
              onChange('');
              setOpen(false);
            }}
            className="absolute end-2 top-1/2 -translate-y-1/2 p-1 rounded text-muted-foreground hover:text-foreground"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {open && (
        <div
          ref={listRef}
          className="absolute start-0 top-full mt-2 w-full min-w-[140px] max-h-[240px] overflow-y-auto bg-card border border-border rounded-xl shadow-lg z-50 py-1"
        >
          {allowEmpty && (
            <button
              type="button"
              data-selected={!value}
              onClick={() => {
                onChange('');
                setOpen(false);
              }}
              className={`w-full text-start px-3 py-2 text-sm transition-colors border-b border-border mb-1 ${
                !value ? 'bg-primary/10 text-primary font-medium' : 'text-foreground hover:bg-muted'
              }`}
            >
              {emptyLabel}
            </button>
          )}
          {options.map((option) => {
            const selected = value === option.value;
            return (
              <button
                key={option.value}
                type="button"
                data-selected={selected}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`w-full text-start px-3 py-2 text-sm transition-colors ${
                  selected
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
