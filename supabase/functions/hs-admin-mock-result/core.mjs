// The first-insert race relies on the deployed mock_results (student, round)
// unique key. Never deploy without confirming that key and the existing RLS.
const ALLOWED_EXAMS = new Set(['last1', 'last2', 'last3', 'last4', 'final8']);
const ALLOWED_ORIGINS = new Set([
  'https://hs.gfieldacademy.net',
  'https://docssam1.github.io',
  'http://localhost:8000',
  'http://127.0.0.1:8000',
]);
const RESULT_COLUMNS = 'student,round,ox,score,wrong,source,updated_at';

function response(req, body, status = 200) {
  const origin = req.headers.get('origin') || '';
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    Vary: 'Origin',
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
  if (ALLOWED_ORIGINS.has(origin)) headers['Access-Control-Allow-Origin'] = origin;
  return new Response(JSON.stringify(body), { status, headers });
}

function fail(req, error, status) {
  return response(req, { error }, status);
}

function validStudent(value) {
  if (typeof value !== 'string') return null;
  const student = value.trim().normalize('NFKC');
  if (!student || student.length > 80 || /[\u0000-\u001f\u007f]/u.test(student) || student.toLowerCase() === 'docssam') return null;
  return student;
}

function onlyKeys(body, names) {
  return Object.keys(body).every((name) => names.includes(name));
}

export function scoreOx(ox) {
  if (typeof ox !== 'string' || !/^[OX]{30}$/.test(ox)) return null;
  let score = 0;
  let wrong = 0;
  for (let index = 0; index < 30; index++) {
    if (ox[index] === 'O') score += index < 12 ? 2.7 : index < 22 ? 3.4 : 4.2;
    else wrong++;
  }
  return { score: Math.round(score * 10) / 10, wrong };
}

function savedRow(row) {
  return {
    exam: row.round,
    student: row.student,
    ox: row.ox,
    score: row.score,
    wrong: row.wrong,
    source: row.source,
    updated_at: row.updated_at,
  };
}

async function authorizedStaff(service, token) {
  const { data: auth, error: authError } = await service.auth.getUser(token);
  if (authError || !auth?.user) return { error: 'LOGIN_REQUIRED', status: 401 };
  const role = auth.user.app_metadata?.role;
  if (!['admin', 'teacher'].includes(role) || auth.user.app_metadata?.admin_id !== 'DOCSSAM') {
    return { error: 'ACCESS_DENIED', status: 403 };
  }
  const { data: account, error: accountError } = await service.from('hs_accounts')
    .select('role,active').eq('user_id', auth.user.id).maybeSingle();
  if (accountError) return { error: 'RESULT_UNAVAILABLE', status: 503 };
  if (!account?.active || !['admin', 'teacher'].includes(account.role)) return { error: 'ACCESS_DENIED', status: 403 };
  return null;
}

async function studentAccount(service, student) {
  const { data: account, error } = await service.from('hs_accounts')
    .select('user_id,student,role,active').eq('student', student).maybeSingle();
  if (error) return { error: 'RESULT_UNAVAILABLE', status: 503 };
  // Teacher-entered paper scores precede account issuance for some roster names.
  // Staff authentication is the write authority; an absent student account is
  // not a reason to discard an otherwise valid first paper result.
  if (!account?.active || account.role !== 'student' || !account.user_id) return { account: null };
  return { account };
}

function databaseError(req, error) {
  if (error?.code === '23505') return fail(req, 'FIRST_RESULT_EXISTS', 409);
  return fail(req, 'RESULT_UNAVAILABLE', 503);
}

