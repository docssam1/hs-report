/* 실전 모의고사 90분 타이머 · 구간 안내 문구
 * 이 파일이 유일한 원본입니다. 문구를 고치면 GitHub Actions가 mp3를 다시 만듭니다. */
(function(g){
  const CUES = [
    { at:0,     ph:"훑어보기", msg:"자, 시작하자. 5분 동안 시험지를 쭉 넘겨보면서 풀 수 있을 것 같은 문제를 체크해 보자." },
    { at:300,   ph:"1~12번",  msg:"다 체크했니? 그럼 12번까지 30분 동안 먼저 푸는 거야. 할 수 있지? 만약 모르는 문제가 있으면 우선 표시해 놓고 넘어가야 돼." },
    { at:1200,  ph:"1~12번",  msg:"절반 지났어. 지금쯤 6번은 넘어갔으면 좋겠다." },
    { at:2100,  ph:"13~30번", msg:"35분 지났어. 아직 10번을 넘어가지 못한 친구는 얼른 13번 문제로 넘어가자. 한두 문제 남은 친구는 계속 더 풀어봐." },
    { at:3300,  ph:"13~30번", msg:"55분이야. 남은 시간을 생각하면서 한 문제에 너무 오래 붙잡고 있지 말자." },
    { at:4500,  ph:"마무리",   msg:"75분이 지났어. 이제 15분이 남았어. 할 수 있을 것 같은 문제를 골라서 풀어봐." },
    { at:5100,  ph:"마무리",   msg:"5분 남았어. 답을 옮겨 적지 않은 게 있는지 확인하자." },
    { at:5400,  ph:"종료",     msg:"자, 90분이 다 됐어. 펜 내려놓자. 수고했어." }
  ];
  if (typeof module !== "undefined" && module.exports) module.exports = { CUES };
  else g.GFIELD_EXAM_CUES = CUES;
})(typeof window !== "undefined" ? window : globalThis);


/* =========================================================================
   상세 전체보기 인쇄 / PDF 저장  (v1)

   문제: final-report-print.js 는 mode:'full'(상세 풀이 포함 인쇄)을 구현해
   두었지만, final.html 은 mode:'summary' 로만 호출한다. 그래서 [상세 전체보기]
   로 펼친 30문항 상세 풀이가 인쇄·PDF에 전혀 담기지 않았다.

   해결: 요약 인쇄 버튼 옆에 [상세 전체 인쇄 / PDF 저장] 버튼을 새로 만들고
   mode:'full' 로 붙인다. (attach 는 button 요소를 키로 캐시하므로 반드시
   새 버튼이어야 한다. 기존 버튼 재사용 시 mode 가 summary 로 고정된다.)

   full 모드를 쓸 수 없는 경우 — 회차가 1~4회가 아니거나, 미검수(.is-pending)
   문항이 남아 있거나, Paged.js 조판에 실패한 경우 — 에는 브라우저 기본 인쇄로
   내려가되, 상세 섹션을 가리는 인쇄 CSS를 걷어내고 접힌 <details> 를 모두
   펼친 뒤 인쇄한다.

   final.html(205KB)을 건드리지 않으려고 맨 마지막에 로드되는 이 파일에 둔다.
   ========================================================================= */
