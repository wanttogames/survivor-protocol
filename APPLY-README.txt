월하촌 맵 반영 패키지

이번 맵 작업에서 추가/수정한 프로젝트 파일 15개와 실제 플레이 화면 10개를 포함합니다.
검증한 이전 Work의 보스 구현 사본을 기준으로 만들었습니다. Windows 원본에는 직접 적용하지 않았습니다.
이전 survivor-protocol-boss-update.zip의 보스 구현이 이미 반영된 프로젝트에 적용하세요.

1. 별도 폴더에 압축을 풀고 FILES.txt를 확인합니다.
2. src/, tests/, package.json, README.md를 C:\work\survivor-protocol에 같은 상대경로로 병합합니다.
   로컬에서 별도로 수정한 동일 파일은 비교 후 병합하세요. 기존 src 폴더 전체를 삭제하지 마세요.
3. PowerShell에서 실행:
   cd C:\work\survivor-protocol
   npm install
   npm run build
   npm test
4. 로컬 개발 서버는 이전 프로세스를 Ctrl+C로 종료한 뒤 npm run dev -- --force로 다시 실행합니다.
   새로 출력된 Local 주소로 접속하고 Ctrl+Shift+R로 새로고침하세요.
   npm run preview를 쓴다면 먼저 npm run build를 실행해야 합니다.
5. Cloudflare 배포본은 수정 파일을 커밋/푸시하고 새 배포가 끝난 뒤 확인하세요.
6. git status --short 및 git diff --stat로 Windows 프로젝트의 변경을 확인하세요.

맵 이름: 월하촌 / Moonlit Village (moonlit-village)
월드: 3600 x 3600, 시작: (1800,2400).
큰 랜드마크까지 충돌 없는 배경으로 두고 스폰만 시각 영역 밖으로 보정합니다.
기존 보스/무기/진화/캐릭터/해금/오디오를 유지합니다.

검증: build/TypeScript 성공; 단위 테스트 35/35;
map, bosses, evolution, browser Chromium 테스트 통과; 오류/404 없음.
일반 적 364마리 맵 update p95 0.1ms.
SwiftShader 프레임 중앙값 월하촌 92.9ms / 이전 배경 83.2ms.
실기기 FPS 및 실제 10분 연속 플레이는 미검증입니다.

map-previews/는 각 구역/보스/전투/모바일 실제 캡처입니다.
APPLY-README.txt, FILES.txt, FILES-SHA256.txt는 적용 안내이며 프로젝트로 복사하지 않아도 됩니다.
.git, node_modules, dist, audio는 포함하지 않았습니다.
