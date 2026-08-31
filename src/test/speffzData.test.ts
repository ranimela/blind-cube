import { describe, it, expect } from 'vitest';
import { SPEFFZ_STICKERS, FACE_COLORS, SPEFFZ_FACE_LETTERS } from '../constants/speffzData';
import { FaceName } from '../types/speffz';

describe('Speffz 54-Sticker Mathematical & Geometric Invariants', () => {
  it('should contain exactly 54 stickers (24 corners, 24 edges, 6 centers)', () => {
    expect(SPEFFZ_STICKERS).toHaveLength(54);

    const corners = SPEFFZ_STICKERS.filter((s) => s.pieceType === 'corner');
    const edges = SPEFFZ_STICKERS.filter((s) => s.pieceType === 'edge');
    const centers = SPEFFZ_STICKERS.filter((s) => s.pieceType === 'center');

    expect(corners).toHaveLength(24);
    expect(edges).toHaveLength(24);
    expect(centers).toHaveLength(6);
  });

  it('should have unique IDs for all 54 stickers', () => {
    const ids = SPEFFZ_STICKERS.map((s) => s.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(54);
  });

  it('should have orthonormal unit normal vectors (|n| = 1.0) strictly aligned with face planes', () => {
    const expectedNormals: Record<FaceName, [number, number, number]> = {
      U: [0, 1, 0],
      D: [0, -1, 0],
      F: [0, 0, 1],
      B: [0, 0, -1],
      L: [-1, 0, 0],
      R: [1, 0, 0],
    };

    SPEFFZ_STICKERS.forEach((sticker) => {
      const [nx, ny, nz] = sticker.normal;
      const mag = Math.sqrt(nx * nx + ny * ny + nz * nz);
      expect(mag).toBeCloseTo(1.0, 6);

      const expected = expectedNormals[sticker.face];
      expect(nx).toBe(expected[0]);
      expect(ny).toBe(expected[1]);
      expect(nz).toBe(expected[2]);

      // Dot product with expected normal must be 1.0 (parallel and same direction)
      const dot = nx * expected[0] + ny * expected[1] + nz * expected[2];
      expect(dot).toBeCloseTo(1.0, 6);
    });
  });

  it('should form exactly 8 physical corner cubies with 3 stickers each', () => {
    const corners = SPEFFZ_STICKERS.filter((s) => s.pieceType === 'corner');
    const cubieMap = new Map<string, typeof corners>();

    corners.forEach((sticker) => {
      const [x, y, z] = sticker.cubiePos;
      // Corner coordinates must be (+-1, +-1, +-1)
      expect(Math.abs(x)).toBe(1);
      expect(Math.abs(y)).toBe(1);
      expect(Math.abs(z)).toBe(1);
      expect(Math.abs(x) + Math.abs(y) + Math.abs(z)).toBe(3);

      const key = `${x},${y},${z}`;
      if (!cubieMap.has(key)) {
        cubieMap.set(key, []);
      }
      cubieMap.get(key)!.push(sticker);
    });

    expect(cubieMap.size).toBe(8);

    cubieMap.forEach((stickers) => {
      expect(stickers).toHaveLength(3);
      // All 3 stickers on the same corner cubie must belong to different faces
      const faces = new Set(stickers.map((s) => s.face));
      expect(faces.size).toBe(3);

      // Verify normal vectors are mutually orthogonal (dot products = 0)
      const [s1, s2, s3] = stickers;
      const dot12 = s1.normal[0] * s2.normal[0] + s1.normal[1] * s2.normal[1] + s1.normal[2] * s2.normal[2];
      const dot23 = s2.normal[0] * s3.normal[0] + s2.normal[1] * s3.normal[1] + s2.normal[2] * s3.normal[2];
      const dot31 = s3.normal[0] * s1.normal[0] + s3.normal[1] * s1.normal[1] + s3.normal[2] * s1.normal[2];

      expect(dot12).toBe(0);
      expect(dot23).toBe(0);
      expect(dot31).toBe(0);
    });
  });

  it('should form exactly 12 physical edge cubies with 2 stickers each', () => {
    const edges = SPEFFZ_STICKERS.filter((s) => s.pieceType === 'edge');
    const cubieMap = new Map<string, typeof edges>();

    edges.forEach((sticker) => {
      const [x, y, z] = sticker.cubiePos;
      // Edge coordinates must have |x| + |y| + |z| = 2
      expect(Math.abs(x) + Math.abs(y) + Math.abs(z)).toBe(2);

      const key = `${x},${y},${z}`;
      if (!cubieMap.has(key)) {
        cubieMap.set(key, []);
      }
      cubieMap.get(key)!.push(sticker);
    });

    expect(cubieMap.size).toBe(12);

    cubieMap.forEach((stickers) => {
      expect(stickers).toHaveLength(2);
      // Both stickers on the same edge cubie must belong to different faces
      const faces = new Set(stickers.map((s) => s.face));
      expect(faces.size).toBe(2);

      // Verify normal vectors are orthogonal (dot product = 0)
      const [s1, s2] = stickers;
      const dot = s1.normal[0] * s2.normal[0] + s1.normal[1] * s2.normal[1] + s1.normal[2] * s2.normal[2];
      expect(dot).toBe(0);
    });
  });

  it('should form exactly 6 physical center cubies with 1 sticker each', () => {
    const centers = SPEFFZ_STICKERS.filter((s) => s.pieceType === 'center');
    const cubieMap = new Map<string, typeof centers>();

    centers.forEach((sticker) => {
      const [x, y, z] = sticker.cubiePos;
      // Center coordinates must have |x| + |y| + |z| = 1
      expect(Math.abs(x) + Math.abs(y) + Math.abs(z)).toBe(1);

      const key = `${x},${y},${z}`;
      if (!cubieMap.has(key)) {
        cubieMap.set(key, []);
      }
      cubieMap.get(key)!.push(sticker);
    });

    expect(cubieMap.size).toBe(6);
    cubieMap.forEach((stickers) => {
      expect(stickers).toHaveLength(1);
    });
  });

  it('should match the standard Speffz lettering order across all 6 faces', () => {
    const faces: FaceName[] = ['U', 'L', 'F', 'R', 'B', 'D'];

    faces.forEach((face) => {
      const faceCorners = SPEFFZ_STICKERS.filter((s) => s.face === face && s.pieceType === 'corner');
      const faceEdges = SPEFFZ_STICKERS.filter((s) => s.face === face && s.pieceType === 'edge');

      const expectedCorners = SPEFFZ_FACE_LETTERS[face].corners;
      const expectedEdges = SPEFFZ_FACE_LETTERS[face].edges;

      expect(faceCorners.map((s) => s.letter)).toEqual(expectedCorners);
      expect(faceEdges.map((s) => s.letter)).toEqual(expectedEdges);
    });
  });

  it('should correctly map face colors from FACE_COLORS constant', () => {
    SPEFFZ_STICKERS.forEach((sticker) => {
      expect(sticker.faceColor).toBe(FACE_COLORS[sticker.face].hex);
    });
  });
});
