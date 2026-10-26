#!/usr/bin/env python3
"""Extend Applied 9 with text/data-based variants for source items 13-17."""
import itertools
import json
from fractions import Fraction
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "bank/data/applied9-expanded.json"
INDEX = ROOT / "bank/data/applied9-expanded-index.json"
SOURCE_HASH = "0e32749d028cdcacd9e61d2b1d1cb5080266ac672a9a3ed17503270a74142794"
ANSWER_HASH = "a6648f008a8e7ba7012913ede0cbad488aec782eaa06818a97acfb6900ac8d62"
ANSWER_DRIVE_ID = "1M7rJHVE11w4BZF5OHjZegDLcGGlmxKp4"
POINT = "3.4"
SETS13 = [(1,2,3,4),(1,2,3,6),(1,2,3,8),(1,2,4,6),(1,3,4,6),
          (1,3,4,8),(1,3,6,8),(1,4,6,8),(3,4,6,8)]
PARAMS14 = [(60,2,18,12),(80,3,25,17),(120,5,31,22),(150,2,42,35),
            (90,5,28,19),(140,3,33,26),(180,8,40,29),(200,4,52,38),(250,4,61,50)]
INDICES15 = [20,23,28,33,39,45,55,65,78]
ROUTES16 = [
    (1,6,15,20,5,8,10,10),(1,5,12,18,4,7,9,8),(1,7,14,19,6,9,11,7),
    (1,4,11,17,5,6,10,9),(1,8,16,22,4,8,12,6),(1,6,13,18,7,9,10,5),
    (1,5,14,21,6,8,11,4),(1,9,17,23,5,7,9,3),(1,7,15,24,4,6,8,2),
]
AGES17 = [
    (77,4,7,20,10,7),(78,7,6,24,8,5),(81,8,3,21,7,11),
    (82,9,2,27,9,4),(85,3,5,32,4,11),(88,3,8,44,11,5),
    (91,3,7,35,7,6),(92,7,4,49,7,10),(96,5,6,48,8,7),
]


def common(no, variant, subarea, detail, text, answer, parts, steps, point):
    labels = {13:"짝수 결과의 합",14:"처음 A주머니의 구슬 수",15:"분수",16:"걸린 시간",17:"나이 차"}
    return {
        "id":f"applied9-q{no:02}-v{variant}","genId":f"applied9-q{no:02}",
        "sourceSet":"applied","sourceRound":9,"sourceNo":no,"variantNo":variant,
        "reviewStatus":"verified","area":"수와 식" if no in (13,14,15,16) else "지문 이해",
        "subarea":subarea,"detailType":detail,"pointBand":POINT,"text":text,
        "answer":str(answer),"answerParts":parts,"answerLabels":[labels[no]],
        "acceptedAnswers":[str(answer)],"answerContract":"single-number",
        "solutionSteps":steps,"solution":" ".join(steps),
        "learningPoint":{
            13:"식의 자리에 서로 다른 수를 놓고 조건을 만족하는 계산 결과를 빠짐없이 찾기",
            14:"옮긴 구슬 수를 반영해 두 주머니의 마지막 수량 관계를 식으로 만들기",
            15:"삼각수로 분수 묶음과 묶음 안의 순서를 찾아 항을 계산하기",
            16:"구간별 층수와 층당 시간을 합하고 도착 전 휴식 횟수를 세기",
            17:"나이 조건을 나눗셈의 나머지 조건으로 바꾸어 가능한 나이를 좁히기",
        }[no],
        "learningLocation":f"활용 9회 · 원문 {no}번 · {detail}",
        "verification":{"primaryMethod":"각 매개변수로 조건식을 세워 답을 계산한다.",
            "independentMethod":"생성한 답을 원래 상황에 대입해 모든 조건과 답의 유일성을 다시 확인한다.",
            "parameters":point,"independentSuite":"qa/build-applied9-q13-q17.py",
            "sourceExamPage":3,"sourceExamFile":"초등과정 대비 실전 모의고사 활용 9회.pdf",
            "sourceExamSha256":SOURCE_HASH,"sourceAnswerPage":3,
            "sourceAnswerFile":"초등과정 대비 실전 모의고사 특강 9회 답안.pdf",
            "sourceAnswerDriveId":ANSWER_DRIVE_ID,"sourceAnswerSha256":ANSWER_HASH,
            "officialAnswerStatus":"Candidate answer PDF page 3 visually matches the source page and its handwritten answer agrees with independent calculation. Exact edition identity beyond matching page 3 is unconfirmed.",
            "sourceDrawingCompared":False,"sourceDrawingPresent":no in (13,17),
            "variantUsesSourceDrawing":False,"studentDifficultyMeasured":False},
        "difficultyEvidence":{"basis":"source-point-band","label":"중",
            "sourceReasoningPreserved":True,"measuredVariantRate":None,"estimated":False,
            "rationale":"활용 9회 원문 13~22번의 3.4점 배점대다. 활용 난도는 배점대만 적용한다."}
    }


