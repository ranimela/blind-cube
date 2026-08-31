# Handoff Report: Architectural Specification Plans for Blind Cube

**Author:** Lead System Architect & Specification Engineer (`worker_1`)  
**Parent Conversation ID:** `df7d98e1-19c3-42c8-a812-72f1ef2d349a`  
**Date:** 2026-08-31T12:56:00Z  

---

## 1. Observation

1. **WebGL Lifecycle & Rendering Audit (`survey_explorer_1/analysis.md`, `src/components/CubeViewport.tsx:239-245, 248-264, 279-281`)**:
   - `CubeViewport.tsx:239-245` only called `controls.dispose()` and `renderer.dispose()`, omitting scene graph traversal, mesh geometry disposal, material disposal, and texture map disposal. `renderer.forceContextLoss()` was absent.
   - `CubeViewport.tsx:248-264` regenerated all 54 $256 \times 256$ canvas textures on every sticker click or keystroke, creating 54 DOM `<canvas>` elements and 54 GPU texture uploads per interaction.
   - `CubeViewport.tsx:279-281` instantiated `new THREE.Raycaster()`, `new THREE.Vector2()`, and `Array.from(meshesRef.current.values())` on every `pointermove` event.
   - Contrast calculation in `createStickerTexture` used white text `#ffffff` for Green (`#22c55e`, contrast $2.2:1$) and Orange (`#f97316`, contrast $2.9:1$), violating WCAG AA minimum $4.5:1$.
2. **BLD Core Logic & Data Contracts Audit (`survey_explorer_2/analysis.md`, `src/constants/speffzData.ts`, `src/data/wordlist.json`)**:
   - `src/data/wordlist.json` contains full $576/576$ letter-pair coverage ($24 \times 24$, letters A–X) with 4 words each (2,304 words total). Lookup latency is $5.89\text{ ns/lookup}$.
   - All 54 stickers in `speffzData.ts` accurately map to standard Speffz normals and 3D cubie positions, but lack explicit continuous Kociemba facelet indices ($0 \dots 53$) and cubie adjacency links.
   - Monolithic bundle size ($783.86\text{ KB}$ raw) triggered Vite chunk size warning (> 500 kB) because Three.js and `wordlist.json` were bundled directly into the main entry chunk.
3. **Strategic Blueprint & Testing Readiness (`survey_explorer_3/analysis.md`, `PROJECT.md`)**:
   - Test suite currently contains 1 file (`src/test/mnemonicService.test.ts`, 11 tests). Missing automated tests for 54-sticker geometry invariants, 576-pair dictionary integrity, and 3BLD cycle decomposition.
   - Outlined requirements for pure mathematical WCA scramble parser, group theory permutation transitions, 3BLD graph cycle tracer with configurable buffers, virtual blindfold state machine with dual timers and obscured shaders, and Web Bluetooth GATT drivers (GAN, MoYu, QiYi).

---

## 2. Logic Chain

1. From **Observation 1**, un-disposed WebGL resources and continuous RAF rendering cause memory leaks and high CPU/GPU load. Caching sticker textures into a `Map<string, THREE.CanvasTexture>` indexed by sticker ID and render state reduces per-click canvas allocations from 54 to 0 (or 1 on delta change). Pre-allocating `Raycaster` and `Vector2` refs prevents garbage collection stutter. Replacing white text on Green/Orange stickers with `#0f172a` elevates contrast above $6.8:1$, satisfying WCAG AAA standards.
2. From **Observation 2**, formalizing Kociemba facelet indexing ($0 \dots 53$) and cubie adjacency creates a bijective mapping between 3D stickers and permutation vectors. Configuring Rollup `manualChunks` splits `three` and `wordlist.json` into isolated cached chunks, dropping the main bundle under $40\text{ KB}$ and resolving the Vite size warning.
3. From **Observation 3**, decomposing the cube into state vectors $(\mathbf{cp} \in S_8, \mathbf{co} \in (\mathbb{Z}_3)^8, \mathbf{ep} \in S_{12}, \mathbf{eo} \in (\mathbb{Z}_2)^{12})$ enables exact group theory move permutations without floating point error. A graph-based cycle decomposition algorithm with visited bitmasks cleanly identifies target sequences, cycle breaks, in-place flips/twists, and parity ($N \pmod 2 \neq 0$).
4. Integrating these architectural requirements into three structured plans in `/.plans/` provides the Builder agent with atomic, step-by-step implementation specifications and the Validator agent with unambiguous test matrices.

---

## 3. Caveats

- **Web Bluetooth Browser Support**: The Web Bluetooth API is supported in Chromium-based browsers (Chrome, Edge, Opera, Android Chrome) but requires user gesture invocation and HTTPS origin. On unsupported platforms (Firefox, Safari iOS), the UI must provide graceful feature detection and fallback to keyboard simulation mode.
- **Physical IMU Calibration**: GAN smart cube gyro quaternions require an initial orientation tare (zeroing) step upon connection to align the physical cube's orientation with the 3D camera viewport.

---

## 4. Conclusion

All three required architectural specification plans have been generated in `c:\Users\rmelamed\Projects\blind-cube\.plans\`, strictly adhering to the schema defined in `/.agents/rules/planner.md`:
1. `c:\Users\rmelamed\Projects\blind-cube\.plans\webgl-quality-hardening.md`: Comprehensive Three.js lifecycle hardening, texture caching, `ResizeObserver`, context loss recovery, touch gestures, and WCAG 2.1 AA accessibility remediation.
2. `c:\Users\rmelamed\Projects\blind-cube\.plans\bld-data-integrity-audit.md`: 54-sticker geometry invariants, Kociemba indexing, Vite bundle splitting (`manualChunks`), advanced BLD phonetic heuristics, and multi-sticker 3D cycle path visualization.
3. `c:\Users\rmelamed\Projects\blind-cube\.plans\phase2-bld-strategic-blueprint.md`: Pure mathematical WCA scramble engine, 3BLD graph cycle tracer, virtual blind execution state machine, and Web Bluetooth Smart Cube driver layer.

---

## 5. Verification Method

To independently verify this specification delivery:
1. **Verify Plan Files Exist and Adhere to Required Layout**:
   - `c:\Users\rmelamed\Projects\blind-cube\.plans\webgl-quality-hardening.md`
   - `c:\Users\rmelamed\Projects\blind-cube\.plans\bld-data-integrity-audit.md`
   - `c:\Users\rmelamed\Projects\blind-cube\.plans\phase2-bld-strategic-blueprint.md`
   Confirm every plan contains all 6 mandated sections:
   - `## Architectural Overview`
   - `## Immutable Data Contracts`
   - `## Affected Files`
   - `## Step-by-Step Micro-Tasks`
   - `## Verification Criteria`
   - `## Context Pruning`
2. **Execute Current Project Test & Build Suite**:
   ```powershell
   npm test
   npm run build
   ```
   Confirm all tests pass and the production build completes cleanly.
