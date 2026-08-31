import random

class Cube:
    def __init__(self):
        # cp: 0..7, co: 0..2
        # 0:UBL, 1:UBR, 2:UFR, 3:UFL, 4:DFL, 5:DFR, 6:DBR, 7:DBL
        self.cp = list(range(8))
        self.co = [0] * 8
        # ep: 0..11, eo: 0..1
        # 0:UB, 1:UR, 2:UF, 3:UL, 4:FL, 5:FR, 6:BR, 7:BL, 8:DF, 9:DR, 10:DB, 11:DL
        self.ep = list(range(12))
        self.eo = [0] * 12

    def clone(self):
        c = Cube()
        c.cp = list(self.cp)
        c.co = list(self.co)
        c.ep = list(self.ep)
        c.eo = list(self.eo)
        return c

    def apply_cycle_corner(self, cycle, delta_co):
        # cycle: (c0, c1, c2, c3) piece at c0 -> c1 -> c2 -> c3 -> c0
        # delta_co: [d0, d1, d2, d3] for destinations c1, c2, c3, c0
        old_cp = list(self.cp)
        old_co = list(self.co)
        c0, c1, c2, c3 = cycle
        d0, d1, d2, d3 = delta_co
        
        self.cp[c1] = old_cp[c0]
        self.co[c1] = (old_co[c0] + d0) % 3
        
        self.cp[c2] = old_cp[c1]
        self.co[c2] = (old_co[c1] + d1) % 3
        
        self.cp[c3] = old_cp[c2]
        self.co[c3] = (old_co[c2] + d2) % 3
        
        self.cp[c0] = old_cp[c3]
        self.co[c0] = (old_co[c3] + d3) % 3

    def apply_cycle_edge(self, cycle, delta_eo):
        old_ep = list(self.ep)
        old_eo = list(self.eo)
        e0, e1, e2, e3 = cycle
        d0, d1, d2, d3 = delta_eo
        
        self.ep[e1] = old_ep[e0]
        self.eo[e1] = (old_eo[e0] + d0) % 2
        
        self.ep[e2] = old_ep[e1]
        self.eo[e2] = (old_eo[e1] + d1) % 2
        
        self.ep[e3] = old_ep[e2]
        self.eo[e3] = (old_eo[e2] + d2) % 2
        
        self.ep[e0] = old_ep[e3]
        self.eo[e0] = (old_eo[e3] + d3) % 2

    def move(self, m):
        if m == 'U':
            self.apply_cycle_corner((0, 1, 2, 3), [0, 0, 0, 0])
            self.apply_cycle_edge((0, 1, 2, 3), [0, 0, 0, 0])
        elif m == "U'":
            for _ in range(3): self.move('U')
        elif m == 'U2':
            for _ in range(2): self.move('U')
        elif m == 'D':
            self.apply_cycle_corner((4, 5, 6, 7), [0, 0, 0, 0])
            self.apply_cycle_edge((8, 9, 10, 11), [0, 0, 0, 0])
        elif m == "D'":
            for _ in range(3): self.move('D')
        elif m == 'D2':
            for _ in range(2): self.move('D')
        elif m == 'R':
            self.apply_cycle_corner((2, 1, 6, 5), [1, 2, 1, 2])
            self.apply_cycle_edge((1, 6, 9, 5), [0, 0, 0, 0])
        elif m == "R'":
            for _ in range(3): self.move('R')
        elif m == 'R2':
            for _ in range(2): self.move('R')
        elif m == 'L':
            self.apply_cycle_corner((0, 3, 4, 7), [2, 1, 2, 1])
            self.apply_cycle_edge((3, 4, 11, 7), [0, 0, 0, 0])
        elif m == "L'":
            for _ in range(3): self.move('L')
        elif m == 'L2':
            for _ in range(2): self.move('L')
        elif m == 'F':
            self.apply_cycle_corner((3, 2, 5, 4), [1, 2, 1, 2])
            self.apply_cycle_edge((2, 5, 8, 4), [1, 1, 1, 1])
        elif m == "F'":
            for _ in range(3): self.move('F')
        elif m == 'F2':
            for _ in range(2): self.move('F')
        elif m == 'B':
            self.apply_cycle_corner((1, 0, 7, 6), [1, 2, 1, 2])
            self.apply_cycle_edge((0, 7, 10, 6), [1, 1, 1, 1])
        elif m == "B'":
            for _ in range(3): self.move('B')
        elif m == 'B2':
            for _ in range(2): self.move('B')
        else:
            raise ValueError(f'Unknown move {m}')

    def apply_moves(self, move_str):
        for m in move_str.split():
            self.move(m)

    def is_solved(self):
        return (self.cp == list(range(8)) and self.co == [0]*8 and
                self.ep == list(range(12)) and self.eo == [0]*12)

    def permutation_sign(self, perm):
        n = len(perm)
        visited = [False] * n
        sign = 1
        for i in range(n):
            if not visited[i]:
                cycle_len = 0
                curr = i
                while not visited[curr]:
                    visited[curr] = True
                    curr = perm[curr]
                    cycle_len += 1
                if cycle_len % 2 == 0:
                    sign = -sign
        return sign

