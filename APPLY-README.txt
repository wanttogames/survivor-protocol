보스 작업 반영용 파일 묶음 (27개)

검증한 이전 Work 사본의 보스 관련 소스/테스트/package.json/README.md입니다.
Git 기준 diff 패치는 아닙니다. Windows 원본과 비교는 수행하지 못했습니다.

적용:
1. ZIP을 별도 폴더에 압축 해제합니다.
2. 포함 파일 목록을 확인합니다. 로컬에서 별도 수정한 동일 파일은 비교 후 병합하세요.
3. 압축 해제한 src/, tests/ 및 package.json, README.md를 C:\work\survivor-protocol에 같은 상대경로로 복사합니다.
   새 폴더만 덮는 것이 아니라 기존 src 폴더에 파일을 병합합니다.
4. 프로젝트 폴더에서 npm install, npm run build, npm test를 실행합니다.
5. git status --short 및 git diff --stat로 로컬 변경을 확인합니다.

검증: TypeScript/build 성공, 단위 테스트 33/33 및 보스/무기/진화/캐릭터/오디오/전체 플레이 브라우저 테스트 통과.
.git, node_modules, dist, 오디오 및 이미지 파일은 포함하지 않았습니다.
APPLY-README.txt와 FILES-SHA256.txt는 적용 안내이며 프로젝트에 복사하지 않아도 됩니다.
