/* GFIELD 관리자 모의고사 결과 v2: 중급/활용 분리, 1·2·3차 개별 초기화, 미리보기 */
(function(){
  if(!window.GFIELD_DATA) return;
  window.mkSet=window.mkSet||'mid';

  function parseRoundKey(raw){
    raw=String(raw||'');
    const set=raw.startsWith('hw')?'hw':'mid';
    const body=set==='hw'?raw.slice(2):raw;
    const m=body.match(/^(\d+)(?:@([123]))?$/);
    return m?{set,round:String(+m[1]),slot:+(m[2]||1),raw}:null;
  }
  function dataFor(set){return set==='hw'?(window.GFIELD_MOCK_HW||{}):(window.GFIELD_MOCK||{})}
  function roundTitle(set,r){const M=dataFor(set);return((M.rounds||{})[r]||{}).title||r+'회'}
  function rawKey(set,r,slot){return(set==='hw'?'hw':'')+r+(Number(slot)===1?'':'@'+slot)}
  function validRow(x){return !!(x&&x.source!=='reset'&&typeof x.ox==='string'&&x.ox.length===mkQ())}
  function rowsFor(student,set,r){
    return(MK_ROWS||[]).filter(validRow).map(x=>({x,p:parseRoundKey(x.round)})).filter(o=>o.p&&o.p.set===set&&o.x.student===student&&(!r||o.p.round===String(r))).sort((a,b)=>+a.p.round-+b.p.round||a.p.slot-b.p.slot);
  }
  function latestOxV2(student,round){
    const rows=rowsFor(student,window.mkSet,round);
    if(!rows.length)return null;
    const x=rows[rows.length-1].x;
    return x.ox&&x.ox.length===mkQ()?x.ox.split(''):null;
  }

  if(typeof mkM==='function') mkM=function(){return dataFor(window.mkSet)};
  if(typeof mkRoundKeys==='function') mkRoundKeys=function(){return Object.keys((dataFor(window.mkSet).rounds)||{}).sort((a,b)=>+a-+b)};
  if(typeof mkLatest==='function') mkLatest=latestOxV2;

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
    let panel=`<div style="border:1px solid #dce4ef;border-radius:14px;padding:14px;margin:4px 0 16px;background:linear-gradient(135deg,#f8fbff,#fff)">
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
        <b style="font-size:14px">🧾 응시 차수 관리</b>
        <button class="btn sm ${window.mkSet==='mid'?'add':''}" onclick="setMockSetV2('mid')">중급 모의고사</button>
        <button class="btn sm ${window.mkSet==='hw'?'ai':''}" onclick="setMockSetV2('hw')">활용 모의고사</button>
        <span style="margin-left:auto;font-size:11.5px;color:#6b7280">2차만 초기화하면 1·3차는 그대로 유지됩니다.</span>
      </div>
      <div style="overflow-x:auto;margin-top:10px"><table style="min-width:760px"><thead><tr><th>회차</th><th>차수</th><th>점수</th><th>오답</th><th>저장 주체</th><th>저장 시각</th><th>관리</th></tr></thead><tbody>`;
    const grouped={};
    rows.forEach(o=>{grouped[o.p.round]=grouped[o.p.round]||[];grouped[o.p.round].push(o)});
    mkRoundKeys().forEach(r=>{
      const list=grouped[r]||[];
      if(!list.length){
        panel+=`<tr><td>${esc(roundTitle(window.mkSet,r))}</td><td colspan="5" style="color:#a0a8b3">기록 없음</td><td><a class="btn sm" style="background:#eef1f6;color:#333;text-decoration:none" target="_blank" href="mock.html?set=${window.mkSet}&round=${r}&name=${encodeURIComponent(student)}&preview=1">🔎 미리보기</a></td></tr>`;
        return;
      }
      list.forEach((o,i)=>{
        const x=o.x,p=o.p,score=x.score!=null?x.score:(x.ox?mkScore(x.ox.split('')).score:'-'),wrong=x.wrong!=null?x.wrong:(x.ox?mkScore(x.ox.split('')).wrong:'-');
        const at=x.updated_at?new Date(x.updated_at).toLocaleString('ko-KR',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}):'-';
        panel+=`<tr><td>${esc(roundTitle(window.mkSet,r))}</td><td><b>${p.slot}차</b></td><td><b>${score}</b></td><td>${wrong}</td><td>${esc(x.source||'-')}</td><td>${esc(at)}</td><td>
          <div style="display:flex;gap:5px;justify-content:center;flex-wrap:wrap">
            <a class="btn sm" style="background:#eef1f6;color:#333;text-decoration:none" target="_blank" href="mock.html?set=${window.mkSet}&round=${r}&name=${encodeURIComponent(student)}&preview=1">🔎 미리보기</a>
            <button class="btn del sm" onclick="deleteMockAttemptV2('${esc(student)}','${window.mkSet}','${r}',${p.slot})">${p.slot}차 초기화</button>
            ${i===0?`<button class="btn sm" style="background:#fff3e0;color:#b45309" onclick="deleteMockRoundV2('${esc(student)}','${window.mkSet}','${r}')">회차 전체</button>`:''}
          </div></td></tr>`;
      });
    });
    panel+='</tbody></table></div></div>';
    body.insertAdjacentHTML('afterbegin',panel);
    const hint=document.querySelector('#tab-mock .hint');
    if(hint)hint.textContent='중급·활용 모의고사 결과를 분리해 확인합니다. 각 회차의 1·2·3차 기록을 개별 초기화하거나 저장되지 않는 관리자 미리보기로 들어갈 수 있습니다.';
  };

  window.setMockSetV2=function(set){window.mkSet=set==='hw'?'hw':'mid';renderMock()};

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
    var want=p.week+' '+p.name;
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
