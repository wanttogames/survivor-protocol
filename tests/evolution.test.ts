import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WEAPON_EVOLUTIONS } from '../src/weapons/evolution/weaponEvolutionDefinitions';
import { WeaponLoadout } from '../src/weapons/WeaponLoadout';
import { UpgradeSystem } from '../src/systems/UpgradeSystem';
import { UPGRADES } from '../src/data/upgrades';
import { BALANCE } from '../src/config/balance';
import { WEAPONS, WEAPON_IDS } from '../src/data/weaponConfig';
import { t, setLocale } from '../src/i18n';
for(const e of WEAPON_EVOLUTIONS) test(`evolution ${e.baseWeaponId}: eligibility, guaranteed card, replacement, passive retained, reset`,()=>{
 const loadout=new WeaponLoadout(1,e.baseWeaponId), system=new UpgradeSystem(()=>.5,loadout), stats={...BALANCE.player};
 assert.equal(system.evolutions!.canEvolve(e.baseWeaponId),false);
 const passive=UPGRADES.find(u=>u.id===e.requiredUpgradeIds[0])!;
 system.apply({definition:passive,rarity:'Common'},stats);
 while(loadout.level(e.baseWeaponId)<4)loadout.upgrade(e.baseWeaponId);
 assert.equal(system.evolutions!.canEvolve(e.baseWeaponId),false);
 loadout.upgrade(e.baseWeaponId);
 assert.equal(system.evolutions!.canEvolve(e.baseWeaponId),true);
 assert.equal(loadout.level(e.evolvedWeaponId),0,'not automatic');
 const cards=system.roll(),card=cards.find(c=>c.definition.evolutionId===e.id)!;
 assert.ok(card);assert.equal(cards.length,3);assert.equal(cards.filter(c=>c.definition.evolutionId).length,1);
 const before={...stats};system.apply(card,stats);
 assert.deepEqual(stats,before);assert.equal(system.levels[passive.id],1);
 assert.equal(loadout.level(e.baseWeaponId),0);assert.equal(loadout.level(e.evolvedWeaponId),1);assert.equal(loadout.size,1);
 assert.equal(system.evolutions!.isEvolved(e.baseWeaponId),true);
 assert.equal(system.evolutions!.evolve(e.id),false);assert.equal(loadout.upgrade(e.baseWeaponId),false);assert.equal(loadout.upgrade(e.evolvedWeaponId),false);
 for(let i=0;i<10;i++) assert.ok(system.roll().every(c=>!c.definition.evolutionId&&c.definition.weaponId!==e.baseWeaponId));
 assert.deepEqual([...new WeaponLoadout(6,e.baseWeaponId).entries()],[[e.baseWeaponId,1]]);
});
test('max weapon alone or character stats are insufficient; stale forged choice cannot evolve',()=>{
 const loadout=new WeaponLoadout(),system=new UpgradeSystem(()=>.5,loadout),stats={...BALANCE.player,criticalChance:.5};
 while(loadout.upgrade('arc-bolt')){}
 assert.equal(system.evolutions!.canEvolve('arc-bolt'),false);assert.ok(system.roll().every(c=>!c.definition.evolutionId));
 assert.equal(system.evolutions!.evolve('thunder-talisman'),false);
 assert.equal(loadout.replaceWeapon('arc-bolt','vajra-rosary'),false);
});
test('six eligible evolutions: exactly one guaranteed, full slots replaced in place, no base reacquisition',()=>{
 const loadout=new WeaponLoadout(), system=new UpgradeSystem(()=>.4,loadout),stats={...BALANCE.player};
 for(const id of WEAPON_IDS)while(loadout.upgrade(id)){}
 for(const e of WEAPON_EVOLUTIONS)system.apply({definition:UPGRADES.find(u=>u.id===e.requiredUpgradeIds[0])!,rarity:'Common'},stats);
 assert.equal(system.evolutions!.getAvailableEvolutions().length,6);
 for(let i=0;i<6;i++){const cards=system.roll();assert.equal(cards.filter(c=>c.definition.evolutionId).length,1);assert.equal(new Set(cards.map(c=>c.definition.id)).size,3);system.apply(cards[0],stats);assert.equal(loadout.size,6);}
 assert.equal(system.evolutions!.getAvailableEvolutions().length,0);assert.ok(system.roll().every(c=>!c.definition.evolutionId));
 assert.deepEqual([...loadout.entries()].map(([id])=>WEAPONS[id].baseWeaponId),WEAPON_IDS);
});
test('evolution names, descriptions and conditions resolve in both languages',()=>{
 for(const locale of ['ko','en'] as const){setLocale(locale);for(const e of WEAPON_EVOLUTIONS){assert.notEqual(t(e.nameKey),e.nameKey);assert.notEqual(t(e.descriptionKey),e.descriptionKey);assert.doesNotMatch(t('evolution.requirements',{weapon:t(WEAPONS[e.baseWeaponId].nameKey),level:5,upgrade:t(UPGRADES.find(u=>u.id===e.requiredUpgradeIds[0])!.nameKey)}),/\{\w+\}/);}}
 setLocale('ko');
});
test('evolved kills credit base-family unlock statistics without saving evolution state', async()=>{
 const {CharacterUnlockManager,PROGRESS_KEY}=await import('../src/characters/CharacterUnlockManager');
 const saved=new Map<string,string>();
 const progress=new CharacterUnlockManager({getItem:k=>saved.get(k)??null,setItem:(k,v)=>{saved.set(k,v);},removeItem:k=>{saved.delete(k);}});
 for(let i=0;i<500;i++)progress.kill('infernal-hellfire',i+1);
 assert.equal(progress.isUnlocked('forbidden_sorcerer'),true);progress.flush();
 const data=JSON.parse(saved.get(PROGRESS_KEY)!);
 assert.equal(data.weaponKillCounts.hellfire,500);assert.equal(data.weaponKillCounts['infernal-hellfire'],undefined);assert.equal(data.evolutions,undefined);
});
