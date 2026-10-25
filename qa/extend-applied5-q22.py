#!/usr/bin/env python3
"""Expand Applied 5 Q22 using only digit-rearrangement additions of the source type."""
import hashlib
import itertools
import json
from pathlib import Path
import xml.etree.ElementTree as ET

from PIL import Image, ImageChops
from pypdf import PdfReader

ROOT=Path(__file__).resolve().parents[1]
WORK=ROOT/'.private-work/hw-expansion-20261023/hw5'
OUT=WORK/'q22-r16'
DATA_PATH=ROOT/'bank/data/applied5-expanded.json'
INDEX_PATH=ROOT/'bank/data/applied5-expanded-index.json'
ASSET_DIR=ROOT/'bank/assets/applied5'
EXAM=ROOT/'materials/초등과정 대비 실전 모의고사활용 5회.pdf'
ANSWER=Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 5회 답안.pdf')
EXAM_RENDER=WORK/'q22-source-p4-direct.png'
ANSWER_RENDER=WORK/'q22-answer-p22-direct.png'
EXAM_CROP=WORK/'q22-source-figure-original-crop.png'
ANSWER_CROP=WORK/'q22-answer-candidate-original-crop.png'
EXAM_ID='1x7CevkWByUrXPqfbV5xTHidJPNDrbuJp'
ANSWER_ID='1QGjWnEBjULxwy4BBX8tLutpGbjQfEh05'
VERSION='20261025-applied5-expansion-q03-q05-q06-q08-q09-q11-q12-q14-q15-q16-q17-q18-q19-q20-q22-r16'
START_ORDER=[6,2,1,4,5,3,8,0,7]
DIGIT_POOLS=[tuple(range(1,10))]+[tuple(d for d in range(10) if d!=m) for m in (9,8,7,6,5,4,3,2)]
TARGETS=[1638,1638,1639,1640,1641,1642,1643,1635,1636]
SOURCE_PIXELS=(1823,2580)
SOURCE_CROP_BOX=(910,1210,1790,1880)
ANSWER_CROP_BOX=(800,150,2304,1296)

def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()

def start_digits(ds): return [ds[i] for i in START_ORDER]

def numbers(ds):
    return [100*ds[0]+10*ds[1]+ds[2],100*ds[3]+10*ds[4]+ds[5],100*ds[6]+10*ds[7]+ds[8]]

def arrangements(ds,target):
    out=[]
    for p in itertools.permutations(ds):
        if p[0]==0 or p[3]==0 or p[6]==0: continue
        vals=numbers(p)
        if sum(vals)==target: out.append(vals)
    return out

