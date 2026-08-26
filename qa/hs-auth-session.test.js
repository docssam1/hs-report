const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { webcrypto } = require('node:crypto');

const source = fs.readFileSync(path.join(__dirname, '..', 'hs-auth.js'), 'utf8');
const adminFunctionSource = fs.readFileSync(
  path.join(__dirname, '..', 'supabase', 'functions', 'hs-admin-session', 'index.ts'),
  'utf8',
);

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
  auth = load(storage, async (url, options) => {
    if (String(url).includes('/functions/v1/hs-admin-session')) {
      assert.equal(JSON.parse(options.body).action, 'enroll');
      return jsonResponse({ session: adminSession, deviceToken: 'device-token-which-is-long-enough' });
    }
    throw new Error(`unexpected request ${url}`);
  });
  await auth.signIn('DOCSSAM', '01020837265', { enrollmentToken: 'B'.repeat(48) });
  assert.ok(storage.getItem('gfield_hs_admin_session_v1'));
  assert.ok(storage.getItem('gfield_hs_student_session_v1'), 'admin login must not erase student session');
  assert.equal(JSON.stringify(storage.dump()).includes('01020837265'), false, 'admin approval number must not be stored');

  const regularAdminStorage = makeStorage();
  const issuedDeviceToken = 'new-device-token-which-is-long-enough-for-login';
  let regularLoginCount = 0;
  auth = load(regularAdminStorage, async (url, options) => {
    assert.ok(String(url).includes('/functions/v1/hs-admin-session'));
    const body = JSON.parse(options.body);
    assert.equal(body.action, 'login');
    regularLoginCount += 1;
    if (regularLoginCount === 1) {
      assert.equal(body.deviceToken, '', 'first approval-code login starts without a device key');
      return jsonResponse({ session: adminSession, deviceToken: issuedDeviceToken });
    }
    assert.equal(body.deviceToken, issuedDeviceToken, 'later logins reuse the stored device key');
    return jsonResponse({ session: adminSession });
  });
  await auth.signIn('DOCSSAM', '01020837265');
  assert.equal(
    regularAdminStorage.getItem('gfield_hs_admin_device_v1'),
    issuedDeviceToken,
    'approval-code login must persist the automatically issued device key',
  );
  await auth.signIn('DOCSSAM', '01020837265');
  assert.equal(regularLoginCount, 2);

  const activationToken = 'A'.repeat(48);
  const activationStorage = makeStorage();
  auth = load(activationStorage, async (url, options) => {
    assert.ok(String(url).includes('/functions/v1/hs-admin-session'));
    assert.equal(JSON.parse(options.body).action, 'redeem');
    assert.equal(options.headers['X-Bootstrap-Token'], activationToken);
    return jsonResponse({ session: adminSession, deviceToken: 'activated-device-token-which-is-long-enough' });
  });
  await auth.redeemAdminEnrollment(activationToken);
  assert.ok(activationStorage.getItem('gfield_hs_admin_session_v1'), 'activation must store the admin session');
  assert.ok(activationStorage.getItem('gfield_hs_admin_device_v1'), 'activation must store the device key');
  assert.equal(JSON.stringify(activationStorage.dump()).includes(activationToken), false, 'one-time activation token must not be stored');

  const invalidRoleStorage = makeStorage();
  auth = load(invalidRoleStorage, async () => jsonResponse({
    session: { ...adminSession, user: { id: 'not-admin', app_metadata: { role: 'student' } } },
    deviceToken: 'R'.repeat(48),
  }));
  await assert.rejects(() => auth.redeemAdminEnrollment('C'.repeat(48)), error => error.code === 'FORBIDDEN');
  assert.equal(invalidRoleStorage.getItem('gfield_hs_admin_session_v1'), null, 'non-admin activation must not store a session');
  assert.equal(invalidRoleStorage.getItem('gfield_hs_admin_device_v1'), null, 'non-admin activation must not store a device key');

  const blockedStorage = makeStorage();
  blockedStorage.setItem = () => { throw new Error('blocked'); };
  auth = load(blockedStorage, async () => jsonResponse({ session: adminSession, deviceToken: 'S'.repeat(48) }));
  await assert.rejects(() => auth.redeemAdminEnrollment('D'.repeat(48)), error => error.code === 'STORAGE_UNAVAILABLE');

  const expired = JSON.parse(storage.getItem('gfield_hs_student_session_v1'));
  expired.expires_at = Math.floor(Date.now() / 1000) - 1;
  storage.setItem('gfield_hs_student_session_v1', JSON.stringify(expired));
  auth = load(storage, async () => { throw new TypeError('offline'); });
  const offline = await auth.getSession('student');
  assert.equal(offline, null);
  assert.ok(storage.getItem('gfield_hs_student_session_v1'), 'network errors must not erase the stored session');

  const loginStart = adminFunctionSource.indexOf('async function login(');
  const loginEnd = adminFunctionSource.indexOf('async function createEnrollment(', loginStart);
  const loginSource = adminFunctionSource.slice(loginStart, loginEnd);
  assert.ok(loginStart >= 0 && loginEnd > loginStart, 'admin login source must be discoverable');
  assert.ok(adminFunctionSource.includes('async function issueDeviceSession('), 'device-session issuer must exist');
  assert.equal(
    loginSource.includes('if (deviceToken.length < 32) throw new HttpError(403, "DEVICE_NOT_ENROLLED")'),
    false,
    'a valid approval code must not be rejected only because this browser has no stored device key',
  );
  assert.ok(loginSource.includes('return issueDeviceSession(account);'), 'missing or stale devices must be re-enrolled');

  console.log('PASS hs-auth persistent, separated, auto-device enrollment, one-time activation, role/storage guarded, no-raw-code, offline-safe');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
