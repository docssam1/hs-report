'use strict';
// 편입·승급 자료실 → 4학년 유사문제 은행(elementary4/): 4학년만, 문제 만들기·워터마크, 승인 학생만 입장, 자료실 카드는 승인 학생에게만.
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
// 테스트 자료: 이승우에게만 승급·편입 자료실을 연다(개별 권한 목록에서는 뺀다).
const F='승급·편입 자료실';
const INJECT=';(function(D){var F='+JSON.stringify(F)+';if(D.archiveFolders.indexOf(F)<0)D.archiveFolders.push(F);D.archiveAccess[F]=["이승우"];'+
  'Object.keys(D.studentAccessProfiles||{}).forEach(function(n){var p=D.studentAccessProfiles[n];if(p&&p.folders)p.folders=p.folders.filter(function(f){return f!==F;});});})(window.GFIELD_DATA);';
(async()=>{
  const host=await server();const base='http://127.0.0.1:'+host.address().port;
  const b=await chromium.launch({headless:true,executablePath:process.env.GFIELD_QA_BROWSER_EXECUTABLE||undefined});
  const errs=[];
  async function page(viewport,init){const ctx=await b.newContext({viewport});const p=await ctx.newPage();p.on('pageerror',e=>errs.push(String(e)));
    await p.route(/supabase\.co|\/functions\/v1|api\.github\.com|youtube\.com|ytimg|fonts\.g/,r=>r.abort());
    await p.route('**/data.js*',async r=>{const res=await r.fetch();r.fulfill({response:res,body:(await res.text())+INJECT});});
    if(init)await p.addInitScript(init);return p;}
  const out={};
  // 1) 화면: 4학년만, 문제 만들기, 워터마크
  {const p=await page({width:1280,height:900});await p.goto(base+'/elementary4/index.html');await p.waitForTimeout(2500);
    out.grades=await p.$$eval('#gradeFilter .segment',e=>e.map(x=>x.textContent.trim()));
    out.semesters=await p.evaluate(()=>window.HSE_CURRICULUM.semesters.map(s=>s.grade+'-'+s.term));
    out.title=await p.title();
    out.brand=await p.evaluate(()=>/LETE-ON/.test(document.body.innerText));
    const boxes=await p.$$('#typeTree input[type=checkbox], input[type=checkbox][data-type-id]');
    out.boxes=boxes.length;
    for(const bx of boxes.slice(0,3)){try{await bx.check({force:true})}catch(e){}}
    await p.click('#generateButton').catch(()=>{});await p.waitForTimeout(2500);
    out.wm=await p.evaluate(()=>{const w=document.querySelector('.watermark');return w?w.textContent:''});
    out.qcount=await p.evaluate(()=>{const m=/(\d+)문항\s*·/.exec(document.body.innerText);return m?Number(m[1]):0;});
    if(process.env.SHOT_DIR)await p.screenshot({path:path.join(process.env.SHOT_DIR,'e4-generated.png')});
    await p.context().close();}
  // 2) 입장 확인(실서버와 같게 강제): 승인 학생 / 미승인 학생 / 로그인 없음
  const gate=async(name)=>{const p=await page({width:1000,height:800},n=>{window.__GFIELD_ELEM4_FORCE__=true;try{if(n)localStorage.setItem('gfield_student',n);}catch(e){}});
    await p.addInitScript(`window.__GFIELD_ELEM4_FORCE__=true;${name?`localStorage.setItem('gfield_student',${JSON.stringify(name)});`:''}`);
    await p.goto(base+'/elementary4/index.html');await p.waitForTimeout(1500);
    const r=await p.evaluate(()=>({pending:document.documentElement.classList.contains('elem4-pending'),msg:(document.getElementById('elem4Msg')||{}).textContent||'',nameField:(document.getElementById('studentNameInput')||{}).value||''}));
    await p.context().close();return r;};
  out.gateOk=await gate('이승우');
  out.gateNo=await gate('정준우');
  out.gateNone=await gate('');
  // 3) 자료실 카드: 승인 학생에게만
  const card=async(name)=>{const p=await page({width:1280,height:900});await p.goto(base+'/index.html');await p.waitForFunction(()=>typeof enterAs==='function');
    await p.evaluate(n=>{const v=document.getElementById('video-intro');if(v)v.style.display='none';enterAs(n,false)},name);await p.waitForTimeout(800);
    await p.evaluate(()=>nav('roadmap'));const t=await p.$('#rm-tab-upg');let vis=false;
    if(t&&await t.isVisible()){await t.click();await p.waitForTimeout(500);vis=await p.isVisible('#rm-upg [data-e4]');}
    await p.context().close();return vis;};
  out.cardOk=await card('이승우');
  out.cardNo=await card('정준우');
  console.log(JSON.stringify(out));
  assert.deepEqual(out.grades,['4학년']);
  assert.deepEqual(out.semesters,['4-1','4-2']);
  assert.equal(out.brand,false,'LETE-ON 이름이 화면에 없다');
  assert.ok(out.boxes>0,'유형 목록');
  assert.ok(/지필드 영재교육/.test(out.wm),'문제지 워터마크');
  assert.ok(out.qcount>0,'문제가 만들어진다');
  assert.equal(out.gateOk.pending,false);assert.equal(out.gateOk.nameField,'이승우');
  assert.equal(out.gateNo.pending,true);assert.ok(/열리지 않았습니다/.test(out.gateNo.msg));
  assert.equal(out.gateNone.pending,true);assert.ok(/로그인/.test(out.gateNone.msg));
  assert.equal(out.cardOk,true);assert.equal(out.cardNo,false);
  assert.deepEqual(errs,[]);
  await b.close();host.close();
  console.log('PASS 4학년 유사문제 은행: 4학년만, 문제 만들기·지필드 워터마크, 승인 학생만 입장, 자료실 카드는 승인 학생에게만');
})().catch(e=>{console.error(e);process.exit(1);});
