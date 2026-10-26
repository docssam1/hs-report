"""Build nine top/front/side cube-view variants for Applied 2 Q16."""
import hashlib
import itertools
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
EXAM=ROOT/'materials/초등과정 대비 실전 모의고사 활용 2회.pdf'
ANSWER=ROOT/'.private-work/hw-expansion-20261023/applied2-answer-source.pdf'
DATA=ROOT/'bank/data/applied2-expanded.json'
INDEX=ROOT/'bank/data/applied2-expanded-index.json'
assert hashlib.sha256(EXAM.read_bytes()).hexdigest()=='1af1698985c657774c00eb9abc0466b07f8cb79bca64d2c379ea18b8cae67aab'
assert hashlib.sha256(ANSWER.read_bytes()).hexdigest()=='074180c770e7e76d77dca35410f14246a5eaa373feba8061d3f390c320b5ffdc'

SOURCE_TOP={(0,1),(1,1),(1,3),(2,2),(3,0),(3,1)}
SOURCE_FRONT=(4,1,3,2)
assert [max((SOURCE_FRONT[c] for r,c in SOURCE_TOP if r==row),default=0) for row in reversed(range(4))]==[4,3,2,1]

# Side-view column heights from near to far. The source (4,3,2,1) is excluded.
SIDE_TARGETS=[(1,2,3,4),(1,3,4,2),(1,4,2,3),(2,1,4,3),(2,3,1,4),
              (2,4,3,1),(3,1,2,4),(3,4,1,2),(4,1,3,2)]
FRONTS=[(4,1,3,2),(3,1,4,2),(2,1,4,3),(4,1,2,3),(3,1,2,4),
        (2,1,3,4),(4,1,3,2),(3,1,4,2),(2,1,4,3)]


def draw_svg(footprint,front,path):
    cell=37;panel_width=4*cell;starts=[16,190,364]
    parts=['<svg xmlns="http://www.w3.org/2000/svg" width="529" height="205" viewBox="0 0 529 205">',
           '<rect width="100%" height="100%" fill="white"/>']
    for panel,x0 in enumerate(starts):
        for row in range(4):
            for col in range(4):
                fill='#9d9d9d' if (panel==0 and (row,col) in footprint) or (panel==1 and row>=4-front[col]) else 'white'
                # No answer shading is placed in the side panel.
                parts.append(f'<rect x="{x0+col*cell}" y="{12+row*cell}" width="{cell}" height="{cell}" fill="{fill}" stroke="#777" stroke-width="0.8"/>')
        parts.append(f'<rect x="{x0}" y="12" width="{panel_width}" height="{panel_width}" fill="none" stroke="#191511" stroke-width="1.5"/>')
        parts.append(f'<text x="{x0+panel_width/2}" y="190" text-anchor="middle" font-family="serif" font-size="21" fill="#191511">{["위","앞","옆"][panel]}</text>')
    parts.append('</svg>')
    path.write_text('\n'.join(p for p in parts if p)+'\n')


