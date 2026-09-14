import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TimePicker from '@/components/ui/time-picker';

// QA report item 11: the Reschedule modal said "Leave empty for an all-day
// event" but the picker offered no way to leave it empty.

function Controlled({ allowEmpty, initial = '10:00' }: { allowEmpty?: boolean; initial?: string }) {
  const [value, setValue] = useState(initial);
  return (
    <>
      <TimePicker value={value} onChange={setValue} allowEmpty={allowEmpty} placeholder="Select time" />
      <output data-testid="value">{value === '' ? '(empty)' : value}</output>
    </>
  );
}

describe('TimePicker allowEmpty', () => {
  it('offers an "All day" row that clears the value', () => {
    render(<Controlled allowEmpty />);
    fireEvent.click(screen.getByRole('button', { name: /10:00 AM/i }));
    fireEvent.click(screen.getByRole('button', { name: /^All day$/i }));
    expect(screen.getByTestId('value').textContent).toBe('(empty)');
  });

  it('shows a clear control when a value is set', () => {
    render(<Controlled allowEmpty />);
    fireEvent.click(screen.getByRole('button', { name: /clear time/i }));
    expect(screen.getByTestId('value').textContent).toBe('(empty)');
  });

  it('renders neither control without allowEmpty', () => {
    render(<Controlled />);
    expect(screen.queryByRole('button', { name: /clear time/i })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /10:00 AM/i }));
    expect(screen.queryByRole('button', { name: /^All day$/i })).toBeNull();
  });
});
