"""Add the requested 5/5/5 practice for sources10-12; preserve all prior135 items."""
import collections
import copy
import hashlib
import json
from fractions import Fraction
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
FILE = ROOT / 'bank/data/applied1-balanced15.json'
data = json.loads(FILE.read_text())
assert data['availableSourceNos'] == list(range(1, 10)), 'One-time additive extension only.'
old_items = copy.deepcopy(data['items'])
legacy_bytes = (ROOT / 'bank/data/applied1-expanded.json').read_bytes()
assert hashlib.sha256(legacy_bytes).hexdigest() == data['legacyBankSha256']
legacy = json.loads(legacy_bytes)['items']
items = data['items']
version = '20261024-applied1-balanced15-r4'


def axes(no, level):
    reason, conditions, cases = {
        (10,'middle'): ('미래까지 지난 연수도 미지수로 두어 현재 합·나이 차·미래 비를 연결', '현재 합·두 나이 차·미래 전체 합·미래 나이 비', '현재와 미래 시점을 분리하고 자연수 나이와 양의 경과 연수 확인'),
        (10,'high'): ('선생님과 언니의 현재 배수 관계를 미래 나이 비와 함께 역산', '현재 배수·현재 합·언니/동생 차·미래 전체 합과 비', '현재 배수는 미래에도 같다고 쓰지 않고 각 시점의 나이를 따로 계산'),
        (11,'middle'): ('전체 뽑기 횟수 대신 두 색 횟수 차와 최종 이동으로 각각의 횟수를 역산', '출발0·교체 추출·두 이동량·최종 위치·색 횟수 차', '동수의 흰/검은 공을 짝지은 이동과 초과 횟수를 구분'),
        (11,'high'): ('이동 규칙이 바뀌는 두 단계의 흰 공 횟수와 차를 함께 역산', '두 단계별 횟수와 이동량·최종 위치·단계별 흰 공 횟수 차', '각 단계의 검은 공을 해당 단계 전체 횟수에서 빼고 두 경로를 합산'),
        (12,'middle'): ('늦어지는 비율이 정오에 달라진 시계를 두 구간으로 나누어 시작 시각 역산', '실제 정오·전후 두 비율·실제 관측 시각·표시 시각', '정오 후 지연을 먼저 분리하고 오전 구간의 지연으로 경과 분 수 역산'),
        (12,'high'): ('빠른 시계와 느린 시계의 표시 차로 경과 시간을 찾고 실제 시각과 시작 시각을 함께 역산', '동시 설정·같은 날 오전/오후·두 비율·두24시간 표시', '두 시계 차가 벌어지는 속도와 각 시계의 오차를 구분하고 자정 순환 배제'),
    }[(no,level)]
    return dict(prerequisite='원문의 나이 비·앞뒤 이동·시계 오차를 이어 사용하며 역추론을 추가',
                reasoning=reason, conditionTracking=conditions, caseSplitting=cases,
                computation='숫자의 크기만이 아니라 미지수·구간·시점의 결합으로 제작 단계를 구분',
                representation='원문10~12번은 텍스트 문항이며 새 문제도 필요한 수·비·시각만 지문에 제시',
                reading='필수 조건과 현재/미래·전/후의 지칭을 명시; 지문 아래 조건 요약이나 힌트 없음',
                visualCues='문제에 풀이 그림·완성된 식·보조선·정답 단서를 추가하지 않음',
                shortcuts='음수 횟수·잘못된 시점의 비·12시간 중복·다른 정수해를 독립 검산')


for no in [10,11,12]:
    for original in [x for x in legacy if x['sourceNo']==no][:5]:
        x = copy.deepcopy(original)
        x.update(practiceLevel='low',sourcePointBand=x['pointBand'],preservedApprovedId=x['id'],
                 practiceRole='원문 수준 연습',practiceStorageVersion=version,
                 levelReview=dict(basis='source-point-band',relation='source-benchmark',measured=False,preservedItem=True))
        items.append(x)


