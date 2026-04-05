'use client';

import { LucideIcon } from 'lucide-react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  title?: string;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm',
  secondary:
    'bg-card text-foreground border border-border hover:bg-muted shadow-sm',
  outline:
    'bg-transparent text-foreground border border-border hover:bg-muted',
  danger:
    'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-lg',
  md: 'px-4 py-2 text-sm gap-2 rounded-lg',
  lg: 'px-6 py-3 text-base gap-2 rounded-xl font-bold',
};

export default function PrimaryButton({
  children,
  onClick,
  icon: Icon,
  iconPosition = 'left',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  title,
  type = 'button',
  className = '',
  fullWidth = false,
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      title={title}
      className={`
        inline-flex items-center justify-center font-medium transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        Icon && iconPosition === 'left' && <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      )}
      {children}
      {!loading && Icon && iconPosition === 'right' && <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />}
    </button>
  );
}
