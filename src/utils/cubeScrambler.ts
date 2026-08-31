import { SPEFFZ_STICKERS } from '../constants/speffzData';
import { FaceName, SpeffzSticker } from '../types/speffz';

export type CubeState = Record<string, string>;

// Map key helper: position + normal to find sticker ID
function getPosKey(pos: [number, number, number], normal: [number, number, number]): string {
  return `${pos[0]},${pos[1]},${pos[2]}:${normal[0]},${normal[1]},${normal[2]}`;
}

// Build spatial lookup map
const STICKER_BY_SPATIAL_KEY = new Map<string, SpeffzSticker>();
SPEFFZ_STICKERS.forEach((st) => {
  STICKER_BY_SPATIAL_KEY.set(getPosKey(st.cubiePos, st.normal), st);
});

/**
 * Returns the default solved cube state mapping 54 sticker IDs to their original face colors.
 */
export function getSolvedState(): CubeState {
  const state: CubeState = {};
  for (const sticker of SPEFFZ_STICKERS) {
    state[sticker.id] = sticker.faceColor;
  }
  return state;
}

/**
 * Rotates a 3D coordinate/normal for a 90-degree clockwise face turn.
 */
function rotateCoordinate(
  face: FaceName,
  pos: [number, number, number]
): [number, number, number] {
  const [x, y, z] = pos;
  switch (face) {
    case 'U': // slice y = 1, CW from top
      return [-z, y, x];
    case 'D': // slice y = -1, CW from bottom
      return [z, y, -x];
    case 'F': // slice z = 1, CW from front
      return [y, -x, z];
    case 'B': // slice z = -1, CW from back
      return [-y, x, z];
    case 'R': // slice x = 1, CW from right
      return [x, z, -y];
    case 'L': // slice x = -1, CW from left
      return [x, -z, y];
  }
}

/**
 * Checks whether a sticker is located on the layer affected by a face turn.
 */
function isStickerOnFaceLayer(face: FaceName, pos: [number, number, number]): boolean {
  switch (face) {
    case 'U':
      return pos[1] === 1;
    case 'D':
      return pos[1] === -1;
    case 'F':
      return pos[2] === 1;
    case 'B':
      return pos[2] === -1;
    case 'R':
      return pos[0] === 1;
    case 'L':
      return pos[0] === -1;
  }
}

/**
 * Applies a single 90-degree clockwise move (U, D, L, R, F, B) to the given cube state.
 */
function applySingleClockwiseMove(face: FaceName, state: CubeState): CubeState {
  const nextState: CubeState = { ...state };

  for (const st of SPEFFZ_STICKERS) {
    if (isStickerOnFaceLayer(face, st.cubiePos)) {
      const newPos = rotateCoordinate(face, st.cubiePos);
      const newNormal = rotateCoordinate(face, st.normal);
      const destKey = getPosKey(newPos, newNormal);
      const destSticker = STICKER_BY_SPATIAL_KEY.get(destKey);

      if (destSticker) {
        nextState[destSticker.id] = state[st.id];
      }
    }
  }

  return nextState;
}

/**
 * Applies a single WCA move token (e.g. 'R', "R'", 'R2') to the cube state.
 */
export function applyMove(move: string, state: CubeState): CubeState {
  const trimmed = move.trim().toUpperCase();
  if (!trimmed) return state;

  const face = trimmed[0] as FaceName;
  if (!['U', 'D', 'L', 'R', 'F', 'B'].includes(face)) {
    return state;
  }

  const modifier = trimmed.slice(1);

  if (modifier === '' || modifier === '1') {
    // 90 deg clockwise
    return applySingleClockwiseMove(face, state);
  } else if (modifier === '2') {
    // 180 deg
    const s1 = applySingleClockwiseMove(face, state);
    return applySingleClockwiseMove(face, s1);
  } else if (modifier === "'" || modifier === '3') {
    // 90 deg counter-clockwise (3 x clockwise)
    const s1 = applySingleClockwiseMove(face, state);
    const s2 = applySingleClockwiseMove(face, s1);
    return applySingleClockwiseMove(face, s2);
  }

  return state;
}

/**
 * Applies a sequence of WCA moves to a cube state (defaults to solved state if baseState omitted).
 * Supports standard formats e.g. "R U R' U' R' F R2 U' R' U' R U R' F'"
 */
export function applyScramble(scrambleString: string, baseState?: CubeState): CubeState {
  let currentState: CubeState = baseState ? { ...baseState } : getSolvedState();

  // Match move tokens like R, U', F2, etc.
  const moveTokens = scrambleString.match(/[UDFBLRudfblr][2']?/g);
  if (!moveTokens) {
    return currentState;
  }

  for (const token of moveTokens) {
    currentState = applyMove(token, currentState);
  }

  return currentState;
}

const FACES: FaceName[] = ['U', 'D', 'L', 'R', 'F', 'B'];
const MODIFIERS = ['', "'", '2'];

// Opposite faces map to prevent redundant scrambles like R L R
const OPPOSITE_FACES: Record<FaceName, FaceName> = {
  U: 'D',
  D: 'U',
  L: 'R',
  R: 'L',
  F: 'B',
  B: 'F',
};

/**
 * Generates a random WCA-compliant scramble string and its resulting sticker color map.
 * @param moveCount Number of moves in the scramble (default 20)
 */
export function generateRandomScramble(moveCount: number = 20): {
  scramble: string;
  stickerColors: CubeState;
} {
  const moves: string[] = [];
  let lastFace: FaceName | null = null;
  let secondLastFace: FaceName | null = null;

  for (let i = 0; i < moveCount; i++) {
    // Filter available faces to prevent immediate same face or redundant opposite face combinations
    const availableFaces = FACES.filter((f) => {
      if (f === lastFace) return false;
      if (secondLastFace && f === secondLastFace && OPPOSITE_FACES[f] === lastFace) {
        return false;
      }
      return true;
    });

    const chosenFace = availableFaces[Math.floor(Math.random() * availableFaces.length)];
    const chosenMod = MODIFIERS[Math.floor(Math.random() * MODIFIERS.length)];
    moves.push(`${chosenFace}${chosenMod}`);

    secondLastFace = lastFace;
    lastFace = chosenFace;
  }

  const scramble = moves.join(' ');
  const stickerColors = applyScramble(scramble);

  return {
    scramble,
    stickerColors,
  };
}
