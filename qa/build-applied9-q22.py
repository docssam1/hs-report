#!/usr/bin/env python3
"""Build nine original-diagram variants for Applied 9 Q22."""
from __future__ import annotations
import hashlib, json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
DATA=ROOT/'bank/data/applied9-expanded.json'; INDEX=ROOT/'bank/data/applied9-expanded-index.json'
ASSETS=ROOT/'bank/assets/applied9'; OUT=ROOT/'.private-work/hw-expansion-20261023/hw9'
SOURCE=ROOT/'materials/초등과정 대비 실전 모의고사 활용 9회.pdf'; ANSWER=OUT/'candidate-special-9-answer.pdf'
SOURCE_SHA=hashlib.sha256(SOURCE.read_bytes()).hexdigest(); ANSWER_SHA=hashlib.sha256(ANSWER.read_bytes()).hexdigest()
# 14 one-cell rolls, beginning from the start die into cell 1. Each route is a
# self-avoiding path with no nonconsecutive edge contacts, so cell order is clear.
ROUTES=['EEEEEESSWSWWWN','EENENEEEESSWSW','ENNEESEESSWSSE','ENEESSSEENENNN','ENNEEEEESSSWWS','EENENEESEESSSS','ESSESEENNNEENN','ENEEESSESSWWNW','ESSSEENENNEENE']
DXY={'E':(1,0),'W':(-1,0),'N':(0,-1),'S':(0,1)}
ROLL={'E':{'U':'W','D':'E','E':'U','W':'D'},'W':{'U':'E','D':'W','E':'D','W':'U'},'N':{'U':'S','D':'N','N':'U','S':'D'},'S':{'U':'N','D':'S','N':'D','S':'U'}}
INITIAL={'U':2,'D':5,'E':6,'W':1,'N':3,'S':4}
SOURCE_ROUTE='EENENEEEEN EESW'.replace(' ','') # 14 source directions from diagram, start through cell 14

def advance(state,d):
    n=state.copy()
    for a,b in ROLL[d].items(): n[a]=state[b]
    return n

def route_cells(dirs):
    assert len(dirs)==14 and dirs[0]=='E'
    x=y=0; points=[(x,y)]
    for d in dirs[1:]:
        dx,dy=DXY[d]; x+=dx;y+=dy
        assert (x,y) not in points
        assert not any(abs(x-a)+abs(y-b)==1 for a,b in points[:-1])
        points.append((x,y))
    assert len(points)==14
    return points

def trace(dirs):
    s=INITIAL.copy();tops=[]
    for d in dirs:
        s=advance(s,d);tops.append(s['U'])
    return tops

def pip(x,y,r=2.2):return f'<circle cx="{x}" cy="{y}" r="{r}" fill="#2a241c"/>'
def svg(dirs):
    pts=route_cells(dirs); xs=[x for x,y in pts];ys=[y for x,y in pts]
    cell=40; pitch=50; x0=180; y0=40; miny=min(ys); maxx=max(xs)
    centers=[(x0+x*pitch+cell/2,y0+(y-miny)*pitch+cell/2) for x,y in pts]
    w=x0+maxx*pitch+cell+28; h=y0+(max(ys)-miny)*pitch+cell+32
    out=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img">',
      '<rect width="100%" height="100%" fill="#fdfbf5"/>']
    # Small initial die, with the same three visible faces as the original Q22.
    out += ['<g stroke="#6b665b" stroke-width="1.4" stroke-linejoin="round">',
      '<polygon points="48,58 66,43 108,43 90,58" fill="#f7f2e7"/>',
      '<polygon points="48,58 90,58 90,100 48,100" fill="#fffdf8"/>',
      '<polygon points="90,58 108,43 108,85 90,100" fill="#eee8dc"/>','</g>',
      '<g>'+pip(64,51)+pip(89,50)+pip(57,67)+pip(81,67)+pip(57,91)+pip(81,91)+pip(95,61)+pip(102,56)+pip(95,72)+pip(102,67)+pip(95,84)+pip(102,78)+'</g>',
      '<text x="56" y="32" font-family="serif" font-size="11" fill="#2f6b4a">출발</text>',
      '<g stroke="#2f6b4a" stroke-width="1.8" fill="none"><path d="M112 77 H164"/><path d="M157 73 L164 77 L157 81"/></g>']
    # Track connectors are drawn behind the numbered tiles.
    out.append('<g stroke="#2f6b4a" stroke-width="1.8" fill="none">')
    for (x1,y1),(x2,y2) in zip(centers,centers[1:]):
        out.append(f'<path d="M{x1:.1f} {y1:.1f} L{x2:.1f} {y2:.1f}"/>')
    out.append('</g>')
    out.append('<g stroke="#8e887a" stroke-width="1" fill="#fffdf8">')
    for cx,cy in centers:out.append(f'<rect x="{cx-cell/2:.1f}" y="{cy-cell/2:.1f}" width="{cell}" height="{cell}" rx="3"/>')
    out.append('</g><g fill="#2a241c" font-family="serif" font-size="13" text-anchor="middle" dominant-baseline="central">')
    for i,(cx,cy) in enumerate(centers,1):out.append(f'<text x="{cx:.1f}" y="{cy:.1f}">{i}</text>')
    out.append('</g></svg>')
    return ''.join(out)

