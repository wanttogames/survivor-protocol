import { BALANCE, type PlayerStats } from "../config/balance";
export type Rarity = "Common" | "Rare" | "Epic";
export interface UpgradeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  maxLevel: number;
  apply: (stats: PlayerStats, multiplier: number) => void;
}
const e = BALANCE.effects;
export const UPGRADES: UpgradeDefinition[] = [
  {
    id: "power",
    name: "Overcharge",
    description: `Attack damage +${e.damage * 100}%`,
    icon: "ϟ",
    maxLevel: 8,
    apply: (s, m) => {
      s.damage *= 1 + e.damage * m;
    },
  },
  {
    id: "rapid",
    name: "Pulse Relay",
    description: `Attack speed +${e.attackSpeed * 100}%`,
    icon: "»",
    maxLevel: 8,
    apply: (s, m) => {
      s.attackSpeed *= 1 + e.attackSpeed * m;
    },
  },
  {
    id: "boots",
    name: "Vector Drive",
    description: `Movement speed +${e.moveSpeed * 100}%`,
    icon: "↗",
    maxLevel: 5,
    apply: (s, m) => {
      s.moveSpeed *= 1 + e.moveSpeed * m;
    },
  },
  {
    id: "vitality",
    name: "Core Plating",
    description: `Max HP +${e.maxHp} · restore added HP`,
    icon: "⬡",
    maxLevel: 6,
    apply: (s, m) => {
      const v = Math.round(e.maxHp * m);
      s.maxHp += v;
      s.hp += v;
    },
  },
  {
    id: "recovery",
    name: "Field Repair",
    description: `Restore ${e.heal} HP`,
    icon: "+",
    maxLevel: Infinity,
    apply: (s, m) => {
      s.hp = Math.min(s.maxHp, s.hp + Math.round(e.heal * m));
    },
  },
  {
    id: "multi",
    name: "Split Emitter",
    description: `Additional projectile +${e.projectileCount}`,
    icon: "⋔",
    maxLevel: 4,
    apply: (s) => {
      s.projectileCount += e.projectileCount;
    },
  },
  {
    id: "velocity",
    name: "Ion Accelerator",
    description: `Projectile speed +${e.projectileSpeed * 100}%`,
    icon: "›",
    maxLevel: 5,
    apply: (s, m) => {
      s.projectileSpeed *= 1 + e.projectileSpeed * m;
    },
  },
  {
    id: "magnet",
    name: "Gravity Well",
    description: `Pickup radius +${e.pickupRadius * 100}%`,
    icon: "◎",
    maxLevel: 6,
    apply: (s, m) => {
      s.pickupRadius *= 1 + e.pickupRadius * m;
    },
  },
  {
    id: "critical",
    name: "Weakpoint Lens",
    description: `Critical chance +${Math.round(e.criticalChance * 100)}%`,
    icon: "⊕",
    maxLevel: 8,
    apply: (s, m) => {
      s.criticalChance = Math.min(0.9, s.criticalChance + e.criticalChance * m);
    },
  },
  {
    id: "pierce",
    name: "Phase Needle",
    description: "Pierce one additional target",
    icon: "↠",
    maxLevel: 5,
    apply: (s) => {
      s.piercing += e.piercing;
    },
  },
];