async function saveFirst(req, service, body, ownerAccount) {
  const exam = body.exam;
  const student = body.student;
  const scored = scoreOx(body.ox);
  const { data: existing, error: lookupError } = await service.from('mock_results')
    .select(RESULT_COLUMNS).eq('student', student).eq('round', exam).maybeSingle();
  if (lookupError) return fail(req, 'RESULT_UNAVAILABLE', 503);
  if (existing && !(existing.source === 'reset' && existing.ox === 'RESET')) {
    return fail(req, 'FIRST_RESULT_EXISTS', 409);
  }
  const payload = {
    student,
    round: exam,
    ox: body.ox,
    score: scored.score,
    wrong: scored.wrong,
    source: 'admin',
    owner_id: ownerAccount?.user_id || null,
    updated_at: new Date().toISOString(),
  };
  const query = existing
    ? service.from('mock_results').update(payload)
      .eq('student', student).eq('round', exam).eq('source', 'reset').eq('ox', 'RESET')
    : service.from('mock_results').insert(payload);
  const { data: written, error } = await query.select(RESULT_COLUMNS).maybeSingle();
  if (error) return databaseError(req, error);
  if (!written) return fail(req, existing ? 'FIRST_RESULT_EXISTS' : 'RESULT_UNAVAILABLE', existing ? 409 : 503);
  return response(req, { saved: true, ...savedRow(written) });
}

async function getResults(req, service, body, student) {
  const { data: rows, error } = await service.from('mock_results')
    .select(RESULT_COLUMNS).eq('student', student).in('round', body.exams);
  if (error) return fail(req, 'RESULT_UNAVAILABLE', 503);
  const order = new Map(body.exams.map((exam, index) => [exam, index]));
  const active = (rows || []).filter((row) => row.source !== 'reset' && row.ox !== 'RESET')
    .sort((a, b) => order.get(a.round) - order.get(b.round)).map(savedRow);
  return response(req, { student, rows: active });
}

export async function handleRequest(req, service) {
  const origin = req.headers.get('origin') || '';
  if (origin && !ALLOWED_ORIGINS.has(origin)) return fail(req, 'FORBIDDEN_ORIGIN', 403);
  if (req.method === 'OPTIONS') return response(req, { ok: true });
  if (req.method !== 'POST') return fail(req, 'METHOD_NOT_ALLOWED', 405);
  const authorization = req.headers.get('authorization') || '';
  const match = /^Bearer ([^\s]+)$/.exec(authorization);
  if (!match || match[1].split('.').length !== 3) return fail(req, 'LOGIN_REQUIRED', 401);
  try {
    const staffError = await authorizedStaff(service, match[1]);
    if (staffError) return fail(req, staffError.error, staffError.status);
    const bodyText = await req.text();
    if (bodyText.length > 4096) return fail(req, 'INVALID_REQUEST', 400);
    let body;
    try { body = JSON.parse(bodyText); } catch { return fail(req, 'INVALID_REQUEST', 400); }
    if (!body || typeof body !== 'object' || Array.isArray(body)) return fail(req, 'INVALID_REQUEST', 400);
    const student = validStudent(body.student);
    if (!student) return fail(req, 'INVALID_REQUEST', 400);
    if (body.action === 'save-first') {
      if (!onlyKeys(body, ['action', 'student', 'exam', 'ox']) || !ALLOWED_EXAMS.has(body.exam) || !scoreOx(body.ox)) {
        return fail(req, 'INVALID_REQUEST', 400);
      }
    } else if (body.action === 'get') {
      if (!onlyKeys(body, ['action', 'student', 'exams']) || !Array.isArray(body.exams)
        || body.exams.length < 1 || body.exams.length > ALLOWED_EXAMS.size
        || new Set(body.exams).size !== body.exams.length
        || body.exams.some((exam) => !ALLOWED_EXAMS.has(exam))) return fail(req, 'INVALID_REQUEST', 400);
    } else return fail(req, 'INVALID_REQUEST', 400);
    const studentLookup = await studentAccount(service, student);
    if (studentLookup.error) return fail(req, studentLookup.error, studentLookup.status);
    if (body.action === 'get') return getResults(req, service, body, student);
    return saveFirst(req, service, { ...body, student }, studentLookup.account);
  } catch {
    return fail(req, 'RESULT_UNAVAILABLE', 503);
  }
}
