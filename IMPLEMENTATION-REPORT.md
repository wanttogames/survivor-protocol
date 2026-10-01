# 저주·부적 구현 및 검증 보고서

## 작업 기준

- 프로젝트: Survivor Protocol / 귀야, Phaser 3 + TypeScript + Vite.
- GitHub `wanttogames/survivor-protocol`, 기준 커밋 `23120dcbbe9f237ccd482b882eecb16768dee880`.
- 연결된 저장소를 복제한 작업 사본에서 구현했습니다. `C:\work\survivor-protocol` 원본과 멈춘 Work의 미커밋 변경사항에는 접근하지 못했습니다.
- 원격 저장소 push 또는 서비스 배포는 수행하지 않았습니다. Windows 적용용 변경 파일만 제공합니다.

## 변경 파일

총 25개. 정확한 상대 경로는 아래와 같으며 ZIP의 `payload`에 동일한 경로로 들어 있습니다.

- `package.json`
- `src/bosses/Boss.ts`
- `src/bosses/BossManager.ts`
- `src/entities/Enemy.ts`
- `src/entities/Player.ts`
- `src/i18n/en.ts`
- `src/i18n/ko.ts`
- `src/scenes/GameOverScene.ts`
- `src/scenes/GameScene.ts`
- `src/systems/CombatSystem.ts`
- `src/systems/EnemySpawnSystem.ts`
- `src/systems/UpgradeSystem.ts`
- `src/talismans/TalismanSession.ts`
- `src/talismans/talismanConfig.ts`
- `src/talismans/talismanDefinitions.ts`
- `src/ui/Hud.ts`
- `src/ui/TalismanHud.ts`
- `src/ui/TalismanPanel.ts`
- `src/utils/Pool.ts`
- `src/weapons/WeaponSystem.ts`
- `tests/bosses-browser.mjs`
- `tests/browser-smoke.mjs`
- `tests/encounters.test.ts`
- `tests/talismans-browser.mjs`
- `tests/talismans.test.ts`

## 구현 내용

- 2분 / 5분 / 8분에 무작위 부적 1개 제안. 시간·상한·희귀도 보너스는 `talismanConfig.ts`에서 설정합니다.
- 수락 시 저주와 보상이 동시에 적용됩니다. 수락·거절한 부적은 같은 판에 다시 등장하지 않습니다.
- 기존 선택창 완료 → 부적 → 보스 보상 → 레벨업 순서로 대기 중인 선택을 처리합니다. 이미 열린 카드창을 교체하지 않습니다.
- 선택 중 Arcade Physics, 플레이어·적 이동, 투사체, 공격, 보스 패턴, 스폰, 혼백 이동, 생존 타이머와 전투 업데이트가 정지합니다. UI 입력은 유지합니다.
- 부적 선택창은 DOM 기반 반응형 모달로 구현했습니다. 기존 한지·먹색·적갈색 테마를 따르고, 버튼 높이는 48 CSS px 이상입니다. 작은 iframe에서도 버튼이 축소되지 않고, 가로 화면에서는 스크롤하여 선택할 수 있습니다.
- 한국어·영어, 키보드 1/2, 마우스·터치 지원. Tab 포커스 순환과 닫을 때 기존 포커스 복원.
- HUD 심볼, 종료 화면 이름 목록, 결과 데이터의 `talismanIds` / `rejectedTalismanIds` 추가.
- 수락 시 180ms 붉은 flash와 650ms 가장자리 효과, 850ms 텍스트 피드백. 거절 시 짧은 텍스트 피드백.
- `talisman:appear`, `talisman:accept`, `talisman:reject` Scene 이벤트를 사운드 hook으로 제공합니다. 신규 음원은 무음 상태이며 외부 에셋을 추가하지 않았습니다.
- 개발 모드의 `triggerTalismanEvent(id?)` 제공. 새 영구 저장이나 계정 시스템은 추가하지 않았습니다.

## 부적 목록

