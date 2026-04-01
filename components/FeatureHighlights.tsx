'use client';

import { Mic, Brain, Calendar, FileText, Globe, Zap } from 'lucide-react';

const features = [
  {
    icon: Mic,
    title: 'Record & Upload',
  },
  {
    icon: Brain,
    title: 'AI-Powered Analysis',
  },
  {
    icon: Calendar,
    title: 'Calendar Sync',
  },
  {
    icon: FileText,
    title: 'Smart Summaries',
  },
  {
    icon: Globe,
    title: 'Multi-Language',
  },
  {
    icon: Zap,
    title: 'Custom Queries',
  },
];

export default function FeatureHighlights() {
  return (
    <div className="mt-5 pt-4 border-t border-white/10">
      <h3 className="text-center text-muted-foreground font-medium text-sm mb-3">
        Why Choose ESAPListen?
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div
              key={index}
              className="text-center p-2.5 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105"
            >
              <Icon className="w-5 h-5 text-primary mx-auto mb-1.5" />
              <h4 className="text-white text-xs font-medium">{feature.title}</h4>
            </div>
          );
        })}
      </div>
    </div>
  );
}
