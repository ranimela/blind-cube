# Plan: Phase 2 Strategic Architectural Blueprint — WCA Scramble Engine, 3BLD Graph Cycle Solver, Virtual Blind State Machine & Bluetooth Smart Cube Drivers

## Architectural Overview
This specification delivers the complete architectural blueprint and mathematical domain models for Phase 2 of the 3BLD Speffz Cube platform. It encompasses:
1. A pure mathematical WCA Scramble Parser and 3x3 Cube Permutation Engine.
2. An automated graph-based 3BLD Cycle Tracing Solver supporting configurable buffers, cycle breaks, in-place flips/twists, and parity resolution.
3. A Virtual Blindfold Execution State Machine featuring dual-phase precision timers, blinded shader obscuration, and recall validation.
4. A Web Bluetooth Smart Cube Hardware Abstraction Layer with driver protocols for GAN, MoYu, QiYi, and Giiker smart cubes.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   PHASE 2 ARCHITECTURE                                 │
└────────────────────────────────────────────────────────────────────────────────────────┘
                                            │
        ┌───────────────────────────────────┼───────────────────────────────────┐
        ▼                                   ▼                                   ▼
┌───────────────────────┐       ┌───────────────────────┐       ┌───────────────────────┐
│   WCA Scramble Engine │       │ 3BLD Cycle Solver     │       │ Smart Cube Bluetooth  │
│   (src/services/cube) │       │ (src/services/bld)    │       │ (src/services/bt)     │
├───────────────────────┤       ├───────────────────────┤       ├───────────────────────┤
│ * Tokenizer / Grammar │       │ * Buffer Configs      │       │ * GATT GATT Server    │
│ * Permutation Vectors │  ───> │ * Cycle Break Graph   │       │ * GAN AES-128 Driver  │
│   cp[8], co[8],       │       │ * In-place Flips/Twist│       │ * MoYu / QiYi Driver  │
│   ep[12], eo[12]      │       │ * Parity Detection    │       │ * IMU Quaternion Sync │
└──────────┬────────────┘       └──────────┬────────────┘       └──────────┬────────────┘
           │                               │                               │
           └───────────────────────┬───────┴───────────────────────────────┘
                                   ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        Virtual Blindfold Execution Engine                              │
│                             (src/services/blind)                                       │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ * State Machine: IDLE ──> INSPECTION_MEMO ──> BLIND_EXECUTION ──> SOLVE_VERIFY / DNF  │
│ * Dual Precision Timers (performance.now() memo / execution tracking)                  │
│ * Shrouded Three.js Material Shaders (realistic blindfold experience)                  │
│ * Mnemonic Memo Recall & Accuracy Verification Dashboard                               │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Immutable Data Contracts

