import React, { useMemo } from 'react';
import { MnemonicDictionary } from '../../types/speffz';
import { SPEFFZ_LETTERS, getDefaultDictionary } from '../../services/dictionaryStorage';

interface MatrixGridViewProps {
  dict: MnemonicDictionary;
  onSelectPair: (pair: string) => void;
}

export const MatrixGridView: React.FC<MatrixGridViewProps> = ({
  dict,
  onSelectPair,
}) => {
  const defaultDict = useMemo(() => getDefaultDictionary(), []);

  return (
    <div className="w-full space-y-4">
      {/* Legend & Summary Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-blue-50 border border-blue-200" />
            <span>Default 576 Pair</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-emerald-500 text-white" />
            <span className="font-semibold text-emerald-800">Customized Pair</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-slate-200" />
            <span>Diagonal (Same Letter)</span>
          </div>
        </div>
        <span className="font-medium text-slate-500">
          Click any cell to edit pair mnemonic
        </span>
      </div>

      {/* Grid Container */}
      <div className="overflow-x-auto overflow-y-auto max-h-[520px] rounded-2xl border border-slate-200 shadow-inner bg-white">
        <table className="border-collapse table-fixed select-none text-[11px]">
          <thead className="sticky top-0 z-20 bg-slate-100 shadow-sm">
            <tr>
              <th className="w-10 h-8 bg-slate-200 text-slate-700 font-bold border border-slate-300 sticky left-0 z-30">
                1st\2nd
              </th>
              {SPEFFZ_LETTERS.map((l2) => (
                <th
                  key={l2}
                  className="w-12 h-8 font-black text-slate-700 border border-slate-300 text-center bg-slate-100"
                >
                  {l2}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SPEFFZ_LETTERS.map((l1) => (
              <tr key={l1} className="hover:bg-slate-50/50">
                {/* Row Header (1st Letter) */}
                <th className="w-10 h-9 font-black text-slate-700 border border-slate-300 text-center sticky left-0 z-10 bg-slate-100">
                  {l1}
                </th>
                {SPEFFZ_LETTERS.map((l2) => {
                  const pair = l1 + l2;
                  const isDiagonal = l1 === l2;
                  const words = dict[pair] || [];
                  const defaultWords = defaultDict[pair] || [];
                  const primaryWord = words[0] || '';
                  
                  // Check if customized
                  const isCustomized =
                    JSON.stringify(words) !== JSON.stringify(defaultWords);

                  let cellBg = 'bg-white hover:bg-blue-100 text-slate-800';
                  if (isCustomized) {
                    cellBg = 'bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-sm';
                  } else if (isDiagonal) {
                    cellBg = 'bg-slate-100/80 text-slate-500 hover:bg-slate-200';
                  }

                  return (
                    <td
                      key={pair}
                      onClick={() => onSelectPair(pair)}
                      title={`${pair}: ${primaryWord} ${isCustomized ? '(Customized)' : ''}`}
                      className={`w-12 h-9 border border-slate-200 text-center cursor-pointer transition-all duration-150 p-0.5 overflow-hidden ${cellBg}`}
                    >
                      <div className="flex flex-col items-center justify-center h-full">
                        <span className="text-[10px] font-black leading-tight">
                          {pair}
                        </span>
                        <span className="text-[9px] truncate max-w-[44px] opacity-90 font-medium">
                          {primaryWord}
                        </span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
