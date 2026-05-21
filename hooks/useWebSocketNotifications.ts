import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocalePath } from '@/lib/i18n/use-locale-path';
import { toast } from 'sonner';
import type { User } from '@/lib/types';

interface UseWebSocketNotificationsProps {
  user: User | null;
  refreshUser: () => Promise<void>;
}

export function useWebSocketNotifications({ user, refreshUser }: UseWebSocketNotificationsProps) {
  const router = useRouter();
  const lp = useLocalePath();

  useEffect(() => {
    if (!user) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const wsUrlBase = apiUrl.replace(/^http/, 'ws');
    const token = localStorage.getItem('access_token');

    if (!token) return;

    // Connect WITHOUT token in URL (security: prevents token exposure in browser logs)
    const wsUrl = `${wsUrlBase}/ws/notifications`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      // Authenticate via message after connection is established
      ws.send(JSON.stringify({ type: 'auth', token }));
    };

    ws.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);

        // Handle auth confirmation silently
        if (data.type === 'auth') return;

        if (data.type === 'calendar.disconnected') {
          await refreshUser();
          toast.error("Calendar Disconnected! Please sign in again.", { duration: 5000 });
          router.push(lp('/settings'));
        }
      } catch (e) {
        // WS message parse error handled silently
      }
    };

    return () => {
      ws.close();
    };
  }, [user, router, toast]);
}