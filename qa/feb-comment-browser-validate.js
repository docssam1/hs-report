'use strict';
// 2월 대비 주차별 선생님 코멘트: 어드민에서 쓰면 저장 데이터에 들어가고, 학생 화면 학습 내용 맨 앞에 보인다.
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
const COMMENT='이번 주는 [[red:Thinking Core 1장]]을 끝내요.\n- 영상 먼저\n- 그다음 과제';
(async()=>{
  const host=await server();const base='http://127.0.0.1:'+host.address().port;
  const b=await chromium.launch({headless:true,executablePath:process.env.GFIELD_QA_BROWSER_EXECUTABLE||undefined});
  const errs=[];const out={};
  const pageOf=async(viewport,inject)=>{const ctx=await b.newContext({viewport});const p=await ctx.newPage();p.on('pageerror',e=>errs.push(String(e)));
    await p.route(/supabase\.co|\/functions\/v1|api\.github\.com|youtube\.com|ytimg/,r=>r.abort());
    if(inject)await p.route('**/data.js*',async r=>{const res=await r.fetch();r.fulfill({response:res,body:(await res.text())+inject});});return p;};
  // 1) 어드민: 주차를 고르고 쓰면 S.febRoadmap.comments에 들어가고, 비우면 지워진다
  {const p=await pageOf({width:1400,height:900});await p.goto(base+'/admin.html');await p.waitForTimeout(1500);
    out.admin=await p.evaluate(({text})=>{renderAll();tab('hs');
      const sel=document.getElementById('feb-cm-week'),ta=document.getElementById('feb-cm-text');
      sel.value='feb-w01';febCommentLoad();ta.value=text;ta.dispatchEvent(new Event('input',{bubbles:true}));
      const saved=S.febRoadmap.comments['feb-w01'];const state=document.getElementById('feb-cm-state').textContent;
      const inPayload=JSON.parse(JSON.stringify(S)).febRoadmap.comments['feb-w01'];
      sel.value='feb-w02';febCommentLoad();const other=ta.value;
      sel.value='feb-w01';febCommentLoad();const back=ta.value;
      ta.value='';ta.dispatchEvent(new Event('input',{bubbles:true}));const cleared=!(S.febRoadmap.comments&&S.febRoadmap.comments['feb-w01']);
      renderFeb();
      return {saved,state,inPayload,other,back,cleared,dirty:document.getElementById('save-status').textContent.includes('저장되지 않은'),options:sel.options.length};},{text:COMMENT});
    await p.context().close();}
  // 2) 학생 화면: 저장된 코멘트가 학습 내용 맨 앞에 보이고 [[red:]]가 적용된다
  {const inject=';(function(D){D.febRoadmap=D.febRoadmap||{};D.febRoadmap.currentWeekId="feb-w01";D.febRoadmap.comments={"feb-w01":'+JSON.stringify(COMMENT)+'};})(window.GFIELD_DATA);';
    const p=await pageOf({width:1280,height:900},inject);await p.goto(base+'/index.html');await p.waitForFunction(()=>typeof enterAs==='function');
    await p.evaluate(()=>{const v=document.getElementById('video-intro');if(v)v.style.display='none';enterAs('이승우',false)});await p.waitForTimeout(3800);
    await p.evaluate(()=>nav('home'));await p.waitForTimeout(800);
    out.student=await p.evaluate(()=>{const n=document.querySelector('#home-card .notice');return n?{text:n.innerText.slice(0,80),red:[...n.querySelectorAll('span[style]')].some(x=>x.textContent==='Thinking Core 1장'&&/color/.test(x.getAttribute('style'))),list:n.querySelectorAll('li').length}:null;});
    await p.context().close();}
  console.log(JSON.stringify(out));
  assert.equal(out.admin.saved,COMMENT);assert.equal(out.admin.inPayload,COMMENT);
  assert.ok(/코멘트가 있는 주차 1개/.test(out.admin.state));
  assert.equal(out.admin.other,'');assert.equal(out.admin.back,COMMENT);assert.equal(out.admin.cleared,true);assert.ok(out.admin.dirty);assert.equal(out.admin.options,13);
  assert.ok(out.student&&out.student.text.startsWith('이번 주는 Thinking Core 1장'),'학생 화면 맨 앞');
  assert.ok(out.student.red,'빨강 강조');assert.equal(out.student.list,2);
  assert.deepEqual(errs,[]);
  await b.close();host.close();
  console.log('PASS 2월 대비 주차별 코멘트: 어드민 입력·저장 데이터·주차 전환·비우기, 학생 화면 맨 앞·강조·목록');
})().catch(e=>{console.error(e);process.exit(1);});
