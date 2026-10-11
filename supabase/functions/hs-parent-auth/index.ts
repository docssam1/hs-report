import "jsr:@supabase/functions-js@2.5.0/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2.112.4";

// 학부모 이메일 인증 → 기존 학생 계정 세션.
// - 인증번호 발송·검증은 Supabase Auth(이메일 OTP, 프로젝트 SMTP)를 그대로 쓴다.
// - 학부모 세션은 브라우저에 주지 않고 서버에서 바로 종료한다.
// - 학생 권한 근거는 서버가 확인한 hs_accounts(active) + hs_parent_links 연결뿐이다.
// - 인증번호·토큰·비밀번호는 저장하거나 기록하지 않는다.

const ALLOWED_ORIGINS = new Set([
  "https://hs.gfieldacademy.net",
  "https://docssam1.github.io",
  "http://localhost:8000",
  "http://127.0.0.1:8000",
]);
const ROSTER_URL = "https://raw.githubusercontent.com/docssam1/hs-report/main/data.js";
const EMAIL_PATTERN = /^[^\s@]{1,64}@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;
const CODE_PATTERN = /^\d{6,10}$/;
const TOUCH_INTERVAL_MS = 5 * 60 * 1000;

class HttpError extends Error {
  status: number;
  code: string;
  retryAfter?: number;
  constructor(status: number, code: string, retryAfter?: number) {
    super(code);
    this.status = status;
    this.code = code;
    this.retryAfter = retryAfter;
  }
}

function allowedOrigin(req: Request): boolean {
  const origin = req.headers.get("origin") || "";
  return !origin || ALLOWED_ORIGINS.has(origin);
}

function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") || "";
  const headers: Record<string, string> = {
    "Access-Control-Allow-Headers": "authorization, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "600",
    "Cache-Control": "no-store",
    "Pragma": "no-cache",
    "Content-Type": "application/json; charset=utf-8",
    "Vary": "Origin",
  };
  if (origin && ALLOWED_ORIGINS.has(origin)) headers["Access-Control-Allow-Origin"] = origin;
  return headers;
}

function json(req: Request, body: unknown, status = 200, retryAfter?: number): Response {
  const headers = corsHeaders(req);
  if (retryAfter) headers["Retry-After"] = String(retryAfter);
  return new Response(JSON.stringify(body), { status, headers });
}

function displayName(value: unknown): string {
  return String(value ?? "").trim().normalize("NFKC");
}

function loginKey(value: unknown): string {
  return displayName(value).replace(/\s+/gu, "").toLocaleLowerCase("ko-KR");
}

function normalizeEmail(value: unknown): string {
  const email = String(value ?? "").trim().normalize("NFKC").toLowerCase();
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) throw new HttpError(400, "INVALID_EMAIL");
  if (email.endsWith("@auth.gfieldacademy.net") || email.endsWith(".invalid")) throw new HttpError(400, "INVALID_EMAIL");
  return email;
}

function validStudentName(name: string): boolean {
  return name.length >= 1 && name.length <= 80 && !/[\u0000-\u001f\u007f]/.test(name) && loginKey(name) !== "docssam";
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function studentLoginEmail(name: string): Promise<string> {
  return `hs-${(await sha256(loginKey(name))).slice(0, 32)}@auth.gfieldacademy.net`;
}

function randomSecret(length = 40): string {
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  const bytes = crypto.getRandomValues(new Uint8Array(length * 2));
  let value = "";
  for (const byte of bytes) {
    if (byte >= 252) continue;
    value += alphabet[byte % alphabet.length];
    if (value.length === length) break;
  }
  return value.length === length ? `${value}!9a` : randomSecret(length);
}

const url = Deno.env.get("SUPABASE_URL") || "";
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
const service = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
const publicAuth = createClient(url, anonKey, { auth: { autoRefreshToken: false, persistSession: false } });

async function consumeRateLimit(scope: string, key: string, limit: number, windowSeconds: number): Promise<void> {
  const keyHash = await sha256(`hs-parent:${scope}:${key}`);
  const { data, error } = await service.rpc("consume_hs_rate_limit", {
    p_key_hash: keyHash,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });
  if (error) throw new HttpError(503, "AUTH_TEMPORARILY_UNAVAILABLE");
  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.allowed) throw new HttpError(429, "TOO_MANY_ATTEMPTS", Number(row?.retry_after || 60));
}

