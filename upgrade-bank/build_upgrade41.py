#!/usr/bin/env python3
"""승급과정 4-1 일일테스트 유사문제 생성기.
시험지 9문제 × 낮춰서/같은 수준/높여서 3단계 × 3개 = 81문항.
각 문항은 서로 다른 두 방법(A·B)으로 정답을 계산해 일치해야만 저장한다."""
import itertools, json, random, sys
from math import factorial
from collections import Counter

LEVELS = [('lower', '낮춰서'), ('same', '같은 수준'), ('higher', '높여서')]

# ---------------------------------------------------------------- 한글 수 읽기 (방법이 다른 두 구현)
DIG = '영일이삼사오육칠팔구'


def group_ko(g):
    out = ''
    for v, name in ((1000, '천'), (100, '백'), (10, '십')):
        d, g = divmod(g, v)
        if d:
            out += ('' if d == 1 else DIG[d]) + name
    if g:
        out += DIG[g]
    return out


def read_ko(n):
    parts, rest = [], n
    for u, name in ((10 ** 12, '조'), (10 ** 8, '억'), (10 ** 4, '만')):
        g, rest = divmod(rest, u)
        if g:
            parts.append(('' if (g == 1 and name == '만') else group_ko(g)) + name)
    if rest:
        parts.append(group_ko(rest))
    return ' '.join(parts)


def parse_ko(s):
    total = 0
    for chunk in s.split():
        mult = 1
        for u, name in ((10 ** 12, '조'), (10 ** 8, '억'), (10 ** 4, '만')):
            if chunk.endswith(name):
                mult, chunk = u, chunk[:-1]
                break
        val, cur = 0, 0
        for ch in chunk or '일':
            if ch in DIG and ch != '영':
                cur = DIG.index(ch)
            elif ch in '천백십':
                val += (cur or 1) * {'천': 1000, '백': 100, '십': 10}[ch]
                cur = 0
        val += cur
        total += (val or 1) * mult if (chunk == '' or val) else 0
    return total


for _n in (5147900000000, 12047900000000, 100000000, 10000, 3045, 20000000300000):
    assert parse_ko(read_ko(_n)) == _n, (_n, read_ko(_n), parse_ko(read_ko(_n)))

PLACES = ['일', '십', '백', '천', '만', '십만', '백만', '천만', '억', '십억', '백억', '천억', '조', '십조', '백조', '천조']
UNIT_NAME = {10 ** 9: '10억', 10 ** 8: '1억', 10 ** 7: '1000만', 10 ** 6: '100만', 10 ** 5: '10만', 10 ** 4: '1만',
             1000: '1000', 100: '100', 10: '10', 1: '1', 10 ** 12: '1조', 10 ** 11: '1000억', 10 ** 10: '100억'}


def has_final(word):
    ch = word[-1]
    if '가' <= ch <= '힣':
        return (ord(ch) - 0xAC00) % 28 != 0
    return False


def eun(word):
    return word + ('은' if has_final(word) else '는')


def num_final(n):
    """숫자 문자열을 읽을 때 마지막 소리에 받침이 있는지 (0 영, 1 일, 3 삼, 6 육, 7 칠, 8 팔 → 받침 있음)"""
    return str(n)[-1] in '013678'


def num_eun(n):
    return f"{n}" + ('은' if num_final(n) else '는')


def num_i(n):
    return f"{n}" + ('이' if num_final(n) else '가')


def num_eul(n):
    return f"{n}" + ('을' if num_final(n) else '를')


def num_gwa(n):
    return f"{n}" + ('과' if num_final(n) else '와')


def item(src_no, level, k, text, answer, steps, check):
    return dict(srcNo=src_no, level=level, variant=k, text=text, answer=str(answer), steps=steps, check=check)


