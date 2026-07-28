import { describe, it, expect, vi } from 'vitest';
import { goToConversation, conversationPath } from '@/lib/navigation';

describe('conversationPath', () => {
  it('builds a locale-free /conversation path with an encoded job id', () => {
    expect(conversationPath('job with spaces')).toBe('/conversation?id=job%20with%20spaces');
  });
});

describe('goToConversation', () => {
  it('pushes the locale-prefixed conversation route with the job id', () => {
    const push = vi.fn();
    const lp = (path: string) => `/en${path}`;

    goToConversation({ push }, lp, 'user1_20260728_recording.webm');

    expect(push).toHaveBeenCalledWith('/en/conversation?id=user1_20260728_recording.webm');
  });

  it('URL-encodes special characters in the job id', () => {
    const push = vi.fn();
    const lp = (path: string) => `/ar${path}`;

    goToConversation({ push }, lp, 'job with spaces & stuff');

    expect(push).toHaveBeenCalledWith('/ar/conversation?id=job%20with%20spaces%20%26%20stuff');
  });
});
