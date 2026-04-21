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
import { useTheme } from '@/lib/theme-context';
import { useGlobalState } from '@/lib/global-state-context';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DURATIONS, EASINGS, SPRINGS } from '@/lib/motion';
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
  DropdownHeader,
} from '@/components/ui/dropdown';

// ─── Navigation item types ───────────────────────────────────────────────────

interface NavItem {
  readonly href: string;
  readonly label: string;
  readonly icon: React.ComponentType<{ className?: string }>;
}

// ─── PRIMARY: Always visible in top bar ──────────────────────────────────────

const PRIMARY_ITEMS: readonly NavItem[] = [
  { href: '/listen', label: 'Listen', icon: Home },
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

// ─── Desktop nav link ────────────────────────────────────────────────────────

function NavLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={`relative inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? 'text-foreground'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
      }`}
      aria-current={isActive ? 'page' : undefined}
    >
      {isActive && (
        <motion.span
          layoutId="nav-indicator"
          className="absolute inset-0 bg-muted border border-border rounded-lg"
          transition={{ type: 'spring', ...SPRINGS.default }}
        />
      )}
      <span className="relative z-10 flex items-center gap-1.5">
        <Icon className="w-4 h-4" />
        <span>{item.label}</span>
      </span>
    </Link>
  );
}

// ─── User avatar menu (TERTIARY) ─────────────────────────────────────────────

function UserAvatarMenu({
  onLogout,
}: {
  onLogout: () => void;
}) {
  const { user } = useAuth();

  const initials =
    user?.name?.charAt(0).toUpperCase() ||
    user?.email?.charAt(0).toUpperCase() ||
    'U';

  return (
    <Dropdown>
      <DropdownTrigger className="flex items-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
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
      </DropdownTrigger>
      <DropdownContent align="end" className="w-56">
        {/* User info header */}
        {(user?.name || user?.email) && (
          <DropdownHeader>
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
          </DropdownHeader>
        )}

        {/* Nav items */}
        {TERTIARY_NAV_ITEMS.map((item) => (
          <DropdownItem key={item.href} href={item.href} icon={item.icon}>
            {item.label}
          </DropdownItem>
        ))}

        <DropdownSeparator />

        {/* Logout */}
        <DropdownItem icon={LogOut} destructive onClick={onLogout}>
          Logout
        </DropdownItem>
      </DropdownContent>
    </Dropdown>
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

  return (
    <AnimatePresence>
    {isOpen && (
    <>
      {/* Backdrop */}
      <motion.div
        className="sm:hidden fixed inset-0 bg-black/60 z-40"
        onClick={onClose}
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: DURATIONS.fast }}
      />

      {/* Sheet */}
      <motion.div
        className="sm:hidden fixed bottom-16 left-0 right-0 bg-background border-t border-border z-50 max-h-[60vh] overflow-y-auto rounded-t-2xl"
        role="dialog"
        aria-label="More navigation items"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
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
      </motion.div>
    </>
    )}
    </AnimatePresence>
  );
}

// ─── Segmented theme toggle (matches Figma) with view-transition animation ──

function SegmentedThemeToggle() {
  const { actualTheme, setTheme } = useTheme();

  const handleSwitch = useCallback(
    (target: 'light' | 'dark') => {
      if (actualTheme === target) return;
      setTheme(target);
    },
    [actualTheme, setTheme],
  );

  return (
    <div className="flex items-center bg-muted rounded-lg p-0.5">
      <button
        onClick={() => handleSwitch('light')}
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
        onClick={() => handleSwitch('dark')}
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
  const { isRecording } = useGlobalState();
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

      <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-2">
            {/* Left side: Logo + PRIMARY nav + Workspace dropdown */}
            <div className="flex items-center">
              {/* Logo */}
              <Link
                href="/listen"
                className="flex items-center flex-shrink-0"
                aria-label="Omni Listen home"
              >
                <div className="relative">
                  <img
                    src="/logo-black.png"
                    alt="Omni Listen Logo"
                    className="h-12 sm:h-14 w-auto object-contain block dark:hidden"
                  />
                  <img
                    src="/logo.png"
                    alt="Omni Listen Logo"
                    className="h-12 sm:h-14 w-auto object-contain hidden dark:block"
                  />
                  {isRecording && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                    </span>
                  )}
                </div>
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
                <UserAvatarMenu onLogout={handleLogout} />
              </div>

              {/* Mobile: just the avatar linking to settings */}
              <div className="md:hidden">
                <UserAvatarMenu onLogout={handleLogout} />
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
