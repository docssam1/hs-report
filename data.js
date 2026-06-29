/* =========================================================
 * 지필드 영재교육 · 생각하는 황소 대비 아카이브 (GFIELD-ON)
 * 공용 데이터 파일
 *  - 이 파일 하나만 수정하면 학생용 로드맵과 어드민이 함께 갱신됩니다.
 *  - 어드민(admin.html)에서 편집 후 GitHub 저장 또는 내보내기로 이 파일을 교체하세요.
 * ========================================================= */
window.GFIELD_DATA = {
  meta: {
    academy: "지필드 영재교육",
    title: "생각하는 황소 대비 아카이브",
    year: "2026 하반기",
    // 현재 진행 중인 주차 (캐릭터가 멈춰 서는 노드)
    currentWeekId: "jul-w2"
  },

  /* 로드맵 노드 (위 → 아래 순서)
   * type: "week"(정규/모의/파이널 주차) | "special"(방학 특강 브랜치) | "divider"(페이즈 구분선) | "goal"(최종 목표)
   * track: concept(파랑) | apply(하늘) | exam(주황) | mock(진주황) | final(빨강) | special(노랑)
   */
  nodes: [
    { id:"may-w34", type:"week", track:"concept", date:"5월 3·4주차", title:"GIFTED MATH 3 V1-1", desc:"HS 개념 다지기", focus:"기초 개념 확립 주간" },
    { id:"jun-w12", type:"week", track:"concept", date:"6월 1·2주차", title:"GIFTED MATH 3 V1-2", desc:"HS 개념 다지기", focus:"심화 연산 및 개념 완성" },
    { id:"jun-w3",  type:"week", track:"apply",   date:"6월 3주차",   title:"THINKING BASIC 1", desc:"HS 개념 응용", focus:"문제 푸는 방법 찾기 (1)" },
    { id:"jun-w4",  type:"week", track:"apply",   date:"6월 4주차",   title:"THINKING BASIC 2", desc:"HS 개념 응용", focus:"문제 푸는 방법 찾기 (2)" },
    { id:"jul-w1",  type:"week", track:"apply",   date:"7월 1주차",   title:"THINKING BASIC 3", desc:"HS 개념 응용", focus:"규칙 찾아 문제 해결하기 (1)" },

    { id:"jul-w2",  type:"week", track:"exam", date:"7월 2주차", title:"THINKING CORE CH1", desc:"NUMBERS (1) + 중급 모의고사 1회", focus:"⏱ 수업 시간 30분 연장 시작 · 실전 개념 병행" },
    { id:"jul-w3",  type:"week", track:"exam", date:"7월 3주차", title:"THINKING CORE CH2", desc:"Algebra (1) + 중급 모의고사 2회", focus:"개념 적용 및 오답 제로 훈련" },
    { id:"jul-w4",  type:"week", track:"exam", date:"7월 4주차", title:"THINKING CORE CH3", desc:"Numbers & Case + 중급 모의고사 3회", focus:"주차별 출석생 두 영상 동시 권한" },
    { id:"jul-w5",  type:"week", track:"exam", date:"7월 5주차", title:"THINKING CORE CH4", desc:"Geometry + 중급 모의고사 4회", focus:"도형/기하 파트 실전 적응" },

    { id:"special-summer", type:"special", track:"special", date:"7월 말~8월 중순", title:"[선택] 방학 특강 모의고사 집중반", desc:"월·수·금 09:30 ~ 12:00", focus:"특강 수강생 전용 · 정규 진도와 별개로 신청" },

    { id:"aug-w2",  type:"week", track:"exam", date:"8월 2주차", title:"THINKING CORE CH5", desc:"활용 + 중급 모의고사 5회", focus:"실전 개념 단원 종료" },

    { id:"div-mock", type:"divider", label:"🏁 Phase 2 · 중급 모의고사 집중 훈련 진입" },

    { id:"aug-w3",  type:"week", track:"mock", date:"8월 3주차", title:"중급 모의고사 6회", desc:"실전 풀이 및 오답 리뷰", focus:"모의고사 집중 훈련 체제 전환" },
    { id:"aug-w4",  type:"week", track:"mock", date:"8월 4주차", title:"중급 모의고사 7회", desc:"실전 풀이 및 오답 리뷰", focus:"약점 유형 변형 문제 풀이" },
    { id:"sep-w1",  type:"week", track:"mock", date:"9월 1주차", title:"중급 모의고사 8회", desc:"실전 풀이 및 오답 리뷰", focus:"중급 단계 최종 마무리 · 분석 리포트" },

    { id:"div-final", type:"divider", label:"🔥 Phase 3 · 파이널 과정 진입 (실전 리허설)" },

    { id:"sep-14", type:"week", track:"final", date:"9월 14일 주차", title:"파이널 실전 모의고사 1회", desc:"신유형 지문 분석", focus:"파이널 과정 OT" },
    { id:"sep-21", type:"week", track:"final", date:"9월 21일 주차", title:"파이널 실전 모의고사 2회", desc:"영재성 검사 대비", focus:"OMR 마킹 훈련 도입" },
    { id:"sep-28", type:"week", track:"final", date:"9월 28일 주차", title:"파이널 실전 모의고사 3회", desc:"고난도 킬러 문항", focus:"3단계 가정 학습 수행률 점검" },
    { id:"oct-5",  type:"week", track:"final", date:"10월 5일 주차", title:"파이널 실전 모의고사 4회", desc:"오답 변형 무한 반복", focus:"OMR 마킹 및 80분 시간 배분 전략" },
    { id:"oct-12", type:"week", track:"final", date:"10월 12일 주차", title:"파이널 실전 모의고사 5회", desc:"실전 훈련", focus:"중간 성적 분석 리포트 배부" },
    { id:"oct-19", type:"week", track:"final", date:"10월 19일 주차", title:"파이널 실전 모의고사 6회", desc:"실전 시간 배분 훈련", focus:"목표 레벨(경시/심화/실력/일품) 기준선 제시" },
    { id:"oct-26", type:"week", track:"final", date:"10월 26일 주차", title:"파이널 실전 모의고사 7회 (최종 리허설)", desc:"실전 대비 총정리", focus:"종강 및 학부모 최종 상담" },

    { id:"goal-exam", type:"goal", date:"11월 초", title:"🎯 생각하는 황소 입학시험", desc:"누적 데이터 기반 최종 상담 및 시험 응시", focus:"" }
  ],

  /* 주차별 콘텐츠 (어드민에서 채움)
   * concept: 개념 영상 URL, mock: 모의고사 해설 영상 URL, pdf: 자료 PDF URL
   */
  content: {
    "may-w34": { concept:"", mock:"", pdf:"" },
    "jun-w12": { concept:"", mock:"", pdf:"" },
    "jun-w3":  { concept:"", mock:"", pdf:"" },
    "jun-w4":  { concept:"", mock:"", pdf:"" },
    "jul-w1":  { concept:"", mock:"", pdf:"" },
    "jul-w2":  { concept:"", mock:"", pdf:"" },
    "jul-w3":  { concept:"", mock:"", pdf:"" },
    "jul-w4":  { concept:"", mock:"", pdf:"" },
    "jul-w5":  { concept:"", mock:"", pdf:"" },
    "special-summer": { concept:"", mock:"", pdf:"" },
    "aug-w2":  { concept:"", mock:"", pdf:"" },
    "aug-w3":  { concept:"", mock:"", pdf:"" },
    "aug-w4":  { concept:"", mock:"", pdf:"" },
    "sep-w1":  { concept:"", mock:"", pdf:"" },
    "sep-14":  { concept:"", mock:"", pdf:"" },
    "sep-21":  { concept:"", mock:"", pdf:"" },
    "sep-28":  { concept:"", mock:"", pdf:"" },
    "oct-5":   { concept:"", mock:"", pdf:"" },
    "oct-12":  { concept:"", mock:"", pdf:"" },
    "oct-19":  { concept:"", mock:"", pdf:"" },
    "oct-26":  { concept:"", mock:"", pdf:"" }
  },

  /* 학생 명단 */
  students: ["김민준", "이서연", "박지호"],

  /* 정규반 출석/권한: 학생 이름 -> 출석한 주차 id 배열 (열린 자물쇠 🔓)
   * 비어 있으면 기본값으로 현재 주차까지 자동 오픈됩니다.
   */
  attendance: {
    "김민준": ["may-w34","jun-w12","jun-w3","jun-w4","jul-w1","jul-w2"],
    "이서연": ["may-w34","jun-w12","jun-w3","jun-w4","jul-w1"],
    "박지호": ["may-w34","jun-w12","jun-w3"]
  },

  /* 방학 특강 수강생 (special-summer 노드 권한) */
  specialStudents: ["김민준"]
};
