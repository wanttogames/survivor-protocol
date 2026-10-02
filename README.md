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
- 목표: 초반 성장 → 엘리트 → 원귀 장군 → 강화 엘리트 → 귀왕 처치. 10분에는 귀왕이 등장하며, 귀왕을 처치해야 승리합니다. HP 0이면 게임 오버입니다.

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

## 한국어 / 영어 자동 감지 및 선택

언어는 저장된 사용자 선택 → 브라우저 `ko`/`ko-*`면 한국어 → 그 외/판정 실패는 영어 순서로 결정합니다. 자동 감지는 사용자 선택을 저장하지 않습니다.

- `src/i18n/ko.ts`: 한국어 사전
- `src/i18n/en.ts`: 영어 사전 및 사전 타입
- `src/i18n/index.ts`: `DEFAULT_LOCALE`(en), `detectLocale`, `initLocale`, `t`, `setLocale`, `getLocale`, `onLocaleChange`, 폰트 설정

```ts
import { t, setLocale } from './i18n';
setLocale('en'); // 영어
setLocale('ko'); // 한국어
const text = t('hud.level', { level: 5 });
```

메뉴·버튼·카드의 번역 레이블은 언어 변경 이벤트로 갱신됩니다. 전투 HUD의 동적 수치는 다음 전투 프레임에서 갱신됩니다.
번역 이벤트 구독은 텍스트 객체 파괴 시 해제됩니다. 언어 변경으로 Scene이나 전투를 재시작하지 않습니다.
메인 메뉴 오른쪽 위의 한국어/English 버튼에서 즉시 변경합니다. 선택한 언어에는 대괄호와 테두리가 표시됩니다. 직접 선택은 `survivor-protocol.locale`에 저장하며 진행도·선택 인물·오디오 설정은 유지합니다. localStorage 접근이 차단되면 저장 없이 현재 세션에서 변경할 수 있습니다.

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
- `src/i18n/ko.ts`, `en.ts`: 한영 테마 문구. 한국어 브라우저 기본 언어는 한국어

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
- 진화 규칙과 전환 수명주기는 아래 6차 작업에서 확장했습니다. 기본 무기의 Lv1~5 수치는 유지합니다.

### 검증

`npm run build`, `npm test`, `npm run test:browser`, `npm run test:audio`, `npm run test:weapons`.
브라우저 테스트에는 Playwright Chromium 또는 CHROMIUM_EXECUTABLE_PATH가 필요합니다.
무기 테스트는 실제 카드 선택, 전 무기 1~5단계, 5단계 제외, 접촉 쿨다운, 범위/방향/관통, 장판 tick/만료, KO/EN 설명 크기, 6종 동시 전투, 재시도 초기화, 없는 에셋 요청 여부를 검사합니다.
전투/카드 미리보기는 weapons-combat-preview.png, weapons-cards-preview.png입니다.

검증 환경 기록: 헤드리스 Chromium / SwiftShader 소프트웨어 렌더링, 적 354마리.
6종 동시 전투 중앙 프레임 66.6ms, p95 83.3ms. 동일 적 배치의 파사부 단독 비교 중앙값도 66.6ms였으며, 무기 update 자체 p95는 1.3ms였습니다.
따라서 이 환경에서는 무기 추가에 따른 큰 프레임 저하는 관찰되지 않았으나, 실제 GPU PC/모바일의 60FPS를 보증하는 결과는 아닙니다.
단위 테스트 12개, 기존 플레이/오디오 및 신규 무기 브라우저 테스트 통과. 실제 Cloudflare 재배포는 수행하지 않았습니다.

## 5차 캐릭터 선택과 해금

메인 메뉴 → 캐릭터 선택 → 출정 → 결과 → Retry / 메인 화면.
처음에는 퇴마사만 해금됩니다. 잠긴 5종도 카드와 목표/진행도를 표시합니다.

| 인물 (ID) | 시작 무기 Lv1 | 고유 패시브 | 해금 조건 |
|---|---|---|---|
| 퇴마사 (`exorcist`) | 파사부 | 모든 공격력 +5% | 기본 |
| 무녀 (`shaman`) | 퇴마방울 | 혼백 흡수 범위 +25% | 누적 혼백 1,000 |
| 무관 (`warrior`) | 벽력검 | 최대 체력 +25% | 한 판 처치 1,000 |
| 궁수 (`archer`) | 귀살화살 | 투사체 속도 +15%, 관통 +1 | 한 판 10분 생존 |
| 승려 (`monk`) | 염주 | 받는 피해 -10% | 염주 Lv5 |
| 금기술사 (`forbidden_sorcerer`) | 업화진 | 모든 공격력 +20%, 최대 체력 -20% | 업화진 누적 처치 500 |

