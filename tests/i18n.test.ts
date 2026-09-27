import { test } from "node:test";
import assert from "node:assert/strict";
import { en } from "../src/i18n/en";
import { ko } from "../src/i18n/ko";
import {
  DEFAULT_LOCALE,
  getLocale,
  setLocale,
  t,
  onLocaleChange,
} from "../src/i18n";
import { UPGRADES } from "../src/data/upgrades";
import { BALANCE } from "../src/config/balance";
function flatten(value: object, prefix = ""): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, v] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof v === "string") result[path] = v;
    else Object.assign(result, flatten(v, path));
  }
  return result;
}
test("Korean default and dictionary/placeholder parity", () => {
  assert.equal(DEFAULT_LOCALE, "ko");
  const a = flatten(en),
    b = flatten(ko);
  assert.deepEqual(Object.keys(a).sort(), Object.keys(b).sort());
  for (const key of Object.keys(a))
    assert.deepEqual(
      a[key].match(/\{\w+\}/g)?.sort(),
      b[key].match(/\{\w+\}/g)?.sort(),
      key,
    );
});
test("locale switch, interpolation, subscriptions and cleanup", () => {
  setLocale("ko");
  assert.equal(t("menu.play"), "시작");
  assert.equal(t("hud.level", { level: 3 }), "레벨 3");
  let count = 0;
  const off = onLocaleChange(() => count++);
  setLocale("en");
  assert.equal(getLocale(), "en");
  assert.equal(t("menu.play"), "BEGIN");
  assert.equal(count, 1);
  off();
  setLocale("ko");
  assert.equal(count, 1);
});
test("all upgrade translations use actual rarity-scaled values", () => {
  for (const locale of ["ko", "en"] as const) {
    setLocale(locale);
    for (const u of UPGRADES)
      for (const rarity of ["Common", "Rare", "Epic"] as const) {
        assert.ok(t(u.nameKey));
        assert.doesNotMatch(
          t(
            u.descriptionKey,
            u.descriptionParams(BALANCE.rarityMultiplier[rarity]),
          ),
          /\{\w+\}/,
        );
      }
  }
  const recovery = UPGRADES.find((u) => u.id === "recovery")!;
  assert.equal(
    recovery.descriptionParams(1.9).value,
    Math.round(BALANCE.effects.heal * 1.9),
  );
  setLocale("ko");
});
