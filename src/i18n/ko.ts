import type { LocaleMessages } from "./en";
export const ko = {
  map: { moonlitVillage: { name: "월하촌", description: "귀문이 열린 버려진 마을" } },
  boss: {
    "general": {
      "name": "원귀 장군"
    },
    "king": {
      "name": "귀왕"
    },
    "appear": "{name} 출현",
    "phase": "{name} · 귀기 폭주",
    "elite": "강한 귀물이 깨어났습니다",
    "defeated": "{name} 처치",
    "hp": "체력 {value}%"
  },
  bossReward: {
    "title": "봉인의 힘을 거두십시오",
    "guide": "보상 하나를 선택하면 전투가 계속됩니다",
    "badge": "보스 보상",
    "runOnly": "이번 출정 동안 적용",
    "instant": "즉시 적용",
    "heal": {
      "name": "호신의 기운",
      "description": "최대 체력의 {value}%를 회복합니다"
    },
    "damage": {
      "name": "장군의 비급",
      "description": "모든 공격력 +{value}%"
    },
    "souls": {
      "name": "응축된 혼백",
      "description": "혼백 {value}을 즉시 얻습니다"
    }
  },
  result: {
    "character": "퇴마인 · {name}",
    "evolved": "진화 무기 · {names}",
    "bosses": "보스 처치 · {names}",
    "none": "없음",
    "elites": "엘리트 처치 · {count}"
  },

  evolution: {
    "thunder-talisman": {
      "name": "천뢰파사부",
      "description": "천뢰를 두른 부적이 적중한 뒤 주변 귀물에 연쇄 번개를 전합니다."
    },
    "vajra-rosary": {
      "name": "금강염주",
      "description": "더 큰 금빛 염주 여섯 알이 넓은 반경에서 귀물을 막습니다."
    },
    "soul-bell": {
      "name": "진혼령",
      "description": "넓어진 충격파 뒤에 잔향 파동이 한 번 더 울립니다."
    },
    "thunder-god-sword": {
      "name": "뇌신벽력검",
      "description": "거대한 검기가 귀물을 베고 번개 폭발을 일으킵니다."
    },
    "demon-slayer-bow": {
      "name": "멸귀신궁",
      "description": "빠른 화살 네 발이 긴 대열을 꿰뚫습니다."
    },
    "infernal-hellfire": {
      "name": "지옥업화진",
      "description": "거대한 진법 세 개가 오래 남아 강한 불길로 귀물을 태웁니다."
    },
    "badge": "진화",
    "max": "완성",
    "requirements": "{weapon} Lv{level} + {upgrade}",
    "announcement": "{name} · 진화"
  },
  character:{
  "exorcist": {
    "name": "퇴마사",
    "description": "부적과 술법을 다루는 퇴마인.\n균형 잡힌 힘으로 귀물을 막습니다.",
    "passive": "모든 공격력 +5%"
  },
  "shaman": {
    "name": "무녀",
    "description": "혼령의 기운을 읽는 무녀.\n멀리 떨어진 혼백까지 끌어당깁니다.",
    "passive": "혼백 흡수 범위 +25%"
  },
  "warrior": {
    "name": "무관",
    "description": "귀물을 베는 데 특화된 무관.\n강인한 체력으로 전장을 버팁니다.",
    "passive": "최대 체력 +25%"
  },
  "archer": {
    "name": "궁수",
    "description": "귀물의 약점을 꿰뚫는 사수.\n빠른 관통 공격에 특화되어 있습니다.",
    "passive": "투사체 속도 +15% · 관통 +1"
  },
  "monk": {
    "name": "승려",
    "description": "염주와 호신법으로 자신을 지키는 수행자.\n귀물에 둘러싸여도 쉽게 무너지지 않습니다.",
    "passive": "받는 피해 -10%"
  },
  "forbidden_sorcerer": {
    "name": "금기술사",
    "description": "금지된 술법을 사용하는 술사.\n강력한 힘의 대가로 육신을 희생합니다.",
    "passive": "모든 공격력 +20% · 최대 체력 -20%"
  },
  "select": {
    "title": "퇴마인을 고르세요",
    "guide": "해금 조건을 달성해 새로운 퇴마인을 만나세요",
    "selected": "선택됨",
    "available": "해금됨",
    "locked": "잠김",
    "weapon": "시작 무기 · {name}",
    "passive": "고유 능력 · {value}",
    "choose": "선택",
    "begin": "{name} · 출정",
    "back": "메인 화면",
    "progress": "진행 · {current} / {target}",
    "unlocked": "새 인물 해금 · {names}"
  },
  "unlock": {
    "default": "기본 해금",
    "souls": "누적 혼백 {target} 획득",
    "runKills": "한 판에서 귀물 {target}마리 처치",
    "survival": "한 판에서 {target} 생존",
    "weaponLevel": "{weapon} {target}단계 달성",
    "weaponKills": "{weapon}으로 누적 {target}마리 처치"
  }
},
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
    sector: "{character} · {weapon}\n귀왕을 봉인하고 새벽을 맞이하라",
  },
  hud: {
    characterBuild:"{character}   /   치명타 {critical}%",
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
    won: "승리",
    lost: "기력이 다했습니다",
    wonMessage: "귀왕을 봉인했습니다",
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
