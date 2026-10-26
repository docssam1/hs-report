#!/usr/bin/env python3
"""Independent arithmetic and artwork verification for all Applied 9 Q09 variants."""
import hashlib, json, re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
DATA=json.loads((ROOT/'bank/data/applied9-expanded.json').read_text())
INDEX=json.loads((ROOT/'bank/data/applied9-expanded-index.json').read_text())
assert INDEX['version']==DATA['version'] and INDEX['itemCount']==DATA['itemCount']==len(DATA['items'])
assert sum(x['sourceNo']==9 for x in INDEX['items'])==1 and next(x for x in INDEX['items'] if x['sourceNo']==9)['variantCount']==9
items=[x for x in DATA['items'] if x['sourceNo']==9]
assert len(items)==9 and DATA['version'].endswith('-taxonomy-r25')
answers=[]; triples=[]
for i,item in enumerate(items,1):
    assert item['id']==f'applied9-q09-v{i}' and item['answerContract']=='ordered-parts'
    p=item['verification']['parameters']; ab=p['pairSums']['가+나'];bc=p['pairSums']['나+다'];ac=p['pairSums']['가+다']
    # Independent solution to the 3 linear pair-sum equations.
    a,b,c=(ab+ac-bc)//2,(ab+bc-ac)//2,(bc+ac-ab)//2
    assert all(v>0 for v in (a,b,c))
    assert (a,b,c)==tuple(item['answerParts'])==(p['personWeights']['가'],p['personWeights']['나'],p['personWeights']['다'])
    assert [a+b,b+c,a+c]==[ab,bc,ac]
    answers.append([a,b,c]);triples.append(tuple((ab,bc,ac)))
    asset=ROOT/'bank'/item['asset']['src'];raw=asset.read_bytes();svg=raw.decode()
    assert hashlib.sha256(raw).hexdigest()==item['asset']['sha256']
    for value,pair in zip((ab,bc,ac),(('가','나'),('나','다'),('가','다'))):
        assert re.search(rf'>{value} kg</text>',svg)
        assert re.search(rf'>{pair[0]} \+ {pair[1]}</text>',svg)
assert len(set(triples))==9 and len(set(tuple(a) for a in answers))==9
print(json.dumps({'status':'PASS','sourceNo':9,'variants':9,'uniqueAnswerTriples':answers,
                  'pairSums':triples,'figureCount':9,'method':'independent linear-equation solution and SVG text/hash inspection'},ensure_ascii=False,indent=2))
