/* GFIELD 학생 화면 v2: 특강 뷰어 연결 + 날씨 인사 + 두 캐릭터 로드맵 */

/* ===== 로드맵 구조·문구 갱신 (data.js를 건드리지 않고 화면 표시만 교체) =====
   관리자 콘솔에서 같은 내용으로 저장하면 이 블록은 지워도 됩니다.
   ※ 어드민(admin-mock-v2.js)의 같은 블록과 내용을 맞춰 두었습니다. */
(function(){
  var D=window.GFIELD_DATA; if(!D||!Array.isArray(D.nodes)) return;
  var N=D.nodes;
  function find(rx){ for(var i=0;i<N.length;i++){ var n=N[i]; if(n&&n.date&&rx.test(String(n.date))) return i; } return -1; }
  function idx(id){ for(var i=0;i<N.length;i++){ if(N[i]&&N[i].id===id) return i; } return -1; }

  /* 8월 5주차가 없으면 8월 4주차 뒤에 새로 만들어 넣는다 */
  if(find(/8\s*월\s*5\s*주차/)<0){
    var i4=find(/8\s*월\s*4\s*주차/);
    if(i4>=0) N.splice(i4+1,0,{id:'aug-w5',type:'week',track:'exam',date:'8월 5주차',title:'',desc:'',focus:''});
  }

  var OVERRIDE=[
    { date:/7\s*월\s*4\s*주차/, title:'중급 모의고사 2회 리뷰 테스트',
      desc:'중급 2회 리뷰 테스트 + 중급 모의고사 3회',
      focus:'오답 원인 찾기 훈련 시작' },
    { date:/8\s*월\s*1\s*주차/, title:'THINKING CORE CH1 (3)',
      desc:'Thinking Core NUMBERS 수와 숫자의 개수 + 중급 3회 리뷰 테스트 + 중급 모의고사 4회',
      focus:'수와 숫자의 개수 마무리' },
    { date:/8\s*월\s*2\s*주차/, title:'THINKING CORE CH2 (1)',
      desc:'THINKING CORE CH2 Algebra(1) 나이·속력 + 중급 4회 리뷰테스트',
      focus:'나이·속력 문장제 집중' },
    { date:/8\s*월\s*3\s*주차/, title:'THINKING CORE CH2 (2)',
      desc:'THINKING CORE CH2 Algebra(1) 시계와 각·수배열표 + 중급 모의고사 5회',
      focus:'시계와 각 · 수배열표 훈련' },
    { date:/8\s*월\s*4\s*주차/, title:'THINKING CORE CH3',
      desc:'THINKING CORE CH3 Numbers & Case + 중급 모의고사 6회',
      focus:'수 · 경우의 수 통합 적용' },
    { date:/8\s*월\s*5\s*주차/, title:'THINKING CORE CH4',
      desc:'THINKING CORE CH4 Geometry + 중급 모의고사 5·6회 리뷰테스트',
      focus:'기하 마무리 · 심화 개념 종료', track:'exam' },
    { date:/9\s*월\s*1\s*주차/, title:'파이널 실전 모의고사 1회',
      desc:'파이널 과정 시작 · 신유형 지문 분석',
      focus:'파이널 난이도 적응 · 조건 해석 훈련', track:'final' },
    { date:/9\s*월\s*2\s*주차/, title:'파이널 실전 모의고사 2회',
      desc:'파이널 1회 오답 리뷰 + 파이널 2회 응시',
      focus:'OMR 마킹 · 시간 배분 훈련', track:'final' },
    { date:/9\s*월\s*3\s*주차/, title:'파이널 실전 모의고사 3회',
      desc:'파이널 2회 오답 리뷰 + 파이널 3회 응시',
      focus:'낯선 유형 적응 훈련', track:'final' },
    { date:/9\s*월\s*4\s*주차/, title:'파이널 실전 모의고사 4회',
      desc:'파이널 3회 오답 리뷰 + 파이널 4회 응시 · 누적 백분율 중간 점검',
      focus:'파이널 마무리 · 누적 백분율 점검', track:'final' },
    { date:/10\s*월\s*1\s*주차/, title:'최종 실전 모의고사 1회',
      desc:'파이널 4회 리뷰 + 최종 1회 응시 · 약점 유형 분석지 제공',
      focus:'90분 시간 배분 전략 · 약점 유형 확인', track:'final' },
    { date:/10\s*월\s*2\s*주차/, title:'최종 실전 모의고사 2회',
      desc:'최종 1회 오답 리뷰 + 최종 2회 응시',
      focus:'목표 레벨 기준선 점검', track:'final' },
    { date:/10\s*월\s*3\s*주차/, title:'최종 실전 모의고사 3회',
      desc:'최종 2회 오답 리뷰 + 최종 3회 응시',
      focus:'실전 리허설 · 누적 성적 최종 확인', track:'final' },
    { date:/10\s*월\s*4\s*주차/, title:'최종 실전 모의고사 4회 및 최종 정리',
      desc:'최종 4회 + 총정리 · 학부모 최종 상담',
      focus:'종강 · 시험 직전 컨디션 조절', track:'final' }
  ];
  N.forEach(function(n){
    if(!n || !n.date || n.type==='divider' || n.type==='goal') return;
    for(var i=0;i<OVERRIDE.length;i++){
      var o=OVERRIDE[i];
      if(o.date.test(String(n.date))){
        if(o.title) n.title=o.title;
        if(o.desc)  n.desc =o.desc;
        if(o.focus) n.focus=o.focus;
        if(o.track) n.track=o.track;
        break;
      }
    }
  });

  /* 8월 5주차 ↔ 9월 1주차(파이널 진입) 사이에 추가 모의고사 추천 배너 */
  if(!N.some(function(n){return n && n.id==='promo-final-prep';})){
    var i9=find(/9\s*월\s*1\s*주차/);
    if(i9>=0) N.splice(i9,0,{
      id:'promo-final-prep', type:'promo',
      label:'파이널 진입 전 · 추가 모의고사 추천',
      title:'파이널 전에 실전 감각을 더 쌓고 싶다면',
      desc:'중급 8회와 시크릿 추가 모의고사로 파이널 난이도에 미리 적응할 수 있어요. 한 주라도 더 실전을 겪은 학생이 파이널에서 흔들리지 않습니다.',
      cta:'추가 모의고사 문의하기', url:'https://open.kakao.com/me/gfield'
    });
  }

  /* Phase 구분선 위치 정리 */
  function moveBefore(id, rx){
    var i=idx(id); if(i<0) return;
    var j=find(rx); if(j<0) return;
    if(j===i+1) return;
    var node=N.splice(i,1)[0];
    var t=find(rx);
    if(t<0){ N.splice(i,0,node); return; }
    N.splice(t,0,node);
  }
  moveBefore('div-mock',  /7\s*월\s*4\s*주차/);
  moveBefore('div-final', /9\s*월\s*1\s*주차/);
})();

