import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRecordingConsent } from '@/hooks/useRecordingConsent';
import RecordingConsentDialog from '@/components/RecordingConsentDialog';

// QA report item 6: the Terms promise a notice before recording. First
// recording or upload must be gated by an acknowledgement, exactly once.

let mockUser: any = { id: 1, recording_consent_acknowledged_at: null };
const mockRefreshUser = vi.fn(async () => {});
vi.mock('@/lib/auth-context', () => ({
  useAuth: () => ({ user: mockUser, refreshUser: mockRefreshUser }),
}));

const mockAcknowledge = vi.fn();
vi.mock('@/lib/api', () => ({
  authAPI: { acknowledgeRecordingConsent: (...a: any[]) => mockAcknowledge(...a) },
}));
vi.mock('@/lib/i18n/use-translation', () => ({
  useTranslation: () => ({ t: (key: string) => key, locale: 'en', dir: 'ltr' }),
}));
vi.mock('@/lib/i18n/use-locale-path', () => ({ useLocalePath: () => (p: string) => `/en${p}` }));
vi.mock('sonner', () => ({ toast: { error: vi.fn() } }));

function Harness({ action }: { action: () => void }) {
  const consent = useRecordingConsent();
  return (
    <>
      <button onClick={() => consent.guard(action)}>record</button>
      <RecordingConsentDialog {...consent.dialog} />
    </>
  );
}

describe('useRecordingConsent', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockAcknowledge.mockResolvedValue({ recording_consent_acknowledged_at: '2026-09-09T10:00:00Z' });
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: false, media: query, addEventListener: vi.fn(), removeEventListener: vi.fn(),
      addListener: vi.fn(), removeListener: vi.fn(),
    }));
  });

  it('runs the action immediately when already acknowledged', () => {
    mockUser = { id: 1, recording_consent_acknowledged_at: '2026-01-01T00:00:00Z' };
    const action = vi.fn();
    render(<Harness action={action} />);
    fireEvent.click(screen.getByText('record'));
    expect(action).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });

  it('shows the dialog first, then acknowledges and runs the action', async () => {
    mockUser = { id: 1, recording_consent_acknowledged_at: null };
    const action = vi.fn();
    render(<Harness action={action} />);
    fireEvent.click(screen.getByText('record'));
    expect(action).not.toHaveBeenCalled();
    expect(await screen.findByRole('alertdialog')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'recorder.consent_confirm' }));
    await waitFor(() => expect(action).toHaveBeenCalledTimes(1));
    expect(mockAcknowledge).toHaveBeenCalledTimes(1);
    expect(mockRefreshUser).toHaveBeenCalled();

    // Second use in the same session does not prompt again, even before /me refreshes.
    fireEvent.click(screen.getByText('record'));
    await waitFor(() => expect(action).toHaveBeenCalledTimes(2));
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });

  it('cancel aborts the action', async () => {
    mockUser = { id: 1, recording_consent_acknowledged_at: null };
    const action = vi.fn();
    render(<Harness action={action} />);
    fireEvent.click(screen.getByText('record'));
    fireEvent.click(await screen.findByRole('button', { name: 'common.cancel' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(action).not.toHaveBeenCalled();
    expect(mockAcknowledge).not.toHaveBeenCalled();
  });
});
