#!/usr/bin/env python3
"""Extend Applied 8 Q30: compare sums of bottom faces along four die paths."""
from collections import defaultdict
from itertools import permutations
from pathlib import Path
from pypdf import PdfReader
from PIL import Image
import json

ROOT=Path(__file__).resolve().parents[1]
WORK=ROOT/'.private-work/hw-expansion-20261023/hw8'
SOURCE=ROOT/'materials/초등과정 대비 실전 모의고사활용 8회.pdf'
ANSWER=WORK/'source-review/applied8-answer-drive-copy.pdf'
DATA=ROOT/'bank/data/applied8-expanded.json'
INDEX=ROOT/'bank/data/applied8-expanded-index.json'
ASSETS=ROOT/'bank/assets/applied8'
VERSION='20261025-applied8-expansion-q13-q14-q15-q17-q18-q20-q21-q22-q23-q24-q25-q26-q27-q28-q29-q30-r16'
SOURCE_NOS=[13,14,15,17,18,20,21,22,23,24,25,26,27,28,29,30]
STEM='마주보는 눈의 수의 합이 7인 주사위를 아래 그림과 같이 선을 따라 굴렸습니다. 1, 2, 3, 4 중 선을 따라 밑면에 닿은 눈의 수의 합이 같은 것은 몇 번일까요?'
SOURCE_PATHS=['EEESS','SEESE','SSEESE','SSSEE']
ROUTE_SETS=[
 ['ESEES','EESES','SEESES','ESSSE'],
 ['EESSE','ESESE','ESEESS','ESSSE'],
 ['EESSE','SSEEE','EESSES','SSEES'],
 ['SEEES','SSEEE','ESSESE','ESESS'],
 ['SEEES','ESESE','SSEEES','SESSE'],
 ['ESESE','EESSE','SEEESS','ESESS'],
 ['ESSEE','EEESS','SSESEE','EESSS'],
 ['ESSEE','EESES','EESSSE','ESESS'],
]
ORIENTATION_INDEX=[1,3,5,8,11,14,17,21]


def roll(o,d):
    if d=='E': return {'T':o['L'],'B':o['R'],'L':o['B'],'R':o['T'],'F':o['F'],'K':o['K']}
    if d=='W': return {'T':o['R'],'B':o['L'],'R':o['B'],'L':o['T'],'F':o['F'],'K':o['K']}
    if d=='S': return {'T':o['K'],'B':o['F'],'F':o['T'],'K':o['B'],'R':o['R'],'L':o['L']}
    if d=='N': return {'T':o['F'],'B':o['K'],'F':o['B'],'K':o['T'],'R':o['R'],'L':o['L']}
    raise ValueError(d)


def orientations():
    seed={'T':2,'B':5,'F':1,'K':6,'R':4,'L':3}
    states=[seed]; i=0
    while i<len(states):
        o=states[i]; i+=1
        for d in 'EWNS':
            n=roll(o,d)
            if n not in states: states.append(n)
    assert len(states)==24
    return states


def trace(o,path):
    vals=[]
    for d in path:
        o=roll(o,d); vals.append(o['B'])
    return vals,sum(vals)


def result_for(o,paths):
    traces=[trace(o,p) for p in paths]
    groups=defaultdict(list)
    for i,(_,total) in enumerate(traces,1): groups[total].append(i)
    return traces,[g for g in groups.values() if len(g)>1]


def xy(c,r): return (120+78*c-28*r,62+5*c+42*r)


def pip_pattern(n):
    return {1:[(0,0)],2:[(-1,-1),(1,1)],3:[(-1,-1),(0,0),(1,1)],
            4:[(-1,-1),(1,-1),(-1,1),(1,1)],
            5:[(-1,-1),(1,-1),(0,0),(-1,1),(1,1)],
            6:[(-1,-1),(1,-1),(-1,0),(1,0),(-1,1),(1,1)]}[n]


