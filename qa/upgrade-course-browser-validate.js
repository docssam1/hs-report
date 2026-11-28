'use strict';
// 로드맵 → 승급과정 탭: 세 영역(복습용 강의 · Test 문제은행 · 승급·편입 자료실), 양면 책넘김 뷰어, 자료실 안내, 어드민 체크 하나로 세 폴더.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
require('./email-login-test-stub');
const {chromium}=require(process.env.GFIELD_QA_PLAYWRIGHT||'playwright');
const ROOT=path.resolve(__dirname,'..');
const TYPES={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.json':'application/json','.jpg':'image/jpeg','.png':'image/png','.css':'text/css','.svg':'image/svg+xml','.mp3':'audio/mpeg','.pdf':'application/pdf'};
function server(){return new Promise(resolve=>{const s=http.createServer((q,r)=>{const pn=decodeURIComponent(new URL(q.url,'http://127.0.0.1').pathname);const f=path.resolve(ROOT,'.'+(pn.endsWith('/')?pn+'index.html':pn));
  if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);r.end();return;}r.writeHead(200,{'content-type':TYPES[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);}).listen(0,'127.0.0.1',()=>resolve(s));});}
// 테스트에서만 쓰는 자료: 이승우(2월 과정 학생)·김다인(온라인)에게 세 폴더를 열고, 복습강의·자료실 교재를 하나씩 넣는다.
const INJECT=';(function(D){var F=["승급 복습강의","승급과정 문제은행","승급·편입 자료실"];F.forEach(function(f){if(D.archiveFolders.indexOf(f)<0)D.archiveFolders.push(f);D.archiveAccess[f]=["이승우","QA온라인"];});'+
  'if(D.students.indexOf("QA온라인")<0)D.students.push("QA온라인");D.studentTypes["QA온라인"]="online";'+
  'Object.keys(D.studentAccessProfiles||{}).forEach(function(n){var p=D.studentAccessProfiles[n];if(p&&p.folders)p.folders=p.folders.filter(function(f){return F.indexOf(f)<0;});});'+
  'D.books.push({folder:"승급 복습강의",course:"4-1 Level Up 심화",title:"QA 복습 1강",imgdir:"daily_41_u1_12",pages:1,video:"https://www.youtube.com/watch?v=jYu8jXkawrA",pdf:"materials/x.pdf"});'+
  'D.books.push({folder:"승급 복습강의",course:"4-2 Level Up 심화",title:"QA 복습 4-2",imgdir:"daily_41_u1_34",pages:1,video:"https://www.youtube.com/watch?v=jYu8jXkawrA",pdf:"materials/x.pdf"});'+
  'D.books.push({folder:"승급·편입 자료실",title:"QA 편입 교재",imgdir:"top-secret-finish-2",pages:7,pdf:"materials/x.pdf"});})(window.GFIELD_DATA);';
(async()=>{
  const host=await server();const base='http://127.0.0.1:'+host.address().port;
  const b=await chromium.launch({headless:true,executablePath:process.env.GFIELD_QA_BROWSER_EXECUTABLE||undefined});
  const errs=[];let net=0;
  async function page(viewport){const ctx=await b.newContext({viewport});const p=await ctx.newPage();p.on('pageerror',e=>errs.push(String(e)));
    await p.route(/supabase\.co|\/functions\/v1|api\.github\.com|youtube\.com|ytimg/,r=>{net++;r.abort()});
    await p.route('**/data.js*',async r=>{const res=await r.fetch();r.fulfill({response:res,body:(await res.text())+INJECT});});return p;}
  async function login(p,name){await p.goto(base+'/index.html');await p.waitForFunction(()=>typeof enterAs==='function');
    await p.evaluate(n=>{const v=document.getElementById('video-intro');if(v)v.style.display='none';enterAs(n,false)},name);await p.waitForTimeout(600);}
  const out={};
  // 1) 목록 밖 학생: 탭이 보이지 않고 자료실에도 승급 폴더가 없다
  {const p=await page({width:1280,height:900});await login(p,'정준우');await p.evaluate(()=>nav('roadmap'));
    out.outsiderTab=await p.isVisible('#rm-tab-upg');await p.evaluate(()=>nav('archive'));
    out.outsiderArchive=/승급/.test(await p.innerText('#archive-list'));await p.context().close();}
  // 2) 이승우(2월 과정 학생): 로드맵은 2월 탭으로 열리고, 승급과정 탭을 누르면 세 영역
  {const p=await page({width:1400,height:900});await login(p,'이승우');
    await p.evaluate(()=>nav('archive'));const arc=await p.innerText('#archive-list');
    out.archivePointer=arc.includes('로드맵 → 편입·승급과정')&&!/📚 승급/.test(arc);
    await p.click('#archive-list [data-go-upg]');await p.waitForTimeout(400);
    out.pointerOpens=await p.isVisible('#rm-upg .up-sec');
    await p.click('#rm-tab-nov');out.novBack=await p.isVisible('#timeline')&&!(await p.isVisible('#rm-upg'));
    await p.click('#rm-tab-upg');await p.waitForTimeout(300);await p.evaluate(()=>{const d=document.getElementById('up-daily');if(d)d.open=true;});
    out.sections=await p.$$eval('#rm-upg .up-h',e=>e.map(x=>x.textContent));
    out.courses=await p.$$eval('#rm-upg .up-course',e=>e.map(x=>x.textContent));
    out.bankDrawn=await p.isVisible('#rm-upg .up-bank .ub-top .book');
    // 복습강의: 교재+영상이 나란히 열린다
    // 강의는 왼쪽 단원 메뉴 아래에 묶인다: 그 강의가 든 단원을 먼저 고른다
    await p.evaluate(()=>{const row=[...document.querySelectorAll('#rm-upg .up-row')].find(x=>x.textContent.includes('QA 복습 1강'));const panel=row.closest('[data-lecpanel]');if(panel.hidden)document.querySelector('#rm-upg [data-lecunit="'+panel.dataset.lecpanel+'"][data-course="'+panel.dataset.course+'"]').click();});
    await p.locator('#rm-upg .book',{hasText:'QA 복습 1강'}).click();await p.waitForTimeout(300);
    out.lecture=await p.evaluate(()=>({split:document.getElementById('bv-stage').classList.contains('split'),img:!!document.querySelector('#bv-stage .bv-pg img')}));
    await p.evaluate(()=>closeBook());
    // 책넘김: 넓은 화면은 표지 한 쪽 → 2–3 → 4–5, 뒤로 넘기기, 워터마크, 키보드
    await p.locator('#rm-upg .book',{hasText:'QA 편입 교재'}).click();await p.waitForTimeout(400);
    const pg=()=>p.innerText('.ufb .ufb-pg');
    out.flip=[await pg()];
    out.cover=await p.$$eval('.ufb-book > .ufb-p',e=>e.map(x=>x.classList.contains('blank')?'blank':x.querySelector('img').getAttribute('src').split('/').pop()));
    await p.click('.ufb [data-act="next"]');out.leaf=await p.isVisible('.ufb-leaf');await p.waitForTimeout(950);out.flip.push(await pg());
    await p.keyboard.press('ArrowRight');await p.waitForTimeout(950);out.flip.push(await pg());
    await p.keyboard.press('ArrowLeft');await p.waitForTimeout(950);out.flip.push(await pg());
    out.spreadImgs=await p.$$eval('.ufb-book > .ufb-p img',e=>e.map(x=>x.getAttribute('src').split('/').pop()));
    out.wm=await p.$eval('.ufb-book .ufb-wm',e=>e.textContent);
    await p.screenshot({path:path.join(process.env.GFIELD_QA_SHOTS||'/tmp','upgrade-course-flip.png')});
    out.fitDesk=await p.evaluate(()=>{const s=document.querySelector('.ufb-stage').getBoundingClientRect();return [...document.querySelectorAll('.ufb-book > .ufb-p')].every(x=>{const r=x.getBoundingClientRect();return r.left>=s.left-1&&r.right<=s.right+1&&r.top>=s.top-1&&r.bottom<=s.bottom+1;});});
    out.loaded=await p.$$eval('.ufb-book > .ufb-p img',e=>e.every(x=>x.complete&&x.naturalWidth>0));
    const [pop]=await Promise.all([p.waitForEvent('popup'),p.click('.ufb [data-act="print"]')]);await pop.waitForLoadState('domcontentloaded');
    out.print={pages:await pop.$$eval('.pg img',e=>e.length),wm:await pop.$$eval('.wm',e=>e.length)};await pop.close();
    await p.keyboard.press('Escape');out.closed=!(await p.isVisible('.ufb'));
    await p.screenshot({path:path.join(process.env.GFIELD_QA_SHOTS||'/tmp','upgrade-course-desktop.png'),fullPage:false});
    await p.context().close();}
  // 3) 온라인 학생(2월 과정 아님): 숨겨지던 로드맵 메뉴가 보이고, 첫 로드맵 화면이 승급과정 탭
  {const p=await page({width:390,height:844});await login(p,'QA온라인');
    out.onlineNav=await p.isVisible('.nav-btn[data-v="roadmap"]');
    await p.evaluate(()=>nav('roadmap'));await p.waitForTimeout(300);
    out.onlineLanding=await p.getAttribute('#rm-tab-upg','aria-selected');
    out.mobileOverflow=await p.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1);
    await p.locator('#rm-upg .book',{hasText:'QA 편입 교재'}).click();await p.waitForTimeout(400);
    out.mobileFlip=[await p.innerText('.ufb .ufb-pg'),await p.$$eval('.ufb-book > .ufb-p',e=>e.length)];
    out.fitMobile=await p.evaluate(()=>{const s=document.querySelector('.ufb-stage').getBoundingClientRect();const r=document.querySelector('.ufb-book > .ufb-p').getBoundingClientRect();return r.left>=s.left-1&&r.right<=s.right+1&&r.top>=s.top-1&&r.bottom<=s.bottom+1;});
    await p.click('.ufb [data-act="next"]');await p.waitForTimeout(300);out.mobileFlip.push(await p.innerText('.ufb .ufb-pg'));
    await p.screenshot({path:path.join(process.env.GFIELD_QA_SHOTS||'/tmp','upgrade-course-mobile.png')});
    await p.context().close();}
  // 4) 어드민: 체크 하나로 세 폴더가 함께 바뀌고, 복습강의 교재에는 '과정' 칸
  {const p=await page({width:1400,height:900});await p.goto(base+'/admin.html');await p.waitForTimeout(1500);
    out.admin=await p.evaluate(()=>{const F=['승급 복습강의','승급과정 문제은행','승급·편입 자료실'];const n='정준우';
      const on=()=>F.map(f=>accessOn('folders',f,n,(S.archiveAccess[f]||[]).includes(n)));const a=on();upgToggle(n);const b2=on();upgToggle(n);const c=on();
      const i=S.books.findIndex(x=>x.folder==='승급 복습강의');renderBooks();
      const field=i>=0&&/과정/.test(document.querySelectorAll('#book-items .content-week')[i].innerText);
      return {a,b:b2,c,field};});
    await p.context().close();}
  console.log(JSON.stringify(out));
  assert.equal(out.outsiderTab,false);assert.equal(out.outsiderArchive,false);
  assert.ok(out.archivePointer&&out.pointerOpens&&out.novBack);
  assert.deepEqual(out.sections,['복습용 강의','문제은행 program','승급·편입 자료실']);
  assert.deepEqual(out.courses.map(c=>c.toLowerCase()),['4-1 level up 심화','4-2 level up 심화'],'과정 이름은 대소문자가 달라도 한 묶음');
  assert.ok(out.bankDrawn);assert.deepEqual(out.lecture,{split:true,img:true});
  assert.deepEqual(out.flip,['1 / 7쪽','2–3 / 7쪽','4–5 / 7쪽','2–3 / 7쪽']);
  assert.deepEqual(out.cover,['blank','001.jpg']);assert.ok(out.leaf,'넘기는 동안 종이가 보인다');
  assert.deepEqual(out.spreadImgs,['002.jpg','003.jpg']);assert.ok(out.wm.includes('이승우'));assert.ok(out.loaded);
  assert.deepEqual(out.print,{pages:7,wm:7});assert.ok(out.closed);
  assert.ok(out.onlineNav);assert.equal(out.onlineLanding,'true');assert.equal(out.mobileOverflow,false);
  assert.deepEqual(out.mobileFlip,['1 / 7쪽',1,'2 / 7쪽']);
  assert.equal(out.admin.a.every(x=>!x),true);assert.equal(out.admin.b.every(Boolean),true);assert.equal(out.admin.c.every(x=>!x),true);
  assert.ok(out.fitDesk,'넓은 화면: 두 쪽이 화면 안에');assert.ok(out.fitMobile,'좁은 화면: 한 쪽이 화면 안에');
  assert.deepEqual(errs,[]);
  console.log('PASS 승급과정 탭: 권한, 세 영역, 과정 묶음, 문제은행, 강의 분할 보기, 양면 책넘김(표지·넘김·되돌림·워터마크·인쇄), 모바일 한 쪽 보기, 온라인 학생 메뉴, 자료실 안내, 어드민 세 폴더 동시 체크 (차단한 외부 요청 '+net+'건)');
  await b.close();host.close();
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
