/* 사이트 전체 디자인(2026-11 개편): 2월 대비 로드맵·편입·승급과정과 같은 결.
   남색 #141b5d · 2월 파랑 #3f6fe0 · 라일락 #7b55c7 · 외곽선 #1b2340 · 하늘 바탕 #eaf3ff.
   그라데이션·유리·주황 대신 단색 + 진한 외곽선 + 아래 단색 그림자.
   index.html의 기본 스타일과 다른 스크립트가 넣은 스타일보다 뒤에 붙도록 맨 마지막에 불러온다. */
(function () {
  'use strict';
  var I = window.GFIELD_ILLUST || null;
  var css = [
    /* 색 토큰: 기존 이름을 그대로 쓰는 곳이 많아 값만 바꾼다 */
    ':root{--bg:#eaf3ff;--card:#ffffff;--soft:#f3f7ff;--orange:#3f6fe0;--orange-d:#141b5d;--accent:#243184;',
    '--ink:#1b2340;--ink2:#4e5878;--dim:#5f6a86;--line:#d6e2f5;--line2:#c3d1ec;',
    '--concept:#3f6fe0;--apply:#2f9e6a;--exam:#e0a400;--mock:#ff8a5c;--final:#e0559a;--special:#7b55c7;',
    '--hs-ink:#1b2340;--hs-navy:#141b5d;--hs-sh:0 4px 0 #1b2340;}',
    'body{background:#eaf3ff;color:#1b2340;}',
    'body .particle{background:#9db7ee;}',

    /* 로그인 */
    'body #login{background:#cfe2ff;}',
    'body .login-box{border:2.5px solid #1b2340;border-radius:24px;box-shadow:0 6px 0 #1b2340;}',
    'body .login-box .crest{filter:none;animation:none;}',
    'body .login-box .mini{color:#243184;}',
    'body .login-box input{border:2px solid #c3d1ec;background:#f3f7ff;}',
    'body .login-box input:focus{border-color:#3f6fe0;}',
    'body .login-box .enter,body .login-box .el-primary{background:#141b5d;box-shadow:0 4px 0 #070b33;border-radius:14px;}',
    'body .login-box .enter:active,body .login-box .el-primary:active{transform:translateY(2px);box-shadow:0 2px 0 #070b33;}',
    'body .email-login .el-links button{color:#243184;}',
    '.hs-login-art{position:fixed;left:0;right:0;bottom:0;height:150px;pointer-events:none;z-index:0;}',
    '.hs-login-art svg{width:100%;height:100%;display:block;}',
    'body .login-box{position:relative;z-index:1;}',

    /* 위쪽 막대·메뉴 */
    'body .topbar .brand{color:#141b5d;}',
    'body .topbar .brand small{color:#4e5878;}',
    'body .logout{display:inline-flex;align-items:center;gap:5px;min-height:36px;border:2px solid #1b2340;color:#1b2340;border-radius:11px;font-weight:700;box-shadow:0 2px 0 #1b2340;}',
    'body .logout:active{transform:translateY(1px);box-shadow:0 1px 0 #1b2340;}',
    'body .logout{white-space:nowrap;}',
    'body .topbar{gap:10px;flex-wrap:wrap;}',
    'body .topbar-actions{flex-wrap:wrap;justify-content:flex-end;}',
    '@media(max-width:600px){body .topbar{align-items:flex-start;}body .topbar-actions{gap:6px !important;flex:1 1 100%;justify-content:flex-start;}body .logout{font-size:12px;padding:6px 10px;min-height:34px;}}',
    'body .stickyhead{background:rgba(234,243,255,.94);}',
    'body .nav{gap:8px;}',
    'body .nav-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;border:2px solid #1b2340;border-radius:14px;color:#1b2340;box-shadow:0 3px 0 #1b2340;min-height:46px;}',
    'body .nav-btn.active{background:#141b5d;color:#fff;border-color:#141b5d;box-shadow:0 3px 0 #070b33;}',
    'body .nav-btn:active{transform:translateY(2px);box-shadow:0 1px 0 #1b2340;}',
    'body .nav-btn .hs-li{width:18px;height:18px;}',
    'body .nav-btn:focus-visible,body .logout:focus-visible{outline:3px solid #2456c4;outline-offset:3px;}',

    /* 상태 카드 */
    'body .statusbar{border:2px solid #1b2340;border-radius:18px;box-shadow:0 4px 0 #1b2340;}',
    'body .sb-name b{color:#3f6fe0;}',
    'body .dday{background:#141b5d;border-radius:10px;}',
    'body .sb-now .dot{background:#3f6fe0;box-shadow:0 0 0 4px rgba(63,111,224,.18);}',
    'body .progresswrap{background:#dfe9ff;border:1.5px solid #1b2340;height:11px;}',
    'body .progressbar{background:#3f6fe0;}',

    /* 오늘의 브리핑 */
    'body .brief-card{background:#fff;border:2px solid #1b2340;border-radius:18px;box-shadow:0 4px 0 #1b2340;}',
    'body .brief-card::after{content:none;}',
    'body .brief-mood b{color:#141b5d;display:inline-flex;align-items:center;gap:5px;}',
    'body .brief-dday{background:#dfe9ff;border:1.5px solid #1b2340;display:flex;align-items:center;gap:6px;flex-wrap:wrap;}',
    'body .brief-dday b{color:#141b5d;}',
    'body .brief-box{background:#f3f7ff;border:1.5px solid #d6e2f5;}',
    'body .bb-h{color:#243184;display:flex;align-items:center;gap:5px;}',
    'body .bb-main{display:flex;align-items:center;gap:6px;}',
    'body .bt-chip{display:inline-flex;align-items:center;gap:5px;border:1.5px solid #d6e2f5;}',
    '.tr-dot{display:inline-block;width:9px;height:9px;border-radius:50%;border:1.5px solid #1b2340;}',
    '.tr-dot.g{background:#4fb884}.tr-dot.y{background:#f6cf47}.tr-dot.r{background:#e8503a}.tr-dot.n{background:#5b6b9a}',
    'body .brief-wadvice{background:#fffbe6;border:1.5px solid #ead27a;color:#4a4220;}',
    'body .brief-personal{color:#27304f;}',

    /* 응원 화면 */
    'body .cheer{background:#cfe2ff;}',
    'body .cheer .ch-inner{color:#141b5d;text-shadow:none;}',

    /* 이번 주 카드 */
    'body .home-head{background:#dfe9ff;border:2px solid #1b2340;border-bottom:2px dashed #9fb2d8;border-radius:20px 20px 0 0;position:relative;overflow:hidden;}',
    'body .hh-tag{background:#141b5d;color:#fff;border-radius:9px;}',
    'body .home-head h2{color:#1b2340;}',
    'body .content-card,body .locked-msg{border:2px solid #1b2340;border-top:none;border-radius:0 0 20px 20px;box-shadow:0 4px 0 #1b2340;}',
    'body .focus{color:#243184;background:#f3f7ff;border:1.5px solid #c3d1ec;}',
    '.hs-home-art{position:absolute;right:10px;bottom:-4px;width:120px;height:96px;pointer-events:none;}',
    '@media(max-width:520px){.hs-home-art{width:84px;height:68px;opacity:.95}}',
    'body .home-head .hh-desc,body .home-head h2,body .home-head .focus{position:relative;z-index:1;}',
    'body .home-head h2,body .home-head .hh-desc{padding-right:120px;}',
    '@media(max-width:520px){body .home-head h2,body .home-head .hh-desc{padding-right:80px;}}',

    /* 학습 내용(홈·창 공용) */
    'body .m-sec h4{color:#141b5d;border-bottom:2px solid #d6e2f5;}',
    'body .notice{color:#27304f;}',
    'body .notice .nl-h{color:#141b5d;}',
    'body .tb-btn{background:#141b5d;border-radius:14px;box-shadow:0 4px 0 #070b33;}',
    'body .tb-btn:active{transform:translateY(2px);box-shadow:0 2px 0 #070b33;}',
    'body .tb-btn .ico{display:inline-flex;}',
    'body .tb-btn .hs-li{width:20px;height:20px;}',
    'body .notice .lnk{display:inline-flex;align-items:center;gap:5px;}',
    'body .notice .lnk .hs-li{width:16px;height:16px;}',

    /* 11월 로드맵 */
    'body .legend i{border:1.5px solid #1b2340;}',
    'body .timeline::before{background:#c3d1ec;box-shadow:none;}',
    'body .node{border:2px solid #1b2340;border-left:7px solid #9fb2d8;border-radius:16px;box-shadow:0 3px 0 #1b2340;}',
    'body .node:hover{transform:translateY(-2px);box-shadow:0 5px 0 #1b2340;}',
    'body .node.locked{opacity:.62;}',
    'body .node.locked:hover{transform:none;box-shadow:0 3px 0 #1b2340;}',
    'body .node.concept{border-left-color:var(--concept)}body .node.apply{border-left-color:var(--apply)}body .node.exam{border-left-color:var(--exam)}',
    'body .node.mock{border-left-color:var(--mock)}body .node.final{border-left-color:var(--final)}',
    'body .node.current{background:#fff;border-color:#141b5d;box-shadow:0 0 0 3px #f6cf47,0 4px 0 #1b2340;}',
    'body .node.current::after{content:none;}',
    'body .icon-status{border:2px solid #1b2340;color:#1b2340;box-shadow:none;}',
    'body .icon-status .hs-li{width:16px;height:16px;}',
    'body .node.locked .icon-status{color:#5d6683;border-color:#8d99b8;}',
    'body .divider span{border:2px solid #1b2340;color:#141b5d;background:#fff;box-shadow:0 2px 0 #1b2340;}',
    'body .node.goal{border:2px solid #1b2340;background:#fff6dc;}',
    'body .node.goal h3{color:#141b5d;}',
    'body .node.special{background:#f5f0ff;border-left-color:var(--special);}',
    'body .branch-tag{background:#7b55c7;}',
    'body .special-branch{border-left-color:#7b55c7;}',
    'body .companion-bubble{border:2px solid #1b2340;color:#1b2340;box-shadow:0 2px 0 #1b2340;}',
    'body .promo-node{border:2px dashed #3f6fe0 !important;background:#f3f7ff;box-shadow:none;}',
    'body .promo-node:hover{box-shadow:none;}',
    'body .promo-node .ptag{background:#141b5d;}',
    'body .promo-node h3{color:#141b5d;}',
    'body .promo-node p{color:#4e5878;}',
    'body .promo-node a.pcta{background:#141b5d;box-shadow:0 3px 0 #070b33;}',
    'body .promo-node .pico{border:2px solid #1b2340;color:#e0a400;}',
    'body .special-viewer-link{background:#243184;box-shadow:0 3px 0 #0b1240;}',

    /* 자료실 */
    'body .arc-intro{display:flex;align-items:flex-start;gap:8px;border:2px solid #1b2340;border-radius:18px;box-shadow:0 4px 0 #1b2340;color:#4e5878;}',
    'body .arc-intro b{color:#141b5d;}',
    'body .arc-intro .hs-li{width:20px;height:20px;color:#3f6fe0;margin-top:1px;}',
    'body .shelf-h{color:#141b5d;border-bottom:2px solid #d6e2f5;}',
    'body .shelf-h .hs-li{width:20px;height:20px;color:#3f6fe0;}',
    'body .book .pages{color:#243184;}',
    'body .book .cover{box-shadow:10px 12px 0 rgba(27,35,64,.18);}',
    'body .book .cover.noimg{background:#3f6fe0;border:2px solid #1b2340;}',
    'body .book .cover.drawn{transform:none;box-shadow:none;aspect-ratio:120/160;width:100%;max-width:120px;}',
    'body .book .cover.drawn::before,body .book .cover.drawn::after{display:none;}',
    'body .book .cover.drawn svg{display:block;width:100%;height:100%;}',
    'body .book:hover .cover.drawn{transform:translateY(-4px);}',
    'body .book .cover.noimg .cv-title{color:#fff;}',
    'body .book .cover::before{background:#243184;}',
    'body .book:focus-visible{outline:3px solid #2456c4;outline-offset:4px;border-radius:8px;}',
    'body .arc-info{background:#f3f7ff;border:2px solid #c3d1ec;}',
    'body .arc-info-eyebrow{color:#243184;}',
    'body .arc-info-badge{background:#141b5d;}',
    'body .arc-info-toggle{border:1.5px solid #1b2340;color:#1b2340;}',
    'body .arc-info-p b{color:#141b5d;}',
    'body .arc-info-who{color:#243184;display:flex;gap:6px;align-items:flex-start;}',
    'body .archive-seminar-video{border:2px solid #1b2340;border-radius:18px;box-shadow:0 4px 0 #1b2340;}',
    'body .archive-seminar-video .seminar-video-thumb{border-radius:12px;border:2px solid #1b2340;}',
    'body .bank-type-btn{border:1.5px solid #c3d1ec;border-radius:12px;background:#f3f7ff;}',
    'body .bank-type-btn[aria-pressed="true"]{border-color:#141b5d;background:#dfe9ff;box-shadow:inset 0 0 0 1px #141b5d;}',
    'body .bank-count-btn{border:1.5px solid #1b2340;}',
    'body .bank-count-btn[aria-pressed="true"]{background:#141b5d;border-color:#141b5d;}',
    'body .bank-start{background:#141b5d;border-radius:12px;box-shadow:0 3px 0 #070b33;}',
    'body .bank-start[aria-disabled="true"]{background:#a8b3c5;box-shadow:none;}',
    'body .bank-catalog-link{border:2px solid #1b2340 !important;border-radius:12px !important;color:#141b5d !important;}',
    'body .bank-launch-kicker{color:#3f6fe0;letter-spacing:0;}',
    'body .bank-launch h3{color:#141b5d;}',

    /* 책 뷰어·리더·창 */
    'body .bv-top,body .rd-top{border-bottom:2px solid #1b2340;}',
    'body .bv-back,body .rd-back,body .vip-back{display:inline-flex;align-items:center;gap:5px;background:#fff;border:2px solid #1b2340;color:#1b2340;box-shadow:0 2px 0 #1b2340;}',
    'body .bv-act{background:#141b5d;box-shadow:0 2px 0 #070b33;}',
    'body .bv-act .hs-li{width:15px;height:15px;}',
    'body .bv-ext a.go{background:#3f6fe0;box-shadow:0 3px 0 #1b2340;}',
    'body .bv-ext .ic .hs-li{width:40px;height:40px;}',
    'body .overlay{background:rgba(20,27,93,.42);}',
    'body .modal{border:2.5px solid #1b2340;border-radius:22px;box-shadow:0 6px 0 #1b2340;}',
    'body .modal .m-date{color:#3f6fe0;}',
    'body .modal .x{color:#1b2340;}',
    'body .toast{background:#141b5d;border:2px solid #1b2340;}',
    'body .rd-body{color:#27304f;}',

    /* VIP 라운지 */
    'body .vip-hero{background:#e9e0fb;border:2.5px solid #1b2340;box-shadow:0 5px 0 #1b2340;padding:18px;}',
    'body .vip-hero .vh-stack{display:none;}',
    'body .vip-hero .vh-glass{margin-top:0;background:transparent;backdrop-filter:none;-webkit-backdrop-filter:none;border:0;box-shadow:none;padding:4px 140px 4px 4px;}',
    'body .vip-hero .vh-badge{display:inline-flex;align-items:center;gap:5px;background:#141b5d;letter-spacing:.04em;border-radius:9px;}',
    'body .vip-hero .vh-glass h2{color:#1b2340;}',
    'body .vip-hero .vh-glass p{color:#2e2850;padding-right:0;}',
    'body .vip-hero .vh-glass p b{color:#5b3ea3;}',
    'body .vip-hero .vh-arrow{display:none;}',
    '.hs-vip-art{position:absolute;right:10px;bottom:0;width:150px;height:130px;pointer-events:none;}',
    '@media(max-width:520px){body .vip-hero .vh-glass{padding:4px 4px 96px;}.hs-vip-art{width:120px;height:104px;right:50%;transform:translateX(50%);}}',
    'body .vip-mbtn{border:2px solid #1b2340;border-radius:18px;box-shadow:0 4px 0 #1b2340;}',
    'body .vip-mbtn:hover{transform:translateY(-2px);box-shadow:0 6px 0 #1b2340;border-color:#1b2340;}',
    'body .vip-mbtn .mi{display:grid;place-items:center;width:44px;height:44px;border-radius:12px;border:2px solid #1b2340;background:#dfe9ff;color:#1b2340;}',
    'body .vip-mbtn .mi .hs-li{width:24px;height:24px;}',
    'body .vip-mbtn[data-k="report"]{background:#fff6dc !important;border:2px solid #1b2340 !important;}',
    'body .vip-mbtn[data-k="report"] .mi{background:#f6cf47;}',
    'body .vip-mbtn[data-k="col"] .mi,body .vip-mbtn[data-k="mag"] .mi{background:#ece3fb;}',
    'body .vip-mbtn[data-k="clinic"] .mi{background:#dff1e6;}',
    'body .vip-mbtn .mc{color:#243184;}',
    'body .vip-h{color:#141b5d;border-bottom:2px solid #d6e2f5;}',
    'body .vid-thumb{border:2px solid #1b2340;}',
    'body .clinic-card,body .rep-card,body .mag-card,body .col-card,body .folder{border:2px solid #1b2340;box-shadow:0 3px 0 #1b2340;}',
    'body .folder-h{background:#141b5d;}',
    'body .folder-h .folder-ic{display:inline-flex;}',
    'body .clinic-btn{background:#141b5d;box-shadow:0 3px 0 #070b33;}',
    'body .col-banner{background:#243184;border:2px solid #1b2340;}',
    'body .col-banner span{color:#d7def7;}',
    'body .col-banner .cb-ic .hs-li{width:28px;height:28px;}',
    'body .mag-chip{color:#141b5d;background:#dfe9ff;}',
    'body .mag-thumb{background:#dfe9ff;}',
    'body .rep-score b{color:#141b5d;}',
    'body .rep-comment{background:#f3f7ff;border:1.5px solid #c3d1ec;}',
    'body .rep-comment b{color:#141b5d;}',
    'body .rep-file{background:#fff;border:1.5px solid #1b2340;color:#141b5d;}',
    'body .carousel::-webkit-scrollbar-thumb{background:#c3d1ec;}',
    'body .srh-banner{border:2px solid #1b2340;box-shadow:0 4px 0 #1b2340;}',
    'body .srh-icon{background:#dfe9ff;color:#141b5d;border:2px solid #1b2340;}',
    'body .srh-panel{border:2px solid #1b2340;border-top:0;box-shadow:0 4px 0 #1b2340;}',
    'body .home-head .focus{margin-right:120px;}',
    '@media(max-width:520px){body .home-head .focus{margin-right:80px;}}',
    '@media(prefers-reduced-motion:reduce){body .node:hover,body .vip-mbtn:hover{transform:none;}}'
  ].join('');
  var st = document.createElement('style');
  st.id = 'hs-theme';
  st.textContent = css;
  /* 다른 스크립트가 나중에 스타일을 더해도 이 판이 맨 뒤에 남게 한다 */
  function last() { if (st.parentNode !== document.head || document.head.lastElementChild !== st) document.head.appendChild(st); }
  last();
  window.addEventListener('load', last);
  setTimeout(last, 1500);

  if (!I) return;
  /* 로그인 화면 아래쪽 언덕(그림) */
  var login = document.getElementById('login');
  if (login && !login.querySelector('.hs-login-art')) {
    var art = document.createElement('div');
    art.className = 'hs-login-art'; art.setAttribute('aria-hidden', 'true');
    art.innerHTML = '<svg viewBox="0 0 1000 150" preserveAspectRatio="xMidYMax slice">' +
      '<path d="M0 90 C150 40 300 50 460 90 C600 125 760 70 1000 80 V150 H0z" fill="#7fc79f" stroke="#1b2340" stroke-width="3"/>' +
      '<path d="M0 120 C180 95 360 105 520 130 C680 150 820 115 1000 118 V150 H0z" fill="#4fb884" stroke="#1b2340" stroke-width="3"/>' +
      '<g transform="translate(140,58) scale(.9)">' + I.pair('#3f6fe0') + '</g>' +
      '<g stroke="#1b2340" stroke-width="3"><path d="M820 90v26"/><circle cx="820" cy="76" r="18" fill="#2f9e6a"/><path d="M860 92v22"/><circle cx="860" cy="80" r="13" fill="#3aa877"/></g></svg>';
    login.appendChild(art);
  }
  /* VIP 라운지 그림: 별을 든 두 학생 */
  var vip = document.querySelector('.vip-hero');
  if (vip && !vip.querySelector('.hs-vip-art')) {
    var va = document.createElement('div');
    va.className = 'hs-vip-art'; va.setAttribute('aria-hidden', 'true');
    va.innerHTML = '<svg viewBox="0 0 150 130">' +
      '<g fill="#f6cf47" stroke="#1b2340" stroke-width="2.5" stroke-linejoin="round"><path d="M112 8l6 12 13 2-9 9 2 13-12-6-12 6 2-13-9-9 13-2z"/><path d="M28 14l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/></g>' +
      '<g transform="translate(55,48)">' + I.pair('#7b55c7') + '</g></svg>';
    vip.appendChild(va);
  }
  /* 이번 주 카드 머리에 작은 그림(카드가 다시 그려질 때마다) */
  function homeArt() {
    var head = document.querySelector('#home-card .home-head');
    if (!head || head.querySelector('.hs-home-art')) return;
    var h = document.createElement('div');
    h.className = 'hs-home-art'; h.setAttribute('aria-hidden', 'true');
    h.innerHTML = '<svg viewBox="0 0 120 96"><g transform="translate(46,30)">' + I.pair('#3f6fe0') + '</g></svg>';
    head.appendChild(h);
  }
  var card = document.getElementById('home-card');
  if (card && window.MutationObserver) new MutationObserver(homeArt).observe(card, { childList: true });
  homeArt();
})();
