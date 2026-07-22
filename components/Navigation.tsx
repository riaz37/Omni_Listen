'use client';

import React from 'react';
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
import { useTranslation } from '@/lib/i18n/use-translation';
import { useLocalePath } from '@/lib/i18n/use-locale-path';
import LanguageSwitcher from '@/components/LanguageSwitcher';

// ─── Navigation item types ───────────────────────────────────────────────────

interface NavItem {
  readonly href: string;
  readonly labelKey: string;
  readonly icon: React.ComponentType<{ className?: string }>;
}

// ─── PRIMARY: Always visible in top bar ──────────────────────────────────────

const PRIMARY_ITEMS: readonly NavItem[] = [
  { href: '/listen', labelKey: 'nav.listen', icon: Home },
  { href: '/analytics', labelKey: 'nav.analytics', icon: BarChart3 },
  { href: '/history', labelKey: 'nav.history', icon: History },
  { href: '/calendar', labelKey: 'nav.calendar', icon: Calendar },
  { href: '/events', labelKey: 'nav.events', icon: List },
  { href: '/tasks', labelKey: 'nav.tasks', icon: CheckSquare },
  { href: '/notes', labelKey: 'nav.notes', icon: StickyNote },
  { href: '/queries', labelKey: 'nav.queries', icon: MessageSquare },
] as const;

// Every visible nav link auto-prefetches on mount by default, which fires a
// burst of requests for routes the user probably isn't about to visit (all 8
// PRIMARY_ITEMS at once). Only prefetch the two highest-traffic destinations;
// everything else still navigates fine on click, just without the head start.
const PREFETCH_ROUTES = new Set<string>(['/listen', '/history']);

// ─── SECONDARY: "Workspace" dropdown (used in mobile bottom sheet) ──────────

const SECONDARY_ITEMS: readonly NavItem[] = [
  { href: '/events', labelKey: 'nav.events', icon: List },
  { href: '/tasks', labelKey: 'nav.tasks', icon: CheckSquare },
  { href: '/notes', labelKey: 'nav.notes', icon: StickyNote },
  { href: '/queries', labelKey: 'nav.queries', icon: MessageSquare },
] as const;

// ─── TERTIARY: User avatar menu items ────────────────────────────────────────

const TERTIARY_NAV_ITEMS: readonly NavItem[] = [
  { href: '/settings', labelKey: 'nav.settings', icon: Settings },
] as const;

// ─── Desktop nav link ────────────────────────────────────────────────────────

function NavLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const Icon = item.icon;
  const { t } = useTranslation();
  const lp = useLocalePath();
  return (
    <Link
      href={lp(item.href)}
      prefetch={PREFETCH_ROUTES.has(item.href) ? undefined : false}
      className={`relative inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
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
      <span className="relative z-10 flex items-center gap-1">
        <Icon className="w-4 h-4 shrink-0" />
        <span>{t(item.labelKey)}</span>
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
  const { t } = useTranslation();
  const lp = useLocalePath();

  const initials =
    user?.name?.charAt(0).toUpperCase() ||
    user?.email?.charAt(0).toUpperCase() ||
    'U';

  return (
    <Dropdown>
      <DropdownTrigger className="flex items-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-semibold text-sm cursor-pointer hover:ring-2 hover:ring-primary transition-all">
          {initials}
        </div>
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
          <DropdownItem key={item.href} href={lp(item.href)} icon={item.icon}>
            {t(item.labelKey)}
          </DropdownItem>
        ))}

        <DropdownSeparator />

        {/* Logout */}
        <DropdownItem icon={LogOut} destructive onClick={onLogout}>
          {t('common.logout')}
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
  const { t } = useTranslation();
  const lp = useLocalePath();
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
        className="sm:hidden fixed bottom-16 start-0 end-0 bg-background border-t border-border z-50 max-h-[60vh] overflow-y-auto rounded-t-2xl"
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
            {t('common.workspace')}
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label={t('common.close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Secondary items */}
        <div className="py-1">
          {SECONDARY_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === lp(item.href);
            return (
              <Link
                key={item.href}
                href={lp(item.href)}
                prefetch={false}
                onClick={onClose}
                className={`flex items-center gap-3 px-6 py-3 transition-colors ${
                  isActive
                    ? 'bg-primary/5 text-primary font-medium'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="text-sm">{t(item.labelKey)}</span>
              </Link>
            );
          })}
        </div>

        {/* Tertiary items */}
        <div className="border-t border-border mt-1 pt-1">
          {TERTIARY_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === lp(item.href);
            return (
              <Link
                key={item.href}
                href={lp(item.href)}
                prefetch={false}
                onClick={onClose}
                className={`flex items-center gap-3 px-6 py-3 transition-colors ${
                  isActive
                    ? 'bg-primary/5 text-primary font-medium'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="text-sm">{t(item.labelKey)}</span>
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
            <span className="text-sm">{t('common.logout')}</span>
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
  const { t } = useTranslation();

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
        {t('common.light')}
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
        {t('common.dark')}
      </button>
    </div>
  );
}

// ─── Main Navigation component ───────────────────────────────────────────────

function Navigation() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { isRecording } = useGlobalState();
  const { t } = useTranslation();
  const lp = useLocalePath();
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
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:start-4 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md"
      >
        {t('common.skip_to_content')}
      </a>

      <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border" aria-label="Main navigation">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-2 gap-3">

            {/* Col 1: Logo — fixed width, never shrinks */}
            <div className="flex-shrink-0">
              <Link
                href={lp('/listen')}
                className="flex items-center"
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
                    <span className="absolute -top-0.5 -end-0.5 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                    </span>
                  )}
                </div>
              </Link>
            </div>

            {/* Col 2: Desktop nav items — grows to fill available space */}
            <div className="hidden md:flex md:items-center md:gap-0.5 flex-1 ms-4">
              {PRIMARY_ITEMS.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  isActive={pathname === lp(item.href)}
                />
              ))}
            </div>

            {/* Col 3: Controls — fixed width, never shrinks */}
            <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
              {/* Desktop-only segmented theme toggle */}
              <div className="hidden md:block">
                <SegmentedThemeToggle />
              </div>

              {/* Language switcher */}
              <div className="hidden md:block">
                <LanguageSwitcher />
              </div>

              {/* User avatar menu */}
              <UserAvatarMenu onLogout={handleLogout} />
            </div>

          </div>
        </div>

        {/* ─── Mobile bottom tab bar (PRIMARY + More) ─────────────────────── */}
        <div
          className="md:hidden fixed bottom-0 start-0 end-0 bg-background border-t border-border z-50"
          role="tablist"
          aria-label="Primary navigation"
        >
          <div className="flex justify-around items-center h-16 px-2">
            {PRIMARY_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === lp(item.href);
              return (
                <Link
                  key={item.href}
                  href={lp(item.href)}
                  prefetch={PREFETCH_ROUTES.has(item.href) ? undefined : false}
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
                    {t(item.labelKey)}
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
              <span className="text-[10px] font-medium">{t('common.more')}</span>
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

export default React.memo(Navigation);
