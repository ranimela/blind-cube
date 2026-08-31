# 3BLD Speffz Cube & SpeedSolving Mnemonic Generator
## Comprehensive Audit: Quality, Test Coverage, Design Conformance & Phase 2 Readiness

**Author:** Teamwork Explorer Agent (`survey_explorer_3`)  
**Target:** 3BLD Speffz Cube & SpeedSolving Mnemonic Generator  
**Working Directory:** `c:\Users\rmelamed\Projects\blind-cube`  
**Date:** 2026-08-31  

---

## Executive Summary

This investigation delivers a rigorous technical evaluation of the **Quality, Test Suite, UI/UX Design Conformance, and Phase 2 Strategic Readiness** for the 3BLD Speffz Cube project. 

Key findings across the four investigated pillars:
1. **Test Suite & Quality**: Vitest is configured in pure `node` mode with 1 test file (11 unit tests in `src/test/mnemonicService.test.ts`) covering basic sequence parsing. Zero component tests, zero DOM environment (`jsdom`/`happy-dom`), and zero WebGL canvas/Three.js mocks currently exist. Crucial domain invariants (576 pair dictionary completeness, 54-sticker normal alignment, duplicate/same-piece target detection) lack automated verification.
2. **Design & Accessibility Conformance**: While layout and styling closely follow modern utility aesthetics, several WCAG 2.1 AA accessibility violations exist: low text contrast on green (`#22c55e`) and orange (`#f97316`) stickers (`2.2:1` and `2.9:1`), sub-44px touch targets on headers, viewport controls, and modal close triggers, and total lack of keyboard accessibility or ARIA semantic structure on the Three.js 3D canvas.
3. **Phase 2 Readiness**: The foundational Speffz data structures (`src/types/speffz.ts` and `src/constants/speffzData.ts`) provide an accurate static map of the cube. However, building the Phase 2 Blind Engine requires implementing: (a) a WCA scramble state transition engine, (b) a robust 3BLD cycle-tracing graph algorithm with configurable buffers and parity detection, (c) a virtual blind execution state machine with dual-phase timers, and (d) a Web Bluetooth abstraction layer supporting GAN, MoYu, and QiYi smart cube protocols.

---

## 1. Test Suite Audit & Quality Assessment

### 1.1 Existing Test Suite Overview & Configuration

| Metric | Current Value | Assessment |
| :--- | :--- | :--- |
| **Test Runner** | Vitest `v4.1.11` | Modern, ultra-fast ESM runner |
| **Environment** | `node` (`vite.config.ts:10`) | Fast for pure logic; **cannot run DOM/React/Canvas tests** |
| **Test Files** | 1 (`src/test/mnemonicService.test.ts`) | Only covers `mnemonicService.ts` |
| **Total Test Cases** | 11 tests | 100% passing (execution duration: ~4ms) |
| **DOM Testing Library** | None installed | `@testing-library/react` / `@testing-library/dom` absent |
| **Mocking Framework** | None configured | No WebGL canvas mocks, no `vi.mock` for Three.js |
| **Code Coverage Tool** | None configured | `@vitest/coverage-v8` absent |

#### Configuration File Analysis (`vite.config.ts`):
```typescript
// vite.config.ts (lines 8-12)
test: {
  globals: true,
  environment: 'node',
  include: ['src/**/*.test.{ts,tsx}'],
}
```
*Observation*: Because `environment: 'node'` is specified without `jsdom` or `happy-dom`, any test importing React components with browser globals (`window`, `document`, `HTMLCanvasElement`, `navigator.clipboard`) will fail at import/instantiation time.

---

### 1.2 Test Coverage & Assertion Depth Analysis

The existing test file `src/test/mnemonicService.test.ts` (109 lines) tests four functions:

```
src/test/mnemonicService.test.ts
├── describe('sanitizeSpeffzSequence')
│   ├── it('should convert lowercase letters to uppercase valid Speffz letters') [Line 11]
│   ├── it('should strip out invalid characters, spaces, and numbers') [Line 15]
│   └── it('should handle empty and null strings safely') [Line 19]
├── describe('lookupMnemonics')
│   ├── it('should return valid curated words for known letter pairs') [Line 27]
│   ├── it('should return single letter default for 1-character inputs') [Line 37]
│   └── it('should handle case insensitivity cleanly') [Line 46]
├── describe('parseAndChunkSequence')
│   ├── it('should chunk even-length sequences into pairs') [Line 54]
│   ├── it('should correctly handle odd trailing single letters (parity/buffer)') [Line 68]
│   ├── it('should apply custom user mnemonic overrides when provided') [Line 82]
│   └── it('should ignore non-Speffz letters and chunk remaining sequence') [Line 93]
└── describe('generateProceduralMnemonic')
    └── it('should return fallback procedural descriptions for single letters or custom combinations') [Line 99]
```