/* ===== 10월 최종 1~4회 · PDF가 아닌 HTML/SVG 시험지 흐름 =====
   data.js는 관리자 저장 때 다시 만들어지므로, 학생 화면에서만 안전하게 링크를
   보정한다. 시험지·타이머·답안 모두 final.html의 준비 상태 검사를 먼저 거친다. */
(function(){
  var data=window.GFIELD_DATA;
  if(!data||!Array.isArray(data.books)) return;
  var books=data.books.filter(function(b){
    return b && b.folder==='최종 모의고사' && /최종\s*실전\s*모의고사\s*[1-4]\s*회/.test(String(b.title||''));
  });
  if(!books.length) return;
  books.forEach(function(book){
    var match=String(book.title||'').match(/([1-4])\s*회/);
    if(!match) return;
    var base='https://hs.gfieldacademy.net/final.html?set=last&round='+match[1];
    book.pdf='';
    book.links=[
      {label:'시험지 보기·인쇄',url:base+'&go=paper'},
      {label:'실전 타이머',url:base+'&go=timer'},
      {label:'답안·해설',url:base+'&go=answer'}
    ];
  });
  setTimeout(function(){
    try{
      if(typeof currentStudent!=='undefined'&&currentStudent&&typeof renderArchive==='function') renderArchive();
    }catch(e){}
  },60);
})();

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
    .cheer .ch-inner{font-size:38px;line-height:1.34}
    .cheer .ch-inner small{font-size:18px;margin-top:16px}
    .promo-node{position:relative;margin:6px 0 18px;padding:16px 18px;border:1.5px dashed #fb923c !important;border-radius:16px;
      background:linear-gradient(135deg,#fff7ed,#ffedd5);box-shadow:0 4px 14px rgba(249,115,22,.12);cursor:default}
    .promo-node:hover{transform:none;box-shadow:0 4px 14px rgba(249,115,22,.12)}
    .promo-node .ptag{display:inline-block;background:#ea580c;color:#fff;font-size:10.5px;font-weight:800;padding:3px 10px;border-radius:999px;margin-bottom:8px}
    .promo-node h3{font-size:16px;color:#c2410c;margin:0 0 4px}
    .promo-node p{font-size:13px;color:#6f5a49;line-height:1.6;margin:0}
    .promo-node a.pcta{display:inline-flex;align-items:center;gap:6px;margin-top:11px;background:linear-gradient(135deg,#fb923c,#ea580c);color:#fff;font-size:13px;font-weight:800;padding:9px 16px;border-radius:11px;text-decoration:none;box-shadow:0 5px 13px rgba(234,88,12,.28)}
    .promo-node .pico{position:absolute;left:-46px;top:16px;width:32px;height:32px;background:#fff;border:2px solid #fb923c;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:15px}
    @keyframes friendLead{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-5px) rotate(2deg)}}
    @keyframes friendFollow{0%,100%{transform:translateY(-2px) rotate(2deg)}50%{transform:translateY(3px) rotate(-2deg)}}
    @keyframes bubbleFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
    @media(max-width:600px){
      .timeline{padding-left:58px}.timeline::before{left:18px}.icon-status{left:-48px}
      .companion-marker{left:-65px;transform:scale(.82);transform-origin:left bottom}
      .companion-bubble{left:61px;max-width:150px;font-size:10.5px}
      .promo-node .pico{left:-40px}
      .cheer .ch-inner{font-size:27px}
      .cheer .ch-inner small{font-size:15px;margin-top:12px}
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

  /* ===== 로그인 응원 멘트 (친근하게, 매번 다르게) ===== */
  const CHEERS=[
    '지금의 노력이 앞으로<br>너의 실력을 쭉쭉 높여 줄 거야<br>아잣!!!',
    '오늘도 와줘서 고마워!<br>딱 한 문제만 더 해보자',
    '천천히 가도 괜찮아<br>멈추지만 않으면 되는 거야',
    '어제의 너보다<br>딱 한 걸음만 앞으로!',
    '머리가 아프다는 건<br>지금 쑥쑥 크고 있다는 뜻이야',
    '실수해도 괜찮아<br>왜 틀렸는지 알면 그게 실력이 돼',
    '오늘 푼 한 문제가<br>시험날의 자신감이 된다!',
    '집중 모드 ON 🔥<br>딱 30분만 몰입해보자',
    '잘하고 있어, 정말이야<br>선생님이 다 보고 있어',
    '포기하고 싶은 그 순간이<br>제일 많이 크는 순간이야',
    '오늘도 씩씩하게!<br>아잣아잣 파이팅!!',
    '틀린 문제는 보물이야<br>하나 찾으면 하나 더 강해져',
    '황소까지 같이 달리자<br>우리는 한 팀이야 🐂',
    '머리보다 엉덩이!<br>오래 앉아 있는 사람이 이긴다',
    '숨 한 번 크게 쉬고<br>자, 오늘도 시작해볼까?'
  ];
  const CHEER_TAGS=[
    'DOCSSAM이 응원한다 🔥','DOCSSAM이 지켜본다 🙌','오늘도 파이팅! 💪',
    '선생님이 믿는다 ✨','우리 같이 가자 🐂','천천히, 그러나 확실하게 👊',
    '꾸준함이 재능을 이긴다 💛'
  ];
  if(typeof showCheer==='function'){
    showCheer=function(given){
      const el=document.getElementById('cheer'),t=document.getElementById('cheer-text'),node=currentNode();
      if(!el||!t)return;
      const day=Math.floor((Date.now()+9*3600000)/86400000);
      const msg=CHEERS[(day+Math.floor(Math.random()*CHEERS.length))%CHEERS.length];
      const tag=CHEER_TAGS[Math.floor(Math.random()*CHEER_TAGS.length)];
      const main=`${esc2(given)}${esc2(josa(given))}, 어서 와!<br>${msg}`;
      const sub=`${tag}${node?' · '+esc2(node.title):''}`;
      t.innerHTML=`${main}<small>${sub}</small>`;
      el.classList.remove('hidden');
      setTimeout(()=>el.classList.add('hidden'),4300);
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
        if(node.type==='promo'){
          const p=document.createElement('div');p.className='node promo-node';
          p.innerHTML=`<div class="pico">✨</div><span class="ptag">${esc2(node.label||'추천')}</span>`+
            `<h3 class="disp">${esc2(node.title)}</h3><p>${esc2(node.desc)}</p>`+
            (node.url?`<a class="pcta" href="${esc2(node.url)}" target="_blank" rel="noopener">💬 ${esc2(node.cta||'문의하기')}</a>`:'');
          tl.appendChild(p);return;
        }
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

/* ===== 최종 모의고사 성적 입력·확인 =====
   온라인 회원은 본인이 O/X를 입력하고, 재원생은 선생님이 어드민에서 기록한다.
   성적 확인은 두 유형 모두 동일한 읽기 전용 결과 화면을 사용한다. */
(function(){
  if(!window.GFIELD_DATA) return;
  var RESULT_URL='last1-result.html';
  var ENTRY_URL='last1-entry.html';

  var st=document.createElement('style');
  st.textContent='.last1-node-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:10px}.last1-node-btn{display:inline-flex;align-items:center;gap:5px;padding:8px 14px;border:0;border-radius:10px;background:linear-gradient(135deg,#315b9a,#183968);color:#fff;font-size:12.5px;font-weight:800;cursor:pointer;box-shadow:0 5px 12px rgba(30,60,114,.22)}.last1-node-btn.entry{background:linear-gradient(135deg,#16a34a,#15803d)}.last1-node-btn:hover{transform:translateY(-1px)}';
  document.head.appendChild(st);

  function studentName(){return (typeof currentStudent!=='undefined'&&currentStudent)?currentStudent:'';}
  function onlineMember(){var nm=studentName();return !!(nm&&window.GFIELD_DATA.studentTypes&&window.GFIELD_DATA.studentTypes[nm]==='online');}
  function openResult(round){
    var nm=studentName();
    window.open(RESULT_URL+'?round='+round+(nm?('&name='+encodeURIComponent(nm)):''),'_blank');
  }
  function openEntry(round){
    var nm=studentName();
    window.open(ENTRY_URL+'?round='+round+(nm?('&name='+encodeURIComponent(nm)):''),'_blank');
  }

  if(typeof renderTimeline==='function'){
    var ot=renderTimeline;
    renderTimeline=function(){
      ot();
      try{
        document.querySelectorAll('#timeline .node').forEach(function(el){
          var h=el.querySelector('h3'); if(!h) return;
          var t=h.textContent||'';
          var match=t.match(/최종(?:\s*실전)?\s*모의고사\s*([1-4])\s*회/);
          if(!match) return;
          var round=Number(match[1]);
          if(el.classList.contains('locked')) return;
          if(el.querySelector('.last1-node-actions')) return;
          var actions=document.createElement('div'); actions.className='last1-node-actions';
          if(onlineMember()){
            var e=document.createElement('button');
            e.type='button'; e.className='last1-node-btn entry'; e.innerHTML='✍️ 성적 입력';
            e.onclick=function(ev){ev.stopPropagation();openEntry(round);}; actions.appendChild(e);
          }
          var b=document.createElement('button');
          b.type='button'; b.className='last1-node-btn';
          b.innerHTML='📊 성적 확인';
          b.onclick=function(ev){ ev.stopPropagation(); openResult(round); };
          actions.appendChild(b); el.appendChild(actions);
        });
      }catch(e){}
    };
  }

  setTimeout(function(){
    try{
      if(typeof currentStudent!=='undefined'&&currentStudent){renderTimeline();}
    }catch(e){}
  },140);
})();

/* ===== 책 뷰어: 단원 버튼 화면 내 전환 + 교재 쪽 이동 + 영상 이어보기 =====
   - 유튜브 링크는 왼쪽 영상칸을 그 자리에서 바꿔 재생 (새 창 X)
   - 교재는 해당 단원 시작 쪽으로 자동 스크롤
   - CHAIN에 등록된 영상은 지정 시각에서 다음 영상으로 자동 연속 재생 */
(function(){
  /* 교재별 단원 시작 쪽 — 뷰어에 실제로 보이는 쪽 번호 기준 */
  var PAGEMAP=[
    /* HS 대비 응용 개념서 · THINKING BASIC (40쪽) */
    { match:/THINKING\s*BASIC|응용\s*개념|필수\s*개념정리/i,
      pages:{
        '1단원개념':3,  '1단원필수유형':6,
        '2단원개념':14, '2단원필수유형':19,
        '3단원개념':29, '3단원필수유형':33
      },
      rx:[
        [/([1-3])\s*단원.*필수/, {1:6, 2:19, 3:33}],
        [/([1-3])\s*단원/,       {1:3, 2:14, 3:29}]
      ]
    },
    /* Thinking Core · 생각하는 황소 대비 심화 개념 (92쪽)
       CH1 4 · SEMI1 13 · CH2 20 · SEMI2 35 · CH3 43 · SEMI3 52
       CH4 58 · SEMI4 73 · CH5 82 · SEMI5 88 */
    { match:/THINKING\s*CORE|심화\s*개념/i,
      pages:{},
      rx:[
        [/SEMI[^0-9]*([1-5])|모의고사[^0-9]*([1-5])/i, {1:13, 2:35, 3:52, 4:73, 5:88}],
        [/CH\s*([1-5])|([1-5])\s*단원/i,               {1:4,  2:20, 3:43, 4:58, 5:82}]
      ]
    }
  ];

  /* 영상 이어보기: 이 영상이 at(초)에 도달하면 next 영상을 start(초)부터 이어서 재생 */
  var CHAIN={
    'r6NRdZudWks': { at: 38*60+14, next:'DXyQQgBKtSg', start:11 }   /* Thinking Core CH1 */
  };

  var stx=document.createElement('style');
  stx.textContent='.bv-act.on{outline:2px solid #fff;outline-offset:-2px;box-shadow:0 0 0 3px rgba(255,255,255,.35)}'+
    'button.bv-act{border:0;cursor:pointer;font-family:inherit}'+
    '.bv-chain{position:absolute;left:12px;bottom:12px;z-index:5;background:rgba(0,0,0,.72);color:#fff;font-size:11.5px;font-weight:700;padding:6px 12px;border-radius:8px;pointer-events:none;opacity:0;transition:opacity .3s}'+
    '.bv-chain.on{opacity:1}'+
    '.bv-vid{position:relative}';
  document.head.appendChild(stx);

  var player=null, timer=null, apiPending=[];

  function ytId(u){
    var m=String(u||'').match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/))([A-Za-z0-9_-]{6,})/);
    return m?m[1]:'';
  }
  function ytStart(u){
    var m=String(u||'').match(/[?&](?:t|start)=(\d+)/);
    return m?+m[1]:0;
  }
  function mapPage(title,label){
    var raw=String(label||''), key=raw.replace(/\s+/g,'').toUpperCase();
    for(var i=0;i<PAGEMAP.length;i++){
      var e=PAGEMAP[i];
      if(!e.match.test(String(title||''))) continue;
      var t=e.pages||{}, k;
      if(t[key]) return t[key];
      for(k in t){ if(key.indexOf(k.toUpperCase())>=0) return t[k]; }
      var rl=e.rx||[];
      for(var j=0;j<rl.length;j++){
        var m=raw.match(rl[j][0]);
        if(m){ var num=+(m[1]||m[2]); if(num && rl[j][1][num]) return rl[j][1][num]; }
      }
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

  /* --- YouTube IFrame API --- */
  function loadApi(cb){
    if(window.YT && window.YT.Player) return cb();
    apiPending.push(cb);
    if(document.getElementById('gf-yt-api')) return;
    var prev=window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady=function(){
      if(prev){ try{prev();}catch(e){} }
      var q=apiPending.slice(); apiPending=[];
      q.forEach(function(f){ try{f();}catch(e){} });
    };
    var s=document.createElement('script'); s.id='gf-yt-api';
    s.src='https://www.youtube.com/iframe_api';
    document.head.appendChild(s);
  }
  function stopWatch(){ if(timer){ clearInterval(timer); timer=null; } hideChainNote(); }
  function chainNote(txt){
    var box=document.querySelector('#bv-stage .bv-vid'); if(!box) return;
    var el=box.querySelector('.bv-chain');
    if(!el){ el=document.createElement('div'); el.className='bv-chain'; box.appendChild(el); }
    el.textContent=txt; el.classList.add('on');
    setTimeout(function(){ if(el) el.classList.remove('on'); }, 4000);
  }
  function hideChainNote(){
    var el=document.querySelector('#bv-stage .bv-vid .bv-chain');
    if(el) el.classList.remove('on');
  }
  function watch(id){
    stopWatch();
    var rule=CHAIN[id]; if(!rule || !player) return;
    timer=setInterval(function(){
      try{
        if(!player || typeof player.getCurrentTime!=='function') return;
        var t=player.getCurrentTime();
        if(t && t>=rule.at){
          stopWatch();
          chainNote('이어지는 강의로 넘어갑니다 ▶');
          player.loadVideoById({videoId:rule.next, startSeconds:rule.start||0});
          setTimeout(function(){ watch(rule.next); },1200);
        }
      }catch(e){}
    },500);
  }
  function play(id,start){
    var f=vidFrame(); if(!f) return false;
    if(player && typeof player.loadVideoById==='function'){
      try{ player.loadVideoById({videoId:id, startSeconds:start||0}); watch(id); return true; }catch(e){}
    }
    f.src='https://www.youtube.com/embed/'+id+'?autoplay=1&rel=0&playsinline=1&enablejsapi=1&origin='+
      encodeURIComponent(location.origin)+(start?('&start='+start):'');
    return true;
  }
  /* 뷰어를 열 때 iframe을 API 제어 가능한 상태로 만들어 둔다 */
  function initPlayer(){
    var f=vidFrame(); if(!f) return;
    try{ if(player && player.destroy) player.destroy(); }catch(e){}
    player=null; stopWatch();
    var src=f.getAttribute('src')||'';
    var id=ytId(src)|| (src.match(/embed\/([A-Za-z0-9_-]{6,})/)||[])[1] ||'';
    if(!id) return;
    if(src.indexOf('enablejsapi=1')<0){
      f.setAttribute('src', src+(src.indexOf('?')>=0?'&':'?')+'enablejsapi=1&origin='+encodeURIComponent(location.origin));
    }
    f.id='gf-bv-yt';
    loadApi(function(){
      try{
        player=new YT.Player('gf-bv-yt',{ events:{ 'onReady':function(){ watch(id); } } });
      }catch(e){ player=null; }
    });
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
    initPlayer();
    var title=(document.getElementById('bv-name')||{}).textContent||'';
    Array.prototype.slice.call(box.querySelectorAll('a.bv-act')).forEach(function(a){
      var url=a.getAttribute('href')||'';
      var vid=ytId(url);
      if(!vid) return;                         /* 유튜브가 아니면 그대로 새 창 */
      var label=(a.textContent||'').replace(/^\s*[🔗▶]\s*/,'').trim();
      var pg=pageOf(title,label,url), st=ytStart(url);
      var b=document.createElement('button');
      b.type='button'; b.className='bv-act';
      b.textContent='▶ '+label;
      b.title=pg?(label+' · 교재 '+pg+'쪽으로 이동'):label;
      b.addEventListener('click',function(){
        play(vid,st); goPage(pg);
        Array.prototype.slice.call(box.querySelectorAll('.bv-act')).forEach(function(x){x.classList.remove('on');});
        b.classList.add('on');
      });
      a.parentNode.replaceChild(b,a);
    });
  }
  function hook(){
    if(typeof window.openBook!=='function') return false;
    var ob=window.openBook;
    window.openBook=function(b){ var r=ob.apply(this,arguments); setTimeout(enhance,60); return r; };
    if(typeof window.closeBook==='function'){
      var cb=window.closeBook;
      window.closeBook=function(){ stopWatch(); try{ if(player&&player.destroy) player.destroy(); }catch(e){} player=null; return cb.apply(this,arguments); };
    }
    return true;
  }
  if(!hook()) setTimeout(hook,300);
})();
