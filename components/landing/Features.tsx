'use client';

import { motion } from 'framer-motion';
import {
  Mic,
  Calendar,
  BarChart3,
  Search,
  CheckSquare,
  Users,
  Globe,
  Shield,
} from 'lucide-react';

// Decorative accent colors for feature icons — intentionally outside the theme
// token system for visual variety. These are presentational only and do not
// need to adapt to dark mode (the /10 opacity variants work in both modes).
const features = [
  {
    icon: Mic,
    title: 'Real-Time Transcription',
    description: 'Capture every word with 99% accuracy using advanced AI speech recognition.',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    icon: Calendar,
    title: 'Auto Calendar Sync',
    description: 'Deadlines and events detected and pushed straight to Google Calendar.',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    icon: BarChart3,
    title: 'Deep Insights',
    description: 'Track speaker time, sentiment, and key decisions automatically.',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    icon: Search,
    title: 'Custom Query Engine',
    description: 'Ask anything about your meetings and get cited answers instantly.',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    icon: CheckSquare,
    title: 'Task Extraction',
    description: 'Action items pulled from conversations and organized for your team.',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    icon: Users,
    title: 'Speaker Identification',
    description: 'Know who said what with automatic speaker diarization.',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    icon: Globe,
    title: 'Multi-Language Support',
    description: 'Transcribe meetings in English and Arabic with full accuracy.',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Your data is encrypted at rest and in transit. SOC 2 compliant.',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 sm:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-3xl sm:text-5xl font-bold text-foreground mb-4">
            Everything You Need to
            <br />
            <span className="text-primary">Master Your Meetings</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Replace your notebook with an intelligent system that remembers everything
            and organizes it for you.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="group bg-card border border-border rounded-2xl p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-300"
              >
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${feature.bg} ${feature.color} mb-4`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
