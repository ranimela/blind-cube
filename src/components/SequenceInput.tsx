import React from 'react';
import { Delete, Trash2, HelpCircle, Shuffle, Copy, Check } from 'lucide-react';

interface SequenceInputProps {
  sequence: string;
  onChange: (val: string) => void;
  onClear: () => void;
  onBackspace: () => void;
  onSample: () => void;
  onOpenHelp: () => void;
}

export const SequenceInput: React.FC<SequenceInputProps> = ({
  sequence,
  onChange,
  onClear,
  onBackspace,
  onSample,
  onOpenHelp,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (!sequence) return;
    navigator.clipboard.writeText(sequence);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="w-full bg-white rounded-3xl p-6 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-[#1E3A8A] flex items-center gap-2">
          <span>Speffz Sequence Input</span>
          <span className="text-xs font-normal text-slate-400">
            ({sequence.length} letters • {Math.ceil(sequence.length / 2)} targets)
          </span>
        </label>

        <div className="flex items-center gap-2">
          <button
            onClick={onSample}
            type="button"
            className="min-h-[36px] flex items-center gap-1.5 text-xs font-semibold text-[#1E3A8A] hover:bg-blue-50 border border-blue-200 px-3.5 py-1.5 rounded-xl transition-all"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Random Drill</span>
          </button>
          <button
            onClick={onOpenHelp}
            type="button"
            title="Speffz Reference Sheet"
            className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-[#1E3A8A] hover:bg-slate-100 rounded-xl transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Input Display with 56px height per design.md */}
      <div className="relative flex items-center">
        <input
          type="text"
          value={sequence}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Click cube stickers or type Speffz letters (A-X)..."
          className="w-full h-[56px] bg-[#F9FAFB] border border-slate-200 focus:border-[#1E3A8A] focus:bg-white focus:ring-2 focus:ring-blue-100 rounded-2xl px-5 font-mono text-lg md:text-xl font-bold tracking-widest uppercase text-[#1E3A8A] placeholder:text-slate-400 placeholder:normal-case placeholder:tracking-normal placeholder:text-sm transition-all outline-none pr-36"
        />

        {/* Action buttons inside input */}
        <div className="absolute right-2 flex items-center gap-1">
          <button
            onClick={handleCopy}
            disabled={!sequence}
            type="button"
            title="Copy Sequence"
            className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-[#1E3A8A] hover:bg-slate-100 disabled:opacity-25 rounded-xl transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            onClick={onBackspace}
            disabled={!sequence}
            type="button"
            title="Backspace"
            className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-orange-500 hover:bg-orange-50 disabled:opacity-25 rounded-xl transition-all"
          >
            <Delete className="w-4 h-4" />
          </button>
          <button
            onClick={onClear}
            disabled={!sequence}
            type="button"
            title="Clear all"
            className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-25 rounded-xl transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
