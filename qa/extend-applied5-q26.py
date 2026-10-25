#!/usr/bin/env python3
"""Extend the existing Applied 5 Q26 breeding-growth type with nine variants."""
import hashlib, json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
WORK=ROOT/'.private-work/hw-expansion-20261023/hw5'
DATA_PATH=ROOT/'bank/data/applied5-expanded.json'
INDEX_PATH=ROOT/'bank/data/applied5-expanded-index.json'
EXAM=ROOT/'materials/초등과정 대비 실전 모의고사활용 5회.pdf'
ANSWER=Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 5회 답안.pdf')
EXAM_PAGE=WORK/'q23-source-review/exam-5.png'
ANSWER_PAGE=WORK/'q26-source-review/answer.png'
EXAM_ID='1x7CevkWByUrXPqfbV5xTHidJPNDrbuJp'
ANSWER_ID='1QGjWnEBjULxwy4BBX8tLutpGbjQfEh05'
VERSION='20261025-applied5-expansion-q03-q05-q06-q08-q09-q11-q12-q14-q15-q16-q17-q18-q19-q20-q22-q26-r17'
PARAMETERS=[(1,2,2),(2,2,2),(1,3,2),(2,3,2),(1,4,2),(2,4,2),(1,5,2),(2,5,2),(1,3,4)]

def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def answers(pairs,eggs,clutches):
    per_pair=eggs*clutches
    sep0=pairs*(2+per_pair)
    growth=1+per_pair//2
    return [sep0*growth,sep0*growth*growth]

def make_item(no,pairs,eggs,clutches):
    per_pair=eggs*clutches
    sep0=pairs*(2+per_pair)
    growth=1+per_pair//2
    a1,a2=answers(pairs,eggs,clutches)
    steps=[
      f'한 쌍이 낳는 새끼는 {eggs}×{clutches}={per_pair}마리입니다. 올해 9월에는 처음 온 어른 제비 {pairs}×2마리와 새끼 {pairs}×{per_pair}마리가 함께 날아가므로 {pairs}×(2+{per_pair})={sep0}마리입니다.',
      f'새끼는 수컷과 암컷 수가 같고, 돌아온 제비는 모두 짝을 지어 번식합니다. 한 해 뒤에는 제비 {sep0}마리가 {sep0}÷2={sep0//2}쌍이 되어 새끼 {sep0//2}×{per_pair}마리를 낳으므로 {sep0}+{sep0//2}×{per_pair}={a1}마리가 됩니다.',
      f'다음 해에는 같은 방식으로 {a1}+{a1}÷2×{per_pair}={a2}마리가 됩니다. 따라서 올해 9월부터 1년 뒤와 2년 뒤 9월에 날아가는 제비는 차례로 {a1}마리와 {a2}마리입니다.'
    ]
    text=(f'올해 3월에 제비가 {pairs}쌍 날아왔습니다. 한 쌍은 {eggs}알씩 {clutches}번 알을 낳고, 알에서 나온 새끼는 언제나 수컷과 암컷 수가 같습니다. '
          f'새끼들은 모두 자라 1년 뒤 3월에 돌아오며, 돌아온 제비는 모두 한 쌍씩 짝을 지어 같은 수의 알을 낳습니다. 알에서 나온 새끼들은 9월에 어른 제비와 함께 날아갔다가 1년 뒤 3월에 돌아옵니다. '
          '올해 9월부터 1년 뒤와 2년 뒤 9월에 날아가는 제비 수를 차례로 구하시오.')
    return {
      'id':f'applied5-q26-v{no}','genId':'applied5-q26','sourceSet':'applied','sourceRound':5,'sourceNo':26,'variantNo':no,'reviewStatus':'verified',
      'area':'수와 식','subarea':'규칙과 대응','detailType':'짝을 지어 번식하는 새의 해마다 개체 수 변화','pointBand':'4.2','text':text,
      'answer':f'{a1}, {a2}','answerParts':[a1,a2],'answerLabels':['1년 뒤 9월','2년 뒤 9월'],
      'acceptedAnswers':[f'{a1}, {a2}',f'{a1},{a2}'],'answerContract':'ordered-parts','solutionSteps':steps,'solution':' '.join(steps),
      'learningPoint':'한 번의 번식에서 늘어나는 새끼 수를 구한 뒤, 암수 짝의 수에 따라 매년 개체 수가 어떻게 반복 증가하는지 계산하기',
      'learningLocation':'활용 5회 · 원문 26번 · 암수 짝짓기와 해마다 반복되는 개체 수 증가',
      'verification':{'primaryMethod':'올해 9월의 전체 개체 수를 구한 다음, 매해 모든 제비가 짝을 지어 같은 수의 새끼를 낳는 과정을 두 차례 반복한다.',
       'independentMethod':'올해 9월의 개체 수에서 시작해 매년 N + (N÷2)×(알 수×산란 횟수)를 직접 시뮬레이션한다.',
       'parameters':{'initialPairs':pairs,'eggsPerClutch':eggs,'clutchesPerPair':clutches,'chicksPerPair':per_pair,'firstSeptemberTotal':sep0,'yearlyGrowthFactor':growth,'year1September':a1,'year2September':a2},
       'independentSuite':'qa/applied5-q26-independent-validate.py','sourceExamPage':5,'sourceExamFile':EXAM.name,'sourceExamDriveFileId':EXAM_ID,
       'sourceAnswerPage':26,'sourceAnswerFile':ANSWER.name,'sourceAnswerDriveFileId':ANSWER_ID,'sourceDrawingCompared':True,'sourceDrawingPresent':False,
       'officialAnswerStatus':'답안 PDF 26쪽 손글씨 계산의 50, 250을 확인했다. 공식 채점표인지 확인되지는 않았으며 원문 조건에서 독립 재현했다.',
       'studentDifficultyMeasured':False},
      'difficultyEvidence':{'basis':'source-point-band','label':'상','sourceReasoningPreserved':True,'measuredVariantRate':None,'estimated':False,
       'rationale':'활용 5회 23~30번은 4.2점 배점대이며 활용 난도는 배점대만 적용한다.'}
    }

