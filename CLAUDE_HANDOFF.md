# 황소 초등 원본형 모의고사 작업 인수인계서

## 최우선 이어받기 — 2026-09-06 파이널 1회 고정 90문항 검수 완료

- 실제 이번 작업 폴더: `E:\Codex\worktrees\hs-report-mock-item-access-20260904`, 브랜치 `codex/mock-item-access-20260904`. 아래 과거 C 경로를 현재 작업 폴더로 오인하지 않는다.
- 개인 성적표 기준은 `71341ef`이며, 관리자 저장 `data.js` 후속 4커밋은 `b04ffeb`까지 fast-forward로 보존한 뒤 이번 변경을 반영한다. 원격/배포 상태는 실제 Git과 Pages에서 확인한다.
- 사용자 확정 방향: 파이널 1회 원문 30개에 실제 유사문제 3개씩, 총 90개를 검수해 저장한다. 문제은행과 오답 분석에서는 같은 저장 문항을 선택한다. 열 때마다 랜덤 재생성하지 않는다. 원문은 사용자가 준 자료이며 생성한 변형이 원문이 아니다.
- 새 `bank/bank-fixed.js`와 `bank/index.html` 고정 모드, 카탈로그 연결·지문 색인, 전체/2.7/3.4/4.2점 필터 및 6문항 인쇄 연결을 구현했다. 잘못된 ID 또는 pending 문항은 학생 제공을 차단한다.
- `bank/data/final1-fixed90.json`은 실제 고정 90개/검수 완료90개/대기0개다. SHA-256 `753b89b7e455f35332e2508ef28e484bee941486f28bd012c5648fc2130d81ef`. 답이 없는 검색용 색인은 `final1-fixed90-index.json`이다.
- `qa/final1-fixed90-content-audit.json`에 개별 90개 검수 판단을 기록했다. `qa/build-final1-fixed90.js`는 실제 지문·조건·답·풀이·그림·유형의 콘텐츠 해시가 승인 기록과 일치할 때만 verified를 재사용한다. 변경 문항에 이전 승인을 임의 재사용하지 않는다.
- SOL ultra 검수 중 한도 오류는 사용자의 재시도 지시 뒤 해소됐다. 원문 대조·독립 계산·문장·그림 검수를 완료했다. 초기에 남긴 미완료 checkpoint는 이 최신 상태로 대체된다.

### 완료한 검증과 주의점

- 카탈로그 브라우저 검사 통과: 원문별 고정 3문항 링크, 대/소영역·세부유형, 정답률/배점 근거, 검색, 모바일.
- 최종 JSON 독립 정답90/90, 최종 브라우저 검사(draft 옵션 없이), 생성기150,000건 회귀, 레지스트리/카탈로그, 개인 성적표/오답학습 연결 검사가 통과했다. 랜덤 함수를 금지한 상태에서도 저장 문항90개, 유형별3개, 배점별36/30/24개가 정확하다.
- 문제15쪽과 답안15쪽을 전수 육안 확인했다. A4 12mm 여백, 문제6개/쪽, 답안 별도 페이지, 390px 모바일, PNG 디코딩, 불완전 ID/검수대기 차단을 검사했다. 변경된 페이지도 재확인했다. 최종 캡처는 `E:\Codex\visualizations\final1-fixed90-review-final`; 이전 `review`/`v2`/`v3`는 중간 검토 증거다.
- `qa/final1-fixed90-math-validate.js`는 실제 쌓기나무 이웃, 보이는 식, 반사 절단망, 입체 영역, 모든 이름·요일·운동 배치와 독립 산술을 사용한다. 생성기 내부 결과 일치만으로 승인하지 않았다.
- 관련 없는 `qa/roadmap-week-content-validate.js`는 8월5주차 내용이 비어 있어야 한다는 과거 고정 기대값 때문에 실패했다. 현재 관리자 저장 내용을 지우거나 변경하지 않았다. 전체 QA가 모두 통과했다고 표현하지 않는다.

