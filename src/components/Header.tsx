import React from 'react';
import { SpeffzMode } from '../types/speffz';
import { Box, Layers, HelpCircle } from 'lucide-react';

interface HeaderProps {
  mode: SpeffzMode;
  onModeChange: (mode: SpeffzMode) => void;
  onOpenHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  onModeChange,
  onOpenHelp,
}) => {
  return (
    <header className="w-full bg-[#1E3A8A] text-white shadow-md sticky top-0 z-30">
      <div className="max-w-[1200px] mx-auto px-4 py-3.5 flex items-center justify-between">
        {/* Branding */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm text-white font-black shadow-sm">
            <Box className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-white text-xl tracking-tight">
                Blind Cube Tool
              </h1>
            </div>
            <p className="text-xs text-blue-100/80">
              Interactive 3D Letter Overlay & SpeedSolving Mnemonic Memo
            </p>
          </div>
        </div>

        {/* Mode Selector & Help */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white/10 p-1 rounded-xl backdrop-blur-sm">
            <button
              onClick={() => onModeChange('full')}
              className={`min-h-[38px] px-3.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                mode === 'full'
                  ? 'bg-white text-[#1E3A8A] shadow-sm font-bold'
                  : 'text-blue-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Full</span>
            </button>
            <button
              onClick={() => onModeChange('corners')}
              className={`min-h-[38px] px-3.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                mode === 'corners'
                  ? 'bg-white text-[#1E3A8A] shadow-sm font-bold'
                  : 'text-blue-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>Corners</span>
            </button>
            <button
              onClick={() => onModeChange('edges')}
              className={`min-h-[38px] px-3.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                mode === 'edges'
                  ? 'bg-white text-[#1E3A8A] shadow-sm font-bold'
                  : 'text-blue-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>Edges</span>
            </button>
          </div>

          <button
            onClick={onOpenHelp}
            className="w-10 h-10 flex items-center justify-center text-blue-100 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            title="Speffz Reference Sheet"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