```typescript
import { SpeffzLetter, SpeffzMode } from './speffz';

// ============================================================================
// 1. PURE CUBE MATHEMATICAL DOMAIN CONTRACTS
// ============================================================================

export type StandardFace = 'U' | 'D' | 'F' | 'B' | 'L' | 'R';
export type MoveModifier = '' | "'" | '2';
export type MoveFamily = StandardFace | 'u' | 'd' | 'f' | 'b' | 'l' | 'r' | 'M' | 'E' | 'S' | 'x' | 'y' | 'z';

export interface WCAMove {
  raw: string;          // e.g. "R", "U'", "F2", "Rw", "M2", "x"
  family: MoveFamily;   // Base move family
  isWide: boolean;      // True for wide moves (e.g. "Rw", "r")
  amount: 1 | 2 | 3;    // 1 = 90° CW, 2 = 180°, 3 = 90° CCW
}

export type FaceletColorIndex = 0 | 1 | 2 | 3 | 4 | 5; // 0=U(White), 1=L(Orange), 2=F(Green), 3=R(Red), 4=B(Blue), 5=D(Yellow)

export interface ICubeState {
  /**
   * Corner Permutation: Array of 8 piece indices (0..7)
   * 0=UBL, 1=UBR, 2=UFR, 3=UFL, 4=DFL, 5=DFR, 6=DBR, 7=DBL
   */
  readonly cp: Readonly<Uint8Array>;

  /**
   * Corner Orientation: Array of 8 values (0..2)
   * 0 = Solved/Normal, 1 = Clockwise Twist, 2 = Counter-Clockwise Twist
   * Invariant: Sum(co) mod 3 === 0
   */
  readonly co: Readonly<Uint8Array>;

  /**
   * Edge Permutation: Array of 12 piece indices (0..11)
   * 0=UB, 1=UR, 2=UF, 3=UL, 4=FL, 5=FR, 6=BR, 7=BL, 8=DF, 9=DR, 10=DB, 11=DL
   */
  readonly ep: Readonly<Uint8Array>;

  /**
   * Edge Orientation: Array of 12 values (0..1)
   * 0 = Solved/Good, 1 = Flipped/Bad
   * Invariant: Sum(eo) mod 2 === 0
   */
  readonly eo: Readonly<Uint8Array>;

  /**
   * 54 Facelet Array in standard Kociemba order
   */
  readonly facelets: Readonly<Uint8Array>;

  applyMove(move: WCAMove | string): ICubeState;
  applyScramble(scramble: string): ICubeState;
  isSolved(): boolean;
  clone(): ICubeState;
}

// ============================================================================
// 2. 3BLD CYCLE TRACING SOLVER CONTRACTS
// ============================================================================

export type EdgeBufferLocation = 'UF' | 'DF' | 'UB' | 'UR';
export type CornerBufferLocation = 'UFR' | 'UFL' | 'UBL';

export interface CycleTracingConfig {
  edgeBuffer: EdgeBufferLocation;       // Default: 'UF' (Speffz 'C' / 'I')
  cornerBuffer: CornerBufferLocation;   // Default: 'UFR' (Speffz 'C' / 'J' / 'M')
  edgeBreakPriority: SpeffzLetter[];    // e.g. ['A', 'B', 'D', 'E', 'F', 'G', 'H', ...]
  cornerBreakPriority: SpeffzLetter[];  // e.g. ['A', 'B', 'D', 'E', 'F', 'G', 'H', ...]
}

export interface InPlaceEdgeFlip {
  piece: string;                        // e.g. "UB"
  targetLetters: [SpeffzLetter, SpeffzLetter]; // e.g. ['A', 'Q']
}

export interface InPlaceCornerTwist {
  piece: string;                        // e.g. "UBL"
  direction: 'CW' | 'CCW';
  primaryTarget: SpeffzLetter;          // Shooting target (e.g. 'E' for CW or 'R' for CCW)
}

export interface TracedCycleSegment {
  cycleIndex: number;
  targets: SpeffzLetter[];
  isBufferCycle: boolean;
}

export interface BLDSolverResult {
  edgeTargets: SpeffzLetter[];          // Full edge sequence (e.g. ['A', 'B', 'M', 'N'])
  cornerTargets: SpeffzLetter[];        // Full corner sequence
  edgeMemoPairs: string[];              // Chunked pairs (e.g. ['AB', 'MN'])
  cornerMemoPairs: string[];
  edgeCycles: TracedCycleSegment[];
  cornerCycles: TracedCycleSegment[];
  inPlaceFlips: InPlaceEdgeFlip[];
  inPlaceTwists: InPlaceCornerTwist[];
  hasParity: boolean;                   // True if target length is odd
  parityAlgRecommendation?: 'OP' | 'J-perm' | 'Ra-perm';
}

// ============================================================================
// 3. VIRTUAL BLIND EXECUTION ENGINE CONTRACTS
// ============================================================================

export type BlindPhase = 
  | 'IDLE' 
  | 'INSPECTION_MEMO' 
  | 'BLIND_EXECUTION' 
  | 'SOLVE_VERIFICATION' 
  | 'SOLVE_COMPLETED';

export interface BlindSolveMetrics {
  scramble: string;
  memoTimeMs: number;
  executionTimeMs: number;
  totalTimeMs: number;
  moveCount: number;
  tps: number;
  isSuccess: boolean;
  isDNF: boolean;
  dnfReason?: string;
  userMemoInput?: string;
  computedMemoString: string;
  memoAccuracyPercentage: number;
}

// ============================================================================
// 4. SMART CUBE BLUETOOTH GATEWAY CONTRACTS
// ============================================================================

export interface SmartCubeMoveEvent {
  move: string;                         // e.g. "U", "R'", "F2"
  timestamp: number;                    // Hardware millisecond timestamp
  rawBytes: Uint8Array;
}

export interface SmartCubeOrientationEvent {
  quaternion: [number, number, number, number]; // [x, y, z, w]
  euler: [number, number, number];              // [pitch, roll, yaw] in radians
}

export type SmartCubeManufacturer = 'GAN' | 'MoYu' | 'QiYi' | 'Giiker' | 'Unknown';

export interface ISmartCubeDriver {
  readonly manufacturer: SmartCubeManufacturer;
  readonly deviceName: string;
  connect(): Promise<boolean>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  getBatteryLevel(): Promise<number>;
  onMove(callback: (event: SmartCubeMoveEvent) => void): () => void;
  onOrientationChange?(callback: (event: SmartCubeOrientationEvent) => void): () => void;
  resetOrientation?(): Promise<void>;
}
```

