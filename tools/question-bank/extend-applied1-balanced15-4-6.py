"""Add sources4-6 to the reviewed levelled path; preserve the previous 45 items."""
import copy
import hashlib
import json
from fractions import Fraction
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
FILE = ROOT / 'bank/data/applied1-balanced15.json'
data = json.loads(FILE.read_text())
assert data['availableSourceNos'] == [1, 2, 3], 'This is a one-time additive extension, not a rebuild.'
base_bytes = (ROOT / 'bank/data/applied1-expanded.json').read_bytes()
base = json.loads(base_bytes)
assert hashlib.sha256(base_bytes).hexdigest() == data['legacyBankSha256']
old_items = copy.deepcopy(data['items'])
items = data['items']
old_version = data['version']
version = '20261024-applied1-balanced15-r2'
for item in items:
    item.setdefault('practiceStorageVersion', old_version)


def axes(no, level):
    extra = {
        (4, 'middle'): ('겹침에서 직각으로 목표를 바꾸어 두 방향의 각도 중 첫 시각을 비교', '정각 직후·첫 직각·정수 분 구간', '직각90°와270° 두 방향 및 정각 자체 제외'),
        (4, 'high'): ('일정 구간 안의 모든 직각 시각을 나열하여 개수를 셈', '오전 시간 구간과 양 끝 포함', '시작·끝이 직각인 경계를 따로 확인'),
        (5, 'middle'): ('몫과 끝자리 후보에 배수 조건을 결합', '몫·끝자리·배수', '가능한 모든 후보를 추리고 남은 전체 답을 확인'),
        (5, 'high'): ('나누는 수까지 미지수로 두고 나머지 관계를 이용해 역산', '나누는 수 범위·몫·나머지 차·끝자리·세 자리 수', '가능한 나누는 수와 세 자리 범위를 모두 확인'),
        (6, 'middle'): ('다음 층에 필요한 성냥개비와 남은 수로 현재 층수를 역산', '남은 수와 다음 층까지 모자란 수', '현재 층을 완성하고 다음 층은 아직 만들 수 없는지 확인'),
        (6, 'high'): ('두 번의 최대 층수 차와 각각의 남은 수에서 최초 상자 수를 역산', '추가한 수·늘어난 층수·전후 남은 수', '각 단계가 최대 층수인지 독립적으로 확인'),
    }[(no, level)]
    return dict(prerequisite='원문의 각도 차·나머지 범위·공유변 세기를 바탕으로 확장',
                reasoning=extra[0], conditionTracking=extra[1], caseSplitting=extra[2],
                computation='역추론과 조건 결합을 추가하며 숫자 크기만으로 난도를 정하지 않음',
                representation='6번은 원본 성냥개비 계단 그림을 그대로 보존;4·5번 새 문항은 텍스트 필수 조건만 사용',
                reading='필요한 경계와 나머지 관계를 지문에 명시; 요약·예제·힌트 없음',
                visualCues='원본 그림에 층 번호·개수·보조선·답 단서를 추가하지 않음',
                shortcuts='정각·세 자리 범위·정수해·최대 층수 경계를 독립 검사')


for no in [4, 5, 6]:
    for old in [x for x in base['items'] if x['sourceNo'] == no][:5]:
        item = copy.deepcopy(old)
        item.update(practiceLevel='low', sourcePointBand=old['pointBand'], preservedApprovedId=old['id'],
                    practiceRole='원문 수준 연습', practiceStorageVersion=version,
                    levelReview={'basis': 'source-point-band', 'relation': 'source-benchmark',
                                 'measured': False, 'preservedItem': True})
        items.append(item)


def fraction(value):
    return f'<math xmlns="http://www.w3.org/1998/Math/MathML"><mfrac><mn>{value.numerator}</mn><mn>{value.denominator}</mn></mfrac></math>'


