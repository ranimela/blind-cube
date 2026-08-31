# Plan: WebGL Quality Hardening, Memory Lifecycle & UI/UX Accessibility Remediation

## Architectural Overview
This specification hardens the WebGL Three.js rendering pipeline in `src/components/CubeViewport.tsx` and eliminates critical GPU memory leaks, main-thread texture re-rasterization bottlenecks, touch event conflicts, and WCAG 2.1 AA accessibility deficiencies across the application surface.

### 1. Three.js Canvas Memory Lifecycle & Context Management
- **Scene Traversal Deep Disposal**: Implement a recursive disposal utility (`disposeSceneGraph`) that walks the entire `THREE.Scene` graph on component unmount or context loss, invoking `.dispose()` on all attached `BufferGeometry`, `Material` (or material arrays), and `Texture` instances.
- **Explicit WebGL Context Lifecycle**: Call `renderer.forceContextLoss()` and cancel the active `requestAnimationFrame` loop upon unmounting to guarantee WebGL context release within browser limits (8–16 contexts per origin).
- **Responsive Layout via ResizeObserver**: Replace the global `window.addEventListener('resize')` with a `ResizeObserver` observing the container element. Add a zero-dimension guard (`width > 0 && height > 0`) to prevent `Infinity` or `NaN` camera aspect ratios during CSS layout reflows or modal transitions.
- **Smart RAF Render Throttling & Visibility API**: Attach a listener to `document.addEventListener('visibilitychange')`. Pause the continuous animation loop when the browser tab is hidden (`document.hidden`), resuming automatically when focused. Remove the redundant `renderer.shadowMap.enabled = true` configuration (zero meshes cast or receive shadows).
- **WebGL Context Loss & Restoration Handlers**: Bind `webglcontextlost` (calling `event.preventDefault()`) and `webglcontextrestored` on `renderer.domElement` to gracefully suspend rendering during GPU preemption (e.g. system sleep) and re-initialize meshes upon recovery.

### 2. Texture Caching & High-Performance Material Pipeline
- **Key-Indexed Texture Cache (`Map<string, THREE.CanvasTexture>`)**: Replace the synchronous 54-texture re-rasterization loop on every click or keystroke with an LRU/keyed texture cache. Cache keys follow `${stickerId}_${visibilityState}_${highlightState}`.
- **Delta Material Updates**: Instead of destroying and recreating all 54 `<canvas>` elements on state changes, only update the `material.map` of stickers whose visual state actually transitioned (e.g. previous selected sticker $\to$ normal; new selected sticker $\to$ highlighted).
- **Mipmap & Filtering Quality**: Canvas textures configure `generateMipmaps = true`, `minFilter = THREE.LinearMipmapLinearFilter`, and `anisotropy = 4` for crisp text rendering at steep perspective angles without shimmering.

### 3. OrbitControls Responsiveness & Touch Interaction
- **CSS Touch Gesture Isolation**: Add `touch-action: none` to the canvas container to prevent mobile browsers from capturing swipe gestures for vertical page scrolling, pinch-zoom, or overscroll refresh.
- **Inertial Momentum Reset**: On camera preset jumps (`UFR`, `UBL`, `DFR`, `DBL`, or reset orientation), clear OrbitControls damping deltas (`sphericalDelta`, `panOffset`) before calling `controls.update()` to eliminate visual snap-back jitter.
- **Mobile Tap Tolerance**: Expand pointer hit detection from a rigid `dx < 4 && dy < 4` pixel distance to an adaptive threshold: distance $\le 8\text{px}$ and duration $\le 300\text{ms}$, preventing false-positive drag classification on touch devices.

### 4. Raycasting Mode-Filtering & Static Memory Allocation
- **Zero-Allocation Raycasting**: Move `THREE.Raycaster` and `THREE.Vector2` instances outside of event handlers into stable component refs. Eliminate `Array.from(meshesRef.current.values())` heap allocations on every `pointermove`.
- **Mode-Filtered Hit Testing**: In `corners` or `edges` display modes, filter raycast intersection candidates to only visible stickers (`isStickerVisible(st)`). Dimmed/hidden stickers cannot be hovered or clicked.
- **Center Piece Disambiguation**: Suppress cursor change and HUD target assignment when hovering center stickers, since centers are non-target reference anchors.

