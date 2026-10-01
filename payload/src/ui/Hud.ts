import { frame } from "../theme/ornaments";
import { t } from "../i18n";
import type { WeaponLoadout } from "../weapons/WeaponLoadout";
import { ARC_BOLT } from "../data/weapons";
import Phaser from "phaser";
import { label, timeLabel } from "./common";
import type { Player } from "../entities/Player";
import type { LevelSystem } from "../systems/LevelSystem";
export class Hud {
  private bars: Phaser.GameObjects.Graphics;
  private hp;
  private lv;
  private timer;
  private kills;
  private wave;
  private build;
  constructor(scene: Phaser.Scene,private loadout?:WeaponLoadout) {
    scene.add
      .rectangle(640, 43, 1232, 70, 0x111719, 0.94)
      .setStrokeStyle(1, 0x645540)
      .setScrollFactor(0)
      .setDepth(90);
    frame(
      scene.add.graphics().setDepth(91).setScrollFactor(0),
      24,
      8,
      1232,
      70,
    );
    this.bars = scene.add.graphics().setScrollFactor(0).setDepth(101);
    label(scene, 44, 20, () => t("hud.hp"), 10, "#a69e8c");
    this.hp = label(scene, 255, 19, "", 12).setOrigin(1, 0);
    this.lv = label(scene, 294, 26, "", 21).setFontStyle("bold");
    label(scene, 640, 13, () => t("hud.time"), 10, "#a69e8c").setOrigin(0.5, 0);
    label(scene, 294, 59, () => t("hud.exp"), 10, "#a69e8c");
    this.timer = label(scene, 640, 29, "", 26).setOrigin(0.5, 0);
    label(scene, 780, 23, () => t("hud.kills"), 10, "#a69e8c");
    this.kills = label(scene, 890, 40, "", 19).setOrigin(1, 0);
    this.wave = label(scene, 1215, 28, "", 14, "#b8a16a").setOrigin(1, 0);
    this.build = label(scene, 36, 753, "", 12, "#a69e8c");
    label(scene, 1245, 755, () => t("hud.controls"), 11, "#a69e8c").setOrigin(
      1,
      0,
    );
  }
  update(p: Player, l: LevelSystem, elapsed: number, kills: number) {
    this.hp.setText(`${Math.ceil(p.stats.hp)} / ${Math.ceil(p.stats.maxHp)}`);
    this.lv.setText(
      t("hud.level", { level: String(l.level).padStart(2, "0") }),
    );
    this.timer.setText(timeLabel(elapsed));
    this.kills.setText(String(kills).padStart(4, "0"));
    this.wave.setText(
      t(
        elapsed < 120
          ? "hud.waveFirst"
          : elapsed < 300
            ? "hud.waveSecond"
            : "hud.waveThird",
      ),
    );
    this.bars
      .clear()
      .fillStyle(0x393127)
      .fillRoundedRect(44, 43, 210, 8, 4)
      .fillStyle(p.stats.hp / p.stats.maxHp < 0.3 ? 0xb45a45 : 0xb8a16a)
      .fillRoundedRect(
        44,
        43,
        210 * Math.min(1, Math.max(0, p.stats.hp / p.stats.maxHp)),
        8,
        4,
      )
      .fillStyle(0x283438)
      .fillRect(24, 80, 1232, 3)
      .fillStyle(0x82b5b5)
      .fillRect(24, 80, (1232 * l.xp) / l.required, 3);
    this.build.setText(
      t("hud.characterBuild", {
        character:t(p.character.nameKey),
        critical:Math.round(p.stats.criticalChance*100),
      }),
    );
  }
}