### 코드와 저장

- `src/characters/characterTypes.ts`: ID, 정의, 해금 조건, 시각 설정 타입.
- `characterDefinitions.ts`: 모든 수치/조건/시작 무기/번역 키/색상 정의와 데이터 기반 패시브 적용.
- `CharacterManager.ts`: 선택 인물과 잠긴/알 수 없는 저장 ID fallback.
- `CharacterUnlockManager.ts`: 조건 검사, 누적값, 중복 해금 방지, 버전1 세이브 검증, 저장 및 결과 알림 목록.
- `characterVisuals.ts`: 기존 캐릭터에 리본/어깨 갑주/활/염주/인장 장식과 색조. 이동 프레임을 유지하며 정교한 캐릭터 아트는 포함하지 않음.
- `CharacterSelectScene.ts`: 3×2 카드, 잠김/해금/선택 상태, 조건과 진행도, 출정·메인 버튼. Enter 출정, ESC 메인.
- `Player`: 새로운 run에서 패시브를 한 번 적용. 기존 업그레이드와 누적됨. HP는 수정된 최대 HP로 시작.
- `WeaponLoadout`, `WeaponSystem`: 선택 캐릭터의 시작 무기만 생성. 파사부가 없어도 화살/투사체 TTL과 충돌은 작동하도록 수명·충돌 처리를 공통화.
- `GameScene`: 혼백 실제 흡수, 처치 무기 ID, 카드 무기 단계, 생존 시간/종료 결과를 진행도로 전달.
- `GameOverScene`: 이번 run의 새 해금 인물 표시. Retry는 저장된 동일 인물·Lv1 시작 무기를 다시 적용.
- 메뉴/HUD 안내도 현재 인물에 맞게 표시. i18n 한/영 이름·소개·패시브·조건·선택 UI 추가.

저장 키:

- `survivor-protocol.selectedCharacter`: 마지막 선택 ID.
- `survivor-protocol.progress`: `{version:1,totalSoulCollected,maxKillsInRun,maxSurvivalTime,weaponMaxLevels,weaponKillCounts,unlockedCharacters}`.
- 기존 음소거 저장 키는 유지.

혼백 누적은 실제 흡수한 혼백 가치/경험치량(`orb.value`)을 더합니다. 원혼 처치만으로 혼백 수가 증가하지 않습니다.
처치는 최종 피해를 가한 무기에 귀속되므로 업화진 해금은 업화진의 실제 처치만 집계합니다.
평소 localStorage 쓰기는 게임시간 약 1초마다 묶어 처리하고, 새 해금·종료·pagehide에서는 즉시 저장합니다.
잘못된 JSON, 지원하지 않는 버전, 불필요한 ID/비정상 값은 안전한 기본값 또는 제한된 값으로 처리합니다. 저장 접근이 차단되면 현재 세션은 메모리에서 진행합니다.

개발 환경 콘솔 전용:

```js
window.__GUIYA_CHARACTERS__.unlocks.progress
window.__GUIYA_RESET_PROGRESS__()
```

RESET 버튼은 없으며 위 window 도구는 Vite DEV에서만 노출됩니다.

### 검증

`npm run build`, `npm test`, `npm run test:characters` 및 기존 browser/audio/weapons 테스트.
제한된 테스트 실행 환경에서는 `node --import tsx --test --test-isolation=none tests/*.test.ts`로 16개 개별 단위 테스트 확인.
첫 상태, 잠긴 5카드, 모든 해금 조건 경계값, 실제 혼백/처치/무기강화/승리 이벤트, 세이브 복원/손상 fallback을 검증했습니다.
각 캐릭터의 시작 무기만 보유, 실제 공격 발생, 패시브 수치, 승려 접촉 피해 9(기본10), 시작 무기 강화/다른 무기 획득, 6인 모두 Retry 유지, 새로고침 선택 복원 확인.
한/영 카드 크기 검증과 한글 시각 확인용 `characters-locked-preview.png`, `characters-unlocked-preview.png` 포함.
기존 적 AI/스폰/적 수치/무기 성장 수치/업그레이드 수치/AudioManager/사운드팩은 유지했습니다. 캐릭터 패시브로 실제 전투 수치는 달라집니다.
향후 `CharacterDefinition.visual`에 정지/걷기 텍스처 키 세트를 추가하고 Player의 텍스처 선택을 연결하여 개별 아트로 교체할 수 있습니다.

이 ZIP은 작업 환경의 프로젝트 사본입니다. `C:\work\survivor-protocol` 및 GitHub/Cloudflare에는 직접 반영하지 않았습니다.


## 6차 무기 진화