def q13():
    out=[]
    for i,digits in enumerate(SETS13,1):
        vals=sorted({a*b-c+d for a,b,c,d in itertools.permutations(digits)
                     if (a*b-c+d)%2==0 and a*b-c+d>0})
        ans=sum(vals)
        text=(f"빈칸 네 곳에 {', '.join(map(str,digits))}을 한 번씩 모두 써 넣어 식 {('□×□−□+□')}를 만듭니다. "
              "계산 결과가 짝수인 식에서 서로 다른 계산 결과를 모두 더하시오.")
        steps=[f"네 수를 식 □×□−□+□의 자리에 한 번씩 놓고 짝수인 계산 결과를 찾으면 서로 다른 값은 {', '.join(map(str,vals))}입니다.",
               f"같은 계산 결과가 여러 식에서 나오는 경우 한 번만 더합니다.",
               f"따라서 합은 {' + '.join(map(str,vals))}={ans}입니다.",
               f"전체 24가지 자리 배치를 다시 검사해 짝수 결과의 집합이 {vals}임을 확인했습니다."]
        out.append(common(13,i,"연산식 만들기","네 수의 곱셈·뺄셈·덧셈에서 서로 다른 짝수 결과의 합",text,ans,[ans],steps,
                          {"digits":digits,"evenDistinctResults":vals,"answer":ans}))
    assert len({x['answer'] for x in out})==9
    return out


def q14():
    out=[]
    for i,(total,k,u,v) in enumerate(PARAMS14,1):
        a=k*total//(k+1)+u-v
        b=total-a
        after_a,after_b=a-u,b+u
        final_a,final_b=after_a+v,after_b-v
        assert k*total%(k+1)==0 and a>=u and after_b>=v and final_a==k*final_b
        text=(f"A, B 두 주머니에 들어 있는 구슬을 모두 더하면 {total}개입니다. A주머니에서 구슬 {u}개를 B주머니에 넣고, "
              f"다시 B주머니에서 {v}개를 A주머니에 넣었더니 A주머니의 구슬 수는 B주머니의 {k}배가 되었습니다. "
              "처음 A주머니에 들어 있던 구슬은 몇 개입니까?")
        steps=[f"처음 A주머니에 있던 구슬 수를 x개라 두면 B주머니에는 {total}−x개가 있습니다.",
               f"두 번 옮긴 뒤 A에는 x−{u}+{v}개, B에는 {total}−x+{u}−{v}개가 있습니다.",
               f"마지막에 A가 B의 {k}배이므로 x−{u}+{v}={k}({total}−x+{u}−{v})이고, 이를 풀면 x={a}입니다.",
               f"확인: 처음에는 A {a}개, B {b}개입니다. 옮긴 뒤 A {after_a}개, B {after_b}개이고, 다시 옮기면 A {final_a}개, B {final_b}개로 A는 B의 {k}배입니다."]
        out.append(common(14,i,"수량 변화와 식","두 주머니 사이에서 순서대로 옮긴 뒤의 배수 관계",text,a,[a],steps,
                          {"total":total,"ratio":k,"firstTransfer":u,"secondTransfer":v,"initialA":a,"initialB":b,
                           "finalA":final_a,"finalB":final_b,"answer":a}))
    assert len({x['answer'] for x in out})==9
    return out