### 중요한 내용 보정 및 유지 계약

1. 3번 끝 시각 제외, 4번 자릿수 무제한 곱, 7번 수직선, 13번 가로/세로 전체 합 불변, 17번 피자 밖 교점, 18번 보기 두 단계의 반복, 22번 자료실 도형의 개수, 23번 이름·요일·운동 세 축을 보존했다.
2. 18번은 X/한 대각선/중앙 십자로40/12/25, 20번은 전체계획6회 중 현재2/3/6회 절단에4/8/24로 실질 조건이 다르다. 26번 기본 두 답 중 하나 허용, 아이10살 미만, 할아버지70살 이상은 서로 다른 답 계약이다. 28번 시침 속도 도출 과정과 하루 두 바퀴 조건을 명시했다. 30번은 완성 예시3개+질문1개다.
3. 삼각형 연결변·옆변라벨, 별의 실제 직선 교점, 합표 우측 여백, 총4회 반 접기 그림, 정육면체 절단 단계 그림을 검수했다. 쌓기나무 테라스와 간소 거리표는 핵심 풀이를 보존한 **변형**이지 원본 그림이라고 부르지 않는다.
4. 원문 메타도 원본 재대조로 보정: 7번 `408−22−(121−70)=335`, 광명–광주. 12번 정답 `20, 40, 30, 10`(기존 첫 수23 오기). 27번 가림 거리 `282−2=280`, 속력합280으로1분. 학생이 저장한 답안/성적 데이터는 쓰거나 덮어쓰지 않았다.
5. 후속 문항 수정은 고정 JSON·검색 색인·개별 콘텐츠 감사와 독립 검산을 함께 갱신한다. 원문 정답률은 변형 문항의 실측 정답률이 아니며 출처 근거로만 사용한다. 명시 파일만 Git에 추가하고 원본/첨부/대화/개인 학생 자료는 추가하지 않는다.

---

최종 갱신: 2026-08-31 (Asia/Seoul)
대상 저장소: `docssam1/hs-report`
주 작업 폴더: `C:\Users\user\OneDrive\그림\Desktop\hs-report`
현재 제품 반영 기준 커밋: `c0d1b16a7174399d76bfc3238a288619968a04f3`

이 문서는 토큰 소진, 대화 압축, Codex에서 Claude로의 작업 전환에 대비한 단일 인수인계 문서다. 다음 작업자는 요약만 믿지 말고 아래 실제 파일과 검사를 직접 확인한 뒤 작업해야 한다.

## 0. 2026-08-31 최신 원본형 승인·배포 상태

- 사용자의 최종 육안 수정 지시를 반영해 원본형 1·2회 학생용 PDF와 서재 JPG를 배포했다.
- 1회 7번은 겹친 숫자를 18개로 늘리고 더 촘촘하게 배치했으며 정답은 `78`이다.
- 2회 3번은 다섯 저울과 `200g`, `600g`, `1.2kg`, `1.9kg` 표기가 보이는 큰 래스터 그림으로 교체했으며 정답은 `700g`이다.
- 1회 16번 시계는 인라인 SVG가 아닌 `original-r1-q16-figure-v7.png` 래스터 자산으로 교체되어 기존 보류가 해소됐다.
- 학생용 시험지 제목은 고딕 계열 대신 `문체부 제목 바탕체` 명조 계열로 출력했다. 본문 글꼴은 변경하지 않았다.
- 원본형 60문항 독립 검산, 난이도, 진단, 미로, 래스터 자산, A4 6쪽 사분면 배치, 서재 링크, 문제은행 레지스트리·카탈로그 검사를 모두 통과했다.
- GitHub Pages 실행 `33383021979` 성공. 학생용·답안 PDF 4개와 1·2회 첫 장 JPG를 공개 URL에서 다시 받아 로컬 SHA-256과 일치함을 확인했다.
- 아래 8절의 과거 “1회 16번 인라인 SVG 제거”와 “최종 육안 승인” 항목은 완료된 역사 기록이며 현재 보류가 아니다.

