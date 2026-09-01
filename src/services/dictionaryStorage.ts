import wordlistRaw from '../data/wordlist.json';
import { MnemonicDictionary } from '../types/speffz';

export const DICTIONARY_STORAGE_KEY = 'blind_cube_custom_wordlist_v1';
export const SPEFFZ_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWX'.split('');

// Immutable factory default base dictionary (always preserved as backup)
const FACTORY_DEFAULT_BACKUP: Readonly<MnemonicDictionary> = Object.freeze(
  JSON.parse(JSON.stringify(wordlistRaw)) as MnemonicDictionary
);

/**
 * Returns a fresh copy of the factory default base 576-pair wordlist dictionary.
 * The original SpeedSolving list is permanently preserved in memory.
 */
export function getDefaultDictionary(): MnemonicDictionary {
  return JSON.parse(JSON.stringify(FACTORY_DEFAULT_BACKUP)) as MnemonicDictionary;
}

/**
 * Loads the active dictionary from localStorage or falls back to default.
 */
export function loadDictionary(): MnemonicDictionary {
  try {
    const raw = localStorage.getItem(DICTIONARY_STORAGE_KEY);
    if (!raw) return getDefaultDictionary();
    const parsed = JSON.parse(raw);
    if (typeof parsed === 'object' && parsed !== null) {
      // Merge with default dictionary to guarantee all 576 pairs exist
      const defaultDict = getDefaultDictionary();
      return { ...defaultDict, ...parsed };
    }
  } catch (err) {
    console.error('Failed to load dictionary from localStorage', err);
  }
  return getDefaultDictionary();
}

/**
 * Saves the active dictionary to localStorage.
 */
export function saveDictionary(dict: MnemonicDictionary): void {
  try {
    localStorage.setItem(DICTIONARY_STORAGE_KEY, JSON.stringify(dict));
  } catch (err) {
    console.error('Failed to save dictionary to localStorage', err);
  }
}

/**
 * Clears custom dictionary and restores default from backup.
 */
export function resetDictionary(): MnemonicDictionary {
  try {
    localStorage.removeItem(DICTIONARY_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to reset dictionary in localStorage', err);
  }
  return getDefaultDictionary();
}

/**
 * Updates a specific pair's wordlist in the dictionary.
 */
export function updatePairInDictionary(
  dict: MnemonicDictionary,
  pair: string,
  words: string[]
): MnemonicDictionary {
  const cleanPair = pair.toUpperCase().trim();
  const cleanedWords = words.map((w) => w.trim()).filter(Boolean);
  return {
    ...dict,
    [cleanPair]: cleanedWords.length > 0 ? cleanedWords : [cleanPair],
  };
}

/**
 * Exports dictionary to JSON string.
 */
export function exportDictionaryToJSON(dict: MnemonicDictionary): string {
  return JSON.stringify(dict, null, 2);
}

/**
 * Validates and imports dictionary from JSON string.
 */
export function importDictionaryFromJSON(
  jsonStr: string,
  baseDict: MnemonicDictionary = getDefaultDictionary()
): { success: boolean; dict?: MnemonicDictionary; error?: string } {
  try {
    const parsed = JSON.parse(jsonStr);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return { success: false, error: 'Invalid JSON format: expected key-value object.' };
    }

    const merged: MnemonicDictionary = { ...baseDict };
    let validPairCount = 0;

    for (const [key, value] of Object.entries(parsed)) {
      const upperKey = key.toUpperCase().trim();
      if (!/^[A-X]{1,2}$/.test(upperKey)) {
        continue; // skip keys that aren't valid Speffz pairs/singles
      }

      let words: string[] = [];
      if (Array.isArray(value)) {
        words = value.map((v) => String(v).trim()).filter(Boolean);
      } else if (typeof value === 'string') {
        words = [value.trim()].filter(Boolean);
      }

      if (words.length > 0) {
        merged[upperKey] = words;
        validPairCount++;
      }
    }

    if (validPairCount === 0) {
      return { success: false, error: 'No valid Speffz letter pairs found in JSON.' };
    }

    return { success: true, dict: merged };
  } catch (err) {
    return {
      success: false,
      error: `JSON parse error: ${err instanceof Error ? err.message : 'Unknown error'}`,
    };
  }
}

/**
 * Exports dictionary to CSV string formatted as: Pair,Primary,Alternative1,Alternative2,...
 */
export function exportDictionaryToCSV(dict: MnemonicDictionary): string {
  const lines: string[] = ['Pair,Primary,Alternatives'];
  
  // Sort pairs in standard Speffz grid order (A-X x A-X)
  for (const l1 of SPEFFZ_LETTERS) {
    for (const l2 of SPEFFZ_LETTERS) {
      const pair = l1 + l2;
      const words = dict[pair] || [];
      const primary = words[0] || '';
      const alternatives = words.slice(1).join(';');
      // Escape commas / quotes
      const escapedPrimary = primary.includes(',') ? `"${primary}"` : primary;
      const escapedAlts = alternatives.includes(',') ? `"${alternatives}"` : alternatives;
      lines.push(`${pair},${escapedPrimary},${escapedAlts}`);
    }
  }

  return lines.join('\n');
}

/**
 * Imports dictionary from CSV string.
 * Supports:
 * - Pair,Primary,Alt1;Alt2
 * - Pair,Word1,Word2,Word3,Word4
 */
export function importDictionaryFromCSV(
  csvStr: string,
  baseDict: MnemonicDictionary = getDefaultDictionary()
): { success: boolean; dict?: MnemonicDictionary; error?: string } {
  try {
    const lines = csvStr.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) {
      return { success: false, error: 'CSV content is empty.' };
    }

    const merged: MnemonicDictionary = { ...baseDict };
    let importedCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Skip header if present
      if (i === 0 && line.toLowerCase().startsWith('pair,')) {
        continue;
      }

      // Simple CSV row parser handling quotes
      const cells: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let c = 0; c < line.length; c++) {
        const char = line[c];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          cells.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      cells.push(current.trim());

      if (cells.length < 2) continue;

      const pair = cells[0].toUpperCase().replace(/[^A-X]/g, '');
      if (!pair || pair.length > 2) continue;

      const words: string[] = [];
      const primary = cells[1].replace(/^"|"$/g, '').trim();
      if (primary) words.push(primary);

      if (cells.length >= 3) {
        // Check if 3rd cell has semicolon separated alts or multiple columns
        for (let j = 2; j < cells.length; j++) {
          const rawCell = cells[j].replace(/^"|"$/g, '').trim();
          if (rawCell.includes(';')) {
            const splitAlts = rawCell.split(';').map((s) => s.trim()).filter(Boolean);
            words.push(...splitAlts);
          } else if (rawCell) {
            words.push(rawCell);
          }
        }
      }

      if (words.length > 0) {
        merged[pair] = words;
        importedCount++;
      }
    }

    if (importedCount === 0) {
      return { success: false, error: 'No valid Speffz pairs found in CSV.' };
    }

    return { success: true, dict: merged };
  } catch (err) {
    return {
      success: false,
      error: `CSV parse error: ${err instanceof Error ? err.message : 'Unknown error'}`,
    };
  }
}
