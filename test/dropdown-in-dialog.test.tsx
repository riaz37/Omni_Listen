import React, { useState } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MotionDialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { SelectDropdown } from '@/components/ui/dropdown';

// QA report item 14: the Add Note modal's dropdowns could not be used. The
// dropdown menu was portaled to document.body, outside the Radix dialog, so
// the dialog treated option clicks as "outside" interactions. Inside a
// dialog the menu must render in-flow.

function Harness({ onOpenChange }: { onOpenChange: (open: boolean) => void }) {
  const [value, setValue] = useState('GENERAL');
  return (
    <MotionDialog open onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Add Note</DialogTitle>
        <SelectDropdown
          value={value}
          onChange={setValue}
          options={[
            { value: 'GENERAL', label: 'General' },
            { value: 'BUDGET', label: 'Budget' },
          ]}
        />
        <output data-testid="value">{value}</output>
      </DialogContent>
    </MotionDialog>
  );
}

describe('SelectDropdown inside a MotionDialog', () => {
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

  it('opens, selects an option, and does not close the dialog', async () => {
    const onOpenChange = vi.fn();
    render(<Harness onOpenChange={onOpenChange} />);

    // Let Radix register its document-level pointerdown listener (it does so
    // in a setTimeout(0)).
    await new Promise((r) => setTimeout(r, 0));

    fireEvent.click(screen.getByRole('button', { name: /general/i }));
    const option = await screen.findByRole('option', { name: /budget/i });

    // The menu must be part of the dialog's subtree, not a sibling of it.
    const dialog = screen.getByRole('dialog');
    expect(dialog.contains(option)).toBe(true);

    fireEvent.pointerDown(option);
    fireEvent.click(option);

    await waitFor(() => expect(screen.getByTestId('value').textContent).toBe('BUDGET'));
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });

  it('Escape closes the open dropdown without dismissing the dialog; a second Escape then closes the dialog', async () => {
    const onOpenChange = vi.fn();
    render(<Harness onOpenChange={onOpenChange} />);

    // Let Radix register its document-level listeners (setTimeout(0)).
    await new Promise((r) => setTimeout(r, 0));

    fireEvent.click(screen.getByRole('button', { name: /general/i }));
    await screen.findByRole('listbox');

    fireEvent.keyDown(document.activeElement || document.body, { key: 'Escape' });

    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    expect(onOpenChange).not.toHaveBeenCalledWith(false);

    // Menu is closed now — a second Escape should dismiss the dialog.
    fireEvent.keyDown(document.activeElement || document.body, { key: 'Escape' });

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });
});
