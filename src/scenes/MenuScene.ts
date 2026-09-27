import Phaser from "phaser";
import { t } from "../i18n";
import { label, button } from "../ui/common";
import { nightBackdrop } from "../theme/ornaments";
import { THEME as T } from "../theme/palette";
export class MenuScene extends Phaser.Scene {
  constructor() {
    super("Menu");
  }
  create() {
    nightBackdrop(this);
    label(this, 110, 94, () => t("menu.eyebrow"), 14, T.text.gold);
    label(
      this,
      102,
      165,
      () => t("menu.titleFirst"),
      116,
      T.text.pale,
    ).setFontStyle("bold");
    label(
      this,
      115,
      320,
      () => t("menu.titleSecond"),
      14,
      T.text.gold,
    ).setLetterSpacing(5);
    this.add
      .graphics()
      .lineStyle(1, T.gold, 0.4)
      .lineBetween(112, 365, 555, 365);
    label(this, 112, 394, () => t("menu.tagline"), 22, T.text.pale);
    label(
      this,
      112,
      441,
      () => t("menu.description"),
      17,
      T.text.muted,
    ).setLineSpacing(8);
    button(
      this,
      242,
      560,
      () => t("menu.play"),
      () => this.scene.start("Game"),
    );
    label(this, 112, 643, () => t("menu.moveGuide"), 13, T.text.muted);
    label(this, 112, 673, () => t("menu.autoAttack"), 12, T.text.muted);
    label(this, 1190, 706, () => t("menu.sector"), 13, T.text.gold)
      .setOrigin(1, 0)
      .setAlign("right")
      .setLineSpacing(7);
    this.input.keyboard?.once("keydown-ENTER", () => this.scene.start("Game"));
  }
}
