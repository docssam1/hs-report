import "jsr:@supabase/functions-js@2.5.0/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2.112.4";

const ALLOWED_ORIGINS = new Set([
  "https://hs.gfieldacademy.net",
  "https://docssam1.github.io",
  "http://localhost:8000",
  "http://127.0.0.1:8000",
]);
const ADMIN_NAME = "DOCSSAM";
const ADMIN_APPROVAL_HASH = "8f38d96f81dbb8ff4551c1ca05503f6cc5187faa4b861b3220d3dd8816c7b5d1";
const ADMIN_EMAIL = "docssam@auth.gfield.invalid";
const ENROLLMENT_TOKEN_PATTERN = /^[23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{48}$/;

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
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-bootstrap-token",
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

function normalizeName(value: unknown): string {
  return String(value ?? "").normalize("NFKC").trim().replace(/\s+/gu, "").toLocaleLowerCase("ko-KR");
}

function constantEqual(left: string, right: string): boolean {
  const a = new TextEncoder().encode(left);
  const b = new TextEncoder().encode(right);
  let diff = a.length ^ b.length;
  const length = Math.max(a.length, b.length);
  for (let i = 0; i < length; i++) diff |= (a[i % Math.max(a.length, 1)] || 0) ^ (b[i % Math.max(b.length, 1)] || 0);
  return diff === 0;
}

function randomToken(length = 32): string {
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  const bytes = crypto.getRandomValues(new Uint8Array(length * 2));
  let value = "";
  for (const byte of bytes) {
    if (byte >= 252) continue;
    value += alphabet[byte % alphabet.length];
    if (value.length === length) break;
  }
  return value.length === length ? value : randomToken(length);
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

const url = Deno.env.get("SUPABASE_URL") || "";
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
const service = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
const publicAuth = createClient(url, anonKey, { auth: { autoRefreshToken: false, persistSession: false } });

async function consumeRateLimit(req: Request, action: string): Promise<void> {
  const forwarded = req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for") || "unknown";
  const ip = forwarded.split(",")[0].trim().slice(0, 96);
  const keyHash = await sha256(`hs-admin:${action}:${ip}`);
  const limit = action === "enroll" ? 3 : 8;
  const windowSeconds = action === "enroll" ? 3600 : 600;
  const { data, error } = await service.rpc("consume_hs_rate_limit", {
    p_key_hash: keyHash,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });
  if (error) throw new HttpError(503, "AUTH_TEMPORARILY_UNAVAILABLE");
  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.allowed) throw new HttpError(429, "TOO_MANY_ATTEMPTS", Number(row?.retry_after || 60));
}

async function findAuthUserByEmail(email: string) {
  for (let page = 1; page <= 5; page++) {
    const { data, error } = await service.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new HttpError(500, "ADMIN_ACCOUNT_LOOKUP_FAILED");
    const found = data.users.find((user) => String(user.email || "").toLocaleLowerCase() === email.toLocaleLowerCase());
    if (found) return found;
    if (data.users.length < 200) break;
  }
  return null;
}

async function ensureAdmin() {
  const { data: account, error: accountError } = await service.from("hs_accounts")
    .select("user_id,student,login_email,role,active")
    .in("role", ["admin", "teacher"])
    .eq("student", ADMIN_NAME)
    .maybeSingle();
  if (accountError) throw new HttpError(500, "ADMIN_ACCOUNT_LOOKUP_FAILED");
  if (account) {
    if (!account.active) throw new HttpError(403, "ADMIN_DISABLED");
    return account;
  }

  let user = await findAuthUserByEmail(ADMIN_EMAIL);
  if (!user) {
    const { data, error } = await service.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: `${randomToken(40)}!9a`,
      email_confirm: true,
      app_metadata: { role: "admin", admin_id: ADMIN_NAME },
      user_metadata: { display_name: ADMIN_NAME },
    });
    if (error || !data.user) throw new HttpError(500, "ADMIN_ACCOUNT_CREATE_FAILED");
    user = data.user;
  } else {
    const { error } = await service.auth.admin.updateUserById(user.id, {
      app_metadata: { ...(user.app_metadata || {}), role: "admin", admin_id: ADMIN_NAME },
      user_metadata: { ...(user.user_metadata || {}), display_name: ADMIN_NAME },
    });
    if (error) throw new HttpError(500, "ADMIN_ACCOUNT_UPDATE_FAILED");
  }

  const { data: saved, error: saveError } = await service.from("hs_accounts").insert({
    user_id: user.id,
    student: ADMIN_NAME,
    login_email: ADMIN_EMAIL,
    role: "admin",
    can_self_enter: true,
    active: true,
  }).select("user_id,student,login_email,role,active").single();
  if (saveError || !saved) throw new HttpError(500, "ADMIN_PROFILE_CREATE_FAILED");
  return saved;
}

async function issueSession(email: string) {
  const { data: generated, error: generateError } = await service.auth.admin.generateLink({ type: "magiclink", email });
  const tokenHash = generated?.properties?.hashed_token;
  if (generateError || !tokenHash) throw new HttpError(500, "ADMIN_SESSION_CREATE_FAILED");
  const { data, error } = await publicAuth.auth.verifyOtp({ token_hash: tokenHash, type: "email" });
  if (error || !data.session || !data.user) throw new HttpError(500, "ADMIN_SESSION_VERIFY_FAILED");
  return data.session;
}

