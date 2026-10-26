"""Independent cube-vertex enumeration for Applied 1 Q19 variants."""
import itertools
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / 'bank/data/applied1-expanded.json').read_text())
ITEMS = [item for item in DATA['items'] if item['sourceNo'] == 19]
assert len(ITEMS) == 9

# Derived from the printed net: A faces E, B faces D, and C faces F.
# These normals specify the cube after folding, independently of the
# author's rotation and SVG projection implementation.
NORMAL = {
    'A': (-1, 0, 0), 'E': (1, 0, 0),
    'B': (0, 0, -1), 'D': (0, 0, 1),
    'C': (0, -1, 0), 'F': (0, 1, 0),
}


def cross(a, b):
    return (a[1] * b[2] - a[2] * b[1],
            a[2] * b[0] - a[0] * b[2],
            a[0] * b[1] - a[1] * b[0])


def dot(a, b):
    return sum(x * y for x, y in zip(a, b))


def possible(markings):
    triples = set()
    for top, left, right in itertools.permutations(NORMAL, 3):
        # The pictured top/left/right order has one handedness. Reject
        # reflected views even when all three face pairs are adjacent.
        if dot(cross(NORMAL[top], NORMAL[left]), NORMAL[right]) == -1:
            triples.add((markings[top], markings[left], markings[right]))
    assert len([triple for triple in itertools.permutations(NORMAL, 3)
                if dot(cross(NORMAL[triple[0]], NORMAL[triple[1]]),
                       NORMAL[triple[2]]) == -1]) == 24
    return triples


assignments = set()
answers = set()
for item in ITEMS:
    assert item['reviewStatus'] == 'verified'
    assert item['pointBand'] == '3.4' and item['difficultyEvidence']['label'] == '중'
    params = item['verification']['parameters']
    assignment = tuple(params['symbols'][face] for face in 'ABCDEF')
    assert assignment not in assignments
    assignments.add(assignment)
    valid = possible(params['symbols'])
    assert params['possibleMarkTriples'] == len(valid)
    calculated = []
    for number, marks in enumerate(params['optionMarks'], 1):
        triple = (marks['top'], marks['left'], marks['right'])
        if triple in valid:
            calculated.append(number)
    assert calculated == params['answer'] == item['answerParts'], item['id']
    assert len(calculated) == 2
    assert item['answer'] == ', '.join(map(str, calculated))
    assert (ROOT / 'bank' / item['asset']['src']).is_file()
    answers.add(tuple(calculated))

assert len(assignments) == 9 and len(answers) >= 6
print('PASS Applied1 Q19: nine distinct nets, 24 cube views each, five choices, exactly two valid per variant')
