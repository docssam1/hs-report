import assert from 'node:assert/strict';
import { test } from 'node:test';
import { handleRequest, scoreOx } from '../supabase/functions/hs-admin-mock-result/core.mjs';

const TOKEN = 'header.payload.signature';
const studentAccount = { user_id: 'student-id', student: '검수학생', role: 'student', active: true };

function mockService(options = {}) {
  const accounts = [
    { user_id: 'staff-id', student: '검수교사', role: options.staffRole || 'teacher', active: options.staffActive !== false },
    ...(options.students || [studentAccount]),
  ];
  const rows = (options.rows || []).map((row) => ({ ...row }));
  const writes = [];
  const service = {
    auth: {
      async getUser(token) {
        if (token !== TOKEN || options.authFailure) return { data: { user: null }, error: { message: 'unauthorized' } };
        return { data: { user: { id: 'staff-id', app_metadata: {
          role: options.jwtRole || 'teacher', admin_id: options.adminId || 'DOCSSAM',
        } } }, error: null };
      },
    },
    from(table) {
      const filters = [];
      let operation = 'select';
      let payload;
      const query = {
        select() { return this; },
        eq(column, value) { filters.push((row) => row[column] === value); return this; },
        in(column, values) { filters.push((row) => values.includes(row[column])); return this; },
        insert(value) { operation = 'insert'; payload = value; return this; },
        update(value) { operation = 'update'; payload = value; return this; },
        async run(single) {
          if (options.databaseFailure) return { data: null, error: { code: 'DB_DOWN' } };
          const source = table === 'hs_accounts' ? accounts : rows;
          if (operation === 'insert') {
            writes.push({ operation, payload });
            if (options.beforeInsert) options.beforeInsert(rows, payload);
            if (rows.some((row) => row.student === payload.student && row.round === payload.round)) {
              return { data: null, error: { code: '23505' } };
            }
            rows.push({ ...payload });
            return { data: { ...payload }, error: null };
          }
          if (operation === 'update') {
            writes.push({ operation, payload });
            if (options.beforeUpdate) options.beforeUpdate(rows, payload);
            const matched = rows.filter((row) => filters.every((match) => match(row)));
            matched.forEach((row) => Object.assign(row, payload));
            return { data: single ? matched[0] || null : matched, error: null };
          }
          const matched = source.filter((row) => filters.every((match) => match(row)));
          return single
            ? (matched.length > 1 ? { data: null, error: { code: 'MULTIPLE_ROWS' } } : { data: matched[0] || null, error: null })
            : { data: matched, error: null };
        },
        maybeSingle() { return this.run(true); },
        then(resolve, reject) { return this.run(false).then(resolve, reject); },
      };
      return query;
    },
  };
  return { service, rows, writes };
}

function request(body, options = {}) {
  const headers = { Origin: options.origin || 'https://hs.gfieldacademy.net', 'Content-Type': 'application/json' };
  if (options.token !== null) headers.Authorization = `Bearer ${options.token || TOKEN}`;
  return new Request('https://example.test/functions/v1/hs-admin-mock-result', {
    method: options.method || 'POST', headers, body: JSON.stringify(body),
  });
}

async function call(mock, body, options) {
  const result = await handleRequest(request(body, options), mock.service);
  return { status: result.status, body: await result.json() };
}

test('scores only exact 30-position O/X answers using 2.7, 3.4, 4.2 bands', () => {
  assert.deepEqual(scoreOx('O'.repeat(30)), { score: 100, wrong: 0 });
  assert.deepEqual(scoreOx('X'.repeat(30)), { score: 0, wrong: 30 });
  const ox = [...'O'.repeat(30)];
  for (const no of [1, 13, 23]) ox[no - 1] = 'X';
  assert.deepEqual(scoreOx(ox.join('')), { score: 89.7, wrong: 3 });
  assert.equal(scoreOx('O'.repeat(29)), null);
  assert.equal(scoreOx('O'.repeat(29) + '-'), null);
});

test('requires a current staff Auth user, role, admin scope, and active account', async () => {
  const input = { action: 'save-first', student: '검수학생', exam: 'last1', ox: 'O'.repeat(30) };
  for (const [options, requestOptions, expected] of [
    [{}, { token: null }, 401],
    [{ authFailure: true }, {}, 401],
    [{ jwtRole: 'student' }, {}, 403],
    [{ adminId: 'OTHER' }, {}, 403],
    [{ staffActive: false }, {}, 403],
    [{ staffRole: 'student' }, {}, 403],
  ]) {
    const mock = mockService(options);
    assert.equal((await call(mock, input, requestOptions)).status, expected);
    assert.equal(mock.writes.length, 0);
  }
});

