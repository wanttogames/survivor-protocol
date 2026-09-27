import { t } from "../i18n";
import Phaser from "phaser";
import { label, button, timeLabel } from "../ui/common";
export interface RunResult {
  time: number;
  level: number;
  kills: number;
  won: boolean;
}
export class GameOverScene extends Phaser.Scene {
  constructor() {
    super("GameOver");
  }
  create(result: RunResult) {
    this.add.tileSprite(640, 400, 1280, 800, "grid").setAlpha(0.5);
    label(
      this,
      640,
      165,
      () => t(result.won ? "gameOver.won" : "gameOver.lost"),
      14,
      result.won ? "#65ffe3" : "#ff647c",
    ).setOrigin(0.5);
    label(
      this,
      640,
      226,
      () => t(result.won ? "gameOver.wonMessage" : "gameOver.lostMessage"),
      45,
    ).setOrigin(0.5);
    const values = [
      timeLabel(result.time),
      String(result.level),
      String(result.kills),
    ];
    (["gameOver.time", "gameOver.level", "gameOver.kills"] as const).forEach(
      (key, i) => {
        const x = 390 + i * 250;
        label(this, x, 350, values[i], 44, "#65ffe3").setOrigin(0.5);
        label(this, x, 406, () => t(key), 12, "#8197aa").setOrigin(0.5);
      },
    );
    button(
      this,
      640,
      515,
      () => t("gameOver.retry"),
      () => this.scene.start("Game"),
    );
    button(
      this,
      640,
      593,
      () => t("gameOver.mainMenu"),
      () => this.scene.start("Menu"),
    );
    this.input.keyboard?.once("keydown-ENTER", () => this.scene.start("Game"));
  }
}
