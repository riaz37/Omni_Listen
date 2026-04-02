'use client';

import { Calendar, Check, X } from 'lucide-react';
import PrimaryButton from '@/components/PrimaryButton';

interface CalendarSectionProps {
  user: { calendar_connected?: boolean } | null;
  connectingCalendar: boolean;
  handleConnectCalendar: () => void;
  handleDisconnectCalendar: () => void;
}

export function CalendarSection({
  user,
  connectingCalendar,
  handleConnectCalendar,
  handleDisconnectCalendar,
}: CalendarSectionProps) {
  return (
    <div className="bg-card rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5" />
        Google Calendar Integration
      </h2>

      {user?.calendar_connected ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-primary bg-primary/5 px-4 py-3 rounded-lg">
            <Check className="w-5 h-5" />
            <span className="font-medium">Calendar Connected</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Meeting events will be automatically synced to your Google Calendar when you enable "Calendar Sync" in the output fields.
          </p>
          <button
            onClick={handleDisconnectCalendar}
            className="px-4 py-2 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            Disconnect Calendar
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 px-4 py-3 rounded-lg">
            <X className="w-5 h-5" />
            <span className="font-medium">Calendar Not Connected</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Connect your Google Calendar to automatically create events from meeting
            action items when you enable "Calendar Sync" in the output fields.
          </p>
          <PrimaryButton
            onClick={handleConnectCalendar}
            disabled={connectingCalendar}
            loading={connectingCalendar}
          >
            Connect Google Calendar
          </PrimaryButton>
        </div>
      )}
    </div>
  );
}
