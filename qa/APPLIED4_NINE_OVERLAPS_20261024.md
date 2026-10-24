# 활용 4회 16번 유사문제 9개 검수 기록 · 2026-10-24

- **현행 목표:** 원문당 총 9개. 기존 승인 153개와 기존 15·18번 유사문제, 원시험 정답·점수·기록을 보존하고 16번 유사문제 9개만 추가했다.
- **원문 근거:** 활용 4회 문제 PDF 3쪽, 교사용 답안 PDF 16쪽을 직접 대조했다. PDF SHA-256은 문제 `f7bbaf0a1f5de40434882b8c0da70cc5b8fb20188f03c5c77458b6a5cac05c59`, 답안 `67f66e5fa57df1d463261e184f1dced30e3ffbcf0a802a1ec2d9b8066d122fe8`.
- **그림:** 원본의 실제 배치·잘림 경계를 포함한 그림을 PDF에서 추출해 유사문제 9개 모두에 그대로 재사용했다. 영역별 수치는 22·17·11을 유지했다. 원본을 다시 그리거나 정답 단서를 추가하지 않았다.
- **수학 검수:** 카드 5장 집합 9개를 각각 120개 순열 전수 검사하고, 별도 쌍합/영역합 방식으로 답을 다시 검산했다. 모든 집합이 조건을 만족하는 배치 하나만 가지며 답은 48, 47, 45, 51, 46, 52, 45, 47, 46이다. 유형 난도는 원문 3.4점대 기준 `중`; 새 학생 정답률을 측정했다고 주장하지 않는다.
- **화면·답안:** 9문항 모두 답 입력이 하나씩 있다. 실제 연습 저장 3회 제한, 최초 응답 보존, 원시험 점수 변경 없음, 오답 진단에서 원문 3쪽·해설·동일 유형 추가 9개 연결을 확인했다. 1440px·375px에서 넘침이 없고, 인쇄 문제지 왼쪽 단부터 위아래로 읽은 뒤 오른쪽 단으로 이어진다.
- **ZIP:** 실제 ZIP은 4,592,514바이트, SHA-256 `040e386224f1a07ced2a8523325027d377f1d0e6f233b3f6e7174ce640f57c6b`. 문제 PDF 3쪽, 상세 풀이 PDF 3쪽과 9문항 목록이 들어 있다. ZIP에서 꺼낸 6쪽 전체를 렌더해 보고 문제·해설 쪽을 확대 검수했다. 9개 그림의 바이트가 원본 자산과 일치한다.
- **정량 상태:** 활용4 확장은행 162문항, 18개 원문 유형. 앞선 승인 153문항은 완전히 동일하다. 다른 회차 색인 81유형/729문항은 유지했다.
- **검사:** `qa/applied4-nine-overlaps-independent-validate.py`, `qa/applied4-nine-overlaps-browser-validate.cjs`, `qa/bank-learning-profile-browser-validate.cjs`, `qa/applied-diagnosis-links-browser-validate.cjs`, `qa/question-bank-source-adapter-validate.js`, `qa/bank-registry-validate.js` 통과.
- **공개 및 보관:** GitHub main `eb620aea6a1a423f86b41f720876c54b820aa23b`; Pages run [40056099942](https://github.com/docssam1/hs-report/actions/runs/40056099942) 성공. 운영 사이트의 문항 JSON·색인·학습 색인·adapter·catalog·pool·mock·원본 그림 등 9개 파일을 원시 바이트로 대조해 모두 일치했다. Drive ZIP [1ugxyM-wNL3SrKDK8ZogNCdbL56Vbwmn0](https://drive.google.com/file/d/1ugxyM-wNL3SrKDK8ZogNCdbL56Vbwmn0/view), 검수 ZIP [1ohHIAqS4J_lPTzoO_gg280O6zAFHjy8o](https://drive.google.com/file/d/1ohHIAqS4J_lPTzoO_gg280O6zAFHjy8o/view), 문제 PDF [1JjAB6vhanyVO06tiw1p6WE0Hbf8I3iZu](https://drive.google.com/file/d/1JjAB6vhanyVO06tiw1p6WE0Hbf8I3iZu/view), 해설 PDF [1IwiVjURDhkVROLfFoswsGmzy1SWV4pR6](https://drive.google.com/file/d/1IwiVjURDhkVROLfFoswsGmzy1SWV4pR6/view)는 원시 재다운로드 크기와 SHA-256이 로컬 파일과 모두 일치한다. 로그인 운영 계정 실화면 검사는 공개 파일 대조와 별도로 취급한다.
- **다음:** 활용4회 14번 원문/답안 그림을 직접 대조한다. 17번 기존 승인 9개는 재제작하지 않는다. 전체 목표는 미완료다.
