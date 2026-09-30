import { ENCOUNTERS, type EncounterDefinition } from './encounterConfig';
/** Run-local timeline. A full pool delays an encounter rather than losing it. */
export class EncounterManager {
    readonly triggeredEncounterIds = new Set<string>();
    constructor(private duration: number, private spawn: (encounter: EncounterDefinition) => boolean, private definitions = ENCOUNTERS) { }
    update(elapsed: number) { for (const e of this.definitions)
        if (elapsed >= e.timeRatio * this.duration && !this.triggeredEncounterIds.has(e.id) && this.spawn(e))
            this.triggeredEncounterIds.add(e.id); }
}
