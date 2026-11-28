// 승급과정 문제은행의 「4-1-1 큰수 단원테스트 12문항」: 시험지가 목록에 보이고, 12문항을 골라 초등 문제은행 유형의 유사문제를 만들고,
// 빈칸·수직선이 보이며 정답·풀이·푸는 순서·인쇄가 되는지 확인한다. 열람 권한(폴더)은 테스트에서만 연다.
const fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
require('./email-login-test-stub');
const {chromium}=require('playwright');const ROOT=path.resolve(__dirname,'..');
const T={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css','.json':'application/json'};
const SHEET='4-1-1 큰수 단원테스트 12문항';
const srv=()=>new Promise(r=>{const s=http.createServer((q,res)=>{const pn=decodeURIComponent(new URL(q.url,'http://x').pathname);const f=path.resolve(ROOT,'.'+(pn.endsWith('/')?pn+'index.html':pn));if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);res.end();return;}res.writeHead(200,{'content-type':T[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(res);}).listen(0,'127.0.0.1',()=>r(s));});
(async()=>{const h=await srv(),base='http://127.0.0.1:'+h.address().port;const b=await chromium.launch();const errs=[];const shots=process.env.SHOT_DIR;
for(const width of [1100,390]){
  const ctx=await b.newContext({viewport:{width,height:900}});const p=await ctx.newPage();p.on('pageerror',e=>errs.push(String(e)));
  const loaded=[];p.on('request',r=>{if(/elementary4\//.test(r.url()))loaded.push(r.url());});
  await p.route(/supabase\.co|\/functions\/v1|api\.github\.com|youtube\.com|ytimg/,r=>r.abort());
  await p.route('**/data.js*',async r=>{const res=await r.fetch();r.fulfill({response:res,body:(await res.text())+';(function(D){D.archiveAccess["승급과정 문제은행"]=["이승우"];var q=(D.studentAccessProfiles||{})["이승우"];if(q){q.folders=(q.folders||[]).concat(["승급과정 문제은행"]);}})(window.GFIELD_DATA);'});});
  await p.goto(base+'/index.html');await p.waitForFunction(()=>typeof enterAs==='function');
  await p.evaluate(()=>{const v=document.getElementById('video-intro');if(v)v.style.display='none';enterAs('이승우',false)});await p.waitForTimeout(800);
  await p.evaluate(()=>nav('roadmap'));await p.waitForTimeout(400);await p.click('#rm-tab-upg');await p.waitForTimeout(500);
  await p.evaluate(()=>{const d=document.getElementById('up-daily');if(d)d.open=true;});
  const sec='#rm-upg .up-bank',P=sec+' .ub-practice';
  const titles=await p.$$eval(sec+' .ub-top .book .label',e=>e.map(x=>x.textContent));
  assert.equal(titles.length,3);assert.equal(titles[2],SHEET,'단원테스트는 일일테스트 뒤');
  await p.click(sec+' [data-mode="session"]');await p.click(sec+' [data-session="단원테스트"]');await p.click(sec+' [data-session="1,2차시"]');
  await p.waitForSelector(P+' [data-src^="u1-t-"]');
  assert.equal(await p.$$eval(P+' [data-src]',e=>e.length),12,'시험지 문제 12개');
  assert.equal(loaded.length,0,'만들기 전에는 문제은행 파일을 받지 않음');
  for(let n=2;n<=12;n++)await p.click(P+' [data-src="u1-t-q'+n+'"]');
  await p.selectOption(P+' select','1');
  await p.click(P+' [data-act="make"]');await p.waitForFunction(s=>document.querySelectorAll(s+' .ub-q').length===12,P,{timeout:60000});
  const info=await p.$$eval(P+' .ub-q .ub-q-t',e=>e.map(x=>({svg:!!x.querySelector('svg.source41-number-line'),slot:x.querySelectorAll('.math-digit-slot').length,raw:/<span|&lt;span|data-source41-payload/.test(x.innerText),slotW:x.querySelector('.math-digit-slot')?x.querySelector('.math-digit-slot').getBoundingClientRect().width:0,wide:x.scrollWidth-x.clientWidth})));
  assert.ok(info[4].svg&&info[5].svg,'5·6번 수직선');assert.ok(info[2].slot>=2&&info[2].slotW>8,'3번 빈칸');assert.ok(info[3].slot>=4,'4번 빈칸');assert.ok(info.every(x=>!x.raw),'태그 글자가 보이지 않음');
  assert.equal(await p.evaluate(()=>document.querySelectorAll('#rm-upg .ub-q [data-source41-payload]').length),0,'숨은 정답 정보 제거');
  assert.equal(await p.$$eval(P+' .ub-ans',e=>e.length),0,'정답은 처음에 닫혀 있음');
  assert.ok((await p.innerText(P+' .ub-draft')).includes('황소 초등 문제은행'));
  const seed=await p.locator(P+' .ub-note',{hasText:'생성 번호'}).locator('b').innerText();
  const texts=()=>p.$$eval(P+' .ub-q-t',e=>e.map(x=>x.innerHTML));const first=await texts();
  await p.click(P+' [data-act="make"]');await p.waitForTimeout(500);assert.notDeepEqual(await texts(),first,'다시 만들면 다른 문제');
  await p.fill(P+' .ub-seed',seed);await p.click(P+' [data-act="seed"]');await p.waitForTimeout(500);assert.deepEqual(await texts(),first,'같은 번호는 같은 문제');
  await p.click(P+' [data-ans]');const ans=await p.innerText(P+' .ub-ans');assert.ok(/정답/.test(ans)&&/푸는 순서/.test(ans),ans);
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'가로 넘침 없음 '+width);
  if(shots){await p.locator(P+' .ub-q').nth(4).screenshot({path:shots+'/u1-q5-'+width+'.png'});await p.locator(P+' .ub-q').nth(3).screenshot({path:shots+'/u1-q4-'+width+'.png'});await p.locator(P+' .ub-q').first().screenshot({path:shots+'/u1-q1-'+width+'.png'});await p.locator(P+' .ub-q').nth(10).screenshot({path:shots+'/u1-q11-'+width+'.png'});}
  if(width===1100){for(const act of ['print-q','print-a']){const [pop]=await Promise.all([p.waitForEvent('popup'),p.click(P+' [data-act="'+act+'"]')]);await pop.waitForLoadState('domcontentloaded');
      assert.equal(await pop.$$eval('.q',e=>e.length),12);if(act==='print-q'){assert.equal(await pop.$$eval('svg.source41-number-line',e=>e.length),2);assert.ok(await pop.$eval('.math-digit-slot',e=>e.getBoundingClientRect().width>8));if(shots){await pop.setViewportSize({width:800,height:1100});await pop.screenshot({path:shots+'/u1-print.png',fullPage:true});}}else assert.ok((await pop.innerText('body')).includes('푸는 순서'));await pop.close();}
    // 난이도 3가지와 일일테스트 문제를 함께 골라도 만들어진다
    await p.click(P+' [data-lv="lower"]');await p.click(P+' [data-lv="higher"]');await p.click(sec+' [data-mode="all"]');await p.waitForTimeout(300);
    assert.equal(await p.$$eval(P+' [data-src]',e=>e.length),21);await p.click(P+' [data-src="u1-1-q1"]').catch(()=>{});
    await p.click(P+' [data-act="make"]');await p.waitForTimeout(1500);assert.ok(await p.$$eval(P+' .ub-q',e=>e.length)>0);}
  await ctx.close();
}
assert.deepEqual(errs,[]);await b.close();h.close();console.log('PASS 승급과정 문제은행 단원테스트 12문항: 목록·12유형 생성·빈칸·수직선·같은 번호 재생성·정답 공개·인쇄·모바일');
})().catch(e=>{console.error('FAIL',e.message);process.exit(1);});