# Run Empirical Tests
# 1. Test Move Inverses & Order 4
for base in ['U', 'D', 'R', 'L', 'F', 'B']:
    c = Cube()
    for _ in range(4):
        c.move(base)
    assert c.is_solved(), f"{base}^4 failed to solve"
    
    c = Cube()
    c.move(base)
    c.move(f"{base}'")
    assert c.is_solved(), f"{base} {base}' failed"
    
    c = Cube()
    c.move(f'{base}2')
    c.move(f'{base}2')
    assert c.is_solved(), f"{base}2 {base}2 failed"

print("PASS: All 18 base move orders and inverses verified.")

# 2. Test Commutators and Standard Algorithms
# Sexy Move x 6
c = Cube()
for _ in range(6):
    c.apply_moves("R U R' U'")
assert c.is_solved(), "Sexy move x 6 failed"
print("PASS: Sexy Move (R U R' U')^6 is identity.")

# Sune x 6
c = Cube()
for _ in range(6):
    c.apply_moves("R U R' U R U2 R'")
assert c.is_solved(), "Sune x 6 failed"
print("PASS: Sune (R U R' U R U2 R')^6 is identity.")

# T-Permutation: R U R' U' R' F R2 U' R' U' R U R' F'
c = Cube()
c.apply_moves("R U R' U' R' F R2 U' R' U' R U R' F'")
expected_cp = [0, 2, 1, 3, 4, 5, 6, 7]
expected_ep = [0, 3, 2, 1, 4, 5, 6, 7, 8, 9, 10, 11]
assert c.cp == expected_cp, f"T-perm corner mismatch: {c.cp}"
assert c.co == [0]*8, f"T-perm corner orientation changed: {c.co}"
assert c.ep == expected_ep, f"T-perm edge mismatch: {c.ep}"
assert c.eo == [0]*12, f"T-perm edge orientation changed: {c.eo}"
print("PASS: T-Permutation correctly swaps (UBR, UFR) and (UR, UL) with orientation preservation.")

# 3. Test Invariants on 1,000 Random Scrambles
moves_list = ['U', "U'", 'U2', 'D', "D'", 'D2', 'R', "R'", 'R2', 'L', "L'", 'L2', 'F', "F'", 'F2', 'B', "B'", 'B2']
random.seed(42)
for i in range(1000):
    scramble = ' '.join(random.choice(moves_list) for _ in range(25))
    c = Cube()
    c.apply_moves(scramble)
    
    assert sum(c.co) % 3 == 0, f"Corner orientation invariant violated: {sum(c.co)}"
    assert sum(c.eo) % 2 == 0, f"Edge orientation invariant violated: {sum(c.eo)}"
    
    sgn_cp = c.permutation_sign(c.cp)
    sgn_ep = c.permutation_sign(c.ep)
    assert sgn_cp == sgn_ep, f"Permutation parity invariant violated: sgn(cp)={sgn_cp}, sgn(ep)={sgn_ep}"

print("PASS: 1,000 random scrambles verified for all group-theoretical invariants.")
