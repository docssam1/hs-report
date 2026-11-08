'use strict';
// Site access control reuses archive grants; public source URLs are not DRM.
(() => {
  const key = 'seminar-hwangso-2026';
  const rosterUrl = new URL('../../data.js', document.currentScript.src);
  let pending;
  function approved(data, name) {
    if (!name || !Array.isArray(data?.students) || !data.students.includes(name)) return false;
    if (['withdrawn', 'graduated'].includes(data.studentTypes?.[name])) return false;
    if (Object.prototype.hasOwnProperty.call(data.studentAccessProfiles || {}, name)) return !!window.GFIELD_STUDENT_ACCESS?.allows(data, name, 'products', key, false);
    const access = data.archiveProductAccess?.[key];
    return Array.isArray(access) && (access.includes(name) || access.includes('*'));
  }
  function fail(message, code) {
    const error = new Error(message);
    error.code = code;
    throw error;
  }
  async function verify() {
    const session = await window.GFIELD_AUTH?.getSession('student');
    const name = String(session?.login_name || '').trim();
    if (!name) fail('자료실에 로그인하면 승인된 설명회 영상과 자료를 이용할 수 있습니다.', 'LOGIN_REQUIRED');
    const verified = await window.GFIELD_EMAIL_LOGIN?.check(name);
    if (verified?.reason === 'GRADUATED') fail('원에 연락해 주세요.', 'GRADUATED');
    if (!verified?.ok) fail('로그인을 다시 확인해 주세요.', 'LOGIN_REQUIRED');
    if (verified.offline) fail('로그인 상태를 확인하지 못했습니다. 연결을 확인한 뒤 다시 시도해 주세요.', 'VERIFY_FAILED');
    const response = await fetch(rosterUrl, { cache: 'no-store' });
    if (!response.ok) fail('승인 명단을 불러오지 못했습니다. 다시 시도해 주세요.', 'ROSTER_FAILED');
    const script = document.createElement('script');
    script.textContent = await response.text();
    window.GFIELD_DATA = undefined;
    document.head.appendChild(script);
    script.remove();
    const data = window.GFIELD_DATA;
    if (data?.studentTypes?.[name] === 'graduated') fail('원에 연락해 주세요.', 'GRADUATED');
    if (!approved(data, name)) fail('설명회 시청·자료 이용 승인이 필요합니다. 학원에 문의해 주세요.', 'NOT_APPROVED');
    const current = await window.GFIELD_AUTH.getSession('student');
    if (String(current?.login_name || '').trim() !== name) fail('로그인한 회원이 변경되었습니다. 다시 로그인해 주세요.', 'LOGIN_REQUIRED');
    return { name, data };
  }
  // Share only simultaneous checks; subsequent actions read the current grants.
  function requireApproval() {
    if (!pending) pending = verify().finally(() => { pending = null; });
    return pending;
  }
  window.GFIELD_SEMINAR_ACCESS = Object.freeze({ key, approved, requireApproval });
})();
