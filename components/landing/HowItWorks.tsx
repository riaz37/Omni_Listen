'use client';

import { motion } from 'framer-motion';
import { Mic, Zap, Calendar } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Mic,
    title: 'Record',
    description: 'Start recording your meeting in one click. Works with any audio source, any device.',
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/20',
  },
  {
    number: '02',
    icon: Zap,
    title: 'Process',
    description: 'AI transcribes, identifies speakers, extracts tasks, events, and key decisions in real time.',
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/20',
  },
  {
    number: '03',
    icon: Calendar,
    title: 'Sync',
    description: 'Tasks and events are pushed to your calendar and dashboard. Search any meeting, anytime.',
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/20',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 sm:py-32 bg-muted/30 border-y border-border/50">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-5xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Three steps. Zero effort. All your meeting data, organized.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line (desktop only) */}
          <div className="hidden md:block absolute top-[72px] left-[16.67%] right-[16.67%] h-[2px] bg-border" />

          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2, duration: 0.6 }}
                className="relative flex flex-col items-center text-center"
              >
                {/* Step circle */}
                <div className={`relative z-10 w-[88px] h-[88px] rounded-2xl ${step.bg} border-2 ${step.border} flex items-center justify-center mb-6`}>
                  <Icon className={`w-8 h-8 ${step.color}`} />
                </div>

                {/* Step number */}
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                  Step {step.number}
                </span>

                <h3 className="text-xl font-bold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
