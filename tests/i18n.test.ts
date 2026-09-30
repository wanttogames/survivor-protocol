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
  resolveLocale, detectLocale, initLocale, LOCALE_STORAGE_KEY,
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
test("English fallback and dictionary/placeholder parity", () => {
  assert.equal(DEFAULT_LOCALE, "en");
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
  assert.equal(t("menu.play"), "Start");
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

test("saved selection wins, Korean language family detected, other languages fall back to English", () => {
  for(const language of ["ko","ko-KR","KO-kr","ko-KP"])assert.equal(resolveLocale(null,language),"ko");
  for(const language of ["en-US","ja-JP","de-DE","kok-IN","",null,undefined])assert.equal(resolveLocale(null,language),"en");
  assert.equal(resolveLocale("en","ko-KR"),"en");assert.equal(resolveLocale("ko","en-US"),"ko");
  for(const saved of ["fr","KO","toString","",null,3])assert.equal(resolveLocale(saved,"ko-KR"),"ko");
});
test("automatic detection does not save; deliberate choice saves only locale and denied storage is safe", () => {
  const storageDescriptor=Object.getOwnPropertyDescriptor(globalThis,"localStorage"),navDescriptor=Object.getOwnPropertyDescriptor(globalThis,"navigator");
  const values=new Map([["survivor-protocol.progress","existing-progress"],["survivor-protocol.selectedCharacter","shaman"],["survivor-protocol.audioMuted","muted"]]);
  try {
    Object.defineProperty(globalThis,"navigator",{configurable:true,value:{language:"ko-KR"}});
    Object.defineProperty(globalThis,"localStorage",{configurable:true,value:{getItem:(k:string)=>values.get(k)??null,setItem:(k:string,v:string)=>values.set(k,v)}});
    initLocale();assert.equal(getLocale(),"ko");assert.equal(values.has(LOCALE_STORAGE_KEY),false);
    setLocale("en");assert.equal(values.get(LOCALE_STORAGE_KEY),"en");initLocale();assert.equal(getLocale(),"en");
    assert.equal(values.get("survivor-protocol.progress"),"existing-progress");assert.equal(values.get("survivor-protocol.selectedCharacter"),"shaman");assert.equal(values.get("survivor-protocol.audioMuted"),"muted");
    values.set(LOCALE_STORAGE_KEY,"invalid");assert.equal(detectLocale(),"ko");
    Object.defineProperty(globalThis,"localStorage",{configurable:true,get(){throw new Error("Storage denied");}});
    assert.equal(detectLocale(),"ko");assert.doesNotThrow(()=>setLocale("en"));
    Object.defineProperty(globalThis,"navigator",{configurable:true,get(){throw new Error("Navigator denied");}});assert.equal(detectLocale(),"en");
  } finally {
    if(storageDescriptor)Object.defineProperty(globalThis,"localStorage",storageDescriptor);else Reflect.deleteProperty(globalThis,"localStorage");
    if(navDescriptor)Object.defineProperty(globalThis,"navigator",navDescriptor);else Reflect.deleteProperty(globalThis,"navigator");
    setLocale("ko",false);
  }
});
test("missing or malformed translation falls back to English, then key",()=>{
  const menu=ko.menu as Record<string,unknown>,original=menu.play;
  try {setLocale("ko",false);delete menu.play;assert.equal(t("menu.play"),"Start");menu.play={};assert.equal(t("menu.play"),"Start");assert.equal(t("unknown.key" as Parameters<typeof t>[0]),"unknown.key");assert.equal(t("toString" as Parameters<typeof t>[0]),"toString");}
  finally {menu.play=original;}
});
