import { describe, it, expect } from 'vitest';
import wordlistRaw from '../data/wordlist.json';

const wordlist = wordlistRaw as Record<string, string[]>;
const SPEFFZ_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWX'.split('');

describe('SpeedSolving 576-Pair Dictionary Integrity & Performance', () => {
  it('should contain exactly 576 letter-pair keys (24x24 permutation)', () => {
    const keys = Object.keys(wordlist);
    expect(keys).toHaveLength(576);

    const expectedKeys: string[] = [];
    for (const l1 of SPEFFZ_LETTERS) {
      for (const l2 of SPEFFZ_LETTERS) {
        expectedKeys.push(l1 + l2);
      }
    }

    expect(keys.sort()).toEqual(expectedKeys.sort());
  });

  it('should contain non-empty word arrays for every single letter pair', () => {
    Object.entries(wordlist).forEach(([, words]) => {
      expect(Array.isArray(words)).toBe(true);
      expect(words.length).toBeGreaterThanOrEqual(1);

      // Verify each word is a non-empty, trimmed string
      words.forEach((word) => {
        expect(typeof word).toBe('string');
        expect(word.trim().length).toBeGreaterThan(0);
        expect(word).toBe(word.trim());
      });
    });
  });

  it('should verify word count per pair and identify any duplicate entries', () => {
    let totalWordCount = 0;
    const duplicates: { pair: string; words: string[] }[] = [];

    Object.entries(wordlist).forEach(([pair, words]) => {
      expect(words.length).toBe(4);
      totalWordCount += words.length;

      const uniqueInPair = new Set(words.map((w) => w.toLowerCase()));
      if (uniqueInPair.size !== words.length) {
        duplicates.push({ pair, words });
      }
    });

    expect(totalWordCount).toBe(2304);
    expect(duplicates).toHaveLength(0);
  });

  it('should achieve sub-microsecond lookup latency across 100,000 lookups', () => {
    const allPairs: string[] = [];
    for (const l1 of SPEFFZ_LETTERS) {
      for (const l2 of SPEFFZ_LETTERS) {
        allPairs.push(l1 + l2);
      }
    }

    const iterations = 100_000;
    const start = performance.now();
    let sumLength = 0;

    for (let i = 0; i < iterations; i++) {
      const pair = allPairs[i % 576];
      const entry = wordlist[pair];
      sumLength += entry.length;
    }

    const duration = performance.now() - start;
    const latencyPerLookupNs = (duration / iterations) * 1_000_000;

    expect(sumLength).toBe(iterations * 4);
    expect(duration).toBeLessThan(100);
    console.log(`[Benchmark] 100,000 lookups in ${duration.toFixed(2)}ms (${latencyPerLookupNs.toFixed(2)}ns/lookup)`);
  });
});