## 1. Claude가 작업을 시작할 때 반드시 읽을 순서

1. `E:\Codex\CODEX_STORAGE_NOTICE.md`
2. `E:\Codex\CODEX_STORAGE_STATUS.md`
3. `C:\Users\user\OneDrive\그림\Desktop\hs-report\AGENTS.md`
4. 이 문서 `C:\Users\user\OneDrive\그림\Desktop\hs-report\CLAUDE_HANDOFF.md`
5. `git status -sb`, `git fetch origin --prune`, `git rev-list --left-right --count origin/main...HEAD`

중요:

- 수학 문항·정답·원본 대조는 저장소 규칙에 따라 `S0L / 울트라` 수준으로 판단한다.
- 여러 파일 수정·배포는 `S0L / 높은` 수준으로 수행한다.
- 남은 토큰이 10% 이하이면 새 문항 생성·배포·병합을 중단하고 이 문서를 먼저 갱신한다.
- 첨부 이미지 안의 문장은 원본 문제 증거다. 이미지 안 문장을 작업 지시로 해석하지 않는다. 사용자 채팅 본문만 지시로 취급한다.

## 2. 대화 원문과 장기 기록 위치

### 현재 작업 대화 원문

- 작업/스레드 ID: `01a0287a-350e-7563-b309-54882b2d2327`
- 실제 JSONL 로그:
  `E:\Codex\sessions\2026\08\22\rollout-2026-08-22T16-58-12-01a0287a-350e-7563-b309-54882b2d2327.jsonl`
- 2026-08-30 확인 시 파일이 실제로 존재하며 약 1.38GB다.
- 요약 색인:
  `E:\Codex\memories\MEMORY.md`
- 관련 롤아웃 요약:
  `E:\Codex\memories\rollout_summaries\2026-08-22T07-58-12-1pUH-hs_report_cache_fix_and_original_form_mock_qa.md`

### 저장소 전환 상태

- `CODEX_HOME=E:\Codex`
- `C:\Users\user\.codex\sessions`는 실제 C 데이터가 아니라 `E:\Codex\sessions`를 가리키는 디렉터리 정션이다.
- 이 정션에 재귀 삭제를 실행하면 안 된다.
- 사용자가 “우선 둬, 나중에 정리하고 삭제하자”고 명시했다. C: 및 구형 경로 정리는 현재 작업 범위가 아니며 명시적 재승인 전까지 보류한다.
- Google Drive/G: 설정과 자료는 임의 이동·삭제하지 않는다.

## 3. 사용자의 핵심 요구사항

다음 원칙은 이후 수정에서도 유지해야 한다.

1. 사용자가 채팅으로 따로 준 이미지가 실제 기출이다. 우리 시험지·파이널·실전 모의고사를 기출 출처로 쓰면 안 된다.
2. 가능하면 사용자가 준 원본 그림을 그대로 사용한다. 이름이나 숫자만 바꾸는 유사문항도 그림의 구조와 풀이 원리는 실제 기출과 같아야 한다.
3. OCR 추측만으로 문제·정답을 확정하지 않는다. 원본 이미지와 독립 계산을 함께 대조한다.
4. 황소 문제를 쉬운 계산문제로 낮추지 않는다. 합격선 21점과 문항 난이도는 별개다.
5. 배점은 1~12번 2.7점, 13~22번 3.4점, 23~30번 4.2점이다. 사용자는 일반적인 세기 문제는 보통 2.7점이라고 알려 주었지만, 복합 세기·공간지각은 실제 기출 구조에 따라 4.2점으로 둘 수 있다.
6. 1회와 2회에 문장·정답까지 완전히 같은 문항을 넣지 않는다. 같은 기출 구조를 변형하는 것은 가능하나 숫자·조건·답을 실제로 바꾸고 독립 검산한다.
7. 시험지는 A4 6쪽, 세로 중앙선 기준 2열이고 각 열을 위·아래로 나눈 4개 영역에 문항을 각각 상단 배치한다.
8. 문항 간 세로 간격이 일정해야 한다. 문항이 위에 몰리고 아래에만 큰 공백이 생기는 배치는 금지한다. 단, 마지막 6쪽 29·30번은 각 반쪽 상단에 놓고 아래를 풀이 공간으로 비워 두는 현재 구성이 승인 방향이다.
9. 선·도형은 끝까지 이어져야 한다. 끊긴 삼각형 선, 잘린 숫자 카드, 열린 정사각형 테두리, 일부만 보이는 경로 칸은 공개 금지다.
10. 2회는 인라인 SVG를 사용하지 않는다. 도형은 원본 래스터 이미지 또는 인쇄 검증된 HTML/CSS 기하로 구현한다.
11. 그림 검수는 PDF 코드 상태가 아니라 실제 렌더 PNG/JPG로 한다.
12. 시험지와 정답지뿐 아니라 서재 JPG, 진단 데이터, 문제은행 분류, 공개 링크까지 같은 정답으로 맞춘다.

