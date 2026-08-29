/* GFIELD 관리자 모의고사 결과 v2: 중급/활용 분리, 1·2·3차 개별 초기화, 미리보기 */
(function(){
  if(!window.GFIELD_DATA) return;
  window.mkSet=window.mkSet||'mid';

  function parseRoundKey(raw){
    raw=String(raw||'');
    const set=raw.startsWith('original')?'original':(raw.startsWith('final')?'final':(raw.startsWith('hw')?'hw':'mid'));
    const body=set==='original'?raw.slice(8):(set==='final'?raw.slice(5):(set==='hw'?raw.slice(2):raw));
    const m=body.match(/^(\d+)(?:@([123]))?$/);
    return m?{set,round:String(+m[1]),slot:+(m[2]||1),raw}:null;
  }
  function dataFor(set){
    if(set==='original') return window.GFIELD_MOCK_ORIGINAL||{};
    if(set==='final') return window.GFIELD_MOCK_FINAL||{};
    return set==='hw'?(window.GFIELD_MOCK_HW||{}):(window.GFIELD_MOCK||{});
  }
  function roundTitle(set,r){const M=dataFor(set);return((M.rounds||{})[r]||{}).title||r+'회'}
  function rawKey(set,r,slot){return(set==='original'?'original':(set==='final'?'final':(set==='hw'?'hw':'')))+r+(Number(slot)===1?'':'@'+slot)}
  function teacherEntryUrl(set,r,student){return 'final.html?'+(set==='original'?'set=original&':'')+'round='+r+'&go=answer&entry=teacher&name='+encodeURIComponent(student)}
  function previewUrl(set,r,student){return 'mock.html?set='+set+'&round='+r+'&name='+encodeURIComponent(student)+'&preview=1'}
  function sourceLabel(source){
    return ({online:'온라인 회원',admin:'선생님',teacher:'선생님',parent:'학생·학부모',practice:'연습',
      'practice-admin':'선생님 연습',reset:'초기화'})[source]||source||'-';
  }
  function validRow(x){return !!(x&&x.source!=='reset'&&typeof x.ox==='string'&&x.ox.length===mkQ()&&/^[OX]+$/.test(x.ox))}
  function rowsFor(student,set,r){
    return(MK_ROWS||[]).filter(validRow).map(x=>({x,p:parseRoundKey(x.round)})).filter(o=>o.p&&o.p.set===set&&o.x.student===student&&(!r||o.p.round===String(r))).sort((a,b)=>+a.p.round-+b.p.round||a.p.slot-b.p.slot);
  }
  function latestOxV2(student,round){
    const rows=rowsFor(student,window.mkSet,round);
    if(!rows.length)return null;
    const x=rows[rows.length-1].x;
    return validRow(x)?x.ox.split(''):null;
  }

  if(typeof mkM==='function') mkM=function(){return dataFor(window.mkSet)};
  if(typeof mkRoundKeys==='function') mkRoundKeys=function(){return Object.keys((dataFor(window.mkSet).rounds)||{}).sort((a,b)=>+a-+b)};
  if(typeof mkLatest==='function') mkLatest=latestOxV2;
  if(typeof mkStudents==='function') mkStudents=function(){
    const list=((window.GFIELD_DATA&&window.GFIELD_DATA.students)||[]).slice();
    (MK_ROWS||[]).forEach(x=>{const name=String((x&&x.student)||'').trim();if(name&&!list.includes(name))list.push(name)});
    return list;
  };

  const oldRender=typeof renderMock==='function'?renderMock:null;
  renderMock=function(){
    if(!oldRender)return;
    const rawRows=MK_ROWS;
    if(Array.isArray(MK_ROWS))MK_ROWS=MK_ROWS.filter(validRow);
    oldRender();
    MK_ROWS=rawRows;
    const body=document.getElementById('mock-body');if(!body)return;
    const students=mkStudents(),student=mkSel||students[0]||'';
    const rows=rowsFor(student,window.mkSet);

    /* 최종 모의고사 진단 분석지 — 어드민 전용 */
    const lastLinks=[1,2,3,4].map(r=>`<a class="btn sm" style="background:#fff;color:#1e3c72;text-decoration:none;font-weight:800" target="_blank"
      href="last1-analysis.html?round=${r}&mode=teacher${student?('&name='+encodeURIComponent(student)):''}">최종 ${r}회</a>`).join('');
    const originalLinks=[1,2].map(r=>`<a class="btn sm" style="background:#fff;color:#7c3aed;text-decoration:none;font-weight:800" target="_blank"
      href="final.html?set=original&round=${r}&go=answer&entry=teacher${student?('&name='+encodeURIComponent(student)):''}">원본형 ${r}회</a>`).join('');
    let last1=`<div style="border:1px solid #c7d7f0;border-radius:14px;padding:14px;margin:4px 0 12px;background:linear-gradient(135deg,#2a5298,#1e3c72);color:#fff">
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
        <b style="font-size:14px">📊 최종 모의고사 진단 분석지</b>
        <span style="font-size:11.5px;opacity:.85">선생님 전용 · 학생 화면에는 성적만 공개됩니다</span>
        <div style="margin-left:auto;display:flex;gap:6px;flex-wrap:wrap">${lastLinks}</div>
      </div>
      <div style="margin-top:8px;font-size:11.5px;opacity:.9;line-height:1.6">
        재원생은 선생님이 틀린 번호를 입력해 최초 성적을 기록합니다. 온라인 회원은 학생 화면에서 직접 입력하며,
        두 경로 모두 같은 최초 성적 누적 기준을 사용합니다.
      </div>
    </div>`;
    let originalPanel=`<div style="border:1px solid #ddd6fe;border-radius:14px;padding:14px;margin:4px 0 12px;background:linear-gradient(135deg,#f5f3ff,#fff);color:#4c1d95">
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
        <b style="font-size:14px">🧭 원본형 성적·약점 진단</b>
        <span style="font-size:11.5px;opacity:.8">대영역·소영역·세부유형 자동 분석</span>
        <div style="margin-left:auto;display:flex;gap:6px;flex-wrap:wrap">${originalLinks}</div>
      </div>
      <div style="margin-top:8px;font-size:11.5px;opacity:.9;line-height:1.6">재원생은 선생님이 오답 번호를 대신 입력할 수 있고, 온라인 회원은 학생 서재에서 직접 입력합니다. 두 경로 모두 원본형 전용 최초 기록을 사용합니다.</div>
    </div>`;

    let panel=`<div style="border:1px solid #dce4ef;border-radius:14px;padding:14px;margin:4px 0 16px;background:linear-gradient(135deg,#f8fbff,#fff)">
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
        <b style="font-size:14px">🧾 응시 차수 관리</b>
        <button class="btn sm ${window.mkSet==='mid'?'add':''}" onclick="setMockSetV2('mid')">중급 모의고사</button>
        <button class="btn sm ${window.mkSet==='hw'?'ai':''}" onclick="setMockSetV2('hw')">활용 모의고사</button>
        <button class="btn sm ${window.mkSet==='final'?'add':''}" onclick="setMockSetV2('final')">파이널 모의고사</button>
        <button class="btn sm ${window.mkSet==='original'?'ai':''}" onclick="setMockSetV2('original')">원본형 모의고사</button>
        <span style="margin-left:auto;font-size:11.5px;color:#6b7280">2차만 초기화하면 1·3차는 그대로 유지됩니다.</span>
      </div>
      <div style="overflow-x:auto;margin-top:10px"><table style="min-width:760px"><thead><tr><th>회차</th><th>차수</th><th>점수</th><th>오답</th><th>저장 주체</th><th>저장 시각</th><th>관리</th></tr></thead><tbody>`;
    const grouped={};
    rows.forEach(o=>{grouped[o.p.round]=grouped[o.p.round]||[];grouped[o.p.round].push(o)});
    mkRoundKeys().forEach(r=>{
      const list=grouped[r]||[];
      if(!list.length){
        const action=window.mkSet==='final'||window.mkSet==='original'
          ?`<a class="btn sm" style="background:#dcfce7;color:#166534;text-decoration:none" target="_blank" href="${teacherEntryUrl(window.mkSet,r,student)}">✍️ 오답 입력·진단</a>`
          :`<a class="btn sm" style="background:#eef1f6;color:#333;text-decoration:none" target="_blank" href="${previewUrl(window.mkSet,r,student)}">🔎 미리보기</a>`;
        panel+=`<tr><td>${esc(roundTitle(window.mkSet,r))}</td><td colspan="5" style="color:#a0a8b3">기록 없음</td><td>${action}</td></tr>`;
        return;
      }
      list.forEach((o,i)=>{
        const x=o.x,p=o.p,sc=mkScore(x.ox),score=sc?sc.score:'-',wrong=sc?sc.wrong:'-';
        const at=x.updated_at?new Date(x.updated_at).toLocaleString('ko-KR',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}):'-';
        const openAction=window.mkSet==='final'||window.mkSet==='original'
          ?`<a class="btn sm" style="background:#dcfce7;color:#166534;text-decoration:none" target="_blank" href="${teacherEntryUrl(window.mkSet,r,student)}">✍️ 오답 입력·진단</a>`
          :`<a class="btn sm" style="background:#eef1f6;color:#333;text-decoration:none" target="_blank" href="${previewUrl(window.mkSet,r,student)}">🔎 미리보기</a>`;
        panel+=`<tr><td>${esc(roundTitle(window.mkSet,r))}</td><td><b>${p.slot}차</b></td><td><b>${score}</b></td><td>${wrong}</td><td>${esc(sourceLabel(x.source))}</td><td>${esc(at)}</td><td>
          <div style="display:flex;gap:5px;justify-content:center;flex-wrap:wrap">
            ${openAction}
            <button class="btn del sm" onclick="deleteMockAttemptV2('${esc(student)}','${window.mkSet}','${r}',${p.slot})">${p.slot}차 초기화</button>
            ${i===0?`<button class="btn sm" style="background:#fff3e0;color:#b45309" onclick="deleteMockRoundV2('${esc(student)}','${window.mkSet}','${r}')">회차 전체</button>`:''}
          </div></td></tr>`;
      });
    });
    panel+='</tbody></table></div>';
    if(window.mkSet==='final'||window.mkSet==='original'){
      panel+='<div style="margin-top:9px;padding:8px 10px;border-radius:8px;background:#fff7ed;color:#9a3412;font-size:11.5px;line-height:1.6"><b>공식 누적 기준은 회차별 1차 기록</b>입니다. 아래 O/X·영역별 수행률은 복습 상태를 확인할 수 있도록 가장 최근에 저장된 차수를 보여줍니다.</div>';
    }
    panel+='</div>';
    body.insertAdjacentHTML('afterbegin',panel);
    body.insertAdjacentHTML('afterbegin',originalPanel);
    body.insertAdjacentHTML('afterbegin',last1);
    const hint=document.querySelector('#tab-mock .hint');
    if(hint)hint.textContent='중급·활용·파이널·원본형 모의고사 결과를 분리해 확인합니다. 파이널과 원본형은 온라인 회원이 직접 입력하거나 선생님이 재원생 답안을 대신 기록할 수 있으며, 회차별 최초 기록만 누적에 반영됩니다.';
  };

  window.setMockSetV2=function(set){window.mkSet=set==='original'?'original':(set==='final'?'final':(set==='hw'?'hw':'mid'));renderMock()};

  async function resetSlot(student,set,r,slot){
    const key=rawKey(set,r,slot);
    const res=await fetch(MK_URL+'/rest/v1/mock_results',{method:'POST',headers:{apikey:MK_KEY,Authorization:'Bearer '+MK_KEY,'Content-Type':'application/json',Prefer:'resolution=merge-duplicates'},body:JSON.stringify({student:student,round:key,ox:'RESET',score:0,wrong:0,source:'reset'})});
    if(!res.ok)throw new Error('reset '+res.status);
    MK_ROWS=(MK_ROWS||[]).filter(x=>!(x.student===student&&String(x.round)===key));
  }
  window.deleteMockAttemptV2=async function(student,set,r,slot){
    if(!confirm(`${student} 학생의 ${roundTitle(set,r)} ${slot}차 기록만 초기화할까요?\n다른 차수는 유지됩니다.`))return;
    try{await resetSlot(student,set,r,slot);toast(`${slot}차 기록을 초기화했습니다.`);renderMock()}catch(e){toast('기록 초기화에 실패했습니다.')}
  };
  window.deleteMockRoundV2=async function(student,set,r){
    if(!confirm(`${student} 학생의 ${roundTitle(set,r)} 1~3차 기록을 모두 초기화할까요?`))return;
    try{for(let slot=1;slot<=3;slot++)await resetSlot(student,set,r,slot);toast('회차 전체를 초기화했습니다.');renderMock()}catch(e){toast('전체 초기화에 실패했습니다.')}
  };

  setTimeout(function(){if(document.getElementById('tab-mock')&&!document.getElementById('tab-mock').classList.contains('hidden')&&MK_ROWS)renderMock()},100);
})();


