# Let us define the 54 facelets according to standard Speffz / Kociemba layout
# Faces: U (0..8), L (9..17), F (18..26), R (27..35), B (36..44), D (45..53)

# Facelets on each face (3x3):
# U:
#  0  1  2  (UBL, UB, UBR)
#  3  4  5  (UL,  U,  UR)
#  6  7  8  (UFL, UF, UFR)
#
# L:
#  9 10 11  (UBL, UL, UFL)
# 12 13 14  (BL,  L,  FL)
# 15 16 17  (DBL, DL, DFL)
#
# F:
# 18 19 20  (UFL, UF, UFR)
# 21 22 23  (FL,  F,  FR)
# 24 25 26  (DFL, DF, DFR)
#
# R:
# 27 28 29  (UFR, UR, UBR)
# 30 31 32  (FR,  R,  BR)
# 33 34 35  (DFR, DR, DBR)
#
# B:
# 36 37 38  (UBR, UB, UBL)
# 39 40 41  (BR,  B,  BL)
# 42 43 44  (DBR, DB, DBL)
#
# D:
# 45 46 47  (DFL, DF, DFR)
# 48 49 50  (DL,  D,  DR)
# 51 52 53  (DBL, DB, DBR)

# Let us check 4-cycles of facelets for each face turn!
def rotate_face_cw(f_start):
    # 0 1 2     6 3 0
    # 3 4 5  -> 7 4 1
    # 6 7 8     8 5 2
    # Cycles:
    # (0 -> 2 -> 8 -> 6)
    # (1 -> 5 -> 7 -> 3)
    s = f_start
    return [
        (s+0, s+2, s+8, s+6),
        (s+1, s+5, s+7, s+3)
    ]

# Moves as 4-cycles (a -> b -> c -> d -> a means a goes to b, b to c, c to d, d to a)
# or in permutation index replacement: new[b] = old[a], new[c] = old[b], new[d] = old[c], new[a] = old[d]

FACELET_MOVES = {
    'U': rotate_face_cw(0) + [
        (18, 9, 36, 27), # F-top -> L-top -> B-top -> R-top -> F-top (wait! U turn turns F top into L top!)
        (19, 10, 37, 28),
        (20, 11, 38, 29)
    ],
    'D': rotate_face_cw(45) + [
        (24, 33, 42, 15), # F-bot -> R-bot -> B-bot -> L-bot -> F-bot
        (25, 34, 43, 16),
        (26, 35, 44, 17)
    ],
    'F': rotate_face_cw(18) + [
        (6, 27, 47, 17), # UFL -> UFR(R0) -> DFR(D2) -> DFL(L8) (U6 -> R27 -> D47 -> L17 -> U6)
        (7, 30, 46, 14), # UF -> FR(R3) -> DF(D1) -> FL(L5) (U7 -> R30 -> D46 -> L14 -> U7)
        (8, 33, 45, 11)  # UFR -> DFR(R6) -> DFL(D0) -> UFL(L2) (U8 -> R33 -> D45 -> L11 -> U8)
    ],
    'B': rotate_face_cw(36) + [
        (2, 9, 51, 35),  # UBR -> UBL(L0) -> DBL(D6) -> DBR(R8)
        (1, 12, 52, 32), # UB -> BL(L3) -> DB(D7) -> BR(R5)
        (0, 15, 53, 29)  # UBL -> DBL(L6) -> DBR(D8) -> UBR(R2)
    ],
    'R': rotate_face_cw(27) + [
        (8, 36, 53, 20), # UFR -> UBR(B0) -> DBR(D8) -> DFR(F2) (wait! U8 -> B36 -> D53 -> F20)
        (5, 39, 50, 23), # UR -> BR(B3) -> DR(D5) -> FR(F5)
        (2, 42, 47, 26)  # UBR -> DBR(B6) -> DFR(D2) -> UFR(F8)
    ],
    'L': rotate_face_cw(9) + [
        (0, 18, 45, 44), # UBL -> UFL(F0) -> DFL(D0) -> DBL(B8)
        (3, 21, 48, 41), # UL -> FL(F3) -> DL(D3) -> BL(B5)
        (6, 24, 51, 38)  # UFL -> DFL(F6) -> DBL(D6) -> UBL(B2)
    ]
}

