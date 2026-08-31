# Technical Review & Adversarial Challenge Report

**Date**: 2026-08-31
**Reviewer**: Reviewer 1 (Independent Reviewer & Adversarial Critic)
**Artifacts Reviewed**:
1. `.plans/webgl-quality-hardening.md`
2. `.plans/bld-data-integrity-audit.md`
3. Baseline source files: `src/components/CubeViewport.tsx`, `src/constants/speffzData.ts`, `src/data/wordlist.json`, `src/services/mnemonicService.ts`, `vite.config.ts`, `src/test/*`
4. Upstream requirements: `ORIGINAL_REQUEST.md` (R1, R2, R3), `PROJECT.md`, `design.md`

---

## 1. Executive Summary & Verdict

**Overall Verdict**: **REQUEST_CHANGES**

| Deliverable / Area | Verdict | Summary |
|---|---|---|
| `.plans/webgl-quality-hardening.md` | **APPROVE (with Minor Notes)** | Excellent memory lifecycle analysis, texture cache design, raycaster pooling, touch gesture isolation, and WCAG contrast calculations. |
| `.plans/bld-data-integrity-audit.md` | **REQUEST_CHANGES** | **Critical flaw in Task 1 Kociemba indexing table** (severe coordinate/facelet mapping errors across R, F, and B faces), unaddressed duplicate word defect in `wordlist.json` (`OG`), and heuristic flaws in vowel-pair phonetic generation. |
| Codebase Integrity & Tests | **REQUEST_CHANGES** | TypeScript build fails (`npm run build`) due to unused variable declarations in newly added test files; Vitest assertions in `colorContrast.test.ts` contain inaccurate hardcoded luminance values. |

---

## 2. Detailed Findings

### [CRITICAL] Finding 1: Corrupted Kociemba Facelet Indexing Table in `bld-data-integrity-audit.md`
- **Location**: `.plans/bld-data-integrity-audit.md`, Section 4 (Step-by-Step Micro-Tasks), Task 1 (lines 133, 134, 137).
- **Description**: The Kociemba facelet indexing table mapping 54 facelet indices ($0 \dots 53$) to Speffz stickers contains critical spatial layout errors for the **R (Right)**, **F (Front)**, and **B (Back)** faces.
- **Empirical Evidence & Discrepancies**:
  1. **R Face (indices 9..17)**:
     - *Plan specified*: `R1(9, B-corner), R2(10, B-edge), R3(11, N-corner), R4(12, N-edge), R5(13, R-center), R6(14, P-edge), R7(15, M-corner), R8(16, M-edge), R9(17, O-corner)`.
     - *Physical Reality & Speffz Contract*: 'B' is a U-face sticker, NOT an R-face sticker.
     - *Correct Mapping*:
       - `R1` (index 9, top-left [1, 1, 1]): **M-corner** (`UFR (R)`)
       - `R2` (index 10, top [1, 1, 0]): **M-edge** (`UR (R)`)
       - `R3` (index 11, top-right [1, 1, -1]): **N-corner** (`UBR (R)`)
       - `R4` (index 12, left [1, 0, 1]): **P-edge** (`FR (R)`)
       - `R5` (index 13, center [1, 0, 0]): **R-center** (`R Center`)
       - `R6` (index 14, right [1, 0, -1]): **N-edge** (`BR (R)`)
       - `R7` (index 15, bottom-left [1, -1, 1]): **P-corner** (`DFR (R)`)
       - `R8` (index 16, bottom [1, -1, 0]): **O-edge** (`DR (R)`)
       - `R9` (index 17, bottom-right [1, -1, -1]): **O-corner** (`DBR (R)`)
  2. **F Face (indices 18..26)**:
     - *Plan specified*: `F1(18, D-corner), F2(19, C-edge), F3(20, C-corner), F4(21, L-edge), F5(22, F-center), F6(23, J-edge), F7(24, I-corner), F8(25, K-edge), F9(26, J-corner)`.
     - *Physical Reality & Speffz Contract*: 'D' and 'C' are U-face stickers.
     - *Correct Mapping*:
       - `F1` (index 18, top-left [-1, 1, 1]): **I-corner** (`UFL (F)`)
       - `F2` (index 19, top [0, 1, 1]): **I-edge** (`UF (F)`)
       - `F3` (index 20, top-right [1, 1, 1]): **J-corner** (`UFR (F)`)
       - `F4` (index 21, left [-1, 0, 1]): **L-edge** (`FL (F)`)
       - `F5` (index 22, center [0, 0, 1]): **F-center** (`F Center`)
       - `F6` (index 23, right [1, 0, 1]): **J-edge** (`FR (F)`)
       - `F7` (index 24, bottom-left [-1, -1, 1]): **L-corner** (`DFL (F)`)
       - `F8` (index 25, bottom [0, -1, 1]): **K-edge** (`DF (F)`)
       - `F9` (index 26, bottom-right [1, -1, 1]): **K-corner** (`DFR (F)`)
  3. **B Face (indices 45..53)**:
     - *Plan inverted several pairs*: B1/B3 (specified R/Q, actually Q/R), B4/B6 (specified R/T, actually T/R), and B7/B9 (specified S/T, actually T/S).
     - *Correct Mapping*:
       - `B1` (index 45): **Q-corner** (`UBR (B)`)
       - `B2` (index 46): **Q-edge** (`UB (B)`)
       - `B3` (index 47): **R-corner** (`UBL (B)`)
       - `B4` (index 48): **T-edge** (`BR (B)`)
       - `B5` (index 49): **B-center** (`B Center`)
       - `B6` (index 50): **R-edge** (`BL (B)`)
       - `B7` (index 51): **T-corner** (`DBR (B)`)
       - `B8` (index 52): **S-edge** (`DB (B)`)
       - `B9` (index 53): **S-corner** (`DBL (B)`)
