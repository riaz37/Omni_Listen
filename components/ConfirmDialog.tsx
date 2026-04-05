'use client';

import { useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';
import AnimatedModal from '@/components/ui/animated-modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: 'danger' | 'warning';
}

export default function ConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmLabel = 'Delete',
  variant = 'danger',
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        confirmRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const confirmButtonClass =
    variant === 'danger'
      ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
      : 'bg-amber-500 text-white hover:bg-amber-600';

  const iconContainerClass =
    variant === 'danger'
      ? 'bg-destructive/10 text-destructive'
      : 'bg-amber-500/10 text-amber-600';

  return (
    <AnimatedModal open={isOpen} onClose={onCancel} className="max-w-sm">
      <div className="rounded-2xl bg-card p-6">
        <div className="flex items-start gap-4">
          <div
            className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full ${iconContainerClass}`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{message}</p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 text-sm font-medium border border-border text-foreground rounded-lg hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Cancel
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${confirmButtonClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </AnimatedModal>
  );
}
