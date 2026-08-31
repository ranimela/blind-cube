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
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-5 shadow-xl space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
          <span>Speffz Sequence Input</span>
          <span className="text-xs font-normal text-slate-500">
            ({sequence.length} letters • {Math.ceil(sequence.length / 2)} targets)
          </span>
        </label>

        <div className="flex items-center gap-2">
          <button
            onClick={onSample}
            type="button"
            className="flex items-center gap-1 text-xs font-medium text-sky-400 hover:text-sky-300 bg-sky-950/60 hover:bg-sky-900/80 border border-sky-800/60 px-2.5 py-1 rounded-lg transition-all"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Random Drill</span>
          </button>
          <button
            onClick={onOpenHelp}
            type="button"
            title="Speffz Reference Sheet"
            className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Input Display */}
      <div className="relative flex items-center">
        <input
          type="text"
          value={sequence}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Click cube stickers or type Speffz letters (A-X)..."
          className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 rounded-xl px-4 py-3.5 font-mono text-lg md:text-xl font-bold tracking-widest uppercase text-sky-300 placeholder:text-slate-600 placeholder:normal-case placeholder:tracking-normal placeholder:text-sm transition-all outline-none pr-32"
        />

        {/* Action button cluster inside input */}
        <div className="absolute right-2.5 flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            disabled={!sequence}
            type="button"
            title="Copy Sequence"
            className="p-2 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 rounded-lg hover:bg-slate-800/80 transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            onClick={onBackspace}
            disabled={!sequence}
            type="button"
            title="Backspace"
            className="p-2 text-slate-400 hover:text-amber-400 disabled:opacity-30 disabled:hover:text-slate-400 rounded-lg hover:bg-slate-800/80 transition-all"
          >
            <Delete className="w-4 h-4" />
          </button>
          <button
            onClick={onClear}
            disabled={!sequence}
            type="button"
            title="Clear all"
            className="p-2 text-slate-400 hover:text-rose-400 disabled:opacity-30 disabled:hover:text-slate-400 rounded-lg hover:bg-slate-800/80 transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
