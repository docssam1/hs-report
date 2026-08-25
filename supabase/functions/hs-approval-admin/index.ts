import "jsr:@supabase/functions-js@2.5.0/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2.112.4";

const ALLOWED_ORIGINS = new Set([
  "https://hs.gfieldacademy.net",
  "https://docssam1.github.io",
  "http://localhost:8000",
  "http://127.0.0.1:8000",
]);

function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") || "";
  const headers: Record<string, string> = {
    "Access-Control-Allow-Headers": "authorization, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Vary": "Origin",
  };
  if (ALLOWED_ORIGINS.has(origin)) headers["Access-Control-Allow-Origin"] = origin;
  return headers;
}

function allowedOrigin(req: Request): boolean {
  const origin = req.headers.get("origin") || "";
  return !origin || ALLOWED_ORIGINS.has(origin);
}

function json(req: Request, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders(req) });
}

function normalizeName(value: unknown): string {
  return String(value ?? "").trim().normalize("NFKC");
}

async function loginEmail(name: string): Promise<string> {
  const normalized = normalizeName(name).replace(/\s+/gu, "").toLocaleLowerCase("ko-KR");
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(normalized));
  const hex = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `hs-${hex.slice(0, 32)}@auth.gfieldacademy.net`;
}

function approvalCode(): string {
  let value = "";
  const bytes = new Uint8Array(32);
  while (value.length < 12) {
    crypto.getRandomValues(bytes);
    for (const byte of bytes) {
      if (byte >= 250) continue;
      value += String(byte % 10);
      if (value.length === 12) break;
    }
  }
  return value;
}

function displayApprovalCode(value: string): string {
  return value.replace(/(\d{4})(\d{4})(\d{4})/, "$1-$2-$3");
}

function validStudentName(name: string): boolean {
  return name.length >= 1 && name.length <= 80 && !/[\u0000-\u001f\u007f]/.test(name);
}

const service = createClient(
  Deno.env.get("SUPABASE_URL") || "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
  { auth: { autoRefreshToken: false, persistSession: false } },
);

async function requireAdmin(req: Request) {
  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) throw Object.assign(new Error("관리자 로그인이 필요합니다."), { status: 401 });
  const { data, error } = await service.auth.getUser(token);
  if (error || !data.user) throw Object.assign(new Error("관리자 로그인이 만료되었습니다."), { status: 401 });
  const role = String(data.user.app_metadata?.role || "");
  if ((role !== "admin" && role !== "teacher") || data.user.app_metadata?.admin_id !== "DOCSSAM") {
    throw Object.assign(new Error("관리자 권한이 없습니다."), { status: 403 });
  }
  const { data: account, error: accountError } = await service.from("hs_accounts")
    .select("user_id,role,active").eq("user_id", data.user.id).maybeSingle();
  if (accountError || !account?.active || (account.role !== "admin" && account.role !== "teacher")) {
    throw Object.assign(new Error("관리자 권한이 없습니다."), { status: 403 });
  }
  return data.user;
}

async function backfillOwner(student: string, userId: string) {
  const result = await Promise.all([
    service.from("mock_results").update({ owner_id: userId }).eq("student", student),
    service.from("weak_types").update({ owner_id: userId }).eq("student", student),
  ]);
  const failed = result.find((item) => item.error);
  if (failed?.error) throw new Error(`기존 기록 연결 실패: ${failed.error.message}`);
}

