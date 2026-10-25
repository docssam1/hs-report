#!/usr/bin/env python3
"""Add nine source-faithful Applied 5 Q11 distance-table variants."""
import hashlib
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
WORK=ROOT/'.private-work/hw-expansion-20261023/hw5'
SRC=WORK/'q11-source-r7'
DATA_FILE=ROOT/'bank/data/applied5-expanded.json'
INDEX_FILE=ROOT/'bank/data/applied5-expanded-index.json'
EXAM=ROOT/'materials/초등과정 대비 실전 모의고사활용 5회.pdf'
ANSWER=Path('/Users/docssam/Library/CloudStorage/GoogleDrive-docssam1@gmail.com/내 드라이브/pilot/report new/입학테스트 관련 자료/황소 대비 모의고사/new 초등 선발 대비/모의고사/생각하는 황소 초등 선발 대비 활용 모의고사/답안/초등 선발 모의고사 특강 5회 답안.pdf')
PARAMS=[(40,30,20,10),(55,35,25,15),(60,45,30,20),(75,40,15,25),(45,55,35,10),(50,60,25,20),(65,30,40,15),(35,50,20,30),(80,25,35,20)]

def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()

def svg(x,y,z,w):
    rows=[['집'],[str(x),'제과점'],['가','나','꽃집'],[str(x+y+z),str(y+z),str(z),'서점'],['다','라',str(z+w),str(w),'학교']]
    cw,ch,x0,y0=82,52,28,18
    els=['<svg xmlns="http://www.w3.org/2000/svg" width="480" height="310" viewBox="0 0 480 310">','<rect width="100%" height="100%" fill="#fff"/>']
    for r,row in enumerate(rows):
        for c,value in enumerate(row):
            xx=x0+c*cw;yy=y0+r*ch
            els.append(f'<rect x="{xx}" y="{yy}" width="{cw}" height="{ch}" fill="none" stroke="#39342c" stroke-width="1.4"/>')
            fs=16 if value in ('제과점','학교') else 18
            els.append(f'<text x="{xx+cw/2}" y="{yy+34}" text-anchor="middle" font-family="serif" font-size="{fs}" fill="#211d18">{value}</text>')
    els.append('<text x="365" y="300" font-family="serif" font-size="15" fill="#6a6256">(단위: m)</text></svg>')
    return ''.join(els)

