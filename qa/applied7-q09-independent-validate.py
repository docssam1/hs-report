#!/usr/bin/env python3
"""Independently validate the Applied 7 Q9 source and nine variants."""
import hashlib, json, subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / '.private-work/hw-expansion-20261023/hw7'
DATA = json.loads((ROOT/'bank/data/applied7-expanded.json').read_text())
INDEX = json.loads((ROOT/'bank/data/applied7-expanded-index.json').read_text())
REVIEW = json.loads((WORK/'q09-source-answer-review.json').read_text())
EXAM = ROOT/'materials/초등과정 대비 실전 모의고사활용 7회.pdf'
ANSWER = Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 7회 답안.pdf')
PDFTOTEXT = Path('/Users/docssam/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin/pdftotext')

def sha(path): return hashlib.sha256(path.read_bytes()).hexdigest()

assert sha(EXAM) == REVIEW['sourceExamSha256'] == REVIEW['sourceExam']['sha256']
assert sha(ANSWER) == REVIEW['sourceAnswerSha256'] == REVIEW['sourceAnswer']['sha256']
exam = subprocess.check_output([str(PDFTOTEXT), '-f','2','-l','2','-layout',str(EXAM),'-'], text=True, errors='replace')
answer = subprocess.check_output([str(PDFTOTEXT), '-f','2','-l','2','-layout',str(ANSWER),'-'], text=True, errors='replace')
assert '세 자리 수와 한 자리 수의 합이 300' in exam and '곱이 1184' in exam
assert '세 자리 수와 한 자리 수의 합이 300' in answer and '곱이 1184' in answer
assert REVIEW['directPageImagesCompared'] and REVIEW['sourceAndAnswerMatch']
assert REVIEW['sourceTypeAlreadyPresent'] and REVIEW['newSourceTypesAdded'] == 0

# Original: enumerate possible single-digit factors independently.
original = [(d, 1184//d) for d in range(1,10) if 1184%d == 0 and 100 <= 1184//d <= 999 and d+1184//d == 300]
assert original == [(4,296)] and REVIEW['sourceAnswer']['teacherMarkedAnswer'] == 296

items = [x for x in DATA['items'] if x['sourceNo'] == 9]
assert len(items) == 9
proof=[]
for variant,item in enumerate(items,1):
    p=item['verification']['parameters']; N=p['threeDigitNumber']; d=p['oneDigitNumber']
    assert item['id']==f'applied7-q09-v{variant}' and item['variantNo']==variant
    assert 100<=N<=999 and 1<=d<=9
    assert p['sum']==N+d and p['product']==N*d
    # Primary approach: factor the product by a one-digit divisor.
    factors=[(x,p['product']//x) for x in range(1,10) if p['product']%x==0 and 100<=p['product']//x<=999]
    matches=[(x,y) for x,y in factors if x+y==p['sum']]
    assert matches==[(d,N)]
    assert p['factorCandidates']==[[x,y,x+y] for x,y in factors]
    # Independent approach: test all possible one-digit values in N=sum-d.
    substitution=[x for x in range(1,10) if x*(p['sum']-x)==p['product'] and 100<=p['sum']-x<=999]
    assert substitution==[d] and item['answer']==str(N)
    assert item['pointBand']=='2.7' and item['difficultyEvidence']['label']=='하'
    assert item['verification']['sourceExamPage']==2 and item['verification']['sourceAnswerPage']==2
    assert item['verification']['sourceDrawingPresent'] and not item['verification']['variantUsesSourceDrawing']
    proof.append({'variant':variant,'sum':p['sum'],'product':p['product'],
                  'digitCandidateEnumeration':factors,'uniquePair':matches,
                  'independentSubstitutionCandidates':substitution})

assert DATA['version'].endswith('q07-q09-q10-q11-q12-q13-q14-q15-q16-q18-q20-q21-q22-q23-q24-q25-q26-q27-q28-q29-q30-r26')
assert DATA['availableSourceNos']==[2,3,4,5,6,7,9,10,11,12,13,14,15,16,18,20,21,22,23,24,25,26,27,28,29,30]
assert DATA['itemCount']==234==INDEX['itemCount']
assert len(DATA['pendingSourceNos'])==4 and 9 not in DATA['pendingSourceNos']
assert [x['sourceNo'] for x in INDEX['items']]==DATA['availableSourceNos']
result={'sourceQuestion':9,'sourceTeacherAnswer':296,'sourceAnswerIndependentlyEnumerated':original,
        'directExamAndAnswerPdfPageComparison':True,'newSourceTypesAdded':0,
        'variantCount':9,'allVariantsUseExistingSourceType':True,'variants':proof,
        'dataSha256':sha(ROOT/'bank/data/applied7-expanded.json'),'passed':True}
(WORK/'q09-independent-math.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print('PASS Applied7 Q9: original answer 296; 9 variants each have one unique digit/three-digit pair by two independent methods; new source types 0')
