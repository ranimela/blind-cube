import React, { useState, useMemo } from 'react';
import { SpeffzMode, SpeffzSticker } from './types/speffz';
import { Header } from './components/Header';
import { CubeViewport } from './components/CubeViewport';
import { SequenceInput } from './components/SequenceInput';
import { TrainingControls } from './components/TrainingControls';
import { MnemonicList } from './components/MnemonicList';
import { ReferenceModal } from './components/ReferenceModal';
import { sanitizeSpeffzSequence, parseAndChunkSequence } from './services/mnemonicService';
import { getSolvedState, generateRandomScramble } from './utils/cubeScrambler';

// Sample drills for quick practice
const SAMPLE_DRILLS = [
  'AB CD EF GH',
  'UB LD FR BK',
  'JA CK PL OT',
  'MK LN QS UV',
  'CR AB DO GT',
  'AC BD EG FH IK JL MO NP QS RT UV WX',
];

export const App: React.FC = () => {
  const [mode, setMode] = useState<SpeffzMode>('full');
  const [sequence, setSequence] = useState<string>('ABCD');
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  const [customOverrides, setCustomOverrides] = useState<Record<string, string>>({});
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Scramble and Cube State Management
  const [scramble, setScramble] = useState<string>('');
  const [stickerColors, setStickerColors] = useState<Record<string, string>>(() => getSolvedState());

  // Parse sequence into letter-pair chunks
  const chunks = useMemo(() => {
    return parseAndChunkSequence(sequence, customOverrides);
  }, [sequence, customOverrides]);

  // Handle sequence change from text input
  const handleSequenceChange = (val: string) => {
    setSequence(sanitizeSpeffzSequence(val));
    setSelectedStickerId(null); // Clear specific tile highlight when typed manually
  };

  // Handle clicking sticker on 3D cube
  const handleStickerClick = (sticker: SpeffzSticker) => {
    if (sticker.letter && sticker.pieceType !== 'center') {
      setSequence((prev) => prev + sticker.letter);
      setSelectedStickerId(sticker.id);
    }
  };

  const handleClear = () => {
    setSequence('');
    setSelectedStickerId(null);
  };

  const handleBackspace = () => {
    setSequence((prev) => prev.slice(0, -1));
    setSelectedStickerId(null);
  };

  const handleSample = () => {
    const randomIndex = Math.floor(Math.random() * SAMPLE_DRILLS.length);
    setSequence(sanitizeSpeffzSequence(SAMPLE_DRILLS[randomIndex]));
    setSelectedStickerId(null);
  };

  const handleScramble = () => {
    const result = generateRandomScramble(20);
    setScramble(result.scramble);
    setStickerColors(result.stickerColors);
  };

  const handleResetScramble = () => {
    setScramble('');
    setStickerColors(getSolvedState());
  };

  const handleUpdateOverride = (pair: string, customWord: string) => {
    setCustomOverrides((prev) => ({
      ...prev,
      [pair.toUpperCase()]: customWord,
    }));
  };

  const handleSelectAlternative = (pair: string, altWord: string) => {
    setCustomOverrides((prev) => ({
      ...prev,
      [pair.toUpperCase()]: altWord,
    }));
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-slate-800 flex flex-col antialiased">
      <Header
        mode={mode}
        onModeChange={setMode}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 py-8 space-y-8">
        {/* Top Section: Training Scramble Controls */}
        <section>
          <TrainingControls
            scramble={scramble}
            onScramble={handleScramble}
            onReset={handleResetScramble}
          />
        </section>

        {/* 3D Cube Canvas */}
        <section>
          <CubeViewport
            mode={mode}
            activeSequence={sequence}
            selectedStickerId={selectedStickerId}
            stickerColors={stickerColors}
            onStickerClick={handleStickerClick}
          />
        </section>

        {/* Middle Section: Sequence Input Bar */}
        <section>
          <SequenceInput
            sequence={sequence}
            onChange={handleSequenceChange}
            onClear={handleClear}
            onBackspace={handleBackspace}
            onSample={handleSample}
            onOpenHelp={() => setIsHelpOpen(true)}
          />
        </section>

        {/* Bottom Section: Mnemonic Letter Pairs */}
        <section>
          <MnemonicList
            chunks={chunks}
            onUpdateOverride={handleUpdateOverride}
            onSelectAlternative={handleSelectAlternative}
          />
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
        3BLD Speffz Cube & SpeedSolving Mnemonic Generator • Phase 1
      </footer>

      {/* Reference Modal */}
      <ReferenceModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
};

export default App;
