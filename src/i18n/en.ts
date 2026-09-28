export const en = {
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
    play: "BEGIN",
    moveGuide: "MOVE   WASD / ARROW KEYS",
    autoAttack: "AUTO ATTACK ENABLED   •   ESC TO PAUSE",
    sector: "EXORCIST · BANISHING TALISMAN\nTEN MINUTES UNTIL DAWN",
  },
  hud: {
    hp: "VITALITY",
    level: "LV {level}",
    exp: "SOULS",
    time: "SURVIVAL TIME",
    kills: "SPIRITS BANISHED",
    controls: "ESC  PAUSE   /   1–3  SELECT",
    waveFirst: "DUSK / WANDERING SOULS",
    waveSecond: "MIDNIGHT / OPEN GATE",
    waveThird: "BEFORE DAWN / SPIRIT SWARM",
    build: "{weapon}   /   TALISMANS {count}   /   {critical}% CRITICAL",
  },
  pause: { message: "RESTING\n\nESC TO RESUME" },
  upgrade: {
    eyebrow: "ENLIGHTENMENT",
    title: "Awaken an ancient art",
    guide: "CHOOSE A SECRET ART TO CONTINUE",
    rarity: "{rarity}   /   {number}",
    level: "STAGE {current} → {next}",
    controls: "1 / 2 / 3  OR CLICK A CARD    •    RESTING",
  },
  gameOver: {
    won: "DAWN HAS COME",
    lost: "YOUR STRENGTH HAS FADED",
    wonMessage: "You endured the long night.",
    lostMessage: "The haunted night is not over.",
    time: "SURVIVAL TIME",
    level: "LEVEL REACHED",
    kills: "SPIRITS BANISHED",
    retry: "TRY AGAIN",
    mainMenu: "MAIN MENU",
  },
  rarity: { Common: "Common", Rare: "Rare", Epic: "Epic" },
  weapon: { pulseNeedle: { name: "Banishing Talisman" } },
  enemy: {
    grunt: { name: "Wandering Soul" },
    runner: { name: "Night Fiend" },
    tank: { name: "Flesh Demon" },
  },
  player: { name: "Exorcist" },
  pickup: { name: "Soul Fragment" },
  cards: {
    power: { name: "Banishment", description: "Talisman power +{value}%" },
    rapid: {
      name: "Swift Inscription",
      description: "Casting speed +{value}%",
    },
    boots: { name: "Earth Step", description: "Movement speed +{value}%" },
    vitality: {
      name: "Diamond Ward",
      description: "Max HP +{value} · restore added HP",
    },
    recovery: { name: "Restore Vitality", description: "Restore {value} HP" },
    multi: {
      name: "Twin Talismans",
      description: "Additional talismans +{value}",
    },
    velocity: {
      name: "Flying Charm",
      description: "Talisman flight speed +{value}%",
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
      name: "Piercing Charm",
      description: "Pierce +{value} additional target(s)",
    },
  },
};
export type LocaleMessages = { [K in keyof typeof en]: Widen<(typeof en)[K]> };
type Widen<T> = T extends string ? string : { [K in keyof T]: Widen<T[K]> };
