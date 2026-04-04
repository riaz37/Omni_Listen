'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { Users, Headphones, Globe, Star } from 'lucide-react';

const stats = [
  { icon: Headphones, value: 10000, suffix: '+', label: 'Meetings Recorded' },
  { icon: Star, value: 99, suffix: '%', label: 'Transcription Accuracy' },
  { icon: Users, value: 50, suffix: '+', label: 'Teams Trust Us' },
  { icon: Globe, value: 2, suffix: '', label: 'Languages Supported' },
];

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView || hasAnimated) return;
    setHasAnimated(true);

    const duration = 1500;
    const start = Date.now();
    const timer = setInterval(() => {
      const progress = Math.min((Date.now() - start) / duration, 1);
      if (progress === 1) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(value * progress));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [isInView, hasAnimated, value]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  );
}

export default function SocialProof() {
  return (
    <section className="py-16 bg-muted/50 border-y border-border/50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-foreground mb-1">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Trust logos placeholder */}
        <div className="mt-12 pt-8 border-t border-border/50">
          <p className="text-center text-xs text-muted-foreground uppercase tracking-widest mb-6">
            Trusted by teams at
          </p>
          <div className="flex items-center justify-center gap-8 sm:gap-12 flex-wrap opacity-40">
            {['Company A', 'Company B', 'Company C', 'Company D', 'Company E'].map((name) => (
              <div
                key={name}
                className="text-muted-foreground font-bold text-lg tracking-tight"
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