(function(){
  'use strict';
  if(typeof window==='undefined'||typeof document==='undefined') return;

  var PKG='.final-report-package';
  var BTN_ID='gfield-full-print-btn';
  var STYLE_ID='gfield-full-print-style';
  var BODY_CLASS='gfield-print-full';
  var LABEL='📄 상세 전체 인쇄 / PDF 저장';

  /* ---------- 폴백 인쇄용 CSS ----------
     원본 인쇄 CSS가 상세 섹션을 !important 로 숨기므로, 선택자를 더 구체적으로
     써서 되살린다. (body 에 두 클래스를 함께 걸어 특이도를 높임) */
  function ensureStyle(){
    if(document.getElementById(STYLE_ID)) return;
    var b='body.'+BODY_CLASS;
    var s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent='@media print{'+
      /* 상세 풀이 · 접힌 상세 블록 되살리기 */
      b+'.final-parent-report-page .final-report-package .report-detailed-section,'+
      b+'.final-parent-report-page .final-report-package .parent-report-details,'+
      b+'.final-parent-report-page .final-report-package .report-resource-details,'+
      b+'.final-parent-report-page .final-report-package .parent-summary-support,'+
      b+'.final-parent-report-page .final-report-package #report-tiers,'+
      b+'.final-parent-report-page .final-report-package #report-materials > h2,'+
      b+'.final-parent-report-page .final-report-package #report-materials > .lead'+
      '{display:block!important;visibility:visible!important}'+
      /* 요약 인쇄에서 잘라내던 표의 나머지 행 복구 */
      b+'.final-parent-report-page .final-report-package .curriculum-table tbody tr,'+
      b+'.final-parent-report-page .final-report-package .report-wrong-summary tbody tr'+
      '{display:table-row!important}'+
      /* 접힘 제목 다시 보이기 */
      b+'.final-parent-report-page .final-report-package details > summary'+
      '{display:list-item!important}'+
      /* 상세 카드가 페이지 중간에서 잘리지 않도록 */
      b+' .final1-detailed-card,'+b+' .detailed-solution,'+b+' .report-detailed-section table'+
      '{break-inside:avoid;page-break-inside:avoid}'+
      /* 미검수 문항은 인쇄에서 제외 */
      b+' .is-pending{display:none!important}'+
      /* 화면 전용 요소는 계속 숨김 */
      b+' .report-screen-header,'+b+' .report-screen-actions,'+b+' .parent-report-index'+
      '{display:none!important}'+
    '}';
    document.head.appendChild(s);
  }

  /* ---------- 폴백: 모든 details 펼치고 브라우저 인쇄 ---------- */
  function fallbackPrint(pkg){
    ensureStyle();
    var opened=[];
    try{
      var ds=pkg.querySelectorAll('details');
      for(var i=0;i<ds.length;i++){ if(!ds[i].open){ ds[i].open=true; opened.push(ds[i]); } }
    }catch(e){}
    document.body.classList.add(BODY_CLASS);
    var done=false;
    function restore(){
      if(done) return; done=true;
      document.body.classList.remove(BODY_CLASS);
      /* 원래 접혀 있던 것만 되돌린다 */
      for(var i=0;i<opened.length;i++){ try{ opened[i].open=false; }catch(e){} }
      window.removeEventListener('afterprint',restore);
    }
    window.addEventListener('afterprint',restore);
    setTimeout(function(){
      try{ window.print(); }catch(e){}
      /* afterprint 를 안 쏘는 환경 대비 */
      setTimeout(restore,1500);
    },260);
  }

  /* ---------- full 모드 사용 가능 여부 ---------- */
  function fullReady(pkg){
    try{
      var sec=pkg.querySelector('.report-detailed-section');
      if(!sec) return false;
      var box=sec.querySelector('.final1-detailed-solutions[data-detailed-round]');
      if(!box) return false;
      var round=Number(pkg.getAttribute('data-report-round')||box.getAttribute('data-detailed-round'));
      if([1,2,3,4].indexOf(round)<0) return false;          /* full 지원 회차만 */
      if(sec.querySelector('.is-pending')) return false;     /* 미검수 문항이 있으면 거부됨 */
      if(!sec.querySelector('.is-ready')) return false;
      return true;
    }catch(e){ return false; }
  }

  function hasDetail(pkg){
    try{ return !!pkg.querySelector('.report-detailed-section'); }catch(e){ return false; }
  }

  /* ---------- 버튼 설치 ---------- */
  function install(){
    var pkg=document.querySelector(PKG);
    if(!pkg) return;
    var actions=document.querySelector('.report-screen-actions');
    if(!actions) return;
    if(!hasDetail(pkg)) return;                 /* 상세 풀이가 없는 화면이면 버튼 불필요 */
    if(document.getElementById(BTN_ID)) return; /* 이미 설치됨 */

    var api=window.GFIELD_FINAL_REPORT_PRINT;

    /* 기존 요약 버튼의 중복 핸들러 정리 —
       final.html 이 printBtn.onclick=window.print 를 먼저 심고 그 뒤에 attach 하는데,
       attach 가 캐시를 반환하는 재렌더 경로에서는 onclick 이 남아 인쇄창이 두 번 뜬다. */
    if(api&&typeof api.attach==='function'){
      var sumBtn=document.getElementById('printBtn');
      if(sumBtn&&sumBtn.onclick){
        try{ api.attach({button:sumBtn,source:pkg,mode:'summary'}); sumBtn.onclick=null; }catch(e){}
      }
    }

    var btn=document.createElement('button');
    btn.type='button';
    btn.id=BTN_ID;
    btn.className='report-screen-action no-print';
    btn.textContent=LABEL;

    var canFull=!!(api&&typeof api.attach==='function'&&fullReady(pkg));
    btn.setAttribute('aria-label','30문항 상세 풀이까지 모두 포함해 인쇄하거나 PDF로 저장');
    btn.title=canFull
      ? '30문항 상세 풀이까지 모두 포함해서 인쇄합니다. 준비에 몇 초 걸립니다.'
      : '상세 풀이를 모두 펼친 뒤 브라우저 인쇄로 저장합니다.';

    if(canFull){
      var fellBack=false;
      try{
        api.attach({
          button:btn,
          source:pkg,
          mode:'full',
          timeoutMs:60000,
          onStateChange:function(s){
            if(!s) return;
            if(s.state==='preparing'){ btn.textContent='상세 인쇄 준비 중…'; return; }
            if(s.state==='error'){
              /* 조판에 실패하면 브라우저 인쇄로 내려간다 */
              if(fellBack) return;
              fellBack=true;
              btn.textContent=LABEL;
              btn.disabled=false;
              btn.removeAttribute('aria-busy');
              btn.removeAttribute('data-print-state');
              btn.title='상세 풀이를 모두 펼친 뒤 브라우저 인쇄로 저장합니다.';
              try{ console.warn('[GFIELD] 상세 인쇄 조판 실패('+(s.code||'?')+') → 브라우저 인쇄로 대체'); }catch(e){}
              fallbackPrint(pkg);
              setTimeout(function(){ fellBack=false; },3000);
              return;
            }
            if(s.state==='idle'||s.state==='ready'||s.state==='printing'){ btn.textContent=LABEL; }
          }
        });
      }catch(e){
        canFull=false;
      }
    }
    if(!canFull){
      btn.addEventListener('click',function(){ fallbackPrint(pkg); });
    }

    var anchor=document.getElementById('printBtn');
    if(anchor&&anchor.parentNode===actions&&anchor.nextSibling) actions.insertBefore(btn,anchor.nextSibling);
    else actions.appendChild(btn);
  }

  /* ---------- 리포트가 그려질 때마다 설치 시도 ---------- */
  var pending=null;
  function schedule(){
    if(pending) return;
    pending=setTimeout(function(){ pending=null; try{ install(); }catch(e){} },200);
  }
  function boot(){
    schedule();
    try{ new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true}); }catch(e){}
    window.addEventListener('load',schedule);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot);
  else boot();
})();
