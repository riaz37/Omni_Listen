'use client';

import {
  createContext,
  useContext,
  useId,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import Link from 'next/link';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DURATIONS, EASINGS } from '@/lib/motion';
import { useDropdown } from '@/hooks/useDropdown';

// ─── Context ────────────────────────────────────────────────────────────────

interface DropdownContextValue {
  readonly isOpen: boolean;
  readonly toggle: () => void;
  readonly close: () => void;
  readonly mode: 'menu' | 'select';
  readonly value?: string;
  readonly onValueChange?: (v: string) => void;
  readonly triggerId: string;
  readonly contentId: string;
  readonly dropdownId: string;
}

const DropdownContext = createContext<DropdownContextValue | null>(null);

function useDropdownContext() {
  const ctx = useContext(DropdownContext);
  if (!ctx) throw new Error('Dropdown compound components must be used within <Dropdown>');
  return ctx;
}

// ─── Root ───────────────────────────────────────────────────────────────────

interface DropdownProps {
  readonly mode?: 'menu' | 'select';
  readonly value?: string;
  readonly onValueChange?: (v: string) => void;
  readonly children: ReactNode;
  readonly className?: string;
}

export function Dropdown({
  mode = 'menu',
  value,
  onValueChange,
  children,
  className = '',
}: DropdownProps) {
  const rawId = useId();
  const id = rawId.replace(/:/g, '');
  const triggerId = `dd-trigger-${id}`;
  const contentId = `dd-content-${id}`;

  const { isOpen, toggle, close, ref } = useDropdown();

  return (
    <DropdownContext.Provider
      value={{
        isOpen,
        toggle,
        close,
        mode,
        value,
        onValueChange,
        triggerId,
        contentId,
        dropdownId: id,
      }}
    >
      <div ref={ref} className={`relative ${className}`} data-dropdown-id={id}>
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

// ─── Trigger ────────────────────────────────────────────────────────────────

interface DropdownTriggerProps {
  readonly children: ReactNode;
  readonly className?: string;
}

export function DropdownTrigger({ children, className }: DropdownTriggerProps) {
  const { isOpen, toggle, triggerId, contentId, mode } =
    useDropdownContext();

  return (
    <button
      id={triggerId}
      type="button"
      onClick={toggle}
      aria-expanded={isOpen}
      aria-haspopup={mode === 'select' ? 'listbox' : 'menu'}
      aria-controls={isOpen ? contentId : undefined}
      className={className}
    >
      {children}
    </button>
  );
}

// ─── Content ────────────────────────────────────────────────────────────────

interface DropdownContentProps {
  readonly children: ReactNode;
  readonly className?: string;
  readonly align?: 'start' | 'end';
}

export function DropdownContent({
  children,
  className = '',
  align = 'start',
}: DropdownContentProps) {
  const { isOpen, close, contentId, triggerId, mode, dropdownId } =
    useDropdownContext();

  const [focusIndex, setFocusIndex] = useState(-1);
  const contentRef = useRef<HTMLDivElement>(null);

  const getItems = useCallback(() => {
    if (!contentRef.current) return [];
    return Array.from(
      contentRef.current.querySelectorAll<HTMLElement>('[data-dropdown-item]'),
    );
  }, []);

  // Reset focus index when menu closes
  useEffect(() => {
    if (!isOpen) setFocusIndex(-1);
  }, [isOpen]);

  // Move DOM focus when focusIndex changes
  useEffect(() => {
    if (focusIndex < 0) return;
    const items = getItems();
    items[focusIndex]?.focus();
  }, [focusIndex, getItems]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const items = getItems();
      const count = items.length;
      if (count === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusIndex((prev) => (prev + 1) % count);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusIndex((prev) => (prev - 1 + count) % count);
          break;
        case 'Home':
          e.preventDefault();
          setFocusIndex(0);
          break;
        case 'End':
          e.preventDefault();
          setFocusIndex(count - 1);
          break;
        case 'Enter':
        case ' ':
          if (focusIndex >= 0 && items[focusIndex]) {
            e.preventDefault();
            items[focusIndex].click();
          }
          break;
        case 'Escape':
          e.preventDefault();
          close();
          document.getElementById(triggerId)?.focus();
          break;
      }
    },
    [close, focusIndex, getItems, triggerId],
  );

  const alignClass = align === 'end' ? 'right-0' : 'left-0';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={contentRef}
          id={contentId}
          role={mode === 'select' ? 'listbox' : 'menu'}
          aria-labelledby={triggerId}
          onKeyDown={handleKeyDown}
          className={`absolute ${alignClass} top-full mt-2 min-w-[12rem] bg-popover border border-border rounded-lg shadow-dropdown z-50 p-1 overflow-hidden ${className}`}
          initial={{ opacity: 0, scale: 0.95, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -4 }}
          transition={{ duration: DURATIONS.fast, ease: EASINGS.easeOut }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Item ───────────────────────────────────────────────────────────────────

interface DropdownItemProps {
  readonly children: ReactNode;
  readonly className?: string;
  readonly icon?: React.ComponentType<{ className?: string }>;
  readonly value?: string;
  readonly href?: string;
  readonly onClick?: () => void;
  readonly destructive?: boolean;
  readonly disabled?: boolean;
}

export function DropdownItem({
  children,
  className = '',
  icon: Icon,
  value: itemValue,
  href,
  onClick,
  destructive = false,
  disabled = false,
}: DropdownItemProps) {
  const { mode, value: selectedValue, onValueChange, close } =
    useDropdownContext();

  const isSelected = mode === 'select' && itemValue !== undefined && selectedValue === itemValue;

  const handleClick = () => {
    if (disabled) return;
    if (mode === 'select' && itemValue !== undefined && onValueChange) {
      onValueChange(itemValue);
    }
    onClick?.();
    close();
  };

  const baseClasses = `w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors outline-none rounded-md`;

  const stateClasses = destructive
    ? 'text-destructive hover:bg-destructive/10'
    : isSelected
      ? 'text-primary font-medium bg-primary/5'
      : 'text-popover-foreground hover:bg-muted';

  const disabledClasses = disabled ? 'opacity-50 pointer-events-none' : '';
  const focusClasses = 'focus:bg-muted';

  const combinedClasses = `${baseClasses} ${stateClasses} ${disabledClasses} ${focusClasses} ${className}`;

  const content = (
    <>
      {mode === 'select' && (
        <Check
          className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
      {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
      {children}
    </>
  );

  if (href && !disabled) {
    return (
      <Link
        href={href}
        onClick={handleClick}
        role={mode === 'select' ? 'option' : 'menuitem'}
        aria-selected={mode === 'select' ? isSelected : undefined}
        aria-disabled={disabled || undefined}
        tabIndex={-1}
        data-dropdown-item
        className={combinedClasses}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      role={mode === 'select' ? 'option' : 'menuitem'}
      aria-selected={mode === 'select' ? isSelected : undefined}
      aria-disabled={disabled || undefined}
      tabIndex={-1}
      data-dropdown-item
      className={combinedClasses}
    >
      {content}
    </button>
  );
}

// ─── Separator ──────────────────────────────────────────────────────────────

export function DropdownSeparator() {
  return <div className="my-1 -mx-1 h-px bg-border" role="separator" />;
}

// ─── Header ─────────────────────────────────────────────────────────────────

interface DropdownHeaderProps {
  readonly children: ReactNode;
  readonly className?: string;
}

export function DropdownHeader({ children, className = '' }: DropdownHeaderProps) {
  return (
    <div className={`px-3 py-3 -mx-1 -mt-1 mb-1 border-b border-border rounded-t-lg ${className}`} role="none">
      {children}
    </div>
  );
}

// ─── SelectDropdown (drop-in replacement for CustomDropdown) ────────────────

interface SelectDropdownProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly options: ReadonlyArray<{ readonly value: string; readonly label: string }>;
  readonly className?: string;
}

export function SelectDropdown({
  value,
  onChange,
  options,
  className = '',
}: SelectDropdownProps) {
  const selectedLabel = options.find((o) => o.value === value)?.label ?? '';

  return (
    <Dropdown mode="select" value={value} onValueChange={onChange} className={className}>
      <DropdownTrigger className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg bg-card text-foreground hover:bg-muted transition-colors text-sm font-medium cursor-pointer">
        {selectedLabel}
        <ChevronDown className="w-4 h-4 text-muted-foreground" />
      </DropdownTrigger>
      <DropdownContent>
        {options.map((option) => (
          <DropdownItem key={option.value} value={option.value}>
            {option.label}
          </DropdownItem>
        ))}
      </DropdownContent>
    </Dropdown>
  );
}
