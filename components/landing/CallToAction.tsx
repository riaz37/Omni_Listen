'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CallToAction() {
  const { user } = useAuth();

  return (
    <section className="py-24 sm:py-32 bg-primary/5 border-y border-primary/10">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-5xl font-bold text-foreground mb-4">
            Ready to Transform
            <br />
            <span className="text-primary">Your Meetings?</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Join thousands of professionals who never miss a detail.
            Start recording for free today.
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
