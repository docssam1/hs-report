# 생각하는 황소 LMS — 핸드오버 노트

> 최종 업데이트: 2026-07-17  
> 사이트: https://hs.gfieldacademy.net  
> 레포: docssam1/hs-report (GitHub Pages, main 브랜치)

> **2026-11-29 — 4학년 유사문제 은행(elementary4/)을 황소 초등 문제은행 최신판으로 맞춤** (Claude Code / Opus 5.5, Mac)
> - 원본: docssam1/lete-on `hselementary/question-bank` (커밋은 `elementary4/.source-commit`). 이전 사본은 11-16(518428e33) 판이라 118유형이 검수 대기로 잠겨 있었고, 그 뒤 고친 답 25유형·숫자 뒤 조사 보정·문제 힌트 정책·인쇄 명조가 빠져 있었다.
> - 옮긴 것: 4학년 생성기·교육과정·11-22 공개 등록·원문 생성기 6개(`source-4-*-original.js`, `source-45-last-original.js`)·`problem-hint-policy.js`·`number-josa.js`·`print-typography.css`(명조 글꼴은 `elementary4/assets/fonts/`, OFL)·최신 화면(여러 학기 함께 보기·여러 난이도 섞기·문항 수 슬라이더).
> - 자료실 전용 부분은 유지: `gate.js` 입장 확인, `grade4-only.js`, G-FIELD 표시·워터마크, `bankName`·`difficultyLabels` 등 testbank 설정. lete-on의 학년·학기 승인번호 대신 `bank-access-open.js`(불러온 학기 모두 열기)를 쓴다. testbank/index.html에도 이 모듈·조사 보정·인쇄 명조와 새 app.js가 찾는 칸 3개를 넣었다.
> - 큰 수 '단위 개수로 만든 수의 특정 자리 숫자 찾기' 어려움 단계는 lete-on에서 조 단위 안(1조 200~899개 × 10배)으로 고친 판을 쓴다(이 사본의 11-28 수정을 대신함).
> - `qa/upgrade41-unit-test-validate.cjs` 1번: 문제은행이 'n분의 1로'를 '1/n로'로 쓰므로 둘 다 읽게 고침.
> - 검사: 브라우저에서 4학년 635유형 모두 lete-on 최신판과 같은 시드 문항 일치·잠김 0, qa 7개(elementary4·upgrade-bank 2개·upgrade-course·upgrade41 3개) 통과.

---

## 1. 시스템 개요

| 항목 | 값 |
|---|---|
| URL | https://hs.gfieldacademy.net |
| 인프라 | GitHub Pages (정적) |
| DB | Supabase (fgahqumaldheqettmvqg, Seoul) |
| SUPA_URL | https://fgahqumaldheqettmvqg.supabase.co |
| SUPA_KEY | sb_publishable_OsjJG92BLMaZrc2jTClt0g_ecdTtf_I |
| Supabase 테이블 | mock_results, access_log (RLS: anon INSERT/SELECT/UPDATE) |

### 파일 구성

| 파일 | 역할 |
|---|---|
| index.html | 학생용 메인 (인트로·로그인·로드맵·모달) |
| admin.html | 원장 어드민 |
| mock.html | 중급 모의고사 응시 화면 |
| data.js | 커리큘럼 콘텐츠 (안내문·과제·교재 스키마) |
| mock-data.js | 모의고사 8회 × 30문항 데이터 |

---

## 2. mock-data.js 구조

```js
{
  title, areas, roundCount:8, questions:30,
  blueprint: [{no, area, pts}×30],  // pts: 1~12→2.7, 13~22→3.4, 23~30→4.2
  rounds: {
    "1"~"8": {
      title, video,
      items: [{no, area, type, answer, comment, t}×30]
    }
  },
  results: {}
}
```

### 확정된 답안 현황
- **8회 × 30문항 = 240문항 전부 확정** (미확정 0)
- 최종 커밋: `d10f4a1` (blob sha `9e85f89`), 78,867 bytes
- 주요 수정 이력:
  - 2회 5번→170개, 19번→73개, 29번→여러가지, 30번→240가지
  - 3회 2번=52개, 14번=964, 17번=180.8cm, 22번=1996, 24번=2,097,150
  - 6회 7번: A=6,B=9,C=5 / 6회 26번: 8가지

---

## 3. 중급 모의고사 30문항 blueprint

| 번호 | 배점 | 번호 | 배점 | 번호 | 배점 |
|---|---|---|---|---|---|
| 1~12 | 2.7점 | 13~22 | 3.4점 | 23~30 | 4.2점 |

### 세부유형 목록 (240문항 기준)