def add(no,level,params,text,answers,steps,labels,focus,method):
    n=1+sum(x['sourceNo']==no and x['practiceLevel']==level for x in items)
    source=next(x for x in legacy if x['sourceNo']==no)
    x={k:copy.deepcopy(source[k])for k in ['area','subarea','detailType','learningLocation']}
    x.update(id=f'applied1-q{no:02d}-{level}-v{n}',genId=f'applied1-q{no:02d}',
             sourceSet='applied',sourceRound=1,sourceNo=no,variantNo=n,
             reviewStatus='pending-output-review',practiceLevel=level,sourcePointBand=source['pointBand'],
             pointBand=dict(middle='3.4',high='4.2')[level],practiceRole='단계형 확장',practiceStorageVersion=version,
             text=text,answer=', '.join(map(str,answers)),answerParts=answers,answerLabels=labels,
             acceptedAnswers=[', '.join(map(str,answers))],answerContract='ordered-parts',
             solutionSteps=steps,solution=' '.join(steps),learningPoint=focus,
             difficultyEvidence=dict(basis='designed-practice-point-band',label=dict(middle='중',high='상')[level],
                                     sourceReasoningPreserved=False,measuredVariantRate=None),
             levelReview=dict(basis='explicit-levelled-extension',relation='extension',measured=False,axes=axes(no,level)),
             verification=dict(primaryMethod=method,parameters=params,
                               independentSuite='qa/applied1-balanced15-independent-validate.py',
                               sourceExamPage=2,sourceAnswerPage=no,studentDifficultyMeasured=False))
    assert len(steps)>=3
    items.append(x)


def frac(p,q):
    return f'<math xmlns="http://www.w3.org/1998/Math/MathML"><mfrac><mn>{p}</mn><mn>{q}</mn></mfrac></math>'


for teacher,me,brother,sister,years in [(35,9,6,11,6),(38,10,7,13,5),(40,11,8,14,7),(42,12,9,16,6),(45,10,6,13,8)]:
    S=teacher+me;F=S+brother+sister+4*years;g=sister-brother;D=teacher-sister
    ratio=Fraction(brother+years,me+years);p,q=ratio.numerator,ratio.denominator
    K=S-D-g;R=(F-S-g)//2
    calculated=Fraction((p+q)*R-p*K,3*p+q)
    assert calculated==years and R-2*years==brother
    add(10,'middle',dict(presentSum=S,futureTotal=F,gap=g,ratio=[p,q],teacherSisterDifference=D),
        f'지금 선생님과 내 나이의 합은 {S}살입니다. 언니는 내 동생보다 {g}살 많고, 선생님은 언니보다 {D}살 많습니다. 몇 년이 지난 뒤 네 사람의 나이의 합이 {F}살이 되었을 때, 그때 동생의 나이는 그때 내 나이의 {frac(p,q)}입니다. 지금 선생님은 몇 살입니까?',
        [teacher],
        [f'지금 선생님은 동생보다 {D}＋{g}＝{D+g}살 많습니다. 그러므로 지금 나와 동생의 나이의 합은 {S}−{D+g}＝{K}살입니다.',
         f'동생의 현재 나이를 □살, 지난 연수를 △년이라 하면 미래 전체 합에서 {S}살과 언니/동생 차 {g}살을 빼어 2×□＋4×△＝{F-S-g}를 얻습니다. 따라서 □＋2×△＝{R}입니다.',
         f'미래 나와 동생의 합은 {K}＋2×△살이고, 미래 동생은 □＋△＝{R}−△살입니다. 미래 비에 따라 {p+q}×({R}−△)＝{p}×({K}＋2×△)입니다.',
         f'정리하면 {3*p+q}×△＝{(p+q)*R-p*K}여서 △＝{years}년, 동생은 {R}−2×{years}＝{brother}살입니다. 따라서 선생님은 {brother}＋{D+g}＝{teacher}살입니다.',
         f'현재 네 나이는 선생님{teacher}·나{me}·언니{sister}·동생{brother}살입니다. {years}년 뒤 합{F}살과 동생/나의 비 {brother+years}/{me+years}를 모두 만족합니다.'],
        ['선생님의 현재 나이'],'현재 나이 차를 연결한 뒤 미래까지 지난 연수와 나이를 함께 역산',
        'two age sums and future ratio with unknown elapsed years')

