#!/usr/bin/env python3
"""Extend the existing Applied 8 Q21 directed-route-counting type."""
from __future__ import annotations
import hashlib, json, shutil
from collections import defaultdict
from pathlib import Path
from PIL import Image
from pypdf import PdfReader

ROOT=Path(__file__).resolve().parents[1]
WORK=ROOT/'.private-work/hw-expansion-20261023/hw8'
EXAM=ROOT/'materials/초등과정 대비 실전 모의고사활용 8회.pdf'
ANSWER=WORK/'source-review/applied8-answer-drive-copy.pdf'
PAGE=WORK/'source-review/q16-exam-4.png'
CROP=WORK/'source-review/q21-graph-crop-candidate-v2.png'
ASSET=ROOT/'bank/assets/applied8/q21-directed-graph-original.png'
DATA_PATH=ROOT/'bank/data/applied8-expanded.json'; INDEX_PATH=ROOT/'bank/data/applied8-expanded-index.json'
REVIEW=WORK/'q21-source-review.json'
VERSION='20261025-applied8-expansion-q13-q14-q15-q17-q18-q20-q21-q22-q23-r9'
# Vertices are the printed corners, side midpoints, center, and labeled endpoints.
EDGES={
 'A':['TL','TR','C'], 'TL':['L','C'], 'TR':['R','C'],
 'L':['C','BL'], 'R':['C','BR'], 'C':['B','BL','BR'],
 'BL':['B'], 'BR':['B'], 'B':[]
}
VARIANTS=[
 {'waypoints':[]}, {'waypoints':['C']}, {'waypoints':['TL']}, {'waypoints':['TR']},
 {'waypoints':['L']}, {'waypoints':['R']}, {'waypoints':['BL']}, {'waypoints':['BR']},
 {'waypoints':['C','BL']},
]
NAMES={'C':'가운데 교점','TL':'왼쪽 위 모서리','TR':'오른쪽 위 모서리','L':'왼쪽 변의 가운데 교점','R':'오른쪽 변의 가운데 교점','BL':'왼쪽 아래 모서리','BR':'오른쪽 아래 모서리'}

def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def routes():
 out=[]
 def walk(u,path):
  if u=='B':out.append(path[:]);return
  for v in EDGES[u]:walk(v,path+[v])
 walk('A',['A']);return out
ALL=routes()
def condition_phrase(nodes):
 if not nodes: return ''
 parts=[NAMES[x] for x in nodes]; out=parts[0]
 vowel_end={'모서리'}
 for prev,cur in zip(parts,parts[1:]): out += ('와 ' if prev.endswith('모서리') else '과 ')+cur
 out += ('를' if parts[-1].endswith('모서리') else '을')+' 지나는'
 return out
def statement(v):
 base='그림처럼 화살표 방향으로만 A도시에서 B도시까지 이동합니다.'
 cond=condition_phrase(v['waypoints'])
 return f"{base} {cond + ' 방법은' if cond else '갈 수 있는 방법은'} 모두 몇 가지일까요?"
