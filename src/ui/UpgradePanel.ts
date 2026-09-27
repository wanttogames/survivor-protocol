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
  show(choices: UpgradeChoice[], callback: (c: UpgradeChoice) => void) {
    this.close();
    this.choices = choices;
    this.callback = callback;
    const add = (o: Phaser.GameObjects.GameObject) => this.objects.push(o);
    add(
      this.scene.add
        .rectangle(640, 400, 1280, 800, 0x030910, 0.93)
        .setScrollFactor(0)
        .setDepth(200)
        .setInteractive(),
    );
    add(
      label(this.scene, 640, 132, "EVOLUTION AVAILABLE", 13, "#65ffe3")
        .setOrigin(0.5)
        .setDepth(202),
    );
    add(
      label(this.scene, 640, 174, "Rewrite your protocol.", 36)
        .setOrigin(0.5)
        .setDepth(202),
    );
    add(
      label(
        this.scene,
        640,
        222,
        "SELECT ONE UPGRADE TO CONTINUE",
        12,
        "#8197aa",
      )
        .setOrigin(0.5)
        .setDepth(202),
    );
    choices.forEach((c, i) => {
      const x = 190 + i * 330;
      const color =
        c.rarity === "Epic"
          ? 0xb39bff
          : c.rarity === "Rare"
            ? 0x79c8ff
            : 0x65ffe3;
      const hex = "#" + color.toString(16);
      const box = this.scene.add
        .rectangle(x + 120, 432, 300, 340, 0x101e2c)
        .setStrokeStyle(1, color, 0.6)
        .setScrollFactor(0)
        .setDepth(201)
        .setInteractive({ useHandCursor: true });
      add(box);
      box.on("pointerover", () => box.setFillStyle(0x1a3040));
      box.on("pointerout", () => box.setFillStyle(0x101e2c));
      box.on("pointerdown", () => this.select(i));
      add(
        label(
          this.scene,
          x,
          288,
          `${c.rarity.toUpperCase()}   /   0${i + 1}`,
          12,
          hex,
        ).setDepth(202),
      );
      add(label(this.scene, x, 330, c.definition.icon, 58, hex).setDepth(202));
      add(label(this.scene, x, 418, c.definition.name, 23).setDepth(202));
      add(
        label(this.scene, x, 466, this.description(c), 16, "#a7bac8")
          .setWordWrapWidth(250)
          .setDepth(202),
      );
      add(
        label(
          this.scene,
          x,
          545,
          `LV ${this.upgrades.levels[c.definition.id] ?? 0} → ${(this.upgrades.levels[c.definition.id] ?? 0) + 1}`,
          13,
          hex,
        ).setDepth(202),
      );
    });
    add(
      label(
        this.scene,
        640,
        655,
        "1 / 2 / 3  OR CLICK A CARD    •    SIMULATION PAUSED",
        12,
        "#8197aa",
      )
        .setOrigin(0.5)
        .setDepth(202),
    );
  }
  private description(c: UpgradeChoice) {
    const m = BALANCE.rarityMultiplier[c.rarity];
    if (["multi", "pierce"].includes(c.definition.id))
      return c.definition.description;
    return c.definition.description.replace(
      /(\d+)(%?)/,
      (_match, n: string, suffix: string) =>
        `${Math.round(Number(n) * m * 10) / 10}${suffix}`,
    );
  }
  select(i: number) {
    const c = this.choices[i];
    if (!c) return;
    const fn = this.callback;
    this.close();
    fn?.(c);
  }
  close() {
    for (const o of this.objects) o.destroy();
    this.objects = [];
    this.choices = [];
    this.callback = undefined;
  }
}
