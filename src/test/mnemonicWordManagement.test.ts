import { describe, it, expect, beforeEach } from 'vitest';
import {
  getDefaultDictionary,
  saveDictionary,
  resetDictionary,
  updatePairInDictionary,
} from '../services/dictionaryStorage';
import {
  parseAndChunkSequence,
  SINGLE_LETTER_DEFAULTS,
} from '../services/mnemonicService';
import { MnemonicDictionary } from '../types/speffz';

// Mock localStorage in test environment
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

describe('Mnemonic Word Removal and Replacement Lifecycle', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('should execute full lifecycle: select active -> delete inactive -> delete active -> preserve factory default', () => {
    // 1. Initial state for pair "AB": ["ABacus", "ABba", "ABbey"]
    let dict: MnemonicDictionary = getDefaultDictionary();
    dict = updatePairInDictionary(dict, 'AB', ['ABacus', 'ABba', 'ABbey']);
    saveDictionary(dict);

    let customOverrides: Record<string, string> = {};

    let chunks = parseAndChunkSequence('AB', customOverrides, dict);
    expect(chunks).toHaveLength(1);
    expect(chunks[0].pair).toBe('AB');
    expect(chunks[0].mnemonic).toBe('ABacus');
    expect(dict['AB']).toEqual(['ABacus', 'ABba', 'ABbey']);

    // 2. User selects "ABba" -> Active word becomes "ABba", word list still contains ["ABacus", "ABba", "ABbey"]
    customOverrides = {
      ...customOverrides,
      AB: 'ABba',
    };

    chunks = parseAndChunkSequence('AB', customOverrides, dict);
    expect(chunks[0].mnemonic).toBe('ABba');
    // Dictionary wordlist remains intact and preserves all words
    expect(dict['AB']).toEqual(['ABacus', 'ABba', 'ABbey']);
    // Alternatives are the other words
    expect(chunks[0].alternatives).toEqual(['ABacus', 'ABbey']);

    // 3. User deletes "ABacus" -> Word list becomes ["ABba", "ABbey"], "ABacus" is completely gone
    const wordToDelete1 = 'ABacus';
    const currentWords1 = dict['AB'];
    const remaining1 = currentWords1.filter(
      (w) => w.toLowerCase() !== wordToDelete1.toLowerCase()
    );
    dict = updatePairInDictionary(dict, 'AB', remaining1);
    saveDictionary(dict);

    // Active word was "ABba", so customOverrides["AB"] remains "ABba"
    const currentActive1 = customOverrides['AB'] || currentWords1[0];
    if (currentActive1.toLowerCase() === wordToDelete1.toLowerCase()) {
      customOverrides['AB'] = remaining1[0];
    }

    chunks = parseAndChunkSequence('AB', customOverrides, dict);
    expect(dict['AB']).toEqual(['ABba', 'ABbey']);
    expect(chunks[0].mnemonic).toBe('ABba');
    expect(chunks[0].alternatives).toEqual(['ABbey']);
    expect(dict['AB'].includes('ABacus')).toBe(false);

    // 4. User deletes "ABba" (the currently active word) -> Active word switches to "ABbey", word list is ["ABbey"]
    const wordToDelete2 = 'ABba';
    const currentWords2 = dict['AB'];
    const remaining2 = currentWords2.filter(
      (w) => w.toLowerCase() !== wordToDelete2.toLowerCase()
    );
    dict = updatePairInDictionary(dict, 'AB', remaining2);
    saveDictionary(dict);

    const currentActive2 = customOverrides['AB'] || currentWords2[0];
    if (currentActive2.toLowerCase() === wordToDelete2.toLowerCase()) {
      customOverrides['AB'] = remaining2[0];
    }

    chunks = parseAndChunkSequence('AB', customOverrides, dict);
    expect(dict['AB']).toEqual(['ABbey']);
    expect(chunks[0].mnemonic).toBe('ABbey');
    expect(chunks[0].alternatives).toEqual([]);

    // 5. Factory default dictionary remains unmodified and restorable
    const factoryDefault = getDefaultDictionary();
    expect(factoryDefault['AB']).toBeDefined();
    expect(factoryDefault['AB'].length).toBeGreaterThan(0);
    expect(factoryDefault['AB']).not.toEqual(['ABbey']); // unmodified

    // Resetting restores factory default
    const restoredDict = resetDictionary();
    expect(restoredDict['AB']).toEqual(factoryDefault['AB']);
  });

  it('should handle single-letter odd chunk word deletion and fallback', () => {
    let dict: MnemonicDictionary = getDefaultDictionary();
    let customOverrides: Record<string, string> = {};

    // Single letter "A"
    const defaultWordsA = SINGLE_LETTER_DEFAULTS['A']; // ['Apple', 'Ace', 'Arrow', 'Alien']
    expect(defaultWordsA).toBeDefined();
    let chunks = parseAndChunkSequence('A', customOverrides, dict);
    expect(chunks[0].mnemonic).toBe('Apple');
    expect(chunks[0].alternatives).toEqual(['Ace', 'Arrow', 'Alien']);

    // Select alternative "Ace"
    customOverrides['A'] = 'Ace';
    chunks = parseAndChunkSequence('A', customOverrides, dict);
    expect(chunks[0].mnemonic).toBe('Ace');

    // Delete "Apple"
    const currentWords = dict['A'] || SINGLE_LETTER_DEFAULTS['A'];
    const remaining = currentWords.filter((w) => w.toLowerCase() !== 'apple');
    dict = updatePairInDictionary(dict, 'A', remaining);
    saveDictionary(dict);

    chunks = parseAndChunkSequence('A', customOverrides, dict);
    expect(chunks[0].mnemonic).toBe('Ace');
    expect(dict['A']).toEqual(['Ace', 'Arrow', 'Alien']);
  });

  it('should fallback to pair identifier if all words in a pair are deleted', () => {
    let dict: MnemonicDictionary = getDefaultDictionary();
    dict = updatePairInDictionary(dict, 'AB', ['SoloWord']);
    
    // Delete the only word
    const remaining = dict['AB'].filter((w) => w !== 'SoloWord');
    const finalWords = remaining.length > 0 ? remaining : ['AB'];
    dict = updatePairInDictionary(dict, 'AB', finalWords);

    expect(dict['AB']).toEqual(['AB']);
    const chunks = parseAndChunkSequence('AB', {}, dict);
    expect(chunks[0].mnemonic).toBe('AB');
  });

  it('should clean up customOverrides when deleted active word is removed', () => {
    let dict: MnemonicDictionary = getDefaultDictionary();
    dict = updatePairInDictionary(dict, 'CD', ['Compact Disc', 'Cool Dog']);

    // User selects 'Cool Dog' as active override
    const customOverrides: Record<string, string> = { 'CD': 'Cool Dog' };
    
    // User deletes active 'Cool Dog'
    const wordToDelete = 'Cool Dog';
    const currentWords = dict['CD'];
    const remaining = currentWords.filter((w) => w.toLowerCase() !== wordToDelete.toLowerCase());
    dict = updatePairInDictionary(dict, 'CD', remaining);
    
    if (customOverrides['CD']?.toLowerCase() === wordToDelete.toLowerCase()) {
      customOverrides['CD'] = remaining[0];
    }

    const chunks = parseAndChunkSequence('CD', customOverrides, dict);
    expect(chunks[0].mnemonic).toBe('Compact Disc');
    expect(dict['CD']).toEqual(['Compact Disc']);
  });
});
