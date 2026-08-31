export type SpeffzMode = 'corners' | 'edges' | 'full';

export type PieceType = 'corner' | 'edge' | 'center';

export type FaceName = 'U' | 'L' | 'F' | 'R' | 'B' | 'D';

export interface SpeffzSticker {
  id: string;
  letter: string; // 'A' - 'X', or center identifier
  pieceType: PieceType;
  face: FaceName;
  // Coordinate offsets on the 3x3 cube grid (-1, 0, 1)
  cubiePos: [number, number, number];
  // Normal vector of the sticker face (e.g., [0, 1, 0] for U)
  normal: [number, number, number];
  name: string; // standard BLD piece target name e.g., "UBL", "UR", "U"
  faceColor: string; // Hex color string
}

export interface LetterPairChunk {
  id: string;
  pair: string; // 2 letters e.g. "AB" or 1 letter for trailing single "A"
  firstLetter: string;
  secondLetter?: string;
  isSingle: boolean;
  mnemonic: string;
  alternatives: string[];
  isCustom?: boolean;
}

export interface MnemonicDictionary {
  [pair: string]: string[];
}

export interface SpeffzPieceInfo {
  face: FaceName;
  order: string[]; // Letters in standard clockwise order for the face
}
