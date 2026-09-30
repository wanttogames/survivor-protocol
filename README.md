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

## 2차 플레이 오브젝트 비주얼

- `src/theme/objectTextures.ts`: 시작 시 한 번 생성하는 픽셀 텍스처. 퇴마사 정지/걷기 2프레임, 원혼·야귀·육귀, 파사부, 혼백, 효과와 소품.
- `src/theme/CombatVisuals.ts`: 피격 종이 파편(최대 40), 붉은 피격 번짐, 재사용 각성 인장/파동.
- `src/theme/worldProps.ts`: 장승형 말뚝, 돌무더기, 등불. 충돌 없는 고정 장식이며 전투보다 낮은 레이어.
- BootScene: 기존 임시 도형 대신 새 텍스처 생성기 호출.
- Player/Enemy: 이동 속도·방향은 유지하고 회전 표현만 좌우 바라보기로 변경. 플레이어 걷기 프레임 추가.
- Projectile: 종이색을 보존하는 일반 투사체 색조와 금빛 치명타 색조.
- GameScene: 피격/사망/각성 효과 연결, 배경 소품 추가.

기존 64px 캐릭터 텍스처, 24px 투사체·혼백 텍스처 크기와 물리 원형 판정/오프셋 유지.
각 적에 추가 파티클이나 그림자 객체를 붙이지 않습니다. 원래 객체 풀과 사망 입자 제한 100을 유지하며 피격 입자만 전역 40개 상한으로 추가했습니다.
희미한 투사체 잔광은 텍스처 안에 포함되어 별도 궤적 객체를 생성하지 않습니다.
외부 이미지/유료 에셋/폰트/CDN 의존성은 없습니다. 그림은 작은 정수 좌표의 procedural pixel art입니다.

검증: npm run build 성공, 단위 테스트 8개 통과. 브라우저에서 메뉴, 이동, 적 3종, 자동 발사, 혼백 드롭/흡수, 카드, 사망, 재시도, 승리 및 모바일 비율 확인.
180마리 배치 시 실행을 확인했으며 특정 기기 FPS 보증은 아닙니다.
밸런스/적 수치/카드 효과/CombatSystem/EnemySpawnSystem/LevelSystem/UpgradeSystem은 1차 ZIP과 바이트 단위로 동일합니다.
시각 확인용 `objects-preview.png`에 플레이어·적 3종·부적·혼백 조각을 함께 배치했습니다.

3차 후보: 방향별 걷기·피격 프레임 보강, 소규모 조선풍 지형 타일, 효과음과 음소거. 이번 작업에는 신규 무기·보스·시스템을 추가하지 않았습니다.

## 3차 실제 사운드 연결

- `src/audio/AudioManager.ts`: 게임당 하나의 관리자, 미리 생성한 SFX 12개와 BGM 1개 재사용. master/SFX/BGM 볼륨 및 음소거 제어.
- `audioKeys.ts`, `audioConfig.ts`: 키·OGG 경로·볼륨·재생 간격·동시 재생 상한·미세한 rate 변화 설정.
- `preloadAudio.ts`: Boot에서 한 번 로드. 누락 파일은 경고 후 해당 소리만 생략.
- `audioControls.ts`: 시작/첫 입력에서 AudioContext 활성화. M 또는 우측 아래 상태 표시 클릭으로 음소거, localStorage 저장.
- `public/audio/`: 제공된 사운드팩의 OGG 9개 포함. 외부 CDN 없음.
- 실제 발사, 적 피격/사망, 혼백 획득, 각성, 카드 선택, 플레이어 피격/사망에 연결. 무적 중 피격음은 재생하지 않음.
- BGM은 Game 진입 시 반복, 레벨업 중 유지, 종료/메뉴에서 정지. Retry에서도 동일 객체 사용.
- 일반 효과음 최대 8개, 중요 효과음 포함 최대 12개. hit 50ms / death 70ms / pickup 45ms / player-hit 160ms 제한.
- 기존 이동·전투 수치·스폰·카드 효과는 유지. CombatSystem에는 실제 발사 시 호출하는 선택적 콜백만 추가.
- Vite BASE_URL 사용: 기본 배포에서 `/audio/sfx/*.ogg`, `/audio/bgm/night-stage.ogg`. `dist`에 실제 파일 복사됨. Cloudflare Pages에는 dist 배포.

