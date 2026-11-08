'use strict';
// Real roster, local server, synthetic authenticated browser; every external request is intercepted.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require(process.env.GFIELD_QA_PLAYWRIGHT||'playwright'),root=path.resolve(__dirname,'..'),out=path.join(root,'.private-work/seminar-entry-20261108');
const server=http.createServer((req,res)=>{let f=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!f.startsWith(root+path.sep)&&f!==root){res.writeHead(403);return res.end();}if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');if(!fs.existsSync(f)){res.writeHead(404);return res.end();}res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.json':'application/json','.woff2':'font/woff2','.jpg':'image/jpeg'})[path.extname(f)]||'application/octet-stream');fs.createReadStream(f).pipe(res);});
(async()=>{
 fs.mkdirSync(out,{recursive:true});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port,browser=await chromium.launch(),cases=[],errors=[];
 try{
  for(const name of ['노관호','김다인']){
   const context=await browser.newContext({viewport:{width:390,height:844}});await context.addInitScript(n=>localStorage.setItem('gfield_student',n),name);
   await context.route('**/*',route=>{const u=new URL(route.request().url());if(u.origin!==base)return route.fulfill({json:[]});
    if(u.pathname==='/hs-auth.js')return route.fulfill({contentType:'application/javascript',body:`window.GFIELD_AUTH={getSession:async()=>({login_name:${JSON.stringify(name)}}),getUser:async()=>null,normalizeName:x=>x,normalizeLoginName:x=>x,rest:async()=>({ok:true,json:async()=>[]}),functionCall:async()=>({}),hasAdminDevice:()=>false};`});
    if(u.pathname==='/hs-email-login.js')return route.fulfill({contentType:'application/javascript',body:'window.GFIELD_EMAIL_LOGIN={REQUIRED:true,check:async()=>({ok:true}),signOut:async()=>{}};'});
    return route.continue();});
   const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(base+'/');await page.waitForFunction(n=>currentStudent===n,name);await page.evaluate(()=>{skipIntro();nav('archive');});
   const card=page.locator('#archive-list .archive-seminar-video');await card.waitFor({state:'visible'});assert.equal(await card.getAttribute('href'),'seminar/2026-video/');assert.match(await card.innerText(),/시험지·답안 인쇄/);
   assert.equal(await page.evaluate(()=>document.querySelector('#archive-list').firstElementChild.classList.contains('archive-seminar-video')),true);
   if(name==='노관호'){await page.locator('#cheer').waitFor({state:'hidden'});await card.scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,'nogwanho-archive-mobile.png')});}
   // A seminar-only grant must work even without shelf or problem-bank permissions.
   if(name==='김다인'){await page.evaluate(()=>{D.archiveFolders=[];renderArchive();});assert.equal(await card.count(),1);assert.equal(await page.locator('#archive-list').innerText().then(t=>t.includes('열람 가능한 자료실이 없습니다.')),false);}
   await card.click();await page.waitForFunction(()=>!document.querySelector('.exam-print[data-round="2"]').disabled);assert.equal(await page.locator('#play').isDisabled(),false);assert.equal(await page.locator('.exam-print:enabled').count(),6);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   cases.push({name,cardAtArchiveTop:true,viewerAndSixPrintActionsEnabled:true});await context.close();
  }
  assert.deepEqual(errors,[]);const result={pass:true,cases,seminarOnlyEntry:true,errors,productionWrites:0};fs.writeFileSync(path.join(out,'review.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
