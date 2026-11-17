// No name supplied by a browser is an identity. Only verified report sessions
// may issue a single-use, diagnosis-only credential. No HF account is modified.
const ORIGINS = new Set(['https://hs.gfieldacademy.net','https://lete-on.gfieldacademy.net']);
const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const TOKEN = /^[A-Za-z0-9_-]{43}$/;
const DEVICE = /^[A-Za-z0-9_-]{32,64}$/;
export const ROSTER_URL = 'https://raw.githubusercontent.com/docssam1/hs-report/main/data.js';
const TARGET_FOLDER = 'GFIELD APPLICATION';
type ObjectMap = Record<string, any>;
class HttpError extends Error { status: number; code: string; constructor(status: number, code: string) { super(code); this.status=status; this.code=code; } }
export async function hash(value: string) {
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))), b=>b.toString(16).padStart(2,'0')).join('');
}
export function allowsDiagnosis(roster: ObjectMap, name: string): boolean {
  // Fail closed: a current roster entry and the actual archive folder grant.
  if (!Array.isArray(roster.students)||!roster.students.includes(name)) return false;
  if (['withdrawn','graduated'].includes(roster.studentTypes?.[name])) return false;
  const profiles=roster.studentAccessProfiles||{};
  const list=Object.prototype.hasOwnProperty.call(profiles,name)
    ? profiles[name]?.folders : roster.archiveAccess?.[TARGET_FOLDER];
  if (!Array.isArray(list)) return false;
  return Object.prototype.hasOwnProperty.call(profiles,name)
    ? list.includes(TARGET_FOLDER) : list.includes('*')||list.includes(name);
}
function claims(token: string) {
  try {
    const bits=token.split('.');
    if(bits.length!==3)throw new Error();
    const raw=bits[1].replace(/-/g,'+').replace(/_/g,'/');
    return JSON.parse(atob(raw));
  } catch { throw new HttpError(401,'UNAUTHORIZED'); }
}
function row(value: any) { return Array.isArray(value)?value[0]:value; }
function randomToken() {
  return btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))))
    .replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
