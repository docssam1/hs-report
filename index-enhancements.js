/* GFIELD 학생 화면 v2: 특강 뷰어 연결 + 날씨 인사 + 두 캐릭터 로드맵 */
(function(){
  if(!window.GFIELD_DATA) return;

  const style=document.createElement('style');
  style.textContent=`
    .special-viewer-panel{margin:12px 0 4px;padding:14px;border-radius:17px;background:linear-gradient(135deg,#f5f3ff,#fff);border:1px solid #ddd6fe;box-shadow:0 8px 22px rgba(109,40,217,.1)}
    .special-viewer-title{font-size:13px;font-weight:900;color:#6d28d9;margin-bottom:8px;display:flex;align-items:center;gap:6px}
    .special-viewer-link{display:flex;align-items:center;gap:9px;width:100%;padding:12px 14px;margin-top:7px;border:0;border-radius:13px;background:linear-gradient(135deg,#315b9a,#183968);color:#fff;text-decoration:none;font-size:14px;font-weight:900;box-shadow:0 7px 16px rgba(30,60,114,.2);transition:.16s;cursor:pointer;text-align:left}
    .special-viewer-link:hover{transform:translateY(-2px);box-shadow:0 10px 22px rgba(30,60,114,.25)}
    .special-viewer-link small{margin-left:auto;font-size:10.5px;font-weight:700;color:#cfe0f7}
    .timeline{padding-left:74px}
    .timeline::before{left:25px;width:5px;box-shadow:0 0 0 5px rgba(249,115,22,.05)}
    .icon-status{left:-61px}
    .companion-marker{position:absolute;left:-84px;top:-53px;width:92px;height:67px;z-index:7;pointer-events:none}
    .companion-marker .friend{position:absolute;width:47px;height:58px;filter:drop-shadow(0 7px 7px rgba(85,48,24,.18))}
    .companion-marker .friend.boy{left:0;bottom:0;animation:friendLead .58s ease-in-out infinite}
    .companion-marker .friend.girl{left:35px;bottom:2px;animation:friendFollow .58s ease-in-out infinite .13s}
    .companion-marker svg{width:100%;height:100%;overflow:visible}
    .companion-bubble{position:absolute;left:72px;top:-20px;width:max-content;max-width:205px;padding:8px 11px;border-radius:14px 14px 14px 4px;background:#fff;color:#5d4634;border:1px solid #f4d7b8;box-shadow:0 7px 18px rgba(111,74,40,.15);font-size:11.5px;font-weight:800;line-height:1.45;animation:bubbleFloat 2.8s ease-in-out infinite}
    .node.current{background:linear-gradient(135deg,#fff,#fff8ee);overflow:visible}
    .node.current::after{content:'';position:absolute;inset:-2px;border-radius:18px;border:1px solid rgba(249,115,22,.28);pointer-events:none}
    .brief-card{position:relative;overflow:hidden;background:linear-gradient(145deg,#fff,#fffaf4)}
    .brief-card::after{content:'✦';position:absolute;right:14px;top:5px;font-size:56px;color:rgba(249,115,22,.07);transform:rotate(12deg);pointer-events:none}
    .brief-mood{position:relative;z-index:1}
    .brief-personal{display:block;margin-top:5px;color:#5a4432;font-weight:600}
    @keyframes friendLead{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-5px) rotate(2deg)}}
    @keyframes friendFollow{0%,100%{transform:translateY(-2px) rotate(2deg)}50%{transform:translateY(3px) rotate(-2deg)}}
    @keyframes bubbleFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
    @media(max-width:600px){
      .timeline{padding-left:58px}.timeline::before{left:18px}.icon-status{left:-48px}
      .companion-marker{left:-65px;transform:scale(.82);transform-origin:left bottom}
      .companion-bubble{left:61px;max-width:150px;font-size:10.5px}
    }
  `;
  document.head.appendChild(style);

  function esc2(s){return String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
  function currentNode(){return (D.nodes||[]).find(n=>n.id===D.meta.currentWeekId)||null;}

  /* 활용 모의고사 책장: 관리자 콘솔의 폴더 권한(archiveAccess) 체크를 그대로 따른다.
     온라인 외부생·재원생 구분 없이, 체크된 학생에게만 보인다. */

  function dayGreeting(){
    const h=new Date().getHours();
    if(h<6)return'아직 깜깜한 시간이야. 푹 자고 내일 만나자';
    if(h<11)return'좋은 아침이야! 머리가 제일 맑을 때야';
    if(h<17)return'오늘도 만나서 반가워!';
    if(h<21)return'저녁 먹었어? 오늘의 마지막 한 문제까지 힘내자';
    return'오늘 하루 열심히 보냈구나. 조금만 하고 푹 쉬자';
  }
  function seasonLine(){
    const m=new Date().getMonth()+1;
    if(m===7||m===8)return'여름방학은 실력이 쑥 크는 시간이야';
    if(m===12||m===1)return'겨울방학은 실력을 단단히 다지는 시간이야';
    return'';
  }
  function weatherLine(w){
    const season=seasonLine();
    if(!w||!w.current)return season?season+'. 오늘도 한 문제씩 차근차근!':'오늘도 한 문제씩 차근차근 해보자!';
    const t=Math.round(w.current.temperature_2m),c=Number(w.current.weather_code);
    const rainy=[51,53,55,56,57,61,63,65,66,67,80,81,82,95,96,99].includes(c);
    if(rainy)return`밖에 비가 와(지금 ${t}도). 비 오는 날은 집중이 잘 되는 날이야. 우산 꼭 챙기고!`;
    if(t>=33)return`오늘 ${t}도, 정말 덥다! 시원한 물 옆에 두고 천천히 해보자`;
    if(t>=28)return`오늘 ${t}도로 더운 날이야. 시원한 곳에서 한 문제씩 해보자`;
    if(t<=0)return`오늘 ${t}도, 꽁꽁 어는 날씨야! 손 따뜻하게 하고 시작하자`;
    if(t<=8)return`오늘 ${t}도로 쌀쌀해. 따뜻하게 입고 공부하자`;
    return season?`오늘 ${t}도, 공부하기 딱 좋은 날씨야. ${season}!`:`오늘 ${t}도, 공부하기 딱 좋은 날씨야!`;
  }
  function weatherLineParent(w){
    if(!w||!w.current)return'오늘도 아이의 한 걸음을 응원해 주세요.';
    const t=Math.round(w.current.temperature_2m),c=Number(w.current.weather_code);
    const rainy=[51,53,55,56,57,61,63,65,66,67,80,81,82,95,96,99].includes(c);
    if(rainy)return`오늘은 비 소식이 있습니다(현재 ${t}도). 등하원 시 우산을 챙겨 주세요.`;
    if(t>=30)return`현재 ${t}도로 무더운 날씨입니다. 아이가 시원한 환경에서 학습할 수 있도록 살펴 주세요.`;
    if(t<=5)return`현재 ${t}도로 쌀쌀합니다. 따뜻하게 입혀 보내 주세요.`;
    return`현재 ${t}도입니다. 오늘도 아이의 한 걸음을 응원해 주세요.`;
  }
  function roadmapBubble(node){
    const w=window.GFIELD_WEATHER;
    const c=w&&w.current?Number(w.current.weather_code):null;
    if(c!=null&&[51,53,55,61,63,65,80,81,82].includes(c))return'비 오는 날엔 더 차분하게! ☔';
    if(node&&node.type==='special')return'승인된 특강 회차만 함께 가요 ⭐';
    if(node&&/모의고사/.test((node.title||'')+' '+(node.desc||'')))return'틀린 문제는 성장 지도야! 📝';
    return'우리 둘과 오늘도 한 칸 전진! ✨';
  }

  if(typeof loadWeather==='function'){
    const originalLoadWeather=loadWeather;
    loadWeather=async function(){
      const now=Date.now();
      if(window.GFIELD_WEATHER&&window.GFIELD_WEATHER_AT&&now-window.GFIELD_WEATHER_AT<10*60*1000)return window.GFIELD_WEATHER;
      const w=await originalLoadWeather();
      window.GFIELD_WEATHER=w;window.GFIELD_WEATHER_AT=now;
      return w;
    };
  }

  if(typeof renderBriefing==='function'){
    const originalRenderBriefing=renderBriefing;
    renderBriefing=async function(){
      await originalRenderBriefing();
      if(!currentStudent||isDemo)return;
      const mood=document.querySelector('#briefing .brief-mood');
      if(!mood)return;
      const given=givenName(currentStudent),node=currentNode(),mode=audienceMode();
      const w=window.GFIELD_WEATHER;
      const detail=mode==='parent'
        ? `${esc2(given)} 학생은 현재 <b>${esc2(node?node.title:'오늘의 학습')}</b> 구간을 지나고 있습니다. ${esc2(weatherLineParent(w))}`
        : `<b>${esc2(given)}${esc2(josa(given))}</b>, ${esc2(dayGreeting())}. 지금 우리는 <b>${esc2(node?node.title:'학습 준비')}</b>를 하고 있어. ${esc2(weatherLine(w))}`;
      mood.innerHTML=(mode==='parent'?'<b>💛 DOCSSAM의 오늘 안내</b>':'<b>💛 DOCSSAM이 보내는 오늘의 인사</b>')+`<span class="brief-personal">${detail}</span>`;
      if(typeof renderTimeline==='function')renderTimeline();
    };
  }

  if(typeof showCheer==='function'){
    showCheer=function(given){
      const el=document.getElementById('cheer'),t=document.getElementById('cheer-text'),node=currentNode();
      if(!el||!t)return;
      const main=`${esc2(given)}${esc2(josa(given))}, 어서 와!<br>${esc2(dayGreeting())}`;
      const sub=`${esc2(node?node.title:'오늘의 학습')} · ${esc2(weatherLine(window.GFIELD_WEATHER))}`;
      t.innerHTML=`${main}<small>${sub}</small>`;
      el.classList.remove('hidden');
      setTimeout(()=>el.classList.add('hidden'),3900);
    };
  }

  /* 재원생 특강도 외부생과 동일한 책 뷰어를 사용 */
  window.openSpecialHwBook=function(round){
    const r=String(round);
    const rx=new RegExp('활용\\s*모의고사\\s*'+r+'\\s*회');
    const original=(D.books||[]).find(b=>b&&b.folder==='활용 모의고사'&&rx.test(String(b.title||'')));
    if(!original){if(typeof toast==='function')toast('활용 모의고사 '+r+'회 뷰어를 찾지 못했습니다.');return;}
    const book=Object.assign({},original,{links:(original.links||[]).map(l=>{
      if(!l||!l.url)return l;
      let u=l.url;
      if(/mock\.html/i.test(u))u+=(u.includes('?')?'&':'?')+'name='+encodeURIComponent(currentStudent||'');
      return Object.assign({},l,{url:u});
    })});
    if(typeof closeModal==='function')closeModal();
    if(typeof openBook==='function')openBook(book);
  };

  if(typeof sectionsHTML==='function'){
    const originalSectionsHTML=sectionsHTML;
    sectionsHTML=function(c,node){
      let base=originalSectionsHTML(c,node);
      if(!node||node.type!=='special'||!currentStudent||!((D.specialStudents||[]).includes(currentStudent)))return base;
      const rounds=[];
      (c.textbooks||[]).forEach(t=>{
        if(Array.isArray(t.access)&&!t.access.includes(currentStudent))return;
        const m=String(t.title||'').match(/활용\s*모의고사\s*(\d+)\s*회/)||String(t.title||'').match(/모의고사\s*(\d+)\s*회\s*활용\s*시험지/);
        if(m)rounds.push(String(+m[1]));
      });
      const unique=[...new Set(rounds)].sort((a,b)=>+a-+b);
      if(!unique.length)return base;
      const links=unique.map(r=>`<button type="button" class="special-viewer-link" onclick="openSpecialHwBook('${r}')"><span>📝</span> 활용 모의고사 ${r}회 강의·시험지 뷰어 <small>오답분석 포함 ›</small></button>`).join('');
      return `<div class="special-viewer-panel"><div class="special-viewer-title">⭐ 방학특강 승인 회차</div>${links}<div style="margin-top:8px;font-size:11px;color:#74668c;line-height:1.55">승인된 회차만 표시됩니다. 외부 수강생과 같은 강의·JPG 워터마크 뷰어와 별도 오답 분석을 사용합니다.</div></div>`+base;
    };
  }

  if(typeof renderTimeline==='function'){
    renderTimeline=function(){
      const tl=document.getElementById('timeline');if(!tl)return;tl.innerHTML='';
      D.nodes.forEach(node=>{
        if(node.type==='divider'){const d=document.createElement('div');d.className='divider';d.innerHTML=`<span>${esc2(node.label)}</span>`;tl.appendChild(d);return}
        if(node.type==='goal'){const g=document.createElement('div');g.className='node goal';g.innerHTML=`<div class="date">${esc2(node.date)}</div><h3 class="disp">${esc2(node.title)}</h3><div class="desc">${esc2(node.desc)}</div>`;tl.appendChild(g);return}
        const unlocked=isUnlocked(node),isCurrent=node.id===D.meta.currentWeekId,el=document.createElement('div');
        el.className=`node ${node.track}${unlocked?'':' locked'}${isCurrent?' current':''}`;
        const icon=node.type==='special'?(unlocked?'⭐':'🔒'):(unlocked?'🔓':'🔒');
        const friends=isCurrent?`<div class="companion-marker"><div class="friend boy">${RUNNER_BOY}</div><div class="friend girl">${RUNNER_GIRL}</div><div class="companion-bubble">${esc2(roadmapBubble(node))}</div></div>`:'';
        el.innerHTML=`${friends}<div class="icon-status">${icon}</div><div class="date">${esc2(node.date)}${isCurrent?' · 현재 진행 중':''}</div><h3 class="disp">${esc2(node.title)}</h3><div class="desc">${esc2(node.desc)}</div>${node.focus?`<div class="focus">${esc2(node.focus)}</div>`:''}`;
        el.onclick=()=>openModal(node,unlocked);
        if(node.type==='special'){const w=document.createElement('div');w.className='special-branch';w.innerHTML='<span class="branch-tag">특강</span>';w.appendChild(el);tl.appendChild(w)}else tl.appendChild(el);
      });
    };
  }

  setTimeout(function(){
    if(typeof currentStudent!=='undefined'&&currentStudent){
      try{renderTimeline();renderBriefing()}catch(e){}
    }
  },80);
})();

/* ===== 최종 모의고사 진단 분석지 연결 (자료실 카드 + 로드맵 버튼) ===== */
(function(){
  if(!window.GFIELD_DATA) return;
  var LAST1_URL='last1-analysis.html';

  var st=document.createElement('style');
  st.textContent='.last1-node-btn{display:inline-flex;align-items:center;gap:5px;margin-top:10px;padding:8px 14px;border:0;border-radius:10px;background:linear-gradient(135deg,#315b9a,#183968);color:#fff;font-size:12.5px;font-weight:800;cursor:pointer;box-shadow:0 5px 12px rgba(30,60,114,.22)}.last1-node-btn:hover{transform:translateY(-1px)}';
  document.head.appendChild(st);

  function last1Card(){
    return '<div class="folder" style="border:1px solid #c7d7f0">'+
      '<div class="folder-h" style="background:linear-gradient(135deg,#2a5298,#1e3c72)"><span class="folder-ic">📊</span>최종 모의고사 진단 분석지<span class="folder-c">NEW</span></div>'+
      '<div class="folder-b" style="padding:14px 16px 16px">'+
        '<div style="font-size:13px;color:#54607a;line-height:1.6;margin-bottom:10px">최종 모의고사를 본 후 <b>틀린 번호만 입력</b>하면 점수·석차·예상 결과와 약점 유형 분석지가 바로 만들어져요. 결과는 선생님께 자동으로 전달됩니다.</div>'+
        '<button class="tb-btn" style="background:linear-gradient(135deg,#315b9a,#183968);box-shadow:0 6px 16px rgba(30,60,114,.25)" onclick="window.open(\''+LAST1_URL+'\',\'_blank\')"><span class="ico">📊</span>최종 1회 분석지 만들기</button>'+
      '</div></div>';
  }

  if(typeof renderArchive==='function'){
    var oa=renderArchive;
    renderArchive=function(){
      oa();
      var list=document.getElementById('archive-list');
      if(list && !document.getElementById('last1-arc')){
        var w=document.createElement('div'); w.id='last1-arc'; w.innerHTML=last1Card();
        list.insertBefore(w, list.firstChild);
      }
    };
  }

  if(typeof renderTimeline==='function'){
    var ot=renderTimeline;
    renderTimeline=function(){
      ot();
      try{
        document.querySelectorAll('#timeline .node').forEach(function(el){
          var h=el.querySelector('h3'); if(!h) return;
          var t=h.textContent||'';
          if(!(/최종/.test(t)&&/모의고사/.test(t)&&/1\s*회/.test(t))) return;
          if(el.querySelector('.last1-node-btn')) return;
          var b=document.createElement('button');
          b.type='button'; b.className='last1-node-btn';
          b.innerHTML='📊 시험 본 후 분석지 만들기';
          b.onclick=function(ev){ ev.stopPropagation(); window.open(LAST1_URL,'_blank'); };
          el.appendChild(b);
        });
      }catch(e){}
    };
  }

  setTimeout(function(){
    try{
      if(typeof currentStudent!=='undefined'&&currentStudent){renderArchive();renderTimeline();}
    }catch(e){}
  },140);
})();

/* ===== 책 뷰어: 단원 버튼을 새 창 대신 화면 안에서 전환 =====
   - 유튜브 링크는 왼쪽 영상칸을 그 자리에서 바꿔 재생
   - 교재는 해당 단원 시작 쪽으로 자동 스크롤
   - 쪽수는 아래 PAGEMAP > 라벨/URL의 쪽수 표기(p8, 8쪽, #p8) 순으로 찾음
   - 유튜브가 아닌 링크(모의고사 채점 등)는 기존처럼 새 창 유지 */
(function(){
  /* 교재별 단원 시작 쪽 (교재 제목 일부 → 라벨 → 쪽) */
  var PAGEMAP=[
    { match:/THINKING\s*BASIC|응용\s*개념/i, pages:{
      '1단원개념':4,  '1단원필수유형':8,
      '2단원개념':16, '2단원필수유형':22,
      '3단원개념':30, '3단원필수유형':35
    }}
  ];

  var stx=document.createElement('style');
  stx.textContent='.bv-act.on{outline:2px solid #fff;outline-offset:-2px;box-shadow:0 0 0 3px rgba(255,255,255,.35)}'+
    'button.bv-act{border:0;cursor:pointer;font-family:inherit}';
  document.head.appendChild(stx);

  function ytId(u){
    var m=String(u||'').match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/))([A-Za-z0-9_-]{6,})/);
    return m?m[1]:'';
  }
  function ytStart(u){
    var m=String(u||'').match(/[?&](?:t|start)=(\d+)/);
    return m?+m[1]:0;
  }
  function mapPage(title,label){
    var key=String(label||'').replace(/\s+/g,'');
    for(var i=0;i<PAGEMAP.length;i++){
      if(!PAGEMAP[i].match.test(String(title||''))) continue;
      var t=PAGEMAP[i].pages;
      if(t[key]) return t[key];
      for(var k in t){ if(key.indexOf(k)>=0) return t[k]; }
    }
    return 0;
  }
  function pageOf(title,label,url){
    var p=mapPage(title,label); if(p) return p;
    var m=String(url||'').match(/#p(?:age)?=?(\d+)/i); if(m) return +m[1];
    m=String(label||'').match(/(\d+)\s*(?:쪽|페이지)/); if(m) return +m[1];
    m=String(label||'').match(/\bp\.?\s*(\d+)\b/i); return m?+m[1]:0;
  }
  function vidFrame(){ return document.querySelector('#bv-stage .bv-vid iframe'); }
  function swapVideo(url){
    var f=vidFrame(); if(!f) return false;
    var id=ytId(url); if(!id) return false;
    var s=ytStart(url);
    f.src='https://www.youtube.com/embed/'+id+'?autoplay=1&rel=0&playsinline=1'+(s?('&start='+s):'');
    return true;
  }
  function goPage(n){
    if(!n) return;
    var doc=document.querySelector('#bv-stage .bv-doc.scroll');
    if(doc){
      var pgs=doc.querySelectorAll('.bv-pg'), pg=pgs[n-1];
      if(pg){ doc.scrollTo({top:pg.offsetTop-doc.offsetTop-8,behavior:'smooth'}); return; }
    }
    var pf=document.querySelector('#bv-stage .bv-doc iframe');
    if(pf && /\.pdf/i.test(pf.src||'')){
      pf.src=String(pf.src).split('#')[0]+'#page='+n+'&toolbar=0&navpanes=0&view=FitH';
    }
  }
  function enhance(){
    var box=document.getElementById('bv-actions'); if(!box) return;
    if(!vidFrame()) return;                    /* 영상칸이 없으면 손대지 않음 */
    var title=(document.getElementById('bv-name')||{}).textContent||'';
    Array.prototype.slice.call(box.querySelectorAll('a.bv-act')).forEach(function(a){
      var url=a.getAttribute('href')||'';
      if(!ytId(url)) return;                   /* 유튜브가 아니면 그대로 새 창 */
      var label=(a.textContent||'').replace(/^\s*[🔗▶]\s*/,'').trim();
      var pg=pageOf(title,label,url);
      var b=document.createElement('button');
      b.type='button'; b.className='bv-act';
      b.textContent='▶ '+label;
      b.title=pg?(label+' · 교재 '+pg+'쪽으로 이동'):label;
      b.addEventListener('click',function(){
        swapVideo(url); goPage(pg);
        Array.prototype.slice.call(box.querySelectorAll('.bv-act')).forEach(function(x){x.classList.remove('on');});
        b.classList.add('on');
      });
      a.parentNode.replaceChild(b,a);
    });
  }
  function hook(){
    if(typeof window.openBook!=='function') return false;
    var ob=window.openBook;
    window.openBook=function(b){ var r=ob.apply(this,arguments); setTimeout(enhance,30); return r; };
    return true;
  }
  if(!hook()) setTimeout(hook,300);
})();
