import { WEAPON_EVOLUTIONS } from '../weapons/evolution/weaponEvolutionDefinitions';
import { UPGRADES } from '../data/upgrades';
import { WEAPONS, baseWeaponId, weaponDescriptionParams } from "../data/weaponConfig";
import { frame, talisman } from "../theme/ornaments";
import { THEME as T } from "../theme/palette";
import { t } from "../i18n";
import Phaser from "phaser";
import { BALANCE } from "../config/balance";
import { label } from "./common";
import type { UpgradeChoice, UpgradeSystem } from "../systems/UpgradeSystem";
export class UpgradePanel {
  private objects: Phaser.GameObjects.GameObject[] = [];
  private choices: UpgradeChoice[] = [];
  private callback?: (c: UpgradeChoice) => void;
  constructor(
    private scene: Phaser.Scene,
    private upgrades: UpgradeSystem,
  ) {}
  get open() {
    return this.choices.length > 0;
  }
  show(choices: UpgradeChoice[], callback: (c: UpgradeChoice) => void, options?:{bossNameKey:import('../i18n').TranslationKey}) {
    this.close();
    this.choices = choices;
    this.callback = callback;
    const add = (o: Phaser.GameObjects.GameObject) => this.objects.push(o);
    add(
      this.scene.add
        .rectangle(640, 400, 1280, 800, 0x0b0d0f, 0.93)
        .setScrollFactor(0)
        .setDepth(200)
        .setInteractive(),
    );
    add(
      label(this.scene, 640, 132, () => options?t("boss.defeated",{name:t(options.bossNameKey)}):t("upgrade.eyebrow"), 13, T.text.gold)
        .setOrigin(0.5)
        .setDepth(202),
    );
    add(
      label(this.scene, 640, 174, () => t(options?"bossReward.title":"upgrade.title"), 36)
        .setOrigin(0.5)
        .setDepth(202),
    );
    add(
      label(this.scene, 640, 222, () => t(options?"bossReward.guide":"upgrade.guide"), 12, T.text.muted)
        .setOrigin(0.5)
        .setDepth(202),
    );
    choices.forEach((c, i) => {
      const x = 190 + i * 330;
      const evolution=WEAPON_EVOLUTIONS.find(e=>e.id===c.definition.evolutionId);
      const color = (evolution||options) ? 0xb18436 :
        c.rarity === "Epic"
          ? 0x884035
          : c.rarity === "Rare"
            ? 0x435f63
            : 0x675538;
      const hex = "#" + color.toString(16);
      const box = this.scene.add
        .rectangle(x + 120, 432, 300, 340, (evolution||options)?T.paperLight:T.paper)
        .setStrokeStyle((evolution||options)?3:1, color, (evolution||options)?1:0.6)
        .setScrollFactor(0)
        .setDepth(201)
        .setInteractive({ useHandCursor: true });
      add(box);
      const ornament = this.scene.add
        .graphics()
        .setScrollFactor(0)
        .setDepth(201);
      frame(ornament, x - 20, 272, 280, 320, T.wood);
      // Bounded deterministic fibers; generated only when opening the cards.
      for (let j = 0; j < 34; j++) {
        const xx = x - 15 + ((j * 67) % 266),
          yy = 280 + ((j * 43) % 306);
        ornament
          .lineStyle(1, 0x715d3e, 0.09)
          .lineBetween(xx, yy, Math.min(x + 245, xx + 8 + (j % 17)), yy + 1);
      }
      ornament
        .lineStyle(1, T.wood, 0.25)
        .lineBetween(x, 407, x + 235, 407)
        .lineBetween(x, 531, x + 235, 531);
      if(c.definition.weaponId||evolution){
        const textures={"arc-bolt":"bolt",rosary:"rosary-bead","exorcism-bell":"bell-wave","lightning-sword":"sword-slash","ghost-arrow":"ghost-arrow",hellfire:"hellfire-seal"};
        add(this.scene.add.image(x+30,360,textures[baseWeaponId(c.definition.weaponId??evolution!.baseWeaponId)]).setDisplaySize(52,52).setScrollFactor(0).setDepth(202));
      }else talisman(ornament, x + 5, 330, 35, 59);
      ornament.fillStyle(T.vermilion, 0.9).fillRect(x + 202, 335, 33, 33);
      ornament
        .lineStyle(1, T.paper, 0.75)
        .strokeRect(x + 207, 340, 23, 23)
        .lineBetween(x + 212, 345, x + 225, 358)
        .lineBetween(x + 225, 345, x + 212, 358);
      add(ornament);
      box.on("pointerover", () => box.setFillStyle(T.paperLight));
      box.on("pointerout", () => box.setFillStyle((evolution||options)?T.paperLight:T.paper));
      box.on("pointerdown", () => this.select(i));
      add(
        label(
          this.scene,
          x,
          288,
          () =>
            t("upgrade.rarity", {
              rarity: evolution?t("evolution.badge"):options?t("bossReward.badge"):c.definition.weaponId ? t(this.upgrades.currentLevel(c.definition)===0?"upgrade.newWeapon":"upgrade.weaponUpgrade") : t(`rarity.${c.rarity}`),
              number: `0${i + 1}`,
            }),
          12,
          hex,
        ).setDepth(202),
      );

      add(
        label(
          this.scene,
          x,
          418,
          () => t(c.definition.nameKey),
          evolution?17:20,
          T.text.ink,
        ).setWordWrapWidth(250).setDepth(202),
      );
      add(
        label(this.scene, x, 466, () => this.description(c), 16, "#504532")
          .setWordWrapWidth(250)
          .setDepth(202),
      );
      add(
        label(
          this.scene,
          x,
          545,
          () =>
            evolution?t("evolution.requirements",{weapon:t(WEAPONS[evolution.baseWeaponId].nameKey),level:evolution.requiredWeaponLevel,upgrade:t(UPGRADES.find(u=>u.id===evolution.requiredUpgradeIds[0])!.nameKey)}):c.definition.bossRewardId&&!c.definition.weaponId?t(c.definition.bossRewardId==='damage'?"bossReward.runOnly":"bossReward.instant"):t("upgrade.level", {
              current: this.upgrades.currentLevel(c.definition),
              next: this.upgrades.currentLevel(c.definition) + 1,
            }),
          evolution?12:13,
          hex,
        ).setWordWrapWidth(250).setDepth(202),
      );
    });
    add(
      label(this.scene, 640, 655, () => t("upgrade.controls"), 12, T.text.muted)
        .setOrigin(0.5)
        .setDepth(202),
    );
  }
  private description(c: UpgradeChoice) {
    if(c.definition.weaponId){const def=WEAPONS[c.definition.weaponId];return t(def.stepKeys[Math.min(this.upgrades.currentLevel(c.definition),def.maxLevel-1)],weaponDescriptionParams(c.definition.weaponId,this.upgrades.currentLevel(c.definition)+1));}
    return t(
      c.definition.descriptionKey,
      c.definition.descriptionParams(BALANCE.rarityMultiplier[c.rarity]),
    );
  }
  select(i: number) {
    const c = this.choices[i];
    if (!c) return;
    const fn = this.callback;
    this.close();
    this.scene.cameras.main.flash(150, 184, 133, 66, false);
    fn?.(c);
  }
  close() {
    for (const o of this.objects) o.destroy();
    this.objects = [];
    this.choices = [];
    this.callback = undefined;
  }
}
