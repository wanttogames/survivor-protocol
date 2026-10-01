export const en = {
  talisman: {
    title: 'CURSED TALISMAN · A DANGEROUS PACT', risk: 'Risk {stars}', curses: 'Curse', rewards: 'Power in Return',
    guide: 'This run only · 1 Accept / 2 Reject', accept: 'Accept the Talisman', reject: 'Burn It',
    accepted: 'Accepted {name}', rejected: 'The talisman was burned', hud: 'Talismans  {symbols}', result: 'Talismans acquired: {names}',
    names: {samdo:'Talisman of the Three Crossings',gate:'Talisman of the Spirit Gate',hunger:'Talisman of the Hungry Soul',trick:'Dokkaebi’s Trick',reaper:'The Reaper’s Pact',moon:'Talisman of the Red Moon'},
    effects: {enemyMaxCountMultiplier:'Maximum enemies +{value}%',enemyMoveSpeedMultiplier:'Enemy movement speed +{value}%',enemyDamageMultiplier:'Enemy damage +{value}%',enemyHpMultiplier:'Enemy maximum HP +{value}%',xpMultiplier:'XP gained +{value}%',playerDamageMultiplier:'All damage +{value}%',playerMoveSpeedMultiplier:'Movement speed +{value}%',attackSpeedMultiplier:'Attack speed +{value}%',bossDamageMultiplier:'Damage to bosses +{value}%',playerMaxHpMultiplier:'Maximum HP {value}%',eliteRewardMultiplier:'Elite XP +{value}% (stacks with XP bonus)',upgradeRarityBonus:'Stat cards: Rare +{rare}pp / Epic +{epic}pp',extraEliteCount:'Future elite encounters: +{value} elite'},
  },

  language: { label: "Language", korean: "한국어", english: "English" },
  map: { moonlitVillage: { name: "Moonlit Village", description: "An abandoned village beyond the spirit gate" } },
  boss: {
    "general": {
      "name": "Vengeful General"
    },
    "king": {
      "name": "Ghost King"
    },
    "appear": "{name} emerges",
    "phase": "{name} · spirit rage",
    "elite": "An elite spirit awakens",
    "defeated": "{name} defeated",
    "hp": "HP {value}%"
  },
  bossReward: {
    "title": "Choose Your Reward",
    "guide": "Choose one reward to continue the battle",
    "badge": "BOSS REWARD",
    "runOnly": "Applies to this run",
    "instant": "Applies immediately",
    "heal": {
      "name": "Protective Breath",
      "description": "Restore {value}% of maximum HP"
    },
    "damage": {
      "name": "General’s Secret Art",
      "description": "All attack damage +{value}%"
    },
    "souls": {
      "name": "Condensed Souls",
      "description": "Immediately gain {value} souls"
    }
  },
  result: {
    "character": "Character · {name}",
    "evolved": "Evolutions · {names}",
    "bosses": "Bosses defeated · {names}",
    "none": "None",
    "elites": "Elites defeated · {count}"
  },

  evolution: {
    "thunder-talisman": {
      "name": "Heavenly Thunder Talisman",
      "description": "Charged talismans chain lightning through nearby spirits."
    },
    "vajra-rosary": {
      "name": "Vajra Prayer Beads",
      "description": "Six golden beads guard a wider orbit."
    },
    "soul-bell": {
      "name": "Soul-Calming Bell",
      "description": "A wider shockwave is followed by a second echo."
    },
    "thunder-god-sword": {
      "name": "Thunder God’s Sword",
      "description": "Great slashes trigger lightning explosions."
    },
    "demon-slayer-bow": {
      "name": "Demon-Slaying Divine Bow",
      "description": "Four swift arrows pierce long enemy formations."
    },
    "infernal-hellfire": {
      "name": "Infernal Hellfire Formation",
      "description": "Three large, lasting seals burn spirits with stronger fire."
    },
    "badge": "EVOLUTION",
    "max": "MAX",
    "requirements": "{weapon} Lv.{level} + {upgrade}",
    "announcement": "{name} · EVOLVED"
  },
  character:{
  "exorcist": {
    "name": "Exorcist",
    "description": "A balanced practitioner of talismans\nand spirit arts.",
    "passive": "All attack damage +5%"
  },
  "shaman": {
    "name": "Shaman",
    "description": "Reads the presence of spirits and\ngathers distant soul fragments.",
    "passive": "Soul pickup radius +25%"
  },
  "warrior": {
    "name": "Warrior",
    "description": "A hardened officer who holds the line\nand cuts down restless spirits.",
    "passive": "Maximum HP +25%"
  },
  "archer": {
    "name": "Archer",
    "description": "A marksman who pierces a spirit’s\nweak point with swift arrows.",
    "passive": "Projectile speed +15% · Pierce +1"
  },
  "monk": {
    "name": "Monk",
    "description": "A disciplined guardian with prayer\nbeads and protective rites.",
    "passive": "Damage taken -10%"
  },
  "forbidden_sorcerer": {
    "name": "Forbidden Sorcerer",
    "description": "Trades bodily strength for the power\nof forbidden spirit arts.",
    "passive": "All damage +20% · Maximum HP -20%"
  },
  "select": {
    "title": "Choose your guardian",
    "guide": "Complete challenges to unlock new guardians",
    "selected": "SELECTED",
    "available": "UNLOCKED",
    "locked": "LOCKED",
    "weapon": "Starting weapon · {name}",
    "passive": "Passive · {value}",
    "choose": "SELECT",
    "begin": "{name} · BEGIN",
    "back": "MAIN MENU",
    "progress": "Progress · {current} / {target}",
    "unlocked": "New Character Unlocked · {names}"
  },
  "unlock": {
    "default": "Unlocked by default",
    "souls": "Collect {target} souls in total",
    "runKills": "Defeat {target} spirits in one run",
    "survival": "Survive {target} in one run",
    "weaponLevel": "Reach {weapon} level {target}",
    "weaponKills": "Defeat {target} spirits with {weapon}"
  }
},
  audio: {enabled:"M · SOUND ON",muted:"M · MUTED"},
  meta: {
    title: "GUIYA | Night of Spirits",
    description:
      "A broken seal. A haunted Joseon night. Wield talismans and survive until dawn.",
  },
  menu: {
    eyebrow: "A JOSEON EXORCIST CHRONICLE",
    titleFirst: "GUIYA",
    titleSecond: "NIGHT OF SPIRITS",
    tagline: "The seal has broken. The spirit gate is open.",
    description: "Survive until dawn.",
    play: "Start",
    moveGuide: "MOVE   WASD / ARROW KEYS",
    autoAttack: "AUTO ATTACK ENABLED   •   ESC TO PAUSE",
    sector: "{character} · {weapon}\nSEAL THE GHOST KING",
  },
  hud: {
    characterBuild:"{character}   /   {critical}% CRITICAL",
    weapons: "WEAPONS {count}/{max}",
    hp: "HP",
    level: "Level {level}",
    exp: "Souls",
    time: "Time",
    kills: "Kills",
    controls: "ESC  PAUSE   /   1–3  SELECT",
    waveFirst: "DUSK / WANDERING SOULS",
    waveSecond: "MIDNIGHT / OPEN GATE",
    waveThird: "BEFORE DAWN / SPIRIT SWARM",
    build: "{weapon}   /   TALISMANS {count}   /   {critical}% CRITICAL",
  },
  pause: { message: "RESTING\n\nESC TO RESUME" },
  upgrade: {
    newWeapon: "NEW WEAPON",
    weaponUpgrade: "WEAPON UPGRADE",
    eyebrow: "ENLIGHTENMENT",
    title: "Awaken an ancient art",
    guide: "CHOOSE A SECRET ART TO CONTINUE",
  rarity: "{rarity}   /   {number}",
    level: "STAGE {current} → {next}",
    controls: "1 / 2 / 3  OR CLICK A CARD    •    RESTING",
  },
  gameOver: {
    won: "VICTORY",
    lost: "Game Over",
    wonMessage: "The Ghost King is sealed.",
    lostMessage: "The haunted night is not over.",
    time: "Survival Time",
    level: "Level Reached",
    kills: "Kills",
    retry: "Retry",
    mainMenu: "MAIN MENU",
  },
  card: { type: { weapon: "WEAPON ART", stat: "STAT UPGRADE", evolution: "ART AWAKENING", bossReward: "BOSS TRIBUTE" } },
  rarity: { Common: "Common", Rare: "Rare", Epic: "Epic" },
  weapon: {
  "pulseNeedle": {
    "name": "Exorcism Talisman"
  },
  "talisman": {
    "name": "Exorcism Talisman",
    "description": "Automatically aims talismans at the nearest spirit.",
    "level1": "Cast a talisman at the nearest spirit.",
    "level2": "Base talisman power +{damagePercent}%",
    "level3": "Extra talismans per cast: {count}",
    "level4": "Cast interval reduced by {cooldownPercent}%",
    "level5": "Base power +{damagePercent}%\nExtra pierce: {pierce}"
  },
  "rosary": {
    "name": "Prayer Beads",
    "description": "Orbiting beads strike spirits that approach.",
    "level1": "Summon {count} orbiting beads.",
    "level2": "Base bead damage: {damage}",
    "level3": "Orbiting beads: {count}",
    "level4": "Orbit radius: {range}\nFaster rotation",
    "level5": "{count} beads · Base damage: {damage}"
  },
  "bell": {
    "name": "Exorcism Bell",
    "description": "Release a periodic spirit wave around you.",
    "level1": "A spirit wave every {cooldown}s",
    "level2": "Base wave damage: {damage}",
    "level3": "Wave radius: {radius}",
    "level4": "Cast interval: {cooldown}s",
    "level5": "Base damage: {damage}\nRadius: {radius}"
  },
  "lightningSword": {
    "name": "Thunder Sword",
    "description": "Sweep a powerful close-range arc toward a spirit.",
    "level1": "A wide slash toward a nearby spirit.",
    "level2": "Base slash damage: {damage}",
    "level3": "Slash reach: {range}",
    "level4": "Cast interval: {cooldown}s",
    "level5": "{count} crossing slashes\nBase damage: {damage}"
  },
  "ghostArrow": {
    "name": "Spirit-Slaying Arrow",
    "description": "Fast straight arrows pierce lines of spirits.",
    "level1": "Fast straight arrow\nExtra targets pierced: {pierce}",
    "level2": "Base arrow damage: {damage}",
    "level3": "Extra targets pierced: {pierce}",
    "level4": "Arrows per volley: {count}",
    "level5": "Base damage: {damage}\nExtra targets pierced: {pierce}"
  },
  "hellfire": {
    "name": "Hellfire Formation",
    "description": "Place a seal near a spirit that deals periodic damage.",
    "level1": "A seal near a spirit lasts {duration}s",
    "level2": "Base damage per tick: {damage}",
    "level3": "Seal radius: {radius}",
    "level4": "Seal duration: {duration}s",
    "level5": "Create {count} seals per cast"
  }
},
  enemy: {
    grunt: { name: "Wandering Soul" },
    runner: { name: "Night Fiend" },
    tank: { name: "Flesh Demon" },
  },
  player: { name: "Exorcist" },
  pickup: { name: "Soul Fragment" },
  cards: {
    power: { name: "Exorcism Power", description: "All weapon power +{value}%" },
    rapid: {
      name: "Swift Casting",
      description: "Cast speed +{value}%\nExcept bead contact",
    },
    boots: { name: "Fleet Step", description: "Movement speed +{value}%" },
    vitality: {
      name: "Vajra Protection",
      description: "Max HP +{value} · restore added HP",
    },
    recovery: { name: "Recovery", description: "Restore {value} HP" },
    multi: {
      name: "Twin Talismans",
      description: "Extra talismans / arrows +{value}",
    },
    velocity: {
      name: "Flying Charm",
      description: "Talisman / arrow speed +{value}%",
    },
    magnet: {
      name: "Soul Guidance",
      description: "Soul guidance radius +{value}%",
    },
    critical: {
      name: "Clear Sight",
      description: "Critical chance +{value}%",
    },
    pierce: {
      name: "Piercing Talisman",
      description: "Pierce +{value} additional target(s)",
    },
  },
};
export type LocaleMessages = { [K in keyof typeof en]: Widen<(typeof en)[K]> };
type Widen<T> = T extends string ? string : { [K in keyof T]: Widen<T[K]> };
