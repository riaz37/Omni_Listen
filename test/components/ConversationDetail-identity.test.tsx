import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import ConversationDetailClient from '@/app/[locale]/(app)/conversation/ConversationDetailClient';

// Regression coverage for: "processing a new recording shows the previous
// meeting". Root cause was stale router state, fixed upstream by
// useConversationId + a keyed remount in page.tsx. This component is the
// defense-in-depth layer: even if a wrong/stale jobId ever reaches it again,
// it must never render conversation data whose job_id disagrees with the
// jobId it was asked to show.

// Stable across renders — the real hooks these replace return referentially
// stable values (useRouter's object, a memoized auth context) unless
// something actually changed. A fresh object per call here would make the
// component's mount effect (deps include user/router) re-fire on every
// render, since React compares effect deps by reference — an infinite
// render loop that has nothing to do with the component under test.
const mockPush = vi.fn();
const mockBack = vi.fn();
const stableRouter = { push: mockPush, back: mockBack };
const stableSearchParams = new URLSearchParams();
const stableUser = { id: 1, calendar_connected: false };

vi.mock('next/navigation', () => ({
  useRouter: () => stableRouter,
  useSearchParams: () => stableSearchParams,
}));

vi.mock('@/lib/i18n/use-locale-path', () => ({
  useLocalePath: () => (path: string) => `/en${path}`,
}));

vi.mock('@/lib/i18n/use-translation', () => ({
  useTranslation: () => ({ t: (key: string) => key, locale: 'en' }),
}));

vi.mock('@/lib/auth-context', () => ({
  useAuth: () => ({ user: stableUser, loading: false, isLoggingOut: false }),
}));

vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn(), info: vi.fn() } }));
vi.mock('@/lib/export', () => ({ exportConversationToPDF: vi.fn() }));
vi.mock('@/components/FloatingChat', () => ({ default: () => null }));
vi.mock('./ConversationKeyTakeaways', () => ({ ConversationKeyTakeaways: () => null }));
vi.mock('@/app/[locale]/(app)/conversation/ConversationKeyTakeaways', () => ({ ConversationKeyTakeaways: () => null }));
vi.mock('@/app/[locale]/(app)/conversation/ConversationTranscript', () => ({ ConversationTranscript: () => null }));
vi.mock('@/app/[locale]/(app)/conversation/ConversationSidebar', () => ({ ConversationSidebar: () => null }));
vi.mock('@/components/ui/page-entrance', () => ({ default: ({ children }: any) => <div>{children}</div> }));
vi.mock('boneyard-js/react', () => ({
  Skeleton: ({ loading, children, fallback }: any) => (loading ? fallback : children),
}));

const mockGetConversationDetails = vi.fn();
const mockSyncToCalendar = vi.fn();
const mockRetryExtraction = vi.fn();
const mockGetJobStatus = vi.fn();
const mockToggleTaskCompletion = vi.fn();
vi.mock('@/lib/api', () => ({
  conversationsAPI: {
    getConversationDetails: (...args: any[]) => mockGetConversationDetails(...args),
    syncToCalendar: (...args: any[]) => mockSyncToCalendar(...args),
    retryExtraction: (...args: any[]) => mockRetryExtraction(...args),
    getJobStatus: (...args: any[]) => mockGetJobStatus(...args),
    toggleTaskCompletion: (...args: any[]) => mockToggleTaskCompletion(...args),
  },
  calendarAPI: { getAuthUrl: vi.fn() },
}));

function meetingFor(jobId: string, title: string) {
  return {
    job_id: jobId,
    title,
    created_at: '2026-07-28T00:00:00Z',
    raw_transcript: `[00:00 - 00:05] Speaker 1: Content for ${title}`,
    final_summary: { english: `Summary for ${title}` },
    key_takeaways: null,
    dated_events: [],
    notes: [],
    calendar_synced: false,
  };
}

describe('ConversationDetailClient — identity binding', () => {
  beforeEach(() => {
    // resetAllMocks (not clearAllMocks) — clearAllMocks only wipes call
    // history, not a persistent .mockResolvedValue() set by an earlier test
    // in this file, which was leaking into later tests and made this suite
    // order-dependent.
    vi.resetAllMocks();
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
  });

  it('renders the meeting matching the given jobId', async () => {
    mockGetConversationDetails.mockResolvedValue(meetingFor('job-b', 'Number Sequence Drill'));

    render(<ConversationDetailClient jobId="job-b" />);

    await waitFor(() => screen.getByText('Number Sequence Drill'));
    expect(mockGetConversationDetails).toHaveBeenCalledWith('job-b');
  });

  it('never renders a fetched conversation whose job_id does not match the current jobId', async () => {
    // Simulates the exact failure mode: the backend call resolves with data
    // for a DIFFERENT job than the one currently requested (e.g. a stale
    // response arriving after the id changed). The component must not use it.
    mockGetConversationDetails.mockResolvedValue(meetingFor('job-a', 'Testing Audio Connectivity'));

    render(<ConversationDetailClient jobId="job-b" />);

    await waitFor(() => expect(mockGetConversationDetails).toHaveBeenCalled());
    // Give any pending state updates a chance to flush.
    await new Promise((r) => setTimeout(r, 10));

    expect(screen.queryByText('Testing Audio Connectivity')).not.toBeInTheDocument();
  });

  it('clears previously rendered conversation data when jobId changes', async () => {
    mockGetConversationDetails.mockResolvedValueOnce(meetingFor('job-a', 'Testing Audio Connectivity'));
    const { rerender } = render(<ConversationDetailClient jobId="job-a" />);
    await waitFor(() => screen.getByText('Testing Audio Connectivity'));

    // New id, and the fetch for it is deliberately left pending —
    // the OLD meeting's content must disappear immediately, not linger
    // until the new fetch resolves.
    mockGetConversationDetails.mockReturnValue(new Promise(() => {}));
    rerender(<ConversationDetailClient jobId="job-b" />);

    await waitFor(() => {
      expect(screen.queryByText('Testing Audio Connectivity')).not.toBeInTheDocument();
    });
  });
});