data=json.loads(DATA.read_text());index=json.loads(INDEX.read_text())
assert data['version']==index['version'] and 16 in data['pendingSourceNos']
assert not any(item['sourceNo']==16 for item in data['items'])
items=[]
for variant_no,(side,front) in enumerate(zip(SIDE_TARGETS,FRONTS),1):
    far_rows=tuple(reversed(side))
    row_for_height={height:row for row,height in enumerate(far_rows)}
    missing_choices=[row for row in range(4) if row!=row_for_height[1]]
    missing=missing_choices[(variant_no-1)%3]
    footprint={(row,1) for row in range(4) if row!=missing}
    footprint|={(row_for_height[front[col]],col) for col in (0,2,3)}
    assert len(footprint)==6 and len({c for r,c in footprint})==4
    assert all((row,1) in footprint for row in range(4) if row!=missing)
    rows=[max((front[col] for r,col in footprint if r==row),default=0) for row in reversed(range(4))]
    assert tuple(rows)==side
    src=f'assets/applied2/q16-v{variant_no}.svg'
    draw_svg(footprint,front,ROOT/'bank'/src)
    top_by_col=[sorted(row+1 for row,col2 in footprint if col2==col) for col in range(4)]
    steps=[
        f'위 그림에서 각 앞모양의 세로줄에 해당하는 칸은 왼쪽부터 {", ".join(map(str,top_by_col))}행에 있습니다.',
        f'앞 그림에서 네 세로줄의 높이는 왼쪽부터 {", ".join(map(str,front))}칸입니다. 한 칸만 있는 첫째·셋째·넷째 열의 쌓인 높이는 각각 그 높이로 정해집니다.',
        f'둘째 열에는 세 칸이 있지만 앞모양의 높이가 1칸이라 셋 모두 높이가 1칸입니다.',
        f'따라서 위 그림의 아랫줄(가까운 쪽)부터 윗줄(먼 쪽)까지 각 줄에서 가장 높은 쌓기나무를 보면 옆모양의 세로줄 높이는 {", ".join(map(str,side))}칸입니다.',
    ]
    items.append({
        'id':f'applied2-q16-v{variant_no}','genId':'applied2-q16','sourceSet':'applied','sourceRound':2,
        'sourceNo':16,'variantNo':variant_no,'reviewStatus':'verified',
        'area':'도형','subarea':'쌓기나무와 투영','detailType':'위·앞모양으로 옆모양의 네 세로줄 높이 찾기','pointBand':'3.4',
        'text':'쌓기나무로 만든 입체를 위와 앞에서 본 모양입니다. 옆에서 본 모양을 빈 격자에 그려 보고, 네 세로줄의 높이를 왼쪽부터 차례로 적으세요.',
        'answer':','.join(map(str,side)),'answerContract':'ordered-parts','answerParts':list(side),
        'answerLabels':['첫째 줄','둘째 줄','셋째 줄','넷째 줄'],'acceptedAnswers':[','.join(map(str,side))],
        'solutionSteps':steps,'solution':' '.join(steps),
        'learningPoint':'위모양으로 쌓인 위치를 찾고 앞모양의 열별 최고 높이를 대입한 뒤 옆에서 가까운 줄부터 높이를 보기',
        'learningLocation':'활용 2회 · 원문 16번 · 위·앞·옆에서 본 쌓기나무',
        'verification':{
            'primaryMethod':'각 위모양 칸의 높이를 앞모양 열별 최고 높이로 결정',
            'independentMethod':'위모양의 여섯 칸에 가능한 높이 1~4를 전수 대입해 앞모양 일치 해를 확인',
            'parameters':{'footprint':sorted([list(pair) for pair in footprint]),'frontHeights':list(front),'sideHeights':list(side),'answer':list(side)},
            'sourceExamPage':3,'sourceAnswerPage':4,'sourceTextDirectlyReviewed':True,
            'sourceFigureDirectlyReviewed':True,'sourceAnswerCandidate':[4,3,2,1],
            'independentSourceAnswer':[4,3,2,1],'sourceAnswerCandidateOfficiality':'unverified',
            'sourceExamSha256':hashlib.sha256(EXAM.read_bytes()).hexdigest(),
            'sourceAnswerSha256':hashlib.sha256(ANSWER.read_bytes()).hexdigest(),
            'originalFigurePreserved':True,'variantFiguresCreatedFresh':True,
            'uniqueHeightArrangement':True,
        },
        'difficultyEvidence':{'basis':'source-point-band','label':'중','sourceReasoningPreserved':True,'measuredVariantRate':None},
        'asset':{'kind':'svg','src':src,'description':'위·앞 격자 음영과 빈 옆모양 격자'},
    })

data['items'].extend(items);data['items'].sort(key=lambda item:(item['sourceNo'],item['variantNo']))
data['availableSourceNos']=sorted(set(data['availableSourceNos'])|{16})
data['pendingSourceNos']=[no for no in data['pendingSourceNos'] if no!=16]
data['version']='20261026-applied2-q16-confirmed-r1';data['itemCount']=len(data['items'])
data.setdefault('sourceEditionNotes',{})['16']='현행 원문 p.3의 위모양 여섯 칸·앞모양 네 열(4,1,3,2)을 직접 확인. 옆모양 가까운 쪽부터 (4,3,2,1), 답안 후보 p.4 해설 그림과 일치. 후보 공식 판본 동일성은 미확정. 원본 그림 보존, 새 그림 SVG 9개.'
data['reviewSummary']['independentMathCount']=len(data['items'])
data['reviewSummary']['sourceTypes']=len(data['availableSourceNos'])
data['reviewSummary']['sourceDrawingCount']=len({item['sourceNo'] for item in data['items'] if item.get('asset')})
data['reviewSummary']['outputReviewed']=False
index['version']=data['version'];index['itemCount']=len(data['items']);index['pendingSourceNos']=data['pendingSourceNos']
index['items'].append({'sourceNo':16,'genId':'applied2-q16','area':'도형','subarea':'쌓기나무와 투영',
                       'detailType':'위·앞모양으로 옆모양의 네 세로줄 높이 찾기','pointBand':'3.4',
                       'reviewStatus':'verified','variantCount':9})
index['items'].sort(key=lambda item:item['sourceNo'])
DATA.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
INDEX.write_text(json.dumps(index,ensure_ascii=False,indent=2)+'\n')
print('Built Applied2 Q16: nine top/front/side variants; answers',[item['answerParts'] for item in items])