def add(no, level, params, text, answers, steps, labels, focus, model, contract='ordered-parts'):
    n = 1 + sum(x['sourceNo'] == no and x['practiceLevel'] == level for x in items)
    source = next(x for x in base['items'] if x['sourceNo'] == no)
    item = {k: copy.deepcopy(source[k]) for k in ['area', 'subarea', 'detailType', 'learningLocation']}
    if no == 6:
        item['asset'] = copy.deepcopy(source['asset'])
    item.update(id=f'applied1-q{no:02d}-{level}-v{n}', genId=f'applied1-q{no:02d}',
                sourceSet='applied', sourceRound=1, sourceNo=no, variantNo=n,
                reviewStatus='pending-output-review', practiceLevel=level, sourcePointBand=source['pointBand'],
                pointBand={'middle': '3.4', 'high': '4.2'}[level], practiceRole='단계형 확장',
                practiceStorageVersion=version, text=text, answer=', '.join(map(str, answers)),
                answerParts=answers, answerLabels=labels, acceptedAnswers=[', '.join(map(str, answers))],
                answerContract=contract, solutionSteps=steps, solution=' '.join(steps), learningPoint=focus,
                difficultyEvidence={'basis': 'designed-practice-point-band', 'label': {'middle': '중', 'high': '상'}[level],
                                    'sourceReasoningPreserved': False, 'measuredVariantRate': None},
                levelReview={'basis': 'explicit-levelled-extension', 'relation': 'extension', 'measured': False,
                             'axes': axes(no, level)},
                verification={'primaryMethod': model, 'parameters': params,
                              'independentSuite': 'qa/applied1-balanced15-independent-validate.py',
                              'sourceExamPage': 1, 'sourceAnswerPage': no, 'studentDifficultyMeasured': False})
    assert len(steps) >= 3
    items.append(item)


for hour in [2, 4, 5, 7, 9]:
    # Unwrapped hour-minus-minute angle; exclude the starting instant itself.
    candidates = sorted({Fraction(30 * hour - a - 360 * k, 1) / Fraction(11, 2)
                         for a in [90, 270] for k in range(-2, 3)
                         if 0 < Fraction(30 * hour - a - 360 * k, 1) / Fraction(11, 2) < 60})
    first = candidates[0]
    minute = first.numerator // first.denominator
    add(4, 'middle', {'hour': hour},
        f'{hour}시 정각이 지난 뒤 {hour+1}시가 되기 전에 시침과 분침이 처음으로 직각을 이루는 시각은 {hour}시 □분과 {hour}시 (□＋1)분 사이입니다. □에 들어갈 정수를 구하시오.',
        [minute],
        [f'{hour}시 정각의 시침과 분침 사이 방향 차는 {30*hour}°입니다. 분침은 1분에6°, 시침은0.5° 움직여 방향 차가1분에5.5°씩 변합니다.',
         '두 바늘의 작은 각이90°인 경우는 방향 차가90° 또는270°일 때입니다. 정각 자체를 제외하고 한 시간 안에서 두 경우를 모두 비교합니다.',
         f'조건에 맞는 경과 시간은 ' + ', '.join(fraction(t) for t in candidates) + f'분이고, 가장 먼저인 {fraction(first)}분은 {minute}분보다 크고 {minute+1}분보다 작습니다.',
         f'따라서 □는 {minute}입니다.'],
        ['정수 분'], '작은 각과 방향 차를 구분하고 정각 이후의 첫 직각 찾기', 'exact rational right-angle crossings in an open hour interval')


def time_label(minutes):
    return f'오전 {minutes//60}시 {minutes%60}분'


for start, end in [(80, 180), (180, 400), (335, 540), (470, 705), (180, 540)]:
    hits = [Fraction(180 + 360 * k, 11) for k in range(22)
            if start <= Fraction(180 + 360 * k, 11) <= end]
    add(4, 'high', {'startMinute': start, 'endMinute': end},
        f'{time_label(start)}부터 {time_label(end)}까지 시침과 분침이 직각을 이루는 순간은 모두 몇 번입니까? 시작 시각과 끝 시각도 포함합니다.',
        [len(hits)],
        ['시침과 분침의 상대적인 움직임은1분에5.5°입니다. 자정 후 처음 직각을 이루는 때는90÷5.5분이고, 다음 직각까지는180÷5.5분씩 걸립니다.',
         f'그러므로 자정부터 지난 분 수가 180/11, 540/11, 900/11, …일 때 직각입니다. 주어진 구간은 자정 후 {start}분 이상 {end}분 이하입니다.',
         '이 범위에 들어가는 분 수는 ' + ', '.join(fraction(t) for t in hits) + f'이므로 모두 {len(hits)}번입니다.',
         '시작이나 끝 시각이 이 목록에 있으면 한 번으로 포함하며, 같은 순간을 두 번 세지 않습니다.'],
        ['횟수'], '직각의 반복 간격을 이용하고 구간 양 끝의 포함 여부 확인하기', 'global rational progression of all right-angle events')


