# Plan: BLD Data Integrity, Speffz Geometry Audit & High-Performance Dictionary Pipeline

## Architectural Overview
This specification formalizes the mathematical integrity of the 3BLD Speffz coordinate system, establishes bidirectional indexing across the 54 facelets, optimizes the 576-pair dictionary loading through Rollup code-splitting, enriches algorithmic phonetic fallback heuristics, and enables multi-target 3D cycle path visualization across the Rubik's cube surface.

### 1. Speffz Mathematical Invariants & Spatial Verification
- **Face Partitioning & Cartesian Normals**: A standard 3x3 Rubik's cube has 6 face centers, each with an orthonormal outward normal vector $\mathbf{n} \in \mathbb{R}^3$:
  $$\mathbf{n}_U = [0, 1, 0], \quad \mathbf{n}_D = [0, -1, 0], \quad \mathbf{n}_F = [0, 0, 1], \quad \mathbf{n}_B = [0, 0, -1], \quad \mathbf{n}_L = [-1, 0, 0], \quad \mathbf{n}_R = [1, 0, 0]$$
- **Cubie Positional Invariants**:
  - **8 Corner Cubies** ($|x| + |y| + |z| = 3$): Each has 3 visible stickers in cyclic orientation.
  - **12 Edge Cubies** ($|x| + |y| + |z| = 2$): Each has 2 visible stickers.
  - **6 Center Cubies** ($|x| + |y| + |z| = 1$): Fixed spatial references, non-target stickers.
- **Formal Kociemba Facelet Indexing**:
  Map each of the 54 `SpeffzSticker` definitions to standard Kociemba facelet indices ($0 \dots 53$):
  - `U1..U9` ($0 \dots 8$), `R1..R9` ($9 \dots 17$), `F1..F9` ($18 \dots 26$), `D1..D9` ($27 \dots 35$), `L1..L9` ($36 \dots 44$), `B1..B9` ($45 \dots 53$).
  - Provide $O(1)$ bidirectional lookups: `SpeffzTarget <=> FaceletIndex <=> [x,y,z] Normal`.

### 2. 576-Pair Letter Database & Bundle Code-Splitting
- **Dictionary Completeness**: All $24 \times 24 = 576$ letter-pairs ($A \dots X$) are strictly validated in `src/data/wordlist.json` with 4 high-recognition curated words per pair (total 2,304 words).
- **Vite Chunk Splitting (`vite.config.ts`)**: Isolate large static modules using Rollup's `manualChunks`:
  - `vendor-three`: `['three', 'three-stdlib']` (~600 KB raw $\to$ cached independently).
  - `vendor-react`: `['react', 'react-dom', 'lucide-react']`.
  - `bld-dictionary`: `['./src/data/wordlist.json']` (~25 KB minified / 10.5 KB gzip).
  - Main application bundle drops to $< 40\text{ KB}$, eliminating the Vite `chunk size > 500 kB` warning.

### 3. Competitive BLD Phonetic & Heuristic Fallback Engine
- **Procedural Mnemonic Generation Upgrade**:
  When custom pairs or fallbacks are requested, replace the naïve `"Word1 & Word2"` concatenator with a 3-tier competitive BLD mnemonic generator:
  1. **Consonant Phonetic Substitutions**:
     - $Q \to \text{QU / KW / K}$ (e.g. $QD \to \text{Quad}$, $QK \to \text{Quake}$).
     - $X \to \text{EX / CROSS / KS / CH}$ (e.g. $XB \to \text{Crossbow}$, $XT \to \text{Extend}$).
     - $C \to \text{K / CH / S}$ (e.g. $CP \to \text{Captain}$, $CL \to \text{Clown}$).
  2. **Vowel Interpolation ($C_1 + \text{Vowel} + C_2$)**:
     - Automatically generates valid single-syllable pronounceable audio words (e.g. $B + T \to \text{BAT, BET, BIT, BOT, BUT}$).
  3. **Person-Action-Object (PAO) Associative Compounds**:
     - Forms vivid imagery compounds (e.g. `Batman slicing Pineapple`) for robust long-term trace retention.

### 4. Multi-Sticker 3D Cycle Path Visualization
- **Sequence-to-Sticker Spatial Mapping**:
  Extend `CubeViewport` to parse the entire active memo sequence (e.g. `"ABCD EM"`) rather than only tracking the last clicked sticker.
- **Ordered Target Badges**:
  Sticker textures render numbered badges ($1 \to 2 \to 3 \dots$) indicating execution order.
