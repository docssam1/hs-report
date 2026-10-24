"""Independently recompute the nine Q26 blocked-road shortest round trips."""
from pathlib import Path
from collections import deque
import hashlib, json
ROOT=Path(__file__).resolve().parents[1]
WORK=ROOT/'.private-work/nine-expansion-20261024/round9-q26'
DATA=ROOT/'bank/data/applied4-expanded.json'
SOURCE=ROOT/'materials/초등과정 대비 실전 모의고사 활용 4회.pdf'
ANSWER=ROOT/'.private-work/balanced15-20261024/source/applied4-answer.pdf'

def edge(a,b): return tuple(sorted((tuple(a),tuple(b))))
def graph(n,blocked):
    blocked={edge(a,b) for a,b in blocked}; vs=[(x,y) for x in range(n+1) for y in range(n+1)]
    adj={v:[] for v in vs}
    for x,y in vs:
        for w in ((x+1,y),(x-1,y),(x,y+1),(x,y-1)):
            if w in adj and edge((x,y),w) not in blocked: adj[(x,y)].append(w)
    return vs,adj,blocked

def bfs(adj,start,goal):
    q=deque([start]); dist={start:0}
    while q:
        v=q.popleft()
        if v==goal:return dist[v]
        for w in adj[v]:
            if w not in dist:dist[w]=dist[v]+1;q.append(w)
    return None

def relax(vs,adj,start,goal):
    d={v:(0 if v==start else 10**9) for v in vs}
    for _ in range(len(vs)-1):
        changed=False
        for a in vs:
            if d[a]>=10**9:continue
            for b in adj[a]:
                if d[b]>d[a]+1:d[b]=d[a]+1;changed=True
        if not changed:break
    return None if d[goal]>=10**9 else d[goal]

def main():
    d=json.loads(DATA.read_text()); prior=json.loads((WORK/'prior-expanded.json').read_text())
    items=[q for q in d['items'] if q['sourceNo']==26]
    assert len(prior['items'])==198 and d['items'][:198]==prior['items']
    assert len(items)==9 and [x['variantNo'] for x in items]==list(range(1,10))
    assert d['availableSourceNos']==sorted(prior['availableSourceNos']+[26]) and 26 not in d['pendingSourceNos']
    expectedStages=['low']*3+['middle']*3+['high']*3
    proofs=[]; signatures=set()
    for q,stage in zip(items,expectedStages):
        p=q['verification']['parameters']; n=p['gridCells']; s=tuple(p['start']);t=tuple(p['goal']); path=[tuple(x) for x in p['witnessPath']]
        vs,adj,blocked=graph(n,p['blockedRoadEdges']); a=bfs(adj,s,t); b=relax(vs,adj,s,t)
        assert a==b==p['oneWaySteps']==len(path)-1
        assert all(y in adj[x] for x,y in zip(path,path[1:]))
        assert len(blocked)==len(p['blockedRoadEdges'])
        total=2*a*p['unitLengthMeters']; assert total==p['roundTripMeters']==q['answerParts'][0]
        assert q['answer']==str(total) and q['acceptedAnswers']==[str(total)]
        assert q['practiceStage']==stage and q['pointBand']=='4.2' and q['difficultyEvidence']['label']=='상'
        assert q['verification']['sourceAnswerMatch'] is False
        asset=ROOT/'bank'/q['asset']['src']; assert asset.is_file() and '<svg' in asset.read_text()
        sig=json.dumps([n,sorted([sorted([list(x),list(y)]) for x,y in p['blockedRoadEdges']])],sort_keys=True)
        assert sig not in signatures; signatures.add(sig)
        proofs.append({'id':q['id'],'bfsSteps':a,'relaxationSteps':b,'unitMeters':p['unitLengthMeters'],'answerMeters':total,'passed':True})
    report={'dataSha256':hashlib.sha256(DATA.read_bytes()).hexdigest(),'sourceQuestionSha256':hashlib.sha256(SOURCE.read_bytes()).hexdigest(),'sourceAnswerSha256':hashlib.sha256(ANSWER.read_bytes()).hexdigest(),'sourceQuestionPage':5,'sourceAnswerPage':26,'sourceAnswerMatchClaimed':False,'variants':9,'old198Exact':True,'allPassed':True,'items':proofs}
    (WORK/'q26-independent-math.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print('PASS Q26: 9 distinct diagrams; BFS and independent edge relaxation agree; original 198 exact')
if __name__=='__main__':main()
