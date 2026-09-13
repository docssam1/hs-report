'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const {chromium}=require('playwright');

const root=path.resolve(__dirname,'..');
const student='문제은행권한검수학생';
const source=fs.readFileSync(path.join(root,'data.js'),'utf8');

const server=http.createServer((req,res)=>{
  const pathname=new URL(req.url,'http://localhost').pathname;
  const file=path.resolve(root,'.'+pathname);
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end();}
  res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8'})[path.extname(file)]||'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});

(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch();

  async function open(options){
    const context=await browser.newContext({viewport:{width:390,height:844}});
    await context.addInitScript(({student,session})=>{
      window.__GFIELD_BANK_ACCESS_FORCE__=true;
      if(session)localStorage.setItem('gfield_hs_student_session_v1',JSON.stringify({access_token:'bank-access-token',refresh_token:'bank-access-refresh',expires_at:Math.floor(Date.now()/1000)+3600,login_name:student}));
      localStorage.setItem('gfield_student',student);
    },{student,session:options.session});
    await context.route(base+'/data.js*',route=>route.fulfill({contentType:'application/javascript',body:source+'\n;window.GFIELD_DATA.archiveProductAccess["question-bank"]='+(options.granted?'["'+student+'"]':'[]')+';'}));
    await context.route('https://fgahqumaldheqettmvqg.supabase.co/**',route=>{
      const url=new URL(route.request().url());
      if(url.pathname==='/auth/v1/token')return route.fulfill({json:{access_token:'bank-access-token',refresh_token:'bank-access-refresh',expires_in:3600,user:{id:'bank-access-user'}}});
      if(url.pathname==='/auth/v1/user')return route.fulfill({json:{id:'bank-access-user'}});
      if(url.pathname==='/rest/v1/hs_accounts')return route.fulfill({json:[{role:'student',active:true,student}]});
      return route.fulfill({status:404,json:{error:'unexpected'}});
    });
    await context.route('https://fonts.googleapis.com/**',route=>route.abort());
    const page=await context.newPage();
    await page.goto(base+options.path,{waitUntil:'networkidle'});
    return {context,page};
  }

  try{
    const missing=await open({path:'/bank/index.html?bank=final2',session:false,granted:true});
    assert.equal(await missing.page.locator('#bankAccessGate').isVisible(),true,'direct URL requires a verified session');
    assert.equal(await missing.page.locator('#bankAccessForm').isVisible(),true,'approval-number form is shown');
    assert.equal(await missing.page.locator('.qcard').count(),0,'questions do not render before authorization');
    await missing.context.close();

    const login=await open({path:'/bank/index.html?bank=final2',session:false,granted:true});
    await login.page.locator('#bankAccessName').fill(student);
    await login.page.locator('#bankAccessCode').fill('1234');
    await login.page.locator('#bankAccessForm button').click();
    await login.page.waitForFunction(()=>document.querySelectorAll('.qcard').length===90);
    assert.equal(await login.page.locator('#bankAccessGate').isHidden(),true,'approval-number login opens the bank after permission check');
    await login.context.close();

    const denied=await open({path:'/bank/index.html?bank=final2#student=다른학생',session:true,granted:false});
    await denied.page.locator('#bankAccessStatus.error').waitFor();
    assert.match(await denied.page.locator('#bankAccessStatus').textContent(),/열람 권한이 없습니다/);
    assert.equal(await denied.page.locator('.qcard').count(),0,'valid login without product permission stays blocked');
    await denied.context.close();

    const granted=await open({path:'/bank/index.html?bank=final2#student=다른학생',session:true,granted:true});
    await granted.page.waitForFunction(()=>document.querySelectorAll('.qcard').length===90);
    assert.equal(await granted.page.locator('#bankAccessGate').isHidden(),true);
    assert.equal(await granted.page.locator('.qcard').count(),90,'authorized student receives the fixed bank');
    assert.equal(await granted.page.evaluate(()=>document.body.dataset.bankStudent),student,'verified account identity overrides URL display data');
    await granted.context.close();

    const catalog=await open({path:'/bank/catalog.html',session:true,granted:true});
    await catalog.page.waitForFunction(()=>window.__BANK_CATALOG_QA__&&window.__BANK_CATALOG_QA__.fixedIndexLoaded===true);
    assert.equal(await catalog.page.locator('#bankAccessGate').isHidden(),true);
    assert.match(await catalog.page.locator('#result-status').textContent(),/유형.*문항/);
    await catalog.context.close();

    console.log('PASS bank access: approval session, self-account lookup, product permission, direct-link denial, identity binding, catalog gate');
  }finally{
    await browser.close();server.close();
  }
})().catch(error=>{console.error(error);process.exitCode=1});
