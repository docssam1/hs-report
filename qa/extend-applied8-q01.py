#!/usr/bin/env python3
"""Expand Applied 8 Q1's existing shape-digit arithmetic puzzle type."""
from __future__ import annotations
import hashlib,itertools,json
from pathlib import Path
from pypdf import PdfReader
from PIL import Image

ROOT=Path(__file__).resolve().parents[1];WORK=ROOT/".private-work/hw-expansion-20261023/hw8"
SOURCE=ROOT/"materials/초등과정 대비 실전 모의고사활용 8회.pdf";ANSWER=WORK/"source-review/applied8-answer-drive-copy-q07.pdf"
SOURCE_ID="1H2KxzZHzeTve5thcTpTrJLEeNyl0F_ae";ANSWER_ID="1ixxsCBOTS4SqJ4PXJesvzHzyQfcBW06p"
RENDER=WORK/"q1-source-review/original-1.png";CROP=ROOT/"bank/assets/applied8/q1-shape-arithmetic-original.png"
DATA=ROOT/"bank/data/applied8-expanded.json";INDEX=ROOT/"bank/data/applied8-expanded-index.json"
VERSION="20261025-applied8-expansion-q01-q04-q05-q06-q07-q08-q09-q10-q13-q14-q15-q17-q18-q20-q21-q22-q23-q24-q25-q26-q27-q28-q29-q30-r24"
# (unit-shape in the two-digit addend, its tens digit, result digit order, second operator, repeated result shape)
CASES=[('T',8,'CST','-', 'T'),('S',5,'TSC','-','T'),('S',7,'CTS','-','T'),('S',8,'CST','-','T'),
       ('S',9,'CST','-','C'),('C',3,'TCS','-','T'),('C',9,'CST','-','C'),('T',1,'TSC','-','T'),('T',9,'STC','+','T')]
LETTERS='SCT'

def sha(p:Path)->str:return hashlib.sha256(p.read_bytes()).hexdigest()
def solve(case):
    addshape,k,order,op,target=case;sol=[]
    for s,c,t in itertools.product(range(10),repeat=3):
        d={'S':s,'C':c,'T':t}
        first=11*s+11*c+10*k+d[addshape]
        result=100*d[order[0]]+10*d[order[1]]+d[order[2]]
        second=11*s-11*c if op=='-' else 11*s+11*c
        if s==0 or c==0 or d[order[0]]==0:continue
        if first==result and second==11*d[target]:sol.append({'S':s,'C':c,'T':t})
    assert len(sol)==1,(case,sol)
    return sol[0]

def shape(letter,x,y):
    if letter=='S':return f'<rect x="{x-14}" y="{y-13}" width="28" height="26" fill="white" stroke="#191511" stroke-width="2.2"/>'
    if letter=='C':return f'<circle cx="{x}" cy="{y}" r="13" fill="white" stroke="#191511" stroke-width="2.2"/>'
    return f'<polygon points="{x},{y-15} {x-15},{y+12} {x+15},{y+12}" fill="white" stroke="#191511" stroke-width="2.2"/>'
def svg(case):
    addshape,k,order,op,target=case;parts=[];rows=[(116,'S','S'),(154,'C','C'),(192,str(k),addshape),(230,order[0],order[1],order[2])]
    for y,*els in rows:
        if len(els)==2:
            parts.extend(shape(a,x,y) if a in LETTERS else f'<text x="{x}" y="{y+9}" text-anchor="middle" font-size="26" font-family="Noto Serif KR,serif" fill="#191511">{a}</text>' for a,x in zip(els,[162,204]))
        else:
            parts.extend(shape(a,x,y) for a,x in zip(els,[120,162,204]))
    parts.extend([f'<text x="93" y="201" text-anchor="middle" font-size="28" font-family="Noto Serif KR,serif" fill="#191511">+</text>',
                  '<line x1="98" y1="211" x2="224" y2="211" stroke="#191511" stroke-width="2"/>'])
    opx=348
    parts.extend([shape('S',opx,130),shape('S',opx+42,130),
                  f'<text x="{opx-26}" y="177" text-anchor="middle" font-size="28" font-family="Noto Serif KR,serif" fill="#191511">{op}</text>',
                  shape('C',opx,170),shape('C',opx+42,170),
                  '<line x1="320" y1="190" x2="402" y2="190" stroke="#191511" stroke-width="2"/>',
                  shape(target,opx+10,222),shape(target,opx+52,222)])
    return '<svg xmlns="http://www.w3.org/2000/svg" width="440" height="270" viewBox="0 0 440 270">'+''.join(parts)+'</svg>'

