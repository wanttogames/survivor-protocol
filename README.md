# SURVIVOR PROTOCOL

Phaser 3 + TypeScript + Vite 기반 오프라인 싱글 플레이 생존 액션 MVP.
외부 CDN, 이미지 요청, 백엔드, 계정, DB가 없습니다. 모든 그래픽을 시작 시 생성합니다.

## 실행

Node.js 22 이상 권장.

```bash
npm install
npm run dev
```

터미널에 표시되는 http://127.0.0.1:5173 에 접속합니다.
HTML 파일을 더블클릭하는 방식 대신 개발 서버를 사용하세요.

```bash
npm run build
npm run preview
npm test
```

같은 네트워크의 모바일에서 화면을 확인하려면 `npm run dev -- --host 0.0.0.0`.
모바일 터치 이동은 이번 버전에 포함되지 않습니다. 세로 화면은 비율을 유지한 레터박스로 표시됩니다.

## 조작

- 이동: WASD / 방향키
- 공격: 가장 가까운 적에게 자동 발사
- 성장: 카드 클릭 또는 숫자 1 / 2 / 3
- 일시정지: ESC. 창 포커스를 잃어도 정지합니다.
- 시작 / 결과 화면 재시도: Enter 또는 버튼
- 목표: 10분 생존. HP 0이면 게임 오버, 10분 도달 시 생존 성공.

## 구성

- `src/game/Game.ts`: Phaser 설정과 Scene 등록
- `src/scenes/`: 텍스처 생성, 시작, 전투, 결과 화면
- `src/entities/`: Player / Enemy / Projectile / ExpOrb
- `src/systems/`: 생성 난이도, 자동 공격, 경험치, 성장 카드
- `src/data/`: 적 3종, 무기, 성장 카드 10종
- `src/config/balance.ts`: 플레이어 능력치, 제한 수, 경험치 곡선, 희귀도, 카드 효과, 600초 제한
- `src/ui/`: HUD, 카드 패널, 공통 버튼
- `src/utils/Pool.ts`: 재사용 객체 풀
- `tests/systems.test.ts`: 레벨업 큐, 희귀도, 최대 레벨, 능력치, 풀 테스트
- `tests/browser-smoke.mjs`: 실제 브라우저 플레이 흐름 검증

## 핵심 동작

0~2분 Drifter, 2분부터 Skitter, 5분부터 Bulwark 등장.
시간에 따라 생성 간격, 수량, HP, 이동 속도가 상승합니다.
적을 처치하면 경험치가 떨어지며 흡수 범위 안에서 끌려옵니다.
레벨업은 전투를 멈추고 3개 카드를 표시합니다. 경험치를 한 번에 많이 얻어도 모든 레벨업을 순차 처리합니다.
영구 카드가 모두 최대 레벨이면 회복 카드로 3개 슬롯을 채웁니다.

희귀도 Common 70% / Rare 25% / Epic 5%. 비율 및 배수는 balance.ts에서 조절합니다.
투사체 개수와 관통은 희귀도와 관계없이 +1이고 나머지 효과는 희귀도 배수를 적용합니다.

풀 한도: 적 420, 투사체 200, 경험치 600. 경험치 풀이 가득 차면 가까운 기존 오브에 가치를 합칩니다.
투사체별 적 세대 번호를 추적해 관통 중 같은 개체에 중복 피해를 주지 않습니다.
피격 텍스트 28개 / 입자 100개 제한. 최근접 검색은 매 프레임 대신 발사 주기에 수행합니다.
충돌기는 전투 Scene마다 2개만 생성합니다. 플레이어와 적, 투사체와 적 모두 Arcade Physics 사용.

## Cloudflare 정적 배포

Pages: 빌드 명령 `npm run build`, 출력 디렉터리 `dist`.
Workers Static Assets: 포함된 `wrangler.jsonc` 사용. 빌드 후 Cloudflare 인증된 환경에서 Wrangler로 배포합니다.
배포용 결과물은 `dist/`에 포함되어 있습니다. 소스 변경 후 다시 빌드하세요.
이 프로젝트에는 실제 계정 배포나 원격 저장소 연동을 수행하지 않았습니다.

## 검증

- npm install 완료
- npm run build 완료 (TypeScript strict 검사 포함)
- npm test: 5개 통과
- Chromium 실 브라우저: 시작, 이동, 자동 발사/충돌/처치, 경험치 흡수, 카드 일시정지/선택, ESC, 180마리 생성, 사망, 재시도 초기화, 600초 승리, 메뉴 복귀, 모바일 화면 비율, JS 오류 없음 확인
- 10분을 실제로 기다리는 대신 종료 시간 직전으로 설정하여 승리 분기를 검증했습니다.
- 180마리 검사는 실행 안정성 확인이며 특정 PC에서의 FPS 보증이 아닙니다.
- Phaser 포함 JS 번들 약 1.5MB (gzip 약 348KB). Vite의 500KB 청크 권고 경고는 빌드 실패가 아닙니다.

브라우저 테스트 재현:

```bash
npx playwright install chromium
node tests/browser-smoke.mjs
```

시스템 Chromium을 쓰려면 `CHROMIUM_EXECUTABLE_PATH`를 지정합니다.
테스트용 Game 접근은 개발 모드에서만 노출되며 프로덕션 번들에서 제거됩니다.

## 다음 우선순위

1. 실제 10분 플레이 기반 난이도/카드 선택 빈도 조정
2. 서로 다른 행동의 무기 2~3종, 엘리트와 마지막 보스
3. 모바일 가상 조이스틱 및 작은 화면용 HUD
4. 효과음/음소거, PWA

온라인 저장이나 영구 성장은 핵심 전투 밸런스가 검증된 후 추가합니다.
