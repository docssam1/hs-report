(function (root, factory) {
  "use strict";

  const inventory = factory();
  root.HSE_SOURCE_INVENTORY_42_QUADRILATERAL = inventory;
  if (typeof module !== "undefined" && module.exports) module.exports = inventory;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const GROUPS = Object.freeze([
    {
      number: 1,
      name: "수선과 평행선",
      sourcePdfPage: 35,
      sourcePrintedPage: 40,
      items: [
        ["exploration", "", "여러 직선의 수직·평행 관계와 평행선 사이 거리 구하기"],
        ["example", "1-1", "빗선의 두 부분 길이로 평행선 사이 거리 구하기"],
        ["example", "1-2", "바깥선의 길이와 꺾인 선분으로 평행선 사이 거리 구하기"],
        ["example", "1-3", "이어 그린 수선에서 가장 먼 평행선 사이 거리 구하기"],
        ["example", "1-4", "정육각형의 변과 대각선을 연장한 평행선 쌍 세기"],
        ["mission", "1", "여러 직선에서 평행한 두 직선과 사이 거리 찾기"],
        ["mission", "2", "네 평행선 사이 거리의 배수 관계로 전체 거리 구하기"],
        ["mission", "3", "꺾인 도형에서 가장 먼 평행선 사이 거리 구하기"],
        ["mission", "4", "수직으로 만나는 두 경로를 따라가는 데 걸린 시간 구하기"],
        ["mission", "5", "길이가 늘어나는 수선을 그은 뒤 처음과 마지막 선분 사이 거리 구하기"],
        ["mission", "6", "정육면체 모양에서 연장한 직선의 평행한 쌍 세기"]
      ]
    },
    {
      number: 2,
      name: "평행선의 조건과 성질",
      sourcePdfPage: 37,
      sourcePrintedPage: 42,
      items: [
        ["exploration", "", "두 가로선 사이에서 서로 다른 두 선이 만드는 각의 합 비교하기"],
        ["example", "2-1", "여섯 직선에서 평행한 두 쌍과 동위각·엇각의 합 구하기"],
        ["example", "2-2", "두 묶음의 평행선에서 한 각과 같은 크기의 각 세기"],
        ["example", "2-3", "두 평행선에 걸친 네 각의 합 구하기"],
        ["example", "2-4", "평행선과 세 빗선에서 두 각의 합 구하기"],
        ["mission", "1", "평행선과 나란한 선분을 이용해 각 구하기"],
        ["mission", "2", "평행선과 수직선에서 두 각의 차 구하기"],
        ["mission", "3", "표시된 각을 비교해 평행한 두 직선 찾기"],
        ["mission", "4", "한 각의 동위각을 모두 찾아 합하기"],
        ["mission", "5", "두 쌍의 평행선에서 표시각 구하기"],
        ["mission", "6", "수직선과 평행한 빗선에서 큰 각 구하기"]
      ]
    },
    {
      number: 3,
      name: "평행선 사이의 각도 ①",
      sourcePdfPage: 39,
      sourcePrintedPage: 44,
      items: [
        ["exploration", "", "두 평행선 사이의 삼각형과 꺾은선에서 표시각 구하기"],
        ["example", "3-1", "평행선 사이 여러 꺾은선에서 두 각의 차 구하기"],
        ["example", "3-2", "평행선 사이 꺾은선에서 두 바깥각의 합 구하기"],
        ["example", "3-3", "평행선 사이에서 여러 각을 지나 이어진 선의 끝각 구하기"],
        ["example", "3-4", "평행선 사이에 놓인 정사각형과 빗선의 각 구하기"],
        ["mission", "1", "평행선 사이에서 네 번 꺾인 선의 표시각 구하기"],
        ["mission", "2", "평행선 사이에서 두 번 꺾인 선의 끝각 구하기"],
        ["mission", "3", "두 평행선 사이에 이어진 두 표시각의 합 구하기"],
        ["mission", "4", "두 평행선 사이 두 선분의 각도 배수 관계로 각 구하기"],
        ["mission", "5", "세 쌍의 평행선으로 만든 육각형의 각 구하기"],
        ["mission", "6", "두 평행선에 걸친 사각형의 표시각 구하기"]
      ]
    },
    {
      number: 4,
      name: "평행선 사이의 각도 ②",
      sourcePdfPage: 41,
      sourcePrintedPage: 46,
      items: [
        ["exploration", "", "서로 평행한 두 선분과 여러 바깥각으로 표시각 구하기"],
        ["example", "4-1", "양끝 선분이 평행한 여러 꺾은선의 표시각 구하기"],
        ["example", "4-2", "평행한 두 거울 사이를 지나는 레이저의 각 구하기"],
        ["example", "4-3", "평행·수직인 변으로 이루어진 사각형의 표시각 구하기"],
        ["example", "4-4", "두 평행선 사이 꺾은선에서 여러 표시각의 합 구하기"],
        ["mission", "1", "두 평행한 선분을 잇는 꺾은선의 표시각 구하기"],
        ["mission", "2", "두 쌍의 평행한 선분으로 만든 도형의 표시각 구하기"],
        ["mission", "3", "평행선 사이에서 세 표시각의 합 구하기"],
        ["mission", "4", "이등변삼각형을 접어 만든 평행사변형의 두 각의 합 구하기"],
        ["mission", "5", "평행선과 크기가 같은 각을 이용해 두 각의 합 구하기"],
        ["mission", "6", "평행한 두 거울 사이를 지나는 두 레이저의 각 구하기"]
      ]
    },
    {
      number: 5,
      name: "사각형의 종류와 성질",
      sourcePdfPage: 43,
      sourcePrintedPage: 48,
      items: [
        ["exploration", "", "3×3 점판에서 뒤집기와 돌리기를 같은 것으로 본 사각형 세기"],
        ["example", "5-1", "평행사변형의 각을 나눈 선과 수선으로 각 구하기"],
        ["example", "5-2", "마름모의 대각선으로 만든 네 삼각형을 이어 직사각형 둘레 구하기"],
        ["example", "5-3", "사다리꼴을 접어 만든 도형에서 두 각의 차 구하기"],
        ["example", "5-4", "이등변삼각형을 접어 만든 마름모의 각 구하기"],
        ["mission", "1", "3×3 점판에서 정사각형이 아닌 평행사변형 세기"],
        ["mission", "2", "2×4 점판에서 뒤집기와 돌리기를 같은 것으로 본 사각형 세기"],
        ["mission", "3", "평행사변형을 접어 만든 도형의 각 구하기"],
        ["mission", "4", "사다리꼴을 접어 만든 평행사변형의 각 구하기"],
        ["mission", "5", "두 종류의 마름모를 이어 만든 바람개비 모양의 각 구하기"],
        ["mission", "6", "사다리꼴에 선을 그어 만든 여러 사각형의 종류별 개수 세기"]
      ]
    },
    {
      number: 6,
      name: "사각형의 성질의 활용",
      sourcePdfPage: 45,
      sourcePrintedPage: 50,
      items: [
        ["exploration", "", "정사각형·이등변삼각형·마름모의 성질을 이용해 두 각의 합 구하기"],
        ["example", "6-1", "여러 사각형과 정삼각형을 이어 붙인 도형의 둘레 구하기"],
        ["example", "6-2", "직사각형·마름모·정사각형을 이어 붙인 도형의 각 구하기"],
        ["example", "6-3", "평행사변형과 마름모의 성질을 이용해 각 구하기"],
        ["example", "6-4", "직각삼각형과 직사각형의 길이·각 관계로 각 구하기"],
        ["mission", "1", "평행사변형·마름모·정사각형을 겹치지 않게 붙인 둘레 구하기"],
        ["mission", "2", "정삼각형과 정사각형을 이어 붙인 도형의 각 구하기"],
        ["mission", "3", "평행사변형과 정사각형을 맞붙인 도형의 각 구하기"],
        ["mission", "4", "사다리꼴의 두 각을 똑같이 나누어 만든 평행사변형의 각 구하기"],
        ["mission", "5", "겹친 두 직사각형에서 표시된 두 각의 합 구하기"],
        ["mission", "6", "직사각형과 정삼각형을 이어 붙인 도형의 두 각의 합 구하기"]
      ]
    },
    {
      number: 7,
      name: "정사각형",
      sourcePdfPage: 47,
      sourcePrintedPage: 52,
      items: [
        ["exploration", "", "정사각형 세 개를 이어 붙인 도형에서 선분 길이와 두 각의 합 구하기"],
        ["example", "7-1", "정사각형을 접어 겹친 선분이 만드는 각 구하기"],
        ["example", "7-2", "정사각형과 정삼각형·이등변삼각형을 이어 붙인 각 구하기"],
        ["example", "7-3", "정사각형 색종이를 일정하게 겹쳐 놓은 도형의 둘레 구하기"],
        ["example", "7-4", "여러 정사각형을 붙인 도형에서 두 정사각형의 한 변 구하기"],
        ["mission", "1", "직사각형 안의 점과 선분을 이용해 두 각의 합 구하기"],
        ["mission", "2", "직사각형 안에 이어 붙인 정사각형의 둘레 구하기"],
        ["mission", "3", "정사각형과 두 정삼각형을 이어 붙인 도형의 각 구하기"],
        ["mission", "4", "점판에서 크기와 놓인 자리가 다른 정사각형 세기"],
        ["mission", "5", "정사각형을 겹치지 않게 이어 붙인 도형의 둘레 구하기"],
        ["mission", "6", "직사각형과 정사각형 조각으로 큰 정사각형을 만들 때 빈 길이 구하기"]
      ]
    },
    {
      number: 8,
      name: "사각형의 개수",
      sourcePdfPage: 49,
      sourcePrintedPage: 54,
      items: [
        ["exploration", "", "크기가 다른 칸으로 나뉜 직사각형에서 모든 직사각형 세기"],
        ["example", "8-1", "삼각형이 이어진 띠 모양에서 평행사변형 세기"],
        ["example", "8-2", "계단 모양 모눈에서 모든 직사각형 세기"],
        ["example", "8-3", "대각선이 그어진 모눈에서 모든 사각형 세기"],
        ["example", "8-4", "깃발이 있는 모눈에서 깃발을 포함하는 직사각형 세기"],
        ["mission", "1", "계단 모양으로 쌓인 칸에서 모든 직사각형 세기"],
        ["mission", "2", "색칠한 칸을 포함하는 직사각형 세기"],
        ["mission", "3", "대각선이 이어진 모눈에서 볼록한 사각형 세기"],
        ["mission", "4", "삼각형 격자에서 평행사변형 세기"],
        ["mission", "5", "겹겹이 놓인 직사각형과 가로·세로선에서 사각형 세기"],
        ["mission", "6", "삼각형 격자에서 사다리꼴 세기"]
      ]
    }
  ]);

  const READY_GENERATOR_BY_ID = Object.freeze({
    "4-2-u4-e1-example-1-1": "sourceGrade4AdvancedPerpendicularParallel",
    "4-2-u4-e1-example-1-2": "sourceGrade4AdvancedPerpendicularParallel",
    "4-2-u4-e1-example-1-3": "sourceGrade4AdvancedPerpendicularParallel",
    "4-2-u4-e1-example-1-4": "sourceGrade4AdvancedPerpendicularParallel",
    "4-2-u4-e1-mission-1": "sourceGrade4AdvancedPerpendicularParallel",
    "4-2-u4-e1-mission-2": "sourceGrade4AdvancedPerpendicularParallel",
    "4-2-u4-e1-mission-3": "sourceGrade4AdvancedPerpendicularParallel",
    "4-2-u4-e1-mission-4": "sourceGrade4AdvancedPerpendicularParallel",
    "4-2-u4-e1-mission-5": "sourceGrade4AdvancedPerpendicularParallel",
    "4-2-u4-e1-mission-6": "sourceGrade4AdvancedPerpendicularParallel",
    "4-2-u4-e2-exploration": "sourceGrade4AdvancedParallelAngle",
    "4-2-u4-e2-example-2-3": "sourceGrade4AdvancedParallelAngle",
    "4-2-u4-e2-example-2-4": "sourceGrade4AdvancedParallelAngle",
    "4-2-u4-e2-mission-1": "sourceGrade4AdvancedParallelAngle",
    "4-2-u4-e2-mission-2": "sourceGrade4AdvancedParallelAngle",
    "4-2-u4-e2-mission-3": "sourceGrade4AdvancedParallelAngle",
    "4-2-u4-e2-mission-4": "sourceGrade4AdvancedParallelAngle",
    "4-2-u4-e2-mission-5": "sourceGrade4AdvancedParallelAngle",
    "4-2-u4-e2-mission-6": "sourceGrade4AdvancedParallelAngle",
    ...Object.fromEntries(["exploration", "example-3-1", "example-3-2", "example-3-3", "example-3-4", "mission-1", "mission-2", "mission-3", "mission-4", "mission-5", "mission-6"].map(kind => [`4-2-u4-e3-${kind}`, "sourceGrade4AdvancedParallelAngleChainOne"])),
    "4-2-u4-e4-mission-3": "sourceGrade4AdvancedParallelAngleChainTwoMission3"
  });
  const READY_IDS = new Set(Object.keys(READY_GENERATOR_BY_ID));

  const LOCK_REASONS = Object.freeze({
    "4-2-u4-e2-example-2-1": "원문 (3)·(4)에서 동위각과 엇각을 세는 범위를 공식 답과 다시 대조하기 전에는 출제하지 않습니다.",
    "4-2-u4-e2-example-2-2": "직선 사이의 기울기 조건이 없어 같은 크기의 각 개수가 그림에 따라 달라질 수 있으므로 출제하지 않습니다."
  });

  const RUNTIME_IDS_E2 = Object.freeze([
    "4-2-u4-t2",
    "4-2-u4-t2-2",
    "4-2-u4-t2-3",
    "4-2-u4-t2-5",
    "4-2-u4-t2-6",
    "4-2-u4-t2-7",
    "4-2-u4-t2-8",
    "4-2-u4-t2-9",
    "4-2-u4-t2-10",
    "4-2-u4-t2-11",
    "4-2-u4-t2-12"
  ]);

  const itemId = (groupNumber, section, item) => {
    const suffix = section === "exploration" ? "exploration" : `${section}-${item}`;
    return `4-2-u4-e${groupNumber}-${suffix}`;
  };
  const itemLabel = (groupNumber, section, item) => section === "exploration"
    ? `개념탐구 ${groupNumber} 본문`
    : section === "example" ? `예제 ${item}` : `Mission ${item}`;

  const items = GROUPS.flatMap(group => group.items.map((definition, index) => {
    const [sourceSection, sourceItemNumber, typeLabel] = definition;
    const sourceItemId = itemId(group.number, sourceSection, sourceItemNumber);
    const ready = READY_IDS.has(sourceItemId);
    const sourcePdfPage = group.sourcePdfPage + (sourceSection === "mission" ? 1 : 0);
    const sourcePrintedPage = group.sourcePrintedPage + (sourceSection === "mission" ? 1 : 0);
    return Object.freeze({
      unit: 4,
      unitName: "사각형",
      exploration: group.number,
      groupTitle: group.name,
      sourceItemId,
      sourceSection,
      sourceItemLabel: itemLabel(group.number, sourceSection, sourceItemNumber),
      sourcePdfPage,
      sourcePrintedPage,
      typeLabel,
      sourceVerified: true,
      typeLanguageVerified: true,
      sourceTier: "advanced",
      difficultyBand: sourceSection === "exploration" ? 0 : index >= 8 ? 1 : 0,
      variant: index,
      generatorKey: ready ? READY_GENERATOR_BY_ID[sourceItemId] : "",
      implementationStatus: ready ? "ready" : "review-locked",
      reviewLocked: !ready,
      reviewReason: ready ? "" : (LOCK_REASONS[sourceItemId] || "원본 문항과 그림은 확인했지만 생성 문제·공식 답·정답 그림·독립 검산을 아직 모두 통과하지 않아 잠급니다."),
      generationMode: ready ? "fixed-verified-pool" : "review-locked",
      verifiedVariantTarget: ready ? 3 : 0,
      verifiedVariantCount: ready ? 3 : 0,
      answerVisualRequired: true,
      answerVisualStatus: ready ? "verified" : "locked",
      runtimeTypeId: group.number === 2 ? RUNTIME_IDS_E2[index] : ""
    });
  }));

  return Object.freeze({
    version: "2026-09-24",
    schemaVersion: 1,
    status: "visually-reviewed-source-inventory",
    semester: "4-2",
    unit: 4,
    unitName: "사각형",
    source: "4-2 심화 PDF p.35-50 / 교재 p.40-55",
    sourceItemPolicy: "개념탐구 본문, 예제 4문제, Mission 6문제를 각각 하나의 유형으로 기록합니다. 실력 교재 유형은 이 심화 원장에 섞지 않습니다.",
    totals: Object.freeze({ groups: 8, items: 88, exploration: 8, example: 32, mission: 48, ready: 31, locked: 57 }),
    groups: GROUPS,
    items: Object.freeze(items)
  });
});
