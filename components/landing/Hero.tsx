'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { ArrowRight, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRef } from 'react';
import LandingNav from './LandingNav';

export default function Hero() {
  const { user } = useAuth();
  const heroRef = useRef<HTMLElement>(null);

  return (
    <>
      <LandingNav />

      {/* Hero Section */}
      <section ref={heroRef} className="min-h-screen flex flex-col justify-center items-center relative pt-20 overflow-hidden">
        {/* Background — subtle grain texture per DESIGN.md */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <svg className="absolute inset-0 w-full h-full opacity-[0.03]">
            <filter id="grain">
              <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            </filter>
            <rect width="100%" height="100%" filter="url(#grain)" />
          </svg>
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

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-normal tracking-[-0.02em] text-foreground leading-[1.08] mb-6">
              Never Miss a Detail
              <br />
              <span className="text-primary">From Any Conversation</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            AI that listens so you don&apos;t have to take notes. Record, transcribe,
            and extract actionable insights from every conversation you have.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href={user ? '/listen' : '/signup'}
              className="group px-8 py-4 rounded-full bg-primary text-primary-foreground font-bold text-lg flex items-center gap-2 hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30"
            >
              Start Listening Free
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
