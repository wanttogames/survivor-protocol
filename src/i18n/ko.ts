import type { LocaleMessages } from "./en";
export const ko = {
  audio: {enabled:"M · 소리 켜짐",muted:"M · 음소거"},
  meta: {
    title: "귀야 | GUIYA",
    description:
      "봉인이 무너진 조선의 밤. 퇴마사가 되어 파사부로 귀물을 막고 새벽까지 살아남으세요.",
  },
  menu: {
    eyebrow: "조선의 밤 · 퇴마 생존록",
    titleFirst: "귀야",
    titleSecond: "NIGHT OF SPIRITS",
    tagline: "봉인이 무너진 밤, 귀문이 열렸다.",
    description: "새벽까지 살아남아라.",
    play: "시작",
    moveGuide: "이동   WASD / 방향키",
    autoAttack: "공격은 자동으로 진행됩니다   •   ESC 일시정지",
    sector: "퇴마사 · 파사부\n새벽까지 열 분",
  },
  hud: {
    weapons: "무기 {count}/{max}",
    hp: "체력",
    level: "레벨 {level}",
    exp: "혼백",
    time: "생존 시간",
    kills: "처치 수",
    controls: "ESC  일시정지   /   1–3  카드 선택",
    waveFirst: "초경 / 원혼 출몰",
    waveSecond: "심야 / 귀문 개방",
    waveThird: "새벽 전 / 백귀의 밤",
    build: "{weapon}   /   부적 {count}장   /   치명타 {critical}%",
  },
  pause: { message: "일시정지\n\nESC를 눌러 계속하기" },
  upgrade: {
    newWeapon: "신규 무기",
    weaponUpgrade: "무기 강화",
    eyebrow: "깨달음",
    title: "술법을 깨우치세요",
    guide: "비급 하나를 골라 귀물을 물리칠 힘을 얻으세요",
    rarity: "{rarity}   /   {number}",
    level: "단계 {current} → {next}",
    controls: "숫자 1 / 2 / 3 또는 카드 클릭    •    전투 일시정지 중",
  },
  gameOver: {
    won: "새벽이 밝았습니다",
    lost: "기력이 다했습니다",
    wonMessage: "긴 밤을 버텨냈습니다",
    lostMessage: "귀야는 아직 끝나지 않았다",
    time: "생존 시간",
    level: "도달 레벨",
    kills: "처치 수",
    retry: "다시 시작",
    mainMenu: "메인 화면",
  },
  rarity: { Common: "일반", Rare: "희귀", Epic: "영웅" },
  weapon: {
  "pulseNeedle": {
    "name": "파사부"
  },
  "talisman": {
    "name": "파사부",
    "description": "가장 가까운 적을 조준하는 부적입니다.",
    "level1": "적을 조준해 부적을 발사합니다.",
    "level2": "파사부 기본 위력 +{damagePercent}%",
    "level3": "동시 발사 부적 +{count}장",
    "level4": "발사 간격 {cooldownPercent}% 감소",
    "level5": "기본 위력 +{damagePercent}%\n추가 관통 {pierce}회"
  },
  "rosary": {
    "name": "염주",
    "description": "주변을 회전하며 접근하는 귀물을 타격합니다.",
    "level1": "염주 {count}개가 주변을 회전합니다.",
    "level2": "염주 기본 피해 {damage}",
    "level3": "회전하는 염주 {count}개",
    "level4": "회전 반경 {range}\n회전 속도 증가",
    "level5": "염주 {count}개 · 기본 피해 {damage}"
  },
  "bell": {
    "name": "퇴마방울",
    "description": "주기적으로 주변 귀물에 영력 파동을 가합니다.",
    "level1": "{cooldown}초마다 주변에 영력 파동",
    "level2": "파동 기본 피해 {damage}",
    "level3": "파동 범위 {radius}",
    "level4": "발동 간격 {cooldown}초",
    "level5": "기본 피해 {damage} · 범위 {radius}"
  },
  "lightningSword": {
    "name": "벽력검",
    "description": "가까운 적을 향해 넓고 강한 검기를 펼칩니다.",
    "level1": "가까운 적 방향에 넓은 검기",
    "level2": "검기 기본 피해 {damage}",
    "level3": "검기 사거리 {range}",
    "level4": "발동 간격 {cooldown}초",
    "level5": "엇갈린 검기 {count}회\n기본 피해 {damage}"
  },
  "ghostArrow": {
    "name": "귀살화살",
    "description": "빠른 화살이 일직선의 귀물을 관통합니다.",
    "level1": "고속 직선 화살 · 관통 {pierce}회",
    "level2": "화살 기본 피해 {damage}",
    "level3": "화살 관통 {pierce}회",
    "level4": "동시 발사 화살 {count}발",
    "level5": "기본 피해 {damage} · 관통 {pierce}회"
  },
  "hellfire": {
    "name": "업화진",
    "description": "적 근처에 지속 피해를 주는 진법을 엽니다.",
    "level1": "적 근처에 {duration}초간 업화진",
    "level2": "매 타격 기본 피해 {damage}",
    "level3": "업화진 범위 {radius}",
    "level4": "업화진 지속시간 {duration}초",
    "level5": "한 번에 업화진 {count}개 생성"
  }
},
  enemy: {
    grunt: { name: "떠도는 원혼" },
    runner: { name: "야귀" },
    tank: { name: "육귀" },
  },
  player: { name: "퇴마사" },
  pickup: { name: "혼백 조각" },
  cards: {
    power: { name: "파사 강화", description: "모든 무기 위력 +{value}%" },
    rapid: { name: "속필", description: "무기 시전 속도 +{value}%\n염주 접촉 간격 제외" },
    boots: { name: "축지", description: "이동 속도 +{value}%" },
    vitality: {
      name: "금강호신",
      description: "최대 체력 +{value}\n늘어난 만큼 체력도 회복",
    },
    recovery: { name: "기력 회복", description: "체력 {value} 회복" },
    multi: { name: "분신부", description: "부적·화살 동시 발사 +{value}" },
    velocity: { name: "비부", description: "부적·화살 비행 속도 +{value}%" },
    magnet: { name: "혼백 인도", description: "혼백 인도 범위 +{value}%" },
    critical: { name: "청명안", description: "치명타 확률 +{value}%" },
    pierce: { name: "관통부", description: "관통 횟수 +{value}" },
  },
} satisfies LocaleMessages;
