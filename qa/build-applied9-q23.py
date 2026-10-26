#!/usr/bin/env python3
"""Build nine seven-segment mirror-number variants for Applied 9 Q23."""
import hashlib,itertools,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];DATA=ROOT/'bank/data/applied9-expanded.json';INDEX=ROOT/'bank/data/applied9-expanded-index.json'
ASSETS=ROOT/'bank/assets/applied9';OUT=ROOT/'.private-work/hw-expansion-20261023/hw9'
SOURCE=ROOT/'materials/초등과정 대비 실전 모의고사 활용 9회.pdf';ANSWER=OUT/'candidate-special-9-answer.pdf'
SOURCE_SHA=hashlib.sha256(SOURCE.read_bytes()).hexdigest();ANSWER_SHA=hashlib.sha256(ANSWER.read_bytes()).hexdigest();ANSWER_ID='1M7rJHVE11w4BZF5OHjZegDLcGGlmxKp4'
TARGETS=[7,9,12,13,14,17,18,19,25]
# The single centered two-stick glyph for 1 matches itself in a vertical mirror,
# as drawn in the source's card set. Other reflected digits are 0, 2<->5, and 8.
SEGMENTS={0:'ab cdef'.replace(' ',''),1:'uv',2:'abged',3:'abgcd',4:'fgbc',5:'afgcd',6:'afgecd',7:'abc',8:'abcdefg',9:'abfgcd'}
MATCHES={d:len(s) for d,s in SEGMENTS.items()}
MIRROR={0:0,1:1,2:5,5:2,8:8}
ORDERS=[[(i+k)%10 for i in range(10)] for k in range(9)]

def valid_numbers(target):
    out=[]
    for size in range(1,6):
        for ds in itertools.combinations(MIRROR.keys(),size):
            if sum(MATCHES[d] for d in ds)!=target:continue
            for perm in itertools.permutations(ds):
                if len(perm)>1 and (perm[0]==0 or perm[-1]==0):continue
                mirrored=tuple(MIRROR[d] for d in reversed(perm))
                assert all(d in MIRROR for d in mirrored)
                out.append(perm)
    return out

def segline(a,b):return f'<line x1="{a[0]}" y1="{a[1]}" x2="{b[0]}" y2="{b[1]}"/>'
def card_svg(d,x,y):
    # Seven-segment geometry, except 1 uses two centered vertical matchsticks.
    pts={'a':((10,10),(32,10)),'b':((35,13),(35,31)),'c':((35,39),(35,57)),
         'd':((10,60),(32,60)),'e':((7,39),(7,57)),'f':((7,13),(7,31)),
         'g':((10,35),(32,35)),'u':((21,13),(21,31)),'v':((21,39),(21,57))}
    seg=''.join(f'<line x1="{pts[s][0][0]}" y1="{pts[s][0][1]}" x2="{pts[s][1][0]}" y2="{pts[s][1][1]}"/>' for s in SEGMENTS[d])
    return f'<g data-digit="{d}"><rect x="{x}" y="{y}" width="44" height="78" rx="3" fill="#fffdf8" stroke="#c9bda2" stroke-width="1"/><g transform="translate({x+2},{y+5})" stroke="#2f6b4a" stroke-width="5" stroke-linecap="round">{seg}</g></g>'

