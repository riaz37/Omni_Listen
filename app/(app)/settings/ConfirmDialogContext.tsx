'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import ConfirmDialog from '@/components/ConfirmDialog';

interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: 'danger' | 'warning';
  onConfirm: () => void | Promise<void>;
}

interface ConfirmDialogContextValue {
  confirm: (options: ConfirmDialogOptions) => void;
}

const ConfirmDialogContext = createContext<ConfirmDialogContextValue | null>(null);

export function useConfirmDialog() {
  const ctx = useContext(ConfirmDialogContext);
  if (!ctx) throw new Error('useConfirmDialog must be used within ConfirmDialogProvider');
  return ctx;
}

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = useState<ConfirmDialogOptions | null>(null);

  const confirm = useCallback((opts: ConfirmDialogOptions) => {
    setOptions(opts);
  }, []);

  const handleConfirm = () => {
    options?.onConfirm();
    setOptions(null);
  };

  const handleCancel = () => {
    setOptions(null);
  };

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}
      {options && (
        <ConfirmDialog
          isOpen={!!options}
          title={options.title}
          message={options.message}
          confirmLabel={options.confirmLabel}
          variant={options.variant}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </ConfirmDialogContext.Provider>
  );
}
