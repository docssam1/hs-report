'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
require('./email-login-test-stub'); // QA 전용: 학부모 이메일 인증 단계를 인증된 브라우저로 취급
const {chromium}=require(process.env.GFIELD_QA_PLAYWRIGHT||'playwright');

const ROOT=path.resolve(__dirname,'..');
function server(){return new Promise(resolve=>{const instance=http.createServer((request,response)=>{const pathname=decodeURIComponent(new URL(request.url,'http://127.0.0.1').pathname);if(pathname==='/favicon.ico'){response.writeHead(204);response.end();return;}const filename=path.resolve(ROOT,'.'+pathname);if(!filename.startsWith(ROOT+path.sep)||!fs.existsSync(filename)||!fs.statSync(filename).isFile()){response.writeHead(404);response.end('not found');return;}response.writeHead(200,{'content-type':path.extname(filename)==='.js'?'text/javascript; charset=utf-8':'text/html; charset=utf-8','cache-control':'no-store'});fs.createReadStream(filename).pipe(response);});instance.listen(0,'127.0.0.1',()=>resolve(instance));});}

const F='승급과정 문제은행',T1='초등과정 4-1 일일테스트 1단원 1,2차시',T2='초등과정 4-1 일일테스트 1단원 3,4차시';
(async()=>{
 const host=await server();const base='http://127.0.0.1:'+host.address().port;
 const b=await chromium.launch({headless:true,executablePath:process.env.GFIELD_QA_BROWSER_EXECUTABLE||undefined});
 const errs=[];let net=0;
 async function open(name){
  const ctx=await b.newContext({viewport:{width:900,height:1000}});const p=await ctx.newPage();
  p.on('pageerror',e=>errs.push(name+': '+e));
  await p.route(/supabase\.co|\/functions\/v1|api\.github\.com/,r=>{net++;r.abort()});
  // 테스트에서만: 이승우(기존 방식)·박선우(새 권한 범위)에게 폴더를 열어 준다. 정준우는 목록 밖.
  await p.route('**/data.js*',async r=>{const res=await r.fetch();let t=await res.text();
    // 이 검사는 일일테스트 2장 기준이다. 나중에 어드민에서 더한 시험지는 빼고 본다(단원테스트는 upgrade-bank-unit-test-browser-validate.js).
    t+=';(function(D){D.books=D.books.filter(function(b){return b.folder!=="승급과정 문제은행"||b.title.indexOf("일일테스트 1단원")>=0;});})(window.GFIELD_DATA);';
    t+=';(function(D){D.archiveAccess["승급과정 문제은행"]=["이승우"];["승급 복습강의","승급·편입 자료실"].forEach(function(f){D.archiveAccess[f]=[];});'+
      'var p=(D.studentAccessProfiles||{})["박선우"];if(p){p.folders=(p.folders||[]).filter(function(f){return f.indexOf("승급")<0;});p.folders.push("승급과정 문제은행");}'+
      'var q=(D.studentAccessProfiles||{})["정준우"];if(q)q.folders=(q.folders||[]).filter(function(f){return f.indexOf("승급")<0;});})(window.GFIELD_DATA);';
    r.fulfill({response:res,body:t});});
  await p.goto(base+'/index.html');
  await p.waitForFunction(()=>typeof enterAs==='function');
  await p.evaluate(n=>{document.getElementById('video-intro')&&(document.getElementById('video-intro').style.display='none');enterAs(n,false)},name);
  await p.waitForTimeout(600);await p.evaluate(()=>nav('roadmap'));await p.waitForTimeout(300);
  if(await p.isVisible('#rm-tab-upg')){await p.click('#rm-tab-upg');await p.waitForTimeout(400);}await p.evaluate(()=>{const d=document.getElementById('up-daily');if(d)d.open=true;});
  return p;
 }
 const titles=p=>p.$$eval('#rm-upg .up-bank .ub-top .book .label',e=>e.map(x=>x.textContent));
 const pressed=p=>p.$$eval('#rm-upg .ub-top .ub-chip[aria-pressed="true"]',e=>e.map(x=>x.textContent));
 const out={};
 for(const name of ['정준우','박선우','이승우']){
  const p=await open(name);
  out[name]=await p.isVisible('#rm-upg .up-bank');
  if(name==='이승우'){
    const sec='#rm-upg .up-bank';
    assert.deepEqual(await titles(p),[T1,T2],'전체: 시험지 이름이 그대로');
    assert.match(await p.$eval(sec+' .ub-sum',e=>e.innerText),/선택한 시험지 2장/);
    // 단원별
    await p.click(sec+' [data-mode="unit"]');assert.deepEqual(await pressed(p),['1단원']);assert.deepEqual(await titles(p),[T1,T2]);
    // 회차별: 기본은 첫 회차 하나, 추가 선택, 마지막 하나는 해제되지 않음
    await p.click(sec+' [data-mode="session"]');assert.deepEqual(await pressed(p),['1단원 1,2차시']);assert.deepEqual(await titles(p),[T1]);
    await p.click(sec+' [data-session="1단원 3,4차시"]');assert.deepEqual(await titles(p),[T1,T2]);
    await p.click(sec+' [data-session="1단원 1,2차시"]');assert.deepEqual(await titles(p),[T2]);
    await p.click(sec+' [data-session="1단원 3,4차시"]');assert.deepEqual(await titles(p),[T2],'마지막 하나는 해제되지 않음');
    // 한 번에 인쇄(선택 1장)
    let [pop]=await Promise.all([p.waitForEvent('popup'),p.click(sec+' .ub-print')]);await pop.waitForLoadState('domcontentloaded');
    let srcs=await pop.$$eval('.pg img',e=>e.map(x=>x.getAttribute('src').replace(/^.*materials\//,'')));
    assert.deepEqual(srcs,['daily_41_u1_34/001.jpg']);await pop.close();
    // 전체 인쇄(2장, 순서 유지)
    await p.click(sec+' [data-mode="all"]');
    [pop]=await Promise.all([p.waitForEvent('popup'),p.click(sec+' .ub-print')]);await pop.waitForLoadState('domcontentloaded');
    srcs=await pop.$$eval('.pg img',e=>e.map(x=>x.getAttribute('src').replace(/^.*materials\//,'')));
    assert.deepEqual(srcs,['daily_41_u1_12/001.jpg','daily_41_u1_34/001.jpg']);
    assert.equal(await pop.$$eval('.wm',e=>e.length),2);await pop.close();
    // 유사문제는 시험지 목록이 아니라 테스트 문제은행(testbank/, upgrade-bank-unit-test-browser-validate.js)에서 만든다
    assert.equal(await p.$$eval('#rm-upg .ub-practice',e=>e.length),0);
    await p.click(sec+' [data-mode="all"]');
    // 카드 → 시험지 열기(이름 워터마크)
    await p.click(sec+' [data-mode="all"]');
    await p.locator(sec+' .book',{hasText:T1}).click();await p.waitForTimeout(500);
    const v=await p.evaluate(()=>({title:document.getElementById('bv-name').textContent,
      imgs:[...document.querySelectorAll('#bv-stage .bv-pg img')].map(i=>({src:i.getAttribute('src'),w:i.naturalWidth})),
      wm:(document.querySelector('#bv-stage .wm3')||{}).textContent||'',acts:[...document.querySelectorAll('#bv-actions .bv-act')].map(a=>a.textContent.trim())}));
    assert.equal(v.title,T1);assert.equal(v.imgs.length,1);assert.ok(v.imgs[0].src.endsWith('materials/daily_41_u1_12/001.jpg'));assert.ok(v.imgs[0].w>=1600);
    assert.ok(v.wm.includes('이승우'));assert.ok(v.acts.some(a=>a.includes('인쇄')));
  }
  await p.context().close();
 }
 assert.deepEqual(out,{정준우:false,박선우:true,이승우:true});
 assert.deepEqual(errs,[]);
 console.log('PASS (로드맵 → 승급과정 탭) 열람 권한(목록 밖 비공개·새 권한 범위 학생 열림), 전체·단원별·회차별 선택, 한 번에 인쇄, 시험지 열기·워터마크, 오류 없음 (차단한 외부 요청 '+net+'건)');
 await b.close();host.close();
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
