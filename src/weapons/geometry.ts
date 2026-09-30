export const inCircle = (x: number, y: number, cx: number, cy: number, radius: number) => (x - cx) ** 2 + (y - cy) ** 2 <= radius ** 2;
export function inSector(x: number, y: number, cx: number, cy: number, angle: number, range: number, halfAngle: number) {
    const dx = x - cx, dy = y - cy;
    if (dx * dx + dy * dy > range * range)
        return false;
    const delta = Math.atan2(Math.sin(Math.atan2(dy, dx) - angle), Math.cos(Math.atan2(dy, dx) - angle));
    return Math.abs(delta) <= halfAngle;
}
