import sys
sys.path.insert(0, r"c:\Users\rmelamed\Projects\blind-cube\.agents\challenger_2")
from verify_math_engine import Cube

superflip = "U R2 F B R B2 R U2 L B2 R U' D' R2 F R' L B2 U2 F2"
c = Cube()
c.apply_moves(superflip)

print("cp:", c.cp)
print("co:", c.co)
print("ep:", c.ep)
print("eo:", c.eo)

assert c.cp == list(range(8)), "Superflip modified cp!"
assert c.co == [0]*8, "Superflip modified co!"
assert c.ep == list(range(12)), "Superflip modified ep!"
assert c.eo == [1]*12, "Superflip did not flip all 12 edges!"
print("PASS: Superflip correctly flips all 12 edges with zero permutation and zero corner orientation changes!")
