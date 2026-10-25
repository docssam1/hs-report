#!/usr/bin/env python3
"""Independent source and exhaustive arrangement check for Applied 5 Q8."""
import hashlib
import itertools
import json
import re
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
WORK=ROOT/'.private-work/hw-expansion-20261023/hw5'
DATA=json.loads((ROOT/'bank/data/applied5-expanded.json').read_text())
REVIEW=json.loads((WORK/'q08-source-answer-review.json').read_text())
EXAM=ROOT/'materials/초등과정 대비 실전 모의고사활용 5회.pdf'
ANSWER=Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 5회 답안.pdf')

def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def run_lengths(bits):
    out=[];n=0
    for bit in bits:
        if bit:n+=1
        elif n:out.append(n);n=0
    if n:out.append(n)
    return out

assert sha(EXAM)==REVIEW['sourceExam']['sha256']
assert sha(ANSWER)==REVIEW['sourceAnswer']['sha256']
assert REVIEW['sourceExam']['page']==2 and REVIEW['sourceAnswer']['page']==8
assert REVIEW['sourceExam']['boxCount']==10 and REVIEW['sourceAnswer']['teacherAnswer']==10
assert REVIEW['sourceAnswer']['teacherWork']=='6+3+1=10개'
original=[bits for bits in itertools.product((0,1),repeat=10) if run_lengths(bits)==[3,1,2]]
assert len(original)==10==REVIEW['originalSolution']['answer']
items=[x for x in DATA['items'] if x['sourceNo']==8]
assert len(items)==9 and len({tuple(x['verification']['parameters']['runCounts']) for x in items})==9
for x in items:
    p=x['verification']['parameters'];triple=p['runCounts']
    matches=[bits for bits in itertools.product((0,1),repeat=10) if run_lengths(bits)==triple]
    assert x['answerParts']==[len(matches)]==[p['answer']]
    assert len(x['solutionSteps'])==3 and '음이 아닌 정수해' in x['solutionSteps'][2]
    assert x['area']=='경우의 수' and x['pointBand']=='2.7'
    svg=(ROOT/'bank'/x['asset']['src']).read_text()
    assert svg.count('<rect x=')==20
    circles=re.findall(r'<circle cx="[^"]+" cy="[^"]+" r="14"',svg)
    assert len(circles)==2*sum(triple)
    examples=p['examplePatterns'];assert len(examples)==2 and examples[0]!=examples[1]
    for example in examples:
        bits=tuple(int(ch) for ch in example)
        assert len(bits)==10 and run_lengths(bits)==triple and bits in matches
    assert x['verification']['sourceDrawingCompared'] is True
assert DATA['version'].endswith('q08-q09-q11-q12-q14-q15-q16-r11') and len(DATA['items'])==162
(WORK/'q08-independent-math.json').write_text(json.dumps({'suite':Path(__file__).name,'dataSha256':sha(ROOT/'bank/data/applied5-expanded.json'),'sourceExamSha256':sha(EXAM),'sourceAnswerSha256':sha(ANSWER),'sourceAnswer':10,'sourceArrangementsEnumerated':len(original),'variants':9,'allVariantCountsMatchExhaustiveEnumeration':True,'examplesAreValidAndDistinct':True},ensure_ascii=False,indent=2)+'\n')
print('PASS Applied5 Q8: exact source PDFs, page-2 figure, teacher answer 10 on page 8, 9 distinct run triples, exhaustive 2^10 layout enumeration, SVG examples.')
