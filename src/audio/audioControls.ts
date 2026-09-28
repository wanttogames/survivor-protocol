import type Phaser from 'phaser';
import { AudioManager } from './AudioManager';
import { label } from '../ui/common';
import { t } from '../i18n';
/** Mounted once per Scene; removed on shutdown, including keyboard subscriptions. */
export function addAudioControls(scene: Phaser.Scene) {
    const audio = AudioManager.forGame(scene.game);
    const text = () => t(audio.muted ? 'audio.muted' : 'audio.enabled');
    const status = label(scene, 1245, 720, text, 12, '#b8a16a').setOrigin(1, 0).setDepth(250).setInteractive({ useHandCursor: true });
    const off = audio.onChange(() => status.setText(text()));
    const unlock = () => audio.unlock();
    const toggle = () => { audio.unlock(); audio.toggleMute(); };
    const key = (event: KeyboardEvent) => { if (!event.repeat)
        toggle(); };
    status.on('pointerdown', toggle);
    scene.input.on('pointerdown', unlock);
    scene.input.keyboard?.on('keydown', unlock);
    scene.input.keyboard?.on('keydown-M', key);
    scene.events.once('shutdown', () => { off(); scene.input.off('pointerdown', unlock); scene.input.keyboard?.off('keydown', unlock); scene.input.keyboard?.off('keydown-M', key); });
}
