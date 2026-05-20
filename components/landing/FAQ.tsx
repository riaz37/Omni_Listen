'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';

export default function FAQ() {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: t('marketing.faq.q1'),
      answer: t('marketing.faq.a1'),
    },
    {
      question: t('marketing.faq.q2'),
      answer: t('marketing.faq.a2'),
    },
    {
      question: t('marketing.faq.q3'),
      answer: t('marketing.faq.a3'),
    },
    {
      question: t('marketing.faq.q4'),
      answer: t('marketing.faq.a4'),
    },
    {
      question: t('marketing.faq.q5'),
      answer: t('marketing.faq.a5'),
    },
    {
      question: t('marketing.faq.q6'),
      answer: t('marketing.faq.a6'),
    },
  ];

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 sm:py-32 bg-background">
      <div className="max-w-3xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-5xl font-display font-normal text-foreground mb-4">
            {t('marketing.faq.title')}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t('marketing.faq.subtitle')}
          </p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            const questionId = `faq-question-${i}`;
            const answerId = `faq-answer-${i}`;
            return (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                className="border border-border rounded-xl overflow-hidden"
              >
                <button
                  id={questionId}
                  onClick={() => toggle(i)}
                  className="w-full flex items-center justify-between p-5 text-start bg-card hover:bg-muted/50 transition-colors"
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                >
                  <span className="text-sm font-semibold text-foreground pe-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div
                  id={answerId}
                  role="region"
                  aria-labelledby={questionId}
                  className={`overflow-hidden transition-all duration-200 ${
                    isOpen ? 'max-h-96' : 'max-h-0'
                  }`}
                >
                  <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
