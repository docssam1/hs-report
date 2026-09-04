const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.resolve(__dirname, '..', 'exam-timer-voice.html'), 'utf8');
assert.match(html, /<html lang="ko-KR" translate="no" class="notranslate">/, '타이머 문서는 한국어이며 자동번역을 막아야 함');
assert.match(html, /<meta name="google" content="notranslate">/, 'Google 자동번역 방지 메타 필요');
assert.match(html, /utterance\.lang = "ko-KR"/, '대체 음성 언어는 한국어');
assert.match(html, /getVoices\(\)\.find\(\(voice\) => \/\^ko/, '한국어 음성을 명시적으로 선택');
assert.doesNotMatch(html, /utterance\.lang\s*=\s*["']en/i, '영어 대체 음성 금지');
console.log('PASS exam timer stays Korean and selects a Korean fallback voice');
