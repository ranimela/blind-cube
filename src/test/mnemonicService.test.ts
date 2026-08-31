import { describe, it, expect } from 'vitest';
import {
  sanitizeSpeffzSequence,
  lookupMnemonics,
  parseAndChunkSequence,
  generateProceduralMnemonic,
} from '../services/mnemonicService';

describe('Mnemonic Service Unit Tests', () => {
  describe('sanitizeSpeffzSequence', () => {
    it('should convert lowercase letters to uppercase valid Speffz letters', () => {
      expect(sanitizeSpeffzSequence('abcdef')).toBe('ABCDEF');
    });

    it('should strip out invalid characters, spaces, and numbers', () => {
      expect(sanitizeSpeffzSequence('A B C 1 2 3 ! @ # X Y Z')).toBe('ABCX'); // Y and Z are not in Speffz A-X
    });

    it('should handle empty and null strings safely', () => {
      expect(sanitizeSpeffzSequence('')).toBe('');
      // @ts-expect-error test undefined/null safety
      expect(sanitizeSpeffzSequence(null)).toBe('');
    });
  });

  describe('lookupMnemonics', () => {
    it('should return valid curated words for known letter pairs', () => {
      const resAB = lookupMnemonics('AB');
      expect(resAB.primary).toBeDefined();
      expect(resAB.primary.length).toBeGreaterThan(0);
      expect(resAB.alternatives).toBeInstanceOf(Array);

      const resCD = lookupMnemonics('CD');
      expect(resCD.primary).toBe('Compact Disc');
    });

    it('should return single letter default for 1-character inputs', () => {
      const resA = lookupMnemonics('A');
      expect(resA.primary).toBe('Apple');
      expect(resA.alternatives).toContain('Ace');

      const resX = lookupMnemonics('X');
      expect(resX.primary).toBe('X-ray');
    });

    it('should handle case insensitivity cleanly', () => {
      const lower = lookupMnemonics('ab');
      const upper = lookupMnemonics('AB');
      expect(lower.primary).toBe(upper.primary);
    });
  });

  describe('parseAndChunkSequence', () => {
    it('should chunk even-length sequences into pairs', () => {
      const chunks = parseAndChunkSequence('ABCD');
      expect(chunks).toHaveLength(2);
      expect(chunks[0].pair).toBe('AB');
      expect(chunks[0].firstLetter).toBe('A');
      expect(chunks[0].secondLetter).toBe('B');
      expect(chunks[0].isSingle).toBe(false);

      expect(chunks[1].pair).toBe('CD');
      expect(chunks[1].firstLetter).toBe('C');
      expect(chunks[1].secondLetter).toBe('D');
      expect(chunks[1].isSingle).toBe(false);
    });

    it('should correctly handle odd trailing single letters (parity/buffer)', () => {
      const chunks = parseAndChunkSequence('ABCDE');
      expect(chunks).toHaveLength(3);
      expect(chunks[0].pair).toBe('AB');
      expect(chunks[1].pair).toBe('CD');
      
      const single = chunks[2];
      expect(single.pair).toBe('E');
      expect(single.firstLetter).toBe('E');
      expect(single.secondLetter).toBeUndefined();
      expect(single.isSingle).toBe(true);
      expect(single.mnemonic).toBe('Egg');
    });

    it('should apply custom user mnemonic overrides when provided', () => {
      const customOverrides = {
        'AB': 'Awesome Batman',
      };
      const chunks = parseAndChunkSequence('ABCD', customOverrides);
      expect(chunks[0].mnemonic).toBe('Awesome Batman');
      expect(chunks[0].isCustom).toBe(true);
      expect(chunks[1].mnemonic).toBe('Compact Disc');
      expect(chunks[1].isCustom).toBe(false);
    });

    it('should ignore non-Speffz letters and chunk remaining sequence', () => {
      const chunks = parseAndChunkSequence('a-b 99 c-d # e');
      expect(chunks.map(c => c.pair)).toEqual(['AB', 'CD', 'E']);
    });
  });

  describe('generateProceduralMnemonic', () => {
    it('should return fallback procedural descriptions for single letters or custom combinations', () => {
      const res = generateProceduralMnemonic('A');
      expect(res.length).toBeGreaterThan(0);

      const resPair = generateProceduralMnemonic('AB');
      expect(resPair[0]).toContain('Apple');
    });
  });
});
