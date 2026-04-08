'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface DropdownOption {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  className?: string;
}

export default function CustomDropdown({
  value,
  onChange,
  options,
  className = '',
}: CustomDropdownProps) {
  const [open, setOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const setItemRef = useCallback(
    (index: number) => (el: HTMLButtonElement | null) => {
      itemsRef.current[index] = el;
    },
    [],
  );

  useEffect(() => {
    if (!open) {
      setFocusIndex(-1);
      return;
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);

    // Focus the selected item when opening
    const selectedIndex = options.findIndex((o) => o.value === value);
    if (selectedIndex >= 0) {
      setFocusIndex(selectedIndex);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [open, options, value]);

  useEffect(() => {
    if (open && focusIndex >= 0) {
      itemsRef.current[focusIndex]?.focus();
    }
  }, [open, focusIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        if (!open) {
          setOpen(true);
        } else {
          setFocusIndex((prev) => (prev + 1) % options.length);
        }
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        if (!open) {
          setOpen(true);
        } else {
          setFocusIndex((prev) => (prev - 1 + options.length) % options.length);
        }
        break;
      }
      case 'Home': {
        if (open) {
          e.preventDefault();
          setFocusIndex(0);
        }
        break;
      }
      case 'End': {
        if (open) {
          e.preventDefault();
          setFocusIndex(options.length - 1);
        }
        break;
      }
      case 'Enter':
      case ' ': {
        if (open && focusIndex >= 0) {
          e.preventDefault();
          onChange(options[focusIndex].value);
          setOpen(false);
          triggerRef.current?.focus();
        } else if (!open) {
          e.preventDefault();
          setOpen(true);
        }
        break;
      }
    }
  };

  const selectedLabel = options.find((o) => o.value === value)?.label ?? '';
  const listboxId = 'dropdown-listbox';

  return (
    <div ref={ref} className={`relative ${className}`} onKeyDown={handleKeyDown}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? listboxId : undefined}
        className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg bg-card text-foreground hover:bg-muted transition-colors text-sm font-medium cursor-pointer"
      >
        {selectedLabel}
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div
          id={listboxId}
          role="listbox"
          aria-activedescendant={focusIndex >= 0 ? `dropdown-option-${focusIndex}` : undefined}
          className="absolute right-0 top-full mt-2 min-w-[10rem] bg-card border border-border rounded-lg shadow-lg z-50 py-1 overflow-hidden"
        >
          {options.map((option, index) => (
            <button
              key={option.value}
              ref={setItemRef(index)}
              id={`dropdown-option-${index}`}
              type="button"
              role="option"
              aria-selected={value === option.value}
              tabIndex={-1}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
                triggerRef.current?.focus();
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                value === option.value
                  ? 'text-primary font-medium bg-primary/5'
                  : 'text-foreground hover:bg-muted'
              } ${focusIndex === index ? 'bg-muted' : ''}`}
            >
              <Check
                className={`w-4 h-4 flex-shrink-0 ${value === option.value ? 'opacity-100' : 'opacity-0'}`}
              />
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