# ================================================================= S1-1 단위 개수로 나타낸 수
def s1_p1():
    sets = {
        'lower': [([(10 ** 6, 3), (10 ** 5, 2), (10 ** 4, 5), (10, 17)], 1), ([(10 ** 6, 4), (1000, 36), (10 ** 4, 7), (1, 8)], 2),
                  ([(10 ** 6, 1), (10 ** 4, 28), (100, 40), (1, 9)], 1)],
        'same': [([(10 ** 9, 2), (10 ** 8, 41), (10 ** 5, 6), (10 ** 4, 367), (1000, 208), (1, 75)], 3),
                 ([(10 ** 9, 3), (10 ** 8, 15), (10 ** 5, 98), (10 ** 4, 503), (1000, 64), (1, 12)], 2),
                 ([(10 ** 9, 1), (10 ** 8, 57), (10 ** 5, 6), (10 ** 4, 910), (1000, 330), (1, 408)], 4)],
        'higher': [([(10 ** 12, 4), (10 ** 8, 7312), (10 ** 5, 8), (10 ** 4, 905), (1000, 4010), (1, 600)], 1),
                   ([(10 ** 12, 2), (10 ** 8, 2045), (10 ** 7, 38), (10 ** 4, 6710), (100, 255), (1, 70)], 3),
                   ([(10 ** 12, 6), (10 ** 8, 905), (10 ** 6, 4120), (10 ** 4, 38), (1000, 7006), (10, 125)], 2)],
    }
    out = []
    for level, _ in LEVELS:
        for k, (parts, hide) in enumerate(sets[level], 1):
            n = sum(u * c for u, c in parts)
            # 방법 A: 합계에서 나머지를 빼서 나누기 / 방법 B: 자릿수 분해로 값 복원
            u_h, c_h = parts[hide]
            rest = sum(u * c for i, (u, c) in enumerate(parts) if i != hide)
            a = (n - rest) // u_h
            assert (n - rest) % u_h == 0 and a == c_h
            nums = [u * c for u, c in parts]
            b = (n - sum(v for i, v in enumerate(nums) if i != hide)) // u_h
            assert a == b == c_h
            names = []
            for i, (u, c) in enumerate(parts):
                names.append(f"{UNIT_NAME[u]}이 {'(      )' if i == hide else c}개")
            text = f"{num_eun(n)} " + ', '.join(names) + '인 수입니다. 빈칸에 알맞은 수를 쓰세요.'
            steps = [f"{n} = " + ' + '.join(f"{UNIT_NAME[u]}×{c}" for u, c in parts) + " 입니다.",
                     f"빈칸을 뺀 나머지 값의 합은 {rest}이므로, 빈칸이 나타내는 값은 {n} − {rest} = {n - rest}입니다.",
                     f"{UNIT_NAME[u_h]}이 {a}개이므로 빈칸에 알맞은 수는 {a}입니다."]
            out.append(item(1, level, k, text, a, steps, '합계 역산과 단위별 값 복원이 일치'))
    return out


# ================================================================= S1-2 단위 환산과 숫자의 값
def digit_value_places(s, d):
    """문자열 방법: 숫자 d가 있는 모든 자리의 값 (오른쪽부터 자리값)"""
    L = len(s)
    return [int(ch) * 10 ** (L - 1 - i) for i, ch in enumerate(s) if ch == d]


