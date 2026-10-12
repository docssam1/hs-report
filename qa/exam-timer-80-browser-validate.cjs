'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),out=process.env.GFIELD_TIMER_QA_DIR;
const host=http.createServer((req,res)=>{res.setHeader('content-type','text/html; charset=utf-8');res.end(fs.readFileSync(path.join(root,'exam-timer-voice.html')));});
(async()=>{
  await new Promise(resolve=>host.listen(0,'127.0.0.1',resolve));
  const browser=await chromium.launch();
  try{
    const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.route('https://cdn.jsdelivr.net/**',r=>r.fulfill({contentType:'text/css',body:''}));
    await page.addInitScript(()=>{
      window.__now=0;window.__spoken=[];window.__audio=[];
      Object.defineProperty(performance,'now',{value:()=>window.__now});
      window.requestAnimationFrame=()=>1;window.cancelAnimationFrame=()=>{};
      window.SpeechSynthesisUtterance=function(text){this.text=text;};
      Object.defineProperty(window,'speechSynthesis',{value:{cancel(){},getVoices(){return [{lang:'ko-KR'}];},speak(value){window.__spoken.push(value.text);}}});
      window.Audio=function(url){window.__audio.push(url);this.pause=()=>{};this.play=()=>Promise.resolve();};
    });
    await page.goto(process.env.GFIELD_TIMER_QA_BASE||'http://127.0.0.1:'+host.address().port,{waitUntil:'networkidle'});
    assert.equal(await page.locator('#clock').innerText(),'80:00');
    assert.equal(await page.locator('#speedSelect').inputValue(),'1');
    assert.deepEqual(await page.locator('.cue-time').allTextContents(),['00:00','05:00','20:00','35:00','55:00','65:00','75:00','80:00']);
    if(out){fs.mkdirSync(out,{recursive:true});await page.screenshot({path:path.join(out,'timer80-desktop.png')});}
    await page.setViewportSize({width:390,height:844});
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    if(out)await page.screenshot({path:path.join(out,'timer80-mobile.png')});
    await page.locator('#startBtn').focus();await page.keyboard.press('Enter');
    for(const [elapsed,remaining] of [[0,'80:00'],[300,'75:00'],[1200,'60:00'],[2100,'45:00'],[3300,'25:00'],[3900,'15:00'],[4500,'05:00'],[4800,'00:00']]){
      await page.evaluate(seconds=>{window.__now=seconds*1000;tick(window.__now);},elapsed);
      assert.equal(await page.locator('#clock').innerText(),remaining);
    }
    assert.match(await page.locator('#phaseName').innerText(),/시험 종료/);
    const audio=await page.evaluate(()=>({spoken:window.__spoken,audio:window.__audio}));
    assert.ok(audio.spoken.some(text=>text.includes('65분')&&text.includes('15분')));
    assert.ok(audio.spoken.some(text=>text.includes('80분')));
    assert.ok(!audio.audio.some(url=>/cue-(5|7)\.mp3$/.test(url)),'old 75/90-minute speech must not play');
    await page.locator('#resetBtn').click();assert.equal(await page.locator('#clock').innerText(),'80:00');
    await page.locator('#voiceToggle').click();await page.locator('#startBtn').click();
    await page.evaluate(()=>{window.__now+=60000;tick(window.__now);});await page.locator('#pauseBtn').click();
    await page.evaluate(()=>window.__now+=120000);assert.equal(await page.evaluate(()=>Math.round(currentElapsed())),60);
    await page.locator('#startBtn').click();await page.evaluate(()=>{window.__now+=60000;tick(window.__now);});
    assert.equal(await page.locator('#clock').innerText(),'78:00');
    await page.locator('#resetBtn').click();await page.selectOption('#speedSelect','200');await page.locator('#startBtn').click();
    await page.evaluate(()=>{window.__now+=24000;tick(window.__now);});assert.equal(await page.locator('#clock').innerText(),'00:00');
    assert.deepEqual(errors,[]);
    console.log('PASS 80-minute timer, all cue boundaries, correct speech, real-time default, pause/resume/reset, demo, keyboard and 390px');
  }finally{await browser.close();host.close();}
})().catch(e=>{console.error(e);host.close();process.exitCode=1;});
