#!/usr/bin/env python3
"""Verify the directly inspected Applied5 Q27 source equations and answer candidate."""
import hashlib,itertools,json
from pathlib import Path
from PIL import Image,ImageChops

ROOT=Path(__file__).resolve().parents[1]
WORK=ROOT/'.private-work/hw-expansion-20261023/hw5/q27-source-review'
EXAM=ROOT/'materials/초등과정 대비 실전 모의고사활용 5회.pdf'
ANSWER=Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 5회 답안.pdf')
PAGE=WORK/'exam-6.png'; ANSWER_PAGE=WORK/'answer-27.png'; CROP=WORK/'q27-equation-box.png'
BOX=(100,365,710,590)
LETTERS='ABCDEFGHK'

def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()

def main():
    page=Image.open(PAGE);expected=page.crop(BOX);crop=Image.open(CROP)
    assert crop.size==expected.size and ImageChops.difference(crop,expected).getbbox() is None
    assert Image.open(ANSWER_PAGE).size[0]>1000
    solutions=[]
    for values in itertools.permutations(range(1,10)):
        v=dict(zip(LETTERS,values))
        if (v['H']*v['K']==10*v['B']+v['K'] and
            v['C']**3==v['D'] and
            v['D']*(11*v['E'])==11*v['D'] and
            v['A']**2==10*v['F']+v['A'] and
            v['F']**3==10*v['C']+v['G']):
            solutions.append(v)
    assert len(solutions)==1 and solutions[0]=={'A':6,'B':4,'C':2,'D':8,'E':1,'F':3,'G':7,'H':9,'K':5}
    result={'result':'PASS','sourceExamPage':6,'sourceAnswerPage':27,'sourceExamSha256':sha(EXAM),
        'sourceAnswerSha256':sha(ANSWER),'directQuestionPageReviewed':True,'directAnswerPageReviewed':True,
        'equationFigurePixelCropMatches':True,'equations':['H×K=BK','C×C×C=D','D×EE=DD','A×A=FA','F×F×F=CG'],
        'solutionCount':1,'uniqueAssignment':solutions[0],'answerCandidateH':9,
        'answerKeyStatus':'답안 PDF에 손글씨 후보 9가 보이며, 공식 채점표인지 확인되지 않음.'}
    (WORK/'q27-original-math-proof.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
    print('PASS Applied5 Q27 source puzzle: five equations, nine distinct digits, exhaustive 9! assignments, one solution with H=9.')

if __name__=='__main__': main()
