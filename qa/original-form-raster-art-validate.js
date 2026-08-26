const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const privateRoot = path.join(repo, '.private-work', 'original-similar-2rounds');
const renderer = fs.readFileSync(path.join(privateRoot, 'render-original-form-two-rounds.js'), 'utf8');
let checks = 0;

function check(condition, message) {
  assert.ok(condition, message);
  checks += 1;
}

function pngInfo(name, expectedColorTypes = [2, 6]) {
  const file = path.join(repo, 'assets', 'original-form', name);
  const buffer = fs.readFileSync(file);
  check(buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])), `${name}: PNG signature`);
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  const colorType = buffer[25];
  check(width >= 1000 && height >= 800, `${name}: print resolution`);
  check(expectedColorTypes.includes(colorType), `${name}: expected PNG color type`);
  return { file, width, height };
}

[
  'gpt-puppy-side-v1.png',
  'gpt-pencil-lead-horizontal-v3.png',
  'gpt-left-slipper-top-v2.png',
  'gpt-left-slipper-sole-v1.png',
  'gpt-fishbowl-3-v1.png',
  'gpt-orange-bottles-3-v1.png',
  'gpt-frog-side-v1.png',
  'gpt-palm-tree-v1.png',
  'gpt-imp-head-v1.png',
  'gpt-overlap-digits-no6-v2.png',
  'gpt-overlap-digits-variant-b-v1.png',
].forEach((name) => pngInfo(name));

const dogFunction = renderer.match(/function dogLengthFigure\(\) \{[\s\S]*?\n\}/)[0];
const digitFunction = renderer.match(/function overlapDigitsFigure\(missing = 6\) \{[\s\S]*?\n\}/)[0];
const leadFunction = renderer.match(/function leadFigure\(mode = 'whole'\) \{[\s\S]*?\n\}/)[0];
const slipperFunction = renderer.match(/function slippersFigure\(variant = 1\) \{[\s\S]*?\n\}/)[0];
check(dogFunction.includes('gpt-puppy-side-v1.png'), 'dog figure consumes GPT raster puppy');
check(!dogFunction.includes('<svg') && !dogFunction.includes('<ellipse'), 'dog figure has no SVG placeholder dog');
check(digitFunction.includes('gpt-overlap-digits-no6-v2.png') && digitFunction.includes('gpt-overlap-digits-variant-b-v1.png'), 'both used digit variants consume dense GPT raster assets');
check(!digitFunction.includes('return svg'), 'digit figure has no SVG text tangle');
check(leadFunction.includes('gpt-pencil-lead-horizontal-v3.png'), 'lead figures consume one consistent horizontal GPT raster lead');
check(slipperFunction.includes('gpt-left-slipper-top-v2.png') && slipperFunction.includes('gpt-left-slipper-sole-v1.png'), 'slipper figures consume GPT raster top and sole views');

function questionHtml(html, number) {
  const marker = `<h2>${number}.`;
  const markerIndex = html.indexOf(marker);
  check(markerIndex >= 0, `question ${number} marker exists`);
  const start = html.lastIndexOf('<article', markerIndex);
  const end = html.indexOf('</article>', markerIndex);
  check(start >= 0 && end >= 0, `question ${number} article bounds exist`);
  return html.slice(start, end + '</article>'.length);
}

const round1Html = fs.readFileSync(path.join(privateRoot, 'original-form-round1-exam.html'), 'utf8');
const round2Html = fs.readFileSync(path.join(privateRoot, 'original-form-round2-exam.html'), 'utf8');
const r1q12 = questionHtml(round1Html, 12);
check((r1q12.match(/gpt-puppy-side-v1\.png/g) || []).length === 5, 'round 1 q12 shows exactly five puppies');
check(['2m', '4m', '2m', '3m', '5m', '6m', '3m'].every((label) => r1q12.includes(`>${label}<`)), 'round 1 q12 retains all seven distance labels');
check(questionHtml(round1Html, 7).includes('gpt-overlap-digits-no6-v2.png'), 'round 1 q7 uses dense no-6 digit art');
check(questionHtml(round2Html, 1).includes('gpt-overlap-digits-variant-b-v1.png'), 'round 2 q1 uses neutral-filename dense digit art');
check((questionHtml(round1Html, 2).match(/class="lead-piece whole"/g) || []).length === 14, 'round 1 q2 has fourteen equal-size lead instances');
check((questionHtml(round2Html, 6).match(/class="lead-piece whole"/g) || []).length === 9, 'round 2 q6 has nine whole lead instances');
check((questionHtml(round2Html, 6).match(/class="lead-piece fragment"/g) || []).length === 6, 'round 2 q6 has six paired fragments');

for (const [round, html] of [[1, round1Html], [2, round2Html]]) {
  check((html.match(/\sdata-[\w:-]+\s*=/gi) || []).length === 0, `round ${round} exam has no answer-bearing data attributes`);
  const forbidden = /(?:aria-label|alt)="[^"]*(?:샤프심\s*14개|(?:왼쪽|오른쪽)\s*슬리퍼|야자수[^"]*6마리|물에\s*8마리|정확히\s*(?:다섯|5)\s*번\s*교차|숫자\s*8을\s*제외)[^"]*"/gi;
  check(!forbidden.test(html), `round ${round} neutral alt and aria labels do not disclose answers`);
}
check(!/src="[^"]*(?:no[-_]?8|no8)[^"]*"/i.test(round2Html), 'round 2 q1 raster filename does not disclose the missing digit');

const round1 = JSON.parse(fs.readFileSync(path.join(privateRoot, 'original-form-round1-data.json'), 'utf8'));
const round2 = JSON.parse(fs.readFileSync(path.join(privateRoot, 'original-form-round2-data.json'), 'utf8'));
check(round1.questions[11].answer === '3m', 'round 1 q12 answer remains 3m');
check(round1.questions[6].answer === '39', 'round 1 q7 answer remains 39');
check(round2.questions[0].answer === '8', 'round 2 q1 answer remains 8');
check(round2.questions[7].answer === '파란색', 'round 2 q8 asks for the endpoint marker color');

console.log(`원본형 GPT PNG 삽화 QA ${checks}개 통과`);
