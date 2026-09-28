export const AUDIO_KEYS = {
    TALISMAN_SHOT: 'talisman-shot', ENEMY_HIT: 'enemy-hit', ENEMY_DEATH: 'enemy-death',
    SOUL_PICKUP: 'soul-pickup', LEVEL_UP: 'level-up', UPGRADE_SELECT: 'upgrade-select',
    PLAYER_HIT: 'player-hit', PLAYER_DEATH: 'player-death', NIGHT_STAGE: 'night-stage'
} as const;
export type AudioKey = typeof AUDIO_KEYS[keyof typeof AUDIO_KEYS];
export type SfxKey = Exclude<AudioKey, typeof AUDIO_KEYS.NIGHT_STAGE>;