def main():
    data=json.loads(DATA.read_text());idx=json.loads(INDEX.read_text())
    assert data['version'].endswith('-r18') and idx['version']==data['version']
    assert 22 in data['pendingSourceNos'] and 22 not in data['availableSourceNos']
    assert not any(q['sourceNo']==22 for q in data['items'])
    source_tops=trace(list(SOURCE_ROUTE));source_same=[i for i,n in enumerate(source_tops,1) if n==2]
    assert len(SOURCE_ROUTE)==14 and source_same==[5,9,13], (SOURCE_ROUTE,source_tops,source_same)
    ASSETS.mkdir(parents=True,exist_ok=True);new=[];report=[];answer_sets=[]
    for v,route in enumerate(ROUTES,1):
        dirs=list(route);pts=route_cells(dirs);tops=trace(dirs);ans=[i for i,n in enumerate(tops,1) if n==2]
        assert 2<=len(ans)<=5 and ans not in answer_sets
        answer_sets.append(ans)
        name=f'applied9-q22-v{v}.svg';asset=ASSETS/name;asset.write_text(svg(dirs),encoding='utf-8')
        asset_sha=hashlib.sha256(asset.read_bytes()).hexdigest()
        steps=[f'출발할 때 윗면은 2입니다. 마주 보는 눈의 합이 7이므로 아랫면은 5입니다.',
          f'그림의 이동 순서대로 주사위를 굴리며 윗면의 눈을 차례로 적으면 {", ".join(map(str,tops))}입니다.',
          f'윗면에 2가 보이는 칸은 {", ".join(map(str,ans))}입니다.']
        item={'id':f'applied9-q22-v{v}','genId':'applied9-q22','sourceSet':'applied','sourceRound':9,'sourceNo':22,'variantNo':v,
          'reviewStatus':'verified','area':'도형','subarea':'주사위의 회전','detailType':'방향이 바뀌는 경로를 따라 굴린 주사위의 윗면 추적',
          'pointBand':'3.4','text':'마주 보는 면에 적힌 눈의 합이 7인 주사위를 그림의 출발점에서 1번 칸부터 차례대로 굴립니다. 14번 칸까지 옮길 때 윗면의 눈이 처음과 같은 칸의 번호를 모두 쓰시오.',
          'answer':', '.join(map(str,ans)),'answerParts':ans,'answerLabels':[f'{i}번째 칸' for i in range(len(ans))],
          'acceptedAnswers':[', '.join(map(str,ans))],'answerContract':'ordered-parts',
          'asset':{'kind':'svg','src':f'assets/applied9/{name}','description':'처음 세 면의 눈과 1~14번 이동 경로를 나타낸 새 그림','sha256':asset_sha},
          'solutionSteps':steps,'solution':' '.join(steps),'learningPoint':'경로의 방향에 따라 주사위의 여섯 면 위치를 갱신하며 윗면의 변화를 추적하기',
          'learningLocation':'활용 9회 · 원문 22번 · 주사위의 회전',
          'verification':{'primaryMethod':'초기 윗면·아랫면과 눈의 방향을 놓고 각 한 칸 이동에서 면의 위치를 회전시킨다.',
           'independentMethod':'방향별 3차원 회전으로 여섯 면의 위치를 갱신하고, 윗면 수열에서 초기 윗면을 찾는다.',
           'parameters':{'directions':dirs,'initialFaces':INITIAL,'topSequence':tops,'answerCells':ans,'cellCoordinates':[list(p) for p in pts]},
           'independentSuite':'qa/applied9-q22-independent-validate.py','sourceExamPage':4,'sourceExamFile':SOURCE.name,'sourceExamSha256':SOURCE_SHA,
           'sourceAnswerPage':4,'sourceAnswerFile':ANSWER.name,'sourceAnswerSha256':ANSWER_SHA,'sourceAnswerDriveId':'1M7rJHVE11w4BZF5OHjZegDLcGGlmxKp4',
           'officialAnswerStatus':'답안 후보 p.4에는 원문 답 5, 9, 13이 표시되어 있고 원문 경로를 회전 시뮬레이션해 재현했다. 후보 답안의 공식성·판본 동일성은 미확인이다.',
           'sourceDrawingCompared':True,'sourceDrawingPresent':True,'sourceDrawingDescription':'원문 p.4 Q22의 시작 주사위 세 면(윗면 2, 앞면 4, 오른쪽 면 6), 1~14번 칸의 연결과 방향 전환을 직접 대조했다. 원본 그림은 변경하지 않았다.',
           'variantUsesSourceDrawing':False,'variantDrawingModified':False,'userAuthorizedNewVariantFigures':True,
           'authorizationScope':'사용자가 승인한 활용 9회 남은 모든 그림 유형의 유사문제용 새 그림 제작.','studentDifficultyMeasured':False},
          'difficultyEvidence':{'basis':'source-point-band','label':'중','sourceReasoningPreserved':True,'measuredVariantRate':None,'estimated':False,
            'rationale':'활용 9회 원문 13~22번의 3.4점 배점대다. 활용 난도는 배점대만 적용한다.'}}
        new.append(item);report.append({'id':item['id'],'directions':dirs,'topSequence':tops,'answerCells':ans,'assetSha256':asset_sha})
    data['items'].extend(new);data['items'].sort(key=lambda q:(q['sourceNo'],q['variantNo']))
    data['availableSourceNos']=sorted(data['availableSourceNos']+[22]);data['pendingSourceNos']=[n for n in data['pendingSourceNos'] if n!=22]
    data['version']='20261025-applied9-q01-q02-q03-q04-q05-q06-q07-q08-q09-q10-q11-q12-q13-q17-q18-q19-q20-q21-q22-q26-q27-q29-q30-r19'
    assert len(data['items'])==234
    data['sourceReview'].setdefault('questionReviews',{})['22']={'sourcePage':4,'initialVisibleFaces':{'top':2,'front':4,'right':6},'candidateAnswer':[5,9,13],
      'independentAnswer':source_same,'status':'candidate agrees with direction-by-direction rotation simulation; candidate official status unconfirmed; original unchanged'}
    idx.update(version=data['version'],itemCount=len(data['items']),availableSourceNos=data['availableSourceNos'],pendingSourceNos=data['pendingSourceNos'])
    idx['items']=[x for x in idx['items'] if x['sourceNo']!=22]+[{'sourceNo':22,'genId':'applied9-q22','area':'도형','subarea':'주사위의 회전',
      'detailType':'방향이 바뀌는 경로를 따라 굴린 주사위의 윗면 추적','pointBand':'3.4','reviewStatus':'verified','variantCount':9}]
    idx['items'].sort(key=lambda x:x['sourceNo'])
    DATA.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');INDEX.write_text(json.dumps(idx,ensure_ascii=False,indent=2)+'\n')
    (OUT/'q22-independent-validation-r19.json').write_text(json.dumps({'sourceDirectionSequence':list(SOURCE_ROUTE),'sourceTopSequence':source_tops,'sourceCandidateAnswer':source_same,'variants':report},ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'version':data['version'],'count':len(data['items']),'available':data['availableSourceNos'],'pending':data['pendingSourceNos'],'sourceAnswer':source_same,'variants':report},ensure_ascii=False,indent=2))
if __name__=='__main__':main()
