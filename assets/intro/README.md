# 학생 응원 인트로 (2026-10-23)

`encouragement-20261023-v2.mp4`는 홈 진입 때 로그인 상태와 관계없이 재생하는 26초 영상이다. 자동 로그인 결과는 유지하며 환영 화면과 QR 목적지 이동은 영상 종료·건너뛰기·미디어 오류 뒤 이어진다. 브라우저가 유음 자동재생을 막으면 무음 재생과 소리 켜기 버튼을 제공한다.

사용자가 지정한 응원·부모님 인사 문구와 기존 인트로의 실제 마지막 음성을 포함한다. 원본 전체 영상 및 음성은 교체·삭제하지 않았다. 원본 5.70–8.00초를 새 영상 23.30–25.60초에 사용했다. 전사는 Mac에 이미 설치된 Apple SpeechTranscriber ko_KR 모델로 확인했으며 별도 API를 호출하지 않았다.

- 출력: H.264/AAC, 1280×720, 24fps, 624프레임. 세로 화면 중앙 안전 폭 310px.
- SHA256: `c6c481056314e0a41d1e0d042a3fefd7242889f75b471389aa394a04582ea264`
- 원본 마지막 음성과 디코딩된 출력의 상관계수 0.994. 실제 스테레오 최대 피크 -1.32dBFS, 클리핑 표본 0. 청취는 별도 미실시.
- 회귀 검사: `qa/intro-browser-validate.cjs`, `qa/report-qr-navigation-browser-validate.cjs`, `qa/email-login-browser-validate.js`.
- 렌더 코드: `tools/intro/render-encouragement.swift`. `xcrun swiftc -suppress-warnings -parse-as-library tools/intro/render-encouragement.swift -o /tmp/gfield-intro-render` 후 작업 폴더를 인자로 실행한다. 기존 출력과 겹치지 않는 폴더와 26초 `score.wav`가 필요하다. `verify` 추가 인자는 완성 영상 디코딩·모바일 프레임을 검사한다.
- 원자료·믹스·작업 기록·출력 검수는 기존 Drive [영상](https://drive.google.com/file/d/10DohEEH6o3sdycXDsc_p8i3fObkB62wJ/view), [작업파일](https://drive.google.com/file/d/1klU655Gq-RY71MiVChZ2O4Fhsc9h_PnQ/view)에 보관한다. 원본 파일과 이전 시안은 로컬 작업 기록에 보존한다.
