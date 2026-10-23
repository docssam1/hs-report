"""Independent answers for the levelled path: simulation, digit-DP, real calendars."""
import collections
import datetime
import functools
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FILE = ROOT / 'bank/data/applied1-balanced15.json'
data = json.loads(FILE.read_text())
legacy_bytes = (ROOT / 'bank/data/applied1-expanded.json').read_bytes()
legacy = {x['id']: x for x in json.loads(legacy_bytes)['items']}
assert hashlib.sha256(legacy_bytes).hexdigest() == data['legacyBankSha256']
assert data['policy']['perLevel'] == dict(low=5, middle=5, high=5)
assert data['policy']['sourceGradeMutation'] is False

names = ['왼손 소지', '왼손 약지', '왼손 중지', '왼손 검지', '왼손 엄지',
         '오른손 엄지', '오른손 검지', '오른손 중지', '오른손 약지', '오른손 소지']
week = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일']


def walk(limit):
    result = [None]
    position, step = 0, 1
    for _ in range(limit):
        result.append(position)
        if position == 9:
            step = -1
        elif position == 0:
            step = 1
        position += step
    return result


def tally_to(n, excluded):
    if n < 1:
        return [0] * 10
    digits = tuple(map(int, str(n)))
    mod = excluded or 1

    @functools.lru_cache(None)
    def dp(pos, tight, started, remainder):
        if pos == len(digits):
            valid = started and (not excluded or remainder != 0)
            return int(valid), (0,) * 10
        number_count = 0
        total = [0] * 10
        for digit in range((digits[pos] if tight else 9) + 1):
            active = started or digit != 0
            count, child = dp(pos + 1, tight and digit == digits[pos], active,
                              (remainder * 10 + digit) % mod)
            number_count += count
            for k in range(10):
                total[k] += child[k]
            if active:
                total[digit] += count
        return number_count, tuple(total)
    return list(dp(0, True, False, 0)[1])


def answer(item):
    no, level, p = item['sourceNo'], item['practiceLevel'], item['verification']['parameters']
    if no == 1:
        if level == 'low':
            return [names[walk(p['N'])[p['N']]]]
        if level == 'middle':
            positions = walk(p['lower'] + 100)
            return [n for n in range(p['lower'] + 1, len(positions)) if positions[n] == p['fingerIndex']][:3]
        positions = walk(p['hi'])
        return [sum(positions[n] == p['fingerIndex'] for n in range(p['lo'], p['hi'] + 1) if n % p['divisor'] == 0)]
    if no == 2:
        a, b = tally_to(p['hi'], p.get('excludedDivisor')), tally_to(p['lo'] - 1, p.get('excludedDivisor'))
        totals = [x - y for x, y in zip(a, b)]
        assert totals.count(max(totals)) == 1
        return [totals.index(max(totals)), max(totals)]
    outcomes = set()
    states = set()
    for year in range(1900, 2400):
        january = sum(d for d in range(1, 32) if datetime.date(year, 1, d).weekday() == p['weekday'])
        leap = (datetime.date(year, 3, 1) - datetime.date(year, 2, 1)).days == 29
        if level == 'high':
            february = sum(d for d in range(1, 30 if leap else 29) if datetime.date(year, 2, d).weekday() == p['weekday'])
            match = january + february == p['combinedSum']
        else:
            match = january == p['sum'] and (level == 'low' or leap == p['leap'])
        if match:
            target = datetime.date(year, 2, p['febDay']) if level == 'low' else datetime.date(year, 3, p['marchDay'])
            outcomes.add(week[target.weekday()])
            states.add((datetime.date(year, 1, 1).weekday(), leap))
    assert len(outcomes) == 1, (item['id'], outcomes)
    if level == 'high':
        assert len(states) == 1, 'high aggregate must determine weekday and leap status jointly'
    return [outcomes.pop()]


# Source answers checked against the actual three PDF pages in this run.
assert names[walk(10000)[10000]] == '오른손 소지'
original_tally = [sum(str(n).count(str(d)) for n in range(465, 777)) for d in range(10)]
assert original_tally.index(max(original_tally)) == 6 and max(original_tally) == 167
assert {datetime.date(y, 2, 18).weekday() for y in range(1900, 2400)
        if sum(d for d in range(1, 32) if datetime.date(y, 1, d).weekday() == 1) == 62} == {3}

evidence = []
for item in data['items']:
    actual = answer(item)
    assert actual == item['answerParts'], (item['id'], actual, item['answerParts'])
    assert len(item['solutionSteps']) >= 3 and item['learningLocation'] and item['learningPoint']
    assert item['sourcePointBand'] == '2.7'
    assert item['pointBand'] == dict(low='2.7', middle='3.4', high='4.2')[item['practiceLevel']]
    if item['practiceLevel'] == 'low':
        old = legacy[item['id']]
        assert all(item[k] == v for k, v in old.items()), item['id']
    else:
        assert len(item['levelReview']['axes']) == 9
        assert item['difficultyEvidence']['measuredVariantRate'] is None
        assert item['practiceRole'] == '단계형 확장'
    if item.get('asset'):
        assert item['asset'] == next(x for x in legacy.values() if x['sourceNo'] == item['sourceNo'])['asset']
        assert (ROOT / 'bank' / item['asset']['src']).is_file()
    evidence.append({'id': item['id'], 'passed': True, 'answer': actual})
for no in data['availableSourceNos']:
    assert collections.Counter(x['practiceLevel'] for x in data['items'] if x['sourceNo'] == no) == dict(low=5, middle=5, high=5)
assert len(data['items']) == 45 and len({x['id'] for x in data['items']}) == 45
assert len({x['text'] for x in data['items']}) == 45
out = ROOT / '.private-work/balanced15-20261024/independent-math.json'
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps({'dataSha256': hashlib.sha256(FILE.read_bytes()).hexdigest(),
                           'count': len(evidence), 'sourceAnswersDirectlyCompared': [1, 2, 3],
                           'methods': ['step-by-step finger movement', 'digit DP with remainder state', 'actual Gregorian years 1900..2399'],
                           'items': evidence}, ensure_ascii=False, indent=2) + '\n')
print('PASS 45 answers: 15 preserved +30 new, three complete 5/5/5 groups; independent simulation/digit-DP/calendar, unique answers; source points and bank unchanged')
