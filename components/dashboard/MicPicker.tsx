'use client';

import { Mic, ChevronDown, Loader2, AlertTriangle } from 'lucide-react';
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem, DropdownHeader } from '@/components/ui/dropdown';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useMicDevices } from '@/hooks/useMicDevices';
import MicLevelMeter from './MicLevelMeter';

/**
 * The Google-Meet-style microphone picker: device dropdown + live level
 * meter on the trigger, checkmark on the active device (free from
 * DropdownItem's mode="select"), and permission-state content when the mic
 * hasn't been granted yet. All device/permission logic lives in
 * useMicDevices — this component is purely presentational wiring, mirroring
 * the structure of the existing language selector in DashboardRecorder.
 */
export default function MicPicker() {
  const { t } = useTranslation();
  const {
    devices,
    selectedDeviceId,
    selectedLabel,
    permission,
    isSwitching,
    isPreviewing,
    level,
    select,
    requestPermission,
    handleOpenChange,
  } = useMicDevices(t('recorder.mic_system_default'));

  const showDeviceList = permission === 'granted';

  return (
    <Dropdown
      mode="select"
      value={selectedDeviceId ?? ''}
      onValueChange={(v) => {
        const device = devices.find((d) => d.deviceId === v);
        select(v || null, device?.label ?? t('recorder.mic_system_default'));
      }}
      onOpenChange={handleOpenChange}
      className="shrink-0"
    >
      <DropdownTrigger className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg bg-card text-foreground hover:bg-muted transition-colors text-xs font-medium cursor-pointer min-w-0">
        <Mic className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <MicLevelMeter level={level} active={isPreviewing} />
        <span className="truncate max-w-[10rem]">{selectedLabel || t('recorder.mic_system_default')}</span>
        {isSwitching ? (
          <Loader2 data-testid="mic-picker-switching-spinner" className="w-3.5 h-3.5 text-muted-foreground shrink-0 animate-spin" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        )}
      </DropdownTrigger>
      <DropdownContent align="start" className="min-w-[16rem]">
        {permission === 'denied' ? (
          <DropdownHeader>
            <div className="flex items-start gap-2 text-start">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground text-sm">{t('recorder.mic_denied_title')}</p>
                <p className="text-xs text-muted-foreground">{t('recorder.mic_denied_body')}</p>
              </div>
            </div>
          </DropdownHeader>
        ) : !showDeviceList ? (
          <DropdownHeader>
            <div className="text-start">
              <p className="font-semibold text-foreground text-sm">{t('recorder.mic_allow_title')}</p>
              <p className="text-xs text-muted-foreground mb-2">{t('recorder.mic_allow_body')}</p>
              <button
                type="button"
                onClick={requestPermission}
                className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary-hover transition-colors"
              >
                {t('recorder.mic_allow_button')}
              </button>
            </div>
          </DropdownHeader>
        ) : null}

        {showDeviceList &&
          devices.map((d) => (
            <DropdownItem key={d.deviceId} value={d.deviceId}>
              <span className="flex flex-col items-start text-start">
                <span className="font-medium">{d.label}</span>
                {d.isDefault && (
                  <span className="text-xs text-muted-foreground">{t('recorder.mic_system_default_hint')}</span>
                )}
              </span>
            </DropdownItem>
          ))}

        {showDeviceList && devices.length === 0 && (
          <p className="px-3 py-2 text-xs text-muted-foreground">{t('recorder.mic_none_found')}</p>
        )}
      </DropdownContent>
    </Dropdown>
  );
}
