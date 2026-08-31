import random

class CorrectCube:
    def __init__(self):
        # 0:UBL, 1:UBR, 2:UFR, 3:UFL, 4:DFL, 5:DFR, 6:DBR, 7:DBL
        self.cp = list(range(8))
        self.co = [0] * 8
        # 0:UB, 1:UR, 2:UF, 3:UL, 4:FL, 5:FR, 6:BR, 7:BL, 8:DF, 9:DR, 10:DB, 11:DL
        self.ep = list(range(12))
        self.eo = [0] * 12

    def apply_cycle_corner(self, cycle, delta_co):
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
            self.apply_cycle_corner((0, 3, 4, 7), [1, 2, 1, 2]) # Updated!
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

    def apply_moves(self, s):
        for m in s.split():
            self.move(m)

    def is_solved(self):
        return (self.cp == list(range(8)) and self.co == [0]*8 and
                self.ep == list(range(12)) and self.eo == [0]*12)

# Test Superflip with CorrectCube
superflip = "U R2 F B R B2 R U2 L B2 R U' D' R2 F R' L B2 U2 F2"
c = CorrectCube()
c.apply_moves(superflip)

print("Superflip cp:", c.cp)
print("Superflip co:", c.co)
print("Superflip ep:", c.ep)
print("Superflip eo:", c.eo)

assert c.cp == list(range(8)), "Superflip modified cp!"
assert c.co == [0]*8, f"Superflip modified co: {c.co}"
assert c.ep == list(range(12)), "Superflip modified ep!"
assert c.eo == [1]*12, "Superflip did not flip all 12 edges!"

print("SUCCESS: Superflip perfectly produces 12 flipped edges with cp=I, co=0, ep=I!")
