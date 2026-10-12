'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
require('./email-login-test-stub');
const {chromium}=require('playwright'),root=path.resolve(__dirname,'..');
const name='활용정답합성학생',expected='60189, 60289, 60589, 90186, 90286, 90586';
const data=fs.readFileSync(path.join(root,'data.js'),'utf8')+'\n;(()=>{const d=window.GFIELD_DATA,n='+JSON.stringify(name)+';d.students.push(n);d.studentTypes[n]="online";d.archiveAccess["활용 모의고사"]=[n];})();';
const out='E:/Codex/work/hw1-q25-fix-20261012',errors=[],writes=[];
const server=http.createServer((req,res)=>{if(req.method!=='GET'){res.writeHead(405);return res.end();}const p=new URL(req.url,'http://localhost').pathname,f=path.resolve(root,'.'+decodeURIComponent(p));if(!f.startsWith(root+path.sep)||!fs.existsSync(f)||!fs.statSync(f).isFile()){res.writeHead(404);return res.end();}res.setHeader('Content-Type',({'.js':'application/javascript','.html':'text/html; charset=utf-8','.css':'text/css'})[path.extname(f)]||'application/octet-stream');fs.createReadStream(f).pipe(res);});
(async()=>{fs.mkdirSync(out,{recursive:true});await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=process.env.GFIELD_HW1_Q25_BASE||'http://127.0.0.1:'+server.address().port,browser=await chromium.launch();try{
 const context=await browser.newContext({viewport:{width:1280,height:900}});await context.addInitScript(n=>localStorage.setItem('gfield_student',n),name);
 await context.route(/^https?:\/\//,route=>{const req=route.request(),u=new URL(req.url());if(!['GET','HEAD','OPTIONS'].includes(req.method())){writes.push(req.method()+' '+u.pathname);return route.abort();}if(u.pathname.endsWith('/data.js'))return route.fulfill({contentType:'application/javascript',body:data});if(u.origin===base)return route.continue();return route.fulfill({contentType:'application/json',body:'[]'});});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/answer.html?set=hw&round=1&name='+encodeURIComponent(name));await page.locator('#content').waitFor({state:'visible'});
 const row=page.locator('#body tr').filter({has:page.locator('td.no').filter({hasText:/^25$/})});
 assert.equal(await row.locator('td.ans').innerText(),expected);assert.equal(await page.locator('#body tr').count(),30);
 for(const width of [1280,390]){await page.setViewportSize({width,height:900});assert.equal(await row.locator('td.ans').innerText(),expected);await row.screenshot({path:path.join(out,(process.env.GFIELD_HW1_Q25_BASE?'public':'local')+'-row25-'+width+'.png')});}
 await page.emulateMedia({media:'print'});assert.equal(await row.locator('td.ans').innerText(),expected);assert.equal(await row.evaluate(e=>getComputedStyle(e).breakInside),'avoid');
 assert.deepEqual(writes,[]);assert.deepEqual(errors,[]);console.log('PASS HW1 Q25 actual answer row, 30 rows, desktop/mobile/print, no student or external writes');
 }finally{await browser.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
