'use client';

import { Chrome, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExtensionSectionProps {
  extensionSyncing: boolean;
  extensionStatus: 'unknown' | 'synced' | 'error';
  extensionMessage: string;
  handleSyncExtension: () => void;
}

export function ExtensionSection({
  extensionSyncing,
  extensionStatus,
  extensionMessage,
  handleSyncExtension,
}: ExtensionSectionProps) {
  return (
    <div className="bg-card rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Chrome className="w-5 h-5" />
        Meeting Recorder Extension
      </h2>

      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Install our Edge extension to record Zoom, Google Meet, and Microsoft Teams
          meetings directly from your browser. The recordings will be automatically
          transcribed using your preset settings.
        </p>

        <div className="bg-muted border border-border rounded-lg p-4">
          <h3 className="font-medium text-foreground mb-2">How to connect:</h3>
          <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-2">
            <li>
              <a
                href="https://microsoftedge.microsoft.com/addons/detail/esapailisten/edipmfpeajaajboenhdlcebebgapimgl?hl=en-US"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary hover:underline"
              >
                Install the ESAP Meeting Recorder from Edge Webstore
              </a>
            </li>
            <li>Click "Copy Auth Token" below</li>
            <li>Open the extension and paste the token in settings</li>
          </ol>
        </div>

        {extensionMessage && (
          <div className={`flex items-center gap-2 px-4 py-3 rounded-lg ${extensionStatus === 'synced' ? 'text-primary bg-primary/5' :
            extensionStatus === 'error' ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20' :
              'text-muted-foreground bg-muted'
            }`}>
            {extensionStatus === 'synced' ? <CheckCircle2 className="w-5 h-5" /> :
              extensionStatus === 'error' ? <AlertCircle className="w-5 h-5" /> : null}
            <span className="font-medium">{extensionMessage}</span>
          </div>
        )}

        <Button
          onClick={handleSyncExtension}
          disabled={extensionSyncing}
          loading={extensionSyncing}
          iconLeft={<Chrome className="w-4 h-4" />}
        >
          Connect Extension
        </Button>
      </div>
    </div>
  );
}
