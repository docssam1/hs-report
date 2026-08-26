const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const work = path.join(root, '.private-work', 'original-similar-2rounds');
const forbidden = /(?<![A-Za-z])[nwx](?![A-Za-z])|[²³]|제곱|세제곱|문자식|전수 확인|대입하면/g;
let checks = 0;

function check(ok, message) {
  checks += 1;
  if (!ok) throw new Error(message);
}

for (const round of [1, 2]) {
  const dataPath = path.join(work, `original-form-round${round}-data.json`);
  const answerPath = path.join(work, `original-form-round${round}-answer.html`);
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const answerHtml = fs.readFileSync(answerPath, 'utf8');

  for (const question of data.questions) {
    for (const field of ['prompt', 'solution']) {
      const matches = question[field].match(forbidden) || [];
      check(matches.length === 0, `R${round} Q${question.number} ${field}: 초2·3 비대상 표기 ${matches.join(', ')}`);
    }
  }

  const renderedText = answerHtml
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(?:nbsp|gt|lt|amp);/g, ' ');
  check(!renderedText.match(forbidden), `R${round}: 정답지 본문에 초2·3 비대상 표기가 있습니다.`);
}

console.log(`원본형 초2·3 언어 QA ${checks}개 통과`);