기본 무기 Lv5와 해당 강화 카드 1단계 이상을 보유하면, 다음 레벨업부터 진화 카드 **한 장**이 보장됩니다. 여러 후보가 있으면 그중 무작위로 한 장만 표시합니다. 나머지 두 장은 기존 카드입니다. 선택하지 않으면 진화 가능 상태를 유지합니다. 캐릭터의 기본 패시브만으로는 진화 조건을 충족하지 않습니다.

| Lv5 기본 무기 | 필요 카드 | 진화 무기 (MAX) | 새로운 공격 특성 |
|---|---|---|---|
| 파사부 | 청명안 | 천뢰파사부 | 적중 후 최대 3대상 연쇄 번개, 청백 번개 부적 |
| 염주 | 금강호신 | 금강염주 | 큰 금빛 염주 6개, 넓은 궤도, 강화 접촉 피해 |
| 퇴마방울 | 속필 | 진혼령 | 큰 충격파 + 0.3초 후 잔향 파동 |
| 벽력검 | 파사 강화 | 뇌신벽력검 | 넓은 검기, 발동당 최대 3번 번개 범위 폭발 |
| 귀살화살 | 관통부 | 멸귀신궁 | 빠른 화살 4발, 추가 관통 14, 피해 감쇠 없음 |
| 업화진 | 혼백 인도 | 지옥업화진 | 큰 진법 3개, 5.2초 지속, 강화된 0.3초 피해 tick |

- `src/weapons/evolution/weaponEvolutionDefinitions.ts`: 타입, 조건, 번역 키.
- `WeaponEvolutionManager.ts`: canEvolve / isEvolved / getAvailableEvolutions / evolve. 상태는 현재 Loadout과 획득 카드에서 계산하며 영구 저장하지 않습니다.
- `EvolutionEffects.ts`: 시작 시 텍스처 생성, 12개 이미지 재사용. 번개는 적중·발동 때만 제한된 횟수로 탐색합니다.
- `src/data/weaponConfig.ts`: 진화 무기 수치 및 EVOLUTION_EFFECTS. 기존 무기 ID와 수치 유지.
- `WeaponLoadout.replaceWeapon`: 동일 슬롯/순서에 MAX 무기로 교체, 기본 무기 재획득 및 추가 강화 차단.
- `WeaponSystem.syncLoadout`: 이전 구현체/염주/파동/검기/진법 파괴 및 이전 투사체 비활성화. 강화 카드는 소모하지 않음.
- `UpgradeSystem`: 진화 후보와 일반 후보 통합, 진화 한 장 보장 및 중복 진화 차단.
- `UpgradePanel`, `WeaponBar`, `GameScene`, 한/영 i18n: 밝은 한지·금색 테두리·진화 배지·조건·MAX, 진화 이름/인장 파동/flash/shake. 기존 효과음만 재사용.
- 캐릭터 해금 처치 통계는 진화 후에도 기본 무기 계열로 귀속됩니다. 예: 지옥업화진 처치도 업화진 누적 해금에 포함. 진화 ID/상태는 localStorage에 저장하지 않습니다.
- Retry는 선택한 캐릭터의 기본 시작 무기 Lv1이며, 진화/획득 카드 상태는 초기화됩니다.

검증 명령:

```bash
npm run build
npm test
npm run test:evolution
```

진화 테스트는 6종 각각의 조건, 카드 선택, 동일 슬롯 교체, 이전 비주얼/투사체 정리, 새로운 공격 동작, 패시브 유지, 재등장 방지, Retry, 한/영 카드 크기 및 에셋 404/JS 오류를 검사합니다. 내부 개발 테스트에서만 조건/적 배치를 빠르게 준비하며 프로덕션 해금/성장 수치는 바꾸지 않습니다. 미리보기: `evolution-cards-preview.png`, `evolution-combat-preview.png`.

최종 검증: 단위 테스트 26개 통과, 진화/기존 무기/캐릭터/오디오/전체 플레이 Chromium 테스트 통과. 6종 진화의 이전 비주얼·투사체 정리, 모든 새 공격 특성, 패시브 보존, MAX 후보 제외 및 Retry 초기화 확인. 350마리 제어 시뮬레이션(6종 진화 동시 + 투사체 적중/연쇄 포함) update p95 약 2.1ms. SwiftShader 소프트웨어 렌더링 수치이므로 실기기 FPS 보증은 아닙니다. 빌드 성공/TypeScript 오류 없음, 기존 Phaser 번들 크기 권고 경고만 남습니다.


## 7차 엘리트 · 보스 · 처치 보상

| 게임 시간 (600초 기준) | 목표 |
|---|---|
| 0~2분 | 기존 일반 적 중심 성장 |
| 2분 | 원혼 엘리트 1회 |
| 5분 | 원귀 장군 1회 |
| 8분 | 강화 야귀/육귀 엘리트 각 1회 |
| 10분 | 귀왕 1회 등장, 전투 계속 |
| 귀왕 처치 | 승리 결과 화면 |

