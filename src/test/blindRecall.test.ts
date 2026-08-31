import { describe, it, expect } from 'vitest';
import { calculateRecallScore } from '../components/BlindRecallTest';
import { LetterPairChunk } from '../types/speffz';

describe('Blind Recall Memory Test Scoring Engine', () => {
  const sampleChunks: LetterPairChunk[] = [
    {
      id: 'AB-0',
      pair: 'AB',
      firstLetter: 'A',
      secondLetter: 'B',
      isSingle: false,
      mnemonic: 'Apple',
      alternatives: ['Air Balloon', 'Alien'],
    },
    {
      id: 'CD-2',
      pair: 'CD',
      firstLetter: 'C',
      secondLetter: 'D',
      isSingle: false,
      mnemonic: 'Card',
      alternatives: ['Cloud', 'Candy'],
    },
    {
      id: 'EF-4',
      pair: 'EF',
      firstLetter: 'E',
      secondLetter: 'F',
      isSingle: false,
      mnemonic: 'Elephant',
      alternatives: ['Eagle', 'Elf'],
    },
  ];

  it('should score 100% accuracy when all primary words match exactly (case-insensitive)', () => {
    const userInputs = ['apple', 'CARD', 'Elephant'];
    const score = calculateRecallScore(sampleChunks, userInputs, 15);

    expect(score.total).toBe(3);
    expect(score.correct).toBe(3);
    expect(score.accuracyPct).toBe(100);
    expect(score.elapsedSeconds).toBe(15);
    expect(score.items.every((i) => i.isCorrect)).toBe(true);
  });

  it('should accept valid pair letters or alternative synonyms as correct answers', () => {
    const userInputs = [
      'AB', // matched by pair code
      'Cloud', // matched by alternative synonym
      'elf', // matched by alternative synonym (case-insensitive)
    ];
    const score = calculateRecallScore(sampleChunks, userInputs, 20);

    expect(score.correct).toBe(3);
    expect(score.accuracyPct).toBe(100);
  });

  it('should calculate partial scores and mark wrong or blank inputs accurately', () => {
    const userInputs = [
      'apple', // correct
      'WrongWord', // wrong
      '', // blank
    ];
    const score = calculateRecallScore(sampleChunks, userInputs, 12);

    expect(score.total).toBe(3);
    expect(score.correct).toBe(1);
    expect(score.accuracyPct).toBe(33);
    expect(score.items[0].isCorrect).toBe(true);
    expect(score.items[1].isCorrect).toBe(false);
    expect(score.items[2].isCorrect).toBe(false);
  });

  it('should gracefully handle empty chunk list', () => {
    const score = calculateRecallScore([], [], 0);
    expect(score.total).toBe(0);
    expect(score.correct).toBe(0);
    expect(score.accuracyPct).toBe(0);
    expect(score.items).toHaveLength(0);
  });
});
