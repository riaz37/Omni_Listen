'use client';

import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import { authAPI } from '@/lib/api';

type Action = () => void | Promise<void>;

// Gates the first recording or upload behind the recording-consent notice
// the Terms promise. The acknowledgement is stored on the account
// (recording_consent_acknowledged_at) so it is shown once across devices;
// `acknowledgedLocally` covers the window between the POST and the next
// /api/auth/me refresh so the same session is never prompted twice.
export function useRecordingConsent() {
  const { user, refreshUser } = useAuth();
  const [pending, setPending] = useState<Action | null>(null);
  const [acknowledgedLocally, setAcknowledgedLocally] = useState(false);

  // A missing user (still loading, or not yet revalidated) must not read as
  // "acknowledged": only an explicit timestamp or this session's own
  // acknowledgement clears the gate.
  const needsConsent = !acknowledgedLocally && !user?.recording_consent_acknowledged_at;

  const guard = useCallback(
    (action: Action) => {
      if (needsConsent) {
        setPending(() => action);
      } else {
        void action();
      }
    },
    [needsConsent],
  );

  const onConfirm = useCallback(async () => {
    const action = pending;
    setPending(null);
    setAcknowledgedLocally(true);
    // Fire the acknowledgement POST but don't await it before running the
    // pending action: awaiting first would push the recording start past the
    // click's user-activation window, and on mobile Safari/Chrome that makes
    // the first recording's getUserMedia prompt silently fail.
    const request = authAPI.acknowledgeRecordingConsent();
    if (action) await action();
    try {
      await request;
      void refreshUser();
    } catch {
      setAcknowledgedLocally(false);
      toast.error('Could not save your acknowledgement. Please try again.');
    }
  }, [pending, refreshUser]);

  const onCancel = useCallback(() => setPending(null), []);

  return { guard, dialog: { isOpen: pending !== null, onConfirm, onCancel } };
}
