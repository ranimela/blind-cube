import { describe, it, expect } from 'vitest';
import { SPEFFZ_STICKERS, SPEFFZ_FACE_LETTERS, FACE_COLORS } from '../../src/constants/speffzData';
import { sanitizeSpeffzSequence, lookupMnemonics, parseAndChunkSequence, generateProceduralMnemonic } from '../../src/services/mnemonicService';
import wordlist from '../../src/data/wordlist.json';

describe('Comprehensive Speffz Mathematical & BLD Contract Audit', () => {
  it('should contain exactly 54 stickers (24 corners, 24 edges, 6 centers)', () => {
    expect(SPEFFZ_STICKERS).toHaveLength(54);
    const corners = SPEFFZ_STICKERS.filter(s => s.pieceType === 'corner');
    const edges = SPEFFZ_STICKERS.filter(s => s.pieceType === 'edge');
    const centers = SPEFFZ_STICKERS.filter(s => s.pieceType === 'center');
    expect(corners).toHaveLength(24);
    expect(edges).toHaveLength(24);
    expect(centers).toHaveLength(6);
  });

  it('should verify normal vectors are unit vectors and orthogonal to faces', () => {
    const expectedNormals: Record<string, [number, number, number]> = {
      U: [0, 1, 0],
      D: [0, -1, 0],
      F: [0, 0, 1],
      B: [0, 0, -1],
      L: [-1, 0, 0],
      R: [1, 0, 0],
    };

    SPEFFZ_STICKERS.forEach(s => {
      const exp = expectedNormals[s.face];
      expect(s.normal).toEqual(exp);
      // Verify cubiePos aligns with normal on that axis
      if (exp[0] !== 0) expect(s.cubiePos[0]).toBe(exp[0]);
      if (exp[1] !== 0) expect(s.cubiePos[1]).toBe(exp[1]);
      if (exp[2] !== 0) expect(s.cubiePos[2]).toBe(exp[2]);
    });
  });

  it('should verify corner piece groupings match standard 3D physical cubies', () => {
    // 8 physical corner cubies
    const cornerCubies: Record<string, { U?: string; D?: string; L?: string; R?: string; F?: string; B?: string }> = {};
    const corners = SPEFFZ_STICKERS.filter(s => s.pieceType === 'corner');
    
    corners.forEach(c => {
      const key = `${c.cubiePos[0]},${c.cubiePos[1]},${c.cubiePos[2]}`;
      if (!cornerCubies[key]) cornerCubies[key] = {};
      cornerCubies[key][c.face] = c.letter;
    });

    expect(Object.keys(cornerCubies)).toHaveLength(8);

    // Standard Speffz Corner Cubie Letters:
    // UBL: (-1, 1, -1) -> U: A, L: E, B: R
    expect(cornerCubies['-1,1,-1']).toEqual({ U: 'A', L: 'E', B: 'R' });
    // UBR: (1, 1, -1) -> U: B, R: N, B: Q
    expect(cornerCubies['1,1,-1']).toEqual({ U: 'B', R: 'N', B: 'Q' });
    // UFR: (1, 1, 1) -> U: C, F: J, R: M
    expect(cornerCubies['1,1,1']).toEqual({ U: 'C', F: 'J', R: 'M' });
    // UFL: (-1, 1, 1) -> U: D, L: F, F: I
    expect(cornerCubies['-1,1,1']).toEqual({ U: 'D', L: 'F', F: 'I' });
    // DFL: (-1, -1, 1) -> D: U, L: G, F: L
    expect(cornerCubies['-1,-1,1']).toEqual({ D: 'U', L: 'G', F: 'L' });
    // DFR: (1, -1, 1) -> D: V, F: K, R: P
    expect(cornerCubies['1,-1,1']).toEqual({ D: 'V', F: 'K', R: 'P' });
    // DBR: (1, -1, -1) -> D: W, R: O, B: T
    expect(cornerCubies['1,-1,-1']).toEqual({ D: 'W', R: 'O', B: 'T' });
    // DBL: (-1, -1, -1) -> D: X, L: H, B: S
    expect(cornerCubies['-1,-1,-1']).toEqual({ D: 'X', L: 'H', B: 'S' });
  });

  it('should verify edge piece groupings match standard 3D physical cubies', () => {
    // 12 physical edge cubies
    const edgeCubies: Record<string, { U?: string; D?: string; L?: string; R?: string; F?: string; B?: string }> = {};
    const edges = SPEFFZ_STICKERS.filter(s => s.pieceType === 'edge');

    edges.forEach(e => {
      const key = `${e.cubiePos[0]},${e.cubiePos[1]},${e.cubiePos[2]}`;
      if (!edgeCubies[key]) edgeCubies[key] = {};
      edgeCubies[key][e.face] = e.letter;
    });

    expect(Object.keys(edgeCubies)).toHaveLength(12);

    // UB: (0, 1, -1) -> U: A, B: Q
    expect(edgeCubies['0,1,-1']).toEqual({ U: 'A', B: 'Q' });
    // UR: (1, 1, 0) -> U: B, R: M
    expect(edgeCubies['1,1,0']).toEqual({ U: 'B', R: 'M' });
    // UF: (0, 1, 1) -> U: C, F: I
    expect(edgeCubies['0,1,1']).toEqual({ U: 'C', F: 'I' });
    // UL: (-1, 1, 0) -> U: D, L: E
    expect(edgeCubies['-1,1,0']).toEqual({ U: 'D', L: 'E' });
    // FL: (-1, 0, 1) -> L: F, F: L
    expect(edgeCubies['-1,0,1']).toEqual({ L: 'F', F: 'L' });
    // FR: (1, 0, 1) -> F: J, R: P
    expect(edgeCubies['1,0,1']).toEqual({ F: 'J', R: 'P' });
    // BR: (1, 0, -1) -> R: N, B: T
    expect(edgeCubies['1,0,-1']).toEqual({ R: 'N', B: 'T' });
    // BL: (-1, 0, -1) -> L: H, B: R
    expect(edgeCubies['-1,0,-1']).toEqual({ L: 'H', B: 'R' });
    // DF: (0, -1, 1) -> D: U, F: K
    expect(edgeCubies['0,-1,1']).toEqual({ D: 'U', F: 'K' });
    // DR: (1, -1, 0) -> D: V, R: O
    expect(edgeCubies['1,-1,0']).toEqual({ D: 'V', R: 'O' });
    // DB: (0, -1, -1) -> D: W, B: S
    expect(edgeCubies['0,-1,-1']).toEqual({ D: 'W', B: 'S' });
    // DL: (-1, -1, 0) -> D: X, L: G
    expect(edgeCubies['-1,-1,0']).toEqual({ D: 'X', L: 'G' });
  });

  it('should verify all 576 pairs are present in wordlist.json with non-empty words', () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWX'.split('');
    expect(letters).toHaveLength(24);
    let count = 0;
    for (const f of letters) {
      for (const s of letters) {
        const pair = f + s;
        expect(wordlist[pair as keyof typeof wordlist]).toBeDefined();
        const list = wordlist[pair as keyof typeof wordlist];
        expect(list.length).toBeGreaterThanOrEqual(1);
        list.forEach((w: string) => {
          expect(w.trim().length).toBeGreaterThan(0);
        });
        count++;
      }
    }
    expect(count).toBe(576);
  });
});
