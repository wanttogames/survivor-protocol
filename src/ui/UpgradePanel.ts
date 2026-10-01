import { CARD_STYLES, cardKind, ensureCardTextures } from './cardStyles';
import { WEAPON_EVOLUTIONS } from '../weapons/evolution/weaponEvolutionDefinitions';
import { UPGRADES } from '../data/upgrades';
import { WEAPONS, baseWeaponId, weaponDescriptionParams } from "../data/weaponConfig";
import { talisman } from "../theme/ornaments";
import { THEME as T } from "../theme/palette";
import { t, onLocaleChange } from "../i18n";
import Phaser from "phaser";
import { BALANCE } from "../config/balance";
import { label } from "./common";
import type { UpgradeChoice, UpgradeSystem } from "../systems/UpgradeSystem";
export class UpgradePanel {
  private objects: Phaser.GameObjects.GameObject[] = [];
  private choices: UpgradeChoice[] = [];
  private bossContext = false;
  private feedback?: Phaser.GameObjects.Image;
  private callback?: (c: UpgradeChoice) => void;
  constructor(
    private scene: Phaser.Scene,
    private upgrades: UpgradeSystem,
  ) { scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => { this.close(); }); }
  get open() {
    return this.choices.length > 0;
  }
  show(choices: UpgradeChoice[], callback: (c: UpgradeChoice) => void, options?:{bossNameKey:import('../i18n').TranslationKey}) {
    this.close();
    this.choices = choices;
    this.bossContext = !!options;
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
      const kind=cardKind(c,!!options), style=CARD_STYLES[kind];
      const {key,glowKey}=ensureCardTextures(this.scene,kind);
      const start=this.objects.length;
      const glow=this.scene.add.image(x+120,432,glowKey).setAlpha(style.glow).setScrollFactor(0).setDepth(201);
      add(glow);
      add(this.scene.add.image(x+120,432,key).setScrollFactor(0).setDepth(201));
      const box=this.scene.add.rectangle(x+120,432,300,340,style.paper,0)
        .setStrokeStyle(style.width,style.border).setScrollFactor(0).setDepth(201)
        .setInteractive({useHandCursor:true});
      box.setData('cardKind',kind); box.setData('choiceIndex',i); add(box);
      const hex='#'+style.accent.toString(16).padStart(6,'0');
      const ornament=this.scene.add.graphics().setScrollFactor(0).setDepth(201);
      if(c.definition.weaponId||evolution){
        const textures={"arc-bolt":"bolt",rosary:"rosary-bead","exorcism-bell":"bell-wave","lightning-sword":"sword-slash","ghost-arrow":"ghost-arrow",hellfire:"hellfire-seal"};
        add(this.scene.add.image(x+30,360,textures[baseWeaponId(c.definition.weaponId??evolution!.baseWeaponId)]).setDisplaySize(52,52).setScrollFactor(0).setDepth(202));
      }else talisman(ornament, x + 5, 330, 35, 59);
      add(ornament);
      box.on('pointerover',()=>{
        box.setFillStyle(style.border,.08).setStrokeStyle(style.width+1,style.border);
        this.scene.tweens.killTweensOf(glow);
        this.scene.tweens.add({targets:glow,alpha:style.hoverGlow,duration:110});
      });
      box.on('pointerout',()=>{
        box.setFillStyle(style.paper,0).setStrokeStyle(style.width,style.border);
        this.scene.tweens.killTweensOf(glow);
        this.scene.tweens.add({targets:glow,alpha:style.glow,duration:100});
      });
      box.on('pointerdown',()=>this.select(i));
      add(
        label(
          this.scene,
          x,
          288,
          () =>
            t("upgrade.rarity", {
              rarity: kind==='evolution'?t('evolution.badge'):kind==='bossReward'?t('bossReward.badge'):t(`rarity.${c.rarity}`),
              number: `0${i + 1}`,
            }),
          12,
          style.label,
        ).setFontStyle("bold").setDepth(202),
      );

      add(label(this.scene,x,308,()=>t(evolution?'card.type.evolution':kind==='bossReward'?'card.type.bossReward':c.definition.weaponId?'card.type.weapon':'card.type.stat'),11,style.label).setDepth(202));

      add(
        label(
          this.scene,
          x,
          418,
          () => t(c.definition.nameKey),
          evolution?18:20,
          T.text.ink,
        ).setFontStyle("bold").setWordWrapWidth(250).setDepth(202),
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
      const cardObjects=this.objects.slice(start);
      for(const o of cardObjects) if(o instanceof Phaser.GameObjects.Text){
        const size=o.style.fontSize;
        const max=o.y===418?38:o.y===466?65:o.y===545?42:22;
        const fit=()=>{
          o.setFontSize(size);
          let font=parseInt(String(size),10);
          while((o.height>max||o.width>250)&&font>10)o.setFontSize(--font);
        };
        fit();const off=onLocaleChange(fit);o.once(Phaser.GameObjects.Events.DESTROY,off);
      }
      // One-shot presentation tweens; combat stays paused but Scene UI is live.
      for(const o of cardObjects){
        const visible=o as Phaser.GameObjects.Image;
        if(!('alpha' in visible)||!('y' in visible))continue;
        const alpha=visible.alpha,y=visible.y;
        visible.setAlpha(0);visible.y+=6;
        this.scene.tweens.add({targets:visible,alpha,y,duration:style.entrance,delay:i*35,ease:'Sine.Out'});
      }
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
    const kind=cardKind(c,this.bossContext);
    const {glowKey}=ensureCardTextures(this.scene,kind);
    this.close();
    this.feedback=this.scene.add.image(310+i*330,432,glowKey).setScrollFactor(0).setDepth(203).setAlpha(.8);
    const feedback=this.feedback;
    this.scene.tweens.add({targets:feedback,alpha:0,scale:kind==='Common'?1.015:1.05,duration:kind==='Common'?100:160,onComplete:()=>feedback.destroy()});
    // Apply immediately: preserve the existing boss/level-up/talisman queue semantics.
    fn?.(c);
  }
  close() {
    if(this.feedback){this.scene.tweens.killTweensOf(this.feedback);this.feedback.destroy();this.feedback=undefined;}
    for (const o of this.objects) { this.scene.tweens.killTweensOf(o); o.destroy(); }
    this.objects = [];
    this.choices = [];
    this.callback = undefined;
  }
}
