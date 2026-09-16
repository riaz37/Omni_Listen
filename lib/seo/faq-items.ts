/**
 * The FAQ list, shared by the visible accordion and the FAQPage schema.
 *
 * Structured data must match what a visitor actually sees. Before this list
 * existed, components/landing/FAQ.tsx hardcoded its six question/answer pairs,
 * so adding a seventh to the dictionaries would have left the schema and the
 * page out of step, which is the exact "structured data does not match visible
 * content" violation the markup is supposed to avoid. Both consumers now read
 * the same array, so the two cannot diverge.
 *
 * Keys are relative to the `marketing` namespace.
 */
export const FAQ_KEYS = [1, 2, 3, 4, 5, 6].map((i) => ({
  question: `faq.q${i}`,
  answer: `faq.a${i}`,
}));
