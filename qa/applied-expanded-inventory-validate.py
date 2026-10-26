"""Stored-bank integrity across all released Applied pools; no private fixtures or writes."""
import json,collections
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];items=[];types=0;rounds=[]
for file in sorted((ROOT/'bank/data').glob('applied*-expanded.json')):
 d=json.loads(file.read_text());n=d['sourceRound'];assert d['sourceSet']=='applied' and d['policy']['targetVariantsPerSource']==9
 idx=json.loads(file.with_name(file.stem+'-index.json').read_text());assert idx['sourceRound']==n and idx['version']==d['version'] and idx['itemCount']==len(d['items'])
 index_by_no={x['sourceNo']:x for x in idx['items']}
 assert sorted(d['availableSourceNos']+d['pendingSourceNos'])==list(range(1,31))
 assert set(d['availableSourceNos']).isdisjoint(d['pendingSourceNos'])
 assert {x['sourceNo'] for x in idx['items']}==set(d['availableSourceNos'])
 for no in d['availableSourceNos']:
  g=[x for x in d['items'] if x['sourceNo']==no];assert len(g)==9 and {x['variantNo'] for x in g}==set(range(1,10))
  for x in g:
   assert x['reviewStatus']=='verified' and x['sourceRound']==n and x['sourceSet']=='applied'
   assert x['id']==f'applied{n}-q{no:02d}-v{x["variantNo"]}' and x['genId']==f'applied{n}-q{no:02d}'
   assert x['learningLocation'] and x['learningPoint'] and len(x['solutionSteps'])>=3
   assert x['pointBand']==index_by_no[no]['pointBand']
   assert x['difficultyEvidence']['label']=={'2.7':'하','3.4':'중','4.2':'상'}[x['pointBand']]
   assert x['difficultyEvidence']['measuredVariantRate'] is None
   if x.get('asset'):assert (ROOT/'bank'/x['asset']['src']).is_file()
 types+=len(d['availableSourceNos']);rounds.append(n);items+=d['items']
assert len({x['id'] for x in items})==len(items)==types*9
# An unchanged instruction is valid when the actual mathematical table/cards vary.
# Compare the complete displayed question, excluding IDs, labels and verification metadata.
seen=collections.defaultdict(list)
for x in items:
 q={k:x.get(k) for k in ['text','promptDataLines','givenTable','arithmeticRows','cards']};q['drawing']=(x.get('asset') or {}).get('src')
 seen[json.dumps(q,sort_keys=True,ensure_ascii=False)].append(x['id'])
assert all(len(g)==1 for g in seen.values()),[g for g in seen.values() if len(g)>1]
venn=collections.defaultdict(list)
for x in items:
 p=x['verification']['parameters'];keys=['total','A','B','C','AB','BC','AC','none']
 if all(k in p for k in keys):venn[tuple(p[k] for k in keys)].append(x['id'])
assert all(len(g)==1 for g in venn.values())
print(f'PASS Applied pools {rounds}: {len(items)} distinct displayed questions, {types} types ×9; all verified; 3 point bands; learning/asset/index integrity; no identical cross-source Venn cases')
