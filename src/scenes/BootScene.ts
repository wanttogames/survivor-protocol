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
      g.fillStyle(0xb8a16a, 0.07).fillCircle(32, 32, 30);
      g.lineStyle(2, 0xb8a16a, 0.5).strokeCircle(32, 32, 24);
      g.fillStyle(0x3c4039).fillTriangle(32, 10, 17, 46, 47, 46);
      g.lineStyle(2, 0xe1ddd0).strokeTriangle(32, 10, 17, 46, 47, 46);
      g.fillStyle(0xffffff).fillCircle(32, 31, 5);
    });
    for (const [kind, d] of Object.entries(ENEMIES))
      texture(kind, () => {
        g.fillStyle(d.color, 0.08).fillCircle(32, 32, d.radius + 7);
        g.lineStyle(2, d.color);
        if (kind === "runner") {
          g.fillStyle(0x372b28).fillTriangle(52, 32, 20, 18, 20, 46);
          g.strokeTriangle(52, 32, 20, 18, 20, 46);
        } else {
          g.fillStyle(kind === "tank" ? 0x3d3431 : 0x253638).fillCircle(
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
        g.fillStyle(0xb8a16a, 0.15).fillCircle(12, 12, 11);
        g.fillStyle(0xd6c49d).fillRect(3, 7, 18, 10);
        g.lineStyle(1, 0x963f35)
          .lineBetween(6, 12, 18, 12)
          .lineBetween(11, 9, 11, 15)
          .lineBetween(16, 10, 16, 14);
      },
      24,
    );
    texture(
      "orb",
      () => {
        g.fillStyle(0xb8a16a, 0.1).fillCircle(12, 12, 11);
        g.lineStyle(1, 0x82b5b5).strokeCircle(12, 12, 5);
        g.fillStyle(0x82b5b5).fillCircle(12, 12, 3);
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
        g.fillStyle(0x151c21).fillRect(0, 0, 96, 96);
        g.lineStyle(1, 0x1d2529)
          .lineBetween(7, 22, 31, 20)
          .lineBetween(61, 70, 85, 73);
        g.fillStyle(0x41473f).fillCircle(48, 48, 1);
      },
      96,
    );
    g.destroy();
    this.scene.start("Menu");
  }
}
