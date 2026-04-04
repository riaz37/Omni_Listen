'use client';

import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    quote: 'ESAPAIListen changed how our team runs meetings. We used to lose track of action items constantly. Now everything is captured and synced automatically.',
    name: 'Sarah Chen',
    role: 'Product Manager',
    company: 'TechFlow Inc.',
    avatar: 'SC',
  },
  {
    quote: 'The transcription accuracy is incredible, even with heavy accents and technical jargon. We switched from Otter and never looked back.',
    name: 'Ahmed Al-Rashid',
    role: 'Engineering Lead',
    company: 'DataScale',
    avatar: 'AR',
  },
  {
    quote: 'I run 6-8 meetings a day. Having every decision, task, and deadline automatically extracted saves me at least an hour of manual note-taking.',
    name: 'Maria Rodriguez',
    role: 'VP of Operations',
    company: 'GrowthLab',
    avatar: 'MR',
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 sm:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-5xl font-bold text-foreground mb-4">
            Loved by Teams
          </h2>
          <p className="text-lg text-muted-foreground">
            See what people are saying about ESAPAIListen.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="bg-card border border-border rounded-2xl p-6 flex flex-col"
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
                  <div className="text-sm font-bold text-foreground">{t.name}</div>
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
