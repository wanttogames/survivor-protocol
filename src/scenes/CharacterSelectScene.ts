import Phaser from 'phaser';
import { CHARACTERS } from '../characters/characterDefinitions';
import { getCharacterManager } from '../characters/CharacterManager';
import type { CharacterDefinition } from '../characters/characterTypes';
import { WEAPONS } from '../data/weaponConfig';
import { t, type TranslationParams } from '../i18n';
import { label, button, timeLabel } from '../ui/common';
import { nightBackdrop, frame } from '../theme/ornaments';
import { addAudioControls } from '../audio/audioControls';
import { AudioManager } from '../audio/AudioManager';
export class CharacterSelectScene extends Phaser.Scene {
    constructor() { super('CharacterSelect'); }
    create() {
        const manager = getCharacterManager();
        addAudioControls(this);
        nightBackdrop(this);
        label(this, 640, 48, () => t('character.select.title'), 32).setOrigin(.5);
        label(this, 640, 92, () => t('character.select.guide'), 13, '#b8a16a').setOrigin(.5);
        CHARACTERS.forEach((c, i) => this.card(c, 55 + (i % 3) * 395, 125 + Math.floor(i / 3) * 285));
        button(this, 640, 744, () => t('character.select.begin', { name: t(manager.character.nameKey) }), () => { AudioManager.forGame(this.game).unlock(); this.scene.start('Game'); }, 340);
        button(this, 160, 744, () => t('character.select.back'), () => this.scene.start('Menu'), 210);
        this.input.keyboard?.on('keydown-ENTER', () => { AudioManager.forGame(this.game).unlock(); this.scene.start('Game'); });
        this.input.keyboard?.once('keydown-ESC', () => this.scene.start('Menu'));
    }
    private card(c: CharacterDefinition, x: number, y: number) {
        const manager = getCharacterManager(), unlocks = manager.unlocks, open = unlocks.isUnlocked(c.id), selected = manager.character.id === c.id;
        const box = this.add.rectangle(x + 185, y + 130, 370, 260, open ? 0x282a27 : 0x171c20).setStrokeStyle(selected ? 2 : 1, selected ? 0xc6b074 : 0x655640).setDepth(100);
        frame(this.add.graphics().setDepth(100), x + 8, y + 8, 354, 244, 0x655640);
        this.add.image(x + 43, y + 47, 'player').setTint(c.visual.tint).setScale(.8).setDepth(102).setAlpha(open ? 1 : .5);
        const text = (xx: number, yy: number, fn: () => string, size = 13, color = '#c9c5b7') => label(this, xx, yy, fn, size, color).setDepth(102);
        text(x + 78, y + 21, () => t(c.nameKey), 21, '#e1ddd0');
        text(x + 78, y + 52, () => t(selected ? 'character.select.selected' : open ? 'character.select.available' : 'character.select.locked'), 11, open ? '#b8a16a' : '#b86d59');
        text(x + 20, y + 83, () => t(c.descriptionKey), 12).setWordWrapWidth(328);
        text(x + 20, y + 126, () => t('character.select.weapon', { name: t(WEAPONS[c.startingWeaponId].nameKey) }), 13, '#d0b980');
        text(x + 20, y + 150, () => t('character.select.passive', { value: t(c.passiveKey) }), 12, '#9ebfc0').setWordWrapWidth(330);
        if (open) {
            box.setInteractive({ useHandCursor: true });
            box.on('pointerdown', () => { if (manager.select(c.id))
                this.scene.restart(); });
            text(x + 20, y + 222, () => t(selected ? 'character.select.selected' : 'character.select.choose'), 13, '#d0b980');
        }
        else {
            const params: TranslationParams = c.unlock.type === 'default' ? {} : { target: c.unlock.type === 'survival' ? timeLabel(c.unlock.target) : c.unlock.target, weapon: c.unlock.type === 'weaponLevel' || c.unlock.type === 'weaponKills' ? t(WEAPONS[c.unlock.weaponId].nameKey) : '' };
            text(x + 20, y + 185, () => t(c.unlockKey, params), 12, '#bfa18b').setWordWrapWidth(330);
            const target = c.unlock.type === 'default' ? 1 : c.unlock.target;
            text(x + 20, y + 222, () => t('character.select.progress', { current: c.unlock.type === 'survival' ? timeLabel(Math.min(target, unlocks.value(c))) : Math.min(target, Math.floor(unlocks.value(c))), target: c.unlock.type === 'survival' ? timeLabel(target) : target }), 12, '#938e81');
            // A small drawn lock avoids font-dependent icon glyphs.
            this.add.graphics().setDepth(102).lineStyle(2, 0x9e7764).strokeRoundedRect(x + 324, y + 32, 15, 14, 4).fillStyle(0x9e7764).fillRect(x + 321, y + 42, 21, 15);
        }
    }
}