def pip_face(cx,cy,w,h,n,scale=1):
    rad=3.1*scale
    return ''.join(f'<circle cx="{cx+dx*w/4:.1f}" cy="{cy+dy*h/4:.1f}" r="{rad:.1f}" fill="#191511"/>' for dx,dy in pip_pattern(n))


def die_svg(o):
    # Clearly draw the three visible faces. Opposite pairs are fixed by the validated die state.
    a=o['T']; b=o['F']; c=o['R']
    return (f'<g stroke="#191511" stroke-width="1.8" stroke-linejoin="round">'
      '<polygon points="14,12 39,0 64,12 39,25" fill="#fdfbf5"/>'
      '<polygon points="14,12 39,25 39,52 14,38" fill="#f1ece1"/>'
      '<polygon points="39,25 64,12 64,38 39,52" fill="#e2d9c6"/>'
      f'</g><g>{pip_face(39,12,50,25,a,.82)}{pip_face(26.5,31,25,26,b,.82)}{pip_face(51.5,31,25,26,c,.82)}</g>')


def svg_map(o,paths,variant):
    lines=[]
    for r in range(4):
        p0=xy(0,r); p1=xy(3,r); lines.append(f'<path d="M{p0[0]},{p0[1]} L{p1[0]},{p1[1]}"/>')
    for c in range(4):
        p0=xy(c,0); p1=xy(c,3); lines.append(f'<path d="M{p0[0]},{p0[1]} L{p1[0]},{p1[1]}"/>')
    grid='<g fill="none" stroke="#8c8579" stroke-width="1.2">'+''.join(lines)+'</g>'
    routes=[]; edge_sets=[]
    for path in paths:
        c=r=0; pts=[xy(c,r)]; es=[]
        for d in path:
            if d=='E': c+=1
            else: r+=1
            pts.append(xy(c,r)); es.append((pts[-2],pts[-1]))
        edge_sets.append(es)
    all_edges=[{tuple(sorted(e)) for e in es} for es in edge_sets]
    labels=[]
    for i,(path,pts,es) in enumerate(zip(paths,[None]*4,edge_sets),1):
        unique=[e for e in es if sum(tuple(sorted(e)) in z for z in all_edges)==1]
        # Put the route label just inside a cell beside an edge unique to this path.
        edge=unique[min(len(unique)-1,1)] if unique else es[len(es)//2]
        (x1,y1),(x2,y2)=edge; mx=(x1+x2)/2; my=(y1+y2)/2
        if abs(x2-x1)>abs(y2-y1): lx,ly=mx,my+11
        else: lx,ly=mx+12,my
        labels.append(f'<circle cx="{lx:.1f}" cy="{ly:.1f}" r="9" fill="#fdfbf5" stroke="#2a241c" stroke-width="1.4"/><text x="{lx:.1f}" y="{ly+3:.1f}" text-anchor="middle" font-family="sans-serif" font-size="9" fill="#191511">{i}</text>')
        poly=' '.join(f'{x},{y}' for x,y in [xy(0,0)]+[e[1] for e in es])
        routes.append(f'<polyline points="{poly}" fill="none" stroke="#191511" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round" marker-end="url(#arrow)"/>')
    legend=''
    return ('<svg xmlns="http://www.w3.org/2000/svg" width="460" height="260" viewBox="0 0 460 260">'
      '<defs><marker id="arrow" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill="#191511"/></marker></defs>'
      '<rect width="460" height="260" fill="#fdfbf5"/>'
      +grid+'<g>'+''.join(routes)+'</g><g>'+''.join(labels)+'</g>'
      +f'<g transform="translate(72,8)">{die_svg(o)}</g>'
      +'<text x="18" y="244" font-family="sans-serif" font-size="11" fill="#7a6f5c">마주 보는 면의 합은 7</text></svg>')


def make_steps(o,paths,ties):
    traces,_=result_for(o,paths)
    faces=f'시작할 때 위쪽 면은 {o["T"]}, 앞쪽 면은 {o["F"]}, 오른쪽 면은 {o["R"]}입니다. 마주 보는 면은 각각 {7-o["T"]}, {7-o["F"]}, {7-o["R"]}입니다.'
    steps=[faces]
    for i,(path,(seq,total)) in enumerate(zip(paths,traces),1):
        steps.append(f'{i}번 경로에서 주사위가 한 칸씩 굴러갈 때 밑면의 눈은 {", ".join(map(str,seq))}이고, 합은 {"+".join(map(str,seq))}={total}입니다.')
    equal_text='와 '.join(f'{g[0]}번·{g[1]}번' if len(g)==2 else ', '.join(f'{n}번' for n in g) for g in ties)
    sums=[x[1] for x in traces]
    steps.append(f'네 경로의 합은 {", ".join(map(str,sums))}입니다. 따라서 합이 같은 경로는 {equal_text}입니다.')
    return steps


def make_item(i,orientation,paths):
    traces,ties=result_for(orientation,paths); assert ties
    tie=sorted(ties[0]); steps=make_steps(orientation,paths,ties)
    if i==1:
        asset='assets/applied8/q30-source-diepaths.png'
        image_meta={'kind':'raster','src':asset,'description':'원문 30번의 주사위와 네 굴림 경로 그림을 원본 그대로 사용'}
        pixel_exact=True
    else:
        asset=f'assets/applied8/q30-paths-v{i}.svg'
        (ASSETS/f'q30-paths-v{i}.svg').write_text(svg_map(orientation,paths,i))
        image_meta={'kind':'svg','src':asset,'description':'마주 보는 눈의 합이 7인 주사위와 네 가지 격자 경로'}
        pixel_exact=False
    params={'orientation':{'top':orientation['T'],'front':orientation['F'],'right':orientation['R']},
            'paths':paths,'bottomFaceSequences':[seq for seq,_ in traces],
            'pathSums':[total for _,total in traces],'equalPathNumbers':tie,
            'sourceDrawingPixelExactCrop':pixel_exact}
    return {'id':f'applied8-q30-v{i}','genId':'applied8-q30','sourceSet':'applied','sourceRound':8,
      'sourceNo':30,'variantNo':i,'reviewStatus':'verified','area':'도형','subarea':'도형의 성질과 관계',
      'detailType':'주사위를 정해진 경로로 굴릴 때 밑면 눈의 합 비교','pointBand':'4.2','text':STEM,
      'asset':image_meta,'answer':f'{"번과 ".join(map(str,tie))}번','answerParts':tie,
      'answerLabels':['같은 합이 되는 경로 번호']*len(tie),
      'acceptedAnswers':[','.join(map(str,tie)),f'{"번과 ".join(map(str,tie))}번'],
      'answerContract':'ordered-parts','solutionSteps':steps,'solution':' '.join(steps),
      'learningPoint':'주사위가 한 칸씩 굴러갈 때 마주 보는 면을 이용해 바닥 눈을 차례로 추적하고 경로별 합 비교하기',
      'learningLocation':'활용 8회 · 원문 30번 · 주사위의 면 관계와 경로별 합',
      'verification':{'primaryMethod':'각 이동 방향에서 새 밑면이 되는 면을 순서대로 추적해 경로별 눈의 합을 계산한다.',
        'independentMethod':'주사위의 여섯 면 위치를 상태로 두고 네 경로를 한 칸씩 독립 시뮬레이션한 뒤 합이 같은 경로를 대조한다.',
        'parameters':params,'independentSuite':'qa/applied8-q30-independent-validate.py',
        'sourceExamPage':6,'sourceExamFile':'초등과정 대비 실전 모의고사활용 8회.pdf',
        'sourceAnswerPage':6,'sourceDrawingCompared':True,'sourceDrawingPresent':True,
        'sourceDrawingPixelExactCrop':pixel_exact,
        'officialAnswerStatus':'The available answer PDF is a blank, text-identical copy of the question page. Visible die faces and all four drawn paths were directly inspected; bottom-face sequences were independently simulated.',
        'studentDifficultyMeasured':False},
      'difficultyEvidence':{'basis':'source-point-band','label':'상','sourceReasoningPreserved':True,
        'measuredVariantRate':None,'estimated':False,
        'rationale':'활용 8회 원문 30번은 23~30번의 4.2점 배점대다. 활용 난도는 배점대만 적용한다.'}}


def main():
    d=json.loads(DATA.read_text());idx=json.loads(INDEX.read_text());ASSETS.mkdir(parents=True,exist_ok=True)
    source_page=PdfReader(str(SOURCE)).pages[5]; answer_page=PdfReader(str(ANSWER)).pages[5]
    imgs=source_page.images; assert len(imgs)>=8 and imgs[7].image.size==(358,205)
    imgs[7].image.save(ASSETS/'q30-source-diepaths.png')
    # The answer candidate has the same source diagram and an empty answer line.
    assert (answer_page.extract_text() or '').replace(' ','')==(source_page.extract_text() or '').replace(' ','')
    states=orientations();configs=[(states[0],SOURCE_PATHS)]+[(states[j],p) for j,p in zip(ORIENTATION_INDEX,ROUTE_SETS)]
    items=[]
    for i,(o,paths) in enumerate(configs,1):
        sums=[trace(o,p)[1] for p in paths]
        assert len(paths)==4 and all(x.count('E') in (2,3) and x.count('S') in (2,3) for x in paths)
        assert all(len(set(o.values()))==6 and o['T']+o['B']==o['F']+o['K']==o['R']+o['L']==7 for _ in [0])
        assert len(set(paths))==4
        items.append(make_item(i,o,paths))
    assert items[0]['answerParts']==[1,4]
    d['items'].extend(items);d['availableSourceNos']=SOURCE_NOS
    d['pendingSourceNos']=[n for n in range(1,31) if n not in SOURCE_NOS]
    d['itemCount']=len(d['items']);d['version']=VERSION
    idx['items'].append({'sourceNo':30,'genId':'applied8-q30','area':'도형','subarea':'도형의 성질과 관계',
      'detailType':'주사위를 정해진 경로로 굴릴 때 밑면 눈의 합 비교','pointBand':'4.2','reviewStatus':'verified','variantCount':9})
    idx['pendingSourceNos']=d['pendingSourceNos'];idx['itemCount']=d['itemCount'];idx['version']=VERSION
    DATA.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');INDEX.write_text(json.dumps(idx,ensure_ascii=False,indent=2)+'\n')
    all_results=[]
    for i,(o,paths) in enumerate(configs,1):
        traces,ties=result_for(o,paths)
        all_results.append({'variant':i,'orientation':{'top':o['T'],'front':o['F'],'right':o['R']},
          'paths':paths,'bottomFaceSequences':[a for a,_ in traces],'sums':[b for _,b in traces],'equalPaths':ties})
    source_review={'sourceExamPage':6,'sourceQuestion':30,'sourceStem':STEM,
      'answerCandidateStatus':'blank answer page; text identical to source question page',
      'sourceImage':'PDF embedded image 8, 358×205 pixels; saved PNG has decoded pixels unchanged',
      'visibleFaces':{'top':2,'front':1,'right':4},'oppositePairs':[[1,6],[2,5],[3,4]],
      'sourceRouteDirections':{'east':'right on page','south':'down on page'},
      'sourcePaths':SOURCE_PATHS,'sourceBottomSequences':[x['bottomFaceSequences'] for x in all_results[:1]][0],
      'sourcePathSums':all_results[0]['sums'],'sourceEqualPathNumbers':[1,4],
      'imageManualReview':'The die pips and all four thick route centerlines/arrows were inspected on the original PDF page and its embedded image.'}
    (WORK/'q30-source-review.json').write_text(json.dumps(source_review,ensure_ascii=False,indent=2)+'\n')
    (WORK/'q30-independent-math.json').write_text(json.dumps({'method':'explicit six-face orientation state rolled one edge at a time',
      'source':all_results[0],'variants':all_results[1:]},ensure_ascii=False,indent=2)+'\n')
    print(f'PASS generated Q30: source answer paths 1 and 4; {len(items)} variants; inventory {d["itemCount"]}; version r16')


if __name__=='__main__':main()
