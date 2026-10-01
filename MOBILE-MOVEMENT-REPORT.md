# 모바일 이동 구현 완료

## 적용 방법

`survivor-protocol-mobile-movement-update.zip`의 `src`, `tests`, `package.json`, `package-lock.json`, `tsconfig.json`, `index.html`을 `C:\work\survivor-protocol`의 동일 위치에 덮어쓰세요. 기존 에셋 폴더는 그대로 사용합니다. 이번 ZIP에는 검증한 최신 소스 전체를 넣어 이전 카드/부적/혼백 구현과의 파일 누락을 방지했습니다.

```bash
npm run build
npm test
npm run test:touch
```

브라우저 테스트는 Playwright Chromium이 필요합니다. 기본 설치 위치를 사용하거나 `CHROMIUM_EXECUTABLE_PATH`로 실행 파일을 지정할 수 있습니다.

## 완료 보고

1. **원인**: GameScene에서 이동 방향을 WASD/방향키 상태로만 계산했습니다. 메뉴 터치 처리와 캐릭터 이동 입력은 별개여서 메뉴가 눌려도 이동은 불가능했습니다.
2. **변경 파일**: `src/input/InputManager.ts`, `src/input/VirtualJoystick.ts`, `src/input/movement.ts`, `src/game/Game.ts`, `src/scenes/GameScene.ts`, `src/style.css`, `src/i18n/ko.ts`, `src/i18n/en.ts`, `tests/movement-input.test.ts`, `tests/touch-movement-browser.mjs`, `package.json` — 11개입니다.
3. **InputManager**: 활성 키보드 입력이 있으면 키보드, 없으면 조이스틱 방향을 반환합니다. GameScene은 이를 기존 Player.move에 전달합니다. Player의 이동 속도, 캐릭터 패시브, 물리 처리는 그대로 재사용했습니다.
4. **VirtualJoystick**: 프레임워크 없는 DOM/CSS 컨트롤입니다. 화면 좌표로 고정되어 월드 카메라와 독립적입니다. 먹색 외곽 원, 금색 테두리, 청백 thumb와 붉은 인장으로 구성했습니다. 지름 104~136px, dead zone 12%, 방향 벡터 정규화, thumb 반경 제한을 설정으로 관리합니다. 한지/금색 HUD 하단 영역을 피해 배치하고 세로 화면에는 아래 여백을 활용합니다. 캔버스 크기 관찰과 레이아웃 갱신은 크기 변경 때만 수행합니다.
5. **터치 환경 판정**: navigator.maxTouchPoints > 0일 때 표시합니다. 마우스 전용 PC에서는 생성하지 않습니다. 접근성 이름은 ko/en에 추가했습니다.
6. **UI 충돌 방지**: 레벨업, 보스 보상, 부적, pause, Scene pause/sleep, 종료 상태에서 조이스틱을 숨기고 방향과 속도를 초기화합니다. 다시 활성화되어도 새 터치가 필요합니다. 게임 컨테이너와 조이스틱에만 터치 제스처 억제를 적용합니다. 화면 회전 시 Phaser FIT가 이전 부모 크기를 사용하는 문제도 실제 부모 크기 재확인으로 보정하고, 캔버스 중앙 배치 margin이 부모 밖으로 합쳐지지 않게 했습니다.
7. **Multi-touch**: 조이스틱을 시작한 pointerId 하나만 capture합니다. 다른 손가락의 이동/해제가 소유 손가락을 바꾸지 않습니다. pointerup, pointercancel, lostpointercapture, 포커스 상실, 숨김, Scene 종료/재시작 시 초기화 및 이벤트 해제를 수행합니다.
8. **모바일 브라우저 검증**: Chromium 터치 에뮬레이션 PASS. 상하좌우/대각선, 즉시 정지, dead zone, 원 밖 드래그, cancel, 두 손가락, 키보드 병행, 카메라 고정, 실제 메뉴/시작 버튼/카드/부적 버튼 터치, 보스 보상 및 대기 레벨업, Scene pause, Retry, Victory → Main Menu → New Game을 확인했습니다. 390×844, 844×390, 320×568, 1024×768에서 화면 회전 후 캔버스/컨트롤 범위 및 하단 HUD 비중첩을 검증했습니다. 이동 수치 검증에는 피해와 일반 적 스폰을 통제했습니다. 실제 Android/iPhone 기기 및 Safari 검증은 수행하지 않았습니다.
9. **PC 회귀 검증**: WASD, 방향키, 두 종류의 대각선 조합 PASS. 대각선 속도가 이동 속도와 동일하며 키 해제 후 정지합니다. 터치 가능한 환경에서도 키보드 입력이 정상 작동합니다. 기존 카드 브라우저 테스트에서 한국어/영어 및 터치 카드 선택을 추가 확인했습니다. 단위 테스트 50/50 PASS.
10. **빌드**: npm run build PASS. TypeScript 검사 포함. 기존 대형 번들 경고는 남아 있으며 컴파일 오류는 없습니다.

검증 로그와 화면 캡처는 ZIP의 verification / previews에 포함했습니다. 이번 입력 변경에는 새 외부 에셋이나 런타임 의존성이 없습니다.
