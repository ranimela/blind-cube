# Handoff Report — Core BLD Data Contracts & Logic Integrity Review

**Agent:** `survey_explorer_2`
**Date:** 2026-08-31
**Parent Task:** Core BLD Data Contracts & Logic Review (Requirement 2)
**Handoff Type:** Hard (Task Complete)

---

## 1. Observation

1. **Sticker Definitions & Mappings (`src/constants/speffzData.ts:23-146`):**
   - Contains 54 sticker definitions: 24 corners, 24 edges, 6 centers.
   - Normals and coordinates strictly follow standard Cartesian 3D conventions:
     - U: `[0, 1, 0]`, D: `[0, -1, 0]`, F: `[0, 0, 1]`, B: `[0, 0, -1]`, L: `[-1, 0, 0]`, R: `[1, 0, 0]`.
   - Corner cubie groupings form 8 distinct physical cubies:
     - UBL: `[-1, 1, -1]` (U: A, L: E, B: R)
     - UBR: `[1, 1, -1]` (U: B, R: N, B: Q)
     - UFR: `[1, 1, 1]` (U: C, F: J, R: M)
     - UFL: `[-1, 1, 1]` (U: D, L: F, F: I)
     - DFL: `[-1, -1, 1]` (D: U, L: G, F: L)
     - DFR: `[1, -1, 1]` (D: V, F: K, R: P)
     - DBR: `[1, -1, -1]` (D: W, R: O, B: T)
     - DBL: `[-1, -1, -1]` (D: X, L: H, B: S)
   - Edge cubie groupings form 12 distinct physical cubies:
     - UB: `[0, 1, -1]` (U: A, B: Q); UR: `[1, 1, 0]` (U: B, R: M); UF: `[0, 1, 1]` (U: C, F: I); UL: `[-1, 1, 0]` (U: D, L: E); FL: `[-1, 0, 1]` (L: F, F: L); FR: `[1, 0, 1]` (F: J, R: P); BR: `[1, 0, -1]` (R: N, B: T); BL: `[-1, 0, -1]` (L: H, B: R); DF: `[0, -1, 1]` (D: U, F: K); DR: `[1, -1, 0]` (D: V, R: O); DB: `[0, -1, -1]` (D: W, B: S); DL: `[-1, -1, 0]` (D: X, L: G).
   - Audited via `.agents/survey_explorer_2/audit_script.cjs`: `Total stickers: 54, Normal vector errors: 0, Unique corner positions: 8, Unique edge positions: 12`.

2. **Letter-Pair Database (`src/data/wordlist.json` & `generate-dict.cjs:8-608`):**
   - Verified 576 keys ($24 \times 24$, letters A-X).
   - Exactly 4 curated words per pair (2,304 total words).
   - Raw disk size: 40.63 KB. Minified JSON: 25.44 KB. Gzip size: 10.46 KB.
   - Benchmark via `.agents/survey_explorer_2/benchmark.cjs`: 1,000,000 lookups completed in 5.896 ms ($\approx 5.9\text{ ns/op}$). Heap used: 4.68 MB.

3. **Fallback & Procedural Logic (`src/services/mnemonicService.ts:7-63`):**
   - `SINGLE_LETTER_DEFAULTS` covers letters A to X with 4 visual defaults each.
   - `generateProceduralMnemonic(pair)` concatenates `"Word1 & Word2"` (line 60).
   - Because `wordlist.json` has 100% coverage, `generateProceduralMnemonic` is effectively unreachable for standard A-X pairs during dictionary lookups.

4. **Sequence Chunking & UI Sync (`src/services/mnemonicService.ts:97-127` & `src/components/CubeViewport.tsx:248-264`):**
   - `parseAndChunkSequence` properly handles even pairs, trailing odd parity single letters, and custom user overrides.
   - `CubeViewport.tsx` only highlights the single sticker matching `selectedStickerId` (line 189, 254). Typing a sequence does not visually highlight multi-sticker cycle paths on the 3D cube.