def s1_p2():
    cfg = {
        'lower': [('소리', 340, 1000, '4', 'one'), ('여객기', 250, 400, '1', 'one'), ('우주선', 7800, 200, '5', 'one')],
        'same': [('빛', 299790000, 200, '8', 'one'), ('전파', 300000000, 150, '5', 'one'), ('빛', 299790000, 1000, '7', 'one')],
        'higher': [('빛', 299790000, 300, '9', 'sum'), ('빛', 299790000, 30, '9', 'sum'), ('전파', 300000000, 2370, '1', 'sum')],
    }
    out = []
    for level, _ in LEVELS:
        for k, (obj, v, t, d, mode) in enumerate(cfg[level], 1):
            meters = v * t
            assert meters % 1000 == 0
            km = meters // 1000
            # 방법 A: 자리값을 수식으로 / 방법 B: 문자열로
            s = str(km)
            places_b = digit_value_places(s, d)
            places_a = [int(d) * 10 ** p for p in range(len(s)) if (km // 10 ** p) % 10 == int(d)]
            assert sorted(places_a) == sorted(places_b) and places_a
            if mode == 'one':
                assert len(places_a) == 1, (obj, v, t, d, km)
                ans = places_a[0]
                q = f"숫자 {num_i(d)} 나타내는 값은 얼마입니까?"
                last = f"{km}에서 숫자 {num_eun(d)} {num_eul(ans)} 나타냅니다."
            else:
                ans = sum(places_a)
                assert len(places_a) >= 2
                q = f"숫자 {num_i(d)} 나타내는 값을 모두 더하면 얼마입니까?"
                last = f"숫자 {num_i(d)} 나타내는 값은 {', '.join(str(x) for x in sorted(places_a, reverse=True))}이므로 합은 {ans}입니다."
            text = f"{eun(obj)} 1초에 약 {v}m를 갑니다. {t}초 동안 간 거리를 km 단위로 나타냈을 때 {q}"
            steps = [f"{t}초 동안 간 거리는 {v}×{t} = {meters}m입니다.", f"1km = 1000m이므로 {meters}m = {km}km입니다.", last]
            out.append(item(2, level, k, text, ans, steps, '수식 방법과 문자열 방법의 자리값이 일치'))
    return out


# ================================================================= S1-3 □가 있는 수의 크기 비교
def interval(pattern):
    lo = int(''.join('0' if c == '□' else c for c in pattern))
    hi = int(''.join('9' if c == '□' else c for c in pattern))
    return lo, hi


def s1_p3():
    marks = 'ㄱㄴㄷㄹㅁ'
    # 같은 자리 수인 두 수는 '맨 앞부터 같은 숫자가 이어지다가 처음 달라지는 자리'에서 크기가 정해지므로, 그 자리보다 앞에는 □를 두지 않는다.
    sets = {
        'lower': [['3□5□2', '4□□7', '2□□□□1'], ['6□8□4', '7□1□□', '75□□'], ['6□□0□', '5□9□□□', '6□□1□□']],
        'same': [['5379□□□□', '5382□□□□', '537□5□', '6□0□□□□□'],
                 ['7140□□□□', '7138□□□□', '72□□□□□□', '7□□□□□'],
                 ['6055□□□□', '6070□□□□', '5□□□□□□□□', '4□□□□□□']],
        'higher': [['83742□□□', '83746□□□', '83739□□□', '83741□□□', '83751□□□'],
                   ['4958□□□□', '4958□□□', '49571□□□', '4963□□□□', '5□□□□□□□'],
                   ['7064□□□□□', '7064□□□□', '70652□□□□', '7059□□□□□', '8□□□□□□□']],
    }
    out = []
    for level, _ in LEVELS:
        for k, pats in enumerate(sets[level], 1):
            # 방법 A: 구간(최소·최대) 분리로 순서 결정
            iv = [interval(p) for p in pats]
            order_a = sorted(range(len(pats)), key=lambda i: iv[i][0], reverse=True)
            for x, y in zip(order_a, order_a[1:]):
                if not iv[x][0] > iv[y][1]:
                    sys.exit(f"S1-3 {level}{k}: 순서가 고정되지 않음 {pats[x]} / {pats[y]}")
            # 방법 B: 무작위 대입(10000회)과 모서리 대입으로 순서가 변하지 않는지 확인
            rnd = random.Random(31 + k)
            for _ in range(10000):
                vals = [int(''.join(str(rnd.randrange(10)) if c == '□' else c for c in p)) for p in pats]
                assert sorted(range(len(pats)), key=lambda i: vals[i], reverse=True) == order_a
            ans = ' > '.join(marks[i] for i in order_a)
            body = '\n'.join(f"{marks[i]}  {p}" for i, p in enumerate(pats))
            text = ("□ 안에는 0부터 9까지의 숫자 중에서 어떤 숫자를 넣어도 됩니다. "
                    f"{len(pats)}개의 수의 크기를 비교하여 큰 수부터 차례로 기호를 쓰세요.\n{body}")
            steps = ["자리 수가 많은 수가 더 큽니다. 자리 수가 같으면 높은 자리부터 차례로 숫자를 비교합니다. □에 어떤 숫자가 들어가도 크기가 달라지지 않는 자리에서 비교해야 합니다."]
            for x, y in zip(order_a, order_a[1:]):
                px, py = pats[x], pats[y]
                if len(px) != len(py):
                    steps.append(f"{marks[x]}은 {len(px)}자리, {marks[y]}은 {len(py)}자리이므로 {marks[x]} > {marks[y]}입니다.")
                else:
                    j = next(i for i in range(len(px)) if px[i] != py[i])
                    same = f"앞 {j}자리({px[:j]})가 같고 " if j else ""
                    steps.append(f"{marks[x]}과 {marks[y]}은 {same}{j + 1}번째 자리에서 {px[j]} > {py[j]}이므로 {marks[x]} > {marks[y]}입니다.")
            steps.append(f"따라서 큰 수부터 차례로 쓰면 {ans}입니다.")
            out.append(item(3, level, k, text, ans, steps, '구간 분리와 무작위·모서리 대입 1만 회가 일치'))
    return out


# ================================================================= S1-4 뛰어 세기
def s1_p4():
    cfg = {
        'lower': [(30000000, 3, 51000000, 5), (120000000, 2, 160000000, 4), (4500000, 3, 5100000, 6)],
        'same': [(5147900000000, 3, 12047900000000, 4), (3205000000000, 2, 9605000000000, 5), (7040800000000, 4, 15440800000000, 3)],
        'higher': [(48650000000000, 5, 96150000000000, 8), (9990000000000, 3, 12690000000000, 7), (95000000000000, 4, 119800000000000, 6)],
    }
    out = []
    for level, _ in LEVELS:
        for k, (start, jumps, after, ask) in enumerate(cfg[level], 1):
            assert (after - start) % jumps == 0
            step = (after - start) // jumps
            res = start + ask * step
            # 방법 B: 읽은 말을 다시 수로 바꾸어 확인
            assert parse_ko(read_ko(start)) == start and parse_ko(read_ko(after)) == after and parse_ko(read_ko(res)) == res
            text = (f"{read_ko(start)}에서 {jumps}번 뛰어 센 수가 {read_ko(after)}입니다. 같은 규칙으로 "
                    f"{read_ko(start)}에서 {ask}번 뛰어 센 수를 읽어 보세요.")
            steps = [f"{read_ko(start)} = {start}, {read_ko(after)} = {after}입니다.",
                     f"{jumps}번 뛰어 세어 {after} − {start} = {after - start}만큼 커졌으므로 한 번에 {step}씩 뛰어 센 것입니다.",
                     f"{ask}번 뛰어 세면 {start} + {step}×{ask} = {res}이고, 읽으면 {read_ko(res)}입니다."]
            out.append(item(4, level, k, text, read_ko(res), steps, '수 계산과 읽기·되읽기 변환이 일치'))
    return out


# ================================================================= S2-1 이어 붙인 수의 끝 세 자리
def s2_p1():
    ns = {'lower': [51, 70, 100], 'same': [300, 357 + 61, 500], 'higher': [3000, 2900, 3500]}
    out = []
    for level, _ in LEVELS:
        for k, n in enumerate(ns[level], 1):
            # 방법 A: 자리 수 구간 계산
            rem, width, first, cnt = n, 1, 1, 9
            while rem > width * cnt:
                rem -= width * cnt
                width += 1; first *= 10; cnt *= 10
            full, extra = divmod(rem, width)
            last_full = first + full - 1
            before = ''.join(str(x) for x in range(max(1, last_full - 3), last_full + 1))   # 끝 세 자리가 앞 수에 걸칠 수 있다
            tail_a = (before + (str(last_full + 1)[:extra] if extra else ''))[-3:]
            # 방법 B: 실제로 이어 붙인 문자열
            s = ''.join(str(i) for i in range(1, 6000))
            assert s[:n][-3:] == tail_a
            lead = ''.join(str(i) for i in range(1, 15))[:14]
            text = (f"다음은 1부터 자연수를 차례로 계속해서 붙여 써서 {n}자리 수를 만든 것입니다. "
                    f"이때 마지막 세 자리 수 □□□는 얼마입니까?\n{lead}…□□□")
            steps = [f"한 자리 수 1~9는 9개로 9자리, 두 자리 수 10~99는 90개로 180자리입니다."]
            if width >= 3:
                steps.append("세 자리 수 100~999는 900개로 2700자리입니다.")
            if width == 4:
                steps.append("1부터 999까지 쓰면 9 + 180 + 2700 = 2889자리입니다.")
            used = n - rem
            steps.append(f"{used}자리까지 쓴 뒤 {rem}자리가 더 필요하고, {width}자리 수를 {full}개 쓰면 {first + full - 1}까지이고" +
                         (f" {extra}자리가 남아 {last_full + 1}의 앞 {extra}자리({str(last_full + 1)[:extra]})까지 씁니다." if extra else " 남는 자리가 없습니다."))
            steps.append(f"마지막 세 자리는 {tail_a}입니다.")
            out.append(item(5, level, k, text, tail_a, steps, '구간 계산과 실제 이어 붙인 수가 일치'))
    return out


# ================================================================= S2-2 범위 안에서 자리 조건을 만족하는 수의 개수
def s2_p2():
    cfg = {
        'lower': [(1230, 1470, 'eq'), (4520, 4790, 'eq'), (2815, 3150, 'eq')],
        'same': [(245613, 246108, 'eq'), (587120, 587940, 'eq'), (310045, 311231, 'eq')],
        'higher': [(487532, 489120, 'eq_gt'), (126340, 128275, 'eq_gt'), (903118, 905004, 'eq_lt')],
    }
    out = []
    for level, _ in LEVELS:
        for k, (a, b, cond) in enumerate(cfg[level], 1):
            def ok(n):
                t, h, o = (n // 10) % 10, (n // 100) % 10, n % 10
                return t == h and (cond == 'eq' or (cond == 'eq_gt' and o > t) or (cond == 'eq_lt' and o < t))
            # 방법 A: 하나씩 검사
            cnt_a = sum(1 for n in range(a + 1, b) if ok(n))
            # 방법 B: 앞자리·같은 숫자·일의 자리를 만들어 범위 안인지 세기
            cnt_b = 0
            for pre in range(a // 1000, b // 1000 + 1):
                for h in range(10):
                    for o in range(10):
                        n = pre * 1000 + h * 100 + h * 10 + o
                        if a < n < b and ok(n):
                            cnt_b += 1
            assert cnt_a == cnt_b, (a, b, cond, cnt_a, cnt_b)
            tail = {'eq': '수는', 'eq_gt': '일의 자리 수가 십의 자리 수보다 큰 수는', 'eq_lt': '일의 자리 수가 십의 자리 수보다 작은 수는'}[cond]
            sep = '' if cond == 'eq' else ', '
            text = f"{a}보다 크고 {b}보다 작은 자연수 중에서 십의 자리와 백의 자리 수가 같{'은 ' if cond == 'eq' else '고'}{sep}{tail} 모두 몇 개입니까?"
            steps = [f"{a + 1}부터 {b - 1}까지의 수에서 백의 자리와 십의 자리가 같은 수를 천의 자리 이상이 같은 묶음별로 세어 봅니다."]
            groups = Counter()
            for n in range(a + 1, b):
                if ok(n):
                    groups[n // 1000] += 1
            steps.append(', '.join(f"{p}□□□ 묶음 {c}개" for p, c in sorted(groups.items())) + "입니다.")
            steps.append(f"모두 더하면 {cnt_a}개입니다.")
            out.append(item(6, level, k, text, cnt_a, steps, '하나씩 검사와 조합 생성 세기가 일치'))
    return out


# ================================================================= S2-3 수 카드로 만든 k번째로 큰 수
def multiset_perms_desc(cards):
    """중복을 제거한 순열을 큰 수부터, 맨 앞이 0인 수는 제외"""
    seen = sorted({p for p in itertools.permutations(cards) if p[0] != 0}, reverse=True)
    return [int(''.join(map(str, p))) for p in seen]


def kth_largest_rank(cards_counter, k):
    """방법 B: 순열을 만들지 않고 경우의 수로 k번째로 큰 수를 찾는다"""
    total = sum(cards_counter.values())
    digits, remaining = [], k
    cnt = Counter(cards_counter)
    for pos in range(total):
        for d in sorted(cnt, reverse=True):
            if cnt[d] == 0 or (pos == 0 and d == 0):
                continue
            cnt[d] -= 1
            ways = factorial(total - pos - 1)
            for v in cnt.values():
                ways //= factorial(v)
            if remaining <= ways:
                digits.append(d)
                break
            remaining -= ways
            cnt[d] += 1
    return int(''.join(map(str, digits)))


def s2_p3():
    cfg = {
        'lower': [((1, 4, 7), 4), ((2, 5, 8), 3), ((3, 6, 9), 5)],
        'same': [((1, 2, 5, 8), 6), ((2, 4, 6, 8), 6), ((3, 5, 7, 9), 5)],
        'higher': [((0, 2, 5, 7), 10), ((0, 1, 4, 9), 9), ((0, 3, 6, 8), 12)],
    }
    out = []
    for level, _ in LEVELS:
        for k, (cards, nth) in enumerate(cfg[level], 1):
            seq = [c for c in cards for _ in range(2)]
            lst = multiset_perms_desc(seq)
            a = lst[nth - 1]
            b = kth_largest_rank(Counter(seq), nth)
            assert a == b, (cards, nth, a, b)
            n = len(seq)
            text = (f"다음의 수 카드를 두 번씩 사용하여 {n}자리 자연수를 만들었을 때 {nth}번째로 큰 수를 쓰세요.\n"
                    + '   '.join(map(str, cards)))
            steps = [f"카드를 두 번씩 모두 사용하면 {n}자리 수가 됩니다." + (" 맨 앞자리에는 0이 올 수 없습니다." if 0 in cards else ""),
                     "가장 큰 수부터 큰 자리의 숫자를 큰 것부터 정하고, 앞자리가 정해질 때마다 만들 수 있는 수의 개수를 세어 순서를 따라갑니다.",
                     f"큰 수부터 {nth}번째 수는 {a}입니다. (큰 수부터: " + ', '.join(str(x) for x in lst[:nth]) + ")"]
            out.append(item(7, level, k, text, a, steps, '모든 수를 나열해 정렬한 결과와 경우의 수 계산이 일치'))
    return out


# ================================================================= S2-4 조건에 맞는 가장 큰 수
def s2_p4():
    cfg = {
        'lower': [(8, 2, {8: 9}, None), (9, 2, {1: 5, 9: 9}, None), (8, 2, {3: 7, 8: 6}, None)],
        'same': [(14, 2, {8: 9, 5: 1}, (10, 3, 2)), (13, 2, {7: 8, 4: 2}, (9, 2, 2)), (14, 2, {9: 7, 6: 4}, (11, 5, 2))],
        'higher': [(16, 2, {10: 9, 6: 1, 3: 2}, (13, 4, 2)), (15, 2, {12: 8, 7: 3, 2: 5}, (14, 9, 2)), (16, 2, {14: 9, 8: 1, 5: 2}, (11, 3, 2))],
    }
    out = []
    for level, _ in LEVELS:
        for k, (length, cap, fixed, rel) in enumerate(cfg[level], 1):
            # 방법 A: 높은 자리부터 가장 큰 숫자를 넣어 보고 끝까지 만들 수 있는지 되짚으며 확인
            def feasible(prefix):
                used = Counter(prefix)
                if any(v > cap for v in used.values()):
                    return False
                for i, d in enumerate(prefix):
                    pos = length - i
                    if pos in fixed and fixed[pos] != d:
                        return False
                if rel:
                    p, q, m = rel
                    dp = prefix[length - p] if length - p < len(prefix) else None
                    dq = prefix[length - q] if length - q < len(prefix) else None
                    if dp is not None and dq is not None and dp != m * dq:
                        return False
                # 남은 자리가 채워질 숫자가 있는지: 남는 사용 가능 횟수 ≥ 남은 자리
                room = sum(cap - used.get(d, 0) for d in range(1, 10))
                rest = length - len(prefix)
                if room < rest:
                    return False
                # 남은 자리 중 고정된 자리의 숫자 사용 횟수 확인
                need = Counter(fixed[length - i] for i in range(len(prefix), length) if (length - i) in fixed)
                if any(used.get(d, 0) + c > cap for d, c in need.items()):
                    return False
                if rel:
                    p, q, m = rel
                    ip, iq = length - p, length - q
                    free_p = ip >= len(prefix) and p not in fixed
                    free_q = iq >= len(prefix) and q not in fixed
                    if free_p or free_q:
                        # 관계를 만족하는 (p, q) 숫자 쌍이 하나는 있어야 함
                        cand = False
                        for dq in range(1, 10):
                            dp = m * dq
                            if dp > 9:
                                continue
                            tmp = Counter(used) + Counter(need)
                            tmp[dp] += 1; tmp[dq] += 1
                            if all(v <= cap for v in tmp.values()):
                                cand = True
                        if not cand:
                            return False
                return True

            def dfs(prefix):
                if len(prefix) == length:
                    return prefix
                for d in range(9, 0, -1):
                    nxt = prefix + [d]
                    if feasible(nxt):
                        r = dfs(nxt)
                        if r:
                            return r
                return None
            best_a = int(''.join(map(str, dfs([]))))
            # 방법 B: 관계가 있으면 그 쌍의 숫자를 먼저 정해 보고, 나머지는 큰 숫자부터 채움
            best_b = 0
            pairs = [None]
            if rel:
                pairs = [(m_ * rel[2], m_) for m_ in range(1, 10) if m_ * rel[2] <= 9]
                pairs = [(rel[1], rel[0], dq, dp) for dp, dq in pairs]  # (q, p, dq, dp)
            for pr in pairs:
                digits = {}
                for pos, d in fixed.items():
                    digits[pos] = d
                if pr:
                    q, p, dq, dp = pr
                    if (q in digits and digits[q] != dq) or (p in digits and digits[p] != dp):
                        continue
                    digits[q], digits[p] = dq, dp
                used = Counter(digits.values())
                if any(v > cap for v in used.values()):
                    continue
                free = [pos for pos in range(length, 0, -1) if pos not in digits]
                ok = True
                for pos in free:
                    for d in range(9, 0, -1):
                        if used.get(d, 0) < cap:
                            digits[pos] = d; used[d] = used.get(d, 0) + 1
                            break
                    else:
                        ok = False; break
                if ok and len(digits) == length:
                    best_b = max(best_b, int(''.join(str(digits[pos]) for pos in range(length, 0, -1))))
            assert best_a == best_b and best_a > 0, (level, k, best_a, best_b)
            conds = [f"1부터 9까지의 숫자를 {cap}번까지 사용하여 만든 {length}자리 자연수입니다."]
            for pos, d in sorted(fixed.items(), reverse=True):
                conds.append(f"{PLACES[pos - 1]}의 자리 수는 {d}입니다.")
            if rel:
                p, q, m = rel
                conds.append(f"{PLACES[p - 1]}의 자리 수가 {PLACES[q - 1]}의 자리 수의 {m}배입니다.")
            text = "조건을 만족하는 가장 큰 수를 구하세요.\n" + '\n'.join(f"{i}) {c}" for i, c in enumerate(conds, 1))
            steps = ["조건에서 정해진 자리의 숫자를 먼저 놓고 사용한 횟수를 셉니다.",
                     "남은 자리에는 높은 자리부터 큰 숫자를 넣되, 같은 숫자를 " + f"{cap}번보다 많이 쓰지 않습니다."]
            if rel:
                steps.append(f"{PLACES[rel[0] - 1]}의 자리 수가 {PLACES[rel[1] - 1]}의 자리 수의 {rel[2]}배이므로 두 숫자의 짝을 정하고, 큰 수가 되는 짝을 비교합니다.")
            steps.append(f"가장 큰 수는 {best_a}입니다.")
            out.append(item(8, level, k, text, best_a, steps, '되짚기 탐색과 관계 쌍을 정한 뒤 채우는 방법이 일치'))
    return out


# ================================================================= S2-5 순열 사이의 수의 개수
def perm_rank_desc(digits_sorted_desc, number_str):
    """큰 수부터 세었을 때의 순위(1부터). 맨 앞이 0인 수 제외"""
    digs = list(digits_sorted_desc)
    n = len(digs)
    rank = 1
    remaining = list(digs)
    for pos, ch in enumerate(number_str):
        d = int(ch)
        bigger = [x for x in remaining if x > d and not (pos == 0 and x == 0)]
        rank += len(bigger) * factorial(n - pos - 1)
        remaining.remove(d)
    return rank


def s2_p5():
    cfg = {
        'lower': [(list(range(6)), '543102', 2), (list(range(6)), '540312', 3), (list(range(1, 7)), '654132', 2)],
        'same': [(list(range(10)), '9876543012', 2), (list(range(10)), '9876540321', 3), (list(range(10)), '9876501234', 2)],
        'higher': [(list(range(10)), '9876312045', 5), (list(range(10)), '9875601234', 4), (list(range(10)), '9876021345', 6)],
    }
    out = []
    for level, _ in LEVELS:
        for k, (digs, num, kth) in enumerate(cfg[level], 1):
            n = len(digs)
            desc = sorted(digs, reverse=True)
            # 방법 A: 순위 공식
            r_num = perm_rank_desc(desc, num)
            ans_a = r_num - kth - 1
            assert ans_a > 0
            # 방법 B: 실제로 나열해 정렬한 뒤 위치를 찾는다 (9!·10! 도 시간 안에 가능한 크기)
            allp = sorted((p for p in itertools.permutations(desc) if p[0] != 0), reverse=True)
            strs = [''.join(map(str, p)) for p in allp]
            pos_num = strs.index(num) + 1
            assert pos_num == r_num
            kth_str = strs[kth - 1]
            ans_b = strs.index(num) - (kth - 1) - 1
            assert ans_a == ans_b
            nm = {2: '두', 3: '세', 4: '네', 5: '다섯', 6: '여섯'}[kth]
            dtxt = '0부터 9까지의' if digs == list(range(10)) else (f"{digs[0]}부터 {digs[-1]}까지의")
            text = (f"{dtxt} 숫자를 한 번씩만 사용하여 만들 수 있는 {n}자리 자연수 중에서 {num_gwa(num)} "
                    f"{nm} 번째로 큰 수 사이에 있는 수는 모두 몇 개입니까?")
            steps = [f"가장 큰 수부터 차례로 세면 {kth}번째로 큰 수는 {kth_str}입니다.",
                     f"{num_eun(num)} 큰 수부터 {r_num}번째 수입니다. (앞에 오는 수의 개수를 자리별로 세어 구합니다.)",
                     f"{kth}번째 수와 {r_num}번째 수 사이에는 {r_num} − {kth} − 1 = {ans_a}개가 있습니다."]
            out.append(item(9, level, k, text, ans_a, steps, '순위 계산과 전체 나열·정렬이 일치'))
    return out


def main():
    items = []
    builders = [('1,2차시', 1, s1_p1), ('1,2차시', 2, s1_p2), ('1,2차시', 3, s1_p3), ('1,2차시', 4, s1_p4),
                ('3,4차시', 1, s2_p1), ('3,4차시', 2, s2_p2), ('3,4차시', 3, s2_p3), ('3,4차시', 4, s2_p4), ('3,4차시', 5, s2_p5)]
    for session, no, fn in builders:
        for it in fn():
            it['srcNo'] = no
            it['session'] = session
            items.append(it)
    print('문항', len(items))
    json.dump(items, open(sys.argv[1], 'w', encoding='utf-8'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
