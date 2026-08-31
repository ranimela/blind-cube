import React, { useState } from 'react';
import { Dices, RotateCcw, Copy, Check } from 'lucide-react';

interface TrainingControlsProps {
  scramble: string;
  onScramble: () => void;
  onReset: () => void;
}

export const TrainingControls: React.FC<TrainingControlsProps> = ({
  scramble,
  onScramble,
  onReset,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!scramble) return;
    try {
      await navigator.clipboard.writeText(scramble);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback if clipboard API fails
      const textarea = document.createElement('textarea');
      textarea.value = scramble;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full bg-white rounded-3xl p-6 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] border border-slate-100/80 transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Scramble Generator & Reset Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onScramble}
            className="flex items-center gap-2.5 px-6 min-h-[48px] bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold rounded-xl shadow-sm hover:shadow-md transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            title="Generate a new random WCA scramble"
          >
            <Dices className="w-5 h-5 text-emerald-100" />
            <span>Scramble Cube</span>
          </button>

          <button
            onClick={onReset}
            className="flex items-center gap-2 px-5 min-h-[48px] bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-700 font-medium rounded-xl border border-slate-200 transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-slate-300"
            title="Reset cube to solved state"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
            <span>Reset to Solved</span>
          </button>
        </div>

        {/* Active Scramble Notation Display */}
        <div className="flex-1 min-w-[280px]">
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 select-none">
                Scramble
              </span>
              <span className="font-mono text-xs md:text-sm font-semibold text-slate-800 truncate select-all">
                {scramble || 'Solved (No Scramble Applied)'}
              </span>
            </div>

            {scramble && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-[#1E3A8A] bg-white hover:bg-slate-100 rounded-lg shadow-sm border border-slate-200 transition-all active:scale-95 flex-shrink-0"
                title="Copy scramble notation to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
