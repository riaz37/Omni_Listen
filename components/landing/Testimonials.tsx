'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
  {
    quote:
      'Omini Listen changed how I handle conversations. I used to lose track of action items constantly. Now everything is captured and synced automatically.',
    name: 'Sarah Chen',
    role: 'Product Manager',
    company: 'TechFlow Inc.',
    avatar: 'SC',
  },
  {
    quote:
      'The transcription accuracy is incredible, even with heavy accents and technical jargon. We switched from Otter and never looked back.',
    name: 'Ahmed Al-Rashid',
    role: 'Engineering Lead',
    company: 'DataScale',
    avatar: 'AR',
  },
  {
    quote:
      'I have 6-8 conversations a day. Having every decision, task, and deadline automatically extracted saves me at least an hour of manual note-taking.',
    name: 'Maria Rodriguez',
    role: 'VP of Operations',
    company: 'GrowthLab',
    avatar: 'MR',
  },
];

export default function Testimonials() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  function scroll(direction: 'left' | 'right') {
    const container = scrollContainerRef.current;
    if (!container) return;
    const cardWidth = container.firstElementChild
      ? (container.firstElementChild as HTMLElement).offsetWidth + 24
      : 400;
    container.scrollBy({
      left: direction === 'left' ? -cardWidth : cardWidth,
      behavior: 'smooth',
    });
  }

  return (
    <section className="py-24 sm:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-5xl font-display font-normal text-foreground mb-4 tracking-tight">
              Loved by Teams
            </h2>
            <p className="text-lg text-muted-foreground">
              See what people are saying about Omini Listen.
            </p>
          </motion.div>

          {/* Scroll arrows — hidden on mobile (swipe is natural) */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              className="w-10 h-10 rounded-full border border-border bg-card hover:bg-muted flex items-center justify-center transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-full border border-border bg-card hover:bg-muted flex items-center justify-center transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Horizontal scroll with snap */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-4 px-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="snap-start shrink-0 w-[85vw] sm:w-[400px] bg-card border border-border rounded-2xl p-6 flex flex-col"
            >
              <Quote className="w-8 h-8 text-primary/30 mb-4 shrink-0" />
              <p className="text-foreground text-sm leading-relaxed mb-6 flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                  {t.avatar}
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground">
                    {t.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t.role}, {t.company}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
