# Verification of Blueprint Permutation Matrices and Algorithms
class Cube:
    def __init__(self):
        self.cp = list(range(8))
        self.co = [0] * 8
        self.ep = list(range(12))
        self.eo = [0] * 12

    def apply_cycle_c(self, cycle, delta_co):
        # cycle: (c0 -> c1 -> c2 -> c3) means position c1 gets piece from c0, etc.
        new_cp = list(self.cp)
        new_co = list(self.co)
        n = len(cycle)
        for i in range(n):
            src = cycle[i]
            dst = cycle[(i + 1) % n]
            new_cp[dst] = self.cp[src]
            new_co[dst] = (self.co[src] + delta_co[i]) % 3
        self.cp = new_cp
        self.co = new_co

    def apply_cycle_e(self, cycle, delta_eo):
        new_ep = list(self.ep)
        new_eo = list(self.eo)
        n = len(cycle)
        for i in range(n):
            src = cycle[i]
            dst = cycle[(i + 1) % n]
            new_ep[dst] = self.ep[src]
            new_eo[dst] = (self.eo[src] + delta_eo[i]) % 2
        self.ep = new_ep
        self.eo = new_eo

    def U(self):
        self.apply_cycle_c([0, 1, 2, 3], [0, 0, 0, 0])
        self.apply_cycle_e([0, 1, 2, 3], [0, 0, 0, 0])

    def D(self):
        self.apply_cycle_c([4, 5, 6, 7], [0, 0, 0, 0])
        self.apply_cycle_e([8, 9, 10, 11], [0, 0, 0, 0])

    def R(self):
        # 1(UBR) -> 6(DBR) -> 5(DFR) -> 2(UFR)
        self.apply_cycle_c([1, 6, 5, 2], [1, 2, 1, 2])
        self.apply_cycle_e([1, 6, 9, 5], [0, 0, 0, 0])

    def L(self):
        # 0(UBL) -> 3(UFL) -> 4(DFL) -> 7(DBL)
        self.apply_cycle_c([0, 3, 4, 7], [2, 1, 2, 1])
        self.apply_cycle_e([3, 4, 11, 7], [0, 0, 0, 0])

    def F(self):
        # 2(UFR) -> 5(DFR) -> 4(DFL) -> 3(UFL)
        self.apply_cycle_c([2, 5, 4, 3], [1, 2, 1, 2])
        self.apply_cycle_e([2, 5, 8, 4], [1, 1, 1, 1])

    def B(self):
        # 0(UBL) -> 7(DBL) -> 6(DBR) -> 1(UBR)
        self.apply_cycle_c([0, 7, 6, 1], [1, 2, 1, 2])
        self.apply_cycle_e([0, 7, 10, 6], [1, 1, 1, 1])

    def move(self, m):
        face = m[0]
        amt = 1
        if len(m) > 1:
            if m[1] == "'": amt = 3
            elif m[1] == '2': amt = 2
        fn = getattr(self, face)
        for _ in range(amt):
            fn()

    def is_solved(self):
        return (self.cp == list(range(8)) and
                self.co == [0] * 8 and
                self.ep == list(range(12)) and
                self.eo == [0] * 12)

# Test 1: (R U R' U')^6
c1 = Cube()
for _ in range(6):
    for m in ["R", "U", "R'", "U'"]:
        c1.move(m)
print("Test 1 (Sexy Move x6):", c1.is_solved(), "cp:", c1.cp, "co:", c1.co, "ep:", c1.ep, "eo:", c1.eo)

# Test 2: Sune^6
c2 = Cube()
for _ in range(6):
    for m in ["R", "U", "R'", "U", "R", "U2", "R'"]:
        c2.move(m)
print("Test 2 (Sune x6):", c2.is_solved(), "cp:", c2.cp, "co:", c2.co)

# Test 3: T-Permutation
c3 = Cube()
# T-perm: R U R' U' R' F R2 U' R' U' R U R' F'
for m in ["R", "U", "R'", "U'", "R'", "F", "R2", "U'", "R'", "U'", "R", "U", "R'", "F'"]:
    c3.move(m)
print("Test 3 (T-Perm cp):", c3.cp, "co:", c3.co)
print("Test 3 (T-Perm ep):", c3.ep, "eo:", c3.eo)
# T-perm swaps corners UFR(2) and UBR(1), edges UR(1) and UL(3)
# Expected cp: [0, 2, 1, 3, 4, 5, 6, 7], co: all 0
# Expected ep: [0, 3, 2, 1, 4, 5, 6, 7, 8, 9, 10, 11], eo: all 0

# Test 4: Slice moves
# M = L' R x'
# E = D' U y'
# S = F' B z
