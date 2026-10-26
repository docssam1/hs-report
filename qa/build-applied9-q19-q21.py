#!/usr/bin/env python3
"""Build text-only Applied 9 Q19 and Q21 variants from verified parameters."""
import itertools, json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
DATA=ROOT/'bank/data/applied9-expanded.json'
INDEX=ROOT/'bank/data/applied9-expanded-index.json'
DIVISORS=[10,12,14,15,16,21,23,24,29]
TARGETS=[78,80,82,84,86,88,90,92,94]
SOURCE_HASH='0e32749d028cdcacd9e61d2b1d1cb5080266ac672a9a3ed17503270a74142794'
ANSWER_HASH='a6648f008a8e7ba7012913ede0cbad488aec782eaa06818a97acfb6900ac8d62'
ANSWER_ID='1M7rJHVE11w4BZF5OHjZegDLcGGlmxKp4'


def base(no,i,subarea,detail,text,answer,steps,params,learning,method):
    return {'id':f'applied9-q{no:02}-v{i}','genId':f'applied9-q{no:02}','sourceSet':'applied',
        'sourceRound':9,'sourceNo':no,'variantNo':i,'reviewStatus':'verified','area':'경우의 수' if no==21 else '수와 식',
        'subarea':subarea,'detailType':detail,'pointBand':'3.4','text':text,'answer':str(answer),
        'answerParts':[answer],'answerLabels':['답'],'acceptedAnswers':[str(answer)],'answerContract':'single-number',
        'solutionSteps':steps,'solution':' '.join(steps),'learningPoint':learning,
        'learningLocation':f'활용 9회 · 원문 {no}번 · {detail}',
        'verification':{'primaryMethod':method,'independentMethod':'모든 허용 입력값을 별도로 전수 계산해 최댓값/조건을 만족하는 경우의 수를 확인한다.',
          'parameters':params,'independentSuite':'qa/build-applied9-q19-q21.py','sourceExamPage':4,
          'sourceExamFile':'초등과정 대비 실전 모의고사 활용 9회.pdf','sourceExamSha256':SOURCE_HASH,
          'sourceAnswerPage':4,'sourceAnswerFile':'초등과정 대비 실전 모의고사 특강 9회 답안.pdf',
          'sourceAnswerDriveId':ANSWER_ID,'sourceAnswerSha256':ANSWER_HASH,
          'officialAnswerStatus':('Candidate answer page 4 writes 985 for source Q19; independent calculation confirms it. Exact edition identity beyond the matching page is unconfirmed.' if no==19 else 'Candidate answer page 4 writes 14, but exhaustive enumeration of the printed expression gives 12. No authoritative correction is available. Original score/key is unchanged; the new variants are solved independently.'),
          'sourceDrawingCompared':False,'sourceDrawingPresent':False,'variantUsesSourceDrawing':False,'studentDifficultyMeasured':False},
        'difficultyEvidence':{'basis':'source-point-band','label':'중','sourceReasoningPreserved':True,
          'measuredVariantRate':None,'estimated':False,
          'rationale':'활용 9회 원문 13~22번의 3.4점 배점대다. 활용 난도는 배점대만 적용한다.'}}


