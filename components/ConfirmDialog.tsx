'use client';

import { AlertTriangle } from 'lucide-react';
import {
  MotionAlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { useTranslation } from '@/lib/i18n/use-translation';

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
  confirmLabel,
  variant = 'danger',
}: ConfirmDialogProps) {
  const { t } = useTranslation();
  const resolvedConfirmLabel = confirmLabel ?? t('common.delete');
  const confirmButtonClass =
    variant === 'danger'
      ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
      : 'bg-amber-500 text-white hover:bg-amber-600';

  const iconContainerClass =
    variant === 'danger'
      ? 'bg-destructive/10 text-destructive'
      : 'bg-amber-500/10 text-amber-600';

  return (
    <MotionAlertDialog open={isOpen} onOpenChange={(open) => { if (!open) onCancel(); }}>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <div className="flex items-start gap-4">
            <div
              className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full ${iconContainerClass}`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <AlertDialogTitle>{title}</AlertDialogTitle>
              <AlertDialogDescription className="mt-1">
                {message}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row gap-3 sm:gap-3">
          <AlertDialogCancel type="button" className="flex-1 mt-0" onClick={onCancel}>
            {t('common.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            type="button"
            className={`flex-1 ${confirmButtonClass}`}
            onClick={onConfirm}
          >
            {resolvedConfirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </MotionAlertDialog>
  );
}