5. **Build & Bundle Analysis (`npm run build`):**
   - Production bundle output: `dist/assets/index-C8ug_mmd.js` is 783.86 kB (gzip: 215.10 kB).
   - Vite emits: `(!) Some chunks are larger than 500 kB after minification.`

---

## 2. Logic Chain

1. **Speffz Mathematical Consistency:**
   - From Observation 1: All 54 stickers correspond 1:1 with standard Speffz clockwise facelet definitions ($U \to L \to F \to R \to B \to D$), and normal vectors match the 3D unit axes.
   - Therefore, the 3D geometric layout and Speffz labeling are mathematically sound and ready for cycle tracing integration.

2. **Database Performance & Bundle Sizing:**
   - From Observation 2 & 5: The dictionary is small (25.44 KB minified / 10.46 KB gzipped) and lookup is negligible ($5.9\text{ ns}$).
   - However, statically bundling it alongside Three.js creates a monolithic 784 KB bundle.
   - Therefore, splitting `wordlist.json` and vendor libraries (`three`, `react`) into separate Rollup chunks in `vite.config.ts` will resolve bundle warnings and improve load time without impacting lookup speed.

3. **Phonetic Generator Capability:**
   - From Observation 3: While 100% coverage in `wordlist.json` prevents missing word errors, the procedural generator lacks vowel interpolation, standard $Q/X/C$ substitutions, and PAO heuristics.
   - Therefore, an enhanced algorithmic generator should be integrated for custom alphabets or edge-case fallback scenarios.

4. **Visual Synchronization & Cycle Pathing:**
   - From Observation 4: The 3D viewport only highlights a single clicked tile rather than the active target sequence.
   - Therefore, Phase 2 should introduce multi-target highlight badges ($1, 2, 3 \dots$) on stickers corresponding to the active cycle sequence.

---

## 3. Caveats

- **No Custom Alphabet Schemes Tested:** Investigation assumed standard English Speffz (A-X). Custom 26-letter (A-Z) or non-English alphabets were not tested since the app's scope is strictly Speffz.
- **WebGL Rendering Performance:** Rendering loop performance on low-end mobile devices was not profiled natively (desktop/Node environment used).

---

## 4. Conclusion

The core BLD data contracts, Speffz 54-sticker geometry, and 576-pair SpeedSolving database are mathematically rigorous and complete. The primary areas for enhancement are:
1. Configuring Vite `manualChunks` to eliminate the 500 KB bundle warning.
2. Enriching the fallback phonetic engine with vowel interpolation and $Q/X$ substitution heuristics.
3. Enhancing `CubeViewport` to visually trace multi-target cycle paths and numbered badges for the entire memo sequence.
4. Formalizing `faceletIndex` ($0 \dots 53$) on `SpeffzSticker` for Phase 2 scramble solver integration.

---

## 5. Verification Method

To independently verify these findings, execute the following commands in the workspace root:

1. **Run Project Test Suite:**
   ```bash
   npm test
   ```
   *Expected result:* 11 tests pass in `src/test/mnemonicService.test.ts`.

2. **Run Speffz Data & Database Mathematical Verification Script:**
   ```bash
   node .agents/survey_explorer_2/audit_script.cjs
   ```
   *Expected output:*
   - `Total stickers in SPEFFZ_STICKERS: 54`
   - `Normal vector errors: 0`
   - `Unique corner cubie positions count: 8`
   - `Unique edge cubie positions count: 12`
   - `Wordlist audit: { missingPairs: 0, pairCountsDistribution: { '4': 576 } }`

3. **Run 1,000,000 Lookup Performance Benchmark:**
   ```bash
   node .agents/survey_explorer_2/benchmark.cjs
   ```
   *Expected output:* `1,000,000 Dictionary Lookups: ~5-10ms`.

4. **Verify Bundle Size:**
   ```bash
   npm run build
   ```
   *Expected output:* Build succeeds with `dist/assets/index-*.js`.

**Invalidation Conditions:**
- If any sticker in `SPEFFZ_STICKERS` has non-orthogonal normal vectors or mismatched cubie positions.
- If any pair in `wordlist.json` is missing or has empty words.
- If `npm test` fails.
