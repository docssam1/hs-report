"""Build nine independently counted cuboid-grid variants for Applied 3 Q27."""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXAM = ROOT / 'materials/초등과정 대비 실전 모의고사 활용 3회.pdf'
ANSWER = ROOT / '.private-work/hw-expansion-20261023/hw3/source/applied3-answer-candidate.pdf'
DATA = ROOT / 'bank/data/applied3-expanded.json'
INDEX = ROOT / 'bank/data/applied3-expanded-index.json'
assert hashlib.sha256(EXAM.read_bytes()).hexdigest() == '877da93ca12b01d513ef182bbf5998c6a391f2ee6c243059dcf79d901bf8f0f6'
assert hashlib.sha256(ANSWER.read_bytes()).hexdigest() == '4a88de5043eaedfbb8d8c74090816a2961676a2a82207bd516d241e02e42000c'

# (front width, depth, height), in unit cubes; the source itself is (5, 3, 4).
VARIANTS = [(3, 3, 4), (4, 2, 5), (4, 3, 4), (5, 2, 5), (5, 4, 3),
            (6, 2, 4), (6, 3, 4), (7, 3, 3), (5, 4, 4)]


def count_by_triple_loop(width, depth, height):
    return sum(1 for x0 in range(width) for x1 in range(x0 + 1, width + 1)
               for y0 in range(depth) for y1 in range(y0 + 1, depth + 1)
               for z0 in range(height) for z1 in range(z0 + 1, height + 1))


def line(x1, y1, x2, y2, strong=False):
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="#191511" stroke-width="{2 if strong else 0.9}"/>'


def draw_svg(width, depth, height, path):
    step = 37
    vx, vy = 17, -13
    x, y = 27, 44 + depth * 13
    back = (depth * vx, depth * vy)
    image_width = x + width * step + back[0] + 26
    image_height = y + height * step + 27
    parts = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{image_width}" height="{image_height}" viewBox="0 0 {image_width} {image_height}">',
             '<rect width="100%" height="100%" fill="white"/>',
             f'<path d="M{x},{y} L{x+width*step},{y} L{x+width*step+back[0]},{y+back[1]} L{x+back[0]},{y+back[1]} Z" fill="#f7f7f7"/>',
             f'<path d="M{x+width*step},{y} L{x+width*step+back[0]},{y+back[1]} L{x+width*step+back[0]},{y+height*step+back[1]} L{x+width*step},{y+height*step} Z" fill="#ededed"/>',
             f'<rect x="{x}" y="{y}" width="{width*step}" height="{height*step}" fill="white"/>']
    for i in range(width + 1):
        parts.append(line(x+i*step, y, x+i*step, y+height*step))
        parts.append(line(x+i*step, y, x+i*step+back[0], y+back[1]))
    for j in range(height + 1):
        parts.append(line(x, y+j*step, x+width*step, y+j*step))
        parts.append(line(x+width*step, y+j*step, x+width*step+back[0], y+j*step+back[1]))
    for k in range(depth + 1):
        px, py = x+k*vx, y+k*vy
        parts.append(line(px, py, px+width*step, py))
        parts.append(line(px+width*step, py, px+width*step, py+height*step))
    for a,b,c,d in [(x,y,x+width*step,y),(x,y,x,y+height*step),
                    (x,y+height*step,x+width*step,y+height*step),
                    (x+width*step,y,x+width*step+back[0],y+back[1]),
                    (x+width*step+back[0],y+back[1],x+width*step+back[0],y+height*step+back[1]),
                    (x+width*step,y+height*step,x+width*step+back[0],y+height*step+back[1]),
                    (x+back[0],y+back[1],x+width*step+back[0],y+back[1])]:
        parts.append(line(a,b,c,d,True))
    parts.append('</svg>')
    path.write_text('\n'.join(parts)+'\n')


