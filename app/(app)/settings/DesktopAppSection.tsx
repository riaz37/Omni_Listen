'use client';

import { Monitor, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SettingsSection } from './SettingsSection';

export function DesktopAppSection() {
  return (
    <SettingsSection
      id="desktop"
      icon={<Monitor className="w-5 h-5" />}
      title="Desktop Application"
    >
      <p className="text-sm text-muted-foreground mb-4">
        Get the full experience with our dedicated desktop application. Record meetings,
        access your dashboard, and more without opening a browser.
      </p>

      <div className="flex items-center gap-4">
        <Button asChild>
          <a
            href="https://drive.google.com/file/d/1V_z19U0EcrcjAvs89mjHNadClQaG8xvo/view?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Download className="w-4 h-4" />
            Download for Windows
          </a>
        </Button>
        <span className="text-xs text-muted-foreground">
          Version 1.0.0 &middot; Windows 10/11
        </span>
      </div>
    </SettingsSection>
  );
}
