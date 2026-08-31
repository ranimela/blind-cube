import sys

CORNER_NAMES = ['UBL', 'UBR', 'UFR', 'UFL', 'DFL', 'DFR', 'DBR', 'DBL']
CORNER_STICKERS = [
    ['A', 'E', 'R'], # 0: UBL (U=A, L=E, B=R)
    ['B', 'Q', 'N'], # 1: UBR (U=B, B=Q, R=N)
    ['C', 'M', 'J'], # 2: UFR (U=C, R=M, F=J) - Buffer
    ['D', 'I', 'F'], # 3: UFL (U=D, F=I, L=F)
    ['U', 'G', 'L'], # 4: DFL (D=U, L=G, F=L)
    ['V', 'K', 'P'], # 5: DFR (D=V, F=K, R=P)
    ['W', 'O', 'T'], # 6: DBR (D=W, R=O, B=T)
    ['X', 'S', 'H'], # 7: DBL (D=X, B=S, L=H)
]

EDGE_NAMES = ['UB', 'UR', 'UF', 'UL', 'FL', 'FR', 'BR', 'BL', 'DF', 'DR', 'DB', 'DL']
EDGE_STICKERS = [
    ['A', 'Q'], # 0: UB (U=A, B=Q)
    ['B', 'M'], # 1: UR (U=B, R=M)
    ['C', 'I'], # 2: UF (U=C, F=I) - Buffer
    ['D', 'E'], # 3: UL (U=D, L=E)
    ['L', 'F'], # 4: FL (F=L, L=F)
    ['J', 'P'], # 5: FR (F=J, R=P)
    ['T', 'N'], # 6: BR (B=T, R=N)
    ['R', 'H'], # 7: BL (B=R, L=H)
    ['U', 'K'], # 8: DF (D=U, F=K)
    ['V', 'O'], # 9: DR (D=V, R=O)
    ['W', 'S'], # 10: DB (D=W, B=S)
    ['X', 'G'], # 11: DL (D=X, L=G)
]

LETTER_TO_CORNER = {}
for p_idx, stickers in enumerate(CORNER_STICKERS):
    for o_idx, s in enumerate(stickers):
        LETTER_TO_CORNER[s] = (p_idx, o_idx)

LETTER_TO_EDGE = {}
for p_idx, stickers in enumerate(EDGE_STICKERS):
    for o_idx, s in enumerate(stickers):
        LETTER_TO_EDGE[s] = (p_idx, o_idx)

