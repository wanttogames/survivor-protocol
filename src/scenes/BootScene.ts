import Phaser from "phaser";
import { createObjectTextures } from "../theme/objectTextures";
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
    createObjectTextures(this);
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