def filtered(v): return [p for p in ALL if all(x in p for x in v['waypoints'])]
def solution_steps(v,count):
 if not v['waypoints']:
  return ['각 화살표를 한 번 이동으로 보고, A에서 시작해 B에 도착할 때까지 화살표 방향이 이어지는 경로를 셉니다.', 'A에서 왼쪽 위 모서리로 가는 경로는 7가지입니다. 오른쪽 위 모서리로 가는 경로도 7가지입니다. A에서 가운데 교점으로 바로 가면 B, 왼쪽 아래 모서리, 오른쪽 아래 모서리로 이어져 3가지입니다.', '따라서 모두 7+7+3=17가지입니다.']
 w=v['waypoints']
 if w==['C']:
  detail='가운데 교점까지 오는 경로는 5가지이고, 가운데 교점에서 B 또는 아래쪽 두 모서리로 가는 방법은 3가지입니다. 따라서 5×3=15가지입니다.'
 elif w in (['TL'],['TR']):
  corner=NAMES[w[0]]; detail=f'A에서 {corner}로 가는 길을 택한 뒤에는 다음 변의 가운데 교점을 거쳐 가는 길 4가지와 가운데 교점을 바로 거쳐 가는 길 3가지가 있습니다. 따라서 4+3=7가지입니다.'
 elif w==['L']:
  detail='왼쪽 변 가운데 교점에 도착하려면 A에서 왼쪽 위 모서리와 왼쪽 변 가운데 교점을 차례로 지나야 합니다. 그 교점에서 가운데 교점을 거쳐 가는 3가지와 왼쪽 아래 모서리로 바로 가는 1가지를 합쳐 4가지입니다.'
 elif w==['R']:
  detail='오른쪽 변 가운데 교점에 도착하려면 A에서 오른쪽 위 모서리와 오른쪽 변 가운데 교점을 차례로 지나야 합니다. 그 교점에서 가운데 교점을 거쳐 가는 3가지와 오른쪽 아래 모서리로 바로 가는 1가지를 합쳐 4가지입니다.'
 elif w==['BL']:
  detail='가운데 교점까지 오는 5가지 길은 모두 왼쪽 아래 모서리로 갈 수 있습니다. 여기에 가운데 교점을 거치지 않고 왼쪽 위 모서리와 왼쪽 변 가운데 교점을 지나 바로 오는 1가지를 더하면 6가지입니다.'
 elif w==['BR']:
  detail='가운데 교점까지 오는 5가지 길은 모두 오른쪽 아래 모서리로 갈 수 있습니다. 여기에 가운데 교점을 거치지 않고 오른쪽 위 모서리와 오른쪽 변 가운데 교점을 지나 바로 오는 1가지를 더하면 6가지입니다.'
 elif w==['C','BL']:
  detail='가운데 교점까지 오는 길은 5가지입니다. 그곳에서 왼쪽 아래 모서리를 거쳐 B로 가는 길은 하나뿐이므로 5×1=5가지입니다.'
 else: raise ValueError(w)
 return ['각 화살표를 한 번 이동으로 보고, A에서 시작해 B에 도착할 때까지 화살표 방향이 이어지는 경로를 셉니다.', detail, f'따라서 조건에 맞는 방법은 {count}가지입니다.']
def make_item(v,n):
 count=len(filtered(v)); steps=solution_steps(v,count)
 return {'id':f'applied8-q21-v{n}','genId':'applied8-q21','sourceSet':'applied','sourceRound':8,'sourceNo':21,'variantNo':n,'reviewStatus':'verified','area':'경우의 수','subarea':'방향이 있는 길 찾기','detailType':'화살표 방향 그래프에서 경로 수 세기','pointBand':'3.4','text':statement(v),'asset':{'kind':'raster','src':'assets/applied8/q21-directed-graph-original.png','description':'활용 8회 원문 21번의 방향 화살표 그림을 그대로 사용'},'answer':f'{count}가지','answerParts':[count],'answerLabels':['가는 방법 수'],'acceptedAnswers':[str(count),f'{count}가지'],'answerContract':'single-number','solutionSteps':steps,'solution':' '.join(steps),'learningPoint':'화살표 방향을 따라 갈 수 있는 경로를 나누어 세고, 조건이 있으면 지정된 교점을 지나는 경로만 고르기','learningLocation':'활용 8회 · 원문 21번 · 방향 화살표가 있는 길의 경로 수','verification':{'primaryMethod':'원문 그림의 교점과 화살표 방향을 유향 그래프로 전사하고 모든 A→B 경로를 DFS로 열거한다.','independentMethod':'별도 경로 재귀 열거로 원문 및 각 교점 조건의 경로 수를 다시 계산한다.','parameters':{'directedEdges':EDGES,'requiredWaypoints':v['waypoints'],'qualifyingPaths':count,'allPaths':len(ALL)},'independentSuite':'qa/applied8-q21-independent-validate.py','sourceExamPage':4,'sourceExamFile':EXAM.name,'sourceAnswerPage':4,'sourceDrawingCompared':True,'sourceDrawingPresent':True,'variantUsesSourceDrawing':True,'sourceDrawingAssetSha256':sha(ASSET),'officialAnswerStatus':'The available Drive answer PDF page is an unmarked duplicate of the question page; the source and variants were independently enumerated from the directly inspected arrow diagram.','studentDifficultyMeasured':False},'difficultyEvidence':{'basis':'source-point-band','label':'중','sourceReasoningPreserved':True,'measuredVariantRate':None,'estimated':False,'rationale':'활용 8회 원문 21번은 13~22번의 3.4점 배점대다. 활용 난도는 배점대만 적용한다.'}}