#### Depth & Assertion Quality Audit:
1. **Assertion Depth**: Good for happy paths, but relies on loose checks in several places:
   - Line 29: `expect(resAB.primary.length).toBeGreaterThan(0)` checks string presence, but does not assert exact word value or schema conformity.
   - Line 102: `expect(res.length).toBeGreaterThan(0)` only checks array length.
2. **Missing Negative & Fuzz Testing**:
   - No tests for sequences exceeding 1,000 characters.
   - No tests for non-ASCII Unicode (emojis, RTL Arabic/Hebrew characters, zero-width spaces).
   - No tests for malformed custom override dictionaries (e.g., `{ 'AB': '' }` or `{ '??': 'word' }`).

---

### 1.3 Mocked Environments & WebGL / Three.js Test Strategy

The primary visual component, `src/components/CubeViewport.tsx` (412 lines), currently has **zero unit or integration test coverage**. 

#### Challenges in Testing Three.js in Vitest:
1. `createStickerTexture` (lines 16–96) calls `document.createElement('canvas')` and `canvas.getContext('2d')`.
2. `THREE.WebGLRenderer` (lines 142–148) requires a WebGL rendering context (`canvas.getContext('webgl')` or `'webgl2'`).
3. `OrbitControls` (lines 150–159) attaches listeners to `domElement` and `window`.
4. `requestAnimationFrame` (lines 220–226) runs an infinite render loop.

#### Proposed WebGL Canvas Mocking Architecture:
To enable comprehensive testing without launching a full browser, configure a Vitest test setup file (`src/test/setup.ts`):

```typescript
// src/test/setup.ts
import { vi } from 'vitest';

// 1. Mock 2D Canvas Context for Texture Generation
HTMLCanvasElement.prototype.getContext = vi.fn((contextId: string) => {
  if (contextId === '2d') {
    return {
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      quadraticCurveTo: vi.fn(),
      closePath: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      fillText: vi.fn(),
      measureText: vi.fn(() => ({ width: 50 })),
      setTransform: vi.fn(),
      fillStyle: '#000000',
      strokeStyle: '#000000',
      lineWidth: 1,
      font: '',
      textAlign: 'center',
      textBaseline: 'middle',
    } as unknown as CanvasRenderingContext2D;
  }
  if (contextId === 'webgl' || contextId === 'webgl2') {
    return {
      getExtension: vi.fn(),
      getParameter: vi.fn(() => 2048),
      createTexture: vi.fn(),
      bindTexture: vi.fn(),
      texParameteri: vi.fn(),
      texImage2D: vi.fn(),
      clearColor: vi.fn(),
      clearDepth: vi.fn(),
      enable: vi.fn(),
      disable: vi.fn(),
      viewport: vi.fn(),
      createShader: vi.fn(),
      shaderSource: vi.fn(),
      compileShader: vi.fn(),
      createProgram: vi.fn(),
      attachShader: vi.fn(),
      linkProgram: vi.fn(),
      useProgram: vi.fn(),
    } as unknown as WebGLRenderingContext;
  }
  return null;
}) as any;

// 2. Mock ResizeObserver and Animation Frame
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

global.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 16) as any);
global.cancelAnimationFrame = vi.fn((id) => clearTimeout(id));
```

---

### 1.4 Test Gaps & Unverified Edge Cases Matrix

