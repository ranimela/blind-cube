# Test exact physical tracking of all 54 facelets and compare with vector math
class PhysicalCube:
    def __init__(self):
        # 6 faces: U:0, L:1, F:2, R:3, B:4, D:5
        # Each face has 9 facelets (0..8)
        # U: 0..8 (0:UBL, 1:UB, 2:UBR, 3:UL, 4:U, 5:UR, 6:UFL, 7:UF, 8:UFR)
        # L: 0..8 (0:UBL, 1:UL, 2:UFL, 3:BL, 4:L, 5:FL, 6:DBL, 7:DL, 8:DFL)
        # F: 0..8 (0:UFL, 1:UF, 2:UFR, 3:FL, 4:F, 5:FR, 6:DFL, 7:DF, 8:DFR)
        # R: 0..8 (0:UFR, 1:UR, 2:UBR, 3:FR, 4:R, 5:BR, 6:DFR, 7:DR, 8:DBR)
        # B: 0..8 (0:UBR, 1:UB, 2:UBL, 3:BR, 4:B, 5:BL, 6:DBR, 7:DB, 8:DBL)
        # D: 0..8 (0:DFL, 1:DF, 2:DFR, 3:DL, 4:D, 5:DR, 6:DBL, 7:DB, 8:DBR)
        self.faces = {f: [f]*9 for f in ['U', 'L', 'F', 'R', 'B', 'D']}

    def rot_face(self, f):
        # 90 deg CW on face f
        old = list(self.faces[f])
        # 0 1 2     6 3 0
        # 3 4 5  -> 7 4 1
        # 6 7 8     8 5 2
        p = [6, 3, 0, 7, 4, 1, 8, 5, 2]
        self.faces[f] = [old[p[i]] for i in range(9)]

    def move(self, m):
        if m == 'U':
            self.rot_face('U')
            # L top (0,1,2), B top (0,1,2), R top (0,1,2), F top (0,1,2)
            old_F = self.faces['F'][0:3]
            old_R = self.faces['R'][0:3]
            old_B = self.faces['B'][0:3]
            old_L = self.faces['L'][0:3]
            self.faces['F'][0:3] = old_R
            self.faces['L'][0:3] = old_F
            self.faces['B'][0:3] = old_L
            self.faces['R'][0:3] = old_B
        elif m == "U'":
            for _ in range(3): self.move('U')
        elif m == 'U2':
            for _ in range(2): self.move('U')
        elif m == 'D':
            self.rot_face('D')
            old_F = self.faces['F'][6:9]
            old_R = self.faces['R'][6:9]
            old_B = self.faces['B'][6:9]
            old_L = self.faces['L'][6:9]
            self.faces['F'][6:9] = old_L
            self.faces['R'][6:9] = old_F
            self.faces['B'][6:9] = old_R
            self.faces['L'][6:9] = old_B
        elif m == "D'":
            for _ in range(3): self.move('D')
        elif m == 'D2':
            for _ in range(2): self.move('D')
        elif m == 'F':
            self.rot_face('F')
            # U bottom (6,7,8), R left (0,3,6), D top (0,1,2), L right (2,5,8)
            old_U = [self.faces['U'][6], self.faces['U'][7], self.faces['U'][8]]
            old_R = [self.faces['R'][0], self.faces['R'][3], self.faces['R'][6]]
            old_D = [self.faces['D'][0], self.faces['D'][1], self.faces['D'][2]]
            old_L = [self.faces['L'][2], self.faces['L'][5], self.faces['L'][8]]
            # U bottom becomes L right (reversed: L8, L5, L2)
            self.faces['U'][6], self.faces['U'][7], self.faces['U'][8] = old_L[2], old_L[1], old_L[0]
            # R left becomes U bottom
            self.faces['R'][0], self.faces['R'][3], self.faces['R'][6] = old_U[0], old_U[1], old_U[2]
            # D top becomes R left (reversed: R6, R3, R0)
            self.faces['D'][0], self.faces['D'][1], self.faces['D'][2] = old_R[2], old_R[1], old_R[0]
            # L right becomes D top
            self.faces['L'][2], self.faces['L'][5], self.faces['L'][8] = old_D[0], old_D[1], old_D[2]
        elif m == "F'":
            for _ in range(3): self.move('F')
        elif m == 'F2':
            for _ in range(2): self.move('F')
        elif m == 'B':
            self.rot_face('B')
            # U top (2,1,0), L left (0,3,6), D bottom (8,7,6), R right (2,5,8)
            old_U = [self.faces['U'][2], self.faces['U'][1], self.faces['U'][0]]
            old_L = [self.faces['L'][0], self.faces['L'][3], self.faces['L'][6]]
            old_D = [self.faces['D'][8], self.faces['D'][7], self.faces['D'][6]]
            old_R = [self.faces['R'][2], self.faces['R'][5], self.faces['R'][8]]
            self.faces['U'][2], self.faces['U'][1], self.faces['U'][0] = old_R[0], old_R[1], old_R[2]
            self.faces['L'][0], self.faces['L'][3], self.faces['L'][6] = old_U[0], old_U[1], old_U[2]
            self.faces['D'][8], self.faces['D'][7], self.faces['D'][6] = old_L[0], old_L[1], old_L[2]
            self.faces['R'][2], self.faces['R'][5], self.faces['R'][8] = old_D[0], old_D[1], old_D[2]
        elif m == "B'":
            for _ in range(3): self.move('B')
        elif m == 'B2':
            for _ in range(2): self.move('B')
        elif m == 'R':
            self.rot_face('R')
            # U right (2,5,8), B left (0,3,6) -> reversed in 3D: B6, B3, B0, D right (2,5,8), F right (2,5,8)
            old_U = [self.faces['U'][2], self.faces['U'][5], self.faces['U'][8]]
            old_B = [self.faces['B'][6], self.faces['B'][3], self.faces['B'][0]]
            old_D = [self.faces['D'][2], self.faces['D'][5], self.faces['D'][8]]
            old_F = [self.faces['F'][2], self.faces['F'][5], self.faces['F'][8]]
            self.faces['U'][2], self.faces['U'][5], self.faces['U'][8] = old_F[0], old_F[1], old_F[2]
            self.faces['B'][6], self.faces['B'][3], self.faces['B'][0] = old_U[0], old_U[1], old_U[2]
            self.faces['D'][2], self.faces['D'][5], self.faces['D'][8] = old_B[0], old_B[1], old_B[2]
            self.faces['F'][2], self.faces['F'][5], self.faces['F'][8] = old_D[0], old_D[1], old_D[2]
        elif m == "R'":
            for _ in range(3): self.move('R')
        elif m == 'R2':
            for _ in range(2): self.move('R')
        elif m == 'L':
            self.rot_face('L')
            # U left (0,3,6), F left (0,3,6), D left (0,3,6), B right (8,5,2)
            old_U = [self.faces['U'][0], self.faces['U'][3], self.faces['U'][6]]
            old_F = [self.faces['F'][0], self.faces['F'][3], self.faces['F'][6]]
            old_D = [self.faces['D'][0], self.faces['D'][3], self.faces['D'][6]]
            old_B = [self.faces['B'][8], self.faces['B'][5], self.faces['B'][2]]
            self.faces['U'][0], self.faces['U'][3], self.faces['U'][6] = old_B[0], old_B[1], old_B[2]
            self.faces['F'][0], self.faces['F'][3], self.faces['F'][6] = old_U[0], old_U[1], old_U[2]
            self.faces['D'][0], self.faces['D'][3], self.faces['D'][6] = old_F[0], old_F[1], old_F[2]
            self.faces['B'][8], self.faces['B'][5], self.faces['B'][2] = old_D[0], old_D[1], old_D[2]
        elif m == "L'":
            for _ in range(3): self.move('L')
        elif m == 'L2':
            for _ in range(2): self.move('L')

    def apply_moves(self, s):
        for m in s.split():
            self.move(m)

    def extract_state(self):
        # Let's inspect all 8 corners and 12 edges
        # Corners:
        # 0: UBL (U0, L0, B2)
        # 1: UBR (U2, R2, B0)
        # 2: UFR (U8, F2, R0)
        # 3: UFL (U6, L2, F0)
        # 4: DFL (D0, L8, F6)
        # 5: DFR (D2, F8, R6)
        # 6: DBR (D8, R8, B6)
        # 7: DBL (D6, B8, L6)
        corner_stickers = [
            (self.faces['U'][0], self.faces['L'][0], self.faces['B'][2]), # UBL: U, L, B
            (self.faces['U'][2], self.faces['B'][0], self.faces['R'][2]), # UBR: U, B, R
            (self.faces['U'][8], self.faces['R'][0], self.faces['F'][2]), # UFR: U, R, F
            (self.faces['U'][6], self.faces['F'][0], self.faces['L'][2]), # UFL: U, F, L
            (self.faces['D'][0], self.faces['L'][8], self.faces['F'][6]), # DFL: D, L, F
            (self.faces['D'][2], self.faces['F'][8], self.faces['R'][6]), # DFR: D, F, R
            (self.faces['D'][8], self.faces['R'][8], self.faces['B'][6]), # DBR: D, R, B
            (self.faces['D'][6], self.faces['B'][8], self.faces['L'][6]), # DBL: D, B, L
        ]
        
        # Canonical corner pieces:
        canonical_corners = [
            {'U', 'L', 'B'}, # 0: UBL
            {'U', 'B', 'R'}, # 1: UBR
            {'U', 'R', 'F'}, # 2: UFR
            {'U', 'F', 'L'}, # 3: UFL
            {'D', 'L', 'F'}, # 4: DFL
            {'D', 'F', 'R'}, # 5: DFR
            {'D', 'R', 'B'}, # 6: DBR
            {'D', 'B', 'L'}, # 7: DBL
        ]
        
        cp = []
        co = []
        for i, (s0, s1, s2) in enumerate(corner_stickers):
            s_set = {s0, s1, s2}
            piece_idx = canonical_corners.index(s_set)
            cp.append(piece_idx)
            # Find where U or D sticker is
            if s0 in ('U', 'D'):
                co.append(0)
            elif s1 in ('U', 'D'):
                co.append(1)
            elif s2 in ('U', 'D'):
                co.append(2)
            else:
                raise ValueError("No U/D sticker in corner")
        
        # Edges:
        # 0: UB (U1, B1)
        # 1: UR (U5, R1)
        # 2: UF (U7, F1)
        # 3: UL (U3, L1)
        # 4: FL (F3, L5)
        # 5: FR (F5, R3)
        # 6: BR (B3, R5)
        # 7: BL (B5, L3)
        # 8: DF (D1, F7)
        # 9: DR (D5, R7)
        # 10: DB (D7, B7)
        # 11: DL (D3, L7)
        edge_stickers = [
            (self.faces['U'][1], self.faces['B'][1]), # 0: UB
            (self.faces['U'][5], self.faces['R'][1]), # 1: UR
            (self.faces['U'][7], self.faces['F'][1]), # 2: UF
            (self.faces['U'][3], self.faces['L'][1]), # 3: UL
            (self.faces['F'][3], self.faces['L'][5]), # 4: FL
            (self.faces['F'][5], self.faces['R'][3]), # 5: FR
            (self.faces['B'][3], self.faces['R'][5]), # 6: BR
            (self.faces['B'][5], self.faces['L'][3]), # 7: BL
            (self.faces['D'][1], self.faces['F'][7]), # 8: DF
            (self.faces['D'][5], self.faces['R'][7]), # 9: DR
            (self.faces['D'][7], self.faces['B'][7]), # 10: DB
            (self.faces['D'][3], self.faces['L'][7]), # 11: DL
        ]
        
        canonical_edges = [
            {'U', 'B'}, {'U', 'R'}, {'U', 'F'}, {'U', 'L'},
            {'F', 'L'}, {'F', 'R'}, {'B', 'R'}, {'B', 'L'},
            {'D', 'F'}, {'D', 'R'}, {'D', 'B'}, {'D', 'L'}
        ]
        
        ep = []
        eo = []
        for i, (s0, s1) in enumerate(edge_stickers):
            s_set = {s0, s1}
            piece_idx = canonical_edges.index(s_set)
            ep.append(piece_idx)
            # EO rule: For U/D edges, orientation is 0 if U/D color is on U/D face
            # For E-layer edges (4..7), orientation is 0 if F/B color is on F/B face
            if piece_idx in (0, 1, 2, 3, 8, 9, 10, 11):
                if s0 in ('U', 'D'):
                    eo.append(0)
                else:
                    eo.append(1)
            else:
                # E-layer edge
                if s0 in ('F', 'B'):
                    eo.append(0)
                else:
                    eo.append(1)
        
        return cp, co, ep, eo

# Let us run Superflip on PhysicalCube!
p = PhysicalCube()
superflip = "U R2 F B R B2 R U2 L B2 R U' D' R2 F R' L B2 U2 F2"
p.apply_moves(superflip)
cp, co, ep, eo = p.extract_state()
print("Physical Cube Superflip Results:")
print("cp:", cp)
print("co:", co)
print("ep:", ep)
print("eo:", eo)