| 부적 | 위험도 | 저주 | 보상 |
|---|---|---|---|
| 삼도천의 부적 | 3 | 최대 적 수 ×1.25, 적 속도 ×1.10 | XP ×1.35 |
| 귀문의 부적 | 3 | 적 공격력 ×1.20 | 모든 피해 ×1.25, 보스 추가 피해 ×1.10 |
| 굶주린 혼의 부적 | 4 | 적 최대 HP ×1.30 | XP ×1.40, 엘리트 XP 추가 ×1.30 |
| 도깨비의 장난 | 2 | 적 속도 ×1.15 | 이동속도 ×1.12, 공격속도 ×1.10 |
| 저승사자의 계약 | 5 | 최대 HP ×0.70 | 모든 피해 ×1.40, 보스 추가 피해 ×1.20 |
| 붉은 달의 부적 | 4 | 최대 적 수 ×1.35, 이후 엘리트 이벤트마다 1마리 추가 | XP ×1.20, 능력 카드 Rare +10%p / Epic +5%p |

희귀도는 기존 능력 카드 Common/Rare/Epic 확률을 70/25/5에서 55/35/10으로 변경합니다. 무기 카드의 기존 Common 취급과 진화 카드의 Epic 규칙은 유지합니다. 보스 피해 보너스는 전체 피해와 곱해집니다. 예: 귀문 × 저승사자 계약의 보스 피해는 기본 피해 ×1.25×1.40×1.10×1.20입니다. 캐릭터 패시브와 기존 강화도 유지됩니다.

XP 배율은 혼백 획득과 보스 XP 보상에 한 번 적용합니다. 엘리트 추가 보상은 드롭에 한 번 적용하므로 굶주린 혼의 엘리트 XP는 ×1.40×1.30입니다.

## 기존 시스템 재사용

- `PlayerStats`와 캐릭터 패시브, 기존 강화: 수락 시 캐시 배율의 차이만 반영. 체력 강화의 증가분도 최대 HP 저주 배율을 유지합니다.
- `Enemy.spawn`과 `Pool`: 일반 적·엘리트·보스 소환이 같은 효과 참조를 사용합니다. 이미 등장한 적은 수락 시에만 한 번 갱신하며 HP 비율을 보존합니다.
- `Boss` / `BossManager`: 보스 능력치와 패턴 피해에 효과 연결. 기존 예고·소환·2페이즈 동작 유지.
- `WeaponSystem` / `CombatSystem`: 근접·범위·투사체·진화 무기의 기존 피해 경로 유지, 보스 추가 피해 연결.
- `UpgradeSystem`: 기존 희귀도 추첨과 진화 제공 규칙 유지.
- `GameScene`의 기존 카드 대기열과 물리·파티클 정지 방식 재사용.
- `i18n` 번역 키와 locale 구독, `RunResult`, 기존 scene 재시작·메뉴 전환 재사용.

## 성능과 상한

- 부적 누적 적 속도 배율 최대 1.60, 부적 공격속도 배율 최대 2.00, 최대 적 수 배율 최대 2.00.
- 기본 최대 적 수 420, 삼도천 단독 525, 붉은 달 단독 또는 조합 시 최대 560의 절대 성능 상한 적용. 보스 예약 객체도 풀 용량에 포함되므로 일반·엘리트 실체는 최대 558개입니다.
- 일반 적 스폰 간격과 기존 배치 크기는 유지합니다. 부적의 '최대 적 수' 효과는 개체 수 상한만 변경하며, 25% 효과가 스폰 배치를 반올림하여 갑자기 두 배로 만들지 않습니다.
- 부적 효과 배열은 수락할 때만 계산합니다. 활성 적 갱신도 수락 시 한 번이며 매 프레임 부적 배열을 reduce하거나 전체 적에 효과를 재적용하지 않습니다.
- 추가 엘리트는 풀이 꽉 차면 다음 업데이트에 재시도합니다.

## 테스트 결과

