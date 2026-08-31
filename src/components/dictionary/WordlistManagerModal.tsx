import React, { useState } from 'react';
import { MnemonicDictionary } from '../../types/speffz';
import { MatrixGridView } from './MatrixGridView';
import { WordlistTable } from './WordlistTable';
import { ImportExportPanel } from './ImportExportPanel';
import { PairEditorDrawer } from './PairEditorDrawer';
import { X, Grid, List, DownloadCloud, BookOpen } from 'lucide-react';

interface WordlistManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  dict: MnemonicDictionary;
  onUpdateDictionary: (newDict: MnemonicDictionary) => void;
}

type TabType = 'matrix' | 'table' | 'import_export';

export const WordlistManagerModal: React.FC<WordlistManagerModalProps> = ({
  isOpen,
  onClose,
  dict,
  onUpdateDictionary,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('matrix');
  const [selectedPairForEdit, setSelectedPairForEdit] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectPair = (pair: string) => {
    setSelectedPairForEdit(pair);
  };

  const handleSavePairWords = (pair: string, words: string[]) => {
    const updated = {
      ...dict,
      [pair.toUpperCase()]: words,
    };
    onUpdateDictionary(updated);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-3xl max-w-5xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-[#1E3A8A] rounded-2xl">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                Speffz Wordlist Manager
              </h2>
              <p className="text-xs text-slate-500">
                Explore, customize, and export all 576 Speffz letter-pair mnemonics
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

        {/* Tab Navigation */}
        <div className="flex items-center bg-[#F1F5F9] p-1.5 rounded-2xl gap-1.5 shrink-0">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`flex-1 min-h-[40px] px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'matrix'
                ? 'bg-white text-[#1E3A8A] shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>24×24 Matrix Grid</span>
          </button>

          <button
            onClick={() => setActiveTab('table')}
            className={`flex-1 min-h-[40px] px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'table'
                ? 'bg-white text-[#1E3A8A] shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <List className="w-4 h-4" />
            <span>Search & Edit Table</span>
          </button>

          <button
            onClick={() => setActiveTab('import_export')}
            className={`flex-1 min-h-[40px] px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'import_export'
                ? 'bg-white text-[#1E3A8A] shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <DownloadCloud className="w-4 h-4" />
            <span>Import / Export</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto pr-1">
          {activeTab === 'matrix' && (
            <MatrixGridView
              dict={dict}
              onSelectPair={handleSelectPair}
            />
          )}

          {activeTab === 'table' && (
            <WordlistTable
              dict={dict}
              onUpdatePair={handleSavePairWords}
              onOpenEditModal={handleSelectPair}
            />
          )}

          {activeTab === 'import_export' && (
            <ImportExportPanel
              dict={dict}
              onDictionaryChange={onUpdateDictionary}
            />
          )}
        </div>

        {/* Pair Editor Drawer / Modal */}
        {selectedPairForEdit && (
          <PairEditorDrawer
            pair={selectedPairForEdit}
            words={dict[selectedPairForEdit] || []}
            isOpen={Boolean(selectedPairForEdit)}
            onClose={() => setSelectedPairForEdit(null)}
            onSave={handleSavePairWords}
          />
        )}
      </div>
    </div>
  );
};
