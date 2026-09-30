import type Phaser from 'phaser';
import type { BossManager } from '../bosses/BossManager';
import { label } from './common';
import { t } from '../i18n';
export class BossHud {
    private bars: Phaser.GameObjects.Graphics;
    private names: Phaser.GameObjects.Text[];
    private ratios: Phaser.GameObjects.Text[];
    constructor(scene: Phaser.Scene, private bosses: BossManager) {
        this.bars = scene.add.graphics().setScrollFactor(0).setDepth(100);
        this.names = [0, 1].map(i => label(scene, 640, 100 + i * 48, '', 14, '#dbc493').setOrigin(.5).setDepth(100).setVisible(false));
        this.ratios = [0, 1].map(i => label(scene, 969, 96 + i * 48, '', 11, '#c7b9a0').setOrigin(1,0).setDepth(100).setVisible(false));
    }
    update() {
        const active = this.bosses.activeBosses;
        this.bars.clear();
        for (let i = 0; i < 2; i++) {
            const b = active[i];
            this.names[i].setVisible(!!b);
            this.ratios[i].setVisible(!!b);
            if (!b)
                continue;
            const ratio = Math.min(1, Math.max(0, b.hp / b.maxHp)), y = 119 + i * 48;
            this.names[i].setText(t(b.definition.nameKey));
            this.ratios[i].setText(t('boss.hp', { value: Math.ceil(ratio * 100) }));
            this.bars.fillStyle(0x111217, .9).fillRect(294, y - 30, 692, 43).lineStyle(1, 0xb19058, .6).strokeRect(294, y - 30, 692, 43).fillStyle(0x422c2d).fillRect(309, y, 662, 6).fillStyle(b.phase === 2 ? 0x9c567a : 0xb86046).fillRect(309, y, 662 * ratio, 6);
        }
    }
    destroy() { this.bars.destroy(); for (const t of [...this.names, ...this.ratios])
        t.destroy(); }
}
