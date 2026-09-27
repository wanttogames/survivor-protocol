export const en = {
  meta: {
    title: "SURVIVOR PROTOCOL",
    description:
      "Survive the signal. A ten-minute sci-fi survival action game.",
  },
  menu: {
    eyebrow: "S / P     •     INDEPENDENT SURVIVAL SYSTEM",
    titleFirst: "SURVIVOR",
    titleSecond: "PROTOCOL",
    tagline: "THE SIGNAL IS FADING. YOU ARE STILL HERE.",
    description:
      "Outlast the swarm. Rewrite your limits.\nOne operative. Ten minutes. No extraction until zero.",
    play: "PLAY   →",
    moveGuide: "MOVE   WASD / ARROW KEYS",
    autoAttack: "AUTO ATTACK ENABLED   •   ESC TO PAUSE",
    sector: "SECTOR 07\nOFFLINE / SOLO",
  },
  hud: {
    hp: "VITAL SYSTEM",
    level: "LV {level}",
    exp: "EXP",
    time: "SURVIVAL TIME",
    kills: "NEUTRALIZED",
    controls: "ESC  PAUSE   /   1–3  SELECT",
    waveFirst: "01 / CONTACT",
    waveSecond: "02 / ESCALATION",
    waveThird: "03 / OVERLOAD",
    build: "{weapon}   /   PROJECTILES {count}   /   {critical}% CRITICAL",
  },
  pause: { message: "SIMULATION PAUSED\n\nESC TO RESUME" },
  upgrade: {
    eyebrow: "EVOLUTION AVAILABLE",
    title: "Rewrite your protocol.",
    guide: "SELECT ONE UPGRADE TO CONTINUE",
    rarity: "{rarity}   /   {number}",
    level: "LV {current} → {next}",
    controls: "1 / 2 / 3  OR CLICK A CARD    •    SIMULATION PAUSED",
  },
  gameOver: {
    won: "EXTRACTION COMPLETE",
    lost: "SIGNAL LOST",
    wonMessage: "Protocol survived.",
    lostMessage: "Every run is an evolution.",
    time: "SURVIVAL TIME",
    level: "LEVEL REACHED",
    kills: "NEUTRALIZED",
    retry: "RETRY   ↻",
    mainMenu: "MAIN MENU",
  },
  rarity: { Common: "Common", Rare: "Rare", Epic: "Epic" },
  weapon: { pulseNeedle: { name: "Pulse Needle" } },
  enemy: {
    grunt: { name: "Drifter" },
    runner: { name: "Skitter" },
    tank: { name: "Bulwark" },
  },
  cards: {
    power: { name: "Overcharge", description: "Attack damage +{value}%" },
    rapid: { name: "Pulse Relay", description: "Attack speed +{value}%" },
    boots: { name: "Vector Drive", description: "Movement speed +{value}%" },
    vitality: {
      name: "Core Plating",
      description: "Max HP +{value} · restore added HP",
    },
    recovery: { name: "Field Repair", description: "Restore {value} HP" },
    multi: {
      name: "Split Emitter",
      description: "Additional projectile +{value}",
    },
    velocity: {
      name: "Ion Accelerator",
      description: "Projectile speed +{value}%",
    },
    magnet: { name: "Gravity Well", description: "Pickup radius +{value}%" },
    critical: {
      name: "Weakpoint Lens",
      description: "Critical chance +{value}%",
    },
    pierce: {
      name: "Phase Needle",
      description: "Pierce +{value} additional target(s)",
    },
  },
};
export type LocaleMessages = { [K in keyof typeof en]: Widen<(typeof en)[K]> };
type Widen<T> = T extends string ? string : { [K in keyof T]: Widen<T[K]> };
