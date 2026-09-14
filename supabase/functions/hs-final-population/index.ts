import "jsr:@supabase/functions-js@2.5.0/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2.112.4";
import baseline from "./baseline.private.json" with { type: "json" };
import final2Baseline from "./baseline-final2.private.json" with { type: "json" };
import final3Baseline from "./baseline-final3.private.json" with { type: "json" };
import final4Baseline from "./baseline-final4.private.json" with { type: "json" };
import "./population-core.js";
import "./report-service.js";

const origins = new Set(["https://hs.gfieldacademy.net", "https://docssam1.github.io", "http://localhost:8000", "http://127.0.0.1:8000"]);
const service = createClient(Deno.env.get("SUPABASE_URL") || "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "", { auth: { autoRefreshToken: false, persistSession: false } });
const core = (globalThis as unknown as { GFIELD_POPULATION_CORE: { createResponse: (baseline: unknown, scores: unknown) => unknown } }).GFIELD_POPULATION_CORE;
const baselines: Record<string, unknown> = Object.freeze({
  final1: baseline,
  final2: typeof final2Baseline === "undefined" ? null : final2Baseline,
  final3: typeof final3Baseline === "undefined" ? null : final3Baseline,
  final4: typeof final4Baseline === "undefined" ? null : final4Baseline,
});

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin") || "";
  const headers: Record<string, string> = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "Vary": "Origin", "Access-Control-Allow-Headers": "authorization, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
  if (origins.has(origin)) headers["Access-Control-Allow-Origin"] = origin;
  const reply = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers });
  if (origin && !origins.has(origin)) return reply({ error: "FORBIDDEN_ORIGIN" }, 403);
  if (req.method === "OPTIONS") return reply({ ok: true });
  if (req.method !== "POST") return reply({ error: "METHOD_NOT_ALLOWED" }, 405);
  try {
    const authorization = req.headers.get("authorization") || "";
    if (!authorization.startsWith("Bearer ")) return reply({ error: "LOGIN_REQUIRED" }, 401);
    const { data, error } = await service.auth.getUser(authorization.slice(7));
    if (error || !data.user) return reply({ error: "LOGIN_REQUIRED" }, 401);
    const { data: account, error: accountError } = await service.from("hs_accounts").select("role,active,student").eq("user_id", data.user.id).maybeSingle();
    if (accountError) return reply({ error: "STATISTICS_UNAVAILABLE" }, 503);
    if (!account?.active || !["student", "admin", "teacher"].includes(account.role)) return reply({ error: "ACCESS_DENIED" }, 403);
    const bodyText = await req.text();
    if (bodyText.length > 14000) return reply({ error: "INVALID_REQUEST" }, 400);
    let body;
    try { body = JSON.parse(bodyText); } catch { return reply({ error: "INVALID_REQUEST" }, 400); }
    if(body && typeof body.action === 'string'){
      try {
        const reports=(globalThis as unknown as { GFIELD_REPORT_SERVICE: {handle: (...args: unknown[]) => Promise<unknown>} }).GFIELD_REPORT_SERVICE;
        return reply(await reports.handle(service,account,data.user,body,core,baselines));
      } catch(error) {
        const e=error as {status?:number;message?:string};
        return reply({error:e.status?e.message:'REPORT_UNAVAILABLE'},e.status||503);
      }
    }
    if (!body || !/^final[1-4]$/.test(body.exam || "") || Object.keys(body).some(key => !["exam", "scores"].includes(key))) return reply({ error: "INVALID_REQUEST" }, 400);
    try { return reply(core.createResponse(baselines[body.exam], body.scores)); }
    catch (error) { return reply({ error: error instanceof Error && error.message === "INVALID_SCORES" ? "INVALID_REQUEST" : "STATISTICS_UNAVAILABLE" }, error instanceof Error && error.message === "INVALID_SCORES" ? 400 : 503); }
  } catch { return reply({ error: "STATISTICS_UNAVAILABLE" }, 503); }
});
