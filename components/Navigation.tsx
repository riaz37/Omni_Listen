'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  Home,
  History,
  Settings,
  LogOut,
  Calendar,
  StickyNote,
  List,
  BarChart3,
  CheckSquare,
  MessageSquare,
  MoreHorizontal,
  X,
  Sun,
  Moon,
} from 'lucide-react';
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler';
import { useTheme } from '@/lib/theme-context';
import { useState, useEffect, useRef, useCallback } from 'react';

// ─── Navigation item types ───────────────────────────────────────────────────

interface NavItem {
  readonly href: string;
  readonly label: string;
  readonly icon: React.ComponentType<{ className?: string }>;
}

// ─── PRIMARY: Always visible in top bar ──────────────────────────────────────

const PRIMARY_ITEMS: readonly NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/history', label: 'History', icon: History },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/events', label: 'Event', icon: List },
  { href: '/tasks', label: 'Task', icon: CheckSquare },
  { href: '/notes', label: 'Notes', icon: StickyNote },
  { href: '/queries', label: 'Analysis', icon: MessageSquare },
] as const;

// ─── SECONDARY: "Workspace" dropdown (used in mobile bottom sheet) ──────────

const SECONDARY_ITEMS: readonly NavItem[] = [
  { href: '/events', label: 'Events', icon: List },
  { href: '/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/notes', label: 'Notes', icon: StickyNote },
  { href: '/queries', label: 'Analysis', icon: MessageSquare },
] as const;

// ─── TERTIARY: User avatar menu items ────────────────────────────────────────

const TERTIARY_NAV_ITEMS: readonly NavItem[] = [
  { href: '/settings', label: 'Settings', icon: Settings },
] as const;

// ─── Hook: close on outside click or Escape ──────────────────────────────────

function useDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setIsOpen(false), []);
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

  return { isOpen, toggle, close, ref };
}

// ─── Hook: keyboard navigation within dropdown ──────────────────────────────

function useDropdownKeyboard(
  isOpen: boolean,
  close: () => void,
  itemCount: number,
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
        case 'Escape':
          e.preventDefault();
          close();
          break;
      }
    },
    [close, itemCount],
  );

  const setItemRef = useCallback(
    (index: number) => (el: HTMLElement | null) => {
      itemsRef.current[index] = el;
    },
    [],
  );

  return { handleKeyDown, setItemRef, focusIndex };
}

// ─── Desktop nav link ────────────────────────────────────────────────────────

function NavLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
        isActive
          ? 'bg-muted border border-border text-foreground'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
      }`}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon className="w-4 h-4" />
      <span>{item.label}</span>
    </Link>
  );
}

// ─── User avatar menu (TERTIARY) ─────────────────────────────────────────────

function UserAvatarMenu({
  pathname,
  onLogout,
}: {
  pathname: string;
  onLogout: () => void;
}) {
  const { user } = useAuth();
  const { isOpen, toggle, close, ref } = useDropdown();

  // TERTIARY_NAV_ITEMS + theme toggle + logout = itemCount
  const totalItems = TERTIARY_NAV_ITEMS.length + 1; // logout button
  const { handleKeyDown, setItemRef } = useDropdownKeyboard(
    isOpen,
    close,
    totalItems,
  );

  const initials =
    user?.name?.charAt(0).toUpperCase() ||
    user?.email?.charAt(0).toUpperCase() ||
    'U';

  return (
    <div ref={ref} className="relative">
      <button
        onClick={toggle}
        onKeyDown={handleKeyDown}
        className="flex items-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User menu"
      >
        {user?.picture ? (
          <img
            src={user.picture}
            alt={user.name ?? 'User avatar'}
            className="w-8 h-8 rounded-full cursor-pointer hover:ring-2 hover:ring-primary transition-all"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-semibold text-sm cursor-pointer hover:ring-2 hover:ring-primary transition-all">
            {initials}
          </div>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full mt-1 w-56 rounded-lg border border-border bg-popover shadow-lg z-50 py-1"
          role="menu"
          aria-label="User menu items"
          onKeyDown={handleKeyDown}
        >
          {/* User info header */}
          {(user?.name || user?.email) && (
            <div className="px-4 py-3 border-b border-border">
              {user?.name && (
                <p className="text-sm font-medium text-popover-foreground truncate">
                  {user.name}
                </p>
              )}
              {user?.email && (
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              )}
            </div>
          )}

          {/* Nav items */}
          {TERTIARY_NAV_ITEMS.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                ref={setItemRef(index) as React.Ref<HTMLAnchorElement>}
                href={item.href}
                onClick={close}
                role="menuitem"
                tabIndex={-1}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-popover-foreground hover:bg-muted'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}

          {/* Theme toggle */}
          <div className="flex items-center gap-3 px-4 py-2.5 text-sm text-popover-foreground">
            <span className="flex-1">Theme</span>
            <AnimatedThemeToggler className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" />
          </div>

          {/* Logout */}
          <div className="border-t border-border mt-1 pt-1">
            <button
              ref={setItemRef(TERTIARY_NAV_ITEMS.length) as React.Ref<HTMLButtonElement>}
              onClick={() => {
                close();
                onLogout();
              }}
              role="menuitem"
              tabIndex={-1}
              className="flex items-center gap-3 px-4 py-2.5 text-sm w-full text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Mobile bottom sheet for SECONDARY items ─────────────────────────────────

function MobileMoreSheet({
  isOpen,
  onClose,
  pathname,
  onLogout,
}: {
  isOpen: boolean;
  onClose: () => void;
  pathname: string;
  onLogout: () => void;
}) {
  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="sm:hidden fixed inset-0 bg-black/60 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        className="sm:hidden fixed bottom-16 left-0 right-0 bg-background border-t border-border z-50 max-h-[60vh] overflow-y-auto rounded-t-2xl"
        role="dialog"
        aria-label="More navigation items"
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-2">
          <span className="text-sm font-semibold text-foreground">
            Workspace
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Secondary items */}
        <div className="py-1">
          {SECONDARY_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-6 py-3 transition-colors ${
                  isActive
                    ? 'bg-primary/5 text-primary font-medium'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Tertiary items */}
        <div className="border-t border-border mt-1 pt-1">
          {TERTIARY_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-6 py-3 transition-colors ${
                  isActive
                    ? 'bg-primary/5 text-primary font-medium'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}

          {/* Theme row */}
          <div className="flex items-center gap-3 px-6 py-3 text-foreground">
            <span className="text-sm flex-1">Theme</span>
            <AnimatedThemeToggler className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" />
          </div>

          {/* Logout */}
          <button
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="flex items-center gap-3 px-6 py-3 transition-colors w-full text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Segmented theme toggle (matches Figma) ─────────────────────────────────

function SegmentedThemeToggle() {
  const { actualTheme, setTheme } = useTheme();
  return (
    <div className="flex items-center bg-muted rounded-lg p-0.5">
      <button
        onClick={() => setTheme('light')}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
          actualTheme === 'light'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <Sun className="w-3.5 h-3.5" />
        Light
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
          actualTheme === 'dark'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <Moon className="w-3.5 h-3.5" />
        Dark
      </button>
    </div>
  );
}

// ─── Main Navigation component ───────────────────────────────────────────────

export default function Navigation() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [showMobileMore, setShowMobileMore] = useState(false);

  const handleLogout = () => {
    logout();
    // Redirect is handled by auth-context
  };

  return (
    <>
      {/* E6: Skip-to-content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md"
      >
        Skip to content
      </a>

      <nav className="bg-background border-b border-border" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Left side: Logo + PRIMARY nav + Workspace dropdown */}
            <div className="flex items-center">
              {/* Logo */}
              <Link
                href="/dashboard"
                className="flex items-center gap-2 flex-shrink-0"
              >
                <img
                  src="/esapai_logo.png"
                  alt="ESAPListen Logo"
                  className="h-8 w-8 rounded-lg"
                />
                <span className="text-lg font-bold whitespace-nowrap hidden md:block text-foreground">
                  <span className="text-primary">ESAP</span>
                </span>
              </Link>

              {/* Desktop nav items — all flat per Figma */}
              <div className="hidden md:ml-6 md:flex md:items-center md:gap-2">
                {PRIMARY_ITEMS.map((item) => (
                  <NavLink
                    key={item.href}
                    item={item}
                    isActive={pathname === item.href}
                  />
                ))}
              </div>
            </div>

            {/* Right side: Theme toggle (desktop only outside menu) + User avatar menu */}
            <div className="flex items-center gap-2">
              {/* Desktop-only segmented theme toggle */}
              <div className="hidden md:block">
                <SegmentedThemeToggle />
              </div>

              {/* User avatar menu (TERTIARY) — desktop */}
              <div className="hidden md:block">
                <UserAvatarMenu pathname={pathname} onLogout={handleLogout} />
              </div>

              {/* Mobile: just the avatar linking to settings */}
              <div className="md:hidden">
                <UserAvatarMenu pathname={pathname} onLogout={handleLogout} />
              </div>
            </div>
          </div>
        </div>

        {/* ─── Mobile bottom tab bar (PRIMARY + More) ─────────────────────── */}
        <div
          className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50"
          role="tablist"
          aria-label="Primary navigation"
        >
          <div className="flex justify-around items-center h-16 px-2">
            {PRIMARY_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  role="tab"
                  aria-selected={isActive}
                  className={`flex flex-col items-center justify-center px-2 py-1 transition-colors min-w-0 flex-1 ${
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  }`}
                >
                  <Icon className="w-6 h-6 mb-1 shrink-0" />
                  <span className="text-[10px] font-medium truncate w-full text-center">
                    {item.label}
                  </span>
                </Link>
              );
            })}

            {/* More button — opens sheet with SECONDARY + TERTIARY */}
            <button
              onClick={() => setShowMobileMore(!showMobileMore)}
              role="tab"
              aria-selected={showMobileMore}
              aria-label="More navigation options"
              className={`flex flex-col items-center justify-center px-2 py-1 transition-colors min-w-0 flex-1 ${
                showMobileMore
                  ? 'text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              <MoreHorizontal className="w-6 h-6 mb-1 shrink-0" />
              <span className="text-[10px] font-medium">More</span>
            </button>
          </div>
        </div>

        {/* Mobile more sheet */}
        <MobileMoreSheet
          isOpen={showMobileMore}
          onClose={() => setShowMobileMore(false)}
          pathname={pathname}
          onLogout={handleLogout}
        />

        {/* Spacer for fixed bottom nav on mobile */}
        <div className="md:hidden h-16" />
      </nav>
    </>
  );
}
