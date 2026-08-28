'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const PRIVATE = path.join(ROOT, '.private-work', 'original-similar-2rounds');
const EXPECTED_RANGES = [[1, 2, 3, 4, 5, 6], [7, 8, 9, 10, 11, 12], [13, 14, 15, 16, 17, 18], [19, 20, 21, 22, 23, 24], [25, 26, 27, 28], [29, 30]];
const EXPECTED_QUADRANT_COLUMNS = [
  [[25, 26], [27, 28]],
  [[29], [30]],
];

function questionNumbers(markup) {
  return [...markup.matchAll(/<h2>(\d+)\.<\/h2>/g)].map((match) => Number(match[1]));
}

function columnQuestionNumbers(pageMarkup, label) {
  const main = pageMarkup.match(/<main class="columns"><div class="column">([\s\S]*)<\/div><\/main>/);
  assert.ok(main, `${label} 2열 본문`);
  const divider = '</div><div class="column">';
  const dividerIndex = main[1].indexOf(divider);
  assert.ok(dividerIndex >= 0, `${label} 좌우 열 경계`);
  return [
    questionNumbers(main[1].slice(0, dividerIndex)),
    questionNumbers(main[1].slice(dividerIndex + divider.length)),
  ];
}

const renderer = fs.readFileSync(path.join(PRIVATE, 'render-original-form-two-rounds.js'), 'utf8');
assert.match(
  renderer,
  /\.page\.quadrant-page\s+\.column\s*\{[^}]*display\s*:\s*grid[^}]*grid-template-rows\s*:\s*repeat\(2\s*,\s*minmax\(0\s*,\s*1fr\)\)[^}]*\}/s,
  '마지막 두 쪽은 2행 사분면 grid',
);
assert.match(
  renderer,
  /\.page\.quadrant-page\s+\.question\s*\{[^}]*align-self\s*:\s*start[^}]*\}/s,
  '사분면 문항은 각 칸 상단에 고정',
);

const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'mock-data-original.js'), 'utf8'), sandbox);
const model = JSON.parse(JSON.stringify(sandbox.window.GFIELD_MOCK_ORIGINAL));

assert.equal(model.exam.minutes, 80, '원본형 제한시간');
assert.equal(model.roundCount, 2, '원본형 회차 수');