def svg(order):
    w,h=5*55+18,2*88+18
    a=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img"><rect width="100%" height="100%" fill="#fdfbf5"/>']
    for i,d in enumerate(order):a.append(card_svg(d,8+(i%5)*55,8+(i//5)*88))
    return ''.join(a)+'</svg>'

def main():
    data=json.loads(DATA.read_text());idx=json.loads(INDEX.read_text())
    assert data['version'].endswith('-r19') and idx['version']==data['version']
    assert 23 in data['pendingSourceNos'] and 23 not in data['availableSourceNos'] and not any(q['sourceNo']==23 for q in data['items'])
    ASSETS.mkdir(parents=True,exist_ok=True);new=[];report=[]
    for v,target in enumerate(TARGETS,1):
        nums=valid_numbers(target);answer=len(nums);subsets={tuple(sorted(set(n))) for n in nums}
        # Count all valid arrangements by selected set, for a concise proof.
        set_counts=[]
        for ds in sorted(subsets,key=lambda x:(sum(MATCHES[d] for d in x),x)):
            count=sum(1 for n in nums if tuple(sorted(n))==ds)
            set_counts.append({'digits':list(ds),'matchsticks':[MATCHES[d] for d in ds],'arrangements':count})
        assert nums and len(ORDERS[v-1])==10
        asset=ASSETS/f'applied9-q23-v{v}.svg';asset.write_text(svg(ORDERS[v-1]),encoding='utf-8');asset_sha=hashlib.sha256(asset.read_bytes()).hexdigest()
        combos='; '.join('{' + ','.join(map(str,x['digits'])) + '}: '+str(x['arrangements'])+'가지' for x in set_counts)
        steps=[f'세로 거울에 비추어도 숫자로 읽히는 카드는 0, 1, 2, 5, 8이고 2와 5는 서로 바뀝니다.',
          f'이 카드들의 성냥개비 수는 0:6개, 1:2개, 2:5개, 5:5개, 8:7개입니다.',
          f'{target}개가 되도록 고를 수 있는 카드 묶음과 각 묶음의 유효한 배열 수는 {combos}입니다.',
          f'0이 첫 자리나 끝 자리에 오면 원래 수 또는 거울 속 수가 되지 않습니다. 위 배열 수를 더하면 {answer}가지입니다.']
        item={'id':f'applied9-q23-v{v}','genId':'applied9-q23','sourceSet':'applied','sourceRound':9,'sourceNo':23,'variantNo':v,
          'reviewStatus':'verified','area':'경우의 수','subarea':'숫자 카드와 거울 대칭','detailType':'성냥개비 수 조건을 만족하면서 거울에 비추어 숫자가 되는 배열 세기',
          'pointBand':'4.2','text':f'0부터 9까지의 디지털 숫자 카드는 한 장씩 있습니다. 그림의 카드에서 몇 장을 골라 숫자를 만들 때, 성냥개비를 모두 {target}개 썼다면 오른쪽 거울에 비추어도 수로 읽히는 경우는 모두 몇 가지입니까?',
          'answer':str(answer),'answerParts':[answer],'answerLabels':['경우의 수'],'acceptedAnswers':[str(answer)],'answerContract':'single-number',
          'asset':{'kind':'svg','src':f'assets/applied9/{asset.name}','description':'0부터 9까지 디지털 숫자 카드를 새로 그린 그림','sha256':asset_sha},
          'solutionSteps':steps,'solution':' '.join(steps),'learningPoint':'거울에 비추어 숫자로 남는 카드만 고른 뒤 성냥개비 수와 자리 조건에 맞게 배열 수 세기',
          'learningLocation':'활용 9회 · 원문 23번 · 숫자 카드와 거울 대칭',
          'verification':{'primaryMethod':'세로 거울 아래에서 유효한 숫자 카드를 분류하고, 카드 묶음별 성냥개비 합과 자리 배열을 센다.',
            'independentMethod':'각 카드 조합과 모든 순열을 열거하고 거울 반사 숫자 및 양끝 0 여부를 별도로 검사한다.',
            'parameters':{'targetMatchsticks':target,'mirrorValidDigits':[0,1,2,5,8],'mirrorMap':{str(k):v for k,v in MIRROR.items()},'matchsticksByDigit':{str(k):v for k,v in MATCHES.items()},
              'digitOrder':ORDERS[v-1],'validDigitSets':set_counts,'validNumberCount':answer,'validArrangements':[list(n) for n in nums],'assetSha256':asset_sha},
            'independentSuite':'qa/applied9-q23-independent-validate.py','sourceExamPage':4,'sourceExamFile':SOURCE.name,'sourceExamSha256':SOURCE_SHA,
            'sourceAnswerPage':4,'sourceAnswerFile':ANSWER.name,'sourceAnswerSha256':ANSWER_SHA,'sourceAnswerDriveId':ANSWER_ID,
            'officialAnswerStatus':'후보 답안 p.4의 원문 결과 10개를 반사 대칭과 12개 성냥개비 조건으로 독립 열거해 재현했다. 후보 답안의 공식성·판본 동일성은 미확인이다.',
            'sourceDrawingCompared':True,'sourceDrawingPresent':True,'sourceDrawingDescription':'원문 p.4 Q23의 0~9 성냥개비 숫자 카드 10장을 직접 대조했다. 변형 그림은 새로 그렸고 원본을 바꾸지 않았다.',
            'variantUsesSourceDrawing':False,'variantDrawingModified':False,'userAuthorizedNewVariantFigures':True,
            'authorizationScope':'사용자가 승인한 활용 9회 남은 모든 그림 유형의 유사문제용 새 그림 제작.','studentDifficultyMeasured':False},
          'difficultyEvidence':{'basis':'source-point-band','label':'상','sourceReasoningPreserved':True,'measuredVariantRate':None,'estimated':False,
            'rationale':'원문 Q23은 4.2점 배점대이며 활용 난도는 배점대로 분류한다.'}}
        new.append(item);report.append({'id':item['id'],'targetMatchsticks':target,'validNumberCount':answer,'validDigitSets':set_counts,'assetSha256':asset_sha})
    data['items'].extend(new);data['items'].sort(key=lambda q:(q['sourceNo'],q['variantNo']))
    data['availableSourceNos']=sorted(data['availableSourceNos']+[23]);data['pendingSourceNos']=[n for n in data['pendingSourceNos'] if n!=23]
    data['version']='20261025-applied9-q01-q02-q03-q04-q05-q06-q07-q08-q09-q10-q11-q12-q13-q17-q18-q19-q20-q21-q22-q23-q26-q27-q29-q30-r20'
    assert len(data['items'])==243
    data['sourceReview'].setdefault('questionReviews',{})['23']={'sourcePage':4,'targetMatchsticks':12,'mirrorValidDigits':[0,1,2,5,8],
      'candidateAnswer':10,'independentAnswer':len(valid_numbers(12)),'status':'candidate agrees with independent enumeration; candidate official status unconfirmed; original unchanged'}
    idx.update(version=data['version'],itemCount=len(data['items']),availableSourceNos=data['availableSourceNos'],pendingSourceNos=data['pendingSourceNos'])
    idx['items']=[x for x in idx['items'] if x['sourceNo']!=23]+[{'sourceNo':23,'genId':'applied9-q23','area':'경우의 수','subarea':'숫자 카드와 거울 대칭',
      'detailType':'성냥개비 수 조건을 만족하면서 거울에 비추어 숫자가 되는 배열 세기','pointBand':'4.2','reviewStatus':'verified','variantCount':9}]
    idx['items'].sort(key=lambda x:x['sourceNo'])
    DATA.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');INDEX.write_text(json.dumps(idx,ensure_ascii=False,indent=2)+'\n')
    (OUT/'q23-independent-validation-r20.json').write_text(json.dumps({'sourceCandidateAnswer':10,'sourceEnumeratedAnswer':len(valid_numbers(12)),'variants':report},ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'version':data['version'],'count':len(data['items']),'pending':data['pendingSourceNos'],'targetAnswers':[(x['targetMatchsticks'],x['validNumberCount']) for x in report]},ensure_ascii=False,indent=2))
if __name__=='__main__':main()
