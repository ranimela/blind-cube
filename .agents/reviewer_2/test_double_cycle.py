from verify_math import Cube
from test_bld_solver import trace_edges

# Double 2-cycle: (UR UL) and (FR FL)
# Permutation: swap 1 and 3, swap 4 and 5
c = Cube()
c.ep[1], c.ep[3] = c.ep[3], c.ep[1]
c.ep[4], c.ep[5] = c.ep[5], c.ep[4]

targets, flips = trace_edges(c)
print("Double 2-cycle targets:", targets)
print("Double 2-cycle target count:", len(targets), "Parity:", len(targets) % 2 != 0)