---

## Affected Files

### New Domain & Service Directories:
- `src/services/cube/`:
  - `src/services/cube/CubeState.ts`: Pure mathematical state vector and move permutations.
  - `src/services/cube/ScrambleParser.ts`: WCA notation lexer and tokenizer.
  - `src/services/cube/constants.ts`: Permutation transition lookup tables for all 18 base face turns.
- `src/services/bld/`:
  - `src/services/bld/CycleTracer.ts`: 3BLD graph cycle tracing engine.
  - `src/services/bld/bldConstants.ts`: Piece-to-Speffz mapping definitions and default buffers.
- `src/services/blind/`:
  - `src/services/blind/BlindStateMachine.ts`: Dual-timer execution and validation coordinator.
- `src/services/bluetooth/`:
  - `src/services/bluetooth/SmartCubeDriver.ts`: Abstract gateway interface.
  - `src/services/bluetooth/GanDriver.ts`: GAN Gen 2/3 AES-128 encrypted GATT driver.
  - `src/services/bluetooth/MoyuDriver.ts`: MoYu AI unencrypted frame driver.
  - `src/services/bluetooth/QiYiDriver.ts`: QiYi Smart 3x3 driver.
- `src/types/scramble.ts`: Pure cube and move type definitions.
- `src/types/bldSolver.ts`: 3BLD solver and cycle contracts.
- `src/types/blind.ts`: Virtual blind state machine types.
- `src/types/bluetooth.ts`: Smart Cube Web Bluetooth contracts.

### Modified Files:
- `src/components/CubeViewport.tsx`: Add blinded shader material mode and live IMU orientation binding.
- `src/App.tsx`: Integrate Phase 2 mode switcher (Reference Mode $\leftrightarrow$ Scramble & Solve Mode).

---

## Step-by-Step Micro-Tasks

