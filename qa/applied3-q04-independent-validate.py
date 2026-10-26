"""Independent enumeration for Applied3 Q04 variants."""
import hashlib, json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / 'bank/data/applied3-expanded.json'
INDEX_PATH = ROOT / 'bank/data/applied3-expanded-index.json'
data = json.loads(DATA_PATH.read_text())
index = json.loads(INDEX_PATH.read_text())
assert data['version'] == '20261026-applied3-expansion-q04-q07-q12-q14-q18-q21-q06-locked-r11'
assert len(data['items']) == 207 and index['itemCount'] == 207
assert 4 in data['availableSourceNos'] and 4 not in data['pendingSourceNos']
variants = [x for x in data['items'] if x['sourceNo'] == 4]
assert len(variants) == 9
original_interval = [n for n in range(1200, 1300) if n % 18 == 0]
assert original_interval == [1206, 1224, 1242, 1260, 1278, 1296]
assert original_interval[0] == 1206
answers = []
for item in variants:
    p = item['verification']['parameters']
    h = p['hundredsDigit']
    lo, hi = 1000 + 100*h, 1099 + 100*h
    all_multiples = [n for n in range(lo, hi + 1) if n % 18 == 0]
    assert p['interval'] == [lo, hi]
    assert p['allMultiplesInInterval'] == all_multiples and all_multiples
    answer = all_multiples[0]
    assert answer == item['answerParts'][0] == int(item['answer'])
    assert answer // 100 % 10 == h and answer % 18 == 0
    assert (answer - 18 < lo) or (answer - 18) % 18 != 0
    assert item['pointBand'] == '2.7' and item['difficultyEvidence']['label'] == '하'
    assert item['reviewStatus'] == 'verified' and len(item['solutionSteps']) >= 3
    answers.append({'id': item['id'], 'hundredsDigit': h, 'multiples': all_multiples, 'answer': answer})
assert len(set(x['verification']['parameters']['hundredsDigit'] for x in variants)) == len(set(answers_i['answer'] for answers_i in answers)) == 9
assert set(x['verification']['parameters']['hundredsDigit'] for x in variants) == {0,1,3,4,5,6,7,8,9}
assert [x['answer'] for x in answers] == [1008,1116,1314,1404,1512,1602,1710,1800,1908]
assert [(x['sourceNo'], x['variantCount']) for x in index['items'] if x['sourceNo'] == 4] == [(4,9)]
result = {
    'pass': True, 'dataSha256': hashlib.sha256(DATA_PATH.read_bytes()).hexdigest(),
    'count': len(data['items']), 'types': len(index['items']),
    'originalQ04Multiples': original_interval,
    'q04Variants': answers, 'method': 'independent interval enumeration and divisibility check'
}
out = ROOT / '.private-work/hw-expansion-20261023/hw3/q04-review/q04-independent-audit-r9.json'
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
print(json.dumps(result, ensure_ascii=False, indent=2))
