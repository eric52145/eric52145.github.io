(() => {
  "use strict";

  const START_CASH = 1000;
  const GOAL = 8000;
  const PRICE_MIN = 18;
  const PRICE_MAX = 420;
  const CONCENTRATION_CUT = 0.15;
  const UNLOCK_KEY = "tickerBeasts.unlocks";
  const PRE_CANDLES = 7;
  const HISTORY_MAX = 36;
  const PRICE_TICK_MS = 5000;
  const EVENT_MIN_MS = 30000;
  const EVENT_MAX_MS = 60000;
  const SESSION_MS = 20000;
  const WAVE_GAP_MS = 25000;
  const BATTLE_OPEN_MS = 1400;
  const BATTLE_STRIKE_MS = 900;
  const BATTLE_CRIT_MS = 1150;
  const BATTLE_HURT_MS = 1000;
  const TICKET_HOLD_MS = 3000;
  const CLOCK_MS = 250;
  const KLINE_W = 520;
  const KLINE_H = 180;
  const SECTOR_ORDER = ["科技", "飲食", "能源", "地產", "銀行", "醫療", "保險"];

  const STOCKS = [
    { id: "voltshark", name: "翠算", en: "Viridraw", ticker: "VDRW", sector: "科技", temperament: "急躁", job: "法師", role: "高爆發玻璃大炮，輸出高但身板薄。", price: 88, vol: 1.45, speed: 3, move: "綠光搶算", blurb: "坐唔定嘅綠色運算磚，螢光卡扇一轉、算力需求一旺就暴衝。職業係高爆發法師，輸出高但身板薄。" },
    { id: "glasscrit", name: "銀片", en: "Silversheet", ticker: "SVST", sector: "科技", temperament: "沉穩", job: "法師", role: "持續法術輸出，傷害穩、較少大起大落。", price: 126, vol: 0.74, speed: 1, move: "掌上薄璃", blurb: "沉穩嘅銀色薄璃手板，靠新品同軟件慢慢疊力。職業係持續輸出法師，少見大起大落。" },
    { id: "brothbeast", name: "樂堂", en: "Joycanteen", ticker: "JCTN", sector: "飲食", temperament: "穩陣", job: "補給", role: "輸出穩定，每回合為隊友提供少量補給。", price: 120, vol: 0.72, speed: 1, move: "出餐轉檯", blurb: "街坊食堂式出餐獸，橙托盤轉檯快、客路穩。職業係補給，輸出穩，會為隊友提供少量補給，但唔及牧師回血。" },
    { id: "nectartide", name: "黃窗", en: "Amberwin", ticker: "AMWN", sector: "飲食", temperament: "跟風", job: "遊俠", role: "宣傳或升勢期間加快攻擊。", price: 94, vol: 1.42, speed: 3, move: "窗燈出堡", blurb: "琥珀窗燈一亮就出盒裝堡同薯條，優惠一浪接一浪。職業係遊俠，宣傳期會加快輸出。" },
    { id: "flarewhale", name: "閃駒", en: "Flashcourser", ticker: "FLCR", sector: "能源", temperament: "衝動", job: "狂戰士", role: "打得猛，行情一轉就大幅擺動。", price: 136, vol: 1.35, speed: 3, move: "閃轍出閘", blurb: "性急嘅閃轍跑車，電動熱潮一到就衝出閘。職業係狂戰士，打得猛，行情一轉就大幅擺動。" },
    { id: "hubspire", name: "城電", en: "Metrolamp", ticker: "MTLP", sector: "能源", temperament: "沉實", job: "狂戰士", role: "中線穩定輸出，身板較厚。", price: 112, vol: 0.7, speed: 1, move: "全城穩壓", blurb: "撐住全城供電嘅穩壓獸，少有暴利，勝在捱得。職業係中線狂戰士，輸出穩定。" },
    { id: "cloudao", name: "埠廈", en: "Pierhold", ticker: "PRHD", sector: "地產", temperament: "保守", job: "守城", role: "高生命、受傷較少的守城單位。", price: 154, vol: 0.8, speed: 1, move: "長約收租", blurb: "守住海港碼頭同寫字樓嘅保守收租獸，租約長、步子慢。職業係守城，身板厚、受傷較少。" },
    { id: "sandspire", name: "盤門", en: "Estategate", ticker: "ETGT", sector: "地產", temperament: "投機", job: "守城", role: "旺市身板厚，跌市變得脆弱。", price: 91, vol: 1.4, speed: 3, move: "開盤搶籌", blurb: "售樓大廳開閘搶籌嘅投機沙盤，開盤一熱就扯上，信貸一緊就可以塌。職業係高風險守城，跌市時會變得好脆。" },
    { id: "goldhorn", name: "洋庫", en: "Merivault", ticker: "MRVT", sector: "銀行", temperament: "審慎", job: "騎士", role: "為隊友加上薄護盾。", price: 100, vol: 0.95, speed: 2, move: "兩岸庫門", blurb: "謹慎嘅舊式雙岸金庫大廳，靠穩陣生意抵禦風浪。職業係騎士，會為隊友加上薄護盾。" },
    { id: "leverhorn", name: "旺生", en: "Thrivewell", ticker: "THWL", sector: "銀行", temperament: "進取", job: "控制", role: "升勢或高息時打得更重。", price: 82, vol: 1.33, speed: 3, move: "高息招存", blurb: "以高息招徠存款嘅進取零售庫，存摺向上揚。職業係控制，高息勢頭向上時打得更重。" },
    { id: "grovehall", name: "雙護", en: "Twinsoothe", ticker: "TNSO", sector: "醫療", temperament: "穩守", job: "牧師", role: "每回合為未倒下的隊友回血。", price: 118, vol: 0.76, speed: 1, move: "施劑護脈", blurb: "穩守嘅雙瓶成藥診療獸，靠門診同家用藥慢慢養倉。職業係牧師，持倉期間會為場上未倒下嘅隊友回血。" },
    { id: "wardplate", name: "鎧院", en: "Wardplate", ticker: "WDPL", sector: "醫療", temperament: "剛毅", job: "聖騎士", role: "高生命並嘲諷敵方，可抵擋並為隊友加上薄護盾。", price: 109, vol: 0.84, speed: 2, move: "披甲守院", blurb: "披甲守院嘅醫療聖騎士，身板厚、容易吸火。職業係聖騎士，可抵擋傷害並為隊友加上薄護盾（增益）。" },
    { id: "safecanopy", name: "寰傘", en: "Aegiscanopy", ticker: "AGCP", sector: "保險", temperament: "穩健", job: "守護", role: "在場時減輕隊友所受傷害。", price: 134, vol: 0.76, speed: 1, move: "長約撐傘", blurb: "為整座城撐起長約保護傘嘅穩健壽險獸。職業係守護，在場時可減輕隊友所受傷害。", unlock: "insurance" },
    { id: "calamtide", name: "楓庭", en: "Maplegrove", ticker: "MPGR", sector: "保險", temperament: "緊張", job: "守護", role: "偏坦，波動大時攻擊抽高。", price: 97, vol: 1.38, speed: 3, move: "門市拉保", blurb: "門市拉保、案量一高就大幅擺動嘅庭院保險獸。職業係守護偏坦，波動大時輸出會突然抽高。", unlock: "insurance" },
  ];

  const HEAL_RATIO = 0.12;
  const SUPPLY_RATIO = 0.03;
  const MAX_TEAM_ARMOR = 0.35;

  const COMBAT_TRAITS = {
    voltshark: { hp: 0.75, atk: 0.34, armor: 0, teamArmor: 0, taunt: 0, heal: 0, supply: 0, shield: 0, tag: "burst" },
    glasscrit: { hp: 0.9, atk: 0.26, armor: 0, teamArmor: 0, taunt: 0, heal: 0, supply: 0, shield: 0, tag: "sustained" },
    brothbeast: { hp: 1.05, atk: 0.2, armor: 0, teamArmor: 0, taunt: 0, heal: 0, supply: 0.03, shield: 0, tag: "supply" },
    nectartide: { hp: 0.95, atk: 0.22, armor: 0, teamArmor: 0, taunt: 0, heal: 0, supply: 0, shield: 0, tag: "ranger" },
    flarewhale: { hp: 0.85, atk: 0.3, armor: 0, teamArmor: 0, taunt: 0, heal: 0, supply: 0, shield: 0, tag: "berserk" },
    hubspire: { hp: 1.15, atk: 0.22, armor: 0, teamArmor: 0, taunt: 0, heal: 0, supply: 0, shield: 0, tag: "bruiser" },
    cloudao: { hp: 1.4, atk: 0.16, armor: 0.2, teamArmor: 0, taunt: 0, heal: 0, supply: 0, shield: 0, tag: "fort" },
    sandspire: { hp: 1.3, atk: 0.22, armor: 0, teamArmor: 0, taunt: 0, heal: 0, supply: 0, shield: 0, tag: "speculative" },
    goldhorn: { hp: 1.15, atk: 0.18, armor: 0, teamArmor: 0, taunt: 0, heal: 0, supply: 0, shield: 0.1, tag: "protector" },
    leverhorn: { hp: 0.95, atk: 0.24, armor: 0, teamArmor: 0, taunt: 0, heal: 0, supply: 0, shield: 0, tag: "striker" },
    safecanopy: { hp: 1.15, atk: 0.17, armor: 0, teamArmor: 0.1, taunt: 0, heal: 0, supply: 0, shield: 0, tag: "canopy" },
    calamtide: { hp: 1.25, atk: 0.2, armor: 0.06, teamArmor: 0, taunt: 0, heal: 0, supply: 0, shield: 0, tag: "offtank" },
    grovehall: { hp: 1.0, atk: 0.16, armor: 0, teamArmor: 0, taunt: 0, heal: 0.12, supply: 0, shield: 0, tag: "healer" },
    wardplate: { hp: 1.5, atk: 0.18, armor: 0.15, teamArmor: 0.05, taunt: 0.7, heal: 0, supply: 0, shield: 0.08, tag: "paladin" },
  };

  function traitsOf(s) {
    return (s && COMBAT_TRAITS[s.id]) || { hp: 1, atk: 0.22, armor: 0, teamArmor: 0, taunt: 0, heal: 0, supply: 0, shield: 0, tag: "basic" };
  }

  function atkFactor(s, t) {
    const ch = s && s.change ? s.change : 0;
    let f = t.atk;
    if (t.tag === "ranger" && ch > 0.0005) f *= 1.2;
    if (t.tag === "berserk") f *= ch > 0.0005 ? 1.25 : ch < -0.0005 ? 0.9 : 1;
    if (t.tag === "striker" && ch > 0.0005) f *= 1.28;
    if (t.tag === "offtank" && Math.abs(ch) >= 0.08) f *= 1.25;
    if (t.tag === "sustained") f *= 1.05;
    return f;
  }

  function hpFactor(s, t) {
    const ch = s && s.change ? s.change : 0;
    if (t.tag === "speculative" && ch < -0.0005) return Math.max(0.8, t.hp * 0.72);
    return t.hp;
  }

  function combatProfile(s, power) {
    const t = traitsOf(s);
    const p = Math.max(0, Math.round(Number(power) || 0));
    const fx = currentSynergyEffects();
    const b = state.runBuffs || {};
    let hpMul = hpFactor(s, t) * (fx.hp || 1);
    if (b.priceWard && s && s.change < -0.0005) hpMul *= 1.12;
    let atkMul = atkFactor(s, t);
    if (s && s.job === "法師") atkMul *= fx.burst || 1;
    if ((s && (s.job === "狂戰士" || s.job === "控制")) && s.change > 0.0005) atkMul *= fx.surge || 1;
    let taunt = t.taunt || 0;
    if (b.tauntUp && taunt > 0) taunt = Math.min(0.95, taunt * 1.35);
    const maxHp = Math.max(1, Math.round(p * hpMul));
    const atk = Math.max(18, Math.round(p * atkMul));
    return {
      job: (s && s.job) || "",
      role: (s && s.role) || "",
      maxHp,
      atk,
      armor: t.armor || 0,
      teamArmor: (t.teamArmor || 0) + (b.teamArmor || 0) + (fx.armor || 0),
      taunt,
      heal: t.heal || 0,
      supply: t.supply || 0,
      shieldRatio: t.shield || 0,
      tag: t.tag,
    };
  }

  function isBuildPhase(phase) {
    return phase === "build";
  }

  function isMarketFrozen(phase, marketLive) {
    return phase === "build" || phase === "start" || !marketLive;
  }

  function shouldMarketRun(opts) {
    const o = opts || {};
    if (o.clockPaused) return false;
    if (o.phase === "start" || o.phase === "end" || o.phase === "build") return false;
    return !!o.marketLive;
  }

  function canConfirmOpenMarket(opts) {
    const o = opts || {};
    return o.phase === "build" && !!o.hasHoldings;
  }

  function planConfirmOpenMarket(opts) {
    const o = opts || {};
    if (o.phase !== "build") {
      return { ok: false, disabled: true, startMarket: false, startWave: false, phase: o.phase, marketLive: !!o.marketLive };
    }
    if (!o.hasHoldings) {
      return { ok: false, disabled: true, startMarket: false, startWave: false, phase: "build", marketLive: false };
    }
    return { ok: true, disabled: false, startMarket: true, startWave: true, phase: "gap", marketLive: true };
  }

  function canBeginWave(opts) {
    const o = opts || {};
    if (o.phase !== "gap" || o.waveBusy) return false;
    if (!o.hasHoldings) return false;
    if (o.wave === 1) return !!o.marketLive;
    if (o.force) return true;
    const now = o.now || 0;
    if (now < (o.nextWaveAt || 0)) return false;
    if (o.midTicket) return false;
    return true;
  }

  function applyDeathWipe(stock, realizedDay) {
    const shares = (stock && stock.shares) || 0;
    if (!stock || shares <= 0) {
      const cleared = stock ? { ...stock, shares: 0, avgCost: 0, costBasis: 0 } : stock;
      return { stock: cleared, realizedDay: realizedDay || 0, shares: 0, realizedVsCost: 0, realizedVsOpen: 0, note: stock ? stock.name + " 陣亡清倉" : "陣亡清倉" };
    }
    const price = stock.price;
    const dayOpen = stock.dayOpen != null ? stock.dayOpen : price;
    const avg = stock.avgCost || 0;
    return {
      stock: { ...stock, shares: 0, avgCost: 0, costBasis: 0 },
      realizedDay: (realizedDay || 0) + (price - dayOpen) * shares,
      shares,
      realizedVsCost: (price - avg) * shares,
      realizedVsOpen: (price - dayOpen) * shares,
      note: stock.name + " 陣亡清倉",
    };
  }

  function splitPool(pool, n) {
    const out = [];
    let left = Math.max(0, Math.round(pool));
    for (let i = 0; i < n; i += 1) {
      const amt = i === n - 1 ? left : Math.floor(left / (n - i));
      left -= amt;
      out.push(amt);
    }
    return out;
  }

  function livingCombatants(units) {
    return (units || []).filter((u) => u && u.hp > 0 && !u.wiped);
  }

  function applyHealToLiving(players, sources, ratioKey, powerFn) {
    const living = livingCombatants(players);
    const events = [];
    if (!living.length) return events;
    for (const src of sources || []) {
      if (!src || (src.shares || 0) <= 0) continue;
      const t = traitsOf(src);
      const ratio = ratioKey === "supply" ? (t.supply || 0) : (t.heal || 0);
      const scale = (arguments[4] && arguments[4][ratioKey === "supply" ? "supply" : "heal"]) || 1;
      const used = ratio * scale;
      if (used <= 0) continue;
      const power = powerFn ? powerFn(src) : Math.round((src.shares || 0) * (src.price || 0));
      const parts = splitPool(power * used, living.length);
      living.forEach((u, i) => {
        const amt = parts[i] || 0;
        if (amt <= 0 || u.hp <= 0 || u.wiped) return;
        const healed = Math.min(amt, Math.max(0, (u.maxHp || 0) - u.hp));
        if (healed <= 0) return;
        u.hp += healed;
        events.push({ type: ratioKey === "supply" ? "supply" : "heal", source: src.name, job: src.job, target: u.name, unitId: u.id, amount: healed });
      });
    }
    return events;
  }

  function applyShieldToLiving(players, sources, powerFn) {
    const living = livingCombatants(players);
    const events = [];
    if (!living.length) return events;
    for (const src of sources || []) {
      if (!src || (src.shares || 0) <= 0) continue;
      const t = traitsOf(src);
      if (!t.shield) continue;
      const scale = (arguments[3] && arguments[3].shield) || 1;
      const power = powerFn ? powerFn(src) : Math.round((src.shares || 0) * (src.price || 0));
      const parts = splitPool(power * t.shield * scale, living.length);
      living.forEach((u, i) => {
        const amt = parts[i] || 0;
        if (amt <= 0 || u.hp <= 0 || u.wiped) return;
        u.shield = (u.shield || 0) + amt;
        events.push({ type: "shield", source: src.name, job: src.job, target: u.name, unitId: u.id, amount: amt });
      });
    }
    return events;
  }

  function teamArmorOf(players, fallbackStocks) {
    let cut = 0;
    const units = livingCombatants(players);
    if (units.length) {
      for (const u of units) cut += u.teamArmor || 0;
    } else {
      for (const s of fallbackStocks || []) {
        if ((s.shares || 0) > 0) cut += traitsOf(s).teamArmor || 0;
      }
    }
    return Math.min(MAX_TEAM_ARMOR, cut);
  }

  function incomingCut(target, players, stocks) {
    let cut = (target && target.armor) || 0;
    const ch = target && target.change ? target.change : 0;
    if (target && target.tag === "speculative" && ch < -0.0005) cut -= 0.2;
    if (target && target.tag === "berserk" && ch < -0.0005) cut -= 0.08;
    if (state.runBuffs && state.runBuffs.priceWard && ch < -0.0005) cut += 0.08;
    cut += teamArmorOf(players, stocks);
    return Math.max(-0.15, Math.min(MAX_TEAM_ARMOR, cut));
  }

  function applyIncomingDamage(target, rawDmg, players, stocks, opts) {
    let cut = incomingCut(target, players, stocks);
    if (opts && opts.heavy && state.runBuffs && state.runBuffs.bossResist) cut = Math.min(MAX_TEAM_ARMOR, cut + 0.18);
    let dmg = Math.max(1, Math.round((rawDmg || 0) * (1 - cut)));
    let blocked = 0;
    let absorbed = 0;
    if ((target.shield || 0) > 0 && dmg > 0) {
      blocked = Math.min(target.shield, dmg);
      target.shield -= blocked;
      dmg -= blocked;
    }
    if (cut > 0 && rawDmg > dmg + blocked) absorbed = Math.round(rawDmg - dmg - blocked);
    target.hp = Math.max(0, (target.hp || 0) - dmg);
    return { dmg, blocked, absorbed, cut, killed: target.hp <= 0 };
  }

  function supportLog(events) {
    if (!events || !events.length) return "";
    const heals = events.filter((e) => e.type === "heal");
    const supplies = events.filter((e) => e.type === "supply");
    const shields = events.filter((e) => e.type === "shield");
    const bits = [];
    const pack = (list, verb) => {
      if (!list.length) return;
      const bySrc = {};
      for (const e of list) {
        const key = (e.job ? e.job + "·" : "") + e.source;
        bySrc[key] = (bySrc[key] || 0) + e.amount;
      }
      bits.push(Object.keys(bySrc).map((k) => k + " " + verb + " +" + bySrc[k]).join("，"));
    };
    pack(heals, "回血");
    pack(supplies, "補給");
    pack(shields, "護盾");
    return bits.join("；");
  }

  const EVENTS = [
    { headline: "科技股齊升", tone: "good", impacts: { 科技: [0.14, 0.24], 銀行: [0.02, 0.06], 地產: [-0.03, 0.03], 飲食: [0, 0.04], 能源: [-0.05, 0.03], 醫療: [0, 0.05], 保險: [0, 0.04] } },
    { headline: "晶片訂單爆滿", tone: "good", impacts: { 科技: [0.16, 0.26], 能源: [0.02, 0.08], 銀行: [0, 0.04] } },
    { headline: "科技泡沫憂慮", tone: "bad", impacts: { 科技: [-0.22, -0.12], 銀行: [-0.08, -0.02], 地產: [-0.06, 0.02] } },
    { headline: "伺服器農莊失火", tone: "bad", impacts: { 科技: [-0.18, -0.08], 能源: [0.04, 0.1] } },
    { headline: "油價急跌", tone: "bad", impacts: { 能源: [-0.24, -0.14], 飲食: [0.03, 0.09], 科技: [0.02, 0.07], 地產: [0, 0.04] } },
    { headline: "能源暴升", tone: "good", impacts: { 能源: [0.16, 0.26], 地產: [-0.06, 0], 飲食: [-0.07, -0.01], 銀行: [0, 0.05] } },
    { headline: "油田突然停產", tone: "good", impacts: { 能源: [0.14, 0.24], 科技: [-0.04, 0.04], 飲食: [-0.06, 0] } },
    { headline: "銀行利好", tone: "good", impacts: { 銀行: [0.12, 0.2], 地產: [0.04, 0.1], 科技: [-0.03, 0.03] } },
    { headline: "息口突然上調", tone: "mixed", impacts: { 銀行: [0.08, 0.16], 地產: [-0.18, -0.1], 科技: [-0.12, -0.04], 飲食: [-0.06, 0.02], 醫療: [-0.04, 0.04], 保險: [0.02, 0.1] } },
    { headline: "信貸收縮", tone: "bad", impacts: { 銀行: [-0.14, -0.06], 地產: [-0.16, -0.08], 科技: [-0.08, 0], 醫療: [-0.06, 0], 保險: [-0.08, 0] } },
    { headline: "飲食股穩步上揚", tone: "good", impacts: { 飲食: [0.1, 0.17], 地產: [0.01, 0.05], 銀行: [0, 0.04] } },
    { headline: "食材成本急升", tone: "bad", impacts: { 飲食: [-0.16, -0.08], 能源: [0.04, 0.1], 科技: [-0.02, 0.03] } },
    { headline: "夜市人潮爆滿", tone: "good", impacts: { 飲食: [0.14, 0.22], 地產: [0.03, 0.09] } },
    { headline: "地產寒潮", tone: "bad", impacts: { 地產: [-0.2, -0.12], 銀行: [-0.1, -0.04], 飲食: [-0.04, 0.02] } },
    { headline: "樓市回暖", tone: "good", impacts: { 地產: [0.12, 0.2], 銀行: [0.04, 0.1], 能源: [0, 0.05] } },
    { headline: "大市齊升", tone: "good", impacts: { 科技: [0.08, 0.14], 飲食: [0.07, 0.13], 能源: [0.07, 0.13], 地產: [0.07, 0.13], 銀行: [0.07, 0.13], 醫療: [0.07, 0.13], 保險: [0.07, 0.13] } },
    { headline: "沽空潮來襲", tone: "bad", impacts: { 科技: [-0.16, -0.08], 飲食: [-0.1, -0.04], 能源: [-0.16, -0.08], 地產: [-0.14, -0.06], 銀行: [-0.12, -0.06], 醫療: [-0.12, -0.06], 保險: [-0.12, -0.06] } },
    { headline: "電網負荷創新高", tone: "good", impacts: { 能源: [0.1, 0.18], 科技: [0.05, 0.12] } },
    { headline: "遊客湧至", tone: "good", impacts: { 飲食: [0.1, 0.18], 地產: [0.06, 0.12], 銀行: [0.02, 0.07] } },
    { headline: "風暴吹襲沿岸", tone: "bad", impacts: { 能源: [0.06, 0.14], 地產: [-0.12, -0.05], 飲食: [-0.1, -0.03], 保險: [-0.16, -0.06] } },
    { headline: "新品發布", tone: "good", late: true, special: "launch" },
    { headline: "原材料缺貨", tone: "bad", late: true, special: "shortage" },
    { headline: "加息陰霾再起", tone: "mixed", late: true, impacts: { 銀行: [0.06, 0.14], 地產: [-0.16, -0.08], 科技: [-0.12, -0.04], 飲食: [-0.06, 0.02], 醫療: [-0.04, 0.04], 保險: [0.02, 0.1], 能源: [-0.04, 0.04] } },
    { headline: "大型索償潮", tone: "bad", unlock: "insurance", impacts: { 保險: [-0.22, -0.12], 銀行: [-0.08, -0.02], 地產: [-0.06, 0.02], 飲食: [0, 0.04] } },
    { headline: "保費上調獲批", tone: "good", unlock: "insurance", impacts: { 保險: [0.14, 0.24], 銀行: [0.02, 0.08], 飲食: [-0.04, 0.02], 地產: [0, 0.04], 醫療: [0, 0.04] } },
    { headline: "臨牀數據向好", tone: "good", impacts: { 醫療: [0.14, 0.24], 科技: [0.02, 0.08], 保險: [-0.04, 0.04] } },
    { headline: "試藥結果落空", tone: "bad", impacts: { 醫療: [-0.2, -0.1], 銀行: [-0.04, 0.02], 科技: [-0.03, 0.02] } },
  ];

  const MILD_EVENTS = ["科技股齊升", "飲食股穩步上揚", "銀行利好", "樓市回暖", "夜市人潮爆滿", "電網負荷創新高", "遊客湧至", "晶片訂單爆滿", "臨牀數據向好"];
  const HARSH_EVENTS = ["沽空潮來襲", "科技泡沫憂慮", "地產寒潮", "信貸收縮", "油價急跌"];

  const MINOR_EVENTS = [
    { headline: "午後交投淡靜", tone: "mixed", minor: true, impacts: { 科技: [-0.03, 0.03], 飲食: [-0.02, 0.03], 能源: [-0.03, 0.03], 地產: [-0.02, 0.03], 銀行: [-0.02, 0.03], 醫療: [-0.02, 0.03], 保險: [-0.02, 0.03] } },
    { headline: "短線獲利回吐", tone: "bad", minor: true, impacts: { 科技: [-0.06, -0.01], 飲食: [-0.04, 0.01], 能源: [-0.05, 0], 地產: [-0.04, 0.01], 銀行: [-0.03, 0.01], 醫療: [-0.04, 0], 保險: [-0.03, 0.01] } },
    { headline: "淡倉回補", tone: "good", minor: true, impacts: { 科技: [0.01, 0.06], 飲食: [0, 0.04], 能源: [0.01, 0.05], 地產: [0, 0.04], 銀行: [0, 0.04], 醫療: [0, 0.04], 保險: [0, 0.03] } },
    { headline: "板塊輪動", tone: "mixed", minor: true, special: "rotation" },
    { headline: "夜盤買盤零星", tone: "good", minor: true, impacts: { 科技: [0, 0.05], 飲食: [0, 0.04], 能源: [-0.02, 0.03], 地產: [0, 0.03], 銀行: [0, 0.03], 醫療: [0, 0.03], 保險: [0, 0.03] } },
    { headline: "消息面平淡", tone: "mixed", minor: true, impacts: { 科技: [-0.02, 0.02], 飲食: [-0.02, 0.02], 能源: [-0.02, 0.02], 地產: [-0.02, 0.02], 銀行: [-0.02, 0.02], 醫療: [-0.02, 0.02], 保險: [-0.02, 0.02] } },
  ];

  const $ = (id) => document.getElementById(id);

  const state = {
    cash: START_CASH,
    wave: 1,
    phase: "start",
    stocks: [],
    lastHeadline: "",
    lastTemplate: "",
    lastBook: 0,
    muted: false,
    runOver: false,
    lastHoldingSet: null,
    concentrationActive: false,
    detailId: null,
    hoverIndex: null,
    clockId: 0,
    clockPaused: true,
    nextTickAt: 0,
    nextEventAt: 0,
    nextSessionAt: 0,
    nextWaveAt: 0,
    firstEventPending: true,
    sessionIndex: 0,
    lastTone: "good",
    fight: null,
    waveBusy: false,
    ticketId: null,
    ticketQty: 1,
    realizedDay: 0,
    marketLive: false,
    waitBookLogged: false,
    lastWipeNote: null,
    startCash: START_CASH,
    rotation: null,
    floorsCleared: 0,
    bossesCleared: [],
    runBuffs: { taken: [] },
    wealthContinued: false,
    wealthOffered: false,
    phoneTab: "quotes",
    didAutoArena: false,
    fatalDeath: false,
    ticketTouchedAt: 0,
    ticketPointer: false,
  };

  function memoryStore() {
    const d = {};
    return {
      getItem: (k) => (Object.prototype.hasOwnProperty.call(d, k) ? d[k] : null),
      setItem: (k, v) => { d[k] = String(v); },
      removeItem: (k) => { delete d[k]; },
    };
  }

  function storage(store) {
    if (store) return store;
    try {
      if (typeof localStorage !== "undefined") return localStorage;
    } catch (e) {}
    return memoryStore();
  }

  const WEALTH_GOAL = 8000;
  const META_KEY = "tickerBeasts.meta";
  const ROTATION_STRONG = 0.2;
  const ROTATION_WEAK = 0.15;
  const MAX_ACTIVE_SYNERGIES = 2;

  const SYNERGY_DEFS = [
    { id: "healpal", jobs: ["牧師", "聖騎士"], title: "聖愈連攜", line: "牧師＋聖騎士：額外隊盾" },
    { id: "dualmage", jobs: ["法師"], count: 2, title: "雙法齊轟", line: "兩名法師：疊加爆發" },
    { id: "fortknight", jobs: ["守城", "騎士"], title: "城門聯防", line: "守城＋騎士：全隊更坦" },
    { id: "berserkctrl", jobs: ["狂戰士", "控制"], title: "追擊連攜", line: "狂戰士＋控制：升勢加傷" },
  ];

  const RUN_BUFF_POOL = [
    { id: "healAmp", name: "藥效加深", line: "牧師回血效果提高 35%。", tag: "core" },
    { id: "shieldAmp", name: "盾壁加厚", line: "護盾效果提高 35%。", tag: "core" },
    { id: "synAmp", name: "連攜共鳴", line: "已觸發嘅職業連攜效果更強。", tag: "core" },
    { id: "gapCash", name: "空隙撥備", line: "下一圈空隙到帳 $250 準備金。", tag: "core", cashNextGap: 250 },
    { id: "concCut", name: "分散紀律", line: "過度集中懲罰減半。", tag: "core" },
    { id: "rotResist", name: "輪動抗性", line: "受壓板塊罰則大幅減輕。", tag: "core" },
    { id: "upPower", name: "趁勢加碼", line: "股價向上時戰力額外提高。", tag: "core" },
    { id: "tauntUp", name: "護院加深", line: "聖騎士嘲諷更強，更容易吸火。", tag: "core" },
    { id: "openHeal", name: "開場包紮", line: "每浪開打為未倒下隊友回復少量生命。", tag: "core" },
    { id: "teamArmor", name: "集體護甲", line: "全隊受傷再減一成。", tag: "core" },
    { id: "bossResist", name: "抗壓訓練", line: "對 Boss 重擊減傷。", tag: "extra" },
    { id: "priceWard", name: "跌市穩陣", line: "跌市時身板更穩。", tag: "extra" },
  ];

  const META_SHOP = [
    { id: "startCash", name: "多備資金", cost: 1, line: "開局資金改為 $1,200。" },
    { id: "openHeal", name: "開場療傷", cost: 1, line: "每局開打時，全體未倒下隊友少量回血。" },
    { id: "synBoost", name: "連攜增幅", cost: 2, line: "職業連攜效果加強。" },
    { id: "moreBuffs", name: "祝福庫擴充", cost: 2, line: "Boss 三選一加入更多選項。" },
    { id: "rotPassive", name: "板塊適應", cost: 2, line: "受壓板塊罰則永久略減。" },
  ];

  function defaultMeta() {
    return { bestFloor: 0, wins: 0, wealthWins: 0, bosses: {}, points: 0, purchased: {}, insurance: false };
  }

  function getMeta(store) {
    const base = defaultMeta();
    try {
      const raw = storage(store).getItem(META_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data && typeof data === "object") {
          base.bestFloor = Math.max(0, Number(data.bestFloor) || 0);
          base.wins = Math.max(0, Number(data.wins) || 0);
          base.wealthWins = Math.max(0, Number(data.wealthWins) || 0);
          base.points = Math.max(0, Number(data.points) || 0);
          base.insurance = !!data.insurance;
          base.bosses = data.bosses && typeof data.bosses === "object" ? { ...data.bosses } : {};
          base.purchased = data.purchased && typeof data.purchased === "object" ? { ...data.purchased } : {};
        }
      }
    } catch (e) {}
    try {
      const raw = storage(store).getItem(UNLOCK_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data && data.insurance) base.insurance = true;
      }
    } catch (e) {}
    return base;
  }

  function setMeta(meta, store) {
    const next = Object.assign(defaultMeta(), meta || {});
    next.purchased = Object.assign({}, next.purchased);
    next.bosses = Object.assign({}, next.bosses);
    storage(store).setItem(META_KEY, JSON.stringify(next));
    storage(store).setItem(UNLOCK_KEY, JSON.stringify({ insurance: !!next.insurance }));
    return next;
  }

  function startCashOf(meta) {
    const m = meta || getMeta();
    return START_CASH + (m.purchased && m.purchased.startCash ? 200 : 0);
  }

  function buyMetaUnlock(id, store) {
    const meta = getMeta(store);
    const item = META_SHOP.find((x) => x.id === id);
    if (!item || (meta.purchased && meta.purchased[id]) || meta.points < item.cost) {
      return { ok: false, meta };
    }
    meta.points -= item.cost;
    meta.purchased[id] = true;
    setMeta(meta, store);
    return { ok: true, meta };
  }

  function seedRunBuffsFromMeta(meta) {
    const b = emptyRunBuffs();
    const p = (meta && meta.purchased) || {};
    if (p.openHeal) b.metaOpenHeal = true;
    if (p.synBoost) b.metaSynBoost = 1.2;
    if (p.rotPassive) b.rotPassive = true;
    return b;
  }

  function isMidTicket() {
    if (state.ticketPointer) return true;
    const qty = $("ticket-qty");
    if (qty && typeof document !== "undefined" && document.activeElement === qty) return true;
    if (state.ticketTouchedAt && Date.now() - state.ticketTouchedAt < TICKET_HOLD_MS) return true;
    return false;
  }

  function touchTicket() {
    state.ticketTouchedAt = Date.now();
  }

  function grantRunMeta(result, store) {
    const prev = getMeta(store);
    const meta = Object.assign(defaultMeta(), prev, {
      purchased: Object.assign({}, prev.purchased),
      bosses: Object.assign({}, prev.bosses),
    });
    const notes = [];
    const floors = Math.max(0, (result && result.floorsCleared) || 0);
    if (floors > meta.bestFloor) {
      meta.points += 1;
      meta.bestFloor = floors;
      notes.push("新層數紀錄：第 " + floors + " 層。");
    }
    const bosses = (result && result.bossesCleared) || [];
    for (let i = 0; i < bosses.length; i += 1) {
      const w = bosses[i];
      if (!meta.bosses[w]) {
        meta.bosses[w] = true;
        meta.points += 1;
        notes.push("首次通過第 " + w + " 層 Boss。");
      }
    }
    const kind = result && result.kind;
    if (kind === "wealth" || kind === "goal") {
      meta.wins += 1;
      meta.wealthWins += 1;
      meta.points += 2;
      notes.push("達成大目標勝出。");
    }
    if ((kind === "wealth" || kind === "goal" || floors >= 10) && !meta.insurance) {
      meta.insurance = true;
      notes.push("解鎖保險板塊。");
    }
    setMeta(meta, store);
    return { meta, notes, prev };
  }

  function bossKind(wave) {
    const w = Number(wave) || 0;
    if (w > 0 && w % 10 === 0) return "major";
    if (w > 0 && w % 5 === 0) return "minor";
    return null;
  }

  function isBossWave(wave) {
    return !!bossKind(wave);
  }

  function enemyBudgetFor(wave) {
    const w = Math.max(1, Number(wave) || 1);
    let budget = Math.round(500 + w * 210 + Math.pow(w, 1.22) * 48);
    const kind = bossKind(w);
    if (kind === "minor") budget = Math.round(budget * 1.35);
    if (kind === "major") budget = Math.round(budget * 1.7);
    return budget;
  }

  function rotationSectorList(unlocks) {
    const u = unlocks || {};
    return SECTOR_ORDER.filter((s) => s !== "保險" || u.insurance);
  }

  function rollRotation(prev, sectors, rnd) {
    const r = rnd || Math.random;
    const list = (sectors || []).filter(Boolean);
    if (list.length < 2) return null;
    let strong = list[0];
    let weak = list[1];
    let n = 0;
    do {
      strong = list[Math.floor(r() * list.length)];
      const others = list.filter((s) => s !== strong);
      weak = others[Math.floor(r() * others.length)];
      n += 1;
    } while (prev && prev.strong === strong && prev.weak === weak && n < 12);
    const duration = r() < 0.5 ? 1 : 2;
    return { strong, weak, remaining: duration, duration };
  }

  function sectorModifier(sector, rotation, opts) {
    if (!rotation || !sector) return 1;
    const resist = !!(opts && opts.resist);
    if (sector === rotation.strong) return 1 + ROTATION_STRONG;
    if (sector === rotation.weak) return 1 - (resist ? ROTATION_WEAK * 0.4 : ROTATION_WEAK);
    return 1;
  }

  function rotationText(rot) {
    if (!rot || !rot.strong || !rot.weak) return "";
    const left = Math.max(1, rot.remaining || 1);
    return "主場 " + rot.strong + "　受壓 " + rot.weak + "　（仲有 " + left + " 浪）";
  }

  function jobCounts(list) {
    const c = {};
    for (const x of list || []) {
      const j = x && x.job;
      if (!j) continue;
      if (x.wiped || (x.hp != null && x.hp <= 0 && x.shares == null)) continue;
      if (x.shares != null && x.shares <= 0) continue;
      c[j] = (c[j] || 0) + 1;
    }
    return c;
  }

  function synergyMatches(def, counts) {
    if (def.jobs.length === 1) return (counts[def.jobs[0]] || 0) >= (def.count || 2);
    return def.jobs.every((j) => (counts[j] || 0) >= 1);
  }

  function activeSynergies(list, maxSlots) {
    const counts = jobCounts(list);
    const found = [];
    const cap = maxSlots == null ? MAX_ACTIVE_SYNERGIES : maxSlots;
    for (const def of SYNERGY_DEFS) {
      if (synergyMatches(def, counts)) found.push({ id: def.id, title: def.title, line: def.line, jobs: def.jobs.slice() });
    }
    return found.slice(0, cap);
  }

  function synergyEffects(synergies, buffs) {
    const amp = ((buffs && buffs.synAmp) || 1) * ((buffs && buffs.metaSynBoost) || 1);
    const fx = { shield: 0, burst: 1, armor: 0, hp: 1, surge: 1 };
    for (const s of synergies || []) {
      if (s.id === "healpal") fx.shield += 0.08 * amp;
      if (s.id === "dualmage") fx.burst *= 1 + 0.2 * amp;
      if (s.id === "fortknight") {
        fx.armor += 0.08 * amp;
        fx.hp *= 1 + 0.1 * amp;
      }
      if (s.id === "berserkctrl") fx.surge *= 1 + 0.15 * amp;
    }
    return fx;
  }

  function availableRunBuffs(owned, meta) {
    const have = new Set(owned || []);
    const extra = !!(meta && meta.purchased && meta.purchased.moreBuffs);
    return RUN_BUFF_POOL.filter((b) => !have.has(b.id) && (b.tag !== "extra" || extra));
  }

  function pickBossRewards(owned, meta, n, rnd) {
    const pool = availableRunBuffs(owned, meta).slice();
    const r = rnd || Math.random;
    const out = [];
    const count = Math.min(n || 3, pool.length);
    while (out.length < count && pool.length) {
      const i = Math.floor(r() * pool.length);
      out.push(pool.splice(i, 1)[0]);
    }
    return out;
  }

  function applyRunBuff(buffs, item) {
    const b = Object.assign({ taken: [] }, buffs || {});
    if (!item) return b;
    if (item.id === "healAmp") b.healAmp = (b.healAmp || 1) * 1.35;
    if (item.id === "shieldAmp") b.shieldAmp = (b.shieldAmp || 1) * 1.35;
    if (item.id === "synAmp") b.synAmp = (b.synAmp || 1) * 1.3;
    if (item.id === "concCut") b.concCut = true;
    if (item.id === "rotResist") b.rotResist = true;
    if (item.id === "upPower") b.upPower = true;
    if (item.id === "tauntUp") b.tauntUp = true;
    if (item.id === "openHeal") b.openHeal = true;
    if (item.id === "teamArmor") b.teamArmor = (b.teamArmor || 0) + 0.1;
    if (item.id === "bossResist") b.bossResist = true;
    if (item.id === "priceWard") b.priceWard = true;
    if (item.cashNextGap) b.cashNextGap = (b.cashNextGap || 0) + item.cashNextGap;
    b.taken = (b.taken || []).concat(item.id);
    return b;
  }

  function runOutcomeAfterDeath(opts) {
    const o = opts || {};
    let livingCount;
    if (typeof o.livingAllies === "number") livingCount = Math.max(0, o.livingAllies);
    else livingCount = livingCombatants(o.units || o.players || []).length;
    const floorsCleared = Math.max(0, o.floorsCleared || 0);
    if (livingCount > 0) {
      return {
        end: false,
        kind: "wipe",
        floorsCleared,
        mustRelist: false,
        canContinue: true,
      };
    }
    return {
      end: true,
      kind: "wipeout",
      floorsCleared,
      mustRelist: true,
      canContinue: false,
    };
  }

  function canAffordNextRound(opts) {
    const o = opts || {};
    const stocks = o.stocks || [];
    const cash = o.cash || 0;
    const prices = stocks.map((s) => Number(s.price) || 0).filter((p) => p > 0);
    const floor = prices.length ? Math.min.apply(null, prices) : Infinity;
    const held = stocks.some((s) => (s.shares || 0) > 0);
    return cash >= floor || held;
  }

  function runOutcomeAfterBankruptcy(opts) {
    const o = opts || {};
    const floorsCleared = Math.max(0, o.floorsCleared || 0);
    if (canAffordNextRound(o)) {
      return { end: false, kind: null, floorsCleared, mustRelist: false, canContinue: true };
    }
    return { end: true, kind: "bust", floorsCleared, mustRelist: true, canContinue: false };
  }

  function shouldOfferWealthWin(opts) {
    const o = opts || {};
    return (o.wealth || 0) >= (o.goal || WEALTH_GOAL) && !o.wealthContinued && !o.wealthOffered;
  }

  function emptyRunBuffs() {
    return { taken: [] };
  }


  function getUnlocks(store) {
    const meta = getMeta(store);
    return { insurance: !!meta.insurance };
  }

  function setUnlocks(unlocks, store) {
    const meta = getMeta(store);
    meta.insurance = !!(unlocks && unlocks.insurance);
    setMeta(meta, store);
  }

  function grantVictoryUnlock(store) {
    const prev = getUnlocks(store);
    const first = !prev.insurance;
    const meta = getMeta(store);
    meta.insurance = true;
    setMeta(meta, store);
    return { first, unlocks: { insurance: true } };
  }

  function visibleStocks(unlocks) {
    const u = unlocks || getUnlocks();
    return STOCKS.filter((s) => !s.unlock || u[s.unlock]);
  }

  function seededRand(seed) {
    let s = seed % 2147483646;
    if (s <= 0) s += 2147483646;
    return () => {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  function hashId(id) {
    let h = 2166136261;
    for (let i = 0; i < String(id).length; i++) {
      h = Math.imul(h ^ String(id).charCodeAt(i), 16777619);
    }
    return (h >>> 0) || 1;
  }

  function clampPrice(n) {
    return Math.round(Math.max(PRICE_MIN, Math.min(PRICE_MAX, n)));
  }

  function makeCandle(open, close, vol, rnd) {
    const r = rnd || Math.random;
    const o = clampPrice(open);
    const c = clampPrice(close);
    const body = Math.abs(c - o);
    const pad = Math.max(2, body * 0.4 + Math.abs(o) * 0.012 * (vol || 1) * (0.6 + r()));
    let high = Math.max(o, c) + r() * pad;
    let low = Math.min(o, c) - r() * pad;
    high = clampPrice(Math.max(high, o, c));
    low = clampPrice(Math.min(low, o, c));
    return { o, h: high, l: low, c };
  }

  function seedHistory(stock, count) {
    const n = count == null ? PRE_CANDLES : count;
    const rnd = seededRand(hashId(stock.id));
    const closes = [stock.price];
    let px = stock.price;
    for (let i = 0; i < n; i++) {
      const swing = (rnd() - 0.48) * 0.08 * stock.vol;
      px = clampPrice(px / (1 + swing));
      closes.unshift(px);
    }
    const candles = [];
    for (let i = 1; i < closes.length; i++) {
      const candle = makeCandle(closes[i - 1], closes[i], stock.vol, rnd);
      const left = n - i + 1;
      candle.label = "前" + left;
      candles.push(candle);
    }
    if (candles.length) {
      candles[candles.length - 1].c = clampPrice(stock.price);
      if (candles[candles.length - 1].h < candles[candles.length - 1].c) {
        candles[candles.length - 1].h = candles[candles.length - 1].c;
      }
      if (candles[candles.length - 1].l > candles[candles.length - 1].c) {
        candles[candles.length - 1].l = candles[candles.length - 1].c;
      }
      candles[candles.length - 1].label = "開市前";
    }
    return candles;
  }

  function appendCandle(stock, wave) {
    const candle = makeCandle(stock.prevPrice, stock.price, stock.vol);
    candle.label = "第" + wave + "浪";
    stock.history = (stock.history || []).concat(candle);
    if (stock.history.length > HISTORY_MAX) stock.history = stock.history.slice(-HISTORY_MAX);
    return candle;
  }

  function openForming(stock) {
    const px = stock.price;
    stock.forming = { o: px, h: px, l: px, c: px, label: "即市" };
    return stock.forming;
  }

  function applyTickToForming(stock) {
    if (!stock.forming) openForming(stock);
    const px = stock.price;
    stock.forming.c = px;
    stock.forming.h = Math.max(stock.forming.h, px);
    stock.forming.l = Math.min(stock.forming.l, px);
    return stock.forming;
  }

  function closeFormingSession(stock, label) {
    if (!stock.forming) openForming(stock);
    applyTickToForming(stock);
    const f = stock.forming;
    const candle = {
      o: f.o,
      h: Math.max(f.h, f.o, f.c),
      l: Math.min(f.l, f.o, f.c),
      c: f.c,
      label: label || f.label || "節",
    };
    stock.history = (stock.history || []).concat(candle);
    if (stock.history.length > HISTORY_MAX) stock.history = stock.history.slice(-HISTORY_MAX);
    openForming(stock);
    return candle;
  }

  function chartHistory(stock) {
    const list = (stock.history || []).slice();
    if (stock.forming) list.push({ ...stock.forming, live: true, label: stock.forming.label || "即市" });
    return list;
  }

  function newStocks(unlocks) {
    return visibleStocks(unlocks).map((s) => ({
      ...s,
      prevPrice: s.price,
      change: 0,
      shares: 0,
      history: seedHistory(s),
      avgCost: 0,
      costBasis: 0,
      dayOpen: s.price,
    }));
  }

  function money(n) {
    const sign = n < 0 ? "-" : "";
    return sign + "$" + Math.abs(Math.round(n)).toLocaleString("en-US");
  }

  function pct(n) {
    const v = n * 100;
    return (v >= 0 ? "+" : "") + v.toFixed(1) + "%";
  }

  function moneySigned(n) {
    const v = Math.round(n);
    if (v === 0) return "$0";
    return (v > 0 ? "+" : "-") + "$" + Math.abs(v).toLocaleString("en-US");
  }

  function positionMetrics(s) {
    const shares = s.shares || 0;
    const avg = s.avgCost || 0;
    const last = s.price;
    const value = shares * last;
    const cost = shares * avg;
    const unreal = value - cost;
    const unrealPct = cost ? unreal / cost : 0;
    const dayOpen = s.dayOpen != null ? s.dayOpen : last;
    const dayUnreal = shares * (last - dayOpen);
    return { shares, avg, last, value, cost, unreal, unrealPct, dayOpen, dayUnreal };
  }

  function portfolioPnL(stocks, cash, startCash, realizedDay) {
    const held = (stocks || []).filter((s) => s.shares > 0);
    const metrics = held.map(positionMetrics);
    const value = metrics.reduce((a, p) => a + p.value, 0);
    const unreal = metrics.reduce((a, p) => a + p.unreal, 0);
    const dayMtm = metrics.reduce((a, p) => a + p.dayUnreal, 0) + (realizedDay || 0);
    const equity = (cash || 0) + value;
    const total = equity - (startCash || 0);
    return { value, unreal, dayMtm, equity, cash: cash || 0, total, positions: metrics };
  }

  function applyBuy(stock, cash, qty) {
    qty = Math.max(0, Math.floor(Number(qty) || 0));
    const price = stock.price;
    const max = price > 0 ? Math.floor(cash / price) : 0;
    qty = Math.min(qty, max);
    if (qty <= 0) return { stock, cash, qty: 0 };
    const spent = qty * price;
    const shares = (stock.shares || 0) + qty;
    const costBasis = (stock.costBasis || 0) + spent;
    return {
      stock: { ...stock, shares, costBasis, avgCost: costBasis / shares },
      cash: cash - spent,
      qty,
    };
  }

  function applySell(stock, cash, qty, realizedDay) {
    qty = Math.max(0, Math.min(Math.floor(Number(qty) || 0), stock.shares || 0));
    if (qty <= 0) return { stock, cash, qty: 0, realizedDay: realizedDay || 0 };
    const dayOpen = stock.dayOpen != null ? stock.dayOpen : stock.price;
    const realized = (realizedDay || 0) + (stock.price - dayOpen) * qty;
    const proceeds = qty * stock.price;
    const shares = stock.shares - qty;
    const avgCost = shares ? (stock.avgCost || 0) : 0;
    return {
      stock: { ...stock, shares, avgCost, costBasis: avgCost * shares },
      cash: cash + proceeds,
      qty,
      realizedDay: realized,
    };
  }

  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  function rand(a, b) {
    return a + Math.random() * (b - a);
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function portfolioValue() {
    return state.stocks.reduce((sum, s) => sum + s.shares * s.price, 0);
  }

  function wealth() {
    return state.cash + portfolioValue();
  }

  function concentratedPower(raw, active, cut) {
    const n = Math.round(raw);
    if (!active) return n;
    const c = cut == null ? CONCENTRATION_CUT : cut;
    return Math.round(n * (1 - c));
  }

  function currentSynergies() {
    const list = (state.fight && state.phase === "battle")
      ? (state.fight.players || [])
      : (state.stocks || []).filter((s) => (s.shares || 0) > 0);
    return activeSynergies(list, MAX_ACTIVE_SYNERGIES);
  }

  function currentSynergyEffects() {
    return synergyEffects(currentSynergies(), state.runBuffs || {});
  }

  function rotationResistOn() {
    const b = state.runBuffs || {};
    return !!(b.rotResist || b.rotPassive);
  }

  function powerOf(s) {
    if (!s || s.shares <= 0) return 0;
    let raw = s.shares * s.price;
    raw *= sectorModifier(s.sector, state.rotation, { resist: rotationResistOn() });
    if (state.runBuffs && state.runBuffs.upPower && s.change > 0.0005) raw *= 1.12;
    const cut = state.runBuffs && state.runBuffs.concCut ? CONCENTRATION_CUT * 0.5 : CONCENTRATION_CUT;
    return concentratedPower(raw, state.concentrationActive, cut);
  }

  function rawTeamPower() {
    return state.stocks.reduce((sum, s) => sum + (s.shares > 0 ? Math.round(s.shares * s.price) : 0), 0);
  }

  function totalPower() {
    return state.stocks.reduce((sum, s) => sum + powerOf(s), 0);
  }

  function cheapest() {
    return Math.min(...state.stocks.map((s) => s.price));
  }

  function hasHoldings() {
    return state.stocks.some((s) => s.shares > 0);
  }

  function canAffordAnything() {
    return canAffordNextRound({ cash: state.cash, stocks: state.stocks });
  }

  function canTrade() {
    return state.phase === "gap" || state.phase === "battle" || state.phase === "build" || state.phase === "reward" || state.phase === "choice";
  }

  function changeClass(ch) {
    return ch > 0.0005 ? "up" : ch < -0.0005 ? "down" : "flat";
  }

  function chgText(s) {
    return Math.abs(s.change) < 0.0005 ? (state.sessionIndex || state.lastHeadline ? "平" : "—") : pct(s.change);
  }

  function stockEnLine(s) {
    return (s.ticker ? s.ticker + " · " : "") + s.en;
  }

  function insurancePairText() {
    return STOCKS.filter((s) => s.unlock === "insurance")
      .map((s) => s.name + "（" + s.ticker + " · " + s.temperament + "）")
      .join("同");
  }

  function holdingSetKey(stocks) {
    return (stocks || [])
      .filter((s) => s.shares > 0)
      .map((s) => s.id)
      .sort()
      .join("|");
  }

  function shouldPenalize(wave, lastSet, currentSet) {
    if (wave <= 1) return false;
    if (!lastSet || !currentSet) return false;
    return lastSet === currentSet;
  }

  function willConcentrate() {
    return shouldPenalize(state.wave, state.lastHoldingSet, holdingSetKey(state.stocks));
  }

  function activeSectors(stocks) {
    const list = [];
    const seen = new Set();
    for (const s of stocks || []) {
      if (!seen.has(s.sector)) {
        seen.add(s.sector);
        list.push(s.sector);
      }
    }
    return list.length ? list : SECTOR_ORDER.filter((sec) => sec !== "保險");
  }

  function resolveSpecialEvent(event, stocks, pickFn) {
    if (!event || !event.special) return event;
    const sectors = activeSectors(stocks);
    const chooser = pickFn || pick;
    const target = chooser(sectors);
    const impacts = {};
    if (event.special === "launch") {
      for (const sec of sectors) {
        impacts[sec] = sec === target ? [0.16, 0.26] : [0.02, 0.08];
      }
      return { ...event, headline: "新品發布·" + target + "股爆升", impacts, targetSector: target };
    }
    if (event.special === "shortage") {
      for (const sec of sectors) {
        impacts[sec] = sec === target ? [-0.24, -0.14] : [-0.06, 0.04];
      }
      return { ...event, headline: "原材料缺貨·" + target + "股受壓", impacts, targetSector: target };
    }
    if (event.special === "rotation") {
      const other = chooser(sectors.filter((sec) => sec !== target).length ? sectors.filter((sec) => sec !== target) : sectors);
      for (const sec of sectors) {
        if (sec === target) impacts[sec] = [0.06, 0.12];
        else if (sec === other) impacts[sec] = [-0.1, -0.04];
        else impacts[sec] = [-0.03, 0.03];
      }
      return { ...event, headline: "板塊輪動·" + target + "強、" + other + "弱", impacts, targetSector: target };
    }
    return event;
  }

  function portrait(id) {
    const svg = PORTRAITS[id] || PORTRAITS.bearshort;
    return `<div class="portrait" aria-hidden="true">${svg}</div>`;
  }

    const PORTRAITS = {
    voltshark: `<svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg"><rect width="160" height="160" fill="#04160c"/><g stroke="#0a4a28" stroke-width="1" opacity=".45"><path d="M0 40h160M0 80h160M0 120h160M40 0v160M80 0v160M120 0v160"/></g><rect x="14" y="36" width="132" height="88" rx="7" fill="#0a3a20" stroke="#7cff6a" stroke-width="2.5"/><path d="M22 52h26M22 62h16M128 52h-22M128 64h-14" stroke="#1f7a44" stroke-width="1.6" fill="none"/><g fill="#062414" stroke="#9aff7a" stroke-width="2"><circle cx="50" cy="80" r="22"/><circle cx="98" cy="80" r="22"/></g><g fill="#7cff6a"><path d="M50 80l7-15 5 3zM50 80l15 7-3 5zM50 80l-7 15-5-3zM50 80l-15-7 3-5zM50 80l12 12-5 3zM50 80l-12-12 5-3z"/><path d="M98 80l7-15 5 3zM98 80l15 7-3 5zM98 80l-7 15-5-3zM98 80l-15-7 3-5zM98 80l12 12-5 3zM98 80l-12-12 5-3z"/></g><circle cx="50" cy="80" r="5" fill="#d8ff9a"/><circle cx="98" cy="80" r="5" fill="#d8ff9a"/><rect x="122" y="48" width="16" height="20" rx="2" fill="#7cff6a"/><rect x="124" y="74" width="12" height="12" rx="1.5" fill="#b8ff6a"/><rect x="22" y="126" width="116" height="12" fill="#c9a227"/><g fill="#3a2a08"><rect x="26" y="128" width="3" height="8"/><rect x="32" y="128" width="3" height="8"/><rect x="38" y="128" width="3" height="8"/><rect x="44" y="128" width="3" height="8"/><rect x="50" y="128" width="3" height="8"/><rect x="56" y="128" width="3" height="8"/><rect x="62" y="128" width="3" height="8"/><rect x="68" y="128" width="3" height="8"/><rect x="74" y="128" width="3" height="8"/><rect x="80" y="128" width="3" height="8"/><rect x="86" y="128" width="3" height="8"/><rect x="92" y="128" width="3" height="8"/><rect x="98" y="128" width="3" height="8"/><rect x="104" y="128" width="3" height="8"/><rect x="110" y="128" width="3" height="8"/><rect x="116" y="128" width="3" height="8"/><rect x="122" y="128" width="3" height="8"/><rect x="128" y="128" width="3" height="8"/></g></svg>`,
    glasscrit: `<svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg"><rect width="160" height="160" fill="#1a1c20"/><rect x="38" y="16" width="84" height="128" rx="16" fill="#c8ced6" stroke="#8a929c" stroke-width="2"/><rect x="44" y="26" width="72" height="104" rx="8" fill="#16181c"/><path d="M48 30h50" stroke="#3a4048" stroke-width="3" opacity=".7"/><rect x="48" y="22" width="28" height="16" rx="5" fill="#b4bac2"/><circle cx="56" cy="30" r="4.2" fill="#2a3038" stroke="#d8dee6" stroke-width="1"/><circle cx="66" cy="30" r="3.4" fill="#2a3038" stroke="#d8dee6" stroke-width="1"/><circle cx="75" cy="30" r="2.4" fill="#dfe6b8"/><path d="M52 40h56l-8 70H60z" fill="#2a3340" opacity=".35"/><rect x="66" y="128" width="28" height="4" rx="2" fill="#8a9098"/></svg>`,
    brothbeast: `<svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg"><rect width="160" height="160" fill="#3a2214"/><rect x="0" y="96" width="160" height="64" fill="#5a3820"/><rect x="8" y="20" width="144" height="70" fill="#6a4030" stroke="#2a160c" stroke-width="2"/><g fill="#1a1008"><rect x="16" y="28" width="36" height="28"/><rect x="62" y="28" width="36" height="28"/><rect x="108" y="28" width="36" height="28"/></g><g fill="#e8893a" stroke="#7a3a10" stroke-width="1.5"><rect x="18" y="72" width="34" height="10" rx="2"/><rect x="64" y="72" width="34" height="10" rx="2"/><rect x="110" y="72" width="34" height="10" rx="2"/></g><g fill="#f0c14b"><circle cx="30" cy="76" r="3"/><circle cx="42" cy="76" r="3"/><rect x="72" y="74" width="10" height="6" rx="1"/><circle cx="126" cy="76" r="3"/></g><ellipse cx="40" cy="128" rx="22" ry="8" fill="#c47838"/><ellipse cx="120" cy="132" rx="22" ry="8" fill="#c47838"/><rect x="8" y="88" width="144" height="8" fill="#2a160c"/><g fill="none" stroke="#f4e0c0" stroke-width="1.6" opacity=".8"><path d="M30 54c0-8 6-10 6-16"/><path d="M76 54c2-8 8-9 6-16"/><path d="M124 54c0-7 7-11 5-16"/></g></svg>`,
    nectartide: `<svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg"><rect width="160" height="160" fill="#2a1808"/><rect x="18" y="18" width="124" height="88" fill="#5a2e10" stroke="#f3c14a" stroke-width="4"/><rect x="28" y="28" width="104" height="68" fill="#f3c14a"/><g fill="#ffe9a0"><rect x="34" y="34" width="14" height="16"/><rect x="54" y="34" width="14" height="16"/><rect x="74" y="34" width="14" height="16"/><rect x="94" y="34" width="14" height="16"/><rect x="114" y="34" width="14" height="16"/></g><ellipse cx="80" cy="128" rx="36" ry="8" fill="#6a3a14"/><rect x="48" y="116" width="64" height="8" rx="2" fill="#d8b060"/><ellipse cx="80" cy="104" rx="22" ry="10" fill="#c47828"/><rect x="62" y="86" width="36" height="16" rx="4" fill="#f0c14b"/><circle cx="70" cy="80" r="5" fill="#3a2010"/><circle cx="90" cy="80" r="5" fill="#3a2010"/><rect x="72" y="108" width="6" height="10" fill="#e8d080"/><rect x="82" y="108" width="6" height="10" fill="#e8d080"/></svg>`,
    flarewhale: `<svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg"><rect width="160" height="160" fill="#101820"/><path d="M20 96c18-28 44-40 70-40 18 0 34 6 48 16l10 24H28z" fill="#c8d0d8" stroke="#3a4450" stroke-width="2"/><path d="M42 64c18-8 40-10 58-4" fill="none" stroke="#8ab4d0" stroke-width="3"/><circle cx="48" cy="108" r="14" fill="#1a1a1a" stroke="#ffe45a" stroke-width="3"/><circle cx="118" cy="108" r="14" fill="#1a1a1a" stroke="#ffe45a" stroke-width="3"/><circle cx="48" cy="108" r="5" fill="#888"/><circle cx="118" cy="108" r="5" fill="#888"/><path d="M86 18l-8 28h16l-12 28 28-32h-16z" fill="#ffe45a" stroke="#f0c14b" stroke-width="1.5"/><path d="M28 100h18" stroke="#3ad0e0" stroke-width="3"/><rect x="14" y="98" width="12" height="6" rx="1" fill="#3ad0e0"/><path d="M22 140h116" stroke="#3a4450" stroke-width="4"/></svg>`,
    hubspire: `<svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg"><rect width="160" height="160" fill="#142028"/><path d="M0 120h160v40H0z" fill="#1c2a30"/><g fill="#3a4a52"><rect x="10" y="96" width="16" height="24"/><rect x="30" y="88" width="14" height="32"/><rect x="118" y="92" width="18" height="28"/><rect x="138" y="100" width="12" height="20"/></g><g fill="#c8d0d4" stroke="#6a7880" stroke-width="1"><path d="M46 128L58 36h8l12 92z"/><path d="M94 128L106 40h8l12 88z"/></g><path d="M62 44h48M58 70h56M54 96h60" stroke="#f0c14b" stroke-width="2" fill="none"/><circle cx="80" cy="28" r="6" fill="#ffe45a"/><rect x="72" y="116" width="16" height="16" fill="#f0c14b"/></svg>`,
    cloudao: `<svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg"><rect width="160" height="160" fill="#1c2830"/><path d="M0 108h160v52H0z" fill="#2a4a58"/><path d="M0 108c18 8 36-6 54 2 20 8 34-8 52 0 16 8 32-4 54 2v48H0z" fill="#3a6a78"/><g fill="#6a5a40"><rect x="8" y="100" width="8" height="28"/><rect x="24" y="100" width="8" height="28"/><rect x="40" y="100" width="8" height="28"/></g><rect x="70" y="24" width="52" height="96" fill="#c8b894" stroke="#5a4a30" stroke-width="2"/><g fill="#3a4a58"><rect x="78" y="34" width="10" height="10"/><rect x="94" y="34" width="10" height="10"/><rect x="110" y="34" width="8" height="10"/><rect x="78" y="50" width="10" height="10"/><rect x="94" y="50" width="10" height="10"/><rect x="110" y="50" width="8" height="10"/><rect x="78" y="66" width="10" height="10"/><rect x="94" y="66" width="10" height="10"/></g><path d="M58 70h16v28H62l-4-8z" fill="#f0c14b" stroke="#8a7018" stroke-width="1.5"/><circle cx="66" cy="82" r="3" fill="#3a2a08"/></svg>`,
    sandspire: `<svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg"><rect width="160" height="160" fill="#3a2a18"/><rect x="10" y="70" width="140" height="70" fill="#e8d2a0" stroke="#8a6a30" stroke-width="2"/><path d="M20 70l20-28h80l20 28z" fill="#d8b878" stroke="#8a6a30" stroke-width="2"/><rect x="58" y="86" width="44" height="36" fill="#fff8e8" stroke="#6a4e28" stroke-width="2"/><rect x="28" y="108" width="104" height="22" fill="#c4a060"/><g fill="#8a6a40"><rect x="36" y="96" width="16" height="14"/><rect x="108" y="96" width="16" height="14"/><rect x="70" y="92" width="10" height="18"/><rect x="82" y="98" width="8" height="12"/></g><path d="M48 70v-18h12v18M100 70v-18h12v18" fill="#6a4e28"/><rect x="44" y="36" width="72" height="10" fill="#c41c2c"/><ellipse cx="80" cy="148" rx="60" ry="8" fill="#c4a060"/></svg>`,
    goldhorn: `<svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg"><rect width="160" height="160" fill="#1c1810"/><rect x="0" y="100" width="160" height="60" fill="#2a3040"/><path d="M0 112h68c6-16 18-24 28-24s22 8 28 24h36v48H0z" fill="#3a4860"/><rect x="8" y="48" width="52" height="64" fill="#e8d8b0" stroke="#8a7018" stroke-width="2"/><rect x="100" y="48" width="52" height="64" fill="#e8d8b0" stroke="#8a7018" stroke-width="2"/><g fill="#c8b888"><rect x="16" y="56" width="8" height="48"/><rect x="36" y="56" width="8" height="48"/><rect x="116" y="56" width="8" height="48"/><rect x="136" y="56" width="8" height="48"/></g><circle cx="80" cy="100" r="26" fill="#c9a227" stroke="#8a7018" stroke-width="3"/><circle cx="80" cy="100" r="10" fill="#6a5010"/><g fill="none" stroke="#6a5010" stroke-width="2"><circle cx="80" cy="100" r="18"/></g><rect x="54" y="28" width="52" height="14" fill="#e8d8b0"/></svg>`,
    leverhorn: `<svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg"><rect width="160" height="160" fill="#201810"/><rect x="10" y="88" width="140" height="52" fill="#6a3a22"/><rect x="18" y="96" width="36" height="28" fill="#fff8e8"/><rect x="62" y="96" width="36" height="28" fill="#fff8e8"/><rect x="106" y="96" width="36" height="28" fill="#fff8e8"/><rect x="44" y="36" width="52" height="64" rx="3" fill="#f0e0b8" stroke="#8a7018" stroke-width="2" transform="rotate(-18 70 68)"/><path d="M58 86l36-48 8 6-36 48z" fill="#f0c14b"/><path d="M28 140h20v-16h20v-16h20v-16h20v-16h24" fill="none" stroke="#e05030" stroke-width="4"/><circle cx="128" cy="60" r="6" fill="#e05030"/></svg>`,
    grovehall: `<svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg"><rect width="160" height="160" fill="#e8f0e8"/><rect x="86" y="40" width="60" height="80" fill="#d8e4d4" stroke="#4a6a50" stroke-width="2"/><rect x="102" y="78" width="20" height="42" fill="#6a5a40"/><rect x="94" y="50" width="14" height="14" fill="#8ab4c8"/><rect x="116" y="50" width="14" height="14" fill="#8ab4c8"/><g stroke="#2f6a3a" stroke-width="2" fill="#4a8a4a"><ellipse cx="30" cy="70" rx="16" ry="22"/><ellipse cx="58" cy="78" rx="14" ry="20"/><path d="M30 90v30M58 96v24"/></g><rect x="18" y="64" width="18" height="44" rx="6" fill="#f4f0e0" stroke="#6a5a30" stroke-width="2"/><rect x="42" y="58" width="18" height="50" rx="6" fill="#e8d8c0" stroke="#6a5a30" stroke-width="2"/><rect x="22" y="70" width="10" height="8" fill="#6aa0c8"/><rect x="46" y="66" width="10" height="8" fill="#c86a6a"/><rect x="0" y="120" width="160" height="40" fill="#c8d4c0"/></svg>`,
    wardplate: `<svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg"><rect width="160" height="160" fill="#1c2024"/><rect x="36" y="28" width="88" height="100" fill="#8a9098" stroke="#3a4048" stroke-width="2"/><g fill="#6a7078"><rect x="44" y="40" width="20" height="14"/><rect x="70" y="40" width="20" height="14"/><rect x="96" y="40" width="20" height="14"/><rect x="44" y="60" width="20" height="14"/><rect x="70" y="60" width="20" height="14"/><rect x="96" y="60" width="20" height="14"/></g><path d="M80 70l28 12v22c0 16-12 28-28 36-16-8-28-20-28-36V82z" fill="#c8d0d4" stroke="#3a4048" stroke-width="2.5"/><path d="M80 84v36" stroke="#5a6070" stroke-width="2"/><rect x="28" y="20" width="104" height="14" fill="#8a9098"/><rect x="22" y="128" width="116" height="16" fill="#4a5058"/></svg>`,
    safecanopy: `<svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg"><rect width="160" height="160" fill="#102028"/><g fill="#3a4a52"><rect x="28" y="100" width="18" height="36"/><rect x="52" y="88" width="22" height="48"/><rect x="86" y="96" width="16" height="40"/><rect x="110" y="84" width="24" height="52"/></g><path d="M80 28c-32 0-58 18-66 40 20-10 42-14 66-14s46 4 66 14c-8-22-34-40-66-40z" fill="#d8e8f0" stroke="#8aa0b0" stroke-width="2"/><path d="M20 68c18-8 40-12 60-12s42 4 60 12" fill="none" stroke="#8aa0b0" stroke-width="2"/><rect x="76" y="68" width="8" height="72" fill="#8aa0b0"/><circle cx="80" cy="26" r="5" fill="#8aa0b0"/></svg>`,
    calamtide: `<svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg"><rect width="160" height="160" fill="#2a2418"/><rect x="0" y="88" width="160" height="72" fill="#4a3a28"/><rect x="12" y="100" width="40" height="36" fill="#efe0b8"/><rect x="60" y="100" width="40" height="36" fill="#efe0b8"/><rect x="108" y="100" width="40" height="36" fill="#efe0b8"/><rect x="20" y="108" width="24" height="16" fill="#6a5a40"/><rect x="68" y="108" width="24" height="16" fill="#6a5a40"/><rect x="116" y="108" width="24" height="16" fill="#6a5a40"/><g fill="#3a6a38"><ellipse cx="80" cy="48" rx="22" ry="16"/><ellipse cx="64" cy="56" rx="14" ry="10"/><ellipse cx="98" cy="54" rx="14" ry="10"/></g><path d="M80 52v36" stroke="#5a3a18" stroke-width="4"/><path d="M74 44l6-16 6 16-16-6 20-2z" fill="#6a8a40" opacity=".85"/></svg>`,
    bearcub: `<svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg"><rect width="160" height="160" fill="#2a1518"/><circle cx="48" cy="48" r="18" fill="#5a3038"/><circle cx="112" cy="48" r="18" fill="#5a3038"/><circle cx="48" cy="48" r="8" fill="#3a1c22"/><circle cx="112" cy="48" r="8" fill="#3a1c22"/><ellipse cx="80" cy="88" rx="48" ry="44" fill="#6a3840"/><circle cx="64" cy="82" r="7" fill="#ffd24a"/><circle cx="96" cy="82" r="7" fill="#ffd24a"/><circle cx="64" cy="82" r="3" fill="#1a0a04"/><circle cx="96" cy="82" r="3" fill="#1a0a04"/><ellipse cx="80" cy="100" rx="12" ry="8" fill="#3a1c22"/><path d="M70 112 C80 120 90 120 90 112" stroke="#1a0a04" stroke-width="3" fill="none"/><path d="M80 18 L92 48 L80 42 L68 48 Z" fill="#e31c23"/><path d="M80 26 L86 44 L80 40 L74 44 Z" fill="#ffd2cf"/></svg>`,
    bearshort: `<svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg"><rect width="160" height="160" fill="#1a1014"/><circle cx="42" cy="44" r="20" fill="#4a242c"/><circle cx="118" cy="44" r="20" fill="#4a242c"/><circle cx="42" cy="44" r="9" fill="#2a1418"/><circle cx="118" cy="44" r="9" fill="#2a1418"/><ellipse cx="80" cy="90" rx="52" ry="48" fill="#5a2c36"/><circle cx="62" cy="82" r="8" fill="#e31c23"/><circle cx="98" cy="82" r="8" fill="#e31c23"/><circle cx="62" cy="82" r="3.5" fill="#1a0a04"/><circle cx="98" cy="82" r="3.5" fill="#1a0a04"/><path d="M70 104 L80 112 L90 104" fill="#2a1418"/><path d="M60 120 C80 136 100 136 100 120" stroke="#1a0a04" stroke-width="4" fill="none"/><path d="M80 10 L98 52 L80 44 L62 52 Z" fill="#e31c23"/><rect x="108" y="100" width="28" height="22" fill="#c4a15a" stroke="#1a0a04" stroke-width="2"/><path d="M108 100 L136 100 L130 90 L114 90 Z" fill="#8b1e1e"/><path d="M44 128 L36 150 L52 140" fill="#4a242c"/><path d="M116 128 L124 150 L108 140" fill="#4a242c"/></svg>`,
    bearrage: `<svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg"><rect width="160" height="160" fill="#14080c"/><circle cx="36" cy="40" r="22" fill="#6a2030"/><circle cx="124" cy="40" r="22" fill="#6a2030"/><circle cx="36" cy="40" r="10" fill="#2a0c12"/><circle cx="124" cy="40" r="10" fill="#2a0c12"/><ellipse cx="80" cy="92" rx="58" ry="50" fill="#7a2434"/><path d="M48 70 L66 80 L50 82 Z" fill="#e31c23"/><path d="M112 70 L94 80 L110 82 Z" fill="#e31c23"/><circle cx="60" cy="86" r="9" fill="#ffd24a"/><circle cx="100" cy="86" r="9" fill="#ffd24a"/><circle cx="60" cy="86" r="4" fill="#1a0a04"/><circle cx="100" cy="86" r="4" fill="#1a0a04"/><path d="M56 118 L80 132 L104 118 L96 128 L80 140 L64 128 Z" fill="#2a0c12"/><path d="M80 6 L104 54 L80 44 L56 54 Z" fill="#e31c23"/><path d="M80 16 L94 48 L80 42 L66 48 Z" fill="#ffd24a"/><path d="M20 70 L8 40 L28 62" fill="#7a2434"/><path d="M140 70 L152 40 L132 62" fill="#7a2434"/></svg>`,
    shortwolf: `<svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg"><rect width="160" height="160" fill="#16141c"/><path d="M28 60 L20 16 L52 48 Z" fill="#3a3a48"/><path d="M132 60 L140 16 L108 48 Z" fill="#3a3a48"/><path d="M20 16 L32 8 L40 36" fill="#8a90a0"/><path d="M140 16 L128 8 L120 36" fill="#8a90a0"/><ellipse cx="80" cy="92" rx="50" ry="46" fill="#4a4a5a"/><path d="M50 70 L80 100 L110 70 L100 110 L80 124 L60 110 Z" fill="#2e2e3a"/><circle cx="64" cy="84" r="7" fill="#e31c23"/><circle cx="96" cy="84" r="7" fill="#e31c23"/><circle cx="64" cy="84" r="3" fill="#111"/><circle cx="96" cy="84" r="3" fill="#111"/><path d="M80 18 L96 50 L80 44 L64 50 Z" fill="#e31c23"/><path d="M72 104 L80 118 L88 104" fill="#111"/></svg>`,
  };;

  /* ===== Audio ===== */
  let audioCtx = null;

  function ctx() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!audioCtx) audioCtx = new AC();
    if (audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  }

  function tone(freq, dur, type, vol, at) {
    if (state.muted) return;
    const ac = ctx();
    if (!ac) return;
    const t0 = ac.currentTime + (at || 0);
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = type || "square";
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(vol || 0.06, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  const sfx = {
    buy() { tone(520, 0.08, "square", 0.05); tone(780, 0.1, "square", 0.04, 0.04); },
    sell() { tone(420, 0.08, "square", 0.05); tone(280, 0.1, "square", 0.04, 0.04); },
    deny() { tone(140, 0.12, "sawtooth", 0.04); },
    gong() { tone(220, 0.5, "triangle", 0.08); tone(330, 0.4, "triangle", 0.05, 0.02); tone(440, 0.3, "sine", 0.04, 0.08); },
    up() { tone(480, 0.08, "square", 0.05); tone(720, 0.12, "square", 0.05, 0.06); },
    down() { tone(320, 0.1, "square", 0.05); tone(180, 0.16, "sawtooth", 0.04, 0.07); },
    hit() { tone(90, 0.1, "sawtooth", 0.07); tone(200, 0.08, "square", 0.04, 0.02); },
    crit() { tone(400, 0.1, "square", 0.06); tone(600, 0.12, "square", 0.06, 0.06); tone(900, 0.14, "square", 0.05, 0.12); },
    win() { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.16, "triangle", 0.06, i * 0.08)); },
    lose() { [392, 311, 247, 196].forEach((f, i) => tone(f, 0.18, "triangle", 0.06, i * 0.09)); },
    cash() { tone(880, 0.08, "square", 0.05); tone(1174, 0.16, "triangle", 0.05, 0.06); },
  };


  /* ===== Render ===== */

  function rotationBadge(sector) {
    if (!state.rotation) return "";
    if (sector === state.rotation.strong) return '<span class="badge home">主場</span>';
    if (sector === state.rotation.weak) return '<span class="badge weak">受壓</span>';
    return "";
  }

  function updateSynergyLine() {
    const el = $("synergy-line");
    if (!el) return;
    const list = currentSynergies();
    if (!list.length || (state.phase !== "battle" && state.phase !== "gap" && state.phase !== "reward" && state.phase !== "choice")) {
      el.hidden = true;
      el.textContent = "";
      return;
    }
    el.hidden = false;
    el.textContent = "連攜中：" + list.map((s) => s.title).join("、");
  }

  function updateFightBanner() {
    const el = $("fight-banner");
    const btn = $("btn-to-arena");
    if (!el) return;
    const show = state.phase === "battle" && state.phoneTab !== "arena";
    el.hidden = !show;
    if (btn && show) btn.textContent = "第 " + state.wave + " 浪進行中 · 去戰場";
  }

  function setPhoneTab(tab) {
    const next = tab === "book" || tab === "arena" ? tab : "quotes";
    state.phoneTab = next;
    const app = $("app");
    if (app) app.setAttribute("data-tab", next);
    document.querySelectorAll("[data-tab]").forEach((btn) => {
      if (btn.id === "app") return;
      const on = btn.getAttribute("data-tab") === next;
      btn.classList.toggle("on", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });
    updateFightBanner();
  }

  function onBattleViewCue() {
    if (!state.didAutoArena) {
      state.didAutoArena = true;
      setPhoneTab("arena");
    } else {
      updateFightBanner();
    }
  }

  function ensureRotation() {
    if (state.rotation && state.rotation.remaining > 0) return state.rotation;
    state.rotation = rollRotation(state.rotation, rotationSectorList(getUnlocks()), Math.random);
    return state.rotation;
  }

  function consumeRotationAfterWave() {
    if (state.rotation) state.rotation.remaining = Math.max(0, (state.rotation.remaining || 1) - 1);
  }

  function bossTelegraphStep(atk) {
    if (!atk || atk.side !== "enemy" || !atk.boss) return { mul: 1, note: "", heavy: false };
    if (atk.telegraphing) {
      atk.telegraphing = false;
      atk.charge = 0;
      return { mul: atk.boss === "major" ? 2.1 : 1.65, note: atk.name + " 重擊！", heavy: true };
    }
    atk.charge = (atk.charge || 0) + 1;
    const need = atk.boss === "major" ? 2 : 3;
    if (atk.charge >= need) {
      atk.telegraphing = true;
      return { mul: 0.7, note: atk.name + " 正在蓄力，下一擊會係重擊！", heavy: false, telegraph: true };
    }
    return { mul: 1, note: "", heavy: false };
  }

  function renderMast() {
    const waveEl = $("stat-wave");
    const goalEl = $("stat-goal");
    if (waveEl) waveEl.textContent = "第 " + state.wave + " 層";
    if (goalEl) goalEl.textContent = money(WEALTH_GOAL);
    const cashout = $("btn-cashout");
    if (cashout) {
      cashout.hidden = !(state.wealthContinued && state.phase !== "end" && state.phase !== "start");
    }
    const rot = $("rotation-line");
    if (rot) {
      const text = rotationText(state.rotation);
      rot.hidden = !text;
      rot.textContent = text;
    }
    updateSynergyLine();
    updateFightBanner();
    updateAccountBar();
  }

  function pop(el) {
    if (!el) return;
    el.classList.remove("pop");
    void el.offsetWidth;
    el.classList.add("pop");
  }

  function quoteHTML(s) {
    const chgClass = changeClass(s.change);
    const chgTxt = chgText(s);
    const selected = state.ticketId === s.id ? " selected" : "";
    const held = s.shares ? " held" : "";
    return `<article class="quote${held}${selected}" data-card="${s.id}">
      <button type="button" class="quote-icon" data-file="${s.id}" aria-label="查看 ${s.name} 資料">
        ${portrait(s.id)}
        <span class="file-tag">資料</span>
      </button>
      <button type="button" class="quote-pick" data-quote-select="${s.id}" aria-label="將 ${s.name} 放入訂單">
        <div class="quote-id">
          <div class="card-name-row">
            <div class="card-name">${s.name}<span class="pick-tag">下單</span></div>
            <div class="card-en">${stockEnLine(s)}</div>
          </div>
          <div class="badges">
            <span class="badge">${s.sector}</span>
            <span class="badge temp">${s.temperament}</span>
            <span class="badge job">${s.job || ""}</span>
            ${rotationBadge(s.sector)}
          </div>
        </div>
        <div class="quote-px">
          <div class="price ${chgClass}" data-price="${s.id}">${money(s.price)}</div>
          <div class="chg ${chgClass}" data-chg="${s.id}">${chgTxt}</div>
        </div>
      </button>
    </article>`;
  }

  function positionHTML(s) {
    const m = positionMetrics(s);
    const cls = changeClass(m.unreal);
    const selected = state.ticketId === s.id ? " selected" : "";
    return `<article class="position${selected}" data-pos="${s.id}">
      <button type="button" class="pos-icon" data-file="${s.id}" aria-label="查看 ${s.name} 資料">
        ${portrait(s.id)}
        <span class="file-tag">資料</span>
      </button>
      <button type="button" class="pos-pick" data-quote-select="${s.id}" aria-label="將 ${s.name} 放入訂單">
        <div>
          <div class="card-name">${s.name}<span class="pick-tag">下單</span></div>
          <div class="card-en">${stockEnLine(s)} · ${s.sector}</div>
        </div>
        <div class="pos-grid">
        <div><span class="attr-label">股數</span><span class="attr-value" data-pos-shares="${s.id}">${m.shares}</span></div>
        <div><span class="attr-label">成本</span><span class="attr-value" data-pos-avg="${s.id}">${money(m.avg)}</span></div>
        <div><span class="attr-label">現價</span><span class="attr-value price ${changeClass(s.change)}" data-pos-last="${s.id}">${money(m.last)}</span></div>
        <div><span class="attr-label">市值</span><span class="attr-value" data-pos-val="${s.id}">${money(m.value)}</span></div>
        <div class="pos-pnl"><span class="attr-label">浮動盈虧</span><span class="attr-value ${cls}" data-pos-pnl="${s.id}">${moneySigned(m.unreal)}　${pct(m.unrealPct)}</span></div>
        </div>
      </button>
    </article>`;
  }

  function renderBoard() {
    const board = $("board");
    if (!board) return;
    const sectors = [];
    const seen = new Set();
    for (const s of state.stocks) {
      if (!seen.has(s.sector)) {
        seen.add(s.sector);
        sectors.push(s.sector);
      }
    }
    board.innerHTML = sectors.map((sec) => {
      const cards = state.stocks.filter((x) => x.sector === sec).map(quoteHTML).join("");
      return `<div class="sector-block" data-sector="${sec}">
        <div class="sector-head">${sec}</div>
        <div class="sector-quotes">${cards}</div>
      </div>`;
    }).join("");
    renderPositions();
    updateBookAndPower();
    if (state.detailId) updateDetailLive();
  }

  function renderPositions() {
    const box = $("positions");
    const sub = $("positions-sub");
    if (!box) return;
    const held = state.stocks.filter((s) => s.shares > 0);
    if (!held.length) {
      box.innerHTML = `<div class="positions-empty">尚未持倉。喺下面行情表揀一隻，用下單票買入。</div>`;
      if (sub) sub.textContent = "尚未持倉";
    } else {
      box.innerHTML = held.map(positionHTML).join("");
      const pnl = portfolioPnL(state.stocks, state.cash, state.startCash || START_CASH, state.realizedDay);
      if (sub) sub.textContent = held.length + " 隻 · 市值 " + money(pnl.value) + " · 浮動 " + moneySigned(pnl.unreal);
    }
  }

  function updatePositionsLive() {
    const held = state.stocks.filter((s) => s.shares > 0);
    const box = $("positions");
    if (!box) return;
    if (!held.length) {
      renderPositions();
      return;
    }
    const existing = box.querySelectorAll("[data-pos]");
    if (existing.length !== held.length) {
      renderPositions();
      return;
    }
    for (const s of held) {
      if (!box.querySelector(`[data-pos="${s.id}"]`)) {
        renderPositions();
        return;
      }
    }
    for (const s of held) {
      const m = positionMetrics(s);
      const cls = changeClass(m.unreal);
      const lastCls = changeClass(s.change);
      const set = (sel, text, className) => {
        const el = box.querySelector(sel);
        if (!el) return;
        el.textContent = text;
        if (className != null) el.className = className;
      };
      set(`[data-pos-shares="${s.id}"]`, String(m.shares));
      set(`[data-pos-avg="${s.id}"]`, money(m.avg));
      set(`[data-pos-last="${s.id}"]`, money(m.last), "attr-value price " + lastCls);
      set(`[data-pos-val="${s.id}"]`, money(m.value));
      set(`[data-pos-pnl="${s.id}"]`, moneySigned(m.unreal) + "　" + pct(m.unrealPct), "attr-value " + cls);
    }
    const sub = $("positions-sub");
    const pnl = portfolioPnL(state.stocks, state.cash, state.startCash || START_CASH, state.realizedDay);
    if (sub) sub.textContent = held.length + " 隻 · 市值 " + money(pnl.value) + " · 浮動 " + moneySigned(pnl.unreal);
  }

  function pnlClass(n) {
    return n > 0.5 ? "up" : n < -0.5 ? "down" : "";
  }

  function updateAccountBar() {
    const pnl = portfolioPnL(state.stocks, state.cash, state.startCash || START_CASH, state.realizedDay);
    const set = (id, text, cls) => {
      const el = $(id);
      if (!el) return;
      el.textContent = text;
      el.className = "acct-value" + (cls ? " " + cls : "");
    };
    set("acct-cash", money(state.cash), "gold");
    set("acct-equity", money(pnl.equity), "gold");
    const dayCls = pnlClass(pnl.dayMtm);
    const totCls = pnlClass(pnl.total);
    const dayEl = $("acct-day");
    if (dayEl) {
      const startEq = state.startCash || START_CASH;
      const dayPct = startEq ? pnl.dayMtm / startEq : 0;
      dayEl.textContent = moneySigned(pnl.dayMtm) + "　" + pct(dayPct);
      dayEl.className = "acct-value" + (dayCls ? " " + dayCls : "");
    }
    const totEl = $("acct-total");
    if (totEl) {
      const totPct = (state.startCash || START_CASH) ? pnl.total / (state.startCash || START_CASH) : 0;
      totEl.textContent = moneySigned(pnl.total) + "　" + pct(totPct);
      totEl.className = "acct-value" + (totCls ? " " + totCls : "");
    }
  }

  function ticketQtyValue() {
    const input = $("ticket-qty");
    let n = input ? parseInt(input.value, 10) : state.ticketQty;
    if (!Number.isFinite(n) || n < 1) n = 1;
    state.ticketQty = n;
    return n;
  }

  function setTicketQty(n) {
    n = Math.max(1, Math.floor(Number(n) || 1));
    state.ticketQty = n;
    touchTicket();
    const input = $("ticket-qty");
    if (input && document.activeElement !== input) input.value = String(n);
    else if (input && !input.value) input.value = String(n);
    updateTicketLive();
  }

  function selectTicket(id) {
    if (!id) return;
    state.ticketId = id;
    document.querySelectorAll(".quote.selected, .position.selected").forEach((el) => el.classList.remove("selected"));
    document.querySelectorAll(`[data-card="${id}"], [data-pos="${id}"]`).forEach((el) => el.classList.add("selected"));
    updateTicketLive();
  }

  function updateTicketLive() {
    const empty = $("ticket-empty");
    const body = $("ticket-body");
    const s = state.stocks.find((x) => x.id === state.ticketId);
    if (!s) {
      if (empty) empty.hidden = false;
      if (body) body.hidden = true;
      return;
    }
    if (empty) empty.hidden = true;
    if (body) body.hidden = false;
    const qty = ticketQtyValue();
    const nameEl = $("ticket-name");
    const lastEl = $("ticket-last");
    if (nameEl) nameEl.textContent = s.name + "　" + stockEnLine(s);
    if (lastEl) {
      lastEl.className = "ticket-last " + changeClass(s.change);
      lastEl.textContent = money(s.price) + "　" + chgText(s) + (s.shares ? " · 持有 " + s.shares + " 股" : " · 未持有");
    }
    const noteEl = $("ticket-note");
    if (noteEl) {
      const wipe = state.lastWipeNote && state.lastWipeNote.id === s.id ? state.lastWipeNote.text : "";
      const jobBit = s.job ? "職業 " + s.job + (s.role ? "：" + s.role : "") : "";
      const text = wipe || jobBit;
      noteEl.hidden = !text;
      noteEl.className = "ticket-note" + (wipe ? " wipe" : "");
      noteEl.textContent = text;
    }
    const canBuy = canTrade() && state.cash >= s.price;
    const canSell = canTrade() && s.shares > 0;
    const buyN = Math.min(qty, s.price > 0 ? Math.floor(state.cash / s.price) : 0);
    const sellN = Math.min(qty, s.shares);
    const buyBtn = $("ticket-buy");
    const sellBtn = $("ticket-sell");
    if (buyBtn) {
      buyBtn.disabled = !canBuy || buyN <= 0;
      buyBtn.textContent = buyN > 0 ? "買入 " + money(buyN * s.price) : "買入";
    }
    if (sellBtn) {
      sellBtn.disabled = !canSell || sellN <= 0;
      sellBtn.textContent = sellN > 0 ? "賣出 " + money(sellN * s.price) : "賣出";
    }
  }

  function updateBookAndPower() {
    const bookEl = $("book-line");
    if (bookEl) {
      const book = portfolioValue();
      if (state.phase === "battle" && state.lastBook) {
        const delta = book - state.lastBook;
        bookEl.textContent = "帳面 " + money(book) + (delta ? "（" + (delta > 0 ? "+" : "") + money(delta) + "）" : "");
        bookEl.className = "book-line" + (delta > 0 ? " up" : delta < 0 ? " down" : "");
      } else {
        bookEl.textContent = "帳面 " + money(book);
        bookEl.className = "book-line";
      }
    }

    const raw = rawTeamPower();
    const pow = totalPower();
    const powerEl = $("team-power");
    const warn = willConcentrate() && state.phase === "gap";
    const cutNow = state.concentrationActive && state.phase === "battle";
    if (powerEl) {
      powerEl.textContent = pow.toLocaleString("en-US");
      powerEl.classList.toggle("pressed", cutNow || warn);
      const box = powerEl.closest(".power-box");
      if (box) box.classList.toggle("pressed", cutNow || warn);
    }

    let hint = "撳圖示睇檔案，撳名稱或價錢揀嚟買賣。";
    if (cutNow) {
      hint = "過度集中 −15%（原戰力 " + raw.toLocaleString("en-US") + "）。交戰中仍然可以調倉。";
    } else if (warn) {
      hint = "連續兩浪同一持倉，下一浪會有過度集中懲罰（戰力 −15%，約 " + concentratedPower(raw, true).toLocaleString("en-US") + "）。換一隻就可以避免。";
    } else if (state.phase === "build") {
      hint = hasHoldings()
        ? "建倉中，開市報價凍結。買好之後撳「確認開市」，行情先會開始行，然後第一浪出陣。"
        : "建倉中，開市報價凍結。至少買入 1 股，先可以撳「確認開市」。";
    } else if (state.phase === "gap") {
      hint = hasHoldings()
        ? "換倉空隙約 25 秒，行情持續。倒數完先出下一浪；準備好可提早開打。"
        : "至少持有 1 股先可以迎戰。行情仍然繼續。";
    } else if (state.phase === "battle") {
      hint = "交戰中仍然可以買賣。醫療牧師會為未倒下嘅隊友回血；陣亡會即時清倉該股，其餘繼續出陣。全軍覆沒或破產先完局。";
    }
    const hintEl = $("team-hint");
    if (hintEl) hintEl.textContent = hint;

    const warnEl = $("conc-warn");
    if (warnEl) {
      warnEl.classList.toggle("show", warn);
      warnEl.hidden = !warn;
    }
    updateAccountBar();
    updatePositionsLive();
    updateTicketLive();
    updateStatusFoot();
  }

  function renderIdleArmy() {
    const box = $("player-units");
    const held = state.stocks.filter((s) => s.shares > 0);
    if (!held.length) {
      box.innerHTML = `<div class="unit" style="opacity:.5"><div class="unit-name">未有持倉</div><div class="unit-sub">先買入股票</div></div>`;
    } else {
      box.innerHTML = held.map((s) => unitHTML(playerUnit(s), false)).join("");
    }
    const waiting = state.phase === "gap" || state.phase === "start" || state.phase === "build";
    if (waiting) {
      $("enemy-units").innerHTML = `<div class="unit" style="opacity:.45"><div class="unit-name">沽空軍團</div><div class="unit-sub">${state.phase === "build" ? "等候開市" : "等候下一浪"}</div></div>`;
    }
  }

  function playerUnit(s) {
    const p = powerOf(s);
    const c = combatProfile(s, p);
    return {
      id: "p-" + s.id,
      stockId: s.id,
      name: s.name,
      en: s.en,
      ticker: s.ticker,
      portrait: s.id,
      move: s.move,
      job: c.job,
      role: c.role,
      tag: c.tag,
      power: p,
      hp: c.maxHp,
      maxHp: c.maxHp,
      atk: c.atk,
      armor: c.armor,
      teamArmor: c.teamArmor,
      taunt: c.taunt,
      shield: 0,
      wiped: false,
      speed: s.speed,
      side: "player",
      change: s.change,
    };
  }

  function unitHTML(u, spawn) {
    const hpPct = Math.max(0, Math.round(((u.hp || 0) / Math.max(1, u.maxHp || 1)) * 100));
    const sh = u.shield || 0;
    const shPct = Math.min(100, Math.round((sh / Math.max(1, u.maxHp || 1)) * 100));
    const clickable = u.side === "player" && u.stockId;
    const jobBit = u.job ? u.job + " · " : "";
    const hpBit = u.side === "player"
      ? ("HP " + Math.max(0, Math.round(u.hp || 0)) + "/" + Math.max(1, Math.round(u.maxHp || 1)) + (sh ? " 盾 " + Math.round(sh) : ""))
      : ((u.ticker || u.en) + " · 戰力 " + (u.power || 0).toLocaleString("en-US"));
    const deadNote = u.wiped ? "陣亡清倉" : hpBit;
    return `<div class="unit ${u.side === "enemy" ? "enemy" : "player"}${u.hp <= 0 ? " dead" : ""}${u.wiped ? " wiped" : ""}${spawn ? " spawn" : ""}${clickable ? " clickable" : ""}" id="unit-${u.id}"${clickable ? ` data-stock="${u.stockId}" role="button" tabindex="0" aria-label="查看 ${u.name} 檔案"` : ""}>
      ${portrait(u.portrait)}
      <div class="unit-name">${u.name}</div>
      <div class="unit-job">${u.side === "player" && u.job ? u.job : ""}</div>
      <div class="unit-sub">${u.wiped ? "陣亡清倉" : (jobBit + deadNote)}</div>
      <div class="hp-bar"><div class="hp-fill" style="width:${hpPct}%"></div><div class="shield-fill" style="width:${shPct}%"></div></div>
    </div>`;
  }

  function renderAll() {
    renderMast();
    renderBoard();
    if (state.phase === "gap" || state.phase === "start" || state.phase === "build") renderIdleArmy();
    $("btn-mute").classList.toggle("muted", state.muted);
    $("btn-mute").textContent = state.muted ? "×♪" : "♪";
  }

  /* ===== Detail panel / K-line ===== */
  function klineLayout(history, opts) {
    const w = (opts && opts.w) || KLINE_W;
    const h = (opts && opts.h) || KLINE_H;
    const padL = 44, padR = 50, padT = 14, padB = 26;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;
    if (!history || !history.length) {
      return { w, h, padL, padR, padT, padB, plotW, plotH, ymin: 0, ymax: 1, slot: 0, bodyW: 8, points: [], empty: true };
    }
    const highs = history.map((c) => c.h);
    const lows = history.map((c) => c.l);
    let ymin = Math.min(...lows);
    let ymax = Math.max(...highs);
    if (ymax <= ymin) {
      ymax = ymin + 4;
      ymin = Math.max(PRICE_MIN, ymin - 4);
    }
    const span = ymax - ymin;
    ymin -= span * 0.08;
    ymax += span * 0.08;
    const yOf = (px) => padT + ((ymax - px) / (ymax - ymin)) * plotH;
    const n = history.length;
    const slot = plotW / n;
    const bodyW = Math.max(5, Math.min(14, slot * 0.55));
    const points = history.map((c, i) => {
      const x = padL + slot * (i + 0.5);
      return {
        i,
        x,
        yClose: yOf(c.c),
        yOpen: yOf(c.o),
        yHigh: yOf(c.h),
        yLow: yOf(c.l),
        candle: c,
        bodyW,
      };
    });
    return { w, h, padL, padR, padT, padB, plotW, plotH, ymin, ymax, slot, bodyW, points, yOf, empty: false };
  }

  function priceLinePoints(layout) {
    return (layout.points || []).map((p) => ({ i: p.i, x: p.x, y: p.yClose, close: p.candle.c }));
  }

  function nearestCandleIndex(layout, svgX) {
    const pts = layout && layout.points;
    if (!pts || !pts.length) return -1;
    let best = 0;
    let bestD = Infinity;
    for (const p of pts) {
      const d = Math.abs(p.x - svgX);
      if (d < bestD) {
        bestD = d;
        best = p.i;
      }
    }
    return best;
  }

  function pointerToSvg(svg, clientX, clientY) {
    const rect = svg.getBoundingClientRect();
    const vb = svg.viewBox && svg.viewBox.baseVal;
    const w = vb && vb.width ? vb.width : KLINE_W;
    const h = vb && vb.height ? vb.height : KLINE_H;
    const scale = Math.min(rect.width / w, rect.height / h);
    const ox = (rect.width - w * scale) / 2;
    const oy = (rect.height - h * scale) / 2;
    return {
      x: (clientX - rect.left - ox) / scale,
      y: (clientY - rect.top - oy) / scale,
    };
  }

  function candleReadout(history, index) {
    if (!history || !history.length || index < 0 || index >= history.length) return null;
    const c = history[index];
    const prev = index > 0 ? history[index - 1].c : c.o;
    const chg = prev ? (c.c - prev) / prev : 0;
    return {
      index,
      label: c.label || ("第" + (index + 1) + "節"),
      live: !!c.live,
      o: c.o,
      h: c.h,
      l: c.l,
      c: c.c,
      chg,
    };
  }

  function klineInner(layout, hoverIndex) {
    const { w, h, padL, padR, padT, plotH } = layout;
    if (layout.empty) {
      return `<text x="${w / 2}" y="${h / 2}" text-anchor="middle" fill="#6a4e28">未有走勢</text>`;
    }
    const yOf = layout.yOf;
    let parts = "";
    [layout.ymin, (layout.ymin + layout.ymax) / 2, layout.ymax].forEach((v) => {
      const yy = yOf(v);
      parts += `<line x1="${padL}" y1="${yy}" x2="${w - padR}" y2="${yy}" stroke="#c4a15a" stroke-width="1" opacity="0.35"/>`;
      parts += `<text x="${padL - 6}" y="${yy + 3.5}" text-anchor="end" font-size="10" fill="#6a4e28" font-family="Oswald,sans-serif">${Math.round(v)}</text>`;
    });
    const hi = hoverIndex;
    if (hi != null && layout.points[hi]) {
      const p = layout.points[hi];
      parts += `<rect x="${(p.x - layout.slot / 2).toFixed(2)}" y="${padT}" width="${layout.slot.toFixed(2)}" height="${plotH}" fill="#f0c14b" opacity="0.16"/>`;
    }
    layout.points.forEach((p) => {
      const c = p.candle;
      const up = c.c >= c.o;
      const color = up ? "#e31c23" : "#0a8a48";
      const top = Math.min(p.yOpen, p.yClose);
      const bh = Math.max(1.6, Math.abs(p.yClose - p.yOpen));
      const isH = hi != null && p.i === hi;
      parts += `<line x1="${p.x}" y1="${p.yHigh}" x2="${p.x}" y2="${p.yLow}" stroke="${color}" stroke-width="${isH ? 3 : 2}"/>`;
      parts += `<rect x="${(p.x - p.bodyW / 2).toFixed(2)}" y="${top.toFixed(2)}" width="${p.bodyW.toFixed(2)}" height="${bh.toFixed(2)}" fill="${color}"${isH ? ` stroke="#160e08" stroke-width="1.2"` : ""}/>`;
    });
    const linePts = priceLinePoints(layout);
    if (linePts.length) {
      const d = linePts.map((p, i) => (i ? "L" : "M") + p.x.toFixed(2) + " " + p.y.toFixed(2)).join(" ");
      parts += `<path d="${d}" fill="none" stroke="#9a6a00" stroke-width="2.1" stroke-linejoin="round" stroke-linecap="round"/>`;
      linePts.forEach((p) => {
        parts += `<circle cx="${p.x.toFixed(2)}" cy="${p.y.toFixed(2)}" r="1.6" fill="#9a6a00"/>`;
      });
    }
    const last = layout.points[layout.points.length - 1];
    if (last) {
      const up = last.candle.c >= last.candle.o;
      const tagY = Math.max(padT + 8, Math.min(last.yClose, padT + plotH - 8));
      const tagColor = up ? "#e31c23" : "#0a8a48";
      parts += `<line x1="${last.x}" y1="${last.yClose}" x2="${w - padR}" y2="${last.yClose}" stroke="${tagColor}" stroke-width="1" stroke-dasharray="3 3" opacity="0.7"/>`;
      parts += `<rect x="${w - padR + 2}" y="${tagY - 8}" width="46" height="16" fill="${tagColor}"/>`;
      parts += `<text x="${w - padR + 25}" y="${tagY + 4}" text-anchor="middle" font-size="10" fill="#fff8e8" font-family="Oswald,sans-serif">${Math.round(last.candle.c)}</text>`;
    }
    layout.points.forEach((p, i, arr) => {
      const n = arr.length;
      const show = n <= 9 || i === 0 || i === n - 1 || i === Math.floor((n - 1) / 2) || i % 2 === 0;
      if (!show) return;
      parts += `<text x="${p.x}" y="${h - 7}" text-anchor="middle" font-size="9" fill="#6a4e28">${p.candle.label || i + 1}</text>`;
    });
    if (hi != null && layout.points[hi]) {
      const p = layout.points[hi];
      parts += `<line x1="${p.x}" y1="${padT}" x2="${p.x}" y2="${padT + plotH}" stroke="#160e08" stroke-width="1.2" stroke-dasharray="3 3"/>`;
      parts += `<line x1="${padL}" y1="${p.yClose}" x2="${w - padR}" y2="${p.yClose}" stroke="#160e08" stroke-width="1.2" stroke-dasharray="3 3"/>`;
      parts += `<circle cx="${p.x}" cy="${p.yClose}" r="3.6" fill="#ffe28a" stroke="#160e08" stroke-width="1.3"/>`;
    }
    return parts;
  }

  function drawKline(history, hoverIndex) {
    const layout = klineLayout(history);
    const last = history && history.length ? history[history.length - 1] : null;
    const label = last ? "過去 " + history.length + " 段走勢，最新收市 " + money(last.c) : "未有走勢";
    const hi = hoverIndex == null ? (layout.points.length ? layout.points.length - 1 : null) : hoverIndex;
    return `<svg viewBox="0 0 ${layout.w} ${layout.h}" class="kline" id="kline-svg" role="img" aria-label="${label}">${klineInner(layout, hi)}</svg>`;
  }

  function setKlineTooltip(tooltip, history, index) {
    if (!tooltip) return;
    const info = candleReadout(history, index);
    if (!info) {
      tooltip.hidden = true;
      tooltip.textContent = "";
      return;
    }
    const cls = changeClass(info.chg);
    const live = info.live ? " · 即市" : "";
    tooltip.hidden = false;
    tooltip.innerHTML = `<span class="tip-label">${info.label}${live}</span>　開 ${money(info.o)}　高 ${money(info.h)}　低 ${money(info.l)}　收 <span class="${cls}">${money(info.c)}　${pct(info.chg)}</span>`;
  }

  function applyKlineHover(svg, tooltip, history, index) {
    const layout = klineLayout(history);
    const hi = index == null ? (layout.points.length ? layout.points.length - 1 : null) : index;
    if (svg) svg.innerHTML = klineInner(layout, hi);
    setKlineTooltip(tooltip, history, hi == null ? -1 : hi);
  }

  function currentDetailHistory() {
    if (!state.detailId) return [];
    const s = state.stocks.find((x) => x.id === state.detailId);
    return s ? chartHistory(s) : [];
  }

  function bindKlineInteraction() {
    const stage = $("kline-stage");
    const svg = $("kline-svg");
    const tooltip = $("kline-tooltip");
    if (!stage || !svg) return;
    let dragging = false;

    const inspect = (e) => {
      const hist = currentDetailHistory();
      const layout = klineLayout(hist);
      const pt = pointerToSvg(svg, e.clientX, e.clientY);
      const idx = nearestCandleIndex(layout, pt.x);
      state.hoverIndex = idx;
      applyKlineHover(svg, tooltip, hist, idx);
    };

    stage.addEventListener("pointerdown", (e) => {
      if (e.button && e.button !== 0) return;
      dragging = true;
      try { stage.setPointerCapture(e.pointerId); } catch (err) {}
      e.preventDefault();
      e.stopPropagation();
      inspect(e);
    });
    stage.addEventListener("pointermove", (e) => {
      if (!dragging && e.pointerType === "touch") return;
      if (!dragging && e.pointerType !== "mouse") return;
      if (dragging) {
        e.preventDefault();
        e.stopPropagation();
      }
      inspect(e);
    });
    const endDrag = (e) => {
      if (dragging) {
        e.stopPropagation();
      }
      dragging = false;
    };
    stage.addEventListener("pointerup", endDrag);
    stage.addEventListener("pointercancel", endDrag);
    stage.addEventListener("pointerleave", () => {
      if (dragging) return;
      const hist = currentDetailHistory();
      state.hoverIndex = null;
      applyKlineHover(svg, tooltip, hist, hist.length ? hist.length - 1 : null);
    });
    stage.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  }

  function renderDetail(s) {
    const card = $("detail-card");
    if (!card || !s) return;
    const chgClass = changeClass(s.change);
    const chgTxt = chgText(s);
    const pow = powerOf(s);
    const history = chartHistory(s);
    const prev = history.length >= 2 ? history[history.length - 2].c : s.prevPrice;
    const hi = state.hoverIndex == null ? (history.length ? history.length - 1 : null) : Math.min(state.hoverIndex, history.length - 1);
    card.innerHTML = `
      <button type="button" class="detail-close" id="btn-detail-close" aria-label="關閉檔案">×</button>
      <div class="detail-kicker">個股檔案</div>
      <div class="detail-top">
        ${portrait(s.id)}
        <div>
          <h2 id="detail-name">${s.name}</h2>
          <div class="detail-en">${stockEnLine(s)}</div>
          <div class="badges">
            <span class="badge">${s.sector}</span>
            <span class="badge temp">${s.temperament}</span>
            <span class="badge job">${s.job || ""}</span>
            ${rotationBadge(s.sector)}
          </div>
        </div>
      </div>
      <p class="detail-role">${s.job ? "職業：" + s.job + " — " + (s.role || "") : ""}</p>
      <p class="detail-syn">${(currentSynergies().filter((x) => !x.jobs || x.jobs.indexOf(s.job) >= 0).map((x) => x.line).join("；")) || ""}</p>
      <p class="detail-blurb">${s.blurb || ""}</p>
      <div class="detail-attrs">
        <div><span class="attr-label">招式</span><span class="attr-value">「${s.move}」</span></div>
        <div><span class="attr-label">波動</span><span class="attr-value">${s.vol.toFixed(2)}</span></div>
        <div><span class="attr-label">現價</span><span class="attr-value price ${chgClass}" id="detail-price">${money(s.price)}　${chgTxt}</span></div>
        <div><span class="attr-label">上日收市</span><span class="attr-value" id="detail-prev">${money(prev)}</span></div>
        <div><span class="attr-label">持有</span><span class="attr-value" id="detail-shares">${s.shares} 股 · 市值 ${money(s.shares * s.price)}</span></div>
        <div><span class="attr-label">戰力</span><span class="attr-value" id="detail-power">${s.shares ? pow.toLocaleString("en-US") : "0"}</span></div>
      </div>
      <div class="kline-wrap">
        <div class="kline-head">
          <span>近期走勢 · K 線 + 價格線</span>
          <span class="kline-legend"><i class="up">紅升</i>　<i class="down">綠跌</i>　<span class="line-swatch">價格線</span></span>
        </div>
        <div class="kline-stage" id="kline-stage">${drawKline(history, hi)}</div>
        <div class="kline-tooltip" id="kline-tooltip"></div>
        <div class="kline-note">開市前已有模擬走勢；其後約每 20 秒或頭條出現就收一根。拖曳或滑過圖表可睇每節開高低收。</div>
      </div>
    `;
    const tooltip = $("kline-tooltip");
    setKlineTooltip(tooltip, history, hi == null ? -1 : hi);
    $("btn-detail-close").addEventListener("click", closeDetail);
    bindKlineInteraction();
  }

  function updateDetailLive() {
    if (!state.detailId) return;
    const s = state.stocks.find((x) => x.id === state.detailId);
    if (!s) {
      closeDetail();
      return;
    }
    const history = chartHistory(s);
    const svg = $("kline-svg");
    if (!svg) {
      renderDetail(s);
      return;
    }
    const prev = history.length >= 2 ? history[history.length - 2].c : s.prevPrice;
    const priceEl = $("detail-price");
    if (priceEl) {
      priceEl.className = "attr-value price " + changeClass(s.change);
      priceEl.textContent = money(s.price) + "　" + chgText(s);
    }
    const prevEl = $("detail-prev");
    if (prevEl) prevEl.textContent = money(prev);
    const shEl = $("detail-shares");
    if (shEl) shEl.textContent = s.shares + " 股 · 市值 " + money(s.shares * s.price);
    const pwEl = $("detail-power");
    if (pwEl) pwEl.textContent = s.shares ? powerOf(s).toLocaleString("en-US") : "0";
    const idx = state.hoverIndex == null ? (history.length ? history.length - 1 : null) : Math.min(state.hoverIndex, history.length - 1);
    applyKlineHover(svg, $("kline-tooltip"), history, idx);
  }

  function refreshDetail() {
    if (!state.detailId) return;
    const s = state.stocks.find((x) => x.id === state.detailId);
    if (!s) {
      closeDetail();
      return;
    }
    updateDetailLive();
  }

  function openDetail(id) {
    const s = state.stocks.find((x) => x.id === id);
    if (!s) return;
    state.detailId = id;
    state.hoverIndex = null;
    renderDetail(s);
    const overlay = $("overlay-detail");
    overlay.classList.add("show");
    const closeBtn = $("btn-detail-close");
    if (closeBtn) closeBtn.focus();
  }

  function closeDetail() {
    const overlay = $("overlay-detail");
    if (overlay) overlay.classList.remove("show");
    state.detailId = null;
    state.hoverIndex = null;
  }


  /* ===== Floaters / juice ===== */
  function fly(text, x, y, cls) {
    const layer = $("float-layer");
    if (!layer || typeof document === "undefined") return;
    const el = document.createElement("div");
    el.className = "floater " + (cls || "");
    el.textContent = text;
    el.style.left = x + "px";
    el.style.top = y + "px";
    layer.appendChild(el);
    setTimeout(() => el.remove(), 1100);
  }

  function flyFromEl(el, text, cls) {
    if (!el) return;
    const r = el.getBoundingClientRect();
    fly(text, r.left + r.width / 2, r.top - 4, cls);
  }

  function shake(hard) {
    const root = $("shake-root");
    root.classList.remove("shake", "shake-hard");
    void root.offsetWidth;
    root.classList.add(hard ? "shake-hard" : "shake");
  }

  function setLog(t) {
    const el = $("arena-log");
    if (el) el.textContent = t;
  }

  function setHeadline(text, tone, kicker) {
    const slot = $("headline-slot");
    if (!slot) return;
    if (!text) {
      const idle = tone === "build" || state.phase === "build" ? "建倉中 · 開市報價凍結" : "行情進行中";
      slot.innerHTML = `<div class="headline-idle" id="headline-idle">${idle}</div>`;
      return;
    }
    const kick = kicker ? `<div class="headline-kicker">${kicker}</div>` : "";
    slot.innerHTML = `<div class="headline-stack">${kick}<div class="headline-banner${tone === "bad" ? " bad" : ""}">${text}</div></div>`;
  }

  /* ===== Trading ===== */
  function buy(id, qty) {
    buyQty(id, qty == null ? 1 : qty);
  }

  function sell(id, qty) {
    sellQty(id, qty == null ? 1 : qty);
  }

  function buyQty(id, qty) {
    if (!canTrade()) return;
    const idx = state.stocks.findIndex((x) => x.id === id);
    if (idx < 0) {
      sfx.deny();
      return;
    }
    const result = applyBuy(state.stocks[idx], state.cash, qty);
    if (!result.qty) {
      sfx.deny();
      return;
    }
    state.stocks[idx] = Object.assign(state.stocks[idx], result.stock);
    state.cash = result.cash;
    sfx.buy();
    afterHoldingsChange();
  }

  function sellQty(id, qty) {
    if (!canTrade()) return;
    const idx = state.stocks.findIndex((x) => x.id === id);
    if (idx < 0) {
      sfx.deny();
      return;
    }
    const result = applySell(state.stocks[idx], state.cash, qty, state.realizedDay);
    if (!result.qty) {
      sfx.deny();
      return;
    }
    state.stocks[idx] = Object.assign(state.stocks[idx], result.stock);
    state.cash = result.cash;
    state.realizedDay = result.realizedDay;
    sfx.sell();
    afterHoldingsChange();
  }

  /* ===== Market tick ===== */
  function availableEvents() {
    const unlocked = getUnlocks();
    return EVENTS.filter((e) => {
      if (e.unlock && !unlocked[e.unlock]) return false;
      if (e.late && state.wave < 3) return false;
      return true;
    });
  }

  function pickEvent(forceMinor) {
    if (forceMinor) {
      let pool = MINOR_EVENTS.slice();
      let choices = pool.filter((e) => e.headline !== state.lastTemplate && e.headline !== state.lastHeadline);
      if (!choices.length) choices = pool;
      const ev = pick(choices);
      state.lastTemplate = ev.headline;
      return resolveSpecialEvent(ev, state.stocks);
    }
    let pool = availableEvents();
    if (state.wave <= 2) {
      pool = pool.filter((e) => MILD_EVENTS.includes(e.headline));
    } else if (state.wave >= 6) {
      pool = pool.concat(pool.filter((e) => HARSH_EVENTS.includes(e.headline) || e.special === "shortage"));
    }
    let choices = pool.filter((e) => e.headline !== state.lastTemplate && e.headline !== state.lastHeadline);
    if (!choices.length) choices = pool;
    const ev = pick(choices);
    state.lastTemplate = ev.headline;
    return resolveSpecialEvent(ev, state.stocks);
  }

  function rollChange(stock, event) {
    const range = event.impacts[stock.sector];
    let base;
    if (range) base = rand(range[0], range[1]);
    else base = rand(-0.04, 0.04);
    const jitter = rand(0.9, 1.1);
    const idioScale = stock.vol > 1 ? 1.25 : 0.7;
    const idio = rand(-0.028, 0.028) * idioScale;
    let ch = base * stock.vol * jitter + idio;
    if (state.concentrationActive && stock.shares > 0) {
      ch = ch * 1.1 - 0.02;
    }
    return ch;
  }

  function applyEvent(event) {
    for (const s of state.stocks) {
      s.prevPrice = s.price;
      let ch = rollChange(s, event);
      s.price = clampPrice(s.price * (1 + ch));
      applyTickToForming(s);
      const base = s.forming ? s.forming.o : s.prevPrice;
      s.change = base ? (s.price - base) / base : 0;
    }
  }

  async function animatePrices() {
    for (const s of state.stocks) {
      const card = document.querySelector(`[data-card="${s.id}"]`);
      const priceEl = document.querySelector(`[data-price="${s.id}"]`);
      const chgEl = document.querySelector(`[data-chg="${s.id}"]`);
      if (!card) continue;
      const up = s.change > 0.0005;
      const down = s.change < -0.0005;
      card.classList.remove("flash-up", "flash-down");
      void card.offsetWidth;
      card.classList.add(up ? "flash-up" : down ? "flash-down" : "flash-up");
      if (priceEl) {
        priceEl.textContent = money(s.price);
        priceEl.className = "price " + (up ? "up" : down ? "down" : "flat");
        pop(priceEl);
        flyFromEl(priceEl, pct(s.change), up ? "up" : down ? "down" : "");
      }
      if (chgEl) {
        chgEl.textContent = pct(s.change);
        chgEl.className = "chg " + (up ? "up" : down ? "down" : "flat");
      }
      if (s.shares > 0) {
        if (down) sfx.down();
        else if (up) sfx.up();
      }
      await sleep(90);
    }
    const bookNow = portfolioValue();
    const delta = bookNow - state.lastBook;
    if (delta < -120 || state.stocks.some((s) => s.shares > 0 && s.change <= -0.15)) {
      shake(true);
    } else if (Math.abs(delta) > 40) {
      shake(false);
    }
    if (state.detailId) refreshDetail();
  }

  /* ===== Battle ===== */
  // old budget: [0, 240, 400, 620, 880, 1180, 1520, 1900, 2320]
  const ENEMY_BUDGET = [0, 560, 780, 1100, 1450, 1820, 2200, 2580, 2960];

  function makeEnemies(wave, budget) {
    const kind = bossKind(wave);
    const n = kind === "major" ? 3 : kind === "minor" ? 3 : (wave <= 2 ? 2 : wave <= 4 ? 3 : 4);
    const types = [];
    if (kind === "minor") {
      types.push(["壓價熊", "Pressbear", "bearrage", 2, "minor", true], ["掃貨狼", "Sweepwolf", "shortwolf", 3, "minor", false], ["沽空熊", "Shortbear", "bearshort", 2, null, false]);
    } else if (kind === "major") {
      const names = { 10: ["夜盤巨空", "Nightshort"], 20: ["連環逼倉", "Chaincall"], 30: ["終極沽空皇", "Shortcrown"] };
      const pair = names[wave] || ["第" + wave + "層巨空", "Floorvoid"];
      types.push([pair[0], pair[1], "bearrage", 2, "major", true], ["空頭狼", "Shortwolf", "shortwolf", 3, null, false], ["沽空熊", "Shortbear", "bearshort", 2, null, false]);
    } else if (wave <= 2) {
      types.push(["細熊", "Cubbear", "bearcub", 2], ["細熊", "Cubbear", "bearcub", 2]);
    } else if (wave <= 4) {
      types.push(["沽空熊", "Shortbear", "bearshort", 2], ["空頭狼", "Shortwolf", "shortwolf", 3], ["細熊", "Cubbear", "bearcub", 2]);
    } else {
      types.push(["狂熊", "Ragebear", "bearrage", 3], ["空頭狼", "Shortwolf", "shortwolf", 3], ["沽空熊", "Shortbear", "bearshort", 2], ["細熊", "Cubbear", "bearcub", 2]);
    }
    const weights = types.slice(0, n).map((t, i) => (t[5] ? 1.6 : 0.7) + Math.random() * 0.5);
    const sum = weights.reduce((a, b) => a + b, 0);
    return types.slice(0, n).map((t, i) => {
      const power = Math.max(80, Math.round((budget * weights[i]) / sum));
      const hpMul = t[5] ? (t[4] === "major" ? 1.45 : 1.25) : 1;
      return {
        id: "e-" + i,
        name: t[0],
        en: t[1],
        portrait: t[2],
        power,
        hp: Math.round(power * hpMul),
        maxHp: Math.round(power * hpMul),
        atk: Math.max(16, Math.round(power * (t[5] ? 0.24 : 0.21))),
        speed: t[3],
        side: "enemy",
        change: 0,
        boss: t[4] || null,
        telegraphing: false,
        charge: 0,
      };
    });
  }

  function updateUnitEl(u) {
    const el = $("unit-" + u.id);
    if (!el) return;
    const fill = el.querySelector(".hp-fill");
    if (fill) fill.style.width = Math.max(0, Math.round(((u.hp || 0) / Math.max(1, u.maxHp || 1)) * 100)) + "%";
    const shFill = el.querySelector(".shield-fill");
    if (shFill) shFill.style.width = Math.min(100, Math.round(((u.shield || 0) / Math.max(1, u.maxHp || 1)) * 100)) + "%";
    el.classList.toggle("dead", u.hp <= 0);
    el.classList.toggle("wiped", !!u.wiped);
  }

  function living(units) {
    return units.filter((u) => u.hp > 0);
  }

  function chooseTarget(targets) {
    const list = living(targets);
    if (!list.length) return null;
    const tanks = list.filter((u) => (u.taunt || 0) > 0);
    if (tanks.length && Math.random() < Math.max(...tanks.map((u) => u.taunt))) {
      return tanks.slice().sort((a, b) => b.taunt - a.taunt || b.hp - a.hp)[0];
    }
    if (Math.random() < 0.6) {
      return list.slice().sort((a, b) => a.hp - b.hp)[0];
    }
    return pick(list);
  }

  function attackLog(atk, tgt, dmg, knocked) {
    const moveBit = atk.side === "player" && atk.move ? `使出「${atk.move}」，` : "";
    if (knocked) return `${atk.name} ${moveBit}擊倒 ${tgt.name}！`;
    return `${atk.name} ${moveBit}打中 ${tgt.name}，${dmg} 傷害`;
  }

  function refreshUnitEl(u) {
    const el = $("unit-" + u.id);
    if (!el) return;
    updateUnitEl(u);
    const jobEl = el.querySelector(".unit-job");
    if (jobEl) jobEl.textContent = u.side === "player" && u.job ? u.job : "";
    const sub = el.querySelector(".unit-sub");
    if (sub) {
      if (u.wiped) sub.textContent = "陣亡清倉";
      else if (u.side === "player") {
        const sh = u.shield || 0;
        sub.textContent = (u.job ? u.job + " · " : "") + "HP " + Math.max(0, Math.round(u.hp || 0)) + "/" + Math.max(1, Math.round(u.maxHp || 1)) + (sh ? " 盾 " + Math.round(sh) : "");
      } else {
        sub.textContent = (u.ticker || u.en) + " · 戰力 " + u.power.toLocaleString("en-US");
      }
    }
  }


  function powerLookup(s) {
    return powerOf(s);
  }

  function supportSources(kind) {
    return state.stocks.filter((s) => {
      if ((s.shares || 0) <= 0) return false;
      const t = traitsOf(s);
      if (kind === "heal") return t.heal > 0;
      if (kind === "supply") return t.supply > 0;
      if (kind === "shield") return t.shield > 0;
      return false;
    });
  }

  function flashSupport(events) {
    for (const e of events || []) {
      const u = state.fight && state.fight.players ? state.fight.players.find((x) => x.id === e.unitId) : null;
      const el = u ? $("unit-" + u.id) : null;
      const target = el && (el.querySelector(".portrait") || el);
      if (e.type === "heal") flyFromEl(target, (e.job || "牧師") + " 回血 +" + e.amount, "heal");
      else if (e.type === "supply") flyFromEl(target, (e.job || "補給") + " 補給 +" + e.amount, "heal");
      else if (e.type === "shield") flyFromEl(target, (e.job || "騎士") + " 護盾 +" + e.amount, "shield");
    }
    const line = supportLog(events);
    if (line) setLog(line);
    if (state.fight) state.fight.players.forEach(refreshUnitEl);
  }

  function pulseBattleSupport(kind) {
    if (!state.fight || !state.fight.players) return [];
    const players = state.fight.players;
    const b = state.runBuffs || {};
    const fx = currentSynergyEffects();
    const healScale = { heal: b.healAmp || 1, supply: 1 };
    const shieldScale = { shield: b.shieldAmp || 1 };
    let events = [];
    if (kind === "opening" || kind === "round") {
      events = events.concat(applyShieldToLiving(players, supportSources("shield"), powerLookup, shieldScale));
      if (fx.shield > 0) {
        const living = livingCombatants(players);
        const pool = Math.round(totalPower() * fx.shield);
        const parts = splitPool(pool, living.length || 1);
        living.forEach((u, i) => {
          const amt = parts[i] || 0;
          if (amt <= 0) return;
          u.shield = (u.shield || 0) + amt;
          events.push({ type: "shield", source: "聖愈連攜", job: "連攜", target: u.name, unitId: u.id, amount: amt });
        });
      }
    }
    if (kind === "round") {
      events = events.concat(applyHealToLiving(players, supportSources("heal"), "heal", powerLookup, healScale));
      events = events.concat(applyHealToLiving(players, supportSources("supply"), "supply", powerLookup));
    }
    if (kind === "opening" && (b.openHeal || b.metaOpenHeal)) {
      const living = livingCombatants(players);
      living.forEach((u) => {
        const amt = Math.max(1, Math.round((u.maxHp || 0) * 0.08));
        const healed = Math.min(amt, Math.max(0, (u.maxHp || 0) - u.hp));
        if (healed > 0) {
          u.hp += healed;
          events.push({ type: "heal", source: "開場包紮", job: "祝福", target: u.name, unitId: u.id, amount: healed });
        }
      });
    }
    if (events.length) flashSupport(events);
    return events;
  }

  function settlePlayerDeath(u) {
    if (!u || u.side !== "player" || u.wiped || u.hp > 0) return null;
    u.wiped = true;
    u.hp = 0;
    u.shield = 0;
    u.power = 0;
    const idx = state.stocks.findIndex((x) => x.id === u.stockId);
    let note = (u.name || "") + " 陣亡清倉";
    if (idx >= 0) {
      const s = state.stocks[idx];
      const result = applyDeathWipe(s, state.realizedDay);
      state.stocks[idx] = Object.assign(s, result.stock);
      state.realizedDay = result.realizedDay;
      state.lastWipeNote = { id: s.id, text: result.note };
      note = result.note;
    }
    flyFromEl($("unit-" + u.id), note, "wipe");
    refreshUnitEl(u);
    if (typeof renderMast === "function") renderMast();
    if (typeof renderBoard === "function") renderBoard();
    if (typeof updateAccountBar === "function") updateAccountBar();
    if (typeof updatePositionsLive === "function") updatePositionsLive();
    if (typeof updateTicketLive === "function") updateTicketLive();
    const allies = (state.fight && state.fight.players) || [u];
    const outcome = runOutcomeAfterDeath({
      floorsCleared: state.floorsCleared || 0,
      units: allies,
    });
    if (outcome.canContinue) {
      setLog(note + "，該股持倉已全部清走。");
      return { note, cash: state.cash, canContinue: true, end: false };
    }
    setLog(note + "。全軍覆沒，呢局完結，要重新掛牌再開一局。");
    state.fatalDeath = true;
    endRun("wipeout");
    return { note, cash: state.cash, canContinue: false, end: true };
  }

  function strikeTarget(atk, tgt, rawDmg, crit) {
    const step = atk.side === "enemy" ? bossTelegraphStep(atk) : { mul: 1, note: "", heavy: false };
    const dmgIn = Math.round((rawDmg || 0) * (step.mul || 1));
    if (step.note) setLog(step.note);
    const allies = atk.side === "enemy" && state.fight ? state.fight.players : (state.fight ? state.fight.enemies : []);
    const result = applyIncomingDamage(tgt, dmgIn, allies, state.stocks, { heavy: !!step.heavy });
    const aEl = $("unit-" + atk.id);
    const tEl = $("unit-" + tgt.id);
    if (aEl) {
      aEl.classList.remove("lunge-right", "lunge-left");
      void aEl.offsetWidth;
      aEl.classList.add(atk.side === "player" ? "lunge-right" : "lunge-left");
    }
    if (tEl) {
      tEl.classList.remove("hit");
      void tEl.offsetWidth;
      tEl.classList.add("hit");
      const port = tEl.querySelector(".portrait") || tEl;
      if (result.blocked > 0) flyFromEl(port, (tgt.job || "聖騎士") + " 抵擋", "shield");
      else flyFromEl(port, (crit ? "暴擊 " : "") + result.dmg, crit ? "crit" : "dmg");
    }
    updateUnitEl(tgt);
    refreshUnitEl(tgt);
    if (result.killed && tgt.side === "player") settlePlayerDeath(tgt);
    if (crit && result.blocked <= 0) sfx.crit();
    else sfx.hit();
    const knocked = tgt.hp <= 0;
    setLog(attackLog(atk, tgt, result.dmg, knocked) + (result.blocked ? "（" + (tgt.job || "坦") + " 抵擋 " + result.blocked + "）" : ""));
    return result;
  }

  function syncPlayerUnits() {
    if (state.phase !== "battle" || !state.fight) return;
    const fight = state.fight;
    const box = $("player-units");
    for (const u of fight.players) {
      const s = state.stocks.find((x) => x.id === u.stockId);
      if (u.wiped) {
        u.power = 0;
        u.hp = 0;
        u.shield = 0;
        u.maxHp = Math.max(1, u.maxHp || 1);
        refreshUnitEl(u);
        continue;
      }
      if (!s || s.shares <= 0) {
        u.power = 0;
        u.hp = 0;
        u.maxHp = 1;
        u.shield = 0;
        refreshUnitEl(u);
        continue;
      }
      const p = powerOf(s);
      const c = combatProfile(s, p);
      const prevMax = u.maxHp || c.maxHp;
      const delta = c.maxHp - prevMax;
      u.power = p;
      u.maxHp = Math.max(1, c.maxHp);
      u.atk = c.atk;
      u.armor = c.armor;
      u.teamArmor = c.teamArmor;
      u.taunt = c.taunt;
      u.tag = c.tag;
      u.job = c.job;
      u.move = s.move;
      u.speed = s.speed;
      u.change = s.change;
      if (u.hp <= 0 && p > 0) u.hp = c.maxHp;
      else u.hp = Math.max(0, Math.min(u.maxHp, (u.hp || 0) + delta));
      if (u.hp <= 0 && s.shares > 0) settlePlayerDeath(u);
      else refreshUnitEl(u);
    }
    for (const s of state.stocks) {
      if (s.shares <= 0) continue;
      if (fight.players.some((u) => u.stockId === s.id)) continue;
      const u = playerUnit(s);
      fight.players.push(u);
      if (box) box.insertAdjacentHTML("beforeend", unitHTML(u, true));
    }
  }

  async function pauseForHurt(u) {
    const arena = document.querySelector(".arena");
    const el = u && $("unit-" + u.id);
    if (arena) arena.classList.add("hurt-pause");
    if (el) el.classList.add("hurt");
    setLog((u && u.name ? u.name : "單位") + " 受重創，短暫慢下來，可以先行調倉。");
    await sleep(BATTLE_HURT_MS);
    if (arena) arena.classList.remove("hurt-pause");
    if (el) el.classList.remove("hurt");
  }

  async function runBattle() {
    const players = state.stocks.filter((s) => s.shares > 0).map(playerUnit);
    const budget = enemyBudgetFor(state.wave);
    const enemies = makeEnemies(state.wave, budget);
    const enemyPower = enemies.reduce((a, e) => a + e.power, 0);
    state.fight = { players, enemies };

    $("player-units").innerHTML = players.map((u) => unitHTML(u, true)).join("");
    $("enemy-units").innerHTML = enemies.map((u) => unitHTML(u, true)).join("");
    $("vs-mark").textContent = "VS";
    const kind = bossKind(state.wave);
    let openLog = (kind === "major" ? "大Boss戰 · " : kind === "minor" ? "小Boss戰 · " : "") + `第 ${state.wave} 層開打 · 組合戰力 ${totalPower().toLocaleString("en-US")} vs 沽空 ${enemyPower.toLocaleString("en-US")}`;
    if (state.concentrationActive) {
      openLog = "過度集中·戰力受壓 15%。" + openLog;
    }
    setLog(openLog);
    pulseBattleSupport("opening");
    await sleep(BATTLE_OPEN_MS);
    if (state.phase === "end") return { win: false, hpRatio: 0, aborted: true };

    let guard = 0;
    let settled = false;
    while (!settled && guard < 80 && state.phase === "battle") {
      guard += 1;
      syncPlayerUnits();
      if (!living(players).length || !living(enemies).length) {
        await sleep(500);
        if (state.phase === "end") return { win: false, hpRatio: 0, aborted: true };
        syncPlayerUnits();
        if (!living(players).length || !living(enemies).length) {
          settled = true;
          break;
        }
      }
      const order = living([...players, ...enemies]).slice().sort((a, b) => b.speed - a.speed || Math.random() - 0.5);
      for (const atk of order) {
        if (state.phase !== "battle") return { win: false, hpRatio: 0, aborted: true };
        if (atk.hp <= 0 || atk.wiped) continue;
        const foes = atk.side === "player" ? enemies : players;
        const tgt = chooseTarget(foes);
        if (!tgt) break;

        let dmg = Math.round(atk.atk * rand(0.88, 1.12));
        let crit = false;
        if (atk.side === "player" && atk.change >= 0.12) {
          dmg = Math.round(dmg * 1.35);
          crit = true;
        } else if (atk.side === "player" && atk.change > 0.0005 && Math.random() < 0.18) {
          dmg = Math.round(dmg * 1.25);
          crit = true;
        }
        const hpBefore = tgt.hp;
        strikeTarget(atk, tgt, dmg, crit);
        await sleep(crit ? BATTLE_CRIT_MS : BATTLE_STRIKE_MS);
        const badly = tgt.hp > 0 && tgt.maxHp > 0 && (tgt.hp / tgt.maxHp <= 0.4 || (hpBefore - tgt.hp) >= tgt.maxHp * 0.28);
        if (badly) await pauseForHurt(tgt);
        syncPlayerUnits();
        if (!living(players).length || !living(enemies).length) break;
      }
      if (state.phase === "battle" && living(players).length && living(enemies).length) {
        pulseBattleSupport("round");
      }
    }

    const win = living(players).length > 0 && living(enemies).length === 0;
    const hpRatio = players.reduce((a, u) => a + Math.max(0, u.hp), 0) / Math.max(1, players.reduce((a, u) => a + u.maxHp, 0));
    return { win, hpRatio };
  }

  function computePayout(result, bookBefore, bookAfter) {
    const bookDelta = bookAfter - bookBefore;
    if (result.win) {
      let cash = 160 + state.wave * 45 + Math.round(result.hpRatio * 90);
      let note = "勝出賞金 " + money(cash);
      if (bookDelta > 0) {
        const bonus = Math.max(40, Math.round(bookDelta * 0.4));
        cash += bonus;
        note = "勝出兼帳面上升，賞金 " + money(cash);
      } else if (bookDelta < 0) {
        note = "勝出，但帳面下跌。賞金 " + money(cash);
      }
      return { cash, note, bookDelta };
    }
    const loss = Math.min(state.cash, 70 + state.wave * 28);
    return { cash: -loss, note: "敗陣，損失現金 " + money(loss), bookDelta };
  }

  function scrollToArena() {
    const el = $("headline-slot") || document.querySelector(".arena");
    if (!el) return;
    const go = () => el.scrollIntoView({ behavior: "smooth", block: "start" });
    go();
    setTimeout(go, 280);
  }

  /* ===== Open market loop ===== */
  function afterHoldingsChange() {
    renderMast();
    renderBoard();
    if (state.ticketId) selectTicket(state.ticketId);
    if (state.phase === "battle") syncPlayerUnits();
    else renderIdleArmy();
    pop($("stat-cash"));
    pop($("team-power"));
    if (state.detailId) updateDetailLive();
    if (state.phase === "build") {
      updateOpenMarketButton();
    } else if (state.phase === "gap") {
      maybeEndRun();
      const now = Date.now();
      if (canBeginWave({
        phase: state.phase,
        waveBusy: state.waveBusy,
        wave: state.wave,
        now,
        nextWaveAt: state.nextWaveAt,
        marketLive: state.marketLive,
        hasHoldings: hasHoldings(),
      })) tryStartWave();
    }
  }

  function updateBoardPrices(flash) {
    for (const s of state.stocks) {
      const card = document.querySelector(`[data-card="${s.id}"]`);
      if (!card) continue;
      const cls = changeClass(s.change);
      card.classList.toggle("held", s.shares > 0);
      card.classList.toggle("selected", state.ticketId === s.id);
      const priceEl = card.querySelector(`[data-price="${s.id}"]`);
      const chgEl = card.querySelector(`[data-chg="${s.id}"]`);
      if (priceEl) {
        priceEl.textContent = money(s.price);
        priceEl.className = "price " + cls;
        if (flash) pop(priceEl);
      }
      if (chgEl) {
        chgEl.textContent = chgText(s);
        chgEl.className = "chg " + cls;
      }
      if (flash && Math.abs(s.change) > 0.0005) {
        card.classList.remove("flash-up", "flash-down");
        void card.offsetWidth;
        card.classList.add(s.change > 0 ? "flash-up" : "flash-down");
      }
    }
    updateBookAndPower();
    renderMast();
    if (state.phase === "battle") syncPlayerUnits();
    if (state.detailId) updateDetailLive();
  }

  function updateOpenMarketButton() {
    const btn = $("btn-open-market");
    const bar = $("build-bar");
    const copy = $("build-bar-text");
    const building = state.phase === "build";
    if (bar) bar.hidden = !building;
    if (btn) {
      btn.hidden = !building;
      btn.disabled = !building || !hasHoldings();
      btn.setAttribute("aria-disabled", btn.disabled ? "true" : "false");
      btn.title = btn.disabled ? "至少持有 1 股先可以開市" : "確認開市，開始行情同第一浪";
    }
    if (copy) {
      copy.textContent = hasHoldings()
        ? "開市報價凍結。買好之後撳「確認開市」，行情先會開始跳價同出第一浪。"
        : "開市報價凍結，無時限。至少買入 1 股，先可以撳「確認開市」。";
    }
  }

  function updateStatusFoot(now) {
    const status = $("wave-status");
    const kicker = $("status-kicker");
    const label = $("status-label");
    const sub = $("status-sub");
    const gapActions = $("gap-actions");
    const gapCount = $("gap-count");
    const nextBtn = $("btn-next-wave");
    if (!status || !label) return;
    const t = now || Date.now();
    const building = state.phase === "build";
    status.classList.toggle("battle", state.phase === "battle");
    status.classList.toggle("gap", state.phase === "gap");
    status.classList.toggle("opening", building);
    status.classList.toggle("build", building);
    if (kicker) kicker.textContent = state.phase === "battle" ? "FIGHT" : building ? "BUILD" : "LIVE";
    if (state.phase === "battle") {
      label.textContent = "第 " + state.wave + " 浪交戰中";
      if (sub) sub.textContent = "節奏已放慢，仍可買賣調倉";
      if (gapActions) gapActions.hidden = true;
    } else if (building) {
      label.textContent = "建倉";
      if (sub) sub.textContent = hasHoldings() ? "撳「確認開市」開始" : "價錢凍結，先買入";
      if (gapActions) gapActions.hidden = true;
    } else if (state.phase === "gap") {
      const remain = Math.max(0, Math.ceil((state.nextWaveAt - t) / 1000));
      const mid = isMidTicket();
      label.textContent = hasHoldings() ? "換倉空隙" : "請先建倉";
      if (sub) {
        if (!hasHoldings()) sub.textContent = "行情持續，至少持有 1 股先可以出浪";
        else if (mid && remain <= 0) sub.textContent = "下單完成後出下一浪";
        else sub.textContent = "下一浪倒數 " + remain + " 秒，準備好可提早開打";
      }
      if (gapActions) gapActions.hidden = !hasHoldings();
      if (gapCount) gapCount.textContent = String(remain);
      if (nextBtn) nextBtn.disabled = !hasHoldings();
    } else if (state.phase === "reward" || state.phase === "choice") {
      label.textContent = state.phase === "reward" ? "選擇祝福" : "大目標";
      if (sub) sub.textContent = "仍可買賣";
      if (gapActions) gapActions.hidden = true;
    } else if (state.phase === "start") {
      label.textContent = "等候開局";
      if (sub) sub.textContent = "";
      if (gapActions) gapActions.hidden = true;
    } else {
      label.textContent = "收市";
      if (sub) sub.textContent = "";
      if (gapActions) gapActions.hidden = true;
    }
    updateOpenMarketButton();
  }

  function setIdleHeadline() {
    setHeadline("", "idle");
  }

  function stopClock() {
    if (state.clockId) {
      clearInterval(state.clockId);
      state.clockId = 0;
    }
    state.clockPaused = true;
    state.waveBusy = false;
  }

  function startClock() {
    stopClock();
    const now = Date.now();
    state.clockPaused = false;
    state.marketLive = true;
    state.firstEventPending = true;
    state.sessionIndex = 0;
    state.nextTickAt = now + PRICE_TICK_MS + rand(-400, 400);
    state.nextEventAt = now + rand(8000, 18000);
    state.nextSessionAt = now + SESSION_MS;
    if (state.wave === 1 && (!state.nextWaveAt || state.nextWaveAt > now)) {
      state.nextWaveAt = now;
    }
    state.waitBookLogged = false;
    for (const s of state.stocks) openForming(s);
    state.clockId = setInterval(clockStep, CLOCK_MS);
    updateStatusFoot(now);
  }

  function clockStep() {
    if (!shouldMarketRun({
      clockPaused: state.clockPaused,
      phase: state.phase,
      marketLive: state.marketLive,
    })) return;
    const now = Date.now();
    updateStatusFoot(now);
    if (now >= state.nextTickAt) {
      runPriceTick();
      state.nextTickAt = now + PRICE_TICK_MS + rand(-400, 400);
    }
    if (now >= state.nextEventAt) {
      runHeadlineEvent();
      if (state.firstEventPending) state.firstEventPending = false;
      state.nextEventAt = now + rand(EVENT_MIN_MS, EVENT_MAX_MS);
    }
    if (now >= state.nextSessionAt) {
      closeAllSessions();
      state.nextSessionAt = now + SESSION_MS;
    }
    if (state.phase === "gap" && !state.waveBusy && now >= state.nextWaveAt) {
      tryStartWave();
    }
  }

  function sessionChangeBase(s) {
    return s.forming && s.forming.o ? s.forming.o : s.prevPrice || s.price;
  }

  function runPriceTick() {
    if (!shouldMarketRun({ clockPaused: state.clockPaused, phase: state.phase, marketLive: state.marketLive })) return;
    for (const s of state.stocks) {
      s.prevPrice = s.price;
      let ch = rand(-0.016, 0.016) * s.vol + rand(-0.006, 0.006);
      if (state.concentrationActive && s.shares > 0) ch = ch * 1.1 - 0.005;
      s.price = clampPrice(s.price * (1 + ch));
      applyTickToForming(s);
      const base = sessionChangeBase(s);
      s.change = base ? (s.price - base) / base : 0;
    }
    afterPriceMove(false);
  }

  function closeAllSessions() {
    state.sessionIndex += 1;
    const label = "第" + state.sessionIndex + "節";
    for (const s of state.stocks) closeFormingSession(s, label);
    if (state.detailId) updateDetailLive();
  }

  function runHeadlineEvent() {
    if (state.phase === "start" || state.phase === "end") return;
    const majorChance = state.wave >= 6 ? 0.6 : state.wave <= 2 ? 0.35 : 0.45;
    const forceMinor = Math.random() >= majorChance;
    const event = pickEvent(forceMinor);
    state.lastHeadline = event.headline;
    state.lastTone = event.tone;
    const kicker = state.concentrationActive && state.phase === "battle" ? "過度集中·戰力受壓" : "";
    setHeadline(event.headline, event.tone, kicker);
    applyEvent(event);
    closeAllSessions();
    state.nextSessionAt = Date.now() + SESSION_MS;
    afterPriceMove(true);
    if (typeof sfx !== "undefined") sfx.gong();
    setLog((forceMinor ? "短訊 · " : "號外 · ") + event.headline);
    buildTape();
  }

  function afterPriceMove(isEvent) {
    updateBoardPrices(isEvent);
    if (isEvent) {
      const deltaHeld = state.stocks.some((s) => s.shares > 0 && Math.abs(s.change) >= 0.03);
      if (deltaHeld) {
        const down = state.stocks.some((s) => s.shares > 0 && s.change <= -0.12);
        if (down) shake(true);
        else shake(false);
        state.stocks.forEach((s) => {
          if (s.shares > 0 && s.change <= -0.03) sfx.down();
          else if (s.shares > 0 && s.change >= 0.03) sfx.up();
        });
      }
    }
    maybeEndRun();
  }

  function maybeEndRun() {
    if (state.phase === "end" || state.phase === "start" || state.phase === "battle" || state.phase === "build" || state.phase === "reward" || state.phase === "choice") return false;
    if (!canAffordAnything()) {
      endRun("bust");
      return true;
    }
    return false;
  }

  function tryStartWave(opts) {
    if (state.phase !== "gap" || state.waveBusy) return;
    const now = Date.now();
    const force = !!(opts && opts.force);
    if (!canBeginWave({
      phase: state.phase,
      waveBusy: state.waveBusy,
      wave: state.wave,
      now,
      nextWaveAt: state.nextWaveAt,
      marketLive: state.marketLive,
      hasHoldings: hasHoldings(),
      midTicket: force ? false : isMidTicket(),
      force: force,
    })) {
      if (state.phase === "gap" && !state.waveBusy && !hasHoldings()) {
        const ready = state.wave === 1 ? !!state.marketLive : (force || now >= state.nextWaveAt);
        if (ready && !state.waitBookLogged) {
          setLog("至少持有 1 股先可以迎戰下一浪。行情仍然繼續。");
          state.waitBookLogged = true;
        }
      }
      updateStatusFoot(now);
      return;
    }
    state.waitBookLogged = false;
    beginWave();
  }

  async function beginWave() {
    if (state.waveBusy || state.phase !== "gap") return;
    state.waveBusy = true;
    ensureRotation();
    const currentSet = holdingSetKey(state.stocks);
    const concentrated = shouldPenalize(state.wave, state.lastHoldingSet, currentSet);
    state.concentrationActive = concentrated;
    state.lastHoldingSet = currentSet;
    state.phase = "battle";
    state.lastBook = portfolioValue();
    onBattleViewCue();
    renderAll();
    updateStatusFoot();
    scrollToArena();
    if (concentrated) {
      setHeadline(state.lastHeadline || "交戰", state.lastTone || "good", "過度集中·戰力受壓");
    }
    const result = await runBattle();
    state.fight = null;
    state.waveBusy = false;
    if (state.phase === "end" || state.fatalDeath || (result && result.aborted)) return;

    const bookAfter = portfolioValue();
    const payout = computePayout(result, state.lastBook, bookAfter);
    state.cash = Math.max(0, state.cash + payout.cash);
    state.floorsCleared = Math.max(state.floorsCleared || 0, state.wave);
    if (result.win && isBossWave(state.wave) && state.bossesCleared.indexOf(state.wave) < 0) {
      state.bossesCleared = state.bossesCleared.concat([state.wave]);
    }
    consumeRotationAfterWave();

    if (result.win) sfx.win();
    else sfx.lose();
    if (payout.cash < 0) shake(false);

    setHeadline(result.win ? "勝出" : "敗陣", result.win ? "good" : "bad", state.concentrationActive ? "過度集中·戰力受壓" : "");
    setLog(payout.note);
    sfx.cash();
    flyFromEl($("stat-cash"), (payout.cash >= 0 ? "+" : "") + money(payout.cash), "cash");
    renderMast();
    pop($("stat-cash"));
    pop($("stat-wealth"));
    await sleep(1400);
    if (state.phase === "end" || state.fatalDeath) return;

    if (!canAffordAnything()) {
      endRun("bust");
      return;
    }
    if (result.win && isBossWave(state.wave)) {
      showRewardPick();
      return;
    }
    if (shouldOfferWealthWin({ wealth: wealth(), goal: WEALTH_GOAL, wealthContinued: state.wealthContinued, wealthOffered: state.wealthOffered })) {
      showWealthChoice();
      return;
    }
    enterGapAfterWave();
  }

  function confirmOpenMarket() {
    const plan = planConfirmOpenMarket({
      phase: state.phase,
      hasHoldings: hasHoldings(),
      marketLive: state.marketLive,
      wave: state.wave,
    });
    if (!plan.ok) {
      updateOpenMarketButton();
      if (state.phase === "build") {
        setLog("至少買入 1 股，先可以確認開市。開市報價仍然凍結。");
      }
      return false;
    }
    state.marketLive = true;
    state.phase = "gap";
    state.waitBookLogged = false;
    state.nextWaveAt = Date.now();
    setHeadline("開市", "good");
    setLog("開市！行情開始行，第一浪即將出陣。");
    updateOpenMarketButton();
    startClock();
    renderAll();
    if (typeof sfx !== "undefined" && sfx.gong) sfx.gong();
    tryStartWave();
    return true;
  }

  function hidePick() {
    const el = $("overlay-pick");
    if (el) el.classList.remove("show");
  }

  function enterGapAfterWave() {
    state.wave += 1;
    state.phase = "gap";
    state.concentrationActive = false;
    if (state.runBuffs && state.runBuffs.cashNextGap) {
      const amt = state.runBuffs.cashNextGap;
      state.cash += amt;
      state.runBuffs.cashNextGap = 0;
      setLog("空隙撥備到帳 " + money(amt) + "。");
      if (sfx.cash) sfx.cash();
    }
    ensureRotation();
    state.nextWaveAt = Date.now() + WAVE_GAP_MS;
    state.waitBookLogged = false;
    hidePick();
    setIdleHeadline();
    setLog("換倉空隙約 " + Math.round(WAVE_GAP_MS / 1000) + " 秒，行情繼續行。倒數完先出下一層；準備好可以撳「下一浪」。大目標 " + money(WEALTH_GOAL) + "。");
    renderAll();
    updateStatusFoot();
  }

  function showRewardPick() {
    state.phase = "reward";
    const picks = pickBossRewards((state.runBuffs && state.runBuffs.taken) || [], getMeta(), 3, Math.random);
    if (!picks.length) {
      if (shouldOfferWealthWin({ wealth: wealth(), goal: WEALTH_GOAL, wealthContinued: state.wealthContinued, wealthOffered: state.wealthOffered })) {
        showWealthChoice();
      } else {
        enterGapAfterWave();
      }
      return;
    }
    const card = $("pick-card");
    const overlay = $("overlay-pick");
    if (!card || !overlay) {
      enterGapAfterWave();
      return;
    }
    card.innerHTML = `
      <div class="end-kicker">BOSS 祝福</div>
      <h2>第 ${state.wave} 層通過 · 三選一</h2>
      <p>揀一項本局祝福。揀完會進入較長嘅換倉空隙。</p>
      <div class="pick-choices">
        ${picks.map((item, i) => `<button type="button" data-buff="${item.id}">${item.name}<br><span>${item.line}</span></button>`).join("")}
      </div>`;
    overlay.classList.add("show");
    card.querySelectorAll("[data-buff]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = picks.find((x) => x.id === btn.getAttribute("data-buff"));
        state.runBuffs = applyRunBuff(state.runBuffs, item);
        hidePick();
        setLog("獲得祝福：" + ((item && item.name) || "") + "。");
        if (shouldOfferWealthWin({ wealth: wealth(), goal: WEALTH_GOAL, wealthContinued: state.wealthContinued, wealthOffered: state.wealthOffered })) {
          showWealthChoice();
        } else {
          enterGapAfterWave();
        }
      }, { once: true });
    });
    renderAll();
  }

  function showWealthChoice() {
    state.phase = "choice";
    state.wealthOffered = true;
    const card = $("pick-card");
    const overlay = $("overlay-pick");
    if (!card || !overlay) {
      enterGapAfterWave();
      return;
    }
    card.innerHTML = `
      <div class="end-kicker">大目標</div>
      <h2>已經賺夠 ${money(WEALTH_GOAL)}</h2>
      <p>而家總資產 ${money(wealth())}。可以宣告勝出，或者繼續向下打。</p>
      <div class="choice-actions">
        <button type="button" id="btn-take-win">賺夠，宣告勝出</button>
        <button type="button" id="btn-keep-climb">繼續向下打</button>
      </div>`;
    overlay.classList.add("show");
    const take = $("btn-take-win");
    const keep = $("btn-keep-climb");
    if (take) take.addEventListener("click", () => { hidePick(); endRun("wealth"); }, { once: true });
    if (keep) keep.addEventListener("click", () => {
      state.wealthContinued = true;
      hidePick();
      setLog("繼續向下打。隨時可以撳「宣告勝出」收市。");
      enterGapAfterWave();
    }, { once: true });
    renderAll();
  }

  function renderMetaShop() {
    const box = $("meta-shop");
    if (!box) return;
    const meta = getMeta();
    const items = META_SHOP.map((item) => {
      const have = !!(meta.purchased && meta.purchased[item.id]);
      const can = !have && meta.points >= item.cost;
      return `<div class="meta-item"><div><strong>${item.name}</strong>（${item.cost} 點）${have ? " · 已解鎖" : ""}<div>${item.line}</div></div><button type="button" data-meta="${item.id}" ${can ? "" : "disabled"}>${have ? "已有" : "兌換"}</button></div>`;
    }).join("");
    box.innerHTML = `<h3>局外成長</h3><div class="meta-points">可用點數 ${meta.points}　最高層 ${meta.bestFloor || 0}　勝場 ${meta.wins || 0}</div>${items || "<p>尚未有可兌換項目。</p>"}`;
  }

  function startRun() {
    stopClock();
    hidePick();
    const meta = getMeta();
    state.startCash = startCashOf(meta);
    state.cash = state.startCash;
    state.wave = 1;
    state.phase = "build";
    state.stocks = newStocks();
    state.lastHeadline = "";
    state.lastTemplate = "";
    state.lastTone = "good";
    state.lastBook = 0;
    state.runOver = false;
    state.lastHoldingSet = null;
    state.concentrationActive = false;
    state.fight = null;
    state.waveBusy = false;
    state.hoverIndex = null;
    state.ticketId = null;
    state.ticketQty = 1;
    state.realizedDay = 0;
    state.marketLive = false;
    state.waitBookLogged = false;
    state.lastWipeNote = null;
    state.nextWaveAt = 0;
    state.floorsCleared = 0;
    state.bossesCleared = [];
    state.runBuffs = seedRunBuffsFromMeta(meta);
    state.rotation = rollRotation(null, rotationSectorList(getUnlocks()), Math.random);
    state.wealthContinued = false;
    state.wealthOffered = false;
    state.didAutoArena = false;
    state.fatalDeath = false;
    state.ticketTouchedAt = 0;
    state.ticketPointer = false;
    closeDetail();
    setPhoneTab("quotes");
    $("overlay-start").classList.remove("show");
    $("overlay-end").classList.remove("show");
    setIdleHeadline();
    setHeadline("", "build");
    setLog("開局資金 " + money(state.startCash) + "。而家係無時限建倉：開市報價凍結，可以慢慢買好第一批。至少持有 1 股之後撳「確認開市」，行情先會開始行，然後第一浪出陣。");
    refreshStartRules();
    renderAll();
    buildTape();
    updateOpenMarketButton();
  }

  function endRun(kind) {
    stopClock();
    hidePick();
    state.phase = "end";
    state.runOver = true;
    state.concentrationActive = false;
    state.waveBusy = false;
    closeDetail();
    const card = $("end-card");
    const w = wealth();
    const floors = state.floorsCleared || 0;
    const bosses = (state.bossesCleared || []).slice();
    const grant = grantRunMeta({ kind: kind, floorsCleared: floors, bossesCleared: bosses });
    const notes = (grant.notes || []).map((n) => `<p class="unlock-note">${n}</p>`).join("");
    let kicker = "收市結算";
    let title = "收市";
    let body = "";
    if (kind === "goal" || kind === "wealth") {
      kicker = "號外";
      title = "達標出陣";
      body = `總資產 ${money(w)}，達到大目標 ${money(WEALTH_GOAL)}。今轉清到第 ${floors} 層。`;
      sfx.win();
    } else if (kind === "bust") {
      kicker = "停牌";
      title = "破產收市";
      body = "現金同持倉都再買唔起下一手。呢局完結，要重新掛牌。";
      sfx.lose();
    } else if (kind === "death" || kind === "wipeout") {
      kicker = "出陣失敗";
      title = "全軍覆沒";
      body = `出陣怪獸都已陣亡清倉。呢局完結，剩低現金唔可以再重組。今轉清到第 ${floors} 層。`;
      sfx.lose();
    } else {
      title = "收市結算";
      body = `今轉清到第 ${floors} 層，總資產 ${money(w)}。`;
    }
    const book = state.stocks
      .filter((s) => s.shares > 0)
      .map((s) => `${s.name} ${s.shares} 股（${money(s.price)}）`)
      .join(" · ") || "無持倉";
    const bossTxt = bosses.length ? bosses.map((n) => "第 " + n + " 層").join("、") : "未通過 Boss";
    if (card) {
      card.innerHTML = `
      <div class="end-kicker">${kicker}</div>
      <h2>${title}</h2>
      <p>${body}</p>
      ${notes}
      <div class="end-numbers">層數 ${floors}　Boss ${bossTxt}<br>總資產 ${money(w)}　現金 ${money(state.cash)}</div>
      <p>最後持倉：${book}</p>
      <button type="button" class="btn-open" id="btn-again">
        <span class="btn-open-kicker">RELIST</span>
        <span class="btn-open-label">重新掛牌</span>
      </button>`;
      $("overlay-end").classList.add("show");
      const again = $("btn-again");
      if (again) again.addEventListener("click", restart, { once: true });
    }
    refreshStartRules();
    renderMetaShop();
  }

  function restart() {
    $("overlay-end").classList.remove("show");
    startRun();
  }

  function buildTape() {
    const listed = state.stocks.length ? state.stocks : visibleStocks();
    const bits = listed.map((s) => {
      const cls = s.change > 0.0005 ? "up" : s.change < -0.0005 ? "down" : "";
      const chg = Math.abs(s.change) > 0.0005 ? " " + pct(s.change) : "";
      return `<span${cls ? ` class="${cls}"` : ""}>${s.name} ${s.ticker || s.en} ${money(s.price)}${chg} ${s.sector}</span>`;
    });
    bits.push("<span>升紅跌綠 · 港式行情</span>");
    bits.push("<span>同一個板塊有兩隻怪揀</span>");
    bits.push("<span>行情持續跳價，沽空自動分浪出陣</span>");
    bits.push("<span>下單票買賣 · 持倉睇成本同盈虧</span>");
    bits.push("<span>連續兩浪同一持倉會有過度集中懲罰</span>");
    bits.push("<span>撳圖示睇檔案，撳名稱或價錢揀嚟買賣</span>");
    bits.push("<span>大目標 " + money(WEALTH_GOAL) + " · 向上爬層</span>");
    const html = bits.join("") + bits.join("");
    const tape = $("tape");
    if (tape) tape.innerHTML = html;
  }

  function refreshStartRules() {
    const el = $("rule-unlock");
    if (el) {
      const unlocked = typeof getUnlocks === "function" && getUnlocks().insurance;
      el.textContent = unlocked
        ? "已解鎖保險板塊：" + insurancePairText() + " 會出現喺行情板上。"
        : "達標或打到第 10 層會解鎖新板塊「保險」，下轉可以再玩。";
    }
    renderMetaShop();
  }

  /* ===== Events ===== */
  function setup() {
    refreshStartRules();
    $("btn-start").addEventListener("click", () => {
      ctx();
      startRun();
    });
    const openBtn = $("btn-open-market");
    if (openBtn) {
      openBtn.addEventListener("click", () => {
        if (openBtn.disabled) return;
        ctx();
        confirmOpenMarket();
      });
    }
    $("btn-mute").addEventListener("click", () => {
      state.muted = !state.muted;
      if (!state.muted) ctx();
      $("btn-mute").classList.toggle("muted", state.muted);
      $("btn-mute").textContent = state.muted ? "×♪" : "♪";
    });

    const market = document.querySelector(".market");
    if (market) {
      market.addEventListener("click", (e) => {
        const file = e.target.closest("[data-file]");
        if (file) {
          openDetail(file.dataset.file);
          return;
        }
        const pick = e.target.closest("[data-quote-select]");
        if (pick) {
          const id = pick.dataset.quoteSelect;
          if (id) selectTicket(id);
        }
      });
      let timer = 0;
      let interval = 0;
      const stop = () => {
        clearTimeout(timer);
        clearInterval(interval);
        interval = 0;
      };
      const ticketAct = (target) => {
        const btn = target && target.closest && target.closest("[data-ticket]");
        if (!btn || btn.disabled) return false;
        const act = btn.dataset.ticket;
        touchTicket();
        if (act === "qty-minus") setTicketQty(ticketQtyValue() - 1);
        else if (act === "qty-plus") setTicketQty(ticketQtyValue() + 1);
        else if (act === "qty-max") {
          const s = state.stocks.find((x) => x.id === state.ticketId);
          if (!s) return true;
          const maxBuy = s.price > 0 ? Math.floor(state.cash / s.price) : 0;
          setTicketQty(Math.max(1, maxBuy, s.shares || 1));
        } else if (act === "buy") buyQty(state.ticketId, ticketQtyValue());
        else if (act === "sell") sellQty(state.ticketId, ticketQtyValue());
        return true;
      };
      market.addEventListener("pointerdown", (e) => {
        if (e.button && e.button !== 0) return;
        if (!ticketAct(e.target)) return;
        const btn = e.target.closest("[data-ticket]");
        if (!btn || (btn.dataset.ticket !== "qty-minus" && btn.dataset.ticket !== "qty-plus")) return;
        state.ticketPointer = true;
        touchTicket();
        stop();
        timer = setTimeout(() => {
          interval = setInterval(() => ticketAct(btn), 90);
        }, 400);
      });
      const stopHold = () => { state.ticketPointer = false; touchTicket(); stop(); };
      window.addEventListener("pointerup", stopHold);
      window.addEventListener("pointercancel", stopHold);
    }

    const qtyInput = $("ticket-qty");
    if (qtyInput) {
      qtyInput.addEventListener("focus", touchTicket);
      qtyInput.addEventListener("keydown", touchTicket);
      qtyInput.addEventListener("input", () => {
        touchTicket();
        const n = parseInt(qtyInput.value, 10);
        if (Number.isFinite(n) && n >= 1) state.ticketQty = n;
        updateTicketLive();
      });
      qtyInput.addEventListener("change", () => { touchTicket(); setTicketQty(qtyInput.value); });
    }

    const arena = document.querySelector(".arena");
    if (arena) {
      arena.addEventListener("click", (e) => {
        const unit = e.target.closest(".unit[data-stock]");
        if (unit) openDetail(unit.dataset.stock);
      });
    }

    const detailOverlay = $("overlay-detail");
    if (detailOverlay) {
      detailOverlay.addEventListener("click", (e) => {
        if (e.target === detailOverlay) closeDetail();
      });
    }
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && state.detailId) {
        closeDetail();
      }
    });

    const tabs = $("phone-tabs");
    if (tabs) {
      tabs.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-tab]");
        if (btn) setPhoneTab(btn.getAttribute("data-tab"));
      });
    }
    const banner = $("fight-banner");
    if (banner) banner.addEventListener("click", () => setPhoneTab("arena"));
    const nextBtn = $("btn-next-wave");
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        ctx();
        tryStartWave({ force: true });
      });
    }
    const cashout = $("btn-cashout");
    if (cashout) cashout.addEventListener("click", () => {
      if (state.wealthContinued && state.phase !== "end" && state.phase !== "start") endRun("wealth");
    });
    const shop = $("meta-shop");
    if (shop) {
      shop.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-meta]");
        if (!btn || btn.disabled) return;
        const res = buyMetaUnlock(btn.getAttribute("data-meta"));
        if (res.ok) renderMetaShop();
      });
    }
    setPhoneTab(state.phoneTab || "quotes");

    buildTape();
    state.stocks = newStocks();
    renderMast();
    renderBoard();
    renderIdleArmy();
    updateAccountBar();
    refreshStartRules();
  }

  const TickerBeastsLogic = {
    STOCKS,
    UNLOCK_KEY,
    ENEMY_BUDGET,
    START_CASH,
    GOAL,
    WEALTH_GOAL,
    CONCENTRATION_CUT,
    PRE_CANDLES,
    PRICE_TICK_MS,
    EVENT_MIN_MS,
    EVENT_MAX_MS,
    SESSION_MS,
    newStocks,
    visibleStocks,
    getUnlocks,
    setUnlocks,
    grantVictoryUnlock,
    holdingSetKey,
    shouldPenalize,
    concentratedPower,
    resolveSpecialEvent,
    seedHistory,
    makeCandle,
    appendCandle,
    openForming,
    applyTickToForming,
    closeFormingSession,
    chartHistory,
    klineLayout,
    priceLinePoints,
    nearestCandleIndex,
    candleReadout,
    positionMetrics,
    portfolioPnL,
    applyBuy,
    applySell,
    WAVE_GAP_MS,
    HEAL_RATIO,
    SUPPLY_RATIO,
    SECTOR_ORDER,
    COMBAT_TRAITS,
    traitsOf,
    combatProfile,
    canBeginWave,
    isBuildPhase,
    isMarketFrozen,
    shouldMarketRun,
    canConfirmOpenMarket,
    planConfirmOpenMarket,
    applyDeathWipe,
    applyHealToLiving,
    applyShieldToLiving,
    applyIncomingDamage,
    livingCombatants,
    supportLog,
    META_KEY,
    META_SHOP,
    RUN_BUFF_POOL,
    SYNERGY_DEFS,
    getMeta,
    setMeta,
    grantRunMeta,
    startCashOf,
    buyMetaUnlock,
    seedRunBuffsFromMeta,
    bossKind,
    isBossWave,
    enemyBudgetFor,
    rollRotation,
    sectorModifier,
    rotationText,
    activeSynergies,
    synergyEffects,
    pickBossRewards,
    applyRunBuff,
    runOutcomeAfterDeath,
    canAffordNextRound,
    runOutcomeAfterBankruptcy,
    shouldOfferWealthWin,
    BATTLE_OPEN_MS,
    BATTLE_STRIKE_MS,
    BATTLE_CRIT_MS,
    BATTLE_HURT_MS,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = TickerBeastsLogic;
  } else if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", setup);
    } else {
      setup();
    }
  }
})();
