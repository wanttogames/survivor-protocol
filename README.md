# 귀야 · GUIYA

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

## 한국어 기본 / 다국어 확장

기본 언어는 브라우저 설정과 무관하게 항상 `ko`입니다.

- `src/i18n/ko.ts`: 한국어 사전
- `src/i18n/en.ts`: 영어 사전 및 사전 타입
- `src/i18n/index.ts`: `DEFAULT_LOCALE`, `t`, `setLocale`, `getLocale`, `onLocaleChange`, 폰트 설정

```ts
import { t, setLocale } from './i18n';
setLocale('en'); // 영어
setLocale('ko'); // 한국어
const text = t('hud.level', { level: 5 });
```

메뉴·버튼·카드의 번역 레이블은 언어 변경 이벤트로 갱신됩니다. 전투 HUD의 동적 수치는 다음 전투 프레임에서 갱신됩니다.
번역 이벤트 구독은 텍스트 객체 파괴 시 해제됩니다. 언어 변경으로 Scene이나 전투를 재시작하지 않습니다.
언어 선택 UI, 브라우저 언어 감지, localStorage 저장은 아직 추가하지 않았습니다.

카드 데이터는 `nameKey`, `descriptionKey`, `descriptionParams`를 사용합니다.
설명에 표시할 실제 수치는 설정과 희귀도 배수에서 계산하고 `{value}`로 삽입합니다.
무기는 `weapon.pulseNeedle.name`, 적은 `enemy.grunt.name` 등으로 참조합니다.
기존 ID(power, rapid 등), 희귀도 ID(Common/Rare/Epic), 전투 로직 및 밸런스는 유지했습니다.

Canvas와 CSS 모두 Pretendard → Noto Sans KR → Malgun Gothic → Apple SD Gothic Neo → Arial → sans-serif 순서로 시스템 폰트를 사용합니다.
외부 폰트 CDN이나 런타임 폰트 다운로드는 없습니다. 테스트용 한글 폰트는 검증 환경에만 설치했으며 프로젝트에 포함하지 않았습니다.

이번 변경 검증: TypeScript/build 성공, 단위 테스트 8개 통과, 한/영 전환 및 카드 10종 최대 희귀도 텍스트 영역 검사, 한국어 주요 화면과 390×844 반응형 캔버스 확인.
`menu-preview.png`, `upgrade-preview.png`, `game-preview.png`, `gameover-preview.png`, `mobile-preview.png`에서 검증 화면을 확인할 수 있습니다.

적용: 기존 저장소의 동일 경로에 소스 파일을 반영한 후 `npm run build`로 확인하고 커밋/푸시하세요. 이 ZIP에는 .git과 node_modules가 포함되지 않습니다. 이번 작업에서 GitHub 푸시 또는 Cloudflare 재배포는 수행하지 않았습니다.


## 1차 조선 오컬트 리스킨

봉인이 무너진 조선의 밤, 퇴마사가 파사부로 귀물을 막으며 새벽까지 살아남는 테마입니다.
이번 버전은 세계관·명칭·UI·색감 변경에 한정됩니다.

- 메뉴: 귀야 한글 타이틀, 희미한 달, 안개, 나뭇가지 실루엣, 추상 부적 문양
- HUD: 먹빛 반투명 패널, 목재색 테두리, 탁한 금색 체력과 청록색 혼백 게이지
- 성장 카드: 한지색 배경, 종이 섬유선, 붉은 인장, 모서리 문양, 선택 시 금빛 강조
- 결과 화면: 기력이 다했습니다 / 새벽이 밝았습니다, 생존 기록과 재시작
- 이름: 파사부, 떠도는 원혼, 야귀, 육귀, 혼백, 깨달음
- 술법: 파사 강화, 속필, 축지, 금강호신, 기력 회복, 분신부, 비부, 혼백 인도, 청명안, 관통부
- 희귀도: 일반 / 희귀 / 영웅 (기존 내부 ID 유지)
- `src/theme/palette.ts`: 테마 팔레트
- `src/theme/ornaments.ts`: 메뉴 배경, 테두리, 창작 추상 부적 문양
- `src/i18n/ko.ts`, `en.ts`: 한영 테마 문구. 기본 언어는 계속 한국어

이동·공격·AI·스폰·경험치·레벨업·효과량·충돌·HP·종료 판정은 변경하지 않았습니다.
`systems/*`, `config/balance.ts`, 업그레이드 효과 데이터는 이전 버전과 동일합니다.
GameScene 변경은 장식 및 색상, Projectile 변경은 색조에 한정됩니다.
텍스처 키와 물리 크기를 유지해 2차에서 그림만 교체할 수 있습니다.

검증: npm run build 성공, TypeScript 오류 없음, 테스트 8개 통과.
Chromium에서 메뉴·HUD·카드·결과의 한글 및 카드 10종 한영 텍스트 범위, 핵심 플레이 흐름을 확인했습니다.
Vite의 큰 Phaser 번들 권고 경고는 남아 있습니다.

2차 교체 대상(이번에 제작하지 않음):
1. player 텍스처 → 조선 퇴마사 스프라이트
2. grunt / runner / tank → 원혼 / 야귀 / 육귀 스프라이트
3. bolt / orb / spark → 파사부 / 혼백 조각 / 퇴마 효과
4. grid와 임시 바닥 문양 → 조선 마을·숲 타일셋
5. 추상 메뉴 배경과 카드 문양 → 정식 배경 아트·술법별 아이콘

기존 프로젝트 디렉터리와 배포 설정 이름 survivor-protocol은 유지했습니다.
소스와 dist를 포함한 압축 파일이며 GitHub 푸시 및 Cloudflare 재배포는 별도로 진행해야 합니다.
