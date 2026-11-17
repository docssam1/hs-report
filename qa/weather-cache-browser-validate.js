'use strict';
// 날씨: 기기에 30분 저장해 다시 부르지 않고, 서버가 막혀도(429·끊김) 3시간 안의 저장본을 보여 준다. 저장본이 없으면 예전처럼 안내만 나온다.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
require('./email-login-test-stub');
const {chromium}=require(process.env.GFIELD_QA_PLAYWRIGHT||'playwright');
const ROOT=path.resolve(__dirname,'..');
const TYPES={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.json':'application/json','.jpg':'image/jpeg','.png':'image/png','.css':'text/css','.svg':'image/svg+xml'};
function server(){return new Promise(resolve=>{const s=http.createServer((q,r)=>{const pn=decodeURIComponent(new URL(q.url,'http://127.0.0.1').pathname);const f=path.resolve(ROOT,'.'+(pn.endsWith('/')?pn+'index.html':pn));
  if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);r.end();return;}r.writeHead(200,{'content-type':TYPES[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);}).listen(0,'127.0.0.1',()=>resolve(s));});}
const WX={current:{temperature_2m:12.4,weather_code:1},daily:{temperature_2m_max:[15,14],temperature_2m_min:[6,5],weather_code:[1,2],precipitation_probability_max:[10,20]}};
(async()=>{
  const host=await server();const base='http://127.0.0.1:'+host.address().port;
  const b=await chromium.launch({headless:true,executablePath:process.env.GFIELD_QA_BROWSER_EXECUTABLE||undefined});
  const errs=[];const out={};
  async function run(name,mode,preset){const ctx=await b.newContext({viewport:{width:1100,height:900}});const p=await ctx.newPage();p.on('pageerror',e=>errs.push(String(e)));
    let calls=0;
    await p.route(/supabase\.co|\/functions\/v1|api\.github\.com|youtube\.com|ytimg/,r=>r.abort());
    await p.route('**/api.open-meteo.com/**',r=>{calls++;if(mode==='ok')r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(WX)});else if(mode==='429')r.fulfill({status:429,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:'{"error":true}'});else r.abort();});
    if(preset)await p.addInitScript(preset);
    await p.goto(base+'/index.html');await p.waitForFunction(()=>typeof enterAs==='function');
    await p.evaluate(()=>{const v=document.getElementById('video-intro');if(v)v.style.display='none';enterAs('이승우',false)});await p.waitForTimeout(4200);
    await p.evaluate(()=>nav('home'));await p.waitForFunction(()=>{const e=document.getElementById('wx-main');return e&&!/불러오는 중/.test(e.textContent)},null,{timeout:12000}).catch(()=>{});
    const r={text:await p.evaluate(()=>(document.getElementById('wx-main')||{}).textContent||''),calls,stored:await p.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('gfield_weather_v2_')).length)};
    // 같은 기기에서 다시 열기(서버는 막힘): 저장본이 있으면 호출 없이 나와야 한다
    if(name==='A'){calls=0;await p.evaluate(()=>{window.GFIELD_WEATHER=null;window.GFIELD_WEATHER_AT=0;});await p.unroute('**/api.open-meteo.com/**');await p.route('**/api.open-meteo.com/**',x=>{calls++;x.abort();});
      await p.evaluate(()=>nav('roadmap'));await p.evaluate(()=>nav('home'));await p.waitForTimeout(1500);
      r.again={text:await p.evaluate(()=>(document.getElementById('wx-main')||{}).textContent||''),calls};}
    await ctx.close();return r;}
  const key='gfield_weather_v2_37.4996_127.0584';
  out.A=await run('A','ok');
  out.C=await run('C','429');
  out.D=await run('D','429',`try{localStorage.setItem(${JSON.stringify(key)},JSON.stringify({at:Date.now()-60*60*1000,data:${JSON.stringify(WX)}}))}catch(e){}`);
  out.E=await run('E','429',`try{localStorage.setItem(${JSON.stringify(key)},JSON.stringify({at:Date.now()-5*60*60*1000,data:${JSON.stringify(WX)}}))}catch(e){}`);
  console.log(JSON.stringify(out));
  assert.ok(/12°/.test(out.A.text)&&out.A.calls===1&&out.A.stored===1,'정상: 보이고 한 번만 부르고 저장');
  assert.ok(/12°/.test(out.A.again.text)&&out.A.again.calls===0,'다시 열기: 저장본, 서버 호출 없음');
  assert.ok(/불러오지 못했어요/.test(out.C.text),'저장본 없음+서버 막힘: 안내');
  assert.ok(/12°/.test(out.D.text),'1시간 된 저장본: 서버가 막혀도 보임');
  assert.ok(/불러오지 못했어요/.test(out.E.text),'5시간 된 저장본은 쓰지 않음');
  assert.deepEqual(errs,[]);
  await b.close();host.close();
  console.log('PASS 날씨: 30분 기기 저장, 서버 막힘 때 3시간 저장본, 오래된 저장본·없음은 안내');
})().catch(e=>{console.error(e);process.exit(1);});
