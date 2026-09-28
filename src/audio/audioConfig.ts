import { AUDIO_KEYS as K, type SfxKey } from './audioKeys';
export const AUDIO_CONFIG = { master: 1, sfx: 1, bgm: .22, maxSfx: 12, commonSfxLimit: 8, storageKey: 'survivor-protocol.audioMuted' };
export interface SfxDefinition {
    volume: number;
    intervalMs: number;
    voices: number;
    rateMin: number;
    rateMax: number;
    important: boolean;
}
export const SFX: Record<SfxKey, SfxDefinition> = {
    [K.TALISMAN_SHOT]: { volume: .28, intervalMs: 65, voices: 2, rateMin: .97, rateMax: 1.03, important: false },
    [K.ENEMY_HIT]: { volume: .14, intervalMs: 50, voices: 2, rateMin: .96, rateMax: 1.04, important: false },
    [K.ENEMY_DEATH]: { volume: .20, intervalMs: 70, voices: 2, rateMin: .95, rateMax: 1.05, important: false },
    [K.SOUL_PICKUP]: { volume: .10, intervalMs: 45, voices: 2, rateMin: .98, rateMax: 1.04, important: false },
    [K.LEVEL_UP]: { volume: .55, intervalMs: 120, voices: 1, rateMin: 1, rateMax: 1, important: true },
    [K.UPGRADE_SELECT]: { volume: .25, intervalMs: 80, voices: 1, rateMin: 1, rateMax: 1, important: true },
    [K.PLAYER_HIT]: { volume: .42, intervalMs: 160, voices: 1, rateMin: 1, rateMax: 1, important: true },
    [K.PLAYER_DEATH]: { volume: .50, intervalMs: 300, voices: 1, rateMin: 1, rateMax: 1, important: true }
};
export const AUDIO_FILES = [...Object.keys(SFX).map(key => ({ key, path: `audio/sfx/${key}.ogg` })), { key: K.NIGHT_STAGE, path: 'audio/bgm/night-stage.ogg' }];
