'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const admin = fs.readFileSync(path.join(ROOT, 'admin.html'), 'utf8');
const adminV2 = fs.readFileSync(path.join(ROOT, 'admin-mock-v2.js'), 'utf8');

assert.match(admin, /raw\.length===mkQ\(\)&&\/\^\[OX\]\+\$\/.test\(raw\)/, '관리자 기본 결과는 정확한 O/X만 허용해야 함');
assert.match(adminV2, /x\.ox\.length===mkQ\(\)&&\/\^\[OX\]\+\$\/.test\(x\.ox\)/, '관리자 차수별 결과도 정확한 O/X만 허용해야 함');
assert.match(admin, /area=\(it&&it\.area\)\|\|b\.area\|\|''/, '영역은 문항 item.area를 먼저 사용해야 함');
assert.doesNotMatch(admin, /area=b\.area\|\|\(it&&it\.area\)/, 'blueprint.area 우선 판정을 다시 사용하면 안 됨');
assert.match(adminV2, /sc=mkScore\(x\.ox\),score=sc\?sc\.score:'-',wrong=sc\?sc\.wrong:'-'/, '저장된 점수 대신 검증된 O/X로 점수를 재계산해야 함');
assert.match(adminV2, /학생 아이디로 다시 로그인할 필요가 없습니다/, '파이널 재원생은 관리자 학생 선택에서 바로 오답 입력');
assert.match(adminV2, /학생 로드맵의 「내 파이널 성적표」/, '관리자 입력 뒤 학생 개인 성적표 흐름 안내');

const context = { window: {} };
context.window = context;
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'mock-data.js'), 'utf8'), context, { filename: 'mock-data.js' });
const model = context.GFIELD_MOCK;
let mismatches = 0;
for (const round of Object.values(model.rounds || {})) {
  for (const item of round.items || []) {
    const bp = (model.blueprint || []).find((row) => row.no === item.no);
    if (bp && item.area && bp.area && item.area !== bp.area) mismatches += 1;
  }
}
assert.ok(mismatches > 0, 'item.area 권위값을 검증할 실제 불일치 문항이 있어야 함');

console.log(`PASS admin result contract: strict O/X, recomputed score, item.area authority (${mismatches} mismatch cases guarded)`);
