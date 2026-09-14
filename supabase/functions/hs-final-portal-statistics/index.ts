import "jsr:@supabase/functions-js@2.5.0/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2.112.4";
import baseline from "../hs-final-population/baseline.private.json" with { type: "json" };
import final2Baseline from "../hs-final-population/baseline-final2.private.json" with { type: "json" };
import final3Baseline from "../hs-final-population/baseline-final3.private.json" with { type: "json" };
import final4Baseline from "../hs-final-population/baseline-final4.private.json" with { type: "json" };
import "../hs-final-population/population-core.js";
import "./portal-service.js";

const origins = new Set(["https://hs.gfieldacademy.net", "https://docssam1.github.io", "http://localhost:8000", "http://127.0.0.1:8000"]);
const service = createClient(Deno.env.get("SUPABASE_URL") || "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "", { auth: { autoRefreshToken: false, persistSession: false } });
const core = (globalThis as unknown as { GFIELD_POPULATION_CORE: { createResponse: (baseline: unknown, scores: unknown) => unknown; scoreOf: (ox: string) => number } }).GFIELD_POPULATION_CORE;
const portal = (globalThis as unknown as { GFIELD_PORTAL_STATISTICS: { handle: (...args: unknown[]) => Promise<unknown> } }).GFIELD_PORTAL_STATISTICS;
const baselines: Record<string, unknown> = Object.freeze({final1:baseline,final2:final2Baseline,final3:final3Baseline,final4:final4Baseline});

Deno.serve(async (req: Request) => {
  const origin=req.headers.get("origin")||"";
  const headers:Record<string,string>={"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","Vary":"Origin","Access-Control-Allow-Headers":"apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS"};
  if(origins.has(origin))headers["Access-Control-Allow-Origin"]=origin;
  const reply=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers});
  if(!origins.has(origin))return reply({error:"FORBIDDEN_ORIGIN"},403);
  if(req.method==="OPTIONS")return reply({ok:true});
  if(req.method!=="POST")return reply({error:"METHOD_NOT_ALLOWED"},405);
  try{
    const text=await req.text();if(text.length>500)return reply({error:"INVALID_REQUEST"},400);
    let body;try{body=JSON.parse(text);}catch{return reply({error:"INVALID_REQUEST"},400);}
    return reply(await portal.handle(service,body,core,baselines));
  }catch(error){const e=error as {status?:number;message?:string};return reply({error:e.status?e.message:"STATISTICS_UNAVAILABLE"},e.status||503);}
});
