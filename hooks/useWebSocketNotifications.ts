import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';

interface UseWebSocketNotificationsProps {
  user: any;
  refreshUser: () => Promise<void>;
}

export function useWebSocketNotifications({ user, refreshUser }: UseWebSocketNotificationsProps) {
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    if (!user) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const wsUrlBase = apiUrl.replace(/^http/, 'ws');
    const token = localStorage.getItem('access_token');

    if (!token) return;

    const wsUrl = `${wsUrlBase}/ws/notifications?token=${token}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {};

    ws.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'calendar.disconnected') {
          await refreshUser();
          toast.error("⚠️ Calendar Disconnected! Please sign in again.", 5000);
          router.push('/settings');
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
