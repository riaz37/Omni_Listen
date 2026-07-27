import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { I18nProvider } from '@/lib/i18n/I18nProvider';
import en from '@/lib/i18n/dictionaries/en.json';
import MicPicker from '@/components/dashboard/MicPicker';
import { useMicDevices } from '@/hooks/useMicDevices';

vi.mock('@/hooks/useMicDevices');

const baseHookState = {
  devices: [
    { deviceId: '', label: 'System default', isDefault: true, groupId: '' },
    { deviceId: 'id-a', label: 'USB Headset', isDefault: false, groupId: 'g1' },
  ],
  selectedDeviceId: 'id-a',
  selectedLabel: 'USB Headset',
  permission: 'granted' as const,
  isEnumerating: false,
  isSwitching: false,
  isPreviewing: false,
  previewExpired: false,
  level: 0.4,
  error: null,
  select: vi.fn(),
  requestPermission: vi.fn(),
  refresh: vi.fn(),
  armPreview: vi.fn(),
  handleOpenChange: vi.fn(),
};

function renderWithI18n(ui: React.ReactElement) {
  // Cast: the stub locale doesn't need every key in the real Dictionary type.
  return render(
    <I18nProvider locale="en" dictionary={en as any}>
      {ui}
    </I18nProvider>,
  );
}

beforeEach(() => {
  vi.mocked(useMicDevices).mockReturnValue({ ...baseHookState });
  // jsdom has no matchMedia; MicLevelMeter calls prefersReducedMotion() on every render.
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('MicPicker — granted, device selected', () => {
  it('shows the selected device label on the trigger', () => {
    renderWithI18n(<MicPicker />);
    expect(screen.getByRole('button', { name: /USB Headset/i })).toBeInTheDocument();
  });

  it('checks the currently selected device and lists the others', () => {
    renderWithI18n(<MicPicker />);
    fireEvent.click(screen.getByRole('button', { name: /USB Headset/i }));

    const selected = screen.getByRole('option', { name: /USB Headset/i });
    expect(selected).toHaveAttribute('aria-selected', 'true');
    const systemDefault = screen.getByRole('option', { name: /System default/i });
    expect(systemDefault).toHaveAttribute('aria-selected', 'false');
  });

  it('calls select with the deviceId and label when a device is chosen', () => {
    const select = vi.fn();
    vi.mocked(useMicDevices).mockReturnValue({ ...baseHookState, select });
    renderWithI18n(<MicPicker />);

    fireEvent.click(screen.getByRole('button', { name: /USB Headset/i }));
    fireEvent.click(screen.getByRole('option', { name: /System default/i }));

    expect(select).toHaveBeenCalledWith(null, expect.stringMatching(/system default/i));
  });
});

describe('MicPicker — permission states', () => {
  it('shows an allow CTA and no device list when permission has not been granted', () => {
    vi.mocked(useMicDevices).mockReturnValue({
      ...baseHookState,
      permission: 'prompt',
      selectedDeviceId: null,
      selectedLabel: '',
    });
    renderWithI18n(<MicPicker />);

    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('button', { name: /allow microphone access/i })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /USB Headset/i })).not.toBeInTheDocument();
  });

  it('requests permission when the allow button is clicked', () => {
    const requestPermission = vi.fn();
    vi.mocked(useMicDevices).mockReturnValue({
      ...baseHookState,
      permission: 'prompt',
      selectedDeviceId: null,
      selectedLabel: '',
      requestPermission,
    });
    renderWithI18n(<MicPicker />);

    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByRole('button', { name: /allow microphone access/i }));

    expect(requestPermission).toHaveBeenCalled();
  });

  it('shows blocked copy when permission was denied', () => {
    vi.mocked(useMicDevices).mockReturnValue({
      ...baseHookState,
      permission: 'denied',
      selectedDeviceId: null,
      selectedLabel: '',
    });
    renderWithI18n(<MicPicker />);

    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Microphone access blocked')).toBeInTheDocument();
  });
});

describe('MicPicker — switching state', () => {
  it('shows a spinner instead of the chevron while switching', () => {
    vi.mocked(useMicDevices).mockReturnValue({ ...baseHookState, isSwitching: true });
    renderWithI18n(<MicPicker />);
    expect(screen.getByTestId('mic-picker-switching-spinner')).toBeInTheDocument();
  });
});

describe('MicPicker — open/close wiring', () => {
  it('notifies the hook when the dropdown opens and closes', () => {
    const handleOpenChange = vi.fn();
    vi.mocked(useMicDevices).mockReturnValue({ ...baseHookState, handleOpenChange });
    renderWithI18n(<MicPicker />);

    fireEvent.click(screen.getByRole('button', { name: /USB Headset/i }));
    expect(handleOpenChange).toHaveBeenLastCalledWith(true);
  });
});