### Step 1: Implement Pure Mathematical Scramble & Permutation Engine (`src/services/cube/`)
1. In `src/services/cube/constants.ts`:
   - Define canonical solved permutation vectors: `SOLVED_CP = [0, 1, 2, 3, 4, 5, 6, 7]`, `SOLVED_CO = [0, 0, 0, 0, 0, 0, 0, 0]`, `SOLVED_EP = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]`, `SOLVED_EO = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]`.
   - Define base 90° CW permutation cycles and orientation increments for the 6 primary faces:
     - **U Move**:
       - $\mathbf{cp}$: $(0 \to 1 \to 2 \to 3)$, $\Delta\mathbf{co} = [0, 0, 0, 0]$
       - $\mathbf{ep}$: $(0 \to 1 \to 2 \to 3)$, $\Delta\mathbf{eo} = [0, 0, 0, 0]$
     - **R Move**:
       - $\mathbf{cp}$: $(1 \to 6 \to 5 \to 2)$, $\Delta\mathbf{co} = [1, 2, 1, 2]$ (twist modulo 3)
       - $\mathbf{ep}$: $(1 \to 6 \to 9 \to 5)$, $\Delta\mathbf{eo} = [0, 0, 0, 0]$
     - **F Move**:
       - $\mathbf{cp}$: $(2 \to 5 \to 4 \to 3)$, $\Delta\mathbf{co} = [1, 2, 1, 2]$
       - $\mathbf{ep}$: $(2 \to 5 \to 8 \to 4)$, $\Delta\mathbf{eo} = [1, 1, 1, 1]$ (flipped modulo 2)
     - **D Move**:
       - $\mathbf{cp}$: $(4 \to 5 \to 6 \to 7)$, $\Delta\mathbf{co} = [0, 0, 0, 0]$
       - $\mathbf{ep}$: $(8 \to 9 \to 10 \to 11)$, $\Delta\mathbf{eo} = [0, 0, 0, 0]$
     - **L Move**:
       - $\mathbf{cp}$: $(0 \to 3 \to 4 \to 7)$, $\Delta\mathbf{co} = [1, 2, 1, 2]$
       - $\mathbf{ep}$: $(3 \to 4 \to 11 \to 7)$, $\Delta\mathbf{eo} = [0, 0, 0, 0]$
     - **B Move**:
       - $\mathbf{cp}$: $(0 \to 7 \to 6 \to 1)$, $\Delta\mathbf{co} = [1, 2, 1, 2]$
       - $\mathbf{ep}$: $(0 \to 7 \to 10 \to 6)$, $\Delta\mathbf{eo} = [1, 1, 1, 1]$