test('rejects unknown exams, malformed answers, and spoofed scores', async () => {
  const mock = mockService();
  const base = { action: 'save-first', student: '검수학생', exam: 'last1', ox: 'O'.repeat(30) };
  for (const change of [{ exam: 'final7' }, { ox: 'O'.repeat(29) }, { score: 100 }]) {
    const result = await call(mock, { ...base, ...change });
    assert.equal(result.status, 400);
  }
  assert.equal(mock.writes.length, 0);
});

test('authenticated staff can enter a roster student before account issuance', async () => {
  const mock = mockService();
  const result = await call(mock, { action: 'save-first', student: '미등록', exam: 'last1', ox: 'X'.repeat(30) });
  assert.equal(result.status, 200);
  assert.equal(result.body.student, '미등록');
  assert.equal(mock.rows[0].owner_id, null);
  assert.equal((await call(mock, { action: 'get', student: '미등록', exams: ['last1'] })).body.rows.length, 1);
});

test('inserts one official Last result and keeps independent final8 separate', async () => {
  const mock = mockService();
  const lastOx = 'X' + 'O'.repeat(29);
  const last = await call(mock, { action: 'save-first', student: '검수학생', exam: 'last1', ox: lastOx });
  assert.equal(last.status, 200);
  assert.deepEqual({ saved: last.body.saved, exam: last.body.exam, score: last.body.score, wrong: last.body.wrong, source: last.body.source },
    { saved: true, exam: 'last1', score: 97.3, wrong: 1, source: 'admin' });
  assert.equal(mock.rows[0].owner_id, 'student-id');
  const final8 = await call(mock, { action: 'save-first', student: '검수학생', exam: 'final8', ox: 'O'.repeat(30) });
  assert.equal(final8.status, 200);
  assert.equal(mock.rows.length, 2);
  assert.deepEqual(mock.rows.map((row) => row.round), ['last1', 'final8']);
});

test('never overwrites an active first result, including malformed old rows', async () => {
  const initial = { student: '검수학생', round: 'last2', ox: 'X'.repeat(30), score: 0, wrong: 30, source: 'online' };
  const mock = mockService({ rows: [initial] });
  const result = await call(mock, { action: 'save-first', student: '검수학생', exam: 'last2', ox: 'O'.repeat(30) });
  assert.deepEqual(result, { status: 409, body: { error: 'FIRST_RESULT_EXISTS' } });
  assert.deepEqual(mock.rows[0], initial);
  assert.equal(mock.writes.length, 0);
});

test('replaces only a matching RESET row and fails closed after a concurrent change', async () => {
  const reset = { student: '검수학생', round: 'last3', ox: 'RESET', score: 0, wrong: 0, source: 'reset' };
  const mock = mockService({ rows: [reset] });
  const input = { action: 'save-first', student: '검수학생', exam: 'last3', ox: 'O'.repeat(30) };
  assert.equal((await call(mock, input)).status, 200);
  assert.equal(mock.rows[0].source, 'admin');
  assert.equal(mock.writes[0].operation, 'update');
  const raced = mockService({ rows: [reset], beforeUpdate(rows) { rows[0].source = 'online'; rows[0].ox = 'X'.repeat(30); } });
  assert.deepEqual(await call(raced, input), { status: 409, body: { error: 'FIRST_RESULT_EXISTS' } });
  assert.equal(raced.rows[0].source, 'online');
});

test('unique-key race preserves the first insert and get returns only selected active rounds', async () => {
  const mock = mockService({
    rows: [{ student: '검수학생', round: 'last2', ox: 'RESET', score: 0, wrong: 0, source: 'reset' }],
    beforeInsert(rows, payload) { rows.push({ ...payload, ox: 'X'.repeat(30), score: 0, wrong: 30, source: 'online' }); },
  });
  const input = { action: 'save-first', student: '검수학생', exam: 'last4', ox: 'O'.repeat(30) };
  assert.equal((await call(mock, input)).status, 409);
  assert.equal(mock.rows.find((row) => row.round === 'last4').source, 'online');
  const results = await call(mock, { action: 'get', student: '검수학생', exams: ['last4', 'last2', 'final8'] });
  assert.equal(results.status, 200);
  assert.deepEqual(results.body.rows.map((row) => row.exam), ['last4']);
  assert.equal((await call(mock, { action: 'get', student: '검수학생', exams: ['last1', 'last1'] })).status, 400);
});
