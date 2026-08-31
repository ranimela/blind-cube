import React, { useState, useEffect, useRef } from 'react';
import { LetterPairChunk } from '../types/speffz';
import { X, Play, RotateCcw, Award, CheckCircle2, XCircle, Clock, ChevronRight, EyeOff } from 'lucide-react';

export type RecallState = 'memorizing' | 'testing' | 'results';

export interface RecallResultItem {
  pair: string;
  expectedWord: string;
  input: string;
  isCorrect: boolean;
}

export interface BlindRecallScore {
  total: number;
  correct: number;
  accuracyPct: number;
  elapsedSeconds: number;
  items: RecallResultItem[];
}

/**
 * Pure scoring function to evaluate blind recall attempts.
 */
export function calculateRecallScore(
  chunks: LetterPairChunk[],
  inputs: string[],
  elapsedSeconds: number
): BlindRecallScore {
  const total = chunks.length;
  const items: RecallResultItem[] = chunks.map((chunk, idx) => {
    const inputVal = (inputs[idx] || '').trim();
    const expectedWord = chunk.mnemonic.trim();

    // Match criteria:
    // 1. Case-insensitive exact match with primary mnemonic
    // 2. Or exact match with pair letters (e.g. user typed "AB" or "Ab")
    // 3. Or case-insensitive match with any alternative word
    const isWordMatch = inputVal.toLowerCase() === expectedWord.toLowerCase();
    const isPairMatch = inputVal.toUpperCase() === chunk.pair.toUpperCase();
    const isAltMatch = chunk.alternatives.some(
      (alt) => alt.toLowerCase() === inputVal.toLowerCase()
    );

    const isCorrect = isWordMatch || isPairMatch || isAltMatch;

    return {
      pair: chunk.pair,
      expectedWord,
      input: inputVal,
      isCorrect,
    };
  });

  const correct = items.filter((item) => item.isCorrect).length;
  const accuracyPct = total > 0 ? Math.round((correct / total) * 100) : 0;

  return {
    total,
    correct,
    accuracyPct,
    elapsedSeconds,
    items,
  };
}

interface BlindRecallTestProps {
  isOpen: boolean;
  onClose: () => void;
  chunks: LetterPairChunk[];
}