`src/encounters/encounterConfig.ts`의 ENCOUNTERS는 한 판 길이(BALANCE.duration)의 20% / 50% / 80% / 100%를 사용합니다. elapsed가 한 번에 여러 문턱을 지나도 각 encounter는 한 번만 발생합니다. 일시정지/카드 선택 중에는 게임 시간과 패턴 시간이 멈추며 새 run에서는 기록을 초기화합니다. 일반 적 풀 부족 시 엘리트를 재시도합니다. 보스 2개는 별도로 예약된 Enemy 기반 객체여서 풀이 꽉 차도 보스는 등장합니다.

### 추가 파일과 연결

- `src/encounters/encounterConfig.ts`: 시점 비율, 엘리트 3종, 보스 HP/속도/공격력/패턴/Phase, 일반 스폰 배수, 소환/투사체/아이템 한도, 보상 수치.
- `EncounterManager.ts`: 현재 run의 triggeredEncounterIds와 시간 기반 등장.
- `EliteManager.ts`: 기존 grunt/runner/tank 확대, HP·피해·속도 강화, 오라와 표식, 큰 혼백과 회복 부적 드롭.
- `spawnPoint.ts`: 플레이어에서 약 860px 떨어진 카메라 바깥 월드 안 좌표 선택.
- `src/bosses/Boss.ts`: 기존 Enemy 충돌/피해/타깃 경로를 그대로 공유하는 보스.
- `BossManager.ts`: 추적, 고정 공격 예고 위치/방향, 발동, 투사체/귀문 풀, Phase, 소환 한도와 수명.
- `BossRewardManager.ts`: 특별 카드 3개 생성과 한 번만 선택 가능한 적용. 보스 객체나 UI에 의존하지 않음.
- `bossTextures.ts`: 작은 픽셀 갑주/관모/붉은 눈/인장/혼백 실루엣 및 회복 부적·귀문·혼령탄 생성. 텍스처는 최초 생성 후 Retry에서 재사용.
- `src/ui/BossHud.ts`, `EncounterAnnouncement.ts`: 기존 HUD 아래 보스 이름·HP %, 짧은 등장/Phase 문구와 먹빛 강조.
- `UpgradePanel.ts`: 기존 카드에 금색 테두리·보스 보상 배지·특별 제목 모드 추가.
- `GameScene.ts`, `GameOverScene.ts`: 연결/보상 대기열/실제 귀왕 처치 승리, 사용 인물·진화 무기·보스/엘리트 통계 표시.
- `Enemy.ts`, `Pool.ts`, `EnemySpawnSystem.ts`, `RosaryWeapon.ts`: 보스 예약 객체를 일반 풀에서 제외, 큰 적의 실제 반경 사용, 보스 중 스폰 속도 배수.
- `CharacterUnlockManager.ts`: 버전1 세이브에 검증된 bossKills 통계 추가. 기존 세이브 호환 및 해금 조건 유지.
- 한/영 i18n, `tests/encounters.test.ts`, `tests/bosses-browser.mjs`, package scripts 추가. 기존 시간 승리 테스트는 귀왕 출현/처치 흐름으로 갱신.

### 패턴과 보상

원귀 장군: HP 10,000. 접근 → 0.75초 부채꼴 횡베기 예고 → 피해 판정. 약 11초마다 원혼 4마리 소환.
귀왕: HP 110,000. 플레이어 위치에 0.95초 원형 공격 예고, 0.7초 방향 예고 후 느린 혼령탄 8방향, 주기적인 귀문 2개. HP 50% 이하에서 패턴 간격 1/1.28로 감소하고 오라 강화. 강한 공격은 표시 당시의 위치/방향을 고정하여 피할 수 있습니다.

보스와 일반 적은 동일 WeaponSystem 대상입니다. 기본/진화 12종 모두 공격 가능하며 보스에게 강제 우선 조준하지 않습니다. 현재 무기에는 밀어내기 로직이 없으므로 보스도 반복적으로 밀리지 않습니다. 보스 중에는 기존 일반 적 생성 빈도를 0.6배로 낮추고, 보스가 없으면 복구합니다. 최종 전투 중 일반 적 수치의 시간 증가분은 기존 600초 수준으로 유지합니다.

