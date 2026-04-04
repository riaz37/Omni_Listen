'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';
import { ArrowRight, Play, Menu, X } from 'lucide-react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useRef, useState } from 'react';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Pricing', href: '/pricing', isRoute: true },
  { label: 'About', href: '/about', isRoute: true },
];

export default function Hero() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const { scrollY, scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Parallax: blobs move at 0.3x scroll speed
  const blob1Y = useTransform(scrollY, [0, 800], [0, -120]);
  const blob2Y = useTransform(scrollY, [0, 800], [0, -80]);

  return (
    <>
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <Image
                src="/esapai_logo.png"
                alt="ESAPAIListen"
                width={36}
                height={36}
                className="rounded-lg"
              />
              <span className="text-lg font-bold tracking-tight">
                <span className="text-foreground">ESAP</span>
                <span className="text-primary">AI</span>
                <span className="text-foreground">Listen</span>
              </span>
            </div>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) =>
                link.isRoute ? (
                  <Link key={link.label} href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                ) : (
                  <a key={link.label} href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </a>
                )
              )}
            </div>

            <div className="flex items-center gap-3">
              {user ? (
                <Link
                  href="/dashboard"
                  className="px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-hover transition-colors"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/signin"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
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

      {/* Hero Section */}
      <section ref={heroRef} className="min-h-screen flex flex-col justify-center items-center relative pt-20 overflow-hidden">
        {/* Background decoration — parallax blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <motion.div
            style={{ y: blob1Y }}
            className="absolute -top-[30%] left-[10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]"
          />
          <motion.div
            style={{ y: blob2Y }}
            className="absolute top-[50%] right-[5%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]"
          />
        </div>

        <div className="max-w-5xl mx-auto px-4 text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 border border-primary/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              Now in Public Beta
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1] mb-6">
              Never Miss a Detail
              <br />
              <span className="text-primary">From Your Meetings</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            AI that listens so you don&apos;t have to take notes. Record, transcribe,
            and extract actionable insights from every conversation.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href={user ? '/dashboard' : '/signup'}
              className="group px-8 py-4 rounded-full bg-primary text-primary-foreground font-bold text-lg flex items-center gap-2 hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30"
            >
              Start Recording Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#how-it-works"
              className="px-8 py-4 rounded-full border border-border bg-background hover:bg-muted text-muted-foreground font-semibold flex items-center gap-2 transition-all"
            >
              <Play className="w-4 h-4" />
              See How It Works
            </a>
          </motion.div>
        </div>
      </section>
    </>
  );
}
