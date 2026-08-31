# Project: 3BLD Speffz Cube & SpeedSolving Mnemonic Generator

## Executive Summary
This document establishes the master architectural audit, codebase review, quality analysis, and Phase 2 strategic blueprint for the 3BLD Speffz Cube & SpeedSolving Mnemonic Generator. It consolidates findings across WebGL rendering, BLD domain logic, test infrastructure, UI/UX design conformance, and future-state execution modes (WCA scramble parsing, 3BLD cycle tracing, virtual blind execution, and Bluetooth smart cube hardware abstraction).

---

## Architecture Overview

### Current State (Phase 1 Baseline)
- **Frontend Framework**: React 18 + Vite + TypeScript (Strict Mode) + Tailwind CSS + Lucide React.
- **3D Graphics Subsystem**: Three.js (r128) WebGL canvas with OrbitControls rendering an interactive 3x3 Rubik's cube with 54 Speffz-labeled sticker meshes.
- **Domain Layer**:
  - `src/constants/speffzData.ts`: 54 `SpeffzSticker` definitions (24 corners, 24 edges, 6 centers) mapped to faces (U, D, F, B, L, R) and Cartesian 3D normals.
  - `src/data/wordlist.json`: 576-pair SpeedSolving dictionary ($24 \times 24$, letters A–X), each containing 4 curated mnemonic words (2,304 words total).
  - `src/services/mnemonicService.ts`: Sequence normalization, chunking, dictionary lookup with single-letter fallbacks and custom word overrides.
- **UI Subsystem**:
  - `Header.tsx`: Mode switching (`corners` / `edges` / `all`), stats, and Speffz reference modal trigger.
  - `CubeViewport.tsx`: Three.js canvas mounting, dynamic 2D canvas texture generation for stickers, raycasting for sticker click selection, camera orbit control presets.
  - `SequenceInput.tsx`: Target letter sequence input, mode-aware validation, copy/clear controls, and randomize helper.
  - `MnemonicList.tsx`: Chunked pair display, active word selection, phonetic hints, custom word overrides, and clipboard export.

### Future State (Phase 2 Architecture)
- **Mathematical Scramble Engine (`src/services/cube/`)**:
  - Pure TypeScript state vector representation of the 3x3 cube ($54$ facelets $\in \{0 \dots 5\}$, $8$ corner permutations $\times$ orientations, $12$ edge permutations $\times$ orientations).
  - WCA Scramble Parser: Tokenizes standard WCA notation (outer moves `[U, D, F, B, L, R]`, modifiers `['', "'", '2']`, wide moves `[u, d, f, b, l, r]`, slice moves `[M, E, S]`, and cube rotations `[x, y, z]`).
- **3BLD Cycle Tracing Solver (`src/services/bld/`)**:
  - Graph-based permutation cycle decomposition for edges and corners with configurable buffers (Default Edges: `UF` [C/I]; Default Corners: `UFR` [C/J/M]).
  - Automated cycle break detection to unvisited pieces in lexicographical or user-configured priority.
  - In-place piece orientation solver (misoriented edges [flipped] and twisted corners [CW/CCW]).
  - Parity detection and algorithmic resolution signaling (odd number of corner/edge swaps requiring parity alg e.g. J-perm / Ra-perm / OP parity).
- **Virtual Blindfold Execution Engine (`src/services/blind/`)**:
  - Dual-phase state machine: `INSPECTION_MEMO` $\to$ `BLIND_EXECUTION` $\to$ `SOLVE_VERIFICATION`.
  - Precision performance timers with high-resolution timestamps (`performance.now()`).
  - Shrouded/hidden sticker rendering shader mode for realistic blind simulation.
- **Bluetooth Smart Cube Hardware Abstraction (`src/services/bluetooth/`)**:
  - Standardized `SmartCubeDriver` interface over Web Bluetooth API (`navigator.bluetooth`).
  - Driver implementations for GAN (Gen 2/3 encryption protocol), MoYu AI, and QiYi Smart Cubes.
  - Real-time move stream parsing, gyro/orientation quaternion integration, and automatic scramble tracking.