def main():
    assert sha(EXAM)=='5a258dad75459598920ecf5e221db1b4d94dfc5899a2260cf3e7f0b121fe8d2c'
    assert sha(ANSWER)=='6559ed2c3ec8c5a4908c9decaec66dc19f566ef8f672dc02dc47d96dcf9d879e'
    assert EXAM_PAGE.is_file() and ANSWER_PAGE.is_file()
    assert EXAM_PAGE.stat().st_size>100_000 and ANSWER_PAGE.stat().st_size>100_000
    data=json.loads(DATA_PATH.read_text()); index=json.loads(INDEX_PATH.read_text())
    assert data['version'].endswith('q22-r16') and 26 in data['pendingSourceNos'] and not any(i['sourceNo']==26 for i in data['items'])
    assert len(PARAMETERS)==len(set(PARAMETERS))==9
    new=[make_item(i,*p) for i,p in enumerate(PARAMETERS,1)]
    assert len({tuple(i['answerParts']) for i in new})==9
    pos=max(n for n,x in enumerate(data['items']) if x['sourceNo']<26)+1
    data['items'][pos:pos]=new; data['version']=VERSION
    data['availableSourceNos']=sorted(set(data['availableSourceNos']+[26]))
    data['pendingSourceNos']=[n for n in data['pendingSourceNos'] if n!=26]
    data['reviewSummary'].update({'independentMathCount':216,'sourceTypes':24,'variantsPerType':9})
    index['items'].append({'sourceNo':26,'genId':'applied5-q26','area':'수와 식','subarea':'규칙과 대응','detailType':'짝을 지어 번식하는 새의 해마다 개체 수 변화','pointBand':'4.2','reviewStatus':'verified','variantCount':9})
    index['items'].sort(key=lambda x:x['sourceNo']); index.update({'version':VERSION,'itemCount':len(data['items']),'pendingSourceNos':list(data['pendingSourceNos'])})
    assert len(data['items'])==index['itemCount']==216
    DATA_PATH.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n'); INDEX_PATH.write_text(json.dumps(index,ensure_ascii=False,indent=2)+'\n')
    review={'sourceExam':{'file':EXAM.name,'driveFileId':EXAM_ID,'sha256':sha(EXAM),'page':5,'questionNo':26,'directVisualReview':True,'visualPage':str(EXAM_PAGE.relative_to(ROOT)),
                         'sourceText':'올해 3월에 제비 두 마리가 와서 쌍을 짓고 4알씩 2번 낳는다. 새끼는 암수가 반씩이며, 9월에 함께 떠나 1년 뒤 3월에 돌아온다. 1년 뒤와 2년 뒤 9월에 떠나는 수를 묻는다.'},
            'sourceAnswer':{'file':ANSWER.name,'driveFileId':ANSWER_ID,'sha256':sha(ANSWER),'page':26,'directVisualReview':True,'visualPage':str(ANSWER_PAGE.relative_to(ROOT)),
                            'handwrittenCandidateAnswers':[50,250],'officialKeyStatus':'손글씨 후보만 보이며 공식 채점표인지는 확인되지 않음.'},
            'sourceReproduced':{'firstSeptember':10,'year1September':50,'year2September':250,'method':'10+5×8=50; 50+25×8=250'},'sourceTypesAdded':1,'variantCount':9,'dataVersion':VERSION}
    (WORK/'q26-source-answer-review-r17.json').write_text(json.dumps(review,ensure_ascii=False,indent=2)+'\n')
    print('Built Applied5 Q26: nine variants; source p5 and handwritten answer candidate p26 directly reviewed; answers independently staged for validation.')
if __name__=='__main__': main()
