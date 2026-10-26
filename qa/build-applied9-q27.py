#!/usr/bin/env python3
"""Add nine illustrated dice-stack variants based on Applied 9 source Q27."""
import hashlib, json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'bank/data/applied9-expanded.json'
INDEX = ROOT / 'bank/data/applied9-expanded-index.json'
ASSET_DIR = ROOT / 'bank/assets/applied9'
SOURCE_HASH = '0e32749d028cdcacd9e61d2b1d1cb5080266ac672a9a3ed17503270a74142794'
ANSWER_HASH = 'a6648f008a8e7ba7012913ede0cbad488aec782eaa06818a97acfb6900ac8d62'
ANSWER_ID = '1M7rJHVE11w4BZF5OHjZegDLcGGlmxKp4'
VERSION = '20261025-applied9-q02-q06-q07-q10-q11-q13-q17-q19-q21-q27-q29-q30-r8'
SIZES = [2, 4, 5, 6, 7, 8, 9, 10, 11]


def pip_points(value):
    base = {
        1: [(0.5,0.5)],
        2: [(0.25,0.25),(0.75,0.75)],
        3: [(0.25,0.25),(0.5,0.5),(0.75,0.75)],
        4: [(0.25,0.25),(0.75,0.25),(0.25,0.75),(0.75,0.75)],
        5: [(0.25,0.25),(0.75,0.25),(0.5,0.5),(0.25,0.75),(0.75,0.75)],
        6: [(0.25,0.2),(0.75,0.2),(0.25,0.5),(0.75,0.5),(0.25,0.8),(0.75,0.8)],
    }
    return base[value]


def svg_for(n):
    # Isometric, orthographic stack. Every visible face uses the same die
    # orientation: front=3, top=1, right=2 (standard opposite pairs sum to 7).
    cell = max(17.0, min(30.0, 330.0/n))
    dx, dy = cell * 0.46, cell * 0.36
    margin = max(8.0, cell * 0.42)
    width = 2*margin + n*cell + n*dx
    height = 2*margin + n*cell + n*dy
    radius = max(1.0, cell*0.055)
    stroke = max(0.65, cell*0.035)
    # Base coordinate: front bottom-left at (margin, height-margin).
    def xy(i,j,k): return margin+i*cell+j*dx, height-margin-k*cell-j*dy
    def poly(points, fill):
        pts=' '.join(f'{x:.2f},{y:.2f}' for x,y in points)
        return f'<polygon points="{pts}" fill="{fill}" stroke="#302c27" stroke-width="{stroke:.2f}" stroke-linejoin="round"/>'
    def dots_for_face(origin, basis1, basis2, value, skew=False):
        out=[]
        # Compress right-side pips along the depth axis, preserving readable rows.
        for u,v in pip_points(value):
            x=origin[0]+u*basis1[0]+v*basis2[0]
            y=origin[1]+u*basis1[1]+v*basis2[1]
            out.append(f'<circle cx="{x:.2f}" cy="{y:.2f}" r="{radius:.2f}" fill="#211e1a"/>')
        return ''.join(out)
    parts=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{width:.0f}" height="{height:.0f}" viewBox="0 0 {width:.2f} {height:.2f}">',
           '<rect width="100%" height="100%" fill="#fff"/>']
    # Right faces on the visible right boundary.
    for j in range(n-1,-1,-1):
        for k in range(n):
            x,y=xy(n,j,k+1)
            p=[(x,y),(x+dx,y-dy),(x+dx,y-dy+cell),(x,y+cell)]
            parts.append(poly(p,'#eee9dd'))
            parts.append(dots_for_face((x,y),(dx,-dy),(0,cell),2))
    # Front faces.
    for k in range(n):
        for i in range(n):
            x,y=xy(i,0,k+1)
            p=[(x,y),(x+cell,y),(x+cell,y+cell),(x,y+cell)]
            parts.append(poly(p,'#fbfaf6'))
            parts.append(dots_for_face((x,y),(cell,0),(0,cell),3))
    # Top faces, drawn last so their far edge stays crisp.
    for j in range(n):
        for i in range(n):
            x,y=xy(i,j,n)
            p=[(x,y),(x+cell,y),(x+cell+dx,y-dy),(x+dx,y-dy)]
            parts.append(poly(p,'#f5f1e8'))
            parts.append(dots_for_face((x,y),(cell,0),(dx,-dy),1))
    parts.append('</svg>')
    return ''.join(parts)