엘리트: 기존 HP의 6~9배, 크기 1.3~1.4배. 기본 혼백의 12~16배(강화 엘리트는 추가 배수), 25% 확률로 최대 HP 20% 회복 부적을 드롭합니다. 부적을 실제 접촉하여 획득하며 35초 후 사라집니다.
원귀 장군 보상: 보유/강화 가능 무기 +1단계, 최대 HP 40% 회복, run 공격력 +10%, 현재 레벨 요구량의 1.5배 혼백, 가능할 경우 진화 중 카드 3개를 제시합니다. 진화 후보가 있으면 1장을 보장하며 나머지는 중복 없이 선택합니다. Lv5/MAX 무기는 강화 후보에서 제외합니다. 모두 MAX이고 회복이 필요 없더라도 공격력/혼백 보상은 유효합니다. 보상 혼백으로 발생한 일반 레벨업은 선택 후 순서대로 처리합니다.
귀왕 처치: 추가 보상 카드 없이 승리. 10분에 자동 종료하지 않으며 결과 생존 시간은 최종 전투까지 포함합니다. Retry는 선택 캐릭터의 기본 무기 Lv1, 시간/보스/패턴/HP Bar/encounter/보상 기록을 새로 시작합니다.

새 BGM/SFX 파일은 추가하지 않습니다. 기존 BGM 유지, 등장·보상·승리에는 level-up 계열, 피격/사망에는 기존 공통 효과음 사용. 기존 mute/재생 제한/Retry 중복 방지 유지.

### 통계, 개발 지원, 성능

현재 run: `eliteKills`, `bossKills`, `bossesDefeated`, `victory`. 영구 저장: 기존 `survivor-protocol.progress`에 `bossKills: { 'vengeful-general': number, 'ghost-king': number }`. 새 해금/업적/영구 능력치 기능은 추가하지 않았습니다.

개발 모드에서만 기존 게임 접근 도구로 테스트할 수 있습니다:

```js
const scene = window.__SURVIVOR_GAME__.scene.getScene('Game')
scene.bosses.spawnBoss('vengeful-general')
scene.bosses.spawnBoss('ghost-king')
```

Production 버튼/디버그 도구는 없습니다. 공격 예고 Graphics 1개, 혼령탄 이미지 32개, 귀문 3개, 회복 부적 8개 재사용. 보스 소환 적은 세대 번호로 추적해 동시에 16마리로 제한합니다. 같은 run의 보스를 중복 생성하지 않으며 사망 시 공격 예고/해당 투사체/귀문을 정리합니다. 기존 투사체·혼백·입자 풀과 두 Arcade overlap을 유지합니다. 카드 숫자 키 선택은 짧은 입력이 낮은 FPS에서 누락되거나 다음 카드를 연속 선택하지 않도록 키 이벤트로 처리합니다.

### 최종 검증

```bash
npm test
npm run build
npm run test:bosses
npm run test:weapons
npm run test:evolution
npm run test:characters
npm run test:audio
npm run test:browser
```

- 단위 테스트 33개 통과. timeline 경계/중복/비율/지연 재시도, 안전한 등장 위치, 예약 객체 풀, 스폰 배수, 보상/진화/한 번 선택, 세이브 통계 검증.
- Chromium 보스 테스트: 엘리트 3종과 혼백/회복 드롭·흡수, 원귀 장군 횡베기 예고/회피/피해/소환, 보스 체력바 숨김, 실제 보상 카드 선택/일시정지/재개 확인.
- 귀왕 원형 파동·혼령탄·귀문·Phase2, 12종 무기 피해, 타이머만으로 승리하지 않음, 실제 귀왕 처치 승리, 11분 이후 결과 시간, KO/EN 카드·결과 글자 크기, 사망/승리 후 Retry 초기화 확인.
- 보상 혼백 → 일반 레벨업 → 선택 → 재개 및 5ms 짧은 숫자 키 입력이 한 장만 선택함 확인.
- 기준 빌드의 10초 고정 표적 무기 피해 시뮬레이션: 일반 6무기 Lv3 + 기본 강화 기준 원귀 장군 DPS 413, 예상 24초. 6무기 Lv5 중 3진화 + 추가 강화 기준 귀왕 DPS 1,712, 예상 64초. 회피·일반 적 조준 경쟁·이동 없는 참고치이며 실제 한 판 전투시간 보장은 아닙니다.
- 일반 적 350마리 + 귀왕 Phase2/소환 상황에서 추가 보스·엘리트·HP UI update p95 약 0.1ms. 기존 6무기 350마리 실전 테스트도 통과. SwiftShader 소프트웨어 렌더링 기준이며 실기기 FPS를 보증하지 않습니다.
- 기존 무기/진화/캐릭터/오디오/전체 플레이 브라우저 테스트 통과. 오디오 9개 정상, BGM loop·mute·Retry 중복 방지, 누락 파일 내성 확인.
- TypeScript 오류 없이 build 성공. Phaser 포함 JS 1.59MB / gzip 약 375KB의 기존 청크 크기 권고 경고만 있습니다.
- 미리보기: `boss-general-preview.png`, `boss-king-preview.png`, `boss-reward-preview.png`, `boss-victory-preview.png`.