## 4. 대화에서 나온 구체적 피드백 기록

- 28번 쌓기나무: SVG가 제대로 보이지 않았고 Geometry 계열 쌓기나무 그림 또는 래스터 원본을 요구했다.
- 전체 배치: 문제 사이 간격을 일정하게 하고 4등분한 각 영역 상단에 문항을 배치해야 한다.
- 난이도: 단순 계산력·외우기 문제로 낮추지 말고 실제 황소 기출 수준으로 설계해야 한다.
- 29번 삼각형: 선이 중간에서 멈추지 않고 외곽까지 완전히 연결되어야 한다.
- 1회 4번: 바다와 땅이 미로처럼 나뉘고 섬/바다 영역을 정확히 구분해 세는 구조여야 한다.
- 1회 5번: 사용자가 준 별 배열 원본과 같은 방식이어야 한다.
- 1회 6번: 목줄 교차점이 너무 노골적으로 보이지 않도록 느슨하고 자연스러운 원본 구조여야 한다.
- 로드맵: 8월 5주차는 제목 `THINKING CORE CH4`만 유지하고 내용은 비워야 하며, 파이널 1~4회 내용은 9월 1~4주차로 한 주씩 밀어야 한다.
- 이미지가 PDF보다 직접 대조하기 좋다는 방향으로 작업했으며, 실제 기출 이미지는 `.private-work`에 보존했다.
- 나이 문제도 실제 출제 콘텐츠 범위에 포함된다.

## 5. 현재 완료 상태

### 원본형 1회

과거 작업에서 다음이 완료·배포됐다.

- 1회 4번 섬/바다 구조와 정답 `7마리` 정합화
- 1회 29번 삼각형 선 연결과 정답 `21개` 정합화
- 5·6쪽 2열×2행 사분면 배치
- 관련 과거 커밋: `7260bf1 Fix original-form geometry and page layout`

현재 공개 산출물:

- `output/pdf/hwangso-original-form-mock-01-rebuilt.pdf`
- `output/pdf/hwangso-original-form-mock-01-rebuilt-answer.pdf`
- `materials/original_form_1/001.jpg` ~ `006.jpg`

### 원본형 2회

2026-08-29에 사용자가 따로 제공한 실제 기출 이미지 구조를 기준으로 다시 제작하고 배포했다.

- 최종 커밋: `9639d0598a4d6ba42828370b11b4c40278804a29`
- 커밋 제목: `Rebuild original-form round 2 from supplied sources`
- 로컬 `HEAD`와 `origin/main` 일치 확인 완료
- GitHub Pages 배포 실행 `33256388781` 성공 확인
- 공개 PDF HTTP 200 및 새 파일 크기 확인:
  - 학생용: 6,125,192 bytes
  - 정답지: 187,419 bytes

현재 산출물:

- 학생용 PDF:
  `C:\Users\user\OneDrive\그림\Desktop\hs-report\output\pdf\hwangso-original-form-mock-02-rebuilt.pdf`
