'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'What is Omini Listen?',
    answer: 'Omini Listen is your AI personal assistant that listens, transcribes, and extracts actionable insights from any conversation. It automatically identifies tasks, events, decisions, and key notes, then syncs them to your calendar and dashboard.',
  },
  {
    question: 'How accurate is the transcription?',
    answer: 'Our AI achieves 99% transcription accuracy in optimal conditions using Gemini 2.0 Flash. Accuracy remains high even with background noise, accents, and technical jargon.',
  },
  {
    question: 'Does it work with my calendar?',
    answer: 'Yes. Omini Listen integrates directly with Google Calendar. Events and deadlines detected in your conversations are automatically pushed to your calendar with full context.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. All data is encrypted at rest and in transit. We follow industry best practices for data security and privacy. Your recordings and transcripts are accessible only to you.',
  },
  {
    question: 'What languages are supported?',
    answer: 'Currently, Omini Listen supports English and Arabic with full transcription and analysis capabilities. We are working on adding more languages.',
  },
  {
    question: 'Is there a free plan?',
    answer: 'Yes. During our public beta, all features are completely free with no limits on recordings or transcription. No credit card required to get started.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

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
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about Omini Listen.
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
                  className="w-full flex items-center justify-between p-5 text-left bg-card hover:bg-muted/50 transition-colors"
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                >
                  <span className="text-sm font-semibold text-foreground pr-4">
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