---

## Feature Inventory

| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Three.js Memory & Texture Lifecycle Hardening | Fix unmount disposal, eliminate 54-canvas re-rasterization bottleneck, cache textures | M1: WebGL Hardening | R1 Audit |
| 2 | Raycasting & Mobile Touch Optimization | Filter raycasting by visible mode, add `touch-action: none`, optimize event allocations | M1: WebGL Hardening | R1 Audit |
| 3 | WebGL Context Loss Handling | Add `webglcontextlost` and `webglcontextrestored` recovery handlers | M1: WebGL Hardening | R1 Audit |
| 4 | Speffz Data Contract & Index Formalization | Add explicit `faceletIndex` ($0 \dots 53$) and adjacency mappings to `SpeffzSticker` | M2: BLD Core Logic | R2 Audit |
| 5 | Bundle Sizing & Chunk Splitting | Configure Vite `manualChunks` to isolate `three` and `wordlist.json` into async chunks | M2: BLD Core Logic | R2 Audit |
| 6 | Phonetic Generator & Sequence Highlighting | Enhance vowel interpolation heuristics and multi-sticker path badges on 3D cube | M2: BLD Core Logic | R2 Audit |
| 7 | Test Infrastructure & Coverage Expansion | Add DOM test environment, canvas mocks, Speffz invariants test suite, dictionary test suite | M3: Quality & Conformance | R3 Audit |
| 8 | WCAG 2.1 AA Contrast & Touch Target Remediation | Fix contrast on Green/Orange faces and placeholders; expand touch targets $\ge 44\text{px}$ | M3: Quality & Conformance | R3 Audit |
| 9 | WCA Scramble Engine & State Permutation | Pure mathematical cube state transition engine supporting full WCA move notation | M4: Phase 2 Blueprint | R4 Requirement |
| 10 | 3BLD Cycle Tracing Graph Engine | Immutable cycle decomposition, buffer configuration, cycle breaks, twists/flips, parity | M4: Phase 2 Blueprint | R4 Requirement |
| 11 | Virtual Blindfold Execution State Machine | Dual-timer memo/solve engine, blinded shader mode, and recall validation | M4: Phase 2 Blueprint | R4 Requirement |
| 12 | Smart Cube Bluetooth Abstraction Layer | Web Bluetooth API driver interface with GAN, MoYu, and QiYi protocol adapters | M4: Phase 2 Blueprint | R4 Requirement |

---

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | WebGL & Rendering Pipeline Hardening | Fix memory leaks, texture re-rasterization, pointer allocations, touch gestures | None | DONE |
| M2 | Core BLD Data Contracts & Logic Integrity | Formalize facelet indices, phonetic fallbacks, bundle chunking, multi-sticker sync | None | DONE |
| M3 | Quality, Test Coverage & Design Conformance | Establish DOM/Canvas test harness, Speffz invariant tests, WCAG contrast & touch fixes | M1, M2 | DONE |
| M4 | Phase 2 Strategic Architectural Blueprint | Complete implementation specs for Scramble Engine, Cycle Tracing, Blind Mode, Bluetooth | M1, M2, M3 | DONE |

---

## Interface Contracts

### 1. WebGL Texture Caching & Sticker Material Contract
```typescript
export interface StickerRenderState {
  id: string;
  letter: string;
  face: Face;
  faceColor: string;
  textColor: string;
  dimmed: boolean;
  selected: boolean;
  targetOrder?: number; // 1, 2, 3... for multi-sticker cycle path badges
}

export interface ITextureCacheService {
  getOrCreateTexture(state: StickerRenderState): THREE.CanvasTexture;
  dispose(): void;
}
```