- **Impact**: If the Builder follows the specification table directly, the cube mathematical domain engine and Kociemba solver will receive inverted facelet inputs, producing invalid 3BLD cycle traces and scrambled solver crashes.
- **Required Fix**: Rewrite Task 1 lines 133–137 with the verified orthonormal facelet mapping table.

---

### [MAJOR] Finding 2: Unresolved Duplicate Mnemonic Word in `src/data/wordlist.json`
- **Location**: `src/data/wordlist.json`, key `"OG"`.
- **Description**: The dictionary contains a duplicate word in pair `"OG"`:
  ```json
  "OG": ["Ogre", "Organic", "Origami", "Ogre"]
  ```
  Word `"Ogre"` is repeated at index 0 and index 3.
- **Impact**: Breaks the 4 unique curated words guarantee and causes test failure in `src/test/dictionaryIntegrity.test.ts` (`uniqueInPair.size === 3 !== 4`).
- **Required Fix**: Replace the duplicate `"Ogre"` in `"OG"` with a distinct mnemonic word (e.g., `"Ogle"`, `"Oxygen"`, or `"Oatmeal"`). Update `bld-data-integrity-audit.md` to include this dictionary cleanup task.

---

### [MAJOR] Finding 3: TypeScript Build Failure (`npm run build`)
- **Location**: `src/test/dictionaryIntegrity.test.ts:23`, `src/test/speffzData.test.ts:71, 107`.
- **Description**: `npm run build` executes `tsc && vite build`. TypeScript strictly flags unused local variables under `noUnusedLocals`:
  - `dictionaryIntegrity.test.ts:23:40`: `'pair' is declared but its value is never read.`
  - `speffzData.test.ts:71:33`: `'posKey' is declared but its value is never read.`
  - `speffzData.test.ts:107:33`: `'posKey' is declared but its value is never read.`
- **Impact**: The repository fails CI/CD build gates.
- **Required Fix**: Prefix unused callback arguments with an underscore (e.g. `_pair`, `_posKey`).

---

### [MINOR] Finding 4: Flawed Assertions in `src/test/colorContrast.test.ts`
- **Location**: `src/test/colorContrast.test.ts`, lines 58, 131, 137.
- **Description**:
  1. Line 58 asserts `expect(lGreen).toBeCloseTo(0.443, 2)`. The exact sRGB relative luminance of `#22c55e` is `0.4108` (difference $> 0.03$).
  2. Line 131 asserts `expect(ratioOnAppBg).toBeGreaterThan(10.0)` for Brand Blue (`#1E3A8A`) on App Background (`#F9FAFB`). The actual ratio is `9.91:1`, which passes WCAG AAA ($> 7.0:1$), but fails the arbitrary $> 10.0$ threshold.
  3. Line 137 asserts `expect(ratio).toBeGreaterThan(10.0)` for Highlight Cyan (`#38bdf8`) with Dark Slate (`#090d16`). The actual ratio is `9.07:1`, which passes WCAG AAA ($> 7.0:1$), but fails the arbitrary $> 10.0$ threshold.
