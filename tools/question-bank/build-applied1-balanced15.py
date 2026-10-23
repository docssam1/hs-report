"""Stage explicit levelled practice; retain the approved nine-item bank unchanged.

The user's fifteen-item request authorizes a separate foundation/extension path.
Middle/high tasks deliberately add inverse reasoning or joined constraints; they
are not represented as equivalent-difficulty replacements for the source.
"""
import calendar
import collections
import copy
import datetime
import hashlib
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'bank/data/applied1-expanded.json'
OUT = ROOT / 'bank/data/applied1-balanced15.json'
base_bytes = SOURCE.read_bytes()
base = json.loads(base_bytes)
items = []
week = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일']
fingers = ['왼손 소지', '왼손 약지', '왼손 중지', '왼손 검지', '왼손 엄지',
           '오른손 엄지', '오른손 검지', '오른손 중지', '오른손 약지', '오른손 소지']


def axes(no, level):
    extra = {
        (1, 'middle'): ('주기에서 수를 역으로 찾고 다음 세 값을 순서대로 구성', '왕복의 두 방향과 주어진 하한', '같은 손가락의 두 나머지를 번갈아 추적'),
        (1, 'high'): ('왕복 주기와 배수 조건의 공통 주기로 범위 안 개수를 셈', '양 끝 포함 범위·배수·손가락 세 조건', '왕복 두 방향의 공통주기 잔여를 따로 세어 합산'),
        (2, 'middle'): ('세 자리에서 네 자리로 넘어갈 때 자리별 숫자 사용량을 비교', '자릿수가 바뀌는 구간과 양 끝 포함', '실제로 쓰지 않는 맨 앞 0은 제외'),
        (2, 'high'): ('배수 제외 조건을 적용한 뒤 숫자별 출현 횟수를 비교', '구간·제외할 배수·자릿수별 실제 숫자', '남는 수와 빠지는 수의 자리별 횟수를 분리'),
        (3, 'middle'): ('요일 날짜의 합에서 첫 요일을 찾아 두 달 뒤 날짜로 이동', '1월 날짜 합·평년/윤년·3월 목표 날짜', '1월의 네 번/다섯 번과 실제 포함 윤일을 구분'),
        (3, 'high'): ('두 달의 날짜 합을 결합해 1월 첫 요일과 윤년 여부를 함께 역추론', '1·2월 합계 하나와 3월 목표 날짜', '첫 요일 7경우와 2월 28/29일을 모두 비교'),
    }[(no, level)]
    return dict(prerequisite='원문의 주기·자리별 세기·요일 계산을 바탕으로 한 확장; 상은 조건 결합을 추가',
                reasoning=extra[0], conditionTracking=extra[1], caseSplitting=extra[2],
                computation='계산량 자체보다 역추론 또는 조건 결합으로 단계를 구분',
                representation='원문 그림이 있는 1번은 원본 손 그림 그대로 사용; 나머지는 텍스트 원문',
                reading='필요 조건만 자연스러운 지문에 명시; 조건 요약·풀이 힌트 없음',
                visualCues='원문 그림에 숫자·선·경로·답 단서를 덧붙이지 않음',
                shortcuts='상한/하한과 두 방향 또는 달 길이를 실제 계산해 예외·중복·단일 답 확인')


for no in [1, 2, 3]:
    for original in [x for x in base['items'] if x['sourceNo'] == no][:5]:
        x = copy.deepcopy(original)
        x.update(practiceLevel='low', sourcePointBand=x['pointBand'],
                 preservedApprovedId=x['id'], practiceRole='원문 수준 연습',
                 levelReview={'basis': 'source-point-band', 'relation': 'source-benchmark',
                              'measured': False, 'preservedItem': True})
        items.append(x)


