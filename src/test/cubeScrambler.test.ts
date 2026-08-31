import { describe, it, expect } from 'vitest';
import {
  getSolvedState,
  applyMove,
  applyScramble,
  generateRandomScramble,
} from '../utils/cubeScrambler';
import { FACE_COLORS, SPEFFZ_STICKERS } from '../constants/speffzData';

describe('Rubik\'s Cube Scrambler & Speffz Permutations', () => {
  const expectedColors = [
    FACE_COLORS.U.hex, // White
    FACE_COLORS.D.hex, // Yellow
    FACE_COLORS.F.hex, // Green
    FACE_COLORS.B.hex, // Blue
    FACE_COLORS.L.hex, // Orange
    FACE_COLORS.R.hex, // Red
  ];

  it('should generate a solved state with all 54 stickers and 9 of each face color', () => {
    const solved = getSolvedState();
    expect(Object.keys(solved).length).toBe(54);

    const counts: Record<string, number> = {};
    for (const color of Object.values(solved)) {
      counts[color] = (counts[color] || 0) + 1;
    }

    for (const color of expectedColors) {
      expect(counts[color]).toBe(9);
    }
  });

  it('should verify single move inversions return to solved state (R R\', U U\', F F\', etc.)', () => {
    const solved = getSolvedState();
    const faces = ['U', 'D', 'L', 'R', 'F', 'B'] as const;

    for (const face of faces) {
      const moved = applyMove(face, solved);
      // Ensure the move actually changed the cube state
      expect(moved).not.toEqual(solved);

      // Inverse move returns to solved
      const restored = applyMove(`${face}'`, moved);
      expect(restored).toEqual(solved);
    }
  });

  it('should verify 4 repeated single moves (e.g. U4, R4) return to solved state', () => {
    const solved = getSolvedState();
    const faces = ['U', 'D', 'L', 'R', 'F', 'B'] as const;

    for (const face of faces) {
      let state = solved;
      for (let i = 0; i < 4; i++) {
        state = applyMove(face, state);
      }
      expect(state).toEqual(solved);
    }
  });

  it('should verify double moves (e.g. F2 F2, R2 R2) return to solved state', () => {
    const solved = getSolvedState();
    const faces = ['U', 'D', 'L', 'R', 'F', 'B'] as const;

    for (const face of faces) {
      const moved = applyMove(`${face}2`, solved);
      expect(moved).not.toEqual(solved);

      const restored = applyMove(`${face}2`, moved);
      expect(restored).toEqual(solved);
    }
  });

  it('should verify standard commutator cycle: (R U R\' U\') repeated 6 times returns to solved', () => {
    const solved = getSolvedState();
    const sexyMove = "R U R' U'";
    let state = solved;

    for (let i = 0; i < 6; i++) {
      state = applyScramble(sexyMove, state);
    }

    expect(state).toEqual(solved);
  });

  it('should preserve center piece colors during outer-layer scrambles', () => {
    const scrambled = applyScramble("R U2 R' D' F2 L B2 R' D2 F' L2 U' R");
    expect(scrambled['U-center']).toBe(FACE_COLORS.U.hex);
    expect(scrambled['D-center']).toBe(FACE_COLORS.D.hex);
    expect(scrambled['F-center']).toBe(FACE_COLORS.F.hex);
    expect(scrambled['B-center']).toBe(FACE_COLORS.B.hex);
    expect(scrambled['L-center']).toBe(FACE_COLORS.L.hex);
    expect(scrambled['R-center']).toBe(FACE_COLORS.R.hex);
  });

  it('should generate random scrambles with valid color distributions (exact 9 of each color)', () => {
    for (let test = 0; test < 10; test++) {
      const { scramble, stickerColors } = generateRandomScramble(20);
      expect(scramble.split(' ').length).toBe(20);
      expect(Object.keys(stickerColors).length).toBe(54);

      // Verify all 54 Speffz sticker IDs are present
      for (const st of SPEFFZ_STICKERS) {
        expect(stickerColors[st.id]).toBeDefined();
      }

      // Count colors
      const counts: Record<string, number> = {};
      for (const color of Object.values(stickerColors)) {
        counts[color] = (counts[color] || 0) + 1;
      }

      for (const color of expectedColors) {
        expect(counts[color]).toBe(9);
      }
    }
  });
});
