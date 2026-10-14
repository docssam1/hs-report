'use strict';
// 학부모 이메일 인증 입장 화면 계약 (서버 모의 응답, 실제 메일·쓰기 없음).
// 실제 인증메일 왕복은 별도 수동 기록(2026-10-11)으로 확인했고, 여기서는 화면·세션·보호 동작을 반복 검사한다.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.GFIELD_QA_PLAYWRIGHT || 'playwright');

const root = path.resolve(__dirname, '..');
const STUDENT = '이메일인증검수학생';
const SIBLING = '이메일인증검수형제';
const OTHER = '이메일인증검수타학생';
const INACTIVE = '이메일인증검수정지';
const FULL = '이메일인증검수기기초과';
const EMAIL = 'qa-parent@example.com';
const GOOD_CODE = '12345678';
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json' };

const server = http.createServer((req, res) => {
  const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const file = path.join(root, p === '/' ? 'index.html' : p);
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  fs.createReadStream(file).pipe(res);
});

function makeServerState() {
  return { links: {}, pins: {}, failures: {}, inactive: new Set([INACTIVE]), calls: [], writes: [] };
}

async function setup(context, state) {
  await context.route(/^https?:\/\//, async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    if (url.pathname.endsWith('/data.js') && url.hostname === 'localhost') {
      const resp = await route.fetch();
      const body = await resp.text();
      const addon = `\n;(function(){var d=window.GFIELD_DATA;${JSON.stringify([STUDENT, SIBLING, OTHER, INACTIVE, FULL])}.forEach(function(n){if(d.students.indexOf(n)<0)d.students.push(n)});})();`;
      return route.fulfill({ response: resp, body: body + addon, headers: { ...resp.headers(), 'content-type': 'text/javascript; charset=utf-8' } });
    }
    if (url.hostname === 'localhost') return route.continue();
    if (url.pathname === '/functions/v1/hs-parent-auth') {
      const body = req.postDataJSON() || {};
      state.calls.push(body.action);
      const reply = (status, json) => route.fulfill({ status, json });
      if ((body.action === 'start' || body.action === 'verify' || body.action === 'touch') && !/^[A-Za-z0-9_-]{32,64}$/.test(body.deviceToken || '')) return reply(400, { error: 'DEVICE_REQUIRED' });
      if (body.action === 'start') {
        if (body.name === FULL) return reply(409, { error: 'DEVICE_LIMIT' });
        if (state.inactive.has(body.name)) return reply(403, { error: 'STUDENT_INACTIVE' });
        if (!/@/.test(body.email || '')) return reply(400, { error: 'INVALID_EMAIL' });
        if (state.links[body.name] && state.links[body.name] !== body.email) return reply(409, { error: 'LINKED_TO_OTHER_EMAIL' });
        return reply(200, { ok: true });
      }
      if (body.action === 'verify') {
        if (body.code !== GOOD_CODE) return reply(401, { error: 'INVALID_CODE' });
        const first = !state.links[body.name];
        state.links[body.name] = body.email;
        state.pins[body.name]=body.pin;state.failures[body.name]=0;
        return reply(200, { student: body.name, firstLink: first, pinReady:true, session: { access_token: 'qa-' + encodeURIComponent(body.name), refresh_token: 'qa-r-' + encodeURIComponent(body.name), expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, user: { id: 'qa' } } });
      }
      if(body.action==='pin'){
        if(state.inactive.has(body.name))return reply(403,{error:'STUDENT_INACTIVE'});
        if(!state.pins[body.name])return reply(401,{error:'PIN_NOT_READY'});
        if(state.failures[body.name]>=5)return reply(403,{error:'PIN_LOCKED'});
        if(body.pin!==state.pins[body.name]){state.failures[body.name]=(state.failures[body.name]||0)+1;return reply(401,{error:state.failures[body.name]>=5?'PIN_LOCKED':'INVALID_PIN'});}
        state.failures[body.name]=0;
        return reply(200,{student:body.name,session:{access_token:'qa-'+encodeURIComponent(body.name),refresh_token:'qa-r-'+encodeURIComponent(body.name),expires_at:Math.floor(Date.now()/1000)+3600}});
      }
      if (body.action === 'touch') {
        const token = (req.headers().authorization || '').replace(/^Bearer /, '');
        const name = decodeURIComponent(token.replace(/^qa-/, ''));
        if (!token || !state.links[name]) return reply(401, { error: 'UNAUTHORIZED' });
        if (state.inactive.has(name)) return reply(403, { error: 'STUDENT_INACTIVE' });
        return reply(200, { ok: true, student: name });
      }
      return reply(400, { error: 'INVALID_ACTION' });
    }
    if (url.pathname === '/auth/v1/logout') return route.fulfill({ status: 204, body: '' });
    if (req.method() !== 'GET' && req.method() !== 'HEAD') {
      if (url.pathname === '/rest/v1/access_log') return route.fulfill({ status: 204, body: '' });
      state.writes.push(req.method() + ' ' + url.pathname);
      return route.abort();
    }
    if (url.hostname.endsWith('supabase.co')) return route.fulfill({ json: [] });
    return route.continue();
  });
}

