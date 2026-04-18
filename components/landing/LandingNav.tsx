'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';
import { Menu, X } from 'lucide-react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { useState } from 'react';

const navLinks = [
  { label: 'Features', href: '/#features' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Pricing', href: '/pricing', isRoute: true },
  { label: 'About', href: '/about', isRoute: true },
];

export default function LandingNav() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <nav className="fixed w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-2">
          <Link href="/" className="flex items-center shrink-0" aria-label="Omni Listen home">
            <Image
              src="/logo.png"
              alt="Omni Listen"
              width={1236}
              height={323}
              className="h-12 sm:h-14 w-auto object-contain"
              priority
            />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) =>
              link.isRoute ? (
                <Link key={link.label} href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors py-3">
                  {link.label}
                </Link>
              ) : (
                <a key={link.label} href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors py-3">
                  {link.label}
                </a>
              )
            )}
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <Link
                href="/listen"
                className="px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-hover transition-colors"
              >
                Listen
              </Link>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block py-3"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-hover transition-all hidden sm:inline-flex"
                >
                  Get Started
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) =>
              link.isRoute ? (
                <Link
                  key={link.label}
                  href={link.href}
                  className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              )
            )}
            {!user && (
              <div className="pt-3 border-t border-border flex flex-col gap-2">
                <Link
                  href="/signin"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-hover transition-all text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary origin-left"
        style={{ scaleX }}
      />
    </nav>
  );
}
