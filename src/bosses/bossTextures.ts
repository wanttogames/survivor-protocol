import type Phaser from 'phaser';
/** Small generated pixel silhouettes, cached across Retry. No external assets. */
export function createBossTextures(scene: Phaser.Scene) {
    for (const kind of ['general', 'king'] as const) {
        const key = `boss-${kind}`;
        if (scene.textures.exists(key))
            continue;
        const g = scene.make.graphics({ x: 0, y: 0 }), king = kind === 'king';
        g.fillStyle(0x111018, .65).fillEllipse(64, 111, 92, 22);
        g.fillStyle(king ? 0x211a2d : 0x24272c).fillRect(30, 43, 68, 59).fillRect(23, 57, 17, 34).fillRect(89, 57, 16, 34);
        g.fillStyle(king ? 0x463149 : 0x555252).fillRect(37, 46, 54, 44);
        g.fillStyle(0x13131a).fillRect(42, 16, 44, 32).fillRect(30, 21, 68, 9);
        if (king) {
            g.fillStyle(0x9c774c).fillRect(34, 12, 60, 9).fillRect(36, 5, 8, 14).fillRect(59, 2, 10, 15).fillRect(84, 5, 8, 14);
        }
        else {
            g.fillStyle(0x6b5540).fillRect(43, 15, 42, 8).fillRect(18, 46, 26, 18).fillRect(86, 46, 25, 18);
            g.fillStyle(0x9f8b61).fillRect(25, 46, 12, 5).fillRect(92, 46, 12, 5);
        }
        g.fillStyle(0xb94a3d).fillRect(48, 33, 10, 4).fillRect(70, 33, 10, 4).fillRect(55, 58, 18, 24);
        g.lineStyle(2, 0xc69966, .8).strokeRect(58, 61, 12, 18).lineBetween(40, 75, 89, 75);
        g.fillStyle(0x699c9e, .8).fillRect(king ? 25 : 40, 93, 12, 13).fillRect(king ? 92 : 77, 93, 11, 13);
        if (!king) {
            g.fillStyle(0xa8aba0).fillRect(106, 43, 5, 57);
            g.fillStyle(0x85694b).fillRect(98, 88, 21, 5);
        }
        g.generateTexture(key, 128, 128);
        g.destroy();
    }
    const textures = [['spirit-shot', 0x9dccca], ['healing-charm', 0xa89b64], ['ghost-gate', 0x8a5a89]] as const;
    for (const [key, color] of textures) {
        if (scene.textures.exists(key))
            continue;
        const g = scene.make.graphics({ x: 0, y: 0 });
        if (key === 'healing-charm') {
            g.fillStyle(0xe1d2a5).fillRect(7, 3, 18, 27);
            g.lineStyle(2, 0x8b4435).lineBetween(16, 8, 16, 24).lineBetween(11, 16, 22, 16);
        }
        else {
            g.fillStyle(color, .2).fillCircle(16, 16, 15);
            g.lineStyle(2, key==='spirit-shot'?0xaa655b:color, .9).strokeCircle(16, 16, 10);
            if (key === 'ghost-gate')
                g.lineStyle(2, 0xae614c).strokeRect(10, 7, 12, 18);
            else
                g.fillStyle(0xd4e6db).fillTriangle(16, 3, 9, 20, 22, 20);
        }
        g.generateTexture(key, 32, 32);
        g.destroy();
    }
}
