# Test Superflip
from verify_math import Cube

c = Cube()
# Standard 20-move superflip: U R2 F B R B2 R U2 L B2 R U' D' R2 F R' L B2 U2 F2
superflip = "U R2 F B R B2 R U2 L B2 R U' D' R2 F R' L B2 U2 F2".split()
for m in superflip:
    c.move(m)

print("Superflip cp:", c.cp)
print("Superflip co:", c.co)
print("Superflip ep:", c.ep)
print("Superflip eo:", c.eo)
print("Is cp solved:", c.cp == list(range(8)))
print("Is co solved:", c.co == [0]*8)
print("Is ep solved:", c.ep == list(range(12)))
print("Is all eo flipped:", c.eo == [1]*12)