| 항목 | 결과 | 확인 내용 |
|---|---|---|
| TypeScript | 성공 | `tsc --noEmit` / build 단계 |
| Vite build | 성공 | production `dist` 생성 |
| 기존 + 신규 단위 테스트 | 성공 | `npm test`, 45개 통과 |
| 실제 Chromium 실행 | 성공 | 자동 이동·공격·XP·레벨업·일시정지·사망·Retry·승리·메뉴 |
| 부적 6종 개별 | 성공 | 스탯·활성 적·새 적·XP·엘리트 XP·보스 근접/투사체 피해 |
| 수락/거절 | 성공 | 선택 UI, 입력, 후보 제외, 게임 재개 |
| 선택 중 정지 | 성공 | 시간, 위치, 투사체 좌표/수명, 보스 패턴 타이머 유지 |
| 중첩 | 성공 | 2~3종 배율 곱 적용, HP 보정, XP ×2.268 |
| UI 충돌 | 성공 | 기존 카드 후 부적, 부적 후 보스 보상·대기 레벨업 순차 처리 |
| 적 수·엘리트 | 성공 | 붉은 달의 다음 엘리트 2마리, 활성 558 / 풀 560 상한 |
| 보스 회귀 검사 | 성공 | 12종 무기, 공격 예고·회피·적중, 소환, 귀왕 2페이즈, 보스 카드 보상 |
| 종료 및 초기화 | 성공 | 사망·귀왕 승리·Retry·메뉴 새 게임·Scene 재시작 후 중립 세션 |
| 모바일 | 성공 | Chromium 모바일 에뮬레이션, 390×844와 844×390, 실제 touch 입력, 버튼 44px 이상 |
| 런타임 오류 | 성공 | 부적 전체 검증 pageerror 0개 |

기존 보스·smoke 테스트는 시간 점프에 의한 새 부적 UI를 별도로 비활성화하여 기존 전투를 검사합니다. 부적 타이밍과 모달 충돌은 전용 브라우저 테스트에서 확인합니다. 개발 모드에서 시점과 선택 이벤트를 강제로 발생시켜 검증했으며 매번 실제 10분 전체 플레이를 기다리지는 않았습니다.

## 남은 이슈와 검증 범위

- 실제 휴대폰 하드웨어, Safari, itch.io 업로드된 iframe에서의 현장 검증은 아직 수행하지 않았습니다. Chromium 모바일 에뮬레이션 검증을 완료했습니다.
- 신규 부적 사운드는 hook만 있고 무음입니다. 도감·업적·영구 저장은 이번 범위에 포함하지 않았습니다.
- 수치는 1차 밸런스입니다. 저성능 휴대폰에서 560개 상한의 FPS와 장시간 난이도는 추가 확인이 필요합니다.
- Vite의 큰 Phaser 번들 경고는 남아 있으며 빌드는 성공합니다.
- Windows 폴더의 미커밋 변경사항과 이 작업의 충돌 여부는 `APPLY.ps1` 사전 해시 검사로 확인하세요. 다른 변경이 있으면 자동 덮어쓰기를 중단합니다.

## 적용 및 개발 확인

ZIP의 `APPLY-GUIDE.txt`와 `APPLY.ps1`을 사용하세요. 파일을 수동 병합할 때는 `manifest.json`의 이전/이후 SHA256을 확인할 수 있습니다. PowerShell 스크립트는 이 Linux 환경에서 직접 실행하지 않았습니다. 해시와 payload 일치는 별도로 검증했습니다.

```javascript
window.__SURVIVOR_GAME__.scene.getScene('Game').triggerTalismanEvent('samdo')
```

개발 서버의 게임 실행 중 Console에서 호출합니다. 사용 가능한 ID는 `samdo`, `gate`, `hunger`, `trick`, `reaper`, `moon`입니다. 자동화는 `npm run test:talismans`로 실행할 수 있습니다. Playwright Chromium이 설치되어 있거나 `CHROMIUM_EXECUTABLE_PATH`가 필요합니다.