function clientIp(req: Request): string {
  const forwarded = req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for") || "unknown";
  return forwarded.split(",")[0].trim().slice(0, 96);
}

type Roster = { students: string[]; types: Record<string, string>; loadedAt: number };
let rosterCache: Roster | null = null;

async function loadRoster(): Promise<Roster> {
  if (rosterCache && Date.now() - rosterCache.loadedAt < 60_000) return rosterCache;
  const response = await fetch(`${ROSTER_URL}?t=${Math.floor(Date.now() / 60_000)}`, { headers: { "Cache-Control": "no-cache" } });
  if (!response.ok) throw new HttpError(503, "ROSTER_UNAVAILABLE");
  const text = await response.text();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  let parsed: { students?: unknown; studentTypes?: unknown };
  try {
    parsed = JSON.parse(text.slice(start, end + 1));
  } catch {
    throw new HttpError(503, "ROSTER_UNAVAILABLE");
  }
  const students = Array.isArray(parsed.students) ? parsed.students.map(displayName).filter(Boolean) : [];
  if (!students.length) throw new HttpError(503, "ROSTER_UNAVAILABLE");
  const rawTypes = (parsed.studentTypes && typeof parsed.studentTypes === "object") ? parsed.studentTypes as Record<string, unknown> : {};
  const types: Record<string, string> = {};
  for (const [key, value] of Object.entries(rawTypes)) types[displayName(key)] = String(value);
  rosterCache = { students, types, loadedAt: Date.now() };
  return rosterCache;
}

type Account = { user_id: string; student: string; login_email: string; role: string; active: boolean };

async function findAccount(name: string): Promise<Account | null> {
  const { data, error } = await service.from("hs_accounts")
    .select("user_id,student,login_email,role,active")
    .eq("student", name)
    .maybeSingle();
  if (error) throw new HttpError(500, "ACCOUNT_LOOKUP_FAILED");
  return data as Account | null;
}

// 등록된 활성 학생인지 서버에서 확인한다. 계정이 없는 명단 학생은 { account: null }.
async function resolveStudent(rawName: unknown): Promise<{ name: string; account: Account | null }> {
  const name = displayName(rawName);
  if (!validStudentName(name)) throw new HttpError(404, "STUDENT_NOT_FOUND");
  const account = await findAccount(name);
  let roster: Roster | null = null;
  try {
    roster = await loadRoster();
  } catch (error) {
    if (!account) throw error;
  }
  const withdrawn = roster ? roster.types[name] === "withdrawn" : false;
  if (account) {
    if (account.role !== "student") throw new HttpError(404, "STUDENT_NOT_FOUND");
    if (!account.active || withdrawn) throw new HttpError(403, "STUDENT_INACTIVE");
    return { name, account };
  }
  if (!roster || !roster.students.includes(name)) throw new HttpError(404, "STUDENT_NOT_FOUND");
  if (withdrawn) throw new HttpError(403, "STUDENT_INACTIVE");
  return { name, account: null };
}

async function findAuthUserByEmail(email: string) {
  for (let page = 1; page <= 10; page++) {
    const { data, error } = await service.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new HttpError(500, "ACCOUNT_LOOKUP_FAILED");
    const found = data.users.find((user) => String(user.email || "").toLowerCase() === email);
    if (found) return found;
    if (data.users.length < 200) break;
  }
  return null;
}