def item(i,case):
    addshape,k,order,op,target=case;d=solve(case);answer=d['T'];ss=11*d['S'];cc=11*d['C'];term=10*k+d[addshape];result=100*d[order[0]]+10*d[order[1]]+d[order[2]];second=ss-cc if op=='-' else ss+cc;repeated=11*d[target]
    steps=[f"첫째 식에서 같은 네모 두 개는 {ss}, 같은 동그라미 두 개는 {cc}, {k}와 {addshape}가 있는 수는 {term}이고, 오른쪽 세 자리 수는 {result}입니다.",
      f"둘째 식은 {ss}{op}{cc}={repeated}이므로 네모·동그라미·세모의 값을 식에 대입해 두 식을 함께 만족하는 한 자리 수를 찾습니다. 첫째 식의 백의 자리 모양은 0이 될 수 없습니다.",
      f"두 식을 만족하는 값은 네모 {d['S']}, 동그라미 {d['C']}, 세모 {d['T']} 하나뿐입니다. 따라서 △가 나타내는 수는 {answer}입니다. 정수 후보 000~999를 모양 자리에 대입해도 같은 해만 남습니다."]
    asset={'kind':'raster','src':'assets/applied8/q1-shape-arithmetic-original.png','description':'활용 8회 원문 1번의 도형 암호식 두 식을 원본 PDF에서 그대로 crop'} if i==1 else {'kind':'svg','src':f'assets/applied8/q1-shape-arithmetic-v{i}.svg','description':'두 자리 반복 도형 수의 덧셈·뺄셈 암호식'}
    return {'id':f'applied8-q01-v{i}','genId':'applied8-q01','sourceSet':'applied','sourceRound':8,'sourceNo':1,'variantNo':i,'reviewStatus':'verified',
      'area':'수와 식','subarea':'수식 퍼즐','detailType':'도형이 나타내는 수를 두 암호식에 대입해 찾기','pointBand':'2.7',
      'text':'다음 모양에서 같은 모양은 같은 숫자를 나타냅니다. △가 나타내는 수를 구하세요.','asset':asset,'answer':str(answer),'answerParts':[answer],'answerLabels':['△가 나타내는 수'],'acceptedAnswers':[str(answer),f'{answer}입니다'],'answerContract':'single-number',
      'solutionSteps':steps,'solution':' '.join(steps),'learningPoint':'반복된 도형을 같은 한 자리 수로 바꾸어 세로 덧셈과 뺄셈 식을 함께 만족시키기','learningLocation':'활용 8회 · 원문 1번 · 도형 암호식의 덧셈과 뺄셈',
      'verification':{'primaryMethod':'각 도형에 한 자리 수를 대입해 두 세로식을 동시에 만족하는 값을 찾는다.','independentMethod':'0~9의 세 도형 값 전체를 열거하며 선행 자리 0을 제외하고 두 산술식을 대조한다.',
        'parameters':{'case':list(case),'uniqueSolution':d,'answer':answer,'firstEquation':f'{ss}+{cc}+{term}={result}','secondEquation':f'{ss}{op}{cc}={repeated}','enumeratedDigitAssignments':1000},
        'independentSuite':'qa/applied8-q01-independent-validate.py','sourceExamPage':1,'sourceExamFile':SOURCE.name,'sourceExamDriveFileId':SOURCE_ID,'sourceAnswerPage':1,'sourceAnswerDriveFileId':ANSWER_ID,
        'sourceDrawingCompared':True,'sourceDrawingPresent':True,'sourceDrawingPixelExactCrop':i==1,
        'officialAnswerStatus':'The available Drive answer candidate is an unmarked exam duplicate; answers are independently derived by exhaustive digit assignment, not taken from a printed key.','studentDifficultyMeasured':False},
      'difficultyEvidence':{'basis':'source-point-band','label':'하','sourceReasoningPreserved':True,'measuredVariantRate':None,'estimated':False,'rationale':'활용 8회 원문 1번은 1~12번의 2.7점 배점대다. 활용 난도는 배점대만 적용한다.'}}