- **Required Fix**: Adjust test assertions to match exact mathematical values and standard WCAG thresholds ($\ge 7.0:1$ for AAA, $\ge 4.5:1$ for AA).

---

### [MINOR] Finding 5: Rollup `manualChunks` Configuration Fragility in Vite
- **Location**: `.plans/bld-data-integrity-audit.md`, Task 2 (lines 143–148).
- **Description**: The plan specifies an object dictionary for `manualChunks`:
  ```typescript
  manualChunks: {
    'vendor-three': ['three', 'three-stdlib'],
    'vendor-react': ['react', 'react-dom', 'lucide-react'],
    'bld-dictionary': ['./src/data/wordlist.json'],
  }
  ```
  In Vite / Rollup 4+, passing relative file paths in the object format frequently fails to match internal module resolution IDs (which use normalized absolute paths like `c:/.../src/data/wordlist.json`).
- **Required Fix**: Provide a function-based `manualChunks` resolver or document the exact module ID matching pattern:
  ```typescript
  manualChunks(id) {
    if (id.includes('node_modules/three') || id.includes('node_modules/three-stdlib')) return 'vendor-three';
    if (id.includes('node_modules/react') || id.includes('node_modules/lucide-react')) return 'vendor-react';
    if (id.includes('wordlist.json')) return 'bld-dictionary';
  }
  ```

---

## 3. Deliverable-by-Deliverable Detailed Assessment

### A. Review of `webgl-quality-hardening.md` (WebGL & Memory Hardening)
- **Strengths**:
  - **Memory Lifecycle**: Recursive `disposeSceneGraph` utility, explicit `renderer.dispose()` and `renderer.forceContextLoss()`, RAF loop cancellation, and removal of event listeners thoroughly resolve the Three.js canvas memory leak.
  - **Texture Caching**: Proposes a key-indexed cache (`Map<string, THREE.CanvasTexture>`) that prevents 54 `<canvas>` allocations on every state update, reducing CPU/GPU frame stutter.
  - **Raycasting Optimizations**: Pools `THREE.Raycaster` and `THREE.Vector2` instances, eliminating per-frame heap allocations; restricts intersection testing to visible stickers.
  - **Touch & Mobile UX**: Introduces `touch-action: none` to isolate 3D rotational drag from browser gestures, alongside adaptive tap tolerance ($8\text{px} / 300\text{ms}$).
  - **WCAG 2.1 AA**: Evaluates color contrast accurately. Switching Green and Orange faces to dark slate text `#0f172a` raises contrast from failing values ($2.28:1$ and $2.80:1$) to compliant values ($7.83:1$ and $6.37:1$).
- **Structural Conformance**: Complies 100% with `/.agents/rules/planner.md`.

### B. Review of `bld-data-integrity-audit.md` (BLD Data Integrity)
- **Strengths**:
  - Validates Speffz 54-sticker geometry invariants (orthonormality, 8 corner cubies, 12 edge cubies, 6 center cubies).
  - Outlines multi-target 3D cycle path visualization with ordered target badges and pair color-coding.
  - Identifies Vite bundle splitting to isolate Three.js and the 576-pair dictionary.
- **Deficiencies (Blocking)**:
  - Critical spatial indexing errors in Task 1 Kociemba facelet table (see Finding 1).
  - Missed duplicate entry `"OG"` in `wordlist.json` (see Finding 2).
  - Overly simplistic vowel interpolation algorithm that produces invalid tri-vowel clusters on vowel-vowel pairs (e.g. `AE` $\to$ `AAE`).

### C. Requirements Traceability Matrix (`ORIGINAL_REQUEST.md` & `PROJECT.md`)

| Requirement | Scope | Status in Plans | Reviewer Verification |
|---|---|---|---|
| **R1. WebGL & Rendering Pipeline Audit** | Memory leaks, texture disposal, OrbitControls, raycasting, context loss | Fully addressed in `webgl-quality-hardening.md` | Verified. Solves GPU memory exhaustion & re-rasterization bottleneck. |
| **R2. Core BLD Data Contracts** | 54-sticker Speffz mapping, 576-pair dictionary, phonetic fallbacks | Addressed in `bld-data-integrity-audit.md` | Incomplete due to Kociemba indexing errors & `OG` duplicate word. |
| **R3. Quality, Tests & Conformance** | Vitest suite, WCAG 2.1 AA contrast, touch target metrics $\ge 44\text{px}$ | Addressed across both plans | Verified. Contrast & touch target audits are mathematically sound. |

