"""Build nine balanced-mobile variants after direct source/answer comparison."""
import hashlib
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
EXAM=ROOT/'materials/초등과정 대비 실전 모의고사 활용 2회.pdf'
ANSWER=ROOT/'.private-work/hw-expansion-20261023/applied2-answer-source.pdf'
DATA=ROOT/'bank/data/applied2-expanded.json'
INDEX=ROOT/'bank/data/applied2-expanded-index.json'
assert hashlib.sha256(EXAM.read_bytes()).hexdigest()=='1af1698985c657774c00eb9abc0466b07f8cb79bca64d2c379ea18b8cae67aab'
assert hashlib.sha256(ANSWER.read_bytes()).hexdigest()=='074180c770e7e76d77dca35410f14246a5eaa373feba8061d3f390c320b5ffdc'

# Exact source topology: five balls to the left, seven to the right.
TREE=((((0,1),2),(3,4)),((5,(6,7)),(((8,9),10),11)))
VARIANTS=[(11,16),(11,24),(11,40),(10,14),(10,22),(10,30),(8,8),(8,12),(8,14)]


def depths(node,depth=0):
    if isinstance(node,int):return {node:depth}
    return {**depths(node[0],depth+1),**depths(node[1],depth+1)}


DEPTHS=depths(TREE)
assert sorted(DEPTHS)==list(range(12))
assert DEPTHS[0]==4 and DEPTHS[11]==3 and DEPTHS[10]==4 and DEPTHS[8]==5
assert 32*2**(DEPTHS[11]-DEPTHS[0])==16


def draw_svg(given_leaf,given_grams,path):
    xs={i:30+40*i for i in range(12)}
    anchors={}
    def anchor(node):
        if isinstance(node,int):return xs[node]
        key=str(node)
        if key not in anchors:anchors[key]=(anchor(node[0])+anchor(node[1]))/2
        return anchors[key]
    root_x=anchor(TREE)
    parts=['<svg xmlns="http://www.w3.org/2000/svg" width="500" height="310" viewBox="0 0 500 310">',
           '<rect width="100%" height="100%" fill="white"/>',
           '<line x1="8" y1="18" x2="492" y2="18" stroke="#555" stroke-width="1.6"/>',
           f'<line x1="{root_x}" y1="18" x2="{root_x}" y2="47" stroke="#555" stroke-width="1.5"/>']
    def draw(node,level):
        if isinstance(node,int):return
        left,right=node
        x_left,x_right=anchor(left),anchor(right)
        y=47+41*level
        parts.append(f'<line x1="{x_left}" y1="{y}" x2="{x_right}" y2="{y}" stroke="#444" stroke-width="1.7"/>')
        for child,xc in ((left,x_left),(right,x_right)):
            end_y=231 if isinstance(child,int) else 47+41*(level+1)
            parts.append(f'<line x1="{xc}" y1="{y}" x2="{xc}" y2="{end_y}" stroke="#555" stroke-width="1.3"/>')
            if not isinstance(child,int):draw(child,level+1)
    draw(TREE,0)
    for leaf,x in xs.items():
        parts.append(f'<circle cx="{x}" cy="250" r="19" fill="#eaeaea" stroke="#444" stroke-width="1.4"/>')
        if leaf==0:parts.append(f'<text x="{x}" y="257" text-anchor="middle" font-family="serif" font-size="22" fill="#191511">ㄱ</text>')
        if leaf==given_leaf:parts.append(f'<text x="{x}" y="294" text-anchor="middle" font-family="serif" font-size="20" fill="#191511">{given_grams}g</text>')
    parts.append('</svg>')
    path.write_text('\n'.join(parts)+'\n')


