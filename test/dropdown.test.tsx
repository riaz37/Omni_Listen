import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useState } from 'react';
import { SelectDropdown } from '@/components/ui/dropdown';

function ControlledSelect() {
  const [value, setValue] = useState('10');

  return (
    <SelectDropdown
      value={value}
      onChange={setValue}
      options={[
        { value: '10', label: '10' },
        { value: '25', label: '25' },
        { value: '50', label: '50' },
      ]}
    />
  );
}

describe('SelectDropdown', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('opens on trigger click and selects an option', async () => {
    render(<ControlledSelect />);

    fireEvent.click(screen.getByRole('button', { name: /10/i }));

    await waitFor(() => {
      expect(screen.getByRole('option', { name: /25/i })).toBeVisible();
    });

    fireEvent.click(screen.getByRole('option', { name: /25/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /25/i })).toBeVisible();
    });
  });

  it('does not close before click when the mouse down target is option text', async () => {
    render(<ControlledSelect />);

    fireEvent.click(screen.getByRole('button', { name: /10/i }));

    const option = await screen.findByRole('option', { name: /25/i });
    const textNode = Array.from(option.childNodes).find(
      (node) => node.nodeType === Node.TEXT_NODE && node.textContent === '25',
    );

    expect(textNode).toBeDefined();

    fireEvent.mouseDown(textNode as Node);

    expect(screen.getByRole('option', { name: /25/i })).toBeVisible();

    fireEvent.click(option);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /25/i })).toBeVisible();
    });
  });

  it('opens upward when there is not enough viewport space below', async () => {
    render(<ControlledSelect />);

    const trigger = screen.getByRole('button', { name: /10/i });
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(360);
    vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({
      x: 288,
      y: 260,
      width: 133,
      height: 76,
      top: 260,
      right: 421,
      bottom: 336,
      left: 288,
      toJSON: () => ({}),
    } as DOMRect);
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(
      function getOffsetHeight() {
        return this.getAttribute('role') === 'listbox' ? 80 : 0;
      },
    );

    fireEvent.click(trigger);

    const listbox = await screen.findByRole('listbox');

    await waitFor(() => {
      expect(listbox).toHaveStyle('top: 172px');
      expect(listbox).toHaveStyle('max-height: 244px');
    });
  });
});