def main():
    ep=PdfReader(str(SOURCE)).pages[0];ap=PdfReader(str(ANSWER)).pages[0];norm=lambda x:''.join((x or '').split())
    assert norm(ep.extract_text())==norm(ap.extract_text()) and '같은모양은같은숫자' in norm(ep.extract_text())
    data=json.loads(DATA.read_text());idx=json.loads(INDEX.read_text());assert not any(x['sourceNo']==1 for x in data['items'])
    CROP.parent.mkdir(parents=True,exist_ok=True);Image.open(RENDER).crop((210,755,760,990)).save(CROP)
    items=[item(i,c) for i,c in enumerate(CASES,1)];data['items'].extend(items);nos=sorted({x['sourceNo'] for x in data['items']})
    data['availableSourceNos']=nos;data['pendingSourceNos']=[n for n in range(1,31) if n not in nos];data['itemCount']=len(data['items']);data['version']=VERSION;data['policy']['newSourceTypes']=0
    idx['items'].append({'sourceNo':1,'genId':'applied8-q01','area':'수와 식','subarea':'수식 퍼즐','detailType':'도형이 나타내는 수를 두 암호식에 대입해 찾기','pointBand':'2.7','reviewStatus':'verified','variantCount':9})
    idx['items'].sort(key=lambda x:x['sourceNo']);idx['pendingSourceNos']=data['pendingSourceNos'];idx['itemCount']=data['itemCount'];idx['version']=VERSION
    for i,c in enumerate(CASES[1:],2):(ROOT/f'bank/assets/applied8/q1-shape-arithmetic-v{i}.svg').write_text(svg(c),encoding='utf-8')
    DATA.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');INDEX.write_text(json.dumps(idx,ensure_ascii=False,indent=2)+'\n')
    rows=[]
    for c in CASES:
        d=solve(c);rows.append({'case':list(c),'uniqueSolution':d,'answer':d['T']})
    review={'sourceExam':{'file':SOURCE.name,'driveFileId':SOURCE_ID,'sha256':sha(SOURCE),'page':1,'questionNo':1,'directVisualReview':True,'stem':norm(ep.extract_text()),'sourceFigure':'two vertical equations: repeated square/circle numbers plus a two-digit term; repeated-shape subtraction'},
      'sourceCrop':{'file':str(CROP.relative_to(ROOT)),'sha256':sha(CROP),'sizePixels':list(Image.open(CROP).size),'cropOnlyFromOriginalRenderedPage':True},
      'answerCandidate':{'file':ANSWER.name,'driveFileId':ANSWER_ID,'sha256':sha(ANSWER),'page':1,'directVisualReview':True,'containsAnswers':False,'pageTextMatchesQuestionPdf':True},
      'answerSourceConclusion':'The answer candidate is an unmarked exam duplicate. Source answer 8 is independently solved from □□+○○+8△=○□△ and □□−○○=△△.',
      'sourceIndependentAnswer':solve(CASES[0])['T'],'sourceSolution':solve(CASES[0]),'variantCount':9,'newSourceTypes':0,'difficulty':'2.7-point band only = low'}
    (WORK/'q01-source-answer-review.json').write_text(json.dumps(review,ensure_ascii=False,indent=2)+'\n')
    (WORK/'q01-independent-math.json').write_text(json.dumps({'digitAssignmentsPerCase':1000,'leadingDigitRule':'repeated two-digit operands and three-digit result may not begin with zero','enumeration':'all (square,circle,triangle) in 0..9; substitute into both exact column equations','cases':rows},ensure_ascii=False,indent=2)+'\n')
    print(f"PASS Q1 source + variants: answers={[x['answer'] for x in items]}; inventory={data['itemCount']}; types={len(nos)}; r24")
if __name__=='__main__':main()
