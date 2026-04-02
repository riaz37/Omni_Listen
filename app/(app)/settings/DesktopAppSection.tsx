'use client';

import { Monitor, Download } from 'lucide-react';

export function DesktopAppSection() {
  return (
    <div className="bg-card rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Monitor className="w-5 h-5" />
        Desktop Application
      </h2>

      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Get the full experience with our dedicated desktop application. Record meetings,
          access your dashboard, and more without opening a browser.
        </p>

        <div className="flex items-center gap-4">
          <a
            href="https://drive.google.com/file/d/1V_z19U0EcrcjAvs89mjHNadClQaG8xvo/view?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center font-medium transition-colors gap-2 px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm"
          >
            <Download className="w-4 h-4" />
            Download for Windows
          </a>
          <span className="text-xs text-muted-foreground">
            Version 1.0.0 • Windows 10/11
          </span>
        </div>
      </div>
    </div>
  );
}
