'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const {chromium}=require(process.env.GFIELD_QA_PLAYWRIGHT||'playwright');

const ROOT=path.resolve(__dirname,'..');
function server(){return new Promise(resolve=>{const instance=http.createServer((request,response)=>{const pathname=decodeURIComponent(new URL(request.url,'http://127.0.0.1').pathname);if(pathname==='/favicon.ico'){response.writeHead(204);response.end();return;}const filename=path.resolve(ROOT,'.'+pathname);if(!filename.startsWith(ROOT+path.sep)||!fs.existsSync(filename)||!fs.statSync(filename).isFile()){response.writeHead(404);response.end('not found');return;}response.writeHead(200,{'content-type':path.extname(filename)==='.js'?'text/javascript; charset=utf-8':'text/html; charset=utf-8','cache-control':'no-store'});fs.createReadStream(filename).pipe(response);});instance.listen(0,'127.0.0.1',()=>resolve(instance));});}

(async()=>{
  const host=await server();
  const browser=await chromium.launch({headless:true,executablePath:process.env.GFIELD_QA_BROWSER_EXECUTABLE||undefined});
  try{
    const context=await browser.newContext({viewport:{width:390,height:844}});
    await context.route('https://cdn.jsdelivr.net/**',route=>route.fulfill({status:200,contentType:'text/css',body:''}));
    await context.route('https://fonts.googleapis.com/**',route=>route.fulfill({status:200,contentType:'text/css',body:''}));
    await context.route('https://fonts.gstatic.com/**',route=>route.fulfill({status:200,contentType:'font/woff2',body:''}));
    const page=await context.newPage();const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(`http://127.0.0.1:${host.address().port}/final.html?set=last&round=4&name=docssam`,{waitUntil:'networkidle'});
    await page.locator('#btnTimer').click();
    await page.locator('#pl li').last().waitFor();
    const labels=await page.locator('#pl li b').allTextContents();
    assert.equal(labels.at(-1),'75~90분','마지막 구간은 숫자로 된 실제 제한시간을 표시');
    assert.doesNotMatch(labels.join(' '),/function\s+examMinutes|\[object Function\]/,'함수 본문이 타이머 문구로 출력되지 않음');
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'390px 타이머 가로 넘침 없음');
    assert.deepEqual(errors,[]);
  }finally{await browser.close();host.close();}
  console.log(JSON.stringify({pass:true,lastInterval:'75~90분'}));
})().catch(error=>{console.error(error);process.exitCode=1;});
