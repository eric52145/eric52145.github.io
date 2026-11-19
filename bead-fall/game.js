(() => {
  "use strict";

  const STORAGE_BEST = "beadfall-best-floor";
  const ROSTER_CAP = 6;
  const STAR_CAP = 3;
  const BASE_SPINS = 5;

  const BEASTS = {
    shieldstone: {
      id: "shieldstone",
      name: "盾石",
      role: "tank",
      roleLabel: "盾戰士",
      atk: 8,
      def: 14,
      hp: 90,
      color: "#6ea8ff",
    },
    flamewolf: {
      id: "flamewolf",
      name: "焰狼",
      role: "berserk",
      roleLabel: "狂戰士",
      atk: 16,
      def: 6,
      hp: 70,
      color: "#ff7a4d",
    },
    tidecrow: {
      id: "tidecrow",
      name: "潮鴉",
      role: "mage",
      roleLabel: "法師",
      atk: 18,
      def: 4,
      hp: 55,
      color: "#7ad0ff",
    },
    leafdeer: {
      id: "leafdeer",
      name: "葉鹿",
      role: "healer",
      roleLabel: "補師",
      atk: 7,
      def: 7,
      hp: 65,
      color: "#7dff9a",
    },
    thunderhawk: {
      id: "thunderhawk",
      name: "雷鷲",
      role: "rare",
      roleLabel: "雷鷲",
      atk: 22,
      def: 8,
      hp: 80,
      color: "#c9a0ff",
    },
    spring: {
      id: "spring",
      name: "回復泉",
      role: "utility",
      roleLabel: "回復",
      atk: 0,
      def: 0,
      hp: 0,
      color: "#7ef0d8",
      utility: true,
    },
    shieldstone_e: {
      id: "shieldstone_e",
      name: "磐盾石",
      role: "tank",
      roleLabel: "盾戰士",
      atk: 12,
      def: 20,
      hp: 120,
      color: "#8fc0ff",
      elite: true,
    },
    flamewolf_e: {
      id: "flamewolf_e",
      name: "炎獄狼",
      role: "berserk",
      roleLabel: "狂戰士",
      atk: 24,
      def: 8,
      hp: 95,
      color: "#ff9468",
      elite: true,
    },
    tidecrow_e: {
      id: "tidecrow_e",
      name: "深潮鴉",
      role: "mage",
      roleLabel: "法師",
      atk: 28,
      def: 6,
      hp: 72,
      color: "#9ae0ff",
      elite: true,
    },
    leafdeer_e: {
      id: "leafdeer_e",
      name: "翠靈鹿",
      role: "healer",
      roleLabel: "補師",
      atk: 10,
      def: 10,
      hp: 88,
      color: "#9affb4",
      elite: true,
    },
    stormfalcon: {
      id: "stormfalcon",
      name: "嵐鷹",
      role: "rare",
      roleLabel: "嵐鷹",
      atk: 26,
      def: 10,
      hp: 95,
      color: "#e0b8ff",
      elite: true,
    },
  };

  const ELITE_MAP = {
    shieldstone: "shieldstone_e",
    flamewolf: "flamewolf_e",
    tidecrow: "tidecrow_e",
    leafdeer: "leafdeer_e",
    thunderhawk: "stormfalcon",
  };

  const ENEMY_POOL = [
    { id: "shadowrot", name: "影蝕", role: "berserk", atk: 12, def: 5, hp: 60, color: "#9a7bb8" },
    { id: "thornpig", name: "棘豬", role: "tank", atk: 10, def: 10, hp: 80, color: "#8fad6e" },
    { id: "ashbat", name: "灰蝠", role: "mage", atk: 14, def: 3, hp: 48, color: "#b89a7a" },
    { id: "miretoad", name: "沼蟾", role: "healer", atk: 8, def: 7, hp: 70, color: "#6e9a8a" },
  ];

  const BOSS = {
    id: "megarock",
    name: "巨岩",
    role: "tank",
    atk: 18,
    def: 16,
    hp: 160,
    color: "#c4b498",
  };

  const ROLE_ORDER = { tank: 0, berserk: 1, rare: 1, mage: 2, healer: 2, utility: 3 };

  function svgPortrait(color, role) {
    const shapes = {
      tank:
        `<rect x="18" y="14" width="28" height="34" rx="6" fill="${color}"/>` +
        `<rect x="14" y="20" width="10" height="22" rx="3" fill="#dce9ff"/>` +
        `<circle cx="32" cy="24" r="5" fill="#0b1020"/>`,
      berserk:
        `<ellipse cx="32" cy="34" rx="18" ry="16" fill="${color}"/>` +
        `<polygon points="18,18 24,8 28,20" fill="${color}"/>` +
        `<polygon points="46,18 40,8 36,20" fill="${color}"/>` +
        `<circle cx="26" cy="30" r="3" fill="#0b1020"/>` +
        `<circle cx="38" cy="30" r="3" fill="#0b1020"/>`,
      mage:
        `<path d="M32 10 L44 40 L20 40 Z" fill="${color}"/>` +
        `<circle cx="32" cy="28" r="6" fill="#eef8ff"/>` +
        `<path d="M28 44 h8 v8 h-8z" fill="${color}"/>`,
      healer:
        `<ellipse cx="32" cy="36" rx="16" ry="14" fill="${color}"/>` +
        `<path d="M22 22 C22 12 32 12 32 22 C32 12 42 12 42 22" fill="${color}"/>` +
        `<rect x="29" y="28" width="6" height="14" rx="2" fill="#0b1020"/>` +
        `<rect x="25" y="32" width="14" height="6" rx="2" fill="#0b1020"/>`,
      rare:
        `<polygon points="32,8 48,28 40,48 24,48 16,28" fill="${color}"/>` +
        `<circle cx="32" cy="30" r="8" fill="#1a1030"/>` +
        `<path d="M32 18 L36 28 L32 26 L28 28 Z" fill="#ffd56a"/>`,
      utility:
        `<circle cx="32" cy="32" r="18" fill="${color}"/>` +
        `<path d="M32 18 v28 M18 32 h28" stroke="#0b1020" stroke-width="5" stroke-linecap="round"/>` +
        `<circle cx="32" cy="32" r="7" fill="#eafff8"/>`,
    };
    const body = shapes[role] || shapes.berserk;
    return (
      `<svg class="icon sprite" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">` +
      body +
      `</svg>`
    );
  }

  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }

  function randInt(a, b) {
    return a + Math.floor(Math.random() * (b - a + 1));
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = a[i];
      a[i] = a[j];
      a[j] = tmp;
    }
    return a;
  }

  function starsText(n) {
    return "★".repeat(n) + "☆".repeat(STAR_CAP - n);
  }

  function loadBest() {
    const v = Number(localStorage.getItem(STORAGE_BEST) || "0");
    return Number.isFinite(v) && v > 0 ? v : 0;
  }

  function saveBest(floor) {
    const best = Math.max(loadBest(), floor);
    localStorage.setItem(STORAGE_BEST, String(best));
    return best;
  }

  function defaultWheel() {
    return [
      "shieldstone",
      "shieldstone",
      "flamewolf",
      "flamewolf",
      "tidecrow",
      "leafdeer",
      "thunderhawk",
      "spring",
    ];
  }

  const state = {
    floor: 1,
    spinsLeft: BASE_SPINS,
    spinsPerFloor: BASE_SPINS,
    wheel: defaultWheel(),
    roster: [],
    teamBuff: { atk: 0, def: 0, hp: 0 },
    phase: "recruit",
    best: loadBest(),
    busy: false,
    unitSeq: 1,
  };

  const el = {
    app: document.getElementById("app"),
    floor: document.getElementById("stat-floor"),
    spins: document.getElementById("stat-spins"),
    best: document.getElementById("stat-best"),
    hint: document.getElementById("hint"),
    wheel: document.getElementById("wheel"),
    bead: document.getElementById("bead"),
    fx: document.getElementById("fx-layer"),
    roster: document.getElementById("roster"),
    rosterCount: document.getElementById("roster-count"),
    recruit: document.getElementById("recruit-panel"),
    battle: document.getElementById("battle-panel"),
    battleBanner: document.getElementById("battle-banner"),
    playerSide: document.getElementById("player-side"),
    enemySide: document.getElementById("enemy-side"),
    battleLog: document.getElementById("battle-log"),
    btnSpin: document.getElementById("btn-spin"),
    btnDeploy: document.getElementById("btn-deploy"),
    modalReward: document.getElementById("modal-reward"),
    rewardChoices: document.getElementById("reward-choices"),
    modalOver: document.getElementById("modal-over"),
    overText: document.getElementById("over-text"),
    btnRestart: document.getElementById("btn-restart"),
    toast: document.getElementById("toast"),
  };

  let toastTimer = 0;

  function toast(msg) {
    el.toast.textContent = msg;
    el.toast.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      el.toast.hidden = true;
    }, 1600);
  }

  function scaledStats(def, star, floor, buff) {
    const starMul = 1 + (star - 1) * 0.55;
    const floorMul = 1 + (floor - 1) * 0.08;
    return {
      atk: Math.round(def.atk * starMul * floorMul + (buff && buff.atk ? buff.atk : 0)),
      def: Math.round(def.def * starMul * floorMul + (buff && buff.def ? buff.def : 0)),
      hp: Math.round(def.hp * starMul * floorMul + (buff && buff.hp ? buff.hp : 0)),
    };
  }

  function makeUnit(beastId, star) {
    const def = BEASTS[beastId];
    const s = scaledStats(def, star, state.floor, state.teamBuff);
    return {
      uid: "u" + state.unitSeq++,
      beastId: beastId,
      star: star,
      atk: s.atk,
      def: s.def,
      hp: s.hp,
      maxHp: s.hp,
    };
  }

  function healParty(pct) {
    if (!state.roster.length) {
      toast("名冊空空，回復泉無對象");
      return;
    }
    let healed = 0;
    for (let i = 0; i < state.roster.length; i += 1) {
      const u = state.roster[i];
      const before = u.hp;
      u.hp = clamp(u.hp + Math.round(u.maxHp * pct), 0, u.maxHp);
      healed += u.hp - before;
    }
    toast("隊伍回復 +" + healed + " HP");
  }

  function findMergeTarget(beastId, star) {
    for (let i = 0; i < state.roster.length; i += 1) {
      const u = state.roster[i];
      if (u.beastId === beastId && u.star === star) return i;
    }
    return -1;
  }

  function spawnBeast(beastId) {
    const def = BEASTS[beastId];
    if (!def) return;

    if (def.utility) {
      healParty(0.35);
      renderRoster();
      return;
    }

    let star = 1;
    let idx = findMergeTarget(beastId, star);
    if (idx >= 0) {
      while (idx >= 0 && star < STAR_CAP) {
        state.roster.splice(idx, 1);
        star += 1;
        idx = findMergeTarget(beastId, star);
      }
      if (star >= STAR_CAP && idx >= 0) {
        if (state.roster.length >= ROSTER_CAP) {
          healParty(0.2);
          toast(def.name + " 已滿星，轉為回復");
          renderRoster();
          return;
        }
      }
      const unit = makeUnit(beastId, Math.min(star, STAR_CAP));
      state.roster.push(unit);
      renderRoster(unit.uid, "merge");
      toast(def.name + " 合成 " + unit.star + "★！");
      return;
    }

    if (state.roster.length >= ROSTER_CAP) {
      healParty(0.25);
      toast("名冊已滿，轉為小回復");
      renderRoster();
      return;
    }

    const unit = makeUnit(beastId, 1);
    state.roster.push(unit);
    renderRoster(unit.uid, "pop");
    toast(def.name + " 加入名冊！");
  }

  function renderWheel() {
    const pockets = el.wheel.querySelectorAll(".pocket");
    for (let i = 0; i < pockets.length; i += 1) pockets[i].remove();

    const n = state.wheel.length;
    const step = 360 / n;
    for (let i = 0; i < n; i += 1) {
      const beastId = state.wheel[i];
      const def = BEASTS[beastId] || BEASTS.flamewolf;
      const ang = -90 + i * step + step / 2;
      const pocket = document.createElement("div");
      pocket.className = "pocket";
      pocket.style.setProperty("--ang", ang + "deg");
      pocket.dataset.index = String(i);
      pocket.innerHTML =
        svgPortrait(def.color, def.role) + '<span class="name">' + def.name + "</span>";
      el.wheel.appendChild(pocket);
    }
  }

  function renderRoster(flashUid, anim) {
    el.roster.innerHTML = "";
    for (let i = 0; i < ROSTER_CAP; i += 1) {
      const slot = document.createElement("div");
      const unit = state.roster[i];
      slot.className = "roster-slot" + (unit ? " filled" : "");
      if (unit) {
        const def = BEASTS[unit.beastId];
        slot.innerHTML =
          svgPortrait(def.color, def.role) +
          '<div class="stars">' +
          starsText(unit.star) +
          "</div>" +
          '<div class="nm">' +
          def.name +
          "</div>";
        if (flashUid && unit.uid === flashUid && anim) slot.classList.add(anim);
      }
      el.roster.appendChild(slot);
    }
    el.rosterCount.textContent = state.roster.length + " / " + ROSTER_CAP;
    updateButtons();
  }

  function updateHud() {
    el.floor.textContent = String(state.floor);
    el.spins.textContent = String(state.spinsLeft);
    el.best.textContent = String(Math.max(state.best, 0));
  }

  function updateButtons() {
    const canSpin = state.phase === "recruit" && !state.busy && state.spinsLeft > 0;
    const canDeploy = state.phase === "recruit" && !state.busy && state.roster.length > 0;
    el.btnSpin.disabled = !canSpin;
    el.btnDeploy.disabled = !canDeploy;
  }

  function setPhase(phase) {
    state.phase = phase;
    const battling = phase === "battle";
    el.app.classList.toggle("battling", battling);
    el.battle.hidden = !battling;
    el.recruit.hidden = battling;
    updateButtons();
  }

  function angleForIndex(index) {
    return index * (360 / state.wheel.length);
  }

  function animateBeadTo(index) {
    return new Promise(function (resolve) {
      const bead = el.bead;
      const base = angleForIndex(index);
      const spins = 4 + randInt(0, 2);
      const target = spins * 360 + base;
      const duration = 2200 + randInt(0, 600);
      const start = performance.now();

      bead.classList.add("spinning");

      function frame(now) {
        const t = clamp((now - start) / duration, 0, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        const ang = target * eased;
        bead.style.transform =
          "rotate(" + ang + "deg) translateY(calc(-1 * var(--bead-r)))";
        if (t < 1) {
          requestAnimationFrame(frame);
          return;
        }
        bead.classList.remove("spinning");
        const pocket = el.wheel.querySelector('.pocket[data-index="' + index + '"]');
        if (pocket) {
          pocket.classList.remove("glow");
          void pocket.offsetWidth;
          pocket.classList.add("glow");
        }
        const burst = document.createElement("div");
        burst.className = "pop-burst";
        const step = 360 / state.wheel.length;
        const pang = -90 + index * step + step / 2;
        burst.style.transform =
          "rotate(" + pang + "deg) translateY(calc(-1 * min(38vw, 148px)))";
        el.fx.appendChild(burst);
        setTimeout(function () {
          burst.remove();
        }, 600);
        resolve();
      }
      requestAnimationFrame(frame);
    });
  }

  async function doSpin() {
    if (state.busy || state.phase !== "recruit" || state.spinsLeft <= 0) return;
    state.busy = true;
    updateButtons();
    state.spinsLeft -= 1;
    updateHud();

    const index = randInt(0, state.wheel.length - 1);
    const beastId = state.wheel[index];
    await animateBeadTo(index);
    spawnBeast(beastId);
    state.busy = false;
    updateButtons();
    if (state.spinsLeft <= 0 && state.roster.length > 0) {
      toast("轉數用完，可以出陣");
    }
  }

  function formationSort(units) {
    return units.slice().sort(function (a, b) {
      const ra = ROLE_ORDER[a.role || (BEASTS[a.beastId] && BEASTS[a.beastId].role)] || 1;
      const rb = ROLE_ORDER[b.role || (BEASTS[b.beastId] && BEASTS[b.beastId].role)] || 1;
      return ra - rb;
    });
  }

  function enemyScale(base, floor, isBoss) {
    const mul = (1 + (floor - 1) * 0.12) * (isBoss ? 1.45 : 1);
    return {
      atk: Math.round(base.atk * mul),
      def: Math.round(base.def * mul),
      hp: Math.round(base.hp * mul * (isBoss ? 1.3 : 1)),
    };
  }

  function buildEnemies() {
    const isBoss = state.floor % 5 === 0;
    const count = isBoss ? 3 : clamp(2 + Math.floor((state.floor - 1) / 3), 2, 4);
    const list = [];
    if (isBoss) {
      const s = enemyScale(BOSS, state.floor, true);
      list.push({
        uid: "e-boss",
        beastId: BOSS.id,
        name: BOSS.name,
        role: BOSS.role,
        color: BOSS.color,
        star: 3,
        atk: s.atk,
        def: s.def,
        hp: s.hp,
        maxHp: s.hp,
        enemy: true,
      });
    }
    while (list.length < count) {
      const base = pick(ENEMY_POOL);
      const s = enemyScale(base, state.floor, false);
      list.push({
        uid: "e" + state.unitSeq++,
        beastId: base.id,
        name: base.name,
        role: base.role,
        color: base.color,
        star: clamp(1 + Math.floor(state.floor / 6), 1, 3),
        atk: s.atk,
        def: s.def,
        hp: s.hp,
        maxHp: s.hp,
        enemy: true,
      });
    }
    return list;
  }

  function laneBuckets(units) {
    const front = [];
    const mid = [];
    const back = [];
    for (let i = 0; i < units.length; i += 1) {
      const u = units[i];
      const role = u.role || (BEASTS[u.beastId] && BEASTS[u.beastId].role) || "berserk";
      if (role === "tank") front.push(u);
      else if (role === "mage" || role === "healer") back.push(u);
      else mid.push(u);
    }
    const lanes = [front, mid, back];
    for (let i = 0; i < 3; i += 1) {
      if (!lanes[i].length) {
        let donor = null;
        for (let j = 0; j < 3; j += 1) {
          if (lanes[j].length > 1) {
            donor = lanes[j];
            break;
          }
        }
        if (!donor) {
          for (let j = 0; j < 3; j += 1) {
            if (lanes[j].length) {
              donor = lanes[j];
              break;
            }
          }
        }
        if (donor && donor !== lanes[i]) lanes[i].push(donor.pop());
      }
    }
    return lanes;
  }

  function renderBattleSide(container, units, enemy) {
    container.innerHTML = "";
    const lanes = laneBuckets(units);
    for (let i = 0; i < lanes.length; i += 1) {
      const lane = document.createElement("div");
      lane.className = "lane";
      const laneUnits = lanes[i];
      for (let j = 0; j < laneUnits.length; j += 1) {
        const u = laneUnits[j];
        const node = document.createElement("div");
        node.className = "unit" + (enemy ? " enemy" : "");
        node.dataset.uid = u.uid;
        const name = u.name || (BEASTS[u.beastId] && BEASTS[u.beastId].name) || "?";
        const color = u.color || (BEASTS[u.beastId] && BEASTS[u.beastId].color) || "#aaa";
        const role = u.role || (BEASTS[u.beastId] && BEASTS[u.beastId].role) || "berserk";
        const pct = Math.round((u.hp / u.maxHp) * 100);
        node.innerHTML =
          svgPortrait(color, role) +
          '<div class="hpbar"><div class="hpfill" style="width:' +
          pct +
          '%"></div></div>' +
          '<div class="uname">' +
          name +
          "</div>" +
          '<div class="ustars">' +
          starsText(u.star || 1) +
          "</div>";
        lane.appendChild(node);
      }
      container.appendChild(lane);
    }
  }

  function updateUnitDom(u) {
    const node = document.querySelector('.unit[data-uid="' + u.uid + '"]');
    if (!node) return;
    const fill = node.querySelector(".hpfill");
    if (fill) fill.style.width = clamp((u.hp / u.maxHp) * 100, 0, 100) + "%";
    if (u.hp <= 0) node.classList.add("dead");
  }

  function flashUnit(uid, cls) {
    const node = document.querySelector('.unit[data-uid="' + uid + '"]');
    if (!node) return;
    node.classList.remove(cls);
    void node.offsetWidth;
    node.classList.add(cls);
    setTimeout(function () {
      node.classList.remove(cls);
    }, 300);
  }

  function alive(list) {
    return list.filter(function (u) {
      return u.hp > 0;
    });
  }

  function pickTarget(foes) {
    const live = alive(foes);
    if (!live.length) return null;
    const tanks = live.filter(function (u) {
      return (u.role || (BEASTS[u.beastId] && BEASTS[u.beastId].role)) === "tank";
    });
    if (tanks.length) return pick(tanks);
    return pick(live);
  }

  function calcDamage(atk, defn) {
    const raw = atk - defn * 0.45;
    return Math.max(1, Math.round(raw * (0.9 + Math.random() * 0.25)));
  }

  function sleep(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  async function runBattle() {
    if (state.busy || state.phase !== "recruit" || !state.roster.length) return;
    state.busy = true;
    updateButtons();
    setPhase("battle");

    const isBoss = state.floor % 5 === 0;
    el.battleBanner.textContent = isBoss
      ? "第 " + state.floor + " 層 · 首領戰"
      : "第 " + state.floor + " 層 · 交戰中";

    const players = state.roster.map(function (u) {
      const def = BEASTS[u.beastId];
      const s = scaledStats(def, u.star, state.floor, state.teamBuff);
      const hpRatio = u.maxHp > 0 ? u.hp / u.maxHp : 1;
      const maxHp = s.hp;
      const hp = clamp(Math.round(maxHp * hpRatio), 1, maxHp);
      return {
        uid: u.uid,
        beastId: u.beastId,
        star: u.star,
        atk: s.atk,
        def: s.def,
        maxHp: maxHp,
        hp: hp,
        name: def.name,
        role: def.role,
        color: def.color,
        enemy: false,
      };
    });

    const enemies = buildEnemies();
    renderBattleSide(el.playerSide, formationSort(players), false);
    renderBattleSide(el.enemySide, formationSort(enemies), true);
    el.battleLog.textContent = "開戰！";

    const start = performance.now();
    let tick = 0;

    while (alive(players).length && alive(enemies).length) {
      tick += 1;
      const side = tick % 2 === 1 ? players : enemies;
      const foes = tick % 2 === 1 ? enemies : players;
      const actors = shuffle(alive(side));

      for (let i = 0; i < actors.length; i += 1) {
        const actor = actors[i];
        if (actor.hp <= 0) continue;
        if (!alive(foes).length) break;

        const role = actor.role;
        if (role === "healer" && Math.random() < 0.55) {
          const allies = alive(side).filter(function (a) {
            return a.uid !== actor.uid;
          });
          const target = allies.length
            ? allies.sort(function (a, b) {
                return a.hp / a.maxHp - b.hp / b.maxHp;
              })[0]
            : actor;
          const heal = Math.round(actor.atk * 0.9 + 4);
          target.hp = clamp(target.hp + heal, 0, target.maxHp);
          flashUnit(actor.uid, "dash");
          updateUnitDom(target);
          el.battleLog.textContent = actor.name + " 為 " + target.name + " 回復 " + heal;
          await sleep(280);
          continue;
        }

        const target = pickTarget(foes);
        if (!target) break;
        flashUnit(actor.uid, "dash");
        await sleep(120);
        const dmg = calcDamage(actor.atk, target.def);
        target.hp = clamp(target.hp - dmg, 0, target.maxHp);
        flashUnit(target.uid, "hurt");
        updateUnitDom(target);
        el.battleLog.textContent = actor.name + " 對 " + target.name + " 造成 " + dmg;
        await sleep(220);
      }

      if (performance.now() - start > 18000) {
        for (let i = 0; i < enemies.length; i += 1) {
          const e = enemies[i];
          if (e.hp > 0) {
            e.hp = Math.max(0, e.hp - Math.round(e.maxHp * 0.35));
            updateUnitDom(e);
          }
        }
        for (let i = 0; i < players.length; i += 1) {
          const p = players[i];
          if (p.hp > 0) {
            p.hp = Math.max(0, p.hp - Math.round(p.maxHp * 0.2));
            updateUnitDom(p);
          }
        }
        if (performance.now() - start > 20000) break;
      }

      await sleep(180);
    }

    for (let i = 0; i < players.length; i += 1) {
      const p = players[i];
      for (let j = 0; j < state.roster.length; j += 1) {
        const r = state.roster[j];
        if (r.uid === p.uid) {
          r.hp = p.hp;
          r.maxHp = p.maxHp;
          r.atk = p.atk;
          r.def = p.def;
        }
      }
    }
    state.roster = state.roster.filter(function (u) {
      return u.hp > 0;
    });

    const won = alive(enemies).length === 0 && alive(players).length > 0;
    const lost = alive(players).length === 0;

    await sleep(500);

    if (won) {
      el.battleLog.textContent = "勝利！";
      await sleep(450);
      state.busy = false;
      showRewards();
      return;
    }
    if (lost) {
      el.battleLog.textContent = "全軍覆沒…";
      await sleep(450);
      endRun();
      return;
    }

    for (let i = 0; i < enemies.length; i += 1) enemies[i].hp = 0;
    el.battleLog.textContent = "險勝！";
    await sleep(400);
    state.busy = false;
    showRewards();
  }

  function trimWheel() {
    while (state.wheel.length > 12) {
      state.wheel.splice(randInt(0, state.wheel.length - 1), 1);
    }
    while (state.wheel.length < 8) {
      state.wheel.push(pick(["shieldstone", "flamewolf", "tidecrow", "leafdeer"]));
    }
  }

  function rewardPool() {
    const pool = [];

    pool.push({
      id: "spin-plus",
      title: "每層 +1 轉",
      desc: "本局每層轉數 +1（而家 " + state.spinsPerFloor + " → " + (state.spinsPerFloor + 1) + "）",
      apply: function () {
        state.spinsPerFloor += 1;
      },
    });

    pool.push({
      id: "dup-cell",
      title: "複製輪盤格",
      desc: "隨機複製一格到輪盤（較易再出）",
      apply: function () {
        state.wheel.push(pick(state.wheel));
        trimWheel();
      },
    });

    pool.push({
      id: "add-rare",
      title: "加入稀有：嵐鷹",
      desc: "輪盤新增一格較強嘅嵐鷹",
      apply: function () {
        state.wheel.push("stormfalcon");
        trimWheel();
      },
    });

    const upgradable = [];
    for (let i = 0; i < state.wheel.length; i += 1) {
      if (ELITE_MAP[state.wheel[i]]) upgradable.push({ id: state.wheel[i], i: i });
    }
    if (upgradable.length) {
      const choice = pick(upgradable);
      const from = BEASTS[choice.id];
      const to = BEASTS[ELITE_MAP[choice.id]];
      pool.push({
        id: "upgrade-cell",
        title: "進化：" + from.name + " → " + to.name,
        desc: "將輪盤上一格普通單位升成精英版",
        apply: function () {
          state.wheel[choice.i] = to.id;
        },
      });
    }

    pool.push({
      id: "add-thunder",
      title: "加入雷鷲格",
      desc: "輪盤再加一格雷鷲",
      apply: function () {
        state.wheel.push("thunderhawk");
        trimWheel();
      },
    });

    pool.push({
      id: "buff-atk",
      title: "隊伍攻擊強化",
      desc: "全隊 ATK +3（本局）",
      apply: function () {
        state.teamBuff.atk += 3;
        for (let i = 0; i < state.roster.length; i += 1) state.roster[i].atk += 3;
      },
    });

    pool.push({
      id: "buff-def",
      title: "隊伍護甲強化",
      desc: "全隊 DEF +3（本局）",
      apply: function () {
        state.teamBuff.def += 3;
        for (let i = 0; i < state.roster.length; i += 1) state.roster[i].def += 3;
      },
    });

    pool.push({
      id: "buff-hp",
      title: "隊伍生命強化",
      desc: "全隊最大 HP +12 並回復少少",
      apply: function () {
        state.teamBuff.hp += 12;
        for (let i = 0; i < state.roster.length; i += 1) {
          const u = state.roster[i];
          u.maxHp += 12;
          u.hp = clamp(u.hp + 12, 0, u.maxHp);
        }
      },
    });

    pool.push({
      id: "heal-now",
      title: "戰後急救",
      desc: "立刻回復全隊 40% HP",
      apply: function () {
        healParty(0.4);
      },
    });

    return pool;
  }

  function showRewards() {
    setPhase("reward");
    const picks = shuffle(rewardPool()).slice(0, 3);
    el.rewardChoices.innerHTML = "";
    for (let i = 0; i < picks.length; i += 1) {
      const r = picks[i];
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "reward-btn";
      btn.innerHTML = "<strong>" + r.title + "</strong><span>" + r.desc + "</span>";
      btn.addEventListener("click", function () {
        r.apply();
        el.modalReward.hidden = true;
        nextFloor();
      });
      el.rewardChoices.appendChild(btn);
    }
    el.modalReward.hidden = false;
  }

  function nextFloor() {
    state.floor += 1;
    state.spinsLeft = state.spinsPerFloor;
    state.best = saveBest(state.floor);
    for (let i = 0; i < state.roster.length; i += 1) {
      const u = state.roster[i];
      u.hp = clamp(u.hp + Math.round(u.maxHp * 0.15), 0, u.maxHp);
    }
    trimWheel();
    renderWheel();
    renderRoster();
    updateHud();
    setPhase("recruit");
    state.busy = false;
    el.hint.textContent =
      state.floor % 5 === 0 ? "首領層將至：轉夠再出陣！" : "轉珠出怪，合成變強，出陣打關";
    toast("進入第 " + state.floor + " 層");
  }

  function endRun() {
    state.best = saveBest(state.floor);
    updateHud();
    setPhase("over");
    state.busy = false;
    el.overText.textContent = "抵達第 " + state.floor + " 層 · 最佳 " + state.best + " 層";
    el.modalOver.hidden = false;
    el.modalReward.hidden = true;
  }

  function resetRun() {
    state.floor = 1;
    state.spinsPerFloor = BASE_SPINS;
    state.spinsLeft = BASE_SPINS;
    state.wheel = defaultWheel();
    state.roster = [];
    state.teamBuff = { atk: 0, def: 0, hp: 0 };
    state.busy = false;
    state.best = loadBest();
    el.modalOver.hidden = true;
    el.modalReward.hidden = true;
    el.hint.textContent = "轉珠出怪，合成變強，出陣打關";
    el.bead.style.transform = "rotate(0deg) translateY(calc(-1 * var(--bead-r)))";
    renderWheel();
    renderRoster();
    updateHud();
    setPhase("recruit");
  }

  el.btnSpin.addEventListener("click", function () {
    doSpin();
  });
  el.btnDeploy.addEventListener("click", function () {
    runBattle();
  });
  el.btnRestart.addEventListener("click", function () {
    resetRun();
  });

  window.BeadFall = {
    state: state,
    spawnBeast: spawnBeast,
    resetRun: resetRun,
    makeUnit: makeUnit,
    BEASTS: BEASTS,
    rewardPool: rewardPool,
    buildEnemies: buildEnemies,
    findMergeTarget: findMergeTarget,
    ROSTER_CAP: ROSTER_CAP,
    STAR_CAP: STAR_CAP,
    healParty: healParty,
    nextFloor: nextFloor,
    endRun: endRun,
    showRewards: showRewards,
    scaledStats: scaledStats,
    trimWheel: trimWheel,
    doSpin: doSpin,
    runBattle: runBattle,
  };

  renderWheel();
  renderRoster();
  updateHud();
  setPhase("recruit");
})();