이 결과는 작업 환경 프로젝트 사본이며 Windows 폴더/GitHub/Cloudflare에는 직접 반영하지 않았습니다. Cloudflare Pages에서는 기존대로 `npm run build` / 출력 `dist`를 사용합니다.

## 8차 월하촌 맵

월하촌(`moonlit-village`)은 3,600 × 3,600 월드의 첫 번째 맵입니다. 시작점은 (1800, 2400)의 마을길입니다. 흙길이 버려진 민가, 장승 입구와 장승길, 공동묘지의 큰 고목, 폐사당과 봉인터를 연결합니다. 자유 이동을 유지하고 건물 내부, 미니맵, 신규 적/무기/보스/오디오는 추가하지 않습니다.

### 구조 및 생성

- `src/maps/mapDefinitions.ts`: MapDefinition, 6개 분위기 구역, 3개 연결 길, 고정 랜드마크와 시각적 스폰 제외 영역.
- `MapManager.ts`: run별 맵 인스턴스 생성/업데이트/보스 분위기/파괴. GameScene은 이 인터페이스만 호출합니다.
- `MoonlitVillageMap.ts`: 고정 마을 구조, run마다 조금 달라지는 작은 소품, 시작 이름 표시, 분위기와 화면 밖 청크 처리.
- `mapTextures.ts`: Canvas 기반 기와집/사당/장승 4형태/고목/봉분/비석/담/울타리/장독/상자/제단/등불/부적/안개/봉인 문양 생성.
- `spawnSafety.ts`: 월드 안 좌표와 민가/사당/큰 바위의 시각적 footprint를 확인하고 보정. 일반 적, 엘리트, 보스, 귀문/소환 적 경로에서 공유합니다.

9차 업데이트에서 큰 랜드마크의 실제 바닥 본체에 플레이어 전용 충돌을 추가했습니다. 작은 장식은 그대로 통과할 수 있고 직선 추적 적/보스/투사체는 건물 충돌을 무시합니다. 스폰은 건축물/큰 바위의 시각 영역과 충돌 구간에서 벗어나도록 보정하며 navigation/pathfinding은 추가하지 않습니다. 새 맵은 정의/renderer를 MapManager에 연결하는 방식으로 확장하며 GameScene을 복사하지 않습니다.

지형과 정적 소품을 36개 청크로 함께 구워 표시합니다. 청크 하나의 실제 텍스처는 300 × 300이며 월드에서는 600 × 600으로 표시합니다. 정적 소품 수백 개를 개별 live sprite로 렌더링하거나 매 프레임 다시 그리지 않습니다. 기본 지형/소품 텍스처는 게임 내에서 재사용하며 run별 합성 청크는 shutdown에서 제거합니다. 화면 밖 청크는 0.25초 간격으로 숨깁니다. 배경 캐시의 RGBA 픽셀 예산은 기본/합성 지형 합계 약 25 MiB이며 소품 텍스처가 별도로 소량 추가됩니다.

동적 장식은 안개 8개, 도깨비불 12개, 작은 부적 8개, 연기 3개, 등불 glow 6개와 봉인터 문양뿐입니다. 안개/도깨비불은 낮은 alpha이고 모든 맵 효과의 depth는 혼백/적/플레이어/공격 예고보다 낮습니다. Physics body, particle emitter, post-processing filter는 만들지 않습니다.

원귀 장군: 안개 농도와 지형 색조가 약간 변합니다. 귀왕: 안개/도깨비불 밝기/검은 연기 강화, 붉은 봉인 문양과 낮은 alpha의 원형 파동, 부적 흔들림. 보스가 사라지면 분위기가 복구되고 귀왕 처치 시 푸른 봉인 상태로 전환한 후 기존 승리 화면으로 넘어갑니다. 승리 화면 전환을 지연시키지는 않습니다.

Retry에서 장식/안개/문양/분위기/시간을 새로 만들고 이전 인스턴스와 합성 청크를 제거합니다. 캐시 텍스처 수와 맵 레이어 수는 늘어나지 않습니다. 카메라와 물리 월드 경계는 같은 MapDefinition 크기를 사용합니다. 한국어/영어 맵 이름/설명은 기존 i18n을 사용하며 BGM/SFX는 기존 파일을 유지합니다.

### 검증

```bash
npm run build
npm test
npm run test:map
npm run test:bosses
npm run test:evolution
npm run test:browser
```

