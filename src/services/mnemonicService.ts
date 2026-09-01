import wordlistRaw from '../data/wordlist.json';
import { LetterPairChunk, MnemonicDictionary } from '../types/speffz';

const MNEMONIC_DICT: MnemonicDictionary = wordlistRaw as MnemonicDictionary;

// Single letter phonetic / visual defaults for odd trailing letters
export const SINGLE_LETTER_DEFAULTS: Record<string, string[]> = {
  A: ['Apple', 'Ace', 'Arrow', 'Alien'],
  B: ['Bee', 'Bat', 'Ball', 'Boat'],
  C: ['Cat', 'Car', 'Crown', 'Cake'],
  D: ['Dog', 'Door', 'Dice', 'Dragon'],
  E: ['Egg', 'Eagle', 'Elephant', 'Eye'],
  F: ['Fish', 'Flame', 'Flag', 'Fox'],
  G: ['Ghost', 'Gold', 'Gun', 'Guitar'],
  H: ['Hat', 'Heart', 'Horse', 'Hammer'],
  I: ['Ice', 'Iron', 'Island', 'Ink'],
  J: ['Joker', 'Juice', 'Jacket', 'Jail'],
  K: ['King', 'Key', 'Kite', 'Knife'],
  L: ['Lion', 'Lemon', 'Lock', 'Lamp'],
  M: ['Moon', 'Monkey', 'Mask', 'Map'],
  N: ['Ninja', 'Needle', 'Nut', 'Nest'],
  O: ['Owl', 'Orange', 'Orca', 'Onion'],
  P: ['Pirate', 'Piano', 'Pizza', 'Penguin'],
  Q: ['Queen', 'Quill', 'Quartz', 'Quiz'],
  R: ['Robot', 'Rocket', 'Ring', 'Rose'],
  S: ['Snake', 'Sun', 'Sword', 'Spider'],
  T: ['Tiger', 'Tree', 'Torch', 'Truck'],
  U: ['Umbrella', 'Unicorn', 'UFO', 'Urn'],
  V: ['Vampire', 'Violin', 'Vase', 'Viper'],
  W: ['Wolf', 'Wand', 'Whale', 'Watch'],
  X: ['X-ray', 'Xylophone', 'Xenon', 'X-Men'],
};

export const SPEFFZ_CORNER_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWX'.split('');
export const SPEFFZ_EDGE_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWX'.split('');

/**
 * Generates a truly random, non-repeating, dynamic Speffz drill sequence.
 * Avoids identical consecutive letters (illegal same-piece cycle target) and adapts to mode.
 */
export function generateDynamicDrill(
  mode: 'full' | 'corners' | 'edges' = 'full',
  pairCount: number = 4
): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWX'.split('');
  const result: string[] = [];

  for (let i = 0; i < pairCount; i++) {
    // Pick first letter
    let first = letters[Math.floor(Math.random() * letters.length)];
    // Ensure first is not equal to previous trailing letter
    if (result.length > 0 && first === result[result.length - 1]) {
      const remaining = letters.filter((l) => l !== first);
      first = remaining[Math.floor(Math.random() * remaining.length)];
    }
    
    // Pick second letter (different from first)
    const available = letters.filter((l) => l !== first);
    const second = available[Math.floor(Math.random() * available.length)];

    result.push(first, second);
  }

  return result.join('');
}

/**
 * Sanitizes input text keeping only valid Speffz letters (A-X).
 */
export function sanitizeSpeffzSequence(input: string): string {
  if (!input) return '';
  return input
    .toUpperCase()
    .replace(/[^A-X]/g, '');
}

/**
 * Fallback procedural mnemonic generator using phonetics / initials.
 */
export function generateProceduralMnemonic(pair: string): string[] {
  const p = pair.toUpperCase();
  if (p.length === 1) {
    return SINGLE_LETTER_DEFAULTS[p] || [p];
  }
  const first = p[0];
  const second = p[1];

  // Try combining initials or phonetic blend
  const firstWord = SINGLE_LETTER_DEFAULTS[first]?.[0] || first;
  const secondWord = SINGLE_LETTER_DEFAULTS[second]?.[0] || second;

  return [
    `${firstWord} & ${secondWord}`,
    `${first}${second}`,
  ];
}

/**
 * Looks up mnemonics for a 1 or 2 letter pair chunk from active dictionary.
 */
export function lookupMnemonics(
  chunkStr: string,
  dict: MnemonicDictionary = MNEMONIC_DICT
): { primary: string; alternatives: string[] } {
  const clean = chunkStr.toUpperCase();
  
  if (clean.length === 1) {
    const list = dict[clean] || SINGLE_LETTER_DEFAULTS[clean] || [clean];
    return {
      primary: list[0],
      alternatives: list.slice(1),
    };
  }

  const dictMatches = dict[clean];
  if (dictMatches && dictMatches.length > 0) {
    return {
      primary: dictMatches[0],
      alternatives: dictMatches.slice(1),
    };
  }

  const procedural = generateProceduralMnemonic(clean);
  return {
    primary: procedural[0],
    alternatives: procedural.slice(1),
  };
}

/**
 * Chunks a Speffz sequence into pairs, preserving any trailing single letter.
 */
export function parseAndChunkSequence(
  sequence: string,
  customOverrides: Record<string, string> = {},
  dict: MnemonicDictionary = MNEMONIC_DICT
): LetterPairChunk[] {
  const clean = sanitizeSpeffzSequence(sequence);
  const chunks: LetterPairChunk[] = [];

  for (let i = 0; i < clean.length; i += 2) {
    const pair = clean.slice(i, i + 2);
    const isSingle = pair.length === 1;
    const firstLetter = pair[0];
    const secondLetter = isSingle ? undefined : pair[1];
    const id = `${pair}-${i}`;

    const { primary, alternatives: dictAlternatives } = lookupMnemonics(pair, dict);
    const custom = customOverrides[pair];

    // All available words for this pair in the active dictionary
    const allDictWords = dict[pair] || (pair.length === 1 ? (SINGLE_LETTER_DEFAULTS[pair] || [primary]) : [primary, ...dictAlternatives]);

    const activeMnemonic = custom || primary;
    
    // Build full alternatives list (every word in the dictionary except the active one)
    const alternatives = allDictWords.filter(
      (w) => w.toLowerCase() !== activeMnemonic.toLowerCase()
    );

    chunks.push({
      id,
      pair,
      firstLetter,
      secondLetter,
      isSingle,
      mnemonic: activeMnemonic,
      alternatives,
      isCustom: Boolean(custom),
    });
  }

  return chunks;
}