for teacher,me,brother,sister,years in [(33,9,6,11,7),(36,10,8,12,5),(39,11,8,13,6),(44,9,7,11,6),(32,11,9,16,8)]:
    S=teacher+me;F=S+brother+sister+4*years;g=sister-brother;k=teacher//sister
    ratio=Fraction(brother+years,me+years);p,q=ratio.numerator,ratio.denominator
    R=(F-S-g)//2;co=q+p*k;target=p*(S-k*g);den=q+p*(2*k+1)
    assert Fraction(co*R-target,den)==years
    add(10,'high',dict(presentSum=S,futureTotal=F,gap=g,ratio=[p,q],teacherSisterMultiple=k),
        f'지금 선생님과 내 나이의 합은 {S}살이고, 선생님의 나이는 언니 나이의 {k}배입니다. 언니는 내 동생보다 {g}살 많습니다. 몇 년이 지난 뒤 네 사람의 나이의 합이 {F}살이 되었을 때, 그때 동생의 나이는 그때 내 나이의 {frac(p,q)}입니다. 지금 선생님은 몇 살입니까?',
        [teacher],
        [f'동생의 현재 나이를 □살, 지난 연수를 △년이라 합니다. 언니는 □＋{g}살, 선생님은 {k}×□＋{k*g}살, 나는 {S-k*g}−{k}×□살입니다.',
         f'미래 전체 합은 현재 선생님과 나의 합{S}에 언니/동생의 합2×□＋{g}, 네 사람이 늘어난 나이4×△를 더한 값입니다. 따라서 □＋2×△＝({F}−{S}−{g})÷2＝{R}입니다.',
         f'미래 나이 비에 따라 {q}×(□＋△)＝{p}×({S-k*g}−{k}×□＋△)입니다. 정리하면 {co}×□＋{q-p}×△＝{target}입니다.',
         f'□＝{R}−2×△를 넣으면 {den}×△＝{co*R-target}여서 △＝{years}년, □＝{brother}살입니다. 선생님의 현재 나이는 {k}×({brother}＋{g})＝{teacher}살입니다.',
         f'현재 네 나이 {teacher}·{me}·{sister}·{brother}살과 {years}년 뒤 나이를 대조하면 주어진 두 합과 현재 배수, 미래 비가 모두 맞습니다. 현재의 배수 관계를 미래 나이에 그대로 적용하지 않습니다.'],
        ['선생님의 현재 나이'],'현재의 배수 관계와 미래의 나이 비를 구분하여 두 미지수를 역산',
        'current multiplicative age relation and future ratio with unknown years')


for forward,backward,white,black in [(7,3,11,7),(8,3,12,7),(6,4,13,8),(9,2,10,6),(8,5,14,9)]:
    end=forward*white-backward*black;delta=white-black
    add(11,'middle',dict(forward=forward,backward=backward,end=end,whiteExcess=delta),
        f'앞뒤로 충분히 이어진 말판의 0번 칸에 말을 놓았습니다. 주머니에서 공을 한 개씩 꺼내어 흰 공이면 앞으로 {forward}칸, 검은 공이면 뒤로 {backward}칸 움직인 뒤 공을 다시 넣습니다. 흰 공이 검은 공보다 {delta}번 더 나왔고 말이 {end}번 칸에 도착했다면, 흰 공과 검은 공은 각각 몇 번 나왔습니까?',
        [white,black],
        [f'흰 공과 검은 공을 한 번씩 짝지으면 앞으로 {forward}−{backward}＝{forward-backward}칸 움직입니다.',
         f'짝을 이루지 않는 흰 공 {delta}번은 앞으로 {forward}×{delta}＝{forward*delta}칸 움직입니다. 따라서 짝지은 공들로 움직인 거리는 {end}−{forward*delta}＝{end-forward*delta}칸입니다.',
         f'흰 공과 검은 공의 짝은 {end-forward*delta}÷{forward-backward}＝{black}쌍이므로 검은 공은 {black}번, 흰 공은 {black}＋{delta}＝{white}번입니다.',
         f'{forward}×{white}−{backward}×{black}＝{end}이며, 흰 공과 검은 공 횟수의 차도 {delta}번으로 맞습니다.'],
        ['흰 공 횟수','검은 공 횟수'],'동수의 두 색을 짝지은 이동과 더 나온 흰 공의 이동을 나누어 역산',
        'paired displacements plus excess forward events')

