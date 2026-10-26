"""Extend Applied 3 Q29 using its exact original two-circle example image."""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXAM = ROOT / 'materials/초등과정 대비 실전 모의고사 활용 3회.pdf'
ANSWER = ROOT / '.private-work/hw-expansion-20261023/hw3/source/applied3-answer-candidate.pdf'
IMAGE = ROOT / 'bank/assets/applied3/q29-source-example.png'
DATA = ROOT / 'bank/data/applied3-expanded.json'
INDEX = ROOT / 'bank/data/applied3-expanded-index.json'
assert hashlib.sha256(EXAM.read_bytes()).hexdigest() == '877da93ca12b01d513ef182bbf5998c6a391f2ee6c243059dcf79d901bf8f0f6'
assert hashlib.sha256(ANSWER.read_bytes()).hexdigest() == '4a88de5043eaedfbb8d8c74090816a2961676a2a82207bd516d241e02e42000c'
assert IMAGE.is_file() and IMAGE.stat().st_size > 1000

def incremental_regions(n):
    count = 1
    for circle in range(1, n + 1):
        count += 2 * circle - 1
    return count

def euler_regions(n):
    vertices = n * (n - 1) + n  # pair crossings plus outer tangencies
    edges = n * (2 * (n - 1) + 1) + n  # arcs of small circles and outer boundary
    return edges - vertices + 1  # subtract the unbounded exterior face

assert incremental_regions(2) == euler_regions(2) == 5
assert incremental_regions(7) == euler_regions(7) == 50
data = json.loads(DATA.read_text())
index = json.loads(INDEX.read_text())
assert data['version'] == index['version'] and data['pendingSourceNos'] == [29]
assert not any(x['sourceNo'] == 29 for x in data['items'])
items = []
for variant, n in enumerate([3, 4, 5, 6, 8, 9, 10, 11, 12], 1):
    regions = incremental_regions(n)
    assert regions == euler_regions(n)
    changes = [2 * circle - 1 for circle in range(1, n + 1)]
    steps = [
        '큰 원 안의 처음 한 면에서 시작합니다.',
        'k번째 작은 원은 이전 k−1개 원과 각각 최대 두 점에서 만나고, 큰 원과 한 점에서 닿게 놓을 수 있어 면을 2k−1개 더 만듭니다.',
        f'따라서 {n}번째 원까지 면이 늘어나는 수는 차례로 '+', '.join(map(str, changes))+'입니다.',
        f'최대 면 수는 1+'+'+'.join(map(str, changes))+f'={regions}개입니다.',
    ]
    items.append({
        'id':f'applied3-q29-v{variant}','genId':'applied3-q29','sourceSet':'applied','sourceRound':3,
        'sourceNo':29,'variantNo':variant,'reviewStatus':'verified',
        'area':'도형','subarea':'곡선과 면','detailType':'큰 원 안에 그린 여러 원이 나누는 최대 면의 수',
        'pointBand':'4.2',
        'text':f'아래 보기는 큰 원 안에 작은 원 2개를 그려 5개의 면으로 나눈 것입니다. 큰 원 안에 작은 원 {n}개를 그려 넣으면 큰 원 안을 최대 몇 개의 면으로 나눌 수 있나요?',
        'answer':str(regions),'answerContract':'ordered-parts','answerParts':[regions],
        'answerLabels':['면의 수'],'acceptedAnswers':[str(regions)],
        'solutionSteps':steps,'solution':' '.join(steps),
        'learningPoint':'새 원이 앞선 원들과 만나는 점 및 큰 원과 닿는 점을 세어 새로 생기는 면의 수 누적하기',
        'learningLocation':'활용 3회 · 원문 29번 · 원이 나누는 최대 면의 수',
        'verification':{
            'primaryMethod':'원을 하나씩 넣을 때 늘어나는 면의 수를 누적',
            'independentMethod':'원과 외곽 경계를 평면 그래프로 보고 꼭짓점·모서리 수로 계산',
            'parameters':{'smallCircles':n,'newFacesPerCircle':changes,'answer':regions},
            'sourceExamPage':6,'sourceAnswerPage':6,'sourceTextDirectlyReviewed':True,
            'sourceFigureDirectlyReviewed':True,'sourceAnswerCandidate':50,'independentSourceAnswer':50,
            'sourceAnswerCandidateOfficiality':'unverified',
            'sourceExamSha256':hashlib.sha256(EXAM.read_bytes()).hexdigest(),
            'sourceAnswerSha256':hashlib.sha256(ANSWER.read_bytes()).hexdigest(),
            'sourceFigureCropSha256':hashlib.sha256(IMAGE.read_bytes()).hexdigest(),
            'originalFigurePreserved':True,'variantFiguresCreatedFresh':False,
            'incrementalRegions':regions,'eulerRegions':euler_regions(n),
        },
        'difficultyEvidence':{'basis':'source-point-band','label':'상','sourceReasoningPreserved':True,'measuredVariantRate':None},
        'asset':{'kind':'raster','src':'assets/applied3/q29-source-example.png',
                 'description':'원본 보기의 큰 원과 서로 만나는 작은 원 2개'},
    })

data['items'].extend(items)
data['items'].sort(key=lambda x:(x['sourceNo'],x['variantNo']))
data['availableSourceNos'].append(29)
data['availableSourceNos'].sort()
data['pendingSourceNos']=[]
data['version']='20261026-applied3-q29-confirmed-r1'
data['itemCount']=len(data['items'])
data['sourceEditionNotes']['29']='현행 원문 p.6의 작은 원 2개·5면 보기 그림을 원본 그대로 잘라 사용. 큰 원 안 작은 원 7개 답안 후보 p.6 필기 50과, 새 원별 증가 1·3·5·…·13 및 평면 그래프 계산 7²+1=50이 일치. 답안 공식 판본 동일성은 미확정.'
data['reviewSummary']['independentMathCount']=len(data['items'])
data['reviewSummary']['sourceTypes']=len(data['availableSourceNos'])
data['reviewSummary']['sourceDrawingCount']=len({x['sourceNo'] for x in data['items'] if x.get('asset')})
data['reviewSummary']['outputReviewed']=False
index['version']=data['version']
index['itemCount']=len(data['items'])
index['pendingSourceNos']=[]
index['items'].append({'sourceNo':29,'genId':'applied3-q29','area':'도형',
                       'subarea':'곡선과 면','detailType':'큰 원 안에 그린 여러 원이 나누는 최대 면의 수',
                       'pointBand':'4.2','reviewStatus':'verified','variantCount':9})
index['items'].sort(key=lambda x:x['sourceNo'])
DATA.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
INDEX.write_text(json.dumps(index,ensure_ascii=False,indent=2)+'\n')
print('Built Applied3 Q29: nine source-example variants; answers',[x['answerParts'][0] for x in items])