def add(no, level, params, text, answer_parts, steps, labels, focus, model):
    n = 1 + sum(x['sourceNo'] == no and x['practiceLevel'] == level for x in items)
    source = next(x for x in base['items'] if x['sourceNo'] == no)
    x = {k: copy.deepcopy(source[k]) for k in ['area', 'subarea', 'detailType', 'learningLocation']}
    if source.get('asset'):
        x['asset'] = copy.deepcopy(source['asset'])
    point = {'middle': '3.4', 'high': '4.2'}[level]
    label = {'middle': '중', 'high': '상'}[level]
    x.update(id=f'applied1-q{no:02d}-{level}-v{n}', genId=f'applied1-q{no:02d}',
             sourceSet='applied', sourceRound=1, sourceNo=no, variantNo=n,
             reviewStatus='pending-output-review', practiceLevel=level,
             sourcePointBand=source['pointBand'], pointBand=point,
             practiceRole='단계형 확장', text=text,
             answer=', '.join(map(str, answer_parts)), answerParts=answer_parts,
             answerLabels=labels, acceptedAnswers=[', '.join(map(str, answer_parts))],
             answerContract='ordered-parts', solutionSteps=steps, solution=' '.join(steps),
             learningPoint=focus,
             difficultyEvidence={'basis': 'designed-practice-point-band', 'label': label,
                                 'sourceReasoningPreserved': False, 'measuredVariantRate': None},
             levelReview={'basis': 'explicit-levelled-extension', 'relation': 'extension',
                          'measured': False, 'axes': axes(no, level)},
             verification={'primaryMethod': model, 'parameters': params,
                           'independentSuite': 'qa/applied1-balanced15-independent-validate.py',
                           'sourceExamPage': 1, 'sourceAnswerPage': no,
                           'studentDifficultyMeasured': False})
    assert len(steps) >= 3
    items.append(x)