// 기존 계정 발급 경로(issueOne)는 부르지 않는다: 비밀번호 재설정·소유권 덮어쓰기를 피한다.
// 계정이 없는 명단 학생에 한해 내부 계정 1개를 만들고, 주인 없는 기존 기록만 연결한다.
async function createStudentAccount(name: string): Promise<Account> {
  const loginEmail = await studentLoginEmail(name);
  let userId: string;
  let created = false;
  const { data } = await service.auth.admin.createUser({
    email: loginEmail,
    password: randomSecret(),
    email_confirm: true,
    app_metadata: { role: "student" },
    user_metadata: { display_name: name },
  });
  if (data?.user) {
    userId = data.user.id;
    created = true;
  } else {
    // 이전에 만들어졌지만 hs_accounts 연결이 없는 내부 사용자만 재사용한다.
    const existing = await findAuthUserByEmail(loginEmail);
    if (!existing) throw new HttpError(500, "ACCOUNT_CREATE_FAILED");
    userId = existing.id;
  }
  const { data: saved, error: saveError } = await service.from("hs_accounts").insert({
    user_id: userId,
    student: name,
    login_email: loginEmail,
    role: "student",
    can_self_enter: false,
    active: true,
  }).select("user_id,student,login_email,role,active").single();
  if (saveError || !saved) {
    const raced = await findAccount(name);
    if (raced) {
      if (created && raced.user_id !== userId) await service.auth.admin.deleteUser(userId);
      return raced;
    }
    if (created) await service.auth.admin.deleteUser(userId);
    throw new HttpError(500, "ACCOUNT_CREATE_FAILED");
  }
  await Promise.all([
    service.from("mock_results").update({ owner_id: userId }).eq("student", name).is("owner_id", null),
    service.from("weak_types").update({ owner_id: userId }).eq("student", name).is("owner_id", null),
  ]);
  return saved as Account;
}

type Link = { student_user_id: string; parent_email: string; first_verified_at: string; last_seen_at: string | null };

async function findLink(studentUserId: string): Promise<Link | null> {
  const { data, error } = await service.from("hs_parent_links")
    .select("student_user_id,parent_email,first_verified_at,last_seen_at")
    .eq("student_user_id", studentUserId)
    .maybeSingle();
  if (error) throw new HttpError(500, "LINK_LOOKUP_FAILED");
  return data as Link | null;
}

async function issueStudentSession(account: Account) {
  const { data: generated, error: generateError } = await service.auth.admin.generateLink({
    type: "magiclink",
    email: account.login_email,
  });
  const tokenHash = generated?.properties?.hashed_token;
  if (generateError || !tokenHash) throw new HttpError(500, "SESSION_CREATE_FAILED");
  const { data, error } = await publicAuth.auth.verifyOtp({ token_hash: tokenHash, type: "email" });
  if (error || !data.session || data.user?.id !== account.user_id) throw new HttpError(500, "SESSION_CREATE_FAILED");
  return data.session;
}

async function start(req: Request, body: Record<string, unknown>) {
  await consumeRateLimit("start-ip", clientIp(req), 10, 600);
  const email = normalizeEmail(body.email);
  const { name, account } = await resolveStudent(body.name);
  await consumeRateLimit("start-email", email, 5, 3600);
  await consumeRateLimit("start-student", loginKey(name), 6, 3600);
  if (account) {
    const link = await findLink(account.user_id);
    if (link && link.parent_email !== email) throw new HttpError(409, "LINKED_TO_OTHER_EMAIL");
  }
  const { error } = await publicAuth.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
  if (error) {
    const status = Number((error as { status?: number }).status || 0);
    if (status === 429) throw new HttpError(429, "TOO_MANY_ATTEMPTS", 60);
    throw new HttpError(502, "EMAIL_SEND_FAILED");
  }
  return { ok: true };
}