const prompts = [];
for (const roundNumber of [1, 2]) {
  const roundKey = String(roundNumber);
  const round = model.rounds[roundKey];
  assert.equal(round.items.length, 30, `${roundNumber}회 문항 수`);
  assert.equal(round.items.reduce((sum, item) => sum + item.pts, 0).toFixed(1), '100.0', `${roundNumber}회 총점`);
  assert.deepEqual(round.paper.pageRanges, [[1,6],[7,12],[13,18],[19,24],[25,28],[29,30]], `${roundNumber}회 공개 쪽 범위`);

  const htmlPath = path.join(PRIVATE, `original-form-round${roundNumber}-exam.html`);
  const dataPath = path.join(PRIVATE, `original-form-round${roundNumber}-data.json`);
  assert.ok(fs.existsSync(htmlPath), `${roundNumber}회 시험 HTML`);
  assert.ok(fs.existsSync(dataPath), `${roundNumber}회 문항 데이터`);
  const html = fs.readFileSync(htmlPath, 'utf8');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  assert.equal(data.minutes, 80, `${roundNumber}회 생성 데이터 제한시간`);
  assert.equal(data.questions.length, 30, `${roundNumber}회 생성 데이터 문항 수`);
  prompts.push(...data.questions.map((item) => String(item.prompt).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()));

  const pageMatches = [...html.matchAll(/<section class="([^"]*\bpage\b[^"]*)">([\s\S]*?)<\/section>/g)];
  const pages = pageMatches.map((match) => match[2]);
  assert.equal(pages.length, 6, `${roundNumber}회 시험 6쪽`);
  pages.forEach((page, index) => {
    const numbers = questionNumbers(page);
    assert.deepEqual(numbers, EXPECTED_RANGES[index], `${roundNumber}회 ${index + 1}쪽 문항 범위`);
  });
  pageMatches.slice(0, 4).forEach((match, index) => {
    assert.doesNotMatch(match[1], /\bquadrant-page\b/, `${roundNumber}회 ${index + 1}쪽은 기존 3행 배치 유지`);
  });
  pageMatches.slice(4).forEach((match, index) => {
    const pageNumber = index + 5;
    assert.match(match[1], /\bquadrant-page\b/, `${roundNumber}회 ${pageNumber}쪽 사분면 클래스`);
    assert.deepEqual(
      columnQuestionNumbers(match[2], `${roundNumber}회 ${pageNumber}쪽`),
      EXPECTED_QUADRANT_COLUMNS[index],
      `${roundNumber}회 ${pageNumber}쪽 좌상·좌하·우상·우하 문항 순서`,
    );
  });
  assert.equal((html.match(/<article class="question/g) || []).length, 30, `${roundNumber}회 학생 문항 30개`);
  assert.equal((html.match(/<svg\b/gi) || []).length, 0, `${roundNumber}회 학생 시험에 인라인 SVG 없음`);
  assert.doesNotMatch(html, /class="answer"|정답\s*(?:18개|5개|64|D6|H1)/, `${roundNumber}회 학생 시험에 정답 영역 없음`);
  assert.match(html, /제한시간\s*:\s*80분/, `${roundNumber}회 첫 장 80분 표기`);
}

assert.equal(prompts.length, 60, '두 회차 전체 문항 수');
assert.equal(new Set(prompts).size, 60, '두 회차 문항 지문 중복 없음');

async function validateRenderedQuadrants() {
  if (!process.env.GFIELD_QA_PLAYWRIGHT) return false;

  const { chromium } = require(process.env.GFIELD_QA_PLAYWRIGHT);
  const browserExecutable = process.env.GFIELD_QA_BROWSER_EXECUTABLE || '';
  const browser = await chromium.launch({
    headless: true,
    ...(browserExecutable ? { executablePath: browserExecutable } : {}),
  });

  try {
    for (const roundNumber of [1, 2]) {
      const page = await browser.newPage({ viewport: { width: 1400, height: 1600 } });
      try {
        const htmlPath = path.join(PRIVATE, `original-form-round${roundNumber}-exam.html`);
        await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'load' });
        await page.evaluate(async () => { if (document.fonts?.ready) await document.fonts.ready; });
        await page.emulateMedia({ media: 'print' });

        const result = await page.evaluate(() => [...document.querySelectorAll('.page')].slice(4).map((pageNode, pageIndex) => {
          const pageRect = pageNode.getBoundingClientRect();
          const columnsNode = pageNode.querySelector('.columns');
          const columnsRect = columnsNode.getBoundingClientRect();
          const columns = [...columnsNode.querySelectorAll(':scope > .column')].map((columnNode) => {
            const columnRect = columnNode.getBoundingClientRect();
            const style = getComputedStyle(columnNode);
            return {
              display: style.display,
              rowGap: parseFloat(style.rowGap) || 0,
              height: columnRect.height,
              questions: [...columnNode.querySelectorAll(':scope > .question')].map((questionNode) => {
                const rect = questionNode.getBoundingClientRect();
                return {
                  number: Number(questionNode.querySelector('h2').textContent.replace(/\D/g, '')),
                  top: rect.top - columnRect.top,
                  bottom: rect.bottom - columnRect.top,
                  overflow: questionNode.scrollHeight - questionNode.clientHeight,
                  outsidePage: rect.left < pageRect.left - 1 || rect.right > pageRect.right + 1 || rect.top < pageRect.top - 1 || rect.bottom > pageRect.bottom + 1,
                };
              }),
            };
          });
          return {
            pageNumber: pageIndex + 5,
            pageOverflow: pageNode.scrollHeight - pageNode.clientHeight,
            columnsOverflow: columnsNode.scrollHeight - columnsNode.clientHeight,
            columns,
            columnsTop: columnsRect.top - pageRect.top,
          };
        }));

        assert.equal(result.length, 2, `${roundNumber}회 브라우저 마지막 두 쪽`);
        result.forEach((pageResult, pageIndex) => {
          const pageNumber = pageIndex + 5;
          assert.equal(pageResult.columns.length, 2, `${roundNumber}회 ${pageNumber}쪽 2열`);
          assert.ok(pageResult.pageOverflow <= 1, `${roundNumber}회 ${pageNumber}쪽 페이지 넘침 없음`);
          assert.ok(pageResult.columnsOverflow <= 1, `${roundNumber}회 ${pageNumber}쪽 본문 넘침 없음`);
          pageResult.columns.forEach((column, columnIndex) => {
            assert.equal(column.display, 'grid', `${roundNumber}회 ${pageNumber}쪽 ${columnIndex + 1}열 grid`);
            assert.deepEqual(
              column.questions.map((question) => question.number),
              EXPECTED_QUADRANT_COLUMNS[pageIndex][columnIndex],
              `${roundNumber}회 ${pageNumber}쪽 ${columnIndex + 1}열 문항 순서`,
            );
            assert.ok(Math.abs(column.questions[0].top) <= 1, `${roundNumber}회 ${pageNumber}쪽 ${columnIndex + 1}열 상단 문항 고정`);
            if (column.questions.length === 2) {
              const expectedSecondTop = (column.height + column.rowGap) / 2;
              assert.ok(Math.abs(column.questions[1].top - expectedSecondTop) <= 2, `${roundNumber}회 ${pageNumber}쪽 ${columnIndex + 1}열 하단 문항 고정`);
              assert.ok(column.questions[0].bottom <= column.questions[1].top + 1, `${roundNumber}회 ${pageNumber}쪽 ${columnIndex + 1}열 문항 겹침 없음`);
            }
            column.questions.forEach((question) => {
              assert.ok(question.overflow <= 1, `${roundNumber}회 ${pageNumber}쪽 ${question.number}번 내부 넘침 없음`);
              assert.equal(question.outsidePage, false, `${roundNumber}회 ${pageNumber}쪽 ${question.number}번 페이지 안쪽`);
            });
          });
        });
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }
  return true;
}

(async () => {
  const browserChecked = await validateRenderedQuadrants();
  console.log(`원본형 60문항·80분·6쪽·래스터·사분면 배치 QA 통과${browserChecked ? ' · 브라우저 좌표·넘침 검증' : ' · 정적 검증'}`);
})().catch((error) => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
