import random
from test_correct_cube import CorrectCube
from cycle_tracer import CycleTracer

tracer = CycleTracer()
moves_list = ['U', "U'", 'U2', 'D', "D'", 'D2', 'R', "R'", 'R2', 'L', "L'", 'L2', 'F', "F'", 'F2', 'B', "B'", 'B2']

random.seed(1337)
print("Running 500 random scramble stress tests on CycleTracer...")

for i in range(500):
    scramble = ' '.join(random.choice(moves_list) for _ in range(30))
    c = CorrectCube()
    c.apply_moves(scramble)
    
    edge_res = tracer.trace_edges(c.ep, c.eo)
    corner_res = tracer.trace_corners(c.cp, c.co)
    
    # Invariant 1: Parity consistency
    edge_parity = (len(edge_res['targets']) % 2 != 0)
    corner_parity = (len(corner_res['targets']) % 2 != 0)
    assert edge_parity == corner_parity, f"Parity mismatch on scramble #{i}: edge_parity={edge_parity}, corner_parity={corner_parity}, edge_targets={edge_res['targets']}, corner_targets={corner_res['targets']}"
    assert edge_res['has_parity'] == edge_parity
    assert corner_res['has_parity'] == corner_parity
    
    # Invariant 2: Valid Speffz characters
    for t in edge_res['targets']:
        assert 'A' <= t <= 'X', f"Invalid edge target letter: {t}"
    for t in corner_res['targets']:
        assert 'A' <= t <= 'X', f"Invalid corner target letter: {t}"

print("PASS: 500 random scrambles successfully stress-tested! Parity invariant, termination, and Speffz letter validity 100% verified.")
