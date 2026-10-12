'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
require('./email-login-test-stub');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),student='공식연결검수',out=process.env.GFIELD_FINAL78_QA_DIR;
const correct=[1,2,3,4,5,6,13,14,15,16,17,18,23,24];
const ox=Array.from({length:30},(_,i)=>correct.includes(i+1)?'O':'X').join('');
function record(round,value){let score=0;[...value].forEach((x,i)=>{if(x==='O')score+=i<12?2.7:i<22?3.4:4.2;});return {student,round,ox:value,score:Math.round(score*10)/10,wrong:[...value].filter(x=>x==='X').length,source:'admin',updated_at:'2026-10-12T00:00:00Z'};}
let records=[record('final7',ox),record('final8',ox)];
const data=fs.readFileSync(path.join(root,'data.js'),'utf8')+`\n;(()=>{const d=window.GFIELD_DATA,n=${JSON.stringify(student)};d.students.push(n);d.studentTypes[n]='resident';d.archiveProductAccess['mock-final-7']=[n];d.archiveProductAccess['mock-final-8']=[n];})();`;
const server=http.createServer((req,res)=>{
  const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
  if(req.method!=='GET'||!file.startsWith(root+path.sep)||file.includes('.private')||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end();}
  res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png','.woff2':'font/woff2'})[path.extname(file)]||'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+server.address().port,browser=await chromium.launch(),errors=[],writes=[];
  try{
    const context=await browser.newContext({viewport:{width:1280,height:900}});
    await context.addInitScript(name=>{
      if(!/^https?:$/.test(location.protocol))return;
      localStorage.setItem('gfield_student',name);
      localStorage.setItem('gfield_hs_admin_session_v1',JSON.stringify({access_token:'qa-admin',refresh_token:'qa-refresh',expires_at:Math.floor(Date.now()/1000)+3600}));
    },student);
    await context.route(/^https?:\/\//,route=>{
      const req=route.request(),url=new URL(req.url());
      if(url.origin===base){if(url.pathname==='/data.js')return route.fulfill({contentType:'application/javascript',body:data});return route.continue();}
      if(url.hostname==='fgahqumaldheqettmvqg.supabase.co'){
        if(url.pathname==='/functions/v1/hs-final-population')return route.fulfill({json:{canEdit:false,comment:'',snapshot:null,resultOx:ox}});
        if(req.method()!=='GET'){writes.push(req.method()+' '+url.pathname);return route.abort();}
        return route.fulfill({json:url.pathname==='/auth/v1/user'?{id:'qa-admin',app_metadata:{role:'admin'}}:url.pathname==='/rest/v1/hs_accounts'?[{role:'admin',active:true,student:null}]:url.pathname==='/rest/v1/mock_results'?records:[]});
      }
      return route.abort();
    });
    const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
    if(out)fs.mkdirSync(out,{recursive:true});
    for(const personal of [false,true]){
      records=[record('final7',ox),record('final8',ox)];
      if(personal)for(let n=1;n<=4;n++)records.push(record('final'+n,'O'.repeat(4+n)+'X'.repeat(26-n)));
      for(const n of [7,8]){
        await page.emulateMedia({media:'screen'});await page.setViewportSize({width:1280,height:900});
        await page.goto(base+'/final.html?round='+n+'&go=report&entry=teacher&name='+encodeURIComponent(student),{waitUntil:'networkidle'});
        await page.locator('.report-screen-header').waitFor();
        const expected=await page.evaluate(rows=>{
          const model=window.GFIELD_MOCK_ORIGINAL,api=window.GFIELD_SIGNATURE_FORECAST,cuts=model.rounds['1'].stats.cuts;
          const finals=rows.filter(row=>/^final[1-4]$/.test(row.round)).map(row=>({score:row.score,cuts:window.GFIELD_MOCK_FINAL.rounds[row.round.slice(5)].stats.cuts}));
          const result=api.estimate([45],finals,cuts);
          return {score:result.expected,pct:model.estimatedPosition(45).topPercent,tier:api.levelPlacement(result.expected,cuts,model.estimatedPosition).label};
        },records);
        assert.equal(expected.pct,2.5);
        if(!personal)assert.equal(expected.score,40.5);
        for(const selector of ['.report-screen-header','#report-summary','.report-compact-print-header','.report-print-cover','.final8-benchmark']){
          const text=await page.locator(selector).first().textContent();
          assert.ok(text.includes(String(expected.score))&&text.includes('2.5%')&&text.includes(expected.tier),selector+' uses the same Signature projection');
        }
        assert.match(await page.locator('.report-screen-header').innerText(),new RegExp('모의고사 '+n+'회'));
        if(out&&!personal)await page.locator('.report-screen-header').screenshot({path:path.join(out,'final'+n+'-desktop.png')});
        await page.setViewportSize({width:390,height:844});
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'390px report fits');
        if(out&&!personal)await page.locator('.report-screen-header').screenshot({path:path.join(out,'final'+n+'-mobile.png')});
        if(out&&!personal){
          await page.setViewportSize({width:1280,height:900});
          await page.evaluate(async()=>{window.__qaPrepared=await window.GFIELD_FINAL_REPORT_PRINT.createPreparation({source:document.querySelector('.final-report-package'),mode:'summary'}).promise;});
          const rendered=await page.evaluate(()=>{
            const doc=window.__qaPrepared.frame.contentDocument,copy=doc.documentElement.cloneNode(true);
            copy.querySelectorAll('script').forEach(s=>s.remove());
            const base=document.createElement('base');base.href=new URL('/',location.href).href;copy.querySelector('head').prepend(base);
            return {html:'<!doctype html>'+copy.outerHTML,text:doc.body.innerText};
          });
          assert.ok(rendered.text.includes(String(expected.score))&&rendered.text.includes('2.5%')&&rendered.text.includes(expected.tier),'paginated print contains matching metrics');
          const exportPage=await context.newPage();
          try{
            await exportPage.goto(base+'/qa-final78-blank');await exportPage.setContent(rendered.html,{waitUntil:'load'});
            await exportPage.evaluate(()=>document.fonts.ready);await exportPage.emulateMedia({media:'print'});
            await exportPage.pdf({path:path.join(out,'final'+n+'-summary-a4.pdf'),format:'A4',preferCSSPageSize:true,printBackground:true,margin:{top:'0',bottom:'0',left:'0',right:'0'}});
          }finally{await exportPage.close();await page.evaluate(()=>window.__qaPrepared.cleanup());}
        }
      }
    }
    assert.deepEqual(writes,[]);assert.deepEqual(errors,[]);
    console.log('PASS Final7/8 actual/expected/rank/level parity in report, summary, print cover and QR header; personal Final evidence; desktop/390px; zero DB writes');
  }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
