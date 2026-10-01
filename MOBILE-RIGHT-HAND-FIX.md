# 오른손 조이스틱 / 모바일 종료 버튼 수정

## 적용

이 ZIP이 최신 수정본입니다. `src`, `tests`, `package.json`, `package-lock.json`, `tsconfig.json`, `index.html`을 `C:\work\survivor-protocol`의 동일 위치에 덮어쓰고 `npm run build`를 실행하세요. 누락 없이 적용할 수 있도록 기존 모바일 이동 작업을 포함한 최신 소스 전체를 넣었습니다. 기존 에셋 폴더를 그대로 사용합니다.

## 확인한 원인

- 캔버스 FIT 배율 때문에 종료 화면 버튼의 실제 터치 영역도 함께 작아졌습니다. 390×844 에뮬레이션에서 기존 버튼 높이는 약 17.7px였고, 버튼 중심에서 14px 벗어난 터치는 반응하지 않았습니다.
- 이전 DOM 조이스틱은 PointerEvent를 처리했지만, Phaser의 Window 리스너에 전달되는 별도 TouchEvent를 분리하지 않았습니다. 조이스틱을 누른 채 Scene이 끝나면 Phaser 터치 포인터가 남아 다음 캔버스 터치를 막을 수 있었습니다.
- 터치 종료 pointerup은 도착해도 후속 click 합성이 누락되는 경우도 브라우저 검증에서 관찰했습니다. 실제 터치 해제로 동작시키고, click은 키보드/마우스 호환 경로로 유지했습니다.

## 구현

- 조이스틱을 오른쪽 하단으로 옮겼습니다. 캔버스 경계, 하단 HUD, 오른쪽 safe-area를 고려하고 회전/리사이즈에 따라 위치를 갱신합니다.
- DOM 조이스틱과 종료 버튼의 TouchEvent가 Phaser 전역 입력으로 중복 전달되지 않게 분리했습니다. 이동 중 사망한 뒤 손가락을 떼어도 Phaser에 활성 터치 포인터가 남지 않는지 검사했습니다.
- 모바일 Game Over / Victory에는 최소 48 CSS px 높이의 두 버튼을 표시합니다. 화면 배율과 무관하게 크기를 유지하고, 기존 ko/en 텍스트를 재사용합니다.
- 터치 버튼은 자신에게 시작한 pointer의 유효한 해제를 처리합니다. pointercancel과 큰 드래그를 검사하고, 한 번 선택하면 두 버튼을 잠가 Scene 전환이 중복 실행되지 않게 합니다. Scene 종료 시 DOM과 언어 구독을 정리합니다.
- PC의 기존 Phaser 종료 버튼과 Enter 단축키를 유지했습니다. 모바일에서는 해금 안내 위치도 버튼과 겹치지 않게 조정했습니다.

## 변경 파일 (직전 모바일 수정본 대비 5개)

- src/input/VirtualJoystick.ts
- src/ui/MobileResultActions.ts (추가)
- src/scenes/GameOverScene.ts
- src/style.css
- tests/touch-movement-browser.mjs

## 검증

- `npm run build`: PASS. TypeScript 검사 포함. 기존 큰 번들 경고는 남아 있습니다.
- `npm test`: 50/50 PASS.
- `npm run test:touch`: PASS, JavaScript 오류 0건.
- 390×844, 844×390, 320×568, 1024×768: 오른쪽 조이스틱 위치, 캔버스 범위, 하단 HUD 비중첩 확인.
- Game Over → Retry 및 Victory → Main Menu → New Game을 네 화면 크기에서 반복 확인. 실제 터치로 선택했으며 중심에서 ±14px 벗어난 탭도 정상 동작했습니다.
- 조이스틱 드래그 중 종료 후 손가락 해제: Phaser에 남은 활성 터치 없음, 새 게임 조이스틱 1개, 이동 방향 0.
- WASD/방향키/대각선, PC 결과 화면 마우스 버튼, 모바일 메뉴/캐릭터 선택, 레벨업·부적·보스 보상, 멀티터치 정상.
- 한국어/영어 종료 버튼 확인.

검증은 Chromium 모바일 터치 에뮬레이션에서 수행했습니다. 실제 Android/iPhone 및 Safari 실기기 검증은 수행하지 않았습니다. 로그와 화면 캡처는 ZIP의 verification / previews에 포함했습니다.
