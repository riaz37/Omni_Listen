'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
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
import type { LucideIcon } from 'lucide-react';
import { DURATIONS, EASINGS, SPRINGS } from '@/lib/motion';
import { useTranslation } from '@/lib/i18n/use-translation';

// ─── Tier definitions ──────────────────────────────────────────────────────

interface HeroFeature {
  icon: LucideIcon;
  title: string;
  description: string;
  detail: string;
}

interface CoreFeature {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface SupportFeature {
  icon: LucideIcon;
  title: string;
  description: string;
}

// ─── Animation variants ────────────────────────────────────────────────────

const slideFromLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring' as const,
      ...SPRINGS.default,
    },
  },
};

const slideFromRight = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring' as const,
      ...SPRINGS.default,
    },
  },
};

const fadeDelayed = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { delay: 0.2, duration: DURATIONS.fast },
  },
};

// ─── Tier 1: Hero Features ─────────────────────────────────────────────────

function HeroFeatureRow({
  feature,
  index,
  badgeLabel,
}: {
  feature: HeroFeature;
  index: number;
  badgeLabel: string;
}) {
  const Icon = feature.icon;
  const imageLeft = index % 2 === 0;

  const iconBlock = (
    <motion.div
      variants={imageLeft ? slideFromLeft : slideFromRight}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-20px' }}
      className="flex items-center justify-center"
    >
      <div className="relative w-full max-w-sm aspect-square rounded-2xl bg-card border border-border flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-primary/5" />
        <Icon className="w-20 h-20 text-primary/60" strokeWidth={1} />
      </div>
    </motion.div>
  );

  const textBlock = (
    <motion.div
      variants={fadeDelayed}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-20px' }}
      className="flex flex-col justify-center"
    >
      <div className="inline-flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <span className="text-xs font-medium text-primary uppercase tracking-widest">
          {badgeLabel}
        </span>
      </div>
      <h3 className="text-2xl sm:text-3xl font-semibold text-foreground mb-4 tracking-tight">
        {feature.title}
      </h3>
      <p className="text-base text-muted-foreground leading-relaxed mb-3">
        {feature.description}
      </p>
      <p className="text-sm text-muted-foreground/70 leading-relaxed">
        {feature.detail}
      </p>
    </motion.div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
      {imageLeft ? (
        <>
          {iconBlock}
          {textBlock}
        </>
      ) : (
        <>
          {textBlock}
          {iconBlock}
        </>
      )}
    </div>
  );
}

// ─── Tier 2: Core Features ─────────────────────────────────────────────────

function CoreFeatureRow({
  coreFeatures,
}: {
  coreFeatures: readonly CoreFeature[];
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {coreFeatures.map((feature, i) => {
        const Icon = feature.icon;
        return (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-10px' }}
            transition={{ delay: i * 0.06, duration: DURATIONS.fast }}
            className="flex items-start gap-4 py-4"
          >
            <div className="w-10 h-10 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="text-base font-semibold text-foreground mb-1">
                {feature.title}
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Tier 3: Supporting Features ───────────────────────────────────────────

function SupportFeatureItem({ feature }: { feature: SupportFeature }) {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = feature.icon;

  return (
    <div
      className="group border-b border-border"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-3 py-4 cursor-default">
        <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors duration-150" />
        <span className="text-sm font-medium text-foreground">
          {feature.title}
        </span>
      </div>
      <AnimatePresence initial={false}>
        {isHovered && (
          <motion.div
            key="description"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15, ease: EASINGS.easeOut }}
            className="overflow-hidden"
          >
            <p className="text-sm text-muted-foreground leading-relaxed pb-4 ps-7">
              {feature.description}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SupportFeatureList({
  supportFeatures,
  alsoIncludedLabel,
}: {
  supportFeatures: readonly SupportFeature[];
  alsoIncludedLabel: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-10px' }}
      transition={{ duration: DURATIONS.fast }}
    >
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">
        {alsoIncludedLabel}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8">
        {supportFeatures.map((feature) => (
          <SupportFeatureItem key={feature.title} feature={feature} />
        ))}
      </div>
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

export default function Features() {
  const { t } = useTranslation();

  const heroFeatures: readonly HeroFeature[] = [
    {
      icon: Mic,
      title: t('marketing.features.hero1_title'),
      description: t('marketing.features.hero1_desc'),
      detail: t('marketing.features.hero1_detail'),
    },
    {
      icon: Search,
      title: t('marketing.features.hero2_title'),
      description: t('marketing.features.hero2_desc'),
      detail: t('marketing.features.hero2_detail'),
    },
  ];

  const coreFeatures: readonly CoreFeature[] = [
    {
      icon: Calendar,
      title: t('marketing.features.core1_title'),
      description: t('marketing.features.core1_desc'),
    },
    {
      icon: CheckSquare,
      title: t('marketing.features.core2_title'),
      description: t('marketing.features.core2_desc'),
    },
    {
      icon: BarChart3,
      title: t('marketing.features.core3_title'),
      description: t('marketing.features.core3_desc'),
    },
  ];

  const supportFeatures: readonly SupportFeature[] = [
    {
      icon: Users,
      title: t('marketing.features.support1_title'),
      description: t('marketing.features.support1_desc'),
    },
    {
      icon: Globe,
      title: t('marketing.features.support2_title'),
      description: t('marketing.features.support2_desc'),
    },
    {
      icon: Shield,
      title: t('marketing.features.support3_title'),
      description: t('marketing.features.support3_desc'),
    },
  ];

  const heroBadges = [
    t('marketing.features.badge_core'),
    t('marketing.features.badge_intelligence'),
  ];

  return (
    <section id="features" className="py-24 sm:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <h2 className="text-3xl sm:text-5xl font-display font-normal text-foreground mb-4 tracking-tight">
            {t('marketing.features.title_line1')}
            <br />
            <span className="text-primary">
              {t('marketing.features.title_line2')}
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl">
            {t('marketing.features.subtitle')}
          </p>
        </motion.div>

        {/* Tier 1: Hero features — full-width, alternating layout */}
        <div className="space-y-20 mb-24">
          {heroFeatures.map((feature, i) => (
            <HeroFeatureRow
              key={feature.title}
              feature={feature}
              index={i}
              badgeLabel={heroBadges[i] ?? heroBadges[heroBadges.length - 1]}
            />
          ))}
        </div>

        {/* Tier 2: Core features — compact row, icon + inline text */}
        <div className="mb-16 border-t border-border pt-12">
          <CoreFeatureRow coreFeatures={coreFeatures} />
        </div>

        {/* Tier 3: Supporting features — minimal list with hover-reveal */}
        <SupportFeatureList
          supportFeatures={supportFeatures}
          alsoIncludedLabel={t('marketing.features.also_included')}
        />
      </div>
    </section>
  );
}
