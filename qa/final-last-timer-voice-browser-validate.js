'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
require('./email-login-test-stub'); // QA 전용: 학부모 이메일 인증 단계를 인증된 브라우저로 취급
const {chromium}=require(process.env.GFIELD_QA_PLAYWRIGHT||'playwright');

const ROOT=path.resolve(__dirname,'..');
function server(){return new Promise(resolve=>{const instance=http.createServer((request,response)=>{const pathname=decodeURIComponent(new URL(request.url,'http://127.0.0.1').pathname);if(pathname==='/favicon.ico'){response.writeHead(204);response.end();return;}const filename=path.resolve(ROOT,'.'+pathname);if(!filename.startsWith(ROOT+path.sep)||!fs.existsSync(filename)||!fs.statSync(filename).isFile()){response.writeHead(404);response.end('not found');return;}response.writeHead(200,{'content-type':path.extname(filename)==='.js'?'text/javascript; charset=utf-8':'text/html; charset=utf-8','cache-control':'no-store'});fs.createReadStream(filename).pipe(response);});instance.listen(0,'127.0.0.1',()=>resolve(instance));});}


async function run(browser,host,query,expectFiles){
  const context=await browser.newContext({viewport:{width:900,height:900}});
  await context.route('https://cdn.jsdelivr.net/**',route=>route.fulfill({status:200,contentType:'text/css',body:''}));
  await context.route('https://fonts.googleapis.com/**',route=>route.fulfill({status:200,contentType:'text/css',body:''}));
  await context.route('https://fonts.gstatic.com/**',route=>route.fulfill({status:200,contentType:'font/woff2',body:''}));
  await context.addInitScript(()=>{
    window.__audio=[];window.__spoken=[];
    window.Audio=function(url){window.__audio.push(String(url));this.pause=()=>{};this.play=()=>Promise.resolve();};
    Object.defineProperty(window,'speechSynthesis',{value:{cancel(){},getVoices(){return [{lang:'ko-KR',name:'t'}];},speak(u){window.__spoken.push(u.text);},onvoiceschanged:null}});
  });
  const page=await context.newPage();const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(`http://127.0.0.1:${host.address().port}/final.html?${query}&name=docssam`,{waitUntil:'networkidle'});
  await page.locator('#btnTimer').click();await page.locator('#go').waitFor();
  // 매초 300초씩 진행: 0·5·20·35·55·75·85·90분 경계를 모두 지난다
  await page.evaluate(()=>{const s=document.querySelector('#sp');const o=document.createElement('option');o.value='300';o.textContent='300';s.appendChild(o);s.value='300';});
  await page.locator('#go').click();
  await page.waitForFunction(()=>document.querySelector('#tm').textContent.trim()==='00:00',null,{timeout:60000});
  const r=await page.evaluate(()=>({audio:window.__audio,spoken:window.__spoken}));
  const files=r.audio.map(u=>u.replace(/^.*voice\//,'').replace(/\.mp3$/,''));
  assert.deepEqual(files,expectFiles,query+' 재생 파일 순서');
  assert.deepEqual(r.spoken,[],query+' 기기 합성 음성으로 읽지 않음');
  assert.deepEqual(errors,[]);
  await context.close();
}
(async()=>{
  const host=await server();
  const browser=await chromium.launch({headless:true,executablePath:process.env.GFIELD_QA_BROWSER_EXECUTABLE||undefined});
  try{
    await run(browser,host,'set=last&round=1',['last-cue-0','last-cue-1','last-cue-2','last-cue-3','last-cue-4']);
    await run(browser,host,'set=last&round=4',['last-cue-0','last-cue-1','last-cue-2','last-cue-3','last-cue-4']);
    await run(browser,host,'set=final&round=1',['cue-0','cue-1','cue-2','cue-3','cue-4','cue-5','cue-6','cue-7']);
  }finally{await browser.close();host.close();}
  console.log(JSON.stringify({pass:true,last:'last-cue-0..4 (최종 1·4회)',final:'cue-0..7 unchanged'}));
})().catch(error=>{console.error(error);process.exitCode=1;});
