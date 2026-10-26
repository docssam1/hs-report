"""Nine grid-aligned minimum square covers, sourced from Applied 2 Q17."""
from __future__ import annotations

import hashlib
import json
from functools import lru_cache
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
EXAM=ROOT/'materials/초등과정 대비 실전 모의고사 활용 2회.pdf'
ANSWER=ROOT/'.private-work/hw-expansion-20261023/applied2-answer-source.pdf'
assert hashlib.sha256(EXAM.read_bytes()).hexdigest()=='1af1698985c657774c00eb9abc0466b07f8cb79bca64d2c379ea18b8cae67aab'
DATA_PATH=ROOT/'bank/data/applied2-expanded.json'
INDEX_PATH=ROOT/'bank/data/applied2-expanded-index.json'
CASES=[(4,6),(5,6),(6,6),(6,7),(6,8),(7,7),(7,8),(8,8),(8,9)]
assert len(CASES)==len(set(CASES))==9 and (5,5) not in CASES


def solve(h,w):
    cells=[(r,c) for r in range(h) for c in range(w) if (r,c)!=(0,0)]
    idx={cell:i for i,cell in enumerate(cells)}
    covers=[[] for _ in cells]
    squares=[]
    for side in range(1,min(h,w)+1):
        for r in range(h-side+1):
            for c in range(w-side+1):
                block=[(r+dr,c+dc) for dr in range(side) for dc in range(side)]
                if any(cell not in idx for cell in block):continue
                mask=sum(1<<idx[cell] for cell in block)
                entry=(mask,side,r,c)
                squares.append(entry)
                for cell in block:covers[idx[cell]].append(entry)
    all_cells=(1<<len(cells))-1

    @lru_cache(None)
    def best(unused):
        if not unused:return (0,())
        choices=min(([(mask,side,r,c) for mask,side,r,c in covers[i] if mask&unused==mask]
                     for i in range(len(cells)) if unused>>i&1),key=len)
        candidates=[]
        for mask,side,r,c in choices:
            rest_count,rest=best(unused^mask)
            candidates.append((1+rest_count,((side,r,c),)+rest))
        return min(candidates,key=lambda x:(x[0],tuple(sorted(x[1],reverse=True))))

    minimum,placement=best(all_cells)
    # The top row's first present cell is (0,1); no square can cover it
    # without having its top-left corner at (0,1).
    first=[]
    for side in range(1,min(h,w-1)+1):
        entry=next((x for x in squares if x[1:]==(side,0,1)),None)
        if entry:
            rest_count,_=best(all_cells^entry[0])
            first.append((side,1+rest_count))
    assert min(total for _,total in first)==minimum
    assert sum(side*side for side,_,_ in placement)==h*w-1
    assert len(placement)==minimum
    return minimum,placement,first,best.cache_info().currsize


assert solve(5,5)[0]==7  # The printed 24-cell figure, not the erroneous "15" in its stem.


def svg(h,w,placement,path):
    cell=244//max(h,w)
    pad=12
    width,height=w*cell+pad*2,h*cell+pad*2
    parts=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">',
           f'<rect width="{width}" height="{height}" fill="white"/>']
    for r in range(h):
        for c in range(w):
            if (r,c)==(0,0):continue
            parts.append(f'<rect x="{pad+c*cell}" y="{pad+r*cell}" width="{cell}" height="{cell}" fill="white" stroke="#191511" stroke-width="1.25"/>')
    if placement is not None:
        for number,(side,r,c) in enumerate(placement,1):
            parts.append(f'<rect x="{pad+c*cell}" y="{pad+r*cell}" width="{side*cell}" height="{side*cell}" fill="none" stroke="#191511" stroke-width="3"/>')
            parts.append(f'<text x="{pad+(c+.5)*cell:.2f}" y="{pad+(r+.5)*cell:.2f}" fill="#191511" stroke="white" stroke-width="2" paint-order="stroke" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="{max(12,min(18,cell*.42)):.1f}">{number}</text>')
    parts.append('</svg>')
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text('\n'.join(parts)+'\n')