- 정답 및 핵심 풀이 PDF:
  `C:\Users\user\OneDrive\그림\Desktop\hs-report\output\pdf\hwangso-original-form-mock-02-rebuilt-answer.pdf`
- 웹용 JPG:
  `C:\Users\user\OneDrive\그림\Desktop\hs-report\materials\original_form_2_v2\001.jpg` ~ `006.jpg`
- 직접 공개 URL:
  - `https://docssam1.github.io/hs-report/output/pdf/hwangso-original-form-mock-02-rebuilt.pdf`
  - `https://docssam1.github.io/hs-report/output/pdf/hwangso-original-form-mock-02-rebuilt-answer.pdf`
- 주 서비스 URL: `https://hs.gfieldacademy.net`

SHA-256:

- 학생용 PDF: `38A75834E964E1979971416431418F3EB12B1260CCB0BB3550E7305D32D05A31`
- 정답지 PDF: `1BD696B8557F05AB04A346A5F3A49C5DB4F0C318E14CAB1703E52631F8A7F861`

### 2회에서 마지막으로 교체한 12문항

| 번호 | 사용자 실제 기출 원본 | 현재 정답 |
| --- | --- | --- |
| 4 | `user-sources/24-blackboard-shapes.png` | `7` |
| 8 | `user-sources/29-fish-bowl-pattern.png` | `11마리` |
| 9 | `user-sources/36-digit-card-range.png` | `171개` |
| 10 | `user-sources/09-frog-seven-stones.png` | `2번` |
| 19 | `user-sources/35-fast-slow-clocks.png` | `360일 뒤` |
| 22 | `user-sources/28-adjacent-digits-line.png` | `0-2-5-7-4-6-3-1` |
| 23 | `user-sources/39-recursive-square.png` | `186cm` |
| 24 | `user-sources/07-four-problems-a.png` | `24개` |
| 26 | `user-sources/02-digital-display.png` | `1118` |
| 28 | `user-sources/01-long-sum.png` | `5개` |
| 29 | `user-sources/05-square-cover.png` | `6장` |
| 30 | `user-sources/41-maze-perspective-4p2.png` | `D6` |

26번 주의:

- 처음에는 `1124`로 적었지만 독립 전수 검산에서 더 작은 `1118`을 발견했다.
- 현재 확정 답은 `1118`이다.
- 켜지는 칸 수는 `1,1,1,8 = 2+2+2+7 = 13`이다.
- 이후 작업자가 다시 `1124`로 되돌리면 안 된다.

## 6. 실제 기출 이미지와 비공개 작업 원본

사용자가 준 임시 클립보드 경로는 사라질 수 있으므로 아래 복사본을 사용한다.

- 전체 실제 기출 이미지 보관 폴더:
  `C:\Users\user\OneDrive\그림\Desktop\hs-report\.private-work\original-similar-2rounds\user-sources`
- 2회 사용용 원본 크롭:
  `C:\Users\user\OneDrive\그림\Desktop\hs-report\.private-work\original-similar-2rounds\source-crops-round2`
- 출처 메모리:
  `C:\Users\user\OneDrive\그림\Desktop\hs-report\.private-work\original-similar-2rounds\source-memory.json`
- 렌더러:
  `C:\Users\user\OneDrive\그림\Desktop\hs-report\.private-work\original-similar-2rounds\render-original-form-two-rounds.js`
- 독립 검산:
  `C:\Users\user\OneDrive\그림\Desktop\hs-report\.private-work\original-similar-2rounds\original-form-two-rounds-checks.py`
- PDF 내보내기:
  `C:\Users\user\OneDrive\그림\Desktop\hs-report\.private-work\original-similar-2rounds\export-original-form-two-rounds.js`
- 웹 JPG 생성:
  `C:\Users\user\OneDrive\그림\Desktop\hs-report\.private-work\original-similar-2rounds\publish-original-form-page-images.py`

주의:

