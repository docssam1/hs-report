# 공용 문제은행 소스 어댑터 계약

이 문서는 필즈 문제은행의 생성기, 렌더러, 검산, 검색, 인쇄 기능을 다른 교재나 다른 프로젝트에서도 재사용하기 위한 공용 계약입니다.

`source-data.js`는 현재 필즈 구현의 한 파일일 뿐입니다. 다른 프로젝트에 같은 파일이 있다고 가정하거나 파일을 복사하지 않습니다. JSON, CSV·엑셀 변환 결과, 여러 JS 모듈, 데이터베이스, API 중 무엇을 사용하더라도 아래 정규화 계약을 만족하면 같은 문제은행 엔진에 연결할 수 있습니다.

## 1. 원칙

1. 파일명이 아니라 제공 기능을 확인합니다.
2. 출판사나 교재의 유형명을 공통 `typeId`로 바로 사용하지 않습니다.
3. 공통 유형은 풀이 원리, 그림 구조, 답 계약, 학습 범위가 모두 같을 때만 재사용합니다.
4. 교재별 관리 항목은 버리지 않고 `sourceMeta`에 원형대로 보존합니다.
5. 원본과 공식 답을 확인하지 못한 문항은 `pending` 또는 `blocked`로 잠급니다.
6. 원본 PDF, 전체 페이지 이미지, 공식 답안, 학생 데이터와 개인 PC 절대 경로는 공개 저장소에 넣지 않습니다.

## 2. 필수 정규화 데이터

### 공통 유형

```js
{
  id: "shape-sum-table",
  domain: "number",
  middle: "도형이 나타내는 수",
  label: "같은 도형이 반복된 줄부터 값 찾기",
  gradeBand: { from: "k7", to: "g2" },
  solvingModel: "equal-symbol-elimination",
  visualModel: "symbol-sum-grid",
  answerContract: "single-number",
  generatorId: "shapeSumTable",
  rendererId: "symbolSumGrid",
  searchAliases: ["도형의 값", "그림식", "도형 합 표"]
}
```

`solvingModel`, `visualModel`, `answerContract`, `gradeBand`가 유형 재사용 판단의 기준입니다. 교재에 적힌 단원명이나 유형명이 같다는 이유만으로 합치지 않습니다.

### 출처 문항

```js
{
  sourceKey: "textbook:series-a:2026:book-01:u03:q014",
  sourceSeriesId: "series-a",
  edition: "2026",
  sourceLocator: {
    bookId: "book-01",
    unitId: "unit-03",
    page: 42,
    questionNo: 14
  },
  sourceTypeLabel: "도형의 값을 구해요",
  typeIds: ["shape-sum-table"],
  difficulty: "actual",
  answerContract: "single-number",
  visualSignature: "grid-3x3:row-column-sums",
  sourceFidelity: "structure-matched",
  verificationStatus: "verified",
  rights: "private-source-derived-variant",
  sourceMeta: {
    lesson: "3차시",
    publisherLevel: "B",
    curriculumLink: "수와 연산"
  }
}
```

`sourceKey`는 판본과 위치를 포함한 안정적인 ID여야 합니다. 새 판본에서 문항 위치나 구조가 바뀌면 기존 키를 덮어쓰지 않고 새 키를 만듭니다.

## 3. 어댑터 기능 계약

각 프로젝트는 내부 저장 방식과 관계없이 다음 결과를 제공해야 합니다.

```js
{
  adapterVersion: "1.0",
  id: "series-a-adapter",
  label: "시중 교재 A",
  listTypes(),
  listSourceItems(),
  getGenerator(generatorId),
  getRenderer(rendererId),
  validateSourceItem(sourceItem)
}
```

- 정적 JSON 프로젝트는 빌드 시 이 결과를 생성할 수 있습니다.
- CSV·엑셀 프로젝트는 변환 스크립트가 같은 배열을 출력하면 됩니다.
- DB·API 프로젝트는 조회 결과를 같은 형태로 정규화하면 됩니다.
- 생성기나 렌더러가 없는 소스는 해당 함수를 `null`로 두고 문항을 `pending`으로 유지합니다.

소비하는 화면은 파일 경로를 직접 import하지 않고 등록된 어댑터의 기능을 조회합니다. 현재 필즈의 `TYPES`와 `SOURCE_QUESTION_INDEX`는 이 계약으로 감싸서 사용할 수 있습니다.