data=json.loads(DATA.read_text());index=json.loads(INDEX.read_text())
assert data['version']==index['version']
assert 21 in data['pendingSourceNos'] or data['version']=='20261026-applied2-q21-confirmed-r1'
data['items']=[item for item in data['items'] if item['sourceNo']!=21]
index['items']=[item for item in index['items'] if item['sourceNo']!=21]
items=[]
for variant_no,(known_leaf,known_weight) in enumerate(VARIANTS,1):
    root_weight=known_weight*2**DEPTHS[known_leaf]
    leaf_weights={leaf:root_weight//2**depth for leaf,depth in DEPTHS.items()}
    assert all(root_weight%2**depth==0 for depth in DEPTHS.values())
    def subtree_weight(node):
        if isinstance(node,int):return leaf_weights[node]
        left,right=map(subtree_weight,node)
        assert left==right
        return left+right
    assert subtree_weight(TREE)==root_weight
    answer=leaf_weights[0]
    src=f'assets/applied2/q21-v{variant_no}.svg'
    draw_svg(known_leaf,known_weight,ROOT/'bank'/src)
    if known_leaf==11:
        steps=[f'오른쪽 끝 {known_weight}g 방울이 달린 막대는 양쪽 무게가 같으므로 그 막대 전체는 {known_weight*2}g입니다.',
               f'그 위의 오른쪽 큰 가지는 {known_weight*4}g, 왼쪽 큰 가지도 {known_weight*4}g입니다.',
               f'왼쪽 가지에서 계속 양쪽 막대의 무게를 반씩 나누면 왼쪽 아래 두 방울의 막대는 {known_weight}g입니다.',
               f'두 방울의 무게가 같으므로 ㄱ 방울은 {known_weight}÷2={answer}g입니다.']
    elif known_leaf==10:
        steps=[f'{known_weight}g 방울과 왼쪽의 두 방울이 매달린 막대의 양쪽 무게가 같아 이 막대 전체는 {known_weight*2}g입니다.',
               f'오른쪽 위 두 단계의 막대 무게는 차례로 {known_weight*4}g, {known_weight*8}g이므로 왼쪽 큰 가지도 {known_weight*8}g입니다.',
               f'왼쪽에서 아래로 세 단계 양쪽 무게를 반씩 나누면 ㄱ 방울 무게는 {known_weight*8}÷2÷2÷2={answer}g입니다.',
               f'각 막대 양쪽의 총무게가 같은지 다시 확인하면 ㄱ은 {answer}g입니다.']
    else:
        steps=[f'{known_weight}g 방울이 있는 맨 아래 막대는 두 방울이 같으므로 그 전체 무게는 {known_weight*2}g입니다.',
               f'그 위의 오른쪽 가지 무게는 위로 갈 때마다 두 배가 되어 차례로 {known_weight*4}g, {known_weight*8}g, {known_weight*16}g입니다.',
               f'왼쪽 큰 가지도 {known_weight*16}g입니다. 왼쪽에서 아래로 세 단계 반씩 나누면 ㄱ 방울은 {known_weight*16}÷2÷2÷2={answer}g입니다.',
               f'따라서 ㄱ 방울의 무게는 {answer}g입니다.']
    items.append({
        'id':f'applied2-q21-v{variant_no}','genId':'applied2-q21','sourceSet':'applied','sourceRound':2,
        'sourceNo':21,'variantNo':variant_no,'reviewStatus':'verified',
        'area':'수와식','subarea':'무게와 균형','detailType':'균형 잡힌 모빌의 가지별 무게로 방울 무게 찾기','pointBand':'3.4',
        'text':'그림의 모빌은 모든 막대가 수평으로 균형을 이루고 있습니다. ㄱ 방울의 무게는 몇 g인가요?',
        'answer':f'{answer}g','answerContract':'ordered-parts','answerParts':[answer],
        'answerLabels':['ㄱ 방울 무게(g)'],'acceptedAnswers':[f'{answer}g',str(answer)],
        'solutionSteps':steps,'solution':' '.join(steps),
        'learningPoint':'각 막대 양쪽의 총무게가 같음을 이용해 주어진 방울에서 위로 두 배, 아래로 절반씩 계산하기',
        'learningLocation':'활용 2회 · 원문 21번 · 균형 잡힌 모빌의 무게',
        'verification':{
            'primaryMethod':'주어진 방울 무게에서 전체 가지 무게를 두 배·절반으로 전파',
            'independentMethod':'12개 방울의 가중치를 모든 11개 막대 균형식으로 재대입',
            'parameters':{'givenLeaf':known_leaf,'givenGrams':known_weight,'targetLeaf':0,'leafDepths':DEPTHS,'answer':answer},
            'sourceExamPage':4,'sourceAnswerPage':6,'sourceTextDirectlyReviewed':True,
            'sourceFigureDirectlyReviewed':True,'sourceAnswerCandidate':16,'independentSourceAnswer':16,
            'sourceAnswerCandidateOfficiality':'unverified',
            'sourceExamSha256':hashlib.sha256(EXAM.read_bytes()).hexdigest(),
            'sourceAnswerSha256':hashlib.sha256(ANSWER.read_bytes()).hexdigest(),
            'originalFigurePreserved':True,'variantFiguresCreatedFresh':True,
            'leafWeights':leaf_weights,'independentMethodAgrees':True,
        },
        'difficultyEvidence':{'basis':'source-point-band','label':'중','sourceReasoningPreserved':True,'measuredVariantRate':None},
        'asset':{'kind':'svg','src':src,'description':'열두 방울과 균형 막대로 된 모빌'},
    })

data['items'].extend(items)
data['items'].sort(key=lambda item:(item['sourceNo'],item['variantNo']))
data['availableSourceNos']=sorted(set(data['availableSourceNos'])|{21})
data['pendingSourceNos']=[n for n in data['pendingSourceNos'] if n!=21]
data['version']='20261026-applied2-q21-confirmed-r1';data['itemCount']=len(data['items'])
data.setdefault('sourceEditionNotes',{})['21']='현행 원문 p.4 모빌의 12개 방울·11개 균형 막대와 ㄱ/오른쪽 끝 32g 위치를 직접 확인. 막대별 양쪽 무게 합을 따라가면 ㄱ=16g, 답안 후보 p.6 필기16g과 일치. 공식 판본 동일성은 미확정. 원본 그림은 보존, 유사문제 SVG 9개.'
data['reviewSummary']['independentMathCount']=len(data['items'])
data['reviewSummary']['sourceTypes']=len(data['availableSourceNos'])
data['reviewSummary']['sourceDrawingCount']=len({x['sourceNo'] for x in data['items'] if x.get('asset')})
data['reviewSummary']['outputReviewed']=False
index['version']=data['version'];index['itemCount']=len(data['items']);index['pendingSourceNos']=data['pendingSourceNos']
index['items'].append({'sourceNo':21,'genId':'applied2-q21','area':'수와식','subarea':'무게와 균형',
                       'detailType':'균형 잡힌 모빌의 가지별 무게로 방울 무게 찾기',
                       'pointBand':'3.4','reviewStatus':'verified','variantCount':9})
index['items'].sort(key=lambda item:item['sourceNo'])
DATA.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
INDEX.write_text(json.dumps(index,ensure_ascii=False,indent=2)+'\n')
print('Built Applied2 Q21: nine mobile variants; answers',[item['answerParts'][0] for item in items])
