/* Approved Last4 questions shown beside the student's priority diagnosis. */
(function(root){
  'use strict';

  var DATA_URL='bank/data/last4-reviewed.json?v=20261022-reviewed';
  var dataPromise=null;
  function load(){
    if(!dataPromise)dataPromise=fetch(DATA_URL,{cache:'no-cache'}).then(function(response){
      if(!response.ok)throw new Error('approved questions unavailable');
      return response.json();
    }).catch(function(error){dataPromise=null;throw error;});
    return dataPromise;
  }
  function group(data,no){
    if(!data||data.sourceSet!=='last'||Number(data.sourceRound)!==4||
      !data.freezePolicy||data.freezePolicy.fixedItemCount!==90||
      !Array.isArray(data.freezePolicy.availableSourceNos)||!data.freezePolicy.availableSourceNos.includes(no)||
      !Array.isArray(data.items)||data.items.length!==90)return null;
    var prefix='last4-q'+String(no).padStart(2,'0');
    var items=data.items.filter(function(item){return Number(item.sourceNo)===no;}).sort(function(a,b){return a.variantNo-b.variantNo;});
    if(items.length!==3||items.some(function(item,index){
      return item.sourceSet!=='last'||Number(item.sourceRound)!==4||item.genId!==prefix||
        item.id!==prefix+'-v'+(index+1)||Number(item.variantNo)!==index+1||
        item.reviewStatus!=='verified'||!String(item.text||'').trim()||
        item.asset&&(item.asset.kind!=='raster'||!/^data:image\/png;base64,/.test(item.asset.src||''));
    }))return null;
    return items;
  }
  function node(tag,className,value){
    var element=document.createElement(tag);
    if(className)element.className=className;
    if(value!=null)element.textContent=value;
    return element;
  }
  function card(item){
    var article=node('article','last3-practice-question');
    article.dataset.itemId=item.id;
    article.appendChild(node('h4','',item.sourceNo+'번 · 유사문제 '+item.variantNo));
    article.appendChild(node('p','last3-practice-prompt',item.text));
    if(Array.isArray(item.promptDataLines)&&item.promptDataLines.length){
      var given=node('div','last3-practice-given');
      given.appendChild(node('strong','',item.promptDataLabel||'주어진 자료'));
      item.promptDataLines.forEach(function(line){given.appendChild(node('p','',line));});
      article.appendChild(given);
    }
    if(item.asset){
      var image=node('img','last3-practice-figure');
      image.src=item.asset.src;
      image.alt=item.asset.description||'문항 그림';
      image.loading='lazy';
      article.appendChild(image);
    }
    article.appendChild(node('div',item.answerContract==='draw-symbols'?'last3-practice-draw':'last3-practice-answerline',item.answerContract==='draw-symbols'?'그림을 그릴 곳':'답 ____________________'));
    return article;
  }
  async function render(host,nos){
    if(!host)return;
    host.replaceChildren();
    var selected=Array.isArray(nos)?nos.map(Number):[];
    if(!selected.length)return;
    var status=node('p','last3-practice-status','이번 주 유사문제를 불러오는 중입니다.');
    host.appendChild(status);
    try{
      var data=await load();
      if(!host.isConnected)return;
      var groups=selected.map(function(no){return {no:no,items:group(data,no)};});
      if(groups.some(function(entry){return !entry.items;}))throw new Error('approved group missing');
      host.replaceChildren();
      host.appendChild(node('h3','', '이번 주 추천 '+groups.length+'문항 · 문항마다 유사문제 3개 (총 '+(groups.length*3)+'문제)'));
      groups.forEach(function(entry){
        var section=node('section','last3-practice-group');
        section.dataset.sourceNo=String(entry.no);
        section.appendChild(node('h4','',entry.no+'번 유형 · 유사문제 3개'));
        var questions=node('div','last3-practice-grid');
        entry.items.forEach(function(item){questions.appendChild(card(item));});
        section.appendChild(questions);
        host.appendChild(section);
      });
    }catch(error){
      if(!host.isConnected)return;
      host.replaceChildren();
      var warning=node('p','last3-practice-status','유사문제 3개를 확인하지 못했습니다. 다시 불러와 주세요.');
      var retry=node('button','last3-practice-retry','다시 불러오기');
      retry.type='button';retry.addEventListener('click',function(){render(host,selected);});
      host.append(warning,retry);
    }
  }
  root.GFIELD_LAST4_REPORT_PRACTICE=Object.freeze({render:render});
})(window);
