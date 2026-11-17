# 황소 리포트 → 하이퍼포커스 진단 연결

## 범위
- 자료실 `GFIELD APPLICATION` 폴더의 기존 하이퍼포커스 카드만 연결한다.
- 현재 리포트 학생 세션/계정/학부모 이메일 연결/승인 기기/현재 폴더 권한을 서버에서 검증한다.
- 학생 이름 쿼리는 인증 근거가 아니다. 모의고사·VIP·유료 문제 권한은 발급하지 않는다.
- 기존 하이퍼포커스 승인번호 로그인은 이 저장소에서 변경하지 않는다.
- `data.js`, 성적, 기존 승인표, 칼럼은 변경하지 않는다.

## 구성
- `hs-auth.js`: `issueHyperfocusLink()`가 내부 기기 토큰과 학생 Bearer 세션을 전달.
- `hs-hyperfocus-link.js`: 정확한 HF 루트만 허용. 새 창을 먼저 열고, 60초 1회용 토큰을 `#hs_handoff=`에 담아 이동. URL query/storage/log에 토큰을 쓰지 않는다.
- `hs-parent-auth?scope=hyperfocus` 분기: `issue`, `consume`, `resume`만 허용. 입력 키 whitelist; body 4KB; current roster fail-closed.
- `hs_hyperfocus_context`: JWT 서명 검증 후 추출한 subject/session_id, 기기 해시로 계정/세션/기기/학부모 연결 확인.
- `hs_consume_hyperfocus_handoff`: atomic UPDATE 조건으로 재사용·동시 소비 차단. 계정/세션/기기/연결과 만료를 재검사.
- handoff 테이블은 RLS 활성화, anon/authenticated/public 권한 없음. RPC도 service_role만 실행.

## 계약
`POST issue` body `{action:'issue', deviceToken}` + 학생 Bearer → `{token,expiresAt}`.

`POST consume` body `{action:'consume',token}` → `{sessionToken,session}`. handoff를 소비하는 동일 SQL UPDATE에서 새 opaque session token의 SHA256을 저장한다.

`POST resume` body `{action:'resume',token:sessionToken}` → `{session}`. 매번 원본 활성 계정/인증 세션/기기/학부모 연결/현재 명단 및 폴더 권한을 다시 검증한다. handoff token은 resume에 사용할 수 없고 session token은 consume에 사용할 수 없다.

session 형태는 `{role:'student',backend:'hs-report',userId:mainUUID,name,type:'internal',permissions:['hyperfocus'],expiresAt}`. HF 프로젝트 계정 생성·학생·권한 변경은 하지 않는다.

`expiresAt`는 issue 시점부터 최대 1시간이면서 원본 JWT exp 및 auth session not_after보다 늦지 않다. consume 이후 current roster 권한을 다시 확인하며 실패 시 토큰은 소모되어 재시도에는 새 발급이 필요하다. HF 프런트엔드는 이 endpoint 응답으로 세션을 검증하며 별도 HF 수신 서버는 만들지 않는다.

## 검증 및 배포 현황
- main SQL 적용 완료: additive 테이블/RPC, RLS 및 service-only grants 확인, handoff 행 0, 기존 학생 쓰기 0.
- 기존 hs-parent-auth v9 원본 백업·비교 후 v10 배포 완료. verify_jwt:false, issue는 내부 JWT 검증, consume/resume은 opaque credential 검증.
- live 음성/부정입력·CORS smoke 9/9 통과. 기존 unknown/PIN 입력 400, lete legacy 403, scope noauth 401, 가짜 consume/resume 401, mock 400, evil origin 403, OPTIONS 204.
- 별도 HF backend/수신 endpoint 생성 없음. lete-on static 먼저, hs-report static 다음 게시한다.
- v2 main handoff 35/35, Mac 실제 Chrome HF 11/11, 기존 hs-auth-session 및 graduated-parent-auth 7개 시나리오 통과.
- PGlite 실제 로컬 SQL + Edge PIN 검사 통과: OTP-only setup/reset, leading-zero PIN, 다섯 번째 실패 잠금, 실패 시 세션 없음, 잘못된 이메일/비활성, 네 번째 브라우저, salt race 및 anon/auth 접근 거절.
- 실제 학생 양성 E2E는 미실시. 성공 흐름은 격리된 mock으로 검증했고 실제 계정/성적/진도 변경 없음.
- 유사문항은 기존 검수대기를 유지하며 모의/유료 권한 변화 없음.
- git diff --check 통과. data.js/docssam-columns.js 변경 없음.

## 운영 경계
예전 비밀번호 로그인 계정에 parent link/승인 기기가 없다면 이메일/PIN 인증 절차가 먼저 필요하다. 단순 이름만으로 이 경계를 우회하지 않는다. 세션의 최대 유효시간은 1시간이다. `resume`은 원본 권한 취소를 즉시 확인하므로 HF에서는 보호 화면/데이터 접근 전에 이를 호출해야 하며 프런트엔드 캐시 값만으로 접근시키면 안 된다.

## 기존 인증과 분리
신규 함수 개수 한도로 `hs-parent-auth`의 첫 분기에서 정확히 `?scope=hyperfocus`일 때만 `report-handoff.ts` handler로 라우팅한다. 기존 PIN/OTP/touch 로직은 변경하지 않는다. live v9 원본에서 추가 import와 한 줄 router를 제거하면 SHA256 `6f5480094098d9ff46a5e0beaa9f98989d67b83e409fce686a3c42008602acfa`와 줄끝을 원래 CRLF로 복원했을 때 byte-identical하다 (Git 저장소 LF 유지). 기본 functionCall은 그대로, 4번째 인수가 hyperfocus일 때만 해당 query를 붙인다.

기존 인증 회귀검사와 Mac PGlite PIN 검증 모두 통과했다.
