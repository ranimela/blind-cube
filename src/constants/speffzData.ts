import { SpeffzSticker, FaceName } from '../types/speffz';

export const FACE_COLORS: Record<FaceName, { hex: string; name: string }> = {
  U: { hex: '#f8fafc', name: 'White' },  // Top
  D: { hex: '#eab308', name: 'Yellow' }, // Bottom
  F: { hex: '#22c55e', name: 'Green' },  // Front
  B: { hex: '#3b82f6', name: 'Blue' },   // Back
  L: { hex: '#f97316', name: 'Orange' }, // Left
  R: { hex: '#ef4444', name: 'Red' },    // Right
};

/**
 * Standard Speffz Lettering Scheme for 3x3 Rubik's Cube
 *
 * Faces are visited in standard Speffz order: U, L, F, R, B, D
 * For each face:
 *   Corners (A-X): Top-Left -> Top-Right -> Bottom-Right -> Bottom-Left (Clockwise from top-left)
 *   Edges (A-X):   Top -> Right -> Bottom -> Left (Clockwise from top)
 *
 * Centers: U, L, F, R, B, D (no letter assigned in Speffz, but displayed with face symbol)
 */

export const SPEFFZ_STICKERS: SpeffzSticker[] = [
  // ----------------------------------------------------
  // U FACE (White, y = +1, normal = [0, 1, 0])
  // Looking directly at U with B at top, F at bottom, L at left, R at right:
  // Top-Left (UBL): A, Top-Right (UBR): B, Bottom-Right (UFR): C, Bottom-Left (UFL): D
  // Top (UB): A, Right (UR): B, Bottom (UF): C, Left (UL): D
  // ----------------------------------------------------
  // U Corners
  { id: 'U-corner-A', letter: 'A', pieceType: 'corner', face: 'U', cubiePos: [-1, 1, -1], normal: [0, 1, 0], name: 'UBL (U)', faceColor: FACE_COLORS.U.hex },
  { id: 'U-corner-B', letter: 'B', pieceType: 'corner', face: 'U', cubiePos: [1, 1, -1], normal: [0, 1, 0], name: 'UBR (U)', faceColor: FACE_COLORS.U.hex },
  { id: 'U-corner-C', letter: 'C', pieceType: 'corner', face: 'U', cubiePos: [1, 1, 1], normal: [0, 1, 0], name: 'UFR (U)', faceColor: FACE_COLORS.U.hex },
  { id: 'U-corner-D', letter: 'D', pieceType: 'corner', face: 'U', cubiePos: [-1, 1, 1], normal: [0, 1, 0], name: 'UFL (U)', faceColor: FACE_COLORS.U.hex },
  // U Edges
  { id: 'U-edge-A', letter: 'A', pieceType: 'edge', face: 'U', cubiePos: [0, 1, -1], normal: [0, 1, 0], name: 'UB (U)', faceColor: FACE_COLORS.U.hex },
  { id: 'U-edge-B', letter: 'B', pieceType: 'edge', face: 'U', cubiePos: [1, 1, 0], normal: [0, 1, 0], name: 'UR (U)', faceColor: FACE_COLORS.U.hex },
  { id: 'U-edge-C', letter: 'C', pieceType: 'edge', face: 'U', cubiePos: [0, 1, 1], normal: [0, 1, 0], name: 'UF (U)', faceColor: FACE_COLORS.U.hex },
  { id: 'U-edge-D', letter: 'D', pieceType: 'edge', face: 'U', cubiePos: [-1, 1, 0], normal: [0, 1, 0], name: 'UL (U)', faceColor: FACE_COLORS.U.hex },
  // U Center
  { id: 'U-center', letter: 'U', pieceType: 'center', face: 'U', cubiePos: [0, 1, 0], normal: [0, 1, 0], name: 'U Center', faceColor: FACE_COLORS.U.hex },

  // ----------------------------------------------------
  // L FACE (Orange, x = -1, normal = [-1, 0, 0])
  // Looking at L with U at top, D at bottom, B at left, F at right:
  // Top-Left (LUB): E, Top-Right (LUF): F, Bottom-Right (LDF): G, Bottom-Left (LDB): H
  // Top (LU): E, Right (LF): F, Bottom (LD): G, Left (LB): H
  // ----------------------------------------------------
  // L Corners
  { id: 'L-corner-E', letter: 'E', pieceType: 'corner', face: 'L', cubiePos: [-1, 1, -1], normal: [-1, 0, 0], name: 'UBL (L)', faceColor: FACE_COLORS.L.hex },
  { id: 'L-corner-F', letter: 'F', pieceType: 'corner', face: 'L', cubiePos: [-1, 1, 1], normal: [-1, 0, 0], name: 'UFL (L)', faceColor: FACE_COLORS.L.hex },
  { id: 'L-corner-G', letter: 'G', pieceType: 'corner', face: 'L', cubiePos: [-1, -1, 1], normal: [-1, 0, 0], name: 'DFL (L)', faceColor: FACE_COLORS.L.hex },
  { id: 'L-corner-H', letter: 'H', pieceType: 'corner', face: 'L', cubiePos: [-1, -1, -1], normal: [-1, 0, 0], name: 'DBL (L)', faceColor: FACE_COLORS.L.hex },
  // L Edges
  { id: 'L-edge-E', letter: 'E', pieceType: 'edge', face: 'L', cubiePos: [-1, 1, 0], normal: [-1, 0, 0], name: 'UL (L)', faceColor: FACE_COLORS.L.hex },
  { id: 'L-edge-F', letter: 'F', pieceType: 'edge', face: 'L', cubiePos: [-1, 0, 1], normal: [-1, 0, 0], name: 'FL (L)', faceColor: FACE_COLORS.L.hex },
  { id: 'L-edge-G', letter: 'G', pieceType: 'edge', face: 'L', cubiePos: [-1, -1, 0], normal: [-1, 0, 0], name: 'DL (L)', faceColor: FACE_COLORS.L.hex },
  { id: 'L-edge-H', letter: 'H', pieceType: 'edge', face: 'L', cubiePos: [-1, 0, -1], normal: [-1, 0, 0], name: 'BL (L)', faceColor: FACE_COLORS.L.hex },
  // L Center
  { id: 'L-center', letter: 'L', pieceType: 'center', face: 'L', cubiePos: [-1, 0, 0], normal: [-1, 0, 0], name: 'L Center', faceColor: FACE_COLORS.L.hex },

  // ----------------------------------------------------
  // F FACE (Green, z = +1, normal = [0, 0, 1])
  // Looking at F with U at top, D at bottom, L at left, R at right:
  // Top-Left (FUL): I, Top-Right (FUR): J, Bottom-Right (FDR): K, Bottom-Left (FDL): L
  // Top (FU): I, Right (FR): J, Bottom (FD): K, Left (FL): L
  // ----------------------------------------------------
  // F Corners
  { id: 'F-corner-I', letter: 'I', pieceType: 'corner', face: 'F', cubiePos: [-1, 1, 1], normal: [0, 0, 1], name: 'UFL (F)', faceColor: FACE_COLORS.F.hex },
  { id: 'F-corner-J', letter: 'J', pieceType: 'corner', face: 'F', cubiePos: [1, 1, 1], normal: [0, 0, 1], name: 'UFR (F)', faceColor: FACE_COLORS.F.hex },
  { id: 'F-corner-K', letter: 'K', pieceType: 'corner', face: 'F', cubiePos: [1, -1, 1], normal: [0, 0, 1], name: 'DFR (F)', faceColor: FACE_COLORS.F.hex },
  { id: 'F-corner-L', letter: 'L', pieceType: 'corner', face: 'F', cubiePos: [-1, -1, 1], normal: [0, 0, 1], name: 'DFL (F)', faceColor: FACE_COLORS.F.hex },
  // F Edges
  { id: 'F-edge-I', letter: 'I', pieceType: 'edge', face: 'F', cubiePos: [0, 1, 1], normal: [0, 0, 1], name: 'UF (F)', faceColor: FACE_COLORS.F.hex },
  { id: 'F-edge-J', letter: 'J', pieceType: 'edge', face: 'F', cubiePos: [1, 0, 1], normal: [0, 0, 1], name: 'FR (F)', faceColor: FACE_COLORS.F.hex },
  { id: 'F-edge-K', letter: 'K', pieceType: 'edge', face: 'F', cubiePos: [0, -1, 1], normal: [0, 0, 1], name: 'DF (F)', faceColor: FACE_COLORS.F.hex },
  { id: 'F-edge-L', letter: 'L', pieceType: 'edge', face: 'F', cubiePos: [-1, 0, 1], normal: [0, 0, 1], name: 'FL (F)', faceColor: FACE_COLORS.F.hex },
  // F Center
  { id: 'F-center', letter: 'F', pieceType: 'center', face: 'F', cubiePos: [0, 0, 1], normal: [0, 0, 1], name: 'F Center', faceColor: FACE_COLORS.F.hex },

  // ----------------------------------------------------
  // R FACE (Red, x = +1, normal = [1, 0, 0])
  // Looking at R with U at top, D at bottom, F at left, B at right:
  // Top-Left (RUF): M, Top-Right (RUB): N, Bottom-Right (RDB): O, Bottom-Left (RDF): P
  // Top (RU): M, Right (RB): N, Bottom (RD): O, Left (RF): P
  // ----------------------------------------------------
  // R Corners
  { id: 'R-corner-M', letter: 'M', pieceType: 'corner', face: 'R', cubiePos: [1, 1, 1], normal: [1, 0, 0], name: 'UFR (R)', faceColor: FACE_COLORS.R.hex },
  { id: 'R-corner-N', letter: 'N', pieceType: 'corner', face: 'R', cubiePos: [1, 1, -1], normal: [1, 0, 0], name: 'UBR (R)', faceColor: FACE_COLORS.R.hex },
  { id: 'R-corner-O', letter: 'O', pieceType: 'corner', face: 'R', cubiePos: [1, -1, -1], normal: [1, 0, 0], name: 'DBR (R)', faceColor: FACE_COLORS.R.hex },
  { id: 'R-corner-P', letter: 'P', pieceType: 'corner', face: 'R', cubiePos: [1, -1, 1], normal: [1, 0, 0], name: 'DFR (R)', faceColor: FACE_COLORS.R.hex },
  // R Edges
  { id: 'R-edge-M', letter: 'M', pieceType: 'edge', face: 'R', cubiePos: [1, 1, 0], normal: [1, 0, 0], name: 'UR (R)', faceColor: FACE_COLORS.R.hex },
  { id: 'R-edge-N', letter: 'N', pieceType: 'edge', face: 'R', cubiePos: [1, 0, -1], normal: [1, 0, 0], name: 'BR (R)', faceColor: FACE_COLORS.R.hex },
  { id: 'R-edge-O', letter: 'O', pieceType: 'edge', face: 'R', cubiePos: [1, -1, 0], normal: [1, 0, 0], name: 'DR (R)', faceColor: FACE_COLORS.R.hex },
  { id: 'R-edge-P', letter: 'P', pieceType: 'edge', face: 'R', cubiePos: [1, 0, 1], normal: [1, 0, 0], name: 'FR (R)', faceColor: FACE_COLORS.R.hex },
  // R Center
  { id: 'R-center', letter: 'R', pieceType: 'center', face: 'R', cubiePos: [1, 0, 0], normal: [1, 0, 0], name: 'R Center', faceColor: FACE_COLORS.R.hex },

  // ----------------------------------------------------
  // B FACE (Blue, z = -1, normal = [0, 0, -1])
  // Looking at B with U at top, D at bottom, R at left, L at right:
  // Top-Left (BUR): Q, Top-Right (BUL): R, Bottom-Right (BDL): S, Bottom-Left (BDR): T
  // Top (BU): Q, Right (BL): R, Bottom (BD): S, Left (BR): T
  // ----------------------------------------------------
  // B Corners
  { id: 'B-corner-Q', letter: 'Q', pieceType: 'corner', face: 'B', cubiePos: [1, 1, -1], normal: [0, 0, -1], name: 'UBR (B)', faceColor: FACE_COLORS.B.hex },
  { id: 'B-corner-R', letter: 'R', pieceType: 'corner', face: 'B', cubiePos: [-1, 1, -1], normal: [0, 0, -1], name: 'UBL (B)', faceColor: FACE_COLORS.B.hex },
  { id: 'B-corner-S', letter: 'S', pieceType: 'corner', face: 'B', cubiePos: [-1, -1, -1], normal: [0, 0, -1], name: 'DBL (B)', faceColor: FACE_COLORS.B.hex },
  { id: 'B-corner-T', letter: 'T', pieceType: 'corner', face: 'B', cubiePos: [1, -1, -1], normal: [0, 0, -1], name: 'DBR (B)', faceColor: FACE_COLORS.B.hex },
  // B Edges
  { id: 'B-edge-Q', letter: 'Q', pieceType: 'edge', face: 'B', cubiePos: [0, 1, -1], normal: [0, 0, -1], name: 'UB (B)', faceColor: FACE_COLORS.B.hex },
  { id: 'B-edge-R', letter: 'R', pieceType: 'edge', face: 'B', cubiePos: [-1, 0, -1], normal: [0, 0, -1], name: 'BL (B)', faceColor: FACE_COLORS.B.hex },
  { id: 'B-edge-S', letter: 'S', pieceType: 'edge', face: 'B', cubiePos: [0, -1, -1], normal: [0, 0, -1], name: 'DB (B)', faceColor: FACE_COLORS.B.hex },
  { id: 'B-edge-T', letter: 'T', pieceType: 'edge', face: 'B', cubiePos: [1, 0, -1], normal: [0, 0, -1], name: 'BR (B)', faceColor: FACE_COLORS.B.hex },
  // B Center
  { id: 'B-center', letter: 'B', pieceType: 'center', face: 'B', cubiePos: [0, 0, -1], normal: [0, 0, -1], name: 'B Center', faceColor: FACE_COLORS.B.hex },

  // ----------------------------------------------------
  // D FACE (Yellow, y = -1, normal = [0, -1, 0])
  // Looking at D with F at top, B at bottom, L at left, R at right:
  // Top-Left (DFL): U, Top-Right (DFR): V, Bottom-Right (DBR): W, Bottom-Left (DBL): X
  // Top (DF): U, Right (DR): V, Bottom (DB): W, Left (DL): X
  // ----------------------------------------------------
  // D Corners
  { id: 'D-corner-U', letter: 'U', pieceType: 'corner', face: 'D', cubiePos: [-1, -1, 1], normal: [0, -1, 0], name: 'DFL (D)', faceColor: FACE_COLORS.D.hex },
  { id: 'D-corner-V', letter: 'V', pieceType: 'corner', face: 'D', cubiePos: [1, -1, 1], normal: [0, -1, 0], name: 'DFR (D)', faceColor: FACE_COLORS.D.hex },
  { id: 'D-corner-W', letter: 'W', pieceType: 'corner', face: 'D', cubiePos: [1, -1, -1], normal: [0, -1, 0], name: 'DBR (D)', faceColor: FACE_COLORS.D.hex },
  { id: 'D-corner-X', letter: 'X', pieceType: 'corner', face: 'D', cubiePos: [-1, -1, -1], normal: [0, -1, 0], name: 'DBL (D)', faceColor: FACE_COLORS.D.hex },
  // D Edges
  { id: 'D-edge-U', letter: 'U', pieceType: 'edge', face: 'D', cubiePos: [0, -1, 1], normal: [0, -1, 0], name: 'DF (D)', faceColor: FACE_COLORS.D.hex },
  { id: 'D-edge-V', letter: 'V', pieceType: 'edge', face: 'D', cubiePos: [1, -1, 0], normal: [0, -1, 0], name: 'DR (D)', faceColor: FACE_COLORS.D.hex },
  { id: 'D-edge-W', letter: 'W', pieceType: 'edge', face: 'D', cubiePos: [0, -1, -1], normal: [0, -1, 0], name: 'DB (D)', faceColor: FACE_COLORS.D.hex },
  { id: 'D-edge-X', letter: 'X', pieceType: 'edge', face: 'D', cubiePos: [-1, -1, 0], normal: [0, -1, 0], name: 'DL (D)', faceColor: FACE_COLORS.D.hex },
  // D Center
  { id: 'D-center', letter: 'D', pieceType: 'center', face: 'D', cubiePos: [0, -1, 0], normal: [0, -1, 0], name: 'D Center', faceColor: FACE_COLORS.D.hex },
];

export const SPEFFZ_FACE_LETTERS: Record<FaceName, { corners: string[]; edges: string[] }> = {
  U: { corners: ['A', 'B', 'C', 'D'], edges: ['A', 'B', 'C', 'D'] },
  L: { corners: ['E', 'F', 'G', 'H'], edges: ['E', 'F', 'G', 'H'] },
  F: { corners: ['I', 'J', 'K', 'L'], edges: ['I', 'J', 'K', 'L'] },
  R: { corners: ['M', 'N', 'O', 'P'], edges: ['M', 'N', 'O', 'P'] },
  B: { corners: ['Q', 'R', 'S', 'T'], edges: ['Q', 'R', 'S', 'T'] },
  D: { corners: ['U', 'V', 'W', 'X'], edges: ['U', 'V', 'W', 'X'] },
};