async function loadRoster(fetcher: typeof fetch) {
  const response=await fetcher(ROSTER_URL+'?hf='+Math.floor(Date.now()/1000),{cache:'no-store',signal:AbortSignal.timeout(8000)});
  if(!response.ok)throw new HttpError(503,'ROSTER_UNAVAILABLE');
  const text=await response.text();
  try {
    const parsed=JSON.parse(text.slice(text.indexOf('{'),text.lastIndexOf('}')+1));
    if(!parsed||!Array.isArray(parsed.students)||!parsed.students.length)throw new Error();
    return parsed;
  } catch { throw new HttpError(503,'ROSTER_UNAVAILABLE'); }
}
export function createHandler(service: any, fetcher: typeof fetch = fetch) {
  return async function handle(req: Request): Promise<Response> {
    const origin=req.headers.get('origin')||'';
    const headers: Record<string,string>={
      'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store, private',
      'Pragma':'no-cache','Vary':'Origin','Referrer-Policy':'no-referrer',
      'Access-Control-Allow-Headers':'authorization, apikey, content-type',
      'Access-Control-Allow-Methods':'POST, OPTIONS'
    };
    if(ORIGINS.has(origin))headers['Access-Control-Allow-Origin']=origin;
    const json=(value:unknown,status=200)=>new Response(JSON.stringify(value),{status,headers});
    try {
      if(origin&&!ORIGINS.has(origin))throw new HttpError(403,'ORIGIN_NOT_ALLOWED');
      if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
      if(req.method!=='POST')throw new HttpError(405,'METHOD_NOT_ALLOWED');
      if(Number(req.headers.get('content-length')||0)>4096)throw new HttpError(413,'REQUEST_TOO_LARGE');
      // Bound streamed bodies too (not only a client-controlled Content-Length).
      const reader=req.body?.getReader();if(!reader)throw new HttpError(400,'INVALID_REQUEST');
      const chunks: Uint8Array[]=[];let size=0;
      while(true){const next=await reader.read();if(next.done)break;size+=next.value.length;if(size>4096){await reader.cancel();throw new HttpError(413,'REQUEST_TOO_LARGE');}chunks.push(next.value);}
      const joined=new Uint8Array(size);let offset=0;for(const chunk of chunks){joined.set(chunk,offset);offset+=chunk.length;}
      let body:ObjectMap;try{body=JSON.parse(new TextDecoder().decode(joined));}catch{throw new HttpError(400,'INVALID_REQUEST');}
      if(!body||typeof body!=='object'||Array.isArray(body))throw new HttpError(400,'INVALID_REQUEST');
      if(body.action==='issue') {
        if(Object.keys(body).sort().join(',')!=='action,deviceToken'||!DEVICE.test(String(body.deviceToken||'')))throw new HttpError(400,'INVALID_REQUEST');
        const authorization=req.headers.get('authorization')||'';
        if(!authorization.startsWith('Bearer '))throw new HttpError(401,'UNAUTHORIZED');
        const token=authorization.slice(7);
        const {data:auth,error:authError}=await service.auth.getUser(token);
        if(authError||!auth?.user)throw new HttpError(401,'UNAUTHORIZED');
        const payload=claims(token);const now=Date.now();
        if(payload.sub!==auth.user.id||!UUID.test(payload.session_id||'')||!Number.isFinite(payload.exp)||payload.exp*1000<=now)throw new HttpError(401,'UNAUTHORIZED');
        const {data,error}=await service.rpc('hs_hyperfocus_context',{
          p_user:auth.user.id,p_session:payload.session_id,p_device_hash:await hash('hs-device:'+body.deviceToken)
        });
        if(error)throw new HttpError(503,'AUTH_UNAVAILABLE');
        const account=row(data);if(!account)throw new HttpError(403,'ACCESS_DENIED');
        const roster=await loadRoster(fetcher);
        if(!allowsDiagnosis(roster,account.student))throw new HttpError(403,'ARCHIVE_NOT_APPROVED');
        const {data:limit,error:limitError}=await service.rpc('consume_hs_rate_limit',{
          p_key_hash:await hash('hs-hyperfocus:'+account.user_id),p_limit:12,p_window_seconds:60
        });
        if(limitError)throw new HttpError(503,'AUTH_UNAVAILABLE');
        if(!row(limit)?.allowed)throw new HttpError(429,'TOO_MANY_ATTEMPTS');
        const sessionExpiry=account.session_expires_at?Date.parse(account.session_expires_at):Infinity;
        if(Number.isNaN(sessionExpiry)||sessionExpiry<=now)throw new HttpError(401,'UNAUTHORIZED');
        const opaque=randomToken();const expiresAt=new Date(Math.min(now+60_000,payload.exp*1000,sessionExpiry)).toISOString();
        const accessExpiresAt=new Date(Math.min(now+3600_000,payload.exp*1000,sessionExpiry)).toISOString();
        const {error:saveError}=await service.from('hs_hyperfocus_handoffs').insert({
          token_hash:await hash(opaque),user_id:account.user_id,session_id:payload.session_id,device_id:account.device_id,
          created_at:new Date(now).toISOString(),expires_at:expiresAt,access_expires_at:accessExpiresAt
        });
        if(saveError)throw new HttpError(503,'HANDOFF_UNAVAILABLE');
        return json({token:opaque,expiresAt});
      }
      if(body.action==='consume'||body.action==='resume') {
        if(Object.keys(body).sort().join(',')!=='action,token'||!TOKEN.test(String(body.token||'')))throw new HttpError(400,'INVALID_REQUEST');
        // RPC consumes exactly once and checks active account, source auth session,
        // approved device, verified parent link and both expiry bounds atomically.
        const consuming=body.action==='consume';
        const sessionToken=consuming?randomToken():'';
        const {data,error}=consuming
          ? await service.rpc('hs_consume_hyperfocus_handoff',{p_token_hash:await hash(body.token),p_session_token_hash:await hash(sessionToken)})
          : await service.rpc('hs_resume_hyperfocus_session',{p_session_token_hash:await hash(body.token)});
        if(error)throw new HttpError(503,'AUTH_UNAVAILABLE');
        const account=row(data);if(!account)throw new HttpError(401,'HANDOFF_EXPIRED');
        // Do not trust issue-time grants after an administrator removes access.
        if(!allowsDiagnosis(await loadRoster(fetcher),account.student))throw new HttpError(403,'ARCHIVE_NOT_APPROVED');
        const session={role:'student',backend:'hs-report',userId:account.user_id,name:account.student,type:'internal',permissions:['hyperfocus'],expiresAt:account.access_expires_at};
        return json(consuming?{session,sessionToken}:{session});
      }
      throw new HttpError(400,'INVALID_ACTION');
    } catch(error) {
      return json({error:error instanceof HttpError?error.code:'SERVICE_UNAVAILABLE'},error instanceof HttpError?error.status:503);
    }
  };
}
