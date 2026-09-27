import Phaser from "phaser";
import { THEME as T } from "./palette";
/** Original abstract talisman marks, not historical calligraphy. */
export function talisman(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  w: number,
  h: number,
  color = T.vermilion,
) {
  g.lineStyle(2, color, 0.85);
  const cx = x + w / 2;
  g.strokeRect(x, y, w, h);
  g.lineBetween(cx, y + 8, cx, y + h - 8);
  for (let i = 0; i < 4; i++) {
    const yy = y + 13 + (i * (h - 26)) / 4;
    const side = i % 2 ? 1 : -1;
    g.lineBetween(cx - w * 0.27, yy, cx + w * 0.27, yy);
    g.lineBetween(cx, yy, cx + side * w * 0.25, yy + 9);
  }
}
export function frame(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  w: number,
  h: number,
  color = T.gold,
) {
  g.lineStyle(1, color, 0.5).strokeRect(x, y, w, h);
  for (const [cx, cy, sx, sy] of [
    [x, y, 1, 1],
    [x + w, y, -1, 1],
    [x, y + h, 1, -1],
    [x + w, y + h, -1, -1],
  ]) {
    g.lineBetween(cx + sx * 5, cy + sy * 19, cx + sx * 5, cy + sy * 5);
    g.lineBetween(cx + sx * 5, cy + sy * 5, cx + sx * 19, cy + sy * 5);
  }
}
export function nightBackdrop(scene: Phaser.Scene) {
  const g = scene.add.graphics();
  g.fillStyle(T.ink).fillRect(0, 0, 1280, 800);
  g.fillStyle(T.night, 0.75).fillRect(0, 420, 1280, 380);
  // Pale moon, silhouettes, and bounded low-opacity mist; no per-frame allocation.
  g.fillStyle(T.pale, 0.025).fillCircle(944, 195, 119);
  g.fillStyle(T.pale, 0.08).fillCircle(944, 195, 90);
  g.fillStyle(T.pale, 0.48).fillCircle(944, 195, 62);
  g.fillStyle(T.ink, 0.4).fillCircle(964, 179, 57);
  for (let i = 0; i < 7; i++) {
    g.fillStyle(0x8a9b9d, 0.018).fillEllipse(
      180 + i * 176,
      526 + (i % 3) * 65,
      590,
      65,
    );
  }
  g.lineStyle(9, 0x080e13, 0.9).lineBetween(1116, 760, 1083, 293);
  g.lineStyle(5, 0x080e13, 0.9)
    .lineBetween(1098, 480, 994, 387)
    .lineBetween(1089, 381, 1176, 304)
    .lineBetween(1091, 412, 1042, 325);
  frame(g, 26, 26, 1228, 748, T.wood);
  talisman(g, 928, 333, 47, 150);
  talisman(g, 1001, 440, 31, 104);
  return g;
}
