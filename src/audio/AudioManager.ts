import type Phaser from 'phaser';
import { AUDIO_CONFIG, SFX } from './audioConfig';
import { AUDIO_KEYS, type SfxKey } from './audioKeys';
type Voice = Phaser.Sound.WebAudioSound | Phaser.Sound.HTML5AudioSound;
const instances = new WeakMap<Phaser.Game, AudioManager>();
const clamp = (n: number) => Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : 0;
/** One manager per Game. Fixed SFX pools and one retained BGM object across Scenes. */
export class AudioManager {
    static forGame(game: Phaser.Game) { let audio = instances.get(game); if (!audio) {
        audio = new AudioManager(game);
        instances.set(game, audio);
    } return audio; }
    private pools = new Map<SfxKey, Voice[]>();
    private bgm?: Voice;
    private last = new Map<SfxKey, number>();
    private warned = new Set<string>();
    private listeners = new Set<() => void>();
    private played: Partial<Record<SfxKey, number>> = {};
    private desiredBgm = false;
    private consent = false;
    private destroyed = false;
    private initialized = false;
    private master: number = AUDIO_CONFIG.master;
    private sfxVolume: number = AUDIO_CONFIG.sfx;
    private bgmVolume: number = AUDIO_CONFIG.bgm;
    muted = false;
    private unlocked = () => { this.tryBgm(); };
    private constructor(private game: Phaser.Game) {
        try {
            this.muted = localStorage.getItem(AUDIO_CONFIG.storageKey) === 'true';
        }
        catch { /* Storage can be disabled. */ }
        game.sound.on('unlocked', this.unlocked);
        game.events.once('destroy', () => this.destroy());
    }
    initialize() {
        if (this.initialized)
            return;
        this.initialized = true;
        for (const key of Object.keys(SFX) as SfxKey[]) {
            if (!this.game.cache.audio.exists(key)) {
                this.warn(key);
                continue;
            }
            try {
                const voices: Voice[] = [];
                for (let i = 0; i < SFX[key].voices; i++)
                    voices.push(this.game.sound.add(key) as Voice);
                this.pools.set(key, voices);
            }
            catch {
                this.warn(key);
            }
        }
        if (this.game.cache.audio.exists(AUDIO_KEYS.NIGHT_STAGE)) {
            try {
                this.bgm = this.game.sound.add(AUDIO_KEYS.NIGHT_STAGE, { loop: true }) as Voice;
            }
            catch {
                this.warn(AUDIO_KEYS.NIGHT_STAGE);
            }
        }
        else
            this.warn(AUDIO_KEYS.NIGHT_STAGE);
        this.syncVolumes();
    }
    private warn(key: string) { if (!this.warned.has(key)) {
        this.warned.add(key);
        console.warn(`[audio] Unavailable: ${key}; continuing without this sound.`);
    } }
    /** Called synchronously from a user gesture; never gates gameplay. */
    unlock() {
        this.consent = true;
        const manager = this.game.sound as Phaser.Sound.WebAudioSoundManager;
        if (manager.context) {
            if (manager.context.state === 'running') {
                this.tryBgm();
                return;
            }
            void manager.context.resume().then(() => { if (!this.destroyed)
                this.tryBgm(); }).catch(() => this.warn('audio-context'));
        }
        else
            this.tryBgm();
    }
    private ready() { const manager = this.game.sound as Phaser.Sound.WebAudioSoundManager; return this.consent && !this.destroyed && (manager.context ? manager.context.state === 'running' : !manager.locked); }
    playSfx(key: SfxKey) {
        if (this.muted || !this.ready())
            return false;
        const definition = SFX[key], now = performance.now();
        if (now - (this.last.get(key) ?? -Infinity) < definition.intervalMs)
            return false;
        let active = 0;
        for (const pool of this.pools.values())
            for (const voice of pool)
                if (voice.isPlaying)
                    active++;
        if (active >= (definition.important ? AUDIO_CONFIG.maxSfx : AUDIO_CONFIG.commonSfxLimit))
            return false;
        const pool = this.pools.get(key);
        if (!pool)
            return false;
        const voice = pool.find(s => !s.isPlaying && !s.isPaused);
        if (!voice)
            return false;
        try {
            const ok = voice.play({ volume: this.master * this.sfxVolume * definition.volume, rate: definition.rateMin + Math.random() * (definition.rateMax - definition.rateMin) });
            if (ok) {
                this.last.set(key, now);
                this.played[key] = (this.played[key] ?? 0) + 1;
            }
            return ok;
        }
        catch {
            this.warn(key);
            return false;
        }
    }
    playBgm(key: typeof AUDIO_KEYS.NIGHT_STAGE = AUDIO_KEYS.NIGHT_STAGE) { if (key !== AUDIO_KEYS.NIGHT_STAGE)
        return; this.desiredBgm = true; this.tryBgm(); }
    private tryBgm() { if (!this.desiredBgm || !this.ready() || !this.bgm || this.bgm.isPlaying || this.bgm.isPaused)
        return; try {
        this.bgm.play({ loop: true, volume: this.master * this.bgmVolume, mute: this.muted });
    }
    catch {
        this.warn(AUDIO_KEYS.NIGHT_STAGE);
    } }
    stopBgm() { this.desiredBgm = false; this.bgm?.stop(); }
    stopSfx() { for (const pool of this.pools.values())
        for (const voice of pool)
            voice.stop(); this.last.clear(); }
    /** Clear combat sounds before death; preserve the death cue across the Scene change. */
    endRun(died: boolean) { this.stopBgm(); this.stopSfx(); if (died)
        this.playSfx(AUDIO_KEYS.PLAYER_DEATH); }
    setMasterVolume(value: number) { this.master = clamp(value); this.syncVolumes(); }
    setSfxVolume(value: number) { this.sfxVolume = clamp(value); this.syncVolumes(); }
    setBgmVolume(value: number) { this.bgmVolume = clamp(value); this.syncVolumes(); }
    toggleMute() { this.setMute(!this.muted); }
    setMute(muted: boolean) { this.muted = muted; if (muted)
        this.stopSfx(); this.syncVolumes(); try {
        localStorage.setItem(AUDIO_CONFIG.storageKey, String(muted));
    }
    catch { /* nonfatal */ } for (const fn of this.listeners)
        fn(); }
    onChange(fn: () => void) { this.listeners.add(fn); return () => { this.listeners.delete(fn); }; }
    private syncVolumes() {
        this.bgm?.setVolume(this.master * this.bgmVolume);
        this.bgm?.setMute(this.muted);
        for (const [key, pool] of this.pools)
            for (const voice of pool) {
                voice.setVolume(this.master * this.sfxVolume * SFX[key].volume);
                voice.setMute(this.muted);
            }
    }
    /** Read-only diagnostics for integration tests; no game behavior depends on these. */
    snapshot() { let active = 0, total = 0; for (const pool of this.pools.values())
        for (const voice of pool) {
            total++;
            if (voice.isPlaying)
                active++;
        } return { muted: this.muted, activeSfx: active, sfxObjects: total, bgmObjects: this.bgm ? 1 : 0, bgmPlaying: this.bgm?.isPlaying ?? false, bgmLoop: this.bgm?.loop ?? false, played: { ...this.played } }; }
    private destroy() { this.destroyed = true; this.stopBgm(); this.stopSfx(); for (const pool of this.pools.values())
        for (const voice of pool)
            voice.destroy(); this.bgm?.destroy(); this.pools.clear(); this.listeners.clear(); this.game.sound.off('unlocked', this.unlocked); instances.delete(this.game); }
}
