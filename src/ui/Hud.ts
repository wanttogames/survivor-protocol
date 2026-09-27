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
  constructor(scene: Phaser.Scene) {
    scene.add
      .rectangle(640, 43, 1232, 70, 0x08111e, 0.94)
      .setStrokeStyle(1, 0x243443)
      .setScrollFactor(0)
      .setDepth(90);
    this.bars = scene.add.graphics().setScrollFactor(0).setDepth(101);
    label(scene, 44, 20, "VITAL SYSTEM", 10, "#8197aa");
    this.hp = label(scene, 255, 19, "", 12).setOrigin(1, 0);
    this.lv = label(scene, 294, 26, "", 21).setFontStyle("bold");
    this.timer = label(scene, 640, 22, "", 29).setOrigin(0.5, 0);
    label(scene, 780, 23, "NEUTRALIZED", 10, "#8197aa");
    this.kills = label(scene, 890, 40, "", 19).setOrigin(1, 0);
    this.wave = label(scene, 1215, 28, "", 14, "#65ffe3").setOrigin(1, 0);
    this.build = label(scene, 36, 753, "", 12, "#8197aa");
    label(
      scene,
      1245,
      755,
      "ESC  PAUSE   /   1–3  SELECT",
      11,
      "#8197aa",
    ).setOrigin(1, 0);
  }
  update(p: Player, l: LevelSystem, t: number, kills: number) {
    this.hp.setText(`${Math.ceil(p.stats.hp)} / ${p.stats.maxHp}`);
    this.lv.setText(`LV ${String(l.level).padStart(2, "0")}`);
    this.timer.setText(timeLabel(t));
    this.kills.setText(String(kills).padStart(4, "0"));
    this.wave.setText(
      t < 120 ? "01 / CONTACT" : t < 300 ? "02 / ESCALATION" : "03 / OVERLOAD",
    );
    this.bars
      .clear()
      .fillStyle(0x20323e)
      .fillRoundedRect(44, 43, 210, 8, 4)
      .fillStyle(p.stats.hp / p.stats.maxHp < 0.3 ? 0xff647c : 0x65ffe3)
      .fillRoundedRect(
        44,
        43,
        210 * Math.min(1, Math.max(0, p.stats.hp / p.stats.maxHp)),
        8,
        4,
      )
      .fillStyle(0x1c2c3b)
      .fillRect(24, 80, 1232, 3)
      .fillStyle(0x65ffe3)
      .fillRect(24, 80, (1232 * l.xp) / l.required, 3);
    this.build.setText(
      `PULSE NEEDLE   /   ${p.stats.projectileCount} BOLT${p.stats.projectileCount > 1 ? "S" : ""}   /   ${Math.round(p.stats.criticalChance * 100)}% CRITICAL`,
    );
  }
}
