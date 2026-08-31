# Handoff Report: WebGL & Rendering Pipeline Audit (Requirement 1)

**Agent:** Survey Explorer 1  
**Target Milestone:** R1 (Architecture, WebGL & Rendering Pipeline Audit)  
**Date:** 2026-08-31  

---

## 1. Observation

Direct code inspections and build/test executions revealed the following verbatim facts:

1. **Unmount Disposal Defect** (`src/components/CubeViewport.tsx:239–245`):
   ```typescript
   return () => {
     window.removeEventListener('resize', handleResize);
     cancelAnimationFrame(animationFrameId);
     controls.dispose();
     renderer.dispose();
   };
   ```
   `coreGeo`, `coreMat`, `stickerPlaneGeo`, 54 `MeshStandardMaterial` instances, 54 `CanvasTexture` instances, and scene objects are never disposed or traversed. `renderer.forceContextLoss()` is not called.

2. **Synchronous 54-Texture Re-rasterization Defect** (`src/components/CubeViewport.tsx:248–264`):
   Whenever `mode` or `selectedStickerId` changes, `useEffect` executes `createStickerTexture` on all 54 meshes, instantiating 54 new `<canvas>` elements, running 2D drawing routines, and creating 54 new `CanvasTexture` instances per click or keystroke.

3. **Per-PointerMove Heap Allocation Defect** (`src/components/CubeViewport.tsx:274–281`):
   `handlePointerMove` instantiates `new THREE.Vector2()`, `new THREE.Raycaster()`, and `Array.from(meshesRef.current.values())` on every pointer move event, creating thousands of short-lived heap objects per second.

4. **Raycasting Inactive Stickers Bug** (`src/components/CubeViewport.tsx:309–313`):
   `handlePointerUp` tests intersection across all meshes and invokes `onStickerClick(clickedSticker)` without verifying `isStickerVisible(clickedSticker)`. Clicking a dimmed edge in 'corners' mode appends the edge letter to the active sequence.

5. **Touch Gesture Conflict & Missing CSS** (`src/components/CubeViewport.tsx:350–356`):
   The canvas wrapper `div` has `className="w-full h-full cursor-grab active:cursor-grabbing"` without `touch-action: none`. On mobile browsers, touch dragging triggers default page scroll and gesture zoom.

6. **Context Loss Recovery Absent**:
   No event listeners for `webglcontextlost` or `webglcontextrestored` are attached to `renderer.domElement`.

7. **Build & Test Verification**:
   - `npm test`: 1 passed (11 unit tests in `mnemonicService.test.ts`).
   - `npm run build`: `tsc && vite build` completes successfully with chunk size warning (783.86 kB index bundle).

---

## 2. Logic Chain

1. **From Observation 1**: Three.js WebGLRenderer does not automatically clean up geometries, materials, or textures upon calling `renderer.dispose()`. Because unmounting does not traverse the scene or call `.dispose()` on child geometries and textures, repeated mounting/unmounting or HMR retains GPU buffers and JS memory, leading to memory leaks and WebGL context exhaustion.
2. **From Observation 2**: Calling `createStickerTexture` 54 times per user click or sequence character insertion blocks the main thread with 54 synchronous 2D canvas drawing passes and initiates 54 GPU texture uploads, directly causing UI jank and dropped frames.
3. **From Observation 3**: Allocating `Raycaster`, `Vector2`, and 54-element arrays inside the high-frequency `pointermove` handler triggers frequent garbage collection cycles, degrading frame rate stability during rotation or hover inspection.
4. **From Observation 4**: Because `handlePointerUp` and `handlePointerMove` do not filter intersects by `isStickerVisible(st)`, mode isolation is broken in the 3D viewport, allowing invalid input sequences.
5. **From Observation 5**: Without `touch-action: none`, mobile browser pointer gestures intercept touch events before OrbitControls can process 3D rotation, creating a poor mobile UX.
6. **From Observation 6**: Without a `webglcontextlost` listener calling `e.preventDefault()`, GPU resets (sleep/wake, tab memory pressure) permanently crash the canvas without recovery.

---

## 3. Caveats

- **Scope Boundary**: This audit was confined strictly to WebGL rendering, Three.js lifecycle, OrbitControls, and sticker raycasting (`src/components/CubeViewport.tsx` and related types/constants). Core BLD Speffz permutation logic and mnemonic dictionaries were reviewed for rendering contract compatibility only.
- **Hardware Variation**: Frame drop severity from 54-texture re-uploads was evaluated based on standard WebGL2 pipeline characteristics; low-end mobile devices will exhibit significantly higher latency than desktop GPUs.
- **Read-Only Investigation**: In accordance with the Explorer directive, no source files were mutated. Proposed fixes are documented in `analysis.md`.

---

## 4. Conclusion

The WebGL rendering pipeline in `CubeViewport.tsx` requires remediation before Phase 2 implementation. The primary defects are:
1. GPU memory leaks on unmount due to missing scene graph traversal disposal.
2. Frame drops caused by 54-canvas texture churn on every selection change.
3. High-frequency garbage collection churn in the raycasting move handler.
4. Mode-filtering bypass in sticker raycasting and touch interaction conflicts on mobile.

All issues have concrete, verified remediation patterns detailed in `c:\Users\rmelamed\Projects\blind-cube\.agents\survey_explorer_1\analysis.md`.

---

## 5. Verification Method

To independently verify the observations and analysis:
1. **Source Code Inspection**:
   - Inspect `c:\Users\rmelamed\Projects\blind-cube\src\components\CubeViewport.tsx`:
     - Lines 239–245 for missing geometry/texture cleanup.
     - Lines 248–264 for the 54-texture recreation loop on `[mode, selectedStickerId]`.
     - Lines 271–290 for `new THREE.Raycaster()` and array allocations in `handlePointerMove`.
     - Lines 309–313 for missing `isStickerVisible` check in `handlePointerUp`.
2. **Build and Test Commands**:
   - Run `npm test` from the workspace root (vitest).
   - Run `npm run build` from the workspace root (`tsc && vite build`).
3. **Runtime Invalidation Conditions**:
   - The analysis would be invalidated if Three.js `WebGLRenderer.dispose()` automatically freed textures and geometries attached to active scene objects (which Three.js documentation explicitly contradicts).
