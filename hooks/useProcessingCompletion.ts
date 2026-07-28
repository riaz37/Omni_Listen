'use client';

import { useEffect } from 'react';

const VERIFY_MAX_ATTEMPTS = 5;
const VERIFY_RETRY_DELAY_MS = 500;

export interface UseProcessingCompletionParams {
  completedJobId: string | null;
  failedJobId: string | null;
  failedJobError: string | null;
  // Both consumers (this hook, while the listen page is mounted, and
  // FloatingStatusIndicator otherwise) share ONE completedJobId/failedJobId
  // from GlobalStateProvider. Whichever one gets there first must
  // acknowledge it so the job is never handled (navigated to, or toasted)
  // twice.
  acknowledgeJobCompletion: () => void;
  onNavigateToConversation: (jobId: string) => void;
  verifyConversationExists: (jobId: string) => Promise<boolean>;
  // Called if verification never succeeds — the meeting endpoint 404'd on
  // every retry. Previously the old watchInterval pushed to /conversation
  // anyway, which just 404'd there and bounced to /history.
  onVerifyFailed?: () => void;
  onProcessingFailed?: (error: string | null) => void;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Reacts to a completed/failed processing job by verifying the meeting is
// actually queryable yet (the DB write can lag the status flip by a beat)
// and then navigating — but ONLY while this hook's owner (the listen page)
// is still mounted. If the user has navigated away before verification
// settles, the effect's cleanup marks the attempt cancelled and skips both
// the navigation AND acknowledgeJobCompletion, deliberately leaving the
// completed/failed id in context for FloatingStatusIndicator to pick up
// and offer as a toast + link instead of yanking the user back.
export function useProcessingCompletion({
  completedJobId,
  failedJobId,
  failedJobError,
  acknowledgeJobCompletion,
  onNavigateToConversation,
  verifyConversationExists,
  onVerifyFailed,
  onProcessingFailed,
}: UseProcessingCompletionParams): void {
  useEffect(() => {
    if (failedJobId) {
      onProcessingFailed?.(failedJobError);
      acknowledgeJobCompletion();
      return;
    }

    if (!completedJobId) return;

    const jobId = completedJobId;
    let cancelled = false;

    (async () => {
      let verified = false;
      for (let attempt = 0; attempt < VERIFY_MAX_ATTEMPTS; attempt++) {
        if (cancelled) return;
        try {
          verified = await verifyConversationExists(jobId);
        } catch {
          verified = false;
        }
        if (verified) break;
        if (attempt < VERIFY_MAX_ATTEMPTS - 1) await sleep(VERIFY_RETRY_DELAY_MS);
      }

      if (cancelled) return; // navigated away mid-verification — leave it for FloatingStatusIndicator

      if (verified) {
        onNavigateToConversation(jobId);
      } else {
        onVerifyFailed?.();
      }
      acknowledgeJobCompletion();
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedJobId, failedJobId]);
}
