import type { WeaponId } from "./weaponConfig";
import type { TranslationKey, TranslationParams } from "../i18n";
import { BALANCE, type PlayerStats } from "../config/balance";
export type Rarity = "Common" | "Rare" | "Epic";
export interface UpgradeDefinition {
  id: string;
  evolutionId?: string;
  bossRewardId?: 'heal'|'damage'|'souls'|'weapon';
  weaponId?: WeaponId;
  nameKey: TranslationKey;
  descriptionKey: TranslationKey;
  descriptionParams: (multiplier: number) => TranslationParams;
  icon: string;
  maxLevel: number;
  apply: (stats: PlayerStats, multiplier: number) => void;
}
const e = BALANCE.effects;
const rounded = (value: number) => Math.round(value * 10) / 10;
export const UPGRADES: UpgradeDefinition[] = [
  {
    id: "power",
    nameKey: "cards.power.name",
    descriptionKey: "cards.power.description",
    descriptionParams: (m) => ({ value: rounded(e.damage * 100 * m) }),
    icon: "ϟ",
    maxLevel: 8,
    apply: (s, m) => {
      s.damage *= 1 + e.damage * m;
    },
  },
  {
    id: "rapid",
    nameKey: "cards.rapid.name",
    descriptionKey: "cards.rapid.description",
    descriptionParams: (m) => ({ value: rounded(e.attackSpeed * 100 * m) }),
    icon: "»",
    maxLevel: 8,
    apply: (s, m) => {
      s.attackSpeed *= 1 + e.attackSpeed * m;
    },
  },
  {
    id: "boots",
    nameKey: "cards.boots.name",
    descriptionKey: "cards.boots.description",
    descriptionParams: (m) => ({ value: rounded(e.moveSpeed * 100 * m) }),
    icon: "↗",
    maxLevel: 5,
    apply: (s, m) => {
      s.moveSpeed *= 1 + e.moveSpeed * m;
    },
  },
  {
    id: "vitality",
    nameKey: "cards.vitality.name",
    descriptionKey: "cards.vitality.description",
    descriptionParams: (m) => ({ value: Math.round(e.maxHp * m) }),
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
    nameKey: "cards.recovery.name",
    descriptionKey: "cards.recovery.description",
    descriptionParams: (m) => ({ value: Math.round(e.heal * m) }),
    icon: "+",
    maxLevel: Infinity,
    apply: (s, m) => {
      s.hp = Math.min(s.maxHp, s.hp + Math.round(e.heal * m));
    },
  },
  {
    id: "multi",
    nameKey: "cards.multi.name",
    descriptionKey: "cards.multi.description",
    descriptionParams: (m) => ({ value: e.projectileCount }),
    icon: "⋔",
    maxLevel: 4,
    apply: (s) => {
      s.projectileCount += e.projectileCount;
    },
  },
  {
    id: "velocity",
    nameKey: "cards.velocity.name",
    descriptionKey: "cards.velocity.description",
    descriptionParams: (m) => ({ value: rounded(e.projectileSpeed * 100 * m) }),
    icon: "›",
    maxLevel: 5,
    apply: (s, m) => {
      s.projectileSpeed *= 1 + e.projectileSpeed * m;
    },
  },
  {
    id: "magnet",
    nameKey: "cards.magnet.name",
    descriptionKey: "cards.magnet.description",
    descriptionParams: (m) => ({ value: rounded(e.pickupRadius * 100 * m) }),
    icon: "◎",
    maxLevel: 6,
    apply: (s, m) => {
      s.pickupRadius *= 1 + e.pickupRadius * m;
    },
  },
  {
    id: "critical",
    nameKey: "cards.critical.name",
    descriptionKey: "cards.critical.description",
    descriptionParams: (m) => ({ value: rounded(e.criticalChance * 100 * m) }),
    icon: "⊕",
    maxLevel: 8,
    apply: (s, m) => {
      s.criticalChance = Math.min(0.9, s.criticalChance + e.criticalChance * m);
    },
  },
  {
    id: "pierce",
    nameKey: "cards.pierce.name",
    descriptionKey: "cards.pierce.description",
    descriptionParams: (m) => ({ value: e.piercing }),
    icon: "↠",
    maxLevel: 5,
    apply: (s) => {
      s.piercing += e.piercing;
    },
  },
];
