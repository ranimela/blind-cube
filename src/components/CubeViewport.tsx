import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';
import { SpeffzMode, SpeffzSticker } from '../types/speffz';
import { SPEFFZ_STICKERS, FACE_COLORS } from '../constants/speffzData';
import { RotateCcw, Sparkles } from 'lucide-react';

interface CubeViewportProps {
  mode: SpeffzMode;
  activeSequence: string;
  onStickerClick: (sticker: SpeffzSticker) => void;
}

// Generate high quality canvas texture with Speffz letter overlay
function createStickerTexture(
  letter: string,
  faceColor: string,
  pieceType: string,
  shouldShowLetter: boolean,
  isHighlighted: boolean
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Background base (gap/border)
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 256, 256);

  // Rounded sticker rectangle
  const margin = 12;
  const radius = 24;
  const w = 256 - margin * 2;
  const h = 256 - margin * 2;
  const x = margin;
  const y = margin;

  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x + radius, y);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();

  // Fill sticker color
  if (isHighlighted) {
    ctx.fillStyle = '#38bdf8'; // bright neon cyan highlight
  } else {
    ctx.fillStyle = faceColor;
  }
  ctx.fill();

  // Subtle sticker border/bevel
  ctx.lineWidth = isHighlighted ? 10 : 4;
  ctx.strokeStyle = isHighlighted ? '#ffffff' : 'rgba(0, 0, 0, 0.25)';
  ctx.stroke();

  // Speffz Letter Label - ONLY render on non-center pieces and if active in selected mode
  if (letter && shouldShowLetter && pieceType !== 'center') {
    ctx.font = 'bold 115px "JetBrains Mono", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Letter text color with high contrast
    if (isHighlighted) {
      ctx.fillStyle = '#090d16';
    } else {
      // Dark text on bright faces (U: white, D: yellow), White text on dark faces (F, B, L, R)
      if (faceColor === FACE_COLORS.U.hex || faceColor === FACE_COLORS.D.hex) {
        ctx.fillStyle = '#0f172a';
      } else {
        ctx.fillStyle = '#ffffff';
      }
    }

    ctx.fillText(letter, 128, 130);

    // Subtle piece type indicator (C for corner, E for edge)
    ctx.font = '700 24px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillStyle = isHighlighted
      ? '#090d16'
      : (faceColor === FACE_COLORS.U.hex || faceColor === FACE_COLORS.D.hex ? 'rgba(15,23,42,0.4)' : 'rgba(255,255,255,0.45)');
    ctx.fillText(pieceType.toUpperCase()[0], 215, 45);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export const CubeViewport: React.FC<CubeViewportProps> = ({
  mode,
  activeSequence,
  onStickerClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cubeGroupRef = useRef<THREE.Group | null>(null);
  const meshesRef = useRef<Map<string, THREE.Mesh>>(new Map());

  const pointerDownPos = useRef({ x: 0, y: 0 });
  const [hoveredSticker, setHoveredSticker] = useState<SpeffzSticker | null>(null);

  // Helper to determine sticker visibility according to mode
  const isStickerVisible = useCallback((sticker: SpeffzSticker) => {
    if (mode === 'full') return true;
    if (sticker.pieceType === 'center') return true;
    if (mode === 'corners' && sticker.pieceType === 'corner') return true;
    if (mode === 'edges' && sticker.pieceType === 'edge') return true;
    return false;
  }, [mode]);

  // Initial Scene Setup with OrbitControls
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera (placed at default UFR isometric angle)
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(4.8, 4.4, 5.8);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;
    container.replaceChildren(renderer.domElement);

    // OrbitControls: Full 3-axis smooth rotation with damping
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.rotateSpeed = 0.9;
    controls.enableZoom = true;
    controls.minDistance = 4;
    controls.maxDistance = 14;
    controls.enablePan = false; // Keep cube centered
    controlsRef.current = controls;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight1.position.set(6, 10, 8);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.6);
    dirLight2.position.set(-6, -4, -6);
    scene.add(dirLight2);

    // Cube Master Group (fixed at center)
    const cubeGroup = new THREE.Group();
    cubeGroupRef.current = cubeGroup;
    scene.add(cubeGroup);

    // Black Core
    const coreGeo = new THREE.BoxGeometry(2.88, 2.88, 2.88);
    const coreMat = new THREE.MeshStandardMaterial({ color: 0x050811, roughness: 0.8 });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    cubeGroup.add(coreMesh);

    // Build Sticker Meshes
    const meshesMap = new Map<string, THREE.Mesh>();
    const stickerPlaneGeo = new THREE.PlaneGeometry(0.88, 0.88);

    SPEFFZ_STICKERS.forEach((st) => {
      const isVisible = isStickerVisible(st);
      const isHighlighted = activeSequence.endsWith(st.letter);
      const texture = createStickerTexture(st.letter, st.faceColor, st.pieceType, isVisible, isHighlighted);
      const material = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.35,
        metalness: 0.05,
        side: THREE.FrontSide,
      });

      const mesh = new THREE.Mesh(stickerPlaneGeo, material);

      // Position sticker relative to cubie coordinates (-1, 0, 1) and face normal
      const cubieSpacing = 0.98;
      const normalOffset = 0.501; // Slightly off core face to prevent z-fighting

      const px = st.cubiePos[0] * cubieSpacing + st.normal[0] * normalOffset;
      const py = st.cubiePos[1] * cubieSpacing + st.normal[1] * normalOffset;
      const pz = st.cubiePos[2] * cubieSpacing + st.normal[2] * normalOffset;
      mesh.position.set(px, py, pz);

      // Align mesh orientation with normal
      const normalVec = new THREE.Vector3(...st.normal);
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normalVec);

      mesh.userData = { sticker: st };
      cubeGroup.add(mesh);
      meshesMap.set(st.id, mesh);
    });
    meshesRef.current = meshesMap;

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;
      cameraRef.current.aspect = newWidth / newHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  // Update textures whenever Mode, Sequence, or Highlights change
  useEffect(() => {
    meshesRef.current.forEach((mesh) => {
      const st = mesh.userData.sticker as SpeffzSticker;
      if (!st) return;

      const isVisible = isStickerVisible(st);
      const isHighlighted = activeSequence.length > 0 && activeSequence[activeSequence.length - 1] === st.letter;
      const newTexture = createStickerTexture(st.letter, st.faceColor, st.pieceType, isVisible, isHighlighted);

      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (mat.map) {
        mat.map.dispose();
      }
      mat.map = newTexture;
      mat.needsUpdate = true;
    });
  }, [mode, activeSequence, isStickerVisible]);

  // Pointer event for Raycasting and clicking stickers without triggering on drag
  const handlePointerDown = (e: React.PointerEvent) => {
    pointerDownPos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (containerRef.current && cameraRef.current && sceneRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current);
      const intersects = raycaster.intersectObjects(Array.from(meshesRef.current.values()));

      if (intersects.length > 0) {
        const targetSticker = intersects[0].object.userData.sticker as SpeffzSticker;
        setHoveredSticker(targetSticker);
      } else {
        setHoveredSticker(null);
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const dx = Math.abs(e.clientX - pointerDownPos.current.x);
    const dy = Math.abs(e.clientY - pointerDownPos.current.y);

    // If movement was negligible (< 4px), consider it a deliberate sticker click
    if (dx < 4 && dy < 4 && containerRef.current && cameraRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current);
      const intersects = raycaster.intersectObjects(Array.from(meshesRef.current.values()));

      if (intersects.length > 0) {
        const clickedSticker = intersects[0].object.userData.sticker as SpeffzSticker;
        if (clickedSticker.letter && clickedSticker.pieceType !== 'center') {
          onStickerClick(clickedSticker);
        }
      }
    }
  };

  // Preset quick views using Camera Orbit positions (Standard BLD isometric angles)
  const resetOrientation = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(4.8, 4.4, 5.8);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  const setView = (view: 'UFR' | 'UBL' | 'DFR' | 'DBL') => {
    if (!cameraRef.current || !controlsRef.current) return;
    const distance = 8.5;
    switch (view) {
      case 'UFR':
        cameraRef.current.position.set(distance * 0.55, distance * 0.55, distance * 0.63);
        break;
      case 'UBL':
        cameraRef.current.position.set(-distance * 0.55, distance * 0.55, -distance * 0.63);
        break;
      case 'DFR':
        cameraRef.current.position.set(distance * 0.55, -distance * 0.55, distance * 0.63);
        break;
      case 'DBL':
        cameraRef.current.position.set(-distance * 0.55, -distance * 0.55, -distance * 0.63);
        break;
    }
    controlsRef.current.target.set(0, 0, 0);
    controlsRef.current.update();
  };

  return (
    <div className="relative w-full h-[420px] md:h-[480px] bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 rounded-3xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] overflow-hidden group select-none">
      {/* 3D Canvas Container */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Floating Viewport Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        <button
          onClick={resetOrientation}
          title="Reset Cube View"
          className="w-10 h-10 bg-white/90 hover:bg-white text-slate-700 hover:text-[#1E3A8A] rounded-xl shadow-md backdrop-blur-md transition-all active:scale-95 flex items-center justify-center font-bold"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Angle Quick Switchers */}
      <div className="absolute top-4 left-4 flex gap-2 z-10">
        {(['UFR', 'UBL', 'DFR', 'DBL'] as const).map((angle) => (
          <button
            key={angle}
            onClick={() => setView(angle)}
            className="px-3 py-1.5 text-xs font-bold bg-white/90 hover:bg-white text-slate-700 hover:text-[#1E3A8A] rounded-xl shadow-md backdrop-blur-md transition-all"
          >
            {angle}
          </button>
        ))}
      </div>

      {/* Floating Hover Sticker Info HUD */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
        {hoveredSticker ? (
          <div className="px-4 py-2.5 bg-white/95 border border-slate-100 rounded-2xl backdrop-blur-md shadow-lg flex items-center gap-3">
            <span className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ backgroundColor: hoveredSticker.faceColor }} />
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-[#1E3A8A] text-base">
                Target: {hoveredSticker.letter}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                ({hoveredSticker.name} • {hoveredSticker.pieceType})
              </span>
            </div>
          </div>
        ) : (
          <div className="px-3.5 py-2 bg-black/40 border border-white/10 rounded-2xl backdrop-blur-md text-xs text-slate-300 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Click any sticker or drag anywhere to rotate 3-axis</span>
          </div>
        )}

        <div className="hidden sm:flex items-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-xl bg-white/90 text-slate-700 font-bold text-[11px] shadow-sm">
            MODE: {mode.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
};
