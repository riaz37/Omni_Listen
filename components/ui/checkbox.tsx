'use client';

import { Check } from 'lucide-react';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  id?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: { box: 'w-4 h-4 rounded-[5px]', icon: 'w-2.5 h-2.5', text: 'text-sm' },
  md: { box: 'w-5 h-5 rounded-[6px]', icon: 'w-3 h-3', text: 'text-base' },
  lg: { box: 'w-6 h-6 rounded-[7px]', icon: 'w-3.5 h-3.5', text: 'text-lg' },
};

export default function Checkbox({
  checked,
  onChange,
  label,
  id,
  disabled = false,
  size = 'md',
  className = '',
}: CheckboxProps) {
  const s = sizeMap[size];

  return (
    <label
      htmlFor={id}
      className={`flex items-center gap-3 cursor-pointer select-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      <button
        id={id}
        type="button"
        role="checkbox"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`${s.box} flex-shrink-0 flex items-center justify-center transition-colors duration-150 ${
          checked
            ? 'bg-primary border-2 border-primary'
            : 'bg-transparent border-2 border-muted-foreground/40'
        } ${disabled ? '' : 'hover:border-primary/60'} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50`}
      >
        {checked && <Check className={`${s.icon} text-primary-foreground`} strokeWidth={3} />}
      </button>
      {label && <span className={`${s.text} text-foreground`}>{label}</span>}
    </label>
  );
}