| Category | Gap Description | Severity | Proposed Verification Test |
| :--- | :--- | :--- | :--- |
| **Data Integrity** | Wordlist completeness: Verify all 576 pairs ($24 \times 24$, A–X) have valid non-empty arrays | High | `test/dictionaryIntegrity.test.ts` scanning `wordlist.json` |
| **Speffz Geometry** | Verify 54 stickers: 24 corners, 24 edges, 6 centers; unit normals $[x,y,z] \in \{-1,0,1\}$; correct cubie groupings | Critical | `test/speffzGeometry.test.ts` asserting cubie coordinate consistency |
| **BLD Domain Rule** | Same-piece target detection: In 3BLD, memoizing stickers on the same cubie (e.g., `AE` on UBL) is illegal | Medium | Unit test in `mnemonicService` checking same-piece collision warnings |
| **BLD Domain Rule** | Buffer collision detection: Tracing into the buffer piece (e.g., `C` on UF edge) without cycle break | High | Cycle break detection unit test |
| **Memory Safety** | Canvas texture lifecycle: Changing `mode` or `selectedStickerId` disposes previous `CanvasTexture` | High | Test verifying `mat.map.dispose()` is called 54 times per state change |
| **UI Interaction** | Raycast click vs Drag: Pointer drag ($dx > 4\text{px}$) must NOT trigger `onStickerClick` | Medium | Viewport interaction integration test |
| **Clipboard Safety** | Async clipboard rejection: `navigator.clipboard.writeText` failure fallback | Low | Error boundary & mock rejection test |

---

## 2. UI/UX Design Conformance & Accessibility (A11y) Audit

### 2.1 Context Analysis: `design.md` vs Current Implementation

The workspace root contains `design.md`, which defines specifications for `Sistem Informasi Keuangan Masjid (SI-KEMAS)`. While the header text references a different project, the design tokens (Navy `#1E3A8A`, Canvas Off-White `#F9FAFB`, Card Pure White `#FFFFFF`, 24px Card Radius, 48px Button Heights, 56px Input Heights) were adopted as the visual design system for `blind-cube`.

### 2.2 Color Contrast Audit (WCAG 2.1 AA / AAA Compliance)

All contrast ratios evaluated using standard relative luminance formula $CR = \frac{L_1 + 0.05}{L_2 + 0.05}$:

| Element / Context | Foreground Hex | Background Hex | Contrast Ratio | WCAG AA Status | WCAG AAA Status | Remediation Required |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Header Title** | `#FFFFFF` | `#1E3A8A` | **11.7:1** | PASS (4.5:1) | PASS (7.0:1) | None |
| **Header Subtitle** | `#B4D3F7` (`blue-100/80`) | `#1E3A8A` | **7.8:1** | PASS | PASS | None |
| **Input Text** | `#1E3A8A` | `#F9FAFB` | **10.8:1** | PASS | PASS | None |
| **Input Placeholder** | `#94A3B8` (`slate-400`) | `#F9FAFB` | **2.8:1** | **FAIL** (<4.5:1) | **FAIL** | Replace with `#64748B` (`slate-500`, 4.6:1) |
| **Mnemonic Card Subtitle** | `#94A3B8` (`slate-400`) | `#FFFFFF` | **2.9:1** | **FAIL** (<4.5:1) | **FAIL** | Replace with `#64748B` (`slate-500`, 4.6:1) |
| **Footer Text** | `#94A3B8` (`slate-400`) | `#FFFFFF` | **2.9:1** | **FAIL** (<4.5:1) | **FAIL** | Replace with `#64748B` (`slate-500`, 4.6:1) |
| **3D Cube: U Face (White)** | `#0f172a` (Dark) | `#f8fafc` | **17.4:1** | PASS | PASS | None |
| **3D Cube: D Face (Yellow)** | `#0f172a` (Dark) | `#eab308` | **9.2:1** | PASS | PASS | None |
| **3D Cube: F Face (Green)** | `#ffffff` (White) | `#22c55e` | **2.2:1** | **FAIL** (<3.0:1) | **FAIL** | Use dark text `#0f172a` (7.7:1) or deep green `#15803d` |
| **3D Cube: L Face (Orange)** | `#ffffff` (White) | `#f97316` | **2.9:1** | **FAIL** (<3.0:1) | **FAIL** | Use dark text `#0f172a` (6.8:1) |
| **3D Cube: R Face (Red)** | `#ffffff` (White) | `#ef4444` | **3.9:1** | PASS (Large text) | **FAIL** (Small text) | Adjust letter text shade |
| **3D Cube: B Face (Blue)** | `#ffffff` (White) | `#3b82f6` | **3.7:1** | PASS (Large text) | **FAIL** (Small text) | Adjust letter text shade |
| **Sticker Type Indicator (C/E)** | `rgba(255,255,255,0.45)` | `#22c55e` / `#f97316` | **< 1.8:1** | **FAIL** (<3.0:1) | **FAIL** | Use solid dark color with stroke |

