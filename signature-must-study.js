/* Approved, fixed Signature questions shown inside the diagnostic summary. */
(function (global) {
  'use strict';

  function node(tag, className, text) {
    var element=document.createElement(tag);
    if(className)element.className=className;
    if(text!=null)element.textContent=String(text);
    return element;
  }

  function approvedGroup(data, row, round) {
    var items=data.items.filter(function (item) {
      return item.genId===row.generatorId&&Number(item.sourceNo)===Number(row.no);
    }).sort(function (a,b) {return a.variantNo-b.variantNo;});
    if(items.length!==3||items.some(function (item,index) {
      return item.reviewStatus!=='verified'||item.id!==row.generatorId+'-v'+(index+1)||
        item.sourceSet!=='original'||Number(item.sourceRound)!==round||!item.text||item.answer==null;
    }))return null;
    return {row:row,items:items};
  }

  function bankUrl(round, student, groups) {
    var query=new URLSearchParams({
      bank:'original'+round,practice:'wrong',
      gens:groups.map(function (group) {return group.row.generatorId;}).join(','),
      source:'original|'+round,
      sourceNos:groups.map(function (group) {return group.row.no;}).join(','),
      per:'3',points:'all',printMode:'both',view:'grouped'
    });
    return 'bank/index.html?'+query.toString()+'#'+new URLSearchParams({student:student}).toString();
  }

  async function mount(root, options) {
    if(!root)return;
    var list=root.querySelector('.signature-study-list');
    var round=Number(options.round);
    var printButton=options.printButton;
    var rows=(options.ready||[]).slice();
    var preferred=options.preferred||[];
    rows.sort(function (a,b) {
      var ai=preferred.indexOf(a.no),bi=preferred.indexOf(b.no);
      return (ai<0?99:ai)-(bi<0?99:bi)||a.no-b.no;
    });
    if(!rows.length){
      list.textContent=options.hasWrong?'승인된 유사문제가 아직 연결되지 않았습니다. 위 원문 번호부터 복습하세요.':'이번 회차 미정답이 없어 자동 배정한 유사문제가 없습니다.';
      return;
    }
    if(printButton)printButton.disabled=true;
    try{
      var response=await fetch('bank/data/original'+round+'-fixed90.json?v=20260929',{cache:'no-cache'});
      if(!response.ok)throw new Error('approved bank unavailable');
      var data=await response.json();
      if(!root.isConnected)return;
      if(data.sourceSet!=='original'||Number(data.sourceRound)!==round||!Array.isArray(data.items))throw new Error('bank mismatch');
      var groups=rows.map(function (row) {return approvedGroup(data,row,round);}).filter(Boolean).slice(0,3);
      if(!groups.length)throw new Error('no approved groups');

      // Spread three displayed questions across up to three approved types.
      // With only one eligible type, show its three fixed variants.
      var chosen=[];
      for(var variant=0;variant<3&&chosen.length<3;variant++)groups.forEach(function (group) {
        if(chosen.length<3)chosen.push({row:group.row,item:group.items[variant]});
      });
      list.replaceChildren();
      list.removeAttribute('role');
      chosen.forEach(function (entry,index) {
        var item=entry.item;
        var card=node('article','signature-study-item');
        card.setAttribute('data-signature-study-id',item.id);
        card.appendChild(node('h4','', '유사문제 '+(index+1)+' · 원문 '+entry.row.no+'번 유형 · '+entry.row.type));
        card.appendChild(node('div','signature-study-question',item.text));
        if(Array.isArray(item.promptDataLines)&&item.promptDataLines.length)card.appendChild(node('div','signature-study-data',item.promptDataLines.join('\n')));
        var asset=item.asset;
        if(asset&&asset.kind==='raster'&&/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(String(asset.src||''))){
          var image=node('img','signature-study-asset');
          image.src=asset.src;
          image.alt=asset.description||'문제에 필요한 그림';
          card.appendChild(image);
        }
        var work=node('div','signature-study-work');
        work.setAttribute('aria-label','풀이와 답을 쓰는 칸');
        for(var line=0;line<4;line++)work.appendChild(node('span','signature-study-line'));
        card.appendChild(work);
        list.appendChild(card);
      });
      var link=node('a','signature-study-link no-print','추천 유형 전체 학습지 · 정답·풀이 보기');
      link.href=bankUrl(round,options.student,groups);
      link.target='_blank';link.rel='noopener';
      root.appendChild(link);
    }catch(error){
      if(root.isConnected)list.textContent='유사문제를 불러오지 못했습니다. 새로고침 후 다시 확인해 주세요.';
    }finally{
      if(printButton&&root.isConnected)printButton.disabled=false;
    }
  }

  global.GFIELD_SIGNATURE_MUST_STUDY={mount:mount};
})(window);