- **Pair Color Coding**:
  - Pair 1 targets: Electric Cyan (`#38bdf8`)
  - Pair 2 targets: Amber (`#f59e0b`)
  - Pair 3 targets: Violet (`#a855f7`)
  - Trailing Parity target: Rose (`#f43f5e`)
- **Mode Disambiguation**:
  Typing letter `'A'` in `corners` mode highlights `UBL` ($U$ sticker); in `edges` mode, it highlights `UB` ($U$ sticker).

---

## Immutable Data Contracts

```typescript
import { FaceName, PieceType } from './speffz';

/**
 * Standard Kociemba facelet indices (0 to 53)
 */
export type KociembaFaceletIndex = number; // 0..53

/**
 * Comprehensive Speffz Sticker metadata with physical cubie relations.
 */
export interface SpeffzStickerMetadata {
  id: string;                         // e.g. "U-corner-A"
  faceletIndex: KociembaFaceletIndex; // 0..53
  letter: string;                     // 'A'..'X' or '' for center
  pieceType: PieceType;               // 'corner' | 'edge' | 'center'
  face: FaceName;                     // 'U' | 'L' | 'F' | 'R' | 'B' | 'D'
  cubiePos: [number, number, number]; // [-1..1, -1..1, -1..1]
  normal: [number, number, number];   // Orthonormal face normal
  name: string;                       // e.g. "UBL", "UF", "U"
  faceColor: string;                  // Hex color
  adjacentStickers: string[];         // IDs of stickers belonging to the same physical cubie
}

/**
 * Letter-pair mnemonic query result with phonetic metadata.
 */
export interface MnemonicQueryResult {
  pair: string;
  primary: string;
  alternatives: string[];
  isCustom: boolean;
  phoneticAudioWord?: string; // Single pronounceable audio word for memo drills
  paoStructure?: {
    person: string;
    action: string;
    object: string;
  };
}

/**
 * Visual cycle path target for 3D Viewport highlighting.
 */
export interface VisualPathTarget {
  order: number;            // 1-based order in the sequence (1, 2, 3...)
  pairIndex: number;        // Index of the pair (0 for first pair, 1 for second...)
  letter: string;           // Speffz letter
  stickerId: string;        // Resolved SpeffzSticker ID
  colorHex: string;         // Highlight color (Cyan, Amber, Violet, Rose)
  isParity: boolean;
}
```

---

## Affected Files

### Modified Files:
- `src/types/speffz.ts`: Add `SpeffzStickerMetadata`, `KociembaFaceletIndex`, `VisualPathTarget`, `MnemonicQueryResult`.
- `src/constants/speffzData.ts`: Enrich 54 sticker definitions with `faceletIndex` ($0 \dots 53$) and `adjacentStickers` cubie bindings.
- `src/services/mnemonicService.ts`: Implement `generateAdvancedProceduralMnemonic`, vowel interpolation, phonetic substitutions, and sequence-to-path target resolution.
- `src/components/CubeViewport.tsx`: Support multi-target visual cycle highlighting and numbered order badges.
- `src/App.tsx`: Pass active sequence targets down to `CubeViewport`.
- `vite.config.ts`: Configure Rollup `manualChunks` code splitting.

### Test Files:
- `src/test/speffzData.test.ts`: 54-sticker geometry invariants, normal orthogonality, cubie piece integrity.
- `src/test/dictionaryIntegrity.test.ts`: 576-pair complete coverage, non-empty word arrays.
- `src/test/mnemonicService.test.ts`: Advanced phonetic generation and path target resolution.

---

## Step-by-Step Micro-Tasks

### Task 1: Formalize 54-Facelet Indices & Cubie Adjacency (`src/constants/speffzData.ts`, `src/types/speffz.ts`)
1. Extend `SpeffzSticker` interface with `faceletIndex: number` and `adjacentStickers: string[]`.
2. Map each sticker in `SPEFFZ_STICKERS` to standard Kociemba index ($0 \dots 53$):
   - U Face (0..8): U1..U9 -> UBL(A), UB(A), UBR(B), UL(D), U_center(U), UR(B), UFL(D), UF(C), UFR(C)
   - R Face (9..17): R1..R9 -> UBR(N), UR(M), UFR(M), BR(N), R_center(R), FR(P), DBR(O), DR(O), DFR(P)
   - F Face (18..26): F1..F9 -> UFL(F), UF(I), UFR(J), FL(F), F_center(F), FR(J), DFL(L), DF(K), DFR(K)
   - D Face (27..35): D1..D9 -> DFL(U), DF(U), DFR(V), DL(X), D_center(D), DR(V), DBL(X), DB(W), DBR(W)
   - L Face (36..44): L1..L9 -> UBL(E), UL(E), UFL(F), BL(H), L_center(L), FL(G), DBL(H), DL(G), DFL(G)
   - B Face (45..53): B1..B9 -> UBR(Q), UB(Q), UBL(R), BR(T), B_center(B), BL(R), DBR(T), DB(S), DBL(S)
