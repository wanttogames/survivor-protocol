import Phaser from "phaser";
/** Sparse fixed decorations, no bodies, blockers, particles or update callbacks. */
export function addWorldProps(scene: Phaser.Scene, worldSize: number) {
  const kinds = ["prop-stake", "prop-stone", "prop-lantern"];
  for (let y = 270; y < worldSize - 150; y += 470)
    for (let x = 230; x < worldSize - 150; x += 510) {
      const seed = (x * 17 + y * 31) % 997;
      const px = x + (seed % 130),
        py = y + ((seed * 3) % 110);
      if (Math.hypot(px - worldSize / 2, py - worldSize / 2) < 250) continue;
      scene.add
        .image(px, py, kinds[seed % 3])
        .setDepth(1)
        .setAlpha(0.75);
    }
}
