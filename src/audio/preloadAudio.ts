import type Phaser from 'phaser';
import { AUDIO_FILES } from './audioConfig';
export function preloadAudio(scene: Phaser.Scene) {
    const warned = new Set<string>();
    const onError = (file: Phaser.Loader.File) => { if (file.type === 'audio' && !warned.has(file.key)) {
        warned.add(file.key);
        console.warn(`[audio] Failed to load ${file.key}; game will continue.`);
    } };
    scene.load.on('loaderror', onError);
    scene.load.once('complete', () => scene.load.off('loaderror', onError));
    for (const asset of AUDIO_FILES)
        scene.load.audio(asset.key, `${import.meta.env.BASE_URL}${asset.path}`, { timeout: 8000 });
}
