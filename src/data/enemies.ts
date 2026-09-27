export const ENEMIES = {
  grunt: {
    name: "Drifter",
    hp: 32,
    speed: 75,
    damage: 10,
    xp: 2,
    color: 0xf76c8b,
    radius: 15,
  },
  runner: {
    name: "Skitter",
    hp: 23,
    speed: 142,
    damage: 8,
    xp: 3,
    color: 0xffbe70,
    radius: 12,
  },
  tank: {
    name: "Bulwark",
    hp: 170,
    speed: 49,
    damage: 20,
    xp: 10,
    color: 0xb39bff,
    radius: 25,
  },
};
export type EnemyKind = keyof typeof ENEMIES;
