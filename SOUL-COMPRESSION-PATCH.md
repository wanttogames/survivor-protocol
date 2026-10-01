# 혼백 EXP 병합/압축 수정

1. **기존 원인**: 혼백 풀 600개가 모두 활성화되면 신규 표시 없이 가장 가까운 기존 혼백에 EXP를 더했다. 이 최신 코드에는 단순 한도 초과로 EXP를 버리는 return은 없었지만, 전체 거리 탐색과 병합 외형 미갱신 때문에 드롭이 사라진 것처럼 보였다.
2. **변경 파일**: src/config/balance.ts, src/config/soulConfig.ts, src/entities/ExpOrb.ts, src/utils/SoulPool.ts, src/scenes/GameScene.ts, src/theme/objectTextures.ts, tests/souls.test.ts, tests/souls-browser.mjs, package.json.
3. **MAX_SOUL_ORBS**: 기존 설정 BALANCE.limits.orbs에서 120으로 관리한다. 다른 밸런스 수치는 변경하지 않았다.
4. **EXP 필드/병합**: 기존 ExpOrb.value를 재사용한다. addExp로 누적하고 collect로 전체 값을 한 번 반환한 뒤 0으로 만든다. 맵 바깥·오래된 혼백을 자동 삭제하지 않는다.
5. **병합 대상**: 활성 혼백 배열의 round-robin. 전체 거리 계산·정렬 없이 O(1). 획득 시 배열 끝 항목을 옮겨 O(1)로 제거하고 병합 인덱스를 정규화한다.
6. **외형 기준**: 1~9 소형 청색(scale 1), 10~29 중형 청록(1.15), 30~99 대형 청백(1.3), 100 이상 대혼백 청백/금색 링(1.45). 상위 3개 텍스처를 미리 생성하며 등급이 바뀔 때만 교체한다.
7. **Object Pool**: 기존 Pool을 상속한 SoulPool이다. 활성 수를 별도 추적하며 한도에서는 acquire를 호출하지 않는다. 획득한 비활성 슬롯은 기존 방식으로 재사용한다. Image만 사용하고 물리 body를 추가하지 않는다.
8. **보존 검증**: 실제 적 120마리로 120 EXP를 떨어뜨리고 추가 100마리로 1,000 EXP를 발생시켰다. 혼백 수는 120, 저장량은 1,120, 전부 수거한 raw EXP는 정확히 1,120이었다. 풀 acquire를 실패하도록 막아도 초과 드롭 100개는 모두 병합됐다.
9. **다중 레벨업**: 기존 경험치 배율 1.35를 획득 때 한 번 적용하고 LevelSystem/카드 큐를 유지했다. 14개 레벨업 선택이 순차 처리되고 pending=0, physics pause=false가 됐다. 배율이 들어간 소수 잔여 EXP는 기존 JavaScript 부동소수점 허용 오차 1e-9로 비교했다.
10. **초기화**: 실제 사망/귀왕 처치 후 Retry에서 활성 0, 저장 EXP 0, 병합 인덱스 0, 병합 횟수 0을 확인했고 새 혼백 1 EXP 생성도 확인했다. Scene create에서 새 풀을 생성하므로 이전 판 상태를 재사용하지 않는다.
11. **성능**: 혼백 이동의 최대 순회 수 600→120. 한도 이후 병합 O(1), 활성 수 O(1), 제거 O(1). 혼백 등급 계산은 spawn/addExp에서만 수행한다. 새 객체·텍스처·body를 병합 때 생성하지 않는다. DEV console에서 scene.getSoulDebugInfo()로 활성/최대 수, 저장 EXP, 병합 횟수/EXP, 인덱스를 확인한다. 생산 UI는 추가하지 않았다.
12. **빌드/테스트**: npm run build 성공(TypeScript 포함; 기존 큰 번들 경고). npm test 48/48 성공. 새 브라우저 테스트는 보존·4등급·텍스처 수 고정·대량 레벨업·UI pause·사망/승리 Retry 성공. 기존 보스·부적 회귀 검증도 성공(6종 효과/중첩/선택 큐/초기화/모바일 포함).

## 적용

ZIP의 src, tests, package.json을 C:\work\survivor-protocol 루트에 덮어쓴다. npm run build 후 새 dist로 배포한다. 마지막 부적/밸런스/카드 디자인 패치 위에 적용하는 변경이다.

무기·적·캐릭터·보스·맵·카드 희귀도·오디오·해금·진화는 변경하지 않았다. 초혼부/자석/액티브 스킬을 추가하지 않았다.
브라우저 검증은 Chromium에서 실제 Phaser 게임 경로를 사용했다. 사용자 Windows 프로젝트에 직접 복사하거나 원격 배포하지는 않았다.
