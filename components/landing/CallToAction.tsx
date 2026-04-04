'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import type { TargetAndTransition } from 'framer-motion';

const floatingKeyframes: TargetAndTransition = {
  y: [0, -8, 0],
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: 'easeInOut' as const,
  },
};

const floatingKeyframesSlow: TargetAndTransition = {
  y: [0, -6, 0],
  transition: {
    duration: 5,
    repeat: Infinity,
    ease: 'easeInOut' as const,
    delay: 1,
  },
};

export default function CallToAction() {
  const { user } = useAuth();

  return (
    <section className="py-24 sm:py-32 bg-primary/5 border-y border-primary/10 relative overflow-hidden">
      {/* Floating decorative elements */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <motion.div
          animate={floatingKeyframes}
          className="absolute top-12 left-[10%] w-3 h-3 rounded-full bg-primary/20"
        />
        <motion.div
          animate={floatingKeyframesSlow}
          className="absolute top-20 right-[15%] w-2 h-2 rounded-full bg-primary/15"
        />
        <motion.div
          animate={floatingKeyframes}
          className="absolute bottom-16 left-[20%] w-2 h-2 rounded-full bg-primary/10"
        />
        <motion.div
          animate={floatingKeyframesSlow}
          className="absolute bottom-24 right-[10%] w-4 h-4 rounded-full bg-primary/10"
        />
        <motion.div
          animate={floatingKeyframes}
          className="absolute top-1/2 left-[5%] w-1.5 h-1.5 rounded-full bg-primary/15"
        />
        <motion.div
          animate={floatingKeyframesSlow}
          className="absolute top-1/3 right-[8%] w-2.5 h-2.5 rounded-full bg-primary/10"
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-5xl font-bold text-foreground mb-4 tracking-tight">
            Ready to Transform
            <br />
            <span className="text-primary">Your Meetings?</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Join thousands of professionals who never miss a detail. Start
            recording for free today.
          </p>
          <Link
            href={user ? '/dashboard' : '/signup'}
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground font-bold text-lg hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30"
          >
            {user ? 'Go to Dashboard' : 'Start Recording Free'}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="mt-4 text-sm text-muted-foreground">
            No credit card required. Free during public beta.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
