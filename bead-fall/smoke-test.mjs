/**
 * Headless smoke test for Beadfall core loop.
 * Mocks DOM + localStorage, loads game.js, then drives logic APIs.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import vm from "vm";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function stubEl(tag) {
  const listeners = {};
  const el = {
    tagName: (tag || "div").toUpperCase(),
    style: { setProperty() {}, transform: "" },
    classList: {
      _s: new Set(),
      add(c) {
        this._s.add(c);
      },
      remove(c) {
        this._s.delete(c);
      },
      toggle(c, on) {
        if (on) this._s.add(c);
        else this._s.delete(c);
      },
      contains(c) {
        return this._s.has(c);
      },
    },
    dataset: {},
    children: [],
    hidden: false,
    disabled: false,
    textContent: "",
    innerHTML: "",
    offsetWidth: 100,
    appendChild(child) {
      this.children.push(child);
      return child;
    },
    remove() {},
    querySelector() {
      return stubEl("div");
    },
    querySelectorAll() {
      return [];
    },
    addEventListener(type, fn) {
      listeners[type] = listeners[type] || [];
      listeners[type].push(fn);
    },
    click() {
      (listeners.click || []).forEach((fn) => fn());
    },
  };
  return el;
}

const store = {};
const localStorage = {
  getItem(k) {
    return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null;
  },
  setItem(k, v) {
    store[k] = String(v);
  },
};

const ids = {};
function byId(id) {
  if (!ids[id]) ids[id] = stubEl("div");
  return ids[id];
}

const document = {
  getElementById: byId,
  querySelector() {
    return stubEl("div");
  },
  querySelectorAll() {
    return [];
  },
  createElement(tag) {
    return stubEl(tag);
  },
};

const windowObj = {
  localStorage,
  document,
  performance: { now: () => Date.now() },
  requestAnimationFrame(fn) {
    return setTimeout(() => fn(Date.now()), 0);
  },
  setTimeout,
  clearTimeout,
  BeadFall: null,
};

windowObj.window = windowObj;

const code = fs.readFileSync(path.join(__dirname, "game.js"), "utf8");
vm.runInNewContext(code, {
  window: windowObj,
  document,
  localStorage,
  performance: windowObj.performance,
  requestAnimationFrame: windowObj.requestAnimationFrame,
  setTimeout,
  clearTimeout,
  console,
});

const BF = windowObj.BeadFall;
if (!BF) {
  console.error("FAIL: BeadFall not exported");
  process.exit(1);
}

function assert(cond, msg) {
  if (!cond) {
    console.error("FAIL:", msg);
    process.exit(1);
  }
}

// --- spin → spawn ---
BF.resetRun();
assert(BF.state.roster.length === 0, "roster starts empty");
BF.spawnBeast("shieldstone");
assert(BF.state.roster.length === 1, "spawn adds unit");
assert(BF.state.roster[0].beastId === "shieldstone", "spawned shieldstone");
assert(BF.state.roster[0].star === 1, "new unit is 1 star");

// --- merge ---
BF.spawnBeast("shieldstone");
assert(BF.state.roster.length === 1, "two 1★ merge into one");
assert(BF.state.roster[0].star === 2, "merged to 2★");
BF.spawnBeast("shieldstone");
BF.spawnBeast("shieldstone");
assert(BF.state.roster.some((u) => u.beastId === "shieldstone" && u.star === 3), "cascade to 3★");

// --- utility heal ---
const hpBefore = BF.state.roster[0].hp;
BF.state.roster[0].hp = Math.max(1, Math.floor(hpBefore / 2));
BF.spawnBeast("spring");
assert(BF.state.roster[0].hp > Math.floor(hpBefore / 2), "spring heals party");

// --- roster full → heal instead of overflow ---
BF.resetRun();
for (let i = 0; i < 6; i += 1) BF.spawnBeast("flamewolf");
// after merges may be fewer; fill with unique by forcing different via direct push
while (BF.state.roster.length < 6) {
  BF.state.roster.push(BF.makeUnit("tidecrow", 1));
}
const len = BF.state.roster.length;
BF.spawnBeast("leafdeer");
assert(BF.state.roster.length === len, "full roster does not overflow");

// --- enemies / rewards / floors ---
BF.resetRun();
BF.spawnBeast("thunderhawk");
BF.spawnBeast("shieldstone");
const enemies = BF.buildEnemies();
assert(enemies.length >= 2, "enemies spawn");
BF.state.floor = 5;
const bossWave = BF.buildEnemies();
assert(bossWave.some((e) => e.name === "巨岩"), "floor 5 has boss");

const pool = BF.rewardPool();
assert(pool.length >= 3, "reward pool has options");
pool[0].apply();

BF.state.floor = 1;
BF.state.roster = [BF.makeUnit("flamewolf", 2)];
BF.nextFloor();
assert(BF.state.floor === 2, "next floor increments");
assert(BF.state.spinsLeft === BF.state.spinsPerFloor, "spins refresh");

// --- defeat / restart ---
BF.endRun();
assert(BF.state.phase === "over", "endRun sets over phase");
BF.resetRun();
assert(BF.state.floor === 1, "restart floor 1");
assert(BF.state.roster.length === 0, "restart clears roster");
assert(BF.state.wheel.length === 8, "wheel reset to 8");

console.log("OK: smoke test passed (spawn → merge → heal → battle setup → reward → floor → defeat → restart)");
