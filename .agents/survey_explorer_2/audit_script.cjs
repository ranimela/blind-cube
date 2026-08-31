const fs = require('fs');
const path = require('path');

// 1. Audit Speffz data in src/constants/speffzData.ts
const speffzCode = fs.readFileSync(path.join(__dirname, '../../src/constants/speffzData.ts'), 'utf-8');

// Extract SPEFFZ_STICKERS JSON-like array
const stickersMatch = speffzCode.match(/export const SPEFFZ_STICKERS: SpeffzSticker\[\] = (\[[\s\S]*?\]);/);
if (!stickersMatch) {
  console.error('Could not find SPEFFZ_STICKERS in speffzData.ts');
  process.exit(1);
}

// Replace FACE_COLORS.X.hex with string
let rawArrayStr = stickersMatch[1]
  .replace(/FACE_COLORS\.U\.hex/g, "'#f8fafc'")
  .replace(/FACE_COLORS\.D\.hex/g, "'#eab308'")
  .replace(/FACE_COLORS\.F\.hex/g, "'#22c55e'")
  .replace(/FACE_COLORS\.B\.hex/g, "'#3b82f6'")
  .replace(/FACE_COLORS\.L\.hex/g, "'#f97316'")
  .replace(/FACE_COLORS\.R\.hex/g, "'#ef4444'");

const stickers = eval(rawArrayStr);
console.log('Total stickers in SPEFFZ_STICKERS:', stickers.length);

// Audit counts by pieceType
const corners = stickers.filter(s => s.pieceType === 'corner');
const edges = stickers.filter(s => s.pieceType === 'edge');
const centers = stickers.filter(s => s.pieceType === 'center');
console.log(`Corners: ${corners.length}, Edges: ${edges.length}, Centers: ${centers.length}`);

// Audit faces
const faces = ['U', 'L', 'F', 'R', 'B', 'D'];
faces.forEach(f => {
  const fStickers = stickers.filter(s => s.face === f);
  const fCorners = fStickers.filter(s => s.pieceType === 'corner');
  const fEdges = fStickers.filter(s => s.pieceType === 'edge');
  const fCenter = fStickers.filter(s => s.pieceType === 'center');
  console.log(`Face ${f}: total ${fStickers.length} (Corners: ${fCorners.map(c=>c.letter).join(',')}, Edges: ${fEdges.map(e=>e.letter).join(',')}, Center: ${fCenter[0]?.letter})`);
});

// Audit 3D Normals
const expectedNormals = {
  U: [0, 1, 0],
  D: [0, -1, 0],
  F: [0, 0, 1],
  B: [0, 0, -1],
  L: [-1, 0, 0],
  R: [1, 0, 0],
};

let normalErrors = 0;
stickers.forEach(s => {
  const exp = expectedNormals[s.face];
  if (s.normal[0] !== exp[0] || s.normal[1] !== exp[1] || s.normal[2] !== exp[2]) {
    console.error(`Normal error on sticker ${s.id}: expected ${exp}, got ${s.normal}`);
    normalErrors++;
  }
});
console.log('Normal vector errors:', normalErrors);

// Audit Corner Physical Cubie grouping (8 corner cubies)
const cornerCubies = {};
corners.forEach(c => {
  const key = `${c.cubiePos[0]},${c.cubiePos[1]},${c.cubiePos[2]}`;
  if (!cornerCubies[key]) cornerCubies[key] = {};
  cornerCubies[key][c.face] = c.letter;
});
console.log('Unique corner cubie positions count:', Object.keys(cornerCubies).length);
console.log('Corner cubies map:', JSON.stringify(cornerCubies, null, 2));

// Audit Edge Physical Cubie grouping (12 edge cubies)
const edgeCubies = {};
edges.forEach(e => {
  const key = `${e.cubiePos[0]},${e.cubiePos[1]},${e.cubiePos[2]}`;
  if (!edgeCubies[key]) edgeCubies[key] = {};
  edgeCubies[key][e.face] = e.letter;
});
console.log('Unique edge cubie positions count:', Object.keys(edgeCubies).length);
console.log('Edge cubies map:', JSON.stringify(edgeCubies, null, 2));

// Audit wordlist.json
const wordlist = require('../../src/data/wordlist.json');
const letters = 'ABCDEFGHIJKLMNOPQRSTUVWX'.split('');
let missingPairs = 0;
let pairCounts = {};
for (const f of letters) {
  for (const s of letters) {
    const pair = f + s;
    if (!wordlist[pair]) {
      missingPairs++;
    } else {
      const len = wordlist[pair].length;
      pairCounts[len] = (pairCounts[len] || 0) + 1;
    }
  }
}
console.log('Wordlist audit:', { missingPairs, pairCountsDistribution: pairCounts });

