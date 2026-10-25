#!/usr/bin/env python3
"""Add nine variants of Applied 5 Q12's five-fold multiplication-table puzzle."""
import hashlib
import itertools
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
WORK=ROOT/'.private-work/hw-expansion-20261023/hw5'
SRC=WORK/'q12-source-r8'
DATA_FILE=ROOT/'bank/data/applied5-expanded.json'
INDEX_FILE=ROOT/'bank/data/applied5-expanded-index.json'
ASSET_DIR=ROOT/'bank/assets/applied5'
EXAM=ROOT/'materials/초등과정 대비 실전 모의고사활용 5회.pdf'
ANSWER=Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 5회 답안.pdf')
EXAM_ID='1x7CevkWByUrXPqfbV5xTHidJPNDrbuJp'
ANSWER_ID='1QGjWnEBjULxwy4BBX8tLutpGbjQfEh05'
SEQUENCES=['RBRBL','RBRBR','RBLBL','RBLBR','LBRBL','RBLTL','LBLBL','RBLTR','LBRTL']
SOURCE_SEQUENCE='RTLBL'

def sha(path): return hashlib.sha256(Path(path).read_bytes()).hexdigest()

def fold(grid,axis,direction):
    if axis=='x':
        half=len(grid[0])//2
        return [[list(reversed(row[half+j]))+row[j] if direction=='R' else list(reversed(row[j]))+row[half+j]
                 for j in range(half)] for row in grid]
    half=len(grid)//2
    if direction=='B':
        return [[list(reversed(grid[half+i][j]))+grid[i][j] for j in range(len(grid[0]))] for i in range(half)]
    return [[list(reversed(grid[i][j]))+grid[half+i][j] for j in range(len(grid[0]))] for i in range(half)]

def trace(sequence):
    grid=[[[r*c] for c in range(1,9)] for r in range(1,5)]
    axis='x'; tops=[]
    for direction in sequence:
        grid=fold(grid,axis,direction)
        tops.append(grid[0][0][0])
        axis='y' if axis=='x' else 'x'
    return tops,grid[0][0]

def svg(sequence):
    width,height=720,340
    parts=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">',
           '<rect width="100%" height="100%" fill="#fff"/>',
           '<defs><marker id="arrow" markerWidth="9" markerHeight="9" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#28241e"/></marker></defs>']
    # The original 4 by 8 multiplication table remains legible at two-column print scale.
    x0,y0,cw,ch=18,15,57,47
    for r in range(1,5):
        for c in range(1,9):
            x=x0+(c-1)*cw; y=y0+(r-1)*ch
            parts.append(f'<rect x="{x}" y="{y}" width="{cw}" height="{ch}" fill="#fff" stroke="#605b50" stroke-width="1.5"/>')
            parts.append(f'<text x="{x+cw/2}" y="{y+31}" text-anchor="middle" font-family="serif" font-size="25" fill="#191511">{r*c}</text>')
    parts.append('<text x="18" y="226" font-family="sans-serif" font-size="20" fill="#5f594e">접는 순서</text>')
    axes=['x','y','x','y','x']
    dims=[(116,58),(58,58),(116,58),(58,58),(116,58)]
    x=18; y=244
    for i,(direction,axis,(w,h)) in enumerate(zip(sequence,axes,dims),1):
        parts.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="#f7f4ec" stroke="#777062" stroke-width="1.5"/>')
        if axis=='x':
            seam=x+w/2
            parts.append(f'<path d="M {seam} {y} V {y+h}" stroke="#a69d8a" stroke-width="1.4"/>')
            if direction=='R': path=f'M {x+w-12} {y+h*.70} Q {seam} {y-5} {x+12} {y+h*.42}'
            else: path=f'M {x+12} {y+h*.70} Q {seam} {y-5} {x+w-12} {y+h*.42}'
        else:
            seam=y+h/2
            parts.append(f'<path d="M {x} {seam} H {x+w}" stroke="#a69d8a" stroke-width="1.4"/>')
            if direction=='T': path=f'M {x+w*.36} {y+10} Q {x+w+4} {seam} {x+w*.65} {y+h-8}'
            else: path=f'M {x+w*.65} {y+h-8} Q {x-4} {seam} {x+w*.36} {y+10}'
        parts.append(f'<path d="{path}" fill="none" stroke="#28241e" stroke-width="2.2" marker-end="url(#arrow)"/>')
        parts.append(f'<text x="{x+w/2}" y="{y+h+25}" text-anchor="middle" font-family="sans-serif" font-size="17" fill="#403b33">{i}</text>')
        x+=w+30
    # Final one-cell state shown after, not as a content clue to the requested number.
    x+=4
    parts.append(f'<path d="M {x-20} {y+30} H {x+8}" stroke="#8c8578" stroke-width="1.6" marker-end="url(#arrow)"/>')
    x+=22
    parts.append(f'<rect x="{x}" y="{y+2}" width="58" height="58" fill="#f7f4ec" stroke="#777062" stroke-width="1.5"/>')
    parts.append('</svg>')
    return ''.join(parts)

