import Phaser from "phaser";
import { ENEMIES } from "../data/enemies";
export class BootScene extends Phaser.Scene {
  constructor() {
    super("Boot");
  }
  create() {
    const g = this.add.graphics();
    const texture = (key: string, draw: () => void, size = 64) => {
      g.clear();
      draw();
      g.generateTexture(key, size, size);
    };
    texture("player", () => {
      g.fillStyle(0x65ffe3, 0.07).fillCircle(32, 32, 30);
      g.lineStyle(2, 0x65ffe3, 0.5).strokeCircle(32, 32, 24);
      g.fillStyle(0x173f48).fillTriangle(32, 10, 17, 46, 47, 46);
      g.lineStyle(2, 0x9affea).strokeTriangle(32, 10, 17, 46, 47, 46);
      g.fillStyle(0xffffff).fillCircle(32, 31, 5);
    });
    for (const [kind, d] of Object.entries(ENEMIES))
      texture(kind, () => {
        g.fillStyle(d.color, 0.08).fillCircle(32, 32, d.radius + 7);
        g.lineStyle(2, d.color);
        if (kind === "runner") {
          g.fillStyle(0x3b2924).fillTriangle(52, 32, 20, 18, 20, 46);
          g.strokeTriangle(52, 32, 20, 18, 20, 46);
        } else {
          g.fillStyle(kind === "tank" ? 0x2c214a : 0x391d32).fillCircle(
            32,
            32,
            d.radius,
          );
          g.strokeCircle(32, 32, d.radius);
          if (kind === "tank") g.strokeCircle(32, 32, d.radius - 6);
        }
        g.fillStyle(d.color).fillCircle(36, 32, 4);
      });
    texture(
      "bolt",
      () => {
        g.fillStyle(0x65ffe3, 0.15).fillCircle(12, 12, 11);
        g.fillStyle(0xffffff).fillRoundedRect(4, 9, 16, 6, 3);
      },
      24,
    );
    texture(
      "orb",
      () => {
        g.fillStyle(0x65ffe3, 0.1).fillCircle(12, 12, 11);
        g.lineStyle(1, 0x65ffe3).strokeRect(8, 8, 8, 8);
        g.fillStyle(0x65ffe3).fillRect(10, 10, 4, 4);
      },
      24,
    );
    texture(
      "spark",
      () => {
        g.fillStyle(0xffffff).fillCircle(4, 4, 3);
      },
      8,
    );
    texture(
      "grid",
      () => {
        g.fillStyle(0x0b1420).fillRect(0, 0, 96, 96);
        g.lineStyle(1, 0x142330).strokeRect(0, 0, 96, 96);
        g.fillStyle(0x294050).fillCircle(48, 48, 1);
      },
      96,
    );
    g.destroy();
    this.scene.start("Menu");
  }
}