def main():
 for p in (EXAM,ANSWER,PAGE,CROP):
  if not p.is_file(): raise SystemExit(f'Missing reviewed source {p}')
 exam=PdfReader(str(EXAM)).pages[3].extract_text(); ans=PdfReader(str(ANSWER)).pages[3].extract_text()
 compact=''.join(exam.split())
 if compact.count('도시에서')<1 or '도시까지' not in compact or '가는방법은모두' not in compact or '몇가지있을까요' not in compact: raise SystemExit('Source page 4 Q21 prompt mismatch.')
 if exam!=ans: raise SystemExit('Answer candidate differs from source page 4; inspect.')
 page=Image.open(PAGE).convert('RGB'); exact=page.crop((1440,2400,1910,3000)); cand=Image.open(CROP).convert('RGB')
 if exact.size!=cand.size or exact.tobytes()!=cand.tobytes(): raise SystemExit('Candidate Q21 crop is not exact to source p4.')
 ASSET.parent.mkdir(parents=True,exist_ok=True)
 if ASSET.exists():
  old=Image.open(ASSET).convert('RGB')
  if old.size!=exact.size or old.tobytes()!=exact.tobytes(): raise SystemExit('Existing Q21 asset differs; refusing overwrite.')
 else: shutil.copyfile(CROP,ASSET)
 data=json.loads(DATA_PATH.read_text()); idx=json.loads(INDEX_PATH.read_text())
 old=[x for x in data['items'] if x['sourceNo']==21]
 if old and len(old)!=9: raise SystemExit(f'Q21 has {len(old)} items; inspect before rebuilding.')
 items=[make_item(v,i+1) for i,v in enumerate(VARIANTS)]
 data['version']=VERSION; data['items']=[x for x in data['items'] if x['sourceNo']!=21]+items; data['items'].sort(key=lambda x:(x['sourceNo'],x['variantNo']))
 data['itemCount']=len(data['items']); data['availableSourceNos']=sorted(set(data['availableSourceNos']+[21])); data['pendingSourceNos']=[n for n in range(1,31) if n not in data['availableSourceNos']]
 idx['version']=VERSION; idx['itemCount']=data['itemCount']; idx['pendingSourceNos']=data['pendingSourceNos']; idx['items']=[x for x in idx['items'] if x['sourceNo']!=21]
 idx['items'].append({'sourceNo':21,'genId':'applied8-q21','area':'경우의 수','subarea':'방향이 있는 길 찾기','detailType':'화살표 방향 그래프에서 경로 수 세기','pointBand':'3.4','reviewStatus':'verified','variantCount':9});idx['items'].sort(key=lambda x:x['sourceNo'])
 DATA_PATH.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');INDEX_PATH.write_text(json.dumps(idx,ensure_ascii=False,indent=2)+'\n')
 review={'sourceExam':{'file':EXAM.name,'sha256':sha(EXAM),'page':4,'questionNo':21,'directVisualReview':True,'prompt':'A도시에서 B도시까지 이동할 때 가는 방법 수를 묻는다.','diagram':{'render':str(PAGE.relative_to(ROOT)),'cropCoordinatesPx':[1440,2400,1910,3000],'asset':str(ASSET.relative_to(ROOT)),'assetSha256':sha(ASSET),'pixelExactCropVerified':True,'vertices':['A','B','top-left','top-right','left-mid','right-mid','center','bottom-left','bottom-right'],'directedEdges':EDGES}},'answerCandidate':{'file':ANSWER.name,'sha256':sha(ANSWER),'page':4,'directVisualReview':True,'containsAnswers':False,'comparison':'The available answer-copy page is visually and textually identical to the question page; answer line is blank.'},'sourceIndependentSolution':{'allDirectedPaths':len(ALL),'answer':len(ALL),'enumeration':ALL},'variantCount':9,'variantPathCounts':[{'variant':i+1,'waypoints':v['waypoints'],'paths':len(filtered(v))} for i,v in enumerate(VARIANTS)],'variantsIndependentlyCalculated':True,'sourceDrawingReusedPixelExact':True,'newSourceTypes':0,'difficulty':'3.4-point band only = middle'}
 REVIEW.write_text(json.dumps(review,ensure_ascii=False,indent=2)+'\n')
 print(f'Added 9 Q21 variants; exact source graph paths={len(ALL)}; {data["itemCount"]} items across {len(data["availableSourceNos"])} existing source types.')
if __name__=='__main__':main()
