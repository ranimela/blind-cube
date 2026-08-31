import React, { useState, useMemo } from 'react';
import { MnemonicDictionary } from '../../types/speffz';
import { SPEFFZ_LETTERS, getDefaultDictionary } from '../../services/dictionaryStorage';
import { Search, Edit2, Check, X, RotateCcw } from 'lucide-react';

interface WordlistTableProps {
  dict: MnemonicDictionary;
  onUpdatePair: (pair: string, words: string[]) => void;
  onOpenEditModal: (pair: string) => void;
}

export const WordlistTable: React.FC<WordlistTableProps> = ({
  dict,
  onUpdatePair,
  onOpenEditModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPair, setEditingPair] = useState<string | null>(null);
  const [quickPrimary, setQuickPrimary] = useState('');
  const defaultDict = useMemo(() => getDefaultDictionary(), []);

  // Filtered list of all pairs
  const filteredPairs = useMemo(() => {
    const list: { pair: string; words: string[]; isCustom: boolean }[] = [];
    const term = searchTerm.toLowerCase().trim();

    for (const l1 of SPEFFZ_LETTERS) {
      for (const l2 of SPEFFZ_LETTERS) {
        const pair = l1 + l2;
        const words = dict[pair] || [];
        const defaultWords = defaultDict[pair] || [];
        const isCustom = JSON.stringify(words) !== JSON.stringify(defaultWords);

        if (!term) {
          list.push({ pair, words, isCustom });
        } else {
          const matchPair = pair.toLowerCase().includes(term);
          const matchWords = words.some((w) => w.toLowerCase().includes(term));
          if (matchPair || matchWords) {
            list.push({ pair, words, isCustom });
          }
        }
      }
    }

    return list;
  }, [dict, defaultDict, searchTerm]);

  const handleStartQuickEdit = (pair: string, currentPrimary: string) => {
    setEditingPair(pair);
    setQuickPrimary(currentPrimary);
  };

  const handleSaveQuickEdit = (pair: string) => {
    const words = dict[pair] || [];
    const cleanPrimary = quickPrimary.trim();
    if (cleanPrimary) {
      const rest = words.slice(1);
      onUpdatePair(pair, [cleanPrimary, ...rest]);
    }
    setEditingPair(null);
  };

  const handleResetSinglePair = (pair: string) => {
    const defaultWords = defaultDict[pair];
    if (defaultWords) {
      onUpdatePair(pair, defaultWords);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Search Input Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search pair (e.g. AB) or word..."
            className="w-full min-h-[44px] pl-10 pr-4 rounded-xl border border-slate-200 focus:border-[#1E3A8A] text-sm outline-none transition-all"
          />
        </div>
        <span className="text-xs font-semibold text-slate-500 self-end sm:self-center">
          Showing {filteredPairs.length} of 576 pairs
        </span>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto max-h-[500px] rounded-2xl border border-slate-200 shadow-sm bg-white">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10 bg-[#F1F5F9] text-xs font-bold text-slate-700 border-b border-slate-200">
            <tr>
              <th className="py-3 px-4 w-20">Pair</th>
              <th className="py-3 px-4">Primary Mnemonic</th>
              <th className="py-3 px-4">Alternatives</th>
              <th className="py-3 px-4 w-28 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filteredPairs.map(({ pair, words, isCustom }) => {
              const primary = words[0] || '';
              const alts = words.slice(1);
              const isEditing = editingPair === pair;

              return (
                <tr
                  key={pair}
                  className={`hover:bg-slate-50 transition-colors ${
                    isCustom ? 'bg-emerald-50/30' : ''
                  }`}
                >
                  {/* Pair Tag */}
                  <td className="py-2.5 px-4">
                    <span className="font-mono font-bold text-sm text-[#1E3A8A] bg-blue-50 px-2.5 py-1 rounded-lg">
                      {pair}
                    </span>
                  </td>

                  {/* Primary Word / Inline Editor */}
                  <td className="py-2.5 px-4 font-semibold text-slate-800">
                    {isEditing ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={quickPrimary}
                          onChange={(e) => setQuickPrimary(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveQuickEdit(pair);
                            if (e.key === 'Escape') setEditingPair(null);
                          }}
                          autoFocus
                          className="min-h-[34px] px-2.5 py-1 text-sm border border-[#1E3A8A] rounded-lg outline-none font-bold"
                        />
                        <button
                          onClick={() => handleSaveQuickEdit(pair)}
                          className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                          title="Save"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingPair(null)}
                          className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 group/edit">
                        <span>{primary}</span>
                        <button
                          onClick={() => handleStartQuickEdit(pair, primary)}
                          className="opacity-0 group-hover/edit:opacity-100 p-1 text-slate-400 hover:text-[#1E3A8A] rounded transition-all"
                          title="Quick edit primary"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </td>

                  {/* Alternatives */}
                  <td className="py-2.5 px-4 text-xs text-slate-500">
                    {alts.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {alts.map((alt, idx) => (
                          <span
                            key={idx}
                            className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium"
                          >
                            {alt}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-300 italic">None</span>
                    )}
                  </td>

                  {/* Action Buttons */}
                  <td className="py-2.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {isCustom && (
                        <button
                          onClick={() => handleResetSinglePair(pair)}
                          title="Reset to default"
                          className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => onOpenEditModal(pair)}
                        className="px-2.5 py-1 text-xs font-semibold text-[#1E3A8A] hover:bg-blue-50 border border-blue-200 rounded-lg transition-all"
                      >
                        Edit All
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
