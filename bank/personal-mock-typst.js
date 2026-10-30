/* A4 PDF export for the personal mock generator. The paper is compiled locally in the browser. */
(function(root){
  'use strict';
  var compilerPromise;
  var FONT_FILES=['noto-serif-kr-korean.ttf','noto-serif-kr-latin.ttf','pretendard.ttf','stix-two-math.ttf'];
  function literal(value){return JSON.stringify(String(value==null?'':value));}
  function rich(value){
    var marker='\uE000',end='\uE001';
    var source=String(value==null?'':value)
      .replace(/<math\b[^>]*>\s*<mfrac>\s*<mn>(\d+)<\/mn>\s*<mn>(\d+)<\/mn>\s*<\/mfrac>\s*<\/math>/gi,function(_,n,d){return marker+n+':'+d+end;})
      .replace(/(^|[^0-9])(\d{1,3})\/(\d{1,3})(?![0-9])/g,function(_,prefix,n,d){return prefix+marker+n+':'+d+end;});
    if(/<\/?math\b|<\/?mfrac\b|<\/?mn\b/i.test(source))throw Error('지원하지 않는 분수 표기가 있어 PDF 생성을 중단했습니다.');
    return source.split(/(\uE000\d+:\d+\uE001)/g).filter(Boolean).map(function(part){
      var match=/^\uE000(\d+):(\d+)\uE001$/.exec(part);
      return match?'math.equation(math.frac(['+match[1]+'],['+match[2]+']))':'text('+literal(part)+')';
    }).join(' + ')||'text("")';
  }
  function safeName(value){return String(value||'').replace(/[^A-Za-z0-9_-]/g,'_').slice(0,70);}
  function assetPath(item,kind){var asset=kind==='solution'?item.solutionAsset:item.asset;if(!asset)return null;return '/images/'+safeName(item.id)+'-'+kind+(/\.svg(?:$|\?)/i.test(asset.src||'')?'.svg':'.png');}
  function imageExpr(item,kind,height){var path=assetPath(item,kind);return path?'#v(2mm)\n#align(center)[#image('+literal(path)+', width: 100%, height: '+height+'mm, fit: "contain")]\n':'';}
  function tableExpr(data){
    if(!data||!Array.isArray(data.headers)||!Array.isArray(data.rows))return '';
    var columns='('+data.headers.map(function(){return '1fr';}).join(', ')+(data.headers.length===1?',':'')+')';
    var cells=data.headers.concat(data.rows.flat()).map(function(cell){return '[#text('+literal(cell)+')]';});
    return '#v(2mm)\n#table(columns: '+columns+', inset: 2pt, stroke: 0.4pt, align: center, '+cells.join(', ')+')\n';
  }
  function visualDataExpr(item){
    var essential=item.actualEssentialData;
    var out=tableExpr(item.givenTable);
    if(essential&&Array.isArray(essential.rows))out+=tableExpr({headers:essential.rows[0],rows:essential.rows.slice(1)});
    if(Array.isArray(item.arithmeticRows))out+='#v(2mm)\n'+item.arithmeticRows.map(function(row){return '#align(center)[#text(font: "Pretendard", size: 11pt, '+literal(row)+')]\n';}).join('');
    if(Array.isArray(item.cards)&&item.cards.length){
      var columns=Math.min(item.cards.length,6),widths='('+Array.from({length:columns},function(){return '1fr';}).join(', ')+(columns===1?',':'')+')';
      out+='#v(2mm)\n#grid(columns: '+widths+', column-gutter: 1.5mm, row-gutter: 1.5mm, '+item.cards.map(function(digit){return '[#box(width: 100%, height: 11mm, stroke: 0.5pt, radius: 1pt)[#align(center + horizon)[#text(font: "Pretendard", size: 12pt, '+literal(digit)+')]]]';}).join(', ')+')\n';
    }
    return out+tableExpr(item.responseTable);
  }
  function question(entry,columnCount){
    var item=entry.item,figureHeight=columnCount===1?100:columnCount===2?50:31;
    var essential=item.actualEssentialData;
    var given=(Array.isArray(item.conditionLines)?item.conditionLines:[]).concat(Array.isArray(item.promptDataLines)?item.promptDataLines:[],essential&&typeof essential.text==='string'?essential.text.split('\n'):[]);
    return 'block(width: 100%, height: 100%, breakable: false)['+
      '#text(font: "Pretendard", weight: "bold", size: 11pt)['+entry.index+'.] #h(1fr) #text(font: "Pretendard", size: 8pt, '+literal(item.pointBand+' 점')+')\n'+
      '#v(3mm)\n#('+rich(item.stemHtml||item.text)+')\n'+
      given.map(function(line){return '#v(2mm)\n#('+rich(line)+')\n';}).join('')+
      visualDataExpr(item)+
      imageExpr(item,'question',figureHeight)+
      '#v(1fr)\n#align(right)[#text(font: "Pretendard", size: 9pt)[답] #line(length: 18mm, stroke: 0.4pt)]\n]';
  }
  function column(entries){
    if(!entries.length)return 'block[]';
    var rows='('+entries.map(function(){return '1fr';}).join(', ')+(entries.length===1?',':'')+')';
    return 'grid(columns: (1fr,), rows: '+rows+', row-gutter: 5mm, '+entries.map(function(entry){return question(entry,entries.length);}).join(', ')+')';
  }
  function answer(entry){
    var item=entry.item,steps=Array.isArray(item.solutionSteps)&&item.solutionSteps.length?item.solutionSteps:[item.solution];
    return '#block(width: 100%, breakable: false, below: 5mm)['+
      '#text(font: "Pretendard", weight: "bold", size: 10pt)['+entry.index+'번 · 답] #('+rich(item.answer)+')\n#v(2mm)\n'+
      steps.map(function(step){return '#('+rich(step)+')\n#v(1.5mm)\n';}).join('')+
      imageExpr(item,'solution',65)+tableExpr(item.solutionTable)+']';
  }
  function planFromDom(paper,pages){
    var byId=new Map(paper.questions.map(function(entry){return [String(entry.item.id),entry];}));
    return Array.from(pages.querySelectorAll('.pm-question-page')).map(function(section){
      var cards=Array.from(section.querySelectorAll('.pm-q'));
      if(!cards.length)throw Error('빈 시험지 쪽이 있습니다.');
      var wideFirst=cards[0].classList.contains('pm-wide'),wideLast=cards[cards.length-1].classList.contains('pm-wide');
      var leftCount=wideFirst?1:wideLast&&cards.length>1?cards.length-1:Math.ceil(cards.length/2);
      return [cards.slice(0,leftCount),cards.slice(leftCount)].map(function(column){return column.map(function(card){var entry=byId.get(card.dataset.itemId);if(!entry)throw Error('문항과 인쇄 페이지가 일치하지 않습니다.');return entry;});});
    });
  }
  function buildSource(paper,questionPages,title,student){
    if(!paper||!paper.questions||!paper.questions.length||!questionPages.length)throw Error('인쇄할 문항이 없습니다.');
    var blankPage=questionPages.length%2?questionPages.length+1:0;
    var watermark=String(student||'').trim()||'지필드 영재교육';
    var counts={'2.7':0,'3.4':0,'4.2':0};paper.questions.forEach(function(entry){if(!Object.prototype.hasOwnProperty.call(counts,entry.item.pointBand))throw Error('문항 배점을 확인할 수 없습니다.');counts[entry.item.pointBand]++;});
    var total=(counts['2.7']*2.7+counts['3.4']*3.4+counts['4.2']*4.2).toFixed(1).replace(/\.0$/,'');
    var head='#let blank-page = '+blankPage+'\n'+
      '#set page(paper: "a4", margin: (top: 15mm, bottom: 15mm, left: 15mm, right: 15mm), background: context { if counter(page).get().first() == blank-page { none } else { align(center + horizon, rotate(-25deg, text(font: "Pretendard", size: 22pt, fill: rgb("eeeeee"), '+literal(watermark)+'))) } }, footer: context { if counter(page).get().first() == blank-page { none } else { align(center, text(font: "Pretendard", size: 8pt, fill: rgb("555555"), [지필드 영재교육 · #counter(page).display()])) } })\n'+
      '#set text(font: "Noto Serif KR", size: 10.5pt, fill: rgb("191511"))\n#show math.equation: set text(font: "STIX Two Math")\n#set par(leading: 0.58em)\n';
    var questionSheets=questionPages.map(function(columns,pageIndex){
      var firstHeader='#text(font: "Pretendard", weight: "bold", size: 13pt)[G·FIELD] #h(1fr) #text(font: "Pretendard", size: 8pt)[지필드 영재교육]\n'+
        '#v(2mm)\n#line(length: 100%, stroke: 0.6pt)\n#v(3mm)\n#align(center)[#text(font: "Noto Serif KR", size: 17pt, '+literal(title)+')]\n#v(3mm)\n'+
        '#align(center)[#text(font: "Pretendard", size: 9pt, '+literal('학교 __________   학년 ______   이름 '+student+'   날짜 __________')+')]\n'+
        '#align(right)[#text(font: "Pretendard", size: 8pt, '+literal(paper.questions.length+'문항 · '+total+'점')+')]\n'+
        '#v(2mm)\n#table(columns: (1fr, 1fr, 1fr, 1fr, 1fr), inset: 2pt, stroke: 0.4pt, align: center, [배점], [2.7점], [3.4점], [4.2점], [합계], [문항 수], ['+counts['2.7']+'], ['+counts['3.4']+'], ['+counts['4.2']+'], ['+paper.questions.length+'])\n';
      return (pageIndex?'#align(center)[#text(font: "Noto Serif KR", size: 11pt, '+literal(title)+')]\n':firstHeader)+
        '#v(3mm)\n#line(length: 100%, stroke: 1pt)\n#v(4mm)\n#block(height: '+(pageIndex?240:180)+'mm)[#grid(columns: (1fr, 1fr), column-gutter: 10mm, '+column(columns[0])+', '+column(columns[1])+')]';
    }).join('\n#pagebreak()\n');
    var answerSheet='#pagebreak(to: "odd")\n#align(center)[#text(font: "Noto Serif KR", size: 15pt, '+literal(title+' · 정답과 풀이')+')]\n#v(5mm)\n#line(length: 100%, stroke: 1pt)\n#v(6mm)\n'+paper.questions.map(answer).join('\n');
    return head+questionSheets+'\n'+answerSheet+'\n';
  }
  async function bytes(asset){
    var source=asset&&asset.src||'';
    if(/^data:image\/png;base64,/.test(source)){var raw=atob(source.slice(source.indexOf(',')+1));return Uint8Array.from(raw,function(char){return char.charCodeAt(0);});}
    if(!/^assets\/[A-Za-z0-9/_-]+\.(?:png|svg)$/.test(source))throw Error('검수 그림 경로를 확인할 수 없습니다.');
    var response=await fetch(new URL(source,document.baseURI));if(!response.ok)throw Error('문항 그림을 불러오지 못했습니다.');return new Uint8Array(await response.arrayBuffer());
  }
  async function compiler(){
    if(!compilerPromise)compilerPromise=(async function(){
      var module=await import('./vendor/typst/typst.js');
      module.$typst.setCompilerInitOptions({getModule:function(){return new URL('vendor/typst/compiler.wasm',document.baseURI).href;}});
      var fonts=await Promise.all(FONT_FILES.map(async function(name){var response=await fetch(new URL('vendor/typst/fonts/'+name,document.baseURI));if(!response.ok)throw Error('인쇄 글꼴을 불러오지 못했습니다.');return new Uint8Array(await response.arrayBuffer());}));
      module.$typst.use.apply(module.$typst,[module.TypstSnippet.disableDefaultFontAssets()].concat(fonts.map(function(font){return module.TypstSnippet.preloadFontData(font);})));
      return module.$typst;
    })().catch(function(error){compilerPromise=null;throw error;});
    return compilerPromise;
  }
  async function pdf(paper,questionPages,title,student){
    var source=buildSource(paper,questionPages,title,student),engine=await compiler();
    await engine.resetShadow();
    try{
      for(var entry of paper.questions){for(var kind of ['question','solution']){var asset=kind==='question'?entry.item.asset:entry.item.solutionAsset,path=assetPath(entry.item,kind);if(path)await engine.mapShadow(path,await bytes(asset));}}
      try{return await engine.pdf({mainContent:source});}
      catch(error){var diagnostic=Array.isArray(error)&&error.find(function(row){return row&&row.message;});throw Error('PDF 조판 오류: '+String(diagnostic&&diagnostic.message||error&&error.message||error||'알 수 없는 오류').slice(0,180));}
    }finally{await engine.resetShadow();}
  }
  root.GFIELD_PERSONAL_MOCK_TYPST=Object.freeze({rich:rich,buildSource:buildSource,planFromDom:planFromDom,pdf:pdf});
  if(typeof module!=='undefined'&&module.exports)module.exports=root.GFIELD_PERSONAL_MOCK_TYPST;
})(typeof window!=='undefined'?window:globalThis);
