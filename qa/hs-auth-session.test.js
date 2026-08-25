const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { webcrypto } = require('node:crypto');

const source = fs.readFileSync(path.join(__dirname, '..', 'hs-auth.js'), 'utf8');

function makeStorage() {
  const values = new Map();
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); },
    dump() { return Object.fromEntries(values); },
  };
}

function load(storage, fetchImpl) {
  const context = {
    crypto: webcrypto,
    TextEncoder,
    fetch: fetchImpl,
    localStorage: storage,
    setTimeout,
    clearTimeout,
    console,
    Promise,
    Date,
    Math,
    JSON,
    Object,
    Array,
    String,
    Number,
    Error,
  };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(source, context, { filename: 'hs-auth.js' });
  return context.GFIELD_AUTH;
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

(async () => {
  const storage = makeStorage();
  let studentPassword = '';
  const studentSession = {
    access_token: 'student-access',
    refresh_token: 'student-refresh',
    expires_in: 3600,
    user: { id: 'student-1', app_metadata: { role: 'student' } },
  };
  let auth = load(storage, async (url, options) => {
    if (String(url).includes('/auth/v1/token?grant_type=password')) {
      studentPassword = JSON.parse(options.body).password;
      return jsonResponse(studentSession);
    }
    throw new Error(`unexpected request ${url}`);
  });

  await auth.signIn('김학생', '1234-5678-9012');
  assert.equal(studentPassword, '123456789012');
  assert.ok(storage.getItem('gfield_hs_student_session_v1'));
  assert.equal(JSON.stringify(storage.dump()).includes('123456789012'), false, 'raw approval number must not be stored');

  auth = load(storage, async () => { throw new Error('network should not be used for a fresh session'); });
  const restored = await auth.getSession('student');
  assert.equal(restored.access_token, 'student-access', 'stored session should restore after page reload');

  const adminSession = {
    access_token: 'admin-access',
    refresh_token: 'admin-refresh',
    expires_in: 3600,
    user: { id: 'admin-1', app_metadata: { role: 'admin', admin_id: 'DOCSSAM' } },
  };
  auth = load(storage, async (url) => {
    if (String(url).includes('/functions/v1/hs-admin-session')) {
      return jsonResponse({ session: adminSession, deviceToken: 'device-token-which-is-long-enough' });
    }
    throw new Error(`unexpected request ${url}`);
  });
  await auth.signIn('DOCSSAM', '01020837265', { enrollmentToken: 'bootstrap-token-which-is-long-enough' });
  assert.ok(storage.getItem('gfield_hs_admin_session_v1'));
  assert.ok(storage.getItem('gfield_hs_student_session_v1'), 'admin login must not erase student session');
  assert.equal(JSON.stringify(storage.dump()).includes('01020837265'), false, 'admin approval number must not be stored');

  const expired = JSON.parse(storage.getItem('gfield_hs_student_session_v1'));
  expired.expires_at = Math.floor(Date.now() / 1000) - 1;
  storage.setItem('gfield_hs_student_session_v1', JSON.stringify(expired));
  auth = load(storage, async () => { throw new TypeError('offline'); });
  const offline = await auth.getSession('student');
  assert.equal(offline, null);
  assert.ok(storage.getItem('gfield_hs_student_session_v1'), 'network errors must not erase the stored session');

  console.log('PASS hs-auth persistent, separated, no-raw-code, offline-safe');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
