import { t } from "../i18n";
import Phaser from "phaser";
import { label, button } from "../ui/common";
export class MenuScene extends Phaser.Scene {
  constructor() {
    super("Menu");
  }
  create() {
    this.add.tileSprite(640, 400, 1280, 800, "grid").setAlpha(0.65);
    const g = this.add.graphics();
    g.lineStyle(1, 0x65ffe3, 0.12);
    for (let r = 100; r < 530; r += 85) g.strokeCircle(960, 360, r);
    this.add.image(960, 340, "player").setScale(4).setAngle(30);
    this.add.image(1080, 470, "tank").setScale(2);
    this.add.image(810, 510, "grunt").setScale(1.5);
    label(this, 78, 65, () => t("menu.eyebrow"), 13, "#65ffe3");
    label(this, 78, 192, () => t("menu.titleFirst"), 80).setFontStyle("bold");
    label(
      this,
      78,
      275,
      () => t("menu.titleSecond"),
      80,
      "#65ffe3",
    ).setFontStyle("bold");
    label(this, 82, 391, () => t("menu.tagline"), 16, "#a5bac8");
    label(
      this,
      82,
      429,
      () => t("menu.description"),
      18,
      "#8197aa",
    ).setLineSpacing(9);
    button(
      this,
      213,
      558,
      () => t("menu.play"),
      () => this.scene.start("Game"),
    );
    label(this, 82, 635, () => t("menu.moveGuide"), 13, "#a5bac8");
    label(this, 82, 662, () => t("menu.autoAttack"), 12, "#65ffe3");
    label(this, 1195, 735, () => t("menu.sector"), 12, "#8197aa")
      .setOrigin(1, 0)
      .setAlign("right");
    this.input.keyboard?.once("keydown-ENTER", () => this.scene.start("Game"));
  }
}
