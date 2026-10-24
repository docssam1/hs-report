"""Small metadata bridge from reviewed pools to original exam diagnosis."""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
rounds={}
for number in [1,2,3,4,5]:
 d=json.loads((ROOT/f'bank/data/applied{number}-expanded.json').read_text())
 assert all(x['reviewStatus']=='verified' for x in d['items'])
 rows={}
 for no in d['availableSourceNos']:
  group=[x for x in d['items'] if x['sourceNo']==no];assert len(group)==9
  x=group[0];rows[str(no)]={k:x[k] for k in ['sourceNo','area','subarea','detailType','learningPoint','learningLocation']}
 rounds[str(number)]={'bank':f'applied{number}','version':d['version'],'variantsPerSource':9,'defaultVariants':3,'items':rows,'pendingSourceNos':d['pendingSourceNos']}
data={'version':'20261024-r7','rounds':rounds}
source="/* Reviewed metadata only; original answers and grades are not copied. */\n(function(root){'use strict';var data="+json.dumps(data,ensure_ascii=False,separators=(',',':'))+";if(typeof module==='object'&&module.exports)module.exports=data;if(root)root.GFIELD_APPLIED_LEARNING_INDEX=data;})(typeof window!=='undefined'?window:globalThis);\n"
(ROOT/'bank/applied-learning-index.js').write_text(source)
count=sum(len(r['items']) for r in rounds.values())
print(f'Learning bridge: {count} source types, {count*9} stored variants; diagnosis default 3, extra practice 9')
