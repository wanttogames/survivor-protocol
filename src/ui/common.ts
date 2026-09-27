import Phaser from "phaser";
export function label(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  size = 16,
  color = "#e8f6ff",
) {
  return scene.add
    .text(x, y, text, {
      fontFamily: "Arial, sans-serif",
      fontSize: size,
      color,
    })
    .setScrollFactor(0)
    .setDepth(100);
}
export function button(
  scene: Phaser.Scene,
  x: number,
  y: number,
  title: string,
  action: () => void,
  width = 260,
) {
  const box = scene.add
    .rectangle(x, y, width, 58, 0x65ffe3)
    .setDepth(100)
    .setScrollFactor(0)
    .setInteractive({ useHandCursor: true });
  const text = label(scene, x, y, title, 17, "#08151b")
    .setOrigin(0.5)
    .setFontStyle("bold");
  box.on("pointerover", () => box.setFillStyle(0xb1fff0));
  box.on("pointerout", () => box.setFillStyle(0x65ffe3));
  box.on("pointerdown", action);
  return [box, text];
}
export const timeLabel = (t: number) =>
  `${Math.floor(t / 60)
    .toString()
    .padStart(2, "0")}:${Math.floor(t % 60)
    .toString()
    .padStart(2, "0")}`;
