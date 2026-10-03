/* =========================================================
 * 지필드 영재교육 · 초등선발 대비 시그니처 실전 모의고사 진단 데이터
 * 사용자 제공 2024·2025년 12월 초등과정 입학시험 성적분포 이미지는
 * 보존되어 있다. 현재 앱에는 검수된 전체 누적분포가 연결되지 않았으므로
 * 초2 집단의 평균·표준편차 근사값으로 2024년 분포를 2025년 척도로
 * 옮긴 뒤 두 해의 누적분포를 1:1로 합쳐 예상 레벨을 계산한다.
 * 예상 석차는 두 해의 분포를 합친 참고 집단에서만 계산한다.
 * 실제 응시 석차·문항 정답률·합격 여부와 혼동하지 않는다.
 * ========================================================= */
(function(){
  'use strict';

  function pts(no){ return no<=12 ? 2.7 : (no<=22 ? 3.4 : 4.2); }
  function q(no, area, subarea, type, answer, point, difficultyClass){
    return {no:no, area:area, subarea:subarea, type:type, answer:answer, pts:point, difficultyClass:difficultyClass};
  }

  // 이미 확인한 초2 누적 석차의 주요 지점. 전체 행을 전사한 분포가 아니므로
  // 지점 사이는 선형 보간하고 표준편차·경계 점수는 근사값으로 취급한다.
  var historical = {
    y2024:{n:4142,mean:18.35,sdApprox:11.5,knots:[[85.5,1],[75.9,3],[70.9,7],[65.4,14],[60,23],[55.1,52],[50.1,86],[45,132],[40,224],[35.3,340],[31.1,508],[30.1,546],[25,923],[21,1321],[20.4,1368],[19.9,1499],[15,2156],[10.3,3192],[5.4,3797],[4.2,3987],[3.4,3989],[2.7,4002],[0,4142]]},
    y2025:{n:4116,mean:17.84,sdApprox:10.7,knots:[[71.4,1],[60,5],[55.3,17],[50.9,38],[46.1,80],[40,161],[38,194],[35.9,255],[30.1,495],[25,921],[21,1350],[20.4,1400],[19.9,1536],[15,2191],[10.3,3151],[5.4,3682],[4.2,3941],[3.4,3943],[2.7,3961],[0,4116]]}
  };
  function upperShare(year,score){
    var knots=year.knots;
    if(score<=0) return 1;
    if(score>knots[0][0]) return 0;
    for(var i=0;i<knots.length-1;i++){
      var high=knots[i],low=knots[i+1];
      if(score<=high[0]&&score>=low[0]){
        return (high[1]+(high[0]-score)/(high[0]-low[0])*(low[1]-high[1]))/year.n;
      }
    }
    return 1;
  }
  function pooledUpperShare(score){
    var a=historical.y2024,b=historical.y2025;
    var original2024=a.mean+(a.sdApprox/b.sdApprox)*(score-b.mean);
    return (upperShare(a,original2024)+upperShare(b,score))/2;
  }
  function estimatedPosition(score){
    var value=Number(score);
    if(!Number.isFinite(value)||value<0||value>100)return null;
    var cohortSize=Math.round((historical.y2024.n+historical.y2025.n)/2);
    var share=pooledUpperShare(value);
    return {topPercent:Math.round(share*1000)/10,
      rank:Math.max(1,Math.round(share*cohortSize)),cohortSize:cohortSize,
      status:'historical-distribution-estimate'};
  }
  function pooledScoreFor(upperShareTarget){
    var low=0,high=100;
    for(var i=0;i<50;i++){
      var mid=(low+high)/2;
      if(pooledUpperShare(mid)>upperShareTarget) low=mid;
      else high=mid;
    }
    return (low+high)/2;
  }
  var sourceBoundaries=[
    {grade:'경시',y2024:50.1,y2025:46.1},
    {grade:'심화',y2024:40,y2025:38},
    {grade:'실력',y2024:31.1,y2025:30.1},
    {grade:'일품',y2024:21,y2025:21}
  ];
  var cutRows=sourceBoundaries.map(function(row){
    var target=(upperShare(historical.y2024,row.y2024)+upperShare(historical.y2025,row.y2025))/2;
    var pooled=pooledScoreFor(target);
    return {grade:row.grade,y2024:row.y2024,y2025:row.y2025,
      targetTopPct:Math.round(target*1000)/10,pooledPoint2025:Math.round(pooled*10)/10,
      threshold2025:Math.round(pooled*10)/10};
  });
  var cuts=cutRows.map(function(row,i){
    return [i===0?row.grade+' 가능':cutRows[i-1].grade+'컷 · '+row.grade+'안정권',row.threshold2025];
  });
  cuts.push(['노력요함',0]);

  var round1 = [
    q(1, '식의 계산', '합차와 배수', '두 상황의 높이', '155cm', 2.7, 'D2'),
    q(2, '도형', '시각적 변별', '겹친 선분 추적', '18개', 2.7, 'D4'),
    q(3, '도형', '시각적 변별', '왼발·오른발 슬리퍼 판별', '8개', 2.7, 'D4'),
    q(4, '도형', '연결과 영역', '경계 안팎 판별', '9마리', 2.7, 'D3'),
    q(5, '식의 계산', '합차와 배수', '전체합에서 한 도형의 수 찾기', '6', 2.7, 'D2'),
    q(6, '도형', '선과 위치', '교차점', '7곳', 2.7, 'D3'),
    q(7, '도형', '시각적 변별', '겹친 숫자 식별', '78', 2.7, 'D4'),
    q(8, '경우의 수', '포함과 배제', '겹치는 두 모임의 최솟값과 최댓값', '23', 2.7, 'D3'),
    q(9, '경우의 수', '논리추리', '선후관계', 'D-A-B-C-E', 2.7, 'D4'),
    q(10, '수·규칙찾기', '마디수열·규칙찾기', '서로 다른 길이의 반복문자', '20개', 2.7, 'D3'),
    q(11, '수·규칙찾기', '간격·자르기', '그림에서 교점 수 발견', '29도막', 2.7, 'D3'),
    q(12, '식의 계산', '일·속력·시간', '달린 시간과 잠든 시간 분리', '60분 30초', 2.7, 'D3'),
    q(13, '수·규칙찾기', '수 배열의 규칙', '이웃한 수의 차', '1-6-9-4-7-2-5-8-3-0', 3.4, 'D4'),
    q(14, '식의 계산', '거꾸로 생각하기', '전체합에서 각 양 역산', '9마리', 3.4, 'D3'),
    q(15, '수·규칙찾기', '마디수열·규칙찾기', '번갈아 이동', '4번', 3.4, 'D3'),
    q(16, '식의 계산', '달력·요일(시계)', '두 바늘의 상대 운동', '22번', 3.4, 'D3'),
    q(17, '식의 계산', '거꾸로 생각하기', '빈 병 교환', '3300원', 3.4, 'D3'),
    q(18, '식의 계산', '달력·요일(시계)', '서로 다른 오차 시계의 재일치', '300일', 3.4, 'D4'),
    q(19, '경우의 수', '숫자카드로 수 만들기', '범위와 카드 제한', '157개', 3.4, 'D4'),
    q(20, '식의 계산', '우기기/가정하여 풀기', '승패 횟수', '4번', 3.4, 'D4'),
    q(21, '경우의 수', '최단거리', '금지 선분이 있는 경로', '31가지', 3.4, 'D5'),
    q(22, '식의 계산', '합차와 배수', '두 종류씩 나누기', '10명', 3.4, 'D3'),
    q(23, '식의 계산', '식의 완성', '사용 횟수 제한이 있는 최소합', '7개', 4.2, 'D4'),
    q(24, '도형', '쌓기나무', '세 방향의 검은 기둥', '18개', 4.2, 'D5'),
    q(25, '수·규칙찾기', '규칙수열·도형분할', '반복 분할선 길이', '126cm', 4.2, 'D4'),
    q(26, '수·규칙찾기', '조건에 맞는 수', '비표준 디지털 숫자 칸 수', '9711', 4.2, 'D4'),
    q(27, '식의 계산', '재치 있게 계산하기', '반복 숫자 덧셈', '18개', 4.2, 'D4'),
    q(28, '수·규칙찾기', '규칙수열·사각수', '바깥 테두리', '9801개', 4.2, 'D4'),
    q(29, '도형', '도형의 개수', '불규칙 선망의 삼각형', '21개', 4.2, 'D4'),
    q(30, '도형', '공간지각', '평면 미로와 입체 시야', 'H1', 4.2, 'D5')
  ];

  var round2 = [
    q(1, '도형', '도형의 구성·공유', '연속 확장과 공유 꼭짓점', '151개', 2.7, 'D3'),
    q(2, '식의 계산', '합차와 배수', '같은 전체 길이', '5m', 2.7, 'D2'),
    q(3, '수·규칙찾기', '수의 관계', '쌓은 저울의 포함 관계', '700g', 2.7, 'D3'),
    q(4, '식의 계산', '합차와 배수', '전체합에서 한 도형의 수 찾기', '7', 2.7, 'D3'),
    q(5, '식의 계산', '달력·요일(시계)', '거울시계와 지난 시간', '95분', 2.7, 'D3'),
    q(6, '수·규칙찾기', '규칙수열·도형배열', '홀수 개씩 늘어나는 정사각형', '36개', 2.7, 'D3'),
    q(7, '수·규칙찾기', '관찰과 분류', '불규칙 배열의 별 세기', '76개', 2.7, 'D3'),
    q(8, '수·규칙찾기', '규칙수열·그림', '늘어나는 어항의 물고기 수', '11마리', 2.7, 'D3'),
    q(9, '경우의 수', '수 만들기', '사용 횟수가 제한된 네 자리 수', '171개', 2.7, 'D3'),
    q(10, '수·규칙찾기', '주기와 나머지', '점프 거리가 늘어나는 원 둘레 이동', '2번', 2.7, 'D3'),
    q(11, '도형', '시각적 변별', '방향이 다른 물고기 세기', '6마리', 2.7, 'D4'),
    q(12, '식의 계산', '나눗셈의 몫과 나머지', '서로 다른 세 조건의 교집합', '73', 2.7, 'D3'),
    q(13, '식의 계산', '합차와 배수', '복도 합에서 한 교실 역산', '16명', 3.4, 'D3'),
    q(14, '수·규칙찾기', '수의 관계', '덧셈 복면산', '11 또는 13 (둘 중 하나만 써도 정답)', 3.4, 'D3'),
    q(15, '식의 계산', '나이 계산', '두 시점의 나이 관계', '형 19살, 동생 14살', 3.4, 'D4'),
    q(16, '경우의 수', '순서 추리', '조건을 결합한 자리배치', '민서-준호-지우-하준-서연', 3.4, 'D4'),
    q(17, '경우의 수', '경로 세기', '육각형 길 따라가기', '11가지', 3.4, 'D4'),
    q(18, '수·규칙찾기', '수 배열의 규칙', '네 변의 같은 합', '예: 위 왼쪽부터 시계 방향으로 1-4-8-3-2-6-5-7 (네 변의 합이 같으면 다른 배치도 정답)', 3.4, 'D3'),
    q(19, '식의 계산', '달력·요일(시계)', '서로 다른 오차 시계의 재일치', '360일 뒤', 3.4, 'D4'),
    q(20, '수·규칙찾기', '마디수열·규칙찾기', '시작점이 다른 반복마디', '가 20개, 나 20개, 다 20개', 3.4, 'D3'),
    q(21, '식의 계산', '비와 비율', '맞물린 톱니바퀴의 회전수', '12바퀴', 3.4, 'D4'),
    q(22, '수·규칙찾기', '수 배열의 규칙', '이웃한 수의 차가 2 또는 3', '0-2-5-7-4-6-3-1', 3.4, 'D4'),
    q(23, '도형', '도형의 길이', '반복 분할선의 전체 길이', '186cm', 4.2, 'D4'),
    q(24, '도형', '도형의 개수', '크고 작은 삼각형 세기', '21개', 4.2, 'D5'),
    q(25, '경우의 수', '관계와 분류', '서로 싸우는 관계의 최소 색칠', '3개', 4.2, 'D5'),
    q(26, '수·규칙찾기', '조건에 맞는 수', '비표준 디지털 숫자의 켜진 칸 수', '1118', 4.2, 'D5'),
    q(27, '식의 계산', '나이 계산', '서로 다른 시점의 두 쌍 합', '19살, 15살, 12살', 4.2, 'D4'),
    q(28, '식의 계산', '재치 있게 계산하기', '반복 숫자 덧셈', '5개', 4.2, 'D5'),
    q(29, '도형', '도형 덮기', '정사각형 종이의 최소 개수', '6장', 4.2, 'D5'),
    q(30, '도형', '공간지각', '회전한 시점의 미로', 'D6', 4.2, 'D5')
  ];

  window.GFIELD_MOCK_ORIGINAL = {
    estimatedPosition: estimatedPosition,
    // 최종 실전 모의고사의 난도 보정에서도 같은 2024·2025 합산 분포를 사용한다.
    scoreForTopPercent: function(percent){
      var value=Number(percent);
      if(!Number.isFinite(value)||value<0||value>100)return null;
      return pooledScoreFor(value/100);
    },
    title: '초등선발 대비 시그니처 실전 모의고사',
    label: '시그니처 실전',
    setKey: 'original',
    areas: ['수·규칙찾기', '도형', '경우의 수', '식의 계산'],
    roundCount: 2,
    questions: 30,
    blueprint: Array.from({length:30}, function(_, i){
      return {no:i+1, pts:pts(i+1)};
    }),
    cutBasis: {
      title: '2025년 기준 초2 예상 레벨',
      note: '2024년 초2 누적분포를 2025년 척도로 옮기고 두 해의 분포를 같은 비중으로 합쳐 레벨별 상위 비율에 대응하는 점수를 역산했습니다. 누적표 일부 지점의 보간·표준편차 근사값을 사용하므로 경계는 소수 첫째 자리까지 표시합니다.',
      normalization: {mean2024:historical.y2024.mean, mean2025:historical.y2025.mean, sd2024Approx:historical.y2024.sdApprox, sd2025Approx:historical.y2025.sdApprox, yearWeight:0.5, status:'approximate-merged-distribution'},
      distribution: historical,
      sources: [
        {year:2024, label:'2024년 성적분포', url:'https://blog.naver.com/thinkbull_okjeong/223650988987?photoView=0'},
        {year:2025, label:'2025년 성적분포', url:'https://blog.naver.com/thinkbull_okjeong/224066996182?photoView=0'}
      ],
      rows: cutRows,
      belowLabel: '노력요함'
    },
    rounds: {
      '1': {
        title: '초등선발 대비 시그니처 실전 모의고사 1회',
        ready: true,
        paper: {
          imageDir:'original_form_1',
          imagePages:6,
          pageRanges:[[1,6],[7,12],[13,18],[19,24],[25,28],[29,30]]
        },
        answerUrl: 'output/pdf/hwangso-original-form-mock-01-rebuilt-answer.pdf',
        video: 'https://www.youtube.com/watch?v=FUq-XBAcP_8',
        items: round1,
        stats: {cutOnly:true, cuts:cuts}
      },
      '2': {
        title: '초등선발 대비 시그니처 실전 모의고사 2회',
        ready: true,
        paper: {
          imageDir:'original_form_2_v2',
          imagePages:6,
          pageRanges:[[1,6],[7,12],[13,18],[19,24],[25,28],[29,30]]
        },
        answerUrl: 'output/pdf/hwangso-original-form-mock-02-rebuilt-answer.pdf',
        video: 'https://www.youtube.com/watch?v=R5NN1K29__4',
        items: round2,
        stats: {cutOnly:true, cuts:cuts}
      }
    },
    exam: {
      minutes:80,
      questions:30,
      total:100,
      plan:[
        {from:0, to:5, label:'0~5분', title:'시험지 훑어보기', detail:'풀 수 있을 것 같은 문제 표시'},
        {from:5, to:32, label:'5~32분', title:'1~12번 (2.7점)', detail:'모르는 문제는 표시하고 넘어가기'},
        {from:32, to:68, label:'32~68분', title:'13~30번 (3.4·4.2점)', detail:'한 문제에 오래 머물지 않기'},
        {from:68, to:80, label:'68~80분', title:'마무리', detail:'빈 답과 옮겨 적은 답 확인'}
      ],
      cues:[
        {at:0, ph:'훑어보기', msg:'자, 시작하자. 5분 동안 시험지를 훑어보며 풀 수 있을 것 같은 문제를 표시해 보자.'},
        {at:300, ph:'1~12번 참고', msg:'앞쪽 문제부터 살펴보자. 막힌 문제는 표시하고 다음에 다시 돌아와도 괜찮아.'},
        {at:1020, ph:'속도 확인', msg:'17분 지났어. 몇 번에 있는지보다 한 문제에 오래 멈춰 있지 않은지 확인해 보자.'},
        {at:1920, ph:'다음 구간 참고', msg:'32분 지났어. 앞에서 막힌 문제는 표시해 두고 뒤쪽의 풀 수 있는 문제도 살펴보자.'},
        {at:3000, ph:'흐름 확인', msg:'50분이야. 시간이 걸리는 문제는 표시하고, 지금 풀 수 있는 문제부터 차분히 이어 가자.'},
        {at:4080, ph:'마무리', msg:'68분이 지났어. 이제 12분 남았어. 표시한 문제와 빈 답을 확인하자.'},
        {at:4500, ph:'마무리', msg:'5분 남았어. 답을 빠뜨리거나 잘못 옮긴 곳이 없는지 확인하자.'},
        {at:4800, ph:'종료', msg:'80분이 다 됐어. 펜을 내려놓자. 수고했어.'}
      ]
    },
    diagnosis: {
      method: '개인 배점 수행률',
      repeatedRule: '두 회차에서 같은 소영역을 모두 틀리면 반복 약점으로 표시',
      singleItemRule: '문항이 1개뿐인 소영역은 확인 필요로 표시'
    }
  };
})();