for d, q, last, m in [(47, 14, 6, 3), (52, 15, 2, 7), (56, 13, 5, 9), (61, 12, 8, 11), (64, 14, 7, 13)]:
    candidates = [n for n in range(d * q, d * (q + 1)) if n % 10 == last]
    answers = [n for n in candidates if n % m == 0]
    assert 0 < len(answers) < len(candidates)
    add(5, 'middle', {'divisor': d, 'quotient': q, 'lastDigit': last, 'multiple': m},
        f'어떤 세 자리 자연수를 {d}로 나누었더니 몫이 {q}였습니다. 이 수의 일의 자리는 {last}이고 {m}의 배수입니다. 가능한 수를 모두 구하시오.',
        answers,
        [f'몫이 {q}이고 나머지는0 이상 {d} 미만이므로 그 수는 {d*q} 이상 {d*(q+1)} 미만입니다.',
         f'이 범위에서 일의 자리가 {last}인 수는 ' + ', '.join(map(str, candidates)) + '입니다.',
         f'이 중 {m}로 나누어떨어지는 수는 ' + ', '.join(map(str, answers)) + '입니다. 범위의 모든 끝자리 후보를 확인했으므로 이것이 가능한 전체 답입니다.'],
        ['가능한 수 모두 (쉼표로 구분)'], '몫의 구간에서 끝자리 후보를 고른 뒤 배수 조건까지 확인하기',
        'quotient interval followed by terminal digit and divisibility', 'unordered-set')