---

## 4. Verified Claims & Mathematical Evidence Table

### 4.1 WCAG 2.1 Color Contrast Ratios (Empirically Verified)

| Color Pair / Surface | Hex Values | Contrast Ratio | WCAG AA Status | WCAG AAA Status |
|---|---|---|---|---|
| **U Face (White) + Dark Text** | `#f8fafc` on `#0f172a` | **17.06 : 1** | PASS ($\ge 4.5:1$) | PASS ($\ge 7.0:1$) |
| **D Face (Yellow) + Dark Text** | `#eab308` on `#0f172a` | **9.31 : 1** | PASS ($\ge 4.5:1$) | PASS ($\ge 7.0:1$) |
| **F Face (Green) + White Text (Current)** | `#22c55e` on `#ffffff` | **2.28 : 1** | **FAIL** ($< 4.5:1$) | **FAIL** ($< 7.0:1$) |
| **F Face (Green) + Dark Text (Proposed)** | `#22c55e` on `#0f172a` | **7.83 : 1** | **PASS** ($\ge 4.5:1$) | **PASS** ($\ge 7.0:1$) |
| **L Face (Orange) + White Text (Current)**| `#f97316` on `#ffffff` | **2.80 : 1** | **FAIL** ($< 4.5:1$) | **FAIL** ($< 7.0:1$) |
| **L Face (Orange) + Dark Text (Proposed)**| `#f97316` on `#0f172a` | **6.37 : 1** | **PASS** ($\ge 4.5:1$) | PASS (Large text) |
| **B Face (Blue) + White Text** | `#3b82f6` on `#ffffff` | **3.68 : 1** | PASS (Large text $\ge 3:1$) | FAIL |
| **R Face (Red) + White Text** | `#ef4444` on `#ffffff` | **3.76 : 1** | PASS (Large text $\ge 3:1$) | FAIL |
| **Placeholder Slate-400 on White** | `#94a3b8` on `#ffffff` | **2.56 : 1** | **FAIL** ($< 4.5:1$) | **FAIL** |
| **Proposed Slate-500 on White** | `#64748b` on `#ffffff` | **4.76 : 1** | **PASS** ($\ge 4.5:1$) | FAIL |
| **Proposed Slate-500 on AppBg** | `#64748b` on `#f9fafb` | **4.55 : 1** | **PASS** ($\ge 4.5:1$) | FAIL |
| **Brand Primary Navy on White** | `#1e3a8a` on `#ffffff` | **10.36 : 1** | **PASS** ($\ge 4.5:1$) | **PASS** ($\ge 7.0:1$) |
| **Active Highlight Cyan + Dark Text** | `#38bdf8` on `#090d16` | **9.07 : 1** | **PASS** ($\ge 4.5:1$) | **PASS** ($\ge 7.0:1$) |

### 4.2 Speffz Geometry Invariants Audit

- **Total Sticker Count**: 54 stickers (24 corners, 24 edges, 6 centers) $\to$ **100% verified**.
- **Normal Orthogonality**: All 54 stickers have $\|\mathbf{n}\| = 1.0$, exactly aligned with their corresponding face vector $\to$ **100% verified**.
- **Corner Cubies**: 8 unique cubie coordinates, each containing 3 mutually orthogonal stickers from 3 distinct faces $\to$ **100% verified**.
- **Edge Cubies**: 12 unique cubie coordinates, each containing 2 orthogonal stickers from 2 distinct faces $\to$ **100% verified**.
- **Center Cubies**: 6 unique cubie coordinates with 1 sticker each $\to$ **100% verified**.

### 4.3 576-Pair SpeedSolving Dictionary Audit

- **Key Permutations**: Exactly 576 keys ($24 \times 24$, letters $A \dots X$) $\to$ **100% verified**.
- **Total Word Count**: Exactly 2,304 words across 576 entries $\to$ **100% verified**.
- **String Sanitation**: Zero empty strings, zero undefined values, zero untrimmed whitespace $\to$ **100% verified**.
- **Defect Found**: Pair `"OG"` contains duplicate word `["Ogre", "Organic", "Origami", "Ogre"]` $\to$ **Flagged in Finding 2**.

---

## 5. Adversarial Stress-Testing & Attack Surface Analysis