2. In `src/services/cube/ScrambleParser.ts`:
   - Tokenize WCA scramble string via regex `/([UDFBLRudfblrMESxyz]|Uw|Dw|Fw|Bw|Lw|Rw)('?|2)/g`.
   - Expand wide moves, slice moves ($M = L' R x'$, $E = D' U y'$, $S = F' B z$), and cube rotations ($x, y, z$) into equivalent face turn sequences.
3. In `src/services/cube/CubeState.ts`:
   - Implement `applyMove` and `applyScramble` applying permutation cycles and updating facelet array.

### Step 2: Implement 3BLD Graph Cycle Tracing Engine (`src/services/bld/`)
1. Define piece-to-Speffz sticker lookup tables in `src/services/bld/bldConstants.ts`:
   - Corners: 8 cubies $\times$ 3 orientations mapped to Speffz letters (e.g. Piece 0 [UBL]: $co=0 \to \text{'A'}, co=1 \to \text{'E'}, co=2 \to \text{'R'}$).
   - Edges: 12 cubies $\times$ 2 orientations mapped to Speffz letters (e.g. Piece 2 [UF]: $eo=0 \to \text{'C'}, eo=1 \to \text{'I'}$).
2. In `src/services/bld/CycleTracer.ts`:
   - Implement `traceEdges(state: ICubeState, config: CycleTracingConfig)`:
     - Track `visited[12] = false`. Mark buffer slot as visited.
     - While unsolved pieces remain:
       - If buffer contains buffer piece: break cycle to lowest-index unvisited piece in `config.edgeBreakPriority`. Append break target, set cycle start.
       - Else: get target Speffz letter for current piece at buffer slot, mark piece visited, append target, advance slot.
     - Scan for in-place flips: pieces in correct slot with $eo = 1$.
   - Implement `traceCorners(state: ICubeState, config: CycleTracingConfig)`:
     - Similar logic for 8 corner cubies with $co \in \{1, 2\}$ detecting in-place twists.
   - Parity Evaluation: Check if `edgeTargets.length % 2 !== 0` or `cornerTargets.length % 2 !== 0`. Flag `hasParity: true`.

### Step 3: Implement Virtual Blind State Machine & Shrouded Shader (`src/services/blind/`)
1. In `src/services/blind/BlindStateMachine.ts`:
   - Manage state transitions: `IDLE` $\to$ `INSPECTION_MEMO` $\to$ `BLIND_EXECUTION` $\to$ `SOLVE_VERIFICATION`.
   - Record high-precision timestamps (`performance.now()`) for inspection duration and execution duration.
   - Validate solved state by checking `state.isSolved()`.
   - Calculate user recall score: Compare user-typed mnemonic sequence against `BLDSolverResult`.
2. In `src/components/CubeViewport.tsx`:
   - Add `isBlindMode: boolean` prop.
   - When active, swap sticker materials with an obscured matte black standard material (`color: 0x090d16, roughness: 0.95`), hiding Speffz lettering while preserving 3D spatial rotation.

### Step 4: Implement Smart Cube Bluetooth Driver Layer (`src/services/bluetooth/`)
1. Implement `src/services/bluetooth/SmartCubeDriver.ts` interface.
2. Implement `GanDriver.ts`:
   - Connect via Web Bluetooth GATT service `0000fff0-0000-1000-8000-00805f9b34fb`.
   - Decrypt payload packets using AES-128 encryption key computed from Bluetooth device MAC.
   - Decode gyro quaternion $[w, x, y, z]$ and dispatch face turn events.
3. Implement `MoyuDriver.ts` and `QiYiDriver.ts`:
   - Listen to unencrypted notification characteristics, parsing optical encoder transitions into standard `WCAMove` events.

---

## Verification Criteria

### 1. Mathematical Scramble & Group Theory Test Suite (`src/test/cubeState.test.ts`)
- **Move Inverse Invariants**: For all 18 base moves $M$, assert $M + M' = I$ (Identity) and $M + M + M + M = I$.
- **Known Algorithmic Invariants**:
  - Sexy Move: $(R U R' U')^6 = I$.
  - Sune: $(R U R' U R U2 R')^6 = I$.
  - T-Permutation: $R U R' U' R' F R2 U' R' U' R U R' F'$ correctly swaps corners UFR/UBR and edges UR/UL without disturbing other pieces.
  - Superflip: 20-move superflip sequence inverts all 12 edge orientations ($eo = [1, 1, \dots, 1]$) with zero corner or edge permutations ($cp = I, ep = I, co = 0$).

### 2. 3BLD Cycle Tracing Solver Test Suite (`src/test/cycleTracer.test.ts`)
- **Solved Cube**: Tracing a solved cube returns empty edge targets `[]`, empty corner targets `[]`, and `hasParity: false`.
- **Single 3-Cycle**: Apply $U$ move. Tracing corners with UFR buffer correctly yields the exact 3-cycle targets.
- **Cycle Break Scenario**: Apply $(R U R' U')$ on solved cube. Verify tracer breaks cycle cleanly to unvisited pieces and closes the loop without infinite looping.
- **In-Place Flips and Twists**: Apply superflip; verify 12 in-place flips recorded. Apply corner orientation alg; verify in-place CW/CCW twists identified.
- **Parity Detection**: Apply J-Perm (odd permutation). Verify `hasParity: true` is asserted for both corners and edges.

### 3. Virtual Blind State Machine Test Suite (`src/test/blindStateMachine.test.ts`)
- Assert transitions: Cannot transition from `IDLE` directly to `BLIND_EXECUTION` without `INSPECTION_MEMO`.
- Assert timer precision: `totalTimeMs === memoTimeMs + executionTimeMs`.

---

## Context Pruning
The Builder must ONLY read and edit the following files to implement this specification:
1. `src/types/speffz.ts` & `src/constants/speffzData.ts` (Existing Speffz foundation)
2. `src/services/cube/CubeState.ts` (Pure cube permutation engine)
3. `src/services/bld/CycleTracer.ts` (3BLD graph solver)