`tests/maps.test.ts`는 footprint/경계/보스 거리/지도 데이터/번역을 확인합니다. `tests/maps-browser.mjs`는 실제 메뉴 → 게임 시작, 6구역, 키보드 이동, 카메라/월드 경계, 게임 update를 통한 엘리트/원귀 장군/귀왕 등장, 일반/소환 스폰 안전성, 무기/진화/혼백 가독성, 350마리 이상 상황의 맵 update 비용, 이전 배경 대비 프레임 시간, 사망 → Retry 정리, 모바일 canvas 크기를 확인합니다. 시간 분기는 2/5/10분 문턱으로 이동하여 검증하며 실제 10분 연속 플레이 테스트는 아닙니다. 헤드리스 Chromium/SwiftShader는 소프트웨어 렌더링이므로 실기기 FPS를 보증하지 않습니다.

구역별 실제 화면은 `map-previews/`에 있습니다. Windows 프로젝트/GitHub/Cloudflare에는 직접 반영하지 않았습니다. 반영용 ZIP의 같은 상대경로 파일을 병합한 뒤 다시 빌드하세요.

최종 실행 기록: 단위 테스트 35/35, map/bosses/evolution/browser Chromium 테스트 통과. 월하촌 생성, 6구역, 이동, 보스/소환 스폰 보정, 보상·승리·Retry, 390×844 canvas, 오류/404 없음 확인. 일반 적 364마리의 제어된 장면에서 맵 update p95 0.1ms. 같은 장면의 프레임 중앙값은 월하촌 92.9ms / 기존 grid+소품 배경 83.2ms였으며 p95는 115.0ms / 120.4ms였습니다. 소프트웨어 렌더링에서 배경 비용이 추가되므로 FPS가 동일하다고 보장하지 않습니다. GPU 실기기 및 실제 10분 연속 플레이는 별도 확인 대상입니다. 최종 TypeScript/build 성공, 기존 청크 크기 권고 경고만 남습니다.


## 9차 월하촌 제한 충돌

- `MapCollisionManager`가 보이지 않는 StaticGroup/Zone 33개와 플레이어 전용 Arcade collider 1개를 생성합니다. 충돌 면적 합계는 월드의 약 1.58%입니다.
- `mapDefinitions.collisionZones`는 landmark 상대 위치로 정의하며, 돌담 그림과 충돌은 같은 `getMapWalls` 배치를 사용합니다. 건물 위치를 바꾸면 충돌도 함께 이동합니다.
- 기와집 5채와 사당의 바닥 본체, 큰 바위 2개, 주요 돌담 12개(각 2구간), 사당 앞 큰 제단만 막습니다. 지붕, 문 앞 계단, 장승, 무덤, 봉인터 문양과 작은 소품은 통과합니다.
- 플레이어 기존 반지름 15px 원형 body를 유지합니다. 적/보스/투사체에는 건물 collider를 연결하지 않습니다.
- 공용 spawn validation에 충돌 구간을 추가했습니다. 적이 건물 안에서 죽어도 혼백은 기존 magnet으로 벽을 무시하고 흡수되며, 회복 부적은 접근 가능한 안전 위치로 보정합니다.
- Shutdown 시 collider/그룹/Zone/debug를 정리합니다. Phaser가 이미 정리한 그룹도 안전하게 처리합니다. Retry 3회에서 static body 33개, 지형 청크 36개, 안개 8개, 맵 텍스처 95개가 동일했습니다.
- 충돌 디버그는 개발 서버에서 `.env.local`에 `VITE_DEBUG_MAP_COLLISION=true`를 설정하고 재시작하면 표시됩니다. Production에서는 항상 꺼집니다.
- 매 프레임 배경 재생성, 소품 physics, pathfinding을 추가하지 않습니다.

검증: `npm test`(37개), `npm run test:collision`, `npm run test:bosses`, `npm run test:browser`, `npm run build`. 충돌 브라우저 테스트는 실제 Arcade step/키 입력, 정면 차단, 대각선 모서리 이동, 분할 돌담 경계 이동, 지붕/작은 장식 통과, 두 보스/적/투사체 통과, 혼백/회복 획득, 스폰 안전성, Retry 중복 방지를 확인합니다.

테스트 환경은 Chromium/SwiftShader이며 Windows 실제 장치의 FPS 검증은 별도입니다. Windows 프로젝트나 Git에 직접 적용한 것이 아니라 기존 프로젝트 사본을 수정한 업데이트 파일입니다.


## 10차 한국어/영어 선택 및 자동 감지

