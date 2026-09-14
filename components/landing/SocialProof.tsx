'use client';

import { motion } from 'framer-motion';
import { Sparkles, Languages, ShieldCheck, MonitorSmartphone } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';

// Verifiable facts about the product, not traction numbers. While the
// product is in public beta there are no audited usage figures to show.
export default function SocialProof() {
  const { t } = useTranslation();

  const facts = [
    { icon: Sparkles, title: t('marketing.social_proof.fact1_title'), desc: t('marketing.social_proof.fact1_desc') },
    { icon: Languages, title: t('marketing.social_proof.fact2_title'), desc: t('marketing.social_proof.fact2_desc') },
    { icon: ShieldCheck, title: t('marketing.social_proof.fact3_title'), desc: t('marketing.social_proof.fact3_desc') },
    { icon: MonitorSmartphone, title: t('marketing.social_proof.fact4_title'), desc: t('marketing.social_proof.fact4_desc') },
  ];

  return (
    <section className="py-16 bg-muted/50 border-y border-border/50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {facts.map((fact, i) => {
            const Icon = fact.icon;
            return (
              <motion.div
                key={fact.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-lg font-bold text-foreground mb-1">{fact.title}</div>
                <div className="text-sm text-muted-foreground">{fact.desc}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