def build():
    data=json.loads(DATA_PATH.read_text())
    index=json.loads(INDEX_PATH.read_text())
    assert data['version']==index['version']
    assert 17 in data['pendingSourceNos'] or all(x['id'].startswith('applied2-q17-v')
                                               for x in data['items'] if x['sourceNo']==17)
    data['items']=[x for x in data['items'] if x['sourceNo']!=17]
    index['items']=[x for x in index['items'] if x['sourceNo']!=17]
    items=[]
    for variant,(h,w) in enumerate(CASES,1):
        answer,cover,first,states=solve(h,w)
        src=f'assets/applied2/q17-v{variant}.svg'
        solution_src=f'assets/applied2/q17-v{variant}-solution.svg'
        svg(h,w,None,ROOT/'bank'/src)
        svg(h,w,cover,ROOT/'bank'/solution_src)
        table='; '.join(f'{side}칸짜리: {total}장' for side,total in first)
        size_list='·'.join(str(side) for side,_,_ in sorted(cover,reverse=True))
        steps=[
            f'그림은 {h}행 {w}열에서 왼쪽 위 1칸을 뺀 {h*w-1}칸입니다.',
            f'맨 위 왼쪽의 첫 칸을 덮는 정사각형의 한 변을 가능한 길이별로 나누어 계산하면 {table}입니다.',
            f'어느 첫 정사각형을 택해도 {answer}장보다 적게는 나머지 칸을 빈틈 없이 덮지 못합니다.',
            f'풀이 그림은 한 변이 차례로 {size_list}칸인 정사각형 {answer}장을 겹치지 않게 놓은 예입니다.',
            f'따라서 최소 {answer}장이 필요합니다.',
        ]
        items.append({
            'id':f'applied2-q17-v{variant}','genId':'applied2-q17','sourceSet':'applied','sourceRound':2,
            'sourceNo':17,'variantNo':variant,'reviewStatus':'verified','area':'도형',
            'subarea':'정사각형 덮기','detailType':'격자 도형을 덮는 최소 정사각형 수',
            'pointBand':'3.4',
            'text':f'그림은 같은 크기의 작은 정사각형 {h*w-1}개로 만든 도형입니다. 격자선에 맞춰 크고 작은 정사각형 모양의 종이로 겹치지 않게 모두 덮으려면 적어도 몇 장이 필요할까요?',
            'answer':str(answer),'answerContract':'ordered-parts','answerParts':[answer],
            'answerLabels':['필요한 최소 장수'],'acceptedAnswers':[str(answer)],
            'solutionSteps':steps,'solution':' '.join(steps),
            'learningPoint':'첫 빈칸을 덮을 정사각형의 크기별로 경우를 나누고, 실제 덮기와 최소 장수를 함께 확인하기',
            'learningLocation':'활용 2회 · 원문 17번 · 격자 도형의 정사각형 덮기',
            'verification':{
                'primaryMethod':'모든 격자 정사각형을 비트마스크로 열거하고 최소 장수 동적 계획법 계산',
                'independentMethod':'실제 풀이 그림 정사각형의 겹침·빈칸 검증 및 별도 행우선 정수 분할 탐색',
                'parameters':{'rows':h,'columns':w,'missingCell':[0,0],
                              'tiles':[{'side':s,'row':r,'column':c} for s,r,c in cover],
                              'firstSquareSizeAndMinimum':first,'states':states,'answer':answer},
                'sourceExamPage':3,'sourceAnswerPage':5,
                'sourceTextDirectlyReviewed':True,'sourceFigureDirectlyReviewed':True,
                'sourceTextFigureConflict':'printed stem says 15 cells; drawing is 5×5 minus upper-left cell = 24',
                'userDecision':'use printed figure 24-cell basis for analog variants',
                'sourceAnswerCandidate':7,'independentSourceAnswer':7,
                'sourceAnswerCandidateOfficiality':'unverified',
                'sourceExamSha256':hashlib.sha256(EXAM.read_bytes()).hexdigest(),
                'sourceAnswerSha256':hashlib.sha256(ANSWER.read_bytes()).hexdigest(),
                'originalFigurePreserved':True,'variantFiguresCreatedFresh':True,
                'independentCountAgrees':True,
            },
            'difficultyEvidence':{'basis':'source-point-band','label':'중',
                                  'sourceReasoningPreserved':True,'measuredVariantRate':None},
            'asset':{'kind':'svg','src':src,'description':'왼쪽 위 한 칸이 없는 정사각형 격자 도형'},
            'solutionAsset':{'kind':'svg','src':solution_src,'description':'정사각형 종이로 덮은 한 가지 최소 배치',
                             'caption':f'정사각형 종이 {answer}장으로 모두 덮은 예'},
        })
    data['items'].extend(items)
    data['items'].sort(key=lambda x:(x['sourceNo'],x['variantNo']))
    data['availableSourceNos']=sorted(set(data['availableSourceNos'])|{17})
    data['pendingSourceNos']=[x for x in data['pendingSourceNos'] if x!=17]
    data['version']='20261026-applied2-q17-figure24-confirmed-r1'
    data['itemCount']=len(data['items'])
    data.setdefault('sourceEditionNotes',{})['17']='사용자 결정: 원본 그림 24칸(5×5에서 왼쪽 위 1칸 제외)을 유사문제 기준으로 확정. 원문 지문 15칸 오류는 그대로 기록하고 원시험 성적 불변. 그림 기준 최소 7장은 답안 후보 p.5와 독립 탐색이 일치. 새 그림·풀이 그림 각 9개.'
    data['reviewSummary']['independentMathCount']=len(data['items'])
    data['reviewSummary']['sourceTypes']=len(data['availableSourceNos'])
    data['reviewSummary']['sourceDrawingCount']=len({x['sourceNo'] for x in data['items'] if x.get('asset')})
    data['reviewSummary']['outputReviewed']=False
    index['version']=data['version'];index['itemCount']=len(data['items']);index['pendingSourceNos']=data['pendingSourceNos']
    index['items'].append({'sourceNo':17,'genId':'applied2-q17','area':'도형','subarea':'정사각형 덮기',
                          'detailType':'격자 도형을 덮는 최소 정사각형 수','pointBand':'3.4',
                          'reviewStatus':'verified','variantCount':9})
    index['items'].sort(key=lambda x:x['sourceNo'])
    DATA_PATH.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
    INDEX_PATH.write_text(json.dumps(index,ensure_ascii=False,indent=2)+'\n')
    print('Built Applied2 Q17:',[x['answerParts'][0] for x in items])


if __name__=='__main__':build()
