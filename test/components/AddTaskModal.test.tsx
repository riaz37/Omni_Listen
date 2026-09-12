import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AddTaskModal } from '@/app/[locale]/(app)/tasks/AddTaskModal';

vi.mock('@/lib/i18n/use-translation', () => ({
  useTranslation: () => ({ t: (key: string) => key, locale: 'en', dir: 'ltr' }),
}));

describe('AddTaskModal', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    }));
  });

  it('lets the user set an assignee', () => {
    const onNewTaskChange = vi.fn();
    const newTask = { title: 'Deck', description: '', date: '', urgency: 'no' as const, assignee: '' };
    render(
      <AddTaskModal show newTask={newTask} onNewTaskChange={onNewTaskChange} onClose={vi.fn()} onSubmit={vi.fn()} />,
    );

    fireEvent.change(screen.getByLabelText('tasks.modal_assignee_label'), { target: { value: 'Sara' } });
    expect(onNewTaskChange).toHaveBeenCalledWith({ ...newTask, assignee: 'Sara' });
  });
});
