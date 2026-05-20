'use client';

import { Monitor, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SettingsSection } from './SettingsSection';
import { useTranslation } from '@/lib/i18n/use-translation';

export function DesktopAppSection() {
  const { t } = useTranslation();
  return (
    <SettingsSection
      id="desktop"
      icon={<Monitor className="w-5 h-5" />}
      title={t('settings.desktop.title')}
    >
      <p className="text-sm text-muted-foreground mb-4">
        {t('settings.desktop.description')}
      </p>

      <div className="flex items-center gap-4">
        <Button asChild>
          <a
            href="https://drive.google.com/file/d/1V_z19U0EcrcjAvs89mjHNadClQaG8xvo/view?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Download className="w-4 h-4" />
            {t('settings.desktop.download_windows')}
          </a>
        </Button>
        <span className="text-xs text-muted-foreground">
          {t('settings.desktop.version')}
        </span>
      </div>
    </SettingsSection>
  );
}