| 세부유형 | 대표 문항 | 배점 |
|---|---|---|
| 우기기/가정하여 풀기 | 3회1번, 6회3번 | ★3.4 |
| 달력·요일 | 1회7번, 4회4번, 6회4번, 8회18번 | ★2.7~3.4 |
| 고장난 시계 | 1회6번 | ★3.4 |
| 마방진 | 2회1번, 8회4번 | ★2.7 |
| 복면산 | 6회7번(A6B9C5), 8회6번 | ★3.4 |
| 양팔저울 | 2회12번, 5회5번 | ★2.7~3.4 |
| 간격·가로수 | 7회5번, 6회6번 | ★2.7~3.4 |
| 거꾸로 생각하기 | 2회14번, 7회14번 | ★3.4 |
| 합차와 배수 | 1회5번, 3회4번, 7회4번 | ★3.4 |
| 벤다이어그램 | 5회10번, 7회19·30번 | ★3.4 |
| 팔린드롬·대칭수 | 2회27번, 7회28번 | ★3.4~4.2 |
| 수와 숫자의 개수 | 3회26번, 5회25번 | ★3.4~4.2 |
| 마디수열·규칙찾기 | 1회15번, 8회9번 | ★3.4 |
| 삼각수·묶음수열 | 8회23번 | ★3.4 |
| 포포즈·약속(새연산) | 2회29번, 3회22번, 4회14번 | ★4.2 |
| 최단거리 | 3회21번, 5회15번, 6회24번, 8회24번 | ★3.4 |
| 숫자카드로 수 만들기 | 3회2번, 4회1번 | ★2.7~3.4 |
| 쌓기나무 | 5회1번, 6회2번, 3회10번, 7회15번 | ★3.4 |
| 도형분할·삼각형 개수 | 5회4번, 6회8번 | ★3.4 |
| 도형분할·정사각형 개수 | 5회20번, 6회26번 | ★3.4~4.2 |
| 논리추리 | 4회18번, 7회29번 | ★4.2 |
| 숫자판 돌리기·대칭수 | 2회27번, 7회28번 | ★4.2 |
| 속력 기반 따라잡기 | 1회26번, 4회28번 | ★3.4~4.2 |
| 연속수의 합 | 6회23번, 8회29번 | ★3.4 |
| 경우의 수 | 5회15번, 6회24번 | ★3.4~4.2 |
| 리그·토너먼트 | 5회23번, 6회22번 | ★4.2 |

---

## 4. 교재 매핑 현황

### ✅ 완료된 교재 (materials/ 폴더)

| 교재 | 파일 |
|---|---|
| 필즈 더클래식 1과정(5~10권) + 2과정(A-1~4, G-1~4) 14권 | materials/교재매핑_더클래식.md |
| 소마프리미어 초급(PF 1~8) + 중급(PS 1~8) | materials/교재매핑_소마프리미어.md |
| 필즈 초급 상·하 (PPT 16단원) | materials/교재매핑_필즈초급.md |
| 필즈 입문 상·중·하 (PDF 21단원) | materials/교재매핑_필즈입문.md |
| GM 초급 1단계 A~D (PDF 4권) | materials/교재매핑_GM초급.md |
| GM 중급 (HWP 20개 단원) | materials/교재매핑_GM중급.md |
| Thinking Core CH2~5 (PDF 92p) | materials/교재매핑_ThinkingCore.md |
| GIFTED MATH 3 V1-1~3 + GM-M 3-3·3-4·5-1 (HWP) | materials/교재매핑_GIFTEDMATH.md |

### ❌ 미완료 / 보류

| 교재 | 상태 | 비고 |
|---|---|---|
| Thinking Core CH1 | ✅ 이전 세션 완료 | HANDOVER에 미기록, 파일 별도 없음 |
| 3%올림피아드 (HWP) | ❌ 파일 미수령 | uploads에 없음 — 사용자에게 파일 요청 필요 |
| GM 초급 2~16단계 | ❌ 미수령 | 1단계(A~D)만 있음 |
| 소마프리미어 중급 이미지 문항 | ⚠️ 부분 | 이미지 포함 문항 텍스트 추출 불가 |
| 필즈 중급 상 (PPT 4개 확인) | ⚠️ 이전 세션 | materials 파일 없음, 트랜스크립트에만 존재 |

### 공통 주의사항
- **시중교재** 매핑과 **지필드 교재(GM)** 매핑은 별도 시스템으로 운영
- **시계각 유형** (1회30번, 2회25번) — 최근 5년 미출제, 처방 제외 권장
- **속력 따라잡기** (1회26번, 4회28번) — 더클래식·소마프리미어·Thinking Core 등 전 범위 미커버
- **더클래식 10권 주의**: "연속수의 합" 단원이 실제로는 네이피어 곱셈법/약수, "따라잡기"가 실제로는 저울연립 (제목≠내용)

---

## 5. 다음 작업 (Pending)

1. **처방 시스템 구현**: admin ⑩ 기능 — "2·3점대 약점 유형 → 추천 교재 단원" 매핑표 연결
2. **3%올림피아드 HWP** 파일 수령 후 실제 문제 읽기 및 매핑
3. **GM 초급 2~16단계** 수령 후 매핑
4. **교재매핑 xlsx** 최종 정리 (원장님 요청 시)

---

## 6. 산출물 파일 (outputs 폴더)

- 중급모의고사_N회_답안지.html (1~8회) — 인쇄용 답안지

---

## 7. 기술 메모

- PPT(OLE) → PPTX 변환: `libreoffice --headless --convert-to pptx *.ppt --outdir /tmp/`
- HWP 추출: `pip install pyhwp --break-system-packages && hwp5txt file.hwp`
- PDF 텍스트 추출: `pdftotext -layout file.pdf -` (LC_ALL=C.UTF-8)
- PDF→PNG: `pdftoppm -r 120 file.pdf /tmp/out`
- HWP 이미지 문항: PrvText(미리보기 텍스트)에서 단원명·유형명만 추출 가능
- 더클래식/소마 PPT: 문제가 텍스트 레이어에 있어 python-pptx로 직접 추출 가능
- Supabase 키는 anon(publishable) 키 — 서버 사이드 로직 없이 클라이언트에서 직접 사용
