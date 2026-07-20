import { describe, it, expect } from 'vitest';
import { hasNoSpeech } from '@/app/[locale]/(app)/conversation/ConversationDetailClient';

// Covers the silent-recording bug: AssemblyAI/Deepgram both "succeed" on
// silence, but the resulting transcript has no actual spoken content. This
// helper is what decides whether the conversation page shows the normal
// summary or the "No speech detected" warning card.
describe('hasNoSpeech', () => {
  it('is true when raw_transcript is missing', () => {
    expect(hasNoSpeech({ raw_transcript: null })).toBe(true);
    expect(hasNoSpeech({})).toBe(true);
  });

  it('is true when raw_transcript is blank/whitespace', () => {
    expect(hasNoSpeech({ raw_transcript: '   ' })).toBe(true);
  });

  it('is true for the backend "no speech found" placeholder', () => {
    expect(hasNoSpeech({ raw_transcript: 'Transcription failed or no speech found.' })).toBe(true);
  });

  it('is true for an AssemblyAI-style empty-utterance segment (silence with valid scaffolding)', () => {
    expect(hasNoSpeech({ raw_transcript: '[00:00 - 00:00] Speaker 1: ' })).toBe(true);
  });

  it('is false for a real transcript', () => {
    expect(
      hasNoSpeech({
        raw_transcript: '[00:00 - 00:12] Speaker 1: Let\'s get started on the roadmap review.',
      }),
    ).toBe(false);
  });

  it('is false for a real multi-speaker transcript', () => {
    expect(
      hasNoSpeech({
        raw_transcript:
          '[00:00 - 00:05] Speaker 1: Hey, can we sync on the release?\n\n[00:05 - 00:10] Speaker 2: Sure, give me a sec.',
      }),
    ).toBe(false);
  });
});
