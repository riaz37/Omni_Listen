import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskTable } from '@/app/[locale]/(app)/tasks/TaskTable';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('@/lib/i18n/use-locale-path', () => ({ useLocalePath: () => (p: string) => `/en${p}` }));
vi.mock('@/lib/i18n/use-translation', () => ({
  useTranslation: () => ({ t: (key: string) => key, locale: 'en', dir: 'ltr' }),
}));

const task = {
  id: 7,
  title: 'Prepare deck',
  description: 'Slides for Monday',
  date: new Date('2026-09-15T00:00:00Z'),
  completed: false,
  type: 'dated_events',
  assignee: 'Sara',
  meetingId: '',
  urgency: 'no' as const,
};

describe('TaskTable edit action', () => {
  it('exposes an Edit item that returns the row task', async () => {
    const onEditTask = vi.fn();
    render(
      <TaskTable
        paginatedTasks={[task]}
        filteredTasksCount={1}
        selectedIds={[]}
        sortColumn="title"
        sortDir="asc"
        searchTerm=""
        filterType="all"
        filterUrgency="all"
        currentPage={1}
        totalPages={1}
        rowsPerPage={10}
        onSort={vi.fn()}
        onToggleSelect={vi.fn()}
        onSelectAllOnPage={vi.fn()}
        onToggleTask={vi.fn()}
        onDeleteTask={vi.fn()}
        onEditTask={onEditTask}
        onSetCurrentPage={vi.fn()}
        onSetRowsPerPage={vi.fn()}
      />,
    );

    // Row action menu trigger is the only button with aria-haspopup="menu".
    const menuTrigger = screen.getAllByRole('button').find((b) => b.getAttribute('aria-haspopup') === 'menu')!;
    fireEvent.click(menuTrigger);
    fireEvent.click(await screen.findByRole('menuitem', { name: /common\.edit/i }));

    expect(onEditTask).toHaveBeenCalledWith(task);
  });
});
