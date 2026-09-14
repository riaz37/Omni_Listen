import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TasksPage from '@/app/[locale]/(app)/tasks/page';

// F1 regression coverage: an event row whose `date` field is missing (LLM
// output does not always produce one) becomes `new Date(undefined)` —
// an Invalid Date — in the tasks page's Task mapping. Opening the row's
// Edit action used to call `format(editingTask.date, 'yyyy-MM-dd')`
// unconditionally, which throws `RangeError: Invalid time value` and blanks
// the whole page. The fix guards that call with `isValid`.

vi.mock('@/hooks/useRequireAuth', () => ({
  useRequireAuth: () => ({ user: { id: 1 }, loading: false, isRevalidated: true }),
}));

vi.mock('@/lib/i18n/use-translation', () => ({
  useTranslation: () => ({ t: (key: string) => key, locale: 'en', dir: 'ltr' }),
}));

vi.mock('@/lib/i18n/use-locale-path', () => ({
  useLocalePath: () => (p: string) => `/en${p}`,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('boneyard-js/react', () => ({
  Skeleton: ({ loading, children, fallback }: any) => (loading ? fallback : children),
}));

vi.mock('@/components/ui/page-entrance', () => ({
  default: ({ children }: any) => <div>{children}</div>,
}));

const mockGetAllEvents = vi.fn();
const mockGetAllNotes = vi.fn();
const mockUpdateEvent = vi.fn().mockResolvedValue({});
const mockToggleTaskCompletion = vi.fn().mockResolvedValue({});
const mockDeleteEvent = vi.fn().mockResolvedValue({});
const mockCreateTask = vi.fn().mockResolvedValue({});

vi.mock('@/lib/api', () => ({
  conversationsAPI: {
    getAllEvents: (...args: any[]) => mockGetAllEvents(...args),
    getAllNotes: (...args: any[]) => mockGetAllNotes(...args),
    updateEvent: (...args: any[]) => mockUpdateEvent(...args),
    toggleTaskCompletion: (...args: any[]) => mockToggleTaskCompletion(...args),
    deleteEvent: (...args: any[]) => mockDeleteEvent(...args),
    createTask: (...args: any[]) => mockCreateTask(...args),
  },
}));

// Seeded rows: one event with a valid ISO date, one event with no `date` at
// all (the Invalid Date row), and one note (dated via created_at, no
// `date`/`urgency`, matching how notes actually reach the page).
const validEvent = {
  id: 101,
  title: 'Ship the release',
  description: 'Cut the build and tag it',
  date: '2026-09-20',
  completed: false,
  urgency: 'no',
  assignee: 'Amina',
  meeting_id: 'm-1',
};

const invalidDateEvent = {
  id: 102,
  title: 'Follow up with vendor',
  description: undefined,
  date: undefined,
  completed: false,
  urgency: 'no',
  assignee: 'Sam',
  meeting_id: 'm-2',
};

const seededNote = {
  id: 201,
  title: 'Budget note',
  description: 'Discussed Q4 numbers',
  created_at: '2026-09-01T00:00:00Z',
  completed: false,
  assignee: 'Priya',
  meeting_id: 'm-3',
};

function renderTasksPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  queryClient.setQueryData(['events'], [validEvent, invalidDateEvent]);
  queryClient.setQueryData(['notes'], [seededNote]);

  render(
    <QueryClientProvider client={queryClient}>
      <TasksPage />
    </QueryClientProvider>,
  );

  return { queryClient };
}

async function openEditFor(rowTitle: string) {
  const row = screen.getByText(rowTitle).closest('tr')!;
  // The row action menu trigger is the only button in the row with
  // aria-haspopup="menu" (it's icon-only, so has no accessible name).
  const menuTrigger = within(row)
    .getAllByRole('button')
    .find((b) => b.getAttribute('aria-haspopup') === 'menu')!;
  fireEvent.click(menuTrigger);
  fireEvent.click(await screen.findByRole('menuitem', { name: /common\.edit/i }));
}

describe('Tasks page edit flow', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    }));
    mockGetAllEvents.mockResolvedValue({ events: [validEvent, invalidDateEvent] });
    mockGetAllNotes.mockResolvedValue({ notes: [seededNote] });
    mockUpdateEvent.mockClear();
  });

  it('opens EditEventModal with the row title and assignee for a valid-date event', async () => {
    renderTasksPage();

    await openEditFor(validEvent.title);

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByDisplayValue(validEvent.title)).toBeInTheDocument();
    expect(within(dialog).getByDisplayValue(validEvent.assignee)).toBeInTheDocument();
  });

  it('opens EditEventModal without throwing when the row has an Invalid Date', async () => {
    renderTasksPage();

    // Regression: this used to throw RangeError: Invalid time value and
    // blank the page instead of opening the modal.
    await openEditFor(invalidDateEvent.title);

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByDisplayValue(invalidDateEvent.title)).toBeInTheDocument();
    // The date field falls back to '' — the DatePicker renders its
    // placeholder text instead of a formatted date.
    expect(within(dialog).getByText('events.edit_modal.placeholder_date')).toBeInTheDocument();
  });

  it('saves only the changed field and patches both the events and notes caches', async () => {
    const { queryClient } = renderTasksPage();

    await openEditFor(validEvent.title);
    const dialog = await screen.findByRole('dialog');

    const assigneeInput = within(dialog).getByDisplayValue(validEvent.assignee);
    fireEvent.change(assigneeInput, { target: { value: 'New Owner' } });

    fireEvent.click(within(dialog).getByRole('button', { name: /events\.edit_modal\.save_changes/i }));

    await waitFor(() => expect(mockUpdateEvent).toHaveBeenCalledTimes(1));
    expect(mockUpdateEvent).toHaveBeenCalledWith(validEvent.id, { assignee: 'New Owner' });

    await waitFor(() => {
      const events = queryClient.getQueryData<any[]>(['events'])!;
      const patched = events.find((e) => e.id === validEvent.id);
      expect(patched.assignee).toBe('New Owner');
    });

    // The notes cache is patched by id too, but no note in it has this id —
    // it must be left untouched.
    const notes = queryClient.getQueryData<any[]>(['notes'])!;
    expect(notes).toEqual([seededNote]);
  });
});
