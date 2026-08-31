from test_correct_cube import CorrectCube
from cycle_tracer import CycleTracer, CORNER_STICKERS, EDGE_STICKERS

tracer = CycleTracer()

print("==================================================")
print("TEST 1: Solved Cube")
print("==================================================")
c = CorrectCube()
edge_res = tracer.trace_edges(c.ep, c.eo)
corner_res = tracer.trace_corners(c.cp, c.co)

assert edge_res['targets'] == [], "Solved cube produced edge targets!"
assert corner_res['targets'] == [], "Solved cube produced corner targets!"
assert edge_res['in_place_flips'] == [], "Solved cube produced edge flips!"
assert corner_res['in_place_twists'] == [], "Solved cube produced corner twists!"
assert not edge_res['has_parity'], "Solved cube flagged parity!"
assert not corner_res['has_parity'], "Solved cube flagged parity!"
print("PASS: Solved cube yields exactly 0 targets, 0 flips, 0 twists, 0 parity.\n")

print("==================================================")
print("TEST 2: Pure 3-Cycle Involving Buffer")
print("==================================================")
c = CorrectCube()
c.cp = [1, 2, 0, 3, 4, 5, 6, 7]
c.co = [0]*8
corner_res = tracer.trace_corners(c.cp, c.co)
assert corner_res['targets'] == ['A', 'B'], f"Expected ['A', 'B'], got {corner_res['targets']}"
assert corner_res['cycle_breaks'] == 0, f"Expected 0 breaks, got {corner_res['cycle_breaks']}"

c = CorrectCube()
c.ep = [1, 2, 0, 3, 4, 5, 6, 7, 8, 9, 10, 11]
c.eo = [0]*12
edge_res = tracer.trace_edges(c.ep, c.eo)
assert edge_res['targets'] == ['A', 'B'], f"Expected ['A', 'B'], got {edge_res['targets']}"
assert edge_res['cycle_breaks'] == 0, f"Expected 0 breaks, got {edge_res['cycle_breaks']}"
print("PASS: Pure 3-cycle involving buffer yields exactly 2 targets, 0 cycle breaks.\n")

print("==================================================")
print("TEST 3: Pure 3-Cycle NOT Involving Buffer (Cycle Break)")
print("==================================================")
c = CorrectCube()
c.cp = [1, 3, 2, 0, 4, 5, 6, 7]
c.co = [0]*8
corner_res = tracer.trace_corners(c.cp, c.co)
assert corner_res['targets'] == ['A', 'B', 'D', 'A'], f"Expected ['A', 'B', 'D', 'A'], got {corner_res['targets']}"
assert corner_res['cycle_breaks'] == 1, f"Expected 1 break, got {corner_res['cycle_breaks']}"

c = CorrectCube()
c.ep = [1, 3, 2, 0, 4, 5, 6, 7, 8, 9, 10, 11]
c.eo = [0]*12
edge_res = tracer.trace_edges(c.ep, c.eo)
assert edge_res['targets'] == ['A', 'B', 'D', 'A'], f"Expected ['A', 'B', 'D', 'A'], got {edge_res['targets']}"
assert edge_res['cycle_breaks'] == 1, f"Expected 1 break, got {edge_res['cycle_breaks']}"
print("PASS: Pure 3-cycle NOT involving buffer triggers cycle break, tracing break -> cycle -> return to break.\n")

print("==================================================")
print("TEST 4: In-Place Flipped Edges & Twisted Corners")
print("==================================================")
c = CorrectCube()
c.eo[0] = 1 # UB flipped
c.eo[2] = 1 # UF (buffer) flipped
edge_res = tracer.trace_edges(c.ep, c.eo)
print("Edge in-place flips:", edge_res['in_place_flips'])
print("Edge targets:", edge_res['targets'])
flip_pieces = [f['piece'] for f in edge_res['in_place_flips']]
assert 'UB' in flip_pieces, "UB flip not detected"
assert 'UF' in flip_pieces, "UF buffer flip not detected"
assert edge_res['targets'] == [], "In-place flips should not generate permutation targets"

c = CorrectCube()
c.co[0] = 1 # UBL CW
c.co[2] = 2 # UFR CCW
corner_res = tracer.trace_corners(c.cp, c.co)
print("Corner in-place twists:", corner_res['in_place_twists'])
print("Corner targets:", corner_res['targets'])
twist_pieces = [t['piece'] for t in corner_res['in_place_twists']]
assert 'UBL' in twist_pieces, "UBL twist not detected"
assert 'UFR' in twist_pieces, "UFR twist not detected"
assert corner_res['targets'] == [], "In-place twists should not generate permutation targets"
print("PASS: In-place flips and twists detected correctly without spurious permutation targets.\n")

print("==================================================")
print("TEST 5: Parity Scramble (Odd Permutation)")
print("==================================================")
c = CorrectCube()
c.apply_moves("R U R' U' R' F R2 U' R' U' R U R' F'")
edge_res = tracer.trace_edges(c.ep, c.eo)
corner_res = tracer.trace_corners(c.cp, c.co)

print("T-perm Edge targets:", edge_res['targets'])
print("T-perm Corner targets:", corner_res['targets'])
print("T-perm Parity - Edges:", edge_res['has_parity'], "Corners:", corner_res['has_parity'])

assert edge_res['has_parity'] == True, "Edge parity was not flagged!"
assert corner_res['has_parity'] == True, "Corner parity was not flagged!"
assert len(edge_res['targets']) % 2 == 1, "Edge target length should be odd under parity!"
assert len(corner_res['targets']) % 2 == 1, "Corner target length should be odd under parity!"
print("PASS: Parity scramble asserts hasParity: true and odd target counts for both edges and corners.\n")
