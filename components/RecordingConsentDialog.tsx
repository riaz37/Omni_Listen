'use client';

import Link from 'next/link';
import { Mic } from 'lucide-react';
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
import { useLocalePath } from '@/lib/i18n/use-locale-path';

interface RecordingConsentDialogProps {
  isOpen: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

// Shown once per account before the first recording or upload. Copy lives
// under recorder.consent_* and must match Terms of Service section 4.
export default function RecordingConsentDialog({ isOpen, onConfirm, onCancel }: RecordingConsentDialogProps) {
  const { t } = useTranslation();
  const lp = useLocalePath();

  // Unmount outright once closed instead of leaving MotionAlertDialog mounted
  // with isOpen=false. The shared alert-dialog exit transition is meant for
  // dialogs that stay on screen; this one gates a one-time action the caller
  // runs right after confirming, so it needs to be gone from the accessibility
  // tree the moment the choice is made, not fading out over the wire.
  if (!isOpen) return null;

  return (
    <MotionAlertDialog open={isOpen} onOpenChange={(open) => { if (!open) onCancel(); }}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-amber-500/10 text-amber-600">
              <Mic className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <AlertDialogTitle>{t('recorder.consent_title')}</AlertDialogTitle>
              <AlertDialogDescription className="mt-1">
                {t('recorder.consent_body')}{' '}
                <Link href={lp('/terms')} target="_blank" className="text-primary hover:underline">
                  {t('recorder.consent_terms_link')}
                </Link>
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row gap-3 sm:gap-3">
          <AlertDialogCancel type="button" className="flex-1 mt-0" onClick={onCancel}>
            {t('common.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction type="button" className="flex-1" onClick={() => void onConfirm()}>
            {t('recorder.consent_confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </MotionAlertDialog>
  );
}
