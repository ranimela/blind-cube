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
import { sanitizeSpeffzSequence, parseAndChunkSequence } from './services/mnemonicService';
import { loadDictionary, saveDictionary } from './services/dictionaryStorage';
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
    const cleanPair = pair.toUpperCase().trim();
    const cleanWord = customWord.trim();
    if (!cleanWord) return;

    setCustomOverrides((prev) => ({
      ...prev,
      [cleanPair]: cleanWord,
    }));

    // Ensure the custom word is added to the dictionary list if not already present
    const currentWords = dictionary[cleanPair] || [];
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
    const currentWords = dictionary[cleanPair] || [];
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

    const currentWords = dictionary[cleanPair] || [];
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