/* =========================================================================
   로드맵 주차 구조·문구 패치 (어드민용)
   admin.html 은 data.js 를 그대로 읽으므로 여기서 최신 구성으로 맞춰 준다.
   9~10월은 실제 진단지 구성(파이널 1~4회 + 최종 1~4회, 총 8주)에 맞춘다.
   focus(노드 세 번째 줄)와 Phase 구분선 위치도 함께 정리한다.

   ※ [💾 GitHub에 저장]을 누르면 data.js 에 그대로 굳어지고,
     그 뒤에는 이 블록과 index-enhancements.js 의 패치 블록을 지워도 된다.
   ========================================================================= */
(function(){
  var OVERRIDE=[
    /* ── Phase 1·2 : 개념 + 중급 모의고사 ── */
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
      desc:'', focus:'', track:'exam' },

    /* ── Phase 3 : 파이널 실전 4주 ── */
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

    /* ── Phase 4 : 최종 실전 4주 (약점 유형 분석지 연동) ── */
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

  function patch(D){
    if(!D || !Array.isArray(D.nodes)) return false;
    var N=D.nodes, changed=false;
    function find(rx){ for(var i=0;i<N.length;i++){ var n=N[i]; if(n&&n.date&&rx.test(String(n.date))) return i; } return -1; }
    function idx(id){ for(var i=0;i<N.length;i++){ if(N[i]&&N[i].id===id) return i; } return -1; }

    /* 8월 5주차가 없을 때만 신설 (이미 있으면 건드리지 않음) */
    if(find(/8\s*월\s*5\s*주차/)<0){
      var i4=find(/8\s*월\s*4\s*주차/);
      if(i4>=0){
        N.splice(i4+1,0,{id:'aug-w5',type:'week',track:'exam',date:'8월 5주차',title:'',desc:'',focus:''});
        changed=true;
      }
    }

    /* 제목·설명·핵심훈련(focus)·트랙 갱신 */
    N.forEach(function(n){
      if(!n || !n.date || n.type==='divider' || n.type==='goal') return;
      for(var i=0;i<OVERRIDE.length;i++){
        var o=OVERRIDE[i];
        if(o.date.test(String(n.date))){
          if(Object.prototype.hasOwnProperty.call(o,'title') && n.title!==o.title){ n.title=o.title; changed=true; }
          if(Object.prototype.hasOwnProperty.call(o,'desc') && n.desc!==o.desc){ n.desc=o.desc; changed=true; }
          if(Object.prototype.hasOwnProperty.call(o,'focus') && n.focus!==o.focus){ n.focus=o.focus; changed=true; }
          if(o.track && n.track!==o.track){ n.track=o.track; changed=true; }
          break;
        }
      }
    });

    /* 8월 5주차 ↔ 9월 1주차 사이 추가 모의고사 추천 배너 */
    if(!N.some(function(n){return n && n.id==='promo-final-prep';})){
      var i9=find(/9\s*월\s*1\s*주차/);
      if(i9>=0){
        N.splice(i9,0,{
          id:'promo-final-prep', type:'promo',
          label:'파이널 진입 전 · 추가 모의고사 추천',
          title:'파이널 전에 실전 감각을 더 쌓고 싶다면',
          desc:'중급 8회와 시크릿 추가 모의고사로 파이널 난이도에 미리 적응할 수 있어요. 한 주라도 더 실전을 겪은 학생이 파이널에서 흔들리지 않습니다.',
          cta:'추가 모의고사 문의하기', url:'https://open.kakao.com/me/gfield'
        });
        changed=true;
      }
    }

    /* Phase 구분선 위치 정리
       Phase 2(중급 집중) → 중급 모의고사가 전면에 나오는 7월 4주차 앞
       Phase 3(파이널 진입) → 개념이 끝난 뒤, 배너 다음 · 9월 1주차 바로 앞 */
    function moveBefore(id, rx){
      var i=idx(id); if(i<0) return false;
      var j=find(rx); if(j<0) return false;
      if(j===i+1) return false;                 /* 이미 바로 앞이면 그대로 */
      var node=N.splice(i,1)[0];
      var t=find(rx);
      if(t<0){ N.splice(i,0,node); return false; }   /* 안전 복구 */
      N.splice(t,0,node);
      return true;
    }
    if(moveBefore('div-mock',  /7\s*월\s*4\s*주차/)) changed=true;
    if(moveBefore('div-final', /9\s*월\s*1\s*주차/)) changed=true;

    return changed;
  }

  /* 원본과 어드민 작업본(S) 양쪽에 적용.
     S 는 admin.html 인라인 스크립트의 top-level let 이라 여기서 참조 가능하다. */
  var touched=false;
  try{ if(patch(window.GFIELD_DATA)) touched=true; }catch(e){}
  var adminS=null;
  try{ adminS=(typeof S!=='undefined')?S:null; }catch(e){ adminS=null; }
  if(adminS){ try{ if(patch(adminS)) touched=true; }catch(e){} }

  /* 이미 잠금 해제된 뒤라면 즉시 다시 그린다 */
  if(touched){
    try{
      var app=document.getElementById('app');
      if(app && !app.classList.contains('hidden') && typeof renderAll==='function') renderAll();
    }catch(e){}
  }

  if(touched && !adminS){
    console.warn('[GFIELD] 로드맵 패치: 어드민 작업본(S)에 접근하지 못했습니다. 새로고침 후에도 주차 제목이 그대로면 알려주세요.');
  }
})();


