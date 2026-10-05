# 최종 1회 요약·파이널 1~4회 상세 인쇄 모듈 계약

## 현재 범위

- `final-report-print.js`는 진단 패키지 인쇄에 공유됩니다. `mode:'summary'`는 진단 요약만 인쇄하며 유효한 회차 번호를 받습니다. 최종 1회 요약 인쇄의 기본 경로가 이 모드입니다.
- 최종 1회에 승인된 추천 유사문제가 있으면 `final-summary-practice-print.js`가 요약 뒤에 유사문제와 풀이를 이어 인쇄합니다. 추천 문항이 없을 때는 `final-report-print.js`가 요약만 인쇄합니다.
- `mode:'full'`은 파이널 1~4회에 한해 상세 답안이 검수 완료된 문서만 받습니다. `#final2DetailedSolutions[data-detailed-round="2"]`는 파이널 2회 검수 fixture의 예이며 전체 모듈의 단일 허용 문서가 아닙니다.
- `final.html`은 일반 파이널 회차와 최종 1회에서 공유 모듈을 불러옵니다. 최종 1회의 인쇄 동작을 파이널 2회 상세 답안 인쇄와 혼동하지 않습니다.
- 원래 화면의 진단 내용, 상세 답안, 학생 기록, 저장소, 주소를 고치지 않습니다. 준비 중에는 연결한 인쇄 단추만 잠시 비활성화하고 원래 상태로 되돌립니다.

## API

### 낮은 수준 준비

`GFIELD_FINAL_REPORT_PRINT.createPreparation(options)`는 `{ promise, cancel }`을 돌려줍니다.

- `options.source`: 현재 화면의 `.final-report-package` 요소 또는 선택자
- `options.timeoutMs`: 글꼴·그림·조판의 제한 시간
- `options.requiredFontFamilies`: 반드시 준비되어야 할 글꼴 이름 목록
- `options.libraryUrl`: 기본값은 고정된 `vendor/pagedjs/0.4.3/paged.polyfill.js`

`promise`가 완료되면 `{ frame, metrics, openPrint, cleanup }`을 받습니다. `metrics`에는 진단 쪽 수, 빈 뒷면 수, 상세 답안 시작 쪽, 문항 번호, 표 수가 들어갑니다. 상세 답안 시작 쪽은 항상 홀수여야 합니다.

### 단추 연결

`GFIELD_FINAL_REPORT_PRINT.attach(options)`는 한 인쇄 단추에 한 컨트롤러만 연결합니다. 컨트롤러는 `prepareAndPrint`, `cancel`, `retry`, `dispose`, `state`를 제공합니다.

- 준비 중 같은 단추를 다시 눌러도 새 조판을 시작하지 않습니다.
- 취소 직후 다시 시도해도 이전 작업의 늦은 실패가 새 작업의 단추 상태를 덮지 않습니다.
- 준비가 끝나면 단추는 먼저 활성화됩니다. 인쇄 프레임은 임의 시간 제한으로 없애지 않고 `afterprint`, 명시적 취소, 정리 요청 때만 제거합니다.
- `dispose`는 기존 `onclick`과 단추 속성을 정확히 복원합니다.

## 조판 경계

1. 화면에서 이미 권한 확인을 마친 진단 패키지만 정적인 복제본으로 만듭니다.
2. A4 너비의 별도 프레임에서 인쇄 스타일을 먼저 적용한 뒤 표 열 비율을 잽니다.
3. 진단·교재 부분만 10mm 여백으로 Paged.js가 나눕니다. 나뉜 표에는 머리행과 열 비율을 다시 붙입니다.
4. 만들어진 210×297mm 쪽은 최종 0mm 용지 껍질에 놓아 이중 여백을 막습니다.
5. 진단 쪽 수가 홀수이면 빈 뒷면 한 쪽을 추가합니다.
6. 상세 답안은 원래 스타일을 가진 ShadowRoot에 격리하여 뒤에 붙입니다. 미검수 카드는 제거하며 새 답안을 계산하거나 불러오지 않습니다.

## 자동 검증

`qa/final-report-print-validate.js`는 파이널 2회 상세 인쇄의 조판 경계를 확인합니다. 최종 1회 요약 버튼의 실제 연결·인쇄는 `qa/final-summary-print-regression-validate.js`의 Last1 브라우저 검사가 확인합니다.

- 파이널 2회 상세 답안 30문항, 도식 7개, 인쇄 표의 열 비율·반복 머리행
- 상세 답안의 홀수 쪽 시작, 원래 화면·주소·세션 식별 정보 불변, 외부 쓰기 0회
- 조판기·글꼴·그림·표 구조 누락 시 실패 후 임시 프레임 정리
- 중복 클릭, 취소 직후 재시도, 실패 후 재시도, `afterprint` 취소 정리
- 고정 Paged.js 배포본과 MIT 라이선스 해시

실제 다섯 PDF 조건(오답 0·1·15·30문항, 긴 선생님 코멘트)에서 상세 36쪽, 교육 내용 829개 항목, 홀짝 빈 면, 상세 답안 시작 면을 함께 확인했습니다. 이 문서만으로 배포 완료를 주장하지 않습니다.
