/* GFIELD 학생 화면 v2: 특강 뷰어 연결 + 날씨 인사 + 두 캐릭터 로드맵 */
(function(){
  if(!window.GFIELD_DATA) return;

  const style=document.createElement('style');
  style.textContent=`
    .special-viewer-panel{margin:12px 0 4px;padding:14px;border-radius:17px;background:linear-gradient(135deg,#f5f3ff,#fff);border:1px solid #ddd6fe;box-shadow:0 8px 22px rgba(109,40,217,.1)}
    .special-viewer-title{font-size:13px;font-weight:900;color:#6d28d9;margin-bottom:8px;display:flex;align-items:center;gap:6px}
    .special-viewer-link{display:flex;align-items:center;gap:9px;width:100%;padding:12px 14px;margin-top:7px;border-radius:13px;background:linear-gradient(135deg,#315b9a,#183968);color:#fff;text-decoration:none;font-size:14px;font-weight:900;box-shadow:0 7px 16px rgba(30,60,114,.2);transition:.16s}
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

  /* 활용 모의고사 전체 책장은 온라인 외부학생 전용입니다.
     재원생은 로드맵 특강에서 승인된 회차만 이용합니다. */
  if(typeof canSeeFolder==='function'){
    const originalCanSeeFolder=canSeeFolder;
    canSeeFolder=function(folder){
      if(folder==='활용 모의고사'&&((D.studentTypes||{})[currentStudent])!=='online')return false;
      return originalCanSeeFolder(folder);
    };
  }

  function dayGreeting(){
    const h=new Date().getHours();
    if(h<6)return'늦은 시간이야. 오늘은 충분히 쉬고 내일 다시 만나자';
    if(h<11)return'좋은 아침! 머리가 맑을 때 정확하게 한 문제씩 시작하자';
    if(h<17)return'반가워! 오늘 배울 내용을 차분하게 정복해 보자';
    if(h<21)return'오늘도 수고했어. 마지막까지 서두르지 말고 정확하게 가자';
    return'오늘 하루도 고생 많았어. 짧게 복습하고 푹 쉬자';
  }
  function weatherLine(w){
    if(!w||!w.current)return'날씨와 상관없이 마음은 가볍게, 문제는 꼼꼼하게!';
    const t=Math.round(w.current.temperature_2m),c=Number(w.current.weather_code);
    if([51,53,55,56,57,61,63,65,66,67,80,81,82,95,96,99].includes(c))return`지금 ${t}도, 비 소식이 있어. 우산 챙기고 차분하게 집중하자`;
    if(t>=30)return`지금 ${t}도야. 물 한 모금 마시고 시원하게 시작하자`;
    if(t<=5)return`지금 ${t}도로 쌀쌀해. 손을 따뜻하게 하고 시작하자`;
    return`지금 ${t}도야. 편안한 마음으로 오늘의 한 칸을 채워 보자`;
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
        ? `${esc2(given)} 학생은 현재 <b>${esc2(node?node.title:'오늘의 학습')}</b> 구간을 지나고 있습니다. ${esc2(weatherLine(w))}`
        : `<b>${esc2(given)}${esc2(josa(given))}</b>, ${esc2(dayGreeting())}. 오늘의 위치는 <b>${esc2(node?node.title:'학습 준비')}</b>야. ${esc2(weatherLine(w))}`;
      mood.innerHTML=(mode==='parent'?'<b>💛 DOCSSAM의 오늘 안내</b>':'<b>💛 DOCSSAM이 보내는 오늘의 인사</b>')+`<span class="brief-personal">${detail}</span>`;
      if(typeof renderTimeline==='function')renderTimeline();
    };
  }

  if(typeof showCheer==='function'){
    showCheer=function(given){
      const el=document.getElementById('cheer'),t=document.getElementById('cheer-text'),node=currentNode();
      if(!el||!t)return;
      const main=`${esc2(given)}${esc2(josa(given))}, 반가워!<br>${esc2(dayGreeting())}`;
      const sub=`${esc2(node?node.title:'오늘의 학습')} · ${esc2(weatherLine(window.GFIELD_WEATHER))}`;
      t.innerHTML=`${main}<small>${sub}</small>`;
      el.classList.remove('hidden');
      setTimeout(()=>el.classList.add('hidden'),3900);
    };
  }

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
      const links=unique.map(r=>`<a class="special-viewer-link" href="mock.html?set=hw&round=${r}&name=${encodeURIComponent(currentStudent)}"><span>📝</span> 활용 모의고사 ${r}회 시험지·오답 분석 <small>워터마크 뷰어 ›</small></a>`).join('');
      return `<div class="special-viewer-panel"><div class="special-viewer-title">⭐ 방학특강 승인 회차</div>${links}<div style="margin-top:8px;font-size:11px;color:#74668c;line-height:1.55">승인된 회차만 표시됩니다. 외부 수강생과 같은 JPG 워터마크 뷰어와 오답 분석을 사용합니다.</div></div>`+base;
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