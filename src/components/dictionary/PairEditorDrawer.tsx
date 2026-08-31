import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Check } from 'lucide-react';

interface PairEditorDrawerProps {
  pair: string;
  words: string[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (pair: string, words: string[]) => void;
}

export const PairEditorDrawer: React.FC<PairEditorDrawerProps> = ({
  pair,
  words,
  isOpen,
  onClose,
  onSave,
}) => {
  const [primaryWord, setPrimaryWord] = useState('');
  const [alternatives, setAlternatives] = useState<string[]>([]);
  const [newAlt, setNewAlt] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPrimaryWord(words[0] || '');
      setAlternatives(words.slice(1));
      setNewAlt('');
    }
  }, [isOpen, words]);

  if (!isOpen) return null;

  const handleAddAlt = () => {
    const trimmed = newAlt.trim();
    if (trimmed && !alternatives.includes(trimmed) && trimmed !== primaryWord.trim()) {
      setAlternatives((prev) => [...prev, trimmed]);
      setNewAlt('');
    }
  };

  const handleRemoveAlt = (indexToRemove: number) => {
    setAlternatives((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSave = () => {
    const cleanPrimary = primaryWord.trim();
    if (!cleanPrimary) return;

    const allWords = [cleanPrimary, ...alternatives.filter((a) => a.trim().length > 0)];
    onSave(pair, allWords);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6 relative border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <span className="font-mono text-2xl font-black text-[#1E3A8A] bg-blue-50 px-3.5 py-1 rounded-2xl">
              {pair}
            </span>
            <div>
              <h3 className="font-semibold text-lg text-slate-800">Edit Pair Words</h3>
              <p className="text-xs text-slate-500">Configure primary mnemonic and synonyms</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Word */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
            Primary Word (Default Mnemonic)
          </label>
          <input
            type="text"
            value={primaryWord}
            onChange={(e) => setPrimaryWord(e.target.value)}
            placeholder="e.g. Apple"
            className="w-full min-h-[48px] px-4 rounded-xl border border-slate-200 focus:border-[#1E3A8A] focus:ring-2 focus:ring-blue-100 outline-none text-slate-800 font-semibold transition-all"
            autoFocus
          />
        </div>

        {/* Alternatives */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
            Alternative Suggestions ({alternatives.length})
          </label>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newAlt}
              onChange={(e) => setNewAlt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddAlt();
                }
              }}
              placeholder="Add synonym or alternative..."
              className="flex-1 min-h-[44px] px-3.5 rounded-xl border border-slate-200 focus:border-[#1E3A8A] text-sm outline-none text-slate-800"
            />
            <button
              type="button"
              onClick={handleAddAlt}
              className="min-h-[44px] px-4 bg-blue-50 hover:bg-blue-100 text-[#1E3A8A] font-semibold text-xs rounded-xl flex items-center gap-1 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>

          <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
            {alternatives.map((alt, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 text-sm font-medium text-slate-700"
              >
                <span>{alt}</span>
                <button
                  onClick={() => handleRemoveAlt(idx)}
                  className="text-slate-400 hover:text-red-600 p-1 rounded-lg transition-colors"
                  title="Remove alternative"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {alternatives.length === 0 && (
              <p className="text-xs text-slate-400 italic py-2">No alternatives defined yet.</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="min-h-[44px] px-5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!primaryWord.trim()}
            className="min-h-[44px] px-6 bg-[#1E3A8A] hover:bg-[#1e40af] disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-sm flex items-center gap-2 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Save Pair</span>
          </button>
        </div>
      </div>
    </div>
  );
};