class FaceletCube:
    def __init__(self):
        # 54 facelets, each initially has its own face index:
        # 0..8: 'U', 9..17: 'L', 18..26: 'F', 27..35: 'R', 36..44: 'B', 45..53: 'D'
        self.f = ['U']*9 + ['L']*9 + ['F']*9 + ['R']*9 + ['B']*9 + ['D']*9

    def apply_cycle(self, cycle):
        # (a, b, c, d) means a -> b -> c -> d -> a
        # new[b] = old[a], new[c] = old[b], new[d] = old[c], new[a] = old[d]
        a, b, c, d = cycle
        old_a, old_b, old_c, old_d = self.f[a], self.f[b], self.f[c], self.f[d]
        self.f[b] = old_a
        self.f[c] = old_b
        self.f[d] = old_c
        self.f[a] = old_d

    def move(self, m):
        if m in FACELET_MOVES:
            for cycle in FACELET_MOVES[m]:
                self.apply_cycle(cycle)
        elif m.endswith("'"):
            base = m[0]
            for _ in range(3): self.move(base)
        elif m.endswith("2"):
            base = m[0]
            for _ in range(2): self.move(base)

    def apply_moves(self, s):
        for m in s.split():
            self.move(m)

# Let us verify (R U R' U')^6
fc = FaceletCube()
for _ in range(6):
    fc.apply_moves("R U R' U'")
assert fc.f == ['U']*9 + ['L']*9 + ['F']*9 + ['R']*9 + ['B']*9 + ['D']*9, "Facelet Sexy Move failed!"
print("PASS: Facelet Sexy Move (R U R' U')^6 verified.")

# Let us test superflip on FaceletCube
fc = FaceletCube()
superflip = "U R2 F B R B2 R U2 L B2 R U' D' R2 F R' L B2 U2 F2"
fc.apply_moves(superflip)

# Check all 8 corners:
# Corners on U:
# UBL: (0, 9, 38) -> U, L, B
# UBR: (2, 29, 36) -> U, R, B
# UFR: (8, 20, 27) -> U, F, R
# UFL: (6, 11, 18) -> U, L, F
# DFL: (45, 17, 24) -> D, L, F
# DFR: (47, 26, 33) -> D, F, R
# DBR: (53, 35, 42) -> D, R, B
# DBL: (51, 15, 44) -> D, L, B

print("UBL:", fc.f[0], fc.f[9], fc.f[38])
print("UBR:", fc.f[2], fc.f[29], fc.f[36])
print("UFR:", fc.f[8], fc.f[20], fc.f[27])
print("UFL:", fc.f[6], fc.f[11], fc.f[18])
print("DFL:", fc.f[45], fc.f[17], fc.f[24])
print("DFR:", fc.f[47], fc.f[26], fc.f[33])
print("DBR:", fc.f[53], fc.f[35], fc.f[42])
print("DBL:", fc.f[51], fc.f[15], fc.f[44])

# Check all 12 edges:
print("UB:", fc.f[1], fc.f[37])
print("UR:", fc.f[5], fc.f[28])
print("UF:", fc.f[7], fc.f[19])
print("UL:", fc.f[3], fc.f[10])
print("FL:", fc.f[21], fc.f[14])
print("FR:", fc.f[23], fc.f[30])
print("BR:", fc.f[39], fc.f[32])
print("BL:", fc.f[41], fc.f[12])
print("DF:", fc.f[46], fc.f[25])
print("DR:", fc.f[50], fc.f[34])
print("DB:", fc.f[52], fc.f[43])
print("DL:", fc.f[48], fc.f[16])
