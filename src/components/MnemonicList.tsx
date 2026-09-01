import React, { useState } from 'react';
import { LetterPairChunk } from '../types/speffz';
import { Edit2, Check, X, Sparkles, BookOpen, AlertCircle, Copy, Target, Plus, Trash2 } from 'lucide-react';

interface MnemonicListProps {
  chunks: LetterPairChunk[];
  onUpdateOverride: (pair: string, customWord: string) => void;
  onSelectAlternative: (pair: string, altWord: string) => void;
  onDeleteWordFromPair?: (pair: string, wordToDelete: string) => void;
  onAddWordToPair?: (pair: string, newWord: string) => void;
  onOpenBlindRecall: () => void;
}

export const MnemonicList: React.FC<MnemonicListProps> = ({
  chunks,
  onUpdateOverride,
  onSelectAlternative,
  onDeleteWordFromPair,
  onAddWordToPair,
  onOpenBlindRecall,
}) => {
  const [editingPair, setEditingPair] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [addingPair, setAddingPair] = useState<string | null>(null);
  const [newWordInput, setNewWordInput] = useState<string>('');
  const [copiedMemo, setCopiedMemo] = useState(false);

  const startEdit = (chunk: LetterPairChunk) => {
    setEditingPair(chunk.pair);
    setEditValue(chunk.mnemonic);
  };

  const saveEdit = (pair: string) => {
    if (editValue.trim()) {
      onUpdateOverride(pair, editValue.trim());
    }
    setEditingPair(null);
  };

  const cancelEdit = () => {
    setEditingPair(null);
    setEditValue('');
  };

  const handleAddWord = (pair: string) => {
    if (newWordInput.trim() && onAddWordToPair) {
      onAddWordToPair(pair, newWordInput.trim());
      setNewWordInput('');
    }
    setAddingPair(null);
  };

  const handleCopyStory = () => {
    if (chunks.length === 0) return;
    const memoStory = chunks.map((c) => c.mnemonic).join(' -> ');
    navigator.clipboard.writeText(memoStory);
    setCopiedMemo(true);
    setTimeout(() => setCopiedMemo(false), 1500);
  };

  if (chunks.length === 0) {
    return (
      <div className="w-full bg-white rounded-3xl p-10 text-center flex flex-col items-center justify-center gap-3 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)]">
        <div className="p-4 bg-blue-50 text-[#1E3A8A] rounded-2xl">
          <BookOpen className="w-8 h-8" />
        </div>
        <h3 className="font-semibold text-lg text-slate-800">No Mnemonic Sequence Yet</h3>
        <p className="text-sm text-slate-500 max-w-md">
          Type Speffz characters into the input or click any colored sticker on the 3D cube above to generate letter pairs and SpeedSolving mnemonics.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#1E3A8A]" />
          <h3 className="font-semibold text-slate-700 text-sm">
            Mnemonic Letter Pairs ({chunks.length})
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenBlindRecall}
            className="min-h-[36px] flex items-center gap-1.5 text-xs font-bold text-white bg-[#1E3A8A] hover:bg-[#1e40af] px-3.5 py-1.5 rounded-xl shadow-sm transition-all"
            title="Start Blind Recall Test"
          >
            <Target className="w-3.5 h-3.5" />
            <span>Test Memory (🎯)</span>
          </button>

          <button
            onClick={handleCopyStory}
            className="min-h-[36px] flex items-center gap-1.5 text-xs font-semibold text-[#1E3A8A] hover:bg-blue-50 border border-blue-200 px-3.5 py-1.5 rounded-xl transition-all"
          >
            {copiedMemo ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy Story</span>
          </button>
        </div>
      </div>

      {/* Grid of letter pair cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {chunks.map((chunk, idx) => {
          const isEditing = editingPair === chunk.pair;
          const isAdding = addingPair === chunk.pair;

          // Combine active mnemonic + all alternatives into a complete list of words for this pair
          const allWords = Array.from(new Set([chunk.mnemonic, ...chunk.alternatives])).filter(Boolean);

          return (
            <div
              key={chunk.id}
              className={`relative bg-white rounded-3xl p-5 transition-all duration-200 flex flex-col justify-between shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] hover:shadow-lg border ${
                chunk.isSingle
                  ? 'border-orange-200 bg-orange-50/20'
                  : 'border-transparent'
              }`}
            >
              <div>
                {/* Card Top Row: Pair & Index */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xl font-bold text-[#1E3A8A] bg-blue-50 px-3 py-1 rounded-xl">
                      {chunk.pair}
                    </span>
                    {chunk.isSingle && (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-orange-700 bg-orange-100 px-2.5 py-0.5 rounded-full">
                        <AlertCircle className="w-3 h-3" />
                        Single / Parity
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-mono text-slate-400 font-semibold">
                    #{idx + 1}
                  </span>
                </div>

                {/* Active Mnemonic Word (Primary) */}
                <div className="my-2">
                  {isEditing ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit(chunk.pair);
                          if (e.key === 'Escape') cancelEdit();
                        }}
                        autoFocus
                        placeholder="Enter primary word..."
                        className="w-full bg-[#F9FAFB] border border-[#1E3A8A] text-[#1E3A8A] font-semibold px-3 py-1.5 text-sm rounded-xl outline-none"
                      />
                      <button
                        onClick={() => saveEdit(chunk.pair)}
                        className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="p-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between group/word">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Active Word:
                        </span>
                        <p className="text-xl font-bold text-slate-900 tracking-tight">
                          {chunk.mnemonic}
                        </p>
                      </div>
                      <button
                        onClick={() => startEdit(chunk)}
                        title="Edit active word"
                        className="opacity-0 group-hover/word:opacity-100 p-1.5 text-slate-400 hover:text-[#1E3A8A] hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Word List for this Pair (with 'x' delete button on each) */}
              <div className="pt-3 mt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500">
                    Word list ({allWords.length}):
                  </span>
                  {!isAdding && (
                    <button
                      onClick={() => setAddingPair(chunk.pair)}
                      className="flex items-center gap-1 text-[11px] font-semibold text-[#1E3A8A] hover:text-blue-700 px-1.5 py-0.5 rounded hover:bg-blue-50 transition-colors"
                      title="Add a new word to this pair"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add word</span>
                    </button>
                  )}
                </div>

                {/* Inline Add Word Input */}
                {isAdding && (
                  <div className="flex items-center gap-1.5 pt-1">
                    <input
                      type="text"
                      value={newWordInput}
                      onChange={(e) => setNewWordInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddWord(chunk.pair);
                        if (e.key === 'Escape') setAddingPair(null);
                      }}
                      autoFocus
                      placeholder="Add word..."
                      className="w-full bg-[#F9FAFB] border border-blue-300 text-xs px-2.5 py-1 rounded-lg outline-none text-[#1E3A8A]"
                    />
                    <button
                      onClick={() => handleAddWord(chunk.pair)}
                      className="p-1 bg-[#1E3A8A] text-white rounded-lg hover:bg-blue-700 transition-colors"
                      title="Add"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setAddingPair(null)}
                      className="p-1 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition-colors"
                      title="Cancel"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Word Badges with 'x' Delete Button */}
                <div className="flex flex-wrap gap-1.5">
                  {allWords.map((word, wIdx) => {
                    const isActive = word.toLowerCase() === chunk.mnemonic.toLowerCase();

                    return (
                      <div
                        key={`${chunk.pair}-${word}-${wIdx}`}
                        className={`inline-flex items-center rounded-lg text-xs font-medium border transition-all ${
                          isActive
                            ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-sm'
                            : 'bg-[#F1F5F9] text-slate-700 border-slate-200 hover:bg-blue-50 hover:text-[#1E3A8A]'
                        }`}
                      >
                        {/* Clicking the word selects it as the active mnemonic */}
                        <button
                          type="button"
                          onClick={() => onSelectAlternative(chunk.pair, word)}
                          title={`Select "${word}" as active word`}
                          className="pl-2.5 pr-1.5 py-1 text-left font-medium outline-none cursor-pointer"
                        >
                          {word}
                        </button>

                        {/* 'x' button to remove word from dictionary */}
                        {onDeleteWordFromPair && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              onDeleteWordFromPair(chunk.pair, word);
                            }}
                            title={`Remove "${word}" from word list`}
                            className={`pr-2 pl-1 py-1 flex items-center justify-center cursor-pointer transition-colors ${
                              isActive
                                ? 'hover:text-red-300 text-blue-200'
                                : 'hover:text-red-600 text-slate-400'
                            }`}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
