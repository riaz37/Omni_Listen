import React, { useInsertionEffect } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { useConversationId } from '@/hooks/useConversationId';

// The regression this hook exists to prevent: on a statically-exported Next.js
// app, `/conversation` is a single prerendered document. Client-side
// navigation via router.push() can leave useSearchParams() reporting the
// PREVIOUS id for one or more renders after the URL has already changed.
// window.location.search is what the address bar (and the user) actually
// shows, so it must always win.
let mockSearchParamsValue = 'id=stale-a';
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(mockSearchParamsValue),
  usePathname: () => '/en/conversation',
}));

function Probe() {
  const id = useConversationId();
  return <div data-testid="id">{id ?? 'null'}</div>;
}

function setLocationSearch(search: string) {
  Object.defineProperty(window, 'location', {
    value: { ...window.location, search },
    writable: true,
    configurable: true,
  });
}

describe('useConversationId', () => {
  beforeEach(() => {
    mockSearchParamsValue = 'id=stale-a';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reads the id from the live window.location.search, not a stale useSearchParams() value', () => {
    // useSearchParams() (mocked above) still reports the OLD id, but the
    // browser's actual address bar has already moved on to the new one.
    setLocationSearch('?id=fresh-b');
    render(<Probe />);
    expect(screen.getByTestId('id').textContent).toBe('fresh-b');
  });

  it('returns null when there is no id param', () => {
    mockSearchParamsValue = '';
    setLocationSearch('');
    render(<Probe />);
    expect(screen.getByTestId('id').textContent).toBe('null');
  });

  it('updates on a popstate event (Back/Forward navigation)', () => {
    setLocationSearch('?id=fresh-b');
    render(<Probe />);
    expect(screen.getByTestId('id').textContent).toBe('fresh-b');

    setLocationSearch('?id=older-a');
    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(screen.getByTestId('id').textContent).toBe('older-a');
  });

  // Mirrors Next.js 16's HistoryUpdater (app-router.js): the address bar is
  // updated in a useInsertionEffect, i.e. AFTER the render that first sees
  // the new search params.
  function FakeHistoryUpdater({ search }: { search: string }) {
    useInsertionEffect(() => {
      setLocationSearch(search);
    }, [search]);
    return null;
  }

  it('resolves the id when the address bar updates only after the first render (navigation from a page without ?id)', () => {
    // Address bar still shows the previous page (no id); the router already knows the new one.
    setLocationSearch('');
    mockSearchParamsValue = 'id=fresh-b';
    render(
      <>
        <FakeHistoryUpdater search="?id=fresh-b" />
        <Probe />
      </>,
    );
    expect(screen.getByTestId('id').textContent).toBe('fresh-b');
  });

  it('follows a router-reported id change while the address bar catches up', () => {
    setLocationSearch('?id=fresh-b');
    mockSearchParamsValue = 'id=fresh-b';
    const { rerender } = render(
      <>
        <FakeHistoryUpdater search="?id=fresh-b" />
        <Probe />
      </>,
    );
    expect(screen.getByTestId('id').textContent).toBe('fresh-b');

    mockSearchParamsValue = 'id=next-c';
    rerender(
      <>
        <FakeHistoryUpdater search="?id=next-c" />
        <Probe />
      </>,
    );
    expect(screen.getByTestId('id').textContent).toBe('next-c');
  });
});
