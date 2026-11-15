/* 2월 시험 로드맵 데이터. 11월 로드맵(data.js의 nodes)과 분리해 둔다.
   status가 'draft'인 동안 학생 화면에는 "준비 중"만 보이고, 주소에 ?feb=preview를 붙이면 초안을 볼 수 있다.
   주차 라벨은 사용자가 정한 이름이다. source는 roadmap-feb.js가 자료실(data.js의 books·content)에서 읽어 올 자료를 가리킨다.
   comment는 칸마다 쓰는 선생님 코멘트(없으면 생략). 학습 내용 맨 앞에 보인다. [[red:강조]]·줄바꿈은 11월 공지와 같은 표기를 쓴다.
   currentWeekId는 선생님이 매주 바꾸는 값이다. 이 주차까지의 자료가 members(2월 과정 학생)에게 자동으로 열린다.
   core=Thinking Core 단원, mid=과제 중급 모의고사 회차, final=파이널 회차, last=최종 회차. 11월 공지·코멘트는 가져오지 않는다.
   시험일이 확정되면 examDateNote를 지우고 status를 'published'로 바꾼다. */
window.GFIELD_ROADMAP_FEB = {
  meta: {
    label: '2월 시험 로드맵',
    examLabel: '생각하는 황소 입학시험',
    examDate: '2027-02-07',
    examDateNote: '예정',
    status: 'published',
    currentWeekId: 'feb-w01',
    members: ['박선우', '김서현', '이승우', '정준우'],
    novMaterials: { label: '11월 시험 복기 문제·답안과 설명회 영상', url: 'seminar/2026-video/' },
    audience: '11월 시험에 응시하지 못했거나 2월에 시험을 보는 학생'
  },
  nodes: [
    { id: 'feb-div-1', type: 'divider', label: 'Phase 1 · Thinking Core + 중급 모의고사 과제' },
    { id: 'feb-w01', type: 'week', source: { core: 1, mid: 1 }, track: 'exam', date: '11월 2주차', title: 'THINKING CORE CH1',
      desc: '개념 교재 · NUMBERS', focus: '과제: 중급 모의고사 1회' },
    { id: 'feb-w02', type: 'week', source: { core: 2, mid: 2 }, track: 'exam', date: '11월 3주차', title: 'THINKING CORE CH2',
      desc: '개념 교재 · Algebra', focus: '과제: 중급 모의고사 2회' },
    { id: 'feb-w03', type: 'week', source: { core: 3, mid: 3 }, track: 'exam', date: '11월 4주차', title: 'THINKING CORE CH3',
      desc: '개념 교재 · Numbers & Case', focus: '과제: 중급 모의고사 3회' },
    { id: 'feb-w04', type: 'week', source: { core: 4, mid: 4 }, track: 'exam', date: '12월 1주차', title: 'THINKING CORE CH4',
      desc: '개념 교재 · Geometry', focus: '과제: 중급 모의고사 4회' },
    { id: 'feb-div-2', type: 'divider', label: 'Phase 2 · 파이널 실전 모의고사' },
    { id: 'feb-w05', type: 'week', source: { final: 1 }, track: 'final', date: '12월 2주차', title: '파이널 실전 모의고사 1회',
      desc: '파이널 모의고사' },
    { id: 'feb-w06', type: 'week', source: { final: 2 }, track: 'final', date: '12월 3주차', title: '파이널 실전 모의고사 2회',
      desc: '파이널 모의고사' },
    { id: 'feb-w07', type: 'week', source: { final: 3 }, track: 'final', date: '12월 4주차', title: '파이널 실전 모의고사 3회',
      desc: '파이널 모의고사' },
    { id: 'feb-w08', type: 'week', source: { final: 4 }, track: 'final', date: '1월 1주차', title: '파이널 실전 모의고사 4회',
      desc: '파이널 모의고사' },
    { id: 'feb-div-3', type: 'divider', label: 'Phase 3 · 최종 실전 모의고사' },
    { id: 'feb-w09', type: 'week', source: { last: 1 }, track: 'final', date: '1월 2주차', title: '최종 실전 모의고사 1회',
      desc: '최종 모의고사' },
    { id: 'feb-w10', type: 'week', source: { last: 2 }, track: 'final', date: '1월 3주차', title: '최종 실전 모의고사 2회',
      desc: '최종 모의고사' },
    { id: 'feb-w11', type: 'week', source: { last: 3 }, track: 'final', date: '1월 4주차', title: '최종 실전 모의고사 3회',
      desc: '최종 모의고사' },
    { id: 'feb-w12', type: 'week', source: { last: 4 }, track: 'final', date: '1월 5주차', title: '최종 실전 모의고사 4회',
      desc: '최종 모의고사 · 시험 주간' },
    { id: 'feb-goal', type: 'goal', date: '2027년 2월 7일(일) 예정', title: '생각하는 황소 입학시험',
      desc: '시험 날짜가 확정되면 이 칸을 갱신합니다.' }
  ]
};
