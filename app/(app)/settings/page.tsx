'use client';

import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Skeleton } from 'boneyard-js/react';
import PageEntrance from '@/components/ui/page-entrance';
import { ConfirmDialogProvider } from './ConfirmDialogContext';
import { SettingsNav } from './SettingsNav';
import { ProfileSection } from './ProfileSection';
import { CalendarSection } from './CalendarSection';
import { ExtensionSection } from './ExtensionSection';
import { DesktopAppSection } from './DesktopAppSection';
import { WebhooksSection } from './WebhooksSection';
import { ApiKeysSection } from './ApiKeysSection';
import { RecordingsSection } from './RecordingsSection';

export default function SettingsPage() {
  const { loading } = useRequireAuth();

  return (
    <Skeleton name="settings-form" loading={loading} fallback={
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="h-9 w-32 bg-muted rounded-lg animate-pulse mb-8" />
          <div className="space-y-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-card rounded-xl border border-border p-6">
                <div className="h-5 w-40 bg-muted rounded animate-pulse mb-4" />
                <div className="h-10 bg-muted/50 rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    }>
      <div className="min-h-screen bg-background">
        <ConfirmDialogProvider>
          <PageEntrance name="settings" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-foreground">Settings</h1>
              <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
            </div>

            <div className="flex gap-8">
              <SettingsNav />

              <div className="flex-1 min-w-0 space-y-6">
                {/* Account */}
                <ProfileSection />
                <CalendarSection />

                {/* Apps & Devices */}
                <ExtensionSection />
                <DesktopAppSection />

                {/* Developer */}
                <WebhooksSection />
                <ApiKeysSection />

                {/* Data */}
                <RecordingsSection />
              </div>
            </div>
          </PageEntrance>
        </ConfirmDialogProvider>
      </div>
    </Skeleton>
  );
}