async function verify(req: Request, body: Record<string, unknown>) {
  const email = normalizeEmail(body.email);
  const code = String(body.code ?? "").replace(/\s+/g, "");
  await consumeRateLimit("verify-ip", clientIp(req), 20, 600);
  if (!CODE_PATTERN.test(code)) throw new HttpError(400, "INVALID_CODE");
  await consumeRateLimit("verify-email", email, 8, 600);
  const resolved = await resolveStudent(body.name);

  const { data: parent, error: otpError } = await publicAuth.auth.verifyOtp({ email, token: code, type: "email" });
  if (otpError || !parent?.session || !parent.user) throw new HttpError(401, "INVALID_CODE");
  const parentUserId = parent.user.id;
  const parentEmail = String(parent.user.email || "").toLowerCase();
  // 학부모 세션은 쓰지 않으므로 즉시 종료한다.
  await service.auth.admin.signOut(parent.session.access_token, "global").catch(() => {});
  if (parentEmail !== email) throw new HttpError(401, "INVALID_CODE");

  const account = resolved.account || await createStudentAccount(resolved.name);
  const now = new Date().toISOString();
  const existing = await findLink(account.user_id);
  let firstLink = false;
  if (existing) {
    if (existing.parent_email !== email) throw new HttpError(409, "LINKED_TO_OTHER_EMAIL");
    const { error } = await service.from("hs_parent_links").update({
      parent_user_id: parentUserId,
      last_verified_at: now,
      last_seen_at: now,
      updated_at: now,
    }).eq("student_user_id", account.user_id).eq("parent_email", email);
    if (error) throw new HttpError(500, "LINK_SAVE_FAILED");
  } else {
    const { error } = await service.from("hs_parent_links").insert({
      student_user_id: account.user_id,
      parent_email: email,
      parent_user_id: parentUserId,
      first_verified_at: now,
      last_verified_at: now,
      last_seen_at: now,
    });
    if (error) {
      const raced = await findLink(account.user_id);
      if (!raced || raced.parent_email !== email) throw new HttpError(409, "LINKED_TO_OTHER_EMAIL");
    } else firstLink = true;
  }

  const session = await issueStudentSession(account);
  return { session, student: account.student, firstLink };
}

async function touch(req: Request) {
  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) throw new HttpError(401, "UNAUTHORIZED");
  const { data, error } = await service.auth.getUser(token);
  if (error || !data.user) throw new HttpError(401, "UNAUTHORIZED");
  const { data: account, error: accountError } = await service.from("hs_accounts")
    .select("user_id,student,login_email,role,active")
    .eq("user_id", data.user.id)
    .maybeSingle();
  if (accountError) throw new HttpError(500, "ACCOUNT_LOOKUP_FAILED");
  if (!account || account.role !== "student") throw new HttpError(403, "STUDENT_NOT_FOUND");
  let withdrawn = false;
  try {
    withdrawn = (await loadRoster()).types[displayName(account.student)] === "withdrawn";
  } catch { /* 명단을 못 읽으면 계정 active 값으로 판단한다. */ }
  if (!account.active || withdrawn) throw new HttpError(403, "STUDENT_INACTIVE");
  const link = await findLink(account.user_id);
  if (!link) throw new HttpError(403, "EMAIL_NOT_VERIFIED");
  const lastSeen = link.last_seen_at ? Date.parse(link.last_seen_at) : 0;
  if (!lastSeen || Date.now() - lastSeen > TOUCH_INTERVAL_MS) {
    const now = new Date().toISOString();
    await service.from("hs_parent_links").update({ last_seen_at: now, updated_at: now })
      .eq("student_user_id", account.user_id);
  }
  return { ok: true, student: account.student };
}

Deno.serve(async (req: Request) => {
  if (!allowedOrigin(req)) return json(req, { error: "ORIGIN_NOT_ALLOWED" }, 403);
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(req) });
  if (req.method !== "POST") return json(req, { error: "METHOD_NOT_ALLOWED" }, 405);
  try {
    const body = await req.json().catch(() => ({})) as Record<string, unknown>;
    const action = String(body.action || "");
    if (action === "start") return json(req, await start(req, body));
    if (action === "verify") return json(req, await verify(req, body));
    if (action === "touch") return json(req, await touch(req));
    throw new HttpError(400, "INVALID_ACTION");
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500;
    const code = error instanceof HttpError ? error.code : "INTERNAL_ERROR";
    const retryAfter = error instanceof HttpError ? error.retryAfter : undefined;
    return json(req, { error: code }, status, retryAfter);
  }
});