def q15():
    out=[]
    for i,nth in enumerate(INDICES15,1):
        group=next(n for n in range(1,100) if n*(n+1)//2>=nth)
        pos=nth-(group-1)*group//2
        ans=Fraction(pos,2*group-pos+1)
        text=f"1/2; 1/4, 2/3; 1/6, 2/5, 3/4; … 와 같은 규칙으로 분수를 늘어놓았습니다. {nth}번째 분수를 구하시오."
        steps=[f"n번째 묶음까지 분수는 1+2+…+n=n(n+1)/2개입니다. {nth}번째 항은 {group}번째 묶음에 있습니다.",
               f"앞 묶음에는 {((group-1)*group//2)}개가 있으므로 이 묶음의 {pos}번째입니다.",
               f"각 묶음에서는 분자의 순서대로 {pos}번째 분수가 {pos}/{2*group-pos+1}입니다.",
               f"약분한 값은 {ans.numerator}/{ans.denominator}입니다."]
        out.append(common(15,i,"규칙 수열과 분수","삼각수 묶음에서 순서에 해당하는 분수 찾기",text,f"{ans.numerator}/{ans.denominator}",
                          [f"{ans.numerator}/{ans.denominator}"],steps,{"termIndex":nth,"group":group,"position":pos,
                          "fractionNumerator":ans.numerator,"fractionDenominator":ans.denominator,
                          "answer":f"{ans.numerator}/{ans.denominator}"}))
    assert len({x['answer'] for x in out})==9
    return out


def q16():
    out=[]
    for i,(start,a,b,end,r1,r2,r3,rest) in enumerate(ROUTES16,1):
        d1,d2,d3=a-start,b-a,end-b
        climbs=d1*r1+d2*r2+d3*r3
        rests=(end-start-1)*rest
        seconds=climbs+rests
        mins,sec=divmod(seconds,60)
        assert min(d1,d2,d3)>0
        text=(f"1층에서 {end}층까지 계단을 올라가려 합니다. {start}층에서 {a}층까지는 한 층을 올라가는 데 {r1}초, "
              f"{a}층에서 {b}층까지는 한 층에 {r2}초, {b}층에서 {end}층까지는 한 층에 {r3}초 걸립니다. "
              f"한 층을 올라갈 때마다 {rest}초씩 쉬고 {start}층에서 출발할 때, {end}층에 도착할 때까지 걸린 시간은 몇 분 몇 초입니까?")
        # The source starts at floor 1; support different lower endpoints via route segment values while retaining the ascent model.
        text=(f"1층에서 {end}층까지 계단을 올라갑니다. 1층에서 {a}층까지는 한 층을 올라가는 데 {r1}초, "
              f"{a}층에서 {b}층까지는 한 층에 {r2}초, {b}층에서 {end}층까지는 한 층에 {r3}초 걸립니다. "
              f"한 층을 올라갈 때마다 {rest}초씩 쉬고, 도착한 뒤에는 쉬지 않습니다. 걸린 시간은 몇 분 몇 초입니까?")
        steps=[f"구간별로 올라간 층수는 {d1}층, {d2}층, {d3}층입니다.",
               f"계단을 오르는 시간은 {d1}×{r1}+{d2}×{r2}+{d3}×{r3}={climbs}초입니다.",
               f"1층부터 {end}층까지는 {end-1}층을 오르므로 도착 전 휴식은 {end-2}번, {end-2}×{rest}={rests}초입니다.",
               f"모두 {climbs}+{rests}={seconds}초이므로 {mins}분 {sec}초입니다."]
        out.append(common(16,i,"시간 계산","층별 속도와 층마다 쉬는 시간을 합산하기",text,f"{mins}분 {sec}초",[f"{mins}분 {sec}초"],steps,
                          {"checkpoints":[1,a,b,end],"secondsPerFloor":[r1,r2,r3],"restSeconds":rest,
                           "climbSeconds":climbs,"restCount":end-2,"restTotalSeconds":rests,"totalSeconds":seconds,
                           "answerMinutes":mins,"answerSeconds":sec}))
    assert len({x['answer'] for x in out})==9
    return out


def q17():
    out=[]
    for i,(g,ga,gb,p,pa,pb) in enumerate(AGES17,1):
        gposs=[x for x in range(71,100) if (x-1)%ga==0 and x%gb==0]
        pposs=[x for x in range(1,60) if x%pa==0 and (x+1)%pb==0]
        assert gposs==[g] and pposs==[p]
        ans=g-p
        text=(f"할아버지 나이는 70살보다 많고 100살보다 적습니다. 작년 나이는 {ga}로 나누어떨어졌고, 올해 나이는 {gb}로 나누어떨어집니다. "
              f"아빠 나이는 60살보다 적습니다. 올해 나이는 {pa}로 나누어떨어지고, 내년 나이는 {pb}로 나누어떨어집니다. "
              "할아버지와 아빠의 나이 차이는 몇 살입니까?")
        steps=[f"할아버지의 올해 나이는 71~99살입니다. 작년 나이가 {ga}의 배수이고 올해 나이가 {gb}의 배수인 수를 이 범위에서 찾으면 {g}살뿐입니다.",
               f"아빠의 올해 나이는 1~59살입니다. 올해 나이가 {pa}의 배수이고 내년 나이가 {pb}의 배수인 수를 찾으면 {p}살뿐입니다.",
               f"두 나이의 차이는 {g}−{p}={ans}살입니다.",
               f"두 범위를 모두 전수 확인해 조건을 만족하는 나이가 각각 {g}살과 {p}살 하나뿐임을 확인했습니다."]
        out.append(common(17,i,"나이와 배수 조건 추론","작년·올해·내년 나이의 배수 조건으로 나이 차 구하기",text,ans,[ans],steps,
                          {"grandfatherAge":g,"grandfatherLastYearDivisor":ga,"grandfatherThisYearDivisor":gb,
                           "fatherAge":p,"fatherThisYearDivisor":pa,"fatherNextYearDivisor":pb,
                           "grandfatherCandidates":gposs,"fatherCandidates":pposs,"answer":ans}))
    assert len({x['answer'] for x in out})==9
    return out


def main():
    data=json.loads(DATA.read_text())
    idx=json.loads(INDEX.read_text())
    prior=[q for q in data['items'] if q['sourceNo'] not in range(13,18)]
    items=prior+q13()+q14()+q15()+q16()+q17()
    items.sort(key=lambda q:(q['sourceNo'],q['variantNo']))
    available=sorted({q['sourceNo'] for q in items})
    pending=[n for n in range(1,31) if n not in available]
    data.update(version="20261025-applied9-q02-q06-q07-q10-q11-q13-q17-q19-q21-q27-q29-q30-r8",itemCount=len(items),
                availableSourceNos=available,pendingSourceNos=pending,items=items)
    idx.update(version=data['version'],itemCount=len(items),availableSourceNos=available,pendingSourceNos=pending)
    idx['items']=[x for x in idx.get('items',[]) if x['sourceNo'] not in range(13,18)]
    for n in range(13,18):
        qs=[q for q in items if q['sourceNo']==n]
        idx['items'].append({"sourceNo":n,"genId":f"applied9-q{n:02}","area":qs[0]['area'],"subarea":qs[0]['subarea'],
             "detailType":qs[0]['detailType'],"pointBand":POINT,"reviewStatus":"verified","variantCount":len(qs)})
    idx['items'].sort(key=lambda q:q['sourceNo'])
    DATA.write_text(json.dumps(data,ensure_ascii=False,indent=2)+"\n")
    INDEX.write_text(json.dumps(idx,ensure_ascii=False,indent=2)+"\n")
    for n in range(13,18):
        qs=[q for q in items if q['sourceNo']==n]
        assert len(qs)==9 and len({q['answer'] for q in qs})==9
        assert all(q['pointBand']==POINT and len(q['solutionSteps'])>=4 for q in qs)
    print(f"Applied9 Q13-Q17 validated: {len(items)} total variants; added 45; pending {pending}.")


if __name__=="__main__":
    main()
