import React, { useState } from 'react';
import { LetterPairChunk } from '../types/speffz';
import { Edit2, Check, X, Sparkles, BookOpen, AlertCircle, Copy } from 'lucide-react';

interface MnemonicListProps {
  chunks: LetterPairChunk[];
  onUpdateOverride: (pair: string, customWord: string) => void;
  onSelectAlternative: (pair: string, altWord: string) => void;
}

export const MnemonicList: React.FC<MnemonicListProps> = ({
  chunks,
  onUpdateOverride,
  onSelectAlternative,
}) => {
  const [editingPair, setEditingPair] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
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

  const handleCopyStory = () => {
    if (chunks.length === 0) return;
    const memoStory = chunks.map((c) => c.mnemonic).join(' -> ');
    navigator.clipboard.writeText(memoStory);
    setCopiedMemo(true);
    setTimeout(() => setCopiedMemo(false), 1500);
  };

  if (chunks.length === 0) {
    return (
      <div className="w-full bg-slate-900/60 border border-slate-800/80 rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-3">
        <div className="p-3 bg-slate-800/60 rounded-2xl text-slate-500">
          <BookOpen className="w-8 h-8" />
        </div>
        <h3 className="font-semibold text-slate-300">No Mnemonic Sequence Yet</h3>
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
          <Sparkles className="w-4 h-4 text-sky-400" />
          <h3 className="font-semibold text-slate-200 text-sm">
            Mnemonic Letter Pairs ({chunks.length})
          </h3>
        </div>

        <button
          onClick={handleCopyStory}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700/80 border border-slate-700 px-3 py-1.5 rounded-lg transition-all"
        >
          {copiedMemo ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>Copy Story</span>
        </button>
      </div>

      {/* Grid of letter pair cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {chunks.map((chunk, idx) => {
          const isEditing = editingPair === chunk.pair;

          return (
            <div
              key={chunk.id}
              className={`relative bg-slate-900/90 border rounded-xl p-4 transition-all duration-200 flex flex-col justify-between shadow-lg hover:border-slate-700 ${
                chunk.isSingle
                  ? 'border-amber-500/40 bg-gradient-to-br from-slate-900 to-amber-950/20'
                  : 'border-slate-800'
              }`}
            >
              <div>
                {/* Card Top Row: Pair & Index */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xl font-black text-sky-400 bg-sky-950/80 border border-sky-800/60 px-2.5 py-0.5 rounded-lg">
                      {chunk.pair}
                    </span>
                    {chunk.isSingle && (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-950/70 border border-amber-800/60 px-2 py-0.5 rounded-md">
                        <AlertCircle className="w-3 h-3" />
                        Single / Parity
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-mono text-slate-500 font-semibold">
                    #{idx + 1}
                  </span>
                </div>

                {/* Main Mnemonic Word */}
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
                        className="w-full bg-slate-950 border border-sky-500 text-sky-300 font-semibold px-2.5 py-1 text-sm rounded-lg outline-none"
                      />
                      <button
                        onClick={() => saveEdit(chunk.pair)}
                        className="p-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between group/word">
                      <p className="text-lg font-bold text-slate-100 tracking-tight">
                        {chunk.mnemonic}
                      </p>
                      <button
                        onClick={() => startEdit(chunk)}
                        title="Customize mnemonic word"
                        className="opacity-0 group-hover/word:opacity-100 p-1 text-slate-400 hover:text-sky-400 transition-opacity"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Alternative Suggestions */}
              {chunk.alternatives.length > 0 && !isEditing && (
                <div className="pt-2 mt-2 border-t border-slate-800/80">
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 block mb-1.5">
                    Alternatives:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {chunk.alternatives.map((alt, aIdx) => (
                      <button
                        key={aIdx}
                        onClick={() => onSelectAlternative(chunk.pair, alt)}
                        className="text-xs bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 px-2 py-0.5 rounded-md border border-slate-700/50 transition-colors"
                      >
                        {alt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