def main():
    data=json.loads(DATA_FILE.read_text())
    assert 11 in data['pendingSourceNos'] and not any(x['sourceNo']==11 for x in data['items'])
    assert (SRC/'exam-q11-crop.png').exists() and (SRC/'answer-q11-proof.png').exists()
    items=[]
    for i,(x,y,z,w) in enumerate(PARAMS,1):
        ans=2*x+4*y+2*z+2*w
        a=x+y;b=y;c=x+y+z+w;d=y+z+w
        asset=ROOT/f'bank/assets/applied5/q11-v{i}.svg';asset.write_text(svg(x,y,z,w),encoding='utf-8')
        steps=[
          f"집에서 서점까지 {x+y+z}m이고 꽃집에서 서점까지 {z}m이므로 가＝{x+y+z}−{z}＝{a}m입니다.",
          f"제과점에서 서점까지 {y+z}m이고 꽃집에서 서점까지 {z}m이므로 나＝{y+z}−{z}＝{b}m입니다.",
          f"서점에서 학교까지 {w}m이므로 다＝{x+y+z}+{w}＝{c}m, 라＝{y+z}+{w}＝{d}m입니다. 따라서 합은 {a}+{b}+{c}+{d}＝{ans}입니다."
        ]
        item={'id':f'applied5-q11-v{i}','genId':'applied5-q11','sourceSet':'applied','sourceRound':5,'sourceNo':11,'variantNo':i,'reviewStatus':'verified',
          'area':'수와 식','subarea':'거리의 합과 차','detailType':'연속한 장소 사이 거리로 구간 거리 찾기','pointBand':'2.7',
          'text':'집과 학교 사이에는 제과점, 꽃집, 서점이 있습니다. 집, 제과점, 꽃집, 서점, 학교 사이의 거리는 다음 표와 같습니다. 가, 나, 다, 라에 알맞은 수의 합을 구하세요.',
          'asset':{'kind':'svg','src':f'assets/applied5/q11-v{i}.svg','description':'집에서 학교까지 다섯 장소 사이의 삼각형 거리표'},
          'answer':str(ans),'answerParts':[ans],'answerLabels':['가, 나, 다, 라의 합'],'acceptedAnswers':[str(ans),f'{ans}m'],'answerContract':'ordered-parts',
          'solutionSteps':steps,'solution':' '.join(steps),
          'learningPoint':'두 지점 사이 거리를 중간 지점까지의 거리 합·차로 나타내기',
          'learningLocation':'활용 5회 · 원문 11번 · 거리표에서 구간 거리 찾기',
          'verification':{'primaryMethod':'거리표의 네 지점 간 합과 차로 가·나를 구한 뒤 서점까지 거리에 서점-학교 거리를 더해 다·라를 구한다.',
            'independentMethod':'표에 주어진 집-제과점, 꽃집-서점, 제과점-서점, 집-서점, 꽃집-학교 거리를 사용해 양의 정수 연속 구간 거리 x,y,z,w를 대입 탐색하고 각 셀의 등식과 네 미지 거리의 합을 확인한다.',
            'parameters':{'segments':[x,y,z,w],'tableGiven':{'homeBakery':x,'homeBookstore':x+y+z,'bakeryBookstore':y+z,'flowerBookstore':z,'flowerSchool':z+w,'bookstoreSchool':w},'unknowns':[a,b,c,d],'answer':ans},
            'independentSuite':'qa/applied5-q11-independent-validate.py','sourceExamPage':2,'sourceAnswerPage':11,'sourceExamFile':EXAM.name,'sourceAnswerFile':ANSWER.name,
            'sourceExamDriveFileId':'1x7CevkWByUrXPqfbV5xTHidJPNDrbuJp','sourceAnswerDriveFileId':'1QGjWnEBjULxwy4BBX8tLutpGbjQfEh05',
            'sourceDrawingCompared':True,'variantDrawingType':'staircase-triangular-distance-table','sourceAnswerStatus':'Answer PDF p11 directly shows teacher total 520; source values independently yield 가=140, 나=70, 다=190, 라=120.', 'studentDifficultyMeasured':False},
          'difficultyEvidence':{'basis':'source-point-band','label':'하','sourceReasoningPreserved':True,'measuredVariantRate':None,'estimated':False,'rationale':'활용 5회 원문 11번은 1~12번의 2.7점 배점대이므로 활용 난도는 배점대만 적용한다.'}}
        items.append(item)
    data['items'].extend(items);data['items'].sort(key=lambda q:(q['sourceNo'],q['variantNo']))
    data['availableSourceNos'].insert(data['availableSourceNos'].index(13),11);data['pendingSourceNos'].remove(11)
    data['version']='20261025-applied5-expansion-q03-q05-q06-q08-q09-q11-r7'
    summary=data.setdefault('reviewSummary',{});summary.update({'independentMathCount':126,'sourceTypes':14,'variantsPerType':9,'sourceDrawingCount':5})
    DATA_FILE.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
    index={'version':data['version'],'sourceSet':'applied','sourceRound':5,'itemCount':len(data['items']),'pendingSourceNos':data['pendingSourceNos'],'items':[]}
    for no in data['availableSourceNos']:
        q=next(q for q in data['items'] if q['sourceNo']==no);index['items'].append({'sourceNo':no,'genId':q['genId'],'area':q['area'],'subarea':q['subarea'],'detailType':q['detailType'],'pointBand':q['pointBand'],'reviewStatus':'verified','variantCount':9})
    INDEX_FILE.write_text(json.dumps(index,ensure_ascii=False,indent=2)+'\n')
    review={'sourceExam':{'file':EXAM.name,'driveFileId':'1x7CevkWByUrXPqfbV5xTHidJPNDrbuJp','bytes':EXAM.stat().st_size,'sha256':sha(EXAM),'page':2,'questionNo':11,'directVisualReview':True,
      'stem':'지호네 집과 학교 사이에는 제과점, 꽃집, 서점이 있습니다. 집, 제과점, 꽃집, 서점, 학교 사이의 거리는 다음 표와 같습니다. 가, 나, 다, 라에 알맞은 수의 합을 구하세요.','givenTriangle':[[None],[70,None],['가','나',None],[160,90,20,None],['다','라',50,30,None]]},
      'sourceAnswer':{'file':ANSWER.name,'driveFileId':'1QGjWnEBjULxwy4BBX8tLutpGbjQfEh05','bytes':ANSWER.stat().st_size,'sha256':sha(ANSWER),'page':11,'directVisualReview':True,'teacherAnswer':520,'teacherUnknowns':[140,70,190,120]},
      'sourceFigure':{'render':str((SRC/'exam-p2-2.png').relative_to(ROOT)),'crop':str((SRC/'exam-q11-crop.png').relative_to(ROOT)),'sha256':sha(SRC/'exam-q11-crop.png')},
      'answerProof':{'render':str((SRC/'ans-11.png').relative_to(ROOT)),'crop':str((SRC/'answer-q11-proof.png').relative_to(ROOT)),'sha256':sha(SRC/'answer-q11-proof.png')},
      'originalSolution':{'segments':[70,70,20,30],'unknowns':[140,70,190,120],'answer':520},
      'variants':[{'variantNo':q['variantNo'],'segments':q['verification']['parameters']['segments'],'unknowns':q['verification']['parameters']['unknowns'],'answer':q['answer']} for q in items],
      'variantCount':9,'newSourceTypes':0,'difficulty':'2.7-point band only = low'}
    (WORK/'q11-source-answer-review.json').write_text(json.dumps(review,ensure_ascii=False,indent=2)+'\n')
    print(f'Added Q11 9 variants; {len(data["items"])} total; data sha256={sha(DATA_FILE)}')

if __name__=='__main__':main()