class CycleTracer:
    def __init__(self, edge_buffer=2, corner_buffer=2,
                 edge_break_priority=None, corner_break_priority=None):
        self.edge_buffer = edge_buffer # 2 = UF
        self.corner_buffer = corner_buffer # 2 = UFR
        self.edge_break_priority = edge_break_priority or ['A', 'B', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X']
        self.corner_break_priority = corner_break_priority or ['A', 'B', 'D', 'E', 'F', 'G', 'H', 'I', 'K', 'L', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X']

    def trace_edges(self, ep, eo):
        cur_ep = list(ep)
        cur_eo = list(eo)
        targets = []
        in_place_flips = []
        cycle_breaks = 0
        visited_pieces = set()
        
        buf = self.edge_buffer

        # First, identify which pieces are not permuted solved (i.e. part of permutation cycles)
        while True:
            p = cur_ep[buf]
            o = cur_eo[buf]
            
            if p == buf:
                # Buffer has buffer piece. Check if any UNPERMUTED piece remains (ep[i] != i)
                unpermuted = []
                for i in range(12):
                    if i == buf: continue
                    if cur_ep[i] != i and i not in visited_pieces:
                        unpermuted.append(i)
                
                if not unpermuted:
                    # Permutation cycles finished!
                    break
                
                # Need a cycle break!
                chosen_letter = None
                chosen_piece = None
                for letter in self.edge_break_priority:
                    p_idx, o_idx = LETTER_TO_EDGE[letter]
                    if p_idx in unpermuted:
                        chosen_letter = letter
                        chosen_piece = p_idx
                        break
                
                if chosen_letter is None:
                    break
                
                cycle_breaks += 1
                targets.append(chosen_letter)
                p_dest = cur_ep[chosen_piece]
                o_dest = cur_eo[chosen_piece]
                
                cur_ep[chosen_piece] = cur_ep[buf]
                cur_eo[chosen_piece] = (cur_eo[buf] + o_idx) % 2
                
                cur_ep[buf] = p_dest
                cur_eo[buf] = (o_dest + o_idx) % 2
                visited_pieces.add(chosen_piece)
            else:
                target_letter = EDGE_STICKERS[p][o]
                targets.append(target_letter)
                visited_pieces.add(p)
                
                p_dest = cur_ep[p]
                o_dest = cur_eo[p]
                
                cur_ep[p] = cur_ep[buf]
                cur_eo[p] = 0
                
                cur_ep[buf] = p_dest
                cur_eo[buf] = (o_dest + o) % 2

        # Check for in-place flips across all 12 edge positions (original ep and eo)
        for i in range(12):
            if ep[i] == i and eo[i] == 1:
                in_place_flips.append({
                    'piece': EDGE_NAMES[i],
                    'targetLetters': [EDGE_STICKERS[i][0], EDGE_STICKERS[i][1]]
                })

        has_parity = (len(targets) % 2 != 0)
        return {
            'targets': targets,
            'in_place_flips': in_place_flips,
            'cycle_breaks': cycle_breaks,
            'has_parity': has_parity
        }

    def trace_corners(self, cp, co):
        cur_cp = list(cp)
        cur_co = list(co)
        targets = []
        in_place_twists = []
        cycle_breaks = 0
        visited_pieces = set()
        
        buf = self.corner_buffer

        while True:
            p = cur_cp[buf]
            o = cur_co[buf]
            
            if p == buf:
                unpermuted = []
                for i in range(8):
                    if i == buf: continue
                    if cur_cp[i] != i and i not in visited_pieces:
                        unpermuted.append(i)
                
                if not unpermuted:
                    break
                
                chosen_letter = None
                chosen_piece = None
                for letter in self.corner_break_priority:
                    p_idx, o_idx = LETTER_TO_CORNER[letter]
                    if p_idx in unpermuted:
                        chosen_letter = letter
                        chosen_piece = p_idx
                        break
                
                if chosen_letter is None:
                    break
                
                cycle_breaks += 1
                targets.append(chosen_letter)
                p_dest = cur_cp[chosen_piece]
                o_dest = cur_co[chosen_piece]
                
                cur_cp[chosen_piece] = cur_cp[buf]
                cur_co[chosen_piece] = (cur_co[buf] + o_idx) % 3
                
                cur_cp[buf] = p_dest
                cur_co[buf] = (o_dest - o_idx + 3) % 3
                visited_pieces.add(chosen_piece)
            else:
                target_letter = CORNER_STICKERS[p][o]
                targets.append(target_letter)
                visited_pieces.add(p)
                
                p_dest = cur_cp[p]
                o_dest = cur_co[p]
                
                cur_cp[p] = cur_cp[buf]
                cur_co[p] = 0
                
                cur_cp[buf] = p_dest
                cur_co[buf] = (o_dest - o + 3) % 3

        # Check for in-place twists
        for i in range(8):
            if cp[i] == i and co[i] != 0:
                direction = 'CW' if co[i] == 1 else 'CCW'
                in_place_twists.append({
                    'piece': CORNER_NAMES[i],
                    'direction': direction,
                    'primaryTarget': CORNER_STICKERS[i][co[i]]
                })

        has_parity = (len(targets) % 2 != 0)
        return {
            'targets': targets,
            'in_place_twists': in_place_twists,
            'cycle_breaks': cycle_breaks,
            'has_parity': has_parity
        }

print("Updated CycleTracer with proper in-place separation.")