for lo, hi, q, gap, last in [(20, 38, 16, 5, 6), (22, 41, 18, 7, 3), (18, 35, 21, 9, 5), (21, 31, 24, 11, 9), (24, 43, 26, 13, 7)]:
    answers = [d * (q + 1) - gap for d in range(lo, hi + 1)
               if 100 <= d * (q + 1) - gap <= 999 and (d * (q + 1) - gap) % 10 == last]
    ds = [(n + gap) // (q + 1) for n in answers]
    assert answers and gap < lo
    add(5, 'high', {'divisorMin': lo, 'divisorMax': hi, 'quotient': q, 'remainderGap': gap, 'lastDigit': last},
        f'어떤 세 자리 자연수를 {lo} 이상 {hi} 이하의 자연수로 나누었더니 몫은 {q}이고 나머지는 나누는 수보다 {gap} 작았습니다. 나누어지는 수의 일의 자리가 {last}일 때 가능한 수를 모두 구하시오.',
        answers,
        [f'나누는 수를 □라 하면 나머지는 □−{gap}입니다. 따라서 나누어지는 수는 {q}×□＋(□−{gap})＝{q+1}×□−{gap}입니다.',
         f'□를 {lo}부터 {hi}까지 확인하면서 일의 자리가 {last}이고 세 자리인 경우를 고르면, 가능한 나누는 수는 ' + ', '.join(map(str, ds)) + '입니다.',
         '이에 맞는 나누어지는 수는 ' + ', '.join(map(str, answers)) + f'입니다. 나머지는 각각 나누는 수보다 {gap} 작으며0 이상 나누는 수 미만입니다.',
         '지정된 나누는 수의 전 범위와 세 자리 조건을 모두 확인했으므로 이 수들이 전체 답입니다.'],
        ['가능한 수 모두 (쉼표로 구분)'], '미지의 나누는 수와 나머지의 차를 이용해 수를 나타내고 범위로 거르기',
        'inverse dividend from unknown divisor and remainder deficit', 'unordered-set')


def edge_count(n):
    return 2 * n * n + 3 * n - 1


for n, remaining in [(6, 4), (7, 6), (10, 8), (13, 10), (14, 12)]:
    added = edge_count(n + 1) - edge_count(n) - remaining
    original = edge_count(n) + remaining
    add(6, 'middle', {'remaining': remaining, 'neededForNext': added},
        f'한 상자의 성냥개비로 그림의 규칙대로 최대한 높은 도형을 완성했더니 {remaining}개가 남았습니다. 지금 도형보다 한 층 더 높은 도형을 만들려면 성냥개비 {added}개를 더 가져와야 꼭 맞습니다. 처음 상자에 들어 있던 성냥개비는 몇 개입니까?',
        [original],
        ['위에서부터 정사각형이1,3,5,…개씩 놓이고 공유하는 변은 한 번만 셉니다. 현재 층수가 □일 때 한 층 더 높이는 데 필요한 성냥개비는4×□＋5개입니다.',
         f'남은 {remaining}개와 더 가져올 {added}개를 합하면 {remaining+added}개입니다. 따라서 현재 층수는 ({remaining+added}−5)÷4＝{n}층입니다.',
         f'{n}층의 가로 성냥개비는 {n*n+2*n-1}개, 세로는 {n*(n+1)}개여서 모두 {edge_count(n)}개입니다. 여기에 남은 {remaining}개를 더하면 {original}개입니다.',
         f'한 층 더 높은 도형에 필요한 수는 {edge_count(n+1)}개이고, {original}＋{added}와 같으므로 조건에 맞습니다.'],
        ['처음 개수'], '남은 수와 다음 층까지 모자란 수로 층수를 거꾸로 구하기', 'inverse consecutive-layer increment')

for n, increase, first_left, second_left in [(5, 2, 3, 5), (8, 3, 7, 8), (11, 2, 11, 6), (13, 4, 9, 10), (16, 3, 13, 14)]:
    added = edge_count(n + increase) - edge_count(n) + second_left - first_left
    original = edge_count(n) + first_left
    assert first_left < edge_count(n+1)-edge_count(n)
    assert second_left < edge_count(n+increase+1)-edge_count(n+increase)
    add(6, 'high', {'layerIncrease': increase, 'firstRemaining': first_left, 'secondRemaining': second_left, 'added': added},
        f'한 상자의 성냥개비로 그림의 규칙대로 최대한 높은 도형을 만들었더니 {first_left}개가 남았습니다. 성냥개비 {added}개를 더 가져와 같은 규칙으로 최대한 높은 도형을 만들었더니 처음보다 {increase}층 높아지고 {second_left}개가 남았습니다. 처음 상자에 들어 있던 성냥개비는 몇 개입니까?',
        [original],
        [f'실제로 도형에 더 사용한 성냥개비는 추가한 수에 처음 남은 수를 더하고 나중에 남은 수를 빼므로 {added}＋{first_left}−{second_left}＝{added+first_left-second_left}개입니다.',
         f'현재 □층을 한 층 높이면4×□＋5개가 더 필요합니다. {increase}층을 높일 때 각 층의 증가량을 더하면 {4*increase}×□＋{2*increase*increase+3*increase}개입니다.',
         f'따라서 처음 층수는 ({added+first_left-second_left}−{2*increase*increase+3*increase})÷{4*increase}＝{n}층입니다. {n}층에 필요한 성냥개비는 {edge_count(n)}개이므로 처음 상자는 {edge_count(n)}＋{first_left}＝{original}개입니다.',
         f'추가 후에는 {original+added}개 중 {edge_count(n+increase)}개로 {n+increase}층을 만들고 {second_left}개가 남습니다. 전후 남은 수가 각각 다음 층 증가량보다 작아 두 번 모두 최대 층수 조건을 만족합니다.'],
        ['처음 개수'], '추가한 수와 전후 남은 수로 도형에 실제 늘어난 성냥개비를 구하기', 'inverse multiple-layer increment with two maximality checks')

for no in range(1, 7):
    for level in ['low', 'middle', 'high']:
        assert sum(x['sourceNo'] == no and x['practiceLevel'] == level for x in items) == 5
assert len(items) == len({x['id'] for x in items}) == 90
assert len({x['text'] + '\n' + str(x.get('promptDataLines', '')) for x in items}) == 90
for old in old_items:
    new = next(x for x in items if x['id'] == old['id'])
    assert all(new[k] == value for k, value in old.items())
    assert new['practiceStorageVersion'] == old_version
data.update(version=version, availableSourceNos=list(range(1, 7)), pendingSourceNos=list(range(7, 31)),
            preservedLegacyCount=30, newAuthoredCount=60)
data.pop('reviewSummary', None)
FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
assert hashlib.sha256(base_bytes).hexdigest() == data['legacyBankSha256']
print('Added sources4/5/6: 45 more levelled items (15 retained +30 new); first45 content and practice storage preserved')