검증: `npm run build`, `npm test` (8개), `npm run test:audio`.
오디오 브라우저 테스트는 Chromium 설치 후 실행 (`npx playwright install chromium`), 또는 `CHROMIUM_EXECUTABLE_PATH` 지정.
헤드리스 Chromium에서 9개 파일 로드, 오디오 믹서의 실제 비영점 출력, 8개 이벤트, BGM 루프, 각성 중 BGM 유지, 무적, 재생 제한, 사망 후 공격음 정지, Retry 3회, mute 저장/새로고침, 누락 파일 허용을 확인.
실제 스피커 청취 및 모바일/다른 브라우저 청취 품질 검증은 별도 필요.

## 4차 무기 빌드

시작 무기는 기존 파사부(`arc-bolt`) 1단계. 최대 6슬롯, 각 5단계이며 Retry에서 초기화됩니다.

### 구조 / 수정 위치

- `src/data/weaponConfig.ts`: 무기 6종의 단계별 수치, 슬롯·주기·범위·연출 판정 상수. `data/weapons.ts`는 기존 API 호환용 참조.
- `src/weapons/WeaponLoadout.ts`: Phaser와 분리된 보유/단계/슬롯 상태. `Weapon.ts`: 공통 컨텍스트와 수명주기.
- `WeaponSystem.ts`: 획득 시 구현체 생성, 공용 적 탐색, 피해·사망 피드백 연결, 종료 정리.
- `TalismanWeapon`, `RosaryWeapon`, `BellWeapon`, `LightningSwordWeapon`, `GhostArrowWeapon`, `HellfireWeapon`: 공격 방식별 구현.
- `geometry.ts`: 원형/부채꼴 판정. `theme/weaponTextures.ts`: Boot에서 한 번 생성하는 염주·파동·검기·화살·진법 텍스처.
- `data/weaponUpgrades.ts`, `UpgradeSystem`, `UpgradePanel`: 능력치+무기 혼합 카드, 신규/강화 구분, 다음 단계 설명·아이콘.
- `ui/WeaponBar.ts`: 현재 6슬롯과 무기 단계 표시. HUD의 파사부 발사 수는 무기 단계 보너스 포함.
- `i18n/ko.ts`, `en.ts`: 6종 이름/설명/단계별 효과, 카드 구분, 보유 무기 표시.
- GameScene은 무기 시스템 update/피해 이벤트만 전달. Projectile은 부적/화살 재사용 시 텍스처·판정·히트 기록을 초기화.

### 단계별 성장 (기본값, 공통 능력치 보너스 적용 전)

| 무기 | 1단계 | 2단계 | 3단계 | 4단계 | 5단계 |
|---|---|---|---|---|---|
| 파사부 | 기존 위력22·초당2.2회 유지 | 위력 ×1.2 | 부적 +1 | 발사 간격 ×0.85 | 위력 ×1.4·관통 +1 |
| 염주 | 2개·피해13·반경68 | 피해18 | 3개 | 반경86·회전속도 증가 | 4개·피해23 |
| 퇴마방울 | 피해30·2.8초·범위150 | 피해40 | 범위195 | 2.2초 | 피해52·범위230 |
| 벽력검 | 피해54·2.1초·사거리175 | 피해72 | 사거리220 | 1.65초 | 엇갈린 검기2회·피해84 |
| 귀살화살 | 피해30·1.25초·관통2 | 피해40 | 관통4 | 화살2발 | 피해50·관통6 |
| 업화진 | 피해11/틱·2.4초·범위72 | 피해15/틱 | 범위94 | 지속3.4초 | 한 번에 진법2개 |

