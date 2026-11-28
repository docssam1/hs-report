// 어드민 교재의 파일 첨부(ZIP 등): 올리기 → 링크 버튼(내려받기) 자동 추가 → 학생 화면의 큰 단추로 원래 이름 그대로 받기.
// GitHub 호출은 모두 가짜 응답이다(실제 업로드 없음).
const fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
require('./email-login-test-stub');
const {chromium}=require('playwright');const ROOT=path.resolve(__dirname,'..');
const T={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css','.json':'application/json','.zip':'application/zip'};
const ZIP=Buffer.from('504b0506000000000000000000000000000000000000','hex');   // 빈 ZIP
const uploaded=new Map();
const srv=()=>new Promise(r=>{const s=http.createServer((q,res)=>{const pn=decodeURIComponent(new URL(q.url,'http://x').pathname);if(uploaded.has(pn.slice(1))){res.writeHead(200,{'content-type':'application/zip'});res.end(uploaded.get(pn.slice(1)));return;}const f=path.resolve(ROOT,'.'+(pn.endsWith('/')?pn+'index.html':pn));if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);res.end();return;}res.writeHead(200,{'content-type':T[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(res);}).listen(0,'127.0.0.1',()=>r(s));});
(async()=>{const h=await srv(),base='http://127.0.0.1:'+h.address().port;const b=await chromium.launch();const errs=[];const puts=[];let mode='ok';
const ctx=await b.newContext({viewport:{width:1400,height:900},acceptDownloads:true});
await ctx.route(/supabase\.co|\/functions\/v1|youtube\.com|ytimg/,r=>r.abort());
await ctx.route(/api\.github\.com/,async r=>{const q=r.request();if(q.method()!=='PUT')return r.fulfill({status:404,body:'{}'});const p=decodeURIComponent(q.url().split('/contents/')[1]);if(mode==='perm')return r.fulfill({status:403,contentType:'application/json',body:'{"message":"no"}'});const body=JSON.parse(q.postData());puts.push({path:p,size:Buffer.from(body.content,'base64').length});uploaded.set(p,Buffer.from(body.content,'base64'));r.fulfill({status:201,contentType:'application/json',body:JSON.stringify({content:{download_url:'https://raw.githubusercontent.com/docssam1/hs-report/main/'+p}})});});
await ctx.addInitScript(()=>{try{localStorage.setItem('gfield_gh_token','test-token-not-real');}catch(e){}});
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(String(e)));
await p.goto(base+'/admin.html');await p.waitForTimeout(1500);
const idx=await p.evaluate(()=>{renderAll();tab('archive');addBook();const i=S.books.length-1;S.books[i].folder='승급·편입 자료실';renderBooks();return i;});
const input=()=>p.locator('#book-items input.book-file').nth(idx);
const toastText=()=>p.innerText('#toast');
const links=()=>p.evaluate(i=>JSON.parse(JSON.stringify(S.books[i].links||[])),idx);
// 형식·크기 검사: 올리지 않는다
await input().setInputFiles({name:'a.exe',mimeType:'application/octet-stream',buffer:ZIP});await p.waitForTimeout(200);assert.match(await toastText(),/올릴 수 없는 형식/);
await input().setInputFiles({name:'큰파일.zip',mimeType:'application/zip',buffer:Buffer.alloc(25*1024*1024+1)});await p.waitForTimeout(600);assert.match(await toastText(),/25MB보다 큰 파일/);
assert.equal(puts.length,0);assert.deepEqual(await links(),[]);
// 권한 오류: 링크를 만들지 않는다
mode='perm';await input().setInputFiles({name:'a.zip',mimeType:'application/zip',buffer:ZIP});await p.waitForTimeout(600);assert.match(await toastText(),/토큰 권한/);assert.deepEqual(await links(),[]);mode='ok';
// 여러 파일
await input().setInputFiles([{name:'4-1 2단원 난이도별 연습.zip',mimeType:'application/zip',buffer:ZIP},{name:'answer.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF-1.4')}]);
await p.waitForTimeout(900);
const L=await links();assert.equal(L.length,2);assert.equal(L[0].label,'4-1 2단원 난이도별 연습.zip');assert.equal(L[0].download,L[0].label);
assert.match(L[0].url,/^books\/files\/\d+_[a-z0-9]+_[\w.\-]+\.zip$/);assert.equal(puts.length,2);assert.equal(puts[0].size,ZIP.length);
assert.equal(await p.evaluate(i=>S.books[i].title,idx),'4-1 2단원 난이도별 연습');
assert.match(await toastText(),/GitHub에 저장/);
assert.ok((await p.innerText('#save-status')).includes('저장되지 않은'));
const book=await p.evaluate(i=>JSON.parse(JSON.stringify(S.books[i])),idx);
// 학생 화면: 큰 단추로 받으면 원래 파일 이름
const s=await ctx.newPage();s.on('pageerror',e=>errs.push(String(e)));await s.goto(base+'/index.html');await s.waitForFunction(()=>typeof enterAs==='function');
await s.evaluate(()=>{const v=document.getElementById('video-intro');if(v)v.style.display='none';enterAs('이승우',false)});await s.waitForTimeout(800);
const one={...book,links:[book.links[0]]};
assert.equal(await s.evaluate(x=>isDirectLinkBook(x),one),false,'내려받는 파일은 바로 새 창으로 열지 않음');
await s.evaluate(x=>openBook(x),one);await s.waitForTimeout(300);
assert.match(await s.innerText('#bv-stage'),/4-1 2단원 난이도별 연습\.zip[\s\S]*내려받기/);
const [dl]=await Promise.all([s.waitForEvent('download'),s.click('#bv-stage .bv-ext.links a.go')]);
assert.equal(dl.suggestedFilename(),'4-1 2단원 난이도별 연습.zip');assert.deepEqual(fs.readFileSync(await dl.path()),ZIP);
assert.deepEqual(errs,[]);await b.close();h.close();console.log('PASS 교재 파일 첨부: 형식·크기·권한 검사, ZIP·PDF 업로드, 링크 자동 추가, 학생이 원래 이름으로 내려받기');
})().catch(e=>{console.error('FAIL',e.stack.split('\n').slice(0,4).join('\n'));process.exit(1);});