def q19():
    out=[]
    for i,d in enumerate(DIVISORS,1):
        rows=[(n//d+n%d,n,n//d,n%d) for n in range(100,1000)]
        best=max(r[0] for r in rows)
        tops=[r for r in rows if r[0]==best]
        assert len(tops)==1
        _,n,q,r=tops[0]
        text=f'어떤 세 자리 수를 {d}로 나누려고 합니다. 몫과 나머지의 합이 가장 큰 경우의 세 자리 수를 구하시오.'
        steps=[f'세 자리 수를 {d}로 나눈 몫을 q, 나머지를 r이라 하면 수는 {d}q+r이고 0≤r<{d}입니다.',
               f'세 자리 수 100부터 999까지 각각을 {d}로 나누어 q+r을 비교하면 최댓값은 {best}이며, 이를 만드는 수는 {n} 하나입니다.',
               f'{n}={d}×{q}+{r}이므로 몫은 {q}, 나머지는 {r}이고 합은 {q}+{r}={best}입니다.',
               f'확인: {d}×{q}+{r}={n}은 세 자리 수이고, 전수 비교에서 더 큰 몫과 나머지의 합은 없습니다.']
        out.append(base(19,i,'나눗셈과 나머지','세 자리 수에서 몫과 나머지의 합이 최대인 수 찾기',text,n,steps,
          {'divisor':d,'quotient':q,'remainder':r,'maximumSum':best,'maximizingThreeDigitNumber':n,'maximizerCount':1},
          '나눗셈을 몫과 나머지의 식으로 나타내고 가능한 수를 비교해 최댓값 찾기',
          '세 자리 수 900개를 각각 몫·나머지로 분해해 몫과 나머지의 합을 비교한다.'))
    assert len({x['answer'] for x in out})==9
    return out


def q21():
    out=[]
    all_plus=100+sum(range(1,9))
    for i,target in enumerate(TARGETS,1):
        diff=all_plus-target
        assert diff%2==0
        needed=diff//2
        groups=[c for k in range(9) for c in itertools.combinations(range(1,9),k) if sum(c)==needed]
        count=len(groups)
        subtext='; '.join('{' + ','.join(map(str,c)) + '}' for c in groups)
        text=f'식 100○1○2○3○4○5○6○7○8={target}이 성립하도록 빈칸마다 + 또는 −를 하나씩 넣는 방법은 모두 몇 가지입니까?'
        steps=[f'모두 +를 넣으면 100+1+2+3+4+5+6+7+8={all_plus}입니다.',
               f'{target}로 만들려면 더하기 대신 빼기로 바꾼 수들의 합이 ({all_plus}−{target})÷2={needed}이어야 합니다.',
               f'1부터 8까지에서 합이 {needed}인 부분집합은 {subtext}입니다.',
               f'부분집합 하나마다 부호 배치가 하나씩 정해지므로 방법은 {count}가지입니다.']
        out.append(base(21,i,'부호 배열의 경우의 수','정해진 합을 만드는 빼기 항의 선택 수',text,count,steps,
          {'target':target,'allPlusTotal':all_plus,'negativeSubsetSum':needed,'negativeSubsets':[list(c) for c in groups],
           'answerCount':count},'모두 더한 합과 목표값의 차이를 이용해 빼기 항들의 합을 정하고 경우를 센다.',
          '1~8의 모든 부호 배치를 독립 열거하고 목표값을 만드는 음수 항 집합을 센다.'))
    assert len({x['answer'] for x in out})==9
    return out


def main():
    data=json.loads(DATA.read_text()); idx=json.loads(INDEX.read_text())
    items=[x for x in data['items'] if x['sourceNo'] not in (19,21)]+q19()+q21()
    items.sort(key=lambda x:(x['sourceNo'],x['variantNo']))
    avail=sorted({x['sourceNo'] for x in items})
    pending=[n for n in range(1,31) if n not in avail]
    data.update(version='20261025-applied9-q02-q06-q07-q10-q11-q13-q17-q19-q21-q27-q29-q30-r8',items=items,
                itemCount=len(items),availableSourceNos=avail,pendingSourceNos=pending)
    data['sourceReview'].setdefault('questionReviews',{})['19']={'candidateAnswer':985,'independentAnswer':985,'status':'matched'}
    data['sourceReview']['questionReviews']['21']={'candidateAnswer':14,'independentAnswer':12,
        'status':'candidate-discrepancy; no authoritative correction; original unchanged'}
    idx.update(version=data['version'],itemCount=len(items),availableSourceNos=avail,pendingSourceNos=pending)
    idx['items']=[x for x in idx['items'] if x['sourceNo'] not in (19,21)]
    for no in (19,21):
        q=next(x for x in items if x['sourceNo']==no)
        idx['items'].append({'sourceNo':no,'genId':f'applied9-q{no:02}','area':q['area'],'subarea':q['subarea'],
          'detailType':q['detailType'],'pointBand':'3.4','reviewStatus':'verified','variantCount':9})
    idx['items'].sort(key=lambda x:x['sourceNo'])
    DATA.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
    INDEX.write_text(json.dumps(idx,ensure_ascii=False,indent=2)+'\n')
    print(f"Applied 9 Q19/Q21: +18 verified variants; integrated {len(items)}; pending {pending}.")


if __name__=='__main__':main()
