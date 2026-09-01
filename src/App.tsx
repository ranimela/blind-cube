import React, { useState, useMemo } from 'react';
import { SpeffzMode, SpeffzSticker, MnemonicDictionary } from './types/speffz';
import { Header } from './components/Header';
import { CubeViewport } from './components/CubeViewport';
import { SequenceInput } from './components/SequenceInput';
import { TrainingControls } from './components/TrainingControls';
import { MnemonicList } from './components/MnemonicList';
import { ReferenceModal } from './components/ReferenceModal';
import { BlindRecallTest } from './components/BlindRecallTest';
import { WordlistManagerModal } from './components/dictionary/WordlistManagerModal';
import { sanitizeSpeffzSequence, parseAndChunkSequence, SINGLE_LETTER_DEFAULTS, generateDynamicDrill } from './services/mnemonicService';
import { loadDictionary, saveDictionary, updatePairInDictionary, getDefaultDictionary } from './services/dictionaryStorage';
import { getSolvedState, generateRandomScramble } from './utils/cubeScrambler';

import cornersImg from './assets/corners.png';
import edgesImg from './assets/edges.png';

export const App: React.FC = () => {
  const [mode, setMode] = useState<SpeffzMode>('edges');
  const [sequence, setSequence] = useState<string>('ABCD');
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  const [customOverrides, setCustomOverrides] = useState<Record<string, string>>({});
  const [dictionary, setDictionary] = useState<MnemonicDictionary>(() => loadDictionary());
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isWordlistOpen, setIsWordlistOpen] = useState(false);
  const [isBlindRecallOpen, setIsBlindRecallOpen] = useState(false);

  // Scramble and Cube State Management
  const [scramble, setScramble] = useState<string>('');
  const [stickerColors, setStickerColors] = useState<Record<string, string>>(() => getSolvedState());

  // Parse sequence into letter-pair chunks using active dictionary & overrides
  const chunks = useMemo(() => {
    return parseAndChunkSequence(sequence, customOverrides, dictionary);
  }, [sequence, customOverrides, dictionary]);

  // Global keyboard typing: Allows typing Speffz letters (A-X) anywhere on the page
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If user is typing inside an explicit input/textarea or modal is open, let normal typing occur
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        isHelpOpen ||
        isWordlistOpen ||
        isBlindRecallOpen ||
        e.ctrlKey ||
        e.metaKey ||
        e.altKey
      ) {
        return;
      }

      const key = e.key.toUpperCase();
      if (/^[A-X]$/.test(key)) {
        e.preventDefault();
        setSequence((prev) => prev + key);
        setSelectedStickerId(null);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        setSequence((prev) => prev.slice(0, -1));
        setSelectedStickerId(null);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setSequence('');
        setSelectedStickerId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isHelpOpen, isWordlistOpen, isBlindRecallOpen]);

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
    // Generate a fresh, truly randomized dynamic drill (4-6 pairs = 8-12 letters) matching active mode
    const pairCount = Math.floor(Math.random() * 3) + 4; // 4, 5, or 6 pairs
    const randomDrill = generateDynamicDrill(mode, pairCount);
    setSequence(randomDrill);
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
    const cleanPair = pair.toUpperCase().trim();
    const cleanWord = customWord.trim();
    if (!cleanWord) return;

    setCustomOverrides((prev) => ({
      ...prev,
      [cleanPair]: cleanWord,
    }));

    // Ensure the custom word is added to the dictionary list if not already present
    const currentWords = dictionary[cleanPair] || (cleanPair.length === 1 ? (SINGLE_LETTER_DEFAULTS[cleanPair] || [cleanPair]) : (getDefaultDictionary()[cleanPair] || [cleanPair]));
    if (!currentWords.some((w) => w.toLowerCase() === cleanWord.toLowerCase())) {
      const updatedList = [cleanWord, ...currentWords];
      const updatedDict = updatePairInDictionary(dictionary, cleanPair, updatedList);
      setDictionary(updatedDict);
      saveDictionary(updatedDict);
    }
  };

  const handleSelectAlternative = (pair: string, altWord: string) => {
    const cleanPair = pair.toUpperCase().trim();
    const cleanWord = altWord.trim();
    // Simply set the active word for this pair without altering or deleting the list
    setCustomOverrides((prev) => ({
      ...prev,
      [cleanPair]: cleanWord,
    }));
  };

  const handleDeleteWordFromPair = (pair: string, wordToDelete: string) => {
    const cleanPair = pair.toUpperCase().trim();
    const currentWords = dictionary[cleanPair] || (cleanPair.length === 1 ? (SINGLE_LETTER_DEFAULTS[cleanPair] || [cleanPair]) : (getDefaultDictionary()[cleanPair] || [cleanPair]));
    const remaining = currentWords.filter((w) => w.toLowerCase() !== wordToDelete.trim().toLowerCase());
    
    // If all words deleted, fallback to pair identifier
    const finalWords = remaining.length > 0 ? remaining : [cleanPair];
    const updatedDict = updatePairInDictionary(dictionary, cleanPair, finalWords);
    
    setDictionary(updatedDict);
    saveDictionary(updatedDict);

    // If the currently active word was deleted, switch active word to the first remaining word
    const currentActive = customOverrides[cleanPair] || currentWords[0];
    if (currentActive && currentActive.toLowerCase() === wordToDelete.trim().toLowerCase()) {
      setCustomOverrides((prev) => ({
        ...prev,
        [cleanPair]: finalWords[0],
      }));
    }
  };

  const handleAddWordToPair = (pair: string, newWord: string) => {
    const cleanPair = pair.toUpperCase().trim();
    const cleanWord = newWord.trim();
    if (!cleanWord) return;

    const currentWords = dictionary[cleanPair] || (cleanPair.length === 1 ? (SINGLE_LETTER_DEFAULTS[cleanPair] || [cleanPair]) : (getDefaultDictionary()[cleanPair] || [cleanPair]));
    if (!currentWords.some((w) => w.toLowerCase() === cleanWord.toLowerCase())) {
      const updatedList = [...currentWords, cleanWord];
      const updatedDict = updatePairInDictionary(dictionary, cleanPair, updatedList);
      setDictionary(updatedDict);
      saveDictionary(updatedDict);
    }
  };

  const handleUpdateDictionary = (newDict: MnemonicDictionary) => {
    setDictionary(newDict);
    saveDictionary(newDict);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-slate-800 flex flex-col antialiased">
      <Header
        mode={mode}
        onModeChange={setMode}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenWordlist={() => setIsWordlistOpen(true)}
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
        <section className="space-y-4">
          <CubeViewport
            mode={mode}
            activeSequence={sequence}
            selectedStickerId={selectedStickerId}
            stickerColors={stickerColors}
            onStickerClick={handleStickerClick}
          />

          {/* Reference Speffz Diagram below the 3D cube according to active mode */}
          <div className="bg-white rounded-3xl p-5 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col items-center justify-center transition-all">
            <div className="flex items-center justify-between w-full mb-3 px-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1E3A8A] flex items-center gap-2">
                <span>Speffz Reference Map:</span>
                <span className="text-slate-500 font-semibold capitalize">
                  {mode === 'full' ? 'Corners & Edges' : `${mode} Map`}
                </span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                Standard Net Projection
              </span>
            </div>

            <div className="w-full flex items-center justify-center gap-6 overflow-hidden">
              {mode === 'edges' && (
                <div className="flex flex-col items-center">
                  <img
                    src={edgesImg}
                    alt="Speffz Edges Reference Map"
                    className="max-h-[260px] md:max-h-[320px] w-auto object-contain rounded-2xl transition-all"
                  />
                </div>
              )}

              {mode === 'corners' && (
                <div className="flex flex-col items-center">
                  <img
                    src={cornersImg}
                    alt="Speffz Corners Reference Map"
                    className="max-h-[260px] md:max-h-[320px] w-auto object-contain rounded-2xl transition-all"
                  />
                </div>
              )}

              {mode === 'full' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full justify-items-center">
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-slate-500">Edges</span>
                    <img
                      src={edgesImg}
                      alt="Speffz Edges Reference Map"
                      className="max-h-[220px] md:max-h-[260px] w-auto object-contain rounded-2xl"
                    />
                  </div>
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-slate-500">Corners</span>
                    <img
                      src={cornersImg}
                      alt="Speffz Corners Reference Map"
                      className="max-h-[220px] md:max-h-[260px] w-auto object-contain rounded-2xl"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
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
            dictionary={dictionary}
            onUpdateOverride={handleUpdateOverride}
            onSelectAlternative={handleSelectAlternative}
            onDeleteWordFromPair={handleDeleteWordFromPair}
            onAddWordToPair={handleAddWordToPair}
            onOpenBlindRecall={() => setIsBlindRecallOpen(true)}
          />
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
        3BLD Speffz Cube & SpeedSolving Mnemonic Generator • Phase 2
      </footer>

      {/* Reference Modal */}
      <ReferenceModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      {/* Wordlist Manager Modal */}
      <WordlistManagerModal
        isOpen={isWordlistOpen}
        onClose={() => setIsWordlistOpen(false)}
        dict={dictionary}
        onUpdateDictionary={handleUpdateDictionary}
      />

      {/* Blind Recall Memory Test */}
      <BlindRecallTest
        isOpen={isBlindRecallOpen}
        onClose={() => setIsBlindRecallOpen(false)}
        chunks={chunks}
      />
    </div>
  );
};

export default App;
