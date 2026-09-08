'use strict';
// Standalone diagram geometry checks. No learner records or external requests.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),box={window:{}};
vm.createContext(box);
vm.runInContext(fs.readFileSync(path.join(root,'final2-solution-diagrams.js'),'utf8'),box);
const registry=box.window.GFIELD_FINAL2_SOLUTION_DIAGRAMS;
const nos=Object.values(registry.model).map(model=>model.no).sort((a,b)=>a-b);
const artifactDir=process.env.GFIELD_QA_DIAGRAM_DIR;
if(artifactDir)fs.mkdirSync(artifactDir,{recursive:true});
(async()=>{
  const browser=await chromium.launch();
  try{
    const page=await browser.newPage();
    await page.route(/^https?:\/\//,route=>route.abort());
    for(const width of [390,1280]){
      await page.setViewportSize({width,height:900});
      for(const no of nos){
        const html=registry.render(no);
        assert.ok(html,`Q${no} registered diagram must render`);
        await page.setContent('<style>body{margin:0;padding:24px;box-sizing:border-box}main{max-width:700px;margin:auto}</style><main>'+html+'</main>');
        await page.evaluate(()=>document.fonts.ready);
        const result=await page.evaluate(()=>({
          fits:document.documentElement.scrollWidth<=innerWidth+1,
          diagrams:document.querySelectorAll('svg').length,
          texts:[...document.querySelectorAll('svg text')].map(text=>{
            const r=text.getBoundingClientRect(),s=text.ownerSVGElement.getBoundingClientRect();
            return {label:text.textContent,visible:r.width>0&&r.height>0,inside:r.left>=s.left-2&&r.right<=s.right+2&&r.top>=s.top-2&&r.bottom<=s.bottom+2};
          })
        }));
        assert.ok(result.fits&&result.diagrams>0,`Q${no} diagram fits ${width}px`);
        for(const text of result.texts)assert.ok(text.visible&&text.inside,`Q${no} ${width}px clipped label: ${text.label}`);
        if(artifactDir)await page.locator('main').screenshot({path:path.join(artifactDir,`standalone-q${no}-${width}.png`)});
      }
    }
    console.log('PASS registered Final2 SVG labels fit desktop/mobile viewboxes: '+nos.join(','));
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