def svg(start,target):
    a,b,c=start
    # The source layout is retained: crossed-out attempted sum on the left,
    # three blank operand rows and the target sum on the right.
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="650" height="310" viewBox="0 0 650 310" role="img" aria-label="세 수 {a}, {b}, {c}의 숫자 위치를 바꾸어 합 {target}을 만드는 덧셈 그림">
<rect width="650" height="310" fill="#fff"/>
<g fill="#191511" font-family="serif" font-size="25" text-anchor="middle">
 <text x="126" y="65">{a//100}</text><text x="180" y="65">{a//10%10}</text><text x="234" y="65">{a%10}</text>
 <text x="126" y="111">{b//100}</text><text x="180" y="111">{b//10%10}</text><text x="234" y="111">{b%10}</text>
 <text x="126" y="157">{c//100}</text><text x="180" y="157">{c//10%10}</text><text x="234" y="157">{c%10}</text>
 <text x="84" y="157">+</text>
 <text x="96" y="205" font-size="23">{target}</text>
 <text x="80" y="276" font-size="22">+</text>
 <text x="410" y="276" font-size="23">{target//1000}</text><text x="455" y="276" font-size="23">{target//100%10}</text><text x="500" y="276" font-size="23">{target//10%10}</text><text x="545" y="276" font-size="23">{target%10}</text>
</g>
<g fill="none" stroke="#2a241c" stroke-width="1.8">
 <line x1="91" y1="174" x2="251" y2="174"/>
 <line x1="369" y1="174" x2="575" y2="174"/>
 <line x1="91" y1="220" x2="251" y2="186"/><line x1="91" y1="186" x2="251" y2="220"/>
 <line x1="373" y1="174" x2="373" y2="194"/>
 <line x1="397" y1="194" x2="563" y2="194"/>
 <rect x="397" y="35" width="45" height="39"/><rect x="455" y="35" width="45" height="39"/><rect x="513" y="35" width="45" height="39"/>
 <rect x="397" y="81" width="45" height="39"/><rect x="455" y="81" width="45" height="39"/><rect x="513" y="81" width="45" height="39"/>
 <rect x="397" y="127" width="45" height="39"/><rect x="455" y="127" width="45" height="39"/><rect x="513" y="127" width="45" height="39"/>
</g></svg>'''

def item(v,ds,target,answers):
    start=numbers(start_digits(ds)); canonical=tuple(answers[0])
    if v==1 and (796,524,318) in {tuple(a) for a in answers}: canonical=(796,524,318)
    hs=sum(n//100 for n in canonical); ts=sum(n//10%10 for n in canonical); us=sum(n%10 for n in canonical)
    text=f'아래 세 수에 사용된 숫자의 위치를 서로 바꾸어 합이 {target}이 되도록 빈칸에 한 가지 배열을 쓰세요.'
    steps=[
        f'처음 식에 나온 숫자들을 모두 한 번씩 사용합니다. 한 가지 배열은 {canonical[0]}, {canonical[1]}, {canonical[2]}입니다.',
        f'백의 자리 숫자 합은 {hs}, 십의 자리 숫자 합은 {ts}, 일의 자리 숫자 합은 {us}입니다.',
        f'자릿값을 적용하면 {100*hs}+{10*ts}+{us}={target}이므로 조건에 맞습니다.',
        '자리 배치에 따라 다른 정답도 있습니다. 답안 입력은 모든 유효한 세 수 배열을 허용합니다.'
    ]
    return {'id':f'applied5-q22-v{v}','genId':'applied5-q22','sourceSet':'applied','sourceRound':5,
        'sourceNo':22,'variantNo':v,'reviewStatus':'verified','area':'수와 식','subarea':'자릿값과 덧셈',
        'detailType':'숫자 위치를 바꾸어 세 수의 합 맞추기','pointBand':'3.4','text':text,
        'asset':{'kind':'svg','src':f'assets/applied5/q22-v{v}.svg','description':'처음 세 수와 빈칸 세로 덧셈의 배열 그림'},
        'answer':', '.join(map(str,canonical)),'answerParts':list(canonical),
        'answerLabels':['가능한 세 수 한 가지 (쉼표로 구분)'],
        'acceptedAnswers':[', '.join(map(str,canonical))],
        'acceptedAnswerParts':[list(map(int,x)) for x in answers],
        'answerContract':'unordered-set','solutionSteps':steps,'solution':' '.join(steps),
        'learningPoint':'백·십·일의 자리 숫자 합에 자릿값을 곱해 세 수의 합을 확인한다.',
        'learningLocation':'활용 5회 · 원문 22번 · 자릿값과 숫자 재배열 덧셈',
        'verification':{'primaryMethod':'모든 입력 숫자의 위치를 바꿀 수 있는 배열을 대상으로 세 수의 합을 계산한다.',
            'independentMethod':'9개 숫자의 모든 순열을 전수 열거하고 백의 자리 0 배제, 숫자 중복 없음, 세 수의 합 조건을 검사한다.',
            'parameters':{'digitPool':list(ds),'targetSum':target,'startingNumbers':start,
                'startingSum':sum(start),'answerArrangementCount':len(answers),
                'canonicalAnswer':list(canonical),'canonicalColumnSums':{'hundreds':hs,'tens':ts,'ones':us},
                'solutionSetSha256':hashlib.sha256(json.dumps(answers,separators=(',',':')).encode()).hexdigest()},
            'independentSuite':'qa/applied5-q22-independent-validate.py','sourceExamPage':4,
            'sourceExamFile':EXAM.name,'sourceExamDriveFileId':EXAM_ID,'sourceAnswerPage':22,
            'sourceAnswerFile':ANSWER.name,'sourceAnswerDriveFileId':ANSWER_ID,
            'sourceDrawingCompared':True,'sourceDrawingPresent':True,
            'sourceAnswerStatus':'답안 PDF p22의 손글씨 배열 예시를 확인했다. 인쇄된 공식 정답표는 확인하지 않았으며, 전수 계산은 다수의 유효 배열을 산출한다.',
            'variantDrawingType':'source-addition-layout-same-nine-digit-rearrangement',
            'studentDifficultyMeasured':False},
        'difficultyEvidence':{'basis':'source-point-band','label':'중','sourceReasoningPreserved':True,
            'measuredVariantRate':None,'estimated':False,
            'rationale':'활용 5회 원문 22번은 13~22번 3.4점 배점대다. 활용 난도는 배점대만 적용한다.'}}

def main():
    assert sha(EXAM)=='5a258dad75459598920ecf5e221db1b4d94dfc5899a2260cf3e7f0b121fe8d2c'
    assert sha(ANSWER)=='6559ed2c3ec8c5a4908c9decaec66dc19f566ef8f672dc02dc47d96dcf9d879e'
    assert EXAM_RENDER.is_file() and ANSWER_RENDER.is_file()
    assert Image.open(EXAM_RENDER).size==SOURCE_PIXELS
    source_page=Image.open(EXAM_RENDER); source_crop=source_page.crop(SOURCE_CROP_BOX)
    source_crop.save(EXAM_CROP)
    answer_page=Image.open(ANSWER_RENDER); answer_crop=answer_page.crop(ANSWER_CROP_BOX); answer_crop.save(ANSWER_CROP)
    assert source_crop.size==Image.open(EXAM_CROP).size and ImageChops.difference(source_crop,Image.open(EXAM_CROP)).getbbox() is None
    source_text=''.join((WORK/'q22-source-page-4-vision.txt').read_text().split())
    assert '관호는아래식을계산하는데더하는숫자들중에몇개를' in source_text and '1638' in source_text
    answer_text=(WORK/'q22-answer-page-22-vision.txt').read_text()
    assert '22.' in answer_text and '1638' in answer_text and '524' in answer_text
    assert '136' in answer_text and '978' in answer_text
    exam=PdfReader(str(EXAM)); answer_pdf=PdfReader(str(ANSWER))
    assert len(exam.pages)==6 and len(answer_pdf.pages)==31
    page_text=''.join((exam.pages[3].extract_text() or '').split())
    assert '1638' in page_text and '더하는숫자들중몇개의위치를서로바꿔보세요' in page_text
    review={'sourceExam':{'file':EXAM.name,'driveFileId':EXAM_ID,'bytes':EXAM.stat().st_size,'sha256':sha(EXAM),'pages':len(exam.pages),'page':4,'questionNo':22,'directVisualReview':True,'cropBox':SOURCE_CROP_BOX,'figureCrop':str(EXAM_CROP.relative_to(ROOT)),'figureCropSha256':sha(EXAM_CROP)},
        'sourceAnswer':{'file':ANSWER.name,'driveFileId':ANSWER_ID,'bytes':ANSWER.stat().st_size,'sha256':sha(ANSWER),'pages':len(answer_pdf.pages),'page':22,'directVisualReview':True,'officialKeyStatus':'손글씨 답안 후보만 확인. 공식 정답표 여부는 미확인.','teacherAnnotatedExamples':[[796,524,318],[136,524,978]],'answerCrop':str(ANSWER_CROP.relative_to(ROOT)),'answerCropSha256':sha(ANSWER_CROP)},
        'sourceQuestionText':'관호는 아래 식을 계산하는 데 더하는 숫자들 중에 몇 개를 잘못 적어 더한 값이 1638이 나오지 않습니다. 답이 1638이 되도록 더하는 숫자들 중 몇 개의 위치를 서로 바꿔보세요.',
        'sourceNumbers':[732,564,918],'sourceActualSum':2214,'targetSum':1638,
        'sourceDigitPool':list(range(1,10)),'teacherAnnotationsIndependentlyVerified':True,
        'sourceTypesAdded':1,'variants':9,'answerMultiplicityImportant':True}
    (WORK/'q22-source-answer-review-r16.json').write_text(json.dumps(review,ensure_ascii=False,indent=2)+'\n')
    data=json.loads(DATA_PATH.read_text()); index=json.loads(INDEX_PATH.read_text())
    assert data['version'].endswith('q20-r15') and len(data['items'])==198
    assert data['pendingSourceNos']==index['pendingSourceNos']==[22,23,24,25,26,27,28,29]
    assert 22 not in data['availableSourceNos'] and not any(x['sourceNo']==22 for x in data['items'])
    assert len(DIGIT_POOLS)==len(TARGETS)==9
    ASSET_DIR.mkdir(parents=True,exist_ok=True); OUT.mkdir(parents=True,exist_ok=True)
    variants=[]
    for v,(ds,target) in enumerate(zip(DIGIT_POOLS,TARGETS),1):
        answers=arrangements(ds,target)
        assert answers and len(set(tuple(a) for a in answers))==len(answers)
        start=numbers(start_digits(ds)); assert sum(start)!=target
        assert all(set(str(n))<=set(map(str,ds)) for n in start)
        if v==1:
            valid={tuple(x) for x in answers}
            assert (796,524,318) in valid and (136,524,978) in valid
        xml=svg(start,target)
        ET.fromstring(xml)
        (ASSET_DIR/f'q22-v{v}.svg').write_text(xml,encoding='utf-8')
        variants.append(item(v,ds,target,answers))
    pos=max(i for i,x in enumerate(data['items']) if x['sourceNo']==21)+1
    data['items'][pos:pos]=variants
    data['version']=VERSION
    data['availableSourceNos']=sorted(data['availableSourceNos']+[22])
    data['pendingSourceNos']=[n for n in data['pendingSourceNos'] if n!=22]
    data['reviewSummary'].update({'independentMathCount':207,'sourceTypes':23,'variantsPerType':9,'sourceDrawingCount':108})
    index['items'].append({'sourceNo':22,'genId':'applied5-q22','area':'수와 식','subarea':'자릿값과 덧셈','detailType':'숫자 위치를 바꾸어 세 수의 합 맞추기','pointBand':'3.4','reviewStatus':'verified','variantCount':9})
    index['items'].sort(key=lambda x:x['sourceNo'])
    index.update({'version':VERSION,'itemCount':len(data['items']),'pendingSourceNos':data['pendingSourceNos']})
    assert len(data['items'])==index['itemCount']==207 and data['pendingSourceNos']==[23,24,25,26,27,28,29]
    DATA_PATH.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
    INDEX_PATH.write_text(json.dumps(index,ensure_ascii=False,indent=2)+'\n')
    proof={'sourceQuestion':22,'sourcePage':4,'answerCandidatePage':22,'sourceExamSha256':sha(EXAM),'sourceAnswerSha256':sha(ANSWER),
        'sourceCropPixelExact':True,'digitPools':[list(ds) for ds in DIGIT_POOLS],'targets':TARGETS,
        'variants':[{'variant':i+1,'start':numbers(start_digits(ds)),'startSum':sum(numbers(start_digits(ds))),'target':target,
            'validArrangements':len(item['acceptedAnswerParts']),'canonical':item['answerParts'],
            'allDigitsUsedOnce':True,'noLeadingZero':True} for i,(ds,target,item) in enumerate(zip(DIGIT_POOLS,TARGETS,variants))],
        'sourceTeacherExamplesVerified':[[796,524,318],[136,524,978]],'newTypes':1,'pending':[23,24,25,26,27,28,29],
        'dataSha256':sha(DATA_PATH),'indexSha256':sha(INDEX_PATH)}
    (WORK/'q22-independent-math-r16.json').write_text(json.dumps(proof,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'result':'PASS generated','dataVersion':VERSION,'itemCount':207,'availableTypes':23,'pending':[23,24,25,26,27,28,29],
        'variantArrangementCounts':[len(x['acceptedAnswerParts']) for x in variants],
        'sourceCandidateExamplesVerified':True,'dataSha256':sha(DATA_PATH),'indexSha256':sha(INDEX_PATH)},ensure_ascii=False))

if __name__=='__main__': main()
