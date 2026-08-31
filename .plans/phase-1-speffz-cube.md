# Phase 1: 3BLD Speffz Cube & Letter-Pair Mnemonic Generator Specification

## Architectural Overview
- **Core Engine (Pure Types & Logic)**:
  - Speffz lettering scheme definitions for 3x3 Rubik's Cube (corners A-X, edges A-X, centers/faces U, L, F, R, B, D).
  - Sequence parser & chunker: standardizes user string / sticker clicks to uppercase Speffz letters (A-X), chunking into letter pairs (e.g. `['AB', 'CD', 'E']`).
  - Mnemonic dictionary & lookup engine: Fast O(1) multi-word lookup per letter pair, fallback phonetic heuristic generator when words are missing.
- **3D Visualization (Three.js)**:
  - Pure 3-axis trackball/orbit rotation canvas (no slice moves).
  - 26 cubies (or 54 stickers) with Speffz letter canvas textures.
  - Interactive Raycaster detecting sticker clicks with highlight animations and hover states.
  - Display modes: `'corners' | 'edges' | 'full'`.
- **UI & Presentation (React 19 + Tailwind CSS + Lucide Icons)**:
  - Header with app branding and mode switcher (`Corners`, `Edges`, `Full`).
  - 3D Interactive Viewport with reset view button & visual cues.
  - Sequence Input Bar: Two-way sync (typing Speffz characters or clicking cube stickers).
  - Letter Pair Mnemonic Display Cards with phonetic/curated suggestions, custom word editing, and quick copy.
  - Preset drills & quick reference guide for Speffz BLD solvers.

## Immutable Data Contracts
```typescript
export type SpeffzMode = 'corners' | 'edges' | 'full';

export type PieceType = 'corner' | 'edge' | 'center';

export type FaceName = 'U' | 'L' | 'F' | 'R' | 'B' | 'D';

export interface SpeffzTarget {
  letter: string; // 'A' - 'X'
  pieceType: PieceType;
  face: FaceName;
  position: [number, number, number]; // Vector3 coords
  normal: [number, number, number]; // Face normal
  name: string; // e.g., "UBL", "UR", "U"
}

export interface LetterPairChunk {
  id: string;
  pair: string; // e.g. "AB" or "A" (odd trailing letter)
  firstLetter: string;
  secondLetter?: string;
  isSingle: boolean;
  mnemonic: string;
  alternatives: string[];
}

export interface MnemonicDictionary {
  [pair: string]: string[];
}
```

## Affected Files
- `package.json`: Module type (`"type": "module"`), scripts (`dev`, `build`, `test`).
- `tsconfig.json`: Strict TypeScript React/Vite config.
- `tsconfig.node.json`: Vite node config.
- `vite.config.ts`: Vite React config + vitest config.
- `tailwind.config.js`: Tailwind config.
- `postcss.config.js`: PostCSS plugins.
- `index.html`: Entry HTML with viewport meta.
- `src/main.tsx`: App root mounting.
- `src/index.css`: Tailwind directives and styles.
- `src/types/speffz.ts`: Type contracts.
- `src/constants/speffzData.ts`: Speffz letter mapping for all 54 stickers (corners, edges, centers, positions, face colors).
- `src/data/wordlist.json`: Comprehensive letter-pair mnemonic dataset.
- `src/services/mnemonicService.ts`: Parser, chunker, and lookup/generation engine.
- `src/components/CubeViewport.tsx`: Three.js interactive 3D cube with orbit controls, canvas textures, and raycaster.
- `src/components/SequenceInput.tsx`: Input bar with clear, backspace, and real-time validation.
- `src/components/MnemonicList.tsx`: Rich cards rendering paired chunks, mnemonics, and custom overrides.
- `src/components/Header.tsx`: Mode toggle, branding, controls.
- `src/components/ReferenceModal.tsx`: Visual Speffz cheat sheet & guide.
- `src/App.tsx`: Main dashboard state and layout.
- `src/test/mnemonicService.test.ts`: Vitest test suite verifying chunking, odd single letters, sanitize logic, dictionary lookups, and edge cases.

## Step-by-Step Micro-Tasks
1. Configure project environment (`package.json`, `tsconfig.json`, `vite.config.ts`, `tailwind.config.js`, `postcss.config.js`, `index.html`).
2. Build data contracts and Speffz definitions (`src/types/speffz.ts`, `src/constants/speffzData.ts`).
3. Build comprehensive letter-pair wordlist dataset and lookup service (`src/data/wordlist.json`, `src/services/mnemonicService.ts`).
4. Write and verify unit test suite with Vitest.
5. Build interactive Three.js 3D Speffz Cube component (`src/components/CubeViewport.tsx`).
6. Build modern React UI components (`Header.tsx`, `SequenceInput.tsx`, `MnemonicList.tsx`, `ReferenceModal.tsx`, `App.tsx`, `src/index.css`).
7. Run complete build & test validation.

## Verification Criteria
- `npm test` runs Vitest and passes all tests (pairing, chunking, dictionary matching, single letter edge cases).
- `npm run build` generates clean production output without TypeScript or bundle errors.
- 3D Cube responds to mouse drag rotation, sticker clicks trigger Speffz inputs, letter-pairs chunk dynamically with mnemonic lookups.
