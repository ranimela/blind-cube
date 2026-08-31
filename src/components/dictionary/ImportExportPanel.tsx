import React, { useState, useRef } from 'react';
import { MnemonicDictionary } from '../../types/speffz';
import {
  exportDictionaryToJSON,
  importDictionaryFromJSON,
  exportDictionaryToCSV,
  importDictionaryFromCSV,
  resetDictionary,
} from '../../services/dictionaryStorage';
import { Upload, RotateCcw, CheckCircle, AlertCircle, FileText, FileCode } from 'lucide-react';

interface ImportExportPanelProps {
  dict: MnemonicDictionary;
  onDictionaryChange: (newDict: MnemonicDictionary) => void;
}

export const ImportExportPanel: React.FC<ImportExportPanelProps> = ({
  dict,
  onDictionaryChange,
}) => {
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const jsonFileInputRef = useRef<HTMLInputElement>(null);
  const csvFileInputRef = useRef<HTMLInputElement>(null);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleExportJSON = () => {
    const jsonStr = exportDictionaryToJSON(dict);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `speffz_wordlist_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showFeedback('success', 'JSON wordlist exported successfully!');
  };

  const handleExportCSV = () => {
    const csvStr = exportDictionaryToCSV(dict);
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `speffz_wordlist_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showFeedback('success', 'CSV wordlist exported successfully!');
  };

  const handleImportJSONFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = importDictionaryFromJSON(content, dict);
      if (result.success && result.dict) {
        onDictionaryChange(result.dict);
        showFeedback('success', 'Custom wordlist JSON imported and merged successfully!');
      } else {
        showFeedback('error', result.error || 'Failed to import JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // reset file input
  };

  const handleImportCSVFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = importDictionaryFromCSV(content, dict);
      if (result.success && result.dict) {
        onDictionaryChange(result.dict);
        showFeedback('success', 'Custom wordlist CSV imported and merged successfully!');
      } else {
        showFeedback('error', result.error || 'Failed to import CSV file.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // reset file input
  };

  const handleResetToDefault = () => {
    if (window.confirm('Are you sure you want to reset all pairs to the default SpeedSolving 576 wordlist? Any custom modifications will be lost.')) {
      const defaultDict = resetDictionary();
      onDictionaryChange(defaultDict);
      showFeedback('success', 'Dictionary restored to default 576 wordlist!');
    }
  };

  return (
    <div className="w-full space-y-6 max-w-3xl mx-auto py-2">
      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`flex items-center gap-2.5 p-4 rounded-2xl text-sm font-medium transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        type="file"
        ref={jsonFileInputRef}
        onChange={handleImportJSONFile}
        accept=".json,application/json"
        className="hidden"
      />
      <input
        type="file"
        ref={csvFileInputRef}
        onChange={handleImportCSVFile}
        accept=".csv,text/csv"
        className="hidden"
      />

      {/* Export Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] space-y-4">
        <div>
          <h4 className="font-semibold text-slate-800 text-base">Export Wordlist</h4>
          <p className="text-xs text-slate-500">
            Download your current active wordlist to backup or share your personalized Speffz associations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleExportJSON}
            className="min-h-[48px] px-5 bg-[#1E3A8A] hover:bg-[#1e40af] text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <FileCode className="w-4 h-4" />
            <span>Export JSON (.json)</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="min-h-[48px] px-5 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <FileText className="w-4 h-4" />
            <span>Export CSV (.csv)</span>
          </button>
        </div>
      </div>

      {/* Import Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] space-y-4">
        <div>
          <h4 className="font-semibold text-slate-800 text-base">Import Wordlist</h4>
          <p className="text-xs text-slate-500">
            Load an existing JSON mapping or spreadsheet CSV (format: <code className="font-mono text-[11px] bg-slate-100 px-1 py-0.5 rounded">Pair,Primary,Alternatives</code>).
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => jsonFileInputRef.current?.click()}
            className="min-h-[48px] px-5 border border-[#1E3A8A] text-[#1E3A8A] hover:bg-blue-50 font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Import JSON File</span>
          </button>

          <button
            onClick={() => csvFileInputRef.current?.click()}
            className="min-h-[48px] px-5 border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Import CSV File</span>
          </button>
        </div>
      </div>

      {/* Danger Zone: Reset Section */}
      <div className="bg-orange-50/40 rounded-3xl p-6 border border-orange-100 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-orange-100 text-orange-700 rounded-xl mt-0.5">
            <RotateCcw className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-800 text-sm">Reset to Default Wordlist</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Revert all 576 pairs back to the factory SpeedSolving standard dictionary and wipe local storage custom entries.
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleResetToDefault}
            className="min-h-[44px] px-5 bg-white hover:bg-red-50 border border-red-200 text-red-600 font-semibold text-xs rounded-xl shadow-sm transition-all"
          >
            Restore Default Wordlist
          </button>
        </div>
      </div>
    </div>
  );
};
