# 활용 유사문제 확대 — 2026-10-24 02시 마감 기록

코드 기준 main `85f362e8498464422877f5da59a0189cb2eba1b4`. GitHub Pages 작업39989985512 성공과 실제 사이트9파일 일치를 확인했다. 사용자 지정 마감은 한국 시간02:00이며 아래는 마감 전 완료한 검증 범위다.

| 회차 | 검수 유형/전체 | 새 문항 | 문제 PDF | 풀이 PDF | 전체 ZIP |
|---|---:|---:|---:|---:|---|
| 활용1회 | 24/30 | 216 | 46쪽 | 72쪽 | [문제·상세풀이 ZIP](https://drive.google.com/file/d/1EhKE8oIRh2ejU5psCdnK25eFGdbB6lhX/view) |
| 활용2회 | 14/30 | 126 | 33쪽 | 55쪽 | [문제·상세풀이 ZIP](https://drive.google.com/file/d/1ECdFxNi9gl_3W-USqyWCAdQzDrUJq-Z1/view) |
| 활용3회 | 17/30 | 153 | 32쪽 | 55쪽 | [문제·상세풀이 ZIP](https://drive.google.com/file/d/1TMVE9tFs93tZFKnRflhd5jWDv5PartI7/view) |
| 활용4회 | 12/30 | 108 | 20쪽 | 40쪽 | [문제·상세풀이 ZIP](https://drive.google.com/file/d/1nHCVoxZ_gfwQjCykh4nAyNqI9-ebPkSY/view) |
| 활용5회 | 8/30 | 72 | 13쪽 | 26쪽 | [문제·상세풀이 ZIP](https://drive.google.com/file/d/1VztrwMRqqZW6F1tFTbNq_MnOyAqBHmQb/view) |

새 검수 문항은 **75유형 ×9개=675개**다. 기존 승인14은행1,260개는 변경 전과 같아 저장 문항은 총1,935개다. 활용9회270원문 ×9개=2,430개 목표 중 신규 잔여는1,755개다. 기존 은행 추가6개는 별도 미완료다. 각 회차 전체30유형이 끝난 것으로 보고하지 않는다.

## 실제로 확인한 범위

- 현행 문제·답안 PDF 직접 대조,675개 별도 계산·전체 정답집합/최댓값 검증, 원문 조건 재사용 제외.
- 문제675개와 풀이675개 렌더, 2단 왼쪽 위→아래 뒤 오른쪽 위→아래, PC1440·폰375 잘림 검사. 자체 호스팅 인쇄 명조와 화면 Pretendard.
- 전체 회차 ZIP 실제 다운로드, 문제·풀이 PDF/HTML·빠른 정답·문항 목록·검수 기록7항목. 회차별 선택 문항ID와 양쪽 PDF 수량 일치. 실제 PDF 렌더 확인.
- 유형별 기본3개·추가6/9개, 답 입력 최대3회·최초 연습 결과 보존, 원시험 점수 저장 불변. 원시험 오답 진단→실제 준비된 번호만 연습·권장학습 위치·학습 포인트 연결.
- 활용 난도는 배점2.7하/3.4중/4.2상만 적용. 타 시리즈 정답률 우선. 4영역과 세부유형은 표시 메타데이터이며 기존 출처ID·원점수·정답률은 보존.
- 전체675개의 본문뿐 아니라 표·카드·주어진 자료·그림을 합친 실제 표시 내용이 모두 다름. 포함·배제 유형의 회차간 동일 수치 중복도 없음.
- 원시험·회원·권한·칼럼 실제 쓰기0건. 칼럼 보존21검사, canonical registry20검사, 문제은행 접근 계약, 기존 활용1·2 인쇄·ZIP 회귀 통과. 실제 학생 계정에서 재응시했다고 주장하지 않는다.
- 전체5개 ZIP은 Drive에서 다시 내려받아 로컬 크기·SHA256 일치 확인. 원자료와 검수 결과는 Drive, 코드와 버전은 GitHub, 로컬은 작업·임시 자료로 구분.

## 잠금과 다음 작업

원문 그림을 새 수치와 맞지 않게 바꾸거나 판본 차이를 임의 정답으로 확정하지 않았다. 각 은행의 `pendingSourceNos`에 남겼다. 활용1의28번, 활용3의6·29번 등 판정 충돌은 원시험 답을 변경하지 않는다. 활용4의4번 시간당/하루, 활용5의18번6600/6000 판본 차이를 분리했다.

다음은 활용6~9회 제작과 각 회차 미준비 유형 해결, 이후 기존 은행 추가6개다. 활용6회 문제6쪽 직접 읽기와 답안6쪽 확보를 마쳤지만 문항 제작·검산·출력은 미완료다. 답안 렌더의 글꼴 경고를 실제 문항별로 확인하고 PDF 원본을 우선한다. HWP 변환 없음.

## 검수 실행 파일

`qa/applied1-independent-validate.py`부터`applied5-independent-validate.py`, 회차별`pool-browser-validate.cjs`, `qa/applied-expanded-inventory-validate.py`, `qa/applied-diagnosis-links-browser-validate.cjs`, `qa/bank-learning-profile-browser-validate.cjs`. 구870/630문항·5단계 UI 기대값 검사는 현행900원문·3단계 UI 검사로 대체하며 소급 전체 통과라고 쓰지 않는다.

## Drive ZIP 재읽기 SHA256

- 활용1: 36,989,222bytes · `5e7b4834568c65e7cde2a982e9aca2bad2a46cc52c1e6b4a8429a47c1589abd0`
- 활용2: 26,976,160bytes · `f0bb676b9ac0b495690a6e3d36ca3abed1966d98287b201ccf5505b2ecf98ced`
- 활용3: 29,263,257bytes · `bff330dc475e839159c419de10a77d3954bbc92d865e3ef53b1b8868cf2850fb`
- 활용4: 21,153,920bytes · `5d5ee4b22f2e28368ec97cdbe5c831a68bc3b8216ce0712e68c571c1ede77bf2`
- 활용5: 14,470,397bytes · `a9360c6987ba7f8f0c1d63b016aab4fb27d2662ebec4baa3347a8f39210d560b`
