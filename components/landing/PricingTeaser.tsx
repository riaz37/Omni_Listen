'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';

const tiers = [
  {
    name: 'Public Beta',
    price: '$0',
    period: '/mo',
    description: 'Full access during beta. No credit card required.',
    features: [
      'Unlimited Recordings',
      'Advanced AI Transcription',
      'Smart Action Items',
      'Google Calendar Sync',
    ],
    cta: 'Start Free Now',
    href: '/signup',
    highlighted: true,
    badge: 'CURRENTLY ACTIVE',
  },
  {
    name: 'Pro',
    price: 'Soon',
    period: '',
    description: 'For growing teams that need more.',
    features: [
      'All Beta Features',
      'Team Collaboration',
      'Custom Vocabularies',
    ],
    cta: 'Notify Me',
    href: null,
    highlighted: false,
    badge: null,
  },
  {
    name: 'Enterprise',
    price: 'Soon',
    period: '',
    description: 'For organizations with advanced needs.',
    features: [
      'SSO & Admin Controls',
      'Dedicated Support',
      'On-premise Deployment',
    ],
    cta: 'Contact Sales',
    href: null,
    highlighted: false,
    badge: null,
  },
];

export default function PricingTeaser() {
  return (
    <section className="py-24 sm:py-32 bg-muted/30 border-y border-border/50">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-5xl font-display font-normal text-foreground mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground">
            Start free. Upgrade when you need to.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className={`relative bg-card rounded-2xl p-6 flex flex-col ${
                tier.highlighted
                  ? 'border-2 border-primary shadow-lg scale-[1.02]'
                  : 'border border-border'
              } ${!tier.href ? 'opacity-60' : ''}`}
            >
              {tier.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {tier.badge}
                </div>
              )}

              <h3 className="text-lg font-bold text-foreground mb-1">{tier.name}</h3>
              <div className="mb-2">
                <span className="text-3xl font-extrabold text-foreground">{tier.price}</span>
                {tier.period && (
                  <span className="text-muted-foreground text-sm">{tier.period}</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-6">{tier.description}</p>

              <ul className="space-y-3 mb-6 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              {tier.href ? (
                <Link
                  href={tier.href}
                  className="block w-full py-3 text-center bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary-hover transition-colors text-sm"
                >
                  {tier.cta}
                </Link>
              ) : (
                <button
                  disabled
                  className="block w-full py-3 text-center bg-muted text-muted-foreground font-bold rounded-xl cursor-not-allowed text-sm"
                >
                  {tier.cta}
                </button>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-8"
        >
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground font-medium transition-colors py-3"
          >
            See full pricing details
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
