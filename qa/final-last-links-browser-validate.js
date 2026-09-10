'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const vm=require('node:vm');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const student='배정검수학생',denied='미배정검수학생';
const prefixFunction=fs.readFileSync(path.join(root,'final.html'),'utf8').match(/function setPrefix\(\)\s*\{[^}]+\}/);
assert.ok(prefixFunction,'round key function exists');
for(const [isLast,isOriginal,prefix] of [[false,false,'final'],[true,false,'last'],[false,true,'original']]){
 assert.equal(vm.runInNewContext('('+prefixFunction[0]+')()',{isLast,isOriginal}),prefix,'score series remain separate');
}
const server=http.createServer((req,res)=>{
  const f=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
  if(!f.startsWith(root+path.sep)||!fs.existsSync(f)||!fs.statSync(f).isFile()){res.writeHead(404);return res.end();}
  res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css'})[path.extname(f)]||'application/octet-stream');
  fs.createReadStream(f).pipe(res);
});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base=process.env.GFIELD_QA_BASE_URL||'http://127.0.0.1:'+server.address().port;
 const siteOrigin=new URL(base).origin;
 const browser=await chromium.launch();
 const context=await browser.newContext({viewport:{width:1280,height:900}});
 const source=fs.readFileSync(path.join(root,'data.js'),'utf8');
 const fixture=source+'\n;(()=>{const d=window.GFIELD_DATA,n='+JSON.stringify(student)+',z='+JSON.stringify(denied)+';d.students.push(n,z);d.studentTypes[n]="resident";d.studentTypes[z]="resident";d.attendance[n]=d.nodes.filter(x=>/파이널|최종/.test(x.title||"")).map(x=>x.id);d.attendance[z]=[];d.archiveAccess["파이널 모의고사"]=(d.archiveAccess["파이널 모의고사"]||[]).filter(x=>x!==n&&x!==z);d.archiveProductAccess["mock-final-5"]=[n];})();';
 const writes=[];
 await context.route(/^https?:\/\//,route=>{
   const req=route.request(),u=new URL(req.url());
   if(u.origin===siteOrigin){if(u.pathname==='/data.js')return route.fulfill({contentType:'application/javascript',body:fixture});return route.continue();}
   if(!['GET','HEAD','OPTIONS'].includes(req.method()))writes.push({method:req.method(),path:u.pathname});
   return route.fulfill({status:200,contentType:'application/json',body:'[]'});
 });
 await context.addInitScript(n=>localStorage.setItem('gfield_student',n),student);
 const page=await context.newPage();
 const name='&name='+encodeURIComponent(student);
 const checks=[];
 async function target(relative,pathname,params){
   await page.goto(base+'/'+relative,{waitUntil:'domcontentloaded'});
   await page.waitForURL(u=>u.pathname==='/'+pathname,{timeout:12000});
   const u=new URL(page.url());for(const [k,v]of Object.entries(params))assert.equal(u.searchParams.get(k),String(v),relative+' '+k);
   assert.equal(u.searchParams.get('name'),student,relative+' name survives');
   checks.push(relative.split('&name=')[0]);
 }
 try{
  for(let n=1;n<=5;n++){
   await target('mock.html?set=final&round='+n+'&go=timer'+name,'final.html',{round:n,go:'timer'});
   await page.goto(base+'/answer.html?set=final&round='+n+name,{waitUntil:'domcontentloaded'});
   await page.locator('#content:not(.hidden)').waitFor({timeout:12000});
   assert.equal(await page.locator('#body tr').count(),30,'Final '+n+' answer rows');
  }
  for(let n=1;n<=4;n++){
   await target('mock.html?set=final&round='+(n+5)+'&go=timer'+name,'final.html',{set:'last',round:n,go:'timer'});
   await target('mock.html?set=last&round='+n+'&go=timer'+name,'final.html',{set:'last',round:n,go:'timer'});
   await target('answer.html?set=last&round='+n+name,n===1?'last1-answer.html':'last-answer.html',n===1?{}:{round:n});
   await target('answer.html?set=final&round='+(n+5)+name,n===1?'last1-answer.html':'last-answer.html',n===1?{}:{round:n});
  }
  await target('mock.html?set=final&round=1&preview=1'+name,'final.html',{round:1,preview:1});
  await page.goto(base+'/answer.html?set=final&round=1&name='+encodeURIComponent(denied));
  await page.locator('#gate:not(.hidden)').waitFor();
  assert.equal(await page.locator('#content:not(.hidden)').count(),0,'unassigned student not granted answers');
  await page.goto(base+'/answer.html?set=final&round=5&name='+encodeURIComponent(denied));
  await page.locator('#gate:not(.hidden)').waitFor();
  await page.goto(base+'/index.html',{waitUntil:'domcontentloaded'});
  if(await page.locator('#skipBtn').isVisible())await page.locator('#skipBtn').click();
  await page.locator('#dashboard:not(.hidden)').waitFor();
  await page.evaluate(()=>nav('roadmap'));
  const finalButton=page.getByRole('button',{name:student+' 학생 파이널 성적표'}).first();
  await finalButton.waitFor();
  let popupWait=page.waitForEvent('popup');await finalButton.click();let popup=await popupWait;
  await popup.waitForLoadState('domcontentloaded');
  assert.equal(new URL(popup.url()).pathname,'/final.html');
  assert.equal(new URL(popup.url()).searchParams.get('go'),'report');
  assert.equal(new URL(popup.url()).searchParams.get('name'),student);await popup.close();
  // The actual roadmap material click path must not enter the PDF downloader.
  await page.evaluate(()=>{window.__pdfCalls=0;window.PDFLib={PDFDocument:{load(){window.__pdfCalls++;throw Error('HTML is not PDF');}}};});
  popupWait=page.waitForEvent('popup');
  await page.evaluate(()=>openModal(D.nodes.find(n=>n.id==='sep-w1'),true));
  await page.locator('#overlay .tb-btn').filter({hasText:'답안·교재 연결표'}).click();
  popup=await popupWait;await popup.waitForLoadState('domcontentloaded');
  assert.equal(new URL(popup.url()).pathname,'/answer.html');
  assert.equal(new URL(popup.url()).searchParams.get('set'),'final');
  assert.equal(new URL(popup.url()).searchParams.get('name'),student);
  assert.equal(await page.evaluate(()=>window.__pdfCalls),0,'HTML must bypass PDF load');await popup.close();
  await page.evaluate(()=>closeModal());
  const lastNode=page.locator('#timeline .node').filter({has:page.locator('h3',{hasText:/최종.*모의고사\s*1\s*회/})}).first();
  popupWait=page.waitForEvent('popup');await lastNode.getByRole('button',{name:/성적/}).first().click();
  popup=await popupWait;await popup.waitForLoadState('domcontentloaded');
  assert.equal(new URL(popup.url()).pathname,'/final.html','Last uses the common diagnostic report');
  assert.equal(new URL(popup.url()).searchParams.get('set'),'last');
  assert.equal(new URL(popup.url()).searchParams.get('go'),'report');
  assert.equal(new URL(popup.url()).searchParams.get('round'),'1');
  assert.equal(new URL(popup.url()).searchParams.get('name'),student);await popup.close();
  await page.setViewportSize({width:390,height:844});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)<=1,'mobile roadmap overflow');
  const out=process.env.GFIELD_QA_ARTIFACT_DIR;
  if(out){
   fs.mkdirSync(out,{recursive:true});await page.screenshot({path:path.join(out,'roadmap-mobile.png'),fullPage:true});
   await page.locator('#timeline .node').filter({has:page.locator('h3',{hasText:/파이널.*모의고사\s*1\s*회/})}).first().screenshot({path:path.join(out,'final1-card-mobile.png')});
   await lastNode.screenshot({path:path.join(out,'last1-card-mobile.png')});
   await page.setViewportSize({width:1280,height:900});
   await page.evaluate(()=>openModal(D.nodes.find(n=>n.id==='sep-w1'),true));
   await page.screenshot({path:path.join(out,'final1-materials-desktop.png')});
  }
  // Existing access telemetry and read-report requests are intercepted too.
  // Neither telemetry nor any other request reaches production from this suite.
  assert.ok(writes.every(x=>x.path.endsWith('/hs-final-population')||x.path==='/rest/v1/access_log'),'no result or approval writes: '+JSON.stringify(writes));
  console.log(JSON.stringify({pass:true,legacyRouteChecks:checks.length,finalAnswerRounds:5,lastAnswerRounds:4,assignedAllowed:true,unassignedDenied:true,htmlNotPdf:true,mobile:true,productionWrites:0}));
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;server.close();});
