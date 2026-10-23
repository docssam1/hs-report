"""Release only the exact independently checked, visually reviewed levelled file."""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
work = ROOT / '.private-work/balanced15-20261024'
file = ROOT / 'bank/data/applied1-balanced15.json'
before = hashlib.sha256(file.read_bytes()).hexdigest()
data = json.loads(file.read_text())
math = json.loads((work / 'independent-math.json').read_text())
browser = json.loads((work / 'output-qa/browser-evidence.json').read_text())
visual = json.loads((work / 'visual-review.json').read_text())
assert all(x['dataSha256'] == before for x in [math, browser, visual])
assert all(x['count'] == 45 for x in [math, browser, visual])
assert all(x['passed'] for x in math['items']) and visual['passed'] and browser['overflow'] == 0
assert browser['externalWrites'] == [] and browser['firstAttemptPreserved']
assert hashlib.sha256((ROOT / 'bank/data/applied1-expanded.json').read_bytes()).hexdigest() == data['legacyBankSha256']
for item in data['items']:
    assert item['reviewStatus'] in ['verified', 'pending-output-review']
    item['reviewStatus'] = 'verified'
data['reviewSummary'] = dict(sourceTypes=3, perSource=15, perLevel=5, count=45,
                             preservedLegacyCount=15, newAuthoredCount=30,
                             independentAnswers=True, actualZipReviewed=True,
                             sourceGradeMutation=False, studentDifficultyMeasured=False)
file.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
rows = {'applied|1|' + str(n): {'bank': 'applied1-balanced15', 'sourceNo': n,
                               'count': 15, 'perLevel': 5, 'version': data['version']}
        for n in data['availableSourceNos']}
index = "/* Reviewed levelled extensions; original point bands and existing banks are preserved. */\n"
index += "(function(root,factory){'use strict';var api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.GFIELD_BALANCED_PRACTICE=api;})(typeof window!=='undefined'?window:globalThis,function(){'use strict';var rows="
index += json.dumps(rows, ensure_ascii=False, separators=(',', ':'))
index += ";function get(set,round,no){var k=[set==='hw'?'applied':set,Number(round),Number(no)].join('|'),x=rows[k];return x?JSON.parse(JSON.stringify(x)):null;}function url(set,round,nos){if(!Array.isArray(nos)||!nos.length||new Set(nos).size!==nos.length)return '';var a=nos.map(function(n){return get(set,round,n);});if(a.some(function(x){return !x;})||a.some(function(x){return x.bank!==a[0].bank;}))return '';return 'pool.html?bank='+encodeURIComponent(a[0].bank)+'&nos='+nos.join(',')+'&count=15';}return {get:get,url:url};});\n"
(ROOT / 'bank/balanced-practice-index.js').write_text(index)
(work / 'release-evidence.json').write_text(json.dumps({'preReleaseSha256': before,
    'releasedSha256': hashlib.sha256(file.read_bytes()).hexdigest(), 'count': 45,
    'preservedLegacyCount': 15, 'newAuthoredCount': 30, 'availableSourceNos': data['availableSourceNos']}, indent=2) + '\n')
print('Released 45 levelled items for sources1/2/3; original nine-item bank unchanged')
