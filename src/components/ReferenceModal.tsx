import React from 'react';
import { X, BookOpen } from 'lucide-react';
import { FACE_COLORS } from '../constants/speffzData';

interface ReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReferenceModal: React.FC<ReferenceModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const speffzFaces = [
    { face: 'U (Up / White)', color: FACE_COLORS.U.hex, corners: 'A, B, C, D', edges: 'A, B, C, D', desc: 'Top face (A=Top-Left, B=Top-Right, C=Bottom-Right, D=Bottom-Left)' },
    { face: 'L (Left / Orange)', color: FACE_COLORS.L.hex, corners: 'E, F, G, H', edges: 'E, F, G, H', desc: 'Left face' },
    { face: 'F (Front / Green)', color: FACE_COLORS.F.hex, corners: 'I, J, K, L', edges: 'I, J, K, L', desc: 'Front face' },
    { face: 'R (Right / Red)', color: FACE_COLORS.R.hex, corners: 'M, N, O, P', edges: 'M, N, O, P', desc: 'Right face' },
    { face: 'B (Back / Blue)', color: FACE_COLORS.B.hex, corners: 'Q, R, S, T', edges: 'Q, R, S, T', desc: 'Back face' },
    { face: 'D (Down / Yellow)', color: FACE_COLORS.D.hex, corners: 'U, V, W, X', edges: 'U, V, W, X', desc: 'Bottom face' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-950 text-sky-400 border border-sky-800">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">
                Speffz Lettering Scheme Reference
              </h2>
              <p className="text-xs text-slate-400">
                The international standard lettering scheme for 3BLD solving
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800/80 text-xs text-slate-300 space-y-1.5">
            <p className="font-semibold text-sky-300">How Speffz Works:</p>
            <p>
              Letters go from <strong>A to X</strong> (24 targets each for corners and edges). Letters start on the <strong>U (Up)</strong> face and travel clockwise across faces in order: <strong>U → L → F → R → B → D</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {speffzFaces.map((item, idx) => (
              <div key={idx} className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-bold text-sm text-slate-200">{item.face}</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Corners:</span>
                    <span className="font-mono font-bold text-amber-400">{item.corners}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Edges:</span>
                    <span className="font-mono font-bold text-emerald-400">{item.edges}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 bg-slate-950/40 rounded-xl border border-slate-800/60 text-xs text-slate-400 space-y-1">
            <span className="font-semibold text-slate-300">Tips for 3BLD Memo:</span>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>Letter pairs are memoized in chunks of 2 (e.g. AB = "Abbey").</li>
              <li>An odd remaining letter represents parity / single target audio memo.</li>
              <li>Click stickers directly on the 3D cube to trace target cycles quickly.</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold transition-all shadow-md"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