### 5. UI/UX Accessibility (WCAG 2.1 AA) & Design Remediation
- **Sticker Text Contrast Remediation**: Update `createStickerTexture` luminance evaluation. F (Green `#22c55e`, $L \approx 0.44$) and L (Orange `#f97316`, $L \approx 0.35$) faces switch from white text ($< 2.9:1$) to dark slate text `#0f172a` ($> 6.8:1$), exceeding WCAG AAA.
- **Input & Muted Text Contrast**: Replace `slate-400` (`#94A3B8`, 2.8:1) placeholders, subtitles, and footer text with `slate-500` (`#64748B`, 4.6:1) or `blue-200` to satisfy WCAG AA 4.5:1.
- **Touch Target Expansion ($\ge 44\text{px}$)**: Adjust CSS padding and minimum dimensions on Header mode buttons, camera quick buttons, modal close triggers, and input action buttons to meet the $\ge 44 \times 44\text{px}$ touch target requirement.
- **Canvas Keyboard Navigation & ARIA Semantics**: Assign `tabIndex={0}`, `role="region"`, and `aria-label="Interactive 3D Speffz Rubik's Cube"` to the viewport. Implement Arrow key bindings for orbital cube rotation. Link form `<label htmlFor="speffz-sequence-input">` to `<input id="speffz-sequence-input">`. Add `role="dialog"`, `aria-modal="true"`, focus trap, and `Escape` key close to `ReferenceModal.tsx`.

---

## Immutable Data Contracts

```typescript
import * as THREE from 'three';
import { SpeffzSticker, SpeffzMode, FaceName, PieceType } from './speffz';

/**
 * Cache key descriptor for deterministic texture memoization.
 */
export interface TextureCacheKey {
  stickerId: string;
  isVisible: boolean;
  isHighlighted: boolean;
  badgeNumber?: number; // Sequence index for Phase 2 multi-target highlighting
}

/**
 * Interface contract for WebGL sticker texture caching service.
 */
export interface ITextureCacheService {
  getOrCreateTexture(
    sticker: SpeffzSticker,
    isVisible: boolean,
    isHighlighted: boolean,
    badgeNumber?: number
  ): THREE.CanvasTexture;
  invalidate(stickerId?: string): void;
  dispose(): void;
}

/**
 * Viewport interaction state.
 */
export interface ViewportPointerState {
  startX: number;
  startY: number;
  startTime: number;
  isPointerDown: boolean;
}

/**
 * Camera preset coordinate configuration.
 */
export interface CameraPresetConfig {
  name: string;
  label: string;
  position: [number, number, number];
  target: [number, number, number];
}

/**
 * Accessibility configuration for 3D canvas viewport.
 */
export interface CubeA11yConfig {
  ariaLabel: string;
  role: string;
  keyboardStepDegrees: number; // Degrees to rotate per Arrow key press (default 15°)
}
```

---

## Affected Files

### Modified Files:
- `src/components/CubeViewport.tsx`: Full Three.js lifecycle overhaul, texture cache, Raycaster pooling, `ResizeObserver`, context loss handlers, keyboard rotation, WCAG text colors.
- `src/components/Header.tsx`: Expand mode button touch targets ($\ge 44\text{px}$), fix icon button accessibility labels.
- `src/components/SequenceInput.tsx`: Fix placeholder contrast (`slate-500`), associate label `htmlFor` with input `id`, expand action button hit areas ($\ge 44\text{px}$).
- `src/components/MnemonicList.tsx`: Fix subtitle contrast (`slate-500`), expand alternative suggestion pill hit targets, add `aria-live="polite"` region.
- `src/components/ReferenceModal.tsx`: Add dialog ARIA attributes, `Escape` key listener, focus trap, and $44\text{px}$ close button.
- `src/index.css`: Add touch and focus-visible utilities.
- `src/types/speffz.ts`: Export `ITextureCacheService` and `TextureCacheKey` types.