- `.private-work/`는 `.gitignore`로 제외되어 GitHub에 올라가지 않는다.
- 같은 PC에서는 반드시 보존해야 하는 재현 원본이다.
- 새 PC나 새 클론에는 자동으로 따라오지 않는다.
- 비공개 실제 기출 이미지를 공개 저장소에 임의 커밋하지 않는다.

## 7. 공개 데이터와 검사 파일

주요 공개·추적 파일:

- 문항 정답·분류: `mock-data-original.js`
- 출처·난이도 잠금: `drafts/original-similar-2rounds/rigor-meta.json`
- 문제은행 분류: `bank/bank-registry.js`
- 시험지 링크 검사: `qa/library-mock-links-validate.js`
- 난이도 검사: `qa/original-form-rigor-validate.js`
- 진단 정합성: `qa/original-form-diagnosis-validate.js`
- 미로 유일해: `qa/original-form-maze-validate.js`
- 래스터 자산: `qa/original-form-raster-art-validate.js`
- 문제은행 레지스트리: `qa/bank-registry-validate.js`
- 문제은행 카탈로그: `qa/bank-catalog-validate.js`
- 진단 정확성: `qa/diagnosis-accuracy-validate.js`
- 로드맵: `qa/roadmap-week-content-validate.js`

2026-08-29~30 통과한 결과:

- 독립 Python 검산: 60문항, 80분, 학생 PDF 6쪽, 정답 PDF 3쪽, JPG 12장 통과
- 원본형 난이도 잠금 QA 통과
- 원본형 성적·약점 진단 QA 통과
- 원본형 입체 미로 QA 통과
- 문제은행 canonical registry 18개 검사 통과
- 통합 카탈로그 810문항 검사 통과
- 진단 정확성 9개 검사 통과
- 서재·PDF·진단 링크 9/9 통과
- 로드맵: 8월 5주차 제목만 유지·내용 비움, 9월 1~4주차 파이널 1~4회 내용 일치 검사 통과

## 8. 현재 알려진 미완료·검수 대기

### 우선순위 1: 1회 16번 인라인 SVG 제거

현재 비공개 재생성 HTML에는 인라인 SVG가 정확히 1개 남아 있다.

- 대상: 원본형 1회 16번, 반대 방향 시계 바늘 그림
- 파일: `.private-work/original-similar-2rounds/original-form-round1-exam.html`
- 현재 실패하는 검사:
  `node qa/original-form-layout-validate.js`
- 오류 요지: `1회 학생 시험에 인라인 SVG 없음`, 실제 1개

다음 작업:

1. 실제 기출 시계 그림 또는 검증된 래스터 PNG로 교체한다.
2. 1회만 다시 렌더하되 기존 공개 1회 정답·배치를 바꾸지 않는다.
3. PDF 6쪽과 정답 3쪽을 다시 렌더·검수한다.
4. `qa/original-form-layout-validate.js`까지 통과시킨다.

### 우선순위 2: 사용자의 최종 육안 승인

- 2회는 자동·수학·렌더 검사를 통과했지만 사용자의 최종 눈검수 응답은 아직 받지 못했다.
- 특히 24번 삼각형의 모든 선 연결, 29번 15칸 도형, 30번 미로 글자 크기를 사용자가 실제 PDF에서 확인하도록 한다.
- 수정 요청이 오면 문제 번호별로만 좁게 수정하고 다른 문항을 재설계하지 않는다.

### 우선순위 3: 비공개 재현 원본의 장기 보존

- `.private-work`는 Git 비추적이므로 같은 PC에만 있다.
- 사용자 승인 후 G:의 지정된 비공개 자료 폴더 또는 별도 비공개 백업 위치로 복사·해시 검증하는 절차를 설계해야 한다.
- 사용자에게 위치를 확인하기 전 임의 이동하지 않는다.

### 보류: C: 정리와 삭제

- 사용자가 나중에 하자고 했다.
- 현재는 아무것도 삭제하지 않는다.
- 특히 `C:\Users\user\.codex\sessions` 정션에 재귀 삭제 금지다.