for n1,n2,a1,b1,a2,b2,w1,w2 in [(12,10,7,3,5,2,8,6),(13,11,8,3,6,2,9,6),(14,12,6,4,8,3,10,7),(15,13,9,2,5,4,11,8),(16,14,8,5,6,3,12,9)]:
    assert a1+b1!=a2+b2,'Keep the two stages mathematically distinct.'
    black1=n1-w1;black2=n2-w2;end=a1*w1-b1*black1+a2*w2-b2*black2;diff=w1-w2
    coefficient=a1+b1+a2+b2;backward_total=b1*n1+b2*n2
    assert (end+backward_total-(a1+b1)*diff)//coefficient==w2
    add(11,'high',dict(firstDraws=n1,secondDraws=n2,firstForward=a1,firstBackward=b1,secondForward=a2,secondBackward=b2,end=end,firstWhiteExcess=diff),
        f'앞뒤로 충분히 이어진 말판의 0번 칸에서 출발합니다. 공은 매번 주머니에서 한 개씩 꺼내어 확인한 뒤 다시 넣습니다. 처음 {n1}번은 흰 공이면 앞으로 {a1}칸, 검은 공이면 뒤로 {b1}칸 움직였습니다. 이어서 {n2}번은 흰 공이면 앞으로 {a2}칸, 검은 공이면 뒤로 {b2}칸 움직였습니다. 처음 단계에서 흰 공이 나왔던 횟수는 나중 단계보다 {diff}번 많고, 마지막에 말은 {end}번 칸에 있었습니다. 각 단계에서 흰 공은 몇 번씩 나왔습니까?',
        [w1,w2],
        [f'나중 단계의 흰 공 횟수를 □번이라 하면 처음 단계는 □＋{diff}번입니다. 검은 공 횟수는 처음 {n1}−(□＋{diff})번, 나중 {n2}−□번입니다.',
         f'모두 검은 공이었다면 처음은 뒤로 {b1}×{n1}＝{b1*n1}칸, 나중은 뒤로 {b2}×{n2}＝{b2*n2}칸 움직입니다. 따라서 실제 위치에 도달하려면 이 경우보다 앞으로 {end}＋{backward_total}＝{end+backward_total}칸 더 가야 합니다.',
         f'검은 공 한 번을 흰 공으로 바꾸면 처음 단계에서는 {a1+b1}칸, 나중 단계에서는 {a2+b2}칸 더 앞으로 갑니다. 그러므로 {a1+b1}×(□＋{diff})＋{a2+b2}×□＝{end+backward_total}입니다.',
         f'정리하면 {coefficient}×□＝{end+backward_total}−{(a1+b1)*diff}＝{coefficient*w2}여서 □＝{w2}번입니다. 처음 단계의 흰 공은 {w2}＋{diff}＝{w1}번입니다.',
         f'실제로 처음은 {a1}×{w1}−{b1}×{black1}＝{a1*w1-b1*black1}칸, 나중은 {a2}×{w2}−{b2}×{black2}＝{a2*w2-b2*black2}칸 이동하여 합이 {end}칸입니다.'],
        ['처음 단계 흰 공 횟수','나중 단계 흰 공 횟수'],'각 단계의 이동을 따로 나타낸 뒤 흰 공 횟수 차와 최종 위치로 연결',
        'two displacement rules joined by a count difference')


def time_label(minutes):
    return ('오전' if minutes<720 else '오후')+f' {minutes//60%12 or 12}시 {minutes%60}분'


