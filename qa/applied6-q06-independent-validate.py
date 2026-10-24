#!/usr/bin/env python3
"""Independently validate variants of existing Applied 6 source question 6."""
import hashlib
import json
from collections import deque
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / '.private-work/hw-expansion-20261023/hw6'
data_path = ROOT / 'bank/data/applied6-expanded.json'
index_path = ROOT / 'bank/data/applied6-expanded-index.json'
data = json.loads(data_path.read_text())
index = json.loads(index_path.read_text())

# Face state order: top, bottom, front, back, right, left.
def roll_right(s): return (s[5], s[4], s[2], s[3], s[0], s[1])
def roll_left(s): return (s[4], s[5], s[2], s[3], s[1], s[0])
def roll_down(s): return (s[3], s[2], s[0], s[1], s[4], s[5])
def roll_up(s): return (s[2], s[3], s[1], s[0], s[4], s[5])
TRANSITIONS = {'R': roll_right, 'L': roll_left, 'D': roll_down, 'U': roll_up}
PATH = 'RRDDDDLL'

def path_bottoms(state):
    bottoms = [state[1]]
    for move in PATH:
        state = TRANSITIONS[move](state)
        bottoms.append(state[1])
    return bottoms

source = (1, 6, 2, 5, 3, 4)
source_bottoms = path_bottoms(source)
assert source_bottoms == [6, 3, 1, 2, 6, 5, 1, 3, 6]
assert sum(source_bottoms) == 33

# Check the original opposite-face constraint and that each displayed variant
# is a genuine physical rotation of the original die, not a mirror reflection.
reachable = {source}
queue = deque([source])
while queue:
    state = queue.popleft()
    for transition in TRANSITIONS.values():
        rotated = transition(state)
        if rotated not in reachable:
            reachable.add(rotated)
            queue.append(rotated)
assert len(reachable) == 24

assert data['version'] == '20261024-applied6-expansion-r27'
assert data['sourceRound'] == 6 and data['sourceSet'] == 'applied'
assert len(data['items']) == 252 and len(data['availableSourceNos']) == 28
assert data['pendingSourceNos'] == [27, 28]
assert len({x['id'] for x in data['items']}) == len(data['items'])
items = [x for x in data['items'] if x['sourceNo'] == 6]
assert len(items) == 9 and sorted(x['variantNo'] for x in items) == list(range(1, 10))
assert [x['answer'] for x in items] == ['25','26','27','28','29','30','31','32','34']
assert len({x['answer'] for x in items}) == 9

proof = []
for item in items:
    p = item['verification']['parameters']
    o = p['startOrientation']
    state = (o['top'], o['bottom'], o['front'], o['back'], o['right'], o['left'])
    assert state in reachable
    assert set(state) == set(range(1, 7))
    assert state[0] + state[1] == state[2] + state[3] == state[4] + state[5] == 7
    bottoms = path_bottoms(state)
    assert len(bottoms) == p['visitedCellCount'] == 9
    assert bottoms == p['bottomFaceSequence']
    assert sum(bottoms) == int(item['answer']) == p['answer']
    assert item['answerParts'] == [int(item['answer'])]
    assert item['acceptedAnswers'] == [item['answer']]
    assert item['verification']['sourceExamPage'] == item['verification']['sourceAnswerPage'] == 1
    assert item['asset']['src'] == f"assets/applied6/q06-v{item['variantNo']}.svg"
    assert (ROOT / 'bank' / item['asset']['src']).is_file()
    assert item['verification']['sourceDrawingPresent'] is True
    assert item['verification']['variantUsesSourceDrawing'] is False
    assert item['verification']['variantUsesNewSameTypeDrawing'] is True
    assert item['pointBand'] == '2.7' and item['difficultyEvidence']['label'] == '하'
    proof.append({'id': item['id'], 'orientation': list(state), 'bottomFaceSequence': bottoms,
                  'sum': sum(bottoms), 'reachableByPhysicalRotation': True, 'passed': True})

assert 6 not in data['pendingSourceNos']
assert index['version'] == data['version'] and index['itemCount'] == len(data['items'])
assert len([x for x in index['items'] if x['sourceNo'] == 6]) == 1
assert len(index['items']) == len(data['availableSourceNos'])

result = {
    'dataSha256': hashlib.sha256(data_path.read_bytes()).hexdigest(),
    'sourceQuestion': 6,
    'sourceVisibleOrientation': {'top': 1, 'front': 2, 'right': 3},
    'sourceTeacherAnswer': 33,
    'sourceBottomSequence': source_bottoms,
    'sourceBottomSum': sum(source_bottoms),
    'physicalDieOrientationsEnumerated': len(reachable),
    'variants': proof,
    'bankSourceTypes': len(data['availableSourceNos']),
    'bankQuestionCount': len(data['items']),
    'newTypeCount': 0,
    'passed': True,
}
(WORK / 'q06-independent-math.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
print('PASS Q6 source: answer 33 and nine bottom-face readings independently reproduced.')
print('PASS Q6 variants: 9 unique sums; 24 physical rotations enumerated; every orientation and path sum verified.')
print('PASS bank: 28 existing source types × 9 = 252; new source type count 0.')