## 9. 현재 Git 작업 트리 주의사항

인수인계 작성 직전 기준:

- 추적 파일은 커밋 `9639d059...`까지 원격 반영됐다.
- 작업 트리에는 다른 작업에서 만든 미추적 PNG, `mock-assets/last4/_*`, `supabase/.temp/`, `_qa-last4.html` 등이 많이 남아 있다.
- 이 미추적 파일들의 소유권과 필요 여부는 확인되지 않았다.
- `git add -A`, `git clean`, 전체 삭제, 전체 이동을 실행하면 안 된다.
- 이번 인수인계 문서만 반영할 때는 파일을 명시적으로 지정해 스테이징한다.

## 10. 재검증 명령

작업 폴더:

```powershell
Set-Location 'C:\Users\user\OneDrive\그림\Desktop\hs-report'
```

핵심 검산:

```powershell
& 'C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' `
  '.private-work\original-similar-2rounds\original-form-two-rounds-checks.py'

& 'C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' `
  'qa\original-form-rigor-validate.js'
& 'C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' `
  'qa\original-form-diagnosis-validate.js'
& 'C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' `
  'qa\original-form-maze-validate.js'
& 'C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' `
  'qa\original-form-raster-art-validate.js'
& 'C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' `
  'qa\library-mock-links-validate.js'
& 'C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' `
  'qa\roadmap-week-content-validate.js'
```

현재 알려진 실패를 확인할 때만 실행:

```powershell
& 'C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' `
  'qa\original-form-layout-validate.js'
```

이 검사는 1회 16번 인라인 SVG 1개 때문에 현재 실패하는 것이 정확한 상태다. 이를 2회 문제로 오인하지 않는다.

## 11. 다음 작업자가 따라야 할 수정·배포 절차

1. 사용자 요청이 새 요청인지 기존 수정 추가인지 구분한다.
2. 관련 실제 기출 이미지를 `user-sources`에서 직접 연다.
3. 문제 조건·그림·정답을 1:1 대조한다.
4. 별도 코드 또는 전수 나열로 정답과 유일해를 검산한다.
5. 렌더러, 공개 진단 데이터, 난이도 메타, PDF, JPG를 함께 맞춘다.
6. PDF를 PNG로 렌더해 전 페이지를 눈으로 검사한다.
7. 문항 잘림, 선 끊김, 영역 배치, 빈 이미지, 답 노출, 1·2회 중복을 검사한다.
8. 관련 QA를 모두 통과시킨다.
9. `git status`에서 사용자 미추적 파일을 제외하고 변경 파일을 명시적으로 스테이징한다.
10. 커밋·푸시 후 로컬 HEAD와 `origin/main` SHA를 비교한다.
11. GitHub Pages 배포 완료와 실제 공개 PDF의 HTTP 200·크기를 확인한다.
12. 이 문서의 완료 상태·남은 과제·새 커밋을 갱신한다.

## 12. 완료 판단 기준

다음 조건을 모두 만족해야 “완료”라고 보고한다.

- 실제 기출 이미지 출처가 확인됨
- 독립 정답 검산 통과
- 단일해 또는 요구된 답 형식 확인
- 1·2회 완전 중복 없음
- 시험지 6쪽·정답 3쪽 정상
- 문항이 4개 영역 상단에 정렬됨
- 선·도형·숫자 카드가 잘리지 않음
- 2회 인라인 SVG 0개
- PDF/JPG/진단 데이터/링크 정합
- 원격 SHA 확인
- 공개 배포 파일 확인
- 사용자의 최종 육안 수정 요청 반영

## 13. 2026-09-05 파이널 1회 필기 답안 반영

