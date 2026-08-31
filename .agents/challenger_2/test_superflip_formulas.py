from verify_math_engine import Cube

# Let us define M' and rotations x, y, z in our Cube class
# What does M' do?
# M' moves the M slice in the R direction:
# Edges: UB(0) -> DB(10) -> DF(8) -> UF(2) -> UB(0) (wait, looking from R: top is U, back is B, bottom is D, front is F)
# Turning CW around R: Top (UB/UF) moves to Back (UB/DB), Back moves to Bottom (DB/DF), Bottom moves to Front, Front moves to Top.
# So on M slice: UF(2) -> UB(0) -> DB(10) -> DF(8) -> UF(2)
# Orientation of M slice edges: under M' (which is like an R turn), do their EO change?
# Note: In standard EO, F/B moves flip EO, R/L/U/D do not.
# Since M is in the R/L plane, an M turn does NOT flip EO if using standard R/L axis, BUT wait:
# When UF moves to UB, its U sticker goes to B! On UB, B sticker is eo=1!
# So M' actually flips EO of all 4 slice edges!

# Let us test an explicit 20-move superflip:
# Let us search for or verify a known standard 20-move superflip:
# One known: R L U2 F U' D F2 R2 B2 L U2 F' B' U R2 D F2 U R2 U
# Let us test several known superflip formulas:
formulas = [
    ("Reid 1", "U R2 F B R B2 R U2 L B2 R U' D' R2 F R' L B2 U2 F2"),
    ("Reid 2", "R L U2 F U' D F2 R2 B2 L U2 F' B' U R2 D F2 U R2 U"),
    ("Kociemba 20", "R' U2 F R2 U' L' B' D' R' B L' U2 F2 R' U' B2 D' F2 D' R'"),
    ("Standard 20", "U2 F2 R2 U' L2 D B2 R2 B2 R' U2 F L' D R' B' U' L' F' R'"),
]

for name, alg in formulas:
    c = Cube()
    c.apply_moves(alg)
    print(f"--- {name} ---")
    print("cp:", c.cp)
    print("co:", c.co)
    print("ep:", c.ep)
    print("eo:", c.eo)
    print("is cp solved?", c.cp == list(range(8)))
    print("is co solved?", c.co == [0]*8)
    print("is ep solved?", c.ep == list(range(12)))
    print("all 12 edges flipped?", c.eo == [1]*12)