async function enterName(page, name) {
  await page.evaluate(() => { const v = document.getElementById('video-intro'); if (v) v.remove(); });
  await page.fill('#name-input', name);
  await page.click('#name-enter');
}

async function emailStep(page){await page.click('#el-pin-reset');await page.waitForSelector('#el-step-email:not(.hidden)');}
async function setPin(page,pin='0472'){await page.fill('#el-new-pin',pin);await page.fill('#el-confirm-pin',pin);}

(async () => {
  await new Promise((r) => server.listen(8000, '127.0.0.1', r));
  const base = 'http://localhost:8000/';
  const browser = await chromium.launch({ headless: true });
  const state = makeServerState();
  const results = {};
  try {
    const context = await browser.newContext({ viewport: { width: 1280, height: 860 }, serviceWorkers: 'block' });
    await setup(context, state);
    const page = await context.newPage();

    await page.goto(base + 'index.html');
    await enterName(page, STUDENT);
    await page.waitForSelector('#email-login:not(.hidden)');
    assert.equal(await page.isVisible('#dashboard'), false);
    results.newBrowserNeedsEmail = true;
    await emailStep(page);

    await page.fill('#el-email', EMAIL);
    await page.click('#el-send');
    await page.waitForSelector('#el-step-code:not(.hidden)');
    assert.equal(await page.isDisabled('#el-resend'), true);
    await page.fill('#el-code', '99999999');
    await setPin(page);
    await page.evaluate(()=>document.getElementById('login').scrollTop=0);
    assert.ok((await page.locator('#login .crest').boundingBox()).y>=0,'desktop form header is reachable');
    if(process.env.GFIELD_PIN_QA_DIR){fs.mkdirSync(process.env.GFIELD_PIN_QA_DIR,{recursive:true});await page.screenshot({path:path.join(process.env.GFIELD_PIN_QA_DIR,'pin-setup-desktop.png')});}
    await page.click('#el-verify');
    await page.waitForSelector('#el-error:not(.hidden)');
    assert.match(await page.textContent('#el-error'), /인증번호/);
    results.wrongCodeRejected = true;

    await page.fill('#el-code', GOOD_CODE);
    await page.click('#el-verify');
    await page.waitForSelector('#dashboard:not(.hidden)');
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('gfield_hs_student_session_v1')));
    assert.equal(stored.login_name, STUDENT);
    const allStorage = await page.evaluate(() => JSON.stringify(Object.assign({}, localStorage, sessionStorage)));
    assert.equal(allStorage.includes(EMAIL), false);
    assert.equal(allStorage.includes('0472'),false,'PIN is never stored in browser storage');
    results.verifiedEntry = true;

    const touch = await page.evaluate(() => window.GFIELD_AUTH.touchStudent());
    assert.equal(touch.student, STUDENT);
    await page.reload();
    await page.waitForSelector('#dashboard:not(.hidden)');
    assert.equal(await page.isVisible('#email-login'), false);
    results.sameBrowserRestore = true;
    await page.click('#dashboard button[onclick="logout()"]');
    await page.waitForSelector('#login:not(.hidden)');
    const previousCalls=state.calls.length;
    await enterName(page,STUDENT);await page.waitForSelector('#dashboard:not(.hidden)');
    assert.equal(state.calls.slice(previousCalls).includes('start'),false);
    assert.equal(state.calls.slice(previousCalls).includes('verify'),false);
    results.exitKeepsAuthentication=true;

    // Fresh browser has no session: PIN, not another email OTP, restores the same student.
    const fresh=await browser.newContext({viewport:{width:390,height:844}});await setup(fresh,state);
    const freshPage=await fresh.newPage();await freshPage.goto(base+'index.html');await enterName(freshPage,STUDENT);
    await freshPage.waitForSelector('#el-step-pin:not(.hidden)');
    await freshPage.fill('#el-pin','0472');await freshPage.press('#el-pin','Enter');
    await freshPage.waitForSelector('#dashboard:not(.hidden)');results.newBrowserPinLogin=true;
    await freshPage.click('#dashboard button[onclick="logout(true)"]');await freshPage.waitForSelector('#login:not(.hidden)');
    await freshPage.waitForFunction(()=>!localStorage.getItem('gfield_hs_student_session_v1'));
    await enterName(freshPage,STUDENT);
    for(let i=0;i<5;i++){await freshPage.fill('#el-pin','9999');await freshPage.click('#el-pin-enter');await freshPage.waitForFunction(()=>!document.getElementById('el-pin-enter').disabled);}
    await freshPage.waitForSelector('#el-step-email:not(.hidden)');assert.match(await freshPage.textContent('#el-error'),/5회/);
    assert.equal(await freshPage.isVisible('#dashboard'),false);
    const locked=await freshPage.evaluate(name=>window.GFIELD_AUTH.pinLogin(name,'0472').then(()=>null,e=>e.code),STUDENT);assert.equal(locked,'PIN_LOCKED');
    await freshPage.fill('#el-email',EMAIL);await freshPage.click('#el-send');await freshPage.waitForSelector('#el-step-code:not(.hidden)');
    await freshPage.fill('#el-code',GOOD_CODE);await setPin(freshPage,'0826');await freshPage.click('#el-verify');
    await freshPage.waitForSelector('#dashboard:not(.hidden)');assert.equal(state.pins[STUDENT],'0826');assert.equal(state.failures[STUDENT],0);
    results.fiveErrorsNeedEmailReset=true;
    if(process.env.GFIELD_PIN_QA_DIR){fs.mkdirSync(process.env.GFIELD_PIN_QA_DIR,{recursive:true});await freshPage.click('#dashboard button[onclick="logout(true)"]');await freshPage.waitForSelector('#login:not(.hidden)');await enterName(freshPage,STUDENT);await freshPage.screenshot({path:path.join(process.env.GFIELD_PIN_QA_DIR,'pin-mobile.png')});}
    assert.equal(await freshPage.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    await fresh.close();

    await page.goto(base + 'answer.html?set=final&round=1&name=' + encodeURIComponent(STUDENT));
    await page.waitForFunction(() => !document.documentElement.classList.contains('gfield-guard-pending'));
    assert.ok(page.url().includes('answer.html'));
    await page.goto(base + 'answer.html?set=final&round=1&name=' + encodeURIComponent(OTHER));
    await page.waitForURL(/index\.html\?next=/);
    await page.waitForSelector('#login:not(.hidden)');
    assert.equal(await page.inputValue('#name-input'), OTHER);
    assert.equal(await page.isVisible('#dashboard'), false);
    results.directLinkGuard = true;

    // 형제자매: 같은 이메일로 다른 학생 연결 → 그 학생으로 세션 교체
    await page.goto(base + 'index.html');
    await page.waitForSelector('#dashboard:not(.hidden)');
    await page.click('#dashboard button[onclick="logout()"]');
    await page.waitForSelector('#login:not(.hidden)');
    await enterName(page, SIBLING);
    await page.waitForSelector('#email-login:not(.hidden)');
    await emailStep(page);
    await page.fill('#el-email', EMAIL);
    await page.click('#el-send');
    await page.waitForSelector('#el-step-code:not(.hidden)');
    await page.fill('#el-code', GOOD_CODE);
    await setPin(page);
    await page.click('#el-verify');
    await page.waitForSelector('#dashboard:not(.hidden)');
    assert.equal(state.links[SIBLING], EMAIL);
    results.siblingSameEmail = true;

    // 이미 연결된 학생을 다른 이메일로 바꾸려 하면 거절
    await page.click('#dashboard button[onclick="logout(true)"]');
    await page.waitForSelector('#login:not(.hidden)');
    await page.waitForFunction(() => !localStorage.getItem('gfield_hs_student_session_v1'));
    await enterName(page, STUDENT);
    await page.waitForSelector('#email-login:not(.hidden)');
    await emailStep(page);
    await page.fill('#el-email', 'someone-else@example.com');
    await page.click('#el-send');
    await page.waitForSelector('#el-error:not(.hidden)');
    assert.match(await page.textContent('#el-error'), /다른 학부모 이메일/);
    assert.equal(state.links[STUDENT], EMAIL);
    results.otherEmailBlocked = true;
    results.explicitLogoutRequiresLogin = true;

    // 정지(퇴원) 학생: 인증 시작 거절, 세션 있어도 입장 불가
    await page.click('#el-back');
    await enterName(page, INACTIVE);
    await page.waitForSelector('#email-login:not(.hidden)');
    await emailStep(page);
    await page.fill('#el-email', EMAIL);
    await page.click('#el-send');
    await page.waitForSelector('#login:not(.hidden)');
    assert.equal(await page.isVisible('#dashboard'), false);
    state.links[INACTIVE] = EMAIL;
    await page.evaluate((name) => localStorage.setItem('gfield_hs_student_session_v1', JSON.stringify({ access_token: 'qa-' + encodeURIComponent(name), refresh_token: 'r', expires_at: Math.floor(Date.now() / 1000) + 3600, login_name: name })), INACTIVE);
    await page.evaluate((name) => localStorage.setItem('gfield_student', name), INACTIVE);
    await page.reload();
    await page.waitForTimeout(1500);
    assert.equal(await page.isVisible('#dashboard'), false);
    assert.equal(await page.evaluate(() => localStorage.getItem('gfield_hs_student_session_v1')), null);
    results.inactiveBlocked = true;

    // 기기 3대 초과: 인증번호를 보내지 않고 학원 기기 초기화 안내
    await page.goto(base + 'index.html');
    await enterName(page, FULL);
    await page.waitForSelector('#email-login:not(.hidden)');
    await emailStep(page);
    await page.fill('#el-email', EMAIL);
    await page.click('#el-send');
    await page.waitForSelector('#el-error:not(.hidden)');
    assert.match(await page.textContent('#el-error'), /3대/);
    assert.equal(await page.isVisible('#el-step-code'), false);
    const deviceId = await page.evaluate(() => localStorage.getItem('gfield_hs_device_v1'));
    assert.match(deviceId || '', /^[A-Za-z0-9_-]{32,64}$/);
    results.deviceLimitBlocked = true;

    // 모바일 화면
    const mobile = await context.newPage();
    await mobile.setViewportSize({ width: 375, height: 760 });
    await mobile.goto(base + 'index.html');
    await enterName(mobile, OTHER);
    await mobile.waitForSelector('#email-login:not(.hidden)');
    assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false);
    await emailStep(mobile);await mobile.fill('#el-email',EMAIL);await mobile.click('#el-send');await mobile.waitForSelector('#el-step-code:not(.hidden)');
    assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    await mobile.evaluate(()=>document.getElementById('login').scrollTop=0);
    assert.ok((await mobile.locator('#login .crest').boundingBox()).y>=0,'mobile form header is reachable');
    if(process.env.GFIELD_PIN_QA_DIR)await mobile.screenshot({path:path.join(process.env.GFIELD_PIN_QA_DIR,'pin-setup-mobile.png')});
    await mobile.locator('#el-verify').scrollIntoViewIfNeeded();
    const buttonBox=await mobile.locator('#el-verify').boundingBox();assert.ok(buttonBox.y>=0&&buttonBox.y+buttonBox.height<=760,'mobile submit button is reachable');
    if(process.env.GFIELD_PIN_QA_DIR)await mobile.screenshot({path:path.join(process.env.GFIELD_PIN_QA_DIR,'pin-setup-mobile-bottom.png')});
    results.mobileNoOverflow = true;

    assert.deepEqual(state.writes, [], 'no unexpected writes');
    results.unexpectedWrites = 0;
    console.log(JSON.stringify({ pass: true, ...results }));
  } catch (error) {
    console.error(error);
    console.error('calls:', state.calls.join(','), 'results:', JSON.stringify(results));
    process.exitCode = 1;
  } finally {
    await browser.close();
    server.close();
  }
})();