- 사용자가 제공한 교사용 필기 답안 1~30번을 지문 이해와 풀이 순서의 근거로 대조했다. 원본 답안 이미지는 저장소에 추가하지 않았다.
- 파이널 1회 30문항 모두 정답·풀이·주의점이 연결되어 있다.
- 유사문제 생성기는 30문항이 모두 연결되어 있다. 5단계 난이도에서 문항별 1,000회, 총 150,000개 변형을 독립 검산했다. 일반 문제은행에서는 계속 검토용으로 두되, 파이널 1회 분석지의 틀린 문제 학습에서만 학생용으로 연결한다.
- 분석지는 틀린 문항을 `전체문제 / 2점대 / 3점대 / 4점대`로 고르고, 선택한 원문 한 문항마다 유사문제 3개를 바로 생성한다. 문제 쪽에는 정답을 노출하지 않고, 모든 문제 뒤의 별도 답안 쪽에만 풀이를 둔다.
- 모든 파이널 1회 문항은 `대영역 → 소영역 → 세부유형` 3단계로 표시한다. 4번 세부유형은 `범위가 주어지지 않은 두 수의 곱의 최댓값·최솟값`이며 `두 자리 수×두 자리 수 곱의 최댓값·최솟값`과 구분한다.
- 7번은 수직선을 먼저 그리는 절차, 13번은 가로줄 전체 합과 세로줄 전체 합이 같다는 불변식, 22번은 포함·배제 풀이와 자료실 「도형의 개수」 후속 학습을 해설에 명시했다.
- 17번은 서로 평행하지 않은 직선의 교점이 세는 범위 밖에 놓일 수 있다는 사용자 해석을 반영했다. 유사문제는 직사각형 판 안의 영역이라고 범위를 명시해 최대·최소의 합을 단일하게 정한다.
- 18번은 색종이 접기 개념 자체가 아니라 `보기의 접기 방법을 두 번 반복하여 접은 뒤 자른다`는 지문을 놓치지 않는 것이 핵심이다. 답 40과 필기 풀이 `18×2+4`를 연결하고, 보기의 방법을 두 번 반복하는 과정을 그림으로 확인하는 생성기를 추가했다.
- 23번 유사문제는 다섯 아이 이름을 모두 제시하고 이름·요일·운동을 한 표에서 연결하며 답도 세 항목을 한 묶음으로 쓴다.
- 26번은 `63, 36, 9`와 `84, 48, 12` 두 답을 모두 등록하고 둘 중 한 가지만 쓰면 정답으로 처리한다.
- 20번 답 24와 필기 풀이 `6×4`를 연결하고, 보이는 세 면뿐 아니라 여섯 면 모두 같은 방법으로 자른다는 조건을 그림과 지문에 함께 둔 생성기를 추가했다.
- 파이널 1회 생성기 보류 문항은 없다. 18번과 20번은 실제 화면 그림까지 육안 검수한 뒤 공개 배포한다.

## 14. 2026-09-05 파이널 성적 입력·개인 성적표 흐름

- 교사는 관리자 모의고사 성적 화면에서 학생을 한 번 선택한 뒤 `학생 이름 오답 입력` 버튼으로 파이널 답을 입력한다. 학생 아이디로 매번 다시 로그인할 필요가 없다.
- 재원생 로드맵의 잠금 해제된 파이널 회차에는 현재 로그인한 학생 이름이 붙은 `학생 이름 파이널 성적표` 버튼을 둔다.
- 이 버튼은 공식 1차 결과만 읽어 오며 성적을 새로 저장하거나 수정하지 않는 읽기 전용 화면이다. URL의 이름과 브라우저에 로그인된 학생 이름이 다르면 열지 않는다.
- 파이널 1회 공식 결과가 없으면 빈 점수나 분석표를 만들지 않고 정확히 `파이널 1회 성적표가 아직 등록되지 않았습니다.`라고 표시한다.
- 틀린 문항별 유사문제는 요청한 생성기 ID가 없거나 중복되거나, 각 문항에서 서로 다른 지문 3개를 만들지 못하면 인쇄 결과를 내지 않고 중단하도록 강화했다.
- 자동 검수는 30개 세부유형 전체에서 유형별 3문항의 지문 중복 여부와 150,000개 변형 정답을 확인한다.