### Pristine Modules (Do NOT Touch):
- `src/constants/speffzData.ts` (Core 54-sticker geometry definitions)
- `src/data/wordlist.json` (576-pair dictionary)
- `src/services/mnemonicService.ts` (Parsing & chunking logic)

---

## Step-by-Step Micro-Tasks

### Task 1: Build Keyed Texture Cache & WCAG Sticker Canvas Generator (`src/components/CubeViewport.tsx`)
1. Define module-level `TextureCacheService` with a `Map<string, THREE.CanvasTexture>`.
2. Update `createStickerTexture` text coloring logic:
   - Compute relative luminance or branch on face colors: If `faceColor` is White (`#f8fafc`), Yellow (`#eab308`), Green (`#22c55e`), or Orange (`#f97316`), set text color to dark slate `#0f172a` (contrast $\ge 6.8:1$).
   - If `faceColor` is Red (`#ef4444`) or Blue (`#3b82f6`), set text color to pure white `#ffffff` (contrast $\ge 3.7:1$).
   - For highlighted stickers, maintain bright cyan fill (`#38bdf8`) with dark slate `#090d16` text.
3. Configure `texture.generateMipmaps = true`, `texture.minFilter = THREE.LinearMipmapLinearFilter`.

### Task 2: Implement Scene Graph Deep Disposal & Context Loss Resilience (`src/components/CubeViewport.tsx`)
1. Implement `disposeSceneGraph(scene: THREE.Scene)`:
   - Traverse all scene objects via `scene.traverse((obj) => ...)`.
   - If object is `THREE.Mesh`, dispose `obj.geometry`, individual/array `obj.material`, and material texture maps.
   - Invoke `scene.clear()`.
2. Update unmount cleanup in `useEffect`:
   - Invoke `disposeSceneGraph(sceneRef.current)`.
   - Clear `textureCache.clear()`.
   - Call `rendererRef.current.dispose()` and `rendererRef.current.forceContextLoss()`.
   - Remove event listeners for `resize`, `visibilitychange`, and pointer events.
3. Add `webglcontextlost` and `webglcontextrestored` listeners to `renderer.domElement`:
   - On lost: `event.preventDefault()`, cancel RAF loop.
   - On restored: re-instantiate geometries, materials, textures, and resume RAF loop.

### Task 3: Optimize Render Loop, ResizeObserver, and OrbitControls (`src/components/CubeViewport.tsx`)
1. Replace `window.addEventListener('resize')` with `new ResizeObserver((entries) => ...)`:
   - Check `width > 0 && height > 0` before updating `camera.aspect` and calling `camera.updateProjectionMatrix()`.
2. Add Page Visibility API handler:
   - Listen for `visibilitychange` on `document`. If `document.hidden === true`, pause RAF; if `false`, request new RAF frame.
3. Remove `renderer.shadowMap.enabled = true`.
4. Fix camera preset transitions (`UFR`, `UBL`, etc.):
   - Call `controls.reset()` or clear `controls.target` inertia prior to setting new camera positions, preventing visual jerk.
5. Add `touch-action: none` to viewport container element.

### Task 4: Fix Raycasting Allocations, Mode-Filtering & Touch Distance (`src/components/CubeViewport.tsx`)
1. Instantiate static refs: `raycasterRef = useRef(new THREE.Raycaster())`, `mouseRef = useRef(new THREE.Vector2())`, `pointerStateRef = useRef<ViewportPointerState>({ startX: 0, startY: 0, startTime: 0, isPointerDown: false })`.
2. In `handlePointerMove`:
   - Calculate normalized device coordinates into `mouseRef.current` without creating `new THREE.Vector2()`.
   - Set raycaster via `raycasterRef.current.setFromCamera(mouseRef.current, camera)`.
   - Query only meshes matching active mode (`isStickerVisible(st)`).
   - Only update hover state if hovered object changed; ignore center stickers for selection cursor.