export const BlindRecallTest: React.FC<BlindRecallTestProps> = ({
  isOpen,
  onClose,
  chunks,
}) => {
  const [phase, setPhase] = useState<RecallState>('memorizing');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInputs, setUserInputs] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const timerRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize test state when modal opens
  useEffect(() => {
    if (isOpen) {
      setPhase('memorizing');
      setCurrentIndex(0);
      setUserInputs([]);
      setCurrentInput('');
      setElapsedSeconds(0);
      setIsTimerRunning(false);
    }
  }, [isOpen, chunks]);

  // Timer loop during testing phase
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = window.setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  // Global key listener for spacebar in memorizing phase
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (phase === 'memorizing' && (e.code === 'Space' || e.key === ' ')) {
        e.preventDefault();
        handleStartTest();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, phase]);

  // Focus input automatically during testing
  useEffect(() => {
    if (phase === 'testing') {
      inputRef.current?.focus();
    }
  }, [phase, currentIndex]);

  if (!isOpen) return null;

  const handleStartTest = () => {
    if (chunks.length === 0) return;
    setPhase('testing');
    setCurrentIndex(0);
    setUserInputs([]);
    setCurrentInput('');
    setElapsedSeconds(0);
    setIsTimerRunning(true);
  };

  const handleNextCard = () => {
    const nextInputs = [...userInputs, currentInput];
    setUserInputs(nextInputs);
    setCurrentInput('');

    if (currentIndex + 1 < chunks.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Completed all cards
      setIsTimerRunning(false);
      setPhase('results');
    }
  };

  const handleRetry = () => {
    setPhase('memorizing');
    setCurrentIndex(0);
    setUserInputs([]);
    setCurrentInput('');
    setElapsedSeconds(0);
    setIsTimerRunning(false);
  };

  const score = calculateRecallScore(chunks, userInputs, elapsedSeconds);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative border border-slate-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-[#1E3A8A] rounded-2xl">
              <EyeOff className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                Blind Recall Memory Test
              </h2>
              <p className="text-xs text-slate-500">
                Test your mnemonic retention under blind speed conditions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Phase 1: Memorizing */}
        {phase === 'memorizing' && (
          <div className="py-8 text-center space-y-6">
            <div className="max-w-md mx-auto space-y-2">
              <span className="inline-block px-3 py-1 bg-blue-50 text-[#1E3A8A] text-xs font-bold rounded-full">
                {chunks.length} {chunks.length === 1 ? 'Pair' : 'Pairs'} in Current Sequence
              </span>
              <h3 className="text-2xl font-bold text-slate-900">
                Ready to Test Your Memory?
              </h3>
              <p className="text-sm text-slate-500">
                Memorize your story sequence now. Once you start, words and letters will be hidden, and you will recall each pair one by one.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <button
                onClick={handleStartTest}
                className="w-full sm:w-auto min-h-[48px] px-8 bg-[#1E3A8A] hover:bg-[#1e40af] text-white font-bold text-base rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>Start Blind Recall Test</span>
              </button>
            </div>

            <p className="text-xs text-slate-400 font-medium">
              Tip: You can also press <kbd className="px-2 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono text-[11px] text-slate-600">Space</kbd> to begin.
            </p>
          </div>
        )}

        {/* Phase 2: Testing */}
        {phase === 'testing' && (
          <div className="py-6 space-y-6">
            {/* Top Bar: Progress & Timer */}
            <div className="flex items-center justify-between bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">
              <div className="text-xs font-bold text-slate-700">
                Card <span className="text-[#1E3A8A] text-sm">{currentIndex + 1}</span> of {chunks.length}
              </div>
              <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-slate-600">
                <Clock className="w-4 h-4 text-[#1E3A8A]" />
                <span>{elapsedSeconds}s</span>
              </div>
            </div>

            {/* Prompt Box */}
            <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-8 text-center space-y-4 shadow-sm">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-white border border-blue-200 flex items-center justify-center text-[#1E3A8A] font-mono text-2xl font-black shadow-sm">
                ? ?
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-800">
                  Recall Pair #{currentIndex + 1}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Type the mnemonic word (e.g. "{chunks[currentIndex]?.mnemonic}") or pair letters:
                </p>
              </div>

              <div className="max-w-xs mx-auto">
                <input
                  ref={inputRef}
                  type="text"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleNextCard();
                    }
                  }}
                  placeholder="Type word or pair..."
                  className="w-full min-h-[48px] px-4 text-center rounded-xl border border-slate-300 focus:border-[#1E3A8A] focus:ring-2 focus:ring-blue-100 outline-none text-base font-semibold text-slate-800 transition-all bg-white"
                  autoFocus
                />
              </div>
            </div>

            {/* Next Card Button */}
            <div className="flex justify-end">
              <button
                onClick={handleNextCard}
                className="min-h-[48px] px-6 bg-[#1E3A8A] hover:bg-[#1e40af] text-white font-bold text-sm rounded-xl shadow-sm flex items-center gap-2 transition-all"
              >
                <span>{currentIndex + 1 === chunks.length ? 'Finish Test' : 'Next Pair'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Phase 3: Results */}
        {phase === 'results' && (
          <div className="py-2 space-y-6">
            {/* Score Banner */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 p-6 rounded-3xl border border-blue-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white text-[#1E3A8A] rounded-2xl shadow-sm border border-blue-100">
                  <Award className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    Accuracy: {score.accuracyPct}%
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {score.correct} / {score.total} pairs recalled correctly in {score.elapsedSeconds} seconds
                  </p>
                </div>
              </div>
            </div>

            {/* Side-by-side Diff Table */}
            <div className="max-h-64 overflow-y-auto rounded-2xl border border-slate-200 shadow-inner bg-white">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-[#F1F5F9] text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3.5 w-16">Pair</th>
                    <th className="py-2.5 px-3.5">Expected Word</th>
                    <th className="py-2.5 px-3.5">Your Input</th>
                    <th className="py-2.5 px-3.5 w-20 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {score.items.map((item, idx) => (
                    <tr
                      key={idx}
                      className={item.isCorrect ? 'hover:bg-slate-50' : 'bg-red-50/30 hover:bg-red-50/50'}
                    >
                      <td className="py-2 px-3.5 font-mono font-bold text-[#1E3A8A]">
                        {item.pair}
                      </td>
                      <td className="py-2 px-3.5 text-slate-800 font-semibold">
                        {item.expectedWord}
                      </td>
                      <td className="py-2 px-3.5 text-slate-600">
                        {item.input || <span className="text-slate-300 italic">(blank)</span>}
                      </td>
                      <td className="py-2 px-3.5 text-center">
                        {item.isCorrect ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            Pass
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-600 font-bold">
                            <XCircle className="w-4 h-4 text-red-500" />
                            Miss
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleRetry}
                className="min-h-[44px] px-5 border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retry Test</span>
              </button>

              <button
                onClick={onClose}
                className="min-h-[44px] px-6 bg-[#1E3A8A] hover:bg-[#1e40af] text-white font-bold text-xs rounded-xl shadow-sm transition-all"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
