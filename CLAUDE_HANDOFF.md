# 황소 초등 원본형 모의고사 작업 인수인계서

## 2026-10-20 로드맵 최종 1~4회·중급 7~8회 연결 보수

- Mac `main` 작업본에서 최종 1~4회 로드맵과 자료실의 강의·시험지 분할 뷰어, 실전 타이머, 오답 입력·분석 연결을 맞췄다. 중급 7·8회 자료실은 기존 PDF와 강의를 같은 뷰어에 연결하고 타이머·입력·답안 링크를 유지한다. 새 문항·원본 PDF·학생 기록은 수정하지 않았다.
- 최종 1~4회 재원생과 온라인 회원은 최초 성적 `lastN` 및 연습 `lastN@2`, `lastN@3`까지 직접 입력할 수 있다. 연습 성적은 최초 점수와 누적 성적을 바꾸지 않는다. 합성 브라우저에서 네 회차 × 세 번 입력과 교사 최초 기록 보존을 검증했고 운영 성적 쓰기는 0건이다.
- 관리자 콘솔이 `data.js`를 독립 갱신하므로 이번 수정은 `data.js`를 포함하지 않는다. 중급 7·8회 자료실 연결은 렌더 시 보강한다. 로드맵·자료실·3회 입력 표적 QA, 인라인 스크립트, 칼럼 보호 QA가 통과했다. 전체 자료실/패리티 QA의 기존 다른 화면 단언은 이번 범위와 별개로 남아 있다. GitHub 메인 반영과 공개 파일 대조는 아래 커밋/배포 기록을 확인해야 한다.

## 2026-10-20 사용자 완료 확인·원자료 변환 재발 방지 (최신)

- 사용자는 최종 3회를 이미 확인했고 중급 8회 작업도 끝났다고 명시했다. 중급 8회 승인 유사문제는 90문항 그대로이며 이번 확인 과정에서 새 문항은 추가되지 않았다. 아래 과거 기록의 실제 계정 ZIP·실물 인쇄·9축 검수 공백은 완료된 회차를 임의로 다시 열라는 지시가 아니다. 새 요청이나 결과에 영향을 주는 구체적 결함이 없다면 반복 QA·Drive 재보관·파일 변환을 시작하지 않는다. 사용자 확인과 독립 검수의 범위는 혼동하지 않는다.
- 중급 8회에는 정상 문제 PDF **7쪽**과 답안 PDF가 이미 있었다. Mac LibreOffice로 HWP를 별도로 변환한 시험본 **5952쪽**은 불필요한 작업이었고 원문 대조에 사용할 수 없었다. 다음 작업자는 `AGENTS.md`의 **원자료 우선순위와 변환 중단** 규칙을 따른다. PDF가 읽히면 PDF를 먼저 사용하고, HWP 자체나 구체적인 판본 차이를 다뤄야 할 때만 목적·예상 쪽수를 정해 한 번 시험한다. 변환 이상은 즉시 중단한다. 원본·승인 문제은행·학생 기록은 이 규칙 추가로 변경하지 않았다.

## 2026-10-19 최종 3회·중급 8회 공개 정적 파일 메인 일치 재검증 (최신)

- 공개 `https://hs.gfieldacademy.net/`에서 캐시 회피 쿼리로 최종 3회 진단 `final.html`, 인쇄 `final-summary-practice-print.js`, 관리자 일괄 `admin-final-batch.js`, 관리자 화면, 최종 3회 승인 은행·인덱스·어댑터, 중급 8회 승인 은행·어댑터 **10개 파일**을 읽었다. 모두 HTTP 200이며 현재 GitHub 메인 작업본과 **10/10 바이트 단위 일치**했다. 파일별 크기·SHA-256·커밋 `17553bbe30a925ba8bb0db35470f09903f27926d`는 [Drive 공개 정적 파일 대조 기록](https://drive.google.com/file/d/1b3eU7bkbIWjHu7TRR4rdzAjqHrjdG9eF/view)에 남기고, 기록 자체도 2746바이트·SHA-256 `acb399182a844b72eb60113fbd9312b79645a23b168afc5678eafea3f67a4ebf`로 재다운로드 일치했다.
- 이 검사는 공개 배포 파일과 메인 코드의 동일성만 확인한다. 실제 학생·관리자 인증 뒤 최종 3회 ZIP 저장, 실물 인쇄, 중급 8회 수학적 9축 동등성의 완료 근거는 아니다. 운영 데이터 쓰기·문항·승인 은행·학생 기록 변경은 없었다.

## 2026-10-19 중급 8회 완료 회귀검사 출력본 Drive 보관·Mac 정리 (최신)

- 중급 7회 회귀·은행 브라우저·현행 연결/릴리스 재검사 등 완료 폴더 6개의 **151개 파일·58017074바이트**를 원래 경로·파일별 SHA-256 manifest와 함께 기존 중급 8회 Drive 검수 폴더의 [전체 ZIP](https://drive.google.com/file/d/1SUtt_H3TG2bW5g5ADsTKa12091156TWZ/view)에 보관했다. ZIP 48550776바이트·SHA-256 `a7c7a10710b6d2b24464d7ada67a588f6dbd139ba9ba175aea96497392546fab`로 Drive 재다운로드 일치를 확인했다.
- ZIP 내부 파일을 Mac 원본과 바이트 단위로 재대조하고 Git 추적·현행 코드 경로 참조·열린 파일·심볼릭 링크가 없는 `.private-work/middle8-20261018/` 아래 `middle7-regression/`, `middle7-browser-regression/`, `bank-browser-qa/`, `current-regression-20261019/`, `middle8-link-change-regression-20261019/`, `release-reconciliation-browser-20261019/`만 정리했다. Mac 순감소량은 **58017074바이트**다. 이전 문항 초안 두 폴더와 현행 원문·변형·9축 검수 작업본은 유지했고 승인 문제은행·학생 기록은 변경하지 않았다.

## 2026-10-19 중급 8회 HWP 변환 시험본 판정·Mac 정리 (최신)

- Mac 전달 제작 기준 v2.7은 기존 [Drive 출처 표시 참고 사본](https://drive.google.com/file/d/1HJTPi1tNBCzjM_R4Ui_H9jBB_4CNrgtH/view)과 124006바이트·SHA-256 `6044b894b8f58b94cfaff5dd331e7367f76e44f70076be7facee443a77499b18`로 다시 일치했다. 사용자 제공 Drive ID `1LjpYZDs74UiI2wrbMi7ME3jWxILTck71`은 여전히 원자료 **폴더**이며 제작 기준 원본 파일 ID로 간주하지 않는다.
- Drive [8회 원본 HWP](https://drive.google.com/file/d/1rR7RlwGsfuR05RaERc5Ae_J0WPxNTCFt/view)는 1323520바이트·SHA-256 `62d9b7cb1c8c22d109f81e5cb3c0dfe20d4506d402cdfbc8fb8665cd5feb7278`로 재다운로드 확인했다. Mac `hwp-converted.pdf`는 **5952쪽**으로 Drive 원본과 바이트 일치한 정상 `original.pdf` **7쪽**의 대체 원문으로 쓸 수 없다. [Drive 비정상 변환 기록](https://drive.google.com/file/d/1cTyMWAkd153CFOstHj-KV8JzDIjgelQG/view)을 1305바이트·SHA-256 `76e2f97161ddacf5b0ef2a9241290ea685623ca92f973238a3b461ac9deb6144`로 재다운로드 확인한 뒤, Git 추적·코드 참조·열린 파일이 없는 실패한 로컬 임시 PDF **9141997바이트**만 정리했다. 원본 HWP·정상 PDF·현행 원문 검수 작업본과 승인 은행은 유지했다.

## 2026-10-19 중급 8회 원문·답안 Drive 원자료 ID·해시 확인 (최신)

- Mac 현행 검수 원문 `original.pdf`와 답안 `answer.pdf`, 7·8회 리뷰, 2023·2024 과제, 별도 2024 8회 PDF **6개**를 기존 Drive 원파일에서 다시 내려받아 각각 길이·SHA-256이 Mac 작업본과 일치함을 확인했다. 사용자 제공 [원자료 상위 폴더](https://drive.google.com/drive/folders/1LjpYZDs74UiI2wrbMi7ME3jWxILTck71)에는 8회 원본 HWP `1rR7RlwGsfuR05RaERc5Ae_J0WPxNTCFt`도 있다. [Drive 원자료 식별·해시 기록](https://drive.google.com/file/d/1l3v6vwITaxo3mUHs3g5SK2U42Bv4cS0z/view)에 6개 PDF의 정확한 파일 ID·원래 제목·크기·SHA-256과 HWP 위치를 저장하고 3900바이트·SHA-256 `e3d8e3d8824b607b39aa4a69b1de037c608fae02f2e64c9f9a72f293e4719f8f`로 재다운로드 일치를 확인했다.
- 로컬 `folder-source-pdf.pdf`와 `folder-answer.pdf`는 각각 `original.pdf`·`answer.pdf`와 바이트 단위로 동일했다. `hwp-converted.pdf`는 HWP에서 나온 작업용 PDF이므로 HWP와 바이트 동일성으로 판정하지 않았다. 현행 원문·답안 작업본은 중급 8회 9축 검수에 계속 필요해 유지했고 승인 은행·문항·학생 기록은 변경하지 않았다. 이 대조는 원자료 식별이며 수학적 답·난도·그림 동등성 승인이 아니다.

## 2026-10-19 중급 8회 현행 은행·9축 보류표 구조 재검증 (최신)

- Mac 메인 은행 `bank/data/middle8-reviewed.json` SHA-256 `680d8648201f88d2366f1900e406eae708ffed4d9f6a1f77c3c75981c895b6d1`가 기존 [Drive 최신 9축 보류표](https://drive.google.com/file/d/1_Nw7FA90p6EOysvp5flm6Mss7PTlFeZy/view)의 기준 해시와 일치했다. Drive 보류표도 Mac 사본과 152071바이트·SHA-256 `b09c8e8d32a6f342ee7159bb14ed7f7dd5a3b7595f85cad0af8fce4eb28a19b2`로 재다운로드 일치했다. 승인 은행 90문항·30유형, 보류 189축·62문항·원문 24개, 임시 해소 기록 13행의 참조·중복·집계 무결성 **14항목**을 확인했고 [Drive 구조 검사 기록](https://drive.google.com/file/d/1YSSYUlSQ4ZtGVB_Ku9ODdYzrZQUIWmAD/view)에 보관했다(1314바이트·SHA-256 `123fa53bf2ba339d99103610236ba81dff86ba242ae1c1f842965de8eb326ba9` 재다운로드 일치).
- 이 검사는 보류표가 현행 은행을 정확히 가리키는지 확인한 것이며 수학적 원문 동등성·정답·9축 최종 승인으로 확대하지 않는다. Mac Chrome 공개 관리자 탭은 다시 열렸지만 여전히 인증 입력 화면이고 `lpstat -p`에 등록 프린터가 없어 실제 계정 ZIP·실물 A4 인쇄는 대기 중이다. 서비스 코드·승인 은행·학생 기록은 변경하지 않았다.

## 2026-10-19 중급 8회 공개 은행·진단 출력 재검수본 Drive 보관·Mac 정리 (최신)

- 공개 은행/진단 화면과 로컬 재검수의 완료된 4개 폴더 **107개 파일·63604814바이트**를 원래 경로·파일별 SHA-256 manifest와 함께 기존 중급 8회 Drive 검수 폴더의 [전체 ZIP](https://drive.google.com/file/d/1Agk_EcQPzQXP99Aka640lTdvglhQ0KCM/view)에 보관했다. ZIP **59386489바이트**, SHA-256 `ddd1d2a3bb9a17c1e9d5d8ff1d27487358891865e2984b3066dca24f151dffc1`로 Drive 재다운로드 일치를 확인했다.
- ZIP 안의 파일 107개를 Mac 원본과 바이트 단위로 대조하고 Git 추적·현행 코드 참조·열린 파일·심볼릭 링크가 없는 `.private-work/middle8-public-bank-20261019/`, `.private-work/middle8-public-report-20261019/`, `.private-work/middle8-local-bank-recheck-20261019/`, `.private-work/middle8-local-report-recheck-20261019/`만 정리했다. Mac 순감소량은 **63604814바이트**다. 원문·변형·답·그림의 현행 9축 검수 작업본 `.private-work/middle8-20261018/`와 공개 연결 현장 대조본 `.private-work/middle8-20261019-live-parity/`는 유지했다. 승인 문제은행·학생 성적·원본 자료는 변경하지 않았고 9축 보류는 해제하지 않았다.

## 2026-10-19 최종 3회 30문항 조합 QA 보충 보관·Mac 정리 (최신)

- 기존 [Drive 30문항 조합 QA ZIP](https://drive.google.com/file/d/1Vpq_QXnMqmZo_B20a9x6X8TW5pG6dbb1/view)은 2106125바이트·SHA-256 `975171cd898a008ba69061a7c920b866e72010fb97afedf586568e125b9e94bc`로 Mac 원본과 일치했지만 화면 PNG 3개가 빠져 있었다. 3개·12130422바이트를 [Drive 보충 ZIP](https://drive.google.com/file/d/14pxkHICC7eF8SM0FOboyzBj5b6yItYef/view)에 원래 경로·파일별 SHA-256 목록과 함께 저장했고, 11974216바이트·SHA-256 `ed3b4e6c94303ff44bcc44d0a112537c75f8b0b063331620bfeaee4405a112ba`로 재다운로드 일치를 확인했다.
- 두 ZIP의 12개 파일을 Mac 원본과 바이트 단위로 대조하고 Git 추적·현행 코드 참조·열린 파일·심볼릭 링크가 없는 완료된 `.private-work/last3-all30-matrix-20261019/`와 임시 보충 ZIP만 정리했다. Mac 순감소량은 **16498796바이트**다. 이 근거는 합성 학생의 30문항 조합 검수이며 실제 계정 ZIP과 실물 A4 인쇄는 아직 미검수다. 원본·승인 은행·학생 기록은 변경하지 않았다.


## 2026-10-19 최종 3회 당일 합성 QA 시험본 보관·Mac 정리 (최신)

- 10월 19일 합성 배치·공개 화면/PDF·운영 패턴·로컬 재검수·연결 회귀 폴더 5개의 **89개 파일·109576224바이트**를 원래 경로와 파일별 SHA-256 manifest를 담아 기존 최종 3회 Drive 검수 폴더의 [A ZIP](https://drive.google.com/file/d/1uXym7-w3ruG7qIUeJIc8WaV3R3pJy8aV/view) **61582723바이트** 및 [B ZIP](https://drive.google.com/file/d/1OaP-_1qrfAbAt6djJ4hqQVtztUR6-Iag/view) **42237157바이트**으로 보관했다. 두 파일을 Drive에서 재다운로드해 SHA-256 `b9822bb457745e742a6ac3cd3e3457c6cd7ebb4b58c742a01855449667e93c0b`·`b3d58942133dad8db1ea5ee7b640b62c12afdaee481e05789af18d5f6faa9fc1` 일치를 확인했다.
- ZIP 안의 89개 파일을 Mac 원본과 바이트 단위로 대조한 뒤 Git 추적·현행 코드 경로 참조·열린 파일·심볼릭 링크가 없는 완료 폴더 `.private-work/last3-batch-qa-20261019/`, `.private-work/last3-public-qa-20261019/`, `.private-work/last3-operational-pattern-20261019/`, `.private-work/last3-local-recheck-20261019/`, `.private-work/last3-mock-link-regression-20261019/`만 정리했다. Mac 원본 순감소량은 **109576224바이트**다. 이는 합성 QA 근거 보관이며 실제 학생/관리자 계정의 ZIP 저장과 실물 종이 인쇄는 아직 검수 대기다. 중급 8회 현행 검수 작업본·원본·승인 은행·학생 기록은 변경하지 않았다.


## 2026-10-19 최종 3회 10월 18일 배치 QA 시험본 보관·Mac 정리 (최신)

- 현행 코드가 참조하지 않는 2026-10-18 배치 QA 폴더 6개의 **87개 파일·112690104바이트**를 원래 경로·파일별 SHA-256 manifest와 함께 [Drive A ZIP](https://drive.google.com/file/d/1p4NTCXbcIjoW_CfABKkVybW2nwX3gj5m/view) **57160640바이트**, [Drive B ZIP](https://drive.google.com/file/d/1scOsESGFbSs5rh_bRxcj6D6M9u6yDwZI/view) **37831802바이트**로 보관했다. 두 ZIP을 재다운로드해 SHA-256 `d723f8bb95597c3835827d80bdc2a06599525a141012b1d9efd839ad5beae09b`·`c62b0dbe0d242283be8056418b2e5c76fff69bc410608ec755718df3dada53e4`가 일치함을 확인했다.
- 각 ZIP의 87개 파일을 Mac 원래 경로·크기·바이트·해시로 다시 대조한 뒤 Git 추적·열린 파일이 없는 완료된 로컬 6개 폴더와 임시 ZIP만 정리했다. Mac 순감소량 **112690104바이트**다. 현행 QA가 참조하는 `.private-work/last3-reuse-20261015`는 Drive 연결 심볼릭 링크로 그대로 보존했고, 중급 8회 현행 검수 작업본과 원본 자료·승인 은행·학생 기록은 건드리지 않았다.

## 2026-10-19 최종 3회 학생 PDF·관리자 ZIP 재검수 완전 보관·Mac 정리 (최신)

- 기존 [Drive 학생 PDF·관리자 ZIP·Vision 재검수 근거](https://drive.google.com/file/d/1mpZFCoti6wzTD6-IdtrFVIh1XvL1-vwo/view)는 Mac 원본 ZIP과 9300139바이트·SHA-256 `872c5a381cfd980c5325491453d90ae2e4c004c7005f2361515c58497b304e2c`로 일치했고, 로컬 3개 폴더 파일 중 16개를 보관했다. 빠진 학생 화면 PNG·관리자 공통 PDF/ZIP 등 **35개**는 같은 상대 경로와 SHA-256 목록을 넣어 [Drive 보충 ZIP](https://drive.google.com/file/d/1MvULi7ZdUlyEJQqCfU9li3ZmxvbKlbyd/view)에 보관했다. 보충 ZIP 44988262바이트·SHA-256 `fe67e3b424d56f120657e193a3951ec43404bb6ffed16a5a09ca4c7c8c5900a1`로 재다운로드 일치를 확인했다.
- 두 ZIP의 로컬 **51개 파일**을 바이트 단위로 대조한 뒤 Git 추적·현재 코드 참조·열린 파일이 없는 완료된 `.private-work/last3-public-recheck-20261019/`, `.private-work/last3-admin-zip-recheck-20261019/`, `.private-work/last3-admin-zip-local-recheck-20261019/`와 임시 보충 ZIP만 정리했다. Mac 순감소량 **70791406바이트**다. 합성 성적 검수 근거의 보존이며 실제 계정 ZIP·실물 A4 인쇄는 미검수다. 승인 문제은행·학생 성적·원본 자료는 변경하지 않았다.

## 2026-10-19 최종 3회 공개 관리자 ZIP QA 완전 보관·Mac 정리 (최신)

- 기존 [Drive 공개 관리자 단독·혼합 ZIP·Vision 근거](https://drive.google.com/file/d/1pxkaPLMxThLjp_CDfXYmUPPRvnQeYPtd/view)는 Mac 원본과 11348855바이트·SHA-256 `a32edf95124f976dce0b362c52b0ecae02748507906e0b11284354b61873309e`로 일치했고, 해당 폴더 파일 24개를 담고 있었다. 빠진 공통 관리자 PDF·렌더 등 17개는 경로·SHA-256 목록과 함께 [Drive 보충 ZIP](https://drive.google.com/file/d/1p4ueXWXsfx4mz76SiTKxMpM54eFwWq23/view)에 보관했다. 보충 ZIP 16860763바이트·SHA-256 `a3dd93ab91960933b22c82c5c49ae67fc6ca1b5edbd86ec49ba3fa84ea9cadbf`를 재다운로드로 확인했다.
- 두 ZIP의 Mac 원본 **41개 파일**을 바이트 단위로 1:1 대조하고, Git 추적·현행 코드 참조·열린 파일이 없는 완료된 `.private-work/last3-admin-zip-public-20261019/`와 임시 보충 ZIP만 정리했다. Mac 순감소량 **42105791바이트**다. 기존 합성 관리자 ZIP 검수의 근거 보관이며 실제 교사 계정·실물 인쇄 검수까지 완료한 것은 아니다. 승인 문제은행·성적·원본 자료는 그대로다.

## 2026-10-19 최종 3회 혼합 순서·다단 QA 완전 보관·Mac 정리 (최신)

- 기존 [Drive 혼합 순서 PDF·ZIP·Vision 근거](https://drive.google.com/file/d/1Z_EqFMOeB2gT8CNCC_2-UNAIEEd6e3pw/view)은 최상위 `last3-mixed-order-20261019/` 접두 경로를 포함해 Mac 원본 22개를 보관하고 있었다. 7445059바이트·SHA-256 `92999c8204c2752b758edc46a8444d7ccde8ee2c2a04d6670c9331b3faa63bc5`로 재다운로드 일치를 확인했다. 빠진 관리자 공통 PDF·화면 렌더 등 35개는 같은 접두 경로와 파일 해시 목록을 넣어 [Drive 보충 ZIP](https://drive.google.com/file/d/1oggkGHzeQkrGNlrjlhIDOttNtqEzXNnD/view)에 보관했다. 보충 ZIP 47861820바이트·SHA-256 `aee92e356e1ff6238e52526cf584e62a7103c6d1fd5701bfa97eb52f43ed8b05`도 재다운로드 일치했다.
- 두 ZIP과 Mac 원본 **57개 파일**을 바이트 단위로 1:1 대조한 뒤 Git 추적·현행 코드 참조·열린 파일이 없는 완료된 `.private-work/last3-mixed-order-20261019/`와 임시 보충 ZIP만 정리해 Mac 순감소량 **68693680바이트**를 기록했다. `qa/last3-batch-priority-matrix-validate.cjs`가 기본 출력 경로로 참조하는 `.private-work/last3-priority-matrix-20261019/`는 현재 QA 재실행용으로 보존했다. 실제 계정 ZIP·실물 인쇄 검수는 별도다.

## 2026-10-19 최종 3회 원문 1~30번 관리자 ZIP QA 완전 보관·Mac 정리 (최신)

- 기존 Drive [1~10번](https://drive.google.com/file/d/1vZufo_fuke4l2p3nCzeexjrQ6oA35fHo/view)·[11~20번](https://drive.google.com/file/d/1QNx7Df0mx0Kyulf-UMVqFo0akNDZdxCt/view)·[21~30번](https://drive.google.com/file/d/1y_JrscbKhZLLhkbgh_0cHPg7s6RHcyGY/view) ZIP을 다시 내려받아 각 로컬 SHA-256과 일치함을 확인했다. 세 묶음에는 단독 오답 30회 ZIP과 검수 기록이 있으나 기본 조합 회귀 파일 7개는 빠져 있었다. 이를 [Drive 기본 조합 보충 ZIP](https://drive.google.com/file/d/1_plSTHSbyAqKyvS3OSHtU0epRJ8lBYC3/view)에 경로·해시 목록과 함께 보관하고, 5639084바이트·SHA-256 `43f314b8a5699d04b5fe058c575541646e2bb343f6fc2319a4403e5cea3710db`로 재다운로드 일치를 확인했다.
- 네 ZIP의 기존 로컬 파일 **40개**를 바이트 단위로 1:1 대조한 뒤 Git 추적·코드 참조·열린 파일이 없는 완료된 `.private-work/last3-all30-zip-20261019/`와 임시 보충 ZIP만 정리했다. Mac 순감소량 **55664263바이트**다. 합성 관리자·학생 성적 ZIP 전수 검수의 보존이며 실제 계정 저장·실물 인쇄는 아직 별도다. 승인 문항·성적·원본 자료는 그대로다.

## 2026-10-19 최종 3회 원문 30문항 PDF QA 완전 보관·Mac 정리 (최신)

- 기존 [Drive 전수 PDF·Apple Vision 근거 ZIP](https://drive.google.com/file/d/1kVp875NlIKMg6KuiK5rYy9GUv_qU-MqI/view)은 Mac 원본과 16807238바이트·SHA-256 `dc00bbcd86d57407309cf5375f83e51acf1c053e7bff37d9b75f09958ec17783`로 일치했다. 이 ZIP에 빠졌던 렌더·화면 파일 54개는 [Drive 보충 ZIP](https://drive.google.com/file/d/1gx9C_tIpCCqyP9Ks-h1Pku4qMHyylwUz/view)에 경로·SHA-256 목록과 함께 보관했다. 보충 ZIP 43021809바이트를 다시 내려받아 SHA-256 `7c95c7678b97f5456b0589f73afd0bd28f5a093608423613dd77ede0f576ac94` 일치를 확인했다.
- 두 ZIP의 65개+54개 파일을 Mac 원본 119개와 바이트 단위로 대조했다. Git 추적·현행 코드 경로 참조·열린 파일이 없는 완료된 `.private-work/last3-all30-pdf-20261019/`와 임시 보충 ZIP만 정리해 Mac 순감소량 **82648598바이트**를 기록했다. 이 전수 PDF·OCR 근거는 합성 성적 검수이며 수학 정답성·실제 계정 ZIP·실물 A4 인쇄까지 승인한 것은 아니다. 승인 문제은행·성적·원본 자료는 변경하지 않았다.

## 2026-10-19 최종 3회 운영 패턴 QA 근거 보완·Mac 정리 (최신)

- 기존 [Drive 운영 패턴 PDF 17개·Vision 근거 ZIP](https://drive.google.com/file/d/1yTrobo9e0jveClMrtEPyxRG_GNoJN4Hx/view)은 로컬 `operational-batch-vision-evidence-20261019.zip`과 20408685바이트·SHA-256 `823af2b4874671b842e45c76d99da60ba71c77976972e5c9d6ddc7501fa948db`로 일치했다. 다만 이 ZIP에는 공통 관리자 PDF·화면 렌더 등 112개 파일이 없어서 [Drive 보충 ZIP](https://drive.google.com/file/d/1bXcjtP5NDOx1f0cLtp9mHa6557zV8ccQ/view)에 경로·해시 목록과 함께 추가했다. 보충 ZIP 62064596바이트를 다시 내려받아 SHA-256 `edda7388d1e6e9404e9cb25cc409462d94a6b6f0ff1c9efd8d69a03f100e8c5b` 일치를 확인했다.
- 두 ZIP의 113개+112개 파일을 Mac 원본 225개와 바이트 단위로 1:1 대조했다. Git 추적·현재 코드 경로 참조·열린 파일이 없는 완료된 `.private-work/last3-operational-batch-20261019/`와 임시 보충 ZIP만 정리해 Mac 순감소량 **111069106바이트**를 기록했다. 합성 성적 QA의 보존이며 실제 관리자 계정 ZIP 저장·학생 로그인·실물 A4 인쇄를 검수 통과로 바꾸지 않는다. 승인 문제은행·성적·원본 자료는 그대로다.

## 2026-10-19 완료된 최종 3회 레이아웃 시험본 Drive 보관·Mac 정리 (최신)

- `.private-work/last3-layout-check/`의 2026-10-18 시험 출력 **156개 파일·163867857바이트**는 Git 추적 대상이 아니고 현재 코드의 경로 참조·열린 파일도 없었다. 기존 폴더 구조·각 파일 SHA-256을 manifest에 넣은 [Drive A ZIP](https://drive.google.com/file/d/1Hf2mpS-oU_M3FzahosVaNMy0VpxnZwp2/view) **77629070바이트**와 [Drive B ZIP](https://drive.google.com/file/d/1nuydwgGxO766tIVmYWrmq2s5IbjCgG_T/view) **60481125바이트**로 보관했다. 단일 138MB ZIP은 Drive 업로드 100MB 제한으로 거절돼 서버에 저장하지 않았다.
- 두 Drive ZIP을 다시 내려받아 각각 SHA-256 `f85a49170d7c5ff580b9c7392ebd8ea4053d4b077c204e5197da74e19d619f3f`·`24798e8a5c742b82a2956119174f5a7dc0106231db2b742f6bef82c21e28644b`가 로컬 생성본과 일치하는지 확인했다. ZIP 내부 156개 파일도 원래 경로·크기·SHA-256과 1:1 대조한 뒤 완료된 로컬 시험 폴더와 임시 ZIP을 정리했다. Mac 순감소량은 원본 폴더 **163867857바이트**다. 승인 코드·문제은행·원본 자료·학생 기록은 변경하지 않았다.

## 2026-10-19 완료된 최종 3회 26번 로컬 중복 QA 정리 (Mac, 최신)

- 26번 검수의 로컬 `qa`·`qa-after`·`qa-public` 화면 PNG 7개씩은 SHA-256이 서로 같았다. 환경별 결과 JSON 3개와 고유 화면 7개를 [Drive 화면 검수 ZIP](https://drive.google.com/file/d/1YDY4hKUVn3dhQE4Izt8k8P2aj2jJc0Q_/view)에 보관했다. ZIP 14078437바이트를 Drive에서 다시 내려받아 SHA-256 `207a962fabac0ec16d15c5b8281b497cea8ff27b048db252fcd171f2f9c26b60`으로 로컬 생성본과 일치함을 확인했다.
- ZIP 내부 모든 화면·결과가 원본 파일과 같은지 검사하고, Git 추적 파일이 아닌 중복 QA 파일 25개만 정리해 Mac 로컬 **57201335바이트**를 회수했다. `.private-work/last3-study-q26-20261019/`에는 재현 코드·독립 대조 기록·기존 릴리스 요약 ZIP만 남겼다. 원본 자료·승인 은행·Git 코드·학생 기록은 건드리지 않았다.

## 2026-10-19 Mac 다음 작업·실제 로그인/프린터 상태 (최신)

- Mac Chrome에서 공개 `admin.html`은 관리자 암호 입력 화면, `final.html`은 학생 이름 입력 화면으로 직접 확인했다. Mac UI는 접근 가능하지만 **실제 계정 인증 전**이다. `lpstat -p`에는 등록 프린터가 없다. 따라서 합성 성적 ZIP·PDF QA와 달리 실제 계정 ZIP 저장·실물 A4 인쇄는 아직 미완료다.
- 중급 8회 현재 승인 은행 SHA-256 `680d8648201f88d2366f1900e406eae708ffed4d9f6a1f77c3c75981c895b6d1`가 최신 대기표의 기준 해시와 일치한다. [Drive 최신 대기표](https://drive.google.com/file/d/1_Nw7FA90p6EOysvp5flm6Mss7PTlFeZy/view)와 Mac 사본의 152071바이트·FNV-1a 64비트 `3b371b3c8fb2993f`도 일치한다. 현재 **189축·62문항·원문 24개 보류**, 9축 최종 승인 0이다. 아래 191축 기록은 이전 단계다.
- [Drive Mac 이어받기·검수 순서](https://drive.google.com/file/d/1Q-NDY-pTaesjjZUo8Pe_ygw5SYwFXe5_/view)에 실제 계정 ZIP, 실물 양면 A4, S0L/울트라의 중급 8회 원문 동등성 판정 순서를 적고 기존 최종 3회 폴더에서 크기·부모를 확인했다. 로컬은 `.private-work/mac-continuation-20261019/`이다. 승인 문제은행·채점·학생 성적은 변경하지 않았다.

## 2026-10-19 최종 3회 26번 학습 포인트 정정·공개 확인 (Mac, 최신)

- 최종 3회 원본 **5쪽 26번**은 1~77단계 정육각형 넓이 합을 **6**으로 나눈 나머지를 묻는다. 진단지 학습 포인트의 종전 **12로 나누기**는 승인 유사문제 1번의 수치만 가리켜 원문·나머지 두 변형과 어긋났다. 메인 `edee685d17d7b28b6de62d44c0c46a4dc954a8d7`에서 학습 포인트를 **한 단계 넓이 `6×단계 수×단계 수` → 원문은 6, 유사문제는 각 지문에 적힌 수로 나누기**로 정정하고 `final.html` 캐시 버전을 올렸다. 승인 문항·답·채점·`data.js`·보호 칼럼은 변경하지 않았다.
- 원문·승인 변형 3개를 각각 독립 계산해 `77단계÷6→0`, `31단계÷12→0`, `41단계÷9→6`, `54단계÷24→18`로 저장 답과 일치했다. 원본 그림은 `materials/last_final_3/005.jpg`에서 직접 대조했다. 권장 위치 **더클래식 1과정 9권 · 도형의 분할과 넓이**는 선수 단원 연결이며 동일 문항 유형·교재 페이지 적합성까지 확정한 기록은 아니다.
- 로컬·공개 최종 3회 부모 보고서 검사에서 학습 위치·포인트 **30/30**, 우선 유형의 승인 유사문제·풀이 포함, 브라우저 오류·운영 저장 **0**을 확인했다. 공개 `last-report-data.js`와 `final.html` 바이트가 메인과 일치한다. [Drive 릴리스 요약](https://drive.google.com/file/d/1tTMKLkbw25rt9rblPJKVd7f7xk5WLoXW/view), [원본 페이지·독립 계산·공개 QA·재현 코드 ZIP](https://drive.google.com/file/d/1FAvupcuCRJgPbKDaif2RwlFDL295dEj9/view)을 기존 최종 3회 폴더에 저장해 크기·부모를 확인했다. 로컬 근거는 `.private-work/last3-study-q26-20261019/`이다. 검사는 합성 성적 기준이며 실제 계정 ZIP과 실물 A4 인쇄는 인증된 Mac 세션·프린터 확인 후 이어서 해야 한다.

## 2026-10-19 중급 8회 28번 그림의 숫자 9 개수 명시안 비교 (Mac, 최신)

- 직전 비공개 14·18·16개 후보를 보존하고, 같은 세 지문·정답 **126·162·144**에 `9가 14개`처럼 세는 대상을 적은 **새 유사문제용 그림**을 별도 PDF로 만들었다. 원본 그림·승인 문제은행·채점은 변경하지 않았다. 이 표기는 `99` 묶음 개수로 오해할 여지를 줄이지만, 원본보다 표현 해석이 쉬워질 수 있어 교사·학생의 원문 동등성 판단 전에는 교체하지 않는다.
- 두 버전의 A4 2단 문제 1쪽·양면용 빈 2쪽·답안 3쪽을 렌더해 직접 확인했다. Apple Vision **150dpi**에서 기존 `14·18·16개`는 각각 두 번 읽혔으나 `99` 하나가 `g9`로 오독됐다. 새 표기의 **14·18개**는 각각 두 번 읽히고 `99→g9` 오류는 없었지만 **16개 표식 두 개**를 오독했다. **300dpi**에서는 두 버전 모두 각 표식과 `99`를 읽었다. OCR 해상도 민감성 때문에 `visualCue` 합격이나 실물 인쇄 완료를 주장할 수 없다.
- [Drive 명시안 PDF](https://drive.google.com/file/d/1jpsiYwSc3awpD83wK_jOKaJK6bs7iQBU/view), [그림 변경 비교 JSON](https://drive.google.com/file/d/1TRUwwxvSXOcGs4ciMkNabCmecaY8cSw6/view), [150·300dpi OCR 판정 JSON](https://drive.google.com/file/d/1NoDgW1ids3KpIOifW-XaNBfW7GVp88zo/view), [양쪽 PDF·렌더·OCR·재현 코드 ZIP](https://drive.google.com/file/d/1qfJ_KOv4_6u5PfC2tAS5RmPq1wUIgjt_/view)을 기존 중급 8회 Drive 폴더에 저장해 크기·부모를 확인했다. Mac 근거는 `.private-work/middle8-20261018/q28-candidate-load-20261019/`이다. **189축·62문항·24개 원문 보류**, 9축 최종 승인 0은 유지한다. 실제 계정 최종 3회 ZIP 검수는 Mac이 여전히 잠겨 있어 이번에도 실행하지 못했다.

## 2026-10-19 중급 8회 28번 계산 부담 비공개 후보·Apple Vision 검수 (Mac, 최신)

- 원본 PDF **5쪽 28번**과 강의 답안 **31쪽**을 직접 확인했다. 원본은 두 곱하는 수의 숫자 9가 각각 **15개**, 정답 **135**다. 현재 승인 변형은 12·18·21개, 정답 **108·162·189**이며 공개 문제은행·채점은 변경하지 않았다.
- 비공개 교체 후보는 **14·18·16개**, 정답 **126·162·144**다. 모든 수에 대해 실제 큰 정수의 제곱, 자리수 합, `9×(n−1)+8+1`을 독립 대조했다. 원본과 후보는 이 중간 계산이 모두 세 자리 수이고 마지막 `+9`에 받아올림이 1회다. 현행 승인 12개는 중간 결과 두 자리 수·받아올림 2회, 21개는 마지막 받아올림 0회다. 이 차이 때문에 후보를 계산 부담 비교 자료로만 만든 것이며 원문 동등성 9축 최종 승인은 아니다.
- 후보 A4 **2단 문제 1쪽·양면용 빈 2쪽·답안 3쪽**을 렌더해 직접 확인했다. Apple Vision은 `14개·18개·16개`를 각각 두 번, 답 **126·162·144**를 읽었지만 그림의 한 `99`를 `g9`로 오독했다. 원본형 `99 … 99` 표식이 **9의 개수인지 99 묶음인지** 학생에게 분명한지, 실물 A4에서 읽히는지는 계속 `visualCue` 보류다. 새 그림은 유사문제용 비공개 후보일 뿐 원본 그림을 바꾸지 않았다.
- [Drive 후보 PDF](https://drive.google.com/file/d/1btAro8Q-gFyugx5ytzUrJ1Dun002iYwD/view), [계산 비교 JSON](https://drive.google.com/file/d/19IvwP58k7acft-rZ_hM_dus-fiB0H_iW/view), [인쇄·OCR QA JSON](https://drive.google.com/file/d/10IMn-EH3TDrVzoSEMvkHa2WdGU1P_dM0/view), [원본·답안·렌더·재현 코드 ZIP](https://drive.google.com/file/d/1kFWosnh-vFsWcl5gDXTGrOA6uJ4vdRPI/view)을 기존 중급 8회 폴더에 저장하고 크기·부모를 재조회했다. Mac 로컬은 `.private-work/middle8-20261018/q28-candidate-load-20261019/`이다. 승인 90문항·문제은행 SHA-256 `680d8648201f88d2366f1900e406eae708ffed4d9f6a1f77c3c75981c895b6d1`, 검수 대기 **189축·62문항·24개 원문**, 최종 승인 0은 그대로다. 다음 수학 판정은 프로젝트 규칙에 따라 **S0L/울트라**, 단순 반복 QA만 Luna/Terra로 이어간다.

## 2026-10-19 중급 8회 29번 최장 연속합의 구조적 한계 (Mac, 최신)

- 원본 PDF **6쪽 29번**과 강의 답안 **32쪽**, 승인 `compact` 문제지 **30쪽 85~87번**을 직접 대조했다. 원문 **90＝2＋…＋13**은 가능한 최장 길이 **12개**가 곧바로 성립한다. 승인 99·102·104의 저장 답 **4·3·2**는 전수 열거와 식 계산으로 맞지만, 이론상 더 긴 길이를 먼저 배제하는 횟수는 각각 **2·1·0회**다. 세 승인 문항이 같은 페이지에 있고 표현식이 모두 **14에서 끝나므로**, 앞 문항의 발견 결과를 다음 문항에 옮기는 지름길 위험은 그대로다.
- 일반식 `N＝T_L＋L(a−1)`(`T_L＝1＋…＋L`, `a`는 첫 수)에서 이론상 가능한 최장 길이 `L`이 바로 성립하면 `T_L≤N<T_(L+1)`이므로 **a는 1 또는 2뿐**이다. 원문처럼 길이 12·긴 길이 배제 0회인 수는 **78·90 두 개**이며 90은 원본이다. 따라서 **서로 다른 첫 수 답 3개를 만들면서 모두 원문과 같은 즉시 최장 길이 경로를 유지하는 것은 불가능**하다. 1~1000 합을 직접 열거해 식과 다시 맞췄다. 이는 현행 승인 문항을 틀렸다고 판정하거나 자동 교체하는 근거가 아니라, 교사가 답 다양성·추가 경우 배제·학생의 지름길 중 허용 경계를 결정할 때 필요한 한계다.
- [Drive 구조 증명·전수표 JSON](https://drive.google.com/file/d/1Th69qUYiZ59K6ofXkM1pK6QdoMU9g6aF/view), [원본/답안/현행 인쇄/재현 코드 ZIP](https://drive.google.com/file/d/1yYtDFGC9AV_HAjv0NdmZ1UV4z0wAkuVf/view), [갱신된 검수 대기표](https://drive.google.com/file/d/1_Nw7FA90p6EOysvp5flm6Mss7PTlFeZy/view)를 기존 중급 8회 폴더에 저장하고 크기·부모를 재조회했다. Mac 근거는 `.private-work/middle8-20261018/q29-direct-max-feasibility-20261019/`이다. 승인 90문항·채점·학생 기록과 29번 **7축**, 전체 **189축·62문항·24개 원문 보류**는 그대로다.

## 2026-10-19 중급 8회 9·10번 원문 계산 경로의 교체 가능 순번 경계 (Mac, 최신)

- 원본 PDF **2쪽 9·10번**의 분수열·순서쌍 그림과 강의 답안 캡처 **11·12쪽**을 직접 다시 보았다. 원문은 둘 다 `1＋…＋9＝45` 다음 **50번째＝10번째 묶음의 다섯째**이며 9번 답 `5/11→16`, 10번 답 `(5,6)`이다. 공식 묶음식과 1~120번째 직접 나열을 별도로 대조하고, 공개 승인 세 변형의 순번·답을 다시 검사했다.
- 승인 1·2번 변형과 답이 겹치지 않으면서 **같은 10번째 묶음**, 원문과 같은 순번 계산 받아올림, 9번의 분자+분모 받아올림 및 10번의 둘째 수 받아내림을 유지하는 순번은 **9번 52·53번째, 10번 51~54번째**뿐이다. 기존 비공개 후보 **9번 52번째·10번 53번째**가 이 범위에 있다. 이는 산술 경계일 뿐 원문 동등성 승인이나 `accidentalShortcut`·`visualCue` 보류 해제가 아니다. 원본 50번째 또는 묶음 끝 55번째와의 거리 때문에 학생이 다른 짧은 풀이를 택하는지, 작은 분수 그림이 실물 A4에서 읽히는지는 남는다. 현행 승인 90문항·정답·채점과 **189축·62문항·24개 원문 보류**를 유지했다.
- [Drive 전수 열거·조건표 JSON](https://drive.google.com/file/d/1f93Zdv3p3uZAs3b0s7BGQh06Uy4s_2Lw/view)과 [원본/강의 답안/현행 인쇄/재현 코드 ZIP](https://drive.google.com/file/d/1rLuKcklLgPuzCzdUr8f9cc2Kj2xzjjr4/view)을 기존 중급 8회 검수 폴더에 저장하고 크기·부모를 재조회했다. Mac 로컬 근거는 `.private-work/middle8-20261018/q09q10-frontier-20261019/`이다.

## 2026-10-19 최종 3회 원문 1~30번 관리자 ZIP 전수 확인 (Mac, 최신)

- `qa/last3-batch-priority-matrix-validate.cjs`에 `GFIELD_LAST3_ALL30_ZIP=1` 모드를 추가했다. 공개 `https://hs.gfieldacademy.net` 정적 코드와 **합성 관리자·학생 성적**으로 원문 1~30번을 각각 단독 오답으로 넣어 관리자 **ZIP 한 개로 받기**를 30회 실행했다. 매번 해당 원문의 승인 유사문제 **3개·풀이 3개**와 ID 1~3이 정확했고 `준비 중인 부록` 안내, 외부 운영 쓰기, 브라우저 오류는 모두 **0**이었다. ZIP 30개를 별도로 CRC 검사하고 PDF 서명·쪽수를 확인했으며 PDF는 **7~9쪽**이었다. 기존 기본 모드의 오답 0·1·2·3·6개 **5조합**도 로컬에서 다시 통과했다. 이전 30문항 부모 보고서 검사는 권장 학습 위치·학습 포인트 **30/30**을 확인했으며, 이번 ZIP 검사는 그 데이터의 교재 적합성을 새로 판정한 것은 아니다.
- [Drive 전수 검수 요약](https://drive.google.com/file/d/1dXp6syx0V93dukH05c-dAq9Ho_I_Ty70/view), [1~10번 ZIP·재실행 코드](https://drive.google.com/file/d/1vZufo_fuke4l2p3nCzeexjrQ6oA35fHo/view), [11~20번 ZIP](https://drive.google.com/file/d/1QNx7Df0mx0Kyulf-UMVqFo0akNDZdxCt/view), [21~30번 ZIP](https://drive.google.com/file/d/1y_JrscbKhZLLhkbgh_0cHPg7s6RHcyGY/view)을 기존 최종 3회 검수 폴더에 저장하고 크기·부모를 재조회했다. Mac 로컬은 `.private-work/last3-all30-zip-20261019/`이다. 실제 Chrome 관리자 주소는 여전히 로그인 화면이고, Mac 등록 프린터가 없어 **실제 계정 ZIP·실물 A4 검수는 미완료**다. [로그인·프린터 확인 기록](https://drive.google.com/file/d/1mObIGr3ONqJV1O9fu9DeRGHYz1nwxzXS/view)을 같은 폴더에 보관했다. 승인 문항·성적·채점·보호 데이터는 바꾸지 않았다.

## 2026-10-19 중급 8회 1번 유형명 중립화·공개 검증 (Mac, 최신)

- GitHub `main` 커밋 `6e11a200972a3268469a5b78a63aedc435a05094`에서 1번 유사문제의 공통 유형명을 **「자리를 바꾸면 45 차이 나는 네 자리 수」**로 바꿨다. 승인된 세 문제의 교환 결과는 1·3번이 **45 큰 수**, 2번이 **45 작은 수**인데 종전 유형명은 모두 “커지는”이라고 표시해 2번의 지문과 충돌했다. 원본 및 변형 **90개 지문·답·풀이·그림·승인·채점은 그대로**이며, 검색 별칭과 화면·인쇄 유형명만 정리했다. `data.js`와 보호 칼럼은 불변이다.
- 원본 PDF **1쪽 1번**과 2단 A4 인쇄 화면을 직접 보고, 네 수의 가능한 십·일 자리 조합을 각각 전수 대입해 원문·세 변형 답을 재확인했다. Apple Vision OCR이 공개 인쇄물의 중립 유형명 세 번과 2번의 “작은 수”를 판독했다. 로컬·공개 사이트에서 문제은행 **90문항**, 2단 문제지·답안, 학습 위치·포인트 **30개씩**, 학생 보고서·관리자 연결, 외부 쓰기 **0** 검사가 통과했다. `qa/docssam-columns-preservation-validate.js`도 **21개 PASS**다. [GitHub Pages 실행 39174606918](https://github.com/docssam1/hs-report/actions/runs/39174606918)은 성공했고 공개 주요 4파일이 메인과 SHA-256으로 일치한다. 현행 문제은행 SHA-256은 `680d8648201f88d2366f1900e406eae708ffed4d9f6a1f77c3c75981c895b6d1`이다.
- [Drive 1번 변경·독립 검산 JSON](https://drive.google.com/file/d/1xZuuK_gxvvpVVDqf4mNaIK_RQIMNbPG2/view), [로컬 PDF·Apple Vision·QA ZIP](https://drive.google.com/file/d/1X_yRTvIh589eLTrRMQJkp2ObPZH5w2Gq/view), [공개 검증 JSON](https://drive.google.com/file/d/1hcDhgU9emhukNDtU325QtUC6wHC2h_VA/view), [공개 PDF·브라우저 QA ZIP](https://drive.google.com/file/d/1lbBmqOzejWz1QVZOXor_UPy1uUSdno0f/view), [현행 검수 대기표](https://drive.google.com/file/d/1pB4BsVGui85B-qUR7pO4DZ4nQaDxYvLl/view)를 기존 중급 8회 폴더에 저장했다. 검수 대기표는 현재 코드 해시로 갱신했지만 **189축·62문항·24개 원문 보류**, 특히 **1번 2번 변형의 3축 보류**는 유지한다. 실제 계정의 최종 3회 ZIP·실물 A4 인쇄·교사 및 학생 체감 난도 확인은 남아 있다. Mac 로컬 근거는 `.private-work/middle8-20261018/q01-neutral-type-20261019/`이다.

## 2026-10-19 중급 8회 23번 비공개 교체 후보 123·125 세트 지름길 재판정 (Mac, 최신)

- 원본 PDF **4쪽 23번**의 실제 괄호 수열 그림과 강의 답안 **26쪽**, 현행 승인 3번 변형 `161`, 비공개 후보 `123`의 2단 비교 PDF 문제 1쪽·답안 3쪽을 직접 열었다. Apple Vision 보조 판독과 별도 묶음 열거·삼각수 계산을 대조했다. 원문 `121`은 61번째 홀수로 **11번째 괄호의 6번째**, 후보 `123`은 62번째 홀수로 **11번째 괄호의 7번째**다. 모두 앞 10묶음 55개를 빼며, 현행 승인 `161`은 81번째 홀수·13번째 괄호의 3번째여서 원문보다 누적 계산 범위가 길다.
- 123 후보의 이전 **8축 잠정·1축 보류**는 세트 수준 검수 부족으로 정정했다. 현행 1·2번 답의 괄호 안 위치가 **5·6번째**이고 123 후보가 **7번째**여서 연속 풀이 때 답의 위치를 추측할 수 있다. `accidentalShortcut`을 추가로 잠가 **7축 잠정·2축 보류**다. 원본 답 121→6번째가 학생에게 보이지 않는다는 점만으로 세트 지름길을 배제할 수 없다.
- 별도 비공개 **125 후보**는 `(125＋1)÷2＝63`, `55＜63≤66`, `63−55＝8`로 **11번째 괄호의 8번째 수**다. 현행 앞 두 답의 위치 **5·6번째**와 단순한 5·6·7 연속 답을 만들지 않는다. 원본 그림 바이트를 유지한 A4 2단 문제 1쪽·빈 양면 2쪽·답안 3쪽을 렌더해 직접 확인했고, Apple Vision이 `125`와 답을 읽었다. 9축은 **8축 잠정 정렬·`visualCue` 1축 보류**다. 실물 A4 100% 인쇄·학생 실측 난도·교사 교체 승인·9축 최종 승인·공개 연결은 **0**이다. Mac `lpstat`에는 프린터가 없어 실물 인쇄는 실행하지 못했다.
- [Drive 정정된 123 검수 JSON](https://drive.google.com/file/d/1uNEKnoIu9RS82P3Y0lZHogv5bJoWudCu/view) **4990바이트**, [125 후보 9축 JSON](https://drive.google.com/file/d/10BcGrHcEMPWwz7J2W5s9fsulQHxuE9bR/view) **5225바이트**, [교사용 2단 PDF](https://drive.google.com/file/d/1xBxXvolb7MF5FeZJwBpq6auLBwvJRscK/view) **132832바이트**, [원본·그림·Apple Vision·재현 코드 ZIP](https://drive.google.com/file/d/1DesIQzgMl7QW_IKytBXBvGj7Mr4rilK0/view) **1844437바이트**를 기존 폴더에서 크기·부모까지 재조회했다. Mac 위치는 `.private-work/middle8-20261018/q23-candidate-20261019/`와 `q23-candidate-125-20261019/`이다. 현행 승인 90문항·답·채점·성적과 문제은행 SHA-256 `89be2de73d408d3e16731a42ec7b7176417a627b071c7fe1357e6a14f878320c`, 현재 **189축·62문항·24개 원문 보류**는 그대로다. 최종 3회 실제 계정 ZIP 검수는 관리자 인증된 탭이 없어 대기 중이다.

## 2026-10-19 중급 8회 11번 비공개 교체 후보 2·3의 9축 검수 (Mac, 최신)

- 원본 PDF **2쪽 11번**과 강의 답안 **13쪽**, 기존 비공개 후보 비교 PDF 문제·답안을 직접 대조했다. 원문은 `690÷3＝230`, `230×7＋425＝2035g→2kg 35g`이다. 후보 2는 `880÷4＝220`, `220×9＋405＝2385g→2kg 385g`, 후보 3은 `990÷3＝330`, `330×8＋415＝3055g→3kg 55g`이다. 두 후보의 관찰 무게 차와 정답을 분수 계산·물 전체 1~5000g 전수 대입으로 다시 확인했다.
- 제작 기준 2.7의 **9축**을 후보별로 기록했다. 후보 2는 **7축 잠정 정렬·2축 보류**다. 두 세 자리 나눗셈은 나머지 0, 한 자리 곱셈 받아올림 2회, 마지막 덧셈 받아올림 1회로 원문과 같지만 답의 g 부분이 **35g→385g**으로 두 자리에서 세 자리로 바뀌어 `calculationLoad`를 잠갔다. 후보 3은 **8축 잠정 정렬·1축 보류**로, 산술 단계와 `kg＋두 자리 g` 표기를 유지한다. 두 후보 공통 보류 `visualCue`는 원본 PDF의 위아래 분수와 비공개 비교 PDF의 빗금 분수가 달라 실제 학생 화면·종이 가독성이 미확인인 점이다. 학생 실측 난도·교사 승인·9축 최종 승인·공개 연결은 모두 **0**이다.
- [Drive 후보별 18행 검수 JSON](https://drive.google.com/file/d/19q9q8m6u_tYO_Ya6xwMkmLyFK_kVAus8/view)과 [원본/후보 PDF·Apple Vision·검산 코드 ZIP](https://drive.google.com/file/d/12-GVD4MjKbF73rXbwbXBHAPuR70_7VmJ/view)을 기존 중급 8회 검수 폴더에 저장하고 크기·부모를 재조회했다. Mac 위치는 `.private-work/middle8-20261018/q11-candidates-20261019/`이다. 새 후보는 답이 바뀌므로 별도 승인·학생 렌더·채점 연결 전 공개하지 않는다. 현행 승인 90문항·성적, 문제은행 SHA-256 `89be2de73d408d3e16731a42ec7b7176417a627b071c7fe1357e6a14f878320c`, 현재 **189축·62문항·24개 원문 보류**는 그대로다.

## 2026-10-19 중급 8회 3번 아홉 카드 원문형 숫자 교체 가능성 (Mac, 최신)

- 원본 PDF **1쪽 3번**의 실제 **1~9 숫자 카드 9장**과 공식 답안 **4쪽의 최종 987−123＝864**, 현행 승인 세 변형의 카드 그림·답 **875·854·764**를 직접 대조했다. 자리별 카드 배치를 전수 열거해 네 답을 다시 확인했다. 원문처럼 **서로 다른 0이 아닌 한 자리 숫자 카드 9장**을 유지하면 가능한 세트는 1~9 **한 가지**뿐이다. 카드 순서만 바꿔도 가능한 식과 최댓값은 같다. 따라서 카드 숫자만 교체해 내용이 다른 원문형 3문항을 만드는 것은 불가능하다.
- 현행 변형은 숫자 카드 한 쌍이 중복되어 물리 배치는 원문과 같은 **60,480개**이나 서로 다르게 보이는 식은 **32,760개**다. 중복을 피하려고 0을 넣어 서로 다른 카드 9장을 만들면 세 자리 수의 백의 자리에 0이 오는 **13,440개 배치**를 새로 제외해야 하며 유효 배치는 **47,040개**다. 이는 원문의 분기 없는 60,480개와 다른 조건 추적이다. 구조적 가능성의 경계이며 현행 세 답의 오류 판정이나 학생 체감 난도 판정은 아니다. 3번의 `accidentalShortcut·caseSplit·conditionTracking` **9축 보류**와 9축 최종 승인 0을 유지한다.
- [Drive 전수 계산·구조 판정 JSON](https://drive.google.com/file/d/1bRtCWjXX7q3y2yQnBsGRWF3sf1cmA6KU/view), [원본·답안·현행 그림·Apple Vision·재현 코드 ZIP](https://drive.google.com/file/d/1foQ02r66htuo1IIP4_ZVxi0177UeA0RI/view), [최신 검수 대기표](https://drive.google.com/file/d/1dkannM6vrhXeMHnLvqrhJPRwvZin4DDR/view)를 기존 Drive 중급 8회 검수 폴더에 저장하고 크기·부모를 재조회했다. Mac 위치는 `.private-work/middle8-20261018/q03-template-feasibility-20261019/`이다. 다음 판정은 현행 중복 카드 변형의 학생·교사 풀이 부담을 확인하거나 별도 확장형으로 분류하는 것이다. 승인 90문항·채점·성적과 문제은행 SHA-256 `89be2de73d408d3e16731a42ec7b7176417a627b071c7fe1357e6a14f878320c`는 변경하지 않았고 전체 **189축·62문항·24개 원문 보류**다.

## 2026-10-19 중급 8회 7번 비공개 교체 후보의 묶음 지름길 재판정 (Mac, 최신)

- 원본 PDF **2쪽 7번**의 실제 원 그림·지문과 기존 비공개 1·3번 후보의 **2단 문제지·답안**을 다시 열었다. 원문은 작은 원 7개·큰 지름 56cm→작은 지름 14cm다. 후보 1번 **48cm·7개→12cm**, 현행 승인 2번 **72cm·7개→18cm**, 후보 3번 **64cm·7개→16cm**를 한 세트로 놓으면 답이 모두 `큰 원 지름÷4`다. 첫 문제에서 7개 원→반지름 8개 관계를 찾은 학생은 다음 두 문제의 그림 관계를 다시 추론하지 않고 답을 낼 수 있다. 현행 승인 세트의 원 개수는 **9·7·9개**여서 분모 **10·8·10**을 구별해야 한다. 이 차이는 학생 실측 전의 **묶음 지름길 위험**이지 개별 후보 답의 오류 판정은 아니다.
- 앞선 비공개 후보 9축 기록에서 1·3번의 `accidentalShortcut`을 각각 임시 일치로 표시한 부분은 **보류**로 정정한다. 후보별 잠정 일치는 **8축**, 묶음 지름길 보류는 **1축**이며 새 후보의 9축 최종 승인·교사 승인·공개 연결은 **0**이다. [Drive 정정 JSON](https://drive.google.com/file/d/18T41dKm4TtsQechJjlD-cot-whNqwzed/view)과 [원본·후보 PDF·Apple Vision·재현 코드 ZIP](https://drive.google.com/file/d/166CaGu6gYmAVSrIoMQ1nM9CfElhoKWUI/view)을 기존 중급 8회 검수 폴더에 저장하고 크기·부모를 재조회했다. Mac 위치는 `.private-work/middle8-20261018/q07-candidate-20261019/`이다. 후보 채택 전에는 이 반복이 의도한 연습인지 교사·학생 풀이로 확인하거나, 원 개수를 달리하는 새 그림 후보를 9축·인쇄까지 다시 검수한다. 현행 승인 90문항·답·채점과 최신 **189축·62문항·24개 원문 보류**는 변경하지 않았다.

## 2026-10-19 중급 8회 18번 달력 경우 나누기·조건 추적 재판정 (Mac, 최신)

- 원본 PDF **3쪽 18번**과 공식 답안 **20쪽**, 현행 승인 변형 3개 지문·답을 직접 대조했다. Apple Vision은 지문 수치·요일을 보조 판독했고, 달 길이 **28~31일 × 시작 요일 7개**를 독립 열거했다. 네 번 나온 요일의 날짜 합은 최대 70이므로 원문 합 75와 변형 합 80·85는 모두 다섯 번 나온 경우다. 첫 날짜 `(합−70)÷5`를 구하고 물은 요일까지 한 번 이동하면 원문 화요일 **4·11·18·25일**, 변형 1~3은 각각 **5·12·19·26일**, **6·13·20·27일**, **5·12·19·26일**로 저장 답과 일치한다.
- 변형 2의 합 85는 31일 달에서만 가능하지만 풀이에 달 길이별 분기·예외가 추가되지는 않는다. 변형 3은 원문 토요일→화요일 **+3일** 대신 일요일→목요일 **+4일**이며 결합 조건과 고정 이동 횟수는 같다. 따라서 `mid8-q18-v2 caseSplit`, `mid8-q18-v3 conditionTracking`만 **잠정 정렬**로 옮겼다. 학생 체감 난도는 측정하지 않았으므로 **9축 최종 승인 0**을 유지한다.
- [Drive 직접 검수 JSON](https://drive.google.com/file/d/1Vrru47GmumdgjroNJgeCFf2S3aVjHM7j/view), [원본·현행 렌더·Apple Vision·계산 코드 ZIP](https://drive.google.com/file/d/1p2I4bqKLcIBizXuaKznODg9_B9xm7Gfw/view), [최신 검수 대기표](https://drive.google.com/file/d/1aGLhIk7WUQP7-smHvo7d5dzS52EWwHXt/view)를 중급 8회 검수 폴더에 저장했다. 최신 대기표는 **189축·62문항·24개 원문 보류, 잠정 정렬 13축**이다. Mac 재현 위치는 `.private-work/middle8-20261018/q18-axis-resolution-20261019/`이며 승인 90문항·답·채점·성적과 문제은행 SHA-256 `89be2de73d408d3e16731a42ec7b7176417a627b071c7fe1357e6a14f878320c`는 변경하지 않았다. 실제 계정 ZIP 저장과 실물 인쇄 검수는 계속 남아 있다.

## 2026-10-19 중급 8회 21번 8칸 주기 숫자 교체의 지름길 경계 (Mac, 최신)

- 원본 PDF **4쪽 21번**의 손 그림·지문·공식 답 **200→검지 50번**과 현행 승인 세 문제 **192→48번, 208→52번, 216→54번**을 직접 대조했다. 현행 세 문제의 그림 data URL SHA-256은 모두 `a198732999814d379ff46b35387152c1fbc8d971f87daad4d6776afad860ed8f`로 같다. Apple Vision은 원본 200과 세 변형 192·208·216의 지문을 읽었고, 작은 손 그림 번호·화살표는 직접 화면으로 확인했다.
- 검지는 8칸 주기의 **2·8번째**다. `N=8q+r (0≤r<8)`일 때 횟수는 `2q+[r≥2]`이며 1~400을 직접 순회한 값과 식이 모두 일치했다. 원문과 같은 **완전 주기·남는 부분 없음** 풀이를 유지하는 숫자 교체는 8의 배수를 골라야 하고, 이 경우 답은 항상 `N÷4`다. 따라서 같은 그림·같은 물음에서 끝수만 바꾸면 앞 문항의 비율을 적용하는 지름길을 없앨 수 없다. 8의 배수가 아닌 수는 남는 칸 판정을 추가해 원문보다 경우 분기가 늘어난다. 이는 **끝수만 바꾸는 설계의 한계**이며 다른 구조 설계의 불가능 판정은 아니다.
- [Drive 직접 검수 JSON](https://drive.google.com/file/d/1KXt61LNdQFOTFQyHLdKmCG6mUH7HR2w6/view)과 [원본/현행 화면·Apple Vision·전수 계산 코드 ZIP](https://drive.google.com/file/d/1PWtODvRSGuht3CdMtQ6KcjIwOru1s_LR/view)을 기존 중급 8회 검수 폴더에 저장하고 크기·부모를 확인했다. Mac 로컬은 `.private-work/middle8-20261018/q21-cycle-boundary-20261019/`이다. 21번 세 문항의 `accidentalShortcut·visualCue` 보류와 전체 **191축·64문항·25개 원문 보류, 9축 최종 승인 0**을 유지한다. 사용자 승인 90문항·채점·성적과 문제은행 SHA-256 `89be2de73d408d3e16731a42ec7b7176417a627b071c7fe1357e6a14f878320c`는 변경하지 않았다.

## 2026-10-19 최종 3회 관리자 ZIP 다운로드 조합 검수 (Mac, 최신)

- `qa/last3-batch-priority-matrix-validate.cjs`를 확장해 합성 성적의 오답 **0·1·2·3·6개** 다섯 경우마다 관리자 `ZIP 한 개로 받기` 버튼으로 실제 ZIP을 받았다. 로컬·공개 사이트에서 최종 3회 ZIP이 모두 생성됐고, ZIP 안 PDF의 유사문제·풀이가 각각 **0·3·6·9·9개**로 일치했다. 우선 유형과 문제·답 ID도 직접 PDF 생성 결과와 같으며 `준비 중인 부록` 안내는 다섯 경우 모두 없었다. 공개 ZIP 안 PDF는 차례로 **3·7·9·10·8쪽**이고, 비연속 원문 1·15·30번 조합의 ZIP PDF 문제 5~7쪽·풀이 9~10쪽 렌더는 앞선 직접 PDF 렌더와 바이트 단위로 동일했다. 외부 운영 쓰기·브라우저 오류 0이다.
- [Drive ZIP 조합 검수 JSON](https://drive.google.com/file/d/18t2JlTBjIUQ2pmgaZRNnWRydB0fU6XuO/view)과 [다섯 ZIP·검사 코드·로컬/공개 결과 ZIP](https://drive.google.com/file/d/1bPRI_jYVh6OMRpEMBPonpktKP-0YLw3z/view)을 기존 최종 3회 검수 폴더에 저장해 크기·부모를 확인했다. Mac 로컬은 `.private-work/last3-priority-matrix-20261019/`이다. 이것은 **합성 관리자 세션** 검수이며, 실제 계정 ZIP 저장과 실물 종이 검수는 Mac 잠금·인증 전 상태 때문에 별도 대기한다. 승인 문항·답·성적과 보호 데이터는 변경하지 않았다.

## 2026-10-19 최종 3회 관리자 PDF 우선 유형 0·1·2·3개 조합 회귀 검수 (Mac, 최신)

- 새 회귀 검사 `qa/last3-batch-priority-matrix-validate.cjs`로 실제 관리자 PDF 생성기를 **로컬·공개 사이트 정적 코드**에 각각 실행했다. 합성 성적의 오답 0개→유사문제/풀이 0개, 12번만 오답→각 3개, 3·26번→각 6개, 1·15·30번과 오답 6개→우선 3유형 각 9개를 확인했다. 두 환경의 우선 원문·문항 ID·문제/답 수가 모두 일치했고, 각 문제·답 번호도 같은 변형 순서였다. 외부 운영 쓰기·브라우저 오류는 0이다.
- 공개 사이트의 1·15·30번 조합 PDF는 **A4 10쪽**이었다. 문제 5~7쪽은 2단으로 1~9번, 8쪽은 양면용 빈 면, 풀이 9~10쪽은 1~9번이다. 문제·풀이 쪽을 직접 렌더해 확인했고 Apple Vision OCR로 해당 번호를 재확인했다. [Drive 검수 JSON](https://drive.google.com/file/d/1DA7Sz7jAP_wg5AKuOS7aaCnsuMYjTeoI/view)과 [PDF·쪽 이미지·OCR·재현 결과 ZIP](https://drive.google.com/file/d/1Pgdzfv5AH8aveTLCU0DjMI7BoQslVzKC/view)을 기존 최종 3회 검수 폴더에 저장해 크기·부모를 확인했다. Mac 로컬은 `.private-work/last3-priority-matrix-20261019/`이다. 실제 학생/관리자 계정으로 ZIP을 직접 저장하는 검수는 Mac 잠금·인증 전 브라우저 상태에서 계속 대기하며, 실물 종이 확인도 남아 있다. 승인 문제은행과 보호 데이터는 변경하지 않았다.

## 2026-10-19 중급 8회 17번 비례 지름길 구조 확인 (Mac, 최신)

- 원본 PDF **3쪽 17번** 그림과 원본 강의 답안, 현행 승인 `mid8-q17-v1/v2/v3`의 지문·그림을 직접 대조했다. Apple Vision은 원본 `280g`, 변형 `350g·420g·560g`을 읽었다. 현행 세 변형의 그림 data URL SHA-256은 모두 `699136e4f92deea0d8490fb729709979af0f6e53a618016689b79397464695cd`로 같다. 작은 그림 라벨은 OCR만으로 판단하지 않고 원본·현행 렌더를 직접 확인했다.
- 모빌 균형식을 독립적으로 세우면 `다=2나`, `나=2라`, `마=3라`, `가=14라`다. 양의 정수 범위 전수 확인에서도 원본 `라 20g·마 60g`과 현행 `25g·75g`, `30g·90g`, `40g·120g`이 각각 유일하게 나왔다. 하지만 세 변형은 그림과 관계식이 같고 **가의 수치만 다르므로**, 앞 문제에서 얻은 `라=가÷14`, `마=3가÷14`를 다음 문제에 적용하는 지름길이 구조적으로 확인됐다. 한 유형 집중 출력에서는 독립적 그림 해석이 줄어든다. 이 지름길은 17번 세 문항의 `accidentalShortcut` 보류 근거이며, `v1 calculationLoad`와 세 문항의 `visualCue` 보류도 유지한다. 최신 검토표는 **191축·64문항·25개 원문 보류, 9축 최종 승인 0**이다.
- [Drive 검수 JSON](https://drive.google.com/file/d/1RS-jsQmQ0b_qtbIHYZDG5hKDkuV9Bnnp/view)과 [원본·현행 렌더 및 Apple Vision 근거 ZIP](https://drive.google.com/file/d/1_1fuQ_Jjf2n6j8Oz79xtZu0IJ_31fU68/view)을 중급 8회 검수 폴더에 저장하고 크기·부모 폴더를 확인했다. Mac 로컬은 `.private-work/middle8-20261018/q17-scaling-boundary-20261019/`이다. 사용자 승인 90문항·답·그림·채점·성적과 문제은행 SHA-256 `89be2de73d408d3e16731a42ec7b7176417a627b071c7fe1357e6a14f878320c`는 그대로다. 실제 학생·관리자 로그인 ZIP 검수와 실물 인쇄는 인증 전 Mac 세션에서 완료하지 못했으며, 세 문항을 다른 구조로 바꾸려면 원문 동등성 9축을 새로 검수해야 한다.

## 2026-10-19 운영 PC 등록 3대 상한 해제 직접 재검증 (Mac, 최신)

- 운영 Supabase `fgahqumaldheqettmvqg`의 활성 `hs-parent-auth` v7과 `hs-approval-admin` v9를 읽기 전용으로 직접 확인했다. 학생 웹 로그인은 `hs-parent-auth`를 호출하며, 활성 함수는 기존 기기 갱신·신규 기기 삽입에 대수 상한 검사를 두지 않는다. 관리자 응답의 `deviceLimit`은 `null`이다. `hs_student_devices`의 운영 집계는 학생별 최대 승인 기기 **4대**, 3대 초과 학생 **1명**으로, 과거 3대 상한이 실제 운영 데이터에서도 해제됐음을 뒷받침한다. 테이블에는 대수 제한 `CHECK`와 사용자 정의 트리거가 없다.
- 검수는 집계·함수 코드·스키마 조회만 했으며 학생 이름·계정 ID·기기 해시·세션·이메일을 읽거나 기록하지 않았고 신규 기기도 등록하지 않았다. [Drive 운영 판정 JSON](https://drive.google.com/file/d/1R6nbYFTeySgVkCNuOn9kYFYu8uADBcx_/view)을 기존 최종 3회 검수 폴더에 저장해 크기·부모를 재조회했다. Mac 로컬은 `.private-work/live-device-limit-20261019/`이다. 실제 사용자 로그인 검수는 별도로 남지만 **PC 3대 상한 해제 자체를 다시 작업할 필요는 없다**.

## 2026-10-19 최종 3회 진단 PDF·관리자 ZIP 유사문제 2단 혼합 순서 공개 반영 (Mac, 최신)

- GitHub `main` 커밋 [`0ae4911b`](https://github.com/docssam1/hs-report/commit/0ae4911b3a18083fc13c9d3554e76673dfcb21e1)에서 최종 3회 우선 추천이 **여러 원문**일 때 유사문제 3개씩을 원문 유형 사이에 섞어 인쇄하도록 바꿨다. 예시 원문 28·29·30번은 `28-1,29-1,30-1,28-2,29-2,30-2,28-3,29-3,30-3` 순서다. 문제·답안 ID와 인쇄 번호가 같고 기존 `compact` **2단** 배치는 유지된다. **원문 하나**만 추천되면 해당 3문항을 묶어 출력한다. 화면의 우선 3원문·학습 위치·포인트, 승인 문제 지문·답·채점·성적은 변경하지 않았다.
- 로컬 합성 학생 검사 **5/5**, 공개 사이트 합성 학생 검사 **5/5**, 관리자 일괄 저장 검사 **12개 PASS**, 다른 파이널 회차 인쇄 회귀 검사 모두 통과했다. 최종 3회 단독 ZIP과 3·4회 혼합 ZIP은 최종 3회 유사문제 **9개·풀이 9개**를 포함하며 `준비 중인 부록` 안내가 없다. 실제 관리자 PDF **A4 10쪽**에서 5~7쪽 문제 1~9번이 2단, 8쪽 양면 인쇄용 빈 면, 9~10쪽 풀이 1~9번이다. 문제 쪽과 답안 쪽을 직접 렌더해 보고 Apple Vision으로 번호를 확인했다. 합성 검사의 외부 쓰기·브라우저 오류는 0이다.
- GitHub Pages [실행 39170858930](https://github.com/docssam1/hs-report/actions/runs/39170858930)이 성공했고 공개 `final-summary-practice-print.js`는 메인과 SHA-256 `1b7db014abf6d681cca3f5410655f4eb5925deebd13c2d978b8bbe6047e08476`으로 같다. [Drive 검수 JSON](https://drive.google.com/file/d/1SQmKn9TvrJ8WJZ-9cndJluBlxXIVXIVM/view)과 [PDF·ZIP·Apple Vision·QA 근거 ZIP](https://drive.google.com/file/d/1Z_EqFMOeB2gT8CNCC_2-UNAIEEd6e3pw/view)을 기존 최종 3회 검수 폴더에 저장하고 크기·부모 폴더를 확인했다. Mac 로컬은 `.private-work/last3-mixed-order-20261019/`이다. 실제 학생·관리자 계정으로 최종 3회 ZIP을 직접 저장하는 검수와 실물 종이 확인, 별도 중급 8회 원문 동등성 9축 판정은 계속 남아 있다.

## 2026-10-19 중급 8회 보고서 다단·유사문제 링크 공개 반영 (Mac, 최신)

- GitHub `main` 커밋 `9206eec8424e4a45e713ae4ba165e4e5d7953e19`에서 중급 8회 보고서의 **여러 오답 유형·전체 90문항** 유사문제 링크를 `mixed` 순서·`compact` 2단 출력으로 연결했다. 예시 원문 2·5·8번의 9문항은 `2-1,5-1,8-1,2-2,5-2,8-2,2-3,5-3,8-3` 순서이며 문제 9개·답/풀이 9개가 모두 나온다. 전체 90문항에서 2번 변형은 문항 2·32·62번으로 분산된다. **한 원문 학습 위치 링크**는 해당 3문항을 `grouped`·`editorial`로 유지해 집중 학습과 풀이 공간을 보존했다. 승인 문제은행·정답·성적·보호 데이터는 변경하지 않았다.
- 로컬과 공개 사이트의 합성 계정 브라우저 검사가 모두 통과했다. 중급 8회 승인 90문제·90답안, 오답/권장 위치/학습 포인트 각 30개 연결, 카드 넘침·운영 쓰기·브라우저 오류 0이다. 세 유형의 실제 생성 PDF는 **A4 6쪽(표지 1·문제 3·답 2)**이며 2단 문제 1~9번·답 1~9번을 텍스트와 렌더 화면으로 확인했다. Apple Vision OCR이 문제 세 변형과 2번 답 `10개` 세 번을 읽었다. 최종 3회 회귀 검사는 승인 유사문제 9개·답/풀이 9개, 우선 원문·학습 위치·포인트 연결 및 운영 쓰기 0으로 통과했다. 이것은 실제 학생/관리자 계정 로그인이나 실물 종이 검수가 아니다.
- GitHub Pages [실행 39170014360](https://github.com/docssam1/hs-report/actions/runs/39170014360)은 성공했고 공개 `mock.html`은 메인과 SHA-256 `a9e6a8017da5aa486f4fafc8c965a95b2e7b75d77f963f2720b1323f4cd2fc8f`로 같다. [Drive 공개 검수 JSON](https://drive.google.com/file/d/1nVu_HrcYOznA8pC5G4dTWDADwr5lLxDS/view)과 [PDF·Apple Vision·화면·재실행 근거 ZIP](https://drive.google.com/file/d/1qgjZnOdmxqOTtEaLrKc6uZjfK-7SDIrB/view)을 기존 중급 8회 검수 폴더에 저장하고 크기·부모 폴더를 재조회했다. Mac 로컬은 `.private-work/middle8-20261018/middle8-report-mixed-link-20261019/`이다. 다음은 실제 계정의 읽기 전용 최종 3회 ZIP·중급 8회 링크 확인과 실물 인쇄, 보류 중인 원문 동등성 9축 판정이다.

## 2026-10-19 중급 8회 2번 승인본의 출력 순서·비공개 후보 판정 (Mac, 최신)

- 공개 승인 문제은행 그대로 로컬 합성 권한 검수를 실행했다. 전체 90문항의 기본 `섞어서 보기`에서 2번 유사문제 1·2·3은 **문항 2·32·62번**이며, A4 `editorial` 문제 **2·18·34쪽**, `compact` 문제 **2·15·28쪽**으로 떨어졌다. `문제별로 보기`에서는 **4·5·6번**으로 붙고 `editorial` 2·3·3쪽, `compact` 모두 2쪽이다. 두 배치 모두 90문제·90답안, PC/인쇄 카드 잘림 0, 운영 쓰기 0으로 통과했다. `섞어서 보기` 여섯 쪽을 PNG로 렌더해 직접 확인하고 Apple Vision으로 각각의 9 나머지 지문·유사문제 번호를 확인했다. 이는 전체 문제지의 인접 답 복사를 줄이지만 단일 유형의 묶음 출력 위험은 남으므로 Q2 `accidentalShortcut` 3축을 해제하지 않는다.
- 원문 두 자리 수 10~99는 90개＝9의 완전 주기 10번이어서, 현행 나머지 4·5·6의 답 10개 반복은 원문 구조에서 필연적이다. 비공개 `7로 나머지4→13개`, `8로 나머지5→11개`는 90을 각 제수로 나눌 때 불완전 주기와 다른 몫·끝값을 만들므로 **원문 동등 교체안으로 승격하지 않는다**. 원문/계산 부담의 교사·학생 판단 없이 답 다양화만으로 승인할 수 없다. 기존 승인 90문항·문제은행 SHA-256 `89be2de73d408d3e16731a42ec7b7176417a627b071c7fe1357e6a14f878320c`와 성적·채점은 불변이다. [Drive 배치·후보 판정 JSON](https://drive.google.com/file/d/1DUu0KSzQIP6uDStw7xoFbPLEXQrA9vF1/view), [두 PDF·여섯 쪽·Apple Vision·QA 코드 ZIP](https://drive.google.com/file/d/1o5PfLnC1gJF8eILF4VcomVocNDsyzU76/view)을 중급 8회 검수 폴더에 저장하고 크기·부모를 재조회했다. Mac 경로는 `.private-work/middle8-20261018/q02-answer-diversity-20261019/`이다. 실제 학생/관리자 로그인의 최종 3회 ZIP 점검은 Mac 잠금 상태와 인증 전 세션 때문에 계속 대기한다.

## 2026-10-19 중급 8회 2번 비공개 교체 후보의 PDF·Apple Vision 배치 검수 (Mac, 최신)

- 승인본은 그대로 두고, 2번의 비공개 후보 `9·나머지4→10개`, `7·나머지4→13개`, `8·나머지5→11개`만 **브라우저 메모리에서 임시 치환**해 A4 2단 PDF를 만들었다. `editorial` 61쪽(문제 2~3쪽, 답 45쪽)과 `compact` 51쪽(문제 2쪽, 답 35쪽)을 직접 열어 세 문제·세 답·풀이를 확인했다. 화면·인쇄 카드의 가로 넘침은 0, 390px 모바일 넘침은 없고, Apple Vision이 두 배치 모두 제수 9·7·8과 답 10·13·11개를 읽었다. 외부 쓰기·브라우저 오류는 0이며 공개 문제은행 SHA-256은 `89be2de73d408d3e16731a42ec7b7176417a627b071c7fe1357e6a14f878320c`로 불변이다.
- [Drive 인쇄 검수 JSON](https://drive.google.com/file/d/1GMSiySl5rZG0eQwuFptyQHenkGitECZ_/view)과 [PDF 2종·쪽 이미지·Vision OCR·재실행 코드 ZIP](https://drive.google.com/file/d/1Rwhgd7HTgB-G0v9_Mjkes4N_1QxpCoYo/view)을 중급 8회 검수 폴더에 저장하고 크기·부모를 확인했다. Mac 위치는 `.private-work/middle8-20261018/q02-answer-diversity-20261019/`이다. 이 검수는 **화면·PDF 렌더링만 통과**했다. 제수 변경에 따른 계산 부담·원문 동등성의 9축 최종 판정, 실물 종이 확인, 교사/사용자 교체 승인은 남아 있다. 승인된 공개 90문항과 Q2 `accidentalShortcut` 3축 보류를 유지한다.

## 2026-10-19 중급 8회 2번 답 반복의 구조적 원인·비공개 수정 후보 (Mac, 최신)

- 원본 PDF **1쪽 2번**과 교사 답안 **2쪽**을 직접 열고 Apple Vision으로 `9로 나누어 나머지 3`, 답 `10개`를 보조 확인했다. 두 자리 수 **10~99는 연속 90개＝9개짜리 완전 주기 10번**이어서, 나머지 0~8 어느 값도 출현 횟수는 정확히 10번이다. 90개 전수 열거와 몫 경계식이 일치했다. 현재 승인 유사문제 3개의 나머지 4·5·6은 **모두 답 10개**이며, 나머지만 바꿔서는 세 답을 다르게 만들 수 없다는 구조적 경계를 확인했다.
- 비공개 검토 후보로 기존 1번 `9·나머지4→10개`를 유지하고, 2번 `7·나머지4→13개`, 3번 `8·나머지5→11개`를 작성해 전수 열거와 부등식 경계로 각각 검산했다. 이는 답 복사 지름길을 줄이는 **후보일 뿐** 원문과 계산 부담의 9축 동등성·학생 종이 인쇄·수정 승인 전에는 공개 대체하지 않는다. [Drive 전수 증명·후보 JSON](https://drive.google.com/file/d/1Ulz3Rhi4JzXygQIxAHcKp_RWKc1OHQ9v/view), [원본·답안 화면·Apple Vision 근거 ZIP](https://drive.google.com/file/d/14-9CnNDN5UWRM7VWzqjEA40syxTMogRw/view)을 기존 중급 8회 검수 폴더에 저장하고 크기·부모를 재조회했다. Mac 위치는 `.private-work/middle8-20261018/q02-answer-diversity-20261019/`다. 현행 승인 90문항·답·채점·학생 기록 및 2번의 `accidentalShortcut` **3축 보류**는 그대로 유지한다.

## 2026-10-19 중급 8회 9·10번 강의 기반 계산 부담 재대조 (Mac, 최신)

- 원본 PDF **2쪽 9·10번**과 교사 답안 **11·12쪽**, [원강의 9:02~10:08](https://www.youtube.com/watch?v=UR28dko8N6c&t=542s)을 직접 열었다. 두 원문 모두 묶음 `1＋…＋9＝45`, **50번째＝10번째 묶음의 다섯째**라는 교사 풀이를 확인했다. Apple Vision `.accurate`가 두 답안 화면의 `45+5`를 읽었고, 분수·순서쌍은 확대 화면으로 보완했다. 원문 9번 `5/11→합16`, 10번 `(5,6)`과 공개 승인 6개 변형의 답을 별도 수열 열거로 전부 재검산해 일치했다.
- 3번 변형은 9번 **74번째＝12번째 묶음 8번째**, 10번 **72번째＝12번째 묶음 6번째**다. 교사 경로보다 누적 묶음이 각각 두 개 늘어 계산 부담 차이가 남으므로 두 `calculationLoad` 축은 **보류 유지**한다. [Drive 직접 대조·열거 JSON](https://drive.google.com/file/d/1FX5y41b3OYWxYHKMpSahTHUXTbyBi7u5/view)과 [원본/답안 화면·Apple Vision 근거 ZIP](https://drive.google.com/file/d/10C1f9Ykt_Ff_wvhiTDVJJSLi6X8DjcuB/view)을 기존 중급 8회 검수 폴더에 저장하고 크기·부모를 재조회했다. Mac 위치는 `.private-work/middle8-20261018/q09q10-lecture-20261019/`다. 사용자 승인 90문항·정답·채점·학생 기록과 최신 **191축 보류·64문항 영향·9축 최종 승인 0** 경계는 변경하지 않았다.

## 2026-10-19 중급 8회 12번 강의 화면 직접 대조 (Mac, 최신)

- [원강의 11:26~12:13](https://www.youtube.com/watch?v=UR28dko8N6c&t=686s)을 직접 재생해 원본 PDF 2쪽 12번 그림과 필기를 확인했다. 강의 11:55~12:10 화면에는 `W 2×7=14`, `B 16+16−1=31`, `31−14=17`이 순서대로 적히며 교사는 답 17개를 말한다. 이로써 저장 답 17의 **교사 강의 출처**는 확인됐다.
- 인쇄된 첫째~넷째 그림을 그대로 이어 15번째 16×16 격자를 만들면 검120·흰136, 차16개이고 전체 256개의 흑백 차가 홀수 17일 수는 없다. 따라서 강의 필기는 **원본 그림의 15번째 배열과 정합성까지 입증하지 않는다**. 사용자 확정 답 17, 공개 문제은행·채점은 그대로 두고 Q12 유사문제 3개의 원본 동등성·9축 최종 승인은 보류한다. 직접 대조 JSON은 `.private-work/middle8-20261018/q12-source-answer-conflict-audit.json`이며 Drive의 같은 검수 파일 ID로 갱신한다.

## 2026-10-19 최종 3회 운영 성적 패턴 관리자 PDF·ZIP 2단 검수 (Mac, 최신)

- 운영 최종 3회 성적 **19행의 고유 O/X 패턴 17개**를 학생 이름 없이 다시 읽어 공개 정적 사이트의 합성 관리자·학생에게 순서대로 재현했다. 기존 관리자 일괄 저장 QA를 런타임에서만 확장해 17개 모두 실제 `buildPackage` PDF를 생성했다. 각 PDF의 우선 3원문은 해당 패턴의 오답이고, 승인 유사문제 **9개·풀이 9개**의 ID가 일치했다. 임시 O/X 파일은 즉시 삭제했다. 기존 관리자 QA의 실제 최종 3회 단독 ZIP·3+4회 혼합 ZIP도 다시 통과했고, 단독 ZIP에는 유사문제·풀이가 포함되며 `준비 중인 부록` 문구가 없었다. 외부 쓰기·브라우저 오류는 0이다.
- PDF **17개 중 12개는 8쪽, 5개는 10쪽**이다. 10쪽 사례는 진단 요약이 5쪽까지 이어지고 6쪽 빈 면 뒤 **7~8쪽 2단 문제, 9~10쪽 답안**으로 구성된다. Apple Vision `.accurate`가 17개 모두 권장 학습 위치·학습 포인트를 읽고, 답안 번호 1~9를 **17/17** 읽었다. 문제지 **34쪽 모두** 문항 번호 좌표가 좌·우 단에 있다. OCR이 일부 문제 1·8번 제목을 놓쳐 대표 실제 페이지를 확대 눈으로 확인했고, 브라우저 패키지 캡처의 9개 문제 ID와 교차 대조했다. 이는 **렌더링·번호·연결 검수**이며 문항 수학/실물 종이 최종 승인으로 확대하지 않는다.
- [Drive 17개 PDF·ZIP·Vision 판정 JSON](https://drive.google.com/file/d/1zxOghOfR5oC6E__Rb57XhjJletGTaNpm/view), [익명화 PDF 17개·Apple Vision 91쪽·재실행 코드 ZIP](https://drive.google.com/file/d/1yTrobo9e0jveClMrtEPyxRG_GNoJN4Hx/view)을 기존 최종 3회 검수 폴더에 저장하고 파일 크기·부모를 재조회했다. Mac 경로는 `.private-work/last3-operational-batch-20261019/`이다. **실제 관리자 계정의 운영 ZIP 클릭·학생 로그인·실물 인쇄**는 여전히 미검수이고, 서비스 코드·승인 문제은행·성적은 변경하지 않았다.

## 2026-10-19 최종 3회 운영 성적 패턴·진단 연결 검수 (Mac, 최신)

- 운영 Supabase `mock_results`의 `last3`를 **집계·읽기 전용**으로 확인했다. 최초 성적 **19행 모두** O/X 30자리이고, 2.7/3.4/4.2점 배점에 따른 저장 점수와 O/X 기반 오답 수의 불일치는 **각 0건**, 리셋 행도 0건이다. 학생 이름·계정 ID는 추출하지 않았다. 운영 기록의 O/X 패턴 19개(고유 17개)만 임시로 읽어 공개 `hs.gfieldacademy.net`의 합성 학생 브라우저에 순서대로 재현하고 즉시 임시 원본 파일을 삭제했다.
- **19/19 패턴**에서 실제 진단 우선 3개 원문이 오답에 속하고, 화면·학습 위치·학습 포인트·인쇄 준비에 각각 승인 유사문제 **9개와 풀이 9개**가 일치했다(총 문제 171개·풀이 171개). `준비 중인 부록` 안내·브라우저 오류·운영 쓰기는 **0**이었다. 기존 최종 3회 통합 QA 5개도 함께 통과했다. [Drive 집계·범위 기록](https://drive.google.com/file/d/1zxdrKtznhsUqTjw1e8yzDc2l3tmtdee5/view), [익명화 브라우저 결과·재실행 코드 ZIP](https://drive.google.com/file/d/1NHCuL6p4SHvbrEDUdJ5V5ZMAYZ9An9MA/view)을 기존 최종 3회 검수 폴더에 보관하고 크기·부모를 재조회했다. Mac 재실행 위치는 `.private-work/last3-operational-pattern-20261019/`이다. **실제 학생/관리자 로그인, 운영 계정에서 ZIP 저장, 실물 종이 가독성은 여전히 미검수**이며, 서비스 코드·승인 문제은행·채점·학생 기록을 변경하지 않았다.

## 2026-10-19 중급 8회 30번 강의 영상 직접 대조 (Mac, 최신)

- 사용자 제공 Drive 중급 자료 폴더의 [영상 링크 HTML](https://drive.google.com/file/d/13WYeBp-drizQYLb44RUwYOuFHVPQaMUZ/view)에서 [중급 8회 원강의](https://www.youtube.com/watch?v=UR28dko8N6c)를 확인했다. [29:55부터의 30번 구간](https://www.youtube.com/watch?v=UR28dko8N6c&t=1795s)을 직접 재생해 원본 정육면체 13개 그림과 교사의 방향별 계수·붉은 필기를 대조했다. 영상은 최종 합계 식이 완성되기 전에 끝나므로 답안 PDF의 120개와 계수 과정의 연결을 새로 확증하지 못했다. 자동 자막의 수학 숫자는 오인식이 많아 판정 근거에서 제외했다.
- **사용자 확정 원본 답 120개와 공개 승인 문제은행·채점은 그대로 유지**한다. 30번의 기존 보류 21축, 전체 191축 보류·9축 최종 승인 0도 변화가 없다. [Drive 강의 대조 기록](https://drive.google.com/file/d/1e8jYd1_IHgu53gPWAaq0FkJHB21hk4tR/view)은 영상 구간·관찰·판정 경계를 담고, Mac 원본 기록은 `.private-work/middle8-20261018/q30-lecture-video-evidence-20261019.md`다. 다음은 원본 입체의 숨은 결합 관계 또는 완결된 교사 계산의 추가 근거가 확보될 때 검토하고, 실물 종이·학생 풀이 난도 판정은 별도로 진행한다.

## 2026-10-19 중급 8회 공개 메인·추가 모의고사 승인/서재 연결 재검수 (Mac, 최신)

- 공개 `https://hs.gfieldacademy.net`의 `index.html`, `index-enhancements.js`, 보호 대상 `data.js`, 중급 8회 어댑터와 승인 JSON **5개 파일**을 현재 메인과 바이트 단위로 비교해 모두 일치했다. 공개 정적 파일을 합성 학생에게만 보이게 한 은행 브라우저 검사에서 승인 **90문항**, `editorial`/`compact` 두 인쇄 배치, 개인연습 **10·20·30문항**, 그림·답안 잘림 없음, 운영 쓰기 **0**을 재확인했다. 로컬 은행·서재 승인 정적 검사도 통과했다.
- 공개 학생·관리자 화면을 합성 계정으로 실행한 추가 모의고사 승인 검사는 **26개 시나리오**가 통과했다. 중급 8회 관련 **12개** 시나리오에서 승인/전체공개일 때 학생 서재와 로드맵에 표시되고, 폴더만 승인하거나 회차 미승인·키 누락일 때 숨겨지는지 확인했다. 관리자에는 중급 8회 독립 승인 행이 있으며 1280/390px 화면에서 승인표와 서재 체크가 연동된다. 실제 외부 쓰기는 **0**이다. 이 검사는 실제 계정 로그인·운영 성적 접근 증거가 아니다.
- [Drive 공개 메인·연결 판정 JSON](https://drive.google.com/file/d/1TF6IQ50erACFKiI-0Mf_W81ihsoqxBVO/view), [브라우저 결과·PDF·화면 근거 ZIP](https://drive.google.com/file/d/1uISaS8mwmvTW9N9bPm5eOSOGsLh07IoB/view)을 기존 중급 8회 검수 폴더에 저장하고 파일 크기·부모를 재조회했다. Mac 위치는 `.private-work/middle8-20261019-live-parity/`다. 승인 문항·보호 데이터·채점·학생 기록은 변경하지 않았다. 원문 동등성 **191축 보류**, 9축 최종 승인 **0**, 실물 종이·실제 학생/관리자 로그인 검수는 그대로 남는다. Chrome에 학생·관리자 로그인 탭을 다시 열었지만 두 화면 모두 인증 전이다. 제작 기준본 Drive 검색을 이름·키워드로 넓혔으나 Mac 전달본 외 원본 ID는 확인되지 않았다.

## 2026-10-19 중급 8회 26번 답 자릿수 경계·공개 인쇄 재검수 (Mac, 최신)

- 원본 문제 PDF **5쪽 26번**의 지문과 실제 분리된 성냥개비 삼각형 그림을 다시 열었다. 아래 가로줄 **25개**에서 `3×(1＋…＋25)=975개`다. 현행 승인 유사문제 **76·77·78번**은 공개 `compact` PDF의 **24·25·26쪽에 각각 따로** 실려 있고, Apple Vision `.accurate`가 아래줄 **23·27·29개**를 읽었다. 독립 계산은 **828·1134·1305개**로 저장 답과 일치한다.
- 식 `3n(n＋1)/2`를 `n=1…100`에서 전수 계산하면 답이 세 자리인 정수 범위는 **n=8…25**다. 원문 25는 세 자리 마지막 값 **975**, 26부터는 네 자리 **1053**이므로 현행 2·3번의 네 자리 결과는 계산 부담의 실제 차이다. 기존 `calculationLoad` **2축 보류**를 유지한다. 세 변형의 인쇄 쪽이 분리된 점도 확인했지만 실물 종이 가독성·학생 체감 난도·9축 최종 승인은 판단하지 않았다.
- [Drive 계산·쪽별 OCR 기록](https://drive.google.com/file/d/1bBjHrm62b-SvSQGi-Rhzxz-rWOsKG9NH/view), [원본·공개 3쪽·Apple Vision 근거 ZIP](https://drive.google.com/file/d/1TVvYp2tMsX_7GQdnJ_NaqtM-57xzcGO5/view)을 기존 중급 8회 검수 폴더에 저장하고 파일 크기·부모를 재조회했다. Mac 경로는 `.private-work/middle8-20261018/q26-digit-boundary-20261019/`다. 승인 90문항·그림·답·채점·학생 기록과 현재 보류표 **191축·64문항·25개 원문**, 문제은행 SHA-256 `89be2de73d408d3e16731a42ec7b7176417a627b071c7fe1357e6a14f878320c`는 변경하지 않았다. 다음에는 교사가 네 자리 결과의 체감 부담을 판정하고 실물 인쇄를 확인한다.

## 2026-10-19 Mac 실제 로그인 검수 대기 (Mac, 최신)

- Mac 화면 잠금이 풀려 Chrome의 공개 학생·관리자 탭을 직접 열었다. 학생은 이름 입력 전, 관리자는 인증 전 화면으로서 **실제 계정 로그인 세션이 없다**. 비밀번호를 수집하거나 운영 학생·성적에 쓰지 않았다. 실제 학생/관리자 권한 및 운영 성적의 최종 3회 연결 검수는 계정 소유자가 직접 로그인한 뒤 읽기 전용으로 진행한다. 앞선 합성 성적·관리자 ZIP·Apple Vision 검수와 PC 등록 상한 해제의 운영 코드/DB 판정은 아래 기록대로 유지한다.

## 2026-10-19 최종 3회 운영 파일·관리자 ZIP·PC 등록 상한 재확인 (Mac, 최신)

- 공개 `hs.gfieldacademy.net`의 `final.html`, `final-summary-practice-print.js`, `admin-final-batch.js`, 최종 3회 승인 90문항 JSON·어댑터 **5개 파일**이 현재 메인과 바이트 단위로 일치한다. 현재 메인에서 최종 3회 은행·어댑터, 학생 진단/권장 학습 연결, 관리자 최종 1~4회 일괄 저장 QA를 다시 실행해 모두 통과했다. 합성 성적의 최종 3회 단독 ZIP에는 **유사문제9개·풀이9개**, `준비 중인 부록` 안내 **0**이고, 최종 3·4회 혼합 ZIP의 안내는 4회만 가리킨다. 이번 QA의 외부 쓰기 **0**이다.
- 새로 받은 최종 3회 관리자 ZIP의 PDF는 **A4 8쪽**이다. 4쪽의 원문 28·29·30번 권장 학습 위치·학습 포인트 3행, 5~6쪽의 **2단 문제 1~9번**, 7~8쪽의 **풀이 1~9번**을 렌더·육안·Apple Vision으로 확인했다. 문제 번호 좌표는 왼쪽 단 1~3/7~8, 오른쪽 단 4~6/9의 배치와 일치한다. [Drive 운영·PC 제한 판정 JSON](https://drive.google.com/file/d/1fx-FV54XbGAY65u_LW4jlbhQNMHiDGTi/view), [실제 ZIP/PDF·렌더·Apple Vision 근거 ZIP](https://drive.google.com/file/d/1DT0UUgxzduUsh-rjbcepetf7ANuQBUb8/view)을 기존 최종 3회 검수 폴더에 저장하고 크기·부모를 재조회했다. Mac 위치는 `.private-work/live-fidelity-20261019/`이다.
- 이전 **PC 3대 제한 해제**도 운영 상태로 확인했다. Supabase `hs-parent-auth` 활성 **v7**의 `saveDevice`에 등록 대수 상한이 없고 `hs_student_devices` 현재 제약·비내부 트리거에도 3대 상한이 없다. 운영 관리자 함수 `deviceLimit:null` 및 공개 화면의 ‘등록 브라우저 수에는 제한이 없습니다’ 문구가 일치한다. 이메일/PIN·학생 권한은 유지한다. 실제 새 기기 등록·학생/관리자 로그인·운영 성적·실물 종이 검수는 이번 읽기 전용 합성 QA에 포함하지 않았다. Mac이 잠겨 있어 UI 로그인 세션은 확인하지 못했고, 서비스 코드·문제은행·채점·학생 기록은 변경하지 않았다.

## 2026-10-19 중급 8회 19번 1번 변형 계산 부담 임시 일치 (Mac, 최신)

- 원본 문제 PDF **4쪽 19번**·교사 답안 PDF **21쪽**·현행 공개 `compact` PDF **17쪽 55~57번**을 직접 대조했다. Apple Vision이 원문 오른쪽300·왼쪽500과 현행 450·620 / 720·300 / 950·750을 읽었고, 1~999를 이어 쓴 **2889자리**를 별도로 생성해 각 문항의 양쪽 위치를 직접 인덱싱했다. 원문 숫자 **9·0→차9**, 현행 세 변형 **8·4→4 / 7·6→1 / 8·6→2**가 저장 답과 일치한다.
- 교사 경로에서 원문 `300=3×100→900의 백의 자리9`, `500−189=311=3×103＋2→203의 십의 자리0`이고, 1번 변형은 `450=3×150→850의 백의 자리8`, `620−189=431=3×143＋2→243의 십의 자리4`다. 양쪽 나눗셈의 나머지·읽는 자리와 몫 자릿수·계산 단계가 같아 **1번의 `calculationLoad` 1축만 보류에서 임시 일치**로 옮겼다. 이는 학생 실측·9축 최종 승인 판정이 아니다. 2·3번은 읽는 자리와 나머지가 달라 계산 부담 보류를 유지하고, 숫자띠의 실제 종이 가독성 `visualCue` **3축**도 보류한다.
- 현행 승인 1번 해설은 전체2889자리에서 오른쪽 위치를 왼쪽 위치로 바꾸는 더 긴 올바른 경로다. 원문 교사 경로에 맞춘 짧은 해설 문장은 **비공개 검토 후보**로만 작성하고 승인 해설·문항·그림·답·채점·학생 기록은 변경하지 않았다. [Drive 직접 대조·계산 JSON](https://drive.google.com/file/d/1LGdlDfZoj-bmaNYBmPLPqTElm0P2v3L5/view), [원본·답안·현행 출력·Apple Vision·재현 코드 ZIP](https://drive.google.com/file/d/1Zu4E-l4ZWI9LubnDe76th1iTGsYdvGwb/view), [최신 25개 원문 보류 검토표 JSON](https://drive.google.com/file/d/1RCtEpRnAbYUBzw2ZtZZl3BjogVPh97in/view)의 크기·부모를 확인했다. Mac 위치는 `.private-work/middle8-20261018/q19-v1-calculation-20261019/`다. 전체 **191축·64문항·25개 원문 보류**, **619축 잠정 대조**, 9축 최종 승인 **0**이며 문제은행 SHA-256 `89be2de73d408d3e16731a42ec7b7176417a627b071c7fe1357e6a14f878320c`는 그대로다. 다음에는 1번 해설 경로와 2·3번의 계산 부담을 교사가 판정하고 실물 인쇄를 확인한다.

## 2026-10-19 중급 8회 29번 최장 길이·문항 간 지름길 직접 대조 (Mac, 최신)

- 원본 문제 PDF **6쪽 29번**의 90과 교사 답안 PDF **32쪽**의 답 **2**를 직접 열었다. 현행 공개 `compact` 문제지 PDF **30쪽 85~87번**은 한 페이지에 승인 유사문제 **99·102·104**를 연속 배치한다. 원문·현행 인쇄 수치를 Apple Vision OCR과 화면으로 대조하고, 모든 연속 자연수 표현을 별도로 열거했다. 원문은 `2+…+13=90`으로 가능한 최장 **12개**가 바로 성립한다. 현행 저장 답 **4·3·2**도 각각 `4+…+14=99`(11개), `3+…+14=102`(12개), `2+…+14=104`(13개)로 정확하다.
- 최소합 경계에서 세 변형 모두 13개까지는 후보지만, 99는 13·12개, 102는 13개를 추가 배제해야 한다. 기존 1·2번의 `caseSplit·calculationLoad` **4축 보류**를 유지한다. 또 세 변형이 끝수 **14**를 공유하므로 앞의 표현에 처음 수 **3 또는 2**를 더하거나 빼 다음 후보 표현을 얻을 수 있다. 이는 표현 찾기를 줄이는 문항 간 지름길이며, 99·102의 최장성 증명까지 생략되는 것은 아니다. 같은 장 인쇄 계약에서 세 문항의 `accidentalShortcut` **3축을 새로 보류**한다.
- [Drive 직접 검산·원문/답안/인쇄 대조 JSON](https://drive.google.com/file/d/1lN-UOI30aRE8FmF75ZN2JdoUNYoFcUIE/view), [원본·교사 답안·현행 인쇄·Apple Vision·재현 코드 ZIP](https://drive.google.com/file/d/1_HSsFxDfv0oPTqAb0PpbQEoPlxhDe5DB/view), [최신 25개 원문 보류 검토표 JSON](https://drive.google.com/file/d/1dqnNpCOaYhJjOX1HjYC0YF9AYKU9dsmG/view)을 기존 중급 8회 검수 폴더에 저장하고 파일 크기·부모 폴더를 재조회했다. Mac 위치는 `.private-work/middle8-20261018/q29-boundary-shortcut-20261019/`다. 현재 **192축·64문항·25개 원문 보류**, **618축 잠정 대조**, 9축 최종 승인 **0**이다. 사용자 승인 90문항·그림·답·채점·학생 기록과 문제은행 SHA-256 `89be2de73d408d3e16731a42ec7b7176417a627b071c7fe1357e6a14f878320c`는 변경하지 않았다. 다음에는 29번의 추가 배제 부담과 같은 쪽 문항 간 전이를 교사가 판정하고, 실물 종이와 학생 풀이를 확인한다.

## 2026-10-19 중급 8회 6번 원문형 숫자 치환 가용성 전수 판정 (Mac, 최신)

- 원본 문제 PDF **1쪽 6번**의 실제 복면산 `가다나＋나가다＝8가가`와 교사 답안 PDF **7쪽**의 `가=3·나=4·다=9 → 16`을 직접 열었다. 현행 공개 은행 그림 세 개도 바이트 해시와 화면으로 확인했다. 서로 다른 가·나·다, 선행 0 제외의 **576조합**을 전수 계산하고 자리올림으로 별도 증명하면, 원문과 정확히 같은 세 자리 틀 `가다나＋나가다＝h가가`에서 가능한 `h`는 **4·6·8**뿐이다. 4·6은 현행 승인 유사문제 1·2(`192＋219＝411`, `293＋329＝622`)이고 8은 원문 자체(`394＋439＝833`)다. 따라서 **주어진 백의 자리 숫자만 바꿔 원문과 다른 세 번째 독립 유사문제를 만들 수 없다.** 현행 승인 3번은 `가나다＋가다나＝9나가`, `459＋495＝954`로 저장 답 **18**이 유일하지만 자리 계약을 바꾼 별도 구조다. Apple Vision은 원문 번호·물음을 읽었으나 교사 필기 식 일부를 오독해 실제 렌더링과 전수 계산으로 판정했다.
- [Drive 전수·자리올림 판정 JSON](https://drive.google.com/file/d/1vWj3JWYA_f1wrA7CYPJVtFln3Rgv4VGY/view), [원본/답안 화면·현행 그림·OCR·재실행 코드 ZIP](https://drive.google.com/file/d/1ZMYk6O0MptEYzPYDxFdlNHi2XzYq4Yy_/view), [최신 25개 원문 보류 검토표 JSON](https://drive.google.com/file/d/18SJZyyxVZXJ79QQS6van19E-uzc0K2by/view)을 기존 중급 8회 검수 폴더에 저장하고 크기·부모를 재조회했다. Mac 위치는 `.private-work/middle8-20261018/q06-template-exhaustion-20261019/`이다. 3번의 `accidentalShortcut·reasoningSteps·representationChange` **3축 보류**와 전체 **189축·63문항·25개 원문 보류, 9축 최종 승인 0**을 유지한다. 현행 사용자 승인 90문항·그림·답·채점·학생 기록, 문제은행 SHA-256 `89be2de73d408d3e16731a42ec7b7176417a627b071c7fe1357e6a14f878320c`는 변경하지 않았다. 다음 교사 판단은 3번을 별도 구조형으로 둘지, 원문 동등형 세 번째를 새 자리 구조로 설계해 9축 전체를 다시 검수할지다.

## 2026-10-19 최종 3회 30개 원문 전수 PDF·Apple Vision 출력 검수 (Mac, 최신)

- 공개 정적 사이트의 합성 성적 10조합(원문 1~30번을 세 문항씩 오답)에서 진단 PDF **10개·A4 합계 88쪽**을 실제 생성했다. 각 PDF는 우선 복습 원문 3개에 연결된 유사문제 **9개와 답안 9개**를 포함한다. PDF 내부 구조를 다시 열어 문제 쪽 **21**, 답안 쪽 **20**, 홀수 쪽 답안 시작을 위한 양면용 빈 면 **4**의 위치를 검사했다. 인쇄 영상 41쪽을 150dpi로 렌더하고 Apple Vision `.accurate`가 10개 PDF마다 문제 번호 1~9와 답안 번호 1~9를 읽어 각각 **90/90** 확인했다. 모든 문제 쪽에서 좌·우 **2단** 번호 좌표를 확인했고, 긴 22~24번 조합과 그림·장문 조합의 대표 쪽을 확대해 잘림 없이 확인했다. 현재 문제 쪽 번호 읽기 순서는 **왼쪽 단 위→아래, 다음 오른쪽 단 위→아래**다. 공개 브라우저 QA **6/6**, 브라우저 오류·운영 쓰기 **0**이었다.
- [Drive PDF 전수 검수 요약 JSON](https://drive.google.com/file/d/15pFFyoOBfwbqdIXQpzFTkb56Ch5ynO8b/view), [PDF 10개·쪽별 Apple Vision·재실행 코드 ZIP](https://drive.google.com/file/d/1kVp875NlIKMg6KuiK5rYy9GUv_qU-MqI/view)을 기존 최종 3회 검수 폴더에 저장하고 크기·부모를 재조회했다. Mac 위치는 `.private-work/last3-all30-pdf-20261019/`이다. PDF 번호 OCR은 문항의 수학 정답성 판단이 아니다. 실제 학생·관리자 로그인, 운영 성적, 실물 종이의 가독성은 아직 별도 검수 대상이며 서비스 코드·승인 문제은행·학생 성적은 변경하지 않았다.

## 2026-10-19 최종 3회 공개 진단 30개 원문 연결 전수 점검 (Mac, 최신)

- 공개 `https://hs.gfieldacademy.net`의 학생 성적표를 **합성 성적만** 주입해 원문 1~30번을 3개씩 틀린 **10가지 조합**으로 실행했다. 매 조합에서 우선 복습 3개 원문과 각 원문에 연결된 승인 유사문제 3개, 문제 지문, 권장 학습 위치·학습 포인트 3행을 확인했다. 화면의 9문제와 인쇄 준비 결과의 9문제·9답이 각각 10/10조합에서 일치했다. 즉 30개 원문 전부와 유사문제 표시 **90건**, 답안 표시 **90건**, 학습 연결 **30행**을 확인했다. 인쇄 준비 DOM은 문제 21쪽·풀이 20쪽이며 앞면 시작을 맞추는 양면용 빈 면 4쪽이 정상 삽입됐다. `준비 중인 부록` 문구와 브라우저 오류·운영 쓰기는 0이었다. 추가 기존 공개 QA 5개까지 합쳐 **6/6 통과**했다.
- [Drive 검수 요약 JSON](https://drive.google.com/file/d/1F3Y-Rh9wugNFnTX4-dW0CU9YOHhkZ_Xz/view), [10조합 결과·화면·재실행 코드 ZIP](https://drive.google.com/file/d/1Vpq_QXnMqmZo_B20a9x6X8TW5pG6dbb1/view)을 기존 최종 3회 검수 폴더에 저장하고 크기·부모를 재조회했다. Mac 재실행 위치는 `.private-work/last3-all30-matrix-20261019/`다. 기존 추적 QA는 런타임에만 확장했고 서비스 코드·승인 문제은행·학생 성적은 변경하지 않았다. 앞선 12·15·28번 공개 PDF 및 관리자 2단 ZIP·Apple Vision 검수 기록은 아래 항목에 있다. 이번 전수 검사는 인쇄 준비 DOM까지이며 **실제 학생·관리자 로그인, 운영 성적, 실물 종이 출력**은 여전히 별도 검수 대상이다.

## 2026-10-19 중급 8회 28번 현행 세 문항 읽기 부담 보류 3축 해소 (Mac, 최신)

- 원본 문제 PDF 5쪽 **28번**의 지문·`15개` 표식 두 곳과 교사 답안 31쪽, 현행 공개 `compact` PDF 30쪽 **82~84번**의 지문·`12개·18개·21개` 표식 각 두 곳을 직접 대조했다. Apple Vision `.accurate`도 네 두 자리 수+`개` 표식을 각 두 번 읽었다. 원문과 세 승인 변형은 모두 곱셈 결과의 **각 자리 숫자의 합**을 묻는 한 문장이고, 원문 `다음을 계산한 값`을 변형에서 `다음 곱셈의 계산 결과`로 다듬은 것 외에 새 독해 조건·대상·용어는 없다. 큰 정수 제곱의 자릿수 합을 별도로 계산해 원문 **135**, 변형 **108·162·189**가 저장 답과 일치함을 확인했다.
- 현행 세 문항의 `readingLoad` **3축만** `보류`에서 **임시 일치**로 옮겼다. 이는 문장·두 자리 개수 표기의 읽기 부담에 한정한다. `15개/12개/18개/21개`가 숫자 **9의 개수**인지 `99` 덩어리 수인지 종이에서 정확히 읽히는지에 관한 `visualCue` **3축**은 보류다. 1번의 `9×11`이 원문 `9×14`보다 쉬운지, 3번의 `9×20`이 계산 부담을 낮추는지에 관한 `calculationLoad` **2축**도 보류한다. 실제 학생 난도·실물 인쇄·9축 최종 승인으로 확대하지 않았다.
- [Drive 문장·Apple Vision·검산 JSON](https://drive.google.com/file/d/1460_hSPO_oQ-9FATuU8tEDf2Mi1AbhDl/view), [원문/현행 출력·OCR·재현 코드 ZIP](https://drive.google.com/file/d/1QKWtfnIcgIsiu0VZ7Ts0m1D4IdpAGvDk/view), [최신 25개 원문 검토표 JSON](https://drive.google.com/file/d/10_wUsexq73uc3nhX6pI0req7gztfj8Hp/view), [검토표 CSV](https://drive.google.com/file/d/17DxTdcLEUJKcL3_sXTiVkDV6T1xEAkPm/view), [검토표 재생성 ZIP](https://drive.google.com/file/d/1wDPQZlnStJY1j3mlsR9BzSpZv7Z2b5Ot/view)을 기존 중급 8회 검수 폴더에 저장하고 크기·부모를 재조회했다. 최신 검토표는 **189축·63문항·25개 원문 보류**, 임시 일치 **621축**, 9축 최종 승인 **0**이다. Mac 위치는 `.private-work/middle8-20261018/q28-v1-calculation-20261019/`이며 승인 90문항·그림·답·채점·학생 기록과 문제은행 SHA-256 `89be2de73d408d3e16731a42ec7b7176417a627b071c7fe1357e6a14f878320c`는 변경하지 않았다.

## 2026-10-19 중급 8회 11번 계산 부담 대응 비공개 교체 후보 2개 (Mac, 최신)

- 원본 문제 PDF 2쪽 **11번**과 교사 강의 답안 13쪽, 현행 공개 `compact` PDF 8쪽 31~33번을 직접 열었다. 원본 교사 풀이 `690÷3=230`, `230×7=1610`, `1610+425=2035`의 답은 **2kg 35g**이다. 현행 승인 유사문제 2·3의 저장 답 **2kg 210g·1kg 855g**도 맞지만, 2번의 `800÷4=200`은 특수한 200g 단위로 계산이 쉬워지고 3번의 `875÷5=175`, `175×8=1400`은 원문과 자릿수 부담이 다르다. 기존 11번 보류 **3축**, 전체 **192축**을 유지한다.
- 승인 문항을 바꾸지 않고 비공개 후보 2를 `7/9 대 3/9`, 차 **880g**, 빈 통 **405g**으로 만들었다. `880÷4=220`, `220×9=1980`, `1980+405=2385`로 답 **2kg 385g**이다. 비공개 후보 3은 `5/8 대 2/8`, 차 **990g**, 빈 통 **415g**이다. `990÷3=330`, `330×8=2640`, `2640+415=3055`로 답 **3kg 55g**이다. 높은/낮은 채움 상태의 실제 통 무게를 각각 따로 계산해 차 **880g·990g**을 재확인하고, 물 전체 1~5000g 전수에서 각 정수해가 하나임을 확인했다. 원문·두 후보는 교사 풀이 경로의 세 자리 나눗셈 중간 나머지 **0회**, 곱셈 받아올림 **2회**, 마지막 덧셈 받아올림 **1회**다. 이 수치 일치는 계산 한 경로의 근거이며 9축 동등성·학생 체감 난도 확정이 아니다.
- 비공개 A4 비교 PDF는 **1쪽 2단×3행 원문/현행 2·3/후보 2·3**, 2쪽 양면용 빈 면, 3쪽 답안이다. 180dpi 렌더링의 지문·답을 화면으로 확인했고 Apple Vision `.accurate`가 후보 `880g·990g`, 답 `2kg 385g·3kg 55g`, 물 전체 `1980g·2640g`을 읽었다. 일부 수학 기호 OCR 오독은 화면·PDF 텍스트와 대조했다. [Drive 비공개 비교 PDF](https://drive.google.com/file/d/1vN3mHOFq7x1-3vTiT26gcV8Js4_-oteC/view), [교사용 검수 요약](https://drive.google.com/file/d/1SuwDNkEIERROog7BIPEbotC7JzQV5zmD/view), [계산·전수 JSON](https://drive.google.com/file/d/12DiyGlasATGsXpY0C0m-QmProp4nJLyl/view), [원본/현행 출력·OCR·재현 코드 ZIP](https://drive.google.com/file/d/14tufQ31b2VpUeHo9NXbHMP5herBEssiS/view)을 기존 중급 8회 검수 폴더에 저장하고 크기·부모를 재조회했다. Mac 위치는 `.private-work/middle8-20261018/q11-candidates-20261019/`이다. 후보는 답이 바뀌므로 **승인·공개·채점 연결 0**이다. 교사 9축·실물 인쇄 판단 전에는 기존 승인 문항, 문제은행 SHA-256 `89be2de73d408d3e16731a42ec7b7176417a627b071c7fe1357e6a14f878320c`, 학생 기록을 유지한다.

## 2026-10-19 중급 8회 5번 계산 부담 대응 비공개 3문항 후보 (Mac, 최신)

- 원본 PDF 1쪽 **5번** 막대 그림·지문과 교사 답안 6쪽, 현행 공개 `compact` PDF 4쪽 13~15번을 직접 대조했다. 원문은 `가137·나98·다=137+49=186`, 세 막대 합421, 전체363이므로 겹침 두 곳은 각각 **29cm**다. 현행 승인 답 **32·27·34cm**도 맞지만 강의와 같은 `다 계산→가+나→다 더함→전체 빼기→2로 나누기` 경로의 자리올림/받아내림/나눗셈 중간 나머지는 원문 **5/2/1**, 현행 세 변형은 **3/2/0·3/1/1·1/2/0**이다.
- 승인 문항을 건드리지 않고 세 비공개 후보의 수치를 탐색했다. 1번 `가148·나99·추가46·전체369→36cm`, 2번 `129·97·58·359→27cm`, 3번 `158·98·39·377→38cm`이며, 각 후보의 같은 세 지표가 **5/2/1**이다. 원본 막대 그림 바이트를 그대로 사용하고 겹침 길이를 1cm부터 가장 짧은 막대 직전까지 각각 전수 대입해 단일 답을 확인했다. 1·3번은 현행 승인 답이 바뀌므로 후보 승인·원문 난도 9축·실물 종이 판단 전에는 공개 연결하지 않는다. 이는 한 풀이 경로의 계산 횟수 일치이며 학생 체감 난도 확정은 아니다.
- 비공개 A4 **2단×2행** 비교 PDF는 1쪽 원문+후보3, 2쪽 양면용 빈 면, 3쪽 정답이다. 180dpi 렌더링의 지문·그림·답을 직접 확인했고 Apple Vision `.accurate`가 후보의 네 수치와 답 **36·27·38cm**를 읽었다. [Drive 비공개 PDF](https://drive.google.com/file/d/1mkTz50JyxE-kRHR2rjwClE525QlwsyrO/view), [교사용 요약](https://drive.google.com/file/d/15ysRFGltA3t6qo0w7jLmbhDWW7JwX9s3/view), [독립 계산·OCR JSON](https://drive.google.com/file/d/1GnvsmWifIkgZnoNMHrg64-tVSekarQPl/view), [원본/현행 출력·그림·OCR·재현 코드 ZIP](https://drive.google.com/file/d/1qJlqCc00NblwkM3t4-bm09TznNrV34cv/view)을 기존 중급 8회 검수 폴더에 저장하고 크기·부모를 재조회했다. Mac 위치는 `.private-work/middle8-20261018/q05-candidates-20261019/`이다. 현행 **192축 보류**와 문제은행 SHA-256 `89be2de73d408d3e16731a42ec7b7176417a627b071c7fe1357e6a14f878320c`는 그대로다.

## 2026-10-19 중급 8회 23번 3번 유사문제 계산 범위 대응 비공개 후보 (Mac, 최신)

- 원본 PDF 4쪽 **23번**의 홀수 괄호 수열 그림·지문과 강의 답안 캡처 26쪽, 현행 공개 2단 문제지 22쪽 67~69번을 직접 대조했다. 원문 `121`은 **61번째 홀수→앞 10묶음 55개→11번째 괄호 6번째**, 현행 승인 3번 `161`은 **81번째→앞 12묶음 78개→13번째 괄호 3번째**로 각각 저장 답이 맞다. 원문보다 두 묶음 뒤까지 계산하는 현행 3번의 `calculationLoad` 보류는 유지한다.
- 사용자 승인 문항을 보존하고 비공개 교체 후보 `123 → 62번째 홀수 → 11번째 괄호 7번째`를 만들었다. 홀수를 1·2·3·…개씩 실제 나열하는 탐색과 삼각수 누적합 `55<62≤66`을 독립 검산했다. 원문·후보는 모두 앞 10묶음 55개를 빼고 같은 자리수의 계산을 한다. 문제에는 원본 필수 수열 그림의 바이트를 그대로 사용했다. 후보는 답이 현행 3번과 달라 **승인·공개·문제은행 연결 0**이며, 다른 9축·실물 종이·학생 난도 판정도 남는다.
- 비공개 A4 2단 비교 PDF는 **1쪽 원문/후보**, **2쪽 양면용 빈 면**, **3쪽 답안**이다. 처음 한글 글꼴이 보이지 않던 시안을 폐기하고 AppleGothic으로 재생성했다. 180dpi 렌더링에서 지문·그림·답을 직접 확인했고 Apple Vision `.accurate`가 후보 `123`과 `11번째·7번째`를 읽었다. [Drive 비공개 비교 PDF](https://drive.google.com/file/d/1IYhtOFe47O-ClvjYFy_KKUIj81jdENi7/view), [교사용 요약](https://drive.google.com/file/d/1kqRwk9MowQUO2YN9OGCpl8-rjXWgTORg/view), [독립 계산·OCR JSON](https://drive.google.com/file/d/16lXW91OU8wz7L5TRaNVHP_6JiIvasqE3/view), [원본/현행 출력·그림·OCR·코드 ZIP](https://drive.google.com/file/d/1cKJOBlb98zrvYIqY8yb2dWqUyZ5LjLYY/view)을 기존 중급 8회 검수 폴더에 저장하고 크기·부모를 재조회했다. Mac 위치는 `.private-work/middle8-20261018/q23-candidate-20261019/`이다. 현행 **192축 보류**, 문제은행 SHA-256 `89be2de73d408d3e16731a42ec7b7176417a627b071c7fe1357e6a14f878320c`는 그대로다.

## 2026-10-19 중급 8회 2번 같은 답 10개 구조 경계 (Mac, 최신)

- 원본 PDF 1쪽 **2번**과 현행 공개 2단 문제지 2쪽의 승인 유사문제 1~3을 직접 대조했다. 원문은 `두 자리 수 전체 ÷9 나머지3`, 변형은 나머지 `4·5·6`을 각각 묻고 저장 답이 모두 **10개**다. Apple Vision 원문/현행 출력 OCR로 숫자·문구를 재확인하고 `10~99`를 나머지 `0~8`별로 전수 분류했다. 90개의 연속된 수에는 나머지별 정확히 **10개**가 있으므로 원문 조건(두 자리 수 전체·제수9·개수 질문)을 지키는 한 나머지만 바꾸어 답을 다양화하는 것은 불가능하다. 답 오류는 아니다.
- 세 문항을 한 장에서 함께 풀면 앞 답을 그대로 옮길 수 있다는 `accidentalShortcut` **3축은 보류 유지**다. 원문 한 문항에도 `90÷9` 경로가 있으나 세 변형 간 복사 위험은 별개다. 답을 다양화하려면 수 범위 또는 제수를 바꾸고 원문 동등성·9축을 새로 검수하거나, 배치 분리를 검토해야 한다. 어느 쪽도 승인 없이 적용하지 않았다. [Drive 교사용 구조 설명](https://drive.google.com/file/d/1_4BtQkt6BPC_Mrr8PKdyXrL4wk2Q7H-C/view), [나머지 9류 전수표 JSON](https://drive.google.com/file/d/1iZfEnNX3b5oCKaXgoz84IJWzsk7g77FQ/view), [원본/현행 쪽·Apple Vision·재현 코드 ZIP](https://drive.google.com/file/d/17t2be2YhxHBqOhR7XV6a2vGQmH7_jTUs/view)을 기존 검수 폴더에 저장하고 크기·부모를 재조회했다. Mac 위치는 `.private-work/middle8-20261018/q02-remainder-20261019/`이다. 전체 **192축 보류**와 문제은행 SHA-256 `89be2de73d408d3e16731a42ec7b7176417a627b071c7fe1357e6a14f878320c`는 그대로다.

## 2026-10-19 중급 8회 1번 비교 방향 보류 근거·비공개 후보 (Mac, 최신)

- 원본 PDF 1쪽 **1번**과 현행 공개 2단 문제지 2쪽의 **원문 1번 유사문제 1~3**을 직접 열었다. 원문은 천·백의 자리 `3·5`, 나머지 두 자리를 바꾸면 **45 큰 수**, 답 `3505·3516·3527·3538·3549`다. 현행 승인 **2번**은 천·백의 자리 `6·2`, 바꾸면 **45 작은 수**, 저장 답 `6250·6261·6272·6283·6294`다. 원본 교사 필기와 Apple Vision 원문/현행 출력 OCR로 문구를 대조했고, 십·일의 자리 0~9 **100조합**을 각각 전수 검사해 두 답 모두 맞음을 확인했다. `바꾼 수−처음 수=9×(일의 자리−십의 자리)`이므로 두 풀이의 경우 수는 같지만, 어린 학생의 비교어·부호 방향 부담이 같은지는 실측/교사 판단 전이다.
- 원문과 같은 **45 큰 수** 조건을 쓰는 2번의 비공개 교체 후보는 `6205·6216·6227·6238·6249`가 유일한 다섯 답이다. 다만 이를 쓰면 세 승인 변형 모두 같은 핵심 숫자 관계를 사용해 문항 간 변별성 검토가 필요하다. 후보는 승인·공개·문제은행 연결하지 않았고, 현행 2번의 `conditionTracking·readingLoad·reasoningSteps` **3축 보류**, 전체 **192축 보류**와 문제은행 SHA-256 `89be2de73d408d3e16731a42ec7b7176417a627b071c7fe1357e6a14f878320c`를 유지한다.
- [Drive 교사용 비교](https://drive.google.com/file/d/1y7FlnICNZpF7cmfp2ETTKsBXHqEc2lw3/view), [100조합 계산·Apple Vision 해시 JSON](https://drive.google.com/file/d/1TnajZGlmIRvddAzeQQCvzAK9zoQ-8cLT/view), [원문·현행 출력 쪽·OCR·재생성 코드 ZIP](https://drive.google.com/file/d/14ZGRN66WCBX34Q746jc3AmkQUwJgXhgb/view)을 기존 중급 8회 검수 폴더에 저장하고 크기·부모 폴더를 재조회했다. Mac 위치는 `.private-work/middle8-20261018/q01-direction-20261019/`이다.

## 2026-10-19 최종 3회 공개 진단·관리자 ZIP 재확인 (Mac, 최신)

- 공개 `https://hs.gfieldacademy.net` 정적 자산을 운영 쓰기 없는 합성 학생·관리자 기록으로 다시 실행했다. 학생 화면 5개 시나리오가 모두 통과했고, 오답 0·1·2·11개에서 유사문제 0·3·6·9개, 권장 학습 위치·학습 포인트 연결, 12·15·28번 우선 복습 문제 9개와 풀이 9개를 재확인했다. 학생 인쇄 PDF는 A4 10쪽이다. 운영 쓰기·브라우저 오류는 0이다.
- 관리자 `ZIP 한 개로 받기`를 실제 실행해 최종 3회 단독 ZIP의 A4 8쪽 PDF를 다시 열었다. 4쪽에 권장 학습 위치·학습 포인트, 5~6쪽에 **2단 유사문제 1~9번**, 7~8쪽에 풀이 1~9번이 있다. Apple Vision `.accurate` OCR이 문제·풀이 번호를 각각 **9/9** 읽었고, 5쪽의 좌·우 열 좌표도 확인했다. 최종 3회 단독 ZIP에는 `준비 중인 부록` 안내가 없고, 최종 3·4회 혼합 ZIP에서 그 안내는 4회만 가리킨다. 이는 합성 기록을 사용한 공개 정적 파일 검사이며 실제 학생·교사 계정 권한, 운영 성적, 실물 종이 출력 판정은 남는다.
- [Drive 재검수 요약 JSON](https://drive.google.com/file/d/16D6LIgR-4ZqUl68jjVCkYe1Ps_ptO_1G/view)과 [학생 PDF·관리자 ZIP·Apple Vision 원본값·재실행 코드 ZIP](https://drive.google.com/file/d/1mpZFCoti6wzTD6-IdtrFVIh1XvL1-vwo/view)을 기존 최종 3회 검수 폴더에 보관하고 크기·부모 폴더를 재조회했다. Mac 임시 경로는 `.private-work/last3-public-recheck-20261019/`, `.private-work/last3-admin-zip-recheck-20261019/`이다. 서비스 코드·문항·채점·학생 기록은 변경하지 않았다.

## 2026-10-19 중급 8회 22번 연속수 구조·승인 답의 양립 가능성 확인 (Mac, 최신)

- 원본 문제 PDF 4쪽 22번 네 삼각형과 강의 답안 24쪽을 직접 보았다. 꼭짓점은 `(2,3,4)·(3,4,5)·(6,7,8)·(7,8,9)`로 모두 연속수이고 가운데는 꼭짓점 곱의 일의 자리 `4·0·6·?`, 원본 답은 `504`의 일의 자리 **4**다. Apple Vision은 원본 그림의 작은 숫자 15개 중 일부만 읽어 그림 전사는 직접 화면 대조를 기준으로 삼았다. 현행 승인 3개 그림의 바이트 해시는 이전 공개 검수 기록과 각각 일치하며 저장 답은 **2·8·6**이다.
- 세 연속 자연수 `n(n+1)(n+2)`의 일의 자리는 `n mod 10` 전수표와 10주기 검증상 **0·4·6만 가능**하다. 따라서 현행 1·2번의 답 **2·8**을 유지하면서 목표 세 꼭짓점을 모두 원문처럼 연속수로 바꾸는 일은 불가능하다. 원본의 한 자리 연속수와 예시 곱 자릿수 `2·2·3`, 목표 `3자리`까지 함께 유지하고 원본 목표 `(7,8,9)`를 제외하면 가능한 목표 시작수는 `4·5·6`, 답은 `0·0·6`이다. 세 목표를 모두 다르게 해도 두 답이 중복된다. 이는 조합 가능성의 경계이며 현행 승인 문항의 수학적 답 오류 판정은 아니다.
- [Drive 교사용 요약](https://drive.google.com/file/d/12Mr8oMt_CZ67IPNxdxHutKoTEbFWKmJJ/view), [전수표·현행 그림 해시 JSON](https://drive.google.com/file/d/1uwctzwNrKvuLtmKdVwZvWUmx3aWWh9aq/view), [원본·답안·SVG·재현 코드 ZIP](https://drive.google.com/file/d/1w0TuD7pig94NrRmtKNAsFf_5a2bv3a27/view)을 기존 검수 폴더에 저장하고 크기·부모를 재조회했다. Mac 위치는 `.private-work/middle8-20261018/q22-feasibility-20261019/`이다. 사용자에게 **기존 승인 유지+별도 원문형 / 답 변경 교체 / 현행 유지·보류** 중 방향을 요청했다. 답 전까지 공개 문항·채점·학생 기록과 문제은행 SHA-256 `89be2de73d408d3e16731a42ec7b7176417a627b071c7fe1357e6a14f878320c`는 그대로, 현행 22번 **12축**과 전체 **192축** 보류도 유지한다.

## 2026-10-19 중급 8회 7번 유사문제 1·3 비공개 원문 구조 교체 후보 (Mac, 최신)

- 원본 PDF 2쪽 7번의 지문·실제 한 지름을 따라 놓인 원 그림과 강의 답안 8쪽을 직접 대조했다. 원문은 큰 지름 **56cm**, 작은 원 **7개**, 중심 간격 6개와 양 끝 반지름 2개로 큰 지름이 작은 반지름 **8개**이므로 답 **14cm**다. 현행 사용자 승인 1·3번은 작은 원 **9개**, 큰 지름 **60·80cm**, 답 **12·16cm**이고 10으로 나누는 계산으로 바뀌어 `calculationLoad` **2축 보류**다.
- 승인 문항은 보존하고 비공개 교체 후보만 만들었다. 1번 후보는 **48cm·7개→12cm**, 3번 후보는 **64cm·7개→16cm**다. 답은 기존 승인 답과 같고 원본 7개 원 그림 크롭을 그대로 썼다. 두 후보 모두 원문처럼 큰 지름을 반지름 8개로 나눈다. 식 `D÷(7+1)`과 양의 정수 반지름·7개 중심 좌표의 전수 탐색으로 양 끝 접촉·이웃 중심 통과 및 유일해를 별도 검산했다. 9축은 후보별로 **임시 일치 추정 9/9**이나 이는 새 문항의 교사 승인·실측 난도·최종 9축 통과가 아니다. 특히 `64÷8=8`의 친숙도 차이는 실제 학생 판단 전이다.
- PDF 스킬로 비공개 A4 2단 문제·답안을 만들고 180/300dpi 렌더링을 직접 확인했다. 답안은 양면 인쇄 기준 홀수인 3쪽에서 시작한다. Apple Vision `.accurate`는 문제의 `48·64cm`, 두 `7개`, 답의 `12·16cm`를 읽었다. [Drive 비공개 2단 PDF](https://drive.google.com/file/d/1RjmQoud-Wver32AmD24B-wbo1zBN153A/view), [계산·원본 대조 JSON](https://drive.google.com/file/d/1PQZlq4OaMNv7yuTf8DMf8iUrQ77IS_55/view), [9축 판정 JSON](https://drive.google.com/file/d/19LGY5rpJxnLIch4FN-jALUowmpgx7C54/view), [원본 그림·Apple Vision·재현 코드 ZIP](https://drive.google.com/file/d/1C7w2iiKiWoqDGYlRUxfddr2cbh0LWVoN/view)을 기존 Drive 검수 폴더에 저장하고 크기·부모를 재조회했다. Mac 위치는 `.private-work/middle8-20261018/q07-candidate-20261019/`이다. 새 후보의 교사 승인·공개 연결·실물 종이 합격·9축 최종 승인은 모두 **0**이다. 현행 검토표는 **192축·63문항·25개 원문 보류**, 문제은행 SHA-256 `89be2de73d408d3e16731a42ec7b7176417a627b071c7fe1357e6a14f878320c`로 그대로다.

## 2026-10-19 중급 8회 9·10번 3번 유사문제 원문 계산 부담 대응 비공개 후보 (Mac, 최신)

- 원본 PDF 2쪽 9·10번의 지문과 분수열·순서쌍 그림, 강의 답안 캡처 11·12쪽을 직접 확인했다. 두 원문은 모두 **50번째 = 앞 9묶음 45개 + 10번째 묶음의 5번째**이며, 답은 9번 `5/11`의 분자·분모 합 **16**, 10번 순서쌍 **(5, 6)**이다. 현행 사용자 승인 3번 변형은 각각 74번째·72번째로 더 뒤의 묶음까지 계산하므로 `calculationLoad` 보류를 유지한다.
- 승인 문항을 바꾸지 않고 **비공개 교체 후보**로 9번 `52번째 → 7/11 → 18`, 10번 `53번째 → (8, 3)`을 만들었다. 두 후보 모두 원문 그림 크롭을 그대로 재사용하고 10번째 묶음의 7·8번째만 묻는다. `T9=45` 묶음식과 처음부터 목표 순번까지 전수 나열을 독립 검산했다. 원문과 후보는 모두 `45+한 자리` 받아올림 1회이며, 9번의 `분자+11`은 받아올림이 없고 10번의 `11−앞 수`는 받아내림 1회다. 이는 **계산 경로 후보**의 일치 근거이지 9축 최종 승인·실측 난도 판정이 아니다.
- PDF 스킬로 비공개 A4 2단 문제·답안을 만들고 180/300dpi 렌더링을 확인했다. 답안은 양면 인쇄 기준 홀수인 3쪽에서 시작한다. Apple Vision `.accurate`는 문제의 `52·53번째`와 답 `18·(8, 3)`을 읽었다. 원본 분수 그림의 작은 글자는 OCR이 불안정해 화면으로 직접 대조했고 **실물 종이 승인 전**이다. [Drive 비공개 2단 검토 PDF](https://drive.google.com/file/d/1rbmIil2Jbsj9a9DA4ngJw4OnwoCZO49f/view), [판정 JSON](https://drive.google.com/file/d/1YDClIfU_PR2GH9AsMOTUnnkR8r6vh-w4/view), [원문·그림·Apple Vision·재현 코드 ZIP](https://drive.google.com/file/d/1MddbAltaEq0pt6HxufSKZyhxKPDvLww9/view)을 기존 검수 폴더에 보관하고 크기·부모를 재조회했다. Mac 위치는 `.private-work/middle8-20261018/q09q10-candidate-20261019/`이다. 새 후보의 교사 승인·공개 연결·9축 최종 승인은 **0**, 현행 보류 **192축·63문항·25개 원문**과 문제은행 SHA-256 `89be2de73d408d3e16731a42ec7b7176417a627b071c7fe1357e6a14f878320c`는 그대로다.

- 두 비공개 후보를 제작 기준 2.7의 **9개 난도 차원**으로 원문과 각각 대조했다. 후보별 `사전 학습·사고 단계·조건 추적·경우 나누기·계산 부담·표현 전환·읽기 부담` **7축은 임시 일치**, `시각 단서·우연한 지름길` **2축은 보류**다. 원본 그림은 같지만 작은 분수 기호의 Apple Vision OCR은 불안정하고 실물 A4 가독성은 미확인이다. 후보 순번 52·53은 10번째 묶음 끝 55에서 3·2 전이라 원문 50(5 전)보다 끝에서 역산하기 쉬울 수 있다. 따라서 후보별 9축 **최종 승인 0**, 현행 은행의 192축 보류 수는 바꾸지 않는다. [Drive 후보별 9축 판정 JSON](https://drive.google.com/file/d/1DSBwfbkz4x1M-_iYjf67xswOAQMt_iqk/view)과 [재생성 코드 ZIP](https://drive.google.com/file/d/15pOw1FZjQCxAk8cZvkhneHHjRJHQUNzx/view)을 같은 폴더에 저장하고 크기·부모를 확인했다.

## 2026-10-19 중급 8회 28번 유사문제 2 계산 부담 보류 1축 해소 (Mac, 최신)

- 원본 PDF 5쪽 28번의 `9가 15개`인 두 수와 강의 답안 31쪽의 자리 합 **135**, 현행 `compact` PDF 30쪽 83번의 `9가 18개`인 두 수와 답안 50쪽의 자리 합 **162**를 직접 대조했다. 그림의 `15개/18개`는 사용자 확정대로 `99` 덩어리 수가 아니라 각 수에 쓰인 **숫자 9의 개수**다. Apple Vision `.accurate`가 원문 두 `15개`, 현행 두 `18개` 및 답안 `9×17+8+1=162`를 읽었고 렌더링 화면에서 숫자·그림을 확인했다. `n`개의 9로 된 수의 제곱을 직접 큰 정수로 계산하면 `n−1`개의 9, 8, `n−1`개의 0, 1의 순서여서 자리 합은 `9n`이다. 원문 `n=15`와 변형 2 `n=18`은 각각 135·162로 저장 답과 일치한다.
- 자리 패턴 풀이 경로의 `9×14+8+1`과 `9×17+8+1`은 둘 다 두 자리 수×9의 자리별 곱 2회·양수 받아올림 2회, 마지막 `+9`의 받아올림 1회로 계산 횟수와 자리 구조가 같다. 따라서 **28번 유사문제 2의 `calculationLoad` 1축만 임시 일치**로 옮겼다. 1·3번의 계산 부담과 세 변형의 개수 표기 독해·시각 단서·실물 종이는 보류다. [Drive 계산·Apple Vision 판정 JSON](https://drive.google.com/file/d/1jLBKAGFq8syoaqDzYRoklPIvovH-16OJ/view), [원본·현행 300dpi 쪽·OCR·재현 코드 ZIP](https://drive.google.com/file/d/1IvnnbwBJlfAHx6A1SQVH5lPbXAS2PJkn/view), [최신 25개 원문 검토표 JSON](https://drive.google.com/file/d/1PDyWshkPAURhjTHGBLlH-Q2HLnTT_g49/view), [검토표 CSV](https://drive.google.com/file/d/1PW1nfefw2lyMIW_qQu3Y_k5EA8-pSM-U/view), [검토표 재생성 코드 ZIP](https://drive.google.com/file/d/19wFH8QGCf5BIhL8WqTUn66AucHtJaWa8/view)을 기존 Drive 검수 폴더에 저장하고 크기·부모를 재조회했다.
- 최신 보류는 **192축·63문항·25개 원문**, 임시 일치 618축, 9축 최종 승인 **0**이다. 승인 90문항의 지문·답·해설·그림·채점·학생 기록과 문제은행 SHA-256 `89be2de73d408d3e16731a42ec7b7176417a627b071c7fe1357e6a14f878320c`는 변경하지 않았다. Mac 실행 위치는 `.private-work/middle8-20261018/q28-calculation-20261019/`이다.

## 2026-10-19 중급 8회 25번 문장 독해 부담 보류 3축 해소 (Mac, 최신)

- 원본 PDF 5쪽 25번과 현행 `compact` A4 PDF 23쪽 73~75번을 같은 300dpi로 직접 대조했다. 원문은 짧은 1학기 물음 뒤 ㉮~㉱ 네 조건에서 `38·106·140일`을 제시하고, 세 승인 변형은 같은 네 조건의 순서·오전/오후 대응·문장 절 구조를 유지하며 수치만 `42·104·136 / 44·107·139 / 40·105·133일`로 바꾼다. 학교 이름을 `관호네`에서 `한 학교`로 바꾸고 띄어쓰기·어미를 다듬었지만 새 독해 조건은 없다. Apple Vision `.accurate`는 원문과 세 변형의 핵심 수치·문장을 읽었으나 ㉮~㉱ 표식 일부를 오독해 렌더링 화면으로 교차 확인했다. 로컬 90문항·`editorial`/`compact`·개인연습 10/20/30 브라우저 검사는 통과했고 운영 쓰기는 0이었다.
- 25번 세 변형의 `readingLoad` **3축만** `보류`에서 `임시 일치`로 옮겼다. 이는 문장 독해 부담 판정이며, 새 흑백 조건 상자의 글자·표식·테두리와 실물 종이 가독성은 각 변형의 `representationChange`·`visualCue` **6축 보류**에 남겼다. 현행 승인 문항·그림·답·채점·학생 기록과 문제은행 SHA-256 `89be2de73d408d3e16731a42ec7b7176417a627b071c7fe1357e6a14f878320c`는 변경하지 않았다. 최신 검토표는 **193축·63문항·25개 원문 보류**, 임시 일치 617축, 9축 최종 승인 **0**이다. 실물 종이·실제 학생/교사 난도 판단은 남는다.
- [Drive 문장·OCR 판정 JSON](https://drive.google.com/file/d/1cgcuZnVWNXD1nYsk61AGyRkKGF_JuFNF/view), [원본/현행 300dpi 쪽·Apple Vision·브라우저 검사 근거 ZIP](https://drive.google.com/file/d/18f3idbIGdKWrJ3M1ZQhrOcQ60ZwjZHO0/view), [최신 25개 원문 검토표 JSON](https://drive.google.com/file/d/1svcbZ-EUWhAhTM0tTcTcByYHqggx7Hr7/view), [검토표 CSV](https://drive.google.com/file/d/1e8RMTHSdXWu_TqHj6W9dvqom5-rHZhuI/view), [검토표 재생성 코드 ZIP](https://drive.google.com/file/d/1HPOJXySLTFLohmEWt_gQ53SAL10qfU7q/view)을 기존 중급 8회 검수 폴더에 보관하고 크기·부모를 재조회했다. Mac 실행 위치는 `.private-work/middle8-20261018/q25-reading-20261019/`이다.

## 2026-10-19 중급 8회 20번 바닥면 경로 3문항 비공개 교체 후보 (Mac, 최신)

- 원본 PDF 4쪽 20번의 지문·주사위 위2·앞1·오른쪽3·빨간 이동 경로와 답안 22쪽의 처음 자리 포함 바닥면 `5·3·2·4·1·3·5 = 23`을 직접 다시 대조했다. 현행 승인 유사문제는 같은 그림에서 윗면·앞면·오른쪽 면을 각각 물어 `26·19·28`이며, 원문 동등성 Q20 보류 **19축**은 그대로다. 승인된 지문·답·그림·채점·학생 기록, 전체 문제은행 SHA-256 `89be2de73d408d3e16731a42ec7b7176417a627b071c7fe1357e6a14f878320c`를 변경하지 않았다.
- 비공개 원문 구조 후보는 시작 주사위·동쪽 4번/아래쪽 2번의 여섯 굴림·방향 전환 2회·처음 자리 포함 바닥면 7개 합을 유지하고 경로만 `EESSEE`, `ESSEEE`, `SEEEES`로 바꿨다. 새 투시 격자·주사위 그림 3개에는 경로만 표시하고 중간 바닥 눈·풀이 단서는 넣지 않았다. 바닥면 열은 각각 `5·3·2·1·5·4·2 = 22`, `5·3·1·4·2·3·5 = 23`, `5·1·3·6·4·1·2 = 22`다. 면 상태 갱신과 별도의 3차원 법선 회전이 세 열에 모두 일치했다. 이 경로들의 반복·상쇄가 원문과 같은 체감 난도인지, 새 그림의 면 눈·선·화살표가 종이에서도 정확한지는 **미판정**이다. 사용자에게 20번 새 그림의 공개 교체 승인을 받은 상태가 아니므로 세 후보는 공개·채점 연결하지 않는다.
- 비공개 A4 2단 검토 PDF는 문제·새 그림 3개 1쪽, 이동/바닥면 표가 든 답안 3개 1쪽이다. 전 페이지 180dpi 렌더링을 직접 확인했고 Apple Vision `.accurate`는 세 문제 지문과 답 `22·23·22`를 읽었다. OCR은 일부 표의 화살표·연속 숫자를 오독하므로 렌더링과 독립 계산 기록으로 대조했다. [Drive 비공개 2단 검토 PDF](https://drive.google.com/file/d/1w0vXjIqTTQcA_Snku4LxQZB6RO5hLDix/view), [원문·답안 캡처·새 SVG 3개·계산·Apple Vision·재현 코드 ZIP](https://drive.google.com/file/d/1kLT-Qo_10UBIPEfghPRhKJSUbKM00xkh/view)을 기존 중급 8회 검수 폴더에 보관하고 크기·부모를 재조회했다. Mac 작업 위치는 `.private-work/middle8-20261018/q20-source-faithful-draft-20261019/`이다. 새 후보 3개의 콘텐츠·9축·실물 인쇄 승인은 모두 0이고 현행 보류 **196축·63문항·25개 원문**, 최종 9축 승인 0도 유지한다.

## 2026-10-19 중급 8회 14번 원문 구조 3문항 비공개 교체 후보 (Mac, 최신)

- 원본 PDF 3쪽 14번 지문·실제 빨강/노랑/초록 신호등 그림과 답안 16쪽의 `0개 제외, 1개 3가지, 2개 3가지, 3개 1가지 = 7가지`를 다시 확인했다. 현행 사용자 승인 14번 유사문제 3개는 추가 제한 때문에 `5·6·5가지`이고 원문 대비 보류 25축이 남는다. 공개 승인 문항 90개와 답·해설·그림·채점·성적, 문제은행 SHA-256 `89be2de73d408d3e16731a42ec7b7176417a627b071c7fe1357e6a14f878320c`는 변경하지 않았다.
- 별도 비공개 원문 구조 후보 3개는 모두 세 불의 독립 켜짐/꺼짐과 불빛을 이용한 신호만 묻는다. 8개 물리 상태를 전수 열거해 빈 상태 1개 제외 = **각 7가지**를 확인하고, 별도로 켜진 불 1·2·3개별 `3+3+1=7`로 검산했다. 새 그림은 이전에 사용자 허용 범위에서 만든 중립 신호등 SVG를 공통으로 재사용했다. 세 후보는 풀이 구조와 답이 같고 소재 문장만 달라 **쌍둥이 반복 연습 후보**로만 분류한다. 다양한 독립 문항 3개로 충분한지, 원본 사진 대비 새 그림·읽기 부담이 실제 동등한지는 교사·학생·실물 종이 판정 전이다. **이 세 후보의** 교사 승인·9축 최종 승인·공개 연결은 모두 **0**이며 현행 보류 **196축·63문항·25개 원문**도 그대로다.
- 비공개 A4 2단 검토 PDF는 문제 3개 1쪽과 답안·풀이 3개 1쪽이다. 160dpi 전 페이지 렌더링을 눈으로 확인했고 Apple Vision `.accurate`가 세 지문·정답 7가지·`8−1`, `3+3+1` 계산을 읽었다. OCR은 문제 1·3번 숫자를 자동 검출하지 못하고 부제의 `7가지`를 한 번 `7지`로 읽었으므로 화면과 생성 데이터로 대조했다. 실물 인쇄 합격으로 간주하지 않는다. [Drive 비공개 2단 검토 PDF](https://drive.google.com/file/d/1pgQ2o82jx1P20GfBTmzRHd9_viMPOlAK/view), [원문 그림·답안 캡처·8상태 기록·Apple Vision·재현 코드 ZIP](https://drive.google.com/file/d/1nT1r5wLb76rQUt0NUS_oNo4X9Tv--G5x/view)을 기존 중급 8회 검수 폴더에 저장하고 파일 크기·부모를 재조회했다. Mac 작업 위치는 `.private-work/middle8-20261018/q14-source-faithful-draft-20261019/`이다. 다음 판단은 현재 승인된 5·6·5 확장형을 유지하면서 이 7·7·7 쌍둥이형을 별도 연습으로 둘지, 원문 동등형 3개를 다시 설계해 승인 교체할지 정하는 것이다.

## 2026-10-19 중급 8회 18번 유사문제 3 계산 부담 보류 1축 해소 (Mac, 최신)

- 원본 PDF 3쪽 18번과 강의 답안 20쪽, 공개 2단 `compact` PDF 17쪽 54번을 직접 대조하고 Apple Vision `.accurate`로 원문의 토요일 합 `75`·화요일 물음 및 공개본의 일요일 합 `75`·목요일 물음을 재확인했다. 28~31일 달과 첫 요일 7가지를 각각 전수 열거하면 두 문항 모두 가능한 달은 29·30·31일 세 경우, 주어진 날짜는 **1·8·15·22·29일**이다. 원문 답은 화요일 **4·11·18·25일**, 유사문제 3 답은 목요일 **5·12·19·26일**로 저장 답과 같다. 둘 다 합 `75÷5=15`, 다섯 날짜 복원, 다섯 번의 목표 날짜 덧셈 중 자리올림 2번과 월말 초과 1번 제외로 계산 경로가 같다. 더하는 수 `+3/+4`의 차이는 남지만 18번 유사문제 3의 `calculationLoad` **1축만 임시 일치**로 옮겼다. 요일쌍 조건 추적과 18번 유사문제 2의 31일 달 경우 분기는 보류다.
- [Drive 달력 전수·계산·Apple Vision 기록](https://drive.google.com/file/d/192GLZ5BV-wtWZGO3e2TPHh7bZD52_vA4/view), [원문/공개 화면·OCR·재실행 코드 ZIP](https://drive.google.com/file/d/1qV-doG8VpQ4YVckSh73qU05BUuwQXF4J/view), [최신 25개 원문 검토표 JSON](https://drive.google.com/file/d/1QNGuKpJuUM38Cw6H77rMJH9luzIYa0i7/view), [검토표 CSV](https://drive.google.com/file/d/1HlRUhF4tOFdHx6zJThpFJQb2kypKg7uN/view), [검토표 재생성 코드 ZIP](https://drive.google.com/file/d/1j6fq7M4gotMWFdvgEMXlbl3wmN4QN98J/view)을 기존 Mac 이어받기 폴더에 보관하고 크기·부모를 재조회했다. Mac 실행 위치는 `.private-work/middle8-20261018/q18-calculation-load-20261019/`다. 최신 보류는 **196축·63문항·25개 원문**, 임시 일치 614축, 9축 최종 승인 **0**이다. 승인 90문항·답·채점·학생 기록과 문제은행 SHA-256 `89be2de73d408d3e16731a42ec7b7176417a627b071c7fe1357e6a14f878320c`는 변경하지 않았다. 실물 종이와 실제 학생·교사 난도 판단은 남는다.

## 2026-10-19 중급 8회 1번 유사문제 3 계산 부담 보류 1축 해소 (Mac, 최신)

- 원본 PDF 1쪽 1번과 원본 답안 1쪽의 필기 풀이, 공개 2단 `compact` PDF 2쪽 3번 및 승인 은행 문항을 직접 대조했다. Apple Vision `.accurate`의 원문·공개 판독과 별도로 십·일의 자리 100쌍을 각각 전수 열거했다. 원문 고정 앞자리 `35`에서는 **3505·3516·3527·3538·3549**, 변형 `81`에서는 **8105·8116·8127·8138·8149**의 다섯 해이며 교환 후 차가 모두 45다. 두 문항은 `45÷9=5`, 십의 자리 `0~4`, 다섯 수 구성과 재교환 확인이 같다. 이전 검수 메모의 `4~6개`는 실제 해 다섯 개와 맞지 않아 1번 유사문제 3의 `calculationLoad`만 `보류`에서 **임시 일치**로 옮겼다. 이는 학생 체감 난도나 9축 최종 승인이 아니다.
- [Drive 계산·원문/공개 직접 대조 기록](https://drive.google.com/file/d/1IvMAIFxeatXiZunKFdaZtbbCLAojr76W/view), [이미지·Apple Vision·재실행 코드 ZIP](https://drive.google.com/file/d/1xE7gxQJmuBmiTB87Wjqncf1CjI9UfcGe/view), [최신 25개 원문 검토표 JSON](https://drive.google.com/file/d/1T8ryo7UjCa8uutPcZkYIyRF8pdATQfg2/view), [검토표 CSV](https://drive.google.com/file/d/1aZOySLsD_4yINVEvpX5pMeZTxoyF-ctu/view), [검토표 재생성 코드 ZIP](https://drive.google.com/file/d/1cdRWXiHTotJMrWtiF-dKK0PpJmVDDiAW/view)을 기존 Mac 이어받기 폴더에 저장하고 크기·부모를 재조회했다. Mac 재실행 위치는 `.private-work/middle8-20261018/q01-calculation-load-20261019/`다. 최신 보류는 **197축·63문항·25개 원문**, 임시 일치 613축, 9축 최종 승인 **0**이다. 1번 유사문제 2의 역방향 조건·독해·풀이 3축, 전체 실물 인쇄·교사 최종 판정은 남는다. 현재 문제은행 SHA-256 `89be2de73d408d3e16731a42ec7b7176417a627b071c7fe1357e6a14f878320c`이며 승인 90문항의 지문·답·해설·그림·채점·학생 기록은 변경하지 않았다. 현재 Mac이 잠겨 실제 학생·관리자 계정 검사는 아직 실행하지 못했다.

## 2026-10-19 중급 8회 2번 나머지 고정 유형명 수정 (Mac, 최신)

- 원본 PDF 1쪽 2번은 `9로 나눈 나머지 3`인 두 자리 수 **10개**를 묻지만 승인된 공개 4~6번은 나머지 **4·5·6**을 묻는다. 공개 유형명은 모두 `나머지가 3`으로 고정되어 있어 문제 지문과 충돌했다. 유형명을 `9로 나눈 나머지 조건(두 자리 수)`로 중립화하고 중급 8회 진단 분류·문제은행의 유형/세 문항 분류·인쇄 제목에 연결했다. 옛 제목은 검색 별칭으로 보존했다. 두 자리 10~99를 나머지별로 전수 확인해 원문과 세 변형 모두 10개이며 저장 답과 일치했다. 승인된 90문항의 지문·답·해설·그림·승인 필드와 다른 유형은 그대로다. 새 문제은행 SHA-256 `89be2de73d408d3e16731a42ec7b7176417a627b071c7fe1357e6a14f878320c`.
- 로컬 문제은행 90/90, 브라우저 `editorial`·`compact` 문제/답 90/90, 개인연습 10·20·30, 합성 중급 8회 진단지 학습 위치·포인트 30/30 및 은행 연결 90/90을 검사했고 운영 쓰기·브라우저 오류는 0이었다. `compact` PDF 2쪽 4~6번을 직접 열고 Apple Vision `.accurate`로 변경 전 고정 `3` 제목 세 개와 변경 후 중립 제목 세 개, 지문의 나머지 `4·5·6`을 각각 읽었다. [Drive 변경·수학·보호 검수 기록](https://drive.google.com/file/d/1uup-jbtL-BaZoT2KiieEay01lqEozRfO/view), [원문/변경 전후 인쇄·Vision·재실행 코드 ZIP](https://drive.google.com/file/d/1YgB9Oe-xfaS1OmdSVZHIOS-ctmdd6FJ0/view)을 기존 Mac 이어받기 폴더에 보관하고 크기·부모를 재조회했다. Mac 작업본은 `.private-work/middle8-20261018/q02-type-20261019/`다. 원문 대비 9축 보류 **198축·64문항**, 최종 승인 **0**과 실제 학생·실물 종이 미검수 상태는 유지한다.
- GitHub 메인 커밋 [`6470b03b`](https://github.com/docssam1/hs-report/commit/6470b03bf8af393c4a7977159e99bfad70c075fc)의 Pages [배포 실행](https://github.com/docssam1/hs-report/actions/runs/39155908404)이 성공했다. 공개 사이트에서 문제은행 JSON·중급 8회 어댑터·`mock-data.js`의 SHA-256이 메인과 각각 일치했다. 공개 정적 사이트의 합성 성적표→은행 **90문제·90답**, 학습 위치·포인트 **30/30**, `editorial`·`compact` 문제/인쇄 각 90문항을 운영 쓰기·브라우저 오류 0으로 재검사했다. 공개 화면에서 생성한 2단 `compact` PDF 2쪽 4~6번을 직접 확인하고 Apple Vision으로 중립 유형명 3개와 지문의 나머지 4·5·6을 읽었다. [Drive 공개 배포 검수 기록](https://drive.google.com/file/d/1yghZZ-WRimffTUQGzDY0OVWP_LRFxM19/view), [공개 인쇄 PDF·Vision·브라우저 결과 ZIP](https://drive.google.com/file/d/1J6uuqMebVHKoYBJLDy26u2id_nRuklcJ/view)을 같은 폴더에 저장하고 크기·부모를 재조회했다. 실제 학생·관리자 로그인과 실물 종이는 미검증이다.

## 2026-10-19 중급 8회 10번 유형명 50번째 고정 표시 수정 (Mac, 최신)

- 공개 `compact` 인쇄본 7쪽 28~30번은 각각 **42·59·72번째** 순서쌍을 묻는데 유형명이 공통으로 `순서쌍 배열의 50번째`라고 표시됐다. 원문 PDF 2쪽 10번의 실제 50번째와 강의 답안 12쪽을 직접 대조하고, 공개 문제지의 지문·수열도 확인했다. 재사용 유형명을 `순서쌍 배열의 규칙`으로 바로잡아 중급 8회 진단 분류·문제은행 유형·인쇄 제목을 연결하고, 이전 명칭은 문제은행 검색 별칭에 유지했다. 승인된 세 지문·답 `(6, 4)·(4, 8)·(6, 7)`·해설·그림·채점·성적·나머지 87문항은 변경하지 않았다. 원문 9·10번과 세 유사문제를 독립 삼각수 계산으로 다시 확인했고, 원문 50번째는 각각 `5/11 → 합16`, `(5, 6)`이다. 9번 유사문제 3의 74번째·10번 유사문제 3의 72번째는 원문보다 두 묶음 뒤이므로 두 `calculationLoad` 축은 계속 보류한다.
- 고정 문제은행 검사 90/90, 로컬 브라우저 `editorial`·`compact` 문제/답 90/90와 개인연습 10·20·30, 중급 8회 합성 성적표의 학습 위치·포인트 30/30 및 은행 연결 90/90이 통과했다. 브라우저 오류·운영 쓰기 0이었다. 새 PDF 7쪽을 직접 확인하고 Apple Vision `.accurate`로 새 유형명 세 개와 42·59·72번째를 재확인했다. 기존 본문·답·그림 등 보호 필드의 깊은 비교도 통과했다. 새 문제은행 SHA-256 `bb9ebfad2e8beea6d6a6d4d3186a5c03a17f9eea0e349e1b830b1663d5afa7d6`이다.
- [Drive 유형명·계산·검사 기록](https://drive.google.com/file/d/1Mnu7czFmYuaOf7MuYqGo1mh65V6KAUMe/view), [변경 전후 7쪽·Apple Vision 원본값·재실행 코드 ZIP](https://drive.google.com/file/d/1IV-MJSgown4a0XcGrsJTtjncvRAqGJ3l/view)을 기존 Mac 이어받기 폴더에 저장하고 크기·부모를 재조회했다. Mac 실행 파일은 `.private-work/middle8-20261018/q09q10-calculation-load-20261019/`에 있다. 현행 검토표의 **198축·64문항·25개 원문 보류**와 9축 최종 승인 **0**은 유지한다. 실물 종이·실제 학생 계정 검사는 아직 별도다.
- GitHub 메인 커밋 [`9c502cbd`](https://github.com/docssam1/hs-report/commit/9c502cbdf63473dbba9d344846d4732f27ea851f)의 Pages [배포 실행](https://github.com/docssam1/hs-report/actions/runs/39155315235)이 성공했다. 공개 사이트에서 문제은행 JSON·중급8회 어댑터 JS·`mock-data.js`를 다시 받아 세 파일 모두 커밋 본문과 SHA-256 완전 일치했다. 공개 정적 사이트의 합성 성적표→은행 **90문제·90답**, 학습 위치·포인트 **30/30**, `editorial`·`compact`와 개인연습 10·20·30을 운영 쓰기·브라우저 오류 0으로 재검사했다. 공개 화면에서 생성한 인쇄 PDF 7쪽의 28~30번 새 유형명과 42·59·72번째 지문을 직접 보고 Apple Vision으로도 확인했다. [Drive 공개 배포 검수 기록](https://drive.google.com/file/d/1hsYWsWd4fLTN8G6_TvgCC1IwkI90_4OP/view), [공개 인쇄·Vision·재실행 ZIP](https://drive.google.com/file/d/1QycrIFDTIqurMd0JKsiQNF1TN1ck1Iy-/view)을 같은 폴더에 저장하고 크기·부모를 재조회했다. 실제 로그인 계정·실물 종이는 미검증이다.

## 2026-10-19 중급 8회 7번 계산 부담 보류 근거 보충 (Mac, 최신)

- 원문 PDF 2쪽 7번의 지문·실제 원 그림과 공개 `compact` PDF 6쪽 19~21번을 직접 대조했다. Apple Vision `.accurate`가 원문 `56cm·7개`, 공개 `60cm·9개 / 72cm·7개 / 80cm·9개`를 읽었다. 큰 원 지름은 작은 원 반지름 `개수+1`개이므로 원문 답 **14cm**, 세 승인 변형 답 **12·18·16cm**를 별도로 검산했고 저장 답과 일치한다. 원본 그림의 생략 부호와 끝 원·중심점은 공개본에도 유지된다.
- 유사문제 1·3은 원문의 `56÷8=7` 대신 `60÷10=6`, `80÷10=8`을 계산한다. 작은 원 수는 7개에서 9개로 늘지만 나눗셈은 쉬워져 두 변화가 반대 방향이다. 학생의 실제 계산 부담 동등성을 이 근거만으로 확정하지 않아 두 `calculationLoad` 축을 **보류**로 유지했다. 2번의 `72÷8=9`는 기존 일치 추정 그대로다. 전체 보류 **198축·64문항·25개 원문**, 9축 최종 승인 **0**과 승인 문제은행 SHA-256 `5a785a313807e66dd05249622f78282d705100025cc248c17204baf8c95506e0`는 바뀌지 않았다.
- [Drive 수치·계산 보충 기록](https://drive.google.com/file/d/1k7lQlIJ1phJ7dFoxdQtW1kdP9JL7UD0_/view), [원본 그림·공개 6쪽·Vision 원본값·재실행 코드 ZIP](https://drive.google.com/file/d/1XQNE9U1JUZRGHiCMwmXTu9BjIUrcqER3/view)을 기존 Mac 이어받기 폴더에 저장하고 부모·크기를 재조회했다. Mac 재실행 위치는 `.private-work/middle8-20261018/q07-calculation-load-20261019/`이다. 실물 종이·학생 난도는 미확인이고 문항·답·채점·성적은 변경하지 않았다.

## 2026-10-19 중급 8회 13번 계산 부담 보류 1축 해소 (Mac, 최신)

- 원본 PDF 3쪽 13번의 여섯 예시·빈 3×3 격자와 강의 답안 15쪽의 열 값 `16·4·1`, 현행 공개 인쇄본 37번을 직접 대조했다. Apple Vision `.accurate`가 원문 `45`와 공개 `46` 지문을 읽었다. 아래 칸부터 연속 색칠하는 사용자 확정 기준에서 원문은 열별 `2·3·1칸`, 변형은 `2·3·2칸`으로 모두 64가지 열 조합 중 단일해다. 계산 경로는 공통으로 `2×16=32`, `3×4=12`와 두 번의 빼기이며, `45−32=13, 13−12=1`과 `46−32=14, 14−12=2`는 모두 받아내림 0회다. 변형의 색칠 한 칸 증가는 **계산 단계·자리올림/받아내림 증가가 아니므로** 13번 유사문제 1의 `calculationLoad`를 보류에서 **일치 추정**으로 옮겼다. 실물 종이·학생 난도·9축 최종 승인은 여전히 보류다.
- [Drive 13번 계산·OCR 보충 기록](https://drive.google.com/file/d/1ZqO5i1k1oHaSMZrNBRRfHDuXGinUj6DE/view), [원문·공개 그림·Vision 값·재실행 코드 ZIP](https://drive.google.com/file/d/1d007ycq-Zpyqyzoq7SIeVCcwFMxzRufh/view), [최신 검토표 JSON](https://drive.google.com/file/d/1jrpenIB7_stQsSolZKDg0WkGGBqMXBQJ/view), [25개 원문별 CSV](https://drive.google.com/file/d/1mR3zFD9ecTVpimX_f0elQDzD9GZMvfRf/view)을 기존 중급8회 검수 폴더에 저장하고 크기·부모를 재조회했다. Mac 재실행 파일은 `.private-work/middle8-20261018/q13-calculation-load-20261019/`다. 현재 **25개 원문·64문항·198축 보류, 612축 추정, 최종 승인 0**이다. 초기 198축 표와 숫자는 같아도 항목은 다르다(Q5-v3 추가, Q13-v1 제거). 승인 문항·답·채점·성적과 문제은행 SHA-256 `5a785a313807e66dd05249622f78282d705100025cc248c17204baf8c95506e0`는 바꾸지 않았다.

## 2026-10-19 중급 8회 5번 계산 부담 보류 1축 추가 (Mac, 당시 기록)

- 원본 문제 PDF 1쪽 5번·강의 답안 6쪽과 현행 공개 `compact` PDF 4쪽의 13~15번을 직접 대조하고 Apple Vision `.accurate` OCR로 네 수치씩 재확인했다. 원문과 세 유사문제 모두 `다=가+추가 길이 → 세 막대 합 → 전체 길이 차 → 2로 나눔` 관계 및 저장 답 29·32·27·34cm가 맞다. 강의의 원문 풀이와 같은 **왼쪽부터 세로셈하는 경로**에서 원문은 자리올림 5회·받아내림 2회, 변형은 각각 **3·2 / 3·1 / 1·2회**다. 세 번째 유사문제의 계산 부담은 기존 `일치 추정`보다 낮아질 근거가 있으므로 그 1축을 최종 판정 전 `보류`로 올렸다. 계산 횟수는 한 풀이 경로의 객관 지표이며 학생의 실제 체감 난도 판정은 남는다.
- [Drive 계산·OCR 보충 기록](https://drive.google.com/file/d/1Y5-EwHlEZAPQPUzjCnm0FbF6SV8zdGnB/view), [원본/현행 렌더·Vision 원본값·재실행 코드 ZIP](https://drive.google.com/file/d/1T9D9l_3ktYAKXrrmFrn4VCq08a7wOgt7/view), [당시 199축 검토표 JSON](https://drive.google.com/file/d/1nB1FW5L_2cVMPZpEoZKoyo248x_JTui-/view), [26개 원문별 CSV](https://drive.google.com/file/d/1IK0P10dTFZPxIJkgwyF2JjNsDKQ6Ou5N/view)을 기존 중급 8회 검수 폴더에 저장하고 크기·부모를 재조회했다. Mac 재실행 파일은 `.private-work/middle8-20261018/q05-calculation-load-20261019/`에 있다. 이전 **198축·64문항** 검토표는 역사적 스냅샷으로 보존하며 당시 보류는 **199축·65문항**, 나머지 611축은 추정, 최종 9축 승인 0이었다. 사용자 승인 90문항·채점·학생 성적과 문제은행 SHA-256 `5a785a313807e66dd05249622f78282d705100025cc248c17204baf8c95506e0`는 변경하지 않았다.

## 2026-10-19 중급 8회 14번 현행 공개본 Apple Vision 재확인 (Mac, 최신)

- 현행 `compact` 인쇄본 42번(원문 14번 유사문제 3)을 Apple Vision `.accurate`로 다시 읽어 `노란색 불을 켜면 초록색 불도 켜야` 조건이 실제 인쇄본에 있음을 확인했다. OCR은 앞부분의 `초록색`을 한 번 `초색`으로 오독했으므로 저장 문항·화면과 대조했다. 앞선 Vision 원문 3쪽·답안 16쪽 및 인쇄본 40~42번 대조 기록의 결론은 그대로다. 원문은 세 불의 자유로운 켜짐/꺼짐에서 모두 꺼진 경우만 제외한 **7가지**, 공개 유사문제는 추가 조건으로 **5·6·5가지**다.
- OCR 작성 당시 문제은행 커밋 `5ec01fd`와 현행 문제은행(SHA-256 `5a785a313807e66dd05249622f78282d705100025cc248c17204baf8c95506e0`)의 14번 세 문항을 깊은 비교한 결과 지문·답·그림·승인 필드가 모두 같다. `teacherApproved=true`와 `sourceEquivalentConfirmed=false`도 그대로다. [Drive 현행본·Apple Vision 연결 검수 기록](https://drive.google.com/file/d/1WRYSTJhB7XQi_N7MCX5IIaSTLqEOrI6i/view)에 새 OCR 해시, 앞선 원문·공개 OCR 해시, 현행 은행 해시를 남겼다. Mac 파일은 `.private-work/middle8-20261018/q14-current-ocr-20261019/q14-current-bank-ocr-reconciliation-20261019.json`이다. 사용자 콘텐츠 승인은 보존하고 9축 원문 동등성·실물 종이 최종 승인은 보류한다. 이번 작업은 문항·채점·성적을 변경하지 않았다.

## 2026-10-19 중급 8회 공개 성적표→문제은행·Apple Vision 답안 연결 재검수 (Mac, 최신)

- 공개 `https://hs.gfieldacademy.net`의 정적 학생 화면을 합성 온라인 학생·저장 성적으로 실행했다. `mock-mid-8` 승인 전 직접 8회 성적표 주소는 차단되고, 승인 후 기존 성적표가 열린다. 오답 30개인 합성 결과에 **권장 학습 위치 30/30·학습 포인트 30/30**과 `원문 30유형 → 유사문제 90문항` 링크가 보였다. 그 링크를 실제로 따라가 공개 문제은행 **문제 90개·답안 90개**가 로드되는 것을 확인했다. 공개 문제은행의 `editorial`/`compact` 배치와 개인 문제지 10·20·30개도 그림 로드·잘림 없이 통과했다. `qa/middle-online-report-access-browser-validate.js`와 `qa/bank-middle8-browser-validate.cjs`에 공개 사이트 합성 검수 모드를 추가했고, 기본 로컬 모드도 재검사했다. 두 공개 검사 모두 학생 성적·외부 쓰기 0, 브라우저 오류 0이다.
- 공개 정적 화면에서 새로 생성한 `compact` A4 **51쪽 PDF**(SHA-256 `78bd93c76499e798dc90511a0a8092b0a4cb0117474b08928f904d61c7f347f7`)의 답안 34~51쪽을 300dpi로 렌더해 Apple Vision `.accurate` OCR로 다시 읽었다. 34쪽 빈 면 뒤 35~51쪽의 답 90개와 각 문항 번호를 1:1로 묶어 현행 문제은행(SHA-256 `5a785a313807e66dd05249622f78282d705100025cc248c17204baf8c95506e0`) 저장 답과 엄격 대조한 결과 **90/90 일치**다. 문제 17쪽의 52~54번 수정 유형명 `달력(요일 날짜의 합)`도 재확인했다. [Drive 공개 연결·OCR 검수 JSON](https://drive.google.com/file/d/133mgAHFXvZuBagVbeo5MATv2_sfjVfPh/view), [공개 PDF·19개 Vision 값·브라우저/재실행 코드 ZIP](https://drive.google.com/file/d/1AEKxjIBHh4zXpLsxoT2qJ7t3NERKZvO3/view)을 기존 중급 8회 검수 폴더에 보관하고 크기·부모 폴더를 재조회했다. Mac 위치는 `.private-work/middle8-public-report-20261019/`와 `.private-work/middle8-public-bank-20261019/`다. 이는 **합성 계정의 공개 정적 연결·출력 답 표기 검사**이며 실제 OTP·운영 학생 성적, 원문 대비 난도 **보류 198축**, 수학적 정답성 전체·실물 종이 승인으로 확대하지 않는다. 문제·채점·권한·성적은 변경하지 않았다.

## 2026-10-19 최종 3회 공개 진단·유사문제 인쇄 Apple Vision 재검수 (Mac, 최신)

- 공개 `https://hs.gfieldacademy.net`의 정적 화면을 운영 쓰기 없는 **합성 학생 성적**으로 브라우저 검사했다. 오답 0·1·2·11개에서 화면 유사문제가 각각 0·3·6·9개로 보였고, 30개 원문 유형 모두 학습 위치·학습 포인트 연결이 있었다. 별도 오답 12·15·28번 인쇄 준비는 승인 유사문제 **9개와 답·풀이 9개**를 같은 우선 복습 번호로 묶어 A4 **10쪽 PDF**를 만들었다. 공개 정적 파일 검수 5개 시나리오 전부 통과, 운영 쓰기·브라우저 오류 0이다. QA 전용 빈 페이지는 공개 사이트에 없으므로 PDF 내보내기 검사는 공개 `final.html`을 시작점으로 쓰도록 `qa/last3-parent-report-browser-validate.cjs`에 `GFIELD_LAST3_PUBLIC_BASE_URL` 공개 모드를 추가했다. `GFIELD_LAST3_QA_OUTPUT`으로 로컬 결과 경로를 분리하며 기본 로컬 모드도 5/5 재검사 통과했다. 서비스 코드·문항·채점·학생 기록은 바꾸지 않았다.
- 생성 PDF의 4쪽에서 **권장 학습 위치·학습 포인트**와 12·15·28번 교재 연결을 확인했다. 5~7쪽은 다단 유사문제 1~9번, 8쪽은 양면 인쇄용 빈 면, 9~10쪽은 정답·풀이 1~9번이다. Apple Vision `.accurate` OCR은 문제 번호 9/9·답안 번호 9/9 및 숫자 답 6/6을 읽었고, △·○ 도형 답 3개는 OCR이 A·ㅇ처럼 오독해 10쪽을 확대 직접 확인했다. 화면에 보이던 `준비 중인 부록` 문구는 이 PDF에 없었다. [Drive 공개 검수 JSON](https://drive.google.com/file/d/1jSVJmZy2BwIetZtDqBWjktH7NlGFptDq/view), [PDF·7쪽 렌더/Apple Vision 원본값·재실행 코드 ZIP](https://drive.google.com/file/d/1zcW6zb94bqB6lRL0CQ4fkpXHEOA0Q0lb/view)을 기존 최종 3회 검수 폴더에 저장하고 크기·부모 폴더를 재조회했다. Mac 작업본은 `.private-work/last3-public-qa-20261019/`다. 이는 공개 정적 자산+합성 성적의 연결·PDF 검수이며 **실제 학생 로그인·성적·실물 종이 출력**까지 확인한 결과는 아니다.
- **관리자 ZIP 다운로드도 별도 검사했다.** 공개 관리자 정적 화면에 합성 성적·권한을 주입하고 `ZIP 한 개로 받기`를 실제 눌러 내려받은 파일을 열었다. 최종 3회 단독 ZIP에는 8쪽 PDF 1개가 있으며, 1~4쪽 진단·교재 연결, 5~6쪽 **2단×3행 유사문제 9개**, 7~8쪽 답·풀이 9개다. Apple Vision은 답 번호 1~9를 모두 읽었고 문제 2번 번호만 180dpi에서 놓쳐 PDF 5쪽을 직접 열어 확인했다. 최종 3회 단독 저장에는 `준비 중인 부록` 알림이 없다. 최종 3회와 4회를 함께 고른 ZIP에는 두 회차 PDF가 각각 들어 있고, 해당 알림은 **최종 4회 유사문제·풀이만** 가리킨다. 최종 3회 PDF의 문제·답안은 혼합 ZIP에서도 동일하게 존재함을 OCR로 재확인했다. 공개/로컬 관리자 QA 모두 통과, 운영 쓰기 0이다. [Drive 단독·혼합 ZIP 검수 JSON](https://drive.google.com/file/d/1Q2WghDHpAInK-mFbiA36CF-Qura0Y40s/view), [두 ZIP·내부 PDF·Apple Vision·재실행 코드 증거 ZIP](https://drive.google.com/file/d/1pxkaPLMxThLjp_CDfXYmUPPRvnQeYPtd/view)을 같은 검수 폴더에 보관했다. Mac 위치는 `.private-work/last3-admin-zip-public-20261019/`이며, `qa/admin-last14-batch-browser-validate.js`에 혼합 ZIP 회귀 검사를 추가했다. 실제 교사 계정 로그인과 실물 종이 인쇄는 별도다.

## 2026-10-19 중급 8회 현행 답안 90개 Apple Vision 전수 대조 (Mac, 최신)

- 현행 `compact` PDF(SHA-256 `d3a0559da53894db2ab4e4cfe2c606bff22cbe707effc3cfcd026878ddf174f6`)의 답안 34~51쪽을 300dpi로 다시 렌더해 Apple Vision `.accurate` 한국어·영어 OCR을 수행했다. 34쪽은 양면 인쇄용 빈 면이며, 35~51쪽에서 `답` 줄 **90개**를 추출했다. 각 답 줄과 같은 높이의 문항 제목 번호가 1~90번 순서로 1:1 대응함을 확인했다. 출력 답과 현행 문제은행(SHA-256 `5a785a313807e66dd05249622f78282d705100025cc248c17204baf8c95506e0`)의 저장 답을 Unicode NFKC·공백 제거·소문자화만 적용해 대조한 결과 **90/90 일치, 불일치 0**이다. 숫자와 문장부호는 비교에서 제거하지 않았다.
- [Drive 문항별 90행 대조 기록](https://drive.google.com/file/d/1nrwk88eZo5sWUWiSghKdc5dkMc0X1lST/view)과 [현행 PDF·18개 Vision 원본값·재실행 코드 ZIP](https://drive.google.com/file/d/1TN8VAkcdWSUtDev9Zg5xURaFxwh0_Juf/view)을 기존 검수 폴더에 저장하고 크기·부모 폴더를 재확인했다. Mac 재실행 파일은 `.private-work/middle8-20261018/full-print-vision-20261019/build-current-answer-ocr-audit.py`다. 이는 **출력 답 표기와 저장값의 일치** 검수이며 수학적 정답성·풀이·그림·실물 종이 출력·학생 로그인·9축 최종 승인을 뜻하지 않는다. 기존 보류 **198축**, 최종 승인 0축과 실물 종이 미검수는 유지한다. 코드·문항·채점·학생 기록은 변경하지 않았다.

## 2026-10-19 중급 8회 전체 PDF Apple Vision·18번 유형명 보정 (Mac, 최신)

- 메인 문제은행의 현행 `compact` PDF **51쪽**(표지1·문제32·답안18)을 300dpi로 모두 렌더해 Apple Vision `.accurate` OCR **51개**를 남겼다. 문제 제목 번호는 정확히 88/90개, 답안 제목 번호는 89/90개를 읽었다. 누락처럼 보인 문제 71·77번과 답안 71번은 실제 PDF 22·25·47·49쪽을 직접 열어 제목·내용이 있음을 확인했다. 400dpi 재판독에서도 Vision은 71을 `기.`/`7.`, 77을 `7.`로 오독했다. 따라서 OCR 숫자 인식 실패를 문제·답안 누락으로 세지 않으며, 나머지 수학 그림이나 실물 인쇄의 전체 합격으로 확대하지 않는다.
- 전체 OCR에서 **54번 지문은 일요일 날짜의 합**인데 표시 유형명은 `달력(토요일 날짜의 합)`임을 발견했다. 원본 PDF 3쪽 18번과 현행 52·53번은 토요일을 묻고, 54번은 일요일을 묻는다. 세 문항의 표시 유형명을 `달력(요일 날짜의 합)`으로 통일하고 이전 이름은 검색 별칭으로 보존했다. 승인된 지문·답·해설·그림·배점·채점·학생 기록은 바꾸지 않았다. 문제은행 SHA-256은 `5a785a313807e66dd05249622f78282d705100025cc248c17204baf8c95506e0`이다. 새 PDF 문제 16쪽의 52~54번 유형명과 각 요일을 Apple Vision 및 화면으로 확인했고, 문제은행·브라우저 90문항 검사가 `editorial`/`compact`, 개인연습 10/20/30문항, 운영 쓰기 0으로 통과했다.
- [Drive 51쪽 OCR·변경 전후 검수 JSON](https://drive.google.com/file/d/1_MI55UZcI9x6IYS0TyYj5X4N_RKuoM24/view), [두 PDF·51개 Vision 원본값·오독 쪽 캡처·재실행 코드 ZIP](https://drive.google.com/file/d/1Qa3wy9FBCthaaZL0rsjDOg-1lQ3bWeO7/view)을 기존 검수 폴더에 저장하고 크기·부모 폴더를 확인했다. 기존 [198축 Drive 검토표](https://drive.google.com/file/d/17pr6hzAEpCP4TtRXxlP3FMbvXH47MmdN/view)의 재생성기는 18·20번 유형명만 달라졌고 90문항의 수학·자산·승인은 불변임을 깊은 비교로 검사하도록 갱신했다. GitHub 메인 코드 커밋 `034c31857a05cd417d183e644b66c7f3298d30f3`의 Pages 실행 `39150989423` 성공 후 공개 문제은행 JSON·어댑터 JS를 HTTP 200으로 다시 받아 **두 파일 모두 로컬과 바이트·SHA-256 완전 일치**를 확인하고 [Drive 공개 배포 검수 기록](https://drive.google.com/file/d/1UKhIvLjtsBZtr_kFzt2vxyyL9lfGhUDd/view)에 저장했다. Mac 작업 위치는 `.private-work/middle8-20261018/full-print-vision-20261019/`이다. 기존 보류 198축·실물 종이 미검수는 유지한다.

## 2026-10-19 중급 8회 12번 현행 3문항 답 계약·Apple Vision 재검수 (Mac, 최신)

- 원본 문제 PDF 2쪽 12번의 지문과 첫 네 흑백 바둑돌 배열, 강의 답안 PDF 14쪽의 필기 `31−14＝17`을 직접 다시 열었다. **사용자 확정 원본 답 17개는 그대로 유지**한다. 현행 `compact` 문제지 7쪽의 34~36번(12·14·17번째)과 답안 40~41쪽을 300dpi로 렌더했다. Apple Vision `.accurate` OCR이 세 목표 순번과 출력 답 **13·15·18개**, 원본 답안의 `31-14=17`을 읽었다. 흑백 돌의 실제 색·개수는 OCR로 판정하지 않고 원본 그림을 직접 확인했다.
- 공개 세 문제는 동일한 원본 그림 크롭(SHA-256 `d59d80a5cfc8dc67997ab1bd8cc4b07c168a11d32bf7d091879b156acc8f5aa5`)을 사용한다. 첫 네 배열의 검은/흰 돌은 `1/3·6/3·6/10·15/10`이다. 마지막 줄·열을 같은 색으로 번갈아 더하는 규칙을 **격자 생성과 테두리 합산 두 방식**으로 1~17번째 검산하면 현행 세 답 13·15·18개는 일치한다. 같은 규칙의 원문 15번째는 16×16, 검은 120·흰 136으로 차가 **16개**다. 따라서 공개 유사문제의 규칙과 사용자 확정 원본 답 17개 사이의 동등성은 아직 증명되지 않았다. 원본 판정·공개 채점·학생 기록은 바꾸지 않으며 12번 보류 **18축**과 전체 9축 최종 승인 0축을 유지한다.
- [Drive 현행 답 계약 검수 JSON](https://drive.google.com/file/d/1zg_j6DE8vXQfSwHD_ENzSlhWrnPMv52w/view), [원문·답안·현행 PDF 캡처·Apple Vision 원본값·재실행 코드 ZIP](https://drive.google.com/file/d/1U2KiXwKY0FI-4uedYD-U1pdFtSq2K2JQ/view)을 기존 검수 폴더에 저장하고 크기·부모 폴더를 확인했다. 기존 [26개 원문·198축 Drive 검토표](https://drive.google.com/file/d/17pr6hzAEpCP4TtRXxlP3FMbvXH47MmdN/view)와 CSV·재생성 ZIP을 같은 ID로 갱신해 12번에 이 근거를 연결했다. Mac 재실행 스크립트는 `.private-work/middle8-20261018/q12-current-parity-20261019/build-current-contract-audit.py`다. 다음 판정은 원본 답 17개와 다른 계산 규칙을 연결할 수 있는 원문 해석·정오표 여부이며, 기존 사용자 판정을 다시 묻지 않는다.

## 2026-10-19 중급 8회 24번 원문 격자·계산 분기 직접 대조 (Mac, 최신)

- 원본 문제 PDF 4쪽의 24번 지문과 불규칙 연못 두 개가 격자선을 가리는 그림을 직접 다시 열었다. 원본 320dpi 그림에서 온전한 선분을 픽셀로 분리해 아래 왼쪽 (가)→위 오른쪽 (나)의 최단 경로를 독립 누적 계산했다. 검출 임계값 80~98%에서 원문 답은 모두 **62경로**였고, 강의 답안 27쪽의 필기 답 `62` 및 윗줄 부분합 `11·21·31·41·51·62`와 직접 대조해 일치했다. Apple Vision `.accurate` OCR은 원문 지문·(가)/(나)는 읽었지만 손글씨 숫자와 통행 가능한 선분은 안정적으로 판독하지 못하므로 그 판단에 사용하지 않았다.
- 원문에는 열린 선분 **55개**, 실제 경로에 기여하는 합산 교점 **12개**가 있다. 승인된 현행 24번 세 유사문제의 SVG 선분을 별도로 파싱하면 열린 선분 **62·64·59개**, 합산 교점 **20·21·18개**, 최단 경로 **60·61·63개**로 저장 답과 일치한다. 답의 크기는 비슷하지만 계산 분기가 원문보다 많다는 정량 근거다. 타원형 장애물의 시각 단서·연령별 난도·실물 종이 가독성을 이 수치만으로 승인하지 않고, 기존 24번 보류 **15축**과 전체 9축 최종 승인 0축을 유지한다. 유사문제·그림·정답·채점·학생 기록은 변경하지 않았다.
- [Drive 원문·변형 격자 비교 JSON](https://drive.google.com/file/d/1pcdfhLuMZROnbBtW3huT-EYMOYrr61YY/view), [원문/답안 캡처·Apple Vision 원본값·SVG·재실행 코드 ZIP](https://drive.google.com/file/d/1MlQQNSmN_de9XU4GFtSBChku3iAyIf3f/view)을 기존 검수 폴더에 저장하고 크기·부모 폴더를 확인했다. 기존 [26개 원문·198축 Drive 검토표](https://drive.google.com/file/d/17pr6hzAEpCP4TtRXxlP3FMbvXH47MmdN/view)와 CSV·재생성 ZIP을 같은 ID로 갱신해 24번에 새 근거 링크와 계산 분기 비교를 연결했다. Mac 재실행 스크립트는 `.private-work/middle8-20261018/q24-graph-comparison-20261019.py`다. 다음 판정은 학생 풀이 부담과 실제 종이 인쇄의 직접 검토다.

## 2026-10-19 중급 8회 20번 유형명·Apple Vision 인쇄 PDF 검수 (Mac, 최신)

- 원본 문제 PDF 4쪽의 20번 지문·주사위 그림을 다시 확인했다. 원문은 바닥면의 합을 묻지만 승인된 현행 유사문제 58~60번은 각각 윗면·앞면·오른쪽 면을 묻는다. 기존 출력 유형명 `주사위를 굴렸을 때 바닥 눈의 합`은 세 지문과 달라, 표시 유형명과 세 문항의 분류만 `주사위를 굴렸을 때 면의 눈의 합`으로 바로잡고 이전 유형명을 검색 별칭으로 남겼다. 승인된 문제 지문·정답·해설·그림·채점·학생 기록은 바꾸지 않았다. 문제은행 SHA-256은 `1149cacf48a1036683863d826822f654e42cd1db9dc2e20b8c8436a91de6ba35`다.
- `compact` PDF 18~20쪽을 300dpi로 렌더하고 Apple Vision `.accurate` OCR로 세 새 유형명과 각 면의 물음을 확인했다. 문제은행·브라우저 검사는 90문항, `editorial`/`compact`, 개인연습 10/20/30문항, 운영 쓰기 0으로 통과했다. 이는 유형명과 출력 연결의 확인이다. 원문과 현행 유사문제의 면·집계 계약 차이는 그대로이며 20번의 9축 보류 **19개**, 전체 최종 승인 0축, 실물 종이 미검수를 유지한다.
- [Drive 유형명·OCR 검수 JSON](https://drive.google.com/file/d/1pY1QA669rpl9w5Hw0zS92qNoydfMmBGq/view), [변경 전후 OCR·300dpi 출력·재실행 코드 ZIP](https://drive.google.com/file/d/1XcN_Dd_pcHg9C3MnXDA3gDWYfhSTG7B-/view)을 기존 검수 폴더에 저장하고 크기·부모 폴더를 확인했다. Mac 재실행 위치는 `.private-work/middle8-20261018/q20-current-ocr-20261019/`이다. GitHub 메인 코드 커밋 `68266bec4ff0ed4b70d06c1a061e2d38c4db024f`의 트리·파일 해시를 로컬과 대조했다. Pages 실행 `39149485795` 성공 후 공개 사이트의 문제은행 JSON·어댑터 JS를 HTTP 200으로 받아 **두 파일 모두 로컬과 바이트·SHA-256 완전 일치**를 확인하고 [Drive 공개 배포 검수 기록](https://drive.google.com/file/d/1s-ZFxx5VjN-TuOTEvaZTSQWBoxZYhgiO/view)에 저장했다. 실제 학생 로그인과 실물 인쇄는 별도다.

## 2026-10-19 중급 8회 30번 현행 인쇄 PDF·숨은 블록 모델 검수 (Mac, 최신)

- 사용자 확정 **원본 30번 답 120개**를 유지한 채 원본 문제 PDF 6쪽의 지문·두 쌓기나무 `20개` 예시·오른쪽 13개 모양을 직접 확인했다. 현행 `compact` PDF 31~33쪽(88~90번)을 300dpi로 렌더해 세 원본 예시와 새 입체 그림을 화면에서 확인했고, Apple Vision `.accurate` OCR이 세 지문에서 각각 `20개`·`13개`를 읽었다. 답안 50~51쪽 OCR은 저장 답 `102·101·104개`와 방향별 개수 `41+30+31`, `40+30+31`, `42+30+32`를 읽었다. 13개 블록의 좌표에서 단위 변을 독립적으로 합쳐 세 저장 답과 다시 일치했다.
- 새 그림의 실제 SVG 면 생성 규칙을 좌표별로 검사하면 1번 변형은 13개 블록 모두 적어도 한 면이 별도로 그려지지만, 2·3번 변형에는 `(3,0,0)` 받침 블록 **1개씩이 별도 노출 `+x/+y/+z` 면 없이 포함**된다. 이는 곧 답이 틀렸다는 뜻이 아니라 학생이 그림·`13개` 조건·쌓기 규칙으로 해당 위치를 추론해야 한다는 검수 지점이다. 현재 답안은 세 방향 합계만 제시하고 그 블록과 단위 변을 표시한 풀이 그림은 없으므로 학생의 유일한 입체 복원·풀이 이해를 별도로 확인해야 한다. 원본 대비 9축 보류 **21개**, 실물 인쇄 미승인 상태를 유지한다. Apple Vision은 입체 접촉·가려진 변을 판정하지 않으며 Mac에 등록 프린터가 없다.
- [Drive PDF·좌표·판독 검수 JSON](https://drive.google.com/file/d/11Qgvwdww2C4H3Zfzw1kjFPB04wvk4FlY/view), [문제 300dpi·답안 캡처·Apple Vision 원본값·재실행 코드 ZIP](https://drive.google.com/file/d/1ZsQpwuuNahqXgcWoHqo6yk4kBBjJdfwp/view)을 기존 검수 폴더에 저장하고 크기·부모 폴더를 재조회했다. Mac 실행 위치는 `.private-work/middle8-20261018/q30-current-print-20261019/`이다. 원본 답·공개 문항·채점·학생 기록은 바꾸지 않았다.

## 2026-10-19 중급 8회 14번 현행 3문항 Apple Vision·경우 전수 검수 (Mac, 최신)

- 원본 문제 PDF 3쪽의 **14번 지문·빨강/노랑/초록 신호등 그림**과 강의 답안 16쪽의 `7가지`를 직접 다시 확인했다. 원본의 3개 불은 독립적으로 켜지거나 꺼지며 모두 꺼짐만 제외한다. 현행 `compact` PDF 12쪽의 40~42번 유사문제 3개를 300dpi로 렌더해 화면과 Apple Vision `.accurate` OCR로 각각 읽었다. 40번은 빨강·노랑 동시 켜기 금지, 41번은 켜진 불 2개 이하, 42번은 노랑을 켜면 초록도 켜야 한다는 **원본에 없는 조건**이 현행 출력에 모두 있다. 카드 확대 OCR은 일부 `초록색`을 `초색`으로 오독해 전체 페이지 OCR과 직접 화면 판독으로 교차 확인했다.
- 3개 불의 켜짐/꺼짐 8가지 상태를 전수 열거했다. 원본은 7가지, 변형은 각각 원본 상태에서 2·1·2가지를 더 제외해 **5·6·5가지**이며 저장 답과 일치한다. 따라서 각 변형의 `reasoningSteps`·`conditionTracking`·`caseSplit` **3축씩, 합계 9축은 원본과 구조가 다름이 확인**됐다. 기존 14번 보류 25축은 해제하지 않으며 9축 최종 승인도 0이다. 사용자 승인 문항·채점·성적은 변경하지 않았다. 현재 그림은 세 색을 표시하지만 추가 제한을 그림에서 설명하지 않으며, 그림 색·워터마크·실물 출력은 OCR 통과만으로 승인할 수 없다.
- [Drive 조건·경우별 검수 JSON](https://drive.google.com/file/d/1CiZ4q7LLlS0ob0xFg-UFbYNMjuRGAzPo/view), [현행 300dpi 카드·OCR 원본값·재실행 코드 ZIP](https://drive.google.com/file/d/1IfnPqHSp10dbtvH1WZrZ2DWZCKLD324i/view)을 기존 검수 폴더에 저장하고 크기·부모 폴더를 확인했다. Mac 재실행 위치는 `.private-work/middle8-20261018/q14-current-ocr-20261019/`다. 다음 9축 동등성 판단에는 원본과 같은 독립 3불 계약으로 유사문제 3개를 재설계해 다시 대조해야 하며, 현재 Mac에는 등록된 프린터가 없어 종이 인쇄 판정은 남는다.

## 2026-10-19 중급 8회 22번 Apple Vision·현행 인쇄 PDF 재검수 (Mac, 최신)

- Mac `main`의 문제은행 SHA-256 `14875841a9e6173c7384e599423fab559b308939b2b3b2f51f4c7cc764cea126`을 고정하고 원본 문제 PDF 4쪽의 **22번 지문과 실제 네 삼각형**을 직접 다시 열었다. 원본 꼭짓점은 `2·3·4`, `3·4·5`, `6·7·8`, `7·8·9`로 모두 연속수다. 공개 은행의 22번 변형 그림 래스터 3개를 바이트 해시로 대조했고, 각 그림·`compact` PDF 21쪽(64~66번)을 화면에서 직접 확인했다. 유사문제 꼭짓점의 연속수 배열은 각각 4개 중 2·1·1개뿐이어서 원본의 시각적 규칙 발견 단서와 다르다.
- Apple Vision OCR은 원본 PDF를 400dpi로 렌더한 22번 확대 그림에서 숫자 **8/15개**만 읽었다. 공개 `compact` PDF의 같은 세 그림은 200dpi에서 각각 **9/15·6/15·5/15개**, 300dpi에서 각 삼각형 숫자 대조 **45/45개**를 읽었다. 이는 디지털 PDF 확대 판독의 근거이며 실물 종이 인쇄 합격을 뜻하지 않는다. 독립 곱셈으로 원문 물음표 `7×8×9=504→4`, 세 변형 `4×7×9=252→2`, `4×8×9=288→8`, `2×7×9=126→6`을 확인해 저장 답 `2·8·6`과 일치했다.
- [Drive 판독·계산 요약 JSON](https://drive.google.com/file/d/1mf0T5Q9BA4NCNLLtnCwKYefabe8_cA1a/view), [원본·현행 그림 크롭, OCR 원본값, 재실행 코드 ZIP](https://drive.google.com/file/d/1MRdPuWVqVH5kAzYltfywXKQKXKksHDG2/view)을 기존 검수 폴더에 저장하고 파일 크기·부모 폴더를 재조회했다. Mac 재실행 파일은 `.private-work/middle8-20261018/q22-current-ocr-20261019/`에 있다. 3변형의 `reasoningSteps`·`calculationLoad`·`visualCue`·`accidentalShortcut` **12축은 계속 보류**한다. `lpstat -p`에 등록 프린터가 없어서 실물 출력은 미검증이다. 문제은행·원본 그림·정답·학생 기록은 바꾸지 않았다.

## 2026-10-19 중급 8회 현행 공개본 198축 보류 검토 순서표 (Mac, 최신)

- 현재 문제은행 SHA-256 `1149cacf48a1036683863d826822f654e42cd1db9dc2e20b8c8436a91de6ba35`와 810축 재연결 기록을 대조해 **26개 원문·64개 변형의 보류 198축**을 문항별 검토표로 정리했다. 810축 재연결 당시 문제은행은 SHA-256 `14875841a9e6173c7384e599423fab559b308939b2b3b2f51f4c7cc764cea126`이며, 현재본과의 차이는 20번 표시 유형명·검색 별칭뿐임을 전 문항 깊은 비교로 검사했다. 각 행에는 원문 PDF 쪽수, 해당 변형 ID, 축별 보류 수, 현재 위험 표시, 원문 직접 대조·Apple Vision/계산 기록의 Drive 링크, 기존 근거 문장과 다음 판정 사항을 넣었다. 직접 대조 파일 **23개**의 로컬 SHA-256을 기록값과 재검사했고, 원문 쪽수·Drive 직접 대조 링크·계산/OCR 링크가 빠진 행은 0개다. [26행 Drive CSV](https://drive.google.com/file/d/1vhyK_Tk1-JluOTBIJ8EX_lcWO5i_MWUP/view), [198축 상세 JSON](https://drive.google.com/file/d/17pr6hzAEpCP4TtRXxlP3FMbvXH47MmdN/view), [로컬 재생성 코드 포함 ZIP](https://drive.google.com/file/d/19wqWfJHn8cjCo2znwhyTdV_7YRDExKCW/view)을 기존 검수 폴더에 갱신하고 크기·부모 폴더를 재확인했다. Mac 실행본은 `.private-work/middle8-20261018/build-held-review-queue-20261019.py`와 `held-review-queue-20261019`에 둔다.
- 보류 축이 많은 순서는 14번25, 30번21, 20번19, 12번18, 24번15, 22번12축이다. **12번 원본 답17개·30번 원본 답120개는 사용자 판정대로 유지**하고 같은 판정을 다시 요구하지 않는다. 검토표 작성은 기존 612축을 최종 통과로 바꾸거나 198축 보류를 해제하지 않았다. 전체 9축 최종 승인0·실물 종이 승인0이며 문제은행·채점·학생 기록은 변경하지 않았다.

## 2026-10-19 중급 8회 13번 원본 그림·워터마크 인쇄 가독성 보정 (Mac, 최신)

- 현행 중급 8회 `compact` 13번의 원본 필수 그림(은행 내 원본 래스터 SHA-256 `5f4d32557ece8cb40820dde1859705692ecfe6fcd4af3eb2f5bd30b698802b55`)은 여섯 예시 격자 아래의 `1·2·4·5·13·24`가 작은 획으로 인쇄된다. 400dpi PDF 확대에서 페이지 워터마크가 격자와 숫자 위를 지나갔다. `bank/final1-worksheet.css`에서 **중급 8회 큰 그림 페이지의 본문 층을 워터마크 위로 올리고 13번 원본 그림 상자만 흰 배경**으로 두어 격자 위 워터마크를 제거했다. 페이지 나머지 부분의 워터마크와 원본 그림 바이트·지문·답은 유지한다.
- Apple Vision은 400dpi 예시 부분 확대 전에는 `2·4·|3·24`, 보정 후에는 `2·4·5·| 3·24`를 읽었다. `1`과 원본 래스터의 좁은 `13`은 여전히 안정적으로 판독하지 못하므로 OCR 전체 통과나 실물 종이 가독성 승인으로 세지 않는다. [Drive 비교 요약](https://drive.google.com/file/d/1QfcWnWa8pXNeoLAy9A0haUL5lYsnCzhf/view)과 [원본 그림·변경 전후 400dpi 그림·OCR·보정 후 51쪽 PDF·브라우저 결과 ZIP](https://drive.google.com/file/d/1a1fq4wpIbfEn14VygwBotR8TcCGTMHOC/view)을 기존 중급 8회 검수 폴더에 보관했다.
- `qa/bank-middle8-browser-validate.cjs`는 90문항·답안, `editorial`/`compact`, 390px, 개인 10/20/30문항, 잘림0·운영 쓰기0으로 통과했다. `qa/middle8-reviewed-bank-validate.js`도 통과했고 문제은행 SHA-256은 `14875841a9e6173c7384e599423fab559b308939b2b3b2f51f4c7cc764cea126` 그대로다. 실제 프린터 출력과 9축 최종 검수는 남는다.
- 학생 브라우저의 이전 CSS 캐시를 피하려고 `bank/index.html`의 CSS 버전 주소를 `20261019-middle8-q13-figure-clear`로 갱신했다. 공개 사이트의 `bank/index.html`과 그 화면이 지정하는 버전 URL의 `bank/final1-worksheet.css`가 GitHub `main` 코드 커밋 `0032983c90da5a3b9e12f4a64f037d952743744e`의 파일과 **각각 HTTP 200·SHA-256·바이트 일치**함을 확인했다. [Drive 공개 배포 검수 기록](https://drive.google.com/file/d/1aADaW00gR9H8qDT7LUI3ogPDGrUNWFAn/view). 이는 정적 배포 확인이며 실제 학생 로그인·실물 종이·9축 승인은 별도다.

## 2026-10-19 최종 3회 공개 사이트·GitHub main 정적 파일 대조 (Mac, 최신)

- 공개 주소 `https://hs.gfieldacademy.net`에서 최종 3회 학생 화면·관리자 화면·진단/학습 연결·출력·문제은행 관련 **17개 정적 파일**을 HTTP 200으로 읽어 현 GitHub `main` (`bfde56dc3ed3e8534d1f820775cb1f8dc1b5fc08`)의 Mac 작업본과 크기·SHA-256·바이트를 대조했다. **17/17 완전 일치**했다. `admin-final-batch.js`의 임의 캐시 확인 URL은 처음에 503이었으나 관리자 화면이 실제 지정한 버전 URL은 200으로 정상 응답하고 로컬 파일과 일치했다. [파일별 Drive 검수 기록](https://drive.google.com/file/d/1surMARecTyh3VeOiDYQFtJxrwq6BVTVp/view)에 URL·해시·크기·판정 경계를 보관했다.
- 이로써 앞서 로컬 합성 성적에서 확인한 유사문제 0/3/6/9개, 권장 학습 연결, 기본 ZIP 문제·답안 9개를 만드는 **정적 자산의 공개 배포**는 확인됐다. 실제 학생 계정의 성적 데이터·인증 세션·서버 상태와 실물 인쇄는 이 바이트 대조만으로 확인되지 않는다. 코드·문항·채점·학생 기록은 변경하지 않았다.

## 2026-10-19 제작 기준 Drive 출처 정정·중급 8회 14번 판정 경계 (Mac, 최신)

- 사용자가 제작 기준 링크로 준 Drive ID `1LjpYZDs74UiI2wrbMi7ME3jWxILTck71`을 메타데이터로 확인한 결과, `GFIELD_QUESTION_BANK_PRODUCTION_STANDARD_20260913.md` 파일이 아니라 `생각하는 황소 초등 선발 대비 중급 모의고사` **폴더**다. 이 폴더는 원문·답안 확인에 사용하고, 제작 기준 원본으로 인용하지 않는다. 파일명 `GFIELD_QUESTION_BANK_PRODUCTION_STANDARD`와 `PRODUCTION_STANDARD_20260913` 검색에서 원본은 발견되지 않았다. Mac 전달본 2.7(2026-09-20, SHA-256 `6044b894b8f58b94cfaff5dd331e7367f76e44f70076be7facee443a77499b18`)은 [Drive에 출처 표시된 참고 사본](https://drive.google.com/file/d/1HJTPi1tNBCzjM_R4Ui_H9jBB_4CNrgtH/view)으로 보존했다. Drive 원본의 동일성·최신성은 확인되지 않았다.
- 중급 8회 14번 원문은 신호등 세 불의 독립 켜짐/꺼짐에서 모두 꺼짐만 빼 **7가지**다. 현행 승인 유사문제 세 개는 각각 원문에 없는 추가 제한을 두어 독립 검산 답이 **5·6·5가지**이고, 직접 대조 기록에서 관련 25축을 보류했다. 사용자의 90문항 콘텐츠 승인과 새 그림 허용은 유지하지만, 이 세 문항을 원문 난도 동등성·9축 최종 승인으로 승격하지 않는다. 공개 문제은행·답·채점·학생 성적은 바꾸지 않았다. 근거는 기존 14번 직접 대조와 이번 [Drive 출처·판정 경계 기록](https://drive.google.com/file/d/1CCT9-gsH5qYX1THdICNvH-IkK028hfZi/view)을 함께 본다.
- Apple Vision `.accurate` 한국어·영어 OCR로 원문 문제 PDF 3쪽, 원문 답안 16쪽 캡처, 현행 14번 v1 문제 카드를 다시 판독했다. 원문에서 세 불 조건과 원답 `7가지`, 현행 v1에서 빨간불·노란불 동시 켜기 금지 문장을 확인했다. OCR 원본 JSON·세 이미지·판독 한계는 [Drive 근거 ZIP](https://drive.google.com/file/d/139Bcdxx3hG476UWHDQCStUFRPUJN-o3i/view)에 보관했다. OCR은 v2·v3의 그림과 실물 인쇄 또는 난도 동등성을 증명하지 않는다.

## 2026-10-19 중급 8회 메인 PDF 전 페이지 Apple Vision OCR (Mac, 최신)

- 현행 `compact` A4 PDF 51쪽에서 문제 2~33쪽(32쪽), 양면 인쇄용 빈 면 34쪽, 답안 35~51쪽(17쪽)을 확인했다. Apple Vision `.accurate` 한국어·영어 OCR을 200dpi 렌더링 문제·빈 면·답안 50쪽에 실행했다. 문제 번호 1~90 중 89개, 답안 번호 1~90 중 89개가 자동 후보로 검출됐다. 양쪽에서 빠진 **71번은 실제 페이지에 존재**하며 문제 22쪽은 `기.`로, 답안 47쪽은 `7.`로 오독했다. 답안 47쪽을 300dpi로 다시 읽으면 `71.`이 검출된다. 빈 면 34쪽은 OCR 문자 0개이고 답안은 홀수 쪽인 35쪽에서 시작한다.
- 문제 22·24·31쪽과 답안 39·47쪽, 빈 면 34쪽을 렌더링에서 직접 확인했다. 이 번호 검사는 모든 문장·그림의 정확성이나 실물 종이 가독성을 증명하지 않는다. 답안 OCR에는 풀이 단계 번호가 문항 번호처럼 섞일 수 있어 후보와 실제 화면을 함께 확인했다. [전 페이지 OCR 기록](https://drive.google.com/file/d/1uSTPHIZIV_ItZjc6Ldy5Td63CfcqKl7Z/view), [메인 PDF·전 페이지 OCR JSON·대표 렌더링 ZIP](https://drive.google.com/file/d/1AQQDz5BZwZ59mn1bQYtFXiESDomp9qjN/view)을 기존 중급8회 Drive 검수 폴더에 저장하고 크기·부모 폴더를 확인했다. 로컬 실행 파일은 `.private-work/middle8-20261018/full-print-vision-20261019`에 보존한다. 문제은행 SHA-256 `14875841a9e6173c7384e599423fab559b308939b2b3b2f51f4c7cc764cea126`와 코드·성적은 변경하지 않았다. 9축·실물 종이·학생 풀이 최종 검수는 남는다.

## 2026-10-19 최종 3회 메인 진단 ZIP·Apple Vision 재확인 (Mac, 최신)

- 현 main `241d4f30211f4168360e209de868115038ac9fc2`에서 승인 고정은행 90문항 검사, 학생 진단의 오답 0/1/2/11개별 유사문제 0/3/6/9개와 권장 학습 연결, 관리자 최종 3회 ZIP을 합성 공식 성적으로 다시 실행했다. ZIP의 A4 8쪽 PDF는 요약 4쪽 뒤에 문제 1~9번 2쪽과 답안·풀이 1~9번 2쪽이 있다. 기본 저장에서 `준비 중인 부록` 안내가 없고 운영 쓰기 0건이다. 최종 3회 원문 30문항 상세 풀이는 여전히 별도 준비 상태다.
- 이 ZIP PDF를 200dpi로 렌더링해 Apple Vision OCR로 문제·풀이 번호 1~9의 각 1회 검출과 요약 4쪽의 28·29·30번 `권장 학습 위치`·`학습 포인트` 열을 확인했다. 도형·일부 기호·줄바꿈은 OCR이 오독하므로 렌더링 페이지를 직접 확인했다. [OCR·검수 기록](https://drive.google.com/file/d/1gKBv5xz74dJdx1chz0kyvciR0AU52VaP/view), [현재 ZIP PDF·페이지 이미지·OCR 근거](https://drive.google.com/file/d/1LyMmH4vcw5e9M9niGBycp6yYPutornir/view)는 기존 최종3회 Drive 검수 폴더에 저장하고 크기·부모 폴더를 확인했다. 로컬 실행 파일은 `.private-work/last3-batch-qa-20261019`에 보존하며 제품 코드·승인 문항·학생 데이터는 변경하지 않았다. 이 검사는 합성 학생의 로컬 출력으로, 실제 학생 계정과 실물 종이 출력의 확인은 별도다.

## 2026-10-19 중급 8회 메인 인쇄·Apple Vision OCR 비교 (Mac, 최신)

- 현행 메인 문제은행 `compact` A4 PDF는 90문항의 문제 부분이 32쪽이다(표지·답안 포함 전체 51쪽). 기본은 2단×3행 6문항이고 긴 지문·그림으로 넘칠 때는 4·3·2문항으로 재배치한다. 큰 원본 그림의 읽기·칠하기를 위한 13·17·20·26·27·30번 18문항은 각각 단독 쪽이다. 내용 넘침 검사만으로 `모든 쪽 6문항`이라고 주장하지 않는다. 별도 15쪽 `variant-all-six-up-proof.pdf`는 학생 배포 금지 비공개 조판 시안이며 현행 메인 출력이 아니다.
- 두 PDF의 13번·27번 해당 쪽을 같은 200dpi로 렌더링하고 Apple Vision `VNRecognizeTextRequest(.accurate, ko-KR/en-US)`로 대조했다. 13번의 6문항 시안은 지문은 읽었지만 예시 격자의 숫자 라벨을 검출하지 못했고, 현행 큰 그림 쪽은 여러 라벨을 검출했다. 27번은 양쪽에서 규칙 숫자 일부가 검출됐지만 특수 연산 기호를 잘못 읽었다. OCR은 칠한 칸·도형 선·기호의 정확한 구조를 증명하지 못하므로 그림 원본과 실물 종이 확인을 대신하지 않는다. **큰 그림 예외를 유지하고 6문항 강제 축소는 적용하지 않았다.**
- [비교 기록 JSON](https://drive.google.com/file/d/19uZG3uLTcI5ZiH5-0uDpAapNGdzzqPM3/view), [두 PDF의 렌더링·Vision 판독 ZIP](https://drive.google.com/file/d/12bfyqadPnny1tq4czQ3QzroAaLjHIjW8/view)을 기존 중급8회 Drive 검수 폴더에 저장하고 크기·부모 폴더를 재조회했다. Mac 로컬 실행 파일은 `.private-work/middle8-20261018`에 보존한다. Git 변경은 이 인수인계뿐이며 문제은행 SHA-256 `14875841a9e6173c7384e599423fab559b308939b2b3b2f51f4c7cc764cea126`와 학생 성적은 변경하지 않았다. 실제 종이 프린터 출력과 9축 최종 판정은 남는다.

## 2026-10-19 중급 8회 현행 공개본 90문항·810축 검수 근거 재연결 (Mac, 최신)

- 기존 9축 작업표는 비공개 초안 기반 `미검수622·보류188`의 과거 시점 기록이다. 현재 공개 문제은행 SHA-256 `14875841a9e6173c7384e599423fab559b308939b2b3b2f51f4c7cc764cea126`의 **90문항 지문·원답·그림 원본 해시가 최종 초안과 일치**함을 검증하고, 문항마다 기존 직접 대조 25개 기록과 Apple Vision·독립 계산 11개 기록을 연결했다. Drive의 직접 대조 파일 25개는 파일명·크기·부모 폴더, 계산/OCR 기록 11개는 기존 파일 ID·부모 폴더를 재조회했다. 1~3번 계산 기록은 Drive 저장명이 한글이지만 로컬 기록과 크기가 일치한다.
- 직접 기록 810축을 현행 공개 문항에 재배치한 결과 **원문 대조상 일치 추정 612축, 보류 198축, 최종 승인 0축**이다. `추정`은 합격이 아니다. 독립 계산에서 저장 답과 일치한 변형은 87개이고, 12번 3개는 사용자 확정 원본 답17과의 답 기준 연결을 보류했다. 8번 3개에는 강의 답안 화면의 상충 계산을 별도 위험으로 표시했다. 현재 은행의 `verified`·`teacherApproved` 90개는 사용자 콘텐츠 승인과 공개 연결 상태이며, 9축·실물 종이·학생 풀이 최종 통과를 뜻하지 않는다. 보류가 많은 원문은 14번25축, 30번21축, 20번19축, 12번18축, 24번15축이다.
- [현행 90문항 요약·810축 근거 JSON](https://drive.google.com/file/d/1DiqaLYkl8xkoogtlodJFRYaM_BMIQOk4/view), [810축 CSV](https://drive.google.com/file/d/17JVC70bJ1-vZg0Zxk8k60eeB2mqepGdj/view), [재실행 코드·기존 검수·브라우저 결과 ZIP](https://drive.google.com/file/d/1ZjrbAIpXU9LxZ0jIXZQzXGB0H_y0NIuK/view)을 기존 중급8회 Drive 검수 폴더에 저장하고 크기·부모 폴더를 확인했다. `qa/middle8-reviewed-bank-validate.js`와 `qa/bank-middle8-browser-validate.cjs`는 통과했다. 브라우저 검사는 문제·답안90개, compact/editorial 그림 로드·잘림 없음, 개인 문제지10·20·30개, 운영 쓰기0건을 확인했다. 13·20·30번 공개 카드도 캡처를 직접 확인했다. **문제은행·채점·성적은 변경하지 않았다.** 다음은 보류 축의 원본 대비 단계·시각 단서 판단과 실물 종이 검수다.
- `QUESTION-BANK-QUALITY-STANDARD.md`에 남아 있던 전달본 2.4 표기를 현재 Mac에서 실제 읽은 비공개 기준본 **2.7·2026-09-20** 및 SHA-256 `6044b894b8f58b94cfaff5dd331e7367f76e44f70076be7facee443a77499b18`으로 바로잡았다. 이 전달본의 Drive 동일 파일 ID는 확인되지 않았고 원본 최신성은 별도다. 기준 버전 정정은 810축의 최종 통과를 뜻하지 않는다.

## 2026-10-19 중급 8회 HWP 내장 그림·현 PDF 판본 차이 확인 (Mac, 최신)

- Drive 원본 폴더의 중급8회 HWP(`1rR7RlwGsfuR05RaERc5Ae_J0WPxNTCFt`)를 손상 없이 OLE 스트림으로 열어 내장 이미지 21개의 원래 픽셀·해시를 목록화했다. **HWP와 현재 문제 PDF(`1Amns6ph5BjSFXVWW826ZGOrj7-JwO2o5`)의 지문은 같은 판본이 아니다.** HWP 내장 12번 그림의 지문은 직접 보면 `13번째`인데 현재 PDF 2쪽 지문은 `15번째`다. Apple Vision은 HWP의 앞자리 `1`을 놓쳐 `3번째`로 읽었으므로 그림 직접 확인으로 판정했다. HWP 내장 20번 문장은 `색칠된 6개의 칸`을, 현재 PDF 4쪽은 **시작한 면을 포함한 바닥면**을 묻는다. 두 문장의 집계 범위가 다르다.
- 따라서 현재 공개 문제은행의 문항 번호·조건·답안 대조는 사용자가 지정한 **현 PDF와 강의 답안 PDF**를 기준으로 유지한다. HWP 내장 그림에서 글자나 도형을 가져올 때도 해당 PDF 문항과 다시 대조한다. HWP를 고해상도 PDF 원본이나 현재 지문 대체본으로 간주해 그림·답·채점을 바꾸지 않는다. [내장 이미지 목록·판본 대조 기록](https://drive.google.com/file/d/1ZYOd6JhBKX7umfzTETzvD1S85tIJfuX1/view), [추출 그림·Apple Vision·재실행 코드 ZIP](https://drive.google.com/file/d/16dxEz618zMm5razyn_DpWCl_95c36E4L/view)을 기존 중급8회 Drive 검수 폴더에 저장하고 크기·부모 폴더를 재조회했다. 원본·공개 문제은행·성적은 변경하지 않았다.

## 2026-10-19 중급 8회 12번 Apple Vision 원본·공개 그림 판독 경계 (Mac, 최신)

- Apple Vision이 원본 문제 PDF 2쪽의 `15번째`와 강의 답안 14쪽의 손글씨 계산 `31-14 = 17`을 읽었다. 원본과 공개 그림 크롭에서는 `첫 번째`~`네 번째` 표제만 읽고 흑백 바둑돌의 개수·연장 규칙은 판독하지 못했다. 원본 그림을 직접 보면 앞의 네 배열에서 두 색의 개수 차는 2·3·4·5다. 공개 세 문제는 원본 그림 크롭 바이트가 동일하고 12·14·17번째 저장 답 13·15·18이 이 초기 네 배열의 단순 연장과 맞는다. **사용자 확정 원본 답 17개를 유지**한다. 원본 답의 계산 계약이 이 단순 연장과 연결되는지는 확인되지 않아 12번 3개를 최종 수학·9축 승인으로 세지 않는다. 원본 답·채점·학생 데이터는 변경하지 않았다.
- [원본·공개 OCR 및 해시 기록](https://drive.google.com/file/d/1BCYPphwATgPpOT-spZEjNW1LSPibCyRb/view), [재실행 코드·원본·공개 그림·OCR 근거 ZIP](https://drive.google.com/file/d/1crT9cpOWJu6BlpIHCemZtEZTBXigHrnW/view)을 기존 중급8회 Drive 검수 폴더에 보관하고 크기·부모 폴더를 재조회했다. OCR은 도형의 수학 관계 판정 근거가 아니며 직접 그림 판독·실물 인쇄·학생 풀이 검수가 남는다.

## 2026-10-19 중급 8회 26~30번 원문·승인본 독립 수학·Apple Vision 재검수 (Mac, 최신)

- 원본 문제 PDF 5~6쪽과 강의 답안 29~33쪽을 직접 열어 공개 유사문제 15개를 확인했다. 26번은 아래줄 23·27·29개의 성냥개비 합 828·1134·1305, 27번은 세 기호의 연산 규칙을 적용한 유일한 양의 정수 답 24·64·90, 28번은 사용자 확정 ‘숫자 9가 n개’ 해석에서 12·18·21개의 제곱 자릿수 합 108·162·189, 29번은 모든 양의 연속 자연수 표현의 최장 길이 첫 수 4·3·2를 독립 계산했다. **26~29번 12문항의 저장 답이 일치**했다. 28번 공개 그림의 `12개`·`18개`·`21개` 표기는 Apple Vision이 각 그림에서 두 번씩 읽었다. 26번 도형은 OCR 문자가 없고 27번 기호는 오독되어 원본 그림과 공개 그림을 직접 확인했다. [문항별 계산·Apple Vision 기록](https://drive.google.com/file/d/1Xw3P9D9ThG8xEytgZ5YtVgi5qhwuhU3Q/view), [재실행 코드·원본·공개 그림·OCR 근거 ZIP](https://drive.google.com/file/d/1LJ5q9gGH6Ios5wsJxpDAuiwYycE91oWj/view)을 기존 중급8회 Drive 검수 폴더에 보관하고 크기·부모 폴더를 재조회했다.
- 30번은 원본의 두 쌓기나무·성냥개비20개 예시와 세 공개 SVG에 포함된 동일한 원본 예시 크롭을 대조했다. 새 그림의 13개 블록 좌표에서 단위 변 끝점 합집합과 격자 선분 전수 스캔으로 **변형 답 102·101·104개 모두 일치**했다. Apple Vision은 원본 강의 답안의 `120개`를 읽었지만 세 입체 그림에서는 문자를 읽지 못했다. 사용자가 확정한 **원본 답 120개는 그대로 유지**하고 문항·채점·학생 데이터는 변경하지 않았다. 새 그림의 숨은 블록 접촉이 그림만으로 단일하게 전달되는지와 원본 대비 사고·난도 동등성은 수학 계산 일치만으로 확정할 수 없다. [30번 계산·Apple Vision 기록](https://drive.google.com/file/d/17wAft8WAqhQAgqmIyGhJpwciRmHn_6cZ/view), [재실행 코드·그림·OCR 근거 ZIP](https://drive.google.com/file/d/1hUP16swg9slnWFfLRerrLWe-NBHKhW0g/view)을 같은 Drive 폴더에 보관하고 크기·부모 폴더를 재조회했다.
- 공개 문제은행 SHA-256 `14875841a9e6173c7384e599423fab559b308939b2b3b2f51f4c7cc764cea126`는 그대로다. 이번 재검수는 저장 답과 계산의 일치를 확인한 것이며 전90문항의 9축·실물 인쇄·학생 풀이 최종 승인으로 승격하지 않는다. 특히 12번은 사용자 확정 원본 답 17개를 유지하며 변형의 단계별 규칙·원문 관계 판단이 남아 있다. 14·20·22·24·28·30번의 원문 구조/시각 단서 차이, 원본 크롭의 종이 가독성, 6문항 2단 출력의 실물 종이 검수도 남는다. Mac에는 현재 등록된 프린터가 없어 실제 종이 출력은 확인하지 못했다. 현 Git 변경은 이 인수인계 문서뿐이고, 검수 근거는 Drive, 실행 파일은 로컬 `.private-work/middle8-20261018`에 있다.

## 2026-10-19 중급 8회 23~25번 원문·승인본 독립 수학·Apple Vision 재검수 (Mac, 최신)

- 원본 문제 PDF 4~5쪽의 23번 홀수 괄호 수열, 24번 길·연못, 25번 네 조건 상자와 강의 답안 26~28쪽을 직접 대조했다. 23번은 홀수를 실제로 묶고 삼각수 위치를 별도 계산해 원본 121의 11번째 괄호·6번째 수, 변형 99→(10,5)·143→(12,6)·161→(13,3)을 확인했다. 24번은 각 승인 SVG의 보이는 길을 실제 선분에서 추출하고 연못에 가려지는 선을 제외한 뒤 재귀·반복 두 방식으로 최단 경로 60·61·63을 확인했다. 원본 강의 답은 62다. 25번은 사용자가 확정한 ‘비가 오지 않은 때는 모두 개인 때’ 기준에서 원본 142일과 변형 141·145·139일의 오전 비·오후 비·비 안 온 날 조합을 1~365일 전수 열거해 유일성을 확인했다. **9개 변형 모두 저장 답과 일치**한다.
- Apple Vision은 23번 공개 원본 크롭의 예시 수열과 25번 세 상자의 수치·문장을 읽었다. 동그라미 조건 기호는 보통 글자로 바꿔 읽으므로 실제 SVG에서 ㉮~㉱의 순서와 내용을 확인했다. 24번은 출발·도착 라벨만 OCR이 읽어 원본·변형 그림을 직접 보고 SVG의 보이는 길을 계산했다. 24번 원본의 불규칙한 연못과 새 그림의 난도 동등성, 25번 조건 상자 실물 인쇄, 학생 풀이·9축 최종 판정은 남는다.
- [문항별 계산·Apple Vision 기록](https://drive.google.com/file/d/1tJ33ygOG_9rCcQa0nlolE6WLLEFCJMm7/view), [재실행 코드·그림·OCR 근거 ZIP](https://drive.google.com/file/d/1jIcPU2URwToGAcG8ezMNyvbsx-JL5amX/view)을 기존 중급8회 Drive 검수 폴더에 저장하고 파일 크기·부모 폴더를 재조회했다. 공개 문제은행 SHA-256 `14875841a9e6173c7384e599423fab559b308939b2b3b2f51f4c7cc764cea126`, 문항·답·성적은 변경하지 않았다.

## 2026-10-19 중급 8회 20~22번 원문·승인본 독립 수학·Apple Vision 재검수 (Mac, 최신)

- 원본 문제 PDF 4쪽의 20번 주사위와 경로, 21번 손가락 화살표, 22번 네 삼각형 및 강의 답안 22~24쪽을 직접 대조했다. 20번은 원본 주사위의 윗면2·앞면1·오른쪽3, 이동 `EEESSE`를 두 독립 회전 방식으로 추적해 원본 밑면 합23과 변형 윗면26·앞면19·오른쪽28을 확인했다. 21번은 검지가 8개 주기의 2·8번째임을 실제 그림에서 확인하고 직접 열거와 주기 계산으로 원본 200까지50회, 변형 48·52·54회를 확인했다. 22번은 원본과 세 승인 SVG의 숫자 16개씩을 읽고 세 꼭짓점 곱의 일의 자리로 원본4와 변형 2·8·6을 확인했다. **9개 변형의 저장 답이 해당 계산 규칙과 일치**한다.
- Apple Vision은 20·21번 그림의 글자·화살표를 읽지 못했고 22번의 숫자를 일부 누락하거나 순서를 바꿨다. 원본·공개 그림을 직접 대조하고 SVG 문자와 공개 PNG 해시를 확인했다. **20번은 원문의 밑면 대신 다른 면을 묻고, 22번은 꼭짓점 숫자 배열이 원문과 다르다.** 답의 계산 일치만으로 원본 동등성이나 시각 규칙의 유일성을 확정하지 않는다. 실물 인쇄·학생 풀이·9축 최종 판정은 남는다.
- [문항별 계산·Apple Vision 기록](https://drive.google.com/file/d/10WEXer1ADRmNlxyyb1-P_EGFQJrGYxRs/view), [재실행 코드·그림·OCR 근거 ZIP](https://drive.google.com/file/d/14WJKAkI5Hw-5lOu7R7a9lAh2sV9xsv1P/view)을 기존 중급8회 Drive 검수 폴더에 저장하고 파일 크기·부모 폴더를 재조회했다. 공개 문제은행 SHA-256 `14875841a9e6173c7384e599423fab559b308939b2b3b2f51f4c7cc764cea126`, 문항·답·성적은 변경하지 않았다.

## 2026-10-19 중급 8회 17~19번 원문·승인본 독립 수학·Apple Vision 재검수 (Mac, 최신)

- 원본 문제 PDF 3쪽의 17번 모빌과 18번 달력 지문, 4쪽의 19번 숫자띠를 직접 보고 강의 답안 19~21쪽과 대조했다. 모빌의 네 막대 균형에서 `가=14×라`, `마=3×라`를 다시 유도해 원본 라20g·마60g, 변형 라25·30·40g/마75·90·120g을 확인했다. 18번은 28~31일×시작 요일 7가지를 전수 검사했다. 조건에 맞는 달력이 둘 이상인 변형도 요구한 요일의 날짜는 하나로 정해져 변형 답 `[5,12,19,26]·[6,13,20,27]·[5,12,19,26]`과 일치했다. 19번은 1~999를 이은 2889자리 문자열과 자리수 구간의 별도 계산을 맞춰 원본 차9, 변형 차4·1·2를 확인했다. **9개 변형 모두 저장 답과 일치**했다.
- Apple Vision은 공개 17번 크롭의 한글 라벨을 읽지 못했고 19번은 숫자띠의 앞·뒤만 부분적으로 읽었다. 원본·공개 그림을 직접 확인하고 원본 PNG와 공개 래스터의 바이트·해시를 대조했다. 작은 라벨·숫자띠의 실물 인쇄 가독성, 17번 비례 수치에서 앞 문제 풀이를 복사할 가능성, 18번 달력 경계와 바뀐 요일 부담, 학생 풀이·9축 최종 판정은 남는다.
- [문항별 계산·Apple Vision 기록](https://drive.google.com/file/d/1RBSGpqcLkJplSU2BjV6PIZG7jYfjtbH8/view), [재실행 코드·원본 크롭·OCR 근거 ZIP](https://drive.google.com/file/d/1aBXjTcot-FNxNU1bnuyRJ_mkP1QT8Vfu/view)을 기존 중급8회 Drive 검수 폴더에 저장하고 파일 크기·부모 폴더를 재조회했다. 공개 문제은행 SHA-256 `14875841a9e6173c7384e599423fab559b308939b2b3b2f51f4c7cc764cea126`, 문항·답·성적은 변경하지 않았다.

## 2026-10-19 중급 8회 13~16번 원문·승인본 독립 수학·Apple Vision 재검수 (Mac, 최신)

- 원본 문제 PDF 3쪽의 13번 예시·빈 격자, 14번 신호등, 15번 시각, 16번 곱셈식과 강의 답안 15~18쪽을 직접 대조했다. 13번은 사용자가 확정한 ‘각 열을 아래부터 연속 색칠’ 기준에서 16·4·1의 열 값과 4진수 자릿수의 유일성을 확인해 변형 46·39·54의 색칠 칸을 재계산했다. 14번은 세 불의 8상태를 전수 열거해 원본 7가지, 추가 조건이 있는 변형 5·6·5가지를 확인했다. 15번은 `12k/11`시간의 겹침 시각을 경계까지 열거해 원본 17회, 변형 16·17·18회를 확인했다. 16번은 실제 마지막 인수와 인수 개수, 일의 자리 순환을 별도 곱셈으로 검사해 원본 7, 변형 3·9·1을 확인했다. **12개 변형 모두 저장 답과 일치**했다.
- Apple Vision은 13번 공개 원본 크롭의 작은 예시 숫자 대부분과 신호등 그림을 판독하지 못했다. 원본·공개 그림을 직접 확인하고 원본 크롭 및 승인 SVG와 공개 PNG의 해시를 비교했다. 14번 변형은 원문에 없던 제한 조건을 각각 하나씩 추가하므로 사용자 콘텐츠 승인과 원문 난도 동등성 판단을 구분한다. 12번 원본 정답은 사용자가 확정한 17개로 유지하며 이번 13~16번 검수 결과에 포함하지 않았다. 실물 인쇄·학생 풀이·9축 최종 판단은 남는다.
- [문항별 계산·Apple Vision 기록](https://drive.google.com/file/d/1XoqJExTK9IEoSO4esWiYAthkW839ajGG/view), [재실행 코드·그림·OCR 근거 ZIP](https://drive.google.com/file/d/1GURWJPTHDRzLXSGlcdBXAZwuDIoZ2NYC/view)을 기존 중급8회 Drive 검수 폴더에 저장하고 파일 크기·부모 폴더를 재조회했다. 공개 문제은행 SHA-256 `14875841a9e6173c7384e599423fab559b308939b2b3b2f51f4c7cc764cea126`, 문항·답·성적은 변경하지 않았다.

## 2026-10-19 중급 8회 10~11번 원문·승인본 독립 수학·Apple Vision 재검수 (Mac, 최신)

- 원본 문제 PDF 2쪽과 강의 답안 PDF 12~13쪽을 직접 대조했다. 10번은 합이 같은 순서쌍을 대각선 묶음으로 직접 열거하고 삼각수 위치를 별도로 계산해 원본 50번째 `(5,6)`과 변형 42·59·72번째 `(6,4)·(4,8)·(6,7)`을 확인했다. Apple Vision은 공개 원본 크롭의 처음 10개 순서쌍을 모두 정확히 읽었고, 크롭의 원본 바이트·공개 PNG 해시도 일치했다. 11번은 분수 차와 무게 차에서 물의 전체 무게를 독립 계산해 원본 `2kg 35g`, 변형 `2kg 185g·2kg 210g·1kg 855g`을 확인했다. 11번 원본의 작은 분수는 OCR이 오독하므로 원본 화면과 답안 화면을 직접 읽었다. **6개 변형 모두 저장 답과 일치**한다.
- [문항별 계산·Apple Vision 기록](https://drive.google.com/file/d/1HRuR8qM6WTx3q1AwjthvRNi13Ko6MlIX/view), [재실행 코드·원본 크롭·OCR 근거 ZIP](https://drive.google.com/file/d/1bW_OjSEH4BlqkgfxOfCSpwM6uUkIHm9s/view)을 기존 중급8회 Drive 검수 폴더에 보관하고 파일 크기·부모 폴더를 재조회했다. 실물 인쇄의 작은 수열과 학생 풀이·9축 최종 판정은 남는다. 공개 문제은행 SHA-256 `14875841a9e6173c7384e599423fab559b308939b2b3b2f51f4c7cc764cea126`, 문항·답·성적은 그대로다.

## 2026-10-19 중급 8회 7~9번 원문·승인본 독립 수학·Apple Vision 재검수 (Mac, 최신)

- 원본 문제 PDF 2쪽의 7번 원 배열과 9번 실제 분수열, 8번 시계 지문을 직접 확인하고 강의 답안 8~11쪽과 대조했다. 7번은 서로 이웃한 작은 원 중심 간격과 양끝 접점을 사용해 원본 `56cm·7개→14cm`, 세 변형 `12·18·16cm`를 확인했다. 8번은 정확한 경과 시간을 초 단위 유리수로 계산해 세 변형 `오후 7:58:12·6:57:10·3:58:16`을 확인했다. 9번은 분모별 묶음 길이와 실제 분수열을 이중 열거해 원본 50번째 `5/11→16`, 세 변형 `13·17·21`을 확인했다. **9개 변형 모두 저장 답과 일치**하며 원본 그림 크롭과 공개 PNG 바이트 해시도 일치한다.
- Apple Vision은 원본의 7번·8번 지문은 읽었지만 작은 원의 배치와 9번의 작은 분수열은 판독하지 못했다. 공개 7번 크롭에서는 문자가 없었고 9번 크롭 OCR은 수학적으로 사용할 수 없었다. 직접 원본 시각 대조를 우선했다. 8번 강의 답안 9쪽은 최종 답 `오후 3:57:48`을 표시하고 이는 7일+8시간에 132초 느려지는 계산과 맞다. 같은 답안 10쪽에는 `7일+6시간`으로 계산한 `오후 3:57:49.5`가 남아 있어 원문과 불일치한다. 원본·승인 변형의 문제와 답은 이번에 수정하지 않았다.
- [문항별 계산·OCR·답안 상충 기록](https://drive.google.com/file/d/18BJBznUyL5a0UanF0zxE_TKKTBeMTGx2/view), [재실행 코드·원본 크롭·OCR 근거 ZIP](https://drive.google.com/file/d/1Sb8lTNUlN7oKHiriIMWoaBlNKWsTEfHF/view)을 기존 Drive 검수 폴더에 두고 파일 크기·부모 폴더를 확인했다. 7번의 개수 변경과 원본 도식 재사용, 8번 답안 불일치의 학생 해석, 9번 작은 분수 인쇄 가독성, 학생 풀이·9축 최종 판정은 남는다. 공개 문제은행 SHA-256은 `14875841a9e6173c7384e599423fab559b308939b2b3b2f51f4c7cc764cea126`으로 그대로다.

## 2026-10-19 중급 8회 4~6번 원문·승인본 독립 수학·Apple Vision 재검수 (Mac, 최신)

- 원본 문제 PDF 1쪽과 강의 답안 PDF 5~7쪽을 직접 보고, 공개 문제은행의 4~6번 9개 변형을 독립 계산했다. 4번은 여덟 마방진 선과 실제 SVG의 네 고정값으로 유리수 연립방정식을 풀어 다섯 빈칸과 단일해를 확인했다. 5번은 세 막대 합에서 겹침 두 곳을 뺀 길이와 가운데 막대의 양의 노출 길이를 확인했다. 6번은 서로 다른 숫자 720가지와 맨 앞자리 0 제외 조건을 전수 검사했다. 원본 답은 4번 완성 마방진·5번 29cm·6번 16이며 승인 변형 **9개 모두 저장 정답과 일치**했다.
- Apple Vision OCR은 공개 4번 그림 세 개의 주어진 숫자 4개씩을 모두 읽었지만, 원본 4번 일부 숫자와 6번의 한글 기호·행 배치는 정확히 읽지 못했다. 6번은 직접 화면, SVG 문자, 공개 PNG 해시로 판정했다. **6번 v3은 원본 `가다나+나가다=8가가`와 달리 `가나다+가다나=9나가`**여서 계산의 유일성과 사용자 콘텐츠 승인은 확인했어도 원본 대비 구조·난도 동등성은 별도 판단이 남는다. 실물 인쇄와 학생 풀이도 아직 완료 판정이 아니다. 공개 문항·답·성적은 이번 재검수에서 변경하지 않았다.
- [문항별 계산·OCR 기록](https://drive.google.com/file/d/112lB-Q9Jh1BKs1n_TIK4cWHHMRWQDuKK/view), [재실행 코드·그림·OCR 근거 ZIP](https://drive.google.com/file/d/1FssayYE0pdsoMdKqRgk_oRdOisuiVDXX/view)을 기존 중급8회 Drive 검수 폴더에 저장하고 파일 크기·부모 폴더를 재조회했다. 현 메인 문제은행 SHA-256은 `14875841a9e6173c7384e599423fab559b308939b2b3b2f51f4c7cc764cea126`이며, 이 결과는 9축 최종 통과 판정이 아니다.

## 2026-10-19 중급 8회 1~3번 원문·승인본 독립 수학 재검수 (Mac, 최신)

- 메인 `5ec01fdbd8d351bb377aa75dc1a1a8cf1da276cf`의 1~3번 원문9개 변형을 원본 PDF 1쪽·답안 PDF 1·2·4쪽과 다시 대조했다. 원본 PDF/답안 로컬 바이트는 기존 Drive 원본 `1Amns6ph5BjSFXVWW826ZGOrj7-JwO2o5`/`1sa_5nHsOFs18zSeV-33hANYTA_1hgs0K`의 파일 크기 736,075/6,957,356바이트와 일치한다. 1번은 십·일 자리 100쌍, 2번은 10~99 전수, 3번은 실제 변형 SVG의 카드 아홉 장에서 서로 다른 여섯 위치 배치 전수를 독립 열거했다. 원본 3번 최대는 `987－123＝864`, 승인 변형 답은 `875·854·764`로 저장값과 일치했다. 9변형 모두 정답 일치다.
- Apple Vision은 3번 카드 전체 그림에서 v2·v3 숫자 9개를 모두 읽었으나 v1의 2·7은 누락했다. 각 카드 확대 OCR도 일부 7·8을 놓쳐 OCR만으로 카드 목록을 확정하지 않았다. 원문 그림을 직접 보고 새 SVG의 실제 `<text>` 값과 공개 PNG 해시를 대조했다. [문항별 계산·OCR 기록](https://drive.google.com/file/d/11C7MEsrbjyWWmMzLjr8cv96rJr3sZn9J/view), [재실행 코드·SVG·OCR 근거 ZIP](https://drive.google.com/file/d/1amagqIZ5TSVslHgqysbuOvj7pGZg49eH/view)을 기존 중급8회 Drive 검수 폴더에 보관했다. 이 검사는 9축 최종 통과가 아니다. 1번 v2의 역방향 비교, 2번 세 변형의 같은 답 복사 가능성, 3번 중복 숫자 카드의 실제 난도, 실물 인쇄·학생 풀이 판정이 남는다. 기존 공개 문제·답·성적은 변경하지 않았다.

## 2026-10-19 중급 8회 승인 유사문제 메인 연결·Apple Vision OCR (Mac, 최신)

- 사용자가 전체 승인한 중급 8회 유사문제 30유형×3문항=90개를 추가 모의고사 회차의 고정 문제은행·개인 모의고사·학생 진단에 연결했다. 오답 유형마다 **원문 번호 → 유사문제 3문항·답안** 링크, 권장 학습 위치와 학습 포인트를 표시한다. 오답이 없으면 전체 90문항 링크를 제공한다. `mock-mid-8` 승인을 받은 학생만 열 수 있으며 직접 주소로 미승인 회차 진단을 열 수 없다. 원본 12번 답17개와 30번 답120개, 학생 성적·권한, `data.js`와 DOCSSAM 칼럼은 변경하지 않았다.
- 승인 초안 SHA-256 `7bdc4fa4bf6d006a96135e1798b4421b5cbb25dda4768592c2732d4f9db79375`에서 변환한 문제은행 `bank/data/middle8-reviewed.json`은 6,335,299바이트, SHA-256 `14875841a9e6173c7384e599423fab559b308939b2b3b2f51f4c7cc764cea126`이다. 28·30번 변형 SVG 여섯 개만 동일한 원본 벡터에서 2배 해상도로 다시 래스터화했고, 나머지 84문항의 지문·답·그림과 여섯 문항의 수학 데이터는 그대로다. 변형 그림 66개를 포함하며, 13번의 색칠 완성 그림은 문제에서 제외하고 정답 그림에만 둔다. 14·20번의 원문 대비 구조 차이, 원본 동등성 미확정과 실물 종이 인쇄 미검수는 기록에 그대로 남긴다. 사용자 콘텐츠 승인과 과거 9축 전체 통과를 혼동하지 않는다.
- Apple Vision으로 원본7쪽·답안33쪽·6문항 시안15쪽, 최신 메인 인쇄용 PDF51쪽을 읽었다. 최신 PDF의 문항 번호 1~90은 전체 페이지 OCR에서 각각 정확히 한 번 읽혔다. 수학 기호와 작은 조건 문자는 OCR 단독 판정에 쓰지 않고 원본 및 출력 이미지를 직접 대조했다. 90문항·90답안, 그림 로드·카드 잘림·답안 넘침0, 모바일 가로 넘침0, 4문항·6문항 다단, 개인 모의고사 10/20/30문항, 중급7회 회귀, 학생 진단의 학습 링크·포인트30/30을 확인했다. 브라우저 검사의 운영 쓰기는0건이었다.
- [인쇄 해상도·Apple Vision 재검수](https://drive.google.com/file/d/1inJpfO7d3iDTSgY5Jh369gZAeEp_Wvvz/view)에 A4 PDF 내부 그림의 실제 배치 크기와 유효 DPI를 기록했다. 28·30번 새 그림은 두 배치 모두 최소 300dpi 이상이다. 원본 그림을 그대로 쓰는 13·17·20·26·27번은 각 3문항, 합계 15개 그림이 96~111dpi여서 실물 종이에서 작은 라벨·선의 가독성 판정이 남는다. 원본 PNG를 단순 확대해 새 정보가 생기는 것처럼 처리하지 않는다.
- [메인 연결 검수 기록](https://drive.google.com/file/d/1Bh6PPCKsGQZkFoyQo-bLf_a-VZM-rEra/view), [Apple Vision·브라우저 근거 ZIP](https://drive.google.com/file/d/1sa72l2OKdja-1oCDEmLQ5aOzVJ7Fp-N_/view), [6문항 문제·답안 PDF](https://drive.google.com/file/d/10lhUuTjTZ3L0lYQOUxkngon16UcWd4la/view), [4문항 문제·답안 PDF](https://drive.google.com/file/d/1DrFRSzcke1gSrWrfJMAeg_dU6r0-g7vp/view)을 기존 Drive 검수 폴더 `1ksibH1e-3kVmbATQQKSDwnoJZvhl9Aci`에 두고 파일 이름·크기·부모 폴더를 재조회했다. 개발 중간 파일은 로컬 `.private-work/middle8-20261018`에만 둔다.

## 2026-10-18 중급 8회 사용자 전체 승인·Apple Vision OCR (Mac, 최신)

- 사용자의 “유서문제 모두 승인”을 현재 비공개 중급 8회 30유형×3문항=90개 유사문제의 **콘텐츠 승인**으로 기록한다. 이전에 구조 차이가 확인된 14·20번도 이 범위에 포함한다. 승인 전 작성된 초안의 `teacherApproved: false`와 9축 미검수/보류 집계는 당시 검수 이력이며, 사용자 승인 문장을 새 자동 검산·그림·인쇄 합격 기록으로 바꾸어 쓰지 않는다.
- macOS Apple Vision `VNRecognizeTextRequest` 정확 모드(`ko-KR`, `en-US`, 언어 보정 끔)로 중급 8회 원본 7쪽, 강의 답안 33쪽, 현 6문항/쪽 인쇄 시안 15쪽을 읽었다. OCR은 총 55쪽·1,837줄을 반환했다. 전체 페이지에서 인쇄 시안 ID 90개 중 60개를 인식해, PDF 좌표로 문항 제목 90개를 따로 잘라 3배 확대하여 같은 Vision으로 재검사했다. 이때 88개 ID가 정확히 읽혔고, 15번 v1·v2의 `q`를 `0`으로 오독한 두 그림은 직접 눈으로 ID를 확인했다. PDF 레이아웃 읽기에서도 90개를 각각 한 번씩 확인했다. 12번 답안의 17, 14번의 7가지, 20번의 23, 30번의 120개를 답안 쪽에서 재확인했다. 원본 25번 조건 기호 ㉮~㉱는 OCR이 틀리게 읽어 실제 원본과 인쇄본 이미지를 직접 보았다.
- [Apple Vision OCR 검수 기록](https://drive.google.com/file/d/1heVNsHY3DutjXvLJ7td0GtXwOt8_i62m/view)과 [55쪽 OCR JSON·Swift 추출기 ZIP](https://drive.google.com/file/d/1_GmSnYoKsMoeAtL6pPe6NsWrR7Str8br/view)을 기존 Drive 검수 폴더에 저장하고 메타데이터의 이름·크기·부모 폴더를 재조회했다. 로컬 실행 자료는 `.private-work/middle8-20261018`에만 둔다. 공개 문제은행·진단·학생 기록은 아직 변경하지 않았다. 다음 작업은 문항별 남은 수학/원본 그림·실제 인쇄 가독성 판정 후 90문항을 중급 8회 추가 모의고사의 승인된 학생에게만 연결하고 진단·인쇄·권한을 회귀 검수하는 것이다.

## 2026-10-18 최종 3회 ZIP 유사문제 다단 배치 수정 (Mac, 최신)

- 관리자 최종 3회 ZIP의 실제 PDF에서 유사문제 9개가 큰 한 단 카드 6쪽으로 나뉘던 배치 오류를 수정했다. 진단 요약 4쪽 뒤의 문제지는 **왼쪽 단 위→아래, 오른쪽 단 위→아래** 순서다. 28·29·30번 우선 유형 표본은 문제 1~6을 2단×3행, 긴 7~9를 2단×2행으로 나눠 문제 2쪽·답안 2쪽, 합계 A4 8쪽이다. 지문·그림·문항 ID·풀이 데이터는 변경하지 않았다.
- 최종 3회 요약 인쇄에서 길거나 그림이 큰 다른 우선 유형 조합은 한 면의 6칸이 넘치면 3문항씩 나눈다. 합성 12·15·28번 조합의 문제9개·답안9개, 인쇄 부록5쪽이 통과했다. 캡처 시 단 읽기 순서와 칸 넘침을 검사하고 실패하면 PDF 생성을 중단한다.
- 실제 ZIP에서 추출한 [다단 배치 검수 PDF](https://drive.google.com/file/d/1CTlwAcixghWrQ7CV2O4wLfyYahnW-rl3/view)는 기존 Drive ID를 갱신했다. 8쪽, 1,513,715바이트, SHA-256 `c551ade9ea782fd24f22a4965ceed466b767224c67046908d4092ef45856f8f6`. 문제 5·6쪽을 렌더하여 순서·겹침 없음·답칸을 확인했다. `qa/admin-last14-batch-browser-validate.js`, `qa/last3-parent-report-browser-validate.cjs`, `qa/last3-approved-integration-validate.cjs`, `qa/last3-reviewed-data-validate.cjs`, `qa/final3-fixed90-validate.js`, `qa/final3-taxonomy-validate.js` 통과, 운영 쓰기0. 사용한 Mac 작업본은 `main`의 `/Users/docssam/Developer/GFIELD/hs-report`이고, 새 코드는 `bank/final1-worksheet.js`, `final-summary-practice-print.js`, 오류 표시를 명확히 한 QA는 `qa/last3-parent-report-browser-validate.cjs`에 있다.

## 2026-10-18 중급 8회 25번 조건 상자·2단 배치 반영 (Mac, 최신)

- 사용자 판정이 맞다. **원본 12번 답 17개, 30번 답 120개**를 유지한다. 동일한 판정 자료를 다시 요청하지 않고, 학생 채점·성적은 변경하지 않았다.
- 중급 8회 비공개 90문항 초안을 v0.7로 올렸다. 원본 25번의 ㉮~㉱ 네 조건을 세 유사문제의 새 SVG 상자에 원본 순서대로 표시했다. 문제 지문에는 물음만 남기고 정답·풀이 힌트는 넣지 않았다. 답 141·145·139일은 사용자 해석 ‘비가 오지 않은 때는 모두 개인 때’로 예비 검산했다. 이전 v0.6 대비 **25번 세 문항만 변경, 다른 87문항 JSON 완전 일치**한다. [비공개 초안](https://drive.google.com/file/d/1DmG-hMjdvWbzfx3rBjPsV5gEPEhawsAc/view) SHA-256 `7bdc4fa4bf6d006a96135e1798b4421b5cbb25dda4768592c2732d4f9db79375`, [변경 범위·검수 기록](https://drive.google.com/file/d/1i7SkdTfkkwRAxW9M0X-IfmnVc0L1PNng/view).
- [4문항 인쇄 시안](https://drive.google.com/file/d/15DU7hkCXda-TQk4iy0JW7nJ75cd1o85U/view) 23쪽, [6문항 인쇄 시안](https://drive.google.com/file/d/1GeteMsC1Ae8yjg62hxYYxWTei9Uedf4T/view) 15쪽, [문제·답안 합본](https://drive.google.com/file/d/1nr-LAUTUtu1o-7hKjZvz_8vPLdY7mLqt/view) 51쪽을 같은 Drive ID에서 갱신했다. 90문항×문제·답안 값 및 풀이 267단계 PDF 읽기, 그림 66개 로드·DOM 잘림0을 확인하고 25번 변경 면(4문항 19쪽·6문항 13쪽·답안 28~29쪽)을 화면으로 보았다. [그림 묶음](https://drive.google.com/file/d/1vm1V3y9uSCAfHk1OAasIBxvOSIoBK3-z/view)은 40개 파일이다. 종이 실물 인쇄 검수는 아직이다.
- 사용자 지적에 따라 4/6문항 시안과 합본 문제 부분의 **2단 읽기 순서를 왼쪽 위→아래, 다음 오른쪽 위→아래**로 고쳤다. 이전 가로 우선 격자 순서가 배치 오류였다. 6문항 시안 13쪽은 25번 세 문제가 왼쪽 단에 순서대로, 26번 세 문제가 오른쪽 단에 순서대로 나온다. 전15쪽·23쪽의 PDF 좌표에서 단 순서를 재검증하고 해당 면을 눈으로 확인했다. [2단 배치 검수 기록](https://drive.google.com/file/d/19xV6TxWl0KzM46WSMK-rpJX531Aby0ry/view). 최신 4문항/6문항/합본 SHA-256은 `820a3c89c1f5386b2216d2e1d859b85024d28d0287573e2e62cf39aa434f5c64` / `92c27fdc202b6a8bded9230075bb88e04ee9d2a436425d46347b9b5acfdff4a0` / `9cb7b05722e48e648d087210e3f50e61e3e2aa4e9c7e694cca303d0ccd1ccbb6`이다.
- [23~25번 원문 계약](https://drive.google.com/file/d/17vuLkHixlmzz6s5jljZcUhhZ8UUthX48/view), [25번 직접 9축 기록](https://drive.google.com/file/d/1r8KJOIoeKxebLs60IDqyb06sLixy8x01/view), [원문 장부](https://drive.google.com/file/d/1E6Wel6JGjtKXIpuyIWEJ2w76j73ftzc7/view), [전90문항 9축 작업표](https://drive.google.com/file/d/12XGTyhWYxgGaXndJYtkKKRfCu3R-t91K/view)를 갱신했다. 25번은 상자 복원으로 보류 15→9축, 전체 810축은 **미검수622·보류188·통과0**이다. 25번 새 상자의 종이 가독성·원본과의 읽기/시각 단서 동등성, 14·20번 구조 재설계, 그 밖의 보류 축과 교사 판정이 남는다. **교사 승인0·학생 공개0·중급 8회 신규 진단 연결0**이다. 최신 작업 코드는 로컬 `.private-work/middle8-20261018`에만 보존한다.

## 2026-10-18 최종 3회 연결 재확인·중급 8회 25번 조건 상자 후보 (Mac)

- 현재 메인에서 최종 3회 승인 고정은행 90문항·30유형×3 링크와 분류 검사가 통과했다. 관리자 최종 3회 ZIP을 합성 기록으로 다시 내려받아 **추천 3유형×3문제=문제9개·풀이9개**가 들어 있고 기본 저장에서 ‘준비 중인 부록’ 안내가 없음을 확인했다. 학생 진단은 0/1/2/11개 오답 표본에서 우선 문제 0/3/6/9개, 30개 전체 오답 표본에서 권장 학습 위치·학습 포인트 30/30과 우선 문제9개를 확인했다. 승인 문제은행·개인 생성기·카탈로그 연결 및 외부 쓰기0도 통과했다. 사용한 검사는 `qa/final3-fixed90-validate.js`, `qa/final3-taxonomy-validate.js`, `qa/last3-reviewed-data-validate.cjs`, `qa/admin-last14-batch-browser-validate.js`, `qa/last3-parent-report-browser-validate.cjs`, `qa/last3-approved-integration-validate.cjs`다. 마지막 세 브라우저 검사는 Mac 번들 Playwright 경로를 환경변수로 지정했다.
- 이전 ‘PC 제한’ 요청의 브라우저 등록 대수는 현재 메인 `8b7d8d1`에서 이미 해제됐다. 운영 Supabase `hs-parent-auth` 활성 v7의 `saveDevice`에는 3개 제한이 없고, 운영 `hs_student_devices` 제약도 길이·기본키·학생/기기 해시 유일성·외래키뿐이다. 관리자 화면은 `deviceLimit:null`과 ‘등록 브라우저 수에는 제한이 없습니다’를 표시한다. 이메일/PIN·학생별 권한은 유지한다. 옛 SQL migration 주석의 ‘최대 3대’는 당시 이력이며 현 운영 동작 기준이 아니다.
- 중급 8회 25번은 원본 PDF 5쪽의 ㉮~㉱ **실제 네 조건 상자**와 같은 순서·표현을 쓰는 비공개 문구 후보 3개를 만들었다. 기존 초안의 한 문단 대신 원본의 필수 조건만 상자에 넣고, 사용자 확정 ‘비가 오지 않은 때는 모두 개인 때’를 유지했다. 답 141·145·139일을 1~365일 전수 열거와 조건 합으로 재확인했다. A4 2단×3행 PDF 1쪽의 네 조건×3개를 재읽고 PNG에서 잘림·겹침·답 노출이 없음을 확인했다. [문구·계산 기록](https://drive.google.com/file/d/19GdHW5Yk0L77LQWQalDVsppMErpLiOsa/view), [비공개 인쇄 시안](https://drive.google.com/file/d/1-SuvvKcy0YWAdKc6LHASb_xoLciv4Ghv/view)으로 Drive 기존 검수 폴더에 보관하고 크기·부모 폴더를 확인했다. **현재 90문항 초안·학생 은행·진단은 변경하지 않았다.** 다음 단계는 이 형식을 초안과 4/6문항·답안 출력에 반영하면서 새 버전의 문항별 해시·9축·PDF 근거를 갱신하는 것이다.

## 2026-10-18 중급 8회 12·30번 유사문제 직접 대조 (Mac)

- 사용자 판정에 따라 **원본 12번 답 17개, 30번 답 120개를 확정 유지**한다. 같은 원본 판정 자료를 다시 요청하지 않는다. 원본·저장 답·학생 데이터는 변경하지 않았다.
- 12번은 원본 PDF 2쪽의 실제 첫째~넷째 바둑돌 배열과 강의 답안 14쪽, 현 6문항 PDF 6쪽을 대조했다. 세 유사문제의 원본 그림 크롭을 대조하고 12·14·17번째 초안 답13·15·18을 확인했다. 사용자 확정 원본 답과 변형의 단계별 규칙 계약, 작은 돌의 실물 인쇄를 포함해 **27축 중 18축 보류**했다. [직접 검수 기록](https://drive.google.com/file/d/1m4iM2T2rEx5nT_KTJzW8JFP-Iz_peDfv/view).
- 30번은 원본 PDF 6쪽의 성냥개비20개·쌓기나무2개 예시와 오른쪽13개 입체, 강의 답안 33쪽, 현 6문항 PDF 15쪽을 대조했다. 변형용 SVG 세 개는 각 13개 블록 좌표에서 단위 변을 재구성해 102·101·104개로 예비 계산했으며 제작 코드와 별도 끝점쌍 계산이 일치했다. 원본 답120은 그대로 두고 새 그림의 숨은 면·시점·가림·풀이 부담·실물 인쇄를 포함해 **27축 중 21축 보류**했다. [직접 검수 기록](https://drive.google.com/file/d/1UdZr7q9uJpHU_o0hMYCI9-GCtZ0Il2r2/view).
- 기존 Drive 원문 장부 `1E6Wel6JGjtKXIpuyIWEJ2w76j73ftzc7`, 9축 JSON/CSV `12XGTyhWYxgGaXndJYtkKKRfCu3R-t91K`/`1WVdJPPQ8p6DfoIzk9RbAcwLdzQ9GbYh8`, 전체 QA `12X26aAEZc4hEYdepRvuiNCQ3oC8aJv9p`를 같은 파일 ID에서 갱신했고 크기·부모 폴더를 재조회했다. 전90문항 810축은 **미검수616·보류194·통과0**이다. 직접 대조 기록은 전30유형에 있으나 최종 승인과 별개다. 교사 승인0·학생 공개0·중급8회 신규 진단 연결0을 유지한다. 다음에는 Q14·Q20의 원문 구조와 다른 변형을 재설계하고, 다른 보류 문항·실물 인쇄·학생 풀이·교사 판정 뒤 문제은행과 진단을 연결한다. 로컬 검수 코드는 `.private-work/middle8-20261018`에 보존한다.

## 2026-10-18 중급 8회 26~29번 원문·유사문제 직접 대조 (Mac)

- 26번은 원문 PDF 5쪽의 분리된 성냥개비 삼각형·말줄임표와 강의 답안 29쪽, 현재 6문항 PDF 13쪽을 비교했다. 원문 아래줄25개→전체975개, 변형 아래줄23·27·29개→828·1134·1305개를 줄별 합과 삼각수 공식 두 방법으로 검산했다. 세 문항×9축 잠정 근거27행 중 작은 원본 그림 실물 인쇄 3축, v2/v3 답이 세 자리에서 네 자리로 늘어난 산술 부담 2축을 보류했다. [직접 검수 기록](https://drive.google.com/file/d/1Z3qPsPLhijXYi13D-0LjzOLRGRZaopeC/view).
- 27번은 원문 PDF 5쪽 [보기]의 세 기호·아홉 예시와 강의 답안 30쪽, 현재 문제 PDF 14쪽을 대조했다. ＊는 두 수 합의 두 배, ★는 큰 수, △는 합의 제곱으로 계산하면 원본 □42와 변형 □24·64·90이 각각 유일하다. 변형 오른쪽 값64·144·196의 역산 부담과 작은 원본 기호의 실물 인쇄 **6축을 보류**했다. [직접 검수 기록](https://drive.google.com/file/d/1nQ6ETc1c5Wjp578ECRRjmSe6cB37dQSC/view).
- 28번은 원문 PDF 5쪽의 `99⋯99` 아래 `15개`와 강의 답안 31쪽, 현 문제 PDF 14쪽의 새 그림을 비교했다. 사용자 확정 해석대로 각 인수는 숫자 9가 n개인 수다. 새 그림의 12·18·21개 표기와 실제 큰 정수의 제곱 자릿수 합108·162·189를 직접 곱셈과 `9n` 패턴으로 확인했다. 개수 표식의 읽기·반복수 부담·실물 인쇄 **9축을 보류**했다. [직접 검수 기록](https://drive.google.com/file/d/1iqTqQ8fT8lVAYUMgUgSda0LwsuwWCfw6/view).
- 29번은 원문 PDF 6쪽과 강의 답안 32쪽의 90＝2＋…＋13(12개), 현재 문제 PDF 15쪽을 비교했다. 변형99는 최장11개·첫수4, 102는 최장12개·첫수3, 104는 최장13개·첫수2다. 가능한 양의 연속 자연수 표현을 길이별로 전수 열거했다. 99는 더 긴 후보2개, 102는1개를 배제해야 하나 104는 원문처럼 최소합 경계의 최장 길이가 바로 성립한다. 기존 세 변형 일괄 보류를 **v1/v2의 경우 분류·계산 4축만 보류**하도록 바로잡았다. [직접 검수 기록](https://drive.google.com/file/d/1oVREQvSelbwY8Pi6mEo9r4YbOexy5GEY/view).
- 원문 장부 `1E6Wel6JGjtKXIpuyIWEJ2w76j73ftzc7`, 9축 JSON/CSV `12XGTyhWYxgGaXndJYtkKKRfCu3R-t91K`/`1WVdJPPQ8p6DfoIzk9RbAcwLdzQ9GbYh8`, 전체 QA `12X26aAEZc4hEYdepRvuiNCQ3oC8aJv9p`를 기존 Drive ID에 갱신하고 크기·부모 폴더를 확인했다. 전90문항 810축은 **미검수640·보류170·통과0**, 교사 승인0·학생 공개0·중급 8회 신규 진단 연결0이다. 초안·그림·PDF·학생 데이터는 바꾸지 않았다. 남은 직접 대조는 사용자 원본 답을 유지한 12·30번 변형이며 보류 축 재설계·실물 인쇄·교사 판정이 뒤따른다. 로컬 계산·검수 파일은 `.private-work/middle8-20261018`에 보존한다.

## 2026-10-18 중급 8회 23~25번 원문·유사문제 직접 대조 (Mac)

- 23번은 원문 PDF 4쪽의 홀수 괄호 자료와 강의 답안 26쪽, 현 6문항 PDF 12쪽을 직접 대조했다. 원본 121은 11번째 괄호 6번째 수이고, 변형 99·143·161은 10번째5번째·12번째6번째·13번째3번째다. 직접 묶음 생성과 삼각수 누적합 두 계산이 일치한다. 세 문항×9축 잠정 근거27행 중 원본 작은 자료의 종이 가독성 3축과 세 번째 변형의 두 묶음 추가 계산 1축을 보류했다. [직접 검수 기록](https://drive.google.com/file/d/16Chqyv6e6B5e1uzKundJsjmAiaB4q_gL/view).
- 24번은 원문 PDF 4쪽의 8열×5행 격자·불규칙 연못 둘과 강의 답안 27쪽 62가지, 현 문제 PDF 12쪽의 새 타원 연못 세 그림을 비교했다. SVG 열린 선분을 실제 파싱하고 재귀/반복 경로수를 독립 계산한 답은 60·61·63가지다. 원본의 불규칙한 가림과 새 타원 블록의 경로 분기·부분합·우회 단서가 달라 27축 중 **15축을 보류**했다. 새 그림 제작 허용을 난도 동등성 승인으로 보지 않고 세 문항을 잠근다. [직접 검수 기록](https://drive.google.com/file/d/1iZcQPDNoir8tdAn1J5zPyXagwkCXsqIw/view).
- 25번은 원문 PDF 5쪽 ㉮~㉱ 네 줄 조건 상자와 강의 답안 28쪽 142일, 현 문제 PDF 13쪽의 한 문단 세 변형을 대조했다. 사용자가 확정한 “비가 오지 않은 때는 모두 개인 때” 해석을 유지한다. 변형 141·145·139일은 1~365일 전수 탐색과 세 수 합의 절반으로 각각 유일하다. 네 줄 조건을 한 문단으로 합친 표현·조건 추적·읽기/시각 단서의 차이 **15축을 보류**했다. [직접 검수 기록](https://drive.google.com/file/d/1r8KJOIoeKxebLs60IDqyb06sLixy8x01/view).
- 원문 장부 `1E6Wel6JGjtKXIpuyIWEJ2w76j73ftzc7`, 9축 JSON/CSV `12XGTyhWYxgGaXndJYtkKKRfCu3R-t91K`/`1WVdJPPQ8p6DfoIzk9RbAcwLdzQ9GbYh8`, 전체 QA `12X26aAEZc4hEYdepRvuiNCQ3oC8aJv9p`를 기존 Drive ID에 갱신하고 크기·부모 폴더를 확인했다. 전90문항 810축은 **미검수652·보류158·통과0**, 교사 승인0·학생 공개0·중급 8회 신규 진단 연결0이다. 초안·그림·PDF·학생 데이터는 이번에 바꾸지 않았다. 다음은 26~30번과 12번 변형 직접 대조, 보류 축의 재설계·실물 인쇄·교사 판정이다. 로컬 작업 파일은 `.private-work/middle8-20261018`에 보존한다.

## 2026-10-18 중급 8회 20~22번 원문 그림·유사문제 직접 대조 (Mac)

- 20번은 원문 문제 PDF 4쪽의 실제 주사위·격자·화살표와 강의 답안 22쪽, 현 6문항 PDF 10쪽을 직접 대조했다. 원문은 여섯 번 이동 `EEESSE`의 일곱 자리 **바닥면 합 23**을 묻는다. 현재 변형은 같은 원본 그림을 쓰지만 각각 윗면·앞면·오른쪽 면을 물어 답 26·19·28이다. 3차원 면 좌표와 면 상태 갱신 두 계산은 일치했지만, 윗면은 `7－바닥면` 지름길이 있고 앞면·오른쪽 면은 반복값과 방향 추적이 달라 **원문 동등성 불충족**이다. 세 문항×9축 중 19축을 구조·난도·인쇄 판정 보류로 두고 재설계 전까지 잠근다. [직접 검수 기록](https://drive.google.com/file/d/1xgk7NVT-3K6JHczU45Rlo2TQi2bPgjdq/view).
- 21번은 원문 PDF 4쪽 손 그림의 실제 왕복 화살표·1~10 표시, 강의 답안 23쪽, 현 문제 PDF 11쪽을 대조했다. 검지는 8개 주기의 2·8번째이고 원문 200까지 50회, 변형 192·208·216까지 48·52·54회가 직접 열거·주기 계산으로 일치한다. 세 문항×9축 잠정 근거27행 중 작은 표시의 종이 가독성과 세 문항 연속 풀이 지름길 6축을 보류했다. [직접 검수 기록](https://drive.google.com/file/d/1RN0LF7y2_WnSHxoy1sKzfEOj-BMjYp-2/view).
- 22번은 원문 PDF 4쪽 네 삼각형과 강의 답안 24쪽, 현 문제 PDF 11쪽의 새 SVG를 대조했다. 원문 네 삼각형의 꼭짓점은 모두 연속 세 수이고 곱의 일의 자리 답4다. 새 세 그림에는 불연속 숫자 묶음이 많으며 답2·8·6은 실제 SVG 숫자와 독립 곱셈으로 일치한다. 규칙 유일성은 유한 식 후보 검사만으로 입증되지 않고 숫자 배열이 발견 단서를 바꿀 수 있어 27축 중 12축을 보류했다. [직접 검수 기록](https://drive.google.com/file/d/1oOeULpd4WH2Lu9uhEwdrlbOqCkU2POU0/view).
- 원문 장부 `1E6Wel6JGjtKXIpuyIWEJ2w76j73ftzc7`, 9축 JSON/CSV `12XGTyhWYxgGaXndJYtkKKRfCu3R-t91K`/`1WVdJPPQ8p6DfoIzk9RbAcwLdzQ9GbYh8`, 전체 QA `12X26aAEZc4hEYdepRvuiNCQ3oC8aJv9p`를 기존 Drive ID에 갱신하고 크기·부모 폴더를 확인했다. 전90문항 810축은 **미검수671·보류139·통과0**다. 교사 승인0·학생 공개0·중급 8회 신규 진단 연결0을 유지한다. 초안·그림·PDF·학생 데이터는 이번에 변경하지 않았다. 다음은 23~30번과 12번 변형의 직접 대조, 구조 차이 재설계·실물 인쇄·교사 판정이다. 로컬 계산·검수 파일은 `.private-work/middle8-20261018`에만 보존한다.

## 2026-10-18 중급 8회 18·19번 직접 대조와 사용자 원본 답 확정 (Mac)

- 사용자가 확정한 원본 12번 17개, 30번 120개를 그대로 유지한다. 같은 판정을 다시 요청하거나 원본 답·채점·학생 성적을 변경하지 않는다. 독립 계산 차이는 비공개 검수 이력으로만 둔다.
- 18번은 원본 문제 PDF 3쪽, 강의 답안 20쪽, 현 6문항 PDF 9쪽을 직접 대조했다. 토요일 합75의 화요일은 4·11·18·25일이다. 28~31일과 시작 요일을 전수 열거한 세 유사문제 답은 5·12·19·26일, 6·13·20·27일, 5·12·19·26일로 각각 유일하다. 세 문항×9축 잠정 근거27행 중 31일 달에만 성립하는 둘째 문항의 월말 경계와 셋째 문항의 요일 이동 부담 **3축을 보류**했다. 직접 기록은 Drive `13FCtXvOhIH2IuIBNlgIy3Kf5w6fDSQED`다.
- 19번은 원본 문제 PDF 4쪽의 숫자띠와 강의 답안 21쪽, 현 6문항 PDF 10쪽의 원본 그림 크롭 세 개를 직접 대조했다. 1~999를 이어 적은 2889자리 문자열에서 원문 오른쪽300번째는 9, 왼쪽500번째는 0으로 차9다. 변형은 양쪽 위치를 직접 인덱싱해 4·1·2가 저장 답과 일치했다. 세 문항×9축 잠정 근거27행 중 좌우 자리수 계산 부담과 원본 작은 숫자띠의 실제 종이 가독성 **6축을 보류**했다. 직접 기록은 Drive `1H96CP9KmtbA1dE3TLhw-FEiKmuTgDGoe`다.
- 원문 장부 `1E6Wel6JGjtKXIpuyIWEJ2w76j73ftzc7`, 9축 작업표 JSON/CSV `12XGTyhWYxgGaXndJYtkKKRfCu3R-t91K`/`1WVdJPPQ8p6DfoIzk9RbAcwLdzQ9GbYh8`, 전체 QA `12X26aAEZc4hEYdepRvuiNCQ3oC8aJv9p`를 기존 Drive ID에 갱신했다. 현재 전810축은 **미검수693·보류117·통과0**, 교사 승인0·학생 공개0·중급 8회 신규 진단 연결0이다. 원본·초안·문제/답안 PDF·학생 데이터는 바꾸지 않았다. 다음 직접 대조 대상은 20~30번과 12번 변형이며 보류 축·실물 인쇄·교사 최종 판정이 남는다. 계산·검수 스크립트는 로컬 `.private-work/middle8-20261018`에만 보존한다.

## 2026-10-18 중급 8회 16·17번 원문·유사문제 직접 대조 (Mac)

- 16번은 원문 PDF 3쪽의 `3×13×23×33×…×2043×2053×2063`과 강의 답안 18쪽, 현재 문제 PDF 8쪽을 직접 대조했다. 원문 인수207개의 일의 자리는 7, 변형 인수205·206·208개의 일의 자리는 3·9·1이다. 네 단계 반복과 모든 인수를 차례로 곱하며 일의 자리만 남기는 독립 계산이 일치했다. 세 문항×9축 잠정 근거27행에 새 차이 보류는 없으나 작은 식의 실물 인쇄·학생 풀이·교사 최종 승인은 남는다. 직접 기록은 Drive `14uKOUMD6Dtg_XZRNWdtO9qCfOt-CZAIe`다.
- 17번은 원문 PDF 3쪽의 실제 모빌 네 막대·가지·라벨과 강의 답안 19쪽, 현재 문제 PDF 9쪽의 원본 그림 크롭 세 개를 직접 대조했다. 네 균형을 각각 확인하고 양의 정수 해를 열거하면 원본 가280g에서 라20·마60g, 변형 가350/420/560g에서 라25/30/40g·마75/90/120g이 유일하다. 세 문항×9축 잠정 근거27행 중 원본 작은 라벨의 실물 인쇄, 첫 변형 350÷14 산술, 같은 모빌·비례 수치를 연속해서 풀 때 앞 답을 확대하는 지름길의 **7축을 보류**했다. 직접 기록은 Drive `1SmWXP1Mwh91Cw-Ky3JD956ChUXE468pq`다.
- 원문 장부 `1E6Wel6JGjtKXIpuyIWEJ2w76j73ftzc7`, 9축 작업표 JSON/CSV `12XGTyhWYxgGaXndJYtkKKRfCu3R-t91K`/`1WVdJPPQ8p6DfoIzk9RbAcwLdzQ9GbYh8`, 전체 QA `12X26aAEZc4hEYdepRvuiNCQ3oC8aJv9p`를 기존 Drive ID에 갱신해 크기·부모 폴더를 재조회했다. 현재 810축은 **미검수699·보류111·통과0**이다. 원본·초안·문제/답안 PDF·학생 데이터는 이번에 바꾸지 않았고 교사 승인0·학생 공개0·중급 8회 신규 진단 연결0을 유지한다. 계산·검수 스크립트는 로컬 `.private-work/middle8-20261018`에만 있다.

## 2026-10-18 중급 8회 14번 추가 제약에 따른 구조 차이 직접 판정 (Mac)

- 원문 PDF 3쪽 14번의 실제 빨강·노랑·초록 신호등 사진·지문과 강의 답안 16쪽의 `3＋3＋1＝7가지`, 현재 6문항 문제 PDF 7쪽의 유사문제 세 개·중립 SVG를 직접 대조했다. 원문은 세 불의 독립 켜짐/꺼짐 8상태에서 모두 꺼진 1상태만 제외한다. 세 유사문제에는 각각 ‘빨강·노랑 동시 금지’, ‘켜진 불 최대 두 개’, ‘노랑을 켜면 초록도 켜기’가 새로 붙어 답이 5·6·5가지가 된다. 여덟 상태를 전수 열거해 초안 정답과 일치함을 확인했다.
- 세 유사문제×9축=27개 중 **25축은 원문 구조 차이 판정 보류**다. 새 중립 그림의 사용자 허용은 그림 제작 범위이며 추가 수학 조건의 난도 동등성 승인이 아니다. 따라서 현재 세 문항은 원문과 같은 수준의 중급 8회 유사문제로 공개·진단 연결하지 않는다. 원문과 동등한 세 문항을 재설계하거나 현재 세 문항을 별도 확장 유형으로 판정하는 후속 검토가 필요하다. 학생 데이터·원문·초안 문제/답/PDF는 이번에 바꾸지 않았다.
- 직접 판정 기록은 Drive `1FzOffPTsZazsUQ9ba5SZ5BbkA-PcBfPZ`에 새로 보관했다. 원문 장부 `1E6Wel6JGjtKXIpuyIWEJ2w76j73ftzc7`, 9축 작업표 JSON/CSV `12XGTyhWYxgGaXndJYtkKKRfCu3R-t91K`/`1WVdJPPQ8p6DfoIzk9RbAcwLdzQ9GbYh8`, 전체 QA `12X26aAEZc4hEYdepRvuiNCQ3oC8aJv9p`는 기존 ID로 갱신하고 크기·부모 폴더를 재조회했다. 현재 810축은 미검수703·보류107·통과0, 교사 승인0·학생 공개0·중급 8회 신규 진단 연결0이다. 비공개 계산 코드는 로컬 `.private-work/middle8-20261018`에 보존한다.

## 2026-10-18 중급 8회 15번 시침·분침 겹침 직접 대조 (Mac)

- 원문 PDF 3쪽 15번의 오전 2시~오후 8시, 강의 답안 17쪽의 17회, 현재 6문항 인쇄본 8쪽의 세 변형을 직접 대조했다. 시침·분침이 겹치는 시각을 자정부터 정확히 `12k/11`시간으로 열거하면 원문은 정오 전9회+정오부터8회=17회, 변형은 9+7=16회·8+9=17회·7+11=18회다. 시작·끝 정각은 겹치지 않고 11시~정오의 빈 구간과 정오의 1회를 각각 확인했다.
- 3문항×9축 잠정 근거27행에 새 난도 차이 보류는 없지만, 학생 풀이 관찰·실물 인쇄·교사 최종 승인은 남는다. 전체 작업표는 미검수716·보류94·통과0, 학생 공개·중급 8회 신규 진단 연결0을 유지한다. 새 직접 대조 기록은 Drive `1faoFZ5hF4pwcO2PBearHAvaZo5fYOMFd`, 기존 원문 장부 `1E6Wel6JGjtKXIpuyIWEJ2w76j73ftzc7`, 9축 JSON/CSV `12XGTyhWYxgGaXndJYtkKKRfCu3R-t91K`/`1WVdJPPQ8p6DfoIzk9RbAcwLdzQ9GbYh8`, 전체 QA `12X26aAEZc4hEYdepRvuiNCQ3oC8aJv9p`에 연결했다. 파일 크기·부모 폴더를 재조회했고 로컬 계산 스크립트는 `.private-work/middle8-20261018`에만 보존한다.

## 2026-10-18 중급 8회 13번 원문 그림·확정 채점 기준 직접 대조 (Mac)

- 원문 PDF 3쪽의 13번 여섯 예시·빈 3×3 격자, 강의 답안 15쪽의 실제 색칠, 현재 6문항 문제 PDF 7쪽을 직접 열었다. 변형은 원본 그림 크롭을 그대로 쓰며, 사용자 확정 기준인 **각 열의 아래 칸부터 연속 색칠**만 정답으로 둔다. 열별 한 칸 값 16·4·1로 45(원문)와 46·39·54(변형)의 유일한 열별 칸 수와 색칠 위치를 다시 계산했다. 문제에 정답 칠하기나 풀이 단서를 추가하지 않았다.
- 세 변형×9축 잠정 근거 27행을 기록했다. 46은 원문 45보다 한 칸 많은 7칸을 칠해야 해서 계산·색칠 작업량 1축을 보류했다. 기존 작업표에서 13번의 ‘표현 전환’ 보류 3축은 사용자 채점 기준 및 원본 그림 직접 대조로 해소해 미검수로 돌렸다. 현재 전90문항 작업표는 **미검수 716·보류 94·통과 0**이며 최종 9축·실물 인쇄·교사 승인·학생 공개·중급 8회 신규 진단 연결은 모두 0이다.
- 직접 대조 기록은 Drive `1HnYj1SBzQ_V8tO-OwbnY0EdQLSk2ckwC`에 새로 보관했다. 원문 장부 `1E6Wel6JGjtKXIpuyIWEJ2w76j73ftzc7`, 9축 JSON/CSV `12XGTyhWYxgGaXndJYtkKKRfCu3R-t91K`/`1WVdJPPQ8p6DfoIzk9RbAcwLdzQ9GbYh8`, 전체 QA `12X26aAEZc4hEYdepRvuiNCQ3oC8aJv9p`는 기존 ID에 갱신하고 크기·부모 폴더를 다시 확인했다. 로컬 계산·생성 코드는 `.private-work/middle8-20261018`에만 있다. 12번 원본 답은 사용자 확정 17을 유지하며 같은 판정을 되묻지 않는다. 남은 직접 대조는 12·14~30번과 실물 인쇄·교사 판정이다.

## 2026-10-18 중급 8회 11번 원문·유사문제 9축 대조 (Mac)

- 원문 PDF 2쪽의 11번과 강의 답안 13쪽, 현재 6문항 인쇄본 6쪽을 직접 대조했다. 원문은 물 5/7·2/7 상태의 무게 차 690g과 빈 통 425g으로 가득 찬 무게 2kg 35g이다. 유사문제 3개는 각각 2kg 185g·2kg 210g·1kg 855g이며, 분수 차로 전체 물 무게를 구하는 계산과 두 채움 상태의 무게를 각각 재구성해 차를 확인하는 계산이 일치했다.
- 3문항×9축 27개 잠정 근거를 기록했다. 2번 변형은 800÷4＝200으로 수치가 원문보다 계산을 단축할 가능성이 있어 계산량·우연한 지름길 2축, 3번 변형은 875÷5와 175×8의 자릿수 부담을 비교해야 해서 계산량 1축을 보류했다. 최종 9축 승인·교사 승인·학생 인쇄 승인은 모두 0이다. 전90문항 작업표는 **미검수 714·보류 96·통과 0**이며 학생 공개·중급 8회 신규 진단 연결은 여전히 0이다.
- 새 직접 대조 기록은 Drive `1FQjuS71pp-0nPQU_99DH8UrOY-o_pX_4`에 보관했다. 기존 원문 장부 `1E6Wel6JGjtKXIpuyIWEJ2w76j73ftzc7`, 9축 작업표 JSON/CSV `12XGTyhWYxgGaXndJYtkKKRfCu3R-t91K`/`1WVdJPPQ8p6DfoIzk9RbAcwLdzQ9GbYh8`, 전체 QA `12X26aAEZc4hEYdepRvuiNCQ3oC8aJv9p`는 같은 ID로 갱신하고 크기·부모 폴더를 재조회했다. 비공개 계산·생성 스크립트는 로컬 `.private-work/middle8-20261018`에만 둔다. 다음에는 12번 사용자 확정 답 17을 그대로 유지한 상태에서 변형 3개의 원문 관계·9축을 검수하고, 이어 13~30번 직접 대조와 실물 인쇄·교사 판정을 진행한다.

## 2026-10-18 중급 8회 8번 표현 교정·비공개 재조판 (Mac)

- 원본 PDF 2쪽의 8번은 “시간이 조금씩 늦어지는 시계가 있습니다”라고 시작한다. 유사문제 3개의 “시간이 일정하게 늦어지는”은 원문에 없는 비례 힌트라서 세 문항의 첫머리를 “시간이 조금씩 늦어지는”으로 고쳤다. 바뀐 초안 ID는 `mid8-q08-v1/v2/v3`뿐이며 답·풀이·그림·원문·학생 데이터는 그대로다. 세 답은 오후 7:58:12·6:57:10·3:58:16이다. 새 검수 기록은 Drive `1IcBs6LTUNIKsvyQlVuhSVWNpI_2_OG5w`이다.
- 비공개 초안 90/90 예비 독립 계산, 4문항23쪽·6문항15쪽·답안35쪽·합본51쪽의 문제·답 90/90 및 풀이267단계 읽기, 그림63개 로드·잘림0을 다시 확인했다. 이전 PDF와 전체 페이지를 그림으로 비교하면 4문항 6쪽·6문항 4쪽·답안 9쪽만 달랐고 변경 면을 확대 확인했다. PC/390px 비공개 검토 화면은 90문항·이미지45개 로드·가로 넘침0이다. 실제 종이 인쇄와 교사 승인은 아직 아니다.
- 현재 SHA-256은 초안 `3f4afe6240e7dfe1f730a865080e9ab0bd269e1233becd5d7b45255d3a87d813`, 4문항 PDF `ee8e668fa03372a0635dce17b40c4fdac9de0de4df1d05d34228369f7ca637ca`, 6문항 PDF `6df6fb4c1e2cba5293ffe3f8f8968eed4016a4f299d369ae41c0a573a91802f2`, 문제·답안 합본 `5c831cd3d64b9712de0acdee84c62dad30e30834faf37c4e5edc3991e73a8863`이다. 원문 장부 `1E6Wel6JGjtKXIpuyIWEJ2w76j73ftzc7`, 9축 작업표 JSON/CSV `12XGTyhWYxgGaXndJYtkKKRfCu3R-t91K`/`1WVdJPPQ8p6DfoIzk9RbAcwLdzQ9GbYh8`, 전체 QA `12X26aAEZc4hEYdepRvuiNCQ3oC8aJv9p`를 기존 Drive ID에 갱신하고 관련 32개 파일의 크기·부모 폴더를 대조했다. 작업표는 미검수717·보류93·통과0으로, Q8 추가 힌트 6축 보류가 교정으로 해소된 결과다.
- 이전 초안·PDF는 로컬 `.private-work/middle8-20261018/pre-q08-wording-20261018`에 보존했다. 교사 승인0·학생 공개0·중급 8회 신규 진단 연결0을 유지한다. 다음에는 11~30번의 9축 직접 검수, 보류 유형의 난도·실물 인쇄·교사 판정, 승인 뒤 학생 은행/진단 연결을 진행한다. 12·30번 원본 답은 사용자의 판정대로 17·120을 유지하고 같은 근거를 다시 요청하지 않는다.

## 2026-10-18 중급 8회 90문항 9축 검수 작업표 연결 (Mac)

- 제작 기준 v2.7의 9축(선수 개념·추론 단계·조건 추적·경우 분류·계산량·표현 전환·읽기 부담·시각 단서·우연한 지름길)을 기존 비공개 초안 90문항에 펼쳐 810행의 작업표를 만들었다. 초안의 9축 문장은 제작자 메모로 분리하고, 최종 상태는 `미검수` 711행·`보류` 99행·`통과` 0행이다. Q3 중복 카드, Q6 v3 기호 배치, Q7 9개 원의 10등분 산술, Q8 일정한 속도 단서, Q12/30의 사용자 판정과 독립 계산 차이, Q14 추가 조건, Q20 면 방향, Q22 규칙, Q24 연못 모양, Q25 조건 문단화, Q28 반복수 표기, Q29 경우 분류 등을 문항·축별로 보류했다.
- 작업표 JSON/CSV를 기존 Drive 중급 8회 검수 폴더 `1ksibH1e-3kVmbATQQKSDwnoJZvhl9Aci`의 ID `12XGTyhWYxgGaXndJYtkKKRfCu3R-t91K` / `1WVdJPPQ8p6DfoIzk9RbAcwLdzQ9GbYh8`에 저장하고, 원문 장부 `1E6Wel6JGjtKXIpuyIWEJ2w76j73ftzc7`와 전체 QA `12X26aAEZc4hEYdepRvuiNCQ3oC8aJv9p`를 같은 ID로 갱신했다. 작업표 SHA-256은 JSON `f8fdf351e1dbdfe22fedff9b66aadd2c70aaad1c9c22aaa046259223a4d9521b`, CSV `d6f78731f22c89ef039ad0bd4c6d3f6885b60000e7cc4a0a8ea5b92b307c2c66`이다. 로컬 생성 코드와 검수표는 `.private-work/middle8-20261018`에 보존한다.
- 1·2번은 원본 1쪽·강의 답안 1~2쪽·현재 6문항 인쇄 시안 1쪽을 직접 대조해 여섯 변형×9축=54개의 잠정 근거를 따로 적었다(Drive `1DQ_F9uZmDOzMD1RBkCbD5T2yBQkj4uOp`). 1번 v2의 증가→감소 역방향 추론·읽기, 1번 v3의 잘못된 초안 계산 메모, 2번 세 변형이 모두 답 10을 공유해 묶음에서 답 복사가 가능한 점 등 7개 축은 차이 판정 보류다. 이 기록은 작업표의 최종 미검수/보류 수나 교사 승인 수를 올리지 않는다. 관련 Drive 다섯 파일의 크기·부모 폴더를 재조회했다.
- 3·4번도 원본 문제 PDF 1쪽의 실제 카드 아홉 장·3×3 네 고정칸 그림과 현재 6문항 문제 PDF 2쪽을 직접 비교했다. 3번의 원본 강의 답안 3쪽 중간 화면은 `987−123` 결과를 854로 썼으나 4쪽 다음 화면에서 가운데 자리를 고쳐 864로 표시한다. 독립 계산과 저장 답 864가 최종 화면과 일치한다. 세 변형의 실제 SVG 카드 숫자·60,480개 물리 배치·32,760개 서로 다른 표시 배치·최댓값 875/854/764를 다시 열거했고, 중복 숫자의 난도 영향 9개 축은 보류했다. 4번 세 새 격자는 원본과 같은 고정칸 위치·한 줄 합 관계에서 다섯 빈칸이 각각 유일하며 8줄을 독립 확인했다. 여섯 변형×9축=54개 잠정 근거는 Drive `10Gwu-ekcZN65RVUUTOtVBpu9Mks3Zf9U`에 저장해 작업표·원문 장부·전체 QA에 연결했고, 관련 다섯 파일의 크기·부모 폴더를 재조회했다.
- 5·6번은 원본 문제 PDF 1쪽의 세 막대 겹침·기호 덧셈 그림, 강의 답안 6~7쪽과 현 문제 PDF 3쪽을 직접 대조했다. 5번 원본 29cm와 변형 32/27/34cm는 막대 세 길이와 같은 두 겹침을 독립 계산해 확인했다. 변형 v1/v2는 둥근 수치로 원문보다 산술이 쉬워질 수 있다. 6번 원본 가3·나4·다9와 변형 합 12/14/18은 실제 SVG 기호 위치를 읽어 0~9 전수 탐색했고 일·십 자리 받아올림 두 번과 유일해를 확인했다. v3은 원문과 기호 자리가 달라 백의 자리에서 한 대입 단계를 줄일 수 있어 동등 난도 판정을 보류한다. 여섯 변형×9축=54개 잠정 근거·차이 보류5축은 Drive `10-UOFnAuVDR9AilgcbVl3kGQ9J1msxTt`에 저장해 작업표·원문 장부·전체 QA에 연결했으며 다섯 파일의 크기·부모 폴더를 재조회했다.
- 7·8번은 원본 문제 PDF 2쪽의 원 그림·시계 지문, 강의 답안 8~10쪽과 현 문제 PDF 4쪽을 직접 대조했다. 7번 원본 작은 원 지름14cm와 변형12/18/16cm를 양 끝 반지름·중심 간격으로 독립 계산했다. 9개 원을 쓰는 v1/v3은 큰 지름을 반지름 10개로 나눠 산술이 쉬워질 수 있다. 8번 원본 176시간·132초·15:57:48과 변형 180/204/130시간·108/170/104초의 표시 시각을 재검산했다. 변형의 “일정하게 늦어지는”은 원문의 “조금씩 늦어지는”보다 비례 관계를 더 직접적으로 알려 주므로 **문항 수정·재인쇄 검수 대상**으로 잠근다. 여섯 변형×9축=54개 잠정 근거·차이 보류8축은 Drive `1mnfMbesMLtnidWKjyLacLkYxjpdxzCa-`에 저장해 작업표·원문 장부·전체 QA에 연결했고 다섯 파일의 크기·부모 폴더를 재조회했다.
- 9·10번은 원본 문제 PDF 2쪽의 분수열·순서쌍열과 강의 답안 11~12쪽을 직접 대조했다. 9번 원본 50번째 5/11의 합16과 변형 47번째 2/11→13, 60번째 5/12→17, 74번째 8/13→21을 독립 열거와 묶음식으로 확인했다. 10번 원본 50번째 (5,6)과 변형 42번째 (6,4), 59번째 (4,8), 72번째 (6,7)도 같은 두 계산으로 일치했다. 두 유형의 v3은 원본보다 두 묶음 멀어 계산량 차이 판정을 보류했다. 여섯 변형×9축=54개 잠정 근거·차이 보류2축은 Drive `1J6fcDCzwJMIR_9rpHwWlUJQKpkBctKRP`에 저장해 작업표·원문 장부·전체 QA에 연결했고 다섯 파일의 크기·부모 폴더를 재조회했다.
- 이번에는 초안·그림·문제/답안 PDF·원본 답·학생 데이터·공개 코드를 바꾸지 않았다. Q12 원본 저장 답 17과 Q30 원본 저장 답 120은 사용자 판정대로 유지하고 같은 판정 자료를 다시 요청하지 않는다. 9축 작업표는 완료 판정이 아니며 직접 원문·실물 인쇄·교사 검수가 남았다. 교사 승인0·학생 공개0·중급 8회 신규 진단 연결0을 유지한다.

## 2026-10-18 중급 8회 26~29번 원문 계약과 30번 사용자 판정 기록 (Mac)

- 원본 PDF 5쪽 26번 성냥개비 삼각형·27번 세 연산 보기·28번 9의 반복 곱, 6쪽 29번 연속합·30번 쌓기나무 입체를 정확한 문항 번호로 직접 열고 강의 답안 PDF 29~33쪽을 대조했다. 원문 답은 26번 975개, 27번 42, 28번 135, 29번 2, 30번 저장·강의 답 120개다.
- 26~29번의 비공개 12개 변형은 줄별 성냥개비 합, 세 기호 연산 전수 적용, 각 인수의 9 숫자 개수에 따른 실제 정수 곱셈, 가능한 연속 자연수 길이 전수 열거로 따로 검산했다. 세 답은 26번 828·1134·1305, 27번 24·64·90, 28번 108·162·189, 29번 4·3·2다. 28번의 `99 ⋯ 99`와 `12/18/21개` 표기가 원본에서 사용자가 확정한 “9 숫자의 개수”로 읽히는지 실물 인쇄 검수는 남긴다. 이번에는 초안·그림·정답·PDF를 수정하지 않았다.
- 30번 원본 답은 사용자의 판정대로 120개로 유지하고 같은 판정 자료를 다시 요청하지 않는다. 독립 좌표 계산에서 나온 조건부 차이는 비공개 검수 기록에만 보존한다. 원본 답·채점·학생 데이터는 바꾸지 않았고, 30번 세 유사문제는 3차원 가림·난도·교사 검수 전 잠금이다. 전체 교사 승인0·학생 공개0·신규 진단 연결0을 유지한다.
- 26~29번 독립 기록은 Drive 중급 8회 검수 폴더 `1ksibH1e-3kVmbATQQKSDwnoJZvhl9Aci`의 새 ID `1Oq-Sw2FgB6-syizrtdYBX-vNIuefmIdT`에 저장했다. 30번 기존 조건부 기록 `1C6mCLTTadNYqeERM0k6HHO4l1GKCDCcy`에 사용자 판정 경계를 명시하고, 전체 QA `12X26aAEZc4hEYdepRvuiNCQ3oC8aJv9p`, 합본 QA `1LdwGcDkYIBEGrAztxt6jdJzc3NLO45E0`, 원문 장부 `1E6Wel6JGjtKXIpuyIWEJ2w76j73ftzc7`를 같은 파일 ID로 갱신했다. 크기·부모 폴더를 재조회했으며 초안·합본 해시는 아래 17~19번 절과 같다. 로컬 검산·렌더는 `.private-work/middle8-20261018`에 보존한다.

## 2026-10-18 중급 8회 23·24·25번 원문 계약 독립 검수 (Mac)

- 원본 PDF 4쪽의 23번 홀수 묶음·24번 8열×5행 격자와 두 연못, 5쪽의 25번 네 조건을 정확한 문항 번호에서 직접 열고 강의 답안 PDF 26~28쪽을 대조했다. 원문 답은 23번 121이 11번째 괄호의 6번째 수, 24번 최단 경로 62가지, 25번 142일이다. 25번은 사용자가 확정한 “비가 오지 않은 때는 모두 개인 때” 해석을 적용했다.
- 비공개 23번 세 변형은 홀수 직접 묶음과 삼각수 누적 계산 모두 (10,5)·(12,6)·(13,3)이다. 24번 새 그림 세 개의 **실제 SVG 선분**을 독립 파싱해 막힌 선이 없고 연못이 열린 선을 덮지 않음을 확인한 뒤, 재귀 경로 열거와 교점별 누적 계산이 각각 60·61·63으로 일치했다. 25번은 오전·오후 비가 동시에 오지 않는 모든 학기 길이를 전수 열거해 141·145·139일이 각각 유일하다. 초안·그림·정답·PDF는 이번에 수정하지 않았다.
- 24번의 원본 불규칙 연못과 새 타원 연못 사이 난도·시각 단서 동등성, 25번의 원본 네 줄 조건 상자를 한 문단으로 바꾼 읽기 부담은 남았다. SVG 선분 계산은 실물 인쇄·9축·교사 승인의 대체가 아니며 9개 모두 비공개 잠금 상태다. 교사 승인0·학생 공개0·신규 진단 연결0이다.
- 독립 검수 기록은 기존 Drive 중급 8회 폴더 `1ksibH1e-3kVmbATQQKSDwnoJZvhl9Aci`에 새 ID `17vuLkHixlmzz6s5jljZcUhhZ8UUthX48`로 저장했다. 기존 전체 QA `12X26aAEZc4hEYdepRvuiNCQ3oC8aJv9p`, 합본 QA `1LdwGcDkYIBEGrAztxt6jdJzc3NLO45E0`, 원문 장부 `1E6Wel6JGjtKXIpuyIWEJ2w76j73ftzc7`에 연결하고 주요 파일의 크기·부모 폴더를 재조회했다. 90문항 초안과 문제·답안 합본의 최신 해시는 아래 17~19번 절과 같다. 로컬 계산·원본 렌더는 `.private-work/middle8-20261018`에 보존한다.

## 2026-10-18 중급 8회 20·21·22번 원문 계약 독립 검수 (Mac)

- 원본 PDF 4쪽의 정확한 20번 주사위·경로, 21번 손가락 화살표, 22번 네 삼각형과 강의 답안 PDF 22~24쪽을 직접 열었다. 20번 시작 주사위 윗2·아랫5·앞1·뒤6·오른3·왼4를 오른쪽3칸→앞쪽2칸→오른쪽1칸 굴리면 원본 바닥면 열은 5·3·2·4·1·3·5, 합23이다. 21번은 검지가 8개 주기의 2·8번째여서 1~200에서 50번이다. 22번 원본의 앞 세 삼각형 곱의 일의 자리는 4·0·6, 마지막 7×8×9의 일의 자리는 4다.
- 기존 비공개 9개 변형을 따로 검산했다. 20번의 윗면·앞면·오른쪽 면 합은 각각 26·19·28로, 면 자리 전이와 3차원 회전의 두 계산이 일치한다. 21번 192·208·216까지의 검지 횟수는 직접 열거와 8주기 계산 모두 48·52·54다. 22번 세 새 그림의 실제 수치를 읽어 곱의 일의 자리 2·8·6을 확인했고, 예시 곱의 자릿수 2·2·3도 원본과 같다. 이번에는 초안·정답·그림·PDF를 변경하지 않았다.
- 20번의 묻는 면 변경이 원본과 같은 난도인지, 앞면·오른쪽 면의 방향을 어린 학생이 일관되게 읽는지 아직 판정하지 않았다. 22번의 유한한 식 후보 검사도 모든 시각 규칙의 유일성 증명은 아니다. 원본 그림 보존·화면 조판 확인과 별개로 실물 인쇄·9축·교사 승인 전 9개 모두 잠금 상태다. 교사 승인0·학생 공개0·신규 진단 연결0을 유지한다.
- 독립 기록은 Drive 기존 중급 8회 검수 폴더 `1ksibH1e-3kVmbATQQKSDwnoJZvhl9Aci`의 새 파일 `1rXGbXLCxFV5bzdSDez9LeAr-cDgPxGzd`에 저장했다. 기존 전체 QA `12X26aAEZc4hEYdepRvuiNCQ3oC8aJv9p`, 합본 QA `1LdwGcDkYIBEGrAztxt6jdJzc3NLO45E0`, 원문 장부 `1E6Wel6JGjtKXIpuyIWEJ2w76j73ftzc7`에는 같은 검수 ID와 잠금 경계를 연결하고 크기·부모 폴더를 재조회했다. 원본/문제 PDF·90문항 초안의 최신 해시는 바로 다음 17~19번 절과 같다. 로컬 검산 스크립트와 렌더는 `.private-work/middle8-20261018`에 보존한다.

## 2026-10-18 중급 8회 17·18·19번 원문 계약과 17·19번 비공개 답안 보강 (Mac)

- 원본 PDF 3·4쪽의 정확한 17번 모빌·18번 달력·19번 숫자열과 답안 PDF 19~21쪽을 직접 대조했다. 17번 원본은 아래·가운데·위 네 평형 관계에서 가=14라, 마=3라이고 원본 가280g이면 라20g·마60g이다. 18번 원본 토요일 합75는 화요일 4·11·18·25일이며, 19번 원본 1~999 연결 문자열은 오른쪽 300번째가 900의 9, 왼쪽 500번째가 203의 0이므로 차9다.
- 비공개 17번 세 답안에 네 막대 평형식과 실제 그램 값을, 19번 세 답안에 전체 2889자리·양쪽 인덱스·실제 세 자리 수와 자리값을 보강했다. 18번 세 변형은 28~31일과 시작 요일을 전수 열거해 답 목록이 유일함을 확인했다. 바뀐 초안 항목은 `mid8-q17-v1/v2/v3`, `mid8-q19-v1/v2/v3` 여섯 개이며 지문·그림·정답은 그대로다. 17번 변형 답은 (라, 마)=(25,75)·(30,90)·(40,120)g, 19번 변형 답은 4·1·2다.
- 현재 초안 SHA-256 `0f5996199be9c8cad56133710db0113e15ac4c8ecf36f74910bd4369f8f77fb6`, 4문항 PDF `eaa9b8909e4d4fbce09ca50b44aad64cec8fa8c14f42110be0518b9bbff9929b`, 6문항 PDF `276859c079a2ee1f604a75a59320c26e3f9d6ccfa37ba1818e32ec4943ba43a6`, 문제·답안 합본 51쪽 `46ce58a807adaba36be4b36fa6593fa5413c128d3045bc7e7c55c3dcb8c0b717`이다. 90/90 예비 독립 계산, 문제·답 90/90 및 풀이267단계 읽기, 새 답안 34~36쪽 시각 확인, PC/390px 비공개 검토 화면 90문항·45이미지 로드·가로 넘침0을 확인했다. 문제 PDF는 앞 작업과 같아 재업로드하지 않았다.
- Drive 기존 검수 폴더 `1ksibH1e-3kVmbATQQKSDwnoJZvhl9Aci`의 초안 `1DmG-hMjdvWbzfx3rBjPsV5gEPEhawsAc`, 합본 `1nr-LAUTUtu1o-7hKjZvz_8vPLdY7mLqt`, 비공개 검토 HTML `1vF2D4UK2gozm0TuS-81_iDw6wihGqFHx`, 원문 장부 `1E6Wel6JGjtKXIpuyIWEJ2w76j73ftzc7`, 전체 QA `12X26aAEZc4hEYdepRvuiNCQ3oC8aJv9p`와 변경 해시 참조 기록을 같은 ID로 갱신했다. 17·18·19번 독립 검수 기록은 새 Drive ID `1uLiotuo_iyykdxyqlRkcM47h_hdAJBzr`이며 주요 파일의 크기·부모 폴더를 재조회했다. 로컬 스크립트·스냅샷·렌더는 `.private-work/middle8-20261018`에 보존한다.
- 이 결과는 난도 9축 최종 통과나 실물 인쇄·교사 승인이 아니다. 12·30번은 사용자의 판정을 존중하고 같은 근거를 재요청하지 않으며, 독립 계산과의 차이는 검수 이력에만 남긴다. Q3 카드 난도, Q6 기호 배치, Q14 추가 조건, 17번 그림 가독성, 19번 숫자열 인쇄 가독성 등과 전90문항 최종 검수를 남긴다. 교사 승인0·학생 공개0·신규 진단 연결0이다.

## 2026-10-18 중급 8회 14·15·16번 원문 계약과 14·15번 비공개 보정 (Mac)

- 원본 PDF 3쪽의 14번 신호등 그림·지문, 15번 시계 겹침, 16번 곱셈식과 답안 PDF 16·17·18쪽을 직접 확인했다. 14번 원본은 켜진 불이 1·2·3개인 3＋3＋1＝7가지이며 모두 꺼진 물리 상태는 보낸 신호로 세지 않는다. 15번 오전2시~오후8시는 정확한 겹침 인덱스 2~18로 17번이고, 16번 3부터 2063까지 10씩 늘어나는 207인수의 일의 자리는 7이다.
- 비공개 14번 v3은 원문에 없던 두 제약을 한 제약으로 줄였다. 현재 “노란색 불을 켜면 초록색도 켠다” 조건에서 8상태 중 모두 꺼짐 1개와 조건 위반 2개를 제외한 답 5가지다. 14번 세 변형 답은 5·6·5이고 각 변형은 여전히 원문보다 조건이 하나 많다. 따라서 동등 난도 최종 판정·그림 실물 인쇄·교사 승인 전까지 잠근다. 15번 세 답안은 정오 전후 9＋7＝16, 8＋9＝17, 7＋11＝18의 실제 구간별 근거를 넣었다. 16번 세 변형의 첫 네 항·끝 세 항과 4주기 계산은 별도로 검산했다.
- 변경된 초안 항목은 `mid8-q14-v3`, `mid8-q15-v1/v2/v3` 네 개다. 초안 SHA-256 `957f1109467d2ad7f96334f186a7300f9a74ec3a162e3d6798c10f465c5c5012`, 4문항 PDF 23쪽 `eaa9b8909e4d4fbce09ca50b44aad64cec8fa8c14f42110be0518b9bbff9929b`, 6문항 PDF 15쪽 `276859c079a2ee1f604a75a59320c26e3f9d6ccfa37ba1818e32ec4943ba43a6`, 문제·답안 합본 51쪽 `4d9194cb64d307290c737e70de918294ce9092ccef2f629b2579fc5bcdaca152`다. 90/90 예비 독립 계산, 문제·답 90/90 및 풀이267단계 읽기, 그림63개 로드·DOM 잘림0을 재확인했다. 이전 전쪽 렌더와 픽셀 비교에서 4문항 11쪽, 6문항 7쪽만 달라 두 쪽과 합본 답안 31~33쪽을 다시 보았다. PC/390px 비공개 검토 화면은 30유형·90문항·원본 이미지45개 로드·가로 넘침0이다.
- Drive 기존 검수 폴더 `1ksibH1e-3kVmbATQQKSDwnoJZvhl9Aci`의 초안 `1DmG-hMjdvWbzfx3rBjPsV5gEPEhawsAc`, 4/6문항 PDF `15DU7hkCXda-TQk4iy0JW7nJ75cd1o85U`/`1GeteMsC1Ae8yjg62hxYYxWTei9Uedf4T`, 합본 `1nr-LAUTUtu1o-7hKjZvz_8vPLdY7mLqt`, 비공개 검토 HTML `1vF2D4UK2gozm0TuS-81_iDw6wihGqFHx`, 원본 대조 `1E6Wel6JGjtKXIpuyIWEJ2w76j73ftzc7`, 전체 QA `12X26aAEZc4hEYdepRvuiNCQ3oC8aJv9p`와 관련 검수 기록을 같은 ID로 갱신하고 주요 파일의 크기·부모 폴더를 재조회했다. 14·15·16번 전용 기록은 `1A4GxS2irU7HHYb7SF64Kk0Zt-0eOtJFx`에 추가했다. 로컬 생성기·렌더·스냅샷은 `.private-work/middle8-20261018`에 보존한다.
- 이번 검산은 9축 난도 최종 통과나 실물 인쇄·교사 승인이 아니다. 14번의 원문 대비 추가 조건과 중립 그림의 시각 해석, 3번 중복 카드, 12·30번 사용자 판정과 독립 계산 기록의 차이 등 남은 검수를 문항별로 유지한다. 교사 승인0·학생 공개0·신규 진단 연결0이며 12·30번 같은 자료를 다시 요청하지 않는다.

## 2026-10-18 중급 8회 9·10·11번 원문 계약과 비공개 9번 변형 보정 (Mac)

- 원본 PDF 2쪽과 답안 PDF 11·12·13쪽을 직접 대조했다. 9번 원본 50번째 분수는 5/11로 분자·분모 합 16, 10번 50번째 순서쌍은 (5,6), 11번 물통의 물 전체는 1610g·빈 통 425g이므로 가득 찬 통은 2kg 35g이다. 비공개 유사문제 9개는 같은 수열·대각선 묶음·물 무게 관계로 별도 열거/계산했고, 이 검산은 9축 난도 최종 승인이 아니다.
- 9번 v2의 기존 58번째 분수 3/12는 약분해 1/4로 읽는 이견을 피하려고 60번째 분수 5/12로 바꿨다. 답은 17이며 변경된 초안 항목은 `mid8-q09-v2` 하나다. 9번 세 답은 13·17·21, 10번 세 순서쌍은 (6,4)·(4,8)·(6,7), 11번 세 답은 2kg185g·2kg210g·1kg855g이다. 초안 SHA-256 `cdcf2a8e7c5146b5220cefe065562d8a9afd05f7cb67a50b5b48c92af7fdaeed`.
- 비공개 4문항 PDF 23쪽 SHA-256 `04eea47fafb56ab0b5811c6efe5a43d2a7ac3a08f26c1be06883b3c83707cd51`, 6문항 PDF 15쪽 `6096281b5baa58cb6cad4539dd5a2444a06346d46d4ee99d50246a273dbe7529`, 문제·답안 합본 51쪽 `0e6d788b5a2794e069378f2ba8e03b01f495482e52ef410391747280ea78ce96`이다. 90문항·90답안·풀이267단계 읽기와 그림63개 로드·DOM 잘림0을 다시 확인했다. 이전 전쪽 화면 렌더와 픽셀 비교에서 4문항 7쪽, 6문항 5쪽만 달라 두 쪽과 합본 답안 26쪽을 다시 보았다. 비공개 검토 HTML은 PC/390px에서 30유형·90문항·이미지45개 로드·가로 넘침0이다.
- Drive 기존 중급8회 검수 폴더 `1ksibH1e-3kVmbATQQKSDwnoJZvhl9Aci`의 초안 `1DmG-hMjdvWbzfx3rBjPsV5gEPEhawsAc`, 4/6문항 PDF `15DU7hkCXda-TQk4iy0JW7nJ75cd1o85U`/`1GeteMsC1Ae8yjg62hxYYxWTei9Uedf4T`, 합본 `1nr-LAUTUtu1o-7hKjZvz_8vPLdY7mLqt`, 비공개 검토 HTML `1vF2D4UK2gozm0TuS-81_iDw6wihGqFHx`, 전체 QA `12X26aAEZc4hEYdepRvuiNCQ3oC8aJv9p`와 변경 해시를 참조하는 기록을 같은 ID로 갱신하고 주요 크기·부모 폴더를 재조회했다. 9·10·11번 전용 검수 기록은 Drive `1_w7LHqyQ24IRENmG-P_s5zKZlMSWqT8m`에 새로 저장했다. 로컬 작업·렌더·스크립트는 `.private-work/middle8-20261018`에 둔다.
- 12·30번은 사용자의 기존 정답 판단을 기준으로 존중하고 같은 판정 자료를 다시 요청하지 않는다. 별도 계산 차이는 검수 이력에만 유지한다. 전90문항 난도 9축·실물 인쇄·교사 최종 승인, 3번 중복 카드 난도와 그림 검수 등이 남아 교사 승인0·학생 공개0·신규 진단 연결0을 유지한다.

## 2026-10-18 중급 8회 5·7·8번 원문 계약과 8번 시계 변형 보정 (Mac)

- 원본 PDF 1쪽 5번 막대 그림·지문과 강의 답안 6쪽의 29cm, 원본 PDF 2쪽 7번 원 그림·지문과 답안 8쪽의 14cm, 8번 지문과 답안 9·10쪽을 직접 대조했다. 5번 원본 크롭은 가·나·다와 두 겹침만, 7번 크롭은 원의 중심·양끝과 생략 부호만 표시해 변형의 새 수치·작은 원 개수와 충돌하지 않는다. 5번 변형 답 32·27·34cm의 단일 겹침과 가운데 막대에서 두 겹침이 서로 분리됨을 확인했다. 7번 변형 답 12·18·16cm는 지름을 작은 반지름 `N＋1`개로 나누는 원본 관계와 일치한다.
- 8번 기존 v1·v2는 시간당 지연률이 각각 2/4, 3/6으로 모두 1/2초로 약분돼 원본 3/4보다 계산 부담이 낮아지는 단축이 있었다. 비공개 두 문항을 v1 `5시간에 3초·7일12시간` → 108초 지연 → 오후 7시 58분 12초, v2 `6시간에 5초·8일12시간` → 170초 지연 → 오후 6시 57분 10초로 보정했다. v3은 기존 `5시간에 4초·5일10시간` → 104초 → 오후 3시 58분 16초를 유지했다. 세 지연률은 모두 약분되지 않고 원본과 같은 날짜·시간 환산, 1분 초과 지연 및 시각 뺄셈을 요구한다. 답안 PDF의 시계 답 표기는 지문의 응답 계약대로 24시간 숫자 대신 오전/오후 한국어로 고쳤다. 8번 원본의 176시간×3/4＝132초와 기존 저장 답 오후 3시 57분 48초는 유지하고, 강의 답안 10쪽의 상이한 필기 계산은 기존 원본 검수 이력으로만 보관한다.
- 현재 비공개 초안 SHA-256 `998e96ae8663befa0580bb0841eb67bde5ba0f88a6864f7668a389fe3280dba2`, 4문항 PDF 23쪽 `6d521854ad59b2a2128556718d508142357f5ce8c43cfe40524677fb811160eb`, 6문항 PDF 15쪽 `788f7be4ef6789ac902467c8535b9ce72bd3462bd5a8b7bf655646d5e6a42a15`, 문제·답안 합본 51쪽 `bd3f074b752c2bdace7098b99fda64612607a7a9a43c16a3fe66f3563bbde603`이다. 초안 변경은 8번 v1·v2뿐이다. 90/90 독립 예비 계산, 문제·답 90/90 및 풀이267단계 읽기, 그림63개 로드·DOM 잘림0을 재확인했다. 이전 전쪽 화면 검수와 새 1700px 렌더를 픽셀 비교하면 4문항 6쪽, 6문항 4쪽만 달랐고 두 쪽과 합본 답안 25쪽을 직접 다시 보아 눈에 띄는 잘림·겹침이 없었다. PC/390px 비공개 검토 화면은 30유형·90문항·원본 이미지45개 로드·가로 넘침0이다.
- Drive 기존 중급8회 검수 폴더 `1ksibH1e-3kVmbATQQKSDwnoJZvhl9Aci`의 초안 `1DmG-hMjdvWbzfx3rBjPsV5gEPEhawsAc`, 4/6문항 PDF `15DU7hkCXda-TQk4iy0JW7nJ75cd1o85U`/`1GeteMsC1Ae8yjg62hxYYxWTei9Uedf4T`, 합본 `1nr-LAUTUtu1o-7hKjZvz_8vPLdY7mLqt`, 비공개 검토 HTML `1vF2D4UK2gozm0TuS-81_iDw6wihGqFHx`, 전체 QA `12X26aAEZc4hEYdepRvuiNCQ3oC8aJv9p` 및 관련 검수 기록을 같은 ID로 갱신했다. 5·7·8번 전용 근거는 `1Jipp35o8mL5H0QiG965SqFmly6szLhEA`에 추가했으며 주요 파일의 크기·부모 폴더를 재조회했다. 작업 스크립트와 렌더는 로컬 `.private-work/middle8-20261018`에 보존한다.
- 이는 수학·원문 계약의 비공개 예비 검수다. 전90문항 난도 9축·실물 인쇄·교사 승인, 3번 중복 숫자 카드 난도, 6번 v3 기호 배치, 12·30번 원본 답 계산 차이, 25번 읽기 부담 등이 남아 교사 승인0·학생 공개0·신규 진단 연결0을 유지한다. 사용자에게 12·30번 같은 판정 자료를 재요청하지 않는다.

## 2026-10-18 중급 8회 6번 올림 풀이와 비공개 답안 갱신 (Mac)

- 원본 문제 PDF 1쪽의 정확한 덧셈 그림 `가다나＋나가다＝8가가`와 강의 답안 PDF 7쪽의 `(가,나,다)=(3,4,9)`, 합 16을 다시 직접 대조했다. 원본과 같은 기호 자리에서 맨 앞자리 숫자만 바꾸어 해가 있는 경우는 4·6·8뿐이다. 이미 원본인 8을 제외한 두 변형은 `192＋219＝411`(합 12), `293＋329＝622`(합 14)로 만들었고, 세 번째는 자리배치를 바꾼 `459＋495＝954`(합 18)다. 세 변형의 해 유일성과 일의·십의 자리 올림을 별도 전수 열거로 확인했다. 세 번째는 기호 자리배치가 달라 난도 동등성 최종 판정 전까지 잠근다.
- 6번 세 답안의 근거를 십의 자리에서 `다＝9`가 되는 이유, 일의 자리의 `나＝가＋1`, 백의 자리와 최종 검산으로 보강했다. 바뀐 초안 항목은 6번 v1~v3뿐이며, 현재 초안 SHA-256 `9b046831f318acf8b01920d9ddf4ea5f43f79f7339ee4d1443f7e98e8d0863ff`다. 문제·답안 결합 PDF는 51쪽, SHA-256 `60864dcd29a9be4be919f42aba8b484c27d45b360f3288ae7dd2c5a733352cca`이며 답안 22·23쪽을 새 렌더로 직접 확인했다. 비공개 예비 계산 90/90, 문제·답 90/90, 풀이 267단계 재읽기, 4문항/쪽 23쪽과 6문항/쪽 15쪽의 이전 전체 시각 검사가 통과했다. 두 문제 전용 PDF 자체는 이번 답안 수정으로 변경되지 않았다.
- Drive 기존 검수 폴더 `1ksibH1e-3kVmbATQQKSDwnoJZvhl9Aci`의 초안 `1DmG-hMjdvWbzfx3rBjPsV5gEPEhawsAc`, 합본 `1nr-LAUTUtu1o-7hKjZvz_8vPLdY7mLqt`, 전체 QA `12X26aAEZc4hEYdepRvuiNCQ3oC8aJv9p`, 합본 QA `1LdwGcDkYIBEGrAztxt6jdJzc3NLO45E0` 및 변경 해시를 참조하는 검수 장부를 같은 ID로 갱신했다. 6번 전용 독립 검산 기록은 `1Kl0n9egOJ5P1nvn6bgeJvssrEIPR9YVA`에 새로 저장했고 주요 파일의 크기와 부모 폴더를 재조회했다. 로컬 작업·렌더·스크립트는 `.private-work/middle8-20261018`에만 둔다.
- 사용자는 12·30번에 대해 자신의 기존 판단이 맞다고 명시했다. 반복적인 판정 자료 요청은 중단하고 그 판단을 존중한다. 원본 그림을 독립 계산한 기록과 기존 답의 차이는 검수 이력으로만 유지하며, 이번 작업에서 원본 답·성적·채점·학생 권한을 변경하지 않았다. 전90문항 9축 난도·그림/실물 인쇄·교사 승인과 3번 중복 카드 난도 등이 남아 교사 승인0·학생 공개0·신규 진단 연결0을 유지한다.

## 2026-10-18 중급 8회 비공개 문제지 전쪽 화면 검수 (Mac)

- 현 비공개 초안 SHA-256 `857136df174f43e206d8713390cf2f874cea794fd454e1791fea1e191a2d91e2`에 대응하는 4문항/쪽 PDF 23쪽(`f00f2d94a20b1a995fcc5d4a3431c85a61f54cf268e86cd9827ba1f9f9ffa510`)과 6문항/쪽 PDF 15쪽(`679e93f9333212122495328979aab43b78878b3c3b2fda7ff048dc03e5aca300`)을 모두 1700px 렌더로 열어 보았다. 두 배치에서 눈에 띄는 지문·그림 잘림이나 문항 칸 겹침은 0건이다. PDF 텍스트 재읽기에서 각 문제 ID 90개가 한 번씩 나타나고 그림63개 로드·DOM 잘림0의 이전 검사를 재확인했다.
- 6문항 PDF 5쪽의 9번 세로 분수열은 300dpi 확대에서 분자·분모와 옆 분수가 분리되어 있음을 확인했다. 10번 순서쌍 자료의 끝 쉼표는 원본 PDF 2쪽에도 같은 형태라 새 인쇄 잘림으로 세지 않았다. 13번의 작은 여섯 예시 격자와 19·23번의 작은 원본 자료, 21번 손 그림은 실제 종이와 대상 연령의 읽기 검수를 남겼다. 화면 렌더 전쪽 확인은 실물 인쇄 가독성·문항 수학/난도 9축·교사 승인을 뜻하지 않는다.
- Drive의 기존 4문항 QA `1tFshrcIuXsqSaU6gYyrZ2YjY7mfxokTp`와 전체 사전 QA `12X26aAEZc4hEYdepRvuiNCQ3oC8aJv9p`를 같은 ID로 갱신하고, 6문항 전쪽 화면 검수 기록 `1v2hv71jfad1R60hA3et6KTQU8R1pyxvz`를 같은 중급8회 검수 폴더에 추가했다. 세 파일의 크기·부모 폴더를 재조회했다. PDF·초안·원본 답·학생 데이터는 이번 시각 검사로 변경하지 않았고, 교사 승인0·학생 공개0·신규 진단 연결0을 유지한다.

## 2026-10-18 중급 8회 4번 변형 재설계·12/30번 판정 경계 (Mac)

- 비공개 4번 유사문제 세 개를 원문 PDF 1쪽의 3×3 마방진과 같은 네 고정칸·다섯 빈칸·연속하는 아홉 세 자리 수 구조로 다시 만들었다. 원본 그림은 바꾸지 않았고 유사문제용 새 SVG만 썼다. 세 변형은 각각 원본 수 배열의 수평 반사, 90도 회전, 270도 회전에 수치 이동을 적용해 공통 상수만 더한 반복을 피했다. 고정 수·빈칸 답은 v1 [182,184,185,186]→[189,187,183,181,188], v2 [202,198,199,200]→[197,195,203,201,196], v3 [213,217,216,215]→[218,220,212,214,219]다. 네 고정 수만으로 완성 해가 각 하나임을 독립 탐색했다.
- 4번 세 항목 이외 87항목은 이전 초안과 동일하다. 비공개 예비 계산 90/90, 4문항 PDF 23쪽·6문항 PDF 15쪽의 그림63개 로드·잘림0, 문제/답안 합본 51쪽의 문제·답 각90개와 풀이267단계 읽기 검증을 통과했다. 4번 문제 PDF 4문항 3쪽·6문항 2쪽과 합본 답안 19쪽을 확대 확인했다. 현 초안 SHA-256 `857136df174f43e206d8713390cf2f874cea794fd454e1791fea1e191a2d91e2`, 4문항 PDF `f00f2d94a20b1a995fcc5d4a3431c85a61f54cf268e86cd9827ba1f9f9ffa510`, 6문항 PDF `679e93f9333212122495328979aab43b78878b3c3b2fda7ff048dc03e5aca300`, 합본 `d3f3e859adaf9365f488f521693147bdd674cc5990fe9418add3df0b73e5e97f`다. 앞 절의 해시는 당시 이력이다.
- Drive 기존 검수 폴더 `1ksibH1e-3kVmbATQQKSDwnoJZvhl9Aci`에서 초안 `1DmG-hMjdvWbzfx3rBjPsV5gEPEhawsAc`, 그림 ZIP `1vm1V3y9uSCAfHk1OAasIBxvOSIoBK3-z`, 4/6문항 PDF `15DU7hkCXda-TQk4iy0JW7nJ75cd1o85U`/`1GeteMsC1Ae8yjg62hxYYxWTei9Uedf4T`, 합본 `1nr-LAUTUtu1o-7hKjZvz_8vPLdY7mLqt`, 관련 QA·위험도 기록을 같은 ID로 갱신했다. 4번 전용 검수 기록은 `1t1zg7iS0onrgeF2gAL2RnzgvrTHCY90m`이며 주요 파일 ID·크기·부모 폴더를 다시 확인했다. 로컬 생성기·이전 스냅샷은 `.private-work/middle8-20261018`에 둔다.
- 30번은 원본의 두 정육면체 20개 성냥개비 계산을 기준으로 면으로 이어진 13개 입체의 상한이 108개이며, 기존 답 120개가 되려면 적어도 네 연결 성분이 필요하다는 조건부 검산을 추가했다(Drive `1C6mCLTTadNYqeERM0k6HHO4l1GKCDCcy`). 12번의 원본 그림 독립 계산 16과 기존 답 17의 충돌도 기존 기록 `14cMTh2Gu1I1tp6lqUpNut1nlSqXW-sIE`에 유지한다. 사용자의 기존 답 판단을 존중해 원본 답·채점·학생 기록은 변경하지 않는다. 검산 차이와 원본 그림 해석은 판정 근거로만 보관하고 이 여섯 변형은 잠근다. 3번 중복 카드 난도, 전90문항 9축·그림·교사 승인, 학생 렌더러 인쇄 검수도 남아 교사 승인0·학생 공개0·신규 진단 연결0을 유지한다.

## 2026-10-18 중급 8회 비공개 답안 조사 검수 (Mac)

- 원문 PDF 1쪽의 2번 나머지 3 조건과 비공개 초안 2·3번을 재확인하면서, 답안 문장 세 곳의 숫자 뒤 조사를 고쳤다. `mid8-q02-v3`의 “나머지 6를”→“나머지 6을”, `mid8-q03-v1/v2`의 “112을/122을”→“112를/122를”이다. 생성 코드에도 조사 선택을 반영했다. 변경 전후 JSON에서 이 세 문항의 풀이 문장 외 지문·정답·계약·그림·잠금 값은 같고, 90문항의 숫자 직접 목적격 조사 33곳 자동 검수에 남은 오류가 없다.
- 답안 HTML/PDF와 문제·답안 합본을 다시 만들었다. 합본 18쪽을 실제 렌더로 확인했고 PDF 재읽기에 세 수정 문구가 모두 있다. 독립 예비 계산 90/90, 합본 문제·답 각90개와 풀이267단계 읽기 검증, 답안 그림63개 로드·가로 넘침0, 51쪽 및 공개 잠금 유지가 통과했다. 현재 초안 SHA-256 `fa2fa569fe091ce0f2bdb4cc8683b0f45e9e582f2a8964b1069872a8ede71170`, 합본 SHA-256 `9a7ad6f5c9f50c1b9dacf8e7caa010b0488754df697a938f8dc26585f59b32d5`다. 이전 절의 초안·합본 해시는 당시 이력이며, 4/6문항 문제 PDF는 지문 변화가 없어 기존 파일 그대로다.
- Drive 기존 중급8회 검수 폴더 `1ksibH1e-3kVmbATQQKSDwnoJZvhl9Aci`의 초안 `1DmG-hMjdvWbzfx3rBjPsV5gEPEhawsAc`, 합본 `1nr-LAUTUtu1o-7hKjZvz_8vPLdY7mLqt`, 사전 QA `12X26aAEZc4hEYdepRvuiNCQ3oC8aJv9p`, 합본 QA `1LdwGcDkYIBEGrAztxt6jdJzc3NLO45E0`, 3·28번 QA 및 분수 QA를 같은 ID로 갱신했다. 새 문장 검수 기록 `1Sztns8DK2XbRI8c-U0WpA3V00GzJyqgN`를 추가하고 주요 파일의 크기·부모 폴더를 재조회했다. 로컬 생성·검수 코드는 `.private-work/middle8-20261018`에 둔다.
- 이는 비공개 답안 문구 보정이다. 원문 12·30번 답 충돌, 3번 중복 카드 난도, 전90문항 9축·그림·교사 승인과 학생 렌더러의 분수 인쇄 검수는 남았다. 교사 승인0·학생 공개0이며 학생 문제은행·진단의 신규 유사문제 연결은 하지 않았다.
- 원본 문제 PDF 1쪽과 강의 답안 PDF 1·2쪽의 1·2번을 실제 이미지로 다시 대조했다. 원본 1번의 천/백 자리 3/5와 자리 교환 후 45 증가 조건은 3505·3516·3527·3538·3549의 다섯 해, 원본 2번의 두 자리 수 중 9로 나눈 나머지 3은 12~93의 열 개를 독립 전수 열거로 재확인했다. 비공개 변형 Q1·Q2 여섯 문항은 지문을 별도 파싱해 답·계약·경계·경우 수가 원본과 일치함을 검증했다. 원문/변형 수학 계약 6/6의 범위만 통과이며 Q1 v2의 증가→감소 전환, Q2의 나머지만 바꾼 변별성, 학생 읽기/인쇄, 9축 최종 승인과 교사 승인은 남는다. Drive 새 감사 기록 `12GupqIMJXluwWPS4rmVM36kq_EISt6BL`을 검수 폴더에 보관했고 사전 QA `12X26aAEZc4hEYdepRvuiNCQ3oC8aJv9p`를 같은 ID로 갱신했다.

## 2026-10-18 중급 8회 비공개 검수본 분수 조판 (Mac)

- 지정 제작 기준 v2.7의 분수 표기를 비공개 인쇄 검수본에 적용했다. 초안의 지문·풀이에 있던 숫자/숫자 형태 21곳(문제 6곳)을 4문항·6문항 문제 PDF와 답안 PDF에서 세로 분수로 조판했다. 글꼴·굵기·색을 상속하고 실제 A4 문제 4/6문항 및 합본 답안 대표 쪽을 확대 확인했다. PDF 텍스트에 남은 숫자/숫자 표기 0곳이다. 문제 지문·그림·정답·초안 JSON은 변경하지 않았다.
- 비공개 자동 재검수에서 초안 90/90 독립 예비 계산, 4문항 PDF 23쪽의 문항·지문 90/90 및 그림 63개·잘림0, 6문항 PDF 15쪽의 그림 63개·잘림0, 합본 51쪽의 문제·답 각90개와 풀이267단계가 일치했다. 현재 초안 SHA-256 `42180304b35c3bf8e62ccce28537629bf261664501c66330b9d5528d623801ff`, 4문항 PDF `a59948a88aebc077b9754a49f7b4239f2c9bcf384ec734fc1cb37c3d30b6e465`, 6문항 PDF `1323d5a1b5ceace5eb6a914131fe46fb08104797febc6c9a3efe642060d85cbe`, 합본 `10887c0c4e840304a4aa8aa6bea11d52651d421e45b6ea0e4ced46f09405d62c`다. 아래 합본 해시는 이전 이력이다.
- Drive 중급8회 검수 폴더 `1ksibH1e-3kVmbATQQKSDwnoJZvhl9Aci`에서 4문항 PDF `15DU7hkCXda-TQk4iy0JW7nJ75cd1o85U`, 6문항 PDF `1GeteMsC1Ae8yjg62hxYYxWTei9Uedf4T`, 합본 `1nr-LAUTUtu1o-7hKjZvz_8vPLdY7mLqt`와 관련 사전·4문항·합본·3번·28번 QA를 같은 ID로 갱신하고 크기·부모 폴더를 재조회했다. 신규 분수 조판 기록은 `18wST2dpa8NhIpt09hH3aYgqP9Ogen_lg`다. 그림 ZIP `1vm1V3y9uSCAfHk1OAasIBxvOSIoBK3-z`은 바뀌지 않았다. 로컬 생성 코드와 검수본은 `.private-work/middle8-20261018`에 보존한다.
- **이번 조판은 비공개 PDF에만 적용됐다.** 초안 JSON은 여전히 일반 분수 문자열을 담고 있으므로, 장래 학생 문제은행 렌더러에도 같은 분수 표기를 적용하고 실제 화면·인쇄를 검수해야 한다. 원문 12·30번 답 충돌, 3번 중복 카드 난도, 25번 읽기 부담, 전90문항 9축·그림·인쇄·교사 승인도 남았다. 교사 승인0·학생 공개0이며 학생 문제은행·진단 신규 유사문제 연결은 하지 않았다.

## 2026-10-18 중급 8회 28번 원문식 자리값 풀이 보정 (Mac)

- 원본 PDF 5쪽 28번의 양쪽 9 반복수와 답안 PDF 31쪽의 자리값 뺄셈 풀이를 다시 직접 대조했다. 비공개 변형 3개의 기존 답 108·162·189는 독립 큰 정수 제곱과 자리 숫자 합으로 재확인했다. 기존 상세 풀이의 `10의 n제곱` 표현은 원문 강의와 다르고 선수 개념을 높일 수 있어, 각각 “1 뒤에 0을 n개 붙인 수에서 1을 뺀 수”로 바꾸었다. 이어 같은 9 반복수 뒤에 0을 n개 붙인 값에서 원래 수를 빼는 원문 방법으로 숫자 배열을 설명한다. 문제 지문·그림·정답은 그대로다.
- 세 답안의 실제 인쇄 PDF 48·49쪽을 확대 확인했다. 비공개 예비 계산 90/90, 합본 51쪽의 문제·답 각90개와 풀이 단계267개 읽기 검증, 그림/자료63개 로드·잘림0을 다시 통과했다. 최신 초안 SHA-256 `42180304b35c3bf8e62ccce28537629bf261664501c66330b9d5528d623801ff`, 합본 SHA-256 `9e44e427cb1df779046bd53126e180ddb8932628290a0d455687d1510b7e693c`다.
- Drive 기존 초안 `1DmG-hMjdvWbzfx3rBjPsV5gEPEhawsAc`, 그림 ZIP `1vm1V3y9uSCAfHk1OAasIBxvOSIoBK3-z`, 합본 `1nr-LAUTUtu1o-7hKjZvz_8vPLdY7mLqt`, 사전 QA `12X26aAEZc4hEYdepRvuiNCQ3oC8aJv9p`, 합본 QA `1LdwGcDkYIBEGrAztxt6jdJzc3NLO45E0`, 위험도 장부 `1tTtkMshBo6UwZnEDAccwF9ywpaKMuQuc`와 3번 비교 기록 `1KyTikBb1rRPEtSlSJvvAMIeGik74NXC-`을 같은 ID로 갱신했다. 신규 28번 원문식 풀이 기록은 `1_GhZvYA7z8NP60QoEbaMmNnT7y-HGKqp`이며 ID·크기·부모 폴더를 재조회했다. 아래 이전 초안·합본 해시는 당시 이력이다.
- 원문 12·30번 정답 충돌, 3번 중복 숫자 난도, 25번 읽기 부담, 전90문항 9축·풀이·그림·인쇄·교사 승인은 계속 검수 대기다. 교사 승인0·학생 공개0; 학생 문제은행·진단의 신규 유사문제 연결은 하지 않았다.

## 2026-10-18 중급 8회 3번 카드 아홉 장 후보 재설계 (Mac)

- 원본 PDF 1쪽 3번의 1~9 숫자 카드 아홉 장과 답안 PDF 3쪽의 987−123=864를 다시 직접 대조했다. 이전 비공개 초안은 카드 여덟 장이어서, 사용자 허용 범위의 유사문제 전용 새 SVG를 아홉 장 후보로 재작성했다. 세 변형은 각각 [1,1,2,3,4,5,7,8,9], [1,2,2,3,4,5,6,7,9], [1,2,3,4,5,6,7,8,8]이며 최댓값은 875·854·764다. 카드 여섯 장의 자리별 전수 열거와 자리값 교환 논증이 일치한다.
- 아홉 장 중 여섯 장을 고르는 물리 배치는 원문·변형 모두 60,480개다. 다만 변형마다 같은 숫자 카드가 한 쌍 있어, 서로 다르게 적히는 배치는 원문 60,480개에서 변형 32,760개로 줄어든다. 따라서 **난도 동등성은 확인되지 않았고** 3문항 모두 `duplicate-digit-difficulty-comparison-pending`으로 잠근다. 원본 그림·정답·학생 기록은 수정하지 않았다.
- 전90문항 비공개 예비 독립 계산 90/90, 4문항/쪽 23쪽·6문항/쪽 15쪽의 그림/자료 63개 로드와 잘림0, 문제 15쪽+빈 면1쪽+답안35쪽=51쪽 합본의 문제·정답 각90개 및 풀이267단계 읽기 검증을 다시 통과했다. 3번 세 후보의 실제 문제·답안 PDF를 확대 확인했다. 최신 초안 SHA-256 `f5a8edf693f8bda980a4f4c9d483c6fef07d90eeaa5b5426d11c247962948fa6`, 4문항 PDF `3b207c998b63f8b1dbcf58bda4f967a87e37641126cdb1d8d94497d4532bbd9a`, 합본 `acc1317b9e7cbefd17d988e6ec0d0408f6e5e0d1159074fa5d484b777870f6b8`이다.
- Drive 기존 중급8회 검수 폴더의 초안 `1DmG-hMjdvWbzfx3rBjPsV5gEPEhawsAc`, 그림 ZIP `1vm1V3y9uSCAfHk1OAasIBxvOSIoBK3-z`, 4/6문항 PDF `15DU7hkCXda-TQk4iy0JW7nJ75cd1o85U`/`1GeteMsC1Ae8yjg62hxYYxWTei9Uedf4T`, 합본 `1nr-LAUTUtu1o-7hKjZvz_8vPLdY7mLqt`와 사전·인쇄·합본 QA 및 위험도 장부를 같은 ID로 갱신하고 크기·부모 폴더를 재조회했다. 신규 3번 비교 기록은 `1KyTikBb1rRPEtSlSJvvAMIeGik74NXC-`이다. 아래 8장/이전 해시 기록은 당시 이력이다. 로컬 이전 초안 스냅샷은 `.private-work/middle8-20261018`에 보존했다.
- 여전히 원문 Q12/Q30 답 충돌, Q3 중복 숫자 난도, Q25 문장 통합, 전90문항 9축·풀이·그림·인쇄·교사 승인이 남아 있다. 교사 승인0·학생 공개0이며 학생 문제은행·진단 유사문제 연결은 하지 않았다.

## 2026-10-18 중급 8회 3·28번 새 그림 후보와 비공개 합본 재검수 (Mac)

- 사용자 허용에 따라 **유사문제 전용** Q3·Q28 SVG 각 3개를 만들었다. 원본 PDF 1쪽 Q3은 1~9 카드 아홉 장인데 비공개 변형은 여덟 장이어서, 변형 그림에도 실제 카드 여덟 장만 표시했다. 이는 경우 추적 부담 감소 가능성을 해소하지 않으므로 Q3 세 문항 모두 난도 검수 대기다. 원본 PDF 5쪽 Q28과 답안 31쪽을 다시 대조하면 `15개`는 각 곱셈 인수의 숫자 9가 15개라는 뜻이다. 변형 그림은 각 인수에 숫자 9가 12·18·21개임을 표시하고 답 108·162·189를 독립 검산했다. 원본 그림은 수정·재사용하지 않았다.
- 비공개 초안 90개 예비 독립 계산과 잠금 검사가 통과했다. A4 4문항/쪽 23쪽 및 6문항/쪽 15쪽에 그림/자료 63개가 모두 로드되고 DOM 잘림은 0이다. 답안 35쪽을 포함한 합본은 문제 15쪽+빈 면 1쪽+답안 35쪽=51쪽이다. PDF 재읽기에서 문제 ID·지문 90/90, 답안 번호·정답 90/90, 풀이 단계 267/267을 대조했다. Q3/Q28이 있는 문제·답안 대표 쪽을 실제 이미지로 확인했다. 이는 전 문항의 9축 난도·그림·학생 인쇄·교사 승인 완료가 아니다. **교사 승인 0, 학생 공개 0**을 유지한다.
- Drive의 기존 중급 8회 검수 폴더 `1ksibH1e-3kVmbATQQKSDwnoJZvhl9Aci`에서 초안 `1DmG-hMjdvWbzfx3rBjPsV5gEPEhawsAc`, 그림 ZIP `1vm1V3y9uSCAfHk1OAasIBxvOSIoBK3-z`, 6문항 PDF `1GeteMsC1Ae8yjg62hxYYxWTei9Uedf4T`, 4문항 PDF `15DU7hkCXda-TQk4iy0JW7nJ75cd1o85U`, 합본 `1nr-LAUTUtu1o-7hKjZvz_8vPLdY7mLqt`, 사전 QA `12X26aAEZc4hEYdepRvuiNCQ3oC8aJv9p`, 4문항 QA `1tFshrcIuXsqSaU6gYyrZ2YjY7mfxokTp`, 합본 QA `1LdwGcDkYIBEGrAztxt6jdJzc3NLO45E0`, 위험도 장부 `1tTtkMshBo6UwZnEDAccwF9ywpaKMuQuc`을 **같은 파일 ID로** 갱신하고 크기·부모 폴더를 재조회했다. 최신 초안 SHA-256 `be79bc047509ae95b5f6a75085230aa78473cbc0629ad7e44aa140676c13fdb1`, 합본 SHA-256 `9d4a72fb3c7818f619409ebf905d85f4b592b54bc42f7b81cc351e0058e3570e`다. 아래의 57그림·49쪽·예전 해시는 당시 이력이며 현재 파일의 값은 이 절을 따른다. 로컬 생성 코드와 이전 스냅샷은 `.private-work/middle8-20261018`에 보존했다.
- 다음은 Q3 카드 수 차이의 난도 판정, Q12/Q30 원본 그림과 저장 답 충돌의 공식 판정, Q25 문장 통합 부담, 전90문항 9축·정답 유일성·그림/인쇄·풀이와 교사 승인이다. 승인 전에는 학생 문제은행·진단 추천 유사문제로 연결하지 않는다.

## 2026-10-18 최종 3회 관리자 일괄 ZIP 부록 연결 (Mac)

- 최종 3회 진단 화면·개별 요약 인쇄에는 승인된 우선 유형 3개×유사문제 3개가 연결돼 있었지만, 관리자 폴더/ZIP 저장의 `similarAvailable`이 최종 1·2회만 허용해 최종 3회를 요약만 저장했다. `admin-final-batch.js`에서 최종 3회에 한해 기존 검수된 요약+유사문제 인쇄 경로를 열고, 관리자 안내의 오래된 준비 중 범위를 고쳤다. 준비 중 안내는 회차뿐 아니라 실제 제외된 부록 종류를 표시한다. 원문 30문항 상세 풀이는 최종 3회에서 여전히 미검수이므로 선택 시 그 부록만 제외하고 유사문제는 포함한다.
- 합성 성적 `O×27+X×3`에서 최종 3회 추천 원문 28·29·30번과 승인 고정 문항 `last3-q28/29/30-v1..v3` 총 문제 9개·대응 풀이 9개를 실제 관리자 ZIP을 내려받아 다시 연 PDF에서 확인했다. A4 12쪽이며 문제 쪽을 이미지로 확대 확인했다. 기본 선택에서 준비 중 안내가 없고, 상세 풀이를 별도 선택하면 그 부록만 준비 중으로 명시된다. 최종 1~4회 요약·QR, 최종 1·2회 기존 부록, 최종 4회 안내, 390px, 외부 쓰기 0의 전체 브라우저 회귀 검사를 통과했다. 실제 공개 주소 `https://hs.gfieldacademy.net`에서도 합성 기록으로 같은 ZIP을 검수했다. 검수 산출물은 로컬 `.private-work/last3-batch-qa-canonical-20261018`에 보존한다.
- 변경 파일은 `admin-final-batch.js`, `admin.html`, `qa/admin-last14-batch-browser-validate.js`, 이 인수인계서다. GitHub PR #130을 메인 `74d3e19497c0d28c3d646eebb44b56f7a3a8db9c`에 병합했고 Pages 실행 `39120353920` 성공과 공개 관리자 두 파일의 바이트 일치를 확인했다. Drive 기존 `qa-report` 폴더에 검수 기록 `1CqfQPJHWt88bShV1DDOhPxQ1wh9VNQax`, 합성 ZIP `1EGAmmjqmzpFN-GqzLUPNDNDSEuGIkppN`, ZIP 내부 PDF `1CTlwAcixghWrQ7CV2O4wLfyYahnW-rl3`을 보관하고 파일 크기·부모 폴더를 재조회했다. 중급 8회 초안·원자료·성적·권한·`data.js`는 건드리지 않았다. 중급 8회 3·28번의 **유사문제용 새 그림 허용**은 사용자 답변으로 확정됐지만 이번 ZIP 수정에는 포함하지 않았으며, 기존 비공개 잠금과 후속 9축 검수 경계는 유지한다.

## 2026-10-18 중급 8회 12번 원문 답 충돌 독립 재검산 (Mac)

- 원본 PDF 2쪽의 첫째~넷째 바둑돌 그림과 강의 답안 PDF 14쪽을 직접 다시 열었다. 원본 네 배열은 `(검1, 흰3)→(검6, 흰3)→(검6, 흰10)→(검15, 흰10)`이고, 같은 규칙의 15번째는 **16×16=256개, 검120·흰136, 차16개**다. 격자 좌표 직접 생성과 새 아래 줄·오른쪽 줄을 번갈아 더하는 두 계산이 일치한다. 256개를 흑백 두 그룹으로 나눈 차는 반드시 짝수이므로 기존 강의·저장 답 **17**은 이 그림 규칙과 양립하지 않는다. 강의 필기의 `흰14·검31`도 총45개로 16×16 그림을 설명하지 못한다. 세 비공개 변형 12·14·17번째의 예비 답은 각각 13·15·18개로 재확인했지만, 원본 정답의 공식 판정 전에는 유사문제 3개 모두 잠금·교사 승인0·학생 공개0을 유지한다.
- 독립 근거는 Drive `14cMTh2Gu1I1tp6lqUpNut1nlSqXW-sIE`에 보관하고 기존 위험도 장부 `1tTtkMshBo6UwZnEDAccwF9ywpaKMuQuc`와 사전 QA `12X26aAEZc4hEYdepRvuiNCQ3oC8aJv9p`를 갱신했다. 원본 PDF·답안·`mock-data.js`의 정답이나 학생 기록은 수정하지 않았다. 다음 판정에는 원본 15번째 규칙과 기존 답 17의 공식 처리 결정을 분리해 기록해야 한다.

## 2026-10-18 중급 8회 4문항 인쇄·3/28번 원본 그림 재대조 (Mac)

- 비공개 초안 90문항을 A4 2열×2행의 **4문항/쪽 23쪽**으로 조판했다. DOM에서 문항 90개·그림 57개 로드·잘림 0을 확인하고, PDF에서 90개 ID가 각각 1회씩 나타나며 지문 90개가 초안과 일치함을 재읽었다. 2·10·19·21·22·23쪽을 실제 이미지로 확대 확인했다. 6문항/쪽 15쪽 검수와 함께 **두 배치의 예비 출력**을 갖췄지만, 전 문항의 인쇄·난도·교사 최종 승인은 아니다. 4문항 PDF는 Drive `15DU7hkCXda-TQk4iy0JW7nJ75cd1o85U`(1,261,271바이트, SHA-256 `ea9c2ab66d3083cdb0711c26db9528a3b012ef421d701c5cf24b3f712f622dc3`), 읽기·그림 대조 기록은 `1tFshrcIuXsqSaU6gYyrZ2YjY7mfxokTp`에 보관하고 기존 사전 QA `12X26aAEZc4hEYdepRvuiNCQ3oC8aJv9p`에도 연결했다.
- 원본 PDF 1쪽 3번의 카드 그림은 **1~9 아홉 장**이고, 현재 변형은 각각 카드 여덟 장만 지문에 적어 원본 그림을 붙일 수 없다. 원본 PDF 5쪽 28번은 두 수 각각에 **9가 15개**인 그림인데, 현재 변형의 12·18·21개 조건과 맞지 않는다. 두 유형의 6문항은 새 그림 허용 또는 구조·난도 재설계 전까지 `검수 대기`이며 이번 조판본에 실렸다는 이유로 학생에게 공개하지 않는다. 학생 은행/진단 연결과 교사 승인 수는 여전히 0이다. 원본 크롭·작업 스크립트·PDF는 로컬 `.private-work/middle8-20261018`에 보존하고 검수 산출물은 Drive에 둔다.

## 2026-10-18 중급 8회 13번 채점 기준 확정·25번 원문식 풀이 보정 (Mac)

- 사용자가 13번의 색칠 정답을 **원문 여섯 예시처럼 각 열을 아래 칸부터 연속해서 칠한 그림만 인정**한다고 확정했다. 원본 PDF 3쪽의 실제 예시 6개와 목표 45, 비공개 유사문제 46·39·54를 다시 대조했다. 각 목표의 열별 칸 수는 유일하다. 행을 자유롭게 고르면 값이 같은 그림은 문항당 9개지만, 확정 기준에 맞는 그림은 각 1개다. 초안 3개의 채점 계약·답안 표기·위험도 장부를 갱신했으며, 이 결정은 나머지 9축 난도·그림·인쇄·교사 승인이나 학생 공개 승인이 아니다. 13번 검수 기록은 Drive `1rh9Y-zh-FrMo2i5W3DOzoLDalVN3jO9U`에 보관했다.
- 25번 원본 PDF 5쪽과 답안 28쪽을 직접 대조했다. 사용자가 확정한 “비가 오지 않은 때는 모두 개인 때” 해석으로 원본 38·140·106의 답 142일을 독립 검산했다. 유사문제 3개의 풀이를 원본 강의와 같은 “개인 때 합계→비 온 날의 한 번씩 제외→2로 나누기→비 온 날 더하기” 산술로 고쳐 답 141·145·139일을 별도 상태 열거로 확인했다. 원본의 고정 수치 조건 상자는 초안과 숫자가 달라 재사용하지 않았고, 문장 통합에 따른 읽기·조건 추적 난도와 인쇄 검수는 잠금 상태다. 전용 기록은 Drive `133szxMKUjwfBl8tEOrQpJK9KG1-EfDvz`다.
- 비공개 초안 90/90 예비 독립 계산·잠금 검사를 통과했다. 15쪽 문제+빈 면 1쪽+33쪽 답안의 49쪽 합본에서 문제 ID/지문·답안 정답 각 90개, 풀이 267단계, 문제·답안 그림 각 42개를 재읽었다. 답안 29·30쪽의 13번과 43·44쪽의 25번을 확대 확인했다. Drive의 기존 초안 `1DmG-hMjdvWbzfx3rBjPsV5gEPEhawsAc`, 그림 ZIP `1vm1V3y9uSCAfHk1OAasIBxvOSIoBK3-z`, 합본 `1nr-LAUTUtu1o-7hKjZvz_8vPLdY7mLqt`, 사전 QA `12X26aAEZc4hEYdepRvuiNCQ3oC8aJv9p`, 합본 QA `1LdwGcDkYIBEGrAztxt6jdJzc3NLO45E0`, 위험도 장부 `1tTtkMshBo6UwZnEDAccwF9ywpaKMuQuc`을 갱신하고 ID·크기·폴더를 확인했다. 합본 SHA-256은 `96e4b35d539714c6fcca6c87a137f7bcf9ed8c9617f5661055e8b97f15e2d41f`다. 원자료·검수 기록은 Drive, 코드·버전은 GitHub, 작업 중 초안과 임시 파일은 로컬 `.private-work/middle8-20261018`에 둔다.
- **다음 작업:** 원문 3·28번 그림과 초안 불일치 6개, 12·30번 원문 그림과 저장 답 충돌 6개, 25번 조건 상자와 문장형 변형 3개, 30번 입체 시점/가림을 먼저 판정한다. 이어 전90문항을 문항별 9축 난도·정답 유일성·그림·4/6문항 인쇄·상세 풀이와 교사 승인으로 검수한다. 승인·학생 공개·학생 은행/진단 유사문제 연결은 아직 **0개**다. 잠금 해제 전 메인 학생 데이터에 반영하지 않는다.

## 2026-10-18 중급 8회 22번 계산 부담 보정·비공개 재조판 (Mac)

- 원본 PDF 4쪽 22번의 지문·삼각형 네 개·위/왼쪽 아래/오른쪽 아래/가운데 숫자를 직접 열어 새 그림 3개와 대조했다. v1·v2의 예시 곱 결과가 원본보다 세 자리 수 하나씩 많아, 두 문항의 예시 숫자와 **유사문제용 새 그림만** 조정했다. 원본 그림과 학생 데이터는 불변이다. 원본 및 v1·v2의 예시 곱 자릿수는 각각 2·2·3자리, 목표는 세 자리 곱이다. 108개 기본 사칙식 후보(세 수 순서·두 연산 `+ − ×`·두 괄호 방식, 마지막 일의 자리) 중 세 예시를 모두 만족하는 12개는 각 목표에서 같은 답 2·8을 냈다. 이는 한정된 규칙군 검수이며 **모든 가능한 규칙의 유일성이나 교사 승인으로 간주하지 않는다**. v3 답 6과 세 문항의 검수 대기 잠금은 유지한다.
- 90/90 비공개 예비 계산, 6문항/쪽 문제 15쪽·그림 57개 로드/잘림 0, 답안 33쪽, 홀수 17쪽 시작 합본 49쪽, PDF 재읽기 문제/답 90개·풀이 단계 267개를 확인했다. 문제 11쪽과 답안 39·40쪽의 22번 그림·풀이를 확대 확인했다. 기존 Drive 파일 ID의 초안 `1DmG-hMjdvWbzfx3rBjPsV5gEPEhawsAc`, 그림 ZIP `1vm1V3y9uSCAfHk1OAasIBxvOSIoBK3-z`, 문제 PDF `1GeteMsC1Ae8yjg62hxYYxWTei9Uedf4T`, 합본 PDF `1nr-LAUTUtu1o-7hKjZvz_8vPLdY7mLqt`, 해당 QA `12X26aAEZc4hEYdepRvuiNCQ3oC8aJv9p`·`1LdwGcDkYIBEGrAztxt6jdJzc3NLO45E0`, 위험도 장부 `1tTtkMshBo6UwZnEDAccwF9ywpaKMuQuc`을 갱신하고 파일 크기·부모 폴더를 재조회했다. 22번 전용 한정 검수 기록 `1-PezRbmVVzyfaQLQrwzjz4DpTlDRpzg3`을 같은 폴더에 추가했다. 합본 SHA-256 `f2c492f64c9e91870866c4073aa79f59e58816211cb6701bc44f6a03b4d0376d`. 학생 공개·교사 승인 0개를 유지한다.

## 2026-10-18 중급 8회 90문항 위험도 장부 재집계 (Mac)

- 이전 `variant-risk-audit.json`이 69문항·23유형 시점에 머물러 있어, 현재 비공개 초안 30유형×3=90문항을 기준으로 원본 대비 위험을 다시 집계했다. 문항 ID 90개를 한 번씩 포함하고 예비 독립 계산 표시 90개를 확인했다. 원본 그림과 다른 3·28번 6개, 고정 수치 조건 상자를 재사용할 수 없는 25번 3개, 13번의 정답 그림 인정 범위 3개, 12·30번 원본 답 충돌 6개를 문항별 잠금 사유와 함께 기록했다. 새로 추가된 4·6·12·14·22·24·30번의 원본 계약과 우선 검수 항목도 장부에 포함했다.
- 최신 위험도 장부는 기존 Drive 중급 8회 검수 폴더의 `1tTtkMshBo6UwZnEDAccwF9ywpaKMuQuc` (`middle8-90-private-risk-audit-20261018.json`, 45,737바이트)에 보관했고 ID·크기·부모 폴더를 재조회했다. 로컬 생성 스크립트와 JSON은 `.private-work/middle8-20261018`에 보존한다. 이 장부는 **9축 난도·원본 답 충돌·그림 전체·교사 승인 결과가 아니며**, 승인 0개·학생 공개 0개를 유지한다. 다음은 실제 원본 1:1 판정, 문항별 9축/정답 계약/그림·4/6문항 인쇄 검수, 교사 승인 뒤에만 학생 은행·진단을 연결한다.

## 2026-10-18 중급 8회 비공개 유사문제 90개 초안 완성 (Mac)

- 문제·답안 합본 비공개 검수: 15쪽 문제 뒤 빈 면 1쪽을 두어 답안이 홀수인 17쪽에서 시작하고, 답안 33쪽을 이어 총 49쪽으로 조판했다. PDF 재읽기에서 문제 ID·지문 90/90, 답안 번호·정답 표기 90/90, 상세 풀이 단계 267/267을 원본 비공개 초안과 대조했다. 문제·답안 PDF의 래스터 그림은 각각 42개이고, 9·10·23번의 필수 수열/자료 그림을 실제 출력 페이지에서 확대 확인했다. 이는 인쇄·내용 누락 검사이며 수학·9축 난도·그림 전체·교사 승인 통과가 아니다. Drive 합본 `1nr-LAUTUtu1o-7hKjZvz_8vPLdY7mLqt`, QA `1LdwGcDkYIBEGrAztxt6jdJzc3NLO45E0`을 기존 중급 8회 검수 폴더에 보관하고 크기·ID를 읽어 확인했다. 학생 공개는 계속 0개다.
- 84개 검수 대기 초안에 원본 PDF 3쪽 14번을 직접 대조한 신호등 3문항과 6쪽 30번을 직접 대조한 13개 쌓기나무 성냥개비 3문항을 추가해 **30유형×3=90개 비공개 초안**을 채웠다. Q14는 제약을 달리한 5·6·3가지 경우를 8상태 전수 열거했다. 원본의 세 불이 모두 켜진 듯한 그림은 제약과 혼동되어 대조 자료로 보존하고, 유사문제에만 세 렌즈의 중립 SVG를 사용했다. Q30은 원본의 두 큐브→20개 예시만 원본 픽셀 크롭으로 보존하고, 유사문제 목표 모양에만 사용자 허용 범위의 새 SVG 3개를 만들었다. 13개 큐브의 방향별 단위 변을 세고 별도의 끝점 쌍 열거로 102·101·104개를 교차 확인했다. 원본 그림·정답·성적·권한은 변경하지 않았다.
- 비공개 자동 독립 검산 **90/90 통과**, 3개씩·중복 ID·잠금 상태 검사 통과. A4 2열×3행 **15쪽**에서 문항 90개와 그림 참조 57개 로드, DOM 잘림 0. 7·15쪽 확대 눈검수 중 Q30 오른쪽 도형이 SVG 경계에 걸리는 결함을 발견해 투영 위치를 수정하고 좌표 경계 검사를 추가했다. 재조판에서도 90개·57개 로드와 잘림 0을 확인했다. 이 결과는 수학 예비 계산과 조판 검사이며, **9축 난도 최종 비교·상세 답안 조판·교사 승인·학생 공개는 0개**다.
- 원본 Q30은 13개 면 연결 큐브라면 공유 면이 최소 12개여서 유일 성냥개비는 최대 `12×13−4×12=108`개라는 독립 상한을 확인했다. 원본 그림 후보의 좌표 열거는 102개지만 저장·강의 답은 120개다. 원본 12번도 그림을 이으면 16개 차이인데 저장·강의 답은 17이다. 원본 답을 임의로 고치지 않고 Q12/Q30 유사문제를 잠갔다. Q3/Q28 원본 그림 불일치, Q13 색칠 위치의 복수 정답 계약, Q25 고정 숫자 조건 상자, Q30 가림/시점과 전90개 난도·풀이·인쇄 검수도 남아 있다. 이 문제가 해소되고 별도 교사 승인 전에는 학생 은행·진단에 유사문제를 연결하지 않는다.
- Drive의 기존 초안 `1DmG-hMjdvWbzfx3rBjPsV5gEPEhawsAc`와 원문 대조 장부 `1E6Wel6JGjtKXIpuyIWEJ2w76j73ftzc7`를 갱신하고, 새 15쪽 PDF `1GeteMsC1Ae8yjg62hxYYxWTei9Uedf4T`, 그림 후보 ZIP `1vm1V3y9uSCAfHk1OAasIBxvOSIoBK3-z`, QA JSON `12X26aAEZc4hEYdepRvuiNCQ3oC8aJv9p`을 기존 검수 폴더에 보관했다. Q14 그림 보정 뒤 같은 파일 ID를 다시 갱신하고 크기를 읽어 확인했다. 관리자 승인표 합성 26시나리오, 로드맵 승인·해제 PC/390px, 온라인 학생의 8회 승인 전 접근 차단·승인 후 저장 성적, 결과 허브 8회 행 검사를 통과했고 실제 외부 쓰기는 0이다. 로컬 제작 코드·초안·이전 스냅샷은 `.private-work/middle8-20261018`에 보존한다. 다음 단계는 문항별 원문/9축/정답 계약/풀이 그림 검수와 4·6문항 인쇄·교사 승인 후 신규 유사문제의 학생 은행·진단 연결 검사다.

## 2026-10-18 중급 8회 비공개 유사문제 84개 후속 (Mac)

- 앞선 78개 비공개 초안에 24번 최단 경로 3개와 12번 바둑돌 규칙 3개를 추가해 **84개(28유형×3)**로 만들었다. 24번은 원문 PDF 4쪽의 8열×5행·연못 2개·(가) 왼쪽 아래→(나) 오른쪽 위 구조를 직접 대조하고 유사문제에만 새 격자 SVG 3개를 만들었다. 실제 SVG에 보이는 선분을 별도 검수기가 읽어 단조 최단 경로를 전수 재귀 계산한 답은 60·61·63가지다.
- 12번은 원문 PDF 2쪽의 첫째~넷째 바둑돌 배열 그림만 잘라 그대로 사용하고 목표를 12·14·17번째로 바꿨다. 격자 좌표별 색을 별도 열거한 예비 답은 13·15·18개다. **원문 15번째는 그림을 이어 세면 흰 136·검은 120으로 차이 16이지만 기존 답안/코드는 17**이므로 원문 정답을 변경하거나 학생에게 공개하지 않았다. 12번 3개 모두 `source-q12-answer-conflict`로 잠겨 있다.
- 전 초안 84/84 예비 계산·잠금 검사 통과. A4 6문항/쪽 14쪽에서 84개 문항·51개 그림/자료 로드, DOM 잘림 0, 대표 2·3·6·10·11쪽 확대 눈검수. 최종 9축·답안 조판·교사 승인·학생 공개는 여전히 **0개**이고, 미작성은 14·30번 6개다. Q3·28 그림 불일치, Q13 그림 답 계약, Q30 원문 답 충돌도 그대로 잠금.
- Drive 기존 초안 `1DmG-hMjdvWbzfx3rBjPsV5gEPEhawsAc`와 원본 대조 장부 `1E6Wel6JGjtKXIpuyIWEJ2w76j73ftzc7`를 갱신했다. 최신 84개 조판 PDF `1iDSWhTIgGjO8-3R6mRT-ZyhU6Ctxu1C2`, 새 그림·12번 원본 크롭 ZIP `1TZgkXrGZDR_hD0grsGVFp3wsJSN4S-mC`, QA `1xZM5levqWIuv8Q1d1CJ_X_JEXytv6lbn`을 기존 검수 폴더에 보관하고 ID·크기를 읽어 확인했다. 로컬 임시 제작물은 `.private-work/middle8-20261018`에 남겨 두었다. 공개 코드·기존 성적·권한은 수정하지 않았다.

## 2026-10-18 중급 8회 비공개 유사문제 78개 검수본 (Mac 후속)

- 사용자 승인 범위: 원본 4·6·12·14·22·24·30번의 **유사문제에만** 새 그림 제작 허용. 원본 PDF·원본 그림은 변경하지 않는다. 이번에는 원문 PDF 1쪽 4·6번과 4쪽 22번 지문·그림을 직접 다시 열고, 4·6·22번 각 3문항과 새 SVG 그림 9개만 비공개 초안에 추가했다. 6번은 원문처럼 세 자리 복면산과 두 번 받아올림, 22번은 원문처럼 삼각형 예시 3개와 물음표 1개를 유지한다.
- 초안은 **69→78개(26유형×3)**, 미작성은 12·14·24·30번 **12개**다. 새 그림의 인쇄 숫자·기호를 별도로 읽어 다시 계산했고 전체 초안 **78/78 예비 검산**, 중복 ID·공개 잠금 검사 통과. 이는 9축 난도·원문 정답 충돌·교사 승인이 아니며 승인/학생 공개는 여전히 **0개**다. Q3·28 그림 불일치, Q13 그림 답 계약, Q25 조건 상자, Q8·12·30 원본 답 대조 경계도 유지한다.
- A4 2단×3행 **13쪽** 비공개 조판 PDF에 78개 문항과 그림/자료 45개가 정상 로드됐고 DOM 잘림 0, 대표 2·3·10쪽 확대 렌더를 확인했다. 학생용 정답지·최종 인쇄 승인이나 은행 연결 검사는 아직 하지 않았다.
- Drive 기존 비공개 초안 ID `1DmG-hMjdvWbzfx3rBjPsV5gEPEhawsAc`와 원본 대조 장부 `1E6Wel6JGjtKXIpuyIWEJ2w76j73ftzc7`를 갱신했다. 새 그림 ZIP `1LWnzya02Qx4u_uEdDBKOtPYe8sqWJE5-`, 78문항 조판 PDF `16m8jtq7g9nU3c1HcPELQ7fYpi6tfO0hv`, QA JSON `1g8jYEwySOojb0sWr-xN9ejmUmd_ZCeRo`를 같은 기존 Drive 폴더에 보관했고 파일 ID·크기를 다시 읽었다. 로컬 생성 코드·원본과 69개 이전 스냅샷은 `.private-work/middle8-20261018`에 보존한다. 공개 코드·성적·권한·학생 문제은행 파일은 이번 단계에서 수정하지 않았다.
- 다음은 12·14·24·30번 원문 그림/답 충돌을 판정하고 12개를 완성한 뒤, 90개 전부의 원문 관계·9축 난도·복수 답·상세 풀이·그림·4/6문항 인쇄·교사 승인·학생 접근/진단 연결을 별도로 검증한다. 불확실한 문항은 계속 `검수 대기`로 잠근다.

## 2026-10-18 최종 3회 진단지 유사문제·학습 연결 보강 (Mac)

- 후속 위치 수정: 승인된 3×3 유사문제는 운영 코드에 있었지만 화면 하단 `오답 연습`에 떨어져 있었다. 이를 `이번 주 학습`의 추천 문항·학습 안내 바로 뒤로 옮기고 `총 9문제` 수량을 명시했다. 화면의 추천 번호와 승인 3문항 묶음, 0/1/2/11개 오답 표본의 0/3/6/9개 표시, 요약 인쇄의 문제9·풀이9, PC/390px·승인90문항 불변을 다시 검증했다. 일반 진단 요약 인쇄에서는 화면 미리보기 9개를 제거하고, 기존 전용 인쇄 엔진이 동일 9개를 문제·풀이 쪽으로 넣는다. 학생 성적·권한·문항 원문은 변경하지 않았다.
- PR #122 병합 커밋 `45f010f`의 Pages 배포 성공과 공개 `final.html`/`last3-report-practice.js` 해시의 로컬 일치를 확인했다. 배포 후 공개 URL에서 운영 파일을 사용하되 합성 성적·요청 차단으로 화면 0/3/6/9개, 인쇄 문제9·풀이9, 승인 문제은행·개인 생성기·카탈로그 연결을 재검증했고 외부 쓰기·브라우저 오류는 0이었다. 공개망에서는 30개 오답 표본의 비동기 문제 로딩이 로컬보다 늦을 수 있어 QA가 9개 카드 완료를 기다리도록 고쳤다. 실제 학생 계정의 개별 보고서 열람·인쇄는 합성 검수 범위 밖이다.
- 사용자 요청: 최종 모의고사 3회 진단 화면에 유사문제 3개씩 실제 문제를 표시하고, 권장 학습 위치·학습 포인트 빈 연결을 고친다. 이번 수정은 이미 승인된 Last3 90문항의 지문·그림·정답·풀이 및 학생 점수·권한을 변경하지 않는다.
- 기존 화면의 `오답 연습`은 원문 번호와 문제은행 이동 단추만 보여 주었다. `last3-report-practice.js`가 진단의 동일 우선 복습 번호(최대 3개)에 대해 승인 고정은행에서 원문마다 정확히 3개 문제 본문·필수 자료·원본 그림·답칸을 읽어 화면에 표시한다. 준비되지 않은 3개 묶음은 표시하지 않으며, 정답·풀이는 화면 문제 카드에 노출하지 않는다. 인쇄는 기존 요약+문제+풀이 엔진을 유지한다.
- `last-report-data.js`에 최종 3회 30개 번호별 기존 교재 검색어와 해당 원문 풀이에 맞는 학습 포인트를 연결했다. 자료실 공용 유형표에서 잘못 연결되던 고장 난 시계(3·8번)와 성냥개비로 잡히던 정육각형 넓이(26번) 등을 분리했고, 5·9·12·17·22·23·26·27·28번은 확인 가능한 교재 단원으로 별도 지정했다. 포괄적인 기존 단원은 '먼저 공부할 교재'로 표시한다. 다른 회차 처방·학생 정답·교재 원본 파일은 수정하지 않는다.
- 합성 성적의 오답 0/1/2/11/30개에서 화면 유사문제 0/3/6/9/9개, 30개 원문 유형의 교재 위치·학습 포인트 30/30을 확인했다. 승인 JSON과 화면 지문을 ID별로 대조하고 정답 노출·그림 손상 0건을 검사했다. 기존 인쇄 단추는 선택한 12·15·28번의 문제9·풀이9를 출력하며, 실제 A4 12쪽 PDF에서 4쪽 학습 표, 5~10쪽 문제, 11~12쪽 풀이를 렌더 확인했다. PC/390px 화면, Last2·파이널 부모 진단, 공용 요약 인쇄 회귀, 외부 쓰기0도 통과했다. 검수 PDF Drive ID `1SMVmWdlG7224Dn9Ivh-0hqFB9sbWl4eV`; 합성 학생 자료이며 운영 성적을 저장하지 않았다.
- Last3 승인 검증기의 오래된 승인일 원본 파일 해시가 이후 메인 변경을 오탐하므로, 공개 90문항 자체는 승인 초안 SHA·필드 대조를 유지하고 주변 보호 파일은 현재 Git HEAD에 대한 변경 여부로 확인한다. 배포 후 공개 진단 화면과 실제 인쇄 기능은 별도로 확인한다.

## 2026-10-18 중급 8회 연결·유사문제 검수 착수 (Mac)

- 사용자는 중급 8회의 ① 기존 시험·자료실 연결과 승인 ② 유사문제 제작·검수 ③ 성적·진단지 연결을 모두 요청했다. 이 변경은 이미 있는 `mock-mid-8` 교재·빈 승인 명단과 중급 8회 시험/성적 데이터를 보존하고, 관리자 추가회차 승인표와 학생 로드맵에 동일 키만 연결한다. 렌더링이나 배포로 학생을 새로 승인하지 않는다.
- 합성 PC/390px 관리자·학생 26시나리오에서 중급7/8·최종7/8 독립 승인, 폴더 승인만 있는 경우 차단, 다른 회차만 승인된 경우 숨김, 저장할 때 다른 키·성적·칼럼 보존, 외부 쓰기0을 확인했다. 시그니처 승인 회귀, 로드맵 회차별 열림/잠김, 온라인 회원의 중급8회 미승인 차단·승인 후 기존 성적표 재조회, 학생 성적 허브의 승인 후 8회 행·직접 링크와 재차단, DOCSSAM 칼럼21검사를 통과했다. 실제 학생 권한·성적 쓰기는 없다.
- Drive 원본 `초등과정 대비 실전 모의고사 8회 중급.pdf`(ID `1boBTsZIDclBvJfJuFDa6IyJr_t2B8b9t`, 2025-10-23, 7쪽, SHA256 `21148954accc6e8df2224fc54106925773a248f178f7ddb4be4c4a36767ba39e`)을 비공개 작업본에 받아 1~30번의 실제 지문·그림이 있는 쪽을 확인했다. 7·8회 리뷰는 다른 자료다. Drive의 `초등과정 선발 대비 모의고사 8회 중급 답안.pdf`(ID `1G-DZWdMsH-eVn5ER7uOO-HQIT9WgYaXn`, 33쪽)는 파일 연도와 제목 표현이 다르지만, 답안 화면의 1·13·30번 지문과 그림을 원문 1·3·6쪽에 대조해 같은 회차 자료임을 확인했다. 원문 18개 그림·조건 상자와 5개 필수 인쇄 자료를 문항별로 예비 목록화하고, **30문항 모두 별도 예비 계산**했다. 20번 주사위 바닥면 합 23과 24번 연못 격자 최단 경로 62를 원본 그림으로 재현했다. 계산 범위와 최종 정답 승인은 구분하며 최종 승인 문항은 0개다.
- 사용자가 제공한 Drive 폴더 `1LjpYZDs74UiI2wrbMi7ME3jWxILTck71`은 중급 모의고사 자료 폴더다. 이 폴더의 8회 원본 HWP `1rR7RlwGsfuR05RaERc5Ae_J0WPxNTCFt`, 하위 PDF `1Amns6ph5BjSFXVWW826ZGOrj7-JwO2o5`, 하위 답안 PDF `1sa_5nHsOFs18zSeV-33hANYTA_1hgs0K`를 확인했다. 두 PDF는 각각 앞서 사용한 검수본과 SHA-256 바이트가 같다. HWP를 Mac LibreOffice에서 PDF로 변환하면 비정상적으로 5952쪽이 되어 그림·조판 대조 근거로 쓰지 않는다. 지정 제작 기준 Markdown은 이 폴더와 두 하위 폴더에 없다.
- 답안 PDF 33쪽에서 원문 1~30번의 답안 페이지 후보를 매핑했으나 답 자체를 승인한 기록은 아니다. 원본 1쪽 4번의 마방진은 한 줄 합 516을 적용한 두 산술 방식에서 빈칸 해 `(176, 170, 174, 168, 173)`이 유일했다. `mock-data.js` 정답 표시에는 176이 빠져 있다. 원본 2쪽 8번은 7일 8시간 동안 4시간당 3초씩, 총 132초 늦으므로 현재 표시 `오후 3시 57분 48초`를 산술 검산이 지지한다. 답안 PDF 10쪽 필기의 `오후 3시 57분 49.5초`는 마지막 8시간을 6시간으로 계산한 후보 오류다. 두 항목은 지정 제작 기준·S0L 울트라 최종 승인 전까지 `검수 대기`이며 기존 정답을 임의로 바꾸지 않았다. 정확한 후보 쪽·문구와 이중 Drive ID는 Drive 검수 기록 `1E6Wel6JGjtKXIpuyIWEJ2w76j73ftzc7`에 둔다.
- 원본 2쪽 12번은 첫째~넷째 돌 배열을 직접 세면 검정·흰색이 `(1,3)→(6,3)→(6,10)→(15,10)`이며 전체 칸은 `2×2→5×5`다. 한 줄·한 열에 돌을 번갈아 더 놓는 그림 규칙대로면 15번째 `16×16`은 검정 120개·흰색 136개, 차이 **16개**다. 강의 답안 14쪽과 `mock-data.js`에는 **17개(흰 14, 검 31)**로 적혀 있어 원본 그림 전체 돌 수와 충돌하는 강한 후보가 있다. 규칙 해석의 최종 검수 전에는 답·그림을 고치거나 유사문제를 공개하지 않는다. 4·8·12번 모두 `검수 대기`이며 이 예비 계산도 S0L 울트라의 정답 유일성·그림·인쇄 최종 승인과 구분한다. 문항별 근거는 기존 Drive 검수 기록 `1E6Wel6JGjtKXIpuyIWEJ2w76j73ftzc7`에 둔다.
- 원본 6쪽 30번의 입체 그림을 좌표로 복원하면 단위 정육면체가 지문대로 13개이고 모두 면으로 이어진다. 원본의 두 정육면체 예시가 성냥개비 20개라는 계산 방식으로 중복 변을 제거하면 가로 38·앞뒤 30·세로 34, 합 **102개**다. 강의 답안 33쪽과 `mock-data.js`의 **120개**와 충돌하는 강한 후보이나 숨은 연결의 최종 눈검수 전에는 기존 정답을 수정하지 않는다. 12·30번 원본 그림 충돌, 4번 표시 누락, 8번 필기 차이는 모두 `검수 대기`다. 30문항 예비 계산은 S0L 울트라의 정답 유일성·그림·인쇄 최종 승인과 구분한다. 좌표·방향별 계산은 기존 Drive 검수 기록 `1E6Wel6JGjtKXIpuyIWEJ2w76j73ftzc7`에 둔다.
- 중급8회 승인 유사문제 묶음은 저장소/현재 Mac 작업본에서 찾지 못했다. `GFIELD_QUESTION_BANK_PRODUCTION_STANDARD_20260913.md` v2.7(SHA-256 `6044b894b8f58b94cfaff5dd331e7367f76e44f70076be7facee443a77499b18`) 전달본을 Mac에서 읽었다. 이는 우선 참고자료이며 현재 프로젝트 확정 지침이나 공용 기준으로 자동 승격하지 않는다. Drive의 `프리미어 시험·모의고사 문제은행 제작 가이드.md`는 별도 참고자료다. `황소 초등 문제은행 분류표.xlsx`는 482개 학년·단원·유형 행을 담지만 중급8회 문항별 승인 매핑은 없다. 원문 그림 문항의 1:1 대조, 정답 독립 검산, 3변형×30문항 승인, 풀이·인쇄 QA 전에는 신규 유사문제를 연결하지 않는다. 기존 중급8회 진단의 채점·유형·정답·학생 기록도 이 작업으로 검수 통과 처리하지 않는다.
- 유사문제 비공개 초안은 원문 23유형 각 3개, 총 69개다. 작성 지문에서 다시 수치를 읽는 별도 전수 열거/계산 69/69 일치, ID·중복·공개 잠금 검사를 마쳤다. 초안은 기존 Drive 파일 `1DmG-hMjdvWbzfx3rBjPsV5gEPEhawsAc`에 갱신했다. 이는 자동 예비 검사이며 9축 난도 대조·원본 그림의 실제 연결·인쇄 눈검수·교사 최종 승인·학생 공개는 모두 0개다. 남은 원문 4·6·12·14·22·24·30번의 21개 초안은 원본 정답 충돌 또는 그림 보존·변형 조건 대조 전이라 채우지 않았다. 유형별 보류 사유는 Drive 검수 기록에 둔다. 전90개 최종 검수 전에는 신규 은행에 연결하지 않는다.
- 추가 원문 대비 검토에서 21번 변형은 원문과 같은 완전한 8개 손가락 주기로 수정해 현 69/69 독립 계산을 통과했다. 3번 변형 3개는 원본 9장 카드 그림과 초안 8장 카드 조건이 다르고 경우 추적 부담도 줄었다. 28번 변형 3개는 원본 그림에 고정된 ‘9가 15개’ 표기와 새 개수가 다르다. 이 6개는 새 그림 허용·재설계 전 원본 그림 사용 불가로 명시하고 계속 잠갔다. 23유형별 우선 검토 사유는 Drive `1P-ONg3kEBhRhq24m7geauJv-5oqI6iTa`, 원본 페이지와 69개를 나란히 보는 비공개 검토 화면은 Drive `1vF2D4UK2gozm0TuS-81_iDw6wihGqFHx`에 둔다.
- 원본 PDF에서 자르기만 한 그림·필수 자료·조건 크롭 14개를 기존 Drive `1cXhqEXlWSOmkHoYpHZnFaEbbzoFhALNY`에 갱신했다. 원본 렌더와 픽셀 일치 14/14, 문항별 번호·지문·자료 직접 눈대조를 마쳤다. 5·7·9·10·13·17·20·21·23·26·27번 11유형의 33개 초안에 원본 크롭을 후보로 연결했고, 3·25·28번 크롭은 고정 수치 대조 전용이다. 3·13번 조사 4곳을 고쳤고, 25번 초안 3개는 원본의 고정 수치가 든 ㉮~㉱ 조건 상자를 문장으로 통합해 표현·읽기 부담 대조 전까지 별도 잠금했다. 비공개 검토 화면은 원본 전체 23장+크롭 14장 모두 PC/390px에서 로드·가로 넘침/오류0이다. 33개 후보를 1문항/쪽으로 배치한 A4 비공개 인쇄 검수본은 Drive `1i8hdYmQ_UyusgsPq2Yf8TGboiTsWLgcU`; 33쪽 모두 고유 ID·그림/자료 1개씩 확인하고 대표 쪽을 확대 검수했다. 이 검수본은 실제 4/6문항 배치·답안·9축 난도·학생 인쇄·교사 승인 완료가 아니다. 새 그림 허용 여부와 4·6·12·14·22·24·30번 미작성 21개, 3·28번 그림 불일치 6개, 원본 정답 충돌 후보는 검수 대기로 유지한다.
- 25번은 사용자가 **비가 오지 않은 때는 모두 개인 때**라고 확정했다. 이 기준에서는 원본 답 142일의 예비 계산이 성립한다. 흐린 때를 별도로 허용할 경우의 143일 반례는 해석 검토 이력으로 Drive 원본 대조 `1E6Wel6JGjtKXIpuyIWEJ2w76j73ftzc7`에 보존했다. 초안 3개의 ‘비가 오지 않은 날’ 표현은 확정 의미와 일치하지만, 원본 ㉮~㉱ 조건 상자는 수치가 고정돼 재사용할 수 없고 문장 통합의 읽기·조건 추적 난도와 실제 인쇄 검수가 남았다. 따라서 3개 모두 교사 승인·학생 공개 전 잠금을 유지한다.
- 원본 14번 3색 신호등은 꺼짐도 가능한 상태로 적혀 있지만, 강의 16쪽은 켜진 등이 0개인 상태를 신호에서 제외하고 3+3+1=7가지를 계산한다. 원본 지문·그림과 강의 필기를 직접 대조한 예비 해석 근거만 Drive 검수 기록에 추가했다. 14번 유사문제는 미작성이다. 1번의 원본/변형 정답 경우 수가 5개 대 6·4·5개였던 초안을 수정해 변형 3개 모두 5개로 맞췄다. 2번 변형 3개도 원본과 같은 9로 나누는 구조와 정답 경우 수 10개를 유지하도록 조정했다(현재 변형 10·10·10개). 작성 지문에서 다시 계산한 69/69는 일치하고 비공개 PC/390px 검토 화면의 69문항·37그림도 로드됐지만, 이 계수와 화면 확인은 9축 난도 최종 통과가 아니다.
- 20번은 원본 4쪽 주사위 눈·격자·화살표·끝 표식을 바꾸지 않은 픽셀 크롭으로 위·앞·오른쪽 면의 7개 눈 합을 묻는 비공개 3변형을 작성했다. 원본 EEESSE 경로의 바닥면 합 23을 재현하고, 변형 답 26·19·28을 별도 방향 전이로 예비 검산했다. 윗면은 마주 보는 면 합 7을 이용한 지름길이 있고 앞/오른쪽 면은 고정 방향 읽기 부담이 달라질 수 있으므로 9축 난도·교사 승인 전 잠근다. A4 비공개 인쇄 검수본은 같은 Drive ID에서 33쪽으로 갱신했고, 모든 쪽 고유 ID·원본 크롭 1개와 새 31~33쪽 확대 렌더를 확인했다. 이는 실제 학생용 4/6문항 배치·답안 승인과 다르다.
- 13번의 원본 여섯 색칠 예시와 강의 15쪽은 각 열을 아래 행부터 채운다. 변형 46·39·54는 열별 색칠 개수가 각각 유일하지만, 같은 열에서 다른 행을 칠하는 그림까지 정답으로 인정하면 각 변형에 조합상 9가지가 된다. 원문이 행 배치를 자유롭게 허용하는지 확정되지 않아 초안 3개의 그림 정답 계약을 별도 잠금하고, 비공개 검토 화면·Drive 위험/원본 대조 기록에 남겼다. 이 표시는 정답 대안 승인이나 학생 공개가 아니다.
- 현재 main `225bab238f6db510f6b4271aa1d901524b6ed638`에서 합성 회귀를 다시 실행해 DOCSSAM 칼럼 보존 21검사·브라우저 26시나리오, 추가 회차 승인 PC/390px 26시나리오, 중급 8회 온라인 성적 접근·학생 성적 허브·로드맵 승인 표시가 모두 통과했다. 실제 외부 저장·학생 성적 쓰기는 0이고, 이 결과는 Drive 배포 QA `1DGnZqKR5lA4bcLmw4f4foUAsFld53mUS`에 기록했다. 실제 계정 OTP/PIN·교사 저장과 90개 문제은행 승인은 별도 대기다.
- 코드/버전은 GitHub, 원본/검수 기록은 Drive, 현재 작업 PDF·렌더는 `.private-work/middle8-20261018`에 둔다. 추가 모의고사 승인·로드맵·성적 접근 변경은 PR #96을 메인에 병합한 SHA `0bbc32ac03a0bf80ec7cc8bb758793c0f0b1d9a6`로 반영됐다. 해당 Pages 실행 `39103873655`가 성공했고 공개 `admin.html`, `index-enhancements.js`, `index.html`이 로컬 메인과 바이트 단위로 일치했다. 공개 사이트 합성 PC/390px 관리자·학생 26시나리오도 외부 쓰기 없이 통과했다. 30문항 원문 위치·답안 대조 경계는 Drive 검수 기록 `1E6Wel6JGjtKXIpuyIWEJ2w76j73ftzc7`, 배포 검수 결과는 `1DGnZqKR5lA4bcLmw4f4foUAsFld53mUS`에 둔다.
- 후속 인쇄 범위 확인: 비공개 69개 초안 전체를 원본 순서로 6문항/쪽 A4 12쪽에 배치했다. 원본 그림·자료 후보 36개 로드, 브라우저 위치 검사에서 잘림·상태표시 겹침 0개, PDF 텍스트 재독에서 고유 ID 69개·`검수 대기` 69개·학생 배포 금지 표기 12쪽을 확인했다. 12쪽 접촉표와 1·6·12쪽 확대 렌더에서 보이는 잘림은 없었다. PDF SHA-256 `074a0d62c81517ee55ffaa1221d928894500a667df1065acedcd97e6aa97f0b7`는 Drive `1hzHbLXccBww3c7FRIkZCXzv8OeV8C_Tk`, 검수 JSON은 Drive `1umhPzTW8zhl3bXPHQhggnlqllpidGois`에 보관한다. 이는 비공개 조판 검사이며 원문 정답·9축 난도·4문항 배치·교사 승인·학생 공개의 합격 근거가 아니다. 남은 21개 미작성, 3·28번 그림 불일치, 13번 복수 그림 답 계약, 25번 고정 조건 상자, 4·8·12·30번 원본 답 대조 경계는 유지한다.
- 원본 4번의 공개 정답표 표시에는 윗줄 가운데 176이 빠져 있었다. 원본 1쪽 4번과 강의 답안 5쪽을 직접 열어 3×3 마방진의 빈칸 다섯 수 `(176,170,174,168,173)`을 한 줄 합 516의 8개 줄과 중심 대칭쌍 합 344로 각각 검산했다. `mock-data.js`의 중급 8회 4번 `answer`만 완전한 다섯 수로 보정하고 `mock.html`의 데이터 캐시 버전과 합성 브라우저 정답표 인쇄 검사를 갱신했다. 학생 O/X·점수·권한·다른 문항·비공개 유사문제는 변경하지 않았다. 온라인 승인/차단·성적 읽기·정답표 인쇄·외부 쓰기0, 관리자 성적 무결성 검사 통과. 기존 `qa/diagnosis-accuracy-validate.js`의 4/9 실패는 이번 변경 전 `mock-data.js`를 주입해도 동일하게 재현된다. 새 근거는 Drive `168-ueD80ajZazmZRKHsr6m0GlBlIS1X9`. 따라서 이전 4번 ‘표시 누락’ 보류는 이번 코드 변경 범위에서 해소되지만, 8·12·30번 답 충돌/필기와 4번 유사문제 제작·난도·교사 승인은 계속 검수 대기다.

## 2026-10-18 학부모 브라우저 3개 제한 제거 (Mac 후속 작업)

- 사용자 요청에 따라 학생당 브라우저 3개 상한을 제거했다. 이메일·PIN 인증 뒤 새 브라우저를 등록하는 흐름은 유지하고, 등록 조회는 학생·브라우저 해시 1건으로 좁혔다. 관리자 화면에는 상한 대신 등록 수를 표시하며 기존 기기 초기화 기능은 필요할 때 쓰는 `전체 로그아웃`으로 명확히 했다.
- 학부모 이메일 연결 소유권, 활성/퇴원 차단, PIN 5회 잠금, 인증 요청률 제한, 브라우저 해시·세션 검증, 자료실/회차 권한은 바꾸지 않았다. `hs_student_devices`의 기존 행과 세션을 삭제하지 않는다. DB에는 등록 상한 제약이 없음을 읽기로 확인했고, 표 설명만 신규 migration으로 바로잡았다.
- Mac의 실제 로컬 PostgreSQL PIN 검사와 가상 기기 저장 서비스로 네 번째 브라우저 이메일 시작·PIN 등록, 잘못된 이메일/비활성/잠금/RLS 차단을 확인했다. 학생 이메일/PIN 합성 브라우저, 관리자 PC/390px 14시나리오, 시그니처 승인, DOCSSAM 칼럼 21검사와 문법·diff 검사 통과. 중급7회 검사 자료가 이미 승인된 최종8회 때문에 잠금 실패하던 부분은 회차별 합성 승인을 분리해 수정했다.
- 실제 운영 함수 `hs-parent-auth` v6과 `hs-approval-admin` v8은 작업 전 저장소 원문과 줄바꿈 정규화 후 일치했다. 운영 적용·GitHub 병합·Pages 공개·실제 계정 인증 결과는 별도 배포 기록으로 판정한다. 실 학부모 OTP/PIN, 교사 코멘트 저장/읽기, 휴대폰의 인쇄 QR 판독은 별도 검수 대기다.

## 2026-10-17 Mac 보류 작업 복구·연결 검증 (로컬 완료, 운영 미반영)

- 사용자 ‘진행’에 따라 Mac `/Users/docssam/Developer/GFIELD/hs-report`의 기존 main `643baf27dfb784d8e0438b7bcbb0e9a32488c8b9`에서 `codex/mac-pending-followup-20261017`로 이어 작업했다. PR93은 이미 배포 완료된 기준이며 재배포하지 않았다. 현재 변경은 미커밋·미푸시·미배포다.
- Windows `E:\Codex\worktrees\hs-report-last2-release-20261012`의 HEAD `99375adb353c24ad3dae3a95085602a7c1c2b9f6`와 깨끗한 Git 상태를 보존했다. `codex/recovered-last2-diagnostic-20261011`, `codex/recovered-roadmap-approval-icons-20261014` 두 로컬 보존 브랜치로 필요한 이력을 가져왔다. `8981d63` 서버 변경은 실제로 diagnostic 브랜치에 남아 있었으며, 이름이 비슷한 last2-comment-server 브랜치 끝은 이미 main에 포함된 관리자 데이터 변경이라 그대로 적용하지 않았다.
- Last2 비공개 제작 원본·승인 영수증, Last3 원본·승인 영수증·검수 PDF·QA JSON, Last2 연결/배포 기록을 기존 Drive `코딩관련/codex/codex`의 원래 상대 경로로 복구하고 파일 해시를 대조했다. `.private-work/last2-variants-20261011`, `.private-work/last3-reuse-20261015`는 해당 Drive 폴더로 연결된다. Last2 승인 HTML(`1d57d9c2…`) 및 Last3 승인 draft(`60e03b53…`)가 각 승인 영수증과 일치한다. 이전 대기 문구로 재승인을 요구하지 않는다. 그 밖의 오래된 QA 캡처/PDF는 Windows에 남고 Drive 서버 업로드 확인은 하지 않았다.
- 운영 읽기 확인: `hs-final-population` v8은 `last1`까지만 허용하며 DB 코멘트 제약도 Last2~4를 허용하지 않는다. DB에는 Final8 허용이 있으나 함수 허용 목록에는 빠져 있었다. `hs-parent-auth` v6의 두 코드 파일은 현재 Mac과 줄바꿈 정규화 후 일치한다. 학생 데이터 행·로그인 비밀값은 조회하거나 수정하지 않았다.
- 로컬 변경은 복구한 원본의 필요한 부분만 적용했다. 로드맵 추가 모의고사에 기존 최종7·8 `accessKey`를 연결하고 기존 열림 판정에 맞춰 🔓/🔒 및 접근 가능한 설명을 통일했다. 학생 승인 명단과 하위 자료 필터는 유지한다. 서버는 `report-service.js` 허용 회차 1줄과 기존 `20261011103304_allow_last2_4_report_comments.sql`만 복구해 Last2~4·Final8 코멘트를 지원하도록 준비했다. 성적·기준표·학생 소유권·교사 편집 권한·CAS 로직은 바꾸지 않았다.
- 검증: 수정 전 최종7·8 ‘자료실 승인/로드맵 잠김’을 재현했고, 수정 후 회차별 하위 자료 격리·일반 주차·미승인/철회·1280/390px 검사 통과. 코멘트/서버 단위검사 2개에서 비활성·잘못된 역할/세션 거부, 소유권·학생 읽기 전용·회차 분리·동시 저장 충돌·지연 응답 격리·성적 불변 통과. Mac 및 공개 사이트 합성 PIN 로그인 각 14개 그룹 통과. QR 원본 QA의 옛 이메일 fixture 실패를 재현한 뒤 현 PIN 단계·`pinReady` 응답으로 수정하여 신규8+기존2 목적지와 새 모바일 로그인2개 흐름 통과. DOCSSAM 칼럼 보존 21검사와 diff 검사 통과. 실제 운영 쓰기·OTP 발송·설치·삭제 0건.
- 배포 준비본: `.private-work/mac-continuation-20261017/server-candidate/`에 운영에서 읽은 함수 7개 파일 중 허용 회차 1줄만 바꾼 후보와 SQL을 보존했다. 기존 비공개 baseline 4개는 운영 원문 바이트 그대로이며 manifest로 검사했다. 공개 함수 폴더에는 이 private 파일들이 없으므로 해당 폴더만 그대로 배포하지 않는다. 적용 직전에 운영 버전/파일/DB 제약을 다시 읽고 완전한 패키지를 대조해야 한다.
- 결과는 `.private-work/mac-continuation-20261017/summary.json`, 복구 영수증은 `/Users/docssam/Documents/Codex/GFIELD-Hermes/state/mac-continuation-20261017/hs-report-transfer/`에 있다. 적용 스킬은 Supabase 및 Windows 실물의 `gfield-design-system`/`references/design-rules.md`이며 `DESIGN.md`도 확인했다. 독립 코드 검토에서 새 결함·권한 약화는 발견되지 않았다.
- 남은 작업: 운영 DB 제약·함수와 프런트 메인/Pages 반영, 실제 PostgreSQL migration 실행 및 운영 코멘트 저장/읽기 확인, 실제 학부모 OTP/PIN 첫 사용과 휴대폰의 인쇄 QR 판독이다. 이번에는 새 문제·최종4회 유사문제·상세풀이를 제작하지 않았고 `data.js`, 칼럼, 원문/정답/성적, 인증 코드와 기존 승인 문항은 보존했다.

## 2026-10-16 기존 승인 은행 연결 메인 반영 요청

- 사용자 ‘메인반영 문제은행과도 연결’ 요청으로 아래 로컬 검증 완료본을 릴리스한다. 승인 은행 12회차·1080문항·360원문 유형 연결과 상태 안내 구분만 대상이며, 학생 성적·권한과 data.js는 변경하지 않는다.
- 수학·인쇄·권한의 기존 검증은 입력 불변 상태에서 재사용한다. 배포 완료 판정은 이 변경의 GitHub PR 병합 SHA, 해당 Pages 실행 성공, 공개 파일 대조와 실제 자료실/카탈로그/생성기 연결 검사로 하며 PR에 최종 결과를 남긴다. 아래 ‘커밋 전’은 당시 이력이다.

## 2026-10-16 기존 승인 유사문제 전체 연결·잘못된 권한 안내 수정 (로컬 검증 완료)

- 사용자 요청: 노관호 생성기의 ‘유사문제 미등록/권한 확인’ 혼합 안내를 구분하고 현재 있는 승인 유사문제를 모두 연결한다. 새 문항 제작·원문 채점·학생 성적·권한 명단 변경은 하지 않는다. 작업 브랜치 `codex/bank-existing-links-20261016`, 기준 main `9bd496f`.
- 기존 11개 공개 은행은 이미 생성기에 등록되어 있었지만 카탈로그의 일부 회차 링크가 고정 문항 주소가 아닌 구형 생성 주소로 열렸다. 12개 회차의 승인 생성기만 정확한 고정 은행으로 연결하도록 정리했다: 파이널1~4, 최종7/8(내부 final7/8), 최종1~3(last1~3), 시그니처1/2, 중급7. 360개 원문 유형·저장 유사문제1080개. 자료실 기존 중요유형15개는 유지하고 ‘시험지·유형으로 찾기’ 진입 링크만 추가했다.
- 빠진 실물은 이전 `hs-report-mock-round-permissions-20261008` 작업본의 중급7회 승인90문항. 10월10일 `middle7-all-pass-20261010T093525Z` 전체 통과 기록과 공개 내보내기 보고서로 확인했다. `bank/data/middle7-reviewed.json` SHA256 `08b4c2d390c3384e5b1f396d2f18e0b840117c223df4ed9887e0c90e340bd148` 그대로 복사했다. 기존 어댑터·MathML 허용목록·중급 전용 밀도 조정 코드를 필요한 부분만 재사용했으며 이전 작업본·원본·승인 문장·정답·그림 바이트를 수정하지 않았다. 낡은 original1/2-reviewed 빈 틀은 현재 승인90문항과 다른 것으로 확인해 가져오지 않았다.
- 기존 기록 `7`을 은행 `middle7`/생성기 `mid7-qNN`으로 연결하고 기존 `mock-mid-7` 권한만 검사한다. 최종7회 권한·일반은행 등록으로 우회할 수 없고 비활성/퇴원 차단은 유지한다. 학생 권한을 새로 부여하지 않았다. 중급 원문 미확정 채점 조건을 이번 승인 유사문제로 확정하지 않는다. 원문 동일난도 미확정인 변형의 기존 ‘원문 참고 배점’·변형 역할 표시는 보존했다.
- 안내는 ‘유사문제 준비 중’/‘열람 권한 없음’/‘자료 불러오기 실패’로 분리했다. hw1 등 내부 이름 대신 ‘활용 모의고사1회’, 숫자 키는 ‘중급 모의고사N회’로 표시한다. 활용1·중급1/2/3/4/6은 현재 문항별 생성용 승인 은행이 없어 준비 중이며 권한 문제로 표시하지 않는다. 기존 회차별 복습 PDF는 원문별 정오답·변형 매핑을 확인하지 않고 자동 출제 문항으로 취급하지 않았다.
- 검증 통과: `qa/bank-existing-availability-validate.cjs`에서 모든 실제 공개 데이터/정규화 어댑터12개·1080문항·맞은/틀린 범위·정확한 승인 해시 검사. `qa/middle7-reviewed-bank-validate.js`는 이전 검사 재사용. `qa/bank-existing-status-browser-validate.cjs`에서 동일6개 미지원 키의 권한오표기 없음, 실제12개 데이터 로드, 진짜 권한 거부·503 로딩 실패 분리, 카탈로그360개 연결, 자료실 진입·중요유형15개 보존, 1280/390px 확인. 실제 운영 쓰기0.
- 인쇄: 이전 중급 연결 검사를 재사용한 `qa/bank-existing-middle7-browser-validate.cjs`에서 승인90개, 4/6배치·모바일 인쇄·답안 분리·10/20/30문항 생성·MathML 안전성 확인. 비공개 QA PDF는 6배치62쪽(26쪽만 의도된 양면 빈 면)/4배치76쪽. `pdf-readback.py`에서 모든 원문번호×변형번호90개 누락0 확인하고 긴 복면산·분수·격자·긴 지문 대표 실제 PDF 페이지를 눈검수했다. 문항을 새로 검산/승인한 작업이 아니다.
- 회귀: 최종3회90문항 연결·코멘트·추천·QR·요약9문제/9풀이·생성기·카탈로그 검사, 기존 개인 생성기·권한검사, DOCSSAM 칼럼21검사 통과. `data.js`, 원문 문제/정답/성적 기준 diff0. 최종2/3회 큰 그림·해설 그림 삽입 위치를 보존했다. 작업 중의 초기 실패는 검사 fixture의 요청 메서드 호출/분석 로그 계수와 원본 JSON을 어댑터 없이 검증한 검사 문제였으며, 실제 승인/권한을 완화해 통과시키지 않았다.
- 적용 스킬: source-to-memory(기존 승인본/인수인계 우선 조회), evidence-gated-learning-pipeline(승인/출처/원문-변형 경계), gfield-design-system(기존 업무 흐름/상태 구분), PDF(실제 출력 검수). 새 채점·진단·생성 도구는 만들지 않았다. 검사 산출물과 중급 승인 원본 기록은 `.private-work/bank-existing-links-20261016/` 및 이전 보호 작업본에 유지한다.
- 현재 상태: 로컬 구현·검증 완료, 이 추가 수정은 아직 커밋/main/배포 전이다. 다음 메인 반영 시 최신 원격의 data.js 등 관리자 저장 변경을 유지한 채 이번 파일만 좁게 반영하고 공개 은행·새 상태 안내를 확인한다. 앞선 최종3회 배포(PR92)와 구분한다.

## 2026-10-16 최종 3회 메인 반영 릴리스 — PR #92

- 사용자 ‘메인 반영’ 요청에 따른 릴리스다. GitHub PR `https://github.com/docssam1/hs-report/pull/92`의 병합 상태와 해당 커밋의 Pages 실행이 메인/배포 상태의 최종 근거다. 아래 10월15일 ‘로컬 완료·미배포’는 당시 기록이며 새 승인 대기가 아니다.
- 최신 원격 `e0539c61ae1045769efd024bcc42bd5ae742f884`의 10개 후속 변경은 `data.js`만이었다. 이를 기준으로 재배치했고 `data.js`의 메인 대비 diff는 0이다. 학생 명단·권한·원장 자료 변경을 덮어쓰지 않는다.
- 코드 커밋 `5c3f537`에서 승인 데이터/소스 불변·회차 권한·90문항 4/6배치·PC/390px/A4·코멘트와 추천 번호·요약9문제+9풀이·개인 생성기·카탈로그30유형 검사를 다시 통과했다. 승인한 문항의 수학 검수·눈검수는 그대로 재사용했다. 운영 DB 쓰기 0건.
- 커밋 대상은 Last3 연결 코드와 승인90문항, 관련 QA/이 인수인계뿐이다. `.private-work`의 원본 비교·검산 모델·검수 PDF·학생 합성 시험 자료는 Git에 넣지 않는다. 새 원문 상세풀이 제작, 다른 모의고사 기준 변경, 파일 삭제는 범위 밖이다.

## 2026-10-15 최종 3회 전체 승인 및 기존 문제은행·진단 연결 완료 (로컬)

- 최신 사용자 ‘통과’는 최종3회 30유형×3=90문항 전체 승인이다. 아래 ‘승인 전/locked’ 문구는 승인 전의 제작 이력이다. 동일 내용에 재승인을 요구하거나 Q15-v1 왕복 조건, Q30-v2의 중간 순위 복수 배치를 다시 보류하지 않는다. 새 내용 변경은 별도 검수가 필요하다.
- 승인 영수증은 `.private-work/last3-reuse-20261015/human-approval-20261015.json`. 승인한 원본 JSON SHA-256 `60e03b532f3643d4aa822aa9f3b1e0b58b40fe2f93ed0e7479da8ea72973054e`와 묶었다. `export-approved.cjs`는 이 해시가 바뀌면 중단하며 미래 재제작에 승인을 자동 이전하지 않는다. 검수 당시 draft는 증거로 그대로 보존한다.
- `bank/data/last3-reviewed.json`에 승인된 90문항만 공개용 필드로 내보냈다. 원본 비교·기존 원문 지문·모델·독립 검산·개인 절대경로는 내보내지 않는다. 원래 18개 그림은 바이트 불변, Q12 필수 식은 `promptDataLines`, Q28 승인 코드표는 같은 HTML을 PNG로 렌더해 기존 raster 계약에 연결(추가3개)했다. 새 학생용 그림/채점기/진단기/실시간 생성기는 만들지 않았다.
- 기존 Last2 어댑터/고정은행/학생 맞춤 생성기/학습 추천/QR/요약+유사문제 인쇄를 Last3에 한정해 확장했다. `last3`와 `final3`를 구분하며 Last4는 유사문제 공개 범위에 추가하지 않았다. 권한은 기존 ‘최종 모의고사’ 승인 또는 실제 `oct-19` 출석을 그대로 따른다. 이전 회차 출석만 있는 학생·비활성·퇴원생은 Last3 전용은행에서 거부한다. 운영 권한·학생 O/X·성적·인증·자료실 `data.js`는 변경하지 않았다.
- Last3 실제 유형에 맞춘 소영역을 기존 보고서 어댑터에 연결했다. 26번의 기존 ‘성냥개비’ 오표기만 보고서 어댑터에서 ‘정육각형 단계별 넓이 합의 나머지’로 정정해 새 유사문제와 일치시켰다. 원본 `last-score-data.js`, 정답률/평균/분포/컷, 원문 답/풀이, 다른 회차 데이터는 불변 검사 통과. Last3에 Last1 또는 시그니처의 특별 추천 정책을 복사하지 않았으며 기존 Last2와 같은 공용 추천 번호를 학습계획·코칭·출력에 일치시켰다. 누적 표기는 기존 최종1~3회 계산에 맞춰 `/3회`로 연결했다.
- 6문항 학생 배치에서 Q15/18/23/30의 긴 지문·그림 잘림을 실제로 확인해 기존 큰 문항 별도 쪽 처리를 Last3 해당 번호만 적용했다. 나머지는 기존 2단 4/6문항 렌더러 유지. 실제 PDF에서 요약 카드가 분할되어 Last2의 기존 요약 시작·분석 페이지 나눔 규칙을 Last3에만 추가했다. `final-report-print.js` 기존 엔진은 그대로 사용한다.
- 검증: `qa/last3-reviewed-data-validate.cjs`, `qa/last3-approved-integration-validate.cjs`, `qa/last3-parent-report-browser-validate.cjs` 통과. 90문항 PC/390px·A4·4/6배치에서 그림21개 로드, 카드 잘림/JS 오류0, 3유형 선택9문항 정확 연결. 오답0/1/2/11개 합성 표본에서 추천·계획·코칭·교재·QR 일치, 실제 요약 버튼에서 승인 유사문제9개+풀이9개 준비 확인. 맞춤 생성기 전체/맞은/틀린 범위 통과, 배점대 수량 부족 시 확보분 인쇄 가능. 모든 요청 가로채기 기반이며 실제 DB 쓰기0.
- 회귀검사 통과: 기존 Last2 데이터·90문항 연결, 원문 답안7개·성적기준8개, 문제은행 권한/소스 어댑터 계약, `qa/final-summary-print-regression-validate.js`의 파이널/최종1회 추천·요약+문제 인쇄. `git diff --check` 통과.
- 일반 문제은행의 시험지 찾기에서도 ‘최종 모의고사 → 3회’를 선택하면 30개 원문 유형 각각이 `bank=last3`의 승인 고정 문항으로 연결되도록 기존 카탈로그를 확장했다. 카탈로그 두 진입부의 26번 명칭만 보고서/승인 데이터와 일치시켰다. 실제 필터 선택 후 30유형·30개 고유 원문 연결 및 Last3/Final3 분리 검사 통과. 다른 회차 카탈로그 연결 정책은 유지했다.
- 실제 PDF: 비공개 `qa-integration` 폴더의 compact26쪽/editorial36쪽(표지 포함), `qa-report`의 합성학생 진단과복습14쪽(요약5+양면 빈쪽1+문제6+풀이2). `readback-pdfs.py`에서 90개 원문번호·변형번호 누락0, 요약 카드 완전성, 문제/풀이8개 이미지 쪽의 실제 잉크 확인. 대표 PDF 문제·요약·풀이 페이지 직접 눈검수 완료. 실패한 화면 미디어 PDF는 같은 파일명으로 올바른 print 미디어 산출물로 대체했다.
- 적용 스킬: 기존 evidence-gated-learning-pipeline의 승인/출처 경계, gfield-design-system의 기존 2단 인쇄 재사용, PDF 스킬의 실제 PDF 렌더·눈검수를 이어 적용했다. 수학 재제작이나 변하지 않은 전90문항 재검산은 하지 않았다.
- 현재 상태: `codex/last3-reuse-20261015` 로컬 구현·검증 완료. 커밋/main/배포는 아직 하지 않았다. 다음은 사용자 메인/배포 요청 시 최신 원격 차이 확인 → 이번 변경만 좁게 커밋·반영 → 배포 후 Last3 경로 확인이다. Last3 원문은 기존 검수된 짧은 답안30개를 유지하며 `last3-detailed-data.js` 신규 상세풀이 모듈은 이번 유사문제 승인/연결 범위에 포함하지 않았다.

## 2026-10-15 최종 3회 90문항 비공개 검수본 (2차, 전체 제작·자동검산)

- 사용자 후속 ‘진행’으로 앞선 39문항에서 이어 30유형×3=90문항을 채웠다. 아래 1차의 ‘남은 17유형’은 당시 이력이며 현재 제작 누락이 아니다. 90문항 모두 교사 승인 전 `pending-human-review`/`locked`, 공개 가능한 원문 목록은 빈 배열이다. 공개·학생 문제은행 등록·main·배포는 하지 않았다.
- 동일 `.private-work/last3-reuse-20261015/last3-variants-draft.json`/`last3-variants-review.html`/`last3-variants-review.pdf`가 최신 90문항 검수본. 1~19번 및 30번의 60문항은 기존 파이널/중급7회 유사문제 틀·그림을 재사용했다. 20~29번 30문항은 같은 변형을 확인하지 못한 것을 억지로 연결하지 않고, 이미 분석된 최종3회 지문·그림의 수·물음을 최소 변경했다. 새 채점·진단 엔진은 만들지 않았다.
- 읽기 전용으로 찾아 이어 쓴 중급7회 검수 데이터: 기존 `hs-report-mock-round-permissions-20261008` 작업본의 `.private-work/middle7-variants-20261009/review-data.js`. 원문 30번→이번 14번의 세 집합, 원문29번→이번30번의 순위 논리를 재사용한다. 이 외부 입력 1개의 해시와 기존 입력28개의 해시를 보존·검사한다. 다른 작업본의 파일은 수정하지 않았다.
- `extend-variants.cjs`가 나머지 51문항을 추가. 기존 도형 이미지12개(쌓기나무/도로/접기/별·세모)와 최종3회 기존 분수/정육각형 이미지6개는 바이트 그대로 재사용했다. 암호 보기 역시 기존 HTML의 질문 코드만 바꾼다. 26번 새 문항의 유형은 실제 물음인 넓이 합으로 표시하지만 기존 `last-score-data.js`의 유형·통계·정답은 수정하지 않았다.
- 계산2방법 대조90/90, 작성 지문/기존 그림 모델을 다시 읽는 `verify-written-variants.cjs`+`verify-extension.cjs` 90/90 통과. 잘못된 합/수확 연도/그림 바이트를 넣은 음성 표본3개를 모두 거부하고 정상 대조3개는 통과. 그림은 기존 원본·검수 자산의 모델/바이트와 묶어 검사하며, 이 검사를 새 학생 실측 난도 승인으로 해석하지 않는다.
- 검수에서 실제 실패한 조건은 그대로 내보내지 않았다. 15번 첫 그림은 B 금지·C 필수로 단순 전환하면 되돌아가는 최단경로가 추가되어, 해당 변형만 기존 필수/금지 관계를 유지한 왕복 문제로 만들었다. 이 조건 추가는 빨간 검수 참고로 표시했고 최종 난도 승인은 대기한다. 나머지 도로 변형은 원문과 같은 C 필수·B 금지 경로다.
- 30번 두 번째 변형은 전체 순위표가 2가지지만 우승자·7위의 순서쌍은 동일하다. 단일 응답 계약을 검증했고 전체 순위가 유일하다고 쓰지 않는다. 다른 두 변형은 순위표도 하나이다. 학생이 요구받지 않은 중간 배치까지 강제로 유일하게 만들지 않았다.
- 기존 최종2회 교사 검수 서식 재사용. PC 상단의 긴 탐색목록이 제목을 덮는 것을 실제 화면에서 발견해 이 비공개 검수본만 static으로 바꾸었다. 도로/분수/정육각형/암호 보기의 표시 크기를 늘렸으며 그림 자체와 원래 수학 구조는 바꾸지 않았다. 학생용2단6문항 렌더러는 이번에 수정하지 않았다.
- 실제 Chromium PC1440/폰390: 문항·정답90개, 그림18개 로드, 가로 넘침0, JS오류0. A4 PDF90쪽, 모든 쪽의 문제/정답/출처 존재 및 90쪽 PNG 렌더 확인. 대표 입체/도로/접기/격자/분수/암호/순위 화면과 실제 PDF를 직접 눈검수했다. 결과는 `qa-batch2`(1차 `qa`는 보존). 전체90문항의 사람 내용·난도 승인이나 학생용2단 인쇄 연결 완료로 확대하지 않는다.
- 다음은 이 90문항의 교사 검수·수정과 승인 후 기존 Last2 어댑터/추천/QR/인쇄 연결 확장이다. 기존 원문 답, OX, 성적, 분포, 컷, 계정·권한, 자료실 게시물은 그대로이며 배포 권한/문항 승인을 임의로 추정하지 않는다.

## 2026-10-15 최종 3회 기존 유사문제 변형 1차 39문항 (로컬 검수본)

- 사용자 ‘진행’에 따라 앞선 재사용 조사에서 실제 변형 제작으로 진행했다. 이전 시험의 검수된 유사문제 ID를 기준으로 문장/풀이 틀을 가져와 수·조건을 바꿨으며, 원문 30문항 재분석이나 새 채점/진단 도구 제작은 하지 않았다.
- `.private-work/last3-reuse-20261015/last3-variants-draft.json`: 2·3·5·6·7·8·9·10·11·12·13·16·17번 유형 × 3 = 39문항. 원래 유사문제 ID/해시/지문/풀이와 변경한 모델을 기록. 모든 문항은 `pending-human-review`, `locked`, `availableSourceNos=[]`; 기존 승인/검산 표식을 자동 복사하지 않았다. 90문항 완성이 아니다.
- `build-variants.cjs`: 기존 유사문제를 입력으로 삼는 이 작업의 비공개 재현 스크립트. 답을 서로 다른 두 계산 방식으로 대조(39/39). `verify-written-variants.cjs`는 작성된 지문/주어진 수를 직접 파싱해 답을 다시 구함(39/39). 입력 원본·기존 변형·대본·통계 28개 SHA-256 불변. 원본 답/학생 OX/점수/컷/권한 수정 없음.
- 교사용 `last3-variants-review.html`은 기존 최종2회 검수 HTML의 스타일을 재사용했으며, 문항별 이전 유사문제 비교와 원문/기존 강의 링크가 있다. 사람의 승인 전임을 표시했다. 별도 학생용 화면이나 생성기 등록은 하지 않았다.
- `browser-review.cjs`: 실제 Chromium PC1440px/모바일390px에서 39문항, 가로 넘침 0건, JS 오류 0건. A4 39쪽 PDF 생성 후 모든 쪽의 문제/정답/재사용 출처 텍스트 존재 확인, 39쪽 모두 PNG로 렌더. 대표 PDF 12번/13번 및 모바일8번을 직접 눈검수. 39문항 전체의 교사 내용/난도 승인이나 학생용2단 출력 전수 눈검수로 확대해 보고하지 않는다. 결과는 같은 비공개 폴더의 `qa`에 보존한다.
- 12번은 `bank-fixed.js`가 기존에 제공하는 숫자·빈칸 행을 그대로 가져오고 목표 합만 바꿨다. 원문 최종3회 3쪽 및 파이널4회 1쪽 6번 배열/빈칸을 확인. 8번은 다다음 날을 본문에 명시하고, 9번은 부부의 쌍수와 전체 인원을 함께 명시해 원문 해석 혼동을 줄였다. 16번은 남은 수를 구하는 물음으로 변경했다.
- 남은 원문 유형: 1·4·14·15·18·19·20·21·22·23·24·25·26·27·28·29·30번. 기존 유사문제/그림을 이어서 재사용하며 같은 구조가 없는 것을 억지로 채우지 않는다. 본 39문항도 교사 검수 전 공개하지 않는다. main/배포 반영 없음.

## 2026-10-15 최종 3회 기존 분석 재사용 조사 (로컬, 문항 제작 전)

- 사용자 후속 정정: 최종 3회가 이전 시험 문항의 유사형이라는 뜻이다. 제작의 출발점은 **이전 시험 해당 유형에 이미 만들어 둔 유사문제**이며, 그 변형의 수·조건을 바꾸어 Last3용으로 만든다. 최종 3회 원문을 새로 전사·분석하거나 각 문항을 신규 설계하는 작업으로 확대하지 않는다. 기존 풀이·그림·생성기·검산 근거를 재사용하고 실제 변경한 부분만 확인한다. 아래 후보 차이는 잘못된 유형 연결을 막기 위한 참고이지, 기존 유사문제의 모든 표현을 Last3 원문과 똑같이 되돌리라는 지시가 아니다.
- 사용자 지시: 최종 3회(`last3`, 파이널 3회 아님) 진행. 1~19번은 이전 모의고사 저정답률 유형의 복습력 확인용이므로, 기존 분석·유사문제·수업 풀이방법을 먼저 찾고 수/조건만 최소 변경한다. 새 분석·진단 도구를 만들거나 90문항을 억지로 채우지 않는다.
- 최신 main `b106812f04a701553e7ddd2ac65438914578e5b1`에서 `codex/last3-reuse-20261015`로 분리. 기존 다른 브랜치·학생 성적·승인·인증·자료실 콘텐츠는 변경하지 않았다.
- 이미 존재: `mock-data-last3.js`의 30문항, `last-score-data.js`의 유형/정답률/강의 시각/분포/컷, `last-answer-data.js`의 검수된 짧은 답안 30개, `last-exam-svg3.js`, 원본 6쪽 이미지, 기존 최종 3회 로컬 VTT. 이를 없는 자료로 보고 처음부터 분석하지 않는다. 8번의 다다음 날 정정, 11번의 두 병 초기 수량 같음 조건을 보존한다.
- 로컬 비공개 `.private-work/last3-reuse-20261015/reuse-plan.json` 및 `reuse-review.md`에 30문항의 원본 위치·기존 후보·조건 차이·다음 검수 경계를 기록했다. `prepare-reuse.cjs`는 입력 28개 SHA-256 불변 및 후보 위치를 확인하는 조사 재현 도구이며 새 생성기/검산기/공개 어댑터가 아니다. 후보 28문항, 이 중 고정 문제은행 후보가 있는 문항 23개. 후보 수를 동일 유형 확정·새 변형 검수 통과 수로 해석하지 않는다.
- 실제 원본 1·3·4쪽(1/12/15/18/19번 그림 포함)을 직접 확인했다. 다른 원본 그림과 기존 후보 그림의 전수 대조는 아직 하지 않았다. 9번은 기존 강의 12:55~13:39에서 24명·부부 12쌍으로 풀이한다. 16번의 남은 수/지운 수, 18번의 X자/+자 절단, 19번의 포함/제외를 구분해 그대로 연결하지 않는다. 12번 기존 변형은 원문과 중복인지 그림 확인이 필요하다. 26번 메타의 성냥개비 명칭과 실제 넓이 물음은 별도 확인 대상으로 표시했으며 이번에 기존 값을 수정하지 않았다.
- 적용 스킬: `source-to-memory`로 기존 지문/대본/자산을 우선 조회하고, `evidence-gated-learning-pipeline`으로 조건·답 계약 불일치를 후보와 분리했다. 기존 공용 렌더러/어댑터 계약을 유지한다.
- 검사: `qa/last-answer-validate.js` 7개, `qa/last-paper-rounds-validate.js` 5개, `qa/last-score-data-validate.js` 8개 통과(총 20개). 이 결과는 기존 분석 보존 확인이며 새 문항 수학 검수나 새 PDF 눈검수가 아니다.
- 다음: 이 대응표에서 이어서 수/조건 최소 변경 → 바뀐 문항만 독립 검산 → 교사용 검수본. 문항 제작·원본 대조·검산은 AGENTS의 SOL/울트라 단계로 진행한다. Last3 상세 풀이 확장·고정 유사문항·학생 추천/QR/2단 인쇄 연결은 아직 미구현/미승인이고, main 반영·배포도 하지 않았다. Last1/2나 시그니처 추천 규칙을 Last3에 자동 복제하지 않는다.

## 2026-10-15 4자리 접속번호 운영 반영

- 사용자 ‘반영’ 승인 및 ‘저장 완료’ 확인 뒤 진행. 사용자가 보호키를 직접 저장했고 새 서버에서 값 노출 없이 인식을 확인했다. 도움 스크립트는 사용자 ‘네가 실행해’ 지시로 Windows PC에서 실행했다. 보호키를 코드/PR/로그에 기록하거나 클립보드 값을 다시 출력하지 않았다.
- 원격 hs-parent-auth v5는 기존 v4와 코드가 동일했다(fingerprint 3343493016). DB migration `20261015055504_hs_parent_pin_login` 적용. 기존 계정·성적·메일 연결·승인 명단 데이터 수정 없음.
- hs-parent-auth v6 ACTIVE, index.ts+pin-security.ts 2파일이 검수본과 줄바꿈 정규화 후 일치. 기존 자체 인증을 위해 verify_jwt=false 유지. `hs_student_pins` RLS=true, anon/authenticated SELECT와 RPC EXECUTE=false, service_role만 허용, RPC security_invoker 확인. Advisors ERROR=0; 서비스 전용 테이블의 RLS/no-policy INFO는 의도한 차단 구조다(https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy). 허용 정책을 추가해 INFO를 지우지 않았다.
- `qa/parent-pin-live-validate.cjs`로 실제 서버 보호키 존재, 구형 이메일 경로, PIN 형식/미등록 이름/세션 없음 거부, 익명 PIN 테이블/RPC 거부 확인. 이 검사는 OTP 발송·학생 데이터 쓰기를 하지 않는다. 실제 학부모 OTP 왕복과 실제 학생의 PIN 성공 로그인은 별도 첫 사용 확인 대상이며, 로컬 실제 SQL/Edge handler 및 브라우저 합성 검사 통과와 구분한다.
- 기존 `qa/email-login-browser-validate.js`에 공개 URL 환경변수 `GFIELD_EMAIL_QA_BASE`만 추가해 공개 frontend도 합성 Auth 응답으로 검사한다. 학생 데이터·로그인 허용 규칙을 테스트 편의로 완화하지 않는다. 원격 PR #91, frontend main/Pages/공개 확인은 아래 실행 영수증으로 구분한다.

## 2026-10-14 학부모가 정하는 4자리 접속번호 (로컬 구현·검증, 미배포)

- 사용자 승인: 최초 이메일 인증과 함께 4자리 접속번호를 직접 설정. 새 브라우저는 이름+번호, 저장된 인증 브라우저는 이름만. 5회 오입력 후에는 등록 이메일 인증으로 번호 재설정. 엄밀한 MFA라고 표시하지 않는다.
- 작업본: E:\Codex\worktrees\hs-report-last2-release-20261012, `codex/parent-pin-20261014`, origin/main `266e70d`에서 분리. 이전 로드맵 🔓 작업 `codex/roadmap-approval-icons-20261014`의 `dfe4f2b`/`2132811`은 별도 브랜치에 보존했으며 아직 미배포. 이번 인증 변경에 임의로 섞지 않았다.
- 기존 index.html/hs-email-login.js/hs-auth.js와 hs-parent-auth만 확장. 별도 로그인/승인 도구를 만들지 않는다. 나가기는 세션 유지, 명시적 로그아웃만 해제. 긴 OTP/PIN 폼은 로그인 패널 안에서 세로 스크롤돼 윗부분/제출 버튼이 잘리지 않는다.
- 서버: `hs-parent-auth/pin-security.ts`는 학생 UUID+PIN을 별도 pepper로 HMAC 후 랜덤 salt/PBKDF2-SHA256 600,000회 처리. 원문 PIN/OTP/이메일은 브라우저 저장에 추가하지 않고 서버 로그에도 기록하지 않는다. DB PIN hash/salt와 오류 횟수는 서비스 역할만 접근한다. security-invoker RPC 행 잠금으로 5번째 실패를 영구 잠금하며 이메일 검증 성공 시만 PIN과 실패 횟수를 재설정한다. PIN 교체 경합은 salt 불일치로 재입력을 요구한다.
- 기존 학생 UUID, 성적 owner_id, 자료실/회차 승인, 이메일 소유권, 관리자 로그인, 퇴원생 차단, 기기 3대 제한 유지. 기기 제한은 실제 PC 3대가 아니라 브라우저 등록 3개다. 로컬 QA 역할 service_role은 실제 Supabase처럼 bypassrls로 만든 가상 역할이고 운영 권한을 완화한 것이 아니다.
- 확인한 서버 배포본: MCP hs-parent-auth v4(verify_jwt=false, 함수 내부 OTP/세션 검증). 원격 index.ts와 origin/main 원문은 정규화 fingerprint 3343493016/454행 일치. 배포 시 최신 서버 파일을 다시 대조하고 새 pin-security.ts도 함께 포함한다. 공개 함수의 기존 verify_jwt=false를 무작정 true로 바꿔 OTP 시작을 막지 않는다.
- 검사: Deno check, `qa/hs-auth-session.test.js`, 기존 확장 `qa/email-login-browser-validate.js` 통과. PC·390px 새 브라우저 PIN/저장 복구/나가기/로그아웃/5회 오류/이메일 재설정/형제/다른 이메일/직접링크/퇴원/3개 제한 및 브라우저 저장 PIN/이메일 미포함 확인. 화면 캡처 E:\Codex\work\parent-pin-qa-20261014. 지필드 디자인 스킬로 기존 화면 유지와 세로 잘림 검수, audit 스킬로 실제 상태 구분, Supabase 스킬로 인증/RLS/키 보호 적용.
- `qa/parent-pin-server-validate.cjs`: 운영 Edge handler를 실행하며 E 검증 폴더에만 설치한 @electric-sql/pglite@0.5.9의 실제 로컬 PostgreSQL SQL을 호출. 이메일 검증 전 설정 불가, 앞자리 0, 잠금 후 정답 입력 거부, 실패 시 세션 미발급, 잘못된 이메일/퇴원/기기 제한, salt 경합, pepper 누락 차단, service_role 실행 허용 및 anon/authenticated 테이블/RPC 접근 거부 통과. 운영 DB/메일/성적 쓰기는 0건. 실제 다중 DB 연결 경쟁/운영 메일 왕복은 미검증.
- 운영 반영 순서(아직 미실행): ① 서버 전용 `HS_PARENT_PIN_PEPPER`를 암호학적 랜덤 32바이트 이상으로 생성·비공개 등록(소스/채팅/로그에 값 금지) ② `supabase/parent-pin-schema.sql`을 새 migration으로 적용·RLS/advisors 검사 ③ hs-parent-auth index.ts+pin-security.ts 함께 배포 ④ 가상 전용 계정으로 운영 확인 후 frontend main/Pages 배포·공개 확인. Supabase CLI가 이 작업 환경 PATH에 없어 migration 파일명을 임의 생성하지 않았으며 준비 SQL로 남겼다.
- PIN 기능 준비 전에 frontend만 먼저 공개하지 않는다. 새 frontend는 구형 서버가 PIN을 무시해 이메일 세션만 발급해도 pinReady 확인 없이는 인증 완료로 처리하지 않는다. 기존 이메일 전용 구형 클라이언트는 새 서버에서도 지원하며 PIN을 조용히 덮어쓰지 않는다.
- 사용자 후속 ‘반영’으로 운영 설정·main·배포까지 승인(2026-10-14). 그러나 현재 Supabase MCP에 secret 등록 도구가 없고 CLI/인증 환경변수도 없다. 인증 저장소·브라우저 쿠키에서 자격 증명을 추출하거나 기존 서비스 키를 PIN pepper로 재사용하지 않는다. 별도 서버 비밀값 등록은 Dashboard/인증된 CLI에서 한 번 필요하다(공식 functions/secrets 문서 확인).
- 배포 전 읽기 확인: hs-parent-auth 운영 v4 그대로, PIN 테이블 없음, hs_parent_links 존재, 실제 service_role bypassrls=true. 기존 기능을 깨뜨리는 부분 배포를 피하려고 DB/함수/frontend/main 적용은 아직 수행하지 않았다. 사용자 보조 스크립트 E:\Codex\work\parent-pin-qa-20261014\register-pin-secret.ps1는 안전 난수 생성→클립보드→공식 설정 페이지를 열며 원문을 파일/출력에 남기지 않는다. 아직 실행하지 않았다. 사용자가 등록했다고 하면 서버 설정을 다시 읽어 준비 여부를 확인하고 위 순서로 계속한다.

## 2026-10-13 보고서 진입 캐시·QR 연결 검사

- 사용자 요청: QR 연결이 안 된다는 제보 후 ‘진행’, 특정 사진/주소 없이 ‘그냥 해’. 확인된 옛 캐시 키는 허브 최종7·8회와 자료실 최종7회에 있었으며, 로그인 QR·목적지에는 버전이 없었다. 해당 제보의 실제 인쇄물/카메라 실패 원인은 확인하지 못했다.
- `final-last-routes.js`에서 최종7·8 보고서 주소를 `20261013-report-qr`로 만들며 허브/자료실의 중복 옛 버전 덧붙임을 제거한다. 관리자 링크도 같은 키. 새 전체 진단 QR의 보고서와 로그인 진입 주소, 유사문항 QR의 로그인 주소에 최신 키를 붙인다. QR에 학생 개인정보를 넣지 않고 기존 이름/이메일 로그인과 권한 판정을 유지한다.
- audit-verify-explain-grade-5로 현재 코드·공개 캐시 헤더·실제 이동을 확인했고 Supabase 스킬 보안기준에 따라 인증 검사는 가상 서버 응답으로 한정했다. 운영 메일/성적/권한/DB 쓰기 0건. Supabase 구현·서버·RLS·인증 규칙은 수정하지 않는다.
- 로컬 검사: 최종7/8·최종1·시그니처1 전체 진단/유사문항 8개 QR 목적지에 대해 모바일 인증 세션 자동 이동, 최종8의 두 QR은 새 기기 이메일 화면→코드 입력→같은 목적지 완료. QR SVG/주소는 확인했지만 실 휴대폰 카메라 판독이나 인쇄된 과거 QR의 실패를 재현한 것은 아니다. 기존 공개 QR 주소도 로그인/권한 경로가 유효한지 검사한다.
- 로컬 `qa/report-qr-navigation-browser-validate.cjs`, `qa/final-last-route-unit-validate.js`, `qa/student-result-hub-browser-validate.js`, `qa/final78-signature-benchmark-validate.js` 통과. 코드 공개 반영은 별도 원격 main/Pages/공개 검사 영수증으로 판단한다.
- 앞선 최종7·8/활용1회25번 수정은 PR #88/main `9ed5627`, 80분 별도 타이머는 PR #89/main `5273a6a`로 배포 완료. 과거 아래의 ‘미배포’ 문구는 당시 로컬 상태 기록이며 현재 재배포 대상이라는 뜻이 아니다. 활용1회25번 학생 O/X는 자동 재채점하지 않는다.

## 2026-10-12 최종 실전 7·8회 시그니처 반영 공식 통일 (로컬 검증 완료, 미배포)

- 사용자 최신 지시: `final7`, `final8`은 시그니처 1·2회 반영 공식을 쓴다. `last1`~`last4`의 집단 백분율 평균·역환산을 사용하지 않는다. 정규 파이널/최종 1~4회 성적·분포·컷과 학생 O/X는 변경하지 않는다. 7·8회는 계속 독립 회차이며 누적에서 제외한다.
- `final8-benchmark.js`의 공용 어댑터가 기존 `GFIELD_SIGNATURE_FORECAST.estimate`/`levelPlacement`와 `GFIELD_MOCK_ORIGINAL.estimatedPosition`을 그대로 호출한다. 실제 원점수의 역사적 합산 분포로 예상 백분율을 표시하고 실전 예상점수로 예상 반과 레벨별 90:10 대기를 판정한다. 개인 공식 파이널 1~4회 기록의 제한적 비교 보정도 시그니처와 동일하며, 다른 시험 집단 분포를 섞는 것은 아니다.
- 7회 종전의 가상 `verified-source-rank` 통계 주입은 제거했다. 참고 예상치를 7·8회 실측 석차로 승격하지 않는다. 예시(개인 파이널 기록 없음): 원점수 45 → 예상 40.5, 예상 백분율 2.5%, 심화 가능 예상. 개인 비교 기록이 있으면 예상점수/반만 달라질 수 있다.
- 기존 `final.html` 화면/표지/QR 요약/`final-parent-report.js`와 메인 `student-result-hub.js`가 같은 어댑터를 사용한다. 추천 기준·원본/유사문제·자료실 권한·인증·서버/DB는 수정하지 않는다. 변경 JS 캐시는 `20261012-final78-signature`.
- 검증: 시그니처 공식 일치 36사례, 7회 원문·정답 보존, 기존 시그니처 요약/답 상태/부모 진단 모델, 결과 허브 PC·390px/누적 제외, 7·8회 개인 기록 유무별 화면/요약/표지/QR 값 일치. 실제 요약 A4 PDF 각 3쪽(총 6쪽)을 렌더링 눈검수했다. 결과·이메일·권한 DB 쓰기 0건. 검수 자료: `E:\Codex\work\final78-signature-20261012`.
- 작업 브랜치 `codex/final78-signature-formula-20261012`는 기존 활용1회 25번 미배포 교정 커밋 `efb1aef`/`f0003df`와 최신 main `f697085`를 보존한다. 최종2회 서버 코멘트 확장은 별도 미적용 상태로 유지한다. 공개 배포 성공이라고 보고하려면 별도 메인/Pages/공개 읽기 검증을 해야 한다.
- 별도 구형 관리자 링크 QA는 최신 main의 중급7회 승인 행 추가 및 `hs-approval-admin` 조회 POST를 모르는 fixture로 중단됐다. 현재 변경의 성적표 직접 브라우저 검사와 결과 허브 검사는 통과했다. 이 요청에서 관리자·승인 API를 고치거나 해당 QA를 억지로 통과시키지 않았다.

## 2026-10-12 활용 1회 25번 정답 교정

- 사용자가 정답 교정을 요청했다. 원문 활용 1회 인쇄 5쪽의 25번은 숫자 카드 0·1·2·5·6·8·9 각 한 장 중 다섯 장을 사용하며, 수 전체를 180° 회전한 값이 7920 커지는 처음 수를 모두 구한다.
- 원문 그림에서 2와 5는 각각 180° 회전해도 그대로이며, 6과 9만 서로 바뀐다. 기존 2↔5 혼동 답 `20185, 50182`를 제거하고 정답 6개 `60189, 60289, 60589, 90186, 90286, 90586`로 교정했다. `20182, 50185`는 카드 중복이라 허용하지 않는다.
- 정답·해설과 기존 화면의 데이터 캐시 버전만 변경한다. 원본 PDF/그림·다른 문항·유형 ID·통계·학생 O/X·성적·계정·권한은 바꾸지 않는다. 기존 저장 성적을 자동 재채점하지 않는다.
- 전수 카드 순열과 독립 자리값 차 계산의 확인 결과를 재사용하고 `qa/hw1-q25-answer-validate.js`로 회귀 방지한다. 공개 반영 여부는 원격/Pages/공개 파일 및 답안 화면 확인 기록과 구분한다.
- 최종 2회 교사 코멘트 서버 확장은 이 변경과 별도 작업으로 남아 있다. 학생 메일 진단 기록은 비공개이며 공개 저장소에 이메일·인증번호·토큰을 넣지 않는다.

## 2026-10-12 최종 2회 프런트엔드 배포 준비

- 사용자 전체 승인 90문항 및 기존 진단·추천·QR·문제은행·인쇄/ZIP 연결만 최신 main `bf6f492` 위에 통합한다. 최신 학생 명단·회원 상태·자료실 데이터는 수정하지 않는다. 원문 6번은 108개 그대로다.
- 서버 함수와 Last2~4 코멘트 DB 제약 확장은 이 프런트엔드 배포에 포함하지 않는다. 별도 미적용 작업은 `8981d63`과 원래 작업본에 보존한다. 실제 서버의 비공개 기준 파일 4개를 빠뜨린 함수 배포를 하지 않는다.
- 기존 수학 승인·독립 검산·로컬 PDF/ZIP 증거를 재사용하고, 통합 후 영향 검사 및 배포 후 공개 파일·PC/모바일·추천 문제·실제 출력만 확인한다. `qa/last2-approved-integration-validate.cjs`는 `GFIELD_LAST2_QA_BASE`와 별도 결과 경로로 공개 코드도 읽기 전용 검사할 수 있다.
- 원격 메인·Pages·공개 확인 영수증은 E:\Codex\hs-admin-unify-20261004\last2-deployment-20261012.md에 별도로 기록한다. 이 문단 자체는 배포 성공 증거가 아니다.

## 2026-10-12 최종 2회 유사문제 전체 승인 연결 (로컬, 미배포)

- 사용자 확인: 원문 정답은 자료실 검수본이 공식 기준이며 6번은 **108개**. 유사문제 90개 전체 확정. 이전 보류 문구는 승인 이전 이력이며 현재 미승인 장벽으로 재사용하지 않는다. 원문 정답·상세 풀이·점수/컷/분포·성적 기록은 변경하지 않는다.
- `bank/data/last2-reviewed.json` 90문항을 verified, availableSourceNos 1~30으로 등록. 지문·그림·변형 답·풀이를 그대로 가져오고 비공개 원문 비교와 내부 검산 자료는 공개 JSON에서 제외. 개인 검수 원본과 계산 증거는 `.private-work/last2-variants-20261011`에 보존한다.
- 기존 BANK_FIXED/어댑터/학습지/개인 모의고사 생성기를 Last2에 연결. 진단 추천 3유형→유사문제 9개와 답안·풀이→요약 인쇄/일괄 PDF/ZIP/QR은 동일 원문 번호와 last2 ID를 사용. Last3/4 유사문제는 여전히 공개 연결하지 않는다.
- 정규 최종 자료실 승인 또는 기존 `oct-12` 출석으로 Last2 문제은행 접근. Last1 출석 `oct-5`만으로 Last2를 열지 않는다. 실 학생 권한·DB·메일·인증 방식·teacher 주소 인증은 수정하지 않는다.
- 출력 검수에서 6문항 배치의 20/28/29번 긴 지문·그림 잘림과 15번 작은 암호 그림을 확인해 해당 Last2 문항만 큰 그림 별도 쪽으로 처리. 문항 내용·원본 그림은 그대로. 다른 시험 레이아웃을 일괄 변경하지 않는다.
- 근거: `qa/last2-reviewed-data-validate.js`, `qa/last2-adapter-pending-validate.js`, `qa/last2-approved-integration-validate.cjs`, `qa/last2-parent-report-browser-validate.js`, `qa/admin-last14-batch-browser-validate.js`. 실제 화면/PDF는 `E:\Codex\hs-admin-unify-20261004\qa\last2-approved`.
- 로컬 작업이며 메인·공개 배포·서버/DB 적용 완료가 아니다. 사용자 배포 지시 시 최신 main과 겹치는 변경을 대조하고 실제 배포까지 별도 확인한다. 기존 서버 함수의 비공개 기준 파일 4개를 누락한 채 배포하지 않는다.

## 2026-10-11 중급 7회 승인·이메일 인증 배포본 통합 (로컬 검증 완료, 미배포)

- 이메일 인증·승인 기기 3대 제한 배포 main `f390b9a4c9d16f06d88954e5096cdd5a8f057a3e`에서 분리했다. `hs-report-docssam-columns-preserve-20261010`의 미커밋 원본은 보존하고 중급 7회 변경만 이식했다. 옛 `admin.html` 전체 복사로 이메일 인증 카드·스크립트·학생 목록 연결을 되돌리지 않는다.
- `⑤ 자료실 → 추가 모의고사 회차 승인`의 기존 표에 `중급 7회`를 추가한다. `mock-mid-7`, `mock-final-7`, `mock-final-8` 명단은 독립이며 기존 서재와 같은 `archiveProductAccess`를 양방향 갱신한다. 시그니처 1·2회 별도 승인표와 저장 경로는 그대로다.
- 로드맵 추가 모의고사 항목도 같은 중급 7회 키를 사용한다. 폴더 승인만 있거나 다른 회차만 승인된 학생에게 중급 7회를 열지 않는다. 렌더링 자체는 명단을 변경하지 않는다. 학생 화면의 `index-enhancements.js` 캐시 버전만 갱신했다.
- 인증 모듈·운영 DB·SMTP·학생 성적·실제 승인 명단·시험지·문항·유사문제는 변경하지 않는다. 이 작업에 다른 미커밋 유사문제를 함께 배포하지 않는다.
- 합성 브라우저 검증: 중급 승인 14경우(PC1280/390 관리자 각 46검사 그룹, 학생 승인/전체공개/폴더만/빈명단/키없음/다른회차만), 시그니처 회귀 각 59검사, DOCSSAM 보존 21검사 및 브라우저 26경우 통과. 기존 이메일 인증 기록·3대 표시·초기화 버튼도 검수하며 실제 초기화·운영 쓰기·메일 발송은 하지 않았다.
- 기존 인증 브라우저 검사에서 새 브라우저/동일 브라우저/다른 이메일/퇴원/기기 제한/모바일 통과, 세션 단위 검사 통과. 승인 검사는 기존 QA 전용 이메일 세션 스텁을 재사용한다. 이를 실 운영 메일 왕복 검사와 혼동하지 않는다.
- 근거: 새 작업본 `.private-work/middle7-additional-approval-20261011/`의 결과 JSON·PC/390 캡처, `E:\Codex\work\hs-middle7-approval-email-integrated-20261011\result.md`. 사용자 메인 반영·배포 지시 후 요청 변경만 반영하고 원격 SHA·실제 공개 파일을 확인한다.

## 2026-10-10 DOCSSAM 칼럼 원문 복구·보존

- 칼럼 5편은 `bd9ff9e1`(2026-09-25 교육뉴스 저장)의 전체 데이터 스텁으로 소실됐다. 삭제 직전 `27848e08b21e9ef702e04c6b1f9467b3875aca3b:data.js`에서 제목·날짜·HTML·순서를 그대로 복구했다. 제목이 같은 2편도 본문이 달라 모두 유지한다. 이번 `data.js` 변경은 `vip.columns`만이며 기존 성적·승인·회원·자료·뉴스는 바꾸지 않는다.
- `docssam-columns.js`에 원문 5편을 별도 보존하고 `index.html`/`admin.html`에서 기존 데이터 직후 읽는다. 칼럼 목록만 비었거나 없으면 표시용 목록을 원문으로 복구한다. 전체 `data.js`를 복구·대체하는 장치가 아니며 다른 값은 건드리지 않는다.
- 관리자 기존 저장 경로에서 최신 원격 JSON과 초기 칼럼을 비교한다. 칼럼을 안 고친 저장은 원격 최신 글을 유지하며, 양쪽에서 칼럼을 고친 경우·읽기/형식 실패·빈 목록 저장은 PUT 전에 중단한다. 마지막 글 전체 삭제도 보호한다. 저장 성공 후 비교 기준을 갱신한다.
- 병합은 저장용 사본에서만 하고 PUT 성공 후 반영한다. 실패하면 화면·로컬 글·비교 기준은 유지한다. 비교 기준은 실제 전송한 칼럼이며, PUT 대기 중 입력한 글은 미저장 상태로 남긴다. 원격 새 글과 대기 중 편집이 겹치면 현재 글을 보존하고 재저장을 중단해 복사·새로고침을 안내한다.
- 이미 열린 구버전 관리자 탭에는 새 저장 검사가 적용되지 않는다. 그런 탭이나 저장소 밖 뉴스 작업이 `vip.columns=[]`를 다시 저장해도 별도 원문과 새 화면의 빈 목록 복구가 유지된다. 저장소 안에는 현재 자동뉴스 작성 코드가 없으므로 외부 자동 작업 자체를 수정하거나 모든 데이터 손실을 차단했다고 주장하지 않는다.
- 칼럼 원문/보존 검사는 `qa/docssam-columns-preservation-validate.js`, 합성 학생·모의 GitHub 저장으로 화면/충돌/실패를 검사하는 경로는 `qa/docssam-columns-preservation-browser-validate.js`다. 보호 규칙을 `AGENTS.md`에 추가했다. 실제 학생 기록 쓰기나 DB 변경은 하지 않는다.

## 2026-10-10 시그니처 1·2회 관리자 별도 승인표

- `⑤ 자료실 → 시그니처 1·2회 별도 승인`에서 `mock-signature-1`과 `mock-signature-2`를 각각 관리한다. 기존 `archiveProductAccess` 및 서재 승인·`GitHub에 저장` 경로를 사용하며 새 승인 저장소를 만들지 않는다. 서재 항목이 없어도 표가 표시되고 단순 렌더링은 기존 명단을 변경하지 않는다.
- 표와 동일 회차 서재 항목의 개별 승인·전체공개·모두체크는 양방향으로 반영된다. 학생 명단 변경 시 표를 다시 그린다. 최종 7·8회 기존 함수·행·권한과 다른 회차는 변경하지 않는다. 이 배포는 아직 별도 작업 중인 중급 유사문제와 다른 자료실 확장을 포함하지 않는다.
- `qa/admin-signature-round-permissions-browser-validate.js`: 완전 합성 학생으로 PC1280/390 각각 59개 확인 그룹, 다른 명단 불변·표/책 동기화·Enter/Space·전체공개·모두체크·기존 최종7/8 보존, 브라우저 오류0/외부쓰기0. 운영 학생 데이터·O/X·성적·승인 명단을 변경하거나 저장하는 테스트가 아니다.

## 2026-10-07 요약 ZIP 우선 유사문제·압축 진행

- 관리자 일괄 저장의 기본 요약은 개별 `final-summary-practice-print.js`를 재사용한다. 화면의 우선 추천 원문 번호를 그대로 전달하고, 유형당 검수된 고정 3문항과 동일 번호의 풀이를 포함한다. 추천이 1~2개이면 실제 개수만, 없으면 요약만 저장한다. 선택한 원문 전체 상세 풀이 부록의 기존 경로는 유지한다. 아직 없는 최종2~4 유사문제는 준비 중 안내를 유지하며 새 문제를 임의 생성하지 않는다.
- ZIP은 이미 압축된 PDF를 다시 DEFLATE 하지 않고 STORE로 묶는다. PDF를 바이트로 읽은 뒤 추가하고 묶음 진행률을 표시한다. 압축·다운로드 실패는 오류 안내 후 버튼을 다시 활성화한다. 실패가 끝난 그림을 기다리던 무한 대기도 즉시 오류/45초 제한으로 막는다.
- 합성 학생 검수: 최종1 오답13개 → 기존 추천20·15·22 → 실제 문제9/풀이9, ZIP 다운로드·해제한 A4 PDF, 최종1~4 요약·최종2 상세 부록, 390px, 압축 실패 안내·깨진 그림 실패, 실데이터 쓰기0. 실제 PDF에서 발견한 긴 유형 제목 겹침은 기존 요약 인쇄의 복제 화면 글꼴과 높이를 보존하도록 보완한다. 점수·O/X·추천 기준·권한은 변경하지 않는다.
- 배포 `5204dae`의 공개 4개 파일 바이트 일치·Pages 성공 확인. 첫 공개 브라우저 검사는 합성 `hs_accounts` 응답 누락으로 권한 거절됐고, 검사용 활성 관리자 응답을 추가한 동일 공개 코드 검사에서 ZIP·문제9/풀이9·파이널 기존 경로·모바일·실데이터 쓰기0 통과. 로컬 검사도 실제 권한 경로를 강제하도록 보완하며 서비스 권한을 완화하지 않는다.

## 2026-10-07 관리자 백분율 선택에 최종 1~4회 연결

- 파이널1~4만 있던 `백분율 반영 회차`에 최종1~4를 추가했다. 파이널은 기존 서버 스냅샷 저장을 그대로 사용한다. 최종은 이미 진단지에서 자동 적용하는 `last-score-data.js`의 회차별 백분율표/분포를 관리자 공식1차 결과에도 표시하고, 선택 후 버튼은 같은 기존 기준을 결과 화면에 적용한다. 최종을 파이널 전용 서버에 보내거나 새 기준·원점수·정답률·누적 규칙을 만들거나 다시 저장하지 않는다.
- 확인 창과 완료 안내도 ‘최종 기준 적용’으로 구분하여 서버 저장으로 잘못 안내하지 않는다. 기준 누락은 성공으로 표시하지 않는다. 기존 회차 검사에 최종1~4 목록·정확한 백분율·재응시 제외·확인 창·학생 기록 쓰기0을 추가했다.

## 2026-10-07 최종 8회 옛 보류 안내 정리

- 관리자 승인 표에 8회이면 무조건 붙이던 ‘학생용 자료 보류’와 옛 정답 충돌·유사문제 승인 대기 설명을 제거했다. 회차별 명단 관리 안내와 7·8회 독립 승인 규칙은 유지한다.
- `final-last-routes.js`에서 호출·외부 노출이 없는 옛 보류 화면 함수만 제거했다. 실제 라우팅·접근 검사·학생 명단·O/X·점수·원문·유사문제는 변경하지 않는다. 기존 관리자 연결 브라우저 검사에 승인 표의 두 회차 이름과 보류 문구 제거·권한 명단 보존 검사를 추가했다.

## 2026-10-07 성적 추이 그래프·회차 가독성

- 기존 650×132 SVG가 두 칸에서 축소되어 회차 글자가 실제 약 5px였다. 기존 그래프만 480×240으로 높이고, 파이널·최종 이름과 회차를 두 줄로 표시한다. 화면 글자·선·점과 아래 성적 표를 키우고, 좁은 화면에서는 두 그래프를 위아래로 배치한다. 모바일은 그래프 내부만 좌우 이동하여 글자 크기를 유지하고 전체 페이지 넘침을 막는다. A4에서는 두 그래프를 나란히 유지한다.
- `model` 계산·최초 응시·미응시 빈칸·점수·컷·누적 범위·학생 기록은 변경하지 않는다. 기존 추이 테스트의 낡은 기대값만 승인된 최종2 이후 누적 규칙에 맞춘다. `qa/final-score-trend-readability-validate.js`는 실제 글자 크기·16개 회차 라벨·라벨 겹침/잘림·PC/390px/A4·한 회차 응시와 빈칸을 검사한다.

## 2026-10-07 최종 1회 필수 추천 3문항 보충

- 사용자가 ‘개인 정답률보다 문항 정답률이 높은 오답’만으로 3개를 못 채울 때 남은 실제 오답의 문항 정답률 내림차순으로 보충하도록 승인했다. 최종 1회만 최대 3문항을 선정하며 오답이 1~2개면 그 수만, 만점이면 0개다. 정답률을 확인할 수 없으면 임의 순위를 만들지 않는다. 파이널4·최종8·시그니처의 기존 추천과 학생 점수·O/X·컷·누적 기준은 유지한다.
- `reportPriorityNos` 한 선정 결과를 기존 부모 진단·자동 조언·학습 계획·오답 교재 연결·추천 유사문제·요약 PDF가 공유한다. 박제아의 기존 O/X 패턴(56.1점·오답13개)은 20·15·22번을 추천하며 해당 원문당 3개씩 유사문제9개·풀이9개를 출력한다. 실제 학생 결과를 다시 저장하지 않는다.
- 자동 조언이 ‘추천 없음’을 ‘오답 없음’으로 잘못 말하던 분기도 구분했다. `qa/last1-priority-validate.js`로 우선 대상0/1/2/3개, 오답0/1/2개, 타 시험 유지와 원본 불변을 검사한다. 기존 요약 인쇄 QA는 보충 추천의 화면·조언·교재·유사문제 ID 일치, 전체 오답 보존, 390px과 만점/소수 오답 경로를 검사한다.

## 2026-10-06 최종 1회 요약 인쇄 오답 누락

- 기존 요약 인쇄가 필수 추천 이외의 오답 행을 모두 제거하여, 승인된 추천 조건에 해당하는 문항이 없는 학생은 오답 요약이 빈 표가 되었다. 최종 1회만 화면의 실제 전체 오답 번호·유형·영역을 요약 인쇄에도 보존한다. 필수 추천은 여전히 ‘오답 중 문항 정답률이 학생 전체 정답률보다 높은 문항’ 최대 3개이며, 해당 문항이 없다고 임의로 채우지 않는다. 원점수·O/X·오답 원인·다른 시험의 추천과 인쇄는 변경하지 않았다.
- 전체 오답 표가 여러 쪽에 걸쳐도 사라지지 않도록 최종1 요약의 표 본문만 쪽 나눔을 허용하고 개별 행은 함께 유지한다. 화면·인쇄의 실제 오답 번호 대조와 추천 없음/13개 오답, 추천 있음/26개 오답 출력 검사를 기존 요약 인쇄 QA에 추가했다.

## 2026-10-06 학생 상단 최종 1회·최종 8회 성적 연결

- 박제아의 `last1`과 `final8` 원본 성적은 모두 저장돼 있었다. 최종 1회는 회차 승인에 쓰는 `oct-5` 출석 연결이 없어 상단에서 숨겨졌다. 사용자가 실제 응시를 확인했으므로 기존 `jun-w3`를 보존하고 `oct-5`만 추가했다. 최종 2~4회 전체 권한을 열거나 접근 검사·학생 결과를 변경하지 않았다. 관리자 `data.js` 캐시도 갱신했다.
- `student-result-hub.js`에 최종8 ‘상세 분석 준비 중’ 하드코딩이 남아 있었다. 기존 회차 권한과 `final.html?round=8&go=report` 주소로 연결하고, 기존 `final8-benchmark.js`의 시그니처 기반 난도 보정 예상 백분율·2025 컷 등급을 그대로 표시한다. 원점수는 보존하고 백분율 옆에 ‘예상’을 표시한다. 최종8은 정규 파이널1~4·최종1~4 누적에 넣지 않는다.
- `last-score-data.js`와 최종8 관련 모듈의 캐시 키를 현재 성적표에 맞췄다. 최종1 경시 가능 56.2점, 승인된 누적 판정 규칙과 다른 회차 기준은 그대로다. 테스트에 남아 있던 ‘최종2회 이후에도 파이널 포함 평균’ 기대만 현재 승인된 최종 전용 평균에 맞췄다.
- `qa/student-result-hub-browser-validate.js`는 최종1·8 두 기록만 있는 경우의 2행 표시·원점수·백분율·각 회차 주소·누적에서8 제외, 권한 회수 후 숨김, PC·390px·키보드 이동, 성적 쓰기0을 검사한다. 운영 데이터 조회는 읽기만 한다. 실제 학생의 다른 회차 권한은 추가하지 않는다.

## 2026-10-06 최종 1회 경시 기준·강점 안내·요약 인쇄 겹침

- 사용자 지시로 최종 1회 `scoreBands`의 최상단 ‘경시 가능’ 기준만 54.2점에서 56.2점으로 올렸다. 다른 점수 구간, 회차, 백분율 분포, 누적 기준, 학생 원점수·O/X는 그대로다. 성적 화면과 기존 입력·분석 화면의 캐시 버전을 갱신했다. 56.1점은 다음 구간, 56.2점부터 경시 가능으로 판정한다.
- 강점 기준(2문항 이상 영역에서 득점률 70% 이상)은 그대로이며, 해당 영역이 없을 때 표시하던 ‘확인 필요’를 ‘아직 강점으로 분류된 영역은 없습니다’로 바꿨다. 보완 영역이 없을 때도 자료 누락으로 오해하지 않도록 안내한다.
- 실제 추천 3·11·18번과 같은 O/X 패턴을 가상 학생에 넣어 깃발 유사문제 2·3의 겹침을 재현했다. html2canvas의 복제 문서에서 기존 일반 문제은행의 번호별 위치 이동이 다시 적용되는 문제다. 요약 캡처 복제본에만 실제 배치와 답칸 위치를 고정하고 이동 효과를 제거했다. 원래 문제 화면·지문·그림·정답·추천 규칙은 변경하지 않았다.
- 테스트는 캡처 복제본의 문항 사각형 겹침과 답칸 잘림도 검사한다. 추천 유사문제 9개·풀이 9개, PC·390px, 실제 A4 PDF 10쪽(양면 정렬 빈 면 포함)을 확인했다. 파이널 2·7회와 최종1 일반 추천 경로도 통과하며 운영 데이터 쓰기는 없다. 검수 PDF는 E: 비공개 ignored 폴더에 보존한다.

## 2026-10-06 최종 1회 요약 진단 학습 연결

- 새 진단기를 만들지 않고 `final.html`의 최종 1회에 기존 `final-diagnostic-comment` 모듈을 연결했다. 이번 주 학습 계획은 기존 부모 보고서 호스트로 이동되어 화면과 요약 인쇄에 함께 표시된다. 최종 2~4회의 모듈 로드는 변경하지 않았다.
- 최종 1회의 승인된 추천 규칙(오답 중 문항 정답률이 학생 전체 정답률보다 높은 문항, 정답률 내림차순 최대 3개)을 공용 코멘트에도 전달한다. 일반 파이널의 추천 방식은 그대로이며, 기준에 해당하는 문항이 없는 경우 임의 번호를 채우지 않는다. 학생 점수·백분율·정답·교재 매핑은 변경하지 않았다.
- 요약 유사문제 인쇄 검증이 `last1` 대신 `final1`을 찾던 오류를 수정했다. 화면 추천·학습 계획·오답 교재 연결·출력 문제와 풀이가 같은 최종 1회 번호를 사용한다.
- `qa/final-summary-print-regression-validate.js`에 저득점 추천 있음/고득점 추천 없음 경로를 추가했다. 가상 학생의 추천 3·11·2번, 연결 교재 3개, 유사문제 9개와 풀이 9개, 인쇄된 학습·강점/보완·교재 연결 제목, PC·390px 넘침 없음, 운영 쓰기 0건을 검사한다. QA PDF는 비공개 E: 검수 폴더에만 둔다.

## 2026-10-06 최종 1회 6번 유사문제 2·3 그림 크기

- 세로 종이접기 그림이 공통 높이 제한에 걸려 약 43%로 축소되던 문제를 수정했다. `last1-q06-v2/v3`만 기존 큰 그림 별도 쪽 배치를 사용해 PC·A4 너비를 290px에서 671px 이상으로 확대했다. 1번 변형, 다른 문항의 그림·본문·정답과 90문항 데이터는 변경하지 않았다.
- 최종1 고정 화면에서도 일반 생성기가 중복 실행돼 관계없는 문제와 답안이 인쇄에 붙는 것을 확인했다. `last1`과 `last|1` 오답 경로를 기존 고정 문제 제외 목록에 추가해 선택한 문항만 출력한다.
- `qa/last1-q06-figure-size-browser-validate.js`: 4문항/6문항 배치, PC·390px·실제 A4 폭, 그림·답칸 잘림 없음, 선택 문항과 답안 3개 일치, 외부 쓰기 0건. 실제 A4 PDF 5쪽의 3·4쪽에 확대된 유사문제 2·3이 표시됨을 렌더 확인했다. 최종8 그림 검사 및 최종1 고정 문항 검사는 계속 통과한다.

## 2026-10-06 최종 8회 유사문제 그림·6문항 출력 복구

- 16번 가림막 격자와 25번 회전 길 블록의 승인된 그림이 고정 데이터에서 `asset: null`로 빠져 있었다. 기존 검수 생성기와 실제 공개 문제·정답을 대조한 뒤 각 3개씩 총 6개 그림만 복구했다. 90문항의 본문·정답·풀이·승인 상태는 그대로다.
- 20번 원형 그림은 최종8 compact 출력에 한정해 본문·그림 간격을 맞췄다. 25번은 길과 방향·블록 범례를 읽을 수 있도록 별도 큰 그림 쪽에 배치하며 일반 문항은 기존 6문항 배치를 유지한다. 모바일의 본문 크기는 줄이지 않는다.
- 최종8도 고정 검수 문제은행을 쓰므로 기존 생성기 중복 실행 제외 목록에 8회를 추가했다. 다른 시험의 문항과 배치는 바꾸지 않는다.
- `qa/final8-figures-browser-validate.js`: 9개 그림 디코딩, PC·390px·실제 A4 폭, 6문항 첫쪽과 25번 별도쪽, 카드 넘침·그림 잘림 없음, 운영 쓰기 0건. A4 PDF 5쪽의 격자·원형·길 블록 그림을 실제 PDF 렌더로 확인했다. 최종8 문항 검산·20번 정답·관리자 연결 검사도 통과했다.

## 2026-10-06 회원 상태와 퇴원 접속 정지

- 기존 회원 배지를 `재원생 → 온라인 → 퇴원생 → 재원생`으로 확장했다. 퇴원·복귀는 확인 후 최신 GitHub `data.js`의 해당 학생 `studentTypes`만 자동 저장한다. 다른 미저장 수업·과제 편집은 함께 공개하지 않는다. 발급 계정은 기존 `hs-approval-admin.setAccess(active)`로 정지·복귀하며, GitHub 저장 실패 시 서버 상태를 복원한다. 이름 로그인 차단은 Pages 데이터 반영 후 적용된다.
- 퇴원은 삭제가 아니다. 학생 명단·성적·출석·코멘트·회차 권한을 보존하고 관리자에서는 계속 볼 수 있다. 학생 이름 로그인·저장 이름 자동 입장·직접 진단/답안·일반/회차 문제은행에서 `withdrawn`을 거부한다. 승인번호 관리의 발급/일괄 발급에서도 퇴원생을 제외한다. 기존 공개 정적 파일 자체를 비공개 저장소로 전환한 작업은 아니다.
- `qa/student-membership-browser-validate.js`는 가상 학생만 사용하며 모든 외부 요청을 가로챈다. 전환·취소·복귀·저장 실패 원상복구·미발급 계정·최신 원격 데이터와 미저장 편집 보존·PC/390px·저장 로그인/직접 진입 차단·관리자 권한 보존을 확인했다. 실제 학생 변경 0건. 기존 계정 세션·문제은행 권한·최종8 관리자 성적표 연결·중급 온라인 회차 검사가 통과했다.
- `qa/library-product-access-validate.js`의 ‘최종7 승인 명단은 빈 배열’ 기대는 현재 승인된 운영 데이터와 다르다. 회원 기능은 해당 명단을 수정하지 않는다.

## 현재 진행 — 2026-09-19 최종 7회 15·16번 유사문제

- 사용자 눈검수를 통과한 15·16번에 원문별 고정 유사문제 3개씩을 추가했다. 15번은 세 변형의 격자 크기와 실제 이동 경로를 서로 다르게 만들고, 모든 칸을 한 번씩 지난 뒤 다음 묶음으로만 이어지며 이미 지난 칸으로 돌아가지 않도록 경로를 독립 검사한다.
- 15번 정답은 `(2, 51)`, `(4, 50)`, `(3, 84)`이고 16번 정답은 `45`, `105`, `117`이다. 16번은 매번 위의 두 장을 버리고 다음 한 장을 맨 아래로 보내는 과정을 배열로 직접 모의 실행해 단일 정답을 확인한다.
- 정규화 결과는 공통 유형 12개, 검수 출처 12개, 승인 변형 36개, 잠금 출처 18개다. 중복 `sourceKey`, 없는 `typeId`·생성기·렌더러 참조는 0건이다.
- 실제 문제은행에서 PC·390px·A4를 검사했다. 문제 12쪽, 양면 인쇄용 빈쪽 1쪽, 답안 10쪽으로 전체 PDF는 A4 24쪽이며 전 24쪽을 렌더해 15번 그림 잘림·화살표 회귀·16번 본문과 상세 풀이를 눈으로 확인했다.
- 17번 원문은 흰 돌이 `n²`, 검은 돌이 양쪽의 `1+2+…+(n-1)`을 합친 `n(n-1)` 구조다. 흰 돌 225개이면 15단계이므로 검은 돌은 `15×14=210`개가 맞다. 제공 강의 대본의 마지막 `212`는 바로 앞 계산과 원문 구조에 어긋나는 말실수이므로 유사문제에 사용하지 않는다.

## 이전 진행 — 2026-09-18 최종 7회 5~14번 유사문제와 공용 소스 어댑터

- 사용자 눈검수를 통과한 최종 7회 5~14번에 원문별 고정 유사문제 3개씩, 모두 30문항을 연결했다. 5·6·12번은 검수 PNG 그림을 사용하고 7~11·13·14번은 불필요한 장식 그림 없이 문제집형 본문과 풀이 공간으로 구성한다. 15번 이후는 계속 잠긴다.
- 7번은 세 숫자 순열 전수 확인, 8번은 범위의 모든 나머지 조건 수 합산, 9번은 좌표 순이동량, 10번은 서로 다른 선택 수 동적계획, 11번은 전체 좌석 수와 마지막 불완전 좌석 조건, 12번은 단계별 새 색칠 넓이의 분수 계산, 13번은 전 항 직접 생성·집계, 14번은 세 이동을 지정 횟수만큼 직접 모의 실행해 각 정답의 단일성을 독립 확인했다.
- `QUESTION-BANK-SOURCE-ADAPTER-CONTRACT.md`를 추가했다. 최종 7회 화면은 고정 데이터 파일명을 직접 가정하지 않고 등록된 `gfield-final7-reviewed` 어댑터의 기능으로 데이터를 읽는다. 기존 파이널 1·2회 export와 화면은 유지한다.
- 정규화 결과는 공통 유형 10개, 검수 출처 10개, 승인 변형 30개, 잠금 출처 20개다. 13번은 `number-and-count`, 14번은 `ordered-triple` 답 계약을 보존한다. 중복 `sourceKey`, 없는 `typeId`·생성기·렌더러, 정규화 공개 메타데이터의 공식답·개인 절대 경로 노출은 모두 0건이다.
- 실제 문제은행에서 PC·390px·A4를 검사했다. 문제는 한 문항만 남는 쪽 없이 11쪽, 답안은 실제 홀수 쪽인 13쪽에서 시작해 8쪽으로 연속 배치되며, 전체 PDF는 A4 20쪽이다. 전 20쪽을 렌더해 13·14번 본문·풀이 공간·빠른 정답·상세 풀이와 기존 도형·분수 조판을 눈으로 확인했다. 커밋·푸시·메인 배포 여부는 원격 상태와 Pages 실행을 별도로 확인해야 한다.

## 현재 진행 — 2026-09-15 온라인 중급 구매 회차 상세 분석 연결

- 온라인 회원의 상단 성적 모아보기에서 중급 모의고사 링크가 답안 입력 화면으로 열리던 원인을 고쳤다. 중급 행은 이제 `go=report`가 붙은 `상세 분석·복습문제`로 열리며, 해당 학생의 중앙 저장 기록을 읽어 바로 회차 분석을 보여 준다. 저장 기록이 정말 없을 때만 답안 입력 버튼을 안내한다.
- 온라인 회원은 자료실에서 구매한 중급 회차만 상단 성적 모아보기·회차 선택·직접 주소·누적 분석에 포함한다. 현재 `중급 모의고사` 상품에 연결된 자료실 원본은 1~4회이므로 합성 온라인 회원에게 1~4회만 보이고, 과거에 8회 기록이 남아 있어도 숨기며, 직접 입력한 8회 주소는 차단되는지 확인했다. 재원생과 교사 화면의 기존 전체 회차 동작은 유지한다.
- 중급 문항별 검수 완료 생성기는 현재 0건이므로 파이널 문제은행처럼 새 문항을 임의 생성하지 않는다. 대신 자료실에 이미 있는 회차별 리뷰 PDF와 리뷰 풀이 영상을 진단 아래 `복습 유사문제`로 연결했다. 문항별 유사문제는 별도 원문·정답·검수 절차가 끝난 뒤 추가해야 한다.
- 브라우저 검사는 합성 온라인 학생과 중앙 저장 정오표만 사용했다. 저장된 2회가 입력칸 없이 100점 상세 분석으로 열리고, 1~4회만 표시되며, 8회 직접 주소가 막히고, 390px 가로 넘침이 없고, 성적 쓰기가 0건인지 확인했다. 자료실 전체 브라우저 검사도 현재 문구와 최종 답안 정규 주소에 맞춰 다시 통과했다. 운영 학생 기록은 읽거나 쓰지 않았다.

## 현재 진행 — 2026-09-15 파이널 재응시 성적표와 인쇄 준비 복구

- 파이널 공식 1차 뒤에 저장된 2·3차 연습 기록도 관리자에서 각각 성적표로 열 수 있다. 연습 성적표는 화면·표지·백분율·예상 등급에 `2차 연습` 또는 `3차 연습`, `연습 점수 기준`을 분명히 표시하고, 공식 누적 점수는 계속 회차별 최초 기록만 사용한다.
- 학생 1차와 선생님 2차 기록이 함께 있을 때 `응시 차수별 변화`가 접힌 `details` 안에 있어 PagedJS가 내용을 누락시키고 안전 검사가 `prelude-content`로 중단하던 것이 간헐적 `인쇄 준비 실패`의 실제 원인이었다. 인쇄 복제본에서는 `details/summary`를 보통 블록으로 바꾼 뒤 조판해 내용 누락 없이 PDF를 만든다.
- 합성 파이널2의 공식 0점과 2차 연습 100점을 분리해, 연습 보고서 100점·공식 누적 평균 50점·상세 답안30문항·상세 시작 홀수 쪽을 확인했다. 실제 A4 54쪽 PDF의 표지와 누적 결과를 렌더 확인했으며 운영 학생 기록은 쓰지 않았다.

## 현재 진행 — 2026-09-15 관리자 파이널 PDF 일괄 저장

- 관리자 `모의고사 결과`에 파이널 1~4회 공식 1차 성적이 있는 학생만 모아 고르는 일괄 저장 패널을 추가했다. 학생·회차를 여러 개 선택하면 한 학생·한 회차당 `진단 분석 + 누적 결과 + 교재 연결 + 상세 답안 + 오답 유사문제와 풀이` 한 PDF를 만든다. 재응시, 리셋, O/X와 저장 점수·오답 수가 맞지 않는 기록은 대상에서 제외한다.
- Chrome·Edge에서는 폴더를 한 번 선택한 뒤 `파이널 N회/학생_파이널_N회_진단과복습.pdf`로 나누어 저장한다. 폴더 선택을 지원하지 않는 브라우저에는 같은 폴더 구조의 ZIP 저장을 제공한다. 일괄 작업은 성적·코멘트·백분율을 쓰거나 바꾸지 않는다.
- 기존 파이널 진단 인쇄 조판기와 문제은행 고정 학습지를 그대로 읽어 PDF로 묶는다. 제3자 렌더 도구는 저장소 안에 버전·라이선스와 함께 고정했다. 관리자 화면은 PC와 390px에서 선택 범위·건수·진행·개별 실패를 보여 주며, 중단하면 현재 파일 뒤에 멈춘다.
- 합성 학생의 파이널2 공식 성적 한 건으로 실제 A4 PDF 67쪽(11.5MB)을 생성했다. 표지, 교재 연결, 28번 상세 풀이, 유사문제 문제지, 유사문제 마지막 풀이를 PNG로 확인했고, 폴더/파일명 계약과 390px 가로 넘침0을 검사했다. 파이널2~4 누적·정답률, 자료실 링크10/10, 학부모 중심 진단 화면 회귀검사도 통과했다. 운영 학생 기록은 쓰지 않았다.
- 변경 파일은 `admin-final-batch.js/.css`, `admin-mock-v2.js`, `admin.html`, `qa/admin-final-batch-browser-validate.js`와 고정된 PDF 렌더 의존성이다. PR `#22`, 메인 병합 `88fe221039efcd7b63e97a69eb5046cd72a35ebe`, Pages 실행 `34952945189` 성공 뒤 운영 390px에서 일괄 저장 패널·폴더 저장·ZIP 저장 조작과 가로 넘침0을 확인했다.

## 현재 진행 — 2026-09-15 학생 상단 성적 모아보기

- 학생이 이름으로 자료실에 들어오면 상단에 `내 모의고사 성적` 배너를 표시한다. 처음에는 접혀 있으며, 펼치면 응시한 공식 첫 기록을 최근 과정 순서로 모아 `시험·점수·석차 백분율·예상 등급` 표로 보여 준다. 재응시 `@2/@3`, 리셋, 정오표와 점수가 맞지 않는 행은 제외한다.
- 파이널은 검증 근거가 붙은 회차별 백분율표와 컷, 최종은 회차별 성적 기준을 사용한다. 중급·활용처럼 승인된 석차나 컷이 없는 시험은 `자료 없음`으로 표시하며 값을 만들지 않는다. 응시 인원과 절대 등수는 표시하지 않는다.
- 각 행의 `상세 분석·유사문제`는 기존 자료실·로드맵과 같은 진단 주소를 사용한다. 파이널·최종은 공용 `GFIELD_FINAL_LAST_ROUTES` 권한과 주소를 그대로 거치며, 권한이 없으면 우회 링크를 만들지 않는다.
- 새 파일은 `student-result-hub.js/.css`, 검사는 `qa/student-result-hub-browser-validate.js`다. 합성 학생의 중급·활용·파이널·최종·시그니처 6개 첫 기록, 파이널/최종 백분율·등급, 상세 링크, 390px, 성적 쓰기0을 실제 브라우저에서 확인했다. 기존 HTML 인라인 검사, 자료실 링크10/10, 자료실·로드맵 성적표 동일 연결 검사도 통과했다.
- 학생 원본 기록과 기존 문항·정답·상세 풀이 데이터는 변경하지 않는다. 배포 완료 여부는 이 기록만으로 판단하지 않고 원격 `main`과 GitHub Pages 실행 결과를 함께 확인한다.

## 현재 진행 — 2026-09-14 학생 이름 접속을 문제은행으로 이어받기

- 학생이 자료실에 자기 이름으로 들어와 `황소 약점 유형 문제은행`이 보이는 경우, 같은 탭에서 문제지를 열 때 승인번호를 다시 입력하지 않는다. 자료실은 이미 `question-bank` 학생 권한을 확인한 뒤 버튼을 보여 주므로, 선택된 학생 이름·제품 키·발급 시각을 탭의 `sessionStorage`에 전달한다.
- 문제은행은 전달된 이름이 현재 저장된 학생 이름과 같고 12시간 안이며 여전히 `question-bank` 권한 목록에 있을 때만 자동으로 연다. 다른 이름의 전달값, URL 이름, 권한 없는 학생, 오래된 값은 자동 승인하지 않는다. 학생 화면에서 나가면 전달값을 지운다.
- 기존 관리자·교사 세션과 직접 접속 시 승인번호 입력 방식은 예비 경로로 유지한다. 실제 390px 자료실에서 학생 이름으로 들어온 뒤 중요 유형 20문항을 열어 승인 화면 없이 학생 이름과 문제지가 이어지는지 확인했고, 이름 불일치·권한 없음·직접 주소 차단도 통과했다. 배포 완료 여부는 GitHub Pages 실행과 운영 파일을 따로 확인한다.

## 현재 진행 — 2026-09-14 중요 유형 3문항 상한 해제

- 중요 유형 문제은행은 원문별 검수 고정본 3문항을 먼저 보여 주되, 이를 출력 상한으로 쓰지 않는다. 한 유형만 선택해도 선택한 4·8·20·40문항 수를 같은 세부 유형의 서로 다른 문항으로 채운다. `우기기/가정하여 풀기`는 두 원문의 고정본 6문항 뒤에 생성 문항을 보탠다.
- 교사가 지정한 15개 유형 모두에 생성 경로를 연결했다. 파이널 1회 기반 8유형은 기존 대량 검산 생성기를 재사용하고, 파이널 2회 기반 7유형은 위에서 본 모양·최단거리·묶음수열·리그와 토너먼트·동전 만들기·도형 규칙·연속수의 합 전용 생성기를 추가했다.
- 생성 문항은 `runtime-verified`로 고정 검수본과 구분한다. 정답과 독립 계산 결과가 다르면 문항을 만들지 않으며, 한 유형 40문항에서 ID·문제 조건이 모두 달라야 한다. 위에서 본 모양과 최단거리는 문제별 그림과 답안 그림 계약을 함께 확인한다.
- 실제 브라우저에서 15유형 각각 4·8·20·40문항을 모두 생성해 수량·중복·고정본 보존·정답·풀이·검산 정보를 검사했다. 40문항 기준 총 600문항을 독립 계산했으며, 위에서 본 모양·최단거리·도형 규칙의 6문제 A4 첫 장은 `E:\Codex\visualizations\2026\08\30\01a0504e-c14b-7dc1-bde5-9bfa88224ce1\important-bank-40-preview`에 있다.
- 파이널 1회 150,000개 생성 검산, 파이널 1·2회 고정 학습지, 320개 그림 생성, 카탈로그 화면, 학생 권한, 워터마크 회귀검사가 통과했다. 배포 완료 여부는 이 변경을 포함한 GitHub Pages 실행과 운영 파일을 따로 확인한다. 기존 미추적 `qa/final2-remaining-*-validate.js` 네 파일은 다른 검수 작업 파일이므로 추가·삭제하지 않는다.

## 현재 진행 — 2026-09-14 달력 힌트 제거와 대각선 도형 개수

- 날짜 이동 문제는 시작 날짜·요일과 이동 일수·방향만 제시한다. `9월은 30일까지`처럼 해당 연령에서 알아야 하는 월별 날짜 수를 문제 힌트로 덧붙이지 않는다. 내부 날짜 계산은 9월 30일을 그대로 사용하며, 독립 일일 이동 검산과 9월 날짜 수 고정 검사를 통과했다.
- 삼각형·사각형 개수 유형의 3.4점·4.2점 단계에 대각선이 실제 변으로 쓰이는 선분망 변형을 추가했다. 교차점을 포함한 꼭짓점 조합 전수 계산과 닫힌 3변·4변 순환 탐색을 각각 수행하며, 고정 그림 3종의 삼각형 수 `16·22·42`, 사각형 수 `17·26·85`가 두 방식에서 일치한다.
- 실제 브라우저 320개 생성 표본, 문제은행 권한, 중요 유형 15개, 최대 40문항, PNG 그림과 고정 시드 재현 검사가 통과했다. 날짜 문장과 대각선 그림 미리보기는 `E:\Codex\visualizations\2026\08\30\01a0504e-c14b-7dc1-bde5-9bfa88224ce1\question-bank-calendar-diagonal-preview.png`에 있다.
- 기존 미추적 `qa/final2-remaining-*-validate.js` 네 파일은 다른 검수 작업 파일이므로 추가·삭제하지 않는다.

## 현재 진행 — 2026-09-13 파이널 2회 5번 불규칙 지도와 진단 PDF 복구

- 원문 `materials/final_2/001.jpg#q5`를 다시 대조해, 별도 폐곡선 여섯 개가 겹치는 그림을 폐기했다. 현재 유사문제 3개는 구름처럼 이어진 바깥 경계 하나 안을 유럽 지도처럼 크기와 모양이 다른 여섯 나라로 나눈다. 가운데 라의 경계와 바깥 경계는 길이·방향·굽음이 서로 다른 다섯 국경선으로 연결된다. 직선 방사선·중앙점·점 접촉 조건·정답 색은 문제 그림에 없다.
- 원문 관계는 가운데 라가 둘레의 나·가·다·마·바와 모두 만나고, 둘레가 나-가-다-마-바-나의 홀수 고리를 이루는 구조로 고정했다. 둘레에 세 색이 필요하고 라에는 넷째 색이 필요하므로 최소 `4가지`다. 1색부터 전수 색칠과 실제 배정 `나·다=1, 가·마=2, 바=3, 라=4`를 모두 통과했다. 상세답안 그림과 문장도 같은 구조를 사용한다.
- 공개 고정90은 같은 비공개 검수 입력에서 다시 생성했다. Q5 세 문제 그림과 상세답안 그림을 실제 브라우저로 확인했으며, 불규칙 외곽1·서로 다른 굽은 구분선5·나라표시6·점표시0 계약을 `qa/final2-q05-cloud-browser-validate.js`로 고정했다.
- 진단 분석지 인쇄 조판기의 파이널2 고정값을 없애 파이널1~4 모두 회차를 자동 인식하도록 했다. 외부 웹 글꼴이 늦거나 실패했다는 이유만으로 PDF 저장을 막지 않으며, 각 회차 상세답안30문항을 포함하고 상세답안은 새 종이 앞면에서 시작한다. 준비 프레임 검사와 1~4회 브라우저 검사가 통과했고, 파이널2 A4 PDF54쪽을 생성해 표지·상세 첫쪽·마지막쪽을 렌더 확인했다.
- 이 수정은 아직 커밋·푸시·배포하지 않았다. 기존 미추적 `qa/final2-remaining-*-validate.js` 네 파일은 추가·삭제하지 않는다.

## 현재 진행 — 2026-09-13 문제은행 조건 반복 제거

- 일반 문제은행의 포함과 배제·나머지·반복 규칙·날짜와 요일 문항 아래에 문제 내용을 다시 옮긴 큰 조건표 그림을 제거했다. 문제의 뜻과 계산에 필요한 수·범위·요일·나머지 조건은 문제 문장에 한 번만 남긴다. 실제로 풀기 위해 필요한 도형·도로망·쌓기나무 그림은 제거하지 않는다.
- 예·아니요 나머지 문항과 파이널 1회 생성형 12·14·23번은 별도 ①②③ 조건 목록을 없애고 빠지면 안 되는 단서를 자연스러운 문제 문장으로 옮겼다. 일반 렌더러도 `conditionLines`를 문제 아래에 다시 표시하지 않는다. 이미 고정된 파이널 1회 90문항은 잠긴 수치·답·검수 해시를 바꾸지 않고, 저장된 필수 단서만 같은 문제 문장 뒤에 이어 보여 준다.
- 320개 생성 표본에서 문제에 필요한 수와 조건이 모두 남고, 계산 답과 고정 시드 결과가 같으며, 글로 충분한 문항에는 조건표 그림이 없고 도형 의존 문항에는 원래 그림이 남는지 확인했다. 파이널 1회 150,000개 변형, 파이널 1·2회 고정 학습지, 오답 유사문제, 문제은행 권한·카탈로그 검사도 통과했다.
- 학생용 중요 유형은 선생님이 지정한 15개 버튼만 공개한다. 파이널 1회 4·6·8·10·22·24·29·30번, 파이널 2회 1·12·13·15·19·22·25·30번을 연결하며, 1회 8번과 2회 1번은 `우기기/가정하여 풀기` 한 버튼으로 합친다. 따라서 버튼은 15개, 근거 원문은 16개다. 승인번호·전용 문제은행 권한 구조는 그대로 유지한다.
- 중요 유형을 섞어 만드는 일반 문제지는 4·8·20·40문항 중 고를 수 있고 한 번에 최대 40문항까지 만든다. 원문별 검수 고정본은 원문 한 문제당 3문항 원칙을 유지하고, 합친 우기기 버튼만 두 원문의 6문항을 제공한다. 파이널 1회 4번 고정본 3개는 두 자리 수×두 자리 수, 세 자리 수×두 자리 수, 세 자리 수×세 자리 수를 하나씩 포함한다.
- 목표 점수 진단에는 목표 석차 백분율과 그 점수의 학습 레벨을 함께 표시한다. 예를 들어 32.9점에서 2.7점 문항 세 개를 되찾아 41점이 되면 `38.7% → 19.4%`, `복습 목표 기준 19.4% · 심화 가능`으로 보이며 다음 시험을 예측하는 값은 아니라고 함께 안내한다. 승인된 누적 통계를 불러오지 못한 경우 백분율이나 레벨을 임의로 만들지 않는다.
- 이 항목의 변경은 아직 커밋·푸시·배포하지 않았다. 기존 미추적 `qa/final2-remaining-*-validate.js` 네 파일은 추가·삭제하지 않는다.

## 현재 진행 — 2026-09-13 문제은행 학생 권한

- 관리자 콘솔 자료실 탭에 `황소 약점 유형 문제은행` 전용 학생 권한표를 추가했다. 권한 키는 `archiveProductAccess['question-bank']`이며 기존 `약점 유형` 허용 학생을 초기값으로 옮겨 현재 이용 학생이 갑자기 차단되지 않게 했다.
- `bank/index.html`과 `bank/catalog.html`은 이제 승인번호로 만든 Supabase 세션을 확인한다. RLS가 적용된 `hs_accounts` 자기 행에서 활성 여부·역할·학생 이름을 읽고, 서버에서 확인한 학생 이름이 전용 권한표에 있을 때만 문제지와 유형 목록을 만든다. URL·해시·로컬 이름은 권한 근거로 쓰지 않는다. 관리자·교사 계정은 정상 접근한다.
- 세션 없음, 비활성 계정, 권한 없는 학생, 계정 조회 실패는 모두 닫힌 상태로 남는다. 직접 주소에서도 승인번호 입력 화면을 보여 주며, 권한 전에는 파이널 고정 문항 데이터를 요청하거나 문제를 렌더하지 않는다. 기존 로컬 QA는 로컬 호스트에서만 검수 신원으로 우회하고 운영 호스트에는 적용되지 않는다.
- `qa/bank-access-validate.js`와 `qa/bank-access-browser-validate.js`에서 전용 키·관리자 표·RLS 자기계정 조회·직접 링크 차단·URL 이름 변조 차단·허용 학생 90문항·카탈로그 권한을 확인한다. 기존 파이널1·2 학습지, 오답 유사문제, 카탈로그 검사도 통과했다.
- GitHub Pages의 정적 파일 자체를 비공개 저장소처럼 숨기는 구조는 아니다. 이번 권한은 운영 화면과 데이터 요청 순서를 승인 세션에 묶는 애플리케이션 접근 제어다. 원본 파일 자체의 비공개 전송이 필요하면 문항 데이터를 별도 인증 API/비공개 저장소로 옮기는 후속 구조가 필요하다.

## 현재 진행 — 2026-09-13 컬러·3D 전달서 공용 기준 반영

- 사용자 지정 `HSELEMENTARY-COLOR-3D-HANDOFF-20260913.md`와 관련 설계를 읽고 공용 기준본 `GFIELD_QUESTION_BANK_PRODUCTION_STANDARD_20260913.md`를 v1.7로 보강했다. 같은 모델로 문제·풀이·인쇄를 만드는 기준, 허용하지 않은 회전·분해의 답 노출 차단, 컬러/명암·흑백 동등성, 고정 인쇄 시점과 그림 답안 검수를 포함한다.
- 초등 심화의 실제3D·최대40문항·5-1 단원 과제와 파이널의 정확한2D·고정3문항 프로필을 분리했다. 원뿔 물은 정확한 원문ID 확인 전 제작하지 않는다. 원 전달서·Geometry/초등 코드·문항·학생 기록은 변경하지 않았다.
- 이번은 문서 정리다. 컬러·3D 구현, 전 문항 재승인, 커밋·푸시·배포는 하지 않았다. 기존 작업트리 변경은 그대로 보존한다.

## 현재 진행 — 2026-09-13 공용 문제은행 제작 기준 v1.4

- 사용자 지정 기준본 `C:\Users\user\OneDrive\그림\Desktop\GFIELD_QUESTION_BANK_PRODUCTION_STANDARD_20260913.md`를 v1.2에서 v1.4로 보강했다. 기존 기호·수식·DB·변경 중심 검수 구조는 유지하고, 원문/유사문제의 사고·난이도 9개 차원, 복수 정답 기준, 강의 기반 그림 풀이, 현재 버전의 실재하는 검수 근거를 추가했다.
- 공용 UX를 본문에 포함했다. 연령별 글자 크기·1단/2단, 검색·선택·미리보기·성적표 이동·실패 상태, 시험별 4문항/파이널6문항 프로필을 구분한다. 답안에는 풀이용 빈 공간을 두지 않고 필요한 가독성 간격만 유지한다. 답안 묶음은 실제 홀수 쪽에 시작하고 이후 연속하며 답안만은1쪽이다.
- `QUESTION-BANK-QUALITY-STANDARD.md`는 기준본을 중복 복제하지 않는 저장소 연결·적용 문서다. AGENTS.md와 DESIGN.md에서 필수 읽기로 연결했다. 생수60문항 계획은 그 작업 프로필이며 황소로 자동 전파하지 않는다.
- 이번은 문서 수정이다. 프로그램·문항 데이터·정답·학생 성적·고정 통계는 수정하지 않았다. 기존 dirty/staged 변경과 미추적 검수 파일은 보존한다. 커밋·푸시·배포는 하지 않았다.
- 독립 코드 검토에서 일부 visibleEvidence가 삭제된 조건줄을 계속 인용하는 사실을 확인해 후속 점검으로 기록했다. 현재 수량·해시·일부 유형 재계산 검사만으로 원문/난이도·전 문항 수학·화면/PDF 전체 검수를 새로 통과했다고 하지 않는다.

## 현재 진행 — 2026-09-12 파이널 2회 23·27·28번 시각 풀이 보강

- 제공된 필기를 기준으로 원시험 23번에 탐험가·도우미 둘의 이동 수직선과 식량 분배, 27번에 8통화의 소식 공유와 전체 소식을 아는 사람 수, 28번에 반복 도로 AG·CH·EI와 실제 21구간 순회를 연결했다. 원래 문제·정답·기존 교육 문장은 바꾸지 않았다. 23번 2명, 27번 8번, 28번 216을 별도 계산과 상태 탐색으로 확인했다.
- 등록 도식은 7개에서 9개로 늘었다. Q23/Q27은 각각 SVG 1개, Q28은 같은 figure 안에 도로망과 돌아오는 순서 SVG 2개다. 과거 23문항 교육 내용 잠금은 유지하고 새 diagram binding/렌더는 `final2-original-visual-amendment-20260912`로 분리해 검증한다.
- 28번 유사문제 3개의 문제 그림은 그대로 두고 답안 전용 설명 그림을 추가했다. 같은 좌표·18개 도로·거리값에서 AG·CH·EI만 굵은 점선으로 표시하며 세 번째 단계 뒤에 배치한다. 정답은 각각 219, 212, 195로 유지한다. 학생용 해설은 도로 합, 홀수 개 길의 짝, 다시 지날 세 길, 더 짧게 갈 수 없는 이유, 실제 순서, 합계의 여섯 단계다. 여섯 지점의 최소 추가 길이를 양 끝에서 세고 2로 나누는 하한과 실제 순회를 별도로 검산했다.
- 설명 그림은 답안에서만 보이며 문제·빠른 정답에는 나오지 않는다. 고정 90문항의 문제·정답과 워터마크를 유지했다. 유사문제 전체 인쇄는 39쪽(표지1·문제15·답안23)이며 세 Q28 답안 페이지를 실제 PNG로 확인했다.
- 검수 산출물: `E:\Codex\visualizations\final2-visual-solutions-20260912`. 원시험 상세 답안은 합성 출력 38쪽, 진단 패키지는 56쪽이다. Q28의 큰 도식이 통째로 밀리며 빈칸을 만들던 현상은 원시험 인쇄 전용 폭100mm로 해결했고 제목과 두 도식이 같은 첫쪽, 계산은 다음쪽에 이어진다. 화면1280/390·SVG 글자 범위·전체 설명 보존·기존 파이널1 학습지·파이널2~4/최종1 통합·학생 데이터 쓰기0을 확인한다.
- 커밋·푸시·배포는 하지 않는다. 이전 학부모 중심 리포트 및 유사문제 변경과 미추적 검수 파일 네 개를 그대로 보존한다.

## 현재 진행 — 2026-09-12 학부모 중심 파이널 진단 화면

- 사용자 요청대로 설계는 Astra, 구현은 Sol로 분리했고 Astra의 독립 검토 후 루트에서 계산·브라우저·인쇄 회귀검사를 수행했다. 설계 기준은 `PARENT-REPORT-DESIGN.md`, 공용 표시 모델은 `final-parent-report.js`, 스타일은 `final-parent-report.css`다.
- 화면 왼쪽에 성적 요약/강점과 보완점/배점대별 결과/문항별 진단/오답 복습/교재 연결/상세 답안 7개 색인을 추가했다. 390px에서는 가로 이동 색인으로 바뀐다. 긴 기준·기록·자동 설명은 접고 교사 코멘트와 개인 단계별 학습 계획은 바로 보이도록 유지했다.
- 파이널 2회부터 이번 회차와 1~현재 조회 회차의 누적 결과를 나란히 표시한다. 점수는 최초 응시 회차 평균, 석차는 유효한 회차별 백분율 평균이며 각각의 반영 회차를 따로 보여 준다. 미래 회차·재응시는 새 누적 요약에서 제외하고, 미등록은 0으로 채우지 않는다. 기존 최종 모의고사의 전체 파이널 누적 계산은 변경하지 않았다.
- 영역·배점대 누적 득점률은 실제 득점 합/배점 합이다. 이번/누적의 강점·보완점을 각각 표시하고, 승인된 canonical 세부 유형의 서로 다른 회차 오답만 반복 약점으로 묶는다. 우선 복습은 기존 추천 순위를 보존하며 화면에 나온 최대 3문항의 배점만 목표 점수에 더한다. 문항 정답률과 응시인원 비공개 원칙을 유지했다.
- 합성 학생으로 parent model/browser, final report UI/package/print, final234 integration 검사가 모두 통과했다. 파이널 1회·누락 회차·재응시·통계 읽기 실패·최종1 기존 누적·교사 코멘트·문항 정답률30개·외부 쓰기0을 확인했다. 파이널2 인쇄 준비 검사에서 상세30문항, 표9개, 상세 시작 앞면(17쪽), 긴 코멘트 잘림 없음을 확인했다.
- 검수 산출물은 `E:\Codex\visualizations\parent-final-report-20260912`에 있다. desktop1280/mobile390 화면과 native PDF를 생성했다. native PDF 54쪽에서 접힌 컷 기준·회차 기록·약점·교재 연결·상세 답안 텍스트 포함을 확인하고 변경된 진단 앞부분을 PNG로 확인했다. 상세 답안 전체의 신규 수학 검수나 전 페이지 재검수를 수행했다는 뜻은 아니다. 기본 인쇄 전에는 details를 펼치고 종료 후 원래 상태로 복구하며, Final2 준비 프레임도 details를 펼친 복제본을 사용한다.
- 커밋·푸시·배포는 사용자의 앞선 `잠깐` 지시 이후 여전히 보류다. 다른 유사문제의 기존 staged/unstaged 변경과 미추적 QA 네 파일을 보존했다. 이 변경을 운영 반영 완료로 보고하지 않는다.

## 현재 진행 - 2026-09-12 파이널 2회 고정 유사문제 90문항

- 문제 아래에 붙던 ①②③ 형식의 조건 요약·지문 반복·풀이 도움말을 공개 90문항에서 모두 제거했다. 문제에 없으면 뜻이 달라지는 6번의 한 자리 수 제외와 8번의 전자저울 조건은 자연스러운 지문으로 옮겼다. 5번에는 원문에 없는 점 접촉 조건을 넣지 않는다. 15번 수 묶음과 19번 경기 방법은 문제 자체의 필수 자료이므로 번호형 도움말이 아닌 `주어진 수 묶음`·`경기 방법` 자료로만 남겼다. 이 원칙은 저장소 `AGENTS.md`, `DESIGN.md`와 공용 `gfield-design-system/references/question-bank-ui.md` 최상단에 고정했다.
- 새 인쇄 검수본은 `E:\Codex\visualizations\final2-fixed90-review-20260912-cleanprompt\final2-fixed90-both.pdf`이며 SHA-256은 `442638FDC6FFCC6177FBB00DA65A613239732CB18041BF4B40B23AA02773ACAD`이다. A4 37쪽(표지1, 문제15, 답안21)을 전부 PNG로 렌더했다. 25·29·30번을 포함한 모든 문제에서 중복 설명 목록이 사라지고, 15·19번 자료와 6문제 동일 칸·답칸·워터마크가 유지됨을 확인했다.
- 파이널 2회 1-30번마다 서로 다른 유사문제 3개씩, 총 90문항을 비공개 초안에서 독립 검산했다. 세 묶음 검수기는 모두 통과하며 공개용 `bank/data/final2-fixed90.json`과 검색 색인 90개를 같은 입력에서 반복 생성해 SHA-256이 변하지 않음을 확인했다.
- 실제 계산 오류 한 건을 고쳤다. `final2-q13-v3`은 격자 도로를 다시 전수 탐색하면 A-B 3가지, B-D 5가지이므로 정답은 **15가지**다. 문제, 정답, 세 단계 풀이, 검산 기록, 그림 모델을 모두 15가지로 맞췄다.
- 5번 지도 색칠의 직선 분할·중앙점·점 접촉 모델은 2026-09-13 원문 재대조로 폐기했다. 현재는 원문처럼 굽은 폐곡선으로 표시된 나라들의 만남 관계와 실제 네 색 배정을 전수 검사하며, 세 변형 모두 최소 4색을 통과한다.
- 공개 변환 중 비어 있던 세부유형 이름을 `studentDisplayName`에서 읽도록 고쳤다. 공개 파일은 30유형 x 3문항, 상세 풀이 3-5단계, 문제 그림 PNG 27개, 답 그림 PNG 3개이며 원본 지문·상세답안·학생 성적·정답률은 변경하지 않았다.
- 파이널 1회 학습지 틀을 회차 안전하게 공용화했다. 파이널 2회도 전체/2.7/3.4/4.2점, 문제만/답안·풀이만/둘 다/빠른 정답, 6문제씩 같은 칸, 표지 자기 점검, 홀수 면 뒤 답안 새 앞면, 전 페이지 워터마크를 사용한다. 파이널 3회 이후에는 지원하지 않는 `bank` 값을 붙이지 않는다.
- 문제은행 목록은 파이널 1회와 2회의 색인을 각각 읽고, 파이널 2회 30개 유형 카드에서 해당 원문 3문제로 연결한다. 1280px와 390px에서 카드 30개, 링크 30개, 가로 넘침 0을 확인했다.
- 전체 출력 검수 파일은 `E:\Codex\visualizations\final2-fixed90-review-20260912\final2-fixed90-both.pdf`다. 문항마다 답안 크기를 고정하던 방식을 없애고 실제 풀이 길이대로 채워 넣어 A4 37쪽(표지1, 문제15, 답안21)으로 줄였다. 37쪽 전체를 PNG로 렌더해 글자, 그림, 워터마크, 쪽 넘김을 확인했다. 16번은 문제 글에 있는 조각 개수를 그림 아래 `×2`, `×10`으로 반복하지 않고 모양을 한 번씩만 보여 준다. 28번은 도로망, 거리 숫자, 마을 글자와 문제 글자를 함께 키웠으며 답칸 안에 잘림 없이 들어간다.
- 파이널 2회 전용 수학·고정 해시·화면·오답 버튼·인쇄·모바일 검사와 기존 파이널 1회 학습지, 분류, 문제은행 목록 회귀검사가 통과했다. 시간 초과했던 넓은 범위의 성적표 두 검사는 예전 `last1-result` 화면과 공식 성적표 문구를 찾고 있었던 검사 자체의 노후화였다. 현재 통합 성적표 기준으로 갱신한 뒤 파이널1-4+최종1 누적, 개인 성적표, 오답 유사문제, 외부 쓰기0으로 모두 통과했다.
- **아직 커밋·푸시·배포하지 않았다.** 로컬의 기존 `qa/final2-remaining-*-validate.js` 네 파일은 다른 검수 작업 파일이므로 추가·삭제하지 않는다.

## 현재 진행 — 2026-09-11 파이널 4회 상세 풀이

- 자료실의 파이널 4회 원본 6쪽과 2026-07-29에 이미 등록된 필기·텍스트 답안 원장을 다시 한 회차로 대조했다. 빈칸처럼 보인 자료실 이미지만 근거로 답을 지웠던 판단을 철회하고 1–30번 전체를 `final4-detailed-data.js`에 연결했다.
- 21번은 `합이 10이 되도록` 뒤의 조사 ‘이’를 숫자0으로 오독한 것이고, 27번은 `8450이며` 뒤의 조사 ‘이며’를 숫자0으로 오독한 것이었다. 원자료 오류가 아니므로 21번 `12장`, 27번 `4250`을 복원하고 학생 풀이에 읽기 주의를 명시했다. 9·11·12·16번도 먼저 제공된 필기·텍스트 답안 조건을 사용해 복원했다.
- 독립 계산으로 실제 답이 달랐던 세 문항은 보정을 유지한다. 17번은 터널 **450m**, 24번은 예정10일보다 **14일** 늦음, 26번은 `241×83=20003`이다. 3번은 12시간에 직각22번, 4번은 원문에 없는 중간 음수 금지 조건 제거, 10번은 12자리 곱의 8이11개로 설명한다.
- 검수 원장은 `qa/final4-detailed-review.json` schema2이며 화면 계약은 상세30/대기0이다. `qa/final4-detailed-data-validate.js`, `qa/final234-report-integration-validate.js`, 자료실·로드맵 동일 회차 연결, 390px·인쇄·외부 쓰기0을 함께 검사한다.
- 다음 순서는 파이널4 전체 테스트와 실제 배포 확인 뒤, 자료실과 로드맵이 공유하는 다음 미완료 회차의 상세 풀이를 같은 방식으로 이어가는 것이다.

## 최신 완료 — 2026-09-09 파이널 3회 상세 풀이 30문항

- 작업 폴더는 `E:\Codex\worktrees\hs-final-last-links-20260909`다. 파이널 3회 상세 풀이는 1–30번 전체를 공개 데이터에 연결했고, 준비 중 문항은 0개다. 기존 canonical 정답, 학생 성적·코멘트·통계, 원본 파일은 변경하지 않았다.
- 16–30번은 읽을 조건, 풀이 전략, 단계별 계산·표·도식, 검산, 주의할 점을 모두 갖춘다. 17·18·19·24·25·26·30번은 전용 도식을 쓴다. 24번은 여덟 기호 전체 답을 표시하고, 30번은 선분을 공유하는 실제 이웃 42쌍과 네 색 가능 배정을 함께 증명한다.
- 30번의 과거 41쌍 그래프는 점 접촉 세 쌍을 잘못 이웃으로 넣고 짧은 공유변 네 쌍을 빠뜨린 결과였다. 새 독립 판정은 지역20개·공유변42쌍·3색 불가·4색 가능이며 정답 `4색`을 유지한다. 기존 동결 기록은 덮어쓰지 않고 비공개 amendment로 대체 근거를 남겼다.
- 최종 브라우저·인쇄 검수 경로는 `E:\Codex\visualizations\final3-all30-integration-review-20260909-v10`이다. 1280px/390px에서 상세30·준비0·도식14·표30과 외부 쓰기0을 확인했다. 16번 표는 A4 한 장에 맞췄고, 24번은 도식 한 장 뒤 계산 풀이가 바로 이어지며 빈 장을 만들지 않는다. 워터마크와 전체 기호 답도 보존한다.
- 회귀검사는 파이널2·3·4 누적 진단, 고정 문항 정답률, 교사 코멘트, 성적표 인쇄 묶음, 문제은행840문항과 카탈로그를 함께 통과했다. 합성 학생만 사용했고 운영 학생 기록은 쓰지 않았다.
- 공개 커밋에는 `final3-backhalf-solution-diagrams.js`와 파이널3 상세 데이터·렌더·QA 관련 파일만 포함한다. 로컬의 `qa/final2-remaining-*-validate.js` 네 파일은 다른 작업의 미추적 검수 도구이므로 추가·삭제하지 않는다.

## 현재 진행 지시 — 2026-09-09 연속 작업

- 사용자는 예약 대기가 아니라 현재 작업을 계속하라고 정정했다. 1시간 간격 후속 실행 `automation-5`는 **PAUSED**로 변경 확인했다. 예약 실행을 기다리지 않는다.
- 현재 확인한 프런트 배포는 `a5e390340bdba0c9d0c56bceab1d33983cf95888`다. main 푸시와 Pages 실행 `34311645178` 성공 뒤 실서비스에서 파이널2 인쇄 모듈·교재 연결5문항/8학습위치·파이널3 상세15문항 자산을 확인했다. 실서비스 합성 응답으로 파이널2·3·4 누적, 문항 정답률30개, 통계 읽기 실패 경계와 외부 쓰기0도 다시 검사했다. 실제 학생 기록은 수정하지 않았다.
- 현재 전체 30문항을 통합했다. 당시 5번은 중앙점 해석으로 정리했으나, 이 해석은 2026-09-13 원문 확대 재검수에서 폐기했다. 최신 기준은 맨 위의 `파이널 2회 5번 원문형 지도 복원` 항목이다. 16번은 가운데 칸을 피하는 조각을 고정하고 둘째 조각의 여섯 배치를 직접 적어 네 묶음으로 정리했다. 과거 후보·해석 검토 이력은 비공개로 보존한다.
- 전체30 실제 출력 검수 경로는 `E:\Codex\visualizations\final2-complete30-review-20260909`다. 상세36쪽/진단·교재 연결·상세 답안 패키지50쪽이며, 5·9·13·16·27·28번에 계속 제목을 둔다. 829개 교육 필드가 두 출력 방식에서 모두 자기 문항 아래에 보존된다. Q5/Q16 새 내용의 390px/A4, 7개 도식의 문자 범위, 모든 내용 쪽 워터마크, 기존23 풀이와 원본·정답·통계·학생 데이터 보존을 확인했다. 최종 독립 승인과 공개 상태는 `qa/final2-detailed-review.json`을 따른다.
- 다음 실제 미완료 범위는 Final2 나머지25문항의 교재 연결 보완, Final3 16–30번과 이후·최종 회차의 상세 풀이 확장이다. Final2 상세30·분류30과 Final3 상세15 통합을 전체 과정 완료로 간주하지 않는다. 후속 구현 경계는 비공개 작업 폴더에 있으며 승인 전 다른 회차로 자동 전파하지 않는다.
- 후속 작성은 멈추지 않고 진행한다. Final2 분류30은 4번 소영역 교정과 6개 새 소영역을 포함해 독립 검수·공개 연결을 마쳤다. 전체840문항과 Final2 외810문항 보존, 표시명 변경에도 누적 식별자 유지, 미승인·중복·타회차 전파 차단 검사를 통과했다. 교재 연결은 별도 검수이므로 현재 승인된 다섯 문항 밖으로 자동 확대하지 않는다.
- Final3 1–15번은 독립 계산과 네 문항 보정을 포함한 내용 검수를 마쳤다. 6번 바깥 반원 설명, 8번 누적값을 읽는 방향, 12번 최소 개수의 근거, 13번 시작 칸 ‘별’ 표기를 바로잡았다. 8번 숫자 가림과 13번 육각형 방향·공유변 결함도 수정·독립 재검수했다. 8번 검산은 14+28=42, 90+42=132를 표에서 직접 확인하는 학생 문장으로 바꿨다. 최신 로컬 통합 검수 v5는 `E:\Codex\visualizations\final3-front15-integration-review-20260909-v5`이며 일반 성적표와 미리보기 모두 공개15/30, 준비 중15/30이다. 상세24쪽/패키지38쪽, 15문항400필드가 자기 문항 안에 보존되고 390px/1280px와 그림7종을 검사했다. 뒤15문항은 아직 인쇄하지 않는다.
- **Final3 28번 원자료 모순 판단은 철회한다.** 부모와 재검수자가 `materials/final_3/006.jpg`를 다시 직접 읽어 세 번째 조건은 “합에 4배를 하면 48이 됩니다.”임을 확인했다. 숫자48 뒤 조사 ‘이’를 0으로 오독한 오류이며 원자료를 고칠 일이 아니다. 서로 다른 사탕 수는4와8, 배수는12와6이므로 묻는 곱은72다. 사용자에게 앞선 모순 가능성 질문을 정정했고 별도 자료를 요청하지 않는다. 이전 동결 감사 기록은 삭제·수정하지 않고 새 amendment로 대체 사유를 남긴다. 원자료·canonical·학생 기록은 변경하지 않는다. 정정된 상세 풀이의 작성·독립 검수·렌더 확인은 별개로 수행한다.
- Final3 25번의 새 재검수 초안10은 원자료의 “카드가 여러장이 있습니다”를 놓치고 각 숫자를 한 번만 쓰는 조건을 임의 추가한 오독이었다. 반복 사용과 배열 순서를 반영한 재판독은19가지이며 기존 저자·검산 결과와 일치한다. 새 amendment 검증기 동결을 확인한 뒤만 채택한다. 뒤15문항의 네 문장 보정과 여섯 문항 재검수를 진행 중이며 공개하지 않는다.
- Final2 분류30과 네 문항의 학생 표현 보정은 독립 검수 뒤 레지스트리·표시 화면·390px 검사를 마쳤다. 4번 소영역을 바로잡고 여섯 새 소영역을 정확한 문항에만 적용했다. 교재 연결이나 다른 회차 동일 유형 승인과는 다르다.
- Final2 분류30/새 소영역6은 로컬 레지스트리·카탈로그에 연결했고 다른810문항과 누적 식별자 보존, 390px/1280px 표시 검사를 통과했다. 교재 연결은 정확 문항 결합과 독립 검수를 거친 9·16·19·25·28번만 `먼저 익힐 내용`으로 연다. 총8개 학습 위치를 표시하며 한 문항의 복수 교재 위치도 보존한다. 미검수 키워드 연결과 중복 책 항목은 차단한다. 분류 승인과 교재 동일 유형 승인을 혼동하지 않는다.
- 파이널2 인쇄 묶음은 오답0/1/15/30개·긴 코멘트의 다섯 고정 입력 v7에서 모두 답안이 홀수 쪽에서 시작한다. 각 상세36쪽과829개 교육 필드를 보존했고, 진단 제목과 교재 연결 문단이 쪽 경계에서 사라지던 문제를 바로잡았다. Final2 전용 격리 인쇄 프레임을 실제 인쇄 단추에 연결했으며 폰트·이미지 준비, 실패·재시도·취소·중복 클릭, 화면·세션·주소·성적 무변경을 검사했다. 다른 회차의 기존 인쇄 동작은 바꾸지 않는다.

## 최신 이어받기 — 2026-09-09 파이널 2회 상세 풀이 23문항

- 작업 폴더: `E:\Codex\worktrees\hs-final-last-links-20260909`, 기준 커밋 `e089b77`. 이번 범위는 기존 상세 풀이 12문항에 독립 검수한 11문항을 더하는 것이다. 학생 성적·답안·개인 코멘트, 고정 정답률·컷·회차별 첫 응시 누적 기준, 원본 이미지와 기존 12문항의 교육 내용은 변경하지 않는다.
- 현재 상세 풀이 제공 집합: **1, 3, 4, 6, 7, 8, 10, 11, 12, 15, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30**. 나머지 **2, 5, 9, 13, 14, 16, 17**은 이번 공개 집합에 포함하지 않는다.
- 27번은 8통화 구성과 7통화가 불가능한 이유를 함께 설명한다. 28번은 도로 18개의 합 201에 최소 중복 15를 더해 **216**이다. 필기의 316을 그대로 사용하지 않는다. 24번은 남는 곱 24·36·54가 불가능한 까닭, 30번은 13개 최소합 91을 먼저 확인하는 설명을 보강했다.
- 독립 승인 기록은 `qa/final2-detailed-review.json`이며 `published:false`는 배포 상태를 나타내는 필드가 아니다. 실제 커밋·원격·Pages 상태는 재개 시 다시 확인한다. 비공개 초안·검수 해시·필기 이미지·학생 정보는 Git에 포함하지 않는다.
- 합성 학생으로 PC/390px 및 인쇄를 검사했다. 상세 풀이 23문항은 25쪽, 진단지·교재 연결표·상세 답안 묶음은 39쪽이다. 27·28번은 각각 두 쪽을 사용하고 이어지는 쪽에 문항 번호를 표시한다. 본문 9.5pt를 유지하며 전체 내용 페이지에 워터마크를 둔다. 모바일 표는 마지막 열까지 표시한다. 이는 합성 검수이며 실제 학생 기록을 저장한 검사가 아니다.
- 다음 작업: 비공개 `.private-work/final2-remaining/independent-review.json`의 최신 승인과 후보 해시를 확인하고 남은 7문항을 이어간다. 2·9·13·16번은 읽기 쉬운 실제 도식 연결 및 화면/A4 검수까지 필요하다. 14·17번의 문장 검수 완료 여부도 최신 기록에서 확인한다. 이 과거 항목의 5번 점 접촉 계약은 2026-09-13 원문 확대 재검수로 폐기했으며, 최신 기준은 굽은 폐곡선의 실제 만남 관계와 기존 정답 4가지다.
- 비공개 초안을 읽는 `qa/final2-remaining-a-math-validate.js`, `qa/final2-remaining-b-math-validate.js`, `qa/final2-remaining-q13-math-validate.js`, `qa/final2-remaining-independent-validate.js`는 로컬 검수 도구로 보존하고 이번 공개 커밋에서는 제외한다. 공개 체크아웃의 수학 검산은 `qa/final2-detail-math-validate.js`와 `qa/final2-detail-projection-validate.js`를 사용한다.
- 상세 풀이 승인과 유형·교재 연결 완성은 별개다. 이번 합성 패키지의 일부 진단/교재 표에는 `유형 확인 중`·`분류 확인 중`이 남아 있으므로 전체 연결 완료라고 보고하지 않는다. 후속 작업에서 실제 연결 근거를 확인해 보완한다.
- 원본 이미지와 필기 재편집본의 쪽 배치가 다르다. **18번의 원본 위치는 `materials/final_2/003.jpg#q18`**이며, 원본 004쪽은 19번부터 시작한다. 필기 페이지 번호를 원본 위치로 대입하지 않는다.
- 당시 등록했던 1시간 간격 후속 실행은 이후 사용자의 정정으로 중지했다. 최신 상태는 이 문서 맨 위의 연속 작업 절을 따른다. 완료된 작업을 반복하지 말고 실제 파일에서 계속 이어간다. 검수와 기존 권한·보존 경계는 계속 지킨다. 이 절은 모든 파이널·최종 회차의 상세 풀이 완료를 의미하지 않는다.

## 최신 통합 — 2026-09-09 파이널 회차별 누적 기준과 2회 상세 풀이

- 이번 변경은 `915958b`의 자료실/로드맵 동일 개인 성적표 연결을 유지한다. 다른 작업 폴더의 미커밋 변경과 학생 원본 데이터는 수정하지 않았다.
- 제공된 2024 회차별 답안 시트에서 Final 2–4의 기록을 각각 읽었다. 독립 OOXML 검산으로 전체 선택 행·30개 O/X·원점수·원본 불변을 확인했다. 평균은 순서대로 28.4 / 28.0 / 25.2이며 문항 정답률은 고정 기준이다. 기존 컷 점수는 유지한다. 수동 요약표나 임의 0점 패딩을 통계 원본으로 쓰지 않는다.
- 비공개 추출 후보는 `approved:false` 유지. 검수된 별도 서버 복사본만 승인했으며 Git 제외 대상이다. 원본 경로·지문·행·응시인원은 공개 응답에 넣지 않는다.
- 서버 `hs-final-population` v3 배포 및 `extend_final_report_reference_rounds_1_to_4` 제약 확장 완료. 실제 배포 파일 7개 일치, JWT 유지, 익명 호출 401, 직접 테이블 조회 권한 차단을 확인했다. Final1 비공개 기준은 변경하지 않았다. 학생 성적·코멘트·스냅샷 일괄 반영은 실행하지 않았다.
- Final1–4 성적표는 저장된 각 회차의 첫 기록만 누적한다. 재응시는 연습으로 분리한다. 최종1회는 Final1–4와 최종1회의 첫 기록을 함께 읽는다. 최종2회 이후의 기존 누적 범위/컷은 변경하지 않는다. 통계 조회 실패 시 추측 백분율을 표시하지 않고, 문항 정답률은 유지한다.
- 관리자 백분율 반영은 Final1–4 중 선택한 한 회차만 대상으로 한다. 성적표 표시 검사는 가상 학생과 차단된 외부 요청으로 수행하며 실제 학생 스냅샷을 덮어쓰지 않는다.
- Final2 상세 풀이 독립 검수 완료 문항: 1, 3, 4, 6, 7, 8, 10, 11, 12, 15, 25, 26. 읽을 조건 → 풀이 전략 → 단계별 계산/표/그림 → 검산 → 주의할 점을 제공한다. 기존 답안 공개 조건은 유지한다.
- 중요: 7번 정답은 **199번째**다. 인수 2가 397개이므로 198번까지 4로 나누어지고 다음 차례에 첫 나머지가 생긴다. 필기의 200번째를 따라 쓰지 않는다. 15번의 211은 가운데 수이며 세 수의 합은 **422**다. 8번은 은화가 **20개씩 든 다발**이지 20원짜리 은화가 아니다.
- A4 합성 검수: 상세 풀이만 12쪽, 진단/교재 연결/상세 풀이 패키지 26쪽. 검수된 풀이 한 문항당 한 페이지, 전 페이지 워터마크, 준비 중 문항 인쇄 제외, 390px/1280px 화면 및 12번 투영 그림 확인. `qa/final2-detail-pdf-validate.py`로 각 페이지의 정답·조건·검산·주의점 보존을 검사한다.
- **미완료:** Final2 나머지 18문항, Final3 이후와 최종 회차 전체의 Final1 수준 상세 풀이 확장. 이번 12문항 승인은 전체 회차 풀이 완료를 의미하지 않는다. 로그인한 실제 학생 세션의 운영 검증과 프런트 배포 완료는 별도로 확인해야 한다. 이 기록 작성 시점에는 프런트 커밋/푸시 전이다.


## 최우선 현재 작업 — 2026-09-06 지필드 공용 UX와 파이널 학습지 개편

- 실제 작업 폴더는 계속 `E:\Codex\worktrees\hs-report-mock-item-access-20260904`다. 아래 고정90 배포 완료 기록은 개편 전 `0971ecd` 기준이며 최신 수정의 배포 완료를 뜻하지 않는다.
- 공용 디자인 스킬 `E:\Codex\skills\gfield-design-system`을 새로 만들고 검증했다. 상세 규칙은 `references/design-rules.md`, 토큰은 `assets/gfield-tokens.css`. GitHub `anthropics/skills`의 frontend-design을 커밋 `41bbe19d1a1a7eaab5e7bb9050a417e5c6cffc8f`로 고정해 `E:\Codex\skills\frontend-design`에 설치했다. 공용 스킬은 로컬 공용 파일이며 이 저장소 Git에 포함되지 않는다.
- `DESIGN.md`에 이 저장소 적용 범위를 기록했다. 주황 버튼·누런 표지는 기본값으로 쓰지 않는다. 흰 종이, 중성 회색, 짙은 글자, 절제된 파랑 행동 버튼. 다른 프로젝트 일괄 수정/배포는 하지 않았다. 매쓰플랫과 캐츠의 공개 안내만 참고했으며 회원 전용 동작을 검증했다고 주장하지 않는다.
- `bank/final1-worksheet.js/.css`는 고정은행 전용 학생 시험지다. 전체/2점대/3점대/4점대, 문제만/답안·풀이만/둘다/빠른정답만. 표지에 학생 이름, 원문 번호별 두 열 유형 목록과 셀프 체크. 체크는 메모리상 표시만이며 성적·진도에 저장하지 않는다.
- 문제는 2단×3행, 6문항 고정, 동일 행 높이/위쪽 정렬. `bank-fixed.js`는 변형 번호를 먼저 순회하여 유형 사이에 섞는다. 문제 본체를 새로 생성하거나 바꾸지 않는다. `final.html`에서 전체 실제 오답 범위를 전달하고 선택 배점은 그 안에서만 바뀐다. 이름은 표시용 fragment이며 권한이 아니다.
- 인쇄 준비는 폰트/PNG decode까지 기다리고 잘못된 범위·미검수·잘못된 PNG는 인쇄를 차단한다. 동시 배점 변경은 revision으로 이전 응답을 폐기한다. 표지+문제 페이지가 홀수일 때만 빈 면을 추가하며 답안은 새 종이 앞면에 시작한다.
- 풀이 보강 완료: `bank/gens/g-final1-solutions.js`, builder, 고정 JSON과 감사 파일이 연계된다. 90개 문제 본체 잠금 해시 `e8a78d3e29732e86ae4519d94ac18875110cdbb14553afd2690b0b7f8f3cf006`를 보존한다. solutionSteps 90개, 수직선/펼침 solutionAsset 6개를 보강했다. q1–15 및 q16–30 독립 감사와 문장 보정까지 완료한 뒤 새 해시에 결합하여 verified90/pending0이다. 고정 JSON SHA-256 `3b3cf8583bca0fe44294cb84784c33cddc270f269cc6a86fed197221e0cdb45a`, 감사 JSON `b8612a9511ef82bcd990f6247eadf90decffbf6a45c43dd6f36561e71e0fc890`. 자동 감사 작성 옵션은 결합 후 제거했다.
- `qa/final1-worksheet-validate.js`와 `qa/final-wrong-practice-validate.js`는 최종 고정본에서 draft 옵션 없이 재실행해 통과했다. 고정90 독립 정답 검사도 재실행 통과했다. 기존 fixed90-browser 검사 진입점은 새 worksheet 검사를 부른다. 테스트의 `--draft-layout`는 중간 UI 검사용일 뿐 콘텐츠 승인이나 배포 근거로 쓰지 않는다.
- 실제 PDF 7종의 페이지/홀짝 검사는 `qa/final1-worksheet-pdf-validate.py`로 통과: 전체90 둘다61쪽/답안17쪽 시작, 2점대둘다26쪽/답안9쪽/빈8쪽, 6문항 문제만2쪽·답안만3쪽·둘다5쪽·빠른정답1쪽, 9문항둘다9쪽/답안5쪽/빈4쪽. `tmp/pdfs/worksheet-v1`은 가상 검수 학생의 중간 자료이며 학생 배포용이 아니다.
- 최신 verified90으로 PDF 7종을 다시 생성·검사했고, 표지30유형·6문항 격자·수직선 해설·펼침 해설을 실제 PDF에서 PNG로 렌더해 재확인했다. 추가로 레지스트리, 카탈로그, 개인 로드맵, inline JS 검사 통과. 알려진 관련 없는 주차 고정 기대값 실패는 아래 기록을 유지하며 전체 QA 통과라고 말하지 않는다.
- 사용자가 후속으로 워터마크 필수를 명시했다. 표지에서 숨기던 설정을 제거했고 표지·문제·빠른 정답·답안과 풀이에 모두 표시한다. 이름이 없으면 `학습 자료 · 지필드 영재교육`으로 표시한다. 양면용 빈 면만 제외한다. 공용 스킬과 `DESIGN.md`에도 필수 규칙을 반영했다.
- 화면/인쇄 모드의 모든 내용 페이지와 이름 없는 경우까지 워터마크 검사 통과. `tmp/pdfs/worksheet-watermark`의 실제 PDF 7종에서 페이지 수·답안 시작 면·반복 워터마크를 재검사했고 표지/문제/풀이/빠른 정답을 PNG로 렌더해 확인했다. 90문항 정답, 실제 오답 범위와 개인 성적표, 개인 로드맵 검사도 재통과했다.
- 최초 완료 보고는 로컬 구현·검수까지였으며, 후속 사용자 `커밋 푸시` 지시로 이번 변경의 공개 반영을 승인받았다. 원격 main은 공개 반영 전 `0971ecd`와 일치함을 확인했다. 명시한 16개 파일만 커밋 대상이며 실제 배포 결과는 Git/Pages 상태로 확인한다. 원문 첨부·학생 결과·data.js는 변경하지 않았다. 공용 스킬은 저장소 밖 로컬 파일로 유지한다.

---

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

## 15. 2026-09-20 최종 7회 원문 전용 단계별 풀이 도우미

- 유사문제 답안에 붙였던 공통 질문 도우미는 폐기했다. 유사문항은 문제·답안·풀이 인쇄 자료로만 유지하고 원문 수업 도우미를 붙이지 않는다.
- 단계별 도우미는 원문 문항별로 선생님 영상 대본과 원본 문제 그림을 직접 대조한 경우에만 만든다. 같은 유형이라는 이유로 다른 풀이를 자동 혼합하지 않는다.
- 원문 대본에 풀이 기술이 없을 때만 같은 유형의 베이직 또는 싱크코어 설명을 보충 근거로 확인한다. 확인되지 않은 설명은 공개하지 않는다.
- 첫 적용 문항은 최종 7회 6번·11번·12번·13번이다. 6번은 원본 `materials/final_7/002.jpg`를 변형 없이 보여 준 뒤 `꼬리와 머리 판단 → 손으로 낚싯줄 따라가기 → 이해 확인 → 모르겠어요일 때 이어진 선 안내 → 6마리 확인` 순서로 진행한다.
- 11번은 원본 `materials/final_7/003.jpg`와 영상 대본을 대조했다. `마지막 5인용 의자의 3명 분리 → 가득 찬 의자 40개·122명 → 첫 번째 차이 5-2=3 → 모두 2인용으로 우겨 80명 → 122-80=42 → 42÷3=14 → 마지막 5인용 1개를 더해 15개` 순서만 사용한다.
- 12번은 같은 원본 3쪽과 영상 대본을 대조했다. `첫 번째 새 색칠 2/4=1/2 → 두 번째 2/16=1/8 → 매 단계 1/4로 감소 → 세 번째 2/64=1/32 → 네 번째 2/256=1/128` 순서로 원문 질문의 ‘더 색칠한 부분’만 계산한다. 원문 그림과 풀이용 강조 그림은 분리한다.
- 13번은 원본 `materials/final_7/004.jpg`와 영상 대본을 대조했다. `묶음 길이 1,2,3,… 확인 → 1~20 합 210 → 21+22+23+24=90 → 24번째 묶음 끝이 300번째 → (1,2)부터 (23,24)까지 12쌍 → 각 쌍에서 2가 1개 더 많음`으로 답 `2가 12개 더 많음`을 확인한다.
- 원본 문제 그림과 풀이 표시는 분리한다. 문제 단계에서는 원본만 보이고, 선 안내는 학생이 `모르겠어요`를 선택한 뒤의 풀이층에서만 나타난다.
- 도우미는 화면 전용이며 A4/PDF·일괄 저장·인쇄에는 나오지 않는다. 390px에서는 동작 버튼이 한 줄씩 표시된다.
- `mock-final-7` 회차 승인 학생의 유사문제 접근 범위와 원문별 3문항 구성은 그대로 유지한다. 이 회차 권한은 다른 회차나 일반 문제은행 전체를 열지 않는다.
- 자동 검수는 유사문제 도우미 0개, 원문 6번·11번·12번·13번 도우미 각 1개, 원본 이미지 사용, 대본 순서와 공식 답, 정답 조기 노출 없음, `모르겠어요` 보충 설명, 390px·인쇄 숨김을 확인한다.
- 14~30번도 같은 원문 전용 도우미로 연결했다. 각 문항은 `원문 → 핵심 관찰 → 계산 → 확인 → 답`의 5단계이며, 모든 중간 단계에서 `이해했어요`와 `모르겠어요 · 더 자세히 보여 주세요`를 선택할 수 있다. 유사문제에는 연결하지 않는다.
- 14~30번 원문 이미지는 `materials/final_7/004.jpg`부터 `008.jpg`까지의 해당 문항 영역을 그대로 사용한다. 풀이층은 별도 HTML 표시이며 원본 이미지 파일을 수정하지 않았다.
- 독립 검산 핵심값은 16번 마지막 카드 `69·96`과 합 `165`, 17번 `2×(1+…+14)=210`, 21번 `62×64×66=261888`, 27번 `51^4<1억<51^5`, 29번 `가운데 4가지×세로 2가지×가로 4!=192가지`, 30번 `200 이하 최대 2의 거듭제곱 128`이다. 29번은 공식·영상의 `64가지`를 되살리지 않는다.
- 브라우저 검수는 원문 도우미 21개(Q6, Q11~Q30), 각 원본 페이지, 14~30번의 `모르겠어요` 심화 분기와 최종 답, 390px 무가로넘침, 인쇄 시 21개 전부 숨김, 유사문제 도우미 0개를 확인한다. `qa/final7-reviewed-browser-validate.js`, `qa/final7-browser-validate.js`, 최종 7회 독립·문제은행·권한·인쇄 회귀 검사가 통과했다.

## 16. 2026-09-20 최종 7회 교차검수 보정

- 별도 읽기 전용 검수에서 14~30번의 원문 조건과 답을 다시 계산했다. 답은 모두 일치했고, 풀이 표현 3건과 유형 메타 2건을 보정했다.
- 21번은 `56×58×60<200000`으로 가장 작은 수가 58 이상임을 먼저 확인하고, 58·60·62를 빠짐없이 검사해 62가 첫 답임을 증명한다.
- 22번은 원문에 없는 `4·5·6학년만` 조건을 삭제했다. 4학년·6학년 외 모든 학생을 `R`로 묶어 `(4+R)+(6+R)+(4+6)=450`으로 계산한다.
- 28번은 보기의 9에만 맞는 `−4, −3, +4, +5`를 일반화하지 않는다. 보기에서 맞은편 칸을 `8+10`, `5+14`, `6+13`으로 묶은 뒤, 세 쌍의 합 `2○`, `2○+1`, `2○+1`로 `6○+2`를 보인다. 답 30은 실제 이웃 `22, 23, 29, 31, 38, 39`로 다시 확인한다.
- 25번 유형은 `배수와 나머지`가 아니라 `배수 관계와 합`, 27번 유형명은 기존 감염자를 포함한 `매주 51배`로 정정했다. 생성 데이터도 같은 분류로 다시 만들었다.
- 수정 후 독립·문제은행·브라우저·회차별 권한·390px·인쇄·일괄 패키지 검사가 모두 통과했다.
- 최종 7회는 `ready:true`, `lockedQuestions:[]`로 전환했다. `mock-final-7` 회차 승인을 받은 학생은 시험지·답안·진단·검수된 유사문제를 열 수 있고, 미승인 학생과 파이널 3회 출석 권한만 가진 학생은 계속 차단된다. 권한 검사는 승인 학생이 단순히 이름 입력창만 통과하는 것이 아니라 실제 시작 화면에 도달하고 이전 `검수 대기` 잠금이 없는지 확인한다.

## 2026-10-05 관리자 최종 1~4회 일괄 진단 저장 연결

- `admin-final-batch.js`의 기존 폴더/ZIP 흐름을 확장했다. 파이널 1~4회와 최종 1~4회를 별도 선택하며, 공식 1차 O/X와 저장 점수·오답 수가 일치하는 기록만 출력 대상으로 사용한다. 시그니처와 추가 최종 8회는 이 묶음에 포함하지 않는다.
- 같은 학생의 `final1`과 `last1`이 섞이지 않도록 선택 키·보고서 URL·폴더·파일명을 시험 시리즈별로 구분했다. 최종 보고서 URL은 `final.html?set=last&round=N&go=report&attempt=1&entry=teacher`다.
- 최종 1~4회 모두 기존 `final-report-print.js`의 요약 계약으로 연결했다. 학생 화면의 요약 인쇄도 같은 모듈을 사용한다. `final-parent-report.js`는 이미 전달되던 현재/누적 제목을 표시하도록 수정해 최종 보고서를 파이널로 부르던 표시 오류를 제거했다. 성적·컷·백분율·누적 판정 알고리즘은 변경하지 않았다.
- 부록 준비 상태: 최종 1회 검수 유사문제 및 최종 1~2회 원문 상세 풀이만 현재 등록되어 있다. 최종 2~4회 유사문제 및 최종 3~4회 상세 풀이를 새로 만들거나 다른 시험 것으로 대체하지 않는다. 선택된 미준비 부록은 화면/완료 메시지에 알리고 제외하되, 요약 PDF 저장은 막지 않는다.
- 후속 담당자는 최종 2~4회 유사문제 어댑터·승인 데이터와 최종 3~4회 상세 데이터가 원문/영상 검수 후 실제 준비되었을 때만 부록 가능 범위와 학생 요약 유사문제 인쇄 계약을 확장한다. 회차 번호만 바꿔 파이널 문항을 사용하면 안 된다.
- QA: `qa/admin-last14-batch-browser-validate.js`에서 합성 학생으로 네 회차 실제 A4 요약 PDF, QR, 최종 2회 상세 포함, 최종 1회 유사문제 포함, ZIP 다운로드/내부 파일명, 선택 충돌 방지, 옵션 유지, 390px를 확인했다. 기존 파이널 일괄 저장·요약 유사문제·부모 진단 모델/화면·공통 인쇄 검사도 통과했다. 운영 기록 쓰기 0건.

## 2026-10-06 추가 최종 8회 관리자 성적표 진입 연결

- 8회 진단·검수 유사문제는 이미 공개되어 있었지만, `admin-mock-v2.js`의 8회 전용 `상세 분석 준비 중` 반환이 관리자 성적표 버튼을 막고 있었다. 해당 반환 한 줄만 제거하고 관리자 스크립트 캐시 버전을 갱신했다.
- 새 채점·진단 도구를 만들지 않았다. 기존 `final.html?round=8&go=report&attempt=N&entry=teacher`로 연결하며 공식 1차와 연습 2차를 구분한다. 성적/OX/권한/누적/추천 기준과 검수 문제 데이터는 변경하지 않는다.
- `qa/admin-final8-report-link-browser-validate.js`는 합성 관리자·학생으로 실제 버튼 → 8회 성적표 → 오답 10유형 → `bank=final8&source=final|8` 학습지 준비 완료까지 검증한다. 외부 학생 데이터 쓰기 0건. 6회 준비 중 상태와 기존 결과 무결성·회차 권한 검사도 유지한다.
- 기존 `qa/final-score-trend-validate.js`는 현재 승인된 ‘최종 2회부터 최종만 판정’과 달리 파이널을 합친 평균 35를 기대해 실패한다(실제 30). 해당 검사와 모듈은 이번 변경 전후 동일하며, 이 오래된 기대값 때문에 승인된 누적 규칙을 되돌리지 않는다.

## 2026-10-11 최종 2회 공용 진단 연결·90개 비공개 검수본

기준 main `9516a0efbcf268c8079cb22d2c5fbc3cfc5e8069`, 작업본 `E:/Codex/worktrees/hs-report-last2-diagnostic-20261011`, 브랜치 `codex/last2-diagnostic-20261011`. 로컬 구현/검수 완료 범위다. 운영 함수/DB 반영·main 병합·공개 배포·사람 공개 승인은 하지 않았다. 로컬 커밋 SHA는 이 작업 후속 영수증 `E:/Codex/hs-admin-unify-20261004/last2-local-result-20261011.md`에서 확인한다.

### 기존 기능 연결 (새 엔진 없음)

- `final.html:613,1596,3026`: 최종 2회도 기존 diagnostic-comment·report-state 호출. 하나의 실제 추천 목록을 코멘트/계획/표에 전달한다. 최종1 특별 추천 및 시그니처/8회 2·3점대 정책을 최종2에 복사하지 않았다.
- `final.html:3170,3181`, `final-parent-report.js:188`: 최종1~2 공식 최초 기록만 누적 판정, `lastCumBands(2)`와 실제 judgeCount 사용. 전체 추이는 파이널1~4 + 최종1~2 이력 유지, 이후 회차/재응시 제외. 파이널 snapshot을 최종으로 복사하지 않음.
- `student-result-hub.js:188,225,245`, `index.html`: 같은 판정 범위/회차수로 학생 메인 누적 제목/안내 및 캐시만 보완.
- `final-report-print.js:418`: 최종2 요약 구획에만 페이지 나눔 보완. 실제 0점 PDF에서 DOM에는 있던 강점/보완 구획이 누락되던 문제를 수정했다.
- `final-summary-practice-print.js`: 최종1/2 정확한 `lastN`·`last|N` 출처 계약으로 일반화. **최종2 학생 로더/유사문제 버튼은 승인 전 비활성 유지**. 최종1 또는 파이널 대체 없음.
- `supabase/functions/hs-final-population/report-service.js:22`, `20261011103304_allow_last2_4_report_comments.sql`: last2~4 코멘트 허용만 준비; 기존 final8 허용 보존·로컬 함수 누락 보완. 인증/활성/소유권/교사 편집/학생 읽기/CAS 규칙 불변. 실제 운영은 확인 당시 함수v7·DB 모두 last1까지만 허용하므로 **온라인 last2 코멘트 완성/배포 완료로 보고하지 않는다**.

### 비공개 문항과 승인 경계

- 사용자 허용은 Q5·6·15·22·24·29의 일부 조건/구조 변경뿐이며 공개 승인 아님. 30원문×3=90개, 계산2방법 일치90/90, 9축 난도 비교90/90. 학생 실측 난도 승인 없음.
- 교사용 한 문항/쪽 HTML: `E:/Codex/visualizations/2026/10/11/last2-review/last2-claude-variants-20261011.html`.
- 교사용 실제 A4 PDF90쪽: `E:/Codex/hs-admin-unify-20261004/qa/last2-variants-review-a4.pdf`.
- HTML의 JSON script에서 스크립트로 추출한 `bank/data/last2-reviewed.json`: 90개 모두 `pending-human-review`, `freezePolicy.availableSourceNos=[]`. **미추적 상태로 보존, 승인 전 stage/push/배포 금지**. ignored private CJS/근거/재생성 자료도 정리·삭제 금지.
- `bank/adapters/last2-reviewed-adapter.js`와 `bank/index.html`에 잠긴 어댑터만 등록. 같은 원문 번호·타입·출처·서로 다른v1/v2/v3·3개 전부verified·허용 원문 목록의 교집합만 반환하며, caller/반환 데이터 변경으로 자동 승인할 수 없게 복제한다. 현재 실제 선택 유형/출처/생성기 모두0.
- 승인 후에만 기존 `bank-fixed.js`, `final1-worksheet.js`, `personal-mock.js`, `bank-access.js` 및 학생 인쇄 로더에 정확한 last2 경로/권한/제외 계약을 연결. 현재 시점에는 아직 2단 학생 문제지/연속 답안/홀수 답안 시작/이미 푼 문제 제외의 승인 후 계약을 완료했다고 주장하지 않는다.

### 원문/영상/계산 확인 필요 (보호 원본 불변)

- Q6: 실제 선분망=126, 보호 상세=108. 저장 자막08:18.879~08:23.990은90+18이라는 설명(108은 추론), 실제 숫자108·126 발화는 확인 못함. 원문/108은 그대로 두고 새 선분망98/112/81만 독립 검산.
- Q15: 실제 둘째예시=3, 인쇄=6. 자막17:18.600~17:44.909는 목표3+4+5−8=4만 설명하며 둘째예시6/3은 확인 필요. 보호 답4 유지, 새 예시 값7·3과 목표7/2/8은 실제 새 격자와 일치.
- Q30: 원문/자막은‘차에 타기 전’, 자막46:15~46:25는50÷4=12.5 계산. 동시 경계 포함/미만·이하는 명시 안됨. 보호12.5 유지, 새 후보는12.5/17.5/12초 **미만**의 조건 답. 이 응답 형식도 사람 승인 대기.
- 저장 자막 대조와 실제 음성/영상 프레임 재검수는 구분한다. 모든 영상 재검수 완료로 주장하지 않는다. 문항별 원문·변형·답·검산·9축 근거는 `.private-work/last2-variants-20261011/front-evidence.md`, `back-evidence.md` 및 검수HTML의 각 문항 JSON에 기록.
- `last2-detailed-data.js` 30문항 재작성 없음, Q12=11,064·Q29=102 유지. 보호41개 파일 HEAD 동일; 기존 last1/final8 검수 자료, 성적/컷/백분율/권한/이메일/칼럼 불변.

### 검증·증거·다음 단계

- `E:/Codex/hs-admin-unify-20261004/last2-compat.md`: 코드 전 호환표와 최종 상태, 운영 함수/DB 차이, 원문/자막/계산 차이표.
- `qa/last2-parent-report-browser-validate.js`: 합성 학생 PC390/1280·최종2만/1~2/파이널 포함/미래/재응시/0·100/추천0~3·3곳 누적 일치. 운영 쓰기0.
- 실제 요약PDF0점5쪽/100점3쪽/혼합5쪽, 총13쪽 PNG 눈검수. 성적요약/이번주학습/강점보완/오답요약 모두 실제PDF 포함, blank0. 최종영수증 `E:/Codex/hs-admin-unify-20261004/qa/last2-parent-report-print-results.json`(초기 브라우저 영수증의 이전 실패를 이 후속 결과로 해결).
- 검수HTML PC/390 가로넘침·겹침·잘림0,45그림 정상, 실제90쪽 PDF의 각 문항 내용/풀이/footer 누락0. `last2-variants-browser-results.json`, `last2-variants-visual-review.md`와90쪽 전수 축소판/위험문항 개별PNG가 위 qa폴더에 있음.
- pending어댑터/data 검증, 코멘트 소유권·CAS·지연응답 격리, 최종2상세, 부모모델/화면/공통인쇄/요약인쇄, score-trend, 최종1우선추천/상세/유사문제, final8유사문제/Q20, 시그니처요약, bank-access/source-adapter/registry 회귀 통과.
- `qa/bank-registry-validate.js`의870 기대는 기준HEAD 자체가900원문을 갖고 있어 실패한 오래된 검사였다. 검사 기대만 현재900/배점360·300·240으로 보정. 새 pending90을 원문catalog로 추가하거나 기존분류를 바꾼 것이 아니다.
- 미공개 후보 JSON을 사용하는 `qa/last2-reviewed-data-validate.js`와 외부 검수HTML을 쓰는 `qa/last2-variant-review-browser-validate.js`는 현재 비공개 결과와 함께 보존. 공개 코드만 있는 checkout에서 해당 private QA까지 통과했다고 주장하지 않는다.
- 다음은 원장 눈검수/확인사항 결정 → 승인된 문항만 연결 → 정확한 학생 2단 인쇄/권한/제외 검증 → 별도 서버 반영/배포 요청. 서버 배포 때 운영 private baseline4개를 확보·그대로 보존해야 하며 현재 로컬에 없다는 이유로 빈 baseline/옛 함수로 덮어쓰지 않는다. 최종3·4회로 넘어가지 않음.

## 2026-10-22 최종 실전 4회 유사문제 90개·진단·ZIP 완료

현행 상태는 `qa/LAST4_COMPLETION_20261022.md`를 따른다. 위의 과거 ‘최종 4회 유사문제 준비 중’ 기록은 이 변경으로 대체한다. `last|4` 원문 30유형마다 3개씩 총 90개를 고정하고, 기존 48개 초안의 오류도 보정했다. `final4`는 별도 시험으로 그대로 보존했다.

- 기존 답안 입력(최대 3차, 원점수 보존)·로드맵 영상/시험지/타이머/분석 연결을 회귀 검사했다.
- 학생 진단 추천 최대 3유형에 각 3문제 표시, 30문항 학습 위치·학습 포인트, QR·개인 모의고사·자료실을 연결했다.
- 기본 2단×3행, 전체 문제 15쪽·표지 1쪽, 연속 풀이 14쪽으로 실제 A4 30쪽을 확인했다. 답안 시작 17쪽은 홀수다.
- 실제 관리자 ZIP을 내려받아 진단과 문제·풀이 포함 및 화면/출력의 ID 일치를 검사했다. 0/1/2/3유형과 다수 오답 모두 통과, 기본 옵션에 부록 제외 문구 없음. 원문 30문항 상세 풀이는 별도 준비 옵션으로 그대로 둔다.
- 수학 별도 계산, 1280/390px, A4, 실제 ZIP·PNG 눈검수, Apple Vision OCR, 기존 3회·권한·칼럼 보호 검사 통과. 합성 학생만 사용했고 운영 성적 쓰기 0건이다. 실제 학생 계정 검수를 했다고 보고하지 않는다.
- 작업 중 원격 `data.js` 변경 2개를 `666d8b34`까지 먼저 가져와 보존했다. 이전 48개 초안 JSON은 로컬 이력이며 배포 데이터가 아니다.

### 최종4 후속 1·14·27번 그림 수정

사용자는 14번을 **원문 14번의 유사문제**라고 확인했다. 원본 시험지 확대 기능을 추가하지 않는다. 1번 세 상자 안 문장, 14번 빈 좌석 그림/답안만의 A~D 배치 그림, 27번 새 박물관 통로를 반영했다. 모든 원답과 81개 무관 유사문항 보존. 세부 근거와 QA는 `qa/LAST4_COMPLETION_20261022.md`의 후속 그림 수정 절과 `qa/last4-figure-revision-validate.cjs`를 따른다. 이전 private `build.cjs`를 다시 실행할 때 최신 `last4-figures-20261022/revise.cjs` 적용 없이 기존 공개 JSON을 덮어쓰지 않는다.

### 2026-10-23 실제 계정 ZIP의 웹폰트 다단 넘침 보수

공개 파일 10개가 GitHub 수정본과 일치했지만, 실제 관리자 계정의 최종4 추천 3·5·7번 ZIP은 3번 유사문제가 고정 칸을 넘어 저장이 차단됐다. 기존 합성 QA가 Google Fonts를 차단해 대체 글꼴로만 검증한 공백이다. 해당 QA 두 개는 이제 읽기 전용 Google Fonts 요청을 허용한다. 실제 웹폰트로 재현 후 최종4의 2·3·14·19번만 줄 간격/그림 여백을 조정했다. 본문 16px·그림 크기·2단×3행·원문/문항/정답/권한/성적은 그대로다.

웹폰트를 불러오는 전체90개 PC/390px·A4·인쇄4모드, 실제 추천 3·5·7 / 수정 그림 1·14·27 / 2·19·28 조합의 ZIP 문제9개·풀이9개 및 외부 쓰기0건을 확인했다. 실제 계정 재다운로드와 공개 재대조 결과는 `.private-work/last4-live-confirm-20261023/`에 보관한다. 기본 요약 진단지도 추천 최대3유형×3개 및 풀이를 포함하며, 최종4 원문30문항 상세 풀이는 별도 준비 범위다.

같은 날 실제 계정 ZIP을 열자 누적 4회 성적이 있는 첫 장의 성적표가 가로로 밀려 보이지 않았다. 합성4회 이력에서도 재현했다(성적 요약 폭2511px, A4폭793px). 최종4 요약의 성적 요약을 새 쪽에서 시작하고 학습 계획/분석의 나눔을 허용해 복구했다. 최종4 인쇄는 머리말·성적 칸·추이 영역의 페이지 밖 배치도 차단한다. QA의 `GFIELD_LAST4_QA_HISTORY=1`은 실제 이름 없이 최종1~4회 이력을 재현한다. 이전 실제 계정 실패 ZIP은 검수 근거이며 완성본으로 제공하지 않는다.


## 2026-10-23 학생 응원 인트로 v2 연결

- 사용자 확정: 영화 예고편형 응원, “다음 주 테스트, 자신 있게.” 삭제, “분명 노력한 너희들, 좋은 결과가 있을 거야.” / “부모님, 고생하셨습니다.” 추가. 마지막 음성은 기존 인트로의 “자, 얘들아 시작해 볼까?” 실제 녹음 재사용.
- `assets/intro/encouragement-20261023-v2.mp4`: 26초, 1280×720, 24fps, H.264/AAC. SHA256 `c6c481056314e0a41d1e0d042a3fefd7242889f75b471389aa394a04582ea264`.
- `index.html`: 로그인 여부와 관계없이 홈 진입 시 재생. 자동 로그인·인증은 유지하고 환영 화면 및 `next` 이동만 영상 종료/건너뛰기/미디어 오류 뒤 실행. 재생을 막는 저장 플래그 없음. 자동재생 제한 시 소리 켜기/재생 버튼, 키보드와 건너뛰기 지원.
- 원본 8초 영상은 기존 `docssam1/ad`의 `fields-classic/KakaoTalk_20260619_023621724.mp4` 보존. 5.70–8.00초 음성을 새 영상 23.30–25.60초에 삽입. Apple의 설치된 ko_KR SpeechTranscriber로 원본·추출·최종 파일 문장 확인. 청취 자체는 미실시; 원본 대조·전사·디코딩 검증과 구분한다.
- 렌더 코드: `tools/intro/render-encouragement.swift`. 상세 제작/검수 및 원음·믹스·스크린샷은 기존 Drive 영상/작업파일 ID `10DohEEH6o3sdycXDsc_p8i3fObkB62wJ`, `1klU655Gq-RY71MiVChZ2O4Fhsc9h_PnQ` 재사용. 로컬 작업 위치 `.private-work/intro-test-week-20261023/v2-final/`.
- 회귀 검사: `qa/intro-browser-validate.cjs`는 새/저장 로그인, 재진입, 실제 재생, 종료/오류/건너뛰기, QR 학생 유지, 자동재생 제한·키보드, 모바일/데스크톱을 격리된 모의 인증으로 확인. QR 기존 검사도 새 인트로 건너뛰기 후 이동하도록 갱신. 실제 성적·회원·권한 데이터 쓰기 없음. 영상 작업으로 완료된 문항 검수/제작을 재개하지 않는다.


## 2026-10-24 유사문제 확대 · 활용 1회 216문항 1차 반영

- 사용자 승인 목표는 원문당 **9개**. 활용 1~9회 270문항 ×9=2,430개를 먼저 만들고 기존 승인 은행 14개(1,260개)는 기존3개를 보존하며 추가6개씩 확대한다. 목표 수량을 실제 완료 수량으로 세지 않는다. 사용자 지정 종료 시각은 **한국시간 10월24일 02:00**이다.
- 현 완료: 활용 1회의 **24유형 ×9=216개**를 `bank/data/applied1-expanded.json`에 저장했다. 원문 1~6쪽과 해당 문항의 실제 답안 페이지를 직접 대조했고, 문항마다 별도 방식으로 답을 검산했다. 각 문항에 상세 풀이·학습 위치·학습 포인트·답 계약·계산 매개변수가 있다. 새 문항은 자체 제작이며 원시험 정답·학생 점수·정답률을 수정하지 않는다.
- **보류 6유형: 7·8·17·19·21·28번.** 7·17·19·21번은 고정 그림에서 서로 다른9개를 만들려면 새 구조 그림 승인이 필요하다. 8번은 `77×ㄱㄴ=ㄴㄱㄱㄴ` 구조의 두 자리 승수 변형이 유일하여 이름·ID 복제로 채울 수 없다. 28번은 원문2년8개월(32개월)이지만 해설이20개월로 계산하여 저장답10년과 계산16년이 충돌한다. 원시험 기록은 보존하고 이 유형의 새 문항은 공개하지 않는다.
- 11번의 출발 위치·복원 추출, 10번 미래 나이 비는 새 지문에서 모호하지 않게 명시했다. 14번은 현행 문제PDF의 다=나×3+50 관계를 사용했다. 25번은 회전한 수가 **처음보다 커지는** 부호 조건과 기존 승인된 복수 정답 기준을 유지한다(교사 필기 답을 그대로 복사하지 않음). 30번은 현행 문제PDF1시간50분을 우선하며 답안 문구 차이를 같은 판본으로 가정하지 않는다.
- 원문 그림6개(1·6·22·25·26·27번)는 직접 열어 대조하고 원본 픽셀을 그대로 추출했다. 주변 지문만 잘라냈으며 선·수치·색·점·배치를 바꾸거나 풀이 표시를 넣지 않았다. 원본PDF·전체페이지·교사답안·개인 경로는 새 공개 파일에 넣지 않는다.
- 새 `bank/pool.html?bank=applied1`은 공용 어댑터 `gfield-applied1-expanded`를 통해 검수된 저장 문항만 고른다. 유형당3/6/9 선택, 답안 입력·연습 진단·원문 학습 자료·상세 풀이·같은 유형9문제 연결, 최대3회 채점과 최초 연습 결과 보존을 제공한다. 연습 기록은 별도 기기 저장 키를 쓰고 원시험 성적을 덮어쓰지 않는다. 로그인 복귀 경로에 pool만 추가하고 기존 권한 판정은 유지한다.
- 출력은 **실제2단, 왼쪽 위→아래 뒤 오른쪽 위→아래**다. 기본6칸이며 긴 지문·그림은4칸이다. 답안은 연속 배치, 양면 묶음의 홀수 쪽 시작, 문제/답안/둘다/빠른정답 인쇄를 지원한다. 자체 호스팅 Noto Serif KR400·Pretendard100~700과 OFL을 사용한다. 사용자 지정 lete-on main `.claude/skills/gfield-textbook-design/SKILL.md` 및 시안 README의 종이색·깊은초록을 새 카탈로그·출력에 적용했다. lete-on 로컬의 기존 대량 변경은 건드리지 않았다.
- 난이도·분류: **활용은 배점대만** 2.7하/3.4중/4.2상(원문270개=108/90/72). 타 시리즈는 정답률을 먼저 사용하고 상<40%/중40~60%미만/하60%이상으로 표시한다. 원문 정답률은 변형의 기준값이며 변형 실측값으로 표시하지 않는다. 없을 때 명시된 점수대 안 난도를 보정한다(2.7상→전역중). 표시용4영역은 도형/수와식/경우의수/지문이해이며 원래 유형ID·분류를 보존한다. 유형 찾기에는 중급도 포함해 원문900개를 다룬다.
- 실행 검증: `qa/applied1-independent-validate.py` 216개 독립 답·유일성/전체 답 집합 통과. `qa/applied1-pool-browser-validate.cjs` 216문제/216풀이/54그림 표시, 1440/375, 잘림0, 2단 순서, 답 입력3회·최초 보존, 실제ZIP 다운로드, 외부 결과·권한 쓰기0 통과. 전체216 선택 ZIP도 실제 다운로드하여7개 항목, 문제46쪽/상세풀이72쪽/216ID 일치를 확인했고 ZIP PDF를 렌더해 분수·그림·글꼴을 눈으로 확인했다.
- 카탈로그 `qa/bank-learning-profile-validate.cjs`, `qa/bank-learning-profile-browser-validate.cjs` 통과: 활용 배점대 강제, 타 시리즈 기준 정답률, 4영역/세부검색, 활용24개9문제 링크, 기존파이널30개3문제 링크, 원자료 불변. `qa/bank-registry-validate.js`20개, `qa/bank-access-validate.js`, QR 복귀 검수도 통과했다. 예전 `bank-catalog-validate.js`와 옛 브라우저 검수의870/630문항·5단계 UI 기대값은 현행900/3단계와 달라 최신 검사로 대체하며 소급 전체 통과로 보고하지 않는다.
- Drive 보관: 전체216문항 ZIP `1EhKE8oIRh2ejU5psCdnK25eFGdbB6lhX`(36,986,495bytes, SHA256 `c989f43d66973178ebf3590d64ff5d72c499de981b81a3230ee59e99482203d0`), 검색 가능 문제PDF `1FggyS9Ki6LVoyuDjZ-862EebMRb_VVOJ`, 상세풀이PDF `1iwWtBcQpfVu9_l99xpLWO0u0Mueoz1Ez`. 검수기록 묶음은 `1Q9meVTGIjVhEtYXd-sRkJvQisNV6qntb`. 전체 ZIP은 Drive에서 원시 바이트를 다시 읽어 크기와 SHA256 일치를 확인했다. 별도 원자료·검수 기록은 기존 Drive 결과 폴더에 보관한다. 원문·답안9회 ID는 로컬 `.private-work/hw-expansion-20261023/source-manifest.json`에 기록했으며, 답안 폴더의 파일명은 ‘활용’이 아니라 **초등 선발 모의고사 특강 N회 답안.pdf**다. HWP 변환 없음.
- 이번 커밋은 위216개와 화면 연결의1차분이다. 활용2~9회 및 기존은행 추가6개는 아직 완료가 아니다. 활용2회 현행문제6쪽·답안8쪽을 확보했고 다음 제작 후보14유형은 비공개 작업 기록에 정리했다. 다음 차수도 원문 대조→독립검산→실제 답 입력→2단·ZIP 검수 순서로 진행한다. 배포 상태·커밋·후속 수량은 다음 체크포인트에서 갱신한다.

## 2026-10-24 01시 활용 1·2회 342개 — 2차 체크포인트

1차 main `fcfcebe8ebbd6a4a1ef3c7ed93c493aa6b78b3df`는 공개 파일 일치와 GitHub Pages 성공을 확인했다. 이 절은 이후 2차 구현·검수 범위다. 원격 커밋과 공개 대조는 후속 배포 영수증을 따른다. 기존 승인 은행 1,260개를 보존하며 새 활용1회216개+활용2회126개=342개다. 활용3~9회 및 기존 은행 추가6개는 미완료다.

- 활용1회 r2는 원문과 같은 수치가 우연히 포함된 5번v7·12번v3만 새 조건으로 바꾸고 나머지214개를 보존했다. 독립 검산·전체 브라우저·실제 ZIP 재검사 통과. 버전 `20261024-applied1-expansion-r2`. 연습 저장 키에 데이터 버전을 포함하여 수정 전 문제의 연습 점수·응시 횟수가 섞이지 않게 했다. 기존 저장 키와 원시험 점수는 삭제·변경하지 않는다.
- 활용2회 현행 문제6쪽·답안8쪽을 직접 대조했다. 공개 대상은 1·2·6·8·10·11·12·18·23·25·26·27·29·30번 각9개=126개이며 나머지16유형은 잠금이다. 17번은 지문15칸과 실제 그림24칸 불일치로 보류한다. 18번은 현행 문제의 ‘아무것도 없는18명’을 사용하며 답안의 구판8명과 혼용하지 않는다. 23번 반복수 표기는 새 문항에서 실제 자릿수와 일치시켰다. 원시험 답·성적 보존.
- 활용2회 독립 검산126개, 원본 그림27개 표시, 순위표9개·세로 곱셈9개·숫자카드108개, 긴 정수 문자열·소문자 순위·색 답안, PC1440/폰375, 문제·풀이 잘림0, 실제 전체 ZIP126개 ID 일치를 확인했다. 검색 가능한 문제PDF33쪽·풀이PDF55쪽이다.
- `mock.html` 원시험 오답 진단→학습 위치·학습 포인트→기본3개/추가9개를 연결했다. 실제 오답 중 검수된 유형만 전달하고 미준비 번호를 명시한다. 합성 온라인+자료실 권한 학생으로 활용1 오답2·7·12·28→2·12만, 활용2 오답1·11·17·29→1·11·29만 연결됨을 확인했다. 원시험 저장 바이트 보존·외부 쓰기0건. `mock-rx.js` 저장/API 호환 동작은 변경하지 않았다.
- 카탈로그는 활용1 24유형·활용2 14유형의 9문제 링크와 4영역/세부유형을 표시한다. 기존 출처ID·정답률·배점·정답은 보존한다. 활용 난도는 배점2.7하/3.4중/4.2상만 적용한다. `qa/applied-diagnosis-links-browser-validate.cjs`와 최신 학습분류 브라우저 검사가 실제 연결을 확인한다.
- Apple Vision OCR을 활용1 문제5쪽·28번 답안, 활용2 문제4쪽·답안5쪽에서 실제 실행했다. 보조 기록이며 직접 대조·독립 검산을 대신하지 않는다. 비공개 `apple-vision-audit/` 보관. HWP 변환 없음.
- Drive 활용1 ZIP(동일 ID 갱신) `1EhKE8oIRh2ejU5psCdnK25eFGdbB6lhX`, 36,989,222bytes, SHA256 `5e7b4834568c65e7cde2a982e9aca2bad2a46cc52c1e6b4a8429a47c1589abd0`. 문제PDF `1FggyS9Ki6LVoyuDjZ-862EebMRb_VVOJ`46쪽·풀이PDF `1iwWtBcQpfVu9_l99xpLWO0u0Mueoz1Ez`72쪽. 이 값이 앞 절의 1차 ZIP 크기·해시를 대체한다.
- Drive 활용2 ZIP `1ECdFxNi9gl_3W-USqyWCAdQzDrUJq-Z1`, 26,976,160bytes, SHA256 `f0bb676b9ac0b495690a6e3d36ca3abed1966d98287b201ccf5505b2ecf98ced`. 문제PDF `1O_prJ1EMgMZIkDOhp0SWvnbnFMWMxADk`·풀이PDF `1nrTvEOKzII4mCj7Re_HcNknXONzCUYTz`. 두 ZIP 모두 Drive 원시 파일을 다시 내려받아 크기·SHA256 일치를 확인했다.
- 사용자 지정 02:00 KST까지 작업 후 새 제작·배포·병합을 중단하고 실제 완료 수량을 남긴다. 활용3회 문제7쪽·답안7쪽 확보, 원문 대조 이후 새 제작한다.

## 2026-10-24 01시 25분 활용3회 153개 추가 — 합계495개

2차 main `f3b3b96e7c496f871c28788701d6b46ff8b3c13a`는 Pages 작업39984832099 성공, 실제 사이트의 활용1r2·활용2·pool·mock·학습색인·카탈로그·보호칼럼 바이트 일치를 확인했다. 활용2 검수기록 Drive ID는 `1lKHmBpW9lnt7wGbNjGRoS6Xz5NS62BIk`다.

- 활용3회 현행 문제7쪽·답안7쪽을 직접 열어 대조했다. 1·2·3·5·8·9·10·11·15·17·20·22·23·25·26·28·30번 각9개=153개를 추가했다. 새 검수 은행 합계495개(기존1,260개 보존), 활용1~3회는55유형을 제공하며 미준비35유형은 잠근다. 활용4~9회와 기존 은행 추가6개는 아직 완료가 아니다.
- 활용3회6번은 원문의 두 작업식을 독립 계산한16일과 교사18일이 달라 새 유형을 보류했다. 29번은 작은 원2개 예시5면과 일반 최대구역식에서7개43면인데 교사답50면과 달라 보류했다. 21번은 현행 문제PDF의 카드칸이 보이지 않아 잠근다. 기존 원답·점수는 바꾸지 않았다. 2번의 원문81·82쪽은 마주 보는 쪽의 짝홀 관례와 달라 새 문항을 실제 짝수·홀수 연속 쪽수로 만들었다.
- 원본 그림4종(피자·6월 달력·삼각수 배열·접기 단계)을 직접 대조해 그대로 추출했다. 삼각수 배열의 마지막15가 완전히 보이도록 크롭 범위를 고쳤으며 선·색·라벨·배치를 다시 그리거나 바꾸지 않았다. 정답 단서·조건 요약·풀이 힌트를 문제 아래에 추가하지 않는다.
- `qa/applied3-independent-validate.py`는153개를 별도 열거/DP/세로 계산/좌표·오일러 그래프/실제 달력 등으로 검산한다. 원문 수치 재사용0, 유형별 서로 다른9조건, 정답 유일성/전체답집합, 배점대 하중상 검증 통과. 학생 정답률·새 문항 실측 난도는 주장하지 않는다.
- 전체 브라우저153개·풀이153개·원본 그림36개, PC1440·폰375, 잘림0, 왼쪽 위→아래 뒤 오른쪽 위→아래 2단, 분수·긴 정수·복수 정답·요일·시분 입력,3회제한·최초연습보존을 확인했다. 원시험 진단에서 실제 오답1·6·17·29·30 중 검수된1·17·30만 기본3개/추가9개로 연결되고 원시험 저장값 불변·외부 쓰기0건이다.
- 전체 ZIP은7항목, 문제32쪽·상세풀이55쪽,153개 문제/풀이/목록ID가 일치한다. 실제 ZIP PDF를 렌더하여32개 문제쪽 전수 축소판과 분수·달력·접기·조합·긴 정수·시각의 확대쪽을 확인했다. Drive ZIP `1TMVE9tFs93tZFKnRflhd5jWDv5PartI7`,29,263,257bytes,SHA256 `bff330dc475e839159c419de10a77d3954bbc92d865e3ef53b1b8868cf2850fb`. 검색 가능한 문제PDF `1j58X46LT6Belu6MQ_MTB2xjb8mJbd967`,풀이PDF `1iv1b0w-3MVnqNbvhP4cJm32MWDeuHnHo`.
- 활용3회 원시험 진단·권장학습·입력·3/9개 연습·카탈로그17개9문제 링크까지 검수했다. 이번3차의 main·사이트 일치는 후속 배포 영수증에 기록한다. 활용4회 문제6쪽·답안PDF 확보 후 직접 대조를 시작한다.

## 2026-10-24 01시 38분 활용4회108개 — 새 은행 합계603개

3차 main `1ca55fce1734ed4fc904b697e8b3848b303a5643`는 Pages39986779382 성공, 공개 활용3 데이터·pool·mock·학습색인·카탈로그·보호칼럼 바이트 일치를 확인했다. 활용3 검수기록 Drive `1mq4sC2sDNr91_Iu6FDClyf9ML754bGda` 보관, 전체 ZIP의 재다운로드 일치도 확인했다.

- 활용4회 현행 문제6쪽과 답안30쪽 중 제작 대상 원문 번호를 직접 대조했다. 공개 검수 대상은5·6·7·8·10·13·17·19·20·23·28·29번12유형×9=108개다. 나머지18유형은 잠금. 새 활용1~4회 합계67유형603개이며 기존1,260개는 보존한다. 회차 전체30유형 완료가 아니다.
- 4번은 문제PDF‘시간당25분’과 교사PDF‘하루25분’이 다른 판본이므로 보류했다. 28번은 날짜의 값이 아닌 각 자리 숫자와 월 이름 숫자의 합이며 원시험 저장답1752를 보존한다. 새 문제 지문에 합산 범위만 자연스럽게 넣고 문제 아래 힌트·조건 요약·풀이 예시를 추가하지 않는다. 30번은 분열 시점·부모 개체 유지 해석이 필요해 보류한다.
- 원문 그림2종(6번 연산 보기·10번 바둑돌 배열)을 원본 그대로 추출했다. 원본 선·색·숫자·라벨·배치를 변경하거나 풀이 표시를 넣지 않았다. 29번은 원래 숫자 카드의 실제 수학 조건을 바꾼 새 카드 배열이며 기하 그림을 임의 변형한 것이 아니다.
- 108개 독립 검산은 정수 열거·연산식 계수 확인·다른 숫자DP·순위 직접 구성·실제 달력 날짜 순회·홀수 곱 전수 비교로 통과했다. 원문 수치 재사용0, 유형당 서로 다른9조건, 배점대2.7하/3.4중/4.2상 검증. PC1440·폰375·2단 왼쪽 위아래→오른쪽 위아래, 문제/풀이 잘림0, 답 입력3회·최초 보존·권장학습 연결·외부 쓰기0건 통과.
- 실제 전체 ZIP108개 문제/풀이/목록ID 일치,7항목,문제20쪽·풀이40쪽. ZIP PDF를 렌더해 전체 문제20쪽 축소판과 분수·연산·순위·숫자 세기·최대곱 상세쪽을 확인했다. Drive ZIP `1nHCVoxZ_gfwQjCykh4nAyNqI9-ebPkSY`,21,153,920bytes,SHA256 `5d5ee4b22f2e28368ec97cdbe5c831a68bc3b8216ce0712e68c571c1ede77bf2`. 문제PDF `1b4nOkmKgifxY15kv0ZjA4GdNpv1ubhd8`,풀이PDF `1_EC0MEL1_2u1zDAo6BFh9xMPgAYheGzX`.
- 활용4 원시험 오답4·5·10·21·28·29 중 준비된5·10·28·29만 기본3/추가9개 연결됨을 확인했다. 원시험 저장 바이트 불변. 카탈로그12개9문제 링크 확인. 4차 main·공개 일치는 후속 배포 기록을 따른다.
- 활용5회 문제6쪽·답안PDF 확보, 다음 제작 대조를 시작한다. 02:00 KST 중단 시점 이후 새 제작·배포·병합은 시작하지 않는다.

## 2026-10-24 01시 47분 활용5회72개 — 검수 새 은행675개

4차 main `3e18c94c7bc51f7263a2e664ebaf1d8e8bd406c5`는 Pages39988702229 성공, 실제 사이트 활용4 데이터·pool·mock·카탈로그·학습색인·보호칼럼 일치를 확인했다. 활용4 검수기록 Drive `1HGgc_sTnryUDKHN8XcFqr9UBBnMKGNm3`, 전체ZIP재다운로드 SHA 일치 확인.

- 활용5회 현행 문제6쪽과 답안31쪽에서1·2·4·7·10·13·21·30번을 직접 열어 대조했다. 8유형×9=72개,나머지22유형은 잠금이다. 새 활용1~5회 합계75유형675개. 기존 승인14은행1,260개는 보존하여 저장 문항 총1,935개다. 활용 전체9회270원문×9=2,430개 목표 중 이번 신규 검수675개이며 나머지1,755개는 아직 완료가 아니다. 기존14은행의 추가6개도 미완료다.
- 활용5회10번 원문은2019년5월5일을금요일이라고 주지만 실제달력과 다르다. 원답은 보존하고 새9문항은 실제연도·요일을 사용하여 윤일계산과 날짜직접순회로 따로 검산했다. 18번 현행6600원/교사6000원 판본차이는 보류. 21번은 같은 전체 인원을 두 나눗셈으로 나타내는 원래 모형을 명확히 했다. 29번의‘0·1로만이루어진처음8수’에는11·101등도 포함되므로10의거듭제곱으로 오독하여 제작하지 않는다(이번 공개 대상 아님).
- 72개 독립 검산·정답 유일성/최댓값·배점대만 난도·원문조건재사용0, PC1440/폰375·2단순서·잘림0·숫자/요일채점·3회제한·최초보존 통과. 이8개 원문은 모두 텍스트형이므로 누락 그림이 아니다. 새 그림이나 풀이 힌트를 문제지에 넣지 않았다.
- 전체 ZIP7항목,72개 문제/풀이/목록ID 일치,문제13쪽·풀이26쪽. 실제ZIP PDF 전체문제13쪽 축소판과 각 유형의 문제·상세풀이 확대쪽을 확인했다. Drive ZIP `1VztrwMRqqZW6F1tFTbNq_MnOyAqBHmQb`,14,470,397bytes,SHA256 `a9360c6987ba7f8f0c1d63b016aab4fb27d2662ebec4baa3347a8f39210d560b`. 문제PDF `1Zgf6ZLnxWZOFwNyL5sruJPbI9JHei47y`,풀이PDF `1EIGOhUPRTDNj6yzKcm8O9EdyoFScdaOx`.
- 원시험 오답1·10·13·18·21·30에서 검수된1·10·13·21·30만 기본3개/추가9개를 연결하고18번은 제외한다. 활용1~5 실제오답 연결·카탈로그900원문/75개9문제 링크·기존 파이널 링크·375px·원자료/원시험저장 불변·외부 쓰기0건 통과. 이번5차 main·공개일치는 마감 영수증을 따른다.
- 다음은 활용6~9 원문·답안 직접대조와 새 제작, 각 회차 잠금 유형의 구체적 그림/판본 문제 해결, 그 뒤 기존 은행 추가6개다. 승인된 완료 회차를 옛 보류표 때문에 다시 제작하거나 PDF를 HWP로 역변환하지 않는다.

## 2026-10-24 마감 영수증 — 675개 신규 검수본 메인·사이트·Drive 일치

운영 코드 main `85f362e8498464422877f5da59a0189cb2eba1b4`, Pages39989985512 성공. 활용5 데이터·색인·어댑터·pool·mock·카탈로그·학습색인·보호칼럼9파일을 실제 사이트와 대조해 모두 일치했다. 전체회차검수·남은범위·ZIP별해시는 `qa/APPLIED_EXPANSION_20261024.md`를 따른다. 활용5 검수기록 Drive `1GRimMG9ADOMJ-bHiwJunCAlYzyMdWt_O`.

- Drive 마감 기록 `1oD_cq9O102-k1vG3MAa9Tfj3ZcU0xnvg`,5개ZIP 재다운로드 영수증·검산·배포·Apple Vision OCR 보조 기록·활용6 다음 검수 순서 묶음 `1i_QZVZ9Pq9zx5BP7YmqSEO4gIqTWcsVG`.
- `qa/applied-expanded-inventory-validate.py`:675개 실제표시내용(본문+주어진자료+표+세로셈+카드+그림) 중복0,75유형×9,분류·배점대·학습·자산·색인 정합성 통과. 같은 지문을 쓰는 수 카드/표 문제를 지문 문자열만 같다고 중복 처리하지 않는다. 포함·배제 유형의 회차간 동일수치도0.
- 마지막 공용 pool 변경 후 활용1·2의 전체문제/풀이 표시·모바일·답입력·실제선택ZIP 회귀 통과. canonical registry20검사, 접근계약, 칼럼보존21검사 통과. 새 확장 전 `cd9c34eabb2fa9e4e9d1fa869ca30b70bd5cbe71`과 기존14개은행 데이터가 동일함을 확인했다.
- 활용6 문제6쪽의1~30번을 실제 읽고 답안6쪽을 확보했다. 아직 답안 번호별 대조·새 문항 제작·독립 검산·출력은 미완료다. `.private-work/hw-expansion-20261023/hw6/NEXT_REVIEW_PLAN.md`를 Drive 마감 근거 묶음에도 보관했다. 답안 렌더에서 Adobe-Korea1/F4 글꼴 경고가 있어 다음 검수 때 실제 누락 문항을 좁혀 확인한다. HWP 재변환을 시작하지 않는다.
- 종료 기준: 신규675개(활용1=216/2=126/3=153/4=108/5=72)만 검수완료다. 회차별 잠금75유형·활용6~9·기존은행 추가6개를 완료로 부르지 않는다. 원본 성적·답·회원·권한·칼럼 실쓰기0건. 사용자 요청에 따라 한국시간02:00 이후 새 제작·배포·병합은 하지 않는다.

## 2026-10-24 목표 재개 점검 — 난도별5개 총15개의 단위 확인 중

사용자의 활성 목표는 `난이도별로 5개씩 15개`다. 현행 공개본의 원문당9개와 같지 않으므로 완료로 표시하지 않는다. 원문마다15개인지 회차 한 시험지15개인지 사용자에게 확인을 요청했다. 그 답에 의존하는 새 문항 제작·난도 재분류·공개 반영은 시작하지 않았다.

- `tools/question-bank/audit-balanced15.cjs`가 원문900개·19은행·저장1,935개를 비파괴로 다시 읽는다. 원문 기준 난도와 변형 실측 난도를 구분하고 한 난도의 초과분을 다른 난도로 세지 않는다. `qa/balanced15-readiness-validate.cjs` 통과.
- 원문별5/5/5를 갖춘 유형0개. 활용270원문에 적용한 가정은4,050자리 중 기준상3,675자리 부족이며, 현재675개 중300개 초과분은 기존 보존 대상이다. 회차별 혼합 시험지는18/19은행에서 기준 분류별 수량을 갖추지만, 최종3회는 기준상 하0/중18/상72라 하5개가 부족하다. 출력·입력·진단·ZIP 완료를 의미하지 않는다.
- 상세 근거/다음 단계는 `qa/BALANCED15_READINESS_20261024.md`, 실제 원문별 목록은 ignored `.private-work/balanced15-20261024/readiness.json`이다. 아직 main 반영·배포 없음.
- 직전 사용자 요청으로 확장 임시 파일454개 약302MB를 Drive 11보관본 재읽기·크기·SHA 검증 뒤 정리했다. `.private-work/cleanup-20261024/CLEANUP_20261024.md`와 Drive `1B0M9DiAt_GbdWqRk5kf9KSGlTkwTiBBl`에 복원 링크를 남겼다. 활용6회 미완료 원자료·제작 기준·최소 마감 기록과 미커밋 `bank/drafts/`는 보존했다. 다음 작업에 필요한 회차만 Drive에서 복원한다.

## 2026-10-24 `늘리라고` 후 실제 확장 — 원문당 난도별5개 총15개

사용자 재개 지시로 이전 확인 대기를 해소하고 원문마다 하·중·상5개씩 구성한다. 질문을 반복하거나 목표를 회차 한 묶음15개로 축소하지 않는다. 이전02시 제작 종료 뒤 새로 받은 확장 지시에 따른 후속 작업이다.

- `bank/data/applied1-balanced15.json`: 활용1회1~3번 각15개, 총45개. 기존 승인15개 재사용·중상30개 신규이며 기존9개 은행19개 파일과 원시험/칼럼 바이트는 그대로다. 모든15개가verified일 때만 해당 유형을 반환하는 별도 어댑터를 사용한다. 기존 은행의4개 초과분도 보존한다.
- 원문2.7점과 새 연습2.7/3.4/4.2점을 분리한다. 중상은 역추론·조건 결합을 추가한 단계형 확장이고9축 차이를 기록했다. 학생 실측 난도/정답률이 아니며 원문과 동등 난도 대체물이라고 하지 않는다. 원문문제1쪽·답안1~3쪽 직접 대조, 원본 손그림 변경0.
- 독립 검산45개(손가락 직접 이동/숫자DP/500년 실제 달력), PC1440·375/문제와풀이45개·그림15개·잘림0, 난도별 선택·3부분답·3회입력·최초보존, 원시험 진단과 자료실에 준비된3유형만15개 연결, 기존1~5회 진단·기존216문항 회귀·권한·registry20·칼럼21검사 통과. 운영 쓰기0건.
- 실제ZIP7항목, 문제9쪽/풀이16쪽/45ID일치와 실제PDF전수축소판·확대 검수. Drive ZIP `1aS4gCnRKBmox4TEhjcdxlUFbXM0WTCN_`, 검색형 문제PDF `1PaHG79y6QKigzFR9n6v5XpmUXCkSKbE1`, 풀이PDF `1QVElRI4YFk2XlRWDFSiaff6w19LyVV_3`, 검수묶음 `1P0VjAXj7T8jKrtMs6s8zFDUhG0mYKx6C`. 재읽기·배포는 후속 영수증 참조.
- 전체 고유저장1,965개, 전용5/5/5 완료3유형. 활용270유형 목표4,050문항 중 나머지267유형은 미완료다. 기존9개675문항과 신규균형45개를 단순 합산해720고유문항으로 부르지 않는다(기존15개 중복참조). 활용 고유문항705개다.
- 다음은 활용1회4번 이후 직접 원문/답안 대조 → 각 난도5개 실제제작·독립 검산 → 같은 입력·진단·2단·ZIP검수, 활용1~9 우선. 빌더는대상을pending으로 되돌리므로 완료본을 근거 없이 재실행하지 않는다. 공개범위는실제배포SHA와대조한다.

## 2026-10-24 난도별15개 2차 — 활용1회1~6번90개

1차 main `83a0433bb1ba54034849b009fab1c5858003bae4`, Pages39997934956성공과 실제사이트10파일(신규데이터/어댑터/색인/pool/catalog/mock/기존data/보호칼럼) 바이트일치를 확인했다. 1차Drive4보관본도 재다운로드SHA일치다.

이후4~6번45개를 추가하여 누적6유형90개(신규60·기존재사용30), 고유저장총1,995개로 늘렸다. 4번각도/5번미지의나누는수/6번두차례층수역산을 현행원문·답안과 직접 대조하고 새30개9축차이·독립검산을 기록했다. 원본그림변경0, 원문성적불변, 기존45문항 본문/답/풀이 보존. 각 문항의저장버전을 유지해 추가제작이 기존3회제한/최초기록을 초기화하지 않도록 실제브라우저 검사했다.

상세검수는 `qa/BALANCED15_BATCH2_20261024.md`, **이후 누적진행은 `qa/balanced15-progress.json`**을 먼저 읽는다. 후속 배치는 이 작은진행기록과 실제배포SHA를 갱신하여 이어가며, 3유형/6유형의 옛수량을 전체완료로 반복하지 않는다. 실제ZIP90문항/7항목/문제18쪽·풀이33쪽 전수축소판·확대검수, PC1440/375·필터·복수답·진단·기존회차연결/권한 유지·외부쓰기0.

2차Drive ZIP `17EoAZJX1VXAal_Lvs-slADU16fSPgT1J`, 문제PDF `1frP26htMapqD_WJAj14JQLVMZ35Wl0b5`, 풀이PDF `1oMZH808wDehxfMqakdW8d0kPKgmOVoQk`, 검수 `1JASTo-Oz-ti0aaT2VWFe2la4J8VmDWvf`. 이후재읽기/메인/배포는후속영수증으로확인한다. 활용1~9의270유형중264유형및다른시리즈는미완료다. 다음작업은7~12번원문·답안대조이며 미확인그림은잠금유지한다.

## 2026-10-24 활용2회1~6번 난도별15개 — 누적35유형525개

활용1회29유형435개는 main `98cb8ff75c804b6f7dd6ce79de2f4c0d9fe54f3f`/Pages40023539737 성공과 실제19파일 일치를 확인했다. 이번에는 활용2회1~6번90개(신규75/기존15재사용)를 작성·독립검산·실제입력·진단·ZIP검수했다. 회차별 어댑터와 병합 릴리스로1회435개 및29개 색인 행을 보존한다. 원시험/성적/칼럼 불변이다.

누적 진행은 `qa/balanced15-progress.json`, 이번 근거는 `qa/BALANCED15_APPLIED2_BATCH1_20261024.md`를 먼저 읽는다. 실제 ZIP 문제24쪽·상세풀이35쪽,90ID일치,60원본그림/15세로셈,2단/폰375/3회입력/최초보존 통과. 저울 상 문제만2단에한문항씩 배치해200px 원본그림과 계산 공간을 보존한다. ZIP Drive `1zZA3RuUvlr_V4K0KuiNvR9wAKVjjXqb9`,문제 `1xMVx2qBDhvkhG8OKNy1dSU2SexJZopaJ`,풀이 `149A3rNoiQvdelwcf-ZQDYxW0vMJm2Jw8` 모두 재다운로드 일치. 이번 main/사이트/검수기록/정리 최종영수증은 비공개 `round2-batch1/`에 후속 기록한다.

활용 목표270유형4050자리 중235유형3525자리가 남았다. 다음은 활용2회7~12번 정확한 원문·교사답안 대조이며,1회28번은 알려진 판본충돌 잠금/원시험값 유지. 기존9개은행 초과분도 보존한다. 이 부분완료를 전체완료로 보고하지 않는다.

## 2026-10-24 활용2회7~12번 난도별15개 — 누적41유형615개

직전 main `719eb8889f4de524e371394c1daddde054dfa3a7`, Pages40026853560성공·실제28파일일치. 이번7~12번90개(신규70/기존20재사용)를 더해 활용2회1~12번180개다. 앞90개 모든 항목과 저장버전,1회435개,기존9개은행/원시험/칼럼은 보존한다.

진행은 `qa/balanced15-progress.json`, 근거는 `qa/BALANCED15_APPLIED2_BATCH2_20261024.md`. 연결그래프/분수/배열/순위백트래킹/실제타일좌표의 독립180답·조건제거·이동가능성·표시자료대조 통과. PC1440/375,180문제·상세풀이,105원본그림/15세로셈/15예측표,3회입력/최초보존·진단·권한·원시험불변 확인. 실제 ZIP문제53쪽/상세풀이73쪽/180ID일치·전수축소판/확대확인. Drive ZIP `1Kb6IyNGWAlkn_Yp_Ex6PwwSENHWoPPia`,문제 `14prAdLWT7KC5PJQ1VtZ3zxUw2aR0Ku7u`,풀이 `1dPutsqj3hNma_LPmddQrbO73HYMxUBFF` 재다운로드 일치. 이번 메인/사이트/검수기록/정리는 비공개 `round2-batch2/` 후속영수증을 따른다.

활용270유형 중229유형 및 다른 시리즈는 미완료다. 다음13~18번은 정확한 원문/교사PDF 대조부터 시작하며 원문3.4점대의 기존5개를 중에 보존하고 새하/상5개씩 설계한다.1회28번의 알려진 판본충돌은잠금/원시험값유지. 일부유형완료를전체완료로보고하지않는다.

## 2026-10-24 활용2회13~18번 난도별15개 — 누적47유형705개

직전 main `146549ba7f3c97a9fa921aa132c742a1bf95d046`,Pages40029658018성공·실제31파일일치. 이번13~18번90개(신규85/기존18번중5재사용)를 더해 활용2회1~18번270개다. 앞180개 모든 필드/저장버전,1회435개,기존 승인 은행/원시험/칼럼은 보존한다.

진행은 `qa/balanced15-progress.json`,근거는 `qa/BALANCED15_APPLIED2_BATCH3_20261024.md`. 연결점 좌표/색 값 유리수 소거/펼친 면 그래프/실제쌓기나무 이동/24칸 정확덮기/7영역 포함배제의270답과 답안전용45SVG 검산.15번 새접기방향을 명시하고17번 실제24칸을 사용하며 원시험값을 바꾸지 않는다. PC1440/375,270문제·상세풀이,180원본그림/45풀이그림/15세로셈/15순위표/5가격표,최대5칸 입력/3회제한/최초보존/진단/18개15연결 검수통과. 실제ZIP문제77쪽/상세풀이135쪽/270ID일치·212쪽 전수축소판/확대확인. Drive ZIP `1ijtE223N2PlssGDwRtz_K4scqUcGdeqK`,문제 `1S7ddNWG2ovjwklk5n7ax6prDUp0MzWfJ`,풀이 `1aGVrB09T21xN_O23v6dOk_KmqgG5S9xi` 원시재다운로드일치. 이번메인/사이트/검수보관/정리는 `round2-batch3/` 최종영수증을 따른다.

활용270유형중223유형/3345자리 및 다른시리즈 미완료. 다음19~24번 정확한 원문/교사PDF 대조부터 시작한다.1회28번 알려진 판본충돌 잠금/원시험값 유지. 일부유형완료를 전체완료로 보고하지 않는다.

## 2026-10-24 활용2회19~24번 난도별15개 — 누적53유형795개

직전 main `e660840d988d28a715461ae37aa5cfcf97836aa9`,Pages40033502284성공·실제52파일일치. 이번19~24번90개(신규85/기존23번상5재사용)를 더해 활용2회1~24번360개다. 앞270개 전필드/저장버전,1회435개,기존은행/원시험/칼럼 보존.

진행은 `qa/balanced15-progress.json`,근거는 `qa/BALANCED15_APPLIED2_BATCH4_20261024.md`.10비트배열/9영역숫자배치/12모빌무게식/실제세접기반사/자리별곱셈/표시한글단서CSP의360답과논리15표유일성·모든단서필요 검산.240원본그림/60답안SVG/최대15칸입력/3회제한/최초보존/24개15연결 검수. 공용SVG고정220×240상자의실제ZIP왜곡을원비율예약으로수정하고MD·릴리스게이트에기록. 이전270보관본은버전기록이며현재권장ZIP은360수정본이다. 실제ZIP문제109쪽/풀이188쪽/360ID일치·297쪽전수축소판/확대확인. Drive ZIP `1HYbSaO2NSWrsnWAghlYGCDN5wHpiW9Kr`,문제 `16MfOVB3MxklOaiS7ovff9yEehrIDs4WX`,풀이 `1O2sPyXgiYgCJu-XPLzvtngFDSvWzc79v` 원시재다운로드일치. 이번main/사이트/검수보관/정리는 `round2-batch4/` 최종영수증참조.

활용270유형중217유형/3255자리 및 다른시리즈 미완료. 다음25~30번 원문5~6쪽/교사7쪽직접대조preflight보관:28번실제5×3×3→540직육면체,30번33부분집합확인. 아직새15개제작/검산/출력은하지않음.1회28번판본충돌잠금/원시험값유지. 일부유형완료를전체완료로보고하지않는다.


## 2026-10-24 활용2회25~30번 난도별15개 — 2회전체450개/누적59유형885개

직전main `90d0bfd73fc527c4b6c3d1633df4af783899185c`,Pages40037740675성공·실제57파일일치. 이번25~30번90자리(신규65/기존승인상25재사용)를 더해 활용2회30유형450문항이다. 앞360개전필드/저장버전,1회435개,기존은행/원시험/권한/칼럼은보존한다.

진행은`qa/balanced15-progress.json`,근거는`qa/BALANCED15_APPLIED2_BATCH5_20261024.md`. 정방향봉지연산/세나이정수탐색/표시세로셈마스크·자리곱/실제5×3×3의여섯경계/최소부분열DP/카드개수·합DP로450답검산. 255원본그림·60답안SVG원비율·30세로셈·40풀이표·최대15칸/긴숫자입력·3회제한/최초보존·전체30개15연결을확인했다. 실제ZIP문제131쪽/풀이234쪽·450ID/선택내용일치. 이전296쪽본문픽셀일치와변경69쪽전수축소판·실제7쪽확대를대조했고최종verified상태의365쪽이미지/배치스트림이동일하다.

Drive ZIP `1thAAXdkWuCXdoYd8IS-sXMXjFigd4yvw`(113928147B),문제 `1JAa4yyDUvchNoUqHIRxmKlxhs7H0cyNb`,풀이 `1g3UylU9ZBDCHC60JZ8bgQr7Nq2_0V3HM` 모두원시재다운로드바이트/크기/SHA256일치. 100MiB도구업로드한도에걸린ZIP은폴더대응이확인된기존Drive동기화경로로보관한뒤연결도구에서다시확인했다. 분할/그림제거없음. 이번main/실제사이트/검수묶음/파생본정리는비공개`round2-batch5/`최종영수증참조.

활용270유형중211유형3165자리와다른시리즈는미완료다. 다음활용3회1~6번은현행문제7쪽/교사답안7쪽의1~2쪽직접대조기록`next-source3-materials.json`부터이어간다. 정확한답안Drive ID는`1TWs2Gj7FRGl3ljwWXY64vTxwc1gC-edo`,SHA4a88de5043eaedfbb8d8c74090816a2961676a2a82207bd516d241e02e42000c다. 별도7쪽문제PDF는답안이아니므로구분했다. 원문6번교사필기18일과정방향8a+10b=4a+15b→a:b=5:4→80/5=16일의불일치기록,원시험값변경없음. 4번쌓기형태는새변형전정확한원본과추가대조한다. 아직3회새문항은제작/공개하지않음.1회28번의알려진판본충돌잠금도유지한다. 이번2회완료를전체문제은행완료로보고하지않는다.

## 2026-10-24 활용3회1~6번 난도별15개 — 누적65유형975개

직전 main `7ae2f7f17b5996e7e070189851b5003a8fb33c3e`, Pages40039936172성공·실제58파일일치. 이번1~6번90개(신규70/기존승인하20재사용)를 연결했다. 기존3회153개와1회435개/2회450개 전필드·저장버전,보호38파일/원시험/성적/권한/칼럼보존.

진행은 `qa/balanced15-progress.json`,근거는 `qa/BALANCED15_APPLIED3_BATCH1_20261024.md`. 약분전분수배열/짝수왼쪽책펼침/실제직선교점/6층쌓기경계면/정수테두리좌표/유리수작업일정으로90답독립검산. 4번밑층두변·모서리·안쪽칸과재도색전후계산을상세화했다. raw XObject와실제PDF배치를구분하여신규피자그림은실제배치비율로추출하고기존승인그림은보존했다.6번원문교사18일/원문조건16일충돌은격리하고새15개일정만독립검산,원시험값변경없음.

입력3회/최초보존·진단1~5·3회6유형15연결·PC1440/375·기존885기록/59색인행·칼럼21/registry20/접근계약통과. 실제ZIP7항목90ID/문제21쪽·상세풀이37쪽/58쪽전수축소판·9쪽확대·최종이미지/배치스트림일치. Drive ZIP `1Y3AnR9dLTjaYP9JE-Ey5-IAsVpjMCRrA` 26377110B/SHA d66bc17ee11dfe55064d8befa7de1d04fe701bdad87384679c9d8fbb98a8a008,문제 `1dEDcHX7Zaxcgmr7sVqBN4zPWScXKJ5ER`,풀이 `1UW9J03EfMTJGU1pvp_A9VTzseMBLpkip` 모두원시재다운로드일치. main/실제사이트/검수보관/파생사본정리는비공개 `round3-batch1/` 최종영수증참조.

활용270유형중205유형3075자리및다른시리즈미완료. 다음3회7~12번은현행문제/답안2~3쪽직접대조preflight보관.12번실제접기화살표/절단모서리를확인한뒤새변형제작. 아직7~12번새15개는없다.1회28번판본충돌잠금/원시험값유지. 사용자재개지시후활성목표를이어가며부분완료를전체완료로보고하지않는다.

## 2026-10-24 활용3회7~12번 난도별15개 — 3회180개/누적71유형1065개

직전main `9b78f99ad5515a01308731fa022bb8e0d8d91101`,Pages40042480745성공·실제62파일일치. 이번7~12번90자리(신규70/기존승인하20재사용)를 더해3회1~12번180문항이다. 앞90개전필드/저장버전·기존153개/40재사용필드·1회435/2회450·보호40파일/원시험/성적/권한/칼럼보존.

진행은`qa/balanced15-progress.json`,근거는`qa/BALANCED15_APPLIED3_BATCH2_20261024.md`. 3D법선벡터회전/실제datetime전수/유리수닫힌간격·정수탐색/직접나머지열거·각조건제거/행목록/실제두접기좌표로180답검산. 원본주사위경로보존,접기실제PDF배치비율보존.12번인쇄숫자1·2는유지하고별도점수조건만지문에정의했다. 새문제아래조건요약·힌트·풀이그림없음.

PC1440/375·180입력/풀이·원본그림90/분수항90/작업표5/풀이표20·이전90개연습기록키·3회/최초보존·진단1~5·자료실정확한12개15연결·타회차59색인행유지·칼럼21/registry20/권한/소스어댑터통과. 실제ZIP7항목180ID/문제41쪽·상세풀이72쪽. 이전56쪽본문픽셀일치+변경57쪽전수축소판·실제10쪽확대. 최종verified113쪽이미지/배치스트림동일.

Drive ZIP`1pQlbjHQ4Eo2Dts5RgguzbrSKE2HU6Xy5`43420230B/SHA972545d6da5fa0d4defb41487a6731180df997ca602369c4014cd4f18ee325ee,문제`17nvBU5VckTLfLlx6RzIrVKnADyXavScb`,풀이`18n0sy4hIa4RLJWUl25QNxuN7bYGv9zTz`원시재다운로드일치. 이번main/실제사이트/검수보관/파생사본정리는비공개`round3-batch2/`최종영수증참조.

활용199유형2985자리및다른시리즈미완료. 다음3회13~18번문제/교사3~4쪽직접대조preflight보관:13번위왼쪽9(11−2),16으로가정금지/맨위값미확정;14번전체배치2개이나B귤답유일;15번최대643210/17번48/18번초기44·28·24별도확인.16번정확한쌓기좌표추가대조후제작. 아직13~18새문항없음.1회28번판본충돌잠금과3회6번원문불일치원시험값보존. 전체활성목표완료로표시하지않는다.

## 2026-10-24 활용3회13~18번 난도별15개 — 3회270개/누적77유형1155개

직전main `e2c16e27015f4071ba5d9c3c5871691dbf3beb08`,Pages40044011409성공·실제64파일일치. 새90자리(신규80/기존승인중10재사용),앞180개전필드/저장버전·보호42파일·기존153/50재사용필드·1회435/2회450·원시험/성적/권한/칼럼보존. 진행`qa/balanced15-progress.json`,근거`qa/BALANCED15_APPLIED3_BATCH3_20261024.md`. 

13원본다섯자리가중치1/2/4/8/9·맨위미확정미사용,14실제단서재파싱CSP/상각단서필요/순서없는두과일,15별도숫자DP·끝두자리4배수,16기둥10개높이4×5+1/2/3/2/1·가로층10/8/6/5·흰14검15·원본보이는면중심36색전부일치,17실제반사원상2/4/8·세식유일,18정방향이동행렬소거/양수/합보존으로270답검산. 원본도형보존/문제아래힌트0. 

PC1440/375·270입력/풀이·그림135/단서표15/풀이표50·이전180모든기록키·3회/최초보존·진단1~5/자료실정확한18개15연결·타회차59색인행·기존2회450격리회귀·칼럼21/registry20/권한/소스계약통과. 14중/16상각단한문항으로넘침해소,2단유지. 실제ZIP7항목270ID/문제66쪽·풀이115쪽/이전111쪽본문픽셀일치+변경70쪽전수축소판·실제10쪽확대/최종181쪽이미지배치스트림동일. 

Drive ZIP`1uVUgznHLVWgyeCpZ-VABFjM9C4d36b5s`63084132B/SHA250de7af33c7688d7288ee0204fda8e7a652f1125df12cf519f6bf1aeff3ece1,문제`1Us91w9YEWcoVQPQ2wdAvOY7mzYkm8SWL`,풀이`1b84jOBWG5UfPIK7Ss7xVm5s9InaxteRK`원시재다운로드일치. 이번main/사이트/검수보관/파생정리는비공개`round3-batch3/`최종영수증참조. 

활용193유형2895자리및다른시리즈미완료. 다음3회19~24원문/교사4~5쪽preflight:19꼭짓점합24/20답30/22수요일/23속도20·10/24유일A6B7C4D13. 21교사두자리÷한자리=한자리/서로다른네카드32열거일치,현행원문PDF네칸미표시를정확한PDF객체/대체판본확인후제작. 아직19~24새문항없음. 1회28번잠금/3회6번원문불일치원시험값유지. 활성전체목표완료표시금지. 


## 2026-10-24 활용3회19~24번 난도별15개 — 3회360개/누적83유형1245개

직전main `79631fd7531a7aabb063aae9799aa08b2c552ab4`,Pages40045691190성공·실제66파일일치. 새90자리(신규75/기존승인중10·상5재사용),앞270개전필드/저장버전·보호44파일·기존153/65재사용원래필드·1회435/2회450·원시험/성적/권한/칼럼보존. 진행`qa/balanced15-progress.json`,근거`qa/BALANCED15_APPLIED3_BATCH4_20261024.md`.

19번9!배치/대칭궤도;20번직접큰정수/길이유일성;21번피제수·제수직접나눗셈/전수식과합;22번실제날짜·두기간유리수;23번정방향시간/연립소거;24번실제13칸좌표·빈칸순열·변화후값으로360답검산.19/24원본그림그대로.21번현행/대체PDF 카드네글리프CID65535가포함폰트49284glyph범위를넘어미표시됨을확인했다.교사답안같은21번의정답없는빈네카드도식만원형그대로추출/32개열거일치.원문PDF복구나원시험수정없음.22행풀이표는제수별묶음으로모든경우보존/넘침해소.

PC1440/375·360입력/풀이·그림180/분수항90/단서표15/풀이표65·이전270전기록키·최대4칸/3회/최초보존·진단1~5/자료실정확한24개15연결·타회차59색인행·기존2회450격리회귀·칼럼21/registry20/권한/소스계약/readiness통과.19상/24전체각단한문항/2단유지.실제ZIP7항목360ID/문제92쪽·풀이154쪽/이전180쪽본문픽셀일치+변경66쪽전수축소판·실제10쪽확대/최종246쪽이미지배치스트림동일.

Drive ZIP`1lSOuI1VAG_1gn5dXqq5cCCq5MH3mRbW2`82458707B/SHA17ff450908d61ccbba177c5f5fdc2fdc77e8a35b2d8c18951fe814b8b7962254,문제`1lIcNrjbNmxpGCkTvYdeVnvl1QQIywV-h`,풀이`1T6KA5OlG6brV5S_OGLQxor1GSjXij_nt`원시재다운로드일치.이번main/사이트69파일/검수보관/파생정리는비공개`round3-batch4/`최종영수증참조.

활용187유형2805자리및다른시리즈미완료.다음25~30원문/교사6~7쪽preflight보관:25전수195/교사필기240불일치별도확인/원시험값보존;26번3796;27실제5×4×3→900/원본crop필요;28최소부분열DP;29실제원경계·교사n²+1모형검증전기존잠금유지;30번12:20.아직25~30새문항없음.기존1회28번잠금/3회6번원문불일치원시험값유지.활성전체목표완료표시금지.


## 2026-10-24 활용3회25~30번 난도별15개 — 3회전체450개/누적89유형1335개

직전main `f5ea54a6df9465e1a5dbaa2772ab8d2a7f3d69ca`,Pages40047820801성공·실제69파일일치. 새90자리(신규70/기존승인상20재사용),앞360개전필드/저장버전·보호47파일·기존153/85재사용원래필드·1회435/2회450·원시험/성적/권한/칼럼보존.진행`qa/balanced15-progress.json`,근거`qa/BALANCED15_APPLIED3_BATCH5_20261024.md`.

25실제네자리수열거/26문자열잘라내기/27실제900복셀/28전체부분열DP/29경계접점포함유리좌표교점그래프·Euler/30datetime으로450답검산.25번원문합15전수195와교사필기240불일치는원시험값유지,새문항개별검산.29번이전보류는큰원경계접점을누락했다.원본픽셀내부5영역·원반지름1/중심거리1/4/작은원반지름3/4실제배치로n²+1,7개50면검산.접촉금지비교n²−n+2별도.원본그림/기존9개보류표/원시험변경없음.새하30번2개시각표기혼동조정뒤450재검산·실제ZIP재생성.

PC1440/375·450입력/풀이·그림210/카드20/분수항90/풀이표70·이전360전기록키·최대4칸/긴답마지막자리구분/3회/최초보존·진단1~5/자료실정확한30개15연결·타회차59색인행·기존2회450격리회귀·칼럼21/registry20/권한/소스계약/readiness통과.27/29상각단한문항/2단유지.실제ZIP7항목450ID/문제114쪽·풀이189쪽/이전246쪽본문픽셀전부일치+새57쪽전수축소판·실제10쪽확대/최종303쪽이미지배치스트림동일.

Drive ZIP`136foVv8CyQqGn4eGdJGieppHu-KFDp_U`102464048B/SHA c1369d46648d7400c6b977b4940dc24e42b9e3063bf9efab0810b67667f2823a,문제`1ES_qUvC4KKfDOYncIgLfJKPs4zggCb10`,풀이`1uqytDleArCPDFrPPwD_2pnodmPQBk3ta`원시재다운로드일치.이번main/사이트71파일/검수보관/파생정리는비공개`round3-batch5/`최종영수증참조.

활용181유형2715자리및다른시리즈미완료.다음4회1~6번현행문제1쪽/교사1~6쪽직접대조`next-source4-materials.json`보관.정확한답안Drive `1-Cr2jAfw1bK8Z-OkvlcyB3iaDyMXu7Av`,30쪽/SHA67f66e5fa57df1d463261e184f1dced30e3ffbcf0a802a1ec2d9b8066d122fe8.1번9·3·1;2번192;3번4×4삼각격자60;4번현행1시간25분/교사인쇄하루25분·계산1시간모형판본차보존;5번역순분수78번째1/13의차12;6번273.아직4회새문항없음.기존승인108/원시험값·1회28번잠금/3회6번원문불일치유지.활성전체목표완료표시금지.

## 2026-10-24 활용4회1~6번 난도별15개 — 누적95유형1425개

직전main `8a7e30342ba181c1c6c412e59c5d32bd7a1d31bc`,Pages40049925459성공·실제71파일일치.새90자리(신규80/기존승인하10재사용),기존4회108개·앞3회1335개전필드/저장버전·보호52파일·원시험/성적/권한/칼럼보존.진행`qa/balanced15-progress.json`,근거`qa/BALANCED15_APPLIED4_BATCH1_20261024.md`.

현행문제1쪽/교사1~6쪽직접대조.세로셈올림·숫자순열/실제종이단위칸합집합·노출경계/25점격자삼각형전수/유리수시계시간선/약분전분수목록/원본9예시규칙적합·중첩식파싱으로90답검산.중난도는범위/선택·포함/맞춘시각역산/동일값두표기의위치차/세연산연속역산을결합.4번원문1시간/교사인쇄하루·계산1시간판본차는기존값유지.원본Im50/52/54그대로,Im51은빈흰여백만자르고모든선·수치보존/여백복원전체픽셀일치.6번기존승인5그림은이전crop보존.

PC1440/375·90입력/풀이·그림60(원본55+기존승인5)/분수항150/실제식25·이전1335단계형+108기존은행전기록키·최대3칸/3회/최초보존·진단1~5/자료실정확한6개15연결·타회차89색인행·기존3회450격리회귀·칼럼21/registry20/권한/소스계약/readiness통과.1~4상각단한문항/2단왼쪽아래→오른쪽아래순서유지.실제ZIP7항목90ID/문제29쪽·풀이29쪽/58쪽전수축소판·8쪽확대/최종이미지배치스트림동일.

DriveZIP`1e5e5yxtmC5inucUvGTNC9-2bLVrJX_-D`19380483B/SHA4aee963d1fa0d0a6eda9a277fdecd61b05a516682c43c7e7131780b61fced183,문제`1jHDj3Xde7l0UZkk3G5M67RMZI7463rZr`,풀이`1oKdQIzltm4MSmNbf9V2VOHKeY8xDpy3V`원시재다운로드일치.이번main/실제사이트80파일/검수보관/파생정리는비공개`round4-batch1/FINAL_DELIVERY_RECEIPT.json`후속근거.

활용175유형2625자리및다른시리즈미완료.고유저장3075/배점대부족2535는별도지표.다음4회7~12번정확한원문·교사PDF직접대조부터.기존1회28번잠금/3회6번원문불일치/4회4번판본차원시험값유지.6유형완료를4회전체/활성전체목표완료로표시하지않는다.

## 2026-10-24 최신 사용자 정정: 원문당 총9개

사용자가 수량 질문에「9개 하자」로 답했다.15개를 채우는 신규 제작을 중단하고 총9개 기준으로 이어간다. 기존 승인9개 완료 원문은 재제작하지 않는다. 직전4회1~6의90개는 이미 main d02bdc152e5fdf43e70820abcdb890d4115862bb/Pages40052391791/실제80파일일치/Drive원시대조·검수보관·검증파생64,922,318B정리 완료. 기존15개/기록/원시험값을 보존하고 기본 자료실·진단·추가연습 연결만9개로 바꾼다. 기존 단계형의9선택은 하중상3개씩이며 기존 배점대9개은행은 그대로다. 과거95유형1425자리·175유형2625자리 등은15개 계획의 이력이며 새9개 목표 완료/잔량이 아니다. 최신 QA와 배포 근거는 ignored .private-work/practice-nine-20261024/를 확인한다. 다음4회7~12는 원문2쪽/교사7~12쪽 직접대조렌더를 직전batch의next-preflight에 보관했다. 아직 새 문항을 만들지 않았다.9번접기절단 실제모양의 추가확인/11번복수정답 입력계약 검토 후 부족한9개만 제작한다. 활성목표 문자열15개가 남더라도 최신 사용자9개 지시를 우선한다.

## 2026-10-24 활용4회9·11·12번 각9개 — 신규27개/기존은행135개

최신 목표는 원문당 총9개다.직전main0ab254d3d50040efc9d6cd4178933334204d5a6f/Pages40052909511/공개80파일일치.이미9개가 있는7·8·10번은보존하고없는세유형에27개만추가했다.근거qa/APPLIED4_NINE_ADDITIONS_20261024.md,진행qa/balanced15-progress.json,비공개증거.private-work/nine-expansion-20261024/round4-missing-9-11-12/.

원문2쪽/교사9·11·12쪽직접대조.9번은세로3개외아래가로절단1개가있으며모든선이면12조각.유리수반사선분그래프와120×120종이셀flood-fill일치.원본전체+같은마지막절단선픽셀만추가확대/새선·풀이단서없음.11번원본2·4·2칸/17이웃쌍,각새문항4개유효배치를모두허용/순열과별도제약탐색집합일치/8칸입력도실제같은배치.12번8점원본보존/필수·제외점별조합과256부분집합열거일치.모두원문배점2.7하/실측난도없음.

기존108전필드·버전/다른4회차·기존12학습행/보호38파일/이전1533연습키/원시험·칼럼·권한보존.새27만별도명시저장버전r2.135문제·풀이/원본그림45+원본확대9/새풀이표9/PC1440·375/11번36허용배치/3회·최초보존/진단1~5·자료실15개9연결/기존95유형9기본선택/칼럼21·registry20·소스·권한통과.실제새27ZIP7항목/문제7쪽·풀이13쪽/20쪽전수축소판·4쪽확대/36이미지바이트일치/최종데이터와PDF동일.

Drive ZIP1S3EUmxOOX9wFC_Xd9UBoW1L2ZULe0vzY:9144866B/SHA2238b40a2dfcc21fa3012aac87c3758f03b339a92e07e1535e26dc21f8ea8e3f,문제1W0mKBwdsrOVlt70XTDiP6K8yLgbvPFzP,풀이1zR1kUxeSnhYF1JehmdkEVpKSBGbZHdhH모두원시재다운로드일치.이번main/배포·실사이트/검수보관/파생정리최종영수증은비공개현재폴더에후속기록.실사이트파일대조와로그인계정실화면검사는구분한다.

고유3102개/개수상9개이상116유형·부족1386개는투영이고전체검수완료수아님.15개계획의예전누적·잔량은현행목표와별개.다음4회14·15·16·18번정확한원문·교사PDF대조부터.17번기존9개재제작금지.4회전체/전체문제은행은아직미완료.목표자동문자열15개보다사람의최신9개정정을우선한다.


## 2026-10-24 활용4회15·18번 각9개 — 신규18개/기존은행153개

직전27개 main `d5c6025e3909693c52768c678f5aa238f2784a81`, Pages40054656735성공/공개86파일일치. 직전 검수기록Drive `16_cu_KQF3H-9g2S4O5tYauoheuzvuf2x`, 최종영수증 `10rziKUOcnwfSgmkCctt0sQjMvIDHQ1IF` 모두 원시재다운로드일치. 확인한 파생사본29개+임시검수ZIP12115544B정리. 원자료/사용자초안/실제ZIP보존.

이번은 원문당 총9개 기준으로 없는15·18번만18개를 추가했다. 기존17번 등 승인9개는 재제작하지 않았다. 근거 `qa/APPLIED4_NINE_SEQUENCES_20261024.md`, 비공개 `.private-work/nine-expansion-20261024/round4-missing-15-18/`. 원문3쪽15번/4쪽18번 및 교사15·18쪽 직접대조. 정사각형 묶음 공식과 항별열거/14차례8열 이동과 별도칸걷기 검산. 원본100=(8,15)/152=(나,87), 화살표 경로29칸 일치. 실제PDF배치·잘림영역 추출/원본수치·선·색·표식보존. 두 유형은 원문3.4점에 따른 중/실측없음.

기존135객체·저장버전/이전1560연습키/보호38파일/다른4회차·기존15학습행/원시험·권한·칼럼보존. 새18만명시저장버전r3.153문제·풀이/72그림·새18두칸입력·3회/최초보존·진단1~5/자료실17개9연결·PC1440/375넘침0·registry20/소스계약통과. 실제18ZIP문제5쪽/풀이6쪽/11쪽전수축소판·3쪽확대·18내장그림바이트/최종문항·PDF일치. 공용조판·채점로직은수정하지않고캐시·데이터·연결만반영.

Drive ZIP `1n-DtUJbs1rhShaEXlxNcdmkdrKmAftk3` 9274991B/SHA8ed77be670c4313960972ea12c8d0b735a6b96ddeccf1216ccf113c823c7856b, 문제 `16VSj32xtQee0Noer2TKfZFSacRFZmPre`, 풀이 `1qmGLEb1ZLJTa6-S3QkOjUzPHfmDvRSQL` 원시재다운로드일치. 이번main/Pages/실사이트/검수Drive/파생정리는현재비공개폴더최종영수증후속기록. 로그인운영계정실화면검증을공개파일대조로대체했다고보고하지않는다.

다음14·16번고정그림조건을보존하는변형설계부터.16번인쇄합22/17/11은유지하고새5개카드집합의유일해를먼저열거한다.14번은게임판곱고정조건때문에원본과맞지않는새수치를그림과섞지않는다.17번기존9개보존.고유3120/개수상9개이상118유형·부족1368개는개수투영이며전체검수완료수가아니다.활용4회/전체문제은행미완료,최신사람9개결정이자동15개목표문구보다우선.

## 2026-10-24 활용4회16번 총9개 검수 완료 — 누적162개/18유형

직전main `3a7e84ba34c9572640ac840f4209591b1ce0d9ff`. 기존153개를 보존하고 부족했던16번 유사문제9개만 추가했다. 현행 사용자 확정은 원문당총9개이며 과거15개 계획은 목표가 아니다. 상세 기록 `qa/APPLIED4_NINE_OVERLAPS_20261024.md`, 진행 수치 `qa/balanced15-progress.json`, 비공개 원자료·렌더·검사근거 `.private-work/nine-expansion-20261024/round4-missing-16/`.

원문 문제PDF3쪽/답안PDF16쪽 직접 대조. 원본 실제 배치 그림을 그대로 재사용하고22·17·11 영역합 고정. 9개 카드집합×120순열 전수 + 독립 쌍합검산으로 유일해·답 확인. 문제3쪽/상세풀이3쪽 ZIP 4,592,514B SHA`040e386224f1a07ced2a8523325027d377f1d0e6f233b3f6e7174ce640f57c6b`. 앞153개/원시험·성적/1578기존 연습 기록 보존. 3회 연습 제한·최초 응답·진단 연결·모바일·실제 두단 인쇄·ZIP 전체6쪽 통과. 저장소 소스어댑터/레지스트리 통과.

학습색인 81유형729변형 유지, 활용4 확장은행162문항·18유형으로 연결; adapter/catalog/diagnosis cache r4/r8. 브라우저 공개상태 QA 모두 통과. main `eb620aea6a1a423f86b41f720876c54b820aa23b` 반영, Pages run `40056099942` 성공. 운영 사이트 핵심9파일 원시바이트 동일. Drive ZIP `1ugxyM-wNL3SrKDK8ZogNCdbL56Vbwmn0`, 검수ZIP `1ohHIAqS4J_lPTzoO_gg280O6zAFHjy8o`, 문제PDF `1JjAB6vhanyVO06tiw1p6WE0Hbf8I3iZu`, 상세풀이PDF `1IwiVjURDhkVROLfFoswsGmzy1SWV4pR6` 모두 파일 크기·SHA256 재다운로드 일치. 최종 세부 영수증은 비공개 `.private-work/nine-expansion-20261024/round4-missing-16/FINAL_DELIVERY_RECEIPT.json`. **다음: 활용4회14번 원문/답안 PDF 직접 대조.** 17번 기존 승인9개를 보존하고 재제작하지 않는다. 목표 누계는 크기만으로 승인 완료를 뜻하지 않으며 활용 전체·문제은행 전체 미완료.

## 2026-10-24 활용4회7~12번 기존 9개와 전체 ZIP 재확인

사용자 최신 기준은 원문당 총9개이며 활용은 원문 배점대만으로 분류한다. `bank/data/applied4-expanded.json`에 7~12번 각각 9개(총54개)가 이미 있고 전부 `verified`, 배점대 `2.7`·난도 `하`다. 추가 문항 제작이나 15개 단계형 전환은 하지 않는다. 15개로 늘리려던 미승인 탐색 초안은 `.private-work/balanced15-20261024/round4-batch2/abandoned-15-draft/`에 보존했으며 저장소 데이터·화면 연결·배포에는 반영하지 않았다.

기존 전체 162문항 브라우저 검수와 ZIP 재생성을 `GFIELD_POOL_QA_FULL_ZIP=1 node qa/applied4-pool-browser-validate.cjs`로 완료했다. 전체 162문항·풀이가 화면에 표시되고 1440/375 화면, 2단 순서, 답 입력·진단, 3회 제한·최초 응답 보존, 잘림 없음, 외부 쓰기 0건을 확인했다. ZIP은 7개 구성 파일, 문제 PDF 34쪽·상세 풀이 PDF 63쪽이며 문항목록 JSON·문제/풀이 HTML·빠른정답 CSV의 ID 162개가 현행 은행과 일치한다. ZIP SHA-256 `87c1a96f69af4cbc39c6bc690ea38f0738b6f9cd5e2a3cf4f588d62fc5766f0d`, 크기 35,222,484B. 작업 증거는 `.private-work/nine-expansion-20261024/round4-missing-9-11-12/legacy-browser-output/`에 있다. 독립 수학 검수 `qa/applied4-independent-validate.py`도 기존 108개 대상 통과.

이번 재확인은 로컬 검수 후 기존 프로젝트 Drive 폴더 `1XB2t5QvxFll2LlZLwP_R4S9io6vTg8Zk`에 전체162 ZIP(`18wDYc1lSwz32ICNokus3oj-wIzRapReH`, 메타데이터 읽기 재확인)과 영수증(`1Dyy9tBw9YdBmNDOOqpTijYZJ4YEBB1oX`, 3,991B 읽기 확인)을 보관했다. GitHub 커밋·푸시와 Pages 재배포는 하지 않았다. 이 7~12번은 기존 9개 승인본으로 완료 처리한다. 다음 작업은 활용4회 14번 원문/답안 PDF 대조다. 17번 기존 9개는 재제작하지 않는다.

## 2026-10-24 난도별 15개 목표 — 기한 경과 시점 인수인계

사용자 지정 기한은 한국시간 2026-10-24 02:00이며, 확인 시각은 같은 날 12:57 KST로 기한이 경과했다. 이후 새 문항 생성·배포·병합은 시작하지 않는다. 현재 로컬 `main` 작업본의 `bank/data/applied4-balanced15.json`에는 원문 1~12 각각 하5·중5·상5, 총180문항이 있으며 180개 모두 `reviewStatus: verified`다. 승인 은행에서 재사용한 40개는 원본 `applied4-expanded.json`의 기존 모든 필드와 일치한다(불일치 0). 현재 파일 SHA-256은 `9372cfcafa19339c636309c74aca630029ca72e88224cdf827835294faf226c8`이다. 이 자료는 미커밋 로컬 초안이며 공개·배포하지 않았다.

최신 `audit-balanced15.cjs` 결과는 전체 투영 source 900, applied source 270·목표 4,050개, 감사 인덱스의 verified 1,929개 및 benchmark별 잔여 2,445개다. 이 값은 저장소 감사 인덱스의 현황이며 이 180개 초안 전체의 승인 검수나 배포를 증명하지 않는다. 현재 해시 기준 답안 대조를 다시 묶은 `.private-work/balanced15-20261024/round4-batch2/q11-review/current-data-math-rebind.json`은 Q1~6의 별도 90개 및 Q7~12의 별도 90개 독립 검산 결과와 현행 180개 ID/답안을 모두 일치시켰고, Q11 상 5개는 실제 2-4-2 인접 그래프 전수순열에서 각각 유일해를 확인했다. 현행 해시 기준 읽기 전용 브라우저 렌더 `.private-work/balanced15-20261024/round4-batch2/q11-review/current-data-screen-render.json`도 문항/풀이 180개, 그림 135개 전부 로드, 답안 행 180개, PC1440/폰375 수평 넘침 없음, 외부 쓰기 0건을 확인했다. 승인본 40개의 원본 필드는 차이 0이며 `git diff --check`도 통과했다.

기존 ZIP(`.private-work/balanced15-20261024/round4-batch2/q11-review/output-qa/balanced180.zip`, SHA-256 `99316ea8ec991956a3908cac4421f0f395037505c3fd73e8b0fe079a6acb4ea8`)은 문항 ID와 정답은 현행과 같지만, 문항목록의 현행 레코드와 완전히 일치하지 않는다(verification 30개, practiceStorageVersion 15개, levelReview 15개, asset 5개 차이). 두 PDF의 49/57쪽 이미지·배치 스트림은 별도 보존 검수 PDF와 같지만 Q10 저난도 5개에서 ZIP의 원본 그림 자산이 현행 승인본 자산과 다르다(239×259 대 292×298). 따라서 이전 시각 검수는 현행 선택 자산 검수로 대체할 수 없고, 이 ZIP을 최종본으로 간주하지 않는다. 마감 연장 후 현재 현행 자료를 그대로 내보내 독립 ZIP 데이터/그림 바이트 검증, 브라우저, PDF 전수 시각 확인을 수행한다.

남은 범위는 applied 4,050개 quota 전체 검수/연결 및 다른 시리즈다. 현재 audit의 회차별 30 source quota readiness는 활용1 29/30(28번 제외), 2회30/30, 3회30/30, 4회12/30(1~12번), 5~9회 각0/30이다. 추가 승인본이 quota보다 많으면 초과분은 보존하면서 quota 선택을 충족하는 방식으로 산정한다. 목표 전체는 미완료다. 기한 이후에는 새 문항 생성을 계속하지 않는다. 재개 시 현행 요청과 저장소 인수인계의 “원문당 9개” 완료 기준 사이의 충돌도 먼저 정리한다. 현재 작업은 `main` 미커밋 상태이며 GitHub push·Pages 배포·Drive 업로드를 하지 않았다.


## 2026-10-24 활용4회 난도별15개 Q13~18 — 270문항 로컬 검수본

사용자는 문제은행 제작을 위한 작업이므로 기존 내용 기준으로 난도 단계를 낮춰도 괜찮다고 확인했다. 이 확인으로 15개 난도별 작업을 이어갔으나, 기존의 원문당9개 운영 결정과 충돌하므로 이 결과는 내부 검토용 초안으로 유지한다. 학생 자료실/메인 연결·커밋·푸시·배포는 하지 않았다.

`bank/data/applied4-balanced15.json`은 원문1~18 각각 하5·중5·상5, 총270문항이다. Q13~18에서 90문항을 추가해 누계 270이 되었고, Q1~12의 기존 180 레코드는 이전 검수본의 레코드 필드와 정확히 일치한다. 활용 난도 분류는 배점대만 사용한다(2.7=하, 3.4=중, 4.2=상). 2.7점으로 기존에 중으로 태깅됐던 40개 draft 레코드는 저로 정정했다. 기존 승인본에서 가져온 항목은 원본 필드를 보존했다. 현행 자료 SHA-256 `2bfdfa37c7824af3e3e361e8292bff73f8cdbacc251781b20be2aecd217a1ef9`.

Q13~18 수학 검산은 `.private-work/balanced15-20261024/round4-batch3/independent-math.json` 및 `independent-13-18.py`에 있다. 90개 중 기존 승인 재사용 25개는 원본과 전 필드 일치, 새 항목 65개는 독립 검산했다. Q13 shortage/leftover 식, Q14 카드 곱 exhaustive uniqueness, Q15 spiral grouping, Q16 5! 배열, Q17 자리별 숫자합, Q18 원본 경로/이동 횟수를 검산했다. Q14 렌더는 빈 머리글 행을 제외해 실제 3×3 칸으로 표시한다. 이전 180개 재결속 증거는 `previous180-record-rebind.json`.

실제 ZIP `.private-work/balanced15-20261024/round4-batch3/output-qa/balanced270.zip`은 7개 항목이며 문제 PDF 70쪽, 상세 풀이 PDF 86쪽이다. 문제·풀이·CSV ID는 현재 270개와 일치하고, 최종 전수 이미지/배치 비교를 통과했다. SHA-256 `c04ab83949a822b6267a27fae80ff9843345d48beae6e79bc1966dc999e1a648`, 크기 55,719,819B. 브라우저 QA: 18원문×5/5/5, 그림180/표15, PC1440·375, 270 답 입력/진단, 세 번 시도/최초 응답 보존, 기존 기록 보존, 실제 ZIP, 외부 쓰기0건 모두 통과. `git diff --check` 통과.

마감은 한국시간 2026-10-24 02:00이었다. 이 상태 기록 시각에는 이미 경과했으므로 추가 문항 생성·배포·병합은 진행하지 않는다. 다음 재개 작업은 Q19~24의 현행 원문·답안 PDF와 그림을 직접 대조한 뒤, 작업 범위/원문당9개 대 난도별15개 기준을 다시 확인하는 것이다. Q19~24 제작은 시작하지 않았다.

Drive 보관: 비공개 프로젝트 폴더 `13Vra3QeDFFZlP1It8idTxioQETPE6vGB`에 270 ZIP ID `1-BfVuzwLLtz8eOyXvqofHyqqucoVi_kk`를 올렸다. fetch에서 파일명·폴더·MIME 및 55,719,819B 크기를 확인했다(원시 재다운로드 바이트 해시 검증은 하지 않음). 독립 검산 `1qBqV-G01o9opmTxkgE1m9uXY2v5cYHBV`, 재결속 `1_-4XxS61GLUpsAUzonzNmMGBIfD1PJhe`, ZIP 검증 `1fgBs2-zJCKSHeSGENGyHckE-n8ZjXTJi`, 브라우저 QA `1X_yUwTwYZ_-H1whXg6B0Z-FBwazupX3p`, 영수증 `17qT5z5jtWYXPELgRvp7jV5Kfn08zWw9G`, 인수인계 `1Qaixf_piuos0-kvxWLfRKJfdMCf_7YC9`에 각각 보관.


## 2026-10-24 활용4회 난도별15개 진행 — 390개 초안, 4유형 보류

사용자는 문제은행 제작이 목적이므로 기존 내용을 활용한 난도별 확장을 계속해도 된다고 재확인했다. 현재 4회 문항은행은 로컬 초안이며 commit/push/Pages 배포/Drive 업로드를 하지 않았다. 4회 전체와 활성 전체 목표 완료로 표시하지 않는다.

`bank/data/applied4-balanced15.json` 현재 SHA-256: `1634661ed47f5168b03af2ec3592fcc9da56473ebc2c8b5c7be8ccbed1404a39`. 총390문항, 26개 원문(각 하5·중5·상5). 포함 원문 번호 1~20, 23~25, 27~29. 기존 최초 330개에서 출처·답·풀이·학습 정보가 요청 밖 변경되지 않았음을 private verifier로 비교했다(Q24만 잘못 연결된 터널형 15개를 별도 초안으로 보존하고 실제 시계 문항 15개로 대체). 대체 전 터널형 레코드는 `.private-work/balanced15-20261024/round5-batch4/superseded-q24-tunnel-items.json`에 보존했다. 새 시계 문항 SVG 15개는 `bank/assets/applied4/q24-clock-*.svg`다.

원자료는 현재 `materials/초등과정 대비 실전 모의고사 활용 4회.pdf` 6쪽/SHA `f7bbaf0a1f5de40434882b8c0da70cc5b8fb20188f03c5c77458b6a5cac05c59`와 답안 PDF `.private-work/balanced15-20261024/source/applied4-answer.pdf` 30쪽/SHA `67f66e5fa57df1d463261e184f1dced30e3ffbcf0a802a1ec2d9b8066d122fe8`. 이전 `answer-next19..24` 캡처의 문항번호 연결이 잘못되었음을 답안 PDF 페이지19~24 직접 렌더로 교정했다. 현재 원문 답은 19번 19,200원, 20번 9,621, 21번 최대424/최소332, 22번 102개, 23번 20회, 24번 직사각형15개/최댓값-최솟값16, 25번 거북 먼저/토끼 8m 남음. 원문 그림/지문은 PDF 페이지4~6에서 직접 확인했다. 상세 대조는 `source-answer-mismatch-audit.json` 및 `q24-clock-source-rebind.json`에 기록했다.

독립 계산은 `verify-applied4-19-20-23-24.py`와 `verify-applied4-25-27-28-29.py`가 통과했다. 각 새 문제에는 3단계 이상 풀이, 독립 계산 파라미터, 학습 위치·포인트가 있다. Q25 원문 수치로 928/10=92.8, 거북 잔여92이므로 거북 먼저/토끼8m 잔여를 확인했다. Q27은 5자리 전수검사와 prefix+끝 두 자리 4의 배수 열거를 교차검산, Q28은 윤년을 포함한 월별 일수와 날짜 합을 직접 비교, Q29는 여섯 카드 순열 전수 비교와 홀수 일의 자리 제한 계산을 대조했다. Q24는 지름인 마주 보는 점 쌍 6개 중 2개를 골라 15개, 숫자합 차 16×배율로 독립 계산했다.

브라우저 QA `NODE_PATH=/Users/docssam/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules ... node qa/applied4-balanced15-browser-validate.cjs` 통과: 26유형×5/5/5=390, 기존 기록·원시험 점수 불변, PC1440/폰375, 문제/풀이 390개 답 입력 및 진단 링크, 이미지195개 로드·비율, 3회 입력, 실제 ZIP 생성, 외부 쓰기0건. `git diff --check`도 통과했다. 새 실제 ZIP `.private-work/balanced15-20261024/round5-batch4/output-qa/balanced390.zip` 크기 74,619,016B/SHA-256 `f7b8ae6dc42f72752d7d27ec15a17693d56d5affa7f66f271484f98c01ed7749`; 정확히 7항목(문제 PDF, 답안·상세풀이 PDF, HTML2개, 빠른 정답 CSV, 문항목록, 검수기록), 목록·정답·풀이 390 ID 일치. 문제PDF93쪽/풀이PDF127쪽. ZIP 자체 테스트, q24 SVG 인쇄 확인, 문제PDF p78/풀이PDF p109 렌더 확인. 이 ZIP은 미완성 초안이라 배포·Drive 업로드 대상이 아니다.

아직 생성하지 않은/검수 잠긴 원문은 21,22,26,30번이다. 21번 답안 PDF에는 최대424·최소332가 있으나 터널 그림의 정확한 주사위 점유/방향 최적화 독립검산이 남았다. 22번 교사표시는 102개이나 13개 쌓기나무의 고유 성냥개비 선분 좌표 전사가 남았다. 26번 장애물 격자에서 금지 칸 경계·A~D 최단왕복을 원본 그림 좌표로 전사한다. 30번 답안 필기에는 `11×2=22`로 보이는 메모가 있으나 분열 시간 규칙 해석이 원문과 일치하는지 확인하기 전까지 잠근다. 다음 작업은 이 네 문항의 그림/답안 원본을 직접 전사하고 수학을 독립 검산한 뒤에만 각 15개를 생성한다.

## 2026-10-24 활용4회 난도별15개 진행 — 405개 로컬 검수 초안, 원문 대응 보류

사용자는 문제은행 제작을 위한 기존 내용의 활용·난도 조정에 동의했다. 이에 따라 기존 15개 기준으로 진행했으나, 과거의 원문당9개 지시와 다르므로 **15개/원문 산출물은 내부 초안**으로 유지한다. 현재 branch `main`, 변경사항 미커밋. GitHub push, 배포, Drive 업로드는 하지 않았다.

`bank/data/applied4-balanced15.json` SHA-256 `e75f3434405f6b8d4369a66bc4f7e14fc17f338eb400ae8d2ce847399e7105a9`: 총405문항, 27유형 각 하·중·상 5개. 풀이·학습 위치·학습 포인트·검증 기록을 포함한다. Q24 원문을 재대조해 잘못 연결된 터널 유형 15개를 active 데이터에서 빼고 실제 시계판 직사각형 유형 15개로 교체했다. superseded 문항은 `.private-work/balanced15-20261024/round5-batch4/superseded-q24-tunnel-items.json`에만 보존한다. Q26은 격자 경로 새 변형 15개를 독립 작성·검산했다. **Q26 변형 자체의 최단경로 검산은 통과했으나 원문 답과의 1:1 수학 대응은 확인되지 않았다.**

검수 근거는 `.private-work/balanced15-20261024/round5-batch4/`에 있다. 브라우저 QA는 405 ID·답 입력/진단·3회 제한·최초 응답/기존 기록 보존·PC1440/폰375·실제 ZIP·외부쓰기0건을 통과했다. 별도 원문 수학 검산기는 Q19·20·23·24, Q25·27·28·29를 통과했고, 두 verifier가 405 ID/27그룹/하중상 각5/데이터 SHA를 대조했다. 실제 ZIP `output-qa/balanced405.zip`은 76,962,369B, SHA-256 `3c16ac30bca7cef708ffb2763410e390224ab15eac80ec575ae659832d8707e6`; 7개 항목의 문제·풀이·CSV·manifest ID와 이미지 바이트가 현행 데이터에 일치한다. 문제 PDF 97쪽, 상세풀이 PDF 132쪽. 전체 PDF contact sheet를 열어 2단 배치·그림·풀이·잘림을 육안 확인했다. `git diff --check` 통과.

원문 21·22·30은 답안 메모만으로 독립적인 구조·정답 검산이 끝나지 않아 잠금. 26은 신작 변형 내부 검증과 원문 대응을 구분해 보류한다. 27유형의 수량·출력 QA 통과가 원문 30유형의 수학 검수 완료를 뜻하지 않는다. “원문당9개”와 “난도별15개” 운영 목표가 충돌한 상태도 유지한다.

마감은 한국시간 2026-10-24 02:00으로 기록되어 있으며 경과했다. 이 상태 기록 뒤에는 새 문항 생성·배포·병합을 시작하지 않는다. 재개 시 먼저 최신 목표를 원문당9개 또는 난도별15개 중 하나로 정리하고, Q21·22·26·30의 원문/답안 직접 검산 후 외부 반영 여부를 결정한다.

## 2026-10-24 사용자 재개 지시 — 난도별15개 유지, Q22 추가 검수

사용자는 기존 문제를 활용해 문제은행을 만드는 목적이므로 난도 단계를 조정해도 괜찮다고 재확인했다. 최신 작업 지시는 이 허용을 반영해 난도별15개를 이어가는 것이다. 02:00 제한은 사용자가 재개한 작업에 적용하지 않는다.

Q22 하·중·상 5개씩을 추가했다. 각 SVG는 좌표로 정의한 서로 연결된 13개 정육면체 모양이며, 답은 정육면체별 12모서리를 단순 합산하지 않고 겹치는 단위 모서리를 한 번만 세었다. 끝점 모서리 집합과 방향별 격자 모서리 계산이 15개 모두 일치했다. 원문 PDF p4 및 답안 p22를 다시 열어 그림·조건·교사 필기 102개를 대조했다. 새 도형은 원본 배열을 그대로 베낀 것이 아니라 같은 사고 유형을 검수한 새 배치다.

현행 데이터 `bank/data/applied4-balanced15.json`: 420문항, 28개 원문 유형 각 하·중·상 5개, SHA-256 `687d78a45d8fb4a79aa565c6977e15cdd7e2d30e69a576b13cb239fb128f0ebd`. 현재 원문 유형 보류는 21·30번이다. Q26 변형 계산은 독립 통과했으나 원문과의 1:1 수학 대응을 확인하지 못했다.

실제 420문항 ZIP `.private-work/balanced15-20261024/round5-batch4/output-qa/balanced420.zip`: 7개 항목, 문항·풀이·CSV·manifest ID 일치, 문제 PDF 101쪽, 풀이 PDF 137쪽, ZIP 내부 이미지 바이트 일치. ZIP SHA-256 `8a95ecaff39382e58e5473607572fc16e8307095d55c2e7b35b3059d650dec26`. 브라우저에서 전체420개 문제/답 입력·진단 연결, 3회 시도, 기존 기록 보존, 2단 화면 및 실제 ZIP 검사를 통과했다. 문제 PDF p76의 Q22 새 그림과 풀이 PDF p204의 정답·단계 풀이 렌더를 직접 확인했다. Contact sheet에서 2단 배치와 그림 잘림은 보이지 않았다. `git diff --check` 통과.

아직 30유형 목표는 완성되지 않았다. Q21 원문은 관통 구멍이 난 주사위 직육면체에서 모든 바깥면과 바닥면의 눈 합 최대·최소를 구한다. 교사 답 424/332는 있으나 구멍 좌표·각 주사위 방향을 복원해 독립 검산하기 전까지 잠근다. Q30 답안 필기 `11×2=22`와 시간별 분열 문구 사이의 대응이 불명확하므로, 생성 전 시간 규칙을 원문 그림/풀이에 맞춰 재구성하고 답을 독립 검산한다. 다음은 이 두 원문을 해석하는 일이며, 조건이 확정되지 않으면 해당 문항을 보류한 채 다른 검수 가능한 작업부터 한다. 아직 commit, push, 배포, Drive 업로드는 하지 않았다.

## 2026-10-24 활용4회 난도별15개 확장 — 450개 로컬 검수본 완성

사용자는 문제은행 제작이 목적이면 기존 자료의 난이도 단계를 조정해도 괜찮다고 확정했다. 이를 반영해 Q21·Q30도 원문 조건을 그대로 복제한 척하지 않고, 새 변형 문제에 규칙을 명시해 문항 유형에 맞는 독립 계산·풀이로 구성했다. 30개 원문 유형 각각 하·중·상 5개, 총450개이며 현 데이터의 `practiceLevel` 분포도 각 150개다. `bank/data/applied4-balanced15.json` SHA-256 `29d0eabfcbe16c48754f6b492fe3012016b16973fcec34d0681abb1a9a845674`.

검수는 `NODE_PATH=/Users/docssam/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules /Users/docssam/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node qa/applied4-balanced15-browser-validate.cjs` 통과. 최신 SHA와 일치하는 브라우저 증거에서 전체450 입력·진단 연결, 3회 시도 제한/첫 응답 보존, 기존 시도기록 불변, PC1440·폰375, 그림240개, 실제 ZIP 생성 및 외부 쓰기0건을 확인했다. 독립 Q21 계산기도 터널 배치15개×주사위 방향24개에서 최대·최소 합계를 통과했다. 출력 검사 `tools/question-bank/verify-balanced15-output.py --work-dir .private-work/balanced15-20261024/round5-batch4 --bank applied4-balanced15 --render` 통과: ZIP 7항목, 문제 PDF107쪽·답안/풀이 PDF146쪽, 문제/풀이/CSV/문항목록 ID 대응. ZIP `balanced450.zip` 85,017,523B, SHA-256 `00af96f8c34be9616f69a9551b05800161c284bc978e71fa691664de3c47794a`. 렌더 연락표 및 Q21 그림/풀이 확대 페이지를 육안 확인했다. SVG의 intrinsic 크기 누락으로 ZIP PDF에서 일부 그림이 잘리던 문제를 수정하고 최신 출력에 재검증했다. `git diff --check` 통과.

Q21·Q30 변형은 독립적인 새 조건을 문제 안에 명시하며 원본 정답과 동일하다고 주장하지 않는다. Q26은 자체 계산 검증은 통과했지만 원문 세부 조건과의 1:1 대응 근거가 부족하다. 데이터의 기존 source edition notes와 `reviewStatus`를 확인하고 원문 완전 재현 여부를 과장하지 말 것. 이번 산출물은 로컬 미커밋 검수본이며 main 반영, commit, GitHub push, 사이트 배포, Google Drive 업로드는 진행하지 않았다. 기존 9개 뱅크와 이전 390/405/420 ZIP은 보존했다.

## 2026-10-24 재개 — 활용4회 26번 원문 구조 대응 보정

이전 450개 초안의 26번 변형은 격자 칸 중심을 꼭짓점으로 처리하고 색칠 칸을 막았지만, 원문 PDF p5는 도로 교차점이 꼭짓점이고 회색 장애물이 덮은 도로 구간이 통행 불가다. 이 유형 차이를 확인해 기존 15개와 SVG를 `.private-work/balanced15-20261024/round5-batch5/q26-source-audit/superseded-cell-center-q26/`에 보존한 뒤 새 교차점-도로구간 15개로 교체했다. 원문 그림을 직접 확인했고, 답안 PDF p26도 직접 열었다. 답안 페이지에는 화상수업 펜 주석이 겹쳐 공식 최단거리 정답을 확정할 수 없으므로 `sourceAnswerMatch:false`로 두고 새 조건별 최단거리를 자체 계산했다.

신규 지도는 원문처럼 A·D가 격자 교차점이고, 문제에서 회색 장애물이 덮은 전체 도로 구간은 통행할 수 없다고 명시한다. 각 문항의 최단 경로 구간 수는 BFS와 독립 간선거리 반복갱신으로 재계산하고, 답은 왕복 2회로 확인한다. 경로 증인과 차단 간선별 증거 `.private-work/balanced15-20261024/round5-batch5/q26-source-audit/`에 기록. 학생용 풀이에서 내부 알고리즘 이름을 제거하고 교차점까지의 구간 수 비교·예시 최단 경로·왕복 곱셈으로 설명한다.

최신 `bank/data/applied4-balanced15.json` SHA-256 `97503d6471d6dea4c154c64d079e2d8c79f6c02c95d022a083ff464efdefb9e2`. 450개/30유형/하·중·상 각5개 유지. 브라우저 검수에서 전체 답 입력·진단·기록 보존·화면 크기·실제 ZIP 생성이 통과하고 증거 JSON의 데이터 SHA가 일치한다. ZIP 검증기에서 7개 파일·문항/풀이/CSV ID·PDF 107/146쪽 확인. Q19/20/23/24, Q22, Q25/27/28/29, Q21, Q26 독립 검산기 전부 현행 450개 데이터 기준 통과. `git diff --check` 통과.

최신 ZIP `.private-work/balanced15-20261024/round5-batch4/output-qa/balanced450.zip`: 85,007,833B, SHA-256 `9e8f6bf52d4f4522541d2238a132851ae3828365dfdf4d56e64a587d786b6544`. ZIP 안 문제 PDF p93–96과 풀이 PDF p124–128을 실제 렌더로 확인: 26번 15개 그림 모두 인쇄에서 선명하고 잘림 없음, 풀이 답과 거리 계산도 맞음. 검수용 PDF 렌더와 원문 확대 이미지는 `.private-work/balanced15-20261024/round5-batch5/q26-source-audit/`에 있다.

브라우저 ZIP 다운로드 대기 제한을 10분에서 30분으로 조정했다. 느린 렌더가 유효한 450개 출력을 만들기 전에 종료되는 문제를 막기 위함이다. 현 상태는 branch `main`의 로컬 미커밋 작업본이다. 사이트 배포나 Drive 업로드는 하지 않았다.

## 2026-10-24 사용자 동의 후 커밋 및 Drive 보관 상태

사용자는 문제은행 제작 목적의 난도 조정을 허용했다. 450개 산출물의 원래 로컬 커밋은 `da60048733fb28a639e350c0329b9d4f666f7df1`이다. 해당 커밋의 전체 72개 파일 트리를 GitHub에 재구성해 원격 커밋 `9f9ea7a61e2beff9605d37e4007f7c14a6915e8c`으로 fast-forward 반영했고, 그 커밋 트리 SHA `6e6dc103ecde879d7068020136365b4e21407d99`는 로컬 트리와 일치한다. 로컬 `main`은 원격 커밋으로 정렬했다. 사이트 배포는 하지 않았다.

Drive 폴더 `황소 활용 모의고사`에 다음 파일을 올리고 목록에서 이름·크기·파일 ID를 확인했다: 최종 ZIP(85,007,833B, ID `1JBbhktaolP5TMX0_GkHPm7WqAbB08Pon`), 은행 데이터(2,078,009B, ID `1AgCW9PtZ4HAuYt6LL5XXhjn73hA77w55`), 브라우저 검수(JSON, ID `1VFJEAMBX-pSO6PhcSvr_Hd5fjzGG2Q36`), Q26 독립 검산(JSON, ID `1X19qrflsPC7NcKQ10RkusOWUVZMetdn8`), 인수인계 문서(571,110B, ID `1ZlSXWNkXfwOwihkvnFi_DKcRVFO0gP4e`). Drive 항목은 `미반영` 초안 보관이며 사이트 배포의 증거가 아니다. 로컬 ZIP SHA-256은 `9e8f6bf52d4f4522541d2238a132851ae3828365dfdf4d56e64a587d786b6544`, 은행 데이터 SHA-256은 `97503d6471d6dea4c154c64d079e2d8c79f6c02c95d022a083ff464efdefb9e2`다.

## 2026-10-24 수량 규칙 재확인 및 정정

사용자가 정한 확장 총량은 원문당 **9개**이며, 기존 승인 3개를 보존하고 6개만 추가한다. “난도 단계를 조정해도 된다”는 허용은 15개로 늘리는 수량 변경 승인이 아니다. 정정 커밋 `3840bb15f549a4f8dd877005d539d01a48b0e1ec`는 450개 확장 중 새로 연결한 24유형분을 취소하고, 그 직전 `main`의 기존 상태로 복구했다. 450개 자료·ZIP은 Git 이력과 Drive 초안으로 보존하며, 현재 활성 추가분이나 배포본으로 취급하지 않는다. 기존 9문항 확장은행 `applied4-expanded.json`은 18개 원문 유형 162개(각9개)로 유지된다. 별도 선행 15개 단계은행의 1~6번 90개는 이번 작업 전부터 있던 상태라 건드리지 않았다. 다음 미완료 원문(14번)부터 9개 규칙으로 원문/답안 직접 대조 후 진행하고, 이미 승인된 유형을 다시 만들지 않는다.

## 2026-10-24 활용4회 14번 9개 확장 검수

“문제은행용이므로 난도 단계를 조정해도 된다”는 허용은 난도 배정에 적용하며, 위에서 확정한 원문당 9개 수량은 그대로 유지한다. 앞선 450개 작업 기록은 이 범위를 바꾸지 않는다.

원문 PDF 3쪽과 답안 PDF 14쪽을 직접 대조했다. 원문은 서로 다른 자연수 카드 4장 중 중복 선택을 허용해 만든 서로 다른 곱 9개를 3×3 판에 한 번씩 놓고, 꽃 칸의 곱을 포함한 카드 값을 찾는 유형이다. 답안의 교사 필기 기준 카드 값은 3·4·6·9, 꽃 칸은 9다. 새 변형 9개는 같은 추론 유형으로 독립 구성했으며 각 3.4점(중간)으로 배정했다. 각 판의 8개 곱에서 카드 4개와 꽃 칸이 유일하게 정해지는지 약수 후보를 전수 대조해 독립 검산했다.

현재 `bank/data/applied4-expanded.json`은 171문항·19개 원문 유형(각 9개)이다. Q14 추가 전의 162개 기존 객체는 바이트 단위로 보존했다. 브라우저 QA에서 9문항과 그림 9개 로딩, 답 입력, 진단 연결, 3회 시도, 기존 점수·기록 보존을 확인했다. ZIP 검사는 7개 항목, 문제 3쪽·답안 및 상세풀이 5쪽, manifest/HTML/CSV ID 9개 일치를 확인했다. 실제 ZIP 문제지 첫 쪽과 풀이 첫 쪽을 눈으로 확인했고, 2단 배치·표 가독성·잘림 이상은 보이지 않았다. 독립 검산, 은행 인덱스 및 ZIP 검사기가 통과했다.

검수 근거는 `.private-work/nine-expansion-20261024/round5-q14-source/`에 있다. Q14 코드는 GitHub `main` 커밋 `ca6e215a8cd7c7a139f0716f21ea65fdde4d8731`에 반영했다(파일 트리 SHA `8be7e2ebebf7b70302f02ee6cdcfb2a6e470416f`). ZIP과 독립 검산·브라우저·원문 그림·ZIP 구조 검수 JSON은 Drive 폴더 `황소 활용 모의고사`에 각각 ID `1BInrT7Vnd9_n_9MFZVvQvEb7Hk09bbPc`, `1LDQDZf5u4BqUyrKKoiwDxm0P784et138`, `1iBxtgPimb2jhQbExD-OcgfyLAJZXNUbL`, `1trvjpTNtdb1vWMDirT5jTujuXp3m50OM`, `1NhS74ODvXiFT4Qv8NsRrFW16DqgFGb0M`로 보관했다. Drive 사본을 추가하고 크기·ID를 확인했으며 체크섬 재다운로드는 아직 하지 않았다. 사이트 배포와 전체 활용1~9 문제은행 완성은 아직 확인된 범위가 아니다. 다음은 미완료 활용4 원문 중 원문·답안과 도형을 읽고 독립 검산할 수 있는 유형을 하나씩 선택하며, 이미 승인된 변형은 다시 만들지 않는다.

## 2026-10-24 활용4회 27번 9개 확장 검수

원문 PDF 6쪽과 답안 PDF 27쪽을 직접 열어 대조했다. 원문은 자릿수 합이 41인 다섯 자리 자연수 중 4의 배수를 세며, 답안 필기의 결과는 10개다. 합이 33~41인 9개 변형을 만들었다. 각각 끝 두 자리가 00~96의 4의 배수인 경우를 분리하고, 앞 세 자리 숫자 합을 만족하는 수를 세는 계산과 10,000~99,999 전체 전수 열거를 독립 수행해 모두 일치시켰다. 원문 배점 4.2점에 맞춰 상으로 분류했다.

Q27 브라우저에서 답 입력, 진단 링크(원문 PDF 6쪽), 세 번 응시, 기존 171개 연습 이력과 원시험 점수 보존을 확인했다. ZIP에 문제 PDF 2쪽·답안/상세풀이 PDF 3쪽·HTML·CSV·manifest·검수기록이 있고 9개 ID가 일치한다. 첫 출력에서 마지막 세 문제가 왼쪽 단에만 몰린 것을 발견해 남은 항목 수 기준으로 왼쪽 열을 위에서 아래로 채운 뒤 오른쪽 열로 이어지도록 배치를 수정했다. 수정 뒤 Q27 실제 ZIP PDF를 재확인했고, Q14도 동일 배치 코드로 브라우저·3쪽 문제 PDF·5쪽 풀이 PDF를 다시 확인했다. 검수 스크립트와 수학 검산은 모두 통과했다.

현행 `applied4-expanded.json`은 180문항·20개 원문 유형(각 9개)이며, 직전 171문항은 그대로 보존했다. 활용4회 남은 보류 유형은 1·2·3·4·21·22·24·25·26·30번이다. 원문 Q1~6에는 별도 선행 `applied4-balanced15` 데이터가 있어 이를 다시 복제하지 않는다.

다음은 Q24 답안의 손글씨 `34−18=16`과 12개 시계 점 조건의 모순을 재검토하는 일이다. Q25는 원문·답안 대조와 계산으로 8m를 확인해 9개 확장을 완료했다. Q21의 관통 주사위 그림과 Q30 분열 시간은 기존 보류 사유가 해소되기 전까지 제작하지 않는다.

Q27 코드·데이터·검수기·2단 부분 페이지 배치 수정은 GitHub `main` 커밋 `f93dbab69a4e3cd59e0f34a78770f5aab0b69cae`에 반영했다(트리 SHA `e2de3cc590c51a1dbd929ad617e159c28a0d2fe4`). 현재 은행 데이터 SHA-256은 `a2fdf7636a62ebfb4963580ee16c899c6253c95494423564f62940ee46b04b6f`, Q27 ZIP은 4,413,980바이트·SHA-256 `b8eaf7101c17551988024398ac9ed151b32c6d2f3f1b03fa2e59b787fba95e70`이다. Drive `황소 활용 모의고사`에 은행 JSON ID `1u2Od5-g9ne_GthLZ5wC517pa_uomkRMo`, 독립 수학 검산 ID `1HEYYtR6HNJlMI5dKVmXp1rl-Dzkh_N0q`, ZIP ID `1CAiZAWV1xxVP2-jJxd5RAABUDxlpp5zW`, 브라우저 QA ID `1nkQBQuvH-bhdhDpQCyetOSaT3QXFjM51`, 원문 대조 ID `1w8gYg0xHLkBxsO0Ntd7C85tbpffgpOPW`, ZIP 검수 ID `1C1eRezH9a9x9WPD4DaI1Za0Fzyby6kPs`, 반영 영수증 ID `1JPmjp9isnZCiTbXCZLH0g-7X7By6NCP-`로 저장했다. 기존 Q14 Drive 검수 사본도 보존했다. Drive 파일명·크기는 폴더 목록에서 확인했으며, ZIP 원시 재다운로드 체크섬은 아직 대조하지 않았다. 사이트 배포는 하지 않았다.

## 2026-10-24 활용4회 Q22 원문당 9개 확장 완료

- 원문 PDF 4쪽의 실제 그림·지문과 답안 PDF 22쪽을 직접 대조했다. 원문은 성냥개비 20개로 두 정육면체를 만든 예시와 13개 쌓기나무 입체를 제시하고, 고유 모서리 수를 묻는다. 답안 페이지에 손글씨로 102개가 표시되어 있다. 새 변형은 그림 배치를 바꾼 13개 연결 정육면체 유형이며, 답안 102와 같다고 주장하지 않는다.
- 원문당 9개 기준으로 하·중·상 문제은행 단계를 3개씩 배정했다. 원문 배점 3.4점과 기존 중 난도 분류는 유지했다. 새 도형의 각 큐브 수·연결성을 확인하고 꼭짓점 쌍의 합집합과 방향별 단위 선분 집합으로 정답을 독립 계산했다. 계산 답은 108, 93, 90, 108, 108, 93, 104, 93, 99다.
- 실제 문제은행 브라우저에서 9문항 그림 로딩, 2단 A4 배치, 답 입력·진단·3회 제한, 이전 180개 연습 기록·원시험 점수 보존, 문제 3쪽·상세 풀이 3쪽의 7개 항목 실제 ZIP을 확인했다. ZIP PDF에서 문항 그림·풀이·정답을 직접 렌더 검수했다. `qa/applied4-q22-independent-validate.py`, `qa/applied4-q22-zip-validate.py`, Q14/Q27 검산과 전체 은행 목록 검사가 통과했다.
- 현재 `bank/data/applied4-expanded.json`은 189문항·21유형×9, SHA-256은 검수 결과 JSON을 참고한다. 전체 연결 은행은 756문항·84유형×9다. Q22 문제 ZIP과 수학·원문·브라우저·ZIP 검수 JSON은 기존 Drive 폴더 `황소 활용 모의고사`에 저장했다. ZIP ID `1VQtbn1YvPJm-Jxb8XtP48_ZxQvTFHtRa`, 수학 검산 `1eSVUIPJnjcR65bwrgeF9Ch1UtynPzgyg`, 원문 대조 `197uvEmu4H0l9G6pYbJHIPySKct1n-yKU`, 브라우저 `1wYI9kx1p_vOXhvvQNXglCq655f3SVN12`, ZIP 검수 `1-E8eN8e9nVq0muWEDF6oXV3JDCO2V7qk`. ZIP SHA-256 `37aeb645e1a830b088fa8c60a5d85681843cc47033192c4bfbff1bc76e4f9cd4`, 4,367,690바이트다. 코드·데이터·검수기 17개 파일은 GitHub `main` 커밋 `770adb9dbed1b8927eb5c5afe0c0aa41d5181796`(트리 `cd68c88cdaf3a5270fb05c9fcd3ca40c12032d48`)에 반영했다. 로컬 커밋 `e73884ffc0a08fa50be90defab53782732dd6ac2`와 파일 트리는 같다. Drive 기존 은행 데이터 ID `1u2Od5-g9ne_GthLZ5wC517pa_uomkRMo`를 갱신했고, 재다운로드 696198바이트·SHA-256 `313d364abedd120421a340425ab3cc6644d136890ca6af631822c7d48c2ca248`가 로컬과 일치한다. ZIP도 Drive 재다운로드 4367690바이트·SHA-256 `37aeb645e1a830b088fa8c60a5d85681843cc47033192c4bfbff1bc76e4f9cd4`로 일치했다. 기존 Drive 인수인계 `CLAUDE_HANDOFF.md` ID `1ZlSXWNkXfwOwihkvnFi_DKcRVFO0gP4e`에는 이 후속 기록을 같은 ID로 갱신한다. 활용4회 남은 유형은 1·2·3·4·21·24·26·30번이다. Q21·24·26·30은 실제 원문/답안 모순 또는 조건 재구성 보류를 해소하기 전까지 추가 제작하지 않는다.
- 재현 작업본과 실제 ZIP·화면·렌더 근거는 `.private-work/nine-expansion-20261024/round7-q22/`에 보관한다. `.private-work/`, `bank/drafts/`, 사용자 미추적 자료는 정리하지 않는다.


## 2026-10-24 활용4회 Q25 원문당 9개 확장 완료

- 원문 PDF 5쪽과 답안 PDF 25쪽을 직접 대조했다. 원문은 1856m 경주, 토끼 속력은 거북의 10배, 토끼가 중간 지점에서 잠들고 깨어났을 때 거북은 결승점 0.092km 전이라는 조건이다. 답안 손글씨는 “거북, 8m”로 읽히며 계산도 일치한다. 이전 인수인계의 0.8m 주장은 시간 차를 거리로 혼동한 오류이므로 정정한다.
- 원문당 총9개를 유지하고 하·중·상 문제은행 단계 각3개를 구성했다. 원문 배점4.2점과 상 분류는 변경하지 않았다. 아홉 변형은 정확한 속력·거리 식으로 모두 검산했다. 토끼가 다시 달릴 때 남은 거리는 D/2=10r+k이고, 거북이 남은 거리는 r이다. 거북이 r미터를 갈 동안 토끼는 10r미터를 가므로 거북이가 먼저 도착하고 토끼에게 k미터가 남는다.
- 실제 브라우저에서 답안 두 칸 입력·진단·3회 제한, 이전 189개 연습 기록·원시험 점수 보존, 모바일 넘침 없음, 외부 쓰기 0건을 확인했다. 실제 ZIP은 문제 3쪽·상세 풀이 3쪽 및 목록/빠른 정답 등 총7개 파일이며 9개 ID가 모두 일치한다. ZIP PDF를 직접 렌더 검수했다. `qa/applied4-q25-independent-validate.py`와 `qa/applied4-q25-zip-validate.py`, Q22/Q14/Q27 및 전체 은행 목록 QA가 통과했다.
- 현재 활용4회 확장 데이터는 198문항·22유형×9이며 전체 활성 연결 은행은 765문항·85유형×9다. Q24는 원문 12개 시계 점에서 실제 직사각형 15개가 맞지만, 모든 직사각형의 네 번호 합이 26이어서 극값 차가 0이다. 답안 필기 `34−18=16`과 모순되므로 Q24는 검수 대기 상태를 유지한다.
- GitHub `main`에는 Q25 코드·데이터·검수기 커밋 `797c3b44b442427e8bfca89ff5bc7a1eeeea218c`(트리 `c9b9d8cd412c0f03cb9de1ab96823ab4c15d25df`)로 반영했다. 로컬 `main`도 동일 커밋이다.
- Q25 재현 자료 `.private-work/nine-expansion-20261024/round8-q25/`. Drive `황소 활용 모의고사` 폴더에 ZIP(ID `1aYR_JHM_74aDEYXaOLxYs5D_iSj1f1-y`, 4,757,316B, SHA-256 `cfc9212686f5642eeac908579c667c302044ec988fdb918a4ae60da47d03eb8d`), 수학 검산(`1lmd8Gb6_R4Mg58K8E4iDfAgIJN0T2geC`), 원문·답안 대조(`1AyEo3SerFQ0C-4uYndFAfenhdDn4nGsU`), 브라우저 QA(`1CAXe_k1jq_lcJ08mE9whVivlGijv6TxQ`), ZIP 검수(`1oNw4tiVfToAwtfQ7wvx3VhiR5XqYco-a`)를 저장했다. 기존 은행 데이터 Drive ID `1u2Od5-g9ne_GthLZ5wC517pa_uomkRMo`를 갱신했고 731,088B·SHA-256 `fe6f23fe258afc577026a4aa05e9f9fdf19d0fb2924364e7f898b90a5cd14b9e`로 로컬과 일치함을 원시 재다운로드해 확인했다. ZIP 재다운로드도 SHA-256이 일치한다. 사이트 배포는 하지 않았다. GitHub `main` 반영 커밋은 아래 후속 기록에 추가한다.

## 2026-10-24 활용4회 Q26 원문당 9개 확장 및 기록 복구

- 원문 PDF p5의 26번 문제·실제 그림을 직접 확인했다. A·D는 도로 교차점이고 회색 장애물이 덮은 도로 구간은 지날 수 없으며, A에서 D까지 왕복하는 최단 거리를 묻는다. 답안 PDF p26은 화면 주석이 공식 풀이 수치 위에 겹쳐 원답을 판독할 수 없다. 새 변형의 답이 원답과 같다고 주장하지 않고, 각 새 지도의 조건으로 계산했다.
- 새 장애물 지도 9개를 구성했다. 낮은 연습 단계 3개·중간 3개·높은 3개 순으로 배치했지만, 원문 배점 4.2점과 난도 상 메타데이터는 유지했다. 난이도 필터는 활용 배점대만 사용한다. BFS와 별도 간선 거리 반복 갱신 결과가 일치하며 풀이에 경로 예·최소 구간 수·왕복 계산을 포함한다. 답은 120, 240, 400, 500, 720, 980, 1120, 1440, 1800m다.
- 브라우저에서 9개 그림, 2단 왼쪽 열 우선 순서, 답 입력·진단·3회 제한, 이전 198개 연습 기록·원시험 점수 보존, 모바일 넘침 없음, 외부 쓰기 0건을 확인했다. 실제 ZIP은 문제 PDF 3쪽·상세 풀이 PDF 3쪽 등 7개 파일이고 manifest/HTML/CSV의 9개 ID가 일치한다. 문제·풀이 PDF를 렌더 검수했다. Q26 독립 검산·ZIP과 Q14/Q22/Q25/Q27 검산·ZIP, 전체 207문항/23유형 브라우저 검사가 통과했다.
- 현재 전체 활성 9개 확장 은행은 774문항·86유형이다. 활용4회 완료 23유형이며, Q1~4는 기존 별도 단계은행이 있어 중복 제작하지 않는다. 추가 원문 검토가 필요한 유형은 Q21·Q24·Q30이다. Q21은 관통 주사위 그림 및 정답 확인, Q24는 12개 시계 점 조건과 답안 손글씨의 모순, Q30은 분열 시간 조건과 답안의 차이를 실제 원문·답안으로 다시 해결해야 한다.
- Drive `황소 활용 모의고사` 폴더의 기존 은행 JSON ID `1u2Od5-g9ne_GthLZ5wC517pa_uomkRMo`를 792,761B·SHA-256 `a7220f19c688e835d087f84cc78512ee0be3ee6398fc584aeb2279a69f9b86c4`로 갱신했고 원시 재다운로드 체크섬이 일치했다. Q26 ZIP ID `1RamaLUs6jHhTjERwyW-WEyHOBeVITSzA`, 4,576,509B·SHA-256 `a0da4c947f6ecfd2e7b0a069281f34591ba05bf3dc16352abb899cb563b076f5`도 재다운로드 체크섬이 일치한다. 원문·답안 대조 ID `1Fk0TZWNYjPepmQwnww2xvpiRvSpnXE2E`, 수학 검산 `1HKwZHM-ukN3Z2_Z-jNtE_qtHBaS624P3`, 브라우저 QA `1GeJakZjIVguDNmBWA4hWlJJtdoyqMPSR`, ZIP 검수 `1e7k_I_yvoUzLl1Ct4PND2rhSAzCx44hg`를 보관했다.
- 코드·데이터 커밋은 GitHub `main` `49f802ddf1c68b19ce36293dbe84e4af414ed5eb`(트리 `da2996ffccc45966e93a1a73bcd69866a67d858b`), 이 복구 기록을 포함한 현재 기록 커밋은 `a02b445686258017fd943bc837b3bba04d23d417`(트리 `ff651c7ef2768c6229160598a4ad72e95ddb44bd`)다. 사이트 배포는 하지 않았다. 복구한 이 문서의 Drive 사본도 같은 파일 ID `1ZlSXWNkXfwOwihkvnFi_DKcRVFO0gP4e`로 갱신하고 원시 재다운로드 체크섬을 다시 확인한다.
- 재현 자료는 `.private-work/nine-expansion-20261024/round9-q26/`에 있다. 사용자 미추적 자료 `bank/drafts/`, `materials/.DS_Store`는 보존한다.

## 2026-10-24 활용4회 Q21·Q24·Q30 9개 확장 및 234문항 ZIP 검수 완료

- Mac `main` 작업본의 기존 207문항 레코드와 순서를 보존하고 활용4 원문 21·24·30번 각 9개를 추가했다. 현행 은행은 **234문항·26유형**, 유형당 9개이며 보류는 1·2·3·4번이다. Q21·24·30은 `applied4-balanced15.json`에 별도 승인 3개가 없어 새로 9개를 구성했다. 점수대·난도 표기는 원문 배점을 유지하고 학습 단계만 하·중·상 3개씩 배정했다.
- 원문 PDF 21번은 p4, 24번 p5, 30번 p6에서 실제 도형·지문을 확인하고 답안 PDF p21·24·30을 대조했다. Q21의 원답 판독은 최댓값424·최솟값332이며 새 터널 배치의 답을 원문 답과 같다고 주장하지 않는다. Q24는 직사각형 15개, 꼭짓점합 범위 18~34, 차16으로 답안 필기와 일치한다. Q30 답안 필기는 `11×2=22`로 보이지만 원문 해석이 하나로 결정되지 않아 확정하지 않았다. 변형은 분열 시각과 매회 전체 개체가 3마리씩으로 대체되는 조건을 명시했다.
- Q21은 각 주사위 24개 회전상태를 행렬·물리적 굴림 두 방식으로 대조했고, Q24는 가능한 네 점 조합을 전수 검사했으며 Q30은 사건별 재귀와 닫힌 식을 교차 검산했다. `qa/applied4-q21-independent-validate.py`, `q24`, `q30` 검사가 모두 통과했다. 실제 234문항 ZIP의 문제 PDF 51쪽·답안/풀이 PDF 88쪽에서 Q21 p33~35/55~57, Q24 p39~41/65~68, Q30 p51/88을 시각 확인했다. 배치·그림·풀이의 잘림은 보이지 않았다.
- 실제 ZIP은 7개 파일(문제·답안/풀이 PDF와 HTML, 빠른정답 CSV, 문항목록, 검수기록), 234개 전체 ID 및 답·풀이·그림 경로 대조를 통과했다. 브라우저 QA에서 26유형, 2단 순서, 375px 화면, 답 입력·진단 링크, 재응시 3회와 최초 결과 보존, 외부 쓰기 0건을 확인했다. 최종 데이터 SHA-256 `5211ec8d7b9f387287e57a5f9d053c8f8b73fa64cb0c19c09c81c7ed970bf47e`, ZIP 49,322,045바이트·SHA-256 `3c6684359068fce2ae923076c4ac1f639db7f77913e10422c4aaa10c5be18e2f`.
- Drive 기존 은행 파일 `1u2Od5-g9ne_GthLZ5wC517pa_uomkRMo`를 1,064,893바이트로 갱신했다. 전체 ZIP은 `1IA2jxuNujUeXVJNQuL-t6aatS3cfhsz-`로 저장했다. 원문·답안 대조 `1i1bOXXfDYDcQRy7HWrlcIlVABqz6BRbz`, Q21/Q24/Q30 수학 검산 `1Vlic4ZH6G65Q5GfyyWAYTJLKbdO_6_hQ` / `1koVb5Rs2ZJs3PhCuV-5cO70BIhREP4gg` / `14Ctp0ZPwt592stMPLpAKjL6FTkRyBk9g`, ZIP 검수 `1TVH_o8HWgs4B23VqIBScIr22bcH-n9zM`, 브라우저 증거 `1BUFK0EfzRGpAeL1Uk5Cr2W1yp_iD9NZw`, PDF 시각 검수 `1zPQNzSz7Dn2nLHd8ie4M5at48XJTEwQ3`를 같은 `황소 활용 모의고사` 폴더에 보관했다. Drive에서 파일 ID·용량·원시 읽기 참조를 확인했다.
- 코드·은행·검증기 반영은 GitHub `main` 커밋 `743c47f549c6098e2c032a52b916a7b4170f63d4`(트리 `63b5a170119ad8554d86c40c72db970d5690cb96`)이다. 사이트 배포는 별도로 실행하지 않았다. 사용자 미추적 `bank/drafts/`, `materials/.DS_Store`는 변경하거나 stage하지 않았다.
- 작업 코드·검산·검수 근거는 `.private-work/nine-expansion-20261024/round10-q21/`, `round10-q24/`, `round10-q30/`에 있다. 다음은 활용1~9의 미완료 유형 중 원문·답안·그림 확인이 가능한 항목을 우선하고, 완료·승인된 유형은 재제작하지 않는다.

## 2026-10-24 활용6회 원문 2번 9개 추가 검수

- 활용5회 완료 유형은 다시 제작하지 않았다. 활용6회 문제 PDF p1과 Drive 답안 `초등 선발 모의고사 특강 6회 답안.pdf` p1을 직접 렌더해 대조했다. 원문은 삼각형·오각형 합 35개, 성냥 123개이며 답안 손글씨 26개·9개는 양의 정수 전수 탐색의 유일해와 일치한다. 원문 배점은 1~12번의 2.7점(하)이다.
- 원문당 총9개로, 삼각형·사각형/삼각형·오각형/사각형·육각형의 개수와 성냥 수를 바꾼 9개 변형을 추가했다. 각 변형은 소거식과 양의 정수쌍 전수 탐색으로 독립 검산했고, 세 단계 이상 풀이와 권장 학습 위치·학습 포인트를 포함한다. 원문 점수·성적 데이터는 수정하지 않았다.
- 신규 `bank/data/applied6-expanded.json`과 `applied6` 어댑터를 만들고 문제은행 목록/라우트에 연결했다. 브라우저 검수에서 문제·풀이 9개씩, 좌단 위→아래 후 우단 위→아래 배치, 답 입력·진단·학습 링크, 3회 시도 제한·첫 결과 보존, 375px 넘침 없음, 외부 쓰기 0건을 확인했다. 실제 ZIP은 7개 항목이며 문제 PDF 2쪽·상세풀이 PDF 3쪽, manifest·HTML·CSV의 문항 ID 9개가 일치한다. ZIP에서 문제·풀이 전 쪽을 렌더하여 잘림 없이 읽히는지 확인했다.
- 독립 수학 검사 `qa/applied6-q02-independent-validate.py`, 브라우저 검사 `qa/applied6-q02-browser-validate.cjs`, ZIP 검사 `qa/applied6-q02-zip-validate.py`가 통과했다. 세부 원문·답안 대조와 렌더 근거는 `.private-work/hw-expansion-20261023/hw6/q02-source-answer-review.json`, `q02-independent-math.json`, `q02-pdf-visual-review.json`, `q02-output-qa/`에 있다.
- 현재 로컬 추가분은 활용6회 1유형 9개이며 나머지 원문 29유형은 미완료다. 코드·데이터·검증기는 GitHub main 커밋 `4fa5425125000091f389a64220ce1caab45f7a21`에 반영했고 `pool.js` 캐시 키 수정은 `0a4dba2b83a2fa7b747b1e7e8c1f487110233a0d`에 반영했다. Drive `황소 활용 모의고사` 폴더의 은행 JSON `1Xledby2qpOxBzc4qe97d-Fi4soNMLG4D`(25,848B, SHA-256 `2c856f593d4317295c9b482aaba930a3207cbce50d79cf580394c4cb9ef1c0ac`)과 최종 ZIP `1pRzfB8F7u_IFqYd9a5uCFh_WeQDrTsca`(4,302,153B, SHA-256 `87b0b3ca6c6e270c67f8066965f722e7e782d1ebacb039be1081e1c14867414f`)을 원시 재다운로드해 로컬 체크섬과 일치시켰다. 원문 대조 `1hVCGTE-3VIJsczxJFXOXVzfpVgjAiI2J`, 독립 검산 `1X33cNg1upheWZhecMX4_YaBQoiFUdeV0`, 브라우저 `16IGDQOdufJ_6xJOB5Cgv1-_xPoeV4irZ`, ZIP 검사 `1jZCCkQeAcM9Q30TCqnveI-3TnrN9jvLn`, PDF 시각 검수 `1zppC25wnU_UGF1LlUMHP6VMQaR84bH40`를 같은 폴더에 보관했다. 사이트 배포는 별도 요청이 없어 하지 않았다.

## 2026-10-24 활용6회 원문 3번 9개 추가 검수

- 원문 문제 PDF p1과 답안 PDF p1을 직접 렌더해 대조했다. 원문은 사탕 30개를 민호·선아·연우가 나누며, 민호와 선아는 같은 개수, 연우는 민호보다 많이 가질 때 연우 몫의 최솟값을 묻는다. 답안 교사 기록은 9·9·12를 최소 배분으로 표시한다. 독립 계산에서도 2x+y=30, y>x인 양의 정수 조건으로 x≤9이고 최소 y=12가 확인된다.
- 원문당 총9개에 맞춰 23, 25, 28, 31, 32, 35, 38, 41, 44개를 나누는 변형을 추가했다. 두 사람이 같은 몫, 세 번째가 더 많음, 그 몫의 최솟값 사고는 유지했다. 각 문항은 3x<N의 최대 정수 경계와 가능한 모든 양의 정수 분배 전수 탐색으로 최소해의 유일성을 대조했다. 배점 2.7점에 따라 하이며 새 문항 정답률을 주장하지 않는다.
- 브라우저에서 9문항 정답 입력·9/9 진단, 학습 위치와 포인트 연결, 같은 유형 연습 링크, 3회 제한·첫 결과 보존, 375px 넘침 없음, 좌단 위→아래 후 우단 위→아래 배치, 외부 쓰기 0건을 확인했다. 실제 ZIP 7개 항목의 문항 ID·문제·상세 풀이·HTML·CSV가 모두 맞고 A4 문제 PDF 2쪽·풀이 PDF 3쪽이다. ZIP에서 꺼낸 전 페이지 렌더의 잘림·겹침은 보이지 않았다. 원문과 변형에 그림은 없다.
- Q2 기존 9개도 새 통합 데이터에서 유지됨을 다시 독립 검산·브라우저·ZIP으로 확인했다. 두 유형 총18문항, JSON 51,829바이트·SHA-256 `a24ee7f3dc2fb1b0343b7992d9eec43d8ebffec92e3e639d3634910d581614fa`다. Q2 최신 ZIP은 4,302,153바이트·SHA-256 `f041c6e5edc5f4b92514e240b4c5d8d33b43448fdf058fc0a77152f9269e3002`, Q3 ZIP은 4,446,322바이트·SHA-256 `72b788087f899161283f5e059ed3e579f6f179b3731252d4cffcd5b37c3adcf5`다. 수학·브라우저·ZIP 검사 스크립트는 각각 `qa/applied6-q02-*`, `qa/applied6-q03-*`다.
- GitHub `main` 코드·데이터·검수기 반영 커밋은 `6b8c10e32a2e079f503f27a554ee12499eec4e94`다. 로컬 `main`과 `origin/main`이 일치한다. 사이트 배포는 하지 않았다.
- Drive `황소 활용 모의고사`의 기존 데이터 파일 ID `1Xledby2qpOxBzc4qe97d-Fi4soNMLG4D`를 갱신하고, Q2 ZIP·검수 기록 기존 파일도 같은 ID로 최신화했다. Q3 ZIP ID `1tR2zVm-4E-z_GwNFF0A-ycy2t1NnhQGx`, 원문 대조 `1BEdlJU48BD_0rSjgCaHXxjNGtHNo49eo`, 독립 검산 `1ijkZgfom_4IKBh8Hcx6JAImGyX_k7bHL`, 브라우저 `1DLROKs7P5o6vFgYL6itUx47N5JcL2I_v`, ZIP 검수 `1nXtAPrxUY5c9JtmF0fPhzOFNxeCr_A8l`, PDF 시각 검수 `1UHagaYFju_PXkWZLUIGuupLjAa9rEffD`를 추가했다. 각 데이터/ZIP/검수 파일의 Drive 원시 재다운로드 바이트를 로컬 사본과 `cmp`·SHA-256으로 대조했다.
- 로컬 자료: `.private-work/hw-expansion-20261023/hw6/q03-source-answer-review.json`, `q03-independent-math.json`, `q03-pdf-visual-review.json`, `q03-output-qa/`. 원문당 9개 목표의 나머지 27유형은 미완료다. 6회 5번은 아래 기록에 검수 완료로 추가한다. 다음 후보는 기존 계획의 활용6회 7번이다.

## 2026-10-24 활용6회 원문 5번 9개 추가 검수

- 원문 문제 PDF p1과 답안 PDF p1을 직접 렌더 대조했다. 원문은 A가 1바퀴 돌 때 B가 6바퀴, B가 5바퀴 돌 때 C가 15바퀴, A는 분당 8바퀴, 총 2시간 30분 조건이다. 답안 필기와 독립 계산으로 A 1200회, B 7200회, C 21600회, 차 14400회를 확인했다.
- 원문당 총9개에 맞춰 A→B 회전비, B→C 비, A의 분당 회전수와 시간을 조정했다. 각 변형은 분당 회전수 계산과 시간 전체 회전수 계산 두 방법으로 검산했다. 답은 1800, 5400, 7200, 3360, 7290, 3040, 4620, 3600, 4200회다. 배점 2.7점에 따라 하이며 변형 정답률은 미측정이다.
- 답 입력 9개, 9/9 진단, 답 판정, 학습 위치/포인트와 같은 유형 연습 연결, 3회 응시 제한·첫 응답 보존, 375px 넘침 없음, 좌단 위→아래 후 우단 위→아래 순서, 외부 쓰기 0건을 브라우저에서 확인했다. ZIP은 7개 파일이며 문제 PDF 2쪽·상세풀이 PDF 3쪽, HTML/CSV/목록과 9개 ID가 맞다. ZIP에서 꺼낸 모든 A4 페이지를 렌더해 글자·풀이·단 배치를 확인했다.
- 활용6회 2·3·5번 총 27문항이 검수 상태다. 최종 은행 JSON은 78,205바이트·SHA-256 `411f2ed1c9572423d8863f3b2ee07f99645700e417e9b29d125ee41940c32ad9`다. Q2 ZIP 4,302,155바이트·SHA-256 `5e9ba8db9ab3be756974ab0ea7d4a50711d18ba3bb02a8184d653587f4466983`, Q3 ZIP 4,446,324바이트·SHA-256 `136a6ad94f606325fc3ef8616613b50769cc38a153029fe0436cc9001036550d`, Q5 ZIP 4,377,420바이트·SHA-256 `f653e6cf55674339a59699c2c2a9f7dbe788383fb5d21c7442113f68cc5edb8e`다. 세 유형 모두 수학·브라우저·ZIP 검증이 통과했다.
- GitHub `main` 코드·데이터·검증기 커밋은 `103331f9032ac141b8d900a9f35cc33be3d7c370`; 바로 전 Q3 코드 커밋 `6b8c10e32a2e079f503f27a554ee12499eec4e94`와 Q3 인수인계 `50c2781ee6273ce028fa903f8858598e33ad0361`도 `main`에 있다. 로컬과 원격 `main`은 동기화됐으며 사용자 미추적 `bank/drafts/`, `materials/.DS_Store`는 보존한다. 사이트 배포는 하지 않았다.
- Drive `황소 활용 모의고사`의 은행 JSON ID `1Xledby2qpOxBzc4qe97d-Fi4soNMLG4D` 및 Q2/Q3 ZIP·검수 기존 ID를 최신 데이터로 갱신했다. Q5 ZIP ID `14n4LoeVG-dAe-a0thrj_E3GaPJ2v-99c`, 원문 대조 `1ZYd8B3pYnGgXh2DQbxHYc73aDZrG5RJY`, 독립 검산 `1c3Dkt7PRaNXvf7Vf_m2gehSQxmRC7C1L`, 브라우저 `1Dmi8WlmsHlszVuBB18tHBJwNZlgdbXQg`, ZIP 검수 `1FIdlWCcpnAzMag8g9qYXtmfbTMn3HzyR`, PDF 시각 검수 `1Fh7bCmTRoL_KOQC99Cr0Iyy8wmGrIz6O`를 같은 폴더에 저장했다. 은행 JSON과 세 ZIP 및 관련 검수 JSON의 원시 재다운로드 바이트/체크섬을 모두 로컬과 대조했다.
- 세부 자료는 `.private-work/hw-expansion-20261023/hw6/q05-source-answer-review.json`, `q05-independent-math.json`, `q05-pdf-visual-review.json`, `q05-output-qa/`다. 다음 우선 후보는 활용6회 7번이다. 시작 전에 원문과 답안 PDF에서 계산기 숫자키/더하기 키 조건 및 답 기준을 다시 직접 확인한다.

## 2026-10-24 활용6회 원문 7번 9개 추가 — 통합 상태 갱신

- 사용자가 문제은행을 위한 변형은 학습 단계에 맞게 조정해도 된다고 확인했다. 출제 원문의 핵심 사고를 보존하면서 단계와 수 범위를 조절한다.
- 원문 문제 PDF 2쪽과 답안 PDF 2쪽을 직접 대조했다. 계산기에서 1부터 256까지 입력해 더하고 마지막 `=`은 누르지 않는 조건이다. 숫자 키 입력은 660회, `+` 입력은 255회, 정답은 915회다. `qa/applied6-q07-independent-validate.py`는 구간별 자릿수 계산과 1부터 N까지 직접 열거를 독립 대조한다.
- 변형 9개는 마지막 수 24, 75, 99, 134, 205, 387, 564, 781, 928이며 정답은 62, 215, 287, 427, 711, 1439, 2147, 3015, 3603회다. 모두 2.7점대(하)로 표시하며 변형 정답률은 측정되지 않았다.
- 통합 데이터는 활용6회 원문 2·3·5·7번, 유형 4개와 문항 36개다. `version=20261024-applied6-expansion-r4`, 크기 103,729바이트, SHA-256 `1405223ff4ad29481c4d8955f0a834490a618c533248fb39cb0a32cd1b4ad83a`다. 기존 검수 2·3·5번 문항을 보존했다.
- 네 유형 모두 변형별 독립 검산, 브라우저 답 입력·채점·진단 링크·3회 제한·최초 시도 보존, 2단 순서, 모바일 375px, 실제 ZIP과 전 페이지 렌더 검수를 통과했다. ZIP마다 7개 구성 파일이 있으며 문제 PDF 2쪽 및 답안·상세풀이 PDF 3쪽을 포함한다. 실제 사이트에는 배포하지 않았다.
- 최신 ZIP SHA-256: Q2 `b46259a2ff51e8160d49b6c979498187776468ab18a0b02a08ca50af16763da2`, Q3 `f461bad25e0ef06e7382b8099a441653af8fbdeaf6f851dc0fedd840c35cecf8`, Q5 `ef8a058cd46b227e536ae2e649007ff0eea48b3c277ed83fb1ca86ead647efa8`, Q7 `cda4b001c8cdecc96d5cf9df12b18512d93023f8b62479410ec18b6bcc8fd403`.
- Google Drive 폴더 `황소 활용 모의고사`에 통합 데이터 및 Q2/Q3/Q5 ZIP·검산·브라우저·ZIP·시각 검수 파일을 기존 파일 ID로 갱신했다. 원시 재다운로드 22개 파일이 로컬과 바이트 단위로 일치한다. Q7 ZIP ID `1dA2WyEcyT363MN-edKnkipdpdAyYW9Ly`; 원문대조 `1pUzpUfTkpiSlAKCP6Wv_UA1F5TziW9YX`; 독립검산 `1-i8D34r-64mzJji6DzXNTX-4uKBIqtl6`; 브라우저 `1HsN0jr3gT50q27sLdgqCDror_YCBwAVK`; ZIP 검수 `1XF-vZ8xydvPjcJv17MckJTst_pU2D9ex`; PDF 시각검수 `1qQ1xRpIcKI8tNHRWradnY17dwDWMjib3`.
- 추적 대상의 다음 미완료 후보는 활용6회 원문 8번이다. 원문·답안 PDF에서 문구와 그림을 다시 확인하고, 도형·시각 요소가 있으면 변형을 잠그지 않은 상태에서 원본 그림의 조건을 직접 대조한다. 질문은행 확대 목표는 원문당 9개이며 활용1~9회를 우선한다.

## 2026-10-24 활용6회 원문 8번 9개 추가 — 현재 통합 상태

- 사용자 확인: 문제은행 제작 목적에 맞춰 핵심 사고를 보존하면서 변형의 단계·범위를 조정할 수 있다.
- 문제 PDF와 답안 PDF 2쪽을 직접 대조했다. 원문은 흰색·검은색 타일을 번갈아 붙이는 그림 규칙으로, 63회에 붙이는 타일은 흰색 248개다. 원 그림의 1~4회 배열과 이어짐 표시를 PDF에서 확인해 `bank/assets/applied6/q08-tiles-original.png`로 추출했다. 도형의 위치·색·타일 수를 바꾸지 않았고 각 변형의 그림에 같은 원본 그림을 사용한다.
- 변형 목표 회차는 5, 12, 27, 38, 49, 56, 72, 85, 96회다. 각 변형에서 홀수는 흰색, 짝수는 검은색이며 해당 회차에 새로 붙이는 타일 수는 `4×(회차−1)`이다. 네 변의 개수와 연속된 두 단계의 누적 타일 차로 독립 검산했다. 정답은 16, 44, 104, 148, 192, 220, 284, 336, 380개다. 2.7점대(하)이며 변형 정답률은 미측정이다.
- 최신 통합 데이터는 활용6회 원문 2·3·5·7·8번, 5유형 45문항이다. `version=20261024-applied6-expansion-r5`, 135,508바이트, SHA-256 `e0486ce71f7ba7c783930261a9b3ef6f80b152da29ba162f7774e55158cc962e`다. `reviewSummary.outputReviewed=true`, 원문 그림 1개를 기록했다.
- 다섯 유형 모두 독립 검산, 9개 답안 입력·채점·진단 링크, 3회 응시 제한, 첫 응답 보존, 375px 화면, 2단 순서 및 실제 ZIP 검수를 통과했다. 각 ZIP은 7개 구성이고 문제 PDF와 상세풀이 PDF를 모두 담는다. Q2/3/5/7은 2쪽+3쪽, 그림 크기로 페이지가 추가된 Q8은 문제 3쪽+풀이 3쪽이며 6쪽 모두 렌더 확인했다. Q8 ZIP HTML에 원본 PNG가 9회 인라인으로 들어가는 것도 확인했다.
- 최신 ZIP SHA-256: Q2 `721930181f00f612b3abb792d1471a4735c8701f427355ce23e1bdfab3ef7872`, Q3 `b285e1ba9839d939c56baee6c3f75a43d1be99d63a81d8964bfcf80ab38c5fe8`, Q5 `010af0e199f5d326a1ad76161abf7f2576e6c647a00bea50a1374ffbb7d8a3c4`, Q7 `41f0aac8083827b6c78c8074f4bbf30ed384ce4f6fe81e1e974343e3d31998eb`, Q8 `c44821fa4cbee1ba606659e65150334b6e2ecb2831ed0d4ca5bbce0c4af9fcec`.
- Drive 통합 JSON은 ID `1Xledby2qpOxBzc4qe97d-Fi4soNMLG4D`에서 갱신했다. Q8 ZIP `1SHW4kxxzcrgqDO0Id-G3VCphy9a8ognN`, 원문대조 `1g6hNpymARD50fS656jeca6aj_UdZ8QNr`, 독립검산 `1Dc-acAwdJJJv2JpyGQHreoda2INQAULV`, 브라우저 `16A0XgbZPraYWOSOxYuwdVOjhHg7xWoy6`, ZIP 검수 `1UzzDr0vLTl0Bw04ur_aSpGzVGAEMO6yp`, 시각검수 `1LycObvC9BnFzokZqdt5k4pL8yNEeD-xN`, 그림 파일 `1msqcJZBMe2KFv_7RCPco-6RnOdGmEFLX`다. Q2/3/5/7 ZIP 및 검수 증거도 최종 r5 데이터로 갱신했다. 실제 사이트 배포는 하지 않았다. 이어서 활용6회 원문 9번 PDF와 답안을 직접 열어 대조하고 유사문제 9개를 추가한다. 활용1~9회 전체 원문 270유형 확장 목표 중 현재 완료는 활용6회 5유형(45문항)이다.

## 2026-10-24 활용6회 원문 9번 9개 추가 — 현재 통합 상태

- 문제/답안 PDF 2쪽을 직접 대조했다. 원문 그림은 성냥개비로 정육면체를 한 줄로 이어 붙이는 그림이며, 성냥개비 100개일 때 답안 정답은 정육면체 12개다. 그림의 입체 모서리·교점·배치를 바꾸지 않고 원문 그림과 말줄임표를 `bank/assets/applied6/q09-cubes-original.png`로 추출해 모든 변형에 그대로 사용했다.
- 문제은행 변형은 성냥개비 20, 28, 44, 52, 68, 76, 92, 116, 140개 조건이다. 첫 정육면체는 모서리 12개를 쓰고, 다음 입체마다 한 면의 4개 모서리를 공유해 성냥개비 8개씩 늘어난다. 식 `8n+4=m`과 공유 모서리 수 세기로 각 정답 2, 3, 5, 6, 8, 9, 11, 14, 17개를 독립 검산했다. 2.7점대(하), 변형 정답률 미측정.
- 현재 통합 은행은 활용6회 원문 2·3·5·7·8·9번, 6유형 54문항이다. `version=20261024-applied6-expansion-r6`, 165,955바이트, SHA-256 `a8116221cd649f89ca3d9384caeaf22adc0afaeb397e89d5f770f0a8a25178fd`다. `reviewSummary.outputReviewed=true`; 원본 그림 2개를 기록했다.
- 여섯 유형을 동일 데이터 해시에서 다시 독립 계산·브라우저·ZIP 검수했다. 각 ZIP은 7개 파일이며 2단 문제지, 상세풀이 PDF, HTML/CSV/목록/검수기록을 갖췄다. Q2/3/5/7은 문제 2쪽+풀이 3쪽, Q8/9는 원본 그림 때문에 문제 3쪽+풀이 3쪽이다. 브라우저 답 입력·채점·진단 링크·3회 시도 제한·첫 응답 보존·375px 넘침 없음·단 순서와 실제 ZIP을 확인했다. Q8/9의 추출 그림이 ZIP HTML에 내장됐고 모든 실제 PDF 쪽을 렌더해 봤다.
- 최신 ZIP SHA-256: Q2 `74241c7a8d70d4b6ae6ed0d985f561deb3d61163f4f4d625ac1f64bb28b4c33a`, Q3 `96e7f0db5f0928bfe22e9f1b313bde3564eec0afb198c22e971d65468cc2bae6`, Q5 `1278eb1968ec66a80a60d7a3437827d0b43ac1d57a1872a01426c037cae143ad`, Q7 `a605cabd57752e7f0c17afe94b7b57009d6b14a72c2de19189015d77c7d62b76`, Q8 `543e157254c5464b21fd30dc6a6d9eaa351f33272a494ee7688f3a62bceca7ac`, Q9 `c6d0d9133309cb16b99e4640dcd6c3999b3af749feacbb88aea2cd029275aec4`.
- Drive 통합 데이터 ID `1Xledby2qpOxBzc4qe97d-Fi4soNMLG4D`를 r6로 갱신했다. Q9 ZIP `1qZ2OeHxdToJfpTdbiDDJgLdjbrAUBOLY`, 원문대조 `1JlXJAEFQtz3kx9Ua8t_E1VqCBVSeVXDe`, 독립검산 `1kRFcNRqN0oJe9GQVqLQDUkFDgUWeEpoL`, 브라우저 `1R0rZQwcV73ora6pz-v2C2ziPyTtnvp9s`, ZIP 검수 `1l1ts8C_8pl_eCo47wm2SiCw1yjASwkCR`, 시각검수 `1eRR4m1hSU4SXVNZLFaNxorNVUEKGkc6g`, 원본 그림 `1n0IxiN0E--5qWZWxDrhEFMmFX_Nt4Bfk`다. Q2/3/5/7/8 ZIP과 검수 자료도 최신 데이터로 갱신했다. 실제 사이트에는 배포하지 않았다. 다음은 활용6회 원문 10번 PDF와 답안을 직접 대조한다. 활용1~9회 총 270유형 목표 중 완료는 6회차 6유형(54문항)이다.


## 2026-10-24 활용6회 10번 유사문제 9개 추가

- Q10 원문 문제 PDF/답안 PDF 2쪽의 그림·조건·손글씨 해설을 직접 대조했다. 네 누적 표시 300g, 600g, 1.7kg, 2.4kg 중 1.7kg과 2.4kg의 차로 해당 저울 무게 700g을 확인했다. 변형 그림은 만들거나 수정하지 않고, 새 누적 표시값을 지문에 모두 제공해 9문항을 구성했다. 각 조건은 양의 개별 저울 무게로 일관되며 두 방식(누적 차, 개별 저울 무게 재구성)이 일치한다.
- 현행 통합 은행: 활용6회 원문 2·3·5·7·8·9·10번, 7유형·63문항, `20261024-applied6-expansion-r7`, SHA-256 `fb971f05b3791ea7f4d0bccda784850d1361c87ffa5d78bc9ddf9d26e88d2c91`. 원문 1·4·6·11~30은 아직 미완료다.
- Q10 독립 검산, 브라우저 답 입력/채점/진단/3회 시도/첫 답 보존/2단/375px, 실제 ZIP 구조 검수가 통과했다. ZIP은 7개 항목, 문제 PDF 2쪽·상세풀이 3쪽이며 렌더 5쪽에서 배치·선명도·잘림을 확인했다. Q10 ZIP SHA-256 `5e8da103a048cff501aa0213fccd9216fe2977888ab7805156f4c6020dd98b0f`.
- Q10 결과 ZIP과 원문대조·독립검산·브라우저·ZIP·PDF 시각검수 기록은 Drive `황소 활용 모의고사` 폴더에 저장했다. ZIP ID `1JRZKOOMP5r3FBrfgu8CXxf7LyeeJBI2t`, 원문대조 `1mVHp7OBbw3Rq4TzreRPQcPOu0rVY2zl_`, 독립검산 `1zCC8KGYN76LtH4hOpuj4dhHDKvWUnxRk`, 브라우저 `17oPtjgWaohmLyNq3Exnb2Dc2CyXLwAWy`, ZIP 검수 `1FhqqLEwCy4GMwvVHApJ-wxVGSgc8jtIt`, PDF 시각검수 `1EDjGlTdEAakcbWXg0aF0bGg02Gh14pYr`. 통합 은행 JSON ID `1Xledby2qpOxBzc4qe97d-Fi4soNMLG4D`를 r7로 갱신했다. 기존 Q2·3·5·7·8·9 ZIP과 해당 검산·브라우저·ZIP·시각 검수 증거도 기존 ID에서 현재 r7 증거로 교체했다. Drive에서 은행 JSON·인수인계·Q10 ZIP·Q10 독립검산을 원시 재다운로드하여 로컬과 바이트 단위로 일치함을 확인했다(은행 SHA-256 `fb971f05b3791ea7f4d0bccda784850d1361c87ffa5d78bc9ddf9d26e88d2c91`, 인수인계 `ddf7cd2f64842a4c47567f968f3b408db85083047f936fe905738bcb754ac0df`, ZIP `5e8da103a048cff501aa0213fccd9216fe2977888ab7805156f4c6020dd98b0f`, 독립검산 `a93e176ec301153920c39aefe45ddd77879eaa0f4a65c0bb3ad5817f287a6e9f`). Q2/3/5/7/8/9의 r7 파일은 기존 Drive ID를 유지해 교체했다. Q10 코드·은행 데이터·QA 18개 파일은 GitHub `main` 커밋 `d507687ca36419243f510dae41b3afc6fbdf1d78`에 반영했다. 로컬 Mac 저장소 `/Users/docssam/Developer/GFIELD/hs-report`의 `main`도 해당 커밋으로 정렬했다. 사이트 배포는 하지 않았다. 다음 원문은 활용6회 11번이다.


## 2026-10-24 활용6회 11번 유사문제 9개 추가

- Q11 문제/답안 PDF p2를 직접 열어 원문과 손글씨 정답을 확인했다. 5장 카드 합은 88×5=440, 다른 네 장의 최대합은 96+97+98+99=390이므로 최솟값은 50이다. 검증 변형 9개는 1~N 카드 범위를 10~18로 낮춰 조건을 명시했고, 네 큰 카드의 합 상한과 각 범위의 다섯 카드 조합 전수검산으로 최소가 일치했다.
- 통합 은행은 활용6회 2·3·5·7·8·9·10·11번 8유형·72문항, `20261024-applied6-expansion-r8`, SHA-256 `9bb353e1b0e352a30606189c334d4ebc4661d3795237ed6e2ce8258326127d22`. 원문 1·4·6·12~30번은 미완료다.
- Q11 답안 입력/채점·진단·3회 제한·첫 응답 보존·2단·375px 브라우저 QA 통과. ZIP은 7항목, 문제2쪽·상세풀이3쪽이며 전체 다섯 쪽을 렌더해 확인했다. Q11 ZIP SHA-256 `1b14927b83bbaec6eef10eeded0dcb874fdadd551c18d76a9d3af1389d872c3b`.
- Q11 ZIP·원문대조·독립검산·브라우저·ZIP·PDF 시각검수 자료를 Drive `황소 활용 모의고사` 폴더에 추가했다. ZIP ID `1WerOEMwl-CfsmRJ-mUNRB4fDlNZCmsVY`, 원문대조 `1i6-cbyn2zJysu14opdDdAwsmkY2DGuL9`, 독립검산 `1uZdkVyo8-hp1xQMb2IhHxoeAZAp5x8Bk`, 브라우저 `1XQ9kuBSjVvimo-jLv7dgsTJCltKpFIrX`, ZIP 검수 `1xUE5zBwtINN3I5nl_TFPPFG4gN97N-7v`, PDF 시각검수 `1BJ6VTIFV58DTGreSugDf-UakO156U9oy`. 통합 JSON ID `1Xledby2qpOxBzc4qe97d-Fi4soNMLG4D`를 r8로 갱신했고 Q2·3·5·7·8·9·10의 ZIP 및 검수 기록도 기존 ID에서 r8 기준으로 교체했다. Drive 원시 재다운로드로 통합 JSON SHA-256 `9bb353e1b0e352a30606189c334d4ebc4661d3795237ed6e2ce8258326127d22`, 인수인계 `215f36eb59bd1dd9ae3d143c9e94d8f471ee769179162174311be31abecf27b1`, Q11 ZIP `1b14927b83bbaec6eef10eeded0dcb874fdadd551c18d76a9d3af1389d872c3b`, 독립검산 `b232c766e6bc3d9d3d16877e303c82a5194b860ea56d1b7fb6c37b2b4a607028`가 로컬과 바이트 일치함을 확인했다. Q11 코드·데이터·QA 20개 파일은 GitHub `main` 커밋 `3fe1460411b1fe8a3da014ceb066fb615061a5ff`에 반영했고 Mac 로컬 `main`도 동기화했다. 사이트 배포는 하지 않았다. 다음 원문은 활용6회 12번이며 원본 도형과 답안 설명을 직접 대조한다.

## 2026-10-24 활용6회 12번 유사문제 9개 추가

- 활용6회 문제 PDF와 답안 PDF 2쪽을 직접 렌더해 대조했다. 원문은 길이 10칸, 이어 붙은 동그라미 묶음 길이 2·3·1, 채워지지 않은 칸 4개다. 교사 답안의 “10개”를 네 간격의 빈칸 분배 `C(4,3)=10` 및 10칸의 모든 배열 전수검사로 확인했다.
- 변형은 줄 길이와 세 묶음의 크기를 문제 지문에 명시하는 텍스트형으로 구성해 원본 그림을 복제하거나 고치지 않았다. 정답은 4, 10, 10, 10, 20, 20, 35, 35, 35이며 빈칸 간격 분배와 배열 전수검사를 독립 실행해 모두 일치했다. 사용자는 문제은행 목적이면 학습 단계를 낮춰도 된다고 확인했다. 원문 점수대 2.7점(하)을 유지했다.
- 활용6회 누적은 원문 2·3·5·7·8·9·10·11·12번 9유형·81문항이다. 데이터 버전 `20261024-applied6-expansion-r9`, 251,694바이트, SHA-256 `c57663cfa032d4990548556f5488155a07b2aeaa5a2918ec9ac1c2da2020eccb`.
- Q12 독립 검산·답안 입력/채점·진단·3회 제한·첫 응답 보존·2단·375px·ZIP 검증을 통과했다. ZIP은 7개 항목, 문제 PDF 2쪽, 상세풀이 PDF 3쪽이며 5쪽 모두 렌더 검수했다. ZIP 4,386,571바이트, SHA-256 `ae0fd82a0522b57646bf6f86a7623349c00b394e5bcd0cc35e1dab3af3be66ca`. 전체 Q2·Q3·Q5·Q7~Q12의 독립검산·브라우저·ZIP 검수기를 r9 데이터와 맞춰 통과시켰다.
- Drive 통합 JSON 기존 ID `1Xledby2qpOxBzc4qe97d-Fi4soNMLG4D`를 갱신했다. Q2~Q11 ZIP·검산·브라우저·ZIP·시각검수는 기존 파일 ID에서 r9로 교체했다. Q12 ZIP `1DCVrCVF4k70icIHAQItbZVsxcJfFnvXn`, 원문·답안 `1u6b4a3wl6K5CjhX9xff3fVA02nHrZAeM`, 독립검산 `1BazbSvts9aP62uzlborTJAkJKx5wldb_`, 브라우저 `1cNBxLKn6_dOEfH4Q2EVv90GnjqTpiSwV`, ZIP 검수 `1fybIuxMisfb7TJ2pFZhdHPPSyKg5H7EO`, PDF 시각검수 `1OR8i4k-TMWZkpDfy5YWggK_1cvPvbMAE`. Drive 원시 재다운로드는 은행 JSON(251,694바이트, SHA-256 `c57663cfa032d4990548556f5488155a07b2aeaa5a2918ec9ac1c2da2020eccb`), Q12 ZIP(4,386,571바이트, `ae0fd82a0522b57646bf6f86a7623349c00b394e5bcd0cc35e1dab3af3be66ca`), Q12 원문대조, Q12 독립검산 모두 로컬과 바이트 단위로 일치한다.
- 코드·은행·검증기 21개 파일은 GitHub `main` 커밋 `fc79a6152b4e399797722780286e632bd1eb0c27`에 반영했다. Mac 로컬 `main`도 해당 커밋과 정렬됐다. Q12 검수 자료와 ZIP을 Drive에 보관했고, 공용 인수인계는 이 추가 기록과 함께 갱신한다. 사이트 배포는 하지 않았다. 다음 원문은 활용6회 13번이다.

## 2026-10-24 활용6회 13번 유사문제 9개 — r10

- 원문 문제 PDF와 답안 PDF p3의 실제 그림·손글씨 답을 대조했다. 원문 계단은 아래부터 5×5, 3×3, 1×1 층이고 정육면체 35개다. 층별로 완전히 채운 직육면체를 세면 `1×225 + 2×36 + 3×1 = 300`개로 답안과 일치한다. 점수 표시는 PDF에서 확인되지 않아 3.4점대는 인접 구간에 근거한 추정으로 표시했다.
- 기존 13번 유형의 층별 가로×세로를 제시하는 방식으로 유사문제 9개를 추가했다. 각 층과 위층의 가운데 정렬·채움 조건을 명시하고 원본 그림을 변형하지 않았다. 답은 38, 198, 618, 1056, 1346, 2394, 3762, 4417, 7140이다. 층별 직사각형 공식과 점유 칸을 세는 독립 열거로 각각 재검산했다.
- 통합 데이터 `20261024-applied6-expansion-r10`은 활용6회 원문 10유형·90문항이며 SHA-256 `e94fd38c69b00e64a821d39342a13ebdd39e98a851643e847773ae47510d145d`다. Q13 실제 ZIP은 7개 항목, 문제 PDF 2쪽, 상세풀이 PDF 5쪽, 9개 문항 ID 일치다. ZIP SHA-256 `62aff2f783ced3b62b6ca05f055426e7b4adf1ce22a0910a8351a18098f071e9`다. 전체 문제·풀이 페이지 렌더를 눈으로 확인했고, 답 입력·진단·3회 제한·첫 응답 보존·좌단 위→아래 후 우단 순서·375px·실제 ZIP 브라우저 검수도 통과했다.
- 전체 적용 은행 6회차의 독립 수학·브라우저·ZIP 검사와 재고 인덱스 검사는 통과했다: 6개 회차 891문항, 99유형×9. Drive 통합 JSON ID `1Xledby2qpOxBzc4qe97d-Fi4soNMLG4D`는 위 r10 데이터와 바이트 일치한다. Q13 ZIP `1Z8hr0uge6Zs-TDQLPQLXk1bC8klxK3mh`, 원문·답안 `15-TDZUfMuEG-ri8s3FmWtR2O8py1HBM_`, 독립검산 `1KDm38Jdg37-NDT1MOossDgBvhMQlD6vH`, 브라우저 `1DFety7VYUQndzvZm84meecKyyeHtiDc5`, ZIP검수 `16UuurX1H1nwGGWpYXlWEpoUgAFNMx-Pt`, PDF시각검수 `1GYKc-2CnH3aERsD4TWvi5G0z6XPSpvjy`를 같은 Drive 폴더에 추가했고 ZIP·원문대조·수학검산 및 통합 JSON을 원시 재다운로드해 바이트 동일성을 확인했다.
- Q13 코드·데이터·색인·QA 25개 파일의 완전한 내용은 GitHub `main` 커밋 `8d9dae219c5dece4d05f02197b90d2b70f6cf7ca`에 반영했다. Q13 독립검산기의 비교 기준을 Q12 시점으로 고정한 수정은 `1cafce6bec77ceaa877b4f6bab2773bee971f568`에 반영했다. 두 커밋의 파일을 커밋 SHA 고정 원시 URL로 읽어 로컬 바이트와 대조했다. 실제 사이트 배포는 하지 않았다. 다음에는 활용6회 기존 원문 14번을 PDF에서 직접 확인한다. Drive에 있는 `Q14_*` 증빙은 적용4회 Q14이므로 활용6회와 혼동하거나 재사용하지 않는다.


## 2026-10-24 활용6회 문제은행 확장 최신 상태 — Mac

- 현재 범위는 사용자의 최신 지시대로 **시험에 이미 나온 유형의 확장만**이다. 새 유형을 만들지 않는다. 원문당 9개를 유지한다.
- 로컬 `/Users/docssam/Developer/GFIELD/hs-report`, `main`; 현재 작업 데이터 `20261024-applied6-expansion-r12`. 활용6회 원문 2·3·5·7~14·16, 12유형·108문항. 전체 적용 은행은 909문항·101유형×9.
- Q16은 p3 원문·답안의 8432/761번째를 대조하고, 각 변형은 자리별 블록 계산과 4,536개 후보 전수정렬로 검산했다. 브라우저·2단·375px·입력/진단·3회 제한·ZIP 7개 항목·문제 2쪽/풀이 5쪽 렌더 검수 완료.
- Q15는 보류: 원문 p3의 7,760,130 차이 표기와 답안 p3의 `881,201−105,188=776,013`, 답 105,188이 서로 맞지 않는다. `q15-source-discrepancy.json`을 확인하고 교사 판정 전 제작하지 않는다.
- 공용 `bank/pool.js` PDF 첫 캡처 warmup 수정 뒤 2·3·5·7~14·16 모두 독립수학·브라우저·ZIP 회귀 검사가 통과했다. Q13·14·16 ZIP 실제 PDF도 전 페이지 렌더 확인. SHA·쪽수·근거는 `.private-work/hw-expansion-20261023/hw6/20261024-deadline-status.md` 및 각 `qNN-output-qa/`에 있다.
- GitHub `main`과 로컬 `main`은 커밋 `1135dac34ce2d9a281b72c283657b4904cf5ecf8`에 정렬됐다. Drive 통합 데이터 ID `1Xledby2qpOxBzc4qe97d-Fi4soNMLG4D`를 r12로 갱신했고, Q13 ZIP 및 브라우저·ZIP·PDF·수학 검수 기록도 기존 ID에서 최신본으로 교체했다. Q14 신규 ZIP `1r5b2-yojzZYopkMB7t4IN-1XQFWSeKuf`, 원문대조 `14JvPsKhVRdwfz9-9o5Silc7UG51QKU4B`, 독립검산 `1FV_hidPtiSAiPWRHVDXT2AmbwIXkE9f8`, 브라우저 `1zpWIoSMmQxjAXgDF0yELEAP1zh6neKrs`, ZIP `1Z1lCuNtZNMnWjRJgCCS0UvdY8jyd4v8G`, PDF 시각 `1WBQ1PAYaKeEpCFHuUeq3blpUWyTFvSxd`; Q16 신규 ZIP `1DnXwUBFaGFJ-0E436rpHv1vxBS3BOU-e`, 원문대조 `19vmkTgjh_30Ewi7HvEoRubsjSqbxMzcR`, 독립검산 `1PVnYY1MuSe4XOzPujVc2PaG5heBr-jpw`, 브라우저 `1_mIVBMQPIF3xpzWULSX_EWtyvmmwtcdW`, ZIP `1UD8nh--oDwVVFOliPKAieEgkZGcjcScl`, PDF 시각 `1mWKlsHcNECHBYHjEiNfJJiwOMbHp4gte`. Q15 보류 근거는 `1lndCQlwThfuOIUbl5qNnvYoLmudDdnlW`. Drive 메타데이터의 파일 크기가 로컬 파일 크기와 일치함을 확인했다. 실제 사이트는 배포하지 않았다. 사용자 미추적 `bank/drafts/`, `materials/.DS_Store` 보존. 다음 유형은 활용6회 원문 17번이며 문제·답안 PDF에서 원문 유형을 직접 확인한 뒤 그 유형만 확장한다.


## 2026-10-24 최신 마감 기록 — 활용6회 기존 유형 확장 r15

- 사용자 지시: 원문에 이미 출제된 유형만 확장한다. 새로운 유형을 만들지 않는다. 원문당 유사문제 9개.
- 최종 로컬 데이터 `bank/data/applied6-expanded.json`: `20261024-applied6-expansion-r15`, SHA-256 `a0142340bd35f248d96a83a808c87943e8bdcfbcd9b855c03405bfd56ff13cde`. 활용6회 기존 원문 2·3·5·7~14·16~19의 15유형, 135문항. 전체 적용 은행은 936문항, 104유형×9.
- Q17: 원문·교사 답안 PDF p3 직접 대조, 답 8 독립 확인. ZIP 7항목, 문제 2쪽·상세풀이 5쪽, 모든 렌더 페이지 확인. ZIP SHA-256 `9ef95d4b4d29867920e0e7fd9686d067206033bb3d6c9f32d3fd6422473cd3d1`.
- Q18: 원문·답안 PDF p3 직접 대조, 동전 종류별 최대 5개 조건과 세 조합 확인. 변형별 216개 후보 전수계산. ZIP 문제 2쪽·풀이 3쪽, 전체 시각 검수. ZIP SHA-256 `37468469cc8bd67f6d93347147a943033f69e89e7b07843c262d2a126e48902a`.
- Q19: 원문·답안 PDF p4 직접 대조. 곱 `11111111108888888889`, 0을 포함한 짝수 자릿수 10개 확인. 길이별 곱셈으로 변형 검산. ZIP 문제 2쪽·풀이 3쪽, 전체 시각 검수. ZIP SHA-256 `3ee36c7955b1c10375400d0ae6f8e99ab068ff4a7c42667f5e6b0919d807c1f5`.
- Q17~19 모두 답안·상세풀이 포함, 브라우저 답안 입력/진단/3회 제한/기존 첫 응답 보존/2단 배치/375px/실제 ZIP 검수 통과. PDF 시각검수 JSON은 각 `qNN-output-qa/qNN-pdf-visual-review.json`에 있다.
- 원문 유형 범위: `availableSourceNos`는 `2, 3, 5, 7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 18, 19`. 보류/미착수 `1, 4, 6, 15, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30`. Q15는 문제 PDF의 7,760,130과 답안 PDF의 776,013 계산 및 답 105,188이 불일치해 계속 잠금; 판본/교사 판정 전 변형 공개 금지.
- 정해진 한국시간 마감(2026-10-24 02:00)은 지났다. 이후 새 문제 생성은 중단했다. 실제 사이트 배포·병합은 하지 않았다. 다음에 재개하면 기존 원문 20번부터 PDF 문제·답안 직접 대조 후 기존 유형만 확장한다.
- 이 기록 시점 GitHub/Drive 동기화 상태는 별도 확인이 필요하다. 미추적 `bank/drafts/`, `materials/.DS_Store`는 사용자 자료로 보존한다.


### Drive 동기화 완료 — r15

- 통합 은행 기존 Drive ID `1Xledby2qpOxBzc4qe97d-Fi4soNMLG4D`를 r15로 갱신했다. 적용6회 색인 r15는 `1HCdAbbnp5j3J93FeQHAQtxNWmXioifUb`, 마감 기록은 `1PIYLvw1LBOF9r69mH6tUf3Hs8D52sqAx`에 보관했다.
- 활용6회 Q17/Q18/Q19 각 문제 PDF, 상세풀이 PDF, 9문항 ZIP, QA 증빙 ZIP을 Drive `황소 활용 모의고사` 폴더에 보관했다. ZIP ID와 SHA는 로컬 `drive-sync-r15-receipt.json`에 기록했다.
- Drive 메타데이터 용량은 은행 JSON 455,514B, 색인 5,357B, Q17 ZIP 4,604,691B, Q18 ZIP 4,369,457B, Q19 ZIP 4,241,353B이며 로컬과 일치한다. 문제/풀이 PDF 및 증빙 ZIP도 로컬과 같은 크기로 업로드됐다.
- 인수인계 파일도 기존 Drive ID `1ZlSXWNkXfwOwihkvnFi_DKcRVFO0gP4e`에서 갱신한다. GitHub 동기화는 이 기록 작성 뒤 수행한다.

### GitHub 업로드 미완료 상태

- 로컬 `main`에는 활용6회 r15 데이터·색인·어댑터·검증기와 이 인수인계 변경을 포함한 커밋이 있다. `git push origin main`은 `fatal: could not read Username for 'https://github.com': Device not configured`로 거절됐다. 따라서 GitHub 원격 `main`에는 아직 반영되지 않았으며, 인증된 GitHub 연결로 파일/커밋을 푸시할 수 있게 된 뒤 이어야 한다. 사이트 배포는 하지 않았다.
- 사용자 미추적 파일 `bank/drafts/`, `materials/.DS_Store`는 그대로 두었다.


## 2026-10-24 재개: 활용6회 기존 원문 20번 확장 r16

- 사용자가 작업 재개를 지시했다. 기준은 변함없이 **원문에 이미 나온 유형만 확장**이며, 새 유형은 만들지 않는다. 활용6회 원문 20번의 예시 연산 규칙 찾기 유형을 확장했다.
- 원문 문제 PDF p4와 답안 PDF p4를 직접 렌더해 대조했다. 예시 여섯 개와 교사 손글씨 계산 `84+42=126`, `126÷7=18`이 일치한다. 원문 예시 상자는 원본 상태로 `bank/assets/applied6/q20-examples-original.png`에 보존해 9개 변형 모두 재사용했다.
- 아홉 목표는 70♠35, 70♠42, 84♠49, 91♠49, 98♠49, 84♠70, 91♠70, 98♠70, 84♠91이다. 원문 예시와 같은 `(a+b)÷7` 규칙으로 답 15,16,19,20,21,22,23,24,25를 독립 검산했다.
- 데이터 `20261024-applied6-expansion-r16`, 144문항·16개 출처 유형. 활용6회 완료 원문 유형은 2·3·5·7~14·16~20이며, 전체 적용 은행은 945문항·105유형×9다. 데이터 SHA-256 `1f05b1f8225e4e2f7c0b395f427e531cac531ec5cb6d78ad54ccf0be82c85d60`.
- Q20 수학 독립검산·브라우저 답 입력/채점/진단·3회 제한/첫 응답 보존·2단/375px·실제 ZIP 검수가 통과했다. ZIP은 문제 PDF 3쪽, 풀이 3쪽, 7개 항목이며 ZIP SHA-256 `dda03e81e9ba40e8142e6397ad24e181df3f4ef7344bae54668b79bf757a7f9c`. 최종 ZIP에서 꺼낸 PDF 여섯 쪽을 렌더 검수해 페이지 모두 확인했다.
- 남은 원문: 1·4·6·15·21~30. Q15는 원문과 답안 수치 불일치로 계속 잠근다. 다음은 원문 21번 페이지와 답안 페이지를 직접 확인한 뒤 그 유형만 확장한다. 실제 사이트 배포는 하지 않는다.
- 로컬 `main` 변경·Drive 동기화·GitHub 원격 반영 상태는 이 기록 뒤 갱신한다.


## 2026-10-24 재개: 활용6회 기존 원문 21번 확장 r17

- 기준은 원문에 이미 나온 유형만 확장하고, 원문당 9개를 유지하는 것이다. Q21의 두 사람 나이 관계와 과거·미래 시점 이동 유형만 확장했다. 새 문항 유형은 추가하지 않았다.
- 활용6회 문제 PDF p4와 답안 PDF p4를 직접 열어 지문과 손그림 답 2를 대조했다. 나이 차를 d라 두면 첫 조건으로 현재 나이는 관호 4d, 주연 3d가 되고, 미래 조건은 5d=9d−c가 된다. 원문 c=8에서 d=2로 답안과 일치한다.
- 변형은 c=12,16,20,24,28,32,36,40,44로 구성해 답 3~11살을 만들었다. 각 문항에서 과거 나이·현재 나이·미래 나이를 대입 검산했고 양의 정수 해가 유일함을 확인했다.
- 데이터는 `20261024-applied6-expansion-r17`, 153문항·17개 활용6회 원문 유형이며 전체 적용 은행은 954문항·106유형×9다. 데이터 SHA-256 `20c0435ddadd5c27b74629f8dc31d3b1c9d2a6f6e67f59435a93859978402f2d`. Q21 유형 분류는 `지문 이해 / 두 사람의 나이 관계와 시점 이동`이다.
- 수학·원문 증거 검사, 전체 은행 재고 검사, 브라우저 답 입력·채점/진단·3회 제한·첫 응답 보존·2단·375px·실제 ZIP 검사가 통과했다. ZIP은 문제 2쪽·상세풀이 5쪽, 7개 항목이며 SHA-256 `dc5d0fb682f16cce643ba0803ead5658837b03391d5fc8c951edf0c8971e3fdb`. ZIP 내 일곱 페이지를 렌더하고 배치·잘림을 눈으로 확인했다. 증빙 ZIP `applied6-q21-qa-evidence-r17.zip` SHA-256 `104bbbe79a7bee8d4194618db5824ab81887a50fb78477b0e21cd3f55b580a18`.
- Q15의 원문/답안 수치 불일치는 계속 보류한다. 다음 미착수 원문은 22번이다. 실제 사이트 배포는 하지 않았다.


## 2026-10-24 재개: 활용6회 기존 원문 22번 확장 r18

- 원문 22번에 실제 나온 정사각형 학생 배열과 세로줄 증가 유형만 확장했다. 문제 PDF p4의 원문과 답안 PDF p4의 정사각형 표시 및 교사 답 36명을 직접 대조했다.
- 변형 9개는 세로줄 증가량 3,4,8,10,15,18,20,24,30으로 만들었다. 원래 n×n, 1≤n≤10이고 새 배열은 n+r줄이므로 n+r|n². `n²=(n+r)(n−r)+r²`로부터 n+r|r²를 얻고, 각 범위에서 가능한 약수를 열거해 단 하나의 n을 확인했다. 답은 36,16,64,100,100,81,25,64,36명이다.
- 데이터 `20261024-applied6-expansion-r18`, 162문항·18개 활용6회 출처 유형, 전체 적용 은행 963문항·107유형×9. Q22 독립 계산·전체 재고·브라우저 입력/진단/3회 제한/2단/375px/ZIP 검사가 통과했다. 실제 ZIP 7개 항목, 문제 2쪽·상세풀이 5쪽, 모든 쪽 렌더 확인. ZIP SHA-256 `e9e22dd191769a09e33d241bc8e5c11f398dec89e6d9ff722a2351fd9f4b0a49`, 증빙 ZIP SHA-256 `b1a87c3dd28fbee322683dfaead7631856a75f5ad98dec4a877212dc28241dbc`.
- Q15는 원문/답안 불일치로 보류한다. 다음 미착수 원문은 23번이다. 실제 사이트 배포는 하지 않았다. GitHub는 로컬 Q20·Q21 커밋 `86906ecd`에서 원격 푸시가 인증 오류로 실패한 상태이며, Q22 변경분도 로컬 커밋에 포함됐으며 GitHub 원격은 미반영이다.


## 2026-10-24 재개: 활용6회 기존 원문 23번 확장 r19

- 원문 23번의 방향 화살표 도로망 경로 세기 유형만 확장했다. 문제 PDF p4의 원본 도로 그림과 답안 PDF p4의 17가지 계산을 직접 대조했다. 그림은 변형에서 그대로 재사용하고 선·화살표·표시를 바꾸지 않았다.
- 원문 그림에서 시작·도착점 조합을 바꾼 9문항의 경로 수는 17, 5, 1, 1, 1, 1, 6, 6, 7이다. 각 조합을 별도 방향 그래프 DFS로 경로 전수 열거해 검산했다.
- 데이터 `20261024-applied6-expansion-r19`, 171문항·19개 활용6회 출처 유형, 전체 적용 은행 972문항·108유형×9. Q23 독립 경로 열거, 전체 재고, 브라우저 입력/진단/3회 제한/2단/375px/실제 ZIP 검사 통과. ZIP 7항목, 문제 3쪽·풀이 3쪽이며 전체 6쪽 렌더 검수 완료. ZIP SHA-256 `c4915ec1accf51e3d5a28b44ef6b25061d1896a6e36980d6eb7e5c16984daebb`, 증빙 ZIP SHA-256 `203446b1b7c0524a4519f80750fb4501eb0a879534e3127da2074bd9c6d13539`.
- Q15는 판정 자료 불일치로 보류. 다음은 원문 24번이다. 사이트 배포하지 않았다. GitHub 푸시는 로컬 인증 오류로 아직 미완료다.


## 2026-10-24 재개: 활용6회 기존 원문 24번 확장 r20

- 원문 24번에 나온 성냥개비 숫자 카드, 카드 수 합 조건, 거울 반사 자릿수 세기 유형만 확장했다. 문제·답안 PDF p4를 직접 대조해 카드 수 10개와 원문 답 18을 확인하고 원본 카드 그림을 수정 없이 재사용했다.
- 아홉 변형은 2·3·4장으로 만드는 수와 성냥개비 합 조건을 조합했다. 거울에도 숫자로 읽히는 카드 0·1·2·3·5·8만 대상으로 모든 순열을 전수 열거하고, 첫·끝 자리에 0이 오는 수를 제외했다. 원문 3장/합12의 독립 계산은 18로 답안과 일치한다.
- 데이터 `20261024-applied6-expansion-r20`, 180문항·20개 활용6회 출처 유형, 전체 적용 은행 981문항·109유형×9. 수학 전수열거·재고·브라우저 입력/진단/3회 제한/2단/375px/실제 ZIP 검사가 통과했고 문제 3쪽·풀이 3쪽 모두 렌더했다. ZIP SHA-256 `74c622ed541aff2e5727070dcc47b772a45c040f020065bb86b59345c48c00b8`, 증빙 ZIP SHA-256 `76b2fd65ed02051f4946bd3ea97858ed3140dbb70466469295198ac911dd704c`.
- 다음은 기존 원문 25번이다. Q15는 답안 수치 불일치로 잠금 상태다. 사이트 배포하지 않았다. GitHub 푸시는 인증 오류로 미완료다.