3. Populate `adjacentStickers` with the IDs of sister stickers on the same physical cubie (e.g. `U-corner-A` is adjacent to `L-corner-E` and `B-corner-R`).

### Task 2: Configure Vite Chunk Splitting (`vite.config.ts`)
1. In `vite.config.ts`, add `build.rollupOptions.output.manualChunks`:
   ```typescript
   manualChunks: {
     'vendor-three': ['three', 'three-stdlib'],
     'vendor-react': ['react', 'react-dom', 'lucide-react'],
     'bld-dictionary': ['./src/data/wordlist.json'],
   }
   ```
2. Run `npm run build` and confirm all output chunks remain well under the 500 kB threshold.

### Task 3: Implement Advanced BLD Phonetic & Algorithmic Heuristics (`src/services/mnemonicService.ts`)
1. Create `generateAdvancedProceduralMnemonic(pair: string): string[]`:
   - Support vowel interpolation: `[c1 + 'A' + c2, c1 + 'E' + c2, c1 + 'I' + c2, c1 + 'O' + c2, c1 + 'U' + c2]`.
   - Apply consonant substitutions ($Q \to \text{Qu/Kw}$, $X \to \text{Ex/Cross}$, $C \to \text{K/Ch}$).
   - Return unique deduplicated list of memorable mnemonic strings.
2. Implement `resolveSequenceToVisualPath(sequence: string, mode: SpeffzMode): VisualPathTarget[]`:
   - Iterate over sanitized characters.
   - Disambiguate piece type based on `mode` (`corners` $\to$ corner sticker, `edges` $\to$ edge sticker, `all` $\to$ first match or contextual).
   - Assign order index ($1, 2, 3 \dots$), pair index ($\lfloor i/2 \rfloor$), and color coding (Cyan, Amber, Violet, Rose).

### Task 4: Multi-Target Visual Highlighting on 3D Viewport (`src/components/CubeViewport.tsx`)
1. Update `CubeViewportProps` to accept `visualTargets: VisualPathTarget[]`.
2. In `createStickerTexture`:
   - If `badgeNumber` is provided, draw a circular badge with dark background and contrasting text in the top-left corner of the sticker canvas.
   - Apply target color border/glow matching `target.colorHex`.
3. In `updateTextures`:
   - Apply textures with badge numbers corresponding to the active memo sequence targets.

---

## Verification Criteria

### 1. Mathematical Invariant Verification Suite (`src/test/speffzData.test.ts`)
- **Sticker Count**: Assert exactly 54 stickers in `SPEFFZ_STICKERS`.
- **Normal Vectors**: Assert every sticker's normal vector has magnitude $\|\mathbf{n}\| = 1.0$ and matches its face direction exactly.
- **Corner Cubies**: Assert exactly 8 unique corner positions; each corner position contains exactly 3 stickers with distinct faces.
- **Edge Cubies**: Assert exactly 12 unique edge positions; each edge position contains exactly 2 stickers with distinct faces.
- **Center Cubies**: Assert exactly 6 unique center positions; each center has `pieceType === 'center'` and empty letter `''`.
- **Facelet Indexing**: Assert all facelet indices are unique and cover the continuous range $0 \dots 53$.

### 2. Dictionary & Performance Verification Suite (`src/test/dictionaryIntegrity.test.ts`)
- **Coverage**: Assert `wordlist.json` contains all 576 keys from `AA` to `XX`.
- **Word Quality**: Assert each key contains an array of length $\ge 1$, with zero empty strings, zero undefined entries, and no un-trimmed whitespace.
- **Benchmark**: Execute 100,000 lookups; verify execution completes in $< 20\text{ ms}$.

### 3. Build & Bundle Chunk Verification
- Execute `npm run build`.
- Assert generated chunk sizes:
  - `dist/assets/vendor-three-*.js` $< 450\text{ KB}$
  - `dist/assets/bld-dictionary-*.js` $< 30\text{ KB}$
  - `dist/assets/index-*.js` $< 50\text{ KB}$

---

## Context Pruning
The Builder must ONLY read and edit the following files to implement this specification:
1. `src/constants/speffzData.ts` (Speffz 54-sticker geometry & facelet definitions)
2. `src/services/mnemonicService.ts` (Lookup, chunking, phonetic generator, visual path resolver)
3. `vite.config.ts` (Rollup manualChunks bundle configuration)