*Critical Finding in `src/components/CubeViewport.tsx:75-81`*:
```typescript
// Current logic in createStickerTexture
if (faceColor === FACE_COLORS.U.hex || faceColor === FACE_COLORS.D.hex) {
  ctx.fillStyle = '#0f172a';
} else {
  ctx.fillStyle = '#ffffff'; // Fails on bright Green (#22c55e) and Orange (#f97316)
}
```
*Fix*: Include `FACE_COLORS.F.hex` and `FACE_COLORS.L.hex` in the dark text branch, or compute dynamic luminance per face color.

---

### 2.3 Touch Target Metrics (44px / 48px Standards)

Compliance evaluation against Apple Human Interface Guidelines (minimum 44x44px) and Android Material / `design.md` (minimum 48x48px):

| Component | Element | Current CSS Dimensions | Metric Check | Compliance Status |
| :--- | :--- | :--- | :--- | :--- |
| `Header.tsx:44` | Mode Selector Buttons (`Full`, `Corners`, `Edges`) | `min-h-[38px] px-3.5` | Height: 38px | **FAIL** (< 44px) |
| `Header.tsx:76` | Help Icon Button | `w-10 h-10` | 40x40px | **FAIL** (< 44px) |
| `CubeViewport.tsx:363` | Camera Reset Button | `w-10 h-10` | 40x40px | **FAIL** (< 44px) |
| `CubeViewport.tsx:375` | Camera Angle Quick Buttons (`UFR`, `UBL`, `DFR`, `DBL`) | `px-3 py-1.5 text-xs` | Height: ~28px | **FAIL** (< 44px) |
| `SequenceInput.tsx:44` | Random Drill Button | `min-h-[36px] px-3.5 py-1.5` | Height: 36px | **FAIL** (< 44px) |
| `SequenceInput.tsx:53` | Input Help Icon Button | `w-9 h-9` | 36x36px | **FAIL** (< 44px) |
| `SequenceInput.tsx:67` | Main Sequence Input Field | `h-[56px] px-5` | Height: 56px | **PASS** (>= 48px) |
| `SequenceInput.tsx:78,86,96`| Copy, Backspace, Clear Action Buttons inside input | `w-10 h-10` | 40x40px | **FAIL** (< 44px) |
| `MnemonicList.tsx:72` | Copy Story Button | `min-h-[36px] px-3.5 py-1.5` | Height: 36px | **FAIL** (< 44px) |
| `MnemonicList.tsx:168`| Alternative Suggestion Word Pills | `px-2.5 py-1 text-xs` | Height: ~26px | **FAIL** (< 44px) |
| `ReferenceModal.tsx:40`| Modal Close Button | `p-1.5` | ~32x32px | **FAIL** (< 44px) |

---

### 2.4 Accessibility & Assistive Tech Audit (ARIA, Keyboard, Screen Readers)

1. **3D Three.js Canvas Accessibility**:
   - **Current State**: The canvas container (`<div ref={containerRef} ...>`) is a pointer-only surface.
   - **Issues**:
     - No keyboard focus (`tabIndex` is absent).
     - Keyboard users cannot rotate the cube (no Arrow key bindings).
     - Keyboard/screen reader users cannot select stickers without mouse pointer coordinates.
     - Screen readers receive no descriptive context for the 3D model.
   - **Remediation**:
     - Add `role="region"` and `aria-label="Interactive 3D Speffz Rubik's Cube"`.
     - Implement keyboard controls (Arrow keys for orbital rotation, `U/L/F/R/B/D` keys for face alignment).
     - Render an off-screen accessible HTML representation (e.g., an accessible 2D net grid or sticker list) synced with the 3D scene.

2. **Form & Interactive Semantics**:
   - `SequenceInput.tsx:33` `<label>` is not linked to `<input>` (missing `id="speffz-input"` on input and `htmlFor="speffz-input"` on label).
   - Icon-only buttons lack `aria-label`s (`title` attribute alone is insufficient for non-mouse assistive tech).
   - Live sequence updates lack `aria-live="polite"` announcements.

3. **Reference Modal Semantics**:
   - `ReferenceModal.tsx` lacks `role="dialog"`, `aria-modal="true"`, and `aria-labelledby="modal-title"`.
   - Lacks focus trapping (pressing `Tab` cycles outside the modal into background DOM).
   - Lacks `Escape` key event listener to close modal.