for start,observed,r1,r2 in [(510,930,2,4),(480,960,3,6),(450,900,4,8),(540,990,2,6),(420,1020,6,4)]:
    later=Fraction((observed-720)*r2,60);earlier=Fraction((720-start)*r1,60)
    assert later.denominator==earlier.denominator==1
    lag=int(later+earlier);display=observed-lag
    add(12,'middle',dict(changeAt=720,beforeRate=r1,afterRate=r2,observed=observed,display=display),
        f'어느 날 오전에 고장 난 시계를 정확하게 맞추었습니다. 이 시계는 실제 정오 전에는 실제 1시간에 {r1}분씩 늦어지고, 정오부터는 실제 1시간에 {r2}분씩 늦어졌습니다. 그날 실제 시각이 {time_label(observed)}일 때 시계는 {time_label(display)}을 가리켰습니다. 오전 몇 시 몇 분에 시계를 맞추었습니까?',
        [start//60,start%60],
        [f'관측한 순간의 전체 지연은 실제 시각과 표시 시각의 차인 {lag}분입니다.',
         f'실제 정오부터 관측까지는 {observed-720}분입니다. 이 구간의 지연은 {r2}×{observed-720}÷60＝{int(later)}분입니다.',
         f'따라서 정오 전 구간에서 생긴 지연은 {lag}−{int(later)}＝{int(earlier)}분이고, 이 구간의 실제 경과 시간은 {int(earlier)}×60÷{r1}＝{720-start}분입니다.',
         f'정오에서 {720-start}분을 거슬러 가면 {time_label(start)}입니다. 오전 지연{int(earlier)}분과 오후 지연{int(later)}분을 더하면 관측한 지연{lag}분과 같습니다.'],
        ['오전 시','분'],'정오 전후의 지연을 분리하고 각 구간에서 실제로 지난 시간 역산',
        'subtract known afternoon drift then invert morning drift')

for start,elapsed,slow,fast in [(555,360,4,6),(520,420,2,5),(480,450,6,4),(570,360,5,3),(510,480,3,7)]:
    actual=start+elapsed;loss=Fraction(elapsed*slow,60);gain=Fraction(elapsed*fast,60)
    assert loss.denominator==gain.denominator==1
    sr=actual-int(loss);fr=actual+int(gain);gap=fr-sr
    add(12,'high',dict(slowRate=slow,fastRate=fast,slowDisplay=sr,fastDisplay=fr,actualObservationRange=[720,1439]),
        f'어느 날 오전 같은 순간에 두 시계를 정확하게 맞추었습니다. 느린 시계는 실제 1시간에 {slow}분씩 늦어지고, 빠른 시계는 실제 1시간에 {fast}분씩 빨라집니다. 그날 오후 같은 순간에 보니 느린 시계는 {sr//60}시 {sr%60}분, 빠른 시계는 {fr//60}시 {fr%60}분을 가리켰습니다. 두 시계는 시각을 24시간제로 나타냅니다. 오전 몇 시 몇 분에 두 시계를 맞추었습니까?',
        [start//60,start%60],
        [f'두 표시의 차는 {gap}분입니다. 실제 1시간이 지날 때 느린 시계와 빠른 시계의 차는 {slow}＋{fast}＝{slow+fast}분씩 벌어집니다.',
         f'따라서 맞춘 뒤 실제로 지난 시간은 {gap}×60÷{slow+fast}＝{elapsed}분입니다.',
         f'이 동안 느린 시계의 지연은 {slow}×{elapsed}÷60＝{int(loss)}분입니다. 실제 관측 시각은 느린 표시{sr//60}시 {sr%60}분보다 {int(loss)}분 뒤인 {actual//60}시 {actual%60}분입니다.',
         f'실제 관측 시각에서 {elapsed}분을 빼면 {time_label(start)}입니다. 빠른 시계도 실제보다 {fast}×{elapsed}÷60＝{int(gain)}분 앞서므로 표시가{fr//60}시 {fr%60}분으로 맞습니다.'],
        ['오전 시','분'],'두 시계의 표시 차로 경과 시간을 찾은 뒤 한 시계의 오차를 바로잡기',
        'relative clock drift then actual observation and common start')

for no in range(1,13):
    assert collections.Counter(x['practiceLevel']for x in items if x['sourceNo']==no)==dict(low=5,middle=5,high=5)
assert len(items)==len({x['id']for x in items})==180
assert len({x['text']+'\n'+str(x.get('promptDataLines',''))for x in items})==180
for original in old_items:
    assert next(x for x in items if x['id']==original['id'])==original
data.update(version=version,availableSourceNos=list(range(1,13)),pendingSourceNos=list(range(13,31)),
            preservedLegacyCount=50,newAuthoredCount=130)
data.pop('reviewSummary',None)
FILE.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
print('Added45:30 new and15 preserved; total180 in twelve5/5/5 groups; original135 unchanged.')
