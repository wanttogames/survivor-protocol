import { characterById } from './characterDefinitions';
import { CharacterUnlockManager, type SaveStorage } from './CharacterUnlockManager';
import type { CharacterId } from './characterTypes';
export const SELECTED_KEY = 'survivor-protocol.selectedCharacter';
export class CharacterManager {
    readonly unlocks: CharacterUnlockManager;
    private selected: CharacterId = 'exorcist';
    constructor(private storage?: SaveStorage) {
        this.unlocks = new CharacterUnlockManager(storage);
        try {
            const id = characterById(storage?.getItem(SELECTED_KEY) ?? undefined).id;
            if (this.unlocks.isUnlocked(id))
                this.selected = id;
        }
        catch { }
    }
    get character() { return characterById(this.selected); }
    select(id: CharacterId) { if (!this.unlocks.isUnlocked(id))
        return false; this.selected = id; try {
        this.storage?.setItem(SELECTED_KEY, id);
    }
    catch { } return true; }
    reset() { this.unlocks.resetProgress(); this.select('exorcist'); }
}
let instance: CharacterManager | undefined;
export function getCharacterManager() { if (!instance) {
    let storage: SaveStorage | undefined;
    try {
        storage = globalThis.localStorage;
    }
    catch { }
    instance = new CharacterManager(storage);
} return instance; }
