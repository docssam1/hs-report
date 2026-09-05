'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'bank/data/final1-fixed90.json'), 'utf8'));
const index = {version:data.version,items:data.items.map(q=>({
  id:q.id,sourceNo:q.sourceNo,genId:q.genId,variantNo:q.variantNo,reviewStatus:q.reviewStatus,
  area:q.area,subarea:q.subarea,detailType:q.detailType,pointBand:q.pointBand,
  text:q.text,conditionLines:q.conditionLines||[]
}))};
fs.writeFileSync(path.join(root,'bank/data/final1-fixed90-index.json'),JSON.stringify(index,null,2)+'\n');
console.log(`Indexed ${index.items.length} fixed prompts without answers or figures.`);