intro = '왼손 소지를 1로 하여 약지, 중지, 검지, 엄지 순서로 세고, 오른손 엄지로 옮겨 그림처럼 양손을 왕복하며 수를 셉니다. '
for lower, index in [(157, 1), (284, 3), (419, 6), (563, 8), (728, 2)]:
    residues = sorted({index + 1, 19 - index})
    candidates = sorted(r + 18 * k for r in residues for k in range(lower // 18, lower // 18 + 5) if r + 18 * k > lower)[:3]
    add(1, 'middle', {'lower': lower, 'fingerIndex': index},
        intro + f'{lower}보다 큰 수 중 {fingers[index]}를 짚는 수를 작은 것부터 세 개 쓰시오.',
        candidates,
        ['양 끝 손가락은 방향을 바꾸며 한 번만 짚으므로 18개마다 같은 움직임이 반복됩니다.',
         f'{fingers[index]}는 한 주기에서 {residues[0]}번째와 {residues[1]}번째에 짚습니다. 따라서 이 두 수에 각각 18의 배수를 더한 수를 찾습니다.',
         f'{lower}보다 큰 수를 차례로 고르면 ' + ', '.join(map(str, candidates)) + '입니다. 두 방향의 수를 함께 비교했으므로 사이에 빠진 수가 없습니다.'],
        ['첫 번째 수', '두 번째 수', '세 번째 수'],
        '주기의 두 나머지를 역으로 사용해 하한 다음의 수를 순서대로 찾기', 'two residue classes above a strict lower bound')

for lo, hi, divisor, index in [(125, 1379, 5, 1), (207, 1586, 7, 3), (318, 1942, 11, 6), (426, 2173, 13, 8), (583, 2489, 17, 2)]:
    period = math.lcm(18, divisor)
    good = [n for n in range(1, period + 1) if n % divisor == 0 and ((n - 1) % 18 if (n - 1) % 18 < 10 else 18 - (n - 1) % 18) == index]
    parts = []
    detail = []
    for r in good:
        first = r + max(0, (lo - r + period - 1) // period) * period
        count = max(0, (hi - first) // period + 1)
        parts.append(count)
        detail.append(f'{first}부터 {period}씩 늘어나는 수는 {count}개')
    add(1, 'high', {'lo': lo, 'hi': hi, 'divisor': divisor, 'fingerIndex': index},
        intro + f'{lo}부터 {hi}까지의 자연수 중 {divisor}의 배수이면서 {fingers[index]}를 짚는 수는 모두 몇 개입니까?',
        [sum(parts)],
        ['양손을 왕복하는 움직임은 18개마다 반복됩니다. 같은 손가락도 갈 때와 돌아올 때를 모두 확인해야 합니다.',
         f'18과 {divisor}의 최소공배수는 {period}입니다. 1부터 {period}까지에서 두 조건에 맞는 수는 ' + ', '.join(map(str, good)) + f'이고, 여기에 {period}씩 더한 수가 계속 조건에 맞습니다.',
         f'{lo} 이상 {hi} 이하에서는 ' + ', '.join(detail) + '입니다.',
         '두 수열은 겹치지 않으므로 모두 ' + '＋'.join(map(str, parts)) + f'＝{sum(parts)}개입니다.'],
        ['개수'], '왕복 주기와 배수의 공통 반복을 찾아 양 끝을 포함한 개수 세기', 'lcm-period classes and bounded progression counts')


def digit_case(lo, hi, excluded):
    totals = [0] * 10
    for value in range(lo, hi + 1):
        if excluded and value % excluded == 0:
            continue
        for c in str(value):
            totals[int(c)] += 1
    assert totals.count(max(totals)) == 1, (lo, hi, excluded, totals)
    return totals.index(max(totals)), max(totals), totals


for lo, hi in [(948, 1237), (879, 1354), (976, 1643), (798, 1456), (987, 1785)]:
    digit, count, totals = digit_case(lo, hi, None)
    add(2, 'middle', {'lo': lo, 'hi': hi, 'excludedDivisor': None},
        f'{lo}부터 {hi}까지의 자연수를 차례로 모두 쓸 때 가장 많이 쓰는 숫자는 무엇이며, 모두 몇 번 쓰입니까?',
        [digit, count],
        [f'{lo}부터 999까지의 세 자리 수와 1000부터 {hi}까지의 네 자리 수로 나누어 셉니다. 세 자리 수 앞에는 0을 붙이지 않습니다.',
         '실제로 쓰이는 천·백·십·일의 자리를 각각 세어 합하면 0부터 9까지의 횟수는 ' + ', '.join(map(str, totals)) + '번입니다.',
         f'이 중 가장 큰 값은 {count}이고 한 숫자만 그 횟수로 쓰입니다. 따라서 숫자는 {digit}, 횟수는 {count}번입니다.'],
        ['숫자', '횟수'], '자릿수가 바뀌는 구간을 나누고 실제 쓰인 숫자만 세기', 'direct tally across a change of digit width')

for lo, hi, divisor in [(124, 674, 3), (231, 795, 4), (367, 925, 7), (458, 1123, 6), (612, 1379, 8)]:
    digit, count, totals = digit_case(lo, hi, divisor)
    all_counts = [sum(str(n).count(str(d)) for n in range(lo, hi + 1)) for d in range(10)]
    removed = [a - b for a, b in zip(all_counts, totals)]
    add(2, 'high', {'lo': lo, 'hi': hi, 'excludedDivisor': divisor},
        f'{lo}부터 {hi}까지의 자연수에서 {divisor}의 배수를 모두 뺀 나머지 수를 차례로 씁니다. 가장 많이 쓰는 숫자는 무엇이며, 모두 몇 번 쓰입니까?',
        [digit, count],
        ['먼저 구간의 자연수를 모두 썼을 때 자리마다 실제로 쓰인 숫자를 셉니다. 0부터 9까지의 횟수는 ' + ', '.join(map(str, all_counts)) + '번입니다.',
         f'그다음 구간 안의 {divisor}의 배수에 쓰인 숫자를 같은 방법으로 셉니다. 빼야 하는 횟수는 순서대로 ' + ', '.join(map(str, removed)) + '번입니다.',
         '두 횟수의 차는 순서대로 ' + ', '.join(map(str, totals)) + '번입니다. 배수 전체를 빼므로 한 수 안에 같은 숫자가 반복되면 그 횟수도 모두 뺍니다.',
         f'가장 큰 값은 {count}이고 그 숫자는 {digit}뿐입니다. 답은 {digit}, {count}번입니다.'],
        ['숫자', '횟수'], '제외되는 수의 숫자 사용량을 먼저 세어 전체에서 빼기', 'direct filtered digit tally')

for w, first, leap, day in [(1, 4, False, 7), (3, 5, True, 16), (5, 6, False, 21), (0, 7, True, 25), (4, 4, True, 29)]:
    total = 4 * first + 42
    jan1 = (w - first + 1) % 7
    ans = week[(jan1 + 31 + 28 + int(leap) + day - 1) % 7]
    distance = 31 - first + 28 + int(leap) + day
    add(3, 'middle', {'weekday': w, 'sum': total, 'leap': leap, 'marchDay': day},
        f'어느 {"윤년" if leap else "평년"}의 1월 달력에서 {week[w]}인 날짜를 모두 더하였더니 {total}였습니다. 그해 3월 {day}일은 무슨 요일입니까?',
        [ans],
        [f'1월에 {week[w]}이 다섯 번이면 날짜 합은 75, 80, 85 중 하나입니다. 주어진 합은 다르므로 네 번입니다.',
         f'첫 {week[w]}인 날짜는 ({total}−42)÷4＝{first}일입니다. 그해는 {"윤년" if leap else "평년"}이므로 2월은 {29 if leap else 28}일까지입니다.',
         f'1월 {first}일부터 3월 {day}일까지는 {31-first}＋{28+int(leap)}＋{day}＝{distance}일이 지납니다. 7로 나눈 나머지 {distance%7}만큼 {week[w]}에서 뒤로 가면 {ans}입니다.'],
        ['요일'], '1월의 첫 요일을 역으로 구하고 평년·윤년의 2월을 거쳐 이동하기', 'January weekday progression plus leap-aware March offset')

for w, combined, day in [(0, 104, 4), (2, 133, 12), (4, 104, 19), (1, 133, 23), (6, 133, 28)]:
    cases = []
    for first in range(1, 8):
        january = sum(range(first, 32, 7))
        feb_first = (first - 1 - 31) % 7 + 1
        feb28 = sum(range(feb_first, 29, 7))
        feb29 = sum(range(feb_first, 30, 7))
        cases.append((first, january + feb28, january + feb29))
    hits = [(first, leap) for first, a, b in cases for leap, value in [(False, a), (True, b)] if value == combined]
    assert len(hits) == 1
    first, leap = hits[0]
    jan1 = (w - first + 1) % 7
    ans = week[(jan1 + 31 + 28 + int(leap) + day - 1) % 7]
    add(3, 'high', {'weekday': w, 'combinedSum': combined, 'marchDay': day},
        f'어느 해 1월과 2월의 달력에서 {week[w]}인 날짜를 모두 더하였더니 {combined}였습니다. 그해 3월 {day}일은 무슨 요일입니까?',
        [ans],
        ['1월의 첫 해당 요일은 1일부터 7일 중 하나입니다. 첫 날짜를 정하면 1월의 날짜들과 2월 첫 해당 요일의 날짜가 정해집니다.',
         '첫 날짜가 1, 2, 3, 4, 5, 6, 7일일 때 두 달의 합은 평년에서는 ' + ', '.join(str(a) for first, a, b in cases) + ', 윤년에서는 ' + ', '.join(str(b) for first, a, b in cases) + '입니다.',
         f'합이 {combined}인 경우는 첫 날짜가 {first}일인 {"윤년" if leap else "평년"} 한 가지입니다. 따라서 1월 {first}일은 {week[w]}이고 2월은 {29 if leap else 28}일까지입니다.',
         f'그날부터 3월 {day}일까지 {31-first+28+int(leap)+day}일이 지나며 7로 나눈 나머지는 {(31-first+28+int(leap)+day)%7}입니다. 따라서 {ans}입니다.'],
        ['요일'], '두 달의 합계로 첫 요일과 평년·윤년을 동시에 판별하기', 'enumerate seven January offsets and both February lengths')

for no in [1, 2, 3]:
    for level in ['low', 'middle', 'high']:
        assert sum(x['sourceNo'] == no and x['practiceLevel'] == level for x in items) == 5
assert len(items) == len({x['id'] for x in items}) == 45
assert len({x['text'] for x in items}) == 45
result = dict(version='20261024-applied1-balanced15-r1', sourceSet='applied', sourceRound=1,
              policy={'targetVariantsPerSource': 15, 'perLevel': {'low': 5, 'middle': 5, 'high': 5},
                      'runtimeGeneration': False, 'sourceGradeMutation': False,
                      'difficulty': 'new practice point bands; original source points unchanged',
                      'studentDifficultyMeasured': False},
              availableSourceNos=[1, 2, 3], pendingSourceNos=list(range(4, 31)),
              legacyBankSha256=hashlib.sha256(base_bytes).hexdigest(), items=items,
              preservedLegacyCount=15, newAuthoredCount=30)
OUT.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
assert SOURCE.read_bytes() == base_bytes
print('Staged 45 levelled items: 15 preserved +30 new; each source 5 low/5 middle/5 high; source bank unchanged')