## 4. 기존 유형 재사용 판정

| 비교 결과 | 처리 |
| --- | --- |
| 풀이·그림·답 계약·학습 범위가 모두 같음 | 기존 `typeId`, 생성기, 렌더러 재사용 |
| 풀이와 답 계약은 같고 그림 표현만 다름 | 기존 생성기 + 새 `rendererId` 또는 렌더 프로필 |
| 풀이 원리는 같지만 답 형식이나 요구 행동이 다름 | 별도 세부유형 또는 `answerContract` 변형 |
| 풀이 단계나 정답 조건이 다름 | 새 세부유형과 독립 검산 추가 |
| 원본 구조나 공식 답을 확인하지 못함 | `pending` 또는 `blocked` |

유형을 새로 만들기 전에 기존 유형의 `solvingModel`과 `visualModel`을 검색합니다. 제목 유사도만으로 자동 병합하지 않습니다.

## 5. 권장 폴더 구조

프로젝트의 기존 구조를 유지하되 역할은 다음과 같이 분리합니다.

```text
question-bank/
  core/
    type-registry.js
    adapter-registry.js
    generator-registry.js
    validator.js
  source-packs/
    fields-classic.js
    series-a.js
    series-b.js
  adapters/
    fields-classic-adapter.js
    series-a-adapter.js
  product-profiles/
    fields-classic.js
    commercial-textbook.js
```

기존 프로젝트를 한 번에 이동하지 않습니다. 먼저 현재 데이터를 감싸는 어댑터를 만들고 기존 export를 유지한 다음, 새 교재부터 `source-packs/`에 추가합니다.

## 6. 통합 순서

1. 교재 한 권의 문항 50~100개를 목록화합니다.
2. 원래 유형명은 `sourceTypeLabel`로 보존합니다.
3. 각 문항을 기존 유형 재사용, 렌더 변형, 새 세부유형, 검수 대기의 네 그룹으로 나눕니다.
4. 공통 필드와 교재 고유 필드를 어댑터에서 매핑합니다.
5. 중복 `sourceKey`, 없는 `typeId`, 없는 생성기·렌더러를 자동 검사합니다.
6. 생성 문항은 독립 답 계산과 단일 정답 검사를 통과시킵니다.
7. 실제 화면이 있으면 PC, 390px, A4와 답안 인쇄를 확인합니다.
8. 재사용률과 새 구현이 필요한 유형만 보고한 뒤 다음 권으로 확장합니다.

## 7. 다른 에이전트에게 전달할 지시문

아래 문구를 다른 저장소나 작업 에이전트에 그대로 전달할 수 있습니다.

> 이 프로젝트에 `source-data.js`가 있다고 가정하지 마세요. 먼저 현재 문제은행의 유형 목록, 출처 문항 목록, 생성기, 렌더러, 검증 상태가 어디에 저장되는지 조사하세요. 저장 방식은 변경하지 말고 `QUESTION-BANK-SOURCE-ADAPTER-CONTRACT.md`의 공통 유형과 출처 문항 형태로 읽어 내는 얇은 어댑터를 만드세요. 풀이 원리, 그림 구조, 답 계약, 학습 범위가 모두 같은 유형만 기존 `typeId`에 연결하세요. 교재 고유 관리 항목은 `sourceMeta`에 보존하고, 원본 구조나 공식 답을 직접 확인하지 못한 문항은 `pending` 또는 `blocked`로 남기세요. 기존 생성기·렌더러·검산·검색·인쇄 기능을 먼저 재사용하고 새 수학 구조일 때만 새 세부유형을 만드세요. 원본 파일, 전체 페이지 이미지, 공식 답안, 학생 데이터와 개인 절대 경로는 공개 저장소에 넣지 마세요.

## 8. 완료 증거

- 어댑터가 읽은 유형 수와 출처 문항 수
- 기존 유형 재사용, 렌더 변형, 신규 유형, 잠금 문항의 개수
- 중복 `sourceKey` 0건
- 존재하지 않는 `typeId`, 생성기, 렌더러 참조 0건
- 독립 검산과 단일 정답 검사 결과
- 원본·답안·개인 경로의 공개 저장소 노출 0건
- 해당 제품에 필요한 화면·모바일·인쇄 검증 결과
