'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Manages dropdown open/close state with outside-click and Escape handling.
 */
export function useDropdown(onClose?: () => void) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setIsOpen(false);
    onClose?.();
  }, [onClose]);

  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        close();
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        close();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, close]);

  return { isOpen, setIsOpen, toggle, close, ref };
}

/**
 * Keyboard navigation within a dropdown (Arrow keys, Home, End, Enter, Space).
 */
export function useDropdownKeyboard(
  isOpen: boolean,
  close: () => void,
  itemCount: number,
  onSelect?: (index: number) => void,
) {
  const [focusIndex, setFocusIndex] = useState(-1);
  const itemsRef = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    if (!isOpen) {
      setFocusIndex(-1);
    }
  }, [isOpen]);

  useEffect(() => {
    if (focusIndex >= 0 && itemsRef.current[focusIndex]) {
      itemsRef.current[focusIndex]?.focus();
    }
  }, [focusIndex]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusIndex((prev) => (prev + 1) % itemCount);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusIndex((prev) => (prev - 1 + itemCount) % itemCount);
          break;
        case 'Home':
          e.preventDefault();
          setFocusIndex(0);
          break;
        case 'End':
          e.preventDefault();
          setFocusIndex(itemCount - 1);
          break;
        case 'Enter':
        case ' ':
          if (focusIndex >= 0 && onSelect) {
            e.preventDefault();
            onSelect(focusIndex);
          }
          break;
        case 'Escape':
          e.preventDefault();
          close();
          break;
      }
    },
    [close, itemCount, focusIndex, onSelect],
  );

  const setItemRef = useCallback(
    (index: number) => (el: HTMLElement | null) => {
      itemsRef.current[index] = el;
    },
    [],
  );

  return { handleKeyDown, setItemRef, focusIndex };
}