async function requireAdmin(req: Request) {
  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) throw new HttpError(401, "UNAUTHORIZED");
  const { data, error } = await service.auth.getUser(token);
  const role = String(data.user?.app_metadata?.role || "");
  if (error || !data.user || (role !== "admin" && role !== "teacher") || data.user.app_metadata?.admin_id !== ADMIN_NAME) {
    throw new HttpError(403, "FORBIDDEN");
  }
  const { data: account, error: accountError } = await service.from("hs_accounts")
    .select("user_id,active,role").eq("user_id", data.user.id).maybeSingle();
  if (accountError || !account?.active || (account.role !== "admin" && account.role !== "teacher")) {
    throw new HttpError(403, "FORBIDDEN");
  }
  return data.user;
}

async function completeEnrollment(enrollmentToken: string) {
  const account = await ensureAdmin();
  const tokenHash = await sha256(enrollmentToken);
  const now = new Date().toISOString();
  const { data: consumed, error: consumeError } = await service.from("hs_admin_enrollments")
    .update({ used_at: now })
    .eq("token_hash", tokenHash)
    .is("used_at", null)
    .gt("expires_at", now)
    .select("token_hash")
    .maybeSingle();
  if (consumeError || !consumed) throw new HttpError(401, "INVALID_CREDENTIALS");

  try {
    const session = await issueSession(account.login_email);
    const deviceToken = randomToken(48);
    const deviceHash = await sha256(deviceToken);
    const { error: deviceError } = await service.from("hs_admin_devices").insert({
      admin_user_id: account.user_id,
      token_hash: deviceHash,
      label: "관리자 브라우저",
      active: true,
      last_used_at: now,
    });
    if (deviceError) throw new HttpError(500, "DEVICE_ENROLL_FAILED");
    return { session, deviceToken, admin: { name: ADMIN_NAME } };
  } catch (error) {
    await service.from("hs_admin_enrollments")
      .update({ used_at: null })
      .eq("token_hash", tokenHash)
      .eq("used_at", now);
    throw error;
  }
}

async function enroll(req: Request, body: Record<string, unknown>) {
  await consumeRateLimit(req, "enroll");
  const approvalHash = await sha256(String(body.approvalCode ?? "").trim());
  const validCredentials = constantEqual(normalizeName(body.name), normalizeName(ADMIN_NAME))
    && constantEqual(approvalHash, ADMIN_APPROVAL_HASH);
  const enrollmentToken = req.headers.get("x-bootstrap-token") || "";
  if (!validCredentials || !ENROLLMENT_TOKEN_PATTERN.test(enrollmentToken)) throw new HttpError(401, "INVALID_CREDENTIALS");
  return completeEnrollment(enrollmentToken);
}

async function redeem(req: Request) {
  await consumeRateLimit(req, "enroll");
  const enrollmentToken = req.headers.get("x-bootstrap-token") || "";
  if (!ENROLLMENT_TOKEN_PATTERN.test(enrollmentToken)) throw new HttpError(401, "INVALID_CREDENTIALS");
  return completeEnrollment(enrollmentToken);
}

async function login(req: Request, body: Record<string, unknown>) {
  await consumeRateLimit(req, "login");
  const approvalHash = await sha256(String(body.approvalCode ?? "").trim());
  const validCredentials = constantEqual(normalizeName(body.name), normalizeName(ADMIN_NAME))
    && constantEqual(approvalHash, ADMIN_APPROVAL_HASH);
  const deviceToken = String(body.deviceToken ?? "");
  if (!validCredentials) throw new HttpError(401, "INVALID_CREDENTIALS");
  if (deviceToken.length < 32) throw new HttpError(403, "DEVICE_NOT_ENROLLED");

  const account = await ensureAdmin();
  const deviceHash = await sha256(deviceToken);
  const { data: device, error: deviceError } = await service.from("hs_admin_devices")
    .select("id,admin_user_id,active")
    .eq("token_hash", deviceHash)
    .eq("admin_user_id", account.user_id)
    .eq("active", true)
    .maybeSingle();
  if (deviceError || !device) throw new HttpError(403, "DEVICE_NOT_ENROLLED");
  const session = await issueSession(account.login_email);
  await service.from("hs_admin_devices").update({ last_used_at: new Date().toISOString() }).eq("id", device.id);
  return { session, admin: { name: ADMIN_NAME } };
}

async function createEnrollment(req: Request) {
  const user = await requireAdmin(req);
  const enrollmentToken = randomToken(48);
  const tokenHash = await sha256(enrollmentToken);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  const { error } = await service.from("hs_admin_enrollments").insert({
    token_hash: tokenHash,
    expires_at: expiresAt,
    created_by: user.id,
  });
  if (error) throw new HttpError(500, "ENROLLMENT_CREATE_FAILED");
  return { enrollmentToken, expiresAt };
}

Deno.serve(async (req: Request) => {
  if (!allowedOrigin(req)) return json(req, { error: "ORIGIN_NOT_ALLOWED" }, 403);
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(req) });
  if (req.method !== "POST") return json(req, { error: "METHOD_NOT_ALLOWED" }, 405);
  try {
    const body = await req.json().catch(() => ({})) as Record<string, unknown>;
    const action = String(body.action || "");
    if (action === "enroll") return json(req, await enroll(req, body));
    if (action === "redeem") return json(req, await redeem(req));
    if (action === "login") return json(req, await login(req, body));
    if (action === "createEnrollment") return json(req, await createEnrollment(req));
    throw new HttpError(400, "INVALID_ACTION");
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500;
    const code = error instanceof HttpError ? error.code : "INTERNAL_ERROR";
    const retryAfter = error instanceof HttpError ? error.retryAfter : undefined;
    return json(req, { error: code }, status, retryAfter);
  }
});
