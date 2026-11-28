// 자료실에서 교재 파일 없이 링크만 있는 자료를 열면 화면 가운데에 큰 링크 단추가 보이고,
// 위쪽 단추와 같은 주소로 새 창에서 열리는지 PC·휴대폰에서 확인한다. 파일이 있거나 링크도 없는 자료는 그대로다.
const fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
require('./email-login-test-stub');
const {chromium}=require('playwright');const ROOT=path.resolve(__dirname,'..');
const T={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css','.json':'application/json','.jpg':'image/jpeg'};
const srv=()=>new Promise(r=>{const s=http.createServer((q,res)=>{const pn=decodeURIComponent(new URL(q.url,'http://x').pathname);const f=path.resolve(ROOT,'.'+(pn.endsWith('/')?pn+'index.html':pn));if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);res.end();return;}res.writeHead(200,{'content-type':T[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(res);}).listen(0,'127.0.0.1',()=>r(s));});
(async()=>{const h=await srv(),base='http://127.0.0.1:'+h.address().port;const b=await chromium.launch();const errs=[];const shots=process.env.SHOT_DIR;
for(const [w,hh] of [[1920,1000],[390,740]]){
  const ctx=await b.newContext({viewport:{width:w,height:hh}});const p=await ctx.newPage();p.on('pageerror',e=>errs.push(String(e)));
  await ctx.route(/supabase\.co|\/functions\/v1|api\.github\.com|youtube\.com|ytimg|naver\.me|drive\.google/,r=>r.abort());
  await p.goto(base+'/index.html');await p.waitForFunction(()=>typeof enterAs==='function');
  await p.evaluate(()=>{const v=document.getElementById('video-intro');if(v)v.style.display='none';enterAs('이승우',false)});await p.waitForTimeout(800);
  const open=spec=>p.evaluate(s=>openBook(s),spec);
  const real=await p.evaluate(()=>GFIELD_DATA.books.find(x=>x.title==='4-1 1단원 큰수 난이도별 연습'));
  assert.ok(real&&real.links.length===1);
  await open(real);await p.waitForTimeout(300);
  const info=await p.evaluate(()=>{const a=document.querySelector('#bv-stage .bv-ext.links a.go'),top=document.querySelector('#bv-actions a.bv-act'),r=a.getBoundingClientRect(),st=document.getElementById('bv-stage').getBoundingClientRect();return{href:a.getAttribute('href'),top:top.getAttribute('href'),target:a.target,rel:a.rel,w:r.width,h:r.height,cx:(r.left+r.right)/2-(st.left+st.right)/2,inside:r.left>=st.left&&r.right<=st.right&&r.bottom<=st.bottom,text:document.getElementById('bv-stage').innerText};});
  assert.equal(info.href,real.links[0].url);assert.equal(info.top,info.href);assert.equal(info.target,'_blank');assert.equal(info.rel,'noopener');
  assert.ok(info.h>=88&&info.w>=Math.min(520,w-40)&&Math.abs(info.cx)<3&&info.inside,JSON.stringify(info));
  assert.ok(info.text.includes('아래 버튼을 눌러 자료를 열어 주세요')&&info.text.includes(real.links[0].label)&&!info.text.includes('교재 파일이 없습니다'));
  if(shots)await p.screenshot({path:shots+'/link-'+w+'.png'});
  const [pop]=await Promise.all([ctx.waitForEvent('page'),p.click('#bv-stage .bv-ext.links a.go')]);await pop.close();
  // 링크가 여러 개면 모두 큰 단추로, 넘치면 스크롤
  await open({title:'QA 링크 여러 개',folder:'x',links:[1,2,3,4,5].map(i=>({label:'QA 아주 긴 이름의 학습 자료 링크 '+i+'번',url:'https://example.com/'+i}))});await p.waitForTimeout(300);
  assert.equal(await p.$$eval('#bv-stage .bv-ext.links a.go',e=>e.length),5);
  const reach=await p.evaluate(()=>{const box=document.querySelector('#bv-stage .bv-ext.links'),a=[...box.querySelectorAll('a.go')];a[0].scrollIntoView({block:'nearest'});const first=a[0].getBoundingClientRect().top>=box.getBoundingClientRect().top-1;a[4].scrollIntoView({block:'nearest'});return{first,last:a[4].getBoundingClientRect().bottom<=box.getBoundingClientRect().bottom+8,wide:box.scrollWidth<=box.clientWidth+1};});
  assert.deepEqual(reach,{first:true,last:true,wide:true});
  // 파일도 링크도 없으면 전과 같은 안내, 파일이 있으면 큰 단추 없음
  await open({title:'QA 빈 자료',folder:'x'});await p.waitForTimeout(200);assert.ok((await p.innerText('#bv-stage')).includes('교재 파일이 없습니다'));
  await open({title:'QA 파일 자료',folder:'x',imgdir:'daily_41_u1_12',pages:1,links:[{label:'답안',url:'https://example.com/a'}]});await p.waitForTimeout(300);
  assert.equal(await p.$$eval('#bv-stage .bv-ext',e=>e.length),0);assert.equal(await p.$$eval('#bv-actions a.bv-act',e=>e.length),1);
  await ctx.close();
}
assert.deepEqual(errs,[]);await b.close();h.close();console.log('PASS 링크만 있는 자료: 가운데 큰 단추(PC·휴대폰), 같은 주소·새 창, 여러 링크, 다른 자료는 그대로');
})().catch(e=>{console.error('FAIL',e.message);process.exit(1);});
