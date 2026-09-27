import { FONT_FAMILY, onLocaleChange } from "../i18n";
import Phaser from "phaser";
export function label(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string | (() => string),
  size = 16,
  color = "#e1ddd0",
) {
  const object = scene.add
    .text(x, y, typeof text === "function" ? text() : text, {
      fontFamily: FONT_FAMILY,
      fontSize: size,
      color,
    })
    .setScrollFactor(0)
    .setDepth(100);
  if (typeof text === "function") {
    const unsubscribe = onLocaleChange(() => object.setText(text()));
    object.once(Phaser.GameObjects.Events.DESTROY, unsubscribe);
  }
  return object;
}
export function button(
  scene: Phaser.Scene,
  x: number,
  y: number,
  title: string | (() => string),
  action: () => void,
  width = 260,
) {
  const box = scene.add
    .rectangle(x, y, width, 58, 0x762f29)
    .setStrokeStyle(1, 0xb8a16a, 0.65)
    .setDepth(100)
    .setScrollFactor(0)
    .setInteractive({ useHandCursor: true });
  const text = label(scene, x, y, title, 17, "#e1ddd0")
    .setOrigin(0.5)
    .setFontStyle("bold");
  box.on("pointerover", () => box.setFillStyle(0x963f35));
  box.on("pointerout", () => box.setFillStyle(0x762f29));
  box.on("pointerdown", action);
  return [box, text];
}
export const timeLabel = (t: number) =>
  `${Math.floor(t / 60)
    .toString()
    .padStart(2, "0")}:${Math.floor(t % 60)
    .toString()
    .padStart(2, "0")}`;