- 기존 `src/i18n/{ko,en,index}.ts`를 확장했습니다. `Locale`은 ko/en이며 key 타입과 사전/placeholder 동기화 테스트를 유지합니다. 대형 라이브러리와 외부 폰트를 추가하지 않습니다.
- 시작 시 `initLocale()` → 저장된 `survivor-protocol.locale`(ko/en) → `navigator.language`가 ko/ko-*이면 ko → 나머지/판정 실패는 en 순서로 적용합니다. 잘못된 저장 값은 무시합니다. 자동 감지는 설정을 저장하지 않습니다.
- 메인 메뉴 오른쪽 위 한국어/English 버튼은 현재 선택을 대괄호와 테두리로 표시합니다. 클릭 시 현재 Scene/페이지 재시작 없이 문자열과 문서 lang/title/description을 즉시 갱신합니다. 직접 선택은 localStorage에 저장합니다.
- Storage 읽기/쓰기 및 navigator 접근 실패는 예외를 잡습니다. iframe 등에서 저장이 차단되면 현재 세션의 언어 선택은 정상 동작하지만 새로 접속할 때 저장된 선택을 복구할 수 없습니다.
- 진행도, 캐릭터 해금, 선택 캐릭터, 오디오 설정은 별도 저장 키로 유지합니다. 언어 선택으로 초기화하지 않습니다.
- 기본/진화 무기 12종과 강화 명칭을 영어 게임 용어로 정리하고 HUD를 짧게 표시했습니다. 캐릭터 6종/조건/진행도, 메뉴, 카드/보상, 보스, 맵, 결과/알림, 오디오 문구를 기존 키로 관리합니다. 코드 ID/밸런스/충돌/음원은 그대로 유지합니다.
- 캐릭터 해금 조건의 무기명을 locale 변경 시 다시 계산합니다. 긴 영어 진화 무기명은 카드 제목 크기로 대응하고, 결과 화면의 진화 목록/버튼/해금 알림 간격을 조정했습니다.
- 번역은 현재 사전 → 영어 → key 순서로 fallback합니다. 누락 경고는 개발 환경에서 key/locale별 한 번만 표시하며 Production에서 출력하지 않습니다.
- 사용자에게 보이는 Text 생성 경로와 한글 하드코딩을 검색했습니다. UI 문구는 사전 키를 사용하며 숫자/기호/ID/디버그 문자열은 유지합니다. 언어 버튼의 언어 이름은 다른 언어에서도 모국어 표기를 사용합니다.

검증 결과:

```bash
npm test               # 40/40
npm run test:locale    # PASS
npm run test:evolution # PASS
npm run test:characters # PASS
npm run test:bosses    # PASS
npm run test:browser   # PASS
npm run build          # PASS
```

Chromium에서 ko/ko-KR/en-US/ja-JP/de-DE 첫 실행, 저장 locale 우선, 잘못된 저장 값, 실제 버튼 클릭/즉시 변경/재접속 유지, 설정 보존, Storage 차단을 확인했습니다. 한·영 각각 메뉴/캐릭터/해금 조건/HUD/맵/기본 무기 30단계/모든 강화 카드/진화 6종/보스/보상/승리/패배/해금 알림/음소거/Retry를 점검했습니다. 전체 진화 6개와 해금 5개를 표시해도 결과 화면이 겹치지 않습니다. 번역 누락 경고/페이지 예외가 없었습니다. 390×844 화면의 canvas bounds도 확인했습니다.

실제 itch.io 업로드/사이트 iframe 및 Windows 기기 테스트는 수행하지 않았습니다. Storage 차단은 브라우저에서 SecurityError를 주입해 검증했습니다. 빌드에는 기존 Phaser 대형 청크 권고 경고만 있습니다.

## Village progression

Main Menu → Training & Talismans opens permanent preparations. Each finished run
awards 12 coins per full minute survived, 8 per elite, 35 per boss and 100 extra for
victory. A death before one minute without encounter kills grants no coins. Settlement
occurs once in gameplay termination, never when re-entering the result screen.

Three trainings have three ranks: max HP +3%, pickup radius +5%, movement speed +2%
per rank. Five permanently unlocked departure talismans share one equipped slot:
Guardian (+10% HP and one blocked hit), Soul Summoning (+20% pickup radius), Swift
Stride (+5% movement), Scholar (+10% XP for the first 120 gameplay seconds), Spirit
Breaker (+5% boss damage). They are not consumed. Buying an unlock and equipping it
are separate actions. Preparations are copied once at run creation, after character
passives; cursed talismans continue to stack normally. Retry restores the loadout,
not temporary run buffs.

Balance and save validation live in `src/progression/MetaProgression.ts`. Progress is
saved under `survivor-protocol.village.v1` in this browser's localStorage, independently
of character unlocks. Clearing browser data clears this progress. If storage is
blocked, the current page session still works but cannot persist across reloads.

`npm run test:progression` runs browser integration tests for shopping, five charms,
settlement, storage reload, retry, cursed stacking and mobile Korean/English UI.