### Challenge 1: WebGL Context Restoration State Sync
- **Assumption**: Binding `webglcontextrestored` on `renderer.domElement` will automatically recover the Three.js viewport.
- **Attack Scenario**: When the GPU is preempted (e.g. laptop clamshell close / sleep), WebGL textures and vertex buffers are wiped. If `TextureCacheService` retains stale `THREE.CanvasTexture` instances created on the old context, drawing will produce blank black tiles or shader bind errors.
- **Blast Radius**: Black canvas / total 3D viewport freeze after waking from sleep.
- **Mitigation**: On `webglcontextlost`, call `textureCache.clear()` and nullify all cached material references. On `webglcontextrestored`, trigger a clean re-initialization of geometries, materials, and textures from scratch.

### Challenge 2: Phonetic Fallback Degradation on Vowel Pairs
- **Assumption**: Vowel interpolation $C_1 + \text{Vowel} + C_2$ produces valid pronounceable words.
- **Attack Scenario**: Speffz letters include vowels ($A, E, I, O, U$). For vowel-vowel pairs such as $AE, EI, OU, EA$, interpolating a vowel yields $AAE, EIE, OUU$, which are unpronounceable and fail as competitive audio memory aids.
- **Blast Radius**: Malformed, non-memorizable mnemonic suggestions when drilling vowel-heavy letter pairs.
- **Mitigation**: Branch based on character classification:
  - Consonant + Consonant: $C_1 + V + C_2$ (e.g. $B + T \to \text{BAT}$).
  - Vowel + Vowel: $V_1 + C + V_2$ (e.g. $E + T + A \to \text{ETA}$, $A + P + E \to \text{APE}$).
  - Vowel + Consonant: $V + C + \text{Suffix}$ or standard word completion.

### Challenge 3: Multi-Touch & Pinch Zoom Interaction Interference
- **Assumption**: Pointer event delta threshold $dx < 4, dy < 4$ prevents drag-vs-click confusion.
- **Attack Scenario**: A user performs a two-finger pinch-to-zoom gesture on mobile. As fingers leave the screen, `handlePointerUp` fires for the second pointer with near-zero delta, erroneously selecting a sticker and appending unwanted letters to the sequence.
- **Blast Radius**: Unintended sticker selections during camera zoom/orbit on mobile devices.
- **Mitigation**: Track the active primary `pointerId`. If multiple active pointers are detected (pinch-zoom), suppress sticker click triggers until all pointers are released.

---

## 6. Structural Compliance with `/.agents/rules/planner.md`

| Section Constraint | `webgl-quality-hardening.md` | `bld-data-integrity-audit.md` | Compliance |
|---|---|---|---|
| `## Architectural Overview` | Present (lines 3–34) | Present (lines 3–51) | PASS |
| `## Immutable Data Contracts` | Present (lines 36–95) | Present (lines 53–107) | PASS |
| `## Affected Files` | Present (lines 98–114) | Present (lines 110–125) | PASS |
| `## Step-by-Step Micro-Tasks` | Present (lines 116–185) | Present (lines 127–169) | PASS |
| `## Verification Criteria` | Present (lines 187–205) | Present (lines 171–193) | PASS |
| `## Context Pruning` | Present (lines 207–212) | Present (lines 195–200) | PASS |

Both plans strictly adhere to the six mandatory section headers required by `planner.md`.

---

## 7. Action Items for Approval

To achieve **FULL APPROVAL**, the following adjustments are required:

1. **Update `bld-data-integrity-audit.md` Task 1**:
   - Replace the corrupted Kociemba facelet indexing table with the verified mappings for R, F, and B faces documented in Section 2 (Finding 1).
2. **Resolve Dictionary Duplicate in `src/data/wordlist.json` & Task**:
   - Fix pair `"OG"` by replacing the second `"Ogre"` with `"Ogle"`.
   - Add this fix to the plan's dictionary task.
3. **Fix TypeScript / Vitest Test Failures**:
   - Prefix unused variables in `dictionaryIntegrity.test.ts` (`_pair`) and `speffzData.test.ts` (`_posKey`) to ensure `npm run build` exits 0.
   - Adjust `colorContrast.test.ts` to use exact relative luminance (`0.4108` for Green) and standard WCAG thresholds ($\ge 7.0:1$ for AAA).
4. **Harden Rollup `manualChunks` in `bld-data-integrity-audit.md`**:
   - Update Task 2 to specify the function-based chunk resolver to prevent module ID resolution misses on Windows/Vite.
