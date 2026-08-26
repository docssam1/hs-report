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

function pngInfo(name, expectedColorTypes = [6]) {
  const file = path.join(repo, 'assets', 'original-form', name);
  const buffer = fs.readFileSync(file);
  check(buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])), `${name}: PNG signature`);
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  const colorType = buffer[25];
  check(width >= 1000 && height >= 900, `${name}: print resolution`);
  check(expectedColorTypes.includes(colorType), `${name}: expected PNG color type`);
  return { file, width, height };
}

pngInfo('gpt-puppy-side-v1.png');
pngInfo('gpt-overlap-digits-no6-v2.png', [2]);
pngInfo('gpt-overlap-digits-no2-v2.png', [2]);

const dogFunction = renderer.match(/function dogLengthFigure\(\) \{[\s\S]*?\n\}/)[0];
const digitFunction = renderer.match(/function overlapDigitsFigure\(missing = 6\) \{[\s\S]*?\n\}/)[0];
check(dogFunction.includes('gpt-puppy-side-v1.png'), 'dog figure consumes GPT raster puppy');
check(!dogFunction.includes('<svg') && !dogFunction.includes('<ellipse'), 'dog figure has no SVG placeholder dog');
check(digitFunction.includes('gpt-overlap-digits-no6-v2.png') && digitFunction.includes('gpt-overlap-digits-no2-v2.png'), 'both digit variants consume dense GPT raster assets');
check(!digitFunction.includes('return svg'), 'digit figure has no SVG text tangle');

const round1Html = fs.readFileSync(path.join(privateRoot, 'original-form-round1-exam.html'), 'utf8');
const round2Html = fs.readFileSync(path.join(privateRoot, 'original-form-round2-exam.html'), 'utf8');
check((round1Html.match(/gpt-puppy-side-v1\.png/g) || []).length === 5, 'round 1 q11 shows exactly five puppies');
check(['2m', '4m', '2m', '3m', '5m', '6m', '3m'].every((label) => round1Html.includes(`>${label}<`)), 'round 1 q11 retains all seven distance labels');
check(round1Html.includes('gpt-overlap-digits-no6-v2.png'), 'round 1 q12 uses dense no-6 digit art');
check(round2Html.includes('gpt-overlap-digits-no2-v2.png'), 'round 2 q10 uses dense no-2 digit art');

const round1 = JSON.parse(fs.readFileSync(path.join(privateRoot, 'original-form-round1-data.json'), 'utf8'));
const round2 = JSON.parse(fs.readFileSync(path.join(privateRoot, 'original-form-round2-data.json'), 'utf8'));
check(round1.questions[10].answer === '3m', 'round 1 q11 answer remains 3m');
check(round1.questions[11].answer === '39', 'round 1 q12 answer remains 39');
check(round2.questions[9].answer === '43', 'round 2 q10 answer remains 43');

console.log(`원본형 GPT PNG 삽화 QA ${checks}개 통과`);
