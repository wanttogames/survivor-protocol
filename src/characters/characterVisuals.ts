import type Phaser from 'phaser';
import type { CharacterDefinition } from './characterTypes';
/** A small overlay and tint; later replace with a texture set in CharacterDefinition.visual. */
export function createCharacterAdornment(scene: Phaser.Scene, c: CharacterDefinition) {
    const g = scene.add.graphics().setDepth(5.1);
    g.lineStyle(2, c.visual.accent).fillStyle(c.visual.accent);
    switch (c.visual.decoration) {
        case 'ribbon':
            g.fillRect(-19, -1, 4, 20).fillRect(15, -1, 4, 20);
            break;
        case 'armor':
            g.fillRect(-18, -5, 7, 8).fillRect(11, -5, 7, 8).lineBetween(-9, 5, 9, 5);
            break;
        case 'bow':
            g.beginPath().arc(19, 2, 15, -Math.PI / 2, Math.PI / 2).strokePath().lineBetween(19, -13, 19, 17);
            break;
        case 'beads':
            for (let i = 0; i < 7; i++)
                g.fillCircle(-12 + i * 4, 6 + Math.sin(i * Math.PI / 6) * 6, 2);
            break;
        case 'seal':
            g.lineStyle(2, c.visual.accent).strokeTriangle(0, -28, -9, -14, 9, -14);
            break;
    }
    return g;
}