def build_items():
    out=[]
    for variant,n in enumerate(SIZES,1):
        filename=f'applied9-q27-v{variant}.svg'
        path=ASSET_DIR/filename
        svg=svg_for(n)
        path.write_text(svg,encoding='utf-8')
        digest=hashlib.sha256(path.read_bytes()).hexdigest()
        touching_pairs=3*n*n*(n-1)
        answer=7*touching_pairs
        assert answer==21*n**3-7*(3*n*n)
        text=(f'그림과 같이 같은 크기의 주사위 {n**3}개를 {n}층 정육면체 모양으로 쌓았습니다. '
              '주사위끼리 맞닿은 두 면에 있는 눈의 수를 모두 더하면 얼마입니까?')
        steps=[
            f'{n}층 정육면체 모양에서 한 방향으로 맞닿는 주사위 쌍은 {n-1}×{n}×{n}개입니다.',
            f'가로·세로·높이 세 방향의 맞닿은 쌍은 모두 3×{n-1}×{n}×{n}={touching_pairs}쌍입니다.',
            f'주사위의 마주 보는 면에 있는 눈의 수는 각각 7이므로, 맞닿은 두 면의 눈의 합은 {touching_pairs}×7={answer}입니다.',
            f'따라서 맞닿은 두 면에 있는 눈의 합은 {answer}입니다.'
        ]
        out.append({
          'id':f'applied9-q27-v{variant}','genId':'applied9-q27','sourceSet':'applied','sourceRound':9,
          'sourceNo':27,'variantNo':variant,'reviewStatus':'verified','area':'도형',
          'subarea':'입체도형과 쌓기','detailType':'정육면체 모양으로 쌓은 주사위의 맞닿은 면 눈의 합',
          'pointBand':'4.2','text':text,'answer':str(answer),'answerParts':[answer],
          'answerLabels':['맞닿은 면 눈의 합'],'acceptedAnswers':[str(answer)],'answerContract':'single-number',
          'asset':{'kind':'svg','src':f'assets/applied9/{filename}',
                   'description':f'{n}층 정육면체 모양의 표준 주사위 배열, 앞면 3·윗면 1·오른쪽 면 2',
                   'sha256':digest},
          'solutionSteps':steps,'solution':' '.join(steps),
          'learningPoint':'정육면체 배열에서 한 방향의 맞닿은 쌍을 세고 세 방향의 수를 더해 각 접촉면 눈의 합 구하기',
          'learningLocation':'활용 9회 · 원문 27번 · 입체도형과 쌓기',
          'verification':{
            'primaryMethod':'각 방향에서 n×n 단면 사이에 생기는 맞닿은 면 쌍을 세고, 표준 주사위의 마주 보는 면 눈의 합 7을 곱한다.',
            'independentMethod':'n³개의 주사위를 실제 좌표 격자로 놓고, 이웃한 모든 주사위 쌍을 세 방향으로 열거한 뒤 각 접촉면의 합 7을 더한다.',
            'parameters':{'layers':n,'diceCount':n**3,'adjacentPairsPerAxis':n*n*(n-1),'adjacentPairsTotal':touching_pairs,
                          'pipsPerTouchingPair':7,'answer':answer,'assetSha256':digest},
            'independentSuite':'qa/applied9-q27-independent-validate.py',
            'sourceExamPage':5,'sourceExamFile':'초등과정 대비 실전 모의고사 활용 9회.pdf','sourceExamSha256':SOURCE_HASH,
            'sourceAnswerPage':5,'sourceAnswerFile':'초등과정 대비 실전 모의고사 특강 9회 답안.pdf',
            'sourceAnswerDriveId':ANSWER_ID,'sourceAnswerSha256':ANSWER_HASH,
            'officialAnswerStatus':'Source page 5 shows 27 dice arranged 3×3×3. Candidate answer page 5 hand-calculates 21×27−7×9×3=378, matching the independent count of 54 touching pairs at 7 pips each. Candidate edition/official status remains unconfirmed.',
            'sourceDrawingCompared':True,'sourceDrawingPresent':True,
            'sourceDrawingDescription':'Original Q27 drawing is a 3×3×3 standard-dice stack with front 3s, top 1s, and right-side 2s. It was opened directly on source page 5; not reused or modified.',
            'variantUsesSourceDrawing':False,'variantDrawingModified':False,'studentDifficultyMeasured':False,
            'userAuthorizedNewVariantFigures':True,'authorizationScope':'New figure artwork for the nine dice-stack variants; original source figure remains unchanged.'
          },
          'difficultyEvidence':{'basis':'source-point-band','label':'상','sourceReasoningPreserved':True,'measuredVariantRate':None,
            'estimated':False,'rationale':'활용 9회 원문 25~30번의 4.2점 배점대다. 활용 난도는 배점대만 적용한다.'}
        })
    assert len({x['answer'] for x in out})==9
    return out


def main():
    data=json.loads(DATA.read_text()); index=json.loads(INDEX.read_text())
    variants=build_items()
    items=[x for x in data['items'] if x['sourceNo']!=27]+variants
    items.sort(key=lambda x:(x['sourceNo'],x['variantNo']))
    available=sorted({x['sourceNo'] for x in items})
    pending=[n for n in range(1,31) if n not in available]
    data.update(version=VERSION,items=items,itemCount=len(items),availableSourceNos=available,pendingSourceNos=pending)
    data['sourceReview'].setdefault('questionReviews',{})['27']={
      'sourceDiceCount':27,'sourceArrangement':[3,3,3],'candidateAnswer':378,'independentAnswer':378,
      'status':'candidate-page-agrees; official-edition-identity-unconfirmed; source item is Q27; user approval referenced Q28 dice, applied to the sole dice illustration (Q27) after direct source check'}
    index.update(version=VERSION,itemCount=len(items),availableSourceNos=available,pendingSourceNos=pending)
    index['items']=[x for x in index['items'] if x['sourceNo']!=27]
    q=variants[0]
    index['items'].append({'sourceNo':27,'genId':'applied9-q27','area':q['area'],'subarea':q['subarea'],
       'detailType':q['detailType'],'pointBand':'4.2','reviewStatus':'verified','variantCount':9})
    index['items'].sort(key=lambda x:x['sourceNo'])
    DATA.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
    INDEX.write_text(json.dumps(index,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'version':VERSION,'added':len(variants),'items':len(items),'pending':pending,
                      'sizes':SIZES,'answers':[int(x['answer']) for x in variants]},ensure_ascii=False,indent=2))

if __name__=='__main__': main()