def main():
    data=json.loads(DATA_FILE.read_text())
    assert data['sourceRound']==5 and 12 in data['pendingSourceNos'] and not any(x['sourceNo']==12 for x in data['items'])
    assert (SRC/'exam-q12-crop.png').exists() and (SRC/'answer-q12-crop.png').exists()
    assert sha(EXAM) and sha(ANSWER)
    source_tops,source_layers=trace(SOURCE_SEQUENCE)
    assert source_tops[-1]==9 and source_layers[0]==9, (source_tops,source_layers)
    generated=[]; proofs=[]; axes='xyxyx'
    for i,sequence in enumerate(SEQUENCES,1):
        tops,layers=trace(sequence); answer=tops[-1]
        move_names={'R':'오른쪽 절반을 왼쪽으로','L':'왼쪽 절반을 오른쪽으로','T':'위쪽 절반을 아래쪽으로','B':'아래쪽 절반을 위쪽으로'}
        assert answer not in (9,) and len(set(SEQUENCES))==9
        asset=ASSET_DIR/f'q12-v{i}.svg'; asset.write_text(svg(sequence),encoding='utf-8')
        steps=[
          f'접는 순서는 {" → ".join(move_names[d] for d in sequence)}입니다. 매번 움직인 부분이 남은 부분 위에 놓입니다.',
          f'앞면과 뒷면에 같은 수가 있으므로, 종이가 뒤집힐 때 숫자 자체는 바뀌지 않습니다. 접는 부분의 겹친 순서를 다섯 번 차례로 따라가면 맨 위에는 {answer}가 남습니다.',
          f'층 순서를 한 번씩 뒤집어 추적한 맨 위 숫자는 {" → ".join(map(str,tops))}이므로 답은 {answer}입니다.'
        ]
        generated.append({'id':f'applied5-q12-v{i}','genId':'applied5-q12','sourceSet':'applied','sourceRound':5,'sourceNo':12,'variantNo':i,
          'reviewStatus':'verified','area':'도형','subarea':'종이 접기와 겹친 수','detailType':'방향이 정해진 반복 접기에서 맨 위 수 추적','pointBand':'2.7',
          'text':'앞면과 뒷면에 같은 수가 쓰인 모눈종이가 있습니다. 이것을 그림과 같은 순서로 5번 접었습니다. 가장 위에 쓰인 수는 무엇입니까?',
          'asset':{'kind':'svg','src':f'assets/applied5/q12-v{i}.svg','description':'1부터 4까지의 곱셈표와 다섯 번의 접는 방향'},
          'answer':str(answer),'answerParts':[answer],'answerLabels':['가장 위에 쓰인 수'],'acceptedAnswers':[str(answer)],'answerContract':'ordered-parts',
          'solutionSteps':steps,'solution':' '.join(steps),
          'learningPoint':'종이를 접을 때 접힌 부분의 겹치는 순서와 위아래를 추적하기',
          'learningLocation':'활용 5회 · 원문 12번 · 곱셈표가 적힌 종이를 다섯 번 접기',
          'verification':{'primaryMethod':'5단계 접기에서 움직이는 절반의 겹침 순서를 추적한다.',
             'independentMethod':'4×8 격자의 각 칸을 층별 값 목록으로 유지하고, 각 이동 절반의 층 목록을 역순으로 뒤집어 고정 절반 위에 쌓는 독립 시뮬레이터를 실행한다.',
             'parameters':{'gridRows':4,'gridColumns':8,'foldSequence':list(sequence),'foldAxes':list(axes),'topAfterEachFold':tops,'topLayers':layers,'answer':answer},
             'independentSuite':'qa/applied5-q12-independent-validate.py','sourceExamPage':2,'sourceAnswerPage':12,'sourceExamFile':EXAM.name,'sourceAnswerFile':ANSWER.name,
             'sourceExamDriveFileId':EXAM_ID,'sourceAnswerDriveFileId':ANSWER_ID,'sourceDrawingCompared':True,
             'variantDrawingType':'four-by-eight-multiplication-table-with-five-directed-folds',
             'sourceAnswerStatus':'원문 답안 PDF p12 교사 표시 정답 9. 원문 다섯 방향 R-T-L-B-L을 층 순서 시뮬레이션해 9를 독립 재현했다.',
             'studentDifficultyMeasured':False},
          'difficultyEvidence':{'basis':'source-point-band','label':'하','sourceReasoningPreserved':True,'measuredVariantRate':None,'estimated':False,
             'rationale':'활용 5회 원문 12번은 1~12번의 2.7점 배점대이므로 활용 난도는 배점대만 적용한다.'}})
        proofs.append({'variantNo':i,'foldSequence':list(sequence),'topAfterEachFold':tops,'topLayers':layers,'answer':answer})
    data['items'].extend(generated);data['items'].sort(key=lambda q:(q['sourceNo'],q['variantNo']))
    data['availableSourceNos'].insert(data['availableSourceNos'].index(13),12);data['pendingSourceNos'].remove(12)
    data['version']='20261025-applied5-expansion-q03-q05-q06-q08-q09-q11-q12-r8'
    summary=data.setdefault('reviewSummary',{});summary.update({'independentMathCount':len(data['items']),'sourceTypes':len(data['availableSourceNos']),'variantsPerType':9,'sourceDrawingCount':6})
    DATA_FILE.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
    index={'version':data['version'],'sourceSet':'applied','sourceRound':5,'itemCount':len(data['items']),'pendingSourceNos':data['pendingSourceNos'],'items':[]}
    for no in data['availableSourceNos']:
        q=next(q for q in data['items'] if q['sourceNo']==no)
        index['items'].append({'sourceNo':no,'genId':q['genId'],'area':q['area'],'subarea':q['subarea'],'detailType':q['detailType'],'pointBand':q['pointBand'],'reviewStatus':'verified','variantCount':9})
    INDEX_FILE.write_text(json.dumps(index,ensure_ascii=False,indent=2)+'\n')
    review={'sourceExam':{'file':EXAM.name,'driveFileId':EXAM_ID,'bytes':EXAM.stat().st_size,'sha256':sha(EXAM),'page':2,'questionNo':12,'directVisualReview':True,
      'stem':'다음 그림과 같이 앞면과 뒷면에 같은 수가 쓰인 모눈종이가 있습니다. 이것을 다음 그림과 같은 순서로 5번 접었습니다. 가장 위에 쓰인 수는 무엇입니까?','gridRows':4,'gridColumns':8,
      'foldDirections':['R','T','L','B','L'],'teacherFigureCrop':str((SRC/'exam-q12-crop.png').relative_to(ROOT))},
      'sourceAnswer':{'file':ANSWER.name,'driveFileId':ANSWER_ID,'bytes':ANSWER.stat().st_size,'sha256':sha(ANSWER),'page':12,'directVisualReview':True,'teacherAnswer':9,
        'teacherMarkCrop':str((SRC/'answer-q12-crop.png').relative_to(ROOT))},
      'originalIndependentCheck':{'foldSequence':['R','T','L','B','L'],'topAfterEachFold':source_tops,'topLayers':source_layers,'answer':source_tops[-1]},
      'foldModel':'At each fold, reverse the moved half stack and place it over the stationary half; identical front/back values preserve the displayed integer.',
      'newSourceTypes':0,'newVariants':9,'variantCount':9,'difficulty':'2.7-point band only = low','variants':proofs,'dataVersion':data['version']}
    (WORK/'q12-source-answer-review.json').write_text(json.dumps(review,ensure_ascii=False,indent=2)+'\n')
    print(f'Added Applied 5 Q12: 9 variants; total {len(data["items"])}; source answer 9 independently reproduced; SHA data={sha(DATA_FILE)}')

if __name__=='__main__': main()
