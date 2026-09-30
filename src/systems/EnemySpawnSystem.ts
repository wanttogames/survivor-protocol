import { safeMapSpawn } from '../maps/spawnSafety';
import { BALANCE } from "../config/balance";
import type { EnemyKind } from "../data/enemies";
import type { Enemy } from "../entities/Enemy";
import type { Pool } from "../utils/Pool";
export class EnemySpawnSystem {
  private cooldown = 0;
  constructor(private pool: Pool<Enemy>) {}
  update(dt: number, t: number, x: number, y: number, rateMultiplier = 1) {
    this.cooldown -= dt * rateMultiplier;
    if (this.cooldown > 0) return;
    this.cooldown = Math.max(
      BALANCE.spawn.minInterval,
      BALANCE.spawn.initialInterval * (1 - t / BALANCE.spawn.ramp),
    );
    const count = 1 + Math.floor(t / 150);
    for (let i = 0; i < count; i++) {
      const enemy = this.pool.acquire();
      if (!enemy) return;
      const a = Math.random() * Math.PI * 2;
      const sx = Math.max(
        40,
        Math.min(BALANCE.worldSize - 40, x + Math.cos(a) * 850),
      );
      const sy = Math.max(
        40,
        Math.min(BALANCE.worldSize - 40, y + Math.sin(a) * 850),
      );
      if (Math.hypot(sx - x, sy - y) < 420) continue;
      const r = Math.random();
      const kind: EnemyKind =
        t >= BALANCE.spawn.tankAt && r < 0.22
          ? "tank"
          : t >= BALANCE.spawn.runnerAt && r < 0.5
            ? "runner"
            : "grunt";
      const safe = safeMapSpawn(sx, sy);
      enemy.spawn(
        safe.x,
        safe.y,
        kind,
        1 + (t / 60) * BALANCE.spawn.hpPerMinute,
        1 + (t / 60) * BALANCE.spawn.speedPerMinute,
      );
    }
  }
}