### 2. Pure Cube Mathematical Domain Engine Contract
```typescript
export type FaceletColor = 0 | 1 | 2 | 3 | 4 | 5; // U, L, F, R, B, D
export type CubeFacelets = [
  // 54 facelet indices ordered U1..U9, L1..L9, F1..F9, R1..R9, B1..B9, D1..D9
  ...FaceletColor[]
];

export interface ICubeState {
  readonly facelets: Readonly<CubeFacelets>;
  readonly cp: readonly number[]; // Corner permutation (0..7)
  readonly co: readonly number[]; // Corner orientation (0..2)
  readonly ep: readonly number[]; // Edge permutation (0..11)
  readonly eo: readonly number[]; // Edge orientation (0..1)
  
  applyMove(move: WCAMove): ICubeState;
  applyScramble(scramble: string): ICubeState;
  clone(): ICubeState;
}
```

### 3. 3BLD Cycle Tracing Engine Contract
```typescript
export interface CycleTracingConfig {
  edgeBuffer: SpeffzLetter;   // e.g. 'C' (UF) or 'B' (UR)
  cornerBuffer: SpeffzLetter; // e.g. 'C' (UFR) or 'E' (UBL)
  edgeBreakPriority: SpeffzLetter[];
  cornerBreakPriority: SpeffzLetter[];
}

export interface TracedCycleResult {
  letterSequence: SpeffzLetter[];
  chunks: string[];           // Pair chunking (e.g. ['AB', 'CD', 'E'])
  hasParity: boolean;
  cycleBreaks: number;
  flippedEdges: SpeffzLetter[];
  twistedCorners: { letter: SpeffzLetter; direction: 'CW' | 'CCW' }[];
  visualPath: SpeffzLetter[]; // Ordered targets for 3D viewport highlighting
}
```

### 4. Smart Cube Bluetooth Gateway Contract
```typescript
export interface SmartCubeMoveEvent {
  move: string;        // e.g. "U", "R'", "F2"
  timestamp: number;   // performance.now()
  quaternion?: [number, number, number, number];
  batteryLevel?: number;
}

export interface ISmartCubeDriver {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  onMove(callback: (event: SmartCubeMoveEvent) => void): () => void;
  resetState(): Promise<void>;
}
```

---

## Code Layout

```
blind-cube/
├── .agents/                      # Agent orchestration metadata and analysis logs
├── .plans/                       # Detailed architectural plans and specifications
│   ├── webgl-quality-hardening.md
│   ├── phase2-bld-engine.md
│   └── test-quality-suite.md
├── src/
│   ├── components/               # React UI & 3D Viewport components
│   │   ├── CubeViewport.tsx      # Three.js 3D Rubik's Cube Canvas
│   │   ├── Header.tsx            # Header & mode toggles
│   │   ├── SequenceInput.tsx     # Letter input & validation
│   │   ├── MnemonicList.tsx      # Mnemonic cards & overrides
│   │   └── ReferenceModal.tsx    # Speffz cheat-sheet modal
│   ├── constants/
│   │   └── speffzData.ts         # 54 sticker definitions & 3D coordinates
│   ├── data/
│   │   └── wordlist.json         # 576 SpeedSolving pair dictionary
│   ├── services/                 # Domain logic & services
│   │   ├── mnemonicService.ts    # Sequence chunking & dictionary lookup
│   │   ├── cube/                 # [Phase 2] Mathematical Scramble & State Engine
│   │   ├── bld/                  # [Phase 2] 3BLD Cycle Tracing Solver
│   │   ├── blind/                # [Phase 2] Virtual Blindfold Execution Engine
│   │   └── bluetooth/            # [Phase 2] Smart Cube Driver Layer
│   ├── test/                     # Unit and Integration test suites
│   │   ├── mnemonicService.test.ts
│   │   ├── speffzData.test.ts    # [Recommended]
│   │   └── cycleTracing.test.ts  # [Phase 2]
│   ├── types/
│   │   └── speffz.ts             # TypeScript domain types
│   ├── App.tsx                   # Main application layout
│   └── main.tsx                  # React entry point
├── package.json
├── tsconfig.json
├── vite.config.ts
└── PROJECT.md                    # Master Project Specification
```
