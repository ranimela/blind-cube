import { describe, it, expect, beforeEach } from 'vitest';
import {
  getDefaultDictionary,
  loadDictionary,
  saveDictionary,
  resetDictionary,
  updatePairInDictionary,
  exportDictionaryToJSON,
  importDictionaryFromJSON,
  exportDictionaryToCSV,
  importDictionaryFromCSV,
  DICTIONARY_STORAGE_KEY,
} from '../services/dictionaryStorage';

// Mock localStorage in testing environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('Dictionary Storage & Import/Export Service', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('should load default dictionary with 576 pairs when localStorage is empty', () => {
    const dict = loadDictionary();
    const keys = Object.keys(dict);
    expect(keys).toHaveLength(576);
    expect(dict['AB']).toBeDefined();
    expect(dict['AB'].length).toBeGreaterThan(0);
  });

  it('should persist and load custom dictionary in localStorage', () => {
    const baseDict = getDefaultDictionary();
    const updated = updatePairInDictionary(baseDict, 'AB', ['CustomApple', 'CustomAlt1']);
    saveDictionary(updated);

    const loaded = loadDictionary();
    expect(loaded['AB']).toEqual(['CustomApple', 'CustomAlt1']);
    expect(localStorageMock.getItem(DICTIONARY_STORAGE_KEY)).toContain('CustomApple');
  });

  it('should reset dictionary to default and clear localStorage', () => {
    const baseDict = getDefaultDictionary();
    const updated = updatePairInDictionary(baseDict, 'AB', ['CustomApple']);
    saveDictionary(updated);

    const resetDict = resetDictionary();
    expect(resetDict['AB']).not.toEqual(['CustomApple']);
    expect(localStorageMock.getItem(DICTIONARY_STORAGE_KEY)).toBeNull();
  });

  describe('JSON Export & Import', () => {
    it('should export valid JSON and import/merge correctly', () => {
      const baseDict = getDefaultDictionary();
      const customDict = {
        ...baseDict,
        AB: ['Alien Blaster', 'Air Balloon'],
        CD: ['Compact Disk'],
      };

      const jsonStr = exportDictionaryToJSON(customDict);
      expect(typeof jsonStr).toBe('string');
      expect(jsonStr).toContain('Alien Blaster');

      const result = importDictionaryFromJSON(jsonStr, baseDict);
      expect(result.success).toBe(true);
      expect(result.dict).toBeDefined();
      expect(result.dict!['AB']).toEqual(['Alien Blaster', 'Air Balloon']);
      expect(result.dict!['CD']).toEqual(['Compact Disk']);
      // Other unchanged pairs should still exist
      expect(result.dict!['EF']).toEqual(baseDict['EF']);
    });

    it('should reject invalid JSON format', () => {
      const invalidJson = '{ bad json';
      const result = importDictionaryFromJSON(invalidJson);
      expect(result.success).toBe(false);
      expect(result.error).toContain('JSON parse error');
    });

    it('should reject JSON without valid Speffz pairs', () => {
      const nonSpeffzJson = JSON.stringify({ ZZ: ['Invalid'], 123: ['Invalid'] });
      const result = importDictionaryFromJSON(nonSpeffzJson);
      expect(result.success).toBe(false);
      expect(result.error).toContain('No valid Speffz letter pairs found');
    });
  });

  describe('CSV Export & Import', () => {
    it('should export properly structured CSV string with 576 rows + header', () => {
      const baseDict = getDefaultDictionary();
      const csvStr = exportDictionaryToCSV(baseDict);
      const lines = csvStr.split('\n');

      expect(lines[0]).toBe('Pair,Primary,Alternatives');
      expect(lines.length).toBe(577); // Header + 576 pairs
    });

    it('should import and parse CSV correctly with semicolons or multiple columns', () => {
      const baseDict = getDefaultDictionary();
      const csvInput = `Pair,Primary,Alternatives
AB,Apple Pie,Air Balloon;Alien
CD,"Compact, Disc",Cool Dog;Car
EF,Eagle Feather`;

      const result = importDictionaryFromCSV(csvInput, baseDict);
      expect(result.success).toBe(true);
      expect(result.dict).toBeDefined();
      expect(result.dict!['AB']).toEqual(['Apple Pie', 'Air Balloon', 'Alien']);
      expect(result.dict!['CD']).toEqual(['Compact, Disc', 'Cool Dog', 'Car']);
      expect(result.dict!['EF']).toEqual(['Eagle Feather']);
    });

    it('should handle empty or invalid CSV content', () => {
      const emptyResult = importDictionaryFromCSV('');
      expect(emptyResult.success).toBe(false);
      expect(emptyResult.error).toContain('CSV content is empty');

      const invalidResult = importDictionaryFromCSV('NonPair1,NonPair2\nZZ,Word');
      expect(invalidResult.success).toBe(false);
      expect(invalidResult.error).toContain('No valid Speffz pairs found');
    });
  });
});