assert count_by_triple_loop(5, 3, 4) == (5*6//2)*(3*4//2)*(4*5//2) == 900
data = json.loads(DATA.read_text())
index = json.loads(INDEX.read_text())
assert data['version'] == index['version'] and 27 in data['pendingSourceNos']
assert not any(item['sourceNo'] == 27 for item in data['items'])
items = []
for variant_no, (width, depth, height) in enumerate(VARIANTS, 1):
    direct = count_by_triple_loop(width, depth, height)
    axis_counts = [n*(n+1)//2 for n in (width, depth, height)]
    assert direct == axis_counts[0]*axis_counts[1]*axis_counts[2]
    src = f'assets/applied3/q27-v{variant_no}.svg'
    draw_svg(width, depth, height, ROOT/'bank'/src)
    steps = [
        f'가로로는 {width}칸이므로 시작선과 끝선을 정하는 방법이 1+2+⋯+{width}={axis_counts[0]}가지입니다.',
        f'깊이 {depth}칸에서는 1+2+⋯+{depth}={axis_counts[1]}가지, 높이 {height}칸에서는 1+2+⋯+{height}={axis_counts[2]}가지입니다.',
        f'서로 다른 가로·깊이·높이 구간을 하나씩 고르면 직육면체 하나가 정해지고 중복되지 않습니다.',
        f'따라서 크고 작은 직육면체는 모두 {axis_counts[0]}×{axis_counts[1]}×{axis_counts[2]}={direct}개입니다.',
    ]
    items.append({
        'id':f'applied3-q27-v{variant_no}','genId':'applied3-q27','sourceSet':'applied','sourceRound':3,
        'sourceNo':27,'variantNo':variant_no,'reviewStatus':'verified',
        'area':'도형','subarea':'입체 격자와 직육면체','detailType':'단위 격자 입체에서 크고 작은 직육면체 세기','pointBand':'4.2',
        'text':'그림의 단위 칸으로 나뉜 직육면체에서 격자선에 맞추어 만들 수 있는 크고 작은 직육면체는 모두 몇 개인가요?',
        'answer':str(direct),'answerContract':'ordered-parts','answerParts':[direct],
        'answerLabels':['직육면체 수'],'acceptedAnswers':[str(direct)],
        'solutionSteps':steps,'solution':' '.join(steps),
        'learningPoint':'가로·깊이·높이마다 시작선과 끝선을 고르는 방법을 곱하기',
        'learningLocation':'활용 3회 · 원문 27번 · 입체 격자에서 직육면체 세기',
        'verification':{
            'primaryMethod':'각 축의 시작·끝 격자선을 모두 순회해 3차원 구간 전수 열거',
            'independentMethod':'가로·깊이·높이의 삼각수 곱',
            'parameters':{'width':width,'depth':depth,'height':height,'axisCounts':axis_counts,'answer':direct},
            'sourceExamPage':6,'sourceAnswerPage':6,'sourceTextDirectlyReviewed':True,
            'sourceFigureDirectlyReviewed':True,'sourceAnswerCandidate':900,'independentSourceAnswer':900,
            'sourceAnswerCandidateOfficiality':'unverified',
            'sourceExamSha256':hashlib.sha256(EXAM.read_bytes()).hexdigest(),
            'sourceAnswerSha256':hashlib.sha256(ANSWER.read_bytes()).hexdigest(),
            'originalFigurePreserved':True,'variantFiguresCreatedFresh':True,
            'enumerationCuboidCount':direct,'independentMethodAgrees':True,
        },
        'difficultyEvidence':{'basis':'source-point-band','label':'상','sourceReasoningPreserved':True,'measuredVariantRate':None},
        'asset':{'kind':'svg','src':src,'description':'가로·깊이·높이가 격자로 나뉜 직육면체'},
    })

data['items'].extend(items)
data['items'].sort(key=lambda item:(item['sourceNo'],item['variantNo']))
data['availableSourceNos']=sorted(set(data['availableSourceNos'])|{27})
data['pendingSourceNos']=[n for n in data['pendingSourceNos'] if n!=27]
data['version']='20261026-applied3-q27-confirmed-r1'
data['itemCount']=len(data['items'])
data.setdefault('sourceEditionNotes',{})['27']='현행 원문 p.6의 가로5칸·깊이3칸·높이4칸을 고해상도 그림에서 직접 확인. 세 축 구간 전수 열거와 삼각수 곱 15×6×10=900으로 독립 계산, 동일 지문·그림의 답안 후보 p.6 필기 900과 일치. 답안 공식 판본 동일성은 미확정. 원본 그림 보존, 유사문제 SVG 9개 별도 제작.'
data['reviewSummary']['independentMathCount']=len(data['items'])
data['reviewSummary']['sourceTypes']=len(data['availableSourceNos'])
data['reviewSummary']['sourceDrawingCount']=len({x['sourceNo'] for x in data['items'] if x.get('asset')})
data['reviewSummary']['outputReviewed']=False
index['version']=data['version']
index['itemCount']=len(data['items'])
index['pendingSourceNos']=data['pendingSourceNos']
index['items'].append({'sourceNo':27,'genId':'applied3-q27','area':'도형',
                       'subarea':'입체 격자와 직육면체','detailType':'단위 격자 입체에서 크고 작은 직육면체 세기',
                       'pointBand':'4.2','reviewStatus':'verified','variantCount':9})
index['items'].sort(key=lambda item:item['sourceNo'])
DATA.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
INDEX.write_text(json.dumps(index,ensure_ascii=False,indent=2)+'\n')
print('Built Applied3 Q27: nine cuboid-grid variants; answers',[item['answerParts'][0] for item in items])