/* ===== 주차별 콘텐츠: 접힘 헤더에 '몇 주차'인지 표시 =====
   기존 아코디언은 헤더 제목을 블록 안 첫 입력칸(교재 제목) 값에서 가져와서,
   접으면 "(제목 없음)"만 보여 어느 주차인지 알 수 없었다.
   블록 안에 이미 있는 .wt("7월 4주차 · 제목")를 헤더 제목으로 덮어써 준다. */
(function(){
  var css=document.createElement('style');
  css.textContent=
    '.content-week .cw-title .wk-chip{display:inline-block;background:#f2681c;color:#fff;font-size:11px;font-weight:800;'+
    'padding:2px 9px;border-radius:999px;margin-right:8px;vertical-align:1px;letter-spacing:-.01em}'+
    '.content-week .cw-title .wk-name{color:#222;font-weight:700}'+
    '.content-week .cw-head{background:#fafbfd;border-radius:8px}'+
    '.content-week.acc-collapsed .cw-head{background:#fff}';
  document.head.appendChild(css);

  function labelParts(cw){
    var wt=cw.querySelector('.wt');
    if(!wt) return null;
    var txt=(wt.textContent||'').trim();
    if(!txt) return null;
    var i=txt.indexOf('·');
    if(i<0) return {week:txt, name:''};
    return { week:txt.slice(0,i).trim(), name:txt.slice(i+1).trim() };
  }
  function paint(cw){
    var t=cw.querySelector('.cw-title'); if(!t) return;
    var p=labelParts(cw); if(!p) return;                 /* 주차 블록이 아니면 건드리지 않음 */
    var want=p.week+' '+p.name;
    if(t.dataset.wkLabel===want) return;                 /* 이미 반영됨 */
    t.dataset.wkLabel=want;
    t.innerHTML='<span class="wk-chip"></span><span class="wk-name"></span>';
    t.querySelector('.wk-chip').textContent=p.week;
    t.querySelector('.wk-name').textContent=p.name;
  }
  function scan(){
    var list=document.querySelectorAll('.content-week[data-acc]');
    for(var i=0;i<list.length;i++) paint(list[i]);
  }
  var pending=null;
  function schedule(){ if(pending) return; pending=setTimeout(function(){ pending=null; scan(); },60); }

  function boot(){
    scan();
    new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});
    /* 아코디언이 입력·토글 때마다 제목을 되돌리므로 그 뒤에 다시 칠한다 */
    document.addEventListener('input',schedule,true);
    document.addEventListener('click',schedule,true);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot);
  else boot();
})();
