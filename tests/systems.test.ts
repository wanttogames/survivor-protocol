import { test } from "node:test";
import assert from "node:assert/strict";
import { LevelSystem } from "../src/systems/LevelSystem";
import { UpgradeSystem } from "../src/systems/UpgradeSystem";
import { UPGRADES } from "../src/data/upgrades";
import { BALANCE, requiredExp } from "../src/config/balance";
import { Pool } from "../src/utils/Pool";
test("large XP pickups queue all levels and retain overflow", () => {
  const l = new LevelSystem();
  l.add(requiredExp(1) + requiredExp(2) + 3);
  assert.equal(l.level, 3);
  assert.equal(l.pending, 2);
  assert.equal(l.xp, 3);
  assert.ok(l.consume());
  assert.ok(l.consume());
  assert.equal(l.consume(), false);
});
test("three unique eligible choices; rarity boundaries", () => {
  for (const r of [0, 0.7, 0.96]) {
    const s = new UpgradeSystem(() => r);
    const cards = s.roll();
    assert.equal(new Set(cards.map((c) => c.definition.id)).size, 3);
    assert.equal(
      cards[0].rarity,
      r === 0 ? "Common" : r === 0.7 ? "Rare" : "Epic",
    );
  }
});
test("maxed upgrades are excluded, exhausted pool still returns three", () => {
  const s = new UpgradeSystem();
  for (const u of UPGRADES)
    if (Number.isFinite(u.maxLevel)) s.levels[u.id] = u.maxLevel;
  assert.equal(s.roll().length, 3);
  assert.ok(s.roll().every((c) => c.definition.id === "recovery"));
});
test("all upgrades apply, HP and critical chance are bounded", () => {
  const s = new UpgradeSystem();
  const stats = { ...BALANCE.player, hp: 10 };
  for (const definition of UPGRADES)
    s.apply({ definition, rarity: "Epic" }, stats);
  assert.ok(stats.damage > BALANCE.player.damage);
  assert.equal(stats.projectileCount, 2);
  assert.equal(stats.piercing, 1);
  assert.ok(stats.hp <= stats.maxHp);
  for (let i = 0; i < 30; i++)
    s.apply({ definition: UPGRADES[8], rarity: "Epic" }, stats);
  assert.ok(stats.criticalChance <= 0.9);
});
test("pool reuses inactive objects and enforces cap", () => {
  const p = new Pool<{ active: boolean }>(() => ({ active: false }), 2);
  const a = p.acquire()!;
  a.active = true;
  const b = p.acquire()!;
  b.active = true;
  assert.equal(p.acquire(), undefined);
  a.active = false;
  assert.equal(p.acquire(), a);
});
