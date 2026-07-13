import { useEffect, useRef } from 'react';
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

  // The socket lifecycle must only follow the signed-in user, never callback
  // identities — refreshUser/lp get new identities on parent re-renders (the
  // listen page re-renders every second while recording), and having them in
  // the effect deps produced a reconnect-per-second storm against the backend.
  const handlersRef = useRef({ refreshUser, router, lp });
  handlersRef.current = { refreshUser, router, lp };

  const userId = user?.id ?? null;

  useEffect(() => {
    if (userId === null) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const wsUrlBase = apiUrl.replace(/^http/, 'ws');
    const ws = new WebSocket(`${wsUrlBase}/ws/notifications`);

    ws.onopen = () => {
      // Web browsers: HttpOnly cookie is sent automatically in the WebSocket upgrade
      // request — server authenticates from the cookie, no message needed.
      // Electron / extension: no cookie; send token from localStorage as auth message.
      const token = typeof localStorage !== 'undefined'
        ? localStorage.getItem('access_token')
        : null;
      if (token) {
        ws.send(JSON.stringify({ type: 'auth', token }));
      }
    };

    ws.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);

        // Auth confirmation — handled silently.
        if (data.type === 'auth') return;

        if (data.type === 'calendar.disconnected') {
          const { refreshUser, router, lp } = handlersRef.current;
          await refreshUser();
          toast.error('Calendar Disconnected! Please sign in again.', { duration: 5000 });
          router.push(lp('/settings'));
        }
      } catch {
        // WS message parse errors handled silently.
      }
    };

    return () => {
      // Only close once the handshake is done (or in progress) to avoid the
      // "WebSocket is closed before the connection is established" browser error
      // that fires when cleanup runs mid-CONNECTING during fast navigation.
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, [userId]);
}
