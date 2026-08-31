# 3BLD Cycle Tracer Simulation & Stress Testing
from verify_math import Cube

# Speffz Mappings
# Corners:
# 0: UBL -> co=0: 'A', co=1: 'E', co=2: 'R'
# 1: UBR -> co=0: 'B', co=1: 'N', co=2: 'Q'
# 2: UFR -> co=0: 'C', co=1: 'M', co=2: 'J'
# 3: UFL -> co=0: 'D', co=1: 'I', co=2: 'F'
# 4: DFL -> co=0: 'U', co=1: 'F'(L), co=2: 'L'(F) -> wait: 4 DFL: U facelet='U', L facelet='G', F facelet='L'
# 5: DFR -> co=0: 'V', co=1: 'K', co=2: 'P'
# 6: DBR -> co=0: 'W', co=1: 'O', co=2: 'T'
# 7: DBL -> co=0: 'X', co=1: 'S', co=2: 'H'

# Edges:
# 0: UB -> eo=0: 'A', eo=1: 'Q'
# 1: UR -> eo=0: 'B', eo=1: 'M'
# 2: UF -> eo=0: 'C', eo=1: 'I'
# 3: UL -> eo=0: 'D', eo=1: 'E'
# 4: FL -> eo=0: 'L', eo=1: 'F'
# 5: FR -> eo=0: 'P', eo=1: 'J'
# 6: BR -> eo=0: 'T', eo=1: 'N'
# 7: BL -> eo=0: 'R', eo=1: 'H'
# 8: DF -> eo=0: 'U', eo=1: 'K'
# 9: DR -> eo=0: 'V', eo=1: 'O'
# 10: DB -> eo=0: 'W', eo=1: 'S'
# 11: DL -> eo=0: 'X', eo=1: 'G'

EDGE_SPEFFZ = {
    0: {0: 'A', 1: 'Q'},
    1: {0: 'B', 1: 'M'},
    2: {0: 'C', 1: 'I'},
    3: {0: 'D', 1: 'E'},
    4: {0: 'L', 1: 'F'},
    5: {0: 'P', 1: 'J'},
    6: {0: 'T', 1: 'N'},
    7: {0: 'R', 1: 'H'},
    8: {0: 'U', 1: 'K'},
    9: {0: 'V', 1: 'O'},
    10: {0: 'W', 1: 'S'},
    11: {0: 'X', 1: 'G'}
}

# Buffer is UF (piece index 2, default sticker 'C')
def trace_edges(cube):
    buf_slot = 2 # UF
    visited = [False] * 12
    targets = []
    in_place_flips = []

    # Priority for cycle breaking (piece indices in Speffz order: UB(0), UR(1), UL(3), FL(4), FR(5), BR(6), BL(7), DF(8), DR(9), DB(10), DL(11))
    break_priority = [0, 1, 3, 4, 5, 6, 7, 8, 9, 10, 11]

    # First check pieces in their correct slots
    for i in range(12):
        if cube.ep[i] == i:
            visited[i] = True
            if cube.eo[i] == 1:
                in_place_flips.append((i, EDGE_SPEFFZ[i][0], EDGE_SPEFFZ[i][1]))

    # Now trace cycles starting from buffer
    curr_slot = buf_slot
    cycle_start = None

    while not all(visited):
        # Piece currently in curr_slot
        piece_idx = cube.ep[curr_slot]
        piece_ori = cube.eo[curr_slot]

        if piece_idx == buf_slot and piece_ori == 0:
            # Buffer holds solved buffer piece (or cycle closed)
            # Find next unvisited piece
            next_break = None
            for p in break_priority:
                if not visited[p]:
                    next_break = p
                    break
            if next_break is None:
                break
            # Break cycle into next_break
            break_target = EDGE_SPEFFZ[next_break][0] # Primary sticker
            targets.append(break_target)
            curr_slot = next_break
            cycle_start = next_break
        else:
            # Normal shoot or cycle return
            target_letter = EDGE_SPEFFZ[piece_idx][piece_ori]
            targets.append(target_letter)
            visited[curr_slot] = True
            if piece_idx == cycle_start:
                # Cycle closed!
                curr_slot = buf_slot
                cycle_start = None
            else:
                curr_slot = piece_idx

    visited[buf_slot] = True
    return targets, in_place_flips

# Let's test with T-perm:
c = Cube()
for m in ["R", "U", "R'", "U'", "R'", "F", "R2", "U'", "R'", "U'", "R", "U", "R'", "F'"]:
    c.move(m)
targets, flips = trace_edges(c)
print("T-perm edge targets:", targets, "flips:", flips)
print("T-perm target count:", len(targets), "Parity:", len(targets) % 2 != 0)