---

### 2.5 Responsive Typography, Spacing & Layout

- **Grid Alignment**: App layout adheres strictly to the 8px grid convention (`max-w-[1200px]`, `px-4 py-8 space-y-8`).
- **Responsive Breakpoints**:
  - Viewport height: `h-[420px]` on mobile, `h-[480px]` on `md:` screens.
  - Card layout: `grid-cols-1` on mobile, `grid-cols-2` on tablet, `grid-cols-3` on desktop.
- **Layout Edge Case**: On small mobile devices (screen width $\le 360\text{px}$), the three action buttons inside `SequenceInput` (`pr-36` / 144px right padding) crowd the input text, causing typed letters to clip.

---

## 3. Phase 2 Strategic Architectural Blueprint & Readiness

Phase 2 expands the application from a static Speffz lettering reference into a full **3BLD Solving Engine**, encompassing:
1. Pure mathematical WCA scramble parser.
2. 3BLD cycle-tracing solver (configurable buffers, cycle breaks, in-place flips/twists, parity).
3. Virtual blind execution mode with sticker obscuration and dual-phase timers.
4. Web Bluetooth Smart Cube hardware integration.

---

### 3.1 Scramble Parsing Engine (WCA Notation)

#### Mathematical Cube Representation
A standard 3x3 Rubik's Cube state $C$ is represented immutably by permutations and orientations of its pieces:
$$\text{State } C = (\mathbf{cp}, \mathbf{co}, \mathbf{ep}, \mathbf{eo})$$
- $\mathbf{cp} \in S_8$: Corner Permutation (indices 0..7 for UBL, UBR, UFR, UFL, DFL, DFR, DBR, DBL)
- $\mathbf{co} \in (\mathbb{Z}_3)^8$: Corner Orientation (0 = solved, 1 = clockwise twist, 2 = counter-clockwise twist)
- $\mathbf{ep} \in S_{12}$: Edge Permutation (indices 0..11 for UB, UR, UF, UL, FL, FR, BR, BL, DF, DR, DB, DL)
- $\mathbf{eo} \in (\mathbb{Z}_2)^{12}$: Edge Orientation (0 = solved, 1 = flipped)

#### WCA Scramble Grammar Specification
The tokenizer supports standard WCA notation:
```ebnf
Scramble      ::= ( MoveWS )+
MoveWS        ::= Move ( [ \t\n]+ | $ )
Move          ::= BaseMove Modifier?
BaseMove      ::= FaceMove | WideMove | SliceMove | Rotation
FaceMove      ::= "U" | "D" | "F" | "B" | "L" | "R"
WideMove      ::= "u" | "d" | "f" | "b" | "l" | "r" | "Uw" | "Dw" | "Fw" | "Bw" | "Lw" | "Rw"
SliceMove     ::= "M" | "E" | "S"
Rotation      ::= "x" | "y" | "z"
Modifier      ::= "'" | "’" | "i" | "2" | "2'"
```

#### TypeScript Data Contracts:
```typescript
// Proposed: src/types/scramble.ts
export type StandardFace = 'U' | 'D' | 'F' | 'B' | 'L' | 'R';
export type MoveModifier = '' | "'" | '2';

export interface ParsedMove {
  raw: string;
  family: StandardFace | 'M' | 'E' | 'S' | 'x' | 'y' | 'z';
  isWide: boolean;
  amount: 1 | 2 | 3; // 1 = 90° CW, 2 = 180°, 3 = 90° CCW
}

export interface CubeState {
  cornerPerm: Uint8Array; // 8 elements (0..7)
  cornerOri: Uint8Array;  // 8 elements (0..2)
  edgePerm: Uint8Array;   // 12 elements (0..11)
  edgeOri: Uint8Array;    // 12 elements (0..1)
}

export interface IScrambleEngine {
  parseScramble(scrambleStr: string): ParsedMove[];
  applyScramble(initialState: CubeState, moves: ParsedMove[]): CubeState;
  stateToSpeffzStickers(state: CubeState): Record<string, string>; // Maps sticker ID to actual current color/letter
}
```

---

### 3.2 3BLD Cycle Tracing Engine & Contracts

