/* =========================================================
 * 지필드 영재교육 · 생각하는 황소 대비 아카이브 (GFIELD-ON)
 * 공용 데이터 파일 — 이 파일만 수정하면 학생 화면과 어드민이 함께 갱신됩니다.
 * ========================================================= */
window.GFIELD_DATA = {
  meta: {
    academy: "지필드 영재교육",
    title: "생각하는 황소 대비 아카이브",
    year: "2026 하반기",
    currentWeekId: "jul-w2",
    examDate: "2026-11-01",
    examLabel: "생각하는 황소 입학시험"
  },

  nodes: [
    { id:"may-w34", type:"week", track:"concept", date:"5월 3·4주차", title:"GIFTED MATH 3 V1-1", desc:"HS 개념 다지기", focus:"기초 개념 확립 주간" },
    { id:"jun-w12", type:"week", track:"concept", date:"6월 1·2주차", title:"GIFTED MATH 3 V1-2", desc:"HS 개념 다지기", focus:"심화 연산 및 개념 완성" },
    { id:"jun-w3",  type:"week", track:"apply",   date:"6월 3주차",   title:"THINKING BASIC 1", desc:"HS 개념 응용", focus:"문제 푸는 방법 찾기 (1)" },
    { id:"jun-w4",  type:"week", track:"apply",   date:"6월 4주차",   title:"THINKING BASIC 2", desc:"HS 개념 응용", focus:"문제 푸는 방법 찾기 (2)" },
    { id:"jul-w1",  type:"week", track:"apply",   date:"7월 1주차",   title:"THINKING BASIC 3", desc:"HS 개념 응용", focus:"규칙 찾아 문제 해결하기 (1)" },

    { id:"jul-w2",  type:"week", track:"exam", date:"7월 2주차", title:"THINKING CORE CH1", desc:"NUMBERS (1) + 중급 모의고사 1회", focus:"수업 시간 30분 연장 시작 · 실전 개념 병행" },
    { id:"jul-w3",  type:"week", track:"exam", date:"7월 3주차", title:"THINKING CORE CH2", desc:"Algebra (1) + 중급 모의고사 2회", focus:"개념 적용 및 오답 제로 훈련" },
    { id:"jul-w4",  type:"week", track:"exam", date:"7월 4주차", title:"THINKING CORE CH3", desc:"Numbers & Case + 중급 모의고사 3회", focus:"주차별 출석생 두 영상 동시 권한" },
    { id:"jul-w5",  type:"week", track:"exam", date:"7월 5주차", title:"THINKING CORE CH4", desc:"Geometry + 중급 모의고사 4회", focus:"도형/기하 파트 실전 적응" },

    { id:"special-summer", type:"special", track:"special", date:"7월 말~8월 중순", title:"[선택] 방학 특강 모의고사 집중반", desc:"월·수·금 09:30 ~ 12:00", focus:"특강 수강생 전용 · 정규 진도와 별개로 신청" },

    { id:"aug-w2",  type:"week", track:"exam", date:"8월 2주차", title:"THINKING CORE CH5", desc:"활용 + 중급 모의고사 5회", focus:"실전 개념 단원 종료" },

    { id:"div-mock", type:"divider", label:"Phase 2 · 중급 모의고사 집중 훈련 진입" },

    { id:"aug-w3",  type:"week", track:"mock", date:"8월 3주차", title:"중급 모의고사 6회", desc:"실전 풀이 및 오답 리뷰", focus:"모의고사 집중 훈련 체제 전환" },
    { id:"aug-w4",  type:"week", track:"mock", date:"8월 4주차", title:"중급 모의고사 7회", desc:"실전 풀이 및 오답 리뷰", focus:"약점 유형 변형 문제 풀이" },
    { id:"sep-w1",  type:"week", track:"mock", date:"9월 1주차", title:"중급 모의고사 8회", desc:"실전 풀이 및 오답 리뷰", focus:"중급 단계 최종 마무리 · 분석 리포트" },

    { id:"div-final", type:"divider", label:"Phase 3 · 파이널 과정 진입 (실전 리허설)" },

    { id:"sep-14", type:"week", track:"final", date:"9월 14일 주차", title:"파이널 실전 모의고사 1회", desc:"신유형 지문 분석", focus:"파이널 과정 OT" },
    { id:"sep-21", type:"week", track:"final", date:"9월 21일 주차", title:"파이널 실전 모의고사 2회", desc:"영재성 검사 대비", focus:"OMR 마킹 훈련 도입" },
    { id:"sep-28", type:"week", track:"final", date:"9월 28일 주차", title:"파이널 실전 모의고사 3회", desc:"고난도 킬러 문항", focus:"3단계 가정 학습 수행률 점검" },
    { id:"oct-5",  type:"week", track:"final", date:"10월 5일 주차", title:"파이널 실전 모의고사 4회", desc:"오답 변형 무한 반복", focus:"OMR 마킹 및 80분 시간 배분 전략" },
    { id:"oct-12", type:"week", track:"final", date:"10월 12일 주차", title:"파이널 실전 모의고사 5회", desc:"실전 훈련", focus:"중간 성적 분석 리포트 배부" },
    { id:"oct-19", type:"week", track:"final", date:"10월 19일 주차", title:"파이널 실전 모의고사 6회", desc:"실전 시간 배분 훈련", focus:"목표 레벨(경시/심화/실력/일품) 기준선 제시" },
    { id:"oct-26", type:"week", track:"final", date:"10월 26일 주차", title:"파이널 실전 모의고사 7회 (최종 리허설)", desc:"실전 대비 총정리", focus:"종강 및 학부모 최종 상담" },

    { id:"goal-exam", type:"goal", date:"11월 1일(일)", title:"생각하는 황소 입학시험", desc:"누적 데이터 기반 최종 상담 및 시험 응시", focus:"" }
  ],

  content: {
    "may-w34": { notice:"", homework:"", textbooks:[] },
    "jun-w12": { notice:"", homework:"", textbooks:[] },
    "jun-w3":  { notice:"", homework:"", textbooks:[] },
    "jun-w4":  { notice:"", homework:"", textbooks:[] },
    "jul-w1":  { notice:"", homework:"", textbooks:[] },

    "jul-w2": {
      notice: [
        "1. GIFTED MATH 3 V1-1(2) 과제 질문",
        "https://youtu.be/ynVb1PG5wp0",
        "  · 약점 유형 - 도형의 개수세기",
        "    수업 중 진행된 영상 안의 유형들을 꼭 복습해주세요. 영상을 봐야 합니다.",
        "  · [약점 해결 추가 자료] 필요한 경우 학습해주세요.",
        "    더 다양한 도형의 개수 세기 : https://naver.me/GYGahDDd",
        "",
        "2. GIFTED MATH 3 V1-2(1)",
        "https://youtu.be/3KyijX8_neQ",
        "  · p4의 4번째 문제 같은 '조건에 알맞은 수'는 특별한 스킬이 필요하지 않습니다.",
        "    대부분 첫 글자·수를 쓰는 것부터 시작합니다. 오래 걸릴 것 같아도 방법을 알고 시도하지 않는 것이 문제입니다.",
        "    - 기출 다지기 / 사고력 키우기",
        "",
        "※ 학원이 모든 것을 해결해 주지 않습니다. 지금은 제 자료만으로도 차고 넘치니 가정 학습을 늘려주세요.",
        "   가장 좋은 선생님은 부모님입니다. 상담이 필요하시면 톡 주세요 ^^",
        "※ 학원 특강 시간표가 모두 확정되었습니다. 이번 주 마감 예정이니 확인해 주세요. https://naver.me/FNIa1gbz"
      ].join("\n"),
      homework: [
        "황소 대비 모의고사 중급 1회",
        "https://youtu.be/_DDz_JTccso",
        "앞으로 있을 실전 모의고사에 익숙해지는 훈련입니다. 조건을 조금 줄인 시험지이며, 너무 심화 문제까지 완벽히 이해할 필요는 없습니다(100점이 목표가 아닙니다).",
        "단, 반드시 시험을 본 후 영상을 보고 이해하고, 여러 번 봐도 이해되지 않는(실수가 아닌) 유형을 질문하도록 해주세요.",
        "수업 시간에 중요 유형 설명 후 유사 문제로 테스트를 진행합니다."
      ].join("\n"),
      textbooks: []
    },

    "jul-w3":  { notice:"", homework:"", textbooks:[] },
    "jul-w4":  { notice:"", homework:"", textbooks:[] },
    "jul-w5":  { notice:"", homework:"", textbooks:[] },
    "special-summer": { notice:"", homework:"", textbooks:[] },
    "aug-w2":  { notice:"", homework:"", textbooks:[] },
    "aug-w3":  { notice:"", homework:"", textbooks:[] },
    "aug-w4":  { notice:"", homework:"", textbooks:[] },
    "sep-w1":  { notice:"", homework:"", textbooks:[] },
    "sep-14":  { notice:"", homework:"", textbooks:[] },
    "sep-21":  { notice:"", homework:"", textbooks:[] },
    "sep-28":  { notice:"", homework:"", textbooks:[] },
    "oct-5":   { notice:"", homework:"", textbooks:[] },
    "oct-12":  { notice:"", homework:"", textbooks:[] },
    "oct-19":  { notice:"", homework:"", textbooks:[] },
    "oct-26":  { notice:"", homework:"", textbooks:[] }
  },

  students: ["김민준", "이서연", "박지호"],

  attendance: {
    "김민준": ["may-w34","jun-w12","jun-w3","jun-w4","jul-w1","jul-w2"],
    "이서연": ["may-w34","jun-w12","jun-w3","jun-w4","jul-w1"],
    "박지호": ["may-w34","jun-w12","jun-w3"]
  },

  specialStudents: ["김민준"],

  archiveFolders: ["보충학습", "약점 유형", "사고력 교재 보충"],
  archiveAccess: {
    "보충학습": ["*"],
    "약점 유형": ["*"],
    "사고력 교재 보충": ["*"]
  },
  /* 자료실(서재) — 책장에 꽂힌 교재. 누르면 페이지를 한 장씩 이미지로 넘겨봄(다운로드 불가).
   * base: 페이지 이미지 폴더 경로(끝 슬래시 없이), 페이지는 base/p-01.ext ~ p-NN.ext
   * count: 총 페이지 수, ext: 확장자(jpg/png), cover(선택): 표지 이미지 URL(없으면 1쪽)
   */
  books: [
    { folder:"사고력 교재 보충", title:"G-MATH BASIC 1", base:"https://raw.githubusercontent.com/docssam1/ad/main/kid/basic", count:19, ext:"jpg", date:"2026-06-29" },
    { folder:"사고력 교재 보충", title:"G-ROOT 상(上)", base:"https://raw.githubusercontent.com/docssam1/ad/main/kid/groot", count:17, ext:"jpg", date:"2026-06-29" },
    { folder:"보충학습", title:"탄탄 모의고사", base:"https://raw.githubusercontent.com/docssam1/ad/main/kid/5moi", count:7, ext:"jpg", date:"2026-06-29" }
  ],

  info: [
    {
      title: "생각하는 황소 초등 선발, 무엇을 보나",
      date: "2026-06-29",
      body: "생각하는 황소 입학시험은 단편 선행이 아니라 깊이 있는 수학적 사고력과 정확성을 평가합니다.\n· 출제 범위: 초3 과정까지의 연산을 바탕으로 한 사고력\n· 핵심: 단 하나의 오답도 만들지 않는 정확성 훈련\n자세한 일정과 대비 전략은 로드맵 탭을 참고하세요.",
      video: ""
    }
  ]
};
