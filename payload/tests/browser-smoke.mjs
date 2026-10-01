import { chromium } from "@playwright/test";
import { createServer } from "vite";
import assert from "node:assert/strict";
const server = await createServer({
  server: { host: "127.0.0.1", port: 5173 },
});
await server.listen();
let browser;
try {
  const options = {
    headless: true,
    args: [
      "--no-sandbox",
      "--use-gl=angle",
      "--use-angle=swiftshader",
      "--enable-unsafe-swiftshader",
    ],
  };
  if (process.env.CHROMIUM_EXECUTABLE_PATH)
    options.executablePath = process.env.CHROMIUM_EXECUTABLE_PATH;
  if (process.env.USE_SPARTICUZ) {
    const { default: binary } = await import("@sparticuz/chromium");
    options.executablePath = await binary.executablePath();
    options.args = binary.args;
  }
  browser = await chromium.launch(options);
  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 },
    locale: "ko-KR",
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://127.0.0.1:5173");
  await page.waitForFunction(() =>
    window.__SURVIVOR_GAME__?.scene.isActive("Menu"),
  );
  assert.equal(await page.locator("html").getAttribute("lang"), "ko");
  const texts = () =>
    page.evaluate(() =>
      window.__SURVIVOR_GAME__.scene
        .getScenes(true)
        .flatMap((s) =>
          s.children.list.filter((o) => o.type === "Text").map((o) => o.text),
        ),
    );
  assert.ok((await texts()).includes("시작"));
  await page.evaluate(async () => {
    const { setLocale } = await import("/src/i18n/index.ts");
    setLocale("en");
  });
  assert.ok((await texts()).includes("Start"));
  await page.evaluate(async () => {
    const { setLocale } = await import("/src/i18n/index.ts");
    setLocale("ko");
  });
  await page.screenshot({ path: "menu-preview.png" });
  await page.keyboard.press("Enter");
  await page.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.isActive("CharacterSelect"));
  await page.keyboard.press("Enter");
  await page.waitForFunction(() =>
    window.__SURVIVOR_GAME__.scene.isActive("Game"),
  );
  const initialX = await page.evaluate(
    () => window.__SURVIVOR_GAME__.scene.getScene("Game").player.x,
  );
  await page.keyboard.down("D");
  await page.waitForTimeout(400);
  await page.keyboard.up("D");
  assert.ok(
    (await page.evaluate(
      () => window.__SURVIVOR_GAME__.scene.getScene("Game").player.x,
    )) > initialX,
  );
  // Place a real, killable target in range, then let auto fire and Arcade collision resolve it.
  await page.evaluate(() => {
    const s = window.__SURVIVOR_GAME__.scene.getScene("Game");
    s.enemies.acquire().spawn(s.player.x + 85, s.player.y, "grunt", 0.1, 0);
  });
  await page.waitForFunction(
    () => window.__SURVIVOR_GAME__.scene.getScene("Game").kills > 0,
  );
  await page.waitForFunction(
    () => window.__SURVIVOR_GAME__.scene.getScene("Game").levels.xp > 0,
  );
  await page.evaluate(() =>
    window.__SURVIVOR_GAME__.scene.getScene("Game").levels.add(8),
  );
  await page.waitForFunction(
    () => window.__SURVIVOR_GAME__.scene.getScene("Game").panel.open,
  );
  const time = await page.evaluate(
    () => window.__SURVIVOR_GAME__.scene.getScene("Game").elapsed,
  );
  await page.waitForTimeout(250);
  assert.equal(
    await page.evaluate(
      () => window.__SURVIVOR_GAME__.scene.getScene("Game").elapsed,
    ),
    time,
  );
  assert.ok((await texts()).includes("술법을 깨우치세요"));
  await page.screenshot({ path: "upgrade-preview.png" });
  // Verify all ten cards in both locales, including maximum rarity values.
  for (const locale of ["ko", "en"]) {
    for (let start = 0; start < 10; start += 3) {
      const overflow = await page.evaluate(
        async ({ locale, start }) => {
          const { setLocale } = await import("/src/i18n/index.ts");
          const { UPGRADES } = await import("/src/data/upgrades.ts");
          setLocale(locale);
          const s = window.__SURVIVOR_GAME__.scene.getScene("Game");
          s.panel.show(
            [0, 1, 2].map((i) => ({
              definition: UPGRADES[(start + i) % 10],
              rarity: "Epic",
            })),
            () => {},
          );
          return s.children.list
            .filter(
              (o) =>
                o.type === "Text" &&
                o.depth === 202 &&
                o.x < 1000 &&
                o.y >= 418 &&
                o.y <= 545,
            )
            .filter((o) => o.width > 250 || o.height > 74)
            .map((o) => o.text);
        },
        { locale, start },
      );
      assert.deepEqual(overflow, []);
    }
  }
  await page.evaluate(async () => {
    const { setLocale } = await import("/src/i18n/index.ts");
    setLocale("ko");
    const s = window.__SURVIVOR_GAME__.scene.getScene("Game");
    s.panel.close();
    s.levels.pending++;
    s.showUpgrade();
  });
  await page.keyboard.press("1", { delay: 100 });
  await page.waitForFunction(
    () => !window.__SURVIVOR_GAME__.scene.getScene("Game").panel.open,
  );
  assert.equal(
    await page.evaluate(() =>
      Object.entries(
        window.__SURVIVOR_GAME__.scene.getScene("Game").upgrades.levels,
      ).reduce((a, [id,level]) => a + level - (id === "weapon:arc-bolt" ? 1 : 0), 0),
    ),
    1,
  );
  await page.waitForTimeout(750);
  await page.evaluate(()=>{
    const s=window.__SURVIVOR_GAME__.scene.getScene('Game');
    s.paused=true;s.physics.pause();s.player.setAlpha(1);
    const x=s.player.x,y=s.player.y;
    ['grunt','runner','tank'].forEach((kind,i)=>s.enemies.acquire()?.spawn(x+140+i*125,y-70,kind,1,0));
    for(let i=0;i<5;i++)s.orbs.acquire()?.spawn(x+130+i*45,y+95,2);
    s.bolts.acquire()?.fire(x+85,y-20,0,0,1,0,false,5);
  });
  await page.screenshot({path:'objects-preview.png'});
  await page.evaluate(()=>{const s=window.__SURVIVOR_GAME__.scene.getScene('Game');s.paused=false;s.physics.resume()});
  await page.keyboard.press("Escape", { delay: 100 });
  assert.equal(
    await page.evaluate(
      () => window.__SURVIVOR_GAME__.scene.getScene("Game").paused,
    ),
    true,
  );
  await page.keyboard.press("Escape", { delay: 100 });
  await page.evaluate(() => {
    const s = window.__SURVIVOR_GAME__.scene.getScene("Game");
    s.talismans.times = []; // Modal timeline is covered by talismans-browser.
    s.elapsed = 305;
    s.player.stats.hp = 100;
    s.player.invulnerable = 10;
    for (let i = 0; i < 180; i++) {
      const a = i * 0.24;
      s.enemies
        .acquire()
        ?.spawn(
          s.player.x + 200 + Math.cos(a) * 420,
          s.player.y + Math.sin(a) * 330,
          ["grunt", "runner", "tank"][i % 3],
          1,
          1,
        );
    }
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: "game-preview.png" });
  await page.evaluate(() => {
    const s = window.__SURVIVOR_GAME__.scene.getScene("Game");
    s.player.stats.hp = 1;
    s.player.invulnerable = 0;
    s.enemies.acquire()?.spawn(s.player.x, s.player.y, "tank", 1, 0);
  });
  await page.waitForFunction(() =>
    window.__SURVIVOR_GAME__.scene.isActive("GameOver"),
  );
  assert.ok((await texts()).includes("기력이 다했습니다"));
  await page.screenshot({ path: "gameover-preview.png" });
  await page.keyboard.press("Enter");
  await page.waitForFunction(() =>
    window.__SURVIVOR_GAME__.scene.isActive("Game"),
  );
  assert.equal(
    await page.evaluate(
      () => window.__SURVIVOR_GAME__.scene.getScene("Game").levels.level,
    ),
    1,
  );
  assert.equal(
    await page.evaluate(
      () => window.__SURVIVOR_GAME__.scene.getScene("Game").player.stats.hp,
    ),
    100,
  );
  await page.evaluate(
    () => { const s=window.__SURVIVOR_GAME__.scene.getScene("Game"); s.talismans.times=[]; s.elapsed=599.98; },
  );
  await page.waitForFunction(()=>window.__SURVIVOR_GAME__.scene.getScene('Game').bosses.spawnedIds.has('ghost-king'));
  await page.evaluate(()=>{const s=window.__SURVIVOR_GAME__.scene.getScene('Game');s.levels.pending=0;s.panel.close();for(const e of s.enemies.items)if(e.active&&e.rank==='boss'&&e.definition.id==='ghost-king')s.weapons.strike(e,1000000,'arc-bolt');s.paused=false;s.physics.resume();});
  await page.waitForFunction(() =>
    window.__SURVIVOR_GAME__.scene.isActive("GameOver"),
  );
  await page.mouse.click(640, 649);
  await page.waitForFunction(() =>
    window.__SURVIVOR_GAME__.scene.isActive("Menu"),
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(100);
  const bounds = await page.locator("canvas").boundingBox();
  assert.ok(bounds.width <= 390 && bounds.height <= 844);
  await page.screenshot({ path: "mobile-preview.png" });
  assert.deepEqual(errors, []);
  console.log(
    "Browser smoke passed: movement, auto combat, XP, cards, pause, swarm, death, retry, victory, menu, responsive canvas.",
  );
} finally {
  await browser?.close();
  await server.close();
}
