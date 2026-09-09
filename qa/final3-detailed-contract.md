# Final3 앞 15문항 상세 풀이 통합 계약

## 범위

- 검수된 상세 풀이는 파이널 3회 1–15번만 포함합니다. 16–30번은 화면에서 준비 중으로 남고 인쇄에서 제외합니다.
- 기존 채점용 `answer`는 바꾸지 않습니다. 이름·단위가 포함된 `displayAnswer`는 문항별 독립 승인 대응표와 정확히 일치할 때만 표시합니다.
- 원본 문항, 채점, 점수, 통계, 학생 기록, Final1·Final2 상세 풀이를 변경하지 않습니다.

## 로드와 공개 범위

1. `mock-data-final.js`를 기존 문항·정답의 기준으로 불러옵니다.
2. 3회에서만 `final3-solution-diagrams.js`, `final3-detailed-data.js`, 공용 상세 렌더러를 차례로 불러옵니다.
3. Q1·3·4·6·7·8·13은 문항에 묶인 정확한 SVG 모델·계산·렌더가 모두 있을 때만 풀이를 엽니다.
4. 독립 검수를 마친 1–15번은 `releaseStatus: eligible`로 일반 성적표에서 엽니다. 아직 검수하지 않은 16–30번은 준비 중으로 남깁니다.
5. 표시 답이나 채점 답을 느슨하게 정규화하지 않습니다. 번호별 정확한 두 문자열 중 하나라도 다르면 해당 문항을 잠급니다.

## 검증

```text
node qa/final3-detailed-data-validate.js
node qa/final3-diagram-registry-validate.js
node qa/final3-detailed-renderer-validate.js
node qa/final234-report-integration-validate.js
```

브라우저 검사는 일반 주소와 로컬 미리보기에서 모두 준비 완료 15/30, 390px 표·그림 가로 넘침 없음, 16–30번 인쇄 제외를 확인합니다. 실제 A4/PDF 생성과 문항별 전체 교육 내용 보존 검사는 루트 통합자가 별도 폴더에서 수행합니다. 이 문서만으로 배포 완료를 주장하지 않습니다.
