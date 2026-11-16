/* 로드맵 2월 시험·승급과정 화면의 그림(손그림 느낌 SVG).
   같은 외곽선(#1b2340)·단색 면·그라데이션 없음. 남학생·여학생 캐릭터는 두 화면이 같은 모양을 쓴다.
   roadmap-feb.js, upgrade-course.js, upgrade-bank.js가 window.GFIELD_ILLUST로 가져다 쓴다. */
(function () {
  'use strict';
  var INK = '#1b2340';
  /* 사이트 공통 글꼴(* 선택자)이 SVG 글자에도 걸리므로 그림 글자는 Jua로 되돌린다 */
  var st = document.createElement('style');
  st.textContent = '.hs-scene text,.hs-cover text,.hs-ph-art text{font-family:Jua,sans-serif;font-weight:400;}';
  document.head.appendChild(st);
  var C = { ink: INK, navy: '#141b5d', feb: '#3f6fe0', febSoft: '#dfe9ff', upg: '#7b55c7', upgSoft: '#ece3fb',
    sun: '#f6cf47', leaf: '#4fb884', coral: '#ff9f7a', sky: '#cfe2ff', lilac: '#e9e0fb' };

  /* 학생: 가방 멘 아이가 오른쪽으로 걷는 모습(얼굴은 앞). 가방 색만 바꾼다. 발이 y=58 근처, 가운데가 x=40 */
  function limb(d, color) {
    return '<path d="' + d + '" fill="none" stroke="' + INK + '" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>';
  }
  /* girl이 참이면 단발머리·원피스. 둘 다 같은 몸 틀을 쓴다 */
  function kid(bag, girl) {
    var SKIN = '#f7d2b0', PANTS = '#2d3f86', SHIRT = girl ? '#ff9f7a' : '#f6cf47', HAIR = '#2b2233';
    var body = girl
      ? '<path d="M36 2 h12 a10 10 0 0 1 10 10 l5 30 h-42 l5 -30 a10 10 0 0 1 10 -10z" fill="' + SHIRT + '" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>'
      : '<rect x="26" y="2" width="30" height="38" rx="12" fill="' + SHIRT + '" stroke="' + INK + '" stroke-width="3"/>';
    var hair = girl
      ? '<path d="M23 -6 C22 -24 32 -30 42 -30 C52 -30 62 -24 61 -6 L61 2 C58 4 55 3 55 -1 C55 -12 51 -18 42 -18 C34 -18 30 -13 29 -4 C29 2 26 4 23 2z" fill="' + HAIR + '" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>'
      : '<circle cx="27" cy="-11" r="4" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.5"/>' +
        '<circle cx="57" cy="-11" r="4" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="2.5"/>';
    var cap = girl ? '' : '<path d="M26 -13 C26 -24 34 -29 42 -29 C51 -29 58 -23 58 -13 C53 -19 47 -20 42 -17 C37 -14 31 -13 26 -13z" fill="' + HAIR + '" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>';
    return '<g class="hs-kid' + (girl ? ' girl' : '') + '">' +
      '<ellipse cx="40" cy="62" rx="24" ry="5" fill="' + INK + '" opacity=".18"/>' +
      limb('M36 36 L27 56', PANTS) + limb('M45 36 L53 56', PANTS) +
      '<g fill="' + INK + '"><ellipse cx="25" cy="58" rx="7" ry="4"/><ellipse cx="56" cy="58" rx="7" ry="4"/></g>' +
      limb('M30 12 L22 30', SKIN) +
      '<rect x="12" y="4" width="20" height="30" rx="7" fill="' + bag + '" stroke="' + INK + '" stroke-width="3"/>' +
      '<rect x="15" y="18" width="14" height="10" rx="3" fill="#fff" opacity=".85" stroke="' + INK + '" stroke-width="2"/>' +
      body +
      '<path d="M32 5 L35 30" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>' +
      limb('M48 11 L58 27', SKIN) +
      hair +
      '<circle cx="42" cy="-12" r="16" fill="' + SKIN + '" stroke="' + INK + '" stroke-width="3"/>' +
      (girl ? '<path d="M27 -12 C27 -24 34 -29 42 -29 C50 -29 57 -24 57 -12 C52 -18 47 -19 42 -16 C38 -19 31 -18 27 -12z" fill="' + HAIR + '" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<rect x="49" y="-26" width="9" height="5" rx="2" fill="' + C.sun + '" stroke="' + INK + '" stroke-width="2" transform="rotate(25 53 -23)"/>' : cap) +
      '<circle cx="36.5" cy="-10" r="2.3" fill="' + INK + '"/><circle cx="47.5" cy="-10" r="2.3" fill="' + INK + '"/>' +
      '<circle cx="37.2" cy="-10.8" r=".8" fill="#fff"/><circle cx="48.2" cy="-10.8" r=".8" fill="#fff"/>' +
      '<circle cx="33" cy="-4" r="2.6" fill="#ffb3a7"/><circle cx="51" cy="-4" r="2.6" fill="#ffb3a7"/>' +
      '<path d="M38.5 -4 Q42 0 45.5 -4" fill="none" stroke="' + INK + '" stroke-width="2.2" stroke-linecap="round"/>' +
      '</g>';
  }
  /* 남학생과 여학생이 나란히 걷는다(여학생이 한 걸음 뒤). 기준점은 남학생과 같다 */
  function pair(bag) {
    return '<g transform="translate(-34,2)">' + kid('#4fb884', true) + '</g>' + kid(bag, false);
  }
  function sign(x, y, label, h) {
    return '<g transform="translate(' + x + ',' + y + ')"><path d="M0 0v' + (h || 28) + '" stroke="' + INK + '" stroke-width="3"/>' +
      '<rect x="-27" y="-22" width="54" height="24" rx="5" fill="#fff" stroke="' + INK + '" stroke-width="3"/>' +
      '<text y="-4" font-family="Jua" font-size="15" text-anchor="middle" fill="' + INK + '">' + label + '</text></g>';
  }

  /* 2월 큰 그림. 길(.hs-trail)을 따라 학생(.hs-walker)와 말풍선(.hs-bubble)을 놓는 것은 placeWalker가 한다 */
  var TRAIL = 'M250 370 C300 330 360 316 430 300 C520 280 600 262 660 236 C720 210 760 170 800 122';
  function febScene(label) {
    return '<svg class="hs-scene" viewBox="0 0 1000 380" preserveAspectRatio="xMaxYMid slice" role="img" aria-label="' + label + '">' +
      '<rect width="1000" height="380" fill="' + C.sky + '"/>' +
      '<circle cx="880" cy="70" r="34" fill="' + C.sun + '" stroke="' + INK + '" stroke-width="3"/>' +
      '<path d="M880 20v-10M880 130v10M830 70h-10M930 70h10M845 35l-7-7M915 35l7-7" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="M560 70c0-14 18-22 30-14 6-14 30-14 36 0 14-4 24 6 22 18H560z" fill="#fff" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="M690 130c0-10 13-16 22-10 4-10 22-10 26 0 10-3 18 4 16 13H690z" fill="#fff" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="M600 380 L800 120 L860 170 L900 140 L1000 250 L1000 380z" fill="#9db7ee" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="M800 120 L770 160 L790 155 L800 170 L815 152 L833 160z" fill="#fff" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="M800 120 V58" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>' +
      '<path d="M802 60 h62 l-12 16 l12 16 h-62z" fill="' + C.coral + '" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
      '<text x="828" y="83" font-family="Jua" font-size="17" text-anchor="middle" fill="' + INK + '">2월</text>' +
      '<path d="M330 380 C420 250 560 230 700 270 C780 292 860 300 1000 330 V380z" fill="#7fc79f" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="M0 300 C120 250 240 262 380 300 C470 324 560 330 640 380 H0z" fill="' + C.leaf + '" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
      '<g stroke="' + INK + '" stroke-width="3" stroke-linejoin="round">' +
      '<path d="M90 268v22"/><circle cx="90" cy="252" r="20" fill="#2f9e6a"/>' +
      '<path d="M140 262v20"/><circle cx="140" cy="248" r="15" fill="#3aa877"/>' +
      '<path d="M560 262v22"/><path d="M560 222l18 34h-36z" fill="#2f9e6a"/>' +
      '<path d="M592 270v18"/><path d="M592 238l14 28h-28z" fill="#3aa877"/></g>' +
      '<path d="' + TRAIL + '" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round"/>' +
      '<path class="hs-trail" d="' + TRAIL + '" fill="none" stroke="' + INK + '" stroke-width="3" stroke-dasharray="2 12" stroke-linecap="round"/>' +
      sign(160, 302, '1단계', 30) + sign(575, 318, '2단계', 26) + sign(745, 262, '3단계', 24) +
      '<g class="hs-walker">' + pair(C.feb) + '</g>' +
      '<g class="hs-bubble"><path d="M0 0h132a10 10 0 0 1 10 10v28a10 10 0 0 1-10 10H34l-14 14 2-14H10A10 10 0 0 1 0 38V10A10 10 0 0 1 10 0z" fill="#fff" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
      '<text class="hs-bubble-t" x="71" y="31" font-family="Jua" font-size="18" text-anchor="middle" fill="' + INK + '"></text></g>' +
      '</svg>';
  }
  /* 지금 주차 위치(0~1)에 학생을 세운다. 화면에 붙인 뒤 불러야 길이를 잴 수 있다 */
  function placeWalker(svg, t, bubbleText) {
    var path = svg && svg.querySelector('.hs-trail'), w = svg && svg.querySelector('.hs-walker'), b = svg && svg.querySelector('.hs-bubble');
    if (!path || !w || !path.getTotalLength) return;
    /* 휴대폰(600px 이하)은 그림을 잘라 쓰므로 길 시작부터 깃발까지만 보이게 한다 */
    var narrow = false;
    try { narrow = matchMedia('(max-width:600px)').matches; } catch (e) {}
    svg.setAttribute('viewBox', narrow ? '150 0 730 380' : '0 0 1000 380');
    var L = path.getTotalLength(), pt = path.getPointAtLength(Math.max(0, Math.min(1, t)) * L);
    w.setAttribute('transform', 'translate(' + (pt.x - 54) + ',' + (pt.y - 78) + ') scale(1.35)');
    if (!b) return;
    if (!bubbleText) { b.style.display = 'none'; return; }
    b.querySelector('.hs-bubble-t').textContent = bubbleText;
    var high = pt.y < 235;   // 정상 가까이에서는 깃발을 가리지 않게 학생 왼쪽에 둔다
    var bx = high ? pt.x - 250 : Math.min(pt.x + 32, 840), by = high ? pt.y - 30 : pt.y - 140;
    b.querySelector('path').setAttribute('transform', high ? 'translate(142,0) scale(-1,1)' : '');
    b.setAttribute('transform', 'translate(' + bx + ',' + by + ')');
  }

  /* 단계별 작은 그림 (1: 숲과 전구, 2: 시험지와 연필, 3: 정상 깃발) */
  function phaseArt(i) {
    var s = '<svg class="hs-ph-art" viewBox="0 0 320 96" preserveAspectRatio="xMidYMid slice" aria-hidden="true">';
    if (i === 0) s += '<rect width="320" height="96" fill="#dff1e6"/>' +
      '<path d="M0 70 C80 50 160 58 320 66 V96 H0z" fill="#7fc79f" stroke="' + INK + '" stroke-width="2.5"/>' +
      '<g stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"><path d="M60 64v14"/><circle cx="60" cy="50" r="16" fill="#2f9e6a"/>' +
      '<path d="M96 60v14"/><circle cx="96" cy="48" r="12" fill="#3aa877"/><path d="M250 62v14"/><circle cx="250" cy="48" r="15" fill="#2f9e6a"/>' +
      '<g transform="translate(160,16)"><path d="M0 22a16 16 0 1 1 22 0c-3 3-4 6-4 10h-14c0-4-1-7-4-10z" fill="' + C.sun + '"/><path d="M5 38h12" stroke-linecap="round"/></g></g>';
    else if (i === 1) s += '<rect width="320" height="96" fill="' + C.febSoft + '"/>' +
      '<path d="M0 78 C70 40 140 40 210 64 C250 76 290 70 320 58 V96 H0z" fill="#9db7ee" stroke="' + INK + '" stroke-width="2.5"/>' +
      '<g transform="translate(130,14) rotate(-6)" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"><rect width="48" height="60" rx="4" fill="#fff"/>' +
      '<path d="M9 14h30M9 24h30M9 34h20" stroke-linecap="round"/><path d="M30 44l5 5 9-11" fill="none" stroke="' + C.feb + '" stroke-width="3" stroke-linecap="round"/></g>' +
      '<g transform="translate(196,22) rotate(30)" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"><rect width="10" height="44" fill="' + C.sun + '"/>' +
      '<path d="M0 44l5 10 5-10z" fill="#f2c9a0"/><rect width="10" height="7" fill="' + C.coral + '"/></g>';
    else s += '<rect width="320" height="96" fill="#ffe9de"/>' +
      '<path d="M40 96 L150 24 L190 52 L215 36 L300 96z" fill="#9db7ee" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
      '<path d="M150 24 L132 46 L146 42 L152 52 L162 40 L174 45z" fill="#fff" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
      '<path d="M150 24V4" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="M152 5h30l-6 7 6 7h-30z" fill="' + C.coral + '" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>';
    return s + '</svg>';
  }

  /* 승급 큰 그림: 세 영역을 계단으로 (복습 강의 → Test → 자료실 → 편입·승급) */
  function upgScene(label) {
    function step(x, y, w, h, fill, text, tc) {
      return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="6" fill="' + fill + '"/>' +
        '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="10" rx="4" fill="#fff"/>' +
        '<text x="' + (x + w / 2) + '" y="' + (y + h / 2 + 12) + '" fill="' + tc + '" stroke="none">' + text + '</text>';
    }
    return '<svg class="hs-scene" viewBox="0 0 1000 340" preserveAspectRatio="xMaxYMid slice" role="img" aria-label="' + label + '">' +
      '<rect width="1000" height="340" fill="' + C.lilac + '"/>' +
      '<g fill="' + C.sun + '" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round">' +
      '<path d="M560 60l6 12 13 2-9 9 2 13-12-6-12 6 2-13-9-9 13-2z"/><path d="M960 40l4 8 9 1-6 6 1 9-8-4-8 4 1-9-6-6 9-1z"/></g>' +
      '<path d="M0 300 H1000 V340 H0z" fill="#c9b6f0" stroke="' + INK + '" stroke-width="3"/>' +
      '<g stroke="' + INK + '" stroke-width="3" stroke-linejoin="round" font-family="Jua" font-size="20" text-anchor="middle">' +
      step(500, 256, 160, 44, C.upg, '복습 강의', '#fff') +
      step(600, 206, 160, 50, C.feb, 'Test 문제은행', '#fff') +
      step(700, 152, 160, 54, C.sun, '편입 자료실', INK) +
      '<rect x="800" y="94" width="150" height="58" rx="6" fill="#fff" stroke-dasharray="8 6"/>' +
      '<text x="875" y="130" fill="#5b4a92" stroke="none">편입·승급!</text></g>' +
      '<g transform="translate(632,122) scale(1.35)">' + pair(C.upg) + '</g>' +
      '</svg>';
  }

  /* 영역 머리 그림 52×52 */
  var ICON = {
    lec: '<svg class="hs-ic" viewBox="0 0 52 52" aria-hidden="true"><rect x="3" y="8" width="46" height="32" rx="7" fill="' + C.febSoft + '" stroke="' + INK + '" stroke-width="2.5"/>' +
      '<path d="M22 17l11 7-11 7z" fill="' + C.feb + '" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/><path d="M17 46h18M26 40v6" stroke="' + INK + '" stroke-width="2.5" stroke-linecap="round"/></svg>',
    bank: '<svg class="hs-ic" viewBox="0 0 52 52" aria-hidden="true"><rect x="9" y="4" width="34" height="44" rx="4" fill="#fff" stroke="' + INK + '" stroke-width="2.5"/>' +
      '<path d="M16 14h20M16 22h20M16 30h12" stroke="' + INK + '" stroke-width="2.5" stroke-linecap="round"/><circle cx="37" cy="38" r="10" fill="' + C.leaf + '" stroke="' + INK + '" stroke-width="2.5"/>' +
      '<path d="M32 38l4 4 6-7" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    book: '<svg class="hs-ic" viewBox="0 0 52 52" aria-hidden="true"><path d="M4 12c8-3 15-3 22 2v30c-7-5-14-5-22-2z" fill="#fff" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
      '<path d="M48 12c-8-3-15-3-22 2v30c7-5 14-5 22-2z" fill="' + C.upgSoft + '" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
      '<path d="M9 20c4-1 8-1 12 1M9 27c4-1 8-1 12 1" stroke="' + INK + '" stroke-width="2" stroke-linecap="round"/></svg>'
  };
  /* 작은 선 그림(글자색을 따름) */
  var LINE = {
    lock: '<svg class="hs-li" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="2.2"/></svg>',
    check: '<svg class="hs-li" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    map: '<svg class="hs-li" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z M9 4v14 M15 6v14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/></svg>',
    flag: '<svg class="hs-li" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 21V4M5 4h12l-3 4 3 4H5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/></svg>',
    stairs: '<svg class="hs-li" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 20h5v-5h5v-5h5V5h3" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/></svg>',
    clip: '<svg class="hs-li" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11l-8.5 8.5a5 5 0 0 1-7-7L13 4a3.5 3.5 0 0 1 5 5l-8.5 8.5a2 2 0 0 1-3-3L14 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    print: '<svg class="hs-li" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 9V3h10v6M7 17H4v-8h16v8h-3M7 14h10v7H7z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/></svg>',
    play: '<svg class="hs-li" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5l11 7-11 7z" fill="currentColor"/></svg>'
  };

  /* 표지 그림이 없는 교재에 그려 주는 표지. 제목 글자로 색·무늬를 정해 같은 책은 늘 같은 표지 */
  var COVERS = [[C.upg, '#5b3ea3'], [C.feb, '#2a54b8'], [C.coral, '#e07d58'], [C.leaf, '#2f8f63'], [C.sun, '#d9a400']];
  function hash(s) { var h = 0; s = String(s || ''); for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
  function motif(k, light) {
    var f = light ? '#fff' : C.sun;
    if (k === 0) return '<circle cx="66" cy="62" r="24" fill="' + f + '" stroke="' + INK + '" stroke-width="3"/><path d="M52 62h28M66 48v28" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>';
    if (k === 1) return '<path d="M42 82 L66 38 L90 82z" fill="#fff" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/><rect x="54" y="58" width="26" height="26" fill="' + C.leaf + '" stroke="' + INK + '" stroke-width="3"/>';
    if (k === 2) {
      var g = '';
      for (var r = 0; r < 3; r++) for (var c = 0; c < 3; c++) g += '<rect x="' + (42 + c * 16) + '" y="' + (38 + r * 16) + '" width="16" height="16" fill="' + ((r + c) % 2 ? f : '#fff') + '"/>';
      return '<g stroke="' + INK + '" stroke-width="2.5">' + g + '</g>';
    }
    return '<g stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"><path d="M44 50 l22-12 22 12 -22 12z" fill="#fff"/><path d="M44 50v22l22 12V62z" fill="' + f + '"/><path d="M88 50v22L66 84V62z" fill="#fff"/></g>';
  }
  function cover(title, small) {
    var h = hash(title), pal = COVERS[h % COVERS.length], k = (h >> 3) % 4;
    var t = String(title || '교재').replace(/[&<>"']/g, '');
    var short = t.length > 9 ? t.slice(0, 8) + '…' : t;
    return '<svg class="hs-cover" viewBox="0 0 120 160" aria-hidden="true">' +
      '<rect x="6" y="4" width="108" height="150" rx="6" fill="' + pal[0] + '" stroke="' + INK + '" stroke-width="3"/>' +
      '<rect x="6" y="4" width="14" height="150" rx="4" fill="' + pal[1] + '" stroke="' + INK + '" stroke-width="3"/>' +
      motif(k, pal[0] === C.sun) +
      (small ? '' : '<rect x="26" y="108" width="82" height="26" rx="5" fill="#fff" stroke="' + INK + '" stroke-width="2.5"/>' +
        '<text x="67" y="126" font-family="Jua" font-size="13" text-anchor="middle" fill="' + INK + '">' + short + '</text>') +
      '</svg>';
  }
  /* 강의 썸네일: 펼친 교재 + 재생 단추 */
  function lecThumb(title) {
    var pal = COVERS[hash(title) % COVERS.length];
    return '<svg class="hs-thumb" viewBox="0 0 96 64" aria-hidden="true"><rect width="96" height="64" fill="' + C.upgSoft + '"/>' +
      '<rect x="10" y="10" width="34" height="44" rx="3" fill="#fff" stroke="' + INK + '" stroke-width="2"/>' +
      '<path d="M16 20h22M16 28h22M16 36h14" stroke="' + INK + '" stroke-width="2" stroke-linecap="round"/>' +
      '<circle cx="68" cy="32" r="14" fill="' + pal[0] + '" stroke="' + INK + '" stroke-width="2"/><path d="M64 25l10 7-10 7z" fill="#fff" stroke="' + INK + '" stroke-width="1.5" stroke-linejoin="round"/></svg>';
  }

  window.GFIELD_ILLUST = { C: C, kid: kid, pair: pair, febScene: febScene, placeWalker: placeWalker, phaseArt: phaseArt,
    upgScene: upgScene, ICON: ICON, LINE: LINE, cover: cover, lecThumb: lecThumb };
})();
