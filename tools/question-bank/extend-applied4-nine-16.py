"""Create nine source-faithful variants for Applied4 question16's fixed overlap figure."""
from pathlib import Path
import json,hashlib,shutil,itertools
ROOT=Path(__file__).resolve().parents[2];W=ROOT/'.private-work/nine-expansion-20261024/round4-missing-16';FILE=ROOT/'bank/data/applied4-expanded.json'
data=json.loads(FILE.read_text());old=json.loads((W/'prior-expanded.json').read_text())
assert data==old and len(old['items'])==153 and not any(x['sourceNo']==16 for x in data['items'])
asset=ROOT/'bank/assets/applied4/four-rectangle-overlap-original.png';shutil.copyfile(W/'four-rectangle-overlap-original.png',asset)
sets=[(4,5,7,10,12),(3,5,8,9,12),(1,5,7,10,12),(4,6,7,11,12),(2,6,7,9,11),(3,7,8,10,12),(1,4,8,9,10),(2,3,5,8,12),(1,2,5,9,12)]
region={'22':['left','top','right'],'17':['left','small'],'11':['right','bottom'],'ㄱ':['left','top'],'ㄴ':['top','right'],'ㄷ':['left','right','bottom']}
new=[]
for cards in sets:
 solutions=[]
 for perm in itertools.permutations(cards):
  v=dict(zip(['left','small','top','right','bottom'],perm))
  if v['left']+v['top']+v['right']==22 and v['left']+v['small']==17 and v['right']+v['bottom']==11:solutions.append(v)
 assert len(solutions)==1;v=solutions[0]
 pairs17=sorted({tuple(sorted((a,b))) for a,b in itertools.permutations(cards,2) if a+b==17})
 pairs11=sorted({tuple(sorted((a,b))) for a,b in itertools.permutations(cards,2) if a+b==11})
 assert pairs17 and pairs11
 # Independent pair and five-place permutation solvers must agree on the unique placement.
 pairSolutions=[]
 for a,b in pairs17:
  for left,small in [(a,b),(b,a)]:
   for c,d in pairs11:
    for right,bottom in [(c,d),(d,c)]:
     if len({left,small,right,bottom})<4:continue
     remain=set(cards)-{left,small,right,bottom}
     if len(remain)!=1:continue
     top=remain.pop()
     if left+top+right==22:pairSolutions.append(dict(left=left,small=small,top=top,right=right,bottom=bottom))
 assert pairSolutions==[v]
 answer=2*(v['left']+v['top']+v['right'])+v['bottom'];pairs17s=' 또는 '.join(f'{a}와{b}' for a,b in pairs17);pairs11s=' 또는 '.join(f'{a}와{b}' for a,b in pairs11)
 steps=[f'겹친 부분17에는 왼쪽과 작은 사각형의 수가 더해져 있습니다. 카드 중 합이17인 쌍은 {pairs17s}입니다.',f'겹친 부분11은 오른쪽과 아래 사각형의 합입니다. 카드 중 합이11인 쌍은 {pairs11s}입니다.',f'서로 다른 카드를 한 번씩 쓰고 22가 적힌 겹침도 맞추면 왼쪽{v["left"]}, 작은 사각형{v["small"]}, 위{v["top"]}, 오른쪽{v["right"]}, 아래{v["bottom"]}으로 놓입니다. 다섯 자리 전체를 순열로 확인해 이 배치만 남습니다.',f'ㄱ은{v["left"]}+{v["top"]}, ㄴ은{v["top"]}+{v["right"]}, ㄷ은{v["left"]}+{v["right"]}+{v["bottom"]}입니다. 따라서 ㄱ+ㄴ+ㄷ＝2×({v["left"]}+{v["top"]}+{v["right"]})+{v["bottom"]}＝{answer}입니다.']
 no=len(new)+1
 new.append(dict(id=f'applied4-q16-v{no}',genId='applied4-q16',sourceSet='applied',sourceRound=4,sourceNo=16,variantNo=no,reviewStatus='pending-output-review',practiceStorageVersion='20261024-applied4-new9-r4',area='경우의 수',subarea='조건을 만족하는 배치',detailType='겹친 사각형의 수 합과 카드 배치',pointBand='3.4',text=f'카드 {"·".join(map(str,cards))}의 수를 다섯 사각형에 하나씩 적습니다. 겹친 부분에 적힌 수는 그 부분을 덮는 사각형에 적힌 수의 합입니다. 그림의 조건을 만족할 때 ㄱ+ㄴ+ㄷ은 얼마입니까?',answer=str(answer),answerParts=[answer],answerLabels=['ㄱ+ㄴ+ㄷ'],answerContract='ordered-parts',acceptedAnswers=[str(answer)],solutionSteps=steps,solution=' '.join(steps),learningPoint='겹친 부분별 합을 식으로 바꾸어 카드 배치의 유일해를 찾기',learningLocation='활용 4회 · 원문 16번 · 겹친 사각형의 수 합과 카드 배치',asset=dict(src='assets/applied4/four-rectangle-overlap-original.png',description='원문16번의 다섯 사각형·ㄱㄴㄷ·22·17·11 그대로'),verification=dict(primaryMethod='all 5! card permutations plus independent region-pair enumeration',parameters=dict(cards=list(cards),uniquePlacement=v,pairs17=[list(x) for x in pairs17],pairs11=[list(x) for x in pairs11],regions=region),sourceExamPage=3,sourceAnswerPage=16,sourceFigureSha256=hashlib.sha256(asset.read_bytes()).hexdigest(),independentSuite='qa/applied4-nine-overlaps-independent-validate.py',studentDifficultyMeasured=False),difficultyEvidence=dict(basis='source-point-band',label='중',sourceReasoningPreserved=True,measuredVariantRate=None),levelReview=dict(basis='source-point-band-3.4',measured=False,axes=dict(sourceThought='원본 카드배치와 겹친 영역의 합 조건 유지',conditions='원본의22·17·11과 각 새 다섯 카드 집합',steps='겹친 부분에서 식을 세워 배치와 최종합 계산',representation='원본 PDF 도형·위치·라벨·숫자 그대로',answer='ㄱ+ㄴ+ㄷ 한 값',domain='다섯 개의 서로 다른 자연수 카드',search='5! 전수배치 및 영역쌍 독립열거',load='원본과 같은 다섯 사각형·세 합 조건',measurement='학생 실측 난도 아님'))))
assert len(new)==9 and len({tuple(x['verification']['parameters']['cards']) for x in new})==9
data['items']+=new;data['revision']='20261024-applied4-expansion-r4';data['availableSourceNos']=sorted(data['availableSourceNos']+[16]);data['pendingSourceNos']=[n for n in data['pendingSourceNos'] if n!=16];data['pendingAdditionSummary']=dict(newCount=9,sourceNos=[16],prior153Exact=True)
assert data['items'][:153]==old['items'] and data['version']==old['version']
FILE.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');(W/'authored-summary.json').write_text(json.dumps(dict(count=162,newCount=9,prior153Exact=True,variants=[dict(id=x['id'],cards=x['verification']['parameters']['cards'],assignment=x['verification']['parameters']['uniquePlacement'],answer=x['answerParts']) for x in new]),ensure_ascii=False,indent=2)+'\n')
print('Authored9 for source16;fixed original sums/figure retained;all unique assignments;162 total;pending review')