수치는 이전 단계에 누적됩니다. 관통2는 최초 타격 후 추가 2대상(총 3대상)을 뜻합니다.
파사부는 기존처럼 발사 시 최근접 적을 조준하며, 비행 중 유도 로직을 새로 추가하지 않았습니다.
귀살화살은 빠르고 좁은 직선 관통, 벽력검은 발동 시 부채꼴 전체 타격입니다. 5단계 검기는 두 방향이 겹치는 적을 두 번 타격할 수 있습니다.

### 카드 / 공통 능력치

- 일반 카드 풀은 기존 10종+무기 6종. 보유하지 않은 무기는 획득, 보유한 무기는 다음 단계. 최대 단계 및 슬롯 초과 획득은 제외합니다.
- 정상 카드 추첨은 중복 없는 3장. 모든 유한 카드가 소진된 경우에만 기존 회복 카드 3장 fallback을 유지합니다.
- 무기는 고정 단계 성장으로 표시하며 희귀도 수치 배율을 적용하지 않습니다. 기존 능력치 카드의 희귀도·효과 수치는 유지합니다.
- 공격력/치명타는 모든 무기에, 공격 속도는 시전 쿨다운에 적용합니다. 염주의 적별 접촉 간격은 고정입니다.
- 투사체 수/속도/관통은 파사부와 귀살화살에 적용합니다. 회전 염주 개수·업화진 개수는 해당 무기 단계로 성장합니다.

### 성능 / 범위 유지

- 최근접 탐색 결과는 한 update에서 공유(캐시 대상이 죽었을 때만 재탐색), 정렬 없음.
- 염주 판정은 0.05초마다, 같은 적은 0.45초 간격. 풀 객체 재사용 시 generation으로 새 적을 구분합니다.
- 방울·검기는 발동 때만 범위 판정. 업화진은 0.4초 tick, 고정 4개 장판 객체 재사용.
- 화살은 기존 상한 200 투사체 풀/단일 overlap/TTL 사용. 모든 신규 이펙트는 재사용 이미지이며 별도 적별 Collider나 Tween을 생성하지 않습니다.
- 신규 SFX/BGM 파일을 참조하지 않습니다. 부적 발사음과 공통 피격·사망음은 기존 AudioManager 제한 적용.
- 기존 balance.ts, 적 수치, 이동, 스폰, 경험치, AudioManager 설정은 3차와 동일합니다.
- 진화 조건/변환 로직은 구현하지 않았습니다. 향후 WeaponId, Loadout, 데이터 정의, 구현체 factory에 진화 규칙과 전환 수명주기를 추가할 수 있습니다.

### 검증

`npm run build`, `npm test`, `npm run test:browser`, `npm run test:audio`, `npm run test:weapons`.
브라우저 테스트에는 Playwright Chromium 또는 CHROMIUM_EXECUTABLE_PATH가 필요합니다.
무기 테스트는 실제 카드 선택, 전 무기 1~5단계, 5단계 제외, 접촉 쿨다운, 범위/방향/관통, 장판 tick/만료, KO/EN 설명 크기, 6종 동시 전투, 재시도 초기화, 없는 에셋 요청 여부를 검사합니다.
전투/카드 미리보기는 weapons-combat-preview.png, weapons-cards-preview.png입니다.

검증 환경 기록: 헤드리스 Chromium / SwiftShader 소프트웨어 렌더링, 적 354마리.
6종 동시 전투 중앙 프레임 66.6ms, p95 83.3ms. 동일 적 배치의 파사부 단독 비교 중앙값도 66.6ms였으며, 무기 update 자체 p95는 1.3ms였습니다.
따라서 이 환경에서는 무기 추가에 따른 큰 프레임 저하는 관찰되지 않았으나, 실제 GPU PC/모바일의 60FPS를 보증하는 결과는 아닙니다.
단위 테스트 12개, 기존 플레이/오디오 및 신규 무기 브라우저 테스트 통과. 실제 Cloudflare 재배포는 수행하지 않았습니다.