#### 3BLD Cycle Tracing Algorithm
For both corners and edges:
1. **Initialize State**: Maintain a set of unvisited piece indices. Mark buffer piece as visited if already solved or in cycle.
2. **Trace Primary Cycle**: Check piece currently at the buffer slot.
   - If destination is NOT buffer: append destination Speffz letter, mark piece visited, advance to next piece.
   - If destination IS buffer: close active cycle.
3. **Cycle Break Resolution**:
   - If unvisited pieces remain: select the lowest-index unvisited piece (according to user's defined cycle-break priority table).
   - Append break target letter to memo sequence.
   - Continue tracing until cycle returns to the chosen break piece.
4. **In-Place Pieces**:
   - Unvisited pieces in correct slot but wrong orientation: record as in-place flip (edges) or in-place twist (corners).
5. **Parity Check**:
   - $\text{Edge Target Count} \pmod 2 \neq 0 \iff \text{Corner Target Count} \pmod 2 \neq 0$.
   - Flag `hasParity: true` if target length is odd.

```
       [Start Cycle Tracing]
                 │
                 ▼
       ┌───────────────────┐
       │ Piece at Buffer?  │
       └─────────┬─────────┘
                 │
      ┌──────────┴──────────┐
      │                     │
[Solved / At Buffer]   [Target Slot]
      │                     │
      ▼                     ▼
┌───────────────┐     ┌──────────────────────┐
│ Cycle Closed! │     │ Append Speffz Target │
└───────┬───────┘     └──────────┬───────────┘
        │                        │
        ▼                        ▼
┌───────────────────┐    ┌───────────────────┐
│ Unvisited Pieces? │    │ Advance to Next   │
└───────┬───────────┘    └───────────────────┘
   Yes  │  No
 ┌──────┴──────┐
 │             ▼
 ▼       [Complete / Compute Parity]
[Cycle Break]
```

#### TypeScript Data Contracts:
```typescript
// Proposed: src/types/bldSolver.ts
export type EdgeBuffer = 'UF' | 'DF' | 'UB' | 'UR';
export type CornerBuffer = 'UFR' | 'UFL' | 'UBL';

export interface SolverConfig {
  edgeBuffer: EdgeBuffer;       // Default: 'UF' (Speffz 'C')
  cornerBuffer: CornerBuffer;   // Default: 'UFR' (Speffz 'C')
  edgeCycleBreakOrder: string[]; // e.g. ['A', 'B', 'D', 'E', ...]
  cornerCycleBreakOrder: string[];
}

export interface InPlaceFlip {
  piece: string;        // e.g. "UB"
  targetLetters: [string, string]; // e.g. ["A", "Q"]
}

export interface InPlaceTwist {
  piece: string;        // e.g. "UBL"
  direction: 'CW' | 'CCW';
  targetLetter: string; // Speffz letter to shoot to
}

export interface TargetCycle {
  id: number;
  targets: string[];    // e.g. ['A', 'B', 'M', 'N']
  isBufferCycle: boolean;
}

export interface BLDTraceResult {
  edgeTargets: string[];         // e.g. ['A', 'B', 'C', 'D']
  cornerTargets: string[];       // e.g. ['E', 'F', 'G', 'H']
  edgeCycles: TargetCycle[];
  cornerCycles: TargetCycle[];
  inPlaceFlips: InPlaceFlip[];
  inPlaceTwists: InPlaceTwist[];
  hasParity: boolean;
  edgeMemoPairs: string[];       // Chunked pairs e.g. ['AB', 'CD']
  cornerMemoPairs: string[];
}
```

---

### 3.3 Virtual Blind Execution Mode Architecture

#### State Machine Flow:
```
 [IDLE / SCRAMBLE GENERATED]
              │ (Press Space / Start Memo)
              ▼
    [INSPECTION / MEMO]
  - Cube visible with Speffz overlay
  - Memo timer running
              │ (Press Space / Put On Blindfold)
              ▼
   [BLIND EXECUTION MODE]
  - Canvas: Matte black stickers (blindfolded)
  - Speffz letters hidden
  - Execution timer running
  - Keyboard turns / Smart cube turns active
              │ (Press Space / Solved)
              ▼
   [VALIDATION & REVIEW]
  - Total time, Memo time, TPS calculated
  - Cube state validated against Solved State
  - Memo Recall accuracy check (User typed vs Actual computed)
```

#### Blindfold Shading Logic:
When transitioning to `BLIND_EXECUTION`, `CubeViewport.tsx` dynamically switches mesh materials:
```typescript
// Blindfold Material Swap
const blindfoldMaterial = new THREE.MeshStandardMaterial({
  color: 0x090d16,
  roughness: 0.9,
  metalness: 0.1,
});
meshesRef.current.forEach(mesh => {
  mesh.material = blindfoldMaterial;
});
```

---

### 3.4 Bluetooth Smart Cube Connectivity Pathways

#### Web Bluetooth Integration Architecture:
```
┌────────────────────────────────────────────────────────┐
│                   Web Bluetooth API                    │
│            navigator.bluetooth.requestDevice           │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│              SmartCubeDriver Abstract Layer            │
├───────────────────────────┬────────────────────────────┤
│ GanSmartCubeDriver        │ MoyuSmartCubeDriver        │
│ QiYiSmartCubeDriver       │ GiikerSmartCubeDriver      │
└───────────────────────────┴────────────────────────────┘
                            │ (Move & Orientation Events)
                            ▼
┌────────────────────────────────────────────────────────┐
│      Unified BLD Engine / Three.js Scene Sync          │
└────────────────────────────────────────────────────────┘
```

#### Protocol Comparison Matrix:

| Smart Cube Family | Service UUID | Move Payload Structure | Gyroscope / IMU Support | Encryption |
| :--- | :--- | :--- | :--- | :--- |
| **GAN (i3, i Carry, 12 ui)** | `0000fff0-0000-1000-8000-00805f9b34fb` | 16–20 byte packet, face turn index + hardware millisecond timestamp | 6-axis IMU (Quaternion $[w,x,y,z]$ for real-time cube rotation) | AES-128 (hardware key based on MAC) |
| **MoYu (WeiLong AI)** | `0000fff0-0000-1000-8000-00805f9b34fb` | 16 byte frame, move event code + raw optical encoder states | No IMU (Move detection only) | Unencrypted |
| **QiYi (Smart 3x3)** | `0000fff0-0000-1000-8000-00805f9b34fb` | 8 byte status packet with move history buffer | No IMU | Unencrypted |
| **Giiker (Supercube)** | `0000aadb-0000-1000-8000-00805f9b34fb` | 20 byte payload containing complete 54-facelet state array | Available on Giiker i3S | Unencrypted |

#### Unified Bluetooth Driver Contract:
```typescript
// Proposed: src/types/bluetooth.ts
export interface CubeMoveEvent {
  move: string;        // e.g. "U", "R'", "F2"
  timestamp: number;   // Hardware timestamp (ms)
  rawBytes: Uint8Array;
}

export interface SmartCubeDriver {
  connect(): Promise<boolean>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  getDeviceName(): string;
  getBatteryLevel(): Promise<number>;
  
  onMove(callback: (e: CubeMoveEvent) => void): () => void;
  onOrientationChange?(callback: (quaternion: [number, number, number, number]) => void): () => void;
}
```

---

## 4. Synthesis & Concrete Recommendations Roadmap

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           PHASE 1 HARDENING                             │
│ 1. Fix WCAG Contrast: Dark text on F/L stickers; slate-500 placeholder  │
│ 2. Touch Target Metrics: Increase buttons to min-h-[44px] / 48px        │
│ 3. A11y: ARIA labels, modal focus trap, keyboard canvas interaction     │
│ 4. Unit Testing: Vitest DOM setup, full 576-pair & 54-sticker tests     │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      PHASE 2A: PURE DOMAIN ENGINE                       │
│ 1. WCA Scramble Tokenizer & State Transition Engine                     │
│ 2. 3BLD Cycle Tracing Solver (Configurable Buffers, Cycle Breaks,       │
│    In-place Flips/Twists, Parity)                                       │
│ 3. Automatic Scramble -> 3BLD Mnemonic Memo Generator Pipeline          │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                   PHASE 2B: VIRTUAL BLIND & HARDWARE                    │
│ 1. Virtual Blind Mode: Inspection -> Sticker Obscuration -> Validation  │
│ 2. Dual Precision Timers (Memo + Blind Execution)                       │
│ 3. Web Bluetooth Layer: GAN / MoYu / QiYi Smart Cube Drivers            │
│ 4. Live Physical Cube IMU Orientation & Move Synchronization            │
└─────────────────────────────────────────────────────────────────────────┘
```

---
*Report compiled and verified by `survey_explorer_3`.*
