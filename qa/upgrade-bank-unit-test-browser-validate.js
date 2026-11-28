// 편입·승급과정: 문제은행 program 버튼 두 개, 복습 강의의 왼쪽 단원 메뉴, 시험지 목록, 테스트 문제은행(testbank/, 4학년 유사문제
// 은행과 같은 화면)의 단원·시험지·번호별 유형, 마우스 미리보기, 33개 유형 생성, 난이도, 인쇄 배치, 입장 확인, 휴대폰을 확인한다.
// 열람 권한(폴더)은 테스트에서만 연다.
const fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
require('./email-login-test-stub');
const {chromium}=require('playwright');const ROOT=path.resolve(__dirname,'..');
const T={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css','.json':'application/json','.jpg':'image/jpeg'};
const SHEETS=['초등과정 4-1 일일테스트 1단원 1,2차시','초등과정 4-1 일일테스트 1단원 3,4차시','4-1-1 큰수 단원테스트 12문항','초등과정 4-1 일일테스트 2단원 1,2차시','초등과정 4-1 일일테스트 2단원 3,4차시'];
const QTY=[4,5,12,6,6];
const OPEN=';(function(D){var F=["승급 복습강의","승급과정 문제은행","승급·편입 자료실"];F.forEach(function(f){D.archiveAccess[f]=["이승우"];});var q=(D.studentAccessProfiles||{})["이승우"];if(q){q.folders=(q.folders||[]).concat(F);}})(window.GFIELD_DATA);';
const srv=()=>new Promise(r=>{const s=http.createServer((q,res)=>{const pn=decodeURIComponent(new URL(q.url,'http://x').pathname);const f=path.resolve(ROOT,'.'+(pn.endsWith('/')?pn+'index.html':pn));if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);res.end();return;}res.writeHead(200,{'content-type':T[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(res);}).listen(0,'127.0.0.1',()=>r(s));});
(async()=>{const h=await srv(),base='http://127.0.0.1:'+h.address().port;const b=await chromium.launch();const errs=[];const shots=process.env.SHOT_DIR;
async function ctxFor(width,force){const ctx=await b.newContext({viewport:{width,height:width<600?844:950},hasTouch:width<600});
  await ctx.route(/supabase\.co|\/functions\/v1|api\.github\.com|youtube\.com|ytimg/,r=>r.abort());
  await ctx.route('**/data.js*',async r=>{const res=await r.fetch();r.fulfill({response:res,body:(await res.text())+OPEN});});
  if(force)await ctx.addInitScript(()=>{window.__GFIELD_ELEM4_FORCE__=true;});
  ctx.on('page',p=>p.on('pageerror',e=>errs.push(String(e))));return ctx;}
for(const width of [1920,1280,390]){
  const ctx=await ctxFor(width);const p=await ctx.newPage();
  await p.goto(base+'/index.html');await p.waitForFunction(()=>typeof enterAs==='function');
  await p.evaluate(()=>{const v=document.getElementById('video-intro');if(v)v.style.display='none';enterAs('이승우',false)});await p.waitForTimeout(800);
  await p.evaluate(()=>nav('roadmap'));await p.waitForTimeout(400);await p.click('#rm-tab-upg');await p.waitForTimeout(600);
  const noOverflow=async(pg,w)=>assert.ok(await pg.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'가로 넘침 '+w+' '+width);
  const box=async s=>p.$eval(s,e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height};});
  // ---- 복습 강의: 왼쪽 단원 메뉴
  assert.deepEqual(await p.$$eval('#rm-upg .up-ubtn b',e=>e.map(x=>x.textContent)),['1단원','2단원']);
  const rows=()=>p.$$eval('#rm-upg .up-lecwrap .up-row',e=>e.filter(x=>x.offsetParent).map(x=>x.querySelector('.label').textContent));
  const one=await rows();assert.ok(one.length>=3&&one.every(t=>/4-1-1/.test(t)),'1단원 강의만 '+one);
  await p.click('#rm-upg .up-ubtn[data-lecunit="2"]');const two=await rows();assert.ok(two.length>=1&&two.every(t=>/4-1-2/.test(t)),'2단원 강의만 '+two);
  const nv=await box('#rm-upg .up-unav'),pv=await box('#rm-upg .up-lecwrap .up-rows:not([hidden])');
  if(width>600)assert.ok(nv.x+nv.w<=pv.x,'PC는 단원 메뉴가 왼쪽');else assert.ok(nv.y+nv.h<=pv.y,'휴대폰은 단원 메뉴가 위');
  if(shots)await p.locator('#rm-upg .up-sec').first().screenshot({path:shots+'/lec-'+width+'.png'});
  // ---- 문제은행 program
  assert.equal(await p.innerText('#rm-upg .up-program .up-h'),'문제은행 program');
  assert.deepEqual(await p.$$eval('#rm-upg .up-pbtn b',e=>e.map(x=>x.textContent)),['테스트 문제은행','4학년 유사문제 은행']);
  assert.deepEqual(await p.$$eval('#rm-upg a.up-pbtn',e=>e.map(x=>x.getAttribute('href'))),['testbank/index.html','elementary4/index.html']);
  for(const s of ['#rm-upg [data-testbank]','#rm-upg a.up-pbtn.t2'])assert.ok((await box(s)).h>=90,'큰 버튼');
  assert.ok(!(await p.innerText('#rm-upg')).includes('유사문제 학습'));assert.equal(await p.$$eval('.ub-practice,.ub-prac,.tb',e=>e.length),0,'예전 선택 화면 없음');
  await noOverflow(p,'program');
  if(shots)await p.locator('#rm-upg .up-program').screenshot({path:shots+'/program-'+width+'.png'});
  assert.equal((await p.innerText('#up-daily>summary')).trim(),'일일테스트·단원테스트 복습','복습 칸은 이름만');
  await p.evaluate(()=>{const d=document.getElementById('up-daily');if(d)d.open=true;});await p.waitForTimeout(500);
  assert.deepEqual(await p.$$eval('#rm-upg .ub-top .book .label',e=>e.map(x=>x.textContent)),SHEETS,'시험지 목록 순서');
  assert.deepEqual(await p.$$eval('#rm-upg .ub-top .book .pages',e=>e.map(x=>x.textContent)),QTY.map(n=>'시험지 · '+n+'문항'));
  // ---- 테스트 문제은행: 버튼을 누르면 새 탭
  const [t]=await Promise.all([ctx.waitForEvent('page'),p.click('#rm-upg [data-testbank]')]);
  await t.waitForSelector('#typeList .tree-unit-toggle',{timeout:60000});
  // 처음에는 모든 단원이 닫혀 있고, 화살표(단원 줄)를 눌러야 유형이 열린다
  const shown=()=>t.$$eval('.tree-type',e=>e.filter(x=>x.offsetParent).length);
  const openFlags=()=>t.$$eval('.tree-unit-toggle',e=>e.map(x=>x.getAttribute('aria-expanded')));
  assert.deepEqual(await openFlags(),['false','false']);assert.equal(await shown(),0,'처음에는 유형이 안 보임');
  if(shots)await t.screenshot({path:shots+'/tb-closed-'+width+'.png'});
  await t.click('.tree-unit-toggle >> nth=1');assert.deepEqual(await openFlags(),['false','true']);assert.equal(await shown(),12,'2단원만 열림');
  await t.click('.tree-unit-toggle >> nth=1');assert.equal(await shown(),0,'다시 누르면 닫힘');
  await t.fill('#typeSearchInput','시계');assert.ok(await shown()>=2,'검색하면 바로 보임');await t.fill('#typeSearchInput','');assert.equal(await shown(),0,'검색을 지우면 다시 닫힘');
  await t.selectOption('#unitFilter','tb-u1');assert.equal(await shown(),21,'대단원을 고르면 열림');await t.selectOption('#unitFilter','');
  await t.click('.tree-unit-toggle >> nth=1');assert.equal(await shown(),33);
  assert.equal(await t.innerText('.topbar-brand h1'),'테스트 문제은행');
  assert.deepEqual(await t.$$eval('.tree-unit-toggle',e=>e.map(x=>x.querySelector('.tree-unit-number').textContent+' '+x.querySelector('strong').textContent)),['1 큰 수','2 각도']);
  assert.deepEqual(await t.$$eval('.tree-subunit-head',e=>e.map(x=>x.innerText.replace(/\s+/g,' ').trim())),['시험지 01 '+SHEETS[0],'시험지 02 '+SHEETS[1],'시험지 03 '+SHEETS[2],'시험지 01 '+SHEETS[3],'시험지 02 '+SHEETS[4]]);
  const numbers=await t.$$eval('.tree-subunit',e=>e.map(s=>[...s.querySelectorAll('.tree-type-number')].map(x=>Number(x.textContent))));
  assert.deepEqual(numbers,QTY.map(n=>Array.from({length:n},(_,i)=>i+1)),'번호는 시험지 번호');
  assert.match(await t.innerText('[data-preview-type-id="u2-12-q4"] .tree-type-copy'),/삼각형을 돌린 각[\s\S]*2단원 1,2차시 · 4번 문제/);
  assert.ok(!/심화|원문/.test(await t.innerText('#typeList')));
  assert.equal(await t.inputValue('#studentNameInput'),width===390?await t.inputValue('#studentNameInput'):await t.inputValue('#studentNameInput'));
  assert.ok((await t.inputValue('#studentNameInput')).length>0,'이름');
  await noOverflow(t,'bank');
  if(shots)await t.screenshot({path:shots+'/tb-list-'+width+'.png'});
  if(width>=900){
    // 마우스를 올리면 33개 유형 모두 예시가 뜨고, 벗어나면 사라진다. 화면 밖으로 나가지 않는다.
    const ids=await t.$$eval('.tree-type',e=>e.map(x=>x.dataset.previewTypeId));assert.equal(ids.length,33);
    for(const id of ids){const row=t.locator('[data-preview-type-id="'+id+'"]');await row.scrollIntoViewIfNeeded();await t.mouse.move(2,2);await row.locator('.tree-type-copy').hover();
      await t.waitForSelector('.tb-hover:not([hidden]) .question-prompt',{timeout:30000});
      const c=await t.$eval('.tb-hover',e=>{const r=e.getBoundingClientRect(),q=e.querySelector('.question-prompt');return{l:r.left,t:r.top,r:r.right,b:r.bottom,W:innerWidth,H:innerHeight,len:q.innerText.trim().length,raw:/<span|<svg|data-source41/.test(q.innerText),name:e.querySelector('header b').textContent};});
      assert.ok(c.l>=0&&c.t>=0&&c.r<=c.W&&c.b<=c.H&&c.len>5&&!c.raw,id+' '+JSON.stringify(c));
      assert.equal(c.name,await row.locator('.tree-type-copy strong').innerText(),id);}
    if(shots){const row=t.locator('[data-preview-type-id="u2-12-q4"]');await row.scrollIntoViewIfNeeded();await t.mouse.move(2,2);await row.locator('.tree-type-copy').hover();await t.waitForTimeout(500);await t.screenshot({path:shots+'/tb-hover-'+width+'.png'});}
    await t.mouse.move(2,2);await t.waitForTimeout(250);assert.equal(await t.isHidden('.tb-hover'),true);
  } else {
    await t.locator('[data-preview-type-id="u2-34-q5"] .tree-type-copy').tap();await t.waitForSelector('#typePreviewPopover:not([hidden]) svg');
    assert.equal(await t.$$eval('.tb-hover:not([hidden])',e=>e.length),0,'휴대폰은 눌러서 미리보기');
    await t.locator('[data-close-type-preview]').tap();
  }
  // 33개 유형을 모두 골라 세 난이도로 만들고 인쇄 배치를 확인한다
  for(const box2 of await t.$$('#typeList input[data-type-id]'))await box2.evaluate(e=>{if(!document.querySelector('input[data-type-id="'+e.dataset.typeId+'"]').checked)document.querySelector('input[data-type-id="'+e.dataset.typeId+'"]').click();});
  await t.fill('#questionCountInput','33');
  assert.match(await t.innerText('#selectedTypeCount'),/^33/);assert.match(await t.innerText('#selectedQuestionCount'),/^33/);
  for(const [d,label] of [['-1','낮춰서'],['0','같은 수준'],['1','높여서']]){
    if(await t.isHidden('#worksheet')){}else await t.click('#backButton');
    await t.click('#difficultyFilter [data-difficulty="'+d+'"]');await t.click('#generateButton');await t.waitForSelector('#worksheet:not([hidden]) .question-item',{timeout:90000});
    assert.equal(await t.$$eval('#problemView .question-item',e=>e.length),33,label);
    assert.match(await t.innerText('#worksheetMeta'),new RegExp('테스트 문제은행 · '+label+' · 33문항 · 33개 유형'));
    assert.equal(await t.$$eval('#solutionView .solution-item',e=>e.length),33);
    assert.ok(!/undefined|NaN|\[object/.test(await t.$eval('#solutionView',e=>e.textContent)));
    if(width===1280){
      for(const mode of ['problem','solution']){
        await t.emulateMedia({media:'print'});await t.evaluate(m=>{document.body.dataset.printMode=m;document.getElementById('problemView').hidden=m!=='problem';document.getElementById('solutionView').hidden=m!=='solution';},mode);
        await t.setViewportSize({width:794,height:1123});await t.waitForTimeout(500);
        const bad=await t.$$eval(mode==='problem'?'#problemView .question-item':'#solutionView .solution-item',e=>e.map(x=>{const r=x.getBoundingClientRect(),pg=x.closest('.print-page').getBoundingClientRect();const kids=[...x.querySelectorAll('svg,.question-prompt,p')].map(k=>k.getBoundingClientRect()).filter(k=>k.width);return{n:x.querySelector('header b').textContent,out:Math.max(0,...kids.map(k=>Math.max(k.bottom-r.bottom,k.right-r.right)),r.bottom-pg.bottom,r.right-pg.right)};}).filter(x=>x.out>3));
        assert.deepEqual(bad,[],label+' 인쇄 넘침 '+mode);
        if(shots&&d==='0'&&mode==='problem')await t.screenshot({path:shots+'/tb-print.png',fullPage:true});
        await t.emulateMedia({media:'screen'});await t.evaluate(()=>{delete document.body.dataset.printMode;document.getElementById('problemView').hidden=false;document.getElementById('solutionView').hidden=true;});
        await t.setViewportSize({width:1280,height:950});
      }
    }
    await noOverflow(t,'sheet '+label);
  }
  const first=await t.$eval('#problemView',e=>e.innerHTML);await t.click('#newProblemButton');await t.waitForTimeout(1500);assert.notEqual(await t.$eval('#problemView',e=>e.innerHTML),first,'새 문제');
  await t.click('#solutionTab');await t.waitForTimeout(300);assert.ok((await t.innerText('#solutionView')).includes('푸는 순서'));
  if(shots)await t.screenshot({path:shots+'/tb-solution-'+width+'.png'});
  await ctx.close();
}
// 4학년 유사문제 은행은 이름이 그대로다
{const ctx=await ctxFor(1280);const p=await ctx.newPage();await p.goto(base+'/elementary4/index.html');await p.waitForSelector('#typeList .tree-type',{timeout:60000});
 assert.equal(await p.getAttribute('.tree-unit-toggle','aria-expanded'),'true','4학년 은행은 전처럼 열린 채 시작');
 assert.deepEqual(await p.$$eval('#difficultyFilter button',e=>e.map(x=>x.textContent)),['심화 쉬움','심화 기준','심화 어려움']);
 assert.match(await p.innerText('#typeList'),/원문 [\s\S]*4학년 1학기 · 심화 기준/);assert.match(await p.innerText('.tree-subunit-head'),/소단원 01/);await ctx.close();}
// 입장 확인: 승급과정 문제은행 권한이 있는 학생만
for(const [name,ok] of [['이승우',true],['정준우',false],['',false]]){
 const ctx=await ctxFor(1280,true);await ctx.addInitScript(n=>{if(n){try{localStorage.setItem('gfield_student',n);}catch(e){}}},name);
 const p=await ctx.newPage();await p.goto(base+'/testbank/index.html');await p.waitForTimeout(2500);
 const state=await p.evaluate(()=>({pending:document.documentElement.classList.contains('elem4-pending'),msg:(document.getElementById('elem4Msg')||{}).textContent,name:(document.getElementById('studentNameInput')||{}).value}));
 assert.equal(state.pending,!ok,name+' '+JSON.stringify(state));if(ok)assert.equal(state.name,'이승우');else assert.ok(state.msg.includes(name?'승급과정 문제은행 권한':'로그인'),state.msg);
 await ctx.close();}
assert.deepEqual(errs,[]);await b.close();h.close();console.log('PASS 문제은행 program·테스트 문제은행(33유형 미리보기·생성·인쇄 배치·입장 확인)·강의 단원 메뉴·4학년 은행 그대로');
})().catch(e=>{console.error('FAIL',e.stack.split('\n').slice(0,5).join('\n'));process.exit(1);});