async function issueOne(rawName: unknown, canSelfEnter: unknown) {
  const student = normalizeName(rawName);
  if (!validStudentName(student) || student.toLocaleLowerCase("ko-KR") === "docssam") {
    throw new Error("학생 이름을 확인해 주세요.");
  }
  const login_email = await loginEmail(student);
  const code = approvalCode();
  const selfEnter = Boolean(canSelfEnter);
  const { data: existing, error: lookupError } = await service
    .from("hs_accounts")
    .select("user_id,student")
    .eq("student", student)
    .maybeSingle();
  if (lookupError) throw new Error(lookupError.message);

  let userId = existing?.user_id as string | undefined;
  let created = false;
  if (userId) {
    const { error } = await service.auth.admin.updateUserById(userId, {
      password: code,
      app_metadata: { role: "student" },
      user_metadata: { display_name: student },
    });
    if (error) throw new Error(`승인번호 변경 실패: ${error.message}`);
  } else {
    const { data, error } = await service.auth.admin.createUser({
      email: login_email,
      password: code,
      email_confirm: true,
      app_metadata: { role: "student" },
      user_metadata: { display_name: student },
    });
    if (error || !data.user) throw new Error(`계정 생성 실패: ${error?.message || "unknown"}`);
    userId = data.user.id;
    created = true;
  }

  const { error: accountError } = await service.from("hs_accounts").upsert({
    user_id: userId,
    student,
    login_email,
    role: "student",
    can_self_enter: selfEnter,
    active: true,
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id" });
  if (accountError) {
    if (created) await service.auth.admin.deleteUser(userId);
    throw new Error(`학생 연결 실패: ${accountError.message}`);
  }

  await backfillOwner(student, userId);
  return { student, approvalCode: displayApprovalCode(code), canSelfEnter: selfEnter, reset: !created };
}

async function listStatus() {
  const [{ data: accounts, error: accountError }, { data: results, error: resultError }] = await Promise.all([
    service.from("hs_accounts")
      .select("student,role,can_self_enter,active,created_at,updated_at")
      .order("student"),
    service.from("mock_results").select("student,owner_id"),
  ]);
  if (accountError) throw new Error(accountError.message);
  if (resultError) throw new Error(resultError.message);
  const resultStudents = Array.from(new Set((results || []).map((row) => row.student)));
  const unownedStudents = Array.from(new Set((results || []).filter((row) => !row.owner_id).map((row) => row.student)));
  return { accounts: accounts || [], resultStudents, unownedStudents };
}

Deno.serve(async (req: Request) => {
  if (!allowedOrigin(req)) return json(req, { error: "origin" }, 403);
  if (req.method === "OPTIONS") {
    const origin = req.headers.get("origin") || "";
    if (origin && !ALLOWED_ORIGINS.has(origin)) return json(req, { error: "origin" }, 403);
    return new Response("ok", { headers: corsHeaders(req) });
  }
  if (req.method !== "POST") return json(req, { error: "method" }, 405);

  try {
    await requireAdmin(req);
    const body = await req.json().catch(() => ({}));
    const action = String(body.action || "");

    if (action === "list") return json(req, await listStatus());
    if (action === "issue") return json(req, await issueOne(body.student, body.canSelfEnter));
    if (action === "bulkIssue") {
      const students = Array.isArray(body.students) ? body.students.slice(0, 60) : [];
      if (!students.length) return json(req, { error: "학생 명단이 없습니다." }, 400);
      const issued = [];
      const failed = [];
      for (const item of students) {
        try {
          issued.push(await issueOne(item?.student, item?.canSelfEnter));
        } catch (error) {
          failed.push({ student: normalizeName(item?.student), message: String(error instanceof Error ? error.message : error) });
        }
      }
      return json(req, { issued, failed }, failed.length ? 207 : 200);
    }
    if (action === "setAccess") {
      const student = normalizeName(body.student);
      if (!validStudentName(student)) return json(req, { error: "학생 이름을 확인해 주세요." }, 400);
      const patch: Record<string, boolean | string> = { updated_at: new Date().toISOString() };
      if (typeof body.canSelfEnter === "boolean") patch.can_self_enter = body.canSelfEnter;
      if (typeof body.active === "boolean") patch.active = body.active;
      const { data, error } = await service.from("hs_accounts")
        .update(patch).eq("student", student)
        .select("user_id,student,can_self_enter,active").maybeSingle();
      if (error) throw new Error(error.message);
      if (!data) return json(req, { error: "학생 계정을 찾지 못했습니다." }, 404);
      if (typeof body.active === "boolean") {
        const { error: authError } = await service.auth.admin.updateUserById(data.user_id, {
          ban_duration: body.active ? "none" : "876000h",
        });
        if (authError) throw new Error(`계정 상태 변경 실패: ${authError.message}`);
      }
      return json(req, { account: data });
    }
    return json(req, { error: "지원하지 않는 작업입니다." }, 400);
  } catch (error) {
    const status = Number((error as { status?: number })?.status || 500);
    const message = String(error instanceof Error ? error.message : error).slice(0, 240);
    return json(req, { error: message }, status >= 400 && status <= 599 ? status : 500);
  }
});