3. In `handlePointerUp`:
   - Compute displacement: `const dist = Math.hypot(e.clientX - startX, e.clientY - startY)`.
   - Compute elapsed time: `const elapsed = performance.now() - startTime`.
   - Register tap if `dist <= 8 && elapsed <= 300`.
   - Filter clicks: ignore centers and dimmed stickers (`isStickerVisible(st) === false`).

### Task 5: Implement Keyboard Controls & ARIA Accessibility (`src/components/CubeViewport.tsx` & App Components)
1. In `CubeViewport.tsx`:
   - Add `tabIndex={0}`, `role="region"`, `aria-label="Interactive 3D Speffz Rubik's Cube"`, and `onKeyDown` handler.
   - `ArrowLeft` / `ArrowRight`: rotate camera azimuthally $\pm 15^\circ$.
   - `ArrowUp` / `ArrowDown`: rotate camera elevation $\pm 15^\circ$.
   - `KeyR`: trigger reset orientation.
2. In `Header.tsx`:
   - Increase mode button height to `min-h-[44px]` with `px-4`.
   - Ensure help modal icon button is `w-11 h-11` ($44 \times 44\text{px}$) with `aria-label="Open Speffz Reference Guide"`.
3. In `SequenceInput.tsx`:
   - Set placeholder text color to `placeholder:text-slate-500`.
   - Set `<label htmlFor="speffz-input">` and `<input id="speffz-input">`.
   - Ensure copy/backspace/clear buttons have `min-w-[44px] min-h-[44px]` and explicit `aria-label`s.
4. In `MnemonicList.tsx`:
   - Set subtitle text to `text-slate-500`.
   - Increase alternative word pill padding (`py-2 px-3`) to guarantee accessible tap zones.
   - Wrap chunk list in `aria-live="polite"` container.
5. In `ReferenceModal.tsx`:
   - Add `role="dialog"`, `aria-modal="true"`, `aria-labelledby="modal-title"`.
   - Attach `keydown` listener for `Escape` to close modal.
   - Ensure close button is $\ge 44 \times 44\text{px}$ with `aria-label="Close Reference Modal"`.

---

## Verification Criteria

### 1. Automated Vitest Quality Verification
- Configure `src/test/setup.ts` with 2D Canvas, WebGL, and `ResizeObserver` mocks.
- Run `npm test` and assert 100% pass across all unit tests.
- Add `src/test/cubeViewport.test.ts` verifying:
  - `createStickerTexture` caches textures: calling with same parameters returns identical reference.
  - Sticker contrast verification: Green (`#22c55e`) and Orange (`#f97316`) stickers generate with dark text `#0f172a`.
  - Mode filtering: Clicking an edge sticker when `mode === 'corners'` does not fire `onStickerClick`.
  - Scene disposal: Unmounting `CubeViewport` calls `dispose()` on all geometries, materials, and textures without throwing errors.

### 2. Manual & Visual Verification Commands
- `npm run build`: Verify zero TypeScript errors and zero warnings.
- `npm run dev`: Launch development server.
- **Memory Profile Audit**: Open Chrome DevTools $\to$ Memory $\to$ Take Heap Snapshot. Click stickers rapidly 100 times. Confirm detached `HTMLCanvasElement` count does not exceed 54 (cached) and JS Heap remains stable under 15 MB.
- **Touch Gesture Validation**: Open Chrome Device Mode (iPhone / Pixel). Swipe across the 3D cube. Verify cube rotates smoothly without dragging the page viewport or triggering pull-to-refresh.
- **WCAG Contrast Check**: Inspect Green and Orange face stickers with Axe DevTools / Lighthouse. Confirm contrast ratios exceed 4.5:1.

---

## Context Pruning
The Builder must ONLY read and edit the following files to implement this specification:
1. `src/components/CubeViewport.tsx` (Core WebGL rendering, texture caching, raycasting, lifecycle)
2. `src/types/speffz.ts` (Interface contracts & types)
3. `src/components/Header.tsx`, `src/components/SequenceInput.tsx`, `src/components/MnemonicList.tsx`, `src/components/ReferenceModal.tsx` (UI contrast, touch targets, ARIA)
