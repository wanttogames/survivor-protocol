import { BALANCE } from '../config/balance';
import { ENCOUNTER_CONFIG as C } from './encounterConfig';
/** Pick a distant location inside the world and outside the current camera. */
export function encounterSpawnPoint(x: number, y: number, view: {
    left: number;
    right: number;
    top: number;
    bottom: number;
}, random = Math.random) {
    const offset = Math.floor(random() * 8);
    for (let i = 0; i < 8; i++) {
        const a = (i + offset) * Math.PI / 4, sx = x + Math.cos(a) * C.spawnDistance, sy = y + Math.sin(a) * C.spawnDistance;
        if (sx < C.worldMargin || sy < C.worldMargin || sx > BALANCE.worldSize - C.worldMargin || sy > BALANCE.worldSize - C.worldMargin)
            continue;
        if (sx < view.left - C.cameraMargin || sx > view.right + C.cameraMargin || sy < view.top - C.cameraMargin || sy > view.bottom + C.cameraMargin)
            return { x: sx, y: sy };
    }
    const a = Math.atan2(BALANCE.worldSize / 2 - y, BALANCE.worldSize / 2 - x);
    return { x: x + Math.cos(a) * C.spawnDistance, y: y + Math.sin(a) * C.spawnDistance };
}
