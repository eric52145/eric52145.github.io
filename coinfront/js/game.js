    (() => {
      const ASSET_URIS = window.COINFRONT_ASSET_URIS || {};
      const ASSETS = {};
      Object.entries(ASSET_URIS).forEach(([k, uri]) => {
        const img = new Image();
        img.src = uri;
        ASSETS[k] = img;
      });
      // Native-wide desktop backgrounds (tiled from the prototype, not stretched).
      const EXTRA_SPRITES = [
        ['bg_pusher_wide', 'assets/bg_pusher_wide.png'],
        ['bg_battle_wide', 'assets/bg_battle_wide.png'],
        ['pusher_bar_wide', 'assets/pusher_bar_wide.png'],
        ['pusher_bar_clean', 'assets/pusher_bar.png']
      ];
      ['knight','archer','shield','mage','spear','priest','hound','bombard','rogue','banner','frost','alchemist'].forEach(k => {
        EXTRA_SPRITES.push(['unit_' + k + '_south', 'assets/units/' + k + '_south.png']);
      });
      ['goblin','slime','wolf','imp','orc','troll','caster','skel','shaman','bomber','brute','boss','bat','beetle','wraith','stoneboss','witch','colossus'].forEach(k => {
        EXTRA_SPRITES.push(['unit_' + k + '_north', 'assets/units/' + k + '_north.png']);
      });
      ['banner','frost','alchemist'].forEach(k => {
        EXTRA_SPRITES.push(['c_' + k, 'assets/units/c_' + k + '.png']);
      });
      EXTRA_SPRITES.forEach(([k, url]) => {
        const img = new Image();
        img.onload = () => { try { if (typeof render === 'function') render(); } catch (_) {} };
        img.src = url;
        ASSETS[k] = img;
      });
      function imgReady(img) {
        return img && img.complete && img.naturalWidth > 0;
      }
      function pickUnitSprite(key, facing) {
        // Prefer the original hand-painted portraits when they exist (style anchors).
        // Otherwise use the facing-correct 16-bit sheet (south = ally back, north = enemy front).
        if (facing === 'south') {
          const orig = ASSETS['s_' + key];
          if (imgReady(orig)) return orig;
          const neu = ASSETS['unit_' + key + '_south'];
          if (imgReady(neu)) return neu;
        } else {
          const orig = ASSETS['e_' + key] || (key && ASSETS[key]);
          if (imgReady(orig)) return orig;
          const neu = ASSETS['unit_' + key + '_north'];
          if (imgReady(neu)) return neu;
        }
        return null;
      }
      function pickCoinSprite(type) {
        const fromUri = ASSETS['c_' + type];
        if (imgReady(fromUri)) return fromUri;
        return null;
      }

      const PUSHER_ART_ASPECT = 1440 / 240;
      const BATTLE_ART_ASPECT = 1440 / 400;

      // Battlefield bitmap is 1440×400: 88px wall, 6×48px grass tiles, 24px footer.
      const BATTLE_ART_W = 1440;
      const BATTLE_ART_H = 400;
      const BATTLE_TILE = 48;
      const BATTLE_WALL_H = 88;
      const BATTLE_FOOT_H = 24;

      function chooseBattleTileOut(dw, dh) {
        if (Math.abs(dw - BATTLE_ART_W) <= 2) return BATTLE_TILE; // 1:1 on the 1440 desktop stage
        const raw = Math.max(dw / BATTLE_ART_W, dh / BATTLE_ART_H);
        const target = BATTLE_TILE * raw;
        let best = Math.max(1, Math.round(target));
        let bestScore = -1e9;
        const lo = Math.max(1, Math.floor(target) - 16);
        const hi = Math.ceil(target) + 16;
        for (let t = lo; t <= hi; t++) {
          const pad = dw % t;
          const wallD = Math.round(BATTLE_WALL_H * t / BATTLE_TILE);
          const footD = Math.round(BATTLE_FOOT_H * t / BATTLE_TILE);
          const grass = dh - wallD - footD;
          if (grass < t) continue;
          let s = -Math.abs(t - target) * 2;
          if (pad === 0) s += 80;
          else s -= Math.min(pad, t - pad) * 0.6;
          s -= (grass % t) * 0.3;
          if (s > bestScore) { bestScore = s; best = t; }
        }
        return best;
      }

      function drawBattleBackground(dx, dy, dw, dh) {
        const img = imgReady(ASSETS.bg_battle_wide) ? ASSETS.bg_battle_wide
          : (imgReady(ASSETS.bg_battle) ? ASSETS.bg_battle : null);
        if (!img || dw < 1 || dh < 1) return false;
        const iw = img.naturalWidth || BATTLE_ART_W;
        const ih = img.naturalHeight || BATTLE_ART_H;
        const TILE = (iw === BATTLE_ART_W && ih === BATTLE_ART_H) ? BATTLE_TILE : null;
        const prev = ctx.imageSmoothingEnabled;
        ctx.imageSmoothingEnabled = false;
        if (!TILE) {
          const scale = Math.max(dw / iw, dh / ih);
          const sw = dw / scale, sh = dh / scale;
          const sx = (iw - sw) / 2;
          ctx.drawImage(img, sx, 0, sw, sh, dx, dy, dw, dh);
          ctx.imageSmoothingEnabled = prev;
          return true;
        }
        const tileOut = chooseBattleTileOut(dw, dh);
        const nSrcCols = Math.floor(iw / TILE);
        const nCols = Math.max(1, Math.floor(dw / tileOut));
        const x0 = Math.floor((dw - nCols * tileOut) / 2);
        let startCol = Math.round((nSrcCols - nCols) / 2);
        startCol = Math.max(0, Math.min(nSrcCols - nCols, startCol));
        const wallD = Math.round(BATTLE_WALL_H * tileOut / TILE);
        const footD = Math.round(BATTLE_FOOT_H * tileOut / TILE);
        const grassD = Math.max(0, dh - wallD - footD);
        const nRows = Math.max(1, Math.floor(grassD / tileOut));
        const nSrcRows = Math.floor((ih - BATTLE_WALL_H - BATTLE_FOOT_H) / TILE);
        const srcX = startCol * TILE;
        const srcW = nCols * TILE;
        const destX = dx + x0;
        const destW = nCols * tileOut;
        if (x0 > 0 || destX + destW < dx + dw) {
          ctx.fillStyle = '#5e9337';
          ctx.fillRect(dx, dy, dw, dh);
        }
        ctx.drawImage(img, srcX, 0, srcW, BATTLE_WALL_H, destX, dy, destW, wallD);
        const emptyCol = 12, emptyRow = 1;
        for (let r = 0; r < nRows; r++) {
          const srcRow = (r < nSrcRows) ? r : emptyRow;
          const sy = BATTLE_WALL_H + srcRow * TILE;
          const dyR = dy + wallD + r * tileOut;
          ctx.drawImage(img, srcX, sy, srcW, TILE, destX, dyR, destW, tileOut);
        }
        const usedGrass = nRows * tileOut;
        if (usedGrass < grassD) {
          ctx.fillStyle = '#5e9337';
          ctx.fillRect(destX, dy + wallD + usedGrass, destW, grassD - usedGrass);
        }
        const footY = dy + dh - footD;
        ctx.drawImage(img, srcX, ih - BATTLE_FOOT_H, srcW, BATTLE_FOOT_H, destX, footY, destW, footD);
        ctx.imageSmoothingEnabled = prev;
        return true;
      }

      function drawImageCover(img, dx, dy, dw, dh, alignY) {
        if (!imgReady(img) || dw < 1 || dh < 1) return false;
        const iw = img.naturalWidth;
        const ih = img.naturalHeight;
        const scale = Math.max(dw / iw, dh / ih);
        const sw = dw / scale;
        const sh = dh / scale;
        const sx = (iw - sw) / 2;
        let sy;
        if (alignY === 'top') sy = 0;
        else if (alignY === 'bottom') sy = ih - sh;
        else sy = (ih - sh) / 2;
        const prev = ctx.imageSmoothingEnabled;
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
        ctx.imageSmoothingEnabled = prev;
        return true;
      }

      function pickPusherBar() {
        return imgReady(ASSETS.pusher_bar_wide) ? ASSETS.pusher_bar_wide
          : (imgReady(ASSETS.pusher_bar_clean) ? ASSETS.pusher_bar_clean
          : (imgReady(ASSETS.pusher_bar) ? ASSETS.pusher_bar : null));
      }

      let woodTileCanvas = null;
      function getWoodPattern() {
        if (!woodTileCanvas) {
          const src = pickPusherBar();
          if (!src) return null;
          const bw = src.naturalWidth, bh = src.naturalHeight;
          const tw = 96, th = 40;
          woodTileCanvas = document.createElement('canvas');
          woodTileCanvas.width = tw;
          woodTileCanvas.height = th;
          const tctx = woodTileCanvas.getContext('2d');
          tctx.imageSmoothingEnabled = false;
          // Upper wood surface only — skip the brass front face so the plate grain matches the lip
          const srcY = Math.max(2, Math.round(bh * 0.08));
          const srcH = Math.max(12, Math.round(bh * 0.42));
          const srcX = Math.min(52, Math.floor(bw * 0.12));
          const srcW = Math.max(24, Math.min(160, bw - srcX * 2));
          tctx.drawImage(src, srcX, srcY, srcW, srcH, 0, 0, tw, th);
        }
        return ctx.createPattern(woodTileCanvas, 'repeat');
      }

      function drawPusherFace(pLeft, frontY, pW) {
        const bar = pickPusherBar();
        // Constant-height front lip (does not stretch with pusher travel)
        const faceH = Math.max(16, Math.round(26 * (PUSHER_PANEL_H / 240)));
        const prev = ctx.imageSmoothingEnabled;
        ctx.imageSmoothingEnabled = false;
        if (bar) {
          const bw = bar.naturalWidth, bh = bar.naturalHeight;
          const faceSrcY = Math.round(bh * 0.55);
          const faceSrcH = Math.max(8, bh - faceSrcY);
          const capSrc = Math.min(40, Math.floor(bw * 0.10));
          const us = faceH / faceSrcH;
          const destCap = Math.max(10, Math.round(capSrc * us));
          const midEnd = pLeft + pW - destCap;
          ctx.drawImage(bar, 0, faceSrcY, capSrc, faceSrcH, pLeft, frontY, destCap, faceH);
          const midSrcX = capSrc;
          const midSrcW = Math.max(1, bw - capSrc * 2);
          const tileW = midSrcW * us;
          let dx = pLeft + destCap;
          if (tileW < 4) {
            ctx.drawImage(bar, midSrcX, faceSrcY, midSrcW, faceSrcH, dx, frontY, Math.max(1, midEnd - dx), faceH);
          } else {
            while (dx < midEnd) {
              const dw = Math.min(tileW, midEnd - dx);
              const sw = Math.max(1, dw / us);
              ctx.drawImage(bar, midSrcX, faceSrcY, sw, faceSrcH, dx, frontY, dw, faceH);
              dx += dw;
            }
          }
          ctx.drawImage(bar, bw - capSrc, faceSrcY, capSrc, faceSrcH, pLeft + pW - destCap, frontY, destCap, faceH);
        } else {
          ctx.fillStyle = '#b8862e';
          ctx.fillRect(pLeft, frontY, pW, faceH);
          ctx.fillStyle = '#e8c35a';
          ctx.fillRect(pLeft + 2, frontY + 2, pW - 4, Math.max(2, Math.round(faceH * 0.32)));
          ctx.fillStyle = '#6a4a18';
          ctx.fillRect(pLeft, frontY + faceH - 3, pW, 3);
        }
        ctx.imageSmoothingEnabled = prev;
        return faceH;
      }

      function drawPusherPlate() {
        const frontY = state.pusherY;
        const backY = BED_TOP + 4;
        const lB = getRailLeft(backY) - 2;
        const rB = getRailRight(backY) + 2;
        const lF = getRailLeft(frontY) - 4;
        const rF = getRailRight(frontY) + 4;
        const pLeft = Math.round(lF);
        const pW = Math.round(rF - lF);

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(lB, backY);
        ctx.lineTo(rB, backY);
        ctx.lineTo(rF, frontY);
        ctx.lineTo(lF, frontY);
        ctx.closePath();
        ctx.clip();
        const pat = getWoodPattern();
        if (pat) {
          ctx.save();
          // Front-and-centre locked: texture translates with the plate, width changes reveal more wood (no swim)
          ctx.translate(Math.round((lF + rF) / 2), Math.round(frontY));
          ctx.fillStyle = pat;
          ctx.fillRect(-W, -PUSHER_PANEL_H - 8, W * 3, PUSHER_PANEL_H + 16);
          ctx.restore();
        } else {
          ctx.fillStyle = '#8a5a28';
          ctx.fill();
        }
        ctx.restore();

        // Back edge of the solid plate
        ctx.strokeStyle = 'rgba(40, 24, 12, 0.55)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(lB, backY);
        ctx.lineTo(rB, backY);
        ctx.stroke();

        drawPusherFace(pLeft, Math.round(frontY), pW);
      }

      function drawX2Gate(gx, gy, gw, gh) {
        const x = Math.round(gx);
        const y = Math.round(gy);
        const w = Math.max(20, Math.round(gw));
        const h = Math.max(14, Math.round(gh));
        const prev = ctx.imageSmoothingEnabled;
        ctx.imageSmoothingEnabled = false;

        ctx.fillStyle = 'rgba(20, 12, 6, 0.5)';
        ctx.fillRect(x + 2, y + 2, w, h);

        ctx.fillStyle = '#3a210e';
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = '#6b3e16';
        ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
        ctx.fillStyle = 'rgba(40, 22, 8, 0.4)';
        const plank = Math.max(5, Math.round(h / 3));
        for (let py = y + 3; py < y + h - 3; py += plank) {
          ctx.fillRect(x + 3, py, w - 6, 1);
        }

        ctx.fillStyle = '#8a5a18';
        ctx.fillRect(x, y, w, 2);
        ctx.fillRect(x, y + h - 2, w, 2);
        ctx.fillRect(x, y, 2, h);
        ctx.fillRect(x + w - 2, y, 2, h);
        ctx.fillStyle = '#e8c35a';
        ctx.fillRect(x + 1, y + 1, w - 2, 1);
        ctx.fillStyle = '#c9a227';
        ctx.fillRect(x + 1, y, w - 2, 1);

        const rivet = (rx, ry) => {
          ctx.fillStyle = '#5c3a10';
          ctx.fillRect(rx, ry, 3, 3);
          ctx.fillStyle = '#f0d078';
          ctx.fillRect(rx, ry, 2, 2);
        };
        rivet(x + 3, y + 3);
        rivet(x + w - 6, y + 3);
        rivet(x + 3, y + h - 6);
        rivet(x + w - 6, y + h - 6);

        const ix = x + 5, iy = y + 4, iw = w - 10, ih = h - 8;
        ctx.fillStyle = '#7a4e12';
        ctx.fillRect(ix, iy, iw, ih);
        ctx.fillStyle = '#d4a017';
        ctx.fillRect(ix + 1, iy + 1, iw - 2, ih - 2);
        const shine = Math.round((Math.sin(state.gatePhase) * 0.5 + 0.5) * Math.max(0, iw - 12));
        ctx.fillStyle = 'rgba(255, 236, 160, 0.38)';
        ctx.fillRect(ix + 1 + shine, iy + 1, 7, ih - 2);
        ctx.fillStyle = '#a67c12';
        ctx.fillRect(ix + 2, iy + Math.floor(ih * 0.35), iw - 4, Math.max(2, Math.floor(ih * 0.28)));

        const drawMiniCoin = (mx, my) => {
          ctx.fillStyle = '#7a4e12';
          ctx.fillRect(mx - 4, my - 4, 8, 8);
          ctx.fillStyle = '#f5c542';
          ctx.fillRect(mx - 3, my - 3, 6, 6);
          ctx.fillStyle = '#b8862e';
          ctx.fillRect(mx - 1, my - 1, 2, 2);
        };
        if (w > 52) {
          drawMiniCoin(x + 13, y + Math.round(h / 2));
          drawMiniCoin(x + w - 13, y + Math.round(h / 2));
        }

        ctx.font = isMobileLayout() ? '900 10px Inter, sans-serif' : '900 12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const cx = x + w / 2, cy = y + h / 2 + 0.5;
        ctx.fillStyle = '#3a2208';
        ctx.fillText('★ x2 ★', cx + 1, cy + 1);
        ctx.fillStyle = '#fff3c4';
        ctx.fillText('★ x2 ★', cx, cy - 1);
        ctx.fillStyle = '#1c1008';
        ctx.fillText('★ x2 ★', cx, cy);

        ctx.imageSmoothingEnabled = prev;
      }

      // ==========================================
      // 1. SYNTHESIZED WEB AUDIO (Crisp Arcade SFX)
      // ==========================================
      const SFX = {
        ctx: null,
        muted: false,
        init() {
          if (!this.ctx) {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (AC) this.ctx = new AC();
          }
          if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
          }
        },
        tone(freq, dur = 0.08, type = 'triangle', vol = 0.1, slide = null) {
          if (this.muted) return;
          this.init();
          if (!this.ctx) return;
          const t = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = type;
          osc.frequency.setValueAtTime(freq, t);
          if (slide) osc.frequency.exponentialRampToValueAtTime(slide, t + dur);
          g.gain.setValueAtTime(vol, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + dur);
          osc.connect(g);
          g.connect(this.ctx.destination);
          osc.start(t);
          osc.stop(t + dur);
        },
        coinDrop() { this.tone(1150, 0.055, 'sine', 0.07, 1620); },
        clink() { this.tone(1850 + Math.random() * 450, 0.025, 'triangle', 0.02); },
        summon(combo) {
          const base = Math.min(1320, 480 + combo * 65);
          this.tone(base, 0.1, 'triangle', 0.1, base * 1.35);
        },
        elite() {
          [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => this.tone(f, 0.14, 'triangle', 0.13), i * 50));
        },
        gateX2() {
          this.tone(740, 0.09, 'sine', 0.12, 1180);
          setTimeout(() => this.tone(1180, 0.12, 'triangle', 0.12, 1560), 60);
        },
        hit() { this.tone(240, 0.045, 'sawtooth', 0.035, 110); },
        meteor() {
          this.tone(140, 0.32, 'sawtooth', 0.16, 35);
          this.tone(90, 0.36, 'square', 0.1, 25);
        },
        freeze() { this.tone(1250, 0.24, 'sine', 0.1, 460); },
        warcry() {
          [440, 554, 659, 880].forEach((f, i) => setTimeout(() => this.tone(f, 0.14, 'sawtooth', 0.08), i * 55));
        },
        shake() {
          this.tone(95, 0.2, 'sawtooth', 0.14, 42);
          setTimeout(() => this.tone(140, 0.15, 'square', 0.09, 55), 70);
        },
        waveClear() {
          [440, 554, 659, 880].forEach((f, i) => setTimeout(() => this.tone(f, 0.18, 'triangle', 0.11), i * 80));
        }
      };

      // ==========================================
      // 2. COIN TYPES (Soldiers + Map Cannons + Soldier Skills)
      // ==========================================
      const ARMY_CAP = 40;
      const MAX_LIVE_ENEMIES = 100;
      const PARTICLE_CAP = 280;
      const FLOAT_TEXT_CAP = 90;

      const COIN_TYPES = {
        gold:    { id: 'gold',    kind: 'currency', name: '普通金幣', icon: '🪙', fill: '#f59e0b', stroke: '#fef08a', r: 14 },
        knight:  { id: 'knight',  kind: 'soldier', name: '重裝騎士', icon: '⚔️', fill: '#ef4444', stroke: '#fecaca', r: 15 },
        archer:  { id: 'archer',  kind: 'soldier', name: '精靈弓手', icon: '🏹', fill: '#10b981', stroke: '#a7f3d0', r: 14 },
        shield:  { id: 'shield',  kind: 'soldier', name: '聖盾衛士', icon: '🛡️', fill: '#3b82f6', stroke: '#bfdbfe', r: 16 },
        mage:    { id: 'mage',    kind: 'soldier', name: '烈焰法師', icon: '🔥', fill: '#f97316', stroke: '#fed7aa', r: 15 },
        spear:   { id: 'spear',   kind: 'soldier', name: '長槍兵', icon: '🔱', fill: '#0f766e', stroke: '#99f6e4', r: 15 },
        priest:  { id: 'priest',  kind: 'soldier', name: '聖光祭司', icon: '✨', fill: '#fef3c7', stroke: '#fde68a', r: 14 },
        hound:   { id: 'hound',   kind: 'soldier', name: '戰犬', icon: '🐾', fill: '#92400e', stroke: '#fdba74', r: 13 },
        bombard: { id: 'bombard', kind: 'soldier', name: '重砲手', icon: '💣', fill: '#4c1d95', stroke: '#c4b5fd', r: 16 },
        rogue:   { id: 'rogue',   kind: 'soldier', name: '暗影刺客', icon: '🗡️', fill: '#6b21a8', stroke: '#e9d5ff', r: 14 },
        meteor:  { id: 'meteor',  kind: 'skill',   name: '隕石地圖砲', icon: '☄️', fill: '#7f1d1d', stroke: '#fb923c', r: 16 },
        blizzard:{ id: 'blizzard',kind: 'skill',   name: '暴風雪地圖砲', icon: '❄️', fill: '#0369a1', stroke: '#bae6fd', r: 15 },
        warcry:  { id: 'warcry',  kind: 'skill',   name: '狂暴號角技', icon: '⚡', fill: '#a16207', stroke: '#fef08a', r: 15 },
        banner:  { id: 'banner',  kind: 'soldier', name: '軍旗手', icon: '🚩', fill: '#b45309', stroke: '#fed7aa', r: 15 },
        frost:   { id: 'frost',   kind: 'soldier', name: '霜法師', icon: '🧊', fill: '#0369a1', stroke: '#bae6fd', r: 15 },
        alchemist:{ id: 'alchemist',kind:'soldier',name: '煉金術士', icon: '🧪', fill: '#4d7c0f', stroke: '#bef264', r: 15 },
        stone:   { id: 'stone',   kind: 'hazard',  name: '詛咒石',   icon: '🪨', fill: '#475569', stroke: '#94a3b8', r: 17 }
      };

      const SOLDIER_STATS = {
        gold:    { name: '斥候', icon: '🗡️', hp: 46,  atk: 11, range: 48,  speed: 0, cd: 0.78, color: '#fbbf24', r: 11, proj: null },
        knight:  { name: '騎士', icon: '⚔️', hp: 100, atk: 22, range: 56,  speed: 0, cd: 0.88, color: '#ef4444', r: 13, proj: null, shape: 'knight' },
        archer:  { name: '弓手', icon: '🏹', hp: 52,  atk: 15, range: 185, speed: 0, cd: 0.82, color: '#10b981', r: 11, proj: '#6ee7b7', shape: 'archer' },
        shield:  { name: '盾衛', icon: '🛡️', hp: 190, atk: 12, range: 48,  speed: 0, cd: 1.05, color: '#3b82f6', r: 14, proj: null, shape: 'shield' },
        mage:    { name: '火法', icon: '🔥', hp: 56,  atk: 23, range: 165, speed: 0, cd: 1.2,  color: '#f97316', r: 12, proj: '#fb923c', aoe: true, shape: 'mage' },
        spear:   { name: '槍兵', icon: '🔱', hp: 88,  atk: 18, range: 82,  speed: 0, cd: 0.72, color: '#14b8a6', r: 12, proj: null, shape: 'spear' },
        priest:  { name: '祭司', icon: '✨', hp: 70,  atk: 9,  range: 130, speed: 0, cd: 1.35, color: '#fef3c7', r: 11, proj: '#fde68a', heal: true, shape: 'priest' },
        hound:   { name: '戰犬', icon: '🐾', hp: 42,  atk: 14, range: 42,  speed: 0, cd: 0.52, color: '#b45309', r: 10, proj: null, shape: 'hound' },
        bombard: { name: '砲手', icon: '💣', hp: 66,  atk: 34, range: 210, speed: 0, cd: 1.65, color: '#8b5cf6', r: 13, proj: '#c4b5fd', aoe: true, shape: 'bombard' },
        rogue:   { name: '刺客', icon: '🗡️', hp: 38,  atk: 30, range: 44,  speed: 0, cd: 0.58, color: '#c084fc', r: 10, proj: null, shape: 'rogue' },
        banner:  { name: '旗手', icon: '🚩', hp: 80,  atk: 8,  range: 46,  speed: 0, cd: 1.1,  color: '#b45309', r: 12, proj: null, shape: 'banner', auraAtk: 1.22 },
        frost:   { name: '霜法', icon: '🧊', hp: 54,  atk: 16, range: 160, speed: 0, cd: 1.15, color: '#38bdf8', r: 12, proj: '#7dd3fc', shape: 'frost', chill: 0.85 },
        alchemist:{ name: '煉金', icon: '🧪', hp: 60,  atk: 14, range: 125, speed: 0, cd: 0.95, color: '#65a30d', r: 12, proj: '#a3e635', shape: 'alchemist', lootGold: true }
      };

      // Y bands as a fraction of battlefield height (0 = top / castle wall).
      // Melee holds the front (closer to enemies marching up); ranged sit behind near the wall.
      const RANK_BAND = {
        shield:  [0.30, 0.42],
        knight:  [0.30, 0.42],
        spear:   [0.32, 0.44],
        hound:   [0.34, 0.46],
        rogue:   [0.30, 0.42],
        archer:  [0.18, 0.28],
        mage:    [0.18, 0.28],
        priest:  [0.17, 0.27],
        bombard: [0.17, 0.26],
        banner:  [0.20, 0.32],
        frost:   [0.18, 0.28],
        alchemist:[0.18, 0.28],
        gold:    [0.24, 0.38]
      };

      const ENEMY_TYPES = {
        goblin:  { name: '哥布林', icon: '👾', hp: 95,  atk: 20, speed: [38, 48], r: 11, range: 30,  castle: 6,  color: '#65a30d', sprite: 'e_goblin', drawH: 30 },
        slime:   { name: '史萊姆', icon: '🟢', hp: 48,  atk: 10, speed: [32, 42], r: 10, range: 26,  castle: 4,  color: '#84cc16', sprite: null,      drawH: 22, shape: 'slime' },
        wolf:    { name: '惡狼',   icon: '🐺', hp: 70,  atk: 18, speed: [58, 72], r: 11, range: 30,  castle: 5,  color: '#9ca3af', sprite: null,      drawH: 26, shape: 'wolf' },
        imp:     { name: '小惡魔', icon: '👿', hp: 40,  atk: 14, speed: [62, 78], r: 9,  range: 28,  castle: 4,  color: '#ef4444', sprite: null,      drawH: 20, shape: 'imp' },
        orc:     { name: '獸人',   icon: '👺', hp: 195, atk: 28, speed: [25, 31], r: 15, range: 36,  castle: 7,  color: '#3f6212', sprite: 'e_orc',    drawH: 40, heavy: true },
        troll:   { name: '巨魔',   icon: '🧌', hp: 280, atk: 34, speed: [20, 26], r: 17, range: 40,  castle: 9,  color: '#3f5a2a', sprite: null,      drawH: 48, shape: 'troll', heavy: true },
        caster:  { name: '術士',   icon: '🧙', hp: 105, atk: 24, speed: [22, 26], r: 13, range: 135, castle: 6,  color: '#7c3aed', sprite: 'e_caster', drawH: 32, caster: true },
        skel:    { name: '骷弓',   icon: '💀', hp: 78,  atk: 16, speed: [28, 36], r: 12, range: 150, castle: 5,  color: '#e7e5e4', sprite: null,      drawH: 30, shape: 'skel', caster: true },
        shaman:  { name: '薩滿',   icon: '🌀', hp: 110, atk: 20, speed: [21, 26], r: 13, range: 125, castle: 6,  color: '#a855f7', sprite: null,      drawH: 32, shape: 'shaman', caster: true },
        bomber:  { name: '自爆兵', icon: '💣', hp: 72,  atk: 65, speed: [46, 54], r: 13, range: 28,  castle: 8,  color: '#f97316', sprite: 'e_goblin', drawH: 32, bomber: true },
        brute:   { name: '攻城獸', icon: '🦏', hp: 320, atk: 36, speed: [16, 20], r: 18, range: 38,  castle: 14, color: '#78716c', sprite: null,      drawH: 50, shape: 'brute', heavy: true },
        boss:      { name: '魔將',   icon: '👹', hp: 680, atk: 46, speed: [18, 20], r: 22, range: 46,  castle: 16, color: '#facc15', sprite: 'e_boss',   drawH: 58, boss: true, heavy: true },
        bat:       { name: '血蝠',   icon: '🦇', hp: 36,  atk: 12, speed: [72, 90], r: 9,  range: 24,  castle: 3,  color: '#7f1d1d', sprite: null, drawH: 20, shape: 'bat' },
        beetle:    { name: '甲蟲',   icon: '🪲', hp: 240, atk: 22, speed: [16, 22], r: 16, range: 32,  castle: 8,  color: '#365314', sprite: null, drawH: 36, shape: 'beetle', heavy: true },
        wraith:    { name: '怨靈',   icon: '👻', hp: 88,  atk: 20, speed: [30, 40], r: 12, range: 140, castle: 5,  color: '#c4b5fd', sprite: null, drawH: 30, shape: 'wraith', caster: true },
        stoneboss: { name: '石魔',   icon: '🗿', hp: 900, atk: 52, speed: [14, 17], r: 24, range: 44,  castle: 20, color: '#78716c', sprite: null, drawH: 62, shape: 'stoneboss', boss: true, heavy: true },
        witch:     { name: '巫后',   icon: '🧙‍♀️', hp: 720, atk: 38, speed: [16, 20], r: 20, range: 160, castle: 14, color: '#a78bfa', sprite: null, drawH: 58, shape: 'witch', boss: true, caster: true },
        colossus:  { name: '巨像',   icon: '🗿', hp: 1400,atk: 60, speed: [12, 15], r: 26, range: 50,  castle: 24, color: '#a8a29e', sprite: null, drawH: 70, shape: 'colossus', boss: true, heavy: true }
      };

      const UPGRADE_POOL = [
        { id: 'add_meteor',   icon: '☄️', name: '隕石地圖砲 (+2 枚)', desc: '幣袋加入 2 枚隕石地圖砲幣，推落全戰場降下隕石轟炸。', tag: '幣袋' },
        { id: 'add_warcry',   icon: '⚡', name: '狂暴號角 (+2 枚)',   desc: '幣袋加入 2 枚號角技能幣，令全體在場士兵狂暴＋放劍氣。', tag: '幣袋' },
        { id: 'add_mage',     icon: '🔥', name: '烈焰法師軍團 (+2 枚)', desc: '幣袋加入 2 枚火法幣，召喚範圍火球法師。', tag: '幣袋' },
        { id: 'add_blizzard', icon: '❄️', name: '暴風雪地圖砲 (+2 枚)', desc: '幣袋加入 2 枚暴風雪幣，推落全場凍結。', tag: '幣袋' },
        { id: 'add_hound',    icon: '🐾', name: '戰犬軍團 (+3 枚)', desc: '幣袋加入 3 枚戰犬幣，快速鋪成犬潮。', tag: '幣袋' },
        { id: 'add_spear',    icon: '🔱', name: '長槍陣 (+2 枚)', desc: '幣袋加入 2 枚長槍兵幣，中距守住前線。', tag: '幣袋' },
        { id: 'add_bombard',  icon: '💣', name: '重砲連發射 (+2 枚)', desc: '幣袋加入 2 枚重砲手幣，遠距範圍轟炸。', tag: '幣袋' },
        { id: 'add_priest',   icon: '✨', name: '聖光祭司 (+2 枚)', desc: '幣袋加入 2 枚祭司幣，為友軍治療。', tag: '幣袋' },
        { id: 'add_banner',   icon: '🚩', name: '軍旗手 (+2 枚)', desc: '幣袋加入 2 枚旗手。旗手為附近友軍加攻，站在第二排就睇到旗。', tag: '稀有兵' },
        { id: 'add_frost',    icon: '🧊', name: '霜法師 (+2 枚)', desc: '幣袋加入 2 枚霜法。冰彈會短暫凍結敵人。', tag: '稀有兵' },
        { id: 'add_alchemist',icon: '🧪', name: '煉金術士 (+2 枚)', desc: '幣袋加入 2 枚煉金。擊殺會為你煉出金幣。', tag: '稀有兵' },
        { id: 'turbo_push',   icon: '⚙️', name: '渦輪推板 (+35% 推速)', desc: '推幣機推速加快，更快把瞄準嘅幣推落場。', tag: '推盤' },
        { id: 'side_walls',   icon: '🧱', name: '防漏側擋板', desc: '封死左右漏口，幣只會落入接幣區。', tag: '推盤', unique: true },
        { id: 'twin_drop',    icon: '🪙', name: '雙幣連投', desc: '每次投幣額外多掉 1 枚金幣到盤上。', tag: '推盤' },
        { id: 'wide_gate',    icon: '🚪', name: '加寬 x2 黃金門 (+45%)', desc: '黃金門加寬，更容易瞄中雙倍。', tag: '推盤' },
        { id: 'gate_slow',    icon: '⏳', name: '黃金門緩行', desc: '黃金門再慢一截，瞄準更從容。', tag: '推盤', unique: true },
        { id: 'army_buff',    icon: '💪', name: '精銳訓練 (+25% 全兵戰力)', desc: '以後召喚的士兵血量與攻擊永久提升 25%。', tag: '軍團' },
        { id: 'veterans',    icon: '🎖️', name: '老兵契約', desc: '之後每波退役時，1★ 有 40% 機會留守。', tag: '軍團', unique: true },
        { id: 'wall_repair',  icon: '🏰', name: '搶修城牆 (+30 HP)', desc: '立即修復 30 點城堡血量（不超過上限）。', tag: '城防' },
        { id: 'gold_cache',   icon: '💰', name: '軍餉箱 (+$28)', desc: '立即獲得 $28，方便買兵或補幣。', tag: '經濟' },
        { id: 'ammo_crate',   icon: '📦', name: '投幣木箱 (+10)', desc: '額外再得 10 枚投幣額度（另加常規 +6）。', tag: '經濟' },
        { id: 'rally',        icon: '📯', name: '緊急集結', desc: '立即在前線召集盾、騎、弓各 1 名。', tag: '軍團' },
        { id: 'keep_elite',   icon: '👑', name: '晉升儀式', desc: '場上隨機 1 名 1★（若有）立即升為 2★。', tag: '軍團' }
      ];

      const START_BAG = [
        'gold', 'gold', 'gold', 'gold', 'gold', 'gold',
        'knight', 'knight', 'archer', 'archer', 'shield', 'mage',
        'spear', 'hound', 'priest', 'rogue',
        'meteor', 'warcry', 'blizzard'
      ];

      // ==========================================
      // 3. STATE
      // ==========================================
      const state = {
        wave: 1,
        bestWave: 1,
        baseHp: 100,
        maxBaseHp: 100,
        ammo: 20,
        gold: 30,
        nextShopSoldier: 'knight',
        nextShopSkill: 'meteor',
        ammoRegenTimer: 0,
        shakeMeter: 35,
        paused: false,
        gameOver: false,
        drafting: false,
        relics: [],
        armyMult: 1,
        pusherSpeedMult: 1,
        sideWalls: false,
        twinDrop: 0,
        dropCooldown: 0,
        rearmTimer: 0,
        veteransChance: 0,
        gateSpeedMult: 1,
        relicIds: [],
        campaignWon: false,

        bag: START_BAG.slice(),
        queue: [],

        coins: [],
        fallingDrops: [], // Visual coins falling from top pusher into bottom battlefield!
        soldiers: [],
        enemies: [],
        projectiles: [],
        enemyProjectiles: [],
        meteors: [],
        particles: [],
        floatTexts: [],

        spawnLeft: 0,
        spawnTimer: 0,
        waveActive: true,

        pusherPhase: 0,
        pusherY: 0,
        prevPusherY: 0,
        dropXRatio: 0.5,
        isDragging: false,
        dragDropCooldown: 0,

        comboCount: 0,
        comboTimer: 0,
        screenShake: 0,
        blizzardFlash: 0,
        gatePhase: 0,
        gateX: 200,
        gateWidthMult: 1,
        lastSoldierType: null,
        sameChainCount: 0,
        sameChainTimer: 0,
        nextId: 1
      };

      try {
        const b = localStorage.getItem('coinfront_v2_best_wave');
        if (b && !isNaN(Number(b))) state.bestWave = Math.max(1, Number(b));
        const m0 = JSON.parse(localStorage.getItem('coinfront_meta_v1') || 'null');
        if (m0 && m0.bestWave) state.bestWave = Math.max(state.bestWave, Number(m0.bestWave) || 1);
      } catch (_) {}

      function saveBest() {
        if (state.wave > state.bestWave) {
          state.bestWave = state.wave;
          try { localStorage.setItem('coinfront_v2_best_wave', String(state.bestWave)); } catch (_) {}
        }
        persistMeta();
      }

      const META_KEY = 'coinfront_meta_v1';
      function loadMeta() {
        try {
          const raw = JSON.parse(localStorage.getItem(META_KEY) || 'null');
          if (raw && typeof raw === 'object') return raw;
        } catch (_) {}
        return { bestWave: 1, wins: 0 };
      }
      function saveMeta(m) {
        try { localStorage.setItem(META_KEY, JSON.stringify(m)); } catch (_) {}
      }
      function persistMeta() {
        const m = loadMeta();
        m.bestWave = Math.max(m.bestWave || 1, state.bestWave || 1, state.wave || 1);
        if (state.campaignWon) m.wins = Math.max(m.wins || 0, m.wins || 0);
        saveMeta(m);
      }
      function metaBonuses(m) {
        const best = m.bestWave || 1;
        const b = { ammo: 0, gold: 0, bag: [], vanguardStar: false };
        if (best >= 4) b.bag.push('banner');
        if (best >= 6) b.ammo += 4;
        if (best >= 7) b.bag.push('frost');
        if (best >= 9) b.gold += 10;
        if (best >= 10) b.bag.push('alchemist');
        if (best >= 12) b.vanguardStar = true;
        return b;
      }
      const META_UNLOCKS = [
        { at: 4,  name: '開局幣袋加入旗手' },
        { at: 6,  name: '開局投幣 +4' },
        { at: 7,  name: '開局幣袋加入霜法' },
        { at: 9,  name: '開局金幣 +$10' },
        { at: 10, name: '開局幣袋加入煉金' },
        { at: 12, name: '先鋒其中 1 名以 2★ 上場' }
      ];

      // ==========================================
      // 4. DOM & FLIPPED LAYOUT (TOP: PUSHER | BOTTOM: BATTLEFIELD)
      // ==========================================
      const stageWrap = document.getElementById('stageWrap');
      const canvas = document.getElementById('gameCanvas');
      const ctx = canvas.getContext('2d');

      const hudWave = document.getElementById('hudWave');
      const hudHp = document.getElementById('hudHp');
      const hudAmmo = document.getElementById('hudAmmo');
      const hudGold = document.getElementById('hudGold');
      const btnBuySoldier = document.getElementById('btnBuySoldier');
      const btnBuySkill = document.getElementById('btnBuySkill');
      const btnBuyAmmo = document.getElementById('btnBuyAmmo');
      const buySoldierLabel = document.getElementById('buySoldierLabel');
      const buySkillLabel = document.getElementById('buySkillLabel');
      const hudBest = document.getElementById('hudBest');
      const nextCoinQueue = document.getElementById('nextCoinQueue');
      const relicSummary = document.getElementById('relicSummary');
      const comboBadge = document.getElementById('comboBadge');
      const toastMsg = document.getElementById('toastMsg');
      const btnDropCenter = document.getElementById('btnDropCenter');
      const btnShake = document.getElementById('btnShake');
      const shakeMeterText = document.getElementById('shakeMeterText');
      const btnMute = document.getElementById('btnMute');
      const btnPause = document.getElementById('btnPause');
      const btnHelp = document.getElementById('btnHelp');
      const btnCloseHelp = document.getElementById('btnCloseHelp');
      const btnCloseHelp2 = document.getElementById('btnCloseHelp2');
      const btnRestart = document.getElementById('btnRestart');
      const upgradeModal = document.getElementById('upgradeModal');
      const upgradeChoices = document.getElementById('upgradeChoices');
      const gameOverModal = document.getElementById('gameOverModal');
      const gameOverText = document.getElementById('gameOverText');
      const helpModal = document.getElementById('helpModal');
      const hudChapter = document.getElementById('hudChapter');
      const btnCamp = document.getElementById('btnCamp');
      const campModal = document.getElementById('campModal');
      const campList = document.getElementById('campList');
      const btnCloseCamp = document.getElementById('btnCloseCamp');
      const btnCloseCamp2 = document.getElementById('btnCloseCamp2');
      const btnRerollShop = document.getElementById('btnRerollShop');
      const btnToggleShop = document.getElementById('btnToggleShop');
      const shopPanel = document.getElementById('shopPanel');
      function setShopOpen(open) {
        if (!btnToggleShop || !shopPanel) return;
        try {
          if (typeof btnToggleShop.setAttribute === 'function') {
            btnToggleShop.setAttribute('aria-expanded', open ? 'true' : 'false');
          }
          shopPanel.hidden = !open;
          const lab = typeof btnToggleShop.querySelector === 'function'
            ? btnToggleShop.querySelector('.shop-toggle-label')
            : null;
          if (lab) lab.textContent = open ? '收起商店' : '商店';
        } catch (_) {}
      }
      function isShopOpen() {
        return btnToggleShop && btnToggleShop.getAttribute('aria-expanded') === 'true';
      }

      let W = 1280, H = 720;
      let BED_TOP = 16;
      let BED_BOTTOM = 285;
      let BED_LEFT = 22;
      let BED_RIGHT = 378;
      let PUSHER_MIN_Y = 44;
      let PUSHER_MAX_Y = 122;
      let BATTLE_TOP = 304;
      let BATTLE_BOTTOM = 720;

      let PUSHER_PANEL_H = 240;

      function isMobileLayout() {
        return window.innerWidth <= 820;
      }

      function computeLayout() {
        const mobile = isMobileLayout();
        W = stageWrap.clientWidth || (mobile ? 400 : 1280);
        H = stageWrap.clientHeight || (mobile ? 540 : 720);
        const divider = mobile ? 18 : 22;
        if (mobile) {
          // Roomier tray after the shop drawer freed footer space, without swallowing the field.
          PUSHER_PANEL_H = Math.round(H * 0.44);
        } else {
          // Deeper tray than the earlier 32–36% compact pass, but the battlefield stays the larger pane.
          let pusherH = Math.round(W / PUSHER_ART_ASPECT);
          const minBattle = Math.round(H * 0.40);
          const maxPusher = Math.round(H * 0.42);
          const minPusher = Math.round(H * 0.32);
          if (H - divider - pusherH < minBattle) pusherH = H - divider - minBattle;
          PUSHER_PANEL_H = Math.max(minPusher, Math.min(maxPusher, pusherH));
        }
        BED_TOP = Math.round(PUSHER_PANEL_H * 0.04);
        BED_BOTTOM = Math.round(PUSHER_PANEL_H * 0.81);
        BED_LEFT = Math.round(W * 0.10);
        BED_RIGHT = Math.round(W * 0.90);
        PUSHER_MIN_Y = Math.round(PUSHER_PANEL_H * 0.22);
        PUSHER_MAX_Y = Math.round(PUSHER_PANEL_H * 0.42);
        BATTLE_TOP = PUSHER_PANEL_H + divider;
        BATTLE_BOTTOM = H;
      }

      // Trapezoid perspective helpers matching the diagonal brass rails of bg_pusher!
      function getDepthT(y) {
        return Math.max(0, Math.min(1, (y - BED_TOP) / Math.max(1, BED_BOTTOM - BED_TOP)));
      }
      function getRailLeft(y) {
        const t = getDepthT(y);
        // Narrower at top (23% of W), wider at front drop edge (9.5% of W)
        return W * (0.23 - 0.135 * t);
      }
      function getRailRight(y) {
        const t = getDepthT(y);
        return W * (0.77 + 0.135 * t);
      }
      function getDepthScale(y) {
        return 0.80 + 0.28 * getDepthT(y);
      }

      let toastTimer = null;
      function showToast(txt) {
        toastMsg.textContent = txt;
        toastMsg.style.opacity = '1';
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => { toastMsg.style.opacity = '0'; }, 1900);
      }

      function addParticles(x, y, color, count = 10) {
        if (state.particles.length >= PARTICLE_CAP) {
          state.particles.splice(0, Math.min(count, state.particles.length));
        }
        for (let i = 0; i < count; i++) {
          const a = Math.random() * Math.PI * 2;
          const sp = 40 + Math.random() * 130;
          state.particles.push({
            x, y,
            vx: Math.cos(a) * sp,
            vy: Math.sin(a) * sp,
            r: 2 + Math.random() * 3.5,
            color,
            life: 0.35 + Math.random() * 0.25,
            maxLife: 0.6
          });
        }
      }

      function addFloatText(x, y, text, color = '#fde047') {
        if (state.floatTexts.length >= FLOAT_TEXT_CAP) state.floatTexts.shift();
        state.floatTexts.push({ x, y, text, color, life: 0.9, maxLife: 0.9 });
      }

      // ==========================================
      // 5. DECK, COINS & INITIAL BOARD SEEDING
      // ==========================================
      function drawRandomCoinType() {
        return state.bag[Math.floor(Math.random() * state.bag.length)];
      }

      function refillQueue() {
        while (state.queue.length < 4) {
          state.queue.push(drawRandomCoinType());
        }
      }

      function spawnBoardCoin(typeKey, x, y, vy = 0, tier = 'lower') {
        const t = COIN_TYPES[typeKey];
        state.coins.push({
          id: state.nextId++,
          type: typeKey,
          tier,
          x, y,
          vx: (Math.random() - 0.5) * 14,
          vy,
          r: t.r,
          glow: 0.35
        });
      }

      function seedInitialCoins() {
        state.coins = [];
        const starterPool = [
          'gold', 'gold', 'knight', 'gold', 'archer', 'gold', 'spear', 'shield',
          'gold', 'mage', 'gold', 'hound', 'knight', 'gold', 'priest', 'gold',
          'rogue', 'gold', 'archer', 'gold', 'meteor', 'gold', 'blizzard', 'gold'
        ];
        const midY = (PUSHER_MAX_Y + BED_BOTTOM) * 0.5;
        const span = Math.max(40, getRailRight(midY) - getRailLeft(midY) - 36);
        // Width-aware packing: a busy tray on 1440, not a jammed phone cabinet.
        // Desktop trays are very wide: a 15-column cap left ~70px gaps and looked sparse.
        const colPitch = isMobileLayout() ? 32 : 36;
        const cols = Math.max(6, Math.min(isMobileLayout() ? 11 : 24, Math.floor(span / colPitch)));
        const rows = isMobileLayout() ? 4 : 4;
        const y0 = PUSHER_MAX_Y + 8;
        // Fill the deeper bed, but keep a clear lip so wave 1 cannot auto-dump.
        const lipGuard = 48;
        const y1 = Math.min(
          BED_BOTTOM - lipGuard,
          PUSHER_MAX_Y + Math.max(28, (BED_BOTTOM - PUSHER_MAX_Y) * 0.78)
        );
        let n = 0;
        for (let row = 0; row < rows; row++) {
          const fy = rows === 1 ? 0.5 : row / (rows - 1);
          const cy = y0 + fy * Math.max(8, y1 - y0);
          const rl = getRailLeft(cy) + 18;
          const rr = getRailRight(cy) - 18;
          const rowW = Math.max(10, rr - rl);
          // Odd rows are staggered, and a few cells are skipped for a settled look.
          const xOff = (row % 2 === 1) ? (rowW / cols) * 0.5 : 0;
          for (let col = 0; col < cols; col++) {
            if (Math.random() < 0.07) continue;
            const cx = rl + xOff + (col + 0.5) / cols * (rowW - xOff)
              + (Math.random() - 0.5) * 8;
            const jy = cy + (Math.random() - 0.5) * 6;
            spawnBoardCoin(starterPool[n % starterPool.length], cx, jy, 0, 'lower');
            n += 1;
          }
        }
        // A sparse gold-only row still well short of the lip — decoration, not a free first dump.
        const frontTypes = ['gold', 'gold', 'gold', 'gold', 'gold', 'gold'];
        const frontCount = isMobileLayout() ? 4 : 7;
        const frontY = y1 + Math.max(16, (BED_BOTTOM - y1) * 0.28);
        for (let i = 0; i < frontCount; i++) {
          const fy = frontY + (Math.random() - 0.5) * 6;
          if (fy > BED_BOTTOM - 40) continue;
          const rl = getRailLeft(fy) + 22;
          const rr = getRailRight(fy) - 22;
          const cx = rl + ((i + 0.5) / frontCount) * Math.max(10, rr - rl) + (Math.random() - 0.5) * 8;
          spawnBoardCoin(frontTypes[i % frontTypes.length], cx, fy, 0, 'lower');
        }
        // Upper shelf: a short occupied line, not just a handful of coins.
        const upperCount = isMobileLayout() ? 7 : 12;
        const upperTypes = ['knight', 'gold', 'gold', 'archer', 'gold', 'shield', 'gold', 'hound'];
        for (let i = 0; i < upperCount; i++) {
          const cy = BED_TOP + 18 + Math.random() * 12;
          const rl = getRailLeft(cy) + 18;
          const rr = getRailRight(cy) - 18;
          const cx = rl + ((i + 0.5) / upperCount) * Math.max(10, rr - rl) + (Math.random() - 0.5) * 10;
          spawnBoardCoin(upperTypes[i % upperTypes.length], cx, cy, 0, 'upper');
        }
      }

      function dropPlayerCoin(targetX) {
        if (state.paused || state.gameOver || state.drafting) return;
        if (state.dropCooldown > 0) return;
        if (state.ammo <= 0) {
          showToast('投幣額度歸零！等推落金幣或自動補充');
          return;
        }
        SFX.init();
        state.dropCooldown = 0.32;
        state.ammo -= 1;
        refillQueue();
        const nextType = state.queue.shift();
        refillQueue();

        // Fixed top drop height: lands ON TOP of the moving pusher shelf (or drops directly onto lower deck if shelf is retracted!)
        const dropY = BED_TOP + 20 + Math.random() * 8;
        const rl = getRailLeft(dropY) + 16;
        const rr = getRailRight(dropY) - 16;
        const clampedX = Math.max(rl, Math.min(rr, targetX));
        const landTier = dropY <= state.pusherY - 4 ? 'upper' : 'lower';
        spawnBoardCoin(nextType, clampedX, dropY, 55, landTier);

        for (let k = 0; k < state.twinDrop; k++) {
          const ox = Math.max(rl, Math.min(rr, clampedX + (Math.random() < 0.5 ? -18 : 18)));
          spawnBoardCoin('gold', ox, dropY, 50, landTier);
        }

        SFX.coinDrop();
        updateUI();
      }

      function dropSpecialCoin(typeKey) {
        if (state.paused || state.gameOver || state.drafting) return;
        SFX.init();
        const dropY = BED_TOP + 20 + Math.random() * 6;
        const rl = getRailLeft(dropY) + 16;
        const rr = getRailRight(dropY) - 16;
        const targetX = Math.max(rl, Math.min(rr, state.dropXRatio * W));
        const landTier = dropY <= state.pusherY - 4 ? 'upper' : 'lower';
        spawnBoardCoin(typeKey, targetX, dropY, 55, landTier);
        SFX.gateX2();
        updateUI();
      }

      function triggerMachineShake() {
        if (state.paused || state.gameOver || state.drafting) return;
        if (state.shakeMeter < 100) return;
        SFX.init();
        state.shakeMeter = 0;
        state.screenShake = 11;
        SFX.shake();
        showToast('💥 拍機台爆兵！成排硬幣跌落戰場！');
        for (const c of state.coins) {
          c.vy += 170 + Math.random() * 90;
          c.vx += (Math.random() - 0.5) * 60;
        }
        addParticles(W / 2, BED_BOTTOM - 8, '#e879f9', 20);
        updateUI();
      }

      // ==========================================
      // 6. FALLING COIN -> SPAWN SOLDIER OR MAP CANNON / SKILL
      // ==========================================
      function getGateHalfWidth() {
        return Math.min((BED_RIGHT - BED_LEFT) * 0.34, (BED_RIGHT - BED_LEFT) * 0.095 * state.gateWidthMult);
      }
      function getCatchBounds() {
        const l = getRailLeft(BED_BOTTOM);
        const r = getRailRight(BED_BOTTOM);
        const span = r - l;
        // Left & Right 18% of drop pit are dead MISS gutters (unless Side Walls upgrade narrows them!)
        const missMargin = state.sideWalls ? span * 0.04 : span * 0.15;
        return { left: l + missMargin, right: r - missMargin };
      }

      function launchCoinIntoBattlefield(coin) {
        if (coin.type === 'stone') {
          addFloatText(coin.x, BED_BOTTOM - 10, '清除詛咒石!', '#94a3b8');
          addParticles(coin.x, BED_BOTTOM, '#94a3b8', 8);
          return;
        }
        const cb = getCatchBounds();
        if (coin.x < cb.left || coin.x > cb.right) {
          // Missed into the side dead chute!
          SFX.hit();
          addParticles(coin.x, BED_BOTTOM + 8, '#ef4444', 6);
          addFloatText(coin.x, BED_BOTTOM - 6, '漏幣!', '#f87171');
          return;
        }
        const halfW = getGateHalfWidth();
        const hitX2 = Math.abs(coin.x - state.gateX) <= halfW + coin.r * 0.25;
        if (hitX2) {
          SFX.gateX2();
          addParticles(coin.x, BED_BOTTOM, '#fde047', 14);
          addFloatText(coin.x, BED_BOTTOM - 16, '★ x2 黃金門! ★', '#fde047');
        }
        const battleH = Math.max(100, BATTLE_BOTTOM - BATTLE_TOP);
        const normX = Math.max(0, Math.min(1, (coin.x - BED_LEFT) / Math.max(1, BED_RIGHT - BED_LEFT)));
        // Full width of the allied zone at the top of the vertical field
        const minX = Math.round(W * 0.06);
        const maxX = Math.round(W * 0.94);
        const landX = minX + normX * Math.max(30, maxX - minX);
        const landY = BATTLE_TOP + Math.round(battleH * (0.22 + Math.random() * 0.18));
        const def = COIN_TYPES[coin.type];
        const fallH = Math.max(40, landY - BED_BOTTOM);
        const flight = Math.sqrt(2 * fallH / 1850) || 0.35;
        state.fallingDrops.push({
          type: coin.type,
          x: coin.x,
          y: BED_BOTTOM,
          vx: (landX - coin.x) / Math.max(0.22, flight),
          vy: 40,
          landX,
          landY,
          tx: landX,
          ty: landY,
          hitX2,
          bounces: 0,
          maxBounces: Math.random() < 0.4 ? 1 : 2,
          rot: 0,
          rotV: (Math.random() - 0.5) * 10,
          r: def ? def.r : 14
        });
      }

      function resolveBattlefieldLanding(drop) {
        const def = COIN_TYPES[drop.type];
        const x2 = drop.hitX2 ? 2 : 1;
        state.comboCount += x2;
        state.comboTimer = 2.1;
        state.shakeMeter = Math.min(100, state.shakeMeter + 8 * x2);

        if (def.kind === 'currency') {
          const goldGain = 6 * x2;
          const ammoGain = x2 > 1 ? 1 : 0;
          state.gold += goldGain;
          if (ammoGain > 0) state.ammo += ammoGain;
          SFX.summon(state.comboCount);
          addParticles(drop.tx, drop.ty, '#fde047', 8);
          addFloatText(drop.tx, drop.ty - 12, ammoGain ? `+$${goldGain} +1幣!` : `+$${goldGain}`, '#fde047');
        } else if (def.kind === 'soldier') {

          // Chain Merge Check: consecutive same-type soldier drops within 2.8s merge into 2★ / 3★ Elite!
          if (state.lastSoldierType === drop.type && state.sameChainTimer > 0) {
            state.sameChainCount += 1;
          } else {
            state.lastSoldierType = drop.type;
            state.sameChainCount = 1;
          }
          state.sameChainTimer = 2.8;

          let star = 1;
          if (state.sameChainCount >= 3) {
            star = 3;
            state.sameChainCount = 0;
            state.sameChainTimer = 0;
            SFX.elite();
            state.screenShake = Math.max(state.screenShake, 6);
            showToast(`👑 三連合成！空降 3★ 傳說${SOLDIER_STATS[drop.type].name}！`);
          } else if (state.sameChainCount === 2) {
            star = 2;
            SFX.elite();
            showToast(`✨ 二連合成！空降 2★ 精英${SOLDIER_STATS[drop.type].name}！`);
          } else {
            SFX.summon(state.comboCount);
          }

          // If it also passed through the x2 Golden Gate, spawn 2 units!
          for (let n = 0; n < x2; n++) {
            const ox = n === 0 ? 0 : (Math.random() < 0.5 ? -18 : 18);
            const oy = n === 0 ? 0 : (Math.random() < 0.5 ? -14 : 14);
            spawnSoldier(drop.type, drop.tx + ox, drop.ty + oy, star);
          }
        } else if (drop.type === 'meteor') {
          SFX.meteor();
          state.screenShake = Math.max(state.screenShake, 10);
          state.coins = state.coins.filter(c => c.type !== 'stone');
          const dmg = Math.round(52 * state.armyMult * x2);
          const count = 5 * x2;
          for (let m = 0; m < count; m++) {
            const mx = 65 + Math.random() * (W - 95);
            const my = BATTLE_TOP + 28 + Math.random() * (BATTLE_BOTTOM - BATTLE_TOP - 52);
            state.meteors.push({ x: mx, y: my, r: 44, life: 0.45, maxLife: 0.45 });
            addParticles(mx, my, '#f97316', 10);
          }
          for (const e of [...state.enemies]) hurtEnemy(e, dmg, '#fb923c');
          addFloatText(W / 2, BATTLE_TOP + 26, `${x2 > 1 ? '★x2 ' : ''}☄️ 隕石地圖砲! 全場 -${dmg}`, '#fb923c');
        } else if (drop.type === 'blizzard') {
          SFX.freeze();
          state.blizzardFlash = 0.5;
          const dmg = Math.round(22 * state.armyMult * x2);
          for (const e of [...state.enemies]) {
            e.freezeTimer = Math.max(e.freezeTimer, 3.2 * x2);
            hurtEnemy(e, dmg, '#7dd3fc');
          }
          addFloatText(W / 2, BATTLE_TOP + 26, `${x2 > 1 ? '★x2 ' : ''}❄️ 暴風雪地圖砲! 全敵凍結`, '#7dd3fc');
        } else if (drop.type === 'warcry') {
          SFX.warcry();
          state.screenShake = Math.max(state.screenShake, 5);
          state.baseHp = Math.min(state.maxBaseHp, state.baseHp + 8 * x2);
          for (const s of state.soldiers) {
            s.frenzyTimer = Math.max(s.frenzyTimer, 5.0 * x2);
            s.hp = Math.min(s.maxHp, s.hp + Math.round(s.maxHp * 0.35 * x2));
            addParticles(s.x, s.y, '#facc15', 8);
            for (let w = 0; w < x2; w++) {
              state.projectiles.push({
                x: s.x + w * 10, y: s.y + 8,
                vx: 0, vy: 295,
                dmg: Math.round(s.atk * 1.4),
                color: '#facc15',
                r: 6,
                pierce: true,
                hitIds: new Set()
              });
            }
          }
          addFloatText(W / 2, BATTLE_TOP + 26, `${x2 > 1 ? '★x2 ' : ''}⚡ 士兵狂暴號角! 全體放劍氣`, '#fef08a');
        }
        updateUI();
      }

      function battleYBounds() {
        const h = BATTLE_BOTTOM - BATTLE_TOP;
        // Allied hold-line: just under the rear wall, down to the front rank
        const top = BATTLE_TOP + Math.round(h * 0.17);
        const bot = BATTLE_TOP + Math.round(h * 0.48);
        return { top, bot };
      }

      function castleBreakY() {
        return BATTLE_TOP + Math.round((BATTLE_BOTTOM - BATTLE_TOP) * 0.16) + 6;
      }

      function placeInRank(typeKey, preferredX, preferredY) {
        const band = RANK_BAND[typeKey] || [0.24, 0.40];
        const h = BATTLE_BOTTOM - BATTLE_TOP;
        const minX = Math.round(W * 0.05);
        const maxX = Math.round(W * 0.95);
        const bandTop = BATTLE_TOP + Math.round(h * band[0]);
        const bandBot = BATTLE_TOP + Math.round(h * band[1]);
        const { top, bot } = battleYBounds();
        let x = Math.max(minX, Math.min(maxX, preferredX));
        // Land at the bounce position, with a mild pull into the role's Y band so 2–3 ranks form
        let y = preferredY * 0.55 + ((bandTop + bandBot) / 2) * 0.45;
        y = Math.max(top, Math.min(bot, y));
        y = Math.max(bandTop - 6, Math.min(bandBot + 6, y));
        // Nudge away from piles so a big army reads as a crowd, not one stack.
        for (let attempt = 0; attempt < 8; attempt++) {
          let overlaps = 0;
          for (const s of state.soldiers) {
            if (Math.hypot(s.x - x, s.y - y) < 16) overlaps += 1;
          }
          if (overlaps === 0) break;
          x = Math.max(minX, Math.min(maxX, x + (Math.random() - 0.5) * 28));
          y = Math.max(top, Math.min(bot, y + (Math.random() - 0.5) * 18));
        }
        return { x, y };
      }

      function overflowPromote(typeKey) {
        const same = state.soldiers.filter(s => s.type === typeKey);
        const pool = same.length ? same : state.soldiers;
        if (!pool.length) return false;
        const minStars = Math.min(...pool.map(s => s.stars || 1));
        const lowest = pool.filter(s => (s.stars || 1) === minStars);
        const lucky = lowest[Math.floor(Math.random() * lowest.length)];
        lucky.stars = Math.min(3, (lucky.stars || 1) + 1);
        lucky.maxHp = Math.round(lucky.maxHp * 1.3);
        lucky.hp = lucky.maxHp;
        lucky.atk = Math.round(lucky.atk * 1.25);
        lucky.r = Math.min(20, lucky.r + 2);
        lucky.frenzyTimer = Math.max(lucky.frenzyTimer, 3.0);
        addFloatText(lucky.x, lucky.y - 14, same.length ? '滿員同系升星!' : '滿員升星!', '#facc15');
        addParticles(lucky.x, lucky.y, '#facc15', 10);
        return true;
      }

      function spawnSoldier(typeKey, x, y, stars = 1) {
        const st = SOLDIER_STATS[typeKey];
        if (!st) return;
        const starScale = stars === 3 ? 2.9 : (stars === 2 ? 1.85 : 1);
        if (state.soldiers.length >= ARMY_CAP) {
          overflowPromote(typeKey);
          return;
        }
        const maxHp = Math.round(st.hp * state.armyMult * starScale);
        const atk = Math.round(st.atk * state.armyMult * starScale);
        const radius = st.r + (stars - 1) * 3.5;
        const pos = placeInRank(typeKey, x, y);
        state.soldiers.push({
          id: state.nextId++,
          type: typeKey,
          stars,
          icon: st.icon,
          color: st.color,
          shape: st.shape || typeKey,
          heal: !!st.heal,
          x: pos.x,
          y: pos.y,
          hp: maxHp,
          maxHp,
          atk,
          range: st.range + (stars - 1) * 10,
          speed: st.speed,
          cd: st.cd * (stars === 3 ? 0.8 : (stars === 2 ? 0.9 : 1)),
          cdTimer: 0.1,
          r: radius,
          proj: st.proj,
          aoe: !!st.aoe || stars === 3,
          auraAtk: st.auraAtk || 0,
          chill: st.chill || 0,
          lootGold: !!st.lootGold,
          auraMul: 1,
          frenzyTimer: stars >= 2 ? 2.5 : 0,
          flash: 0
        });
        addParticles(pos.x, pos.y, stars >= 2 ? '#fde047' : st.color, stars >= 2 ? 14 : 8);
        addFloatText(pos.x, pos.y - 16, stars >= 2 ? `${'★'.repeat(stars)}精英${st.name}!` : `+${st.name}`, stars >= 2 ? '#fde047' : '#f8fafc');
      }

      function hurtEnemy(e, dmg, color = '#ffffff', opts = {}) {
        e.hp -= dmg;
        e.flash = 0.12;
        if (opts.chill) e.freezeTimer = Math.max(e.freezeTimer || 0, opts.chill);
        addFloatText(e.x, e.y - e.r - 5, `-${dmg}`, color);
        if (e.hp <= 0) {
          const idx = state.enemies.findIndex(en => en.id === e.id);
          if (idx !== -1) {
            state.enemies.splice(idx, 1);
            addParticles(e.x, e.y, e.isBoss ? '#facc15' : '#c084fc', e.isBoss ? 22 : 9);
            let goldDrop = e.isBoss ? 18 : (e.isHeavy ? 2 : 1);
            if (opts.lootGold) goldDrop += 1;
            state.gold += goldDrop;
            const coinDrop = e.isBoss ? 4 : 0;
            if (coinDrop > 0) state.ammo += coinDrop;
            addFloatText(e.x, e.y, e.isBoss ? `+$${goldDrop} +4幣!` : `+$${goldDrop}`, '#6ee7b7');
            state.shakeMeter = Math.min(100, state.shakeMeter + (e.isBoss ? 30 : 5));
            updateUI();
          }
        }
      }

      // ==========================================
      // 7. WAVES & UPGRADES
      // ==========================================
      function chapterName(w) {
        if (w >= 13) return '無盡守城';
        if (w >= 10) return '魔將總攻';
        if (w >= 7) return '攻城序幕';
        if (w >= 4) return '荒原夜襲';
        return '邊關試鋒';
      }
      function waveRosterCount(w) {
        if (w === 1) return 40;
        return 28 + w * 12;
      }
      function waveHpScale(w) {
        let s = 1;
        for (let i = 2; i <= w; i++) {
          if (i <= 3) s *= 1.16;
          else if (i <= 6) s *= 1.14;
          else if (i <= 9) s *= 1.12;
          else s *= 1.10;
        }
        return s;
      }
      function pickBossKind(w) {
        const idx = (Math.floor(w / 3) - 1 + 4) % 4;
        return ['boss', 'stoneboss', 'witch', 'colossus'][idx] || 'boss';
      }

      function startWave(waveNum) {
        state.wave = waveNum;
        saveBest();
        persistMeta();
        const isBoss = waveNum % 3 === 0;
        state.spawnLeft = waveRosterCount(waveNum);
        state.spawnTimer = waveNum === 1 ? 1.05 : 0.45;
        state.waveActive = true;
        rotateShopStock();
        const chap = chapterName(waveNum);
        const bossName = isBoss ? (ENEMY_TYPES[pickBossKind(waveNum)] || {}).name : '';
        showToast(isBoss
          ? `⚠️ ${chap} · 第 ${waveNum} 波：${bossName || 'BOSS'} 壓境！共 ${state.spawnLeft} 隻`
          : `⚔️ ${chap} · 第 ${waveNum} 波怪獸潮來襲（共 ${state.spawnLeft} 隻）！`);
        updateUI();
      }

      function pickEnemyKind(waveNum, isBoss) {
        if (isBoss) return pickBossKind(waveNum);
        const table = [];
        const add = (k, w) => { for (let i = 0; i < w; i++) table.push(k); };
        add('goblin', 4);
        add('slime', 4);
        if (waveNum >= 1) { add('wolf', 3); add('bat', 2); }
        if (waveNum >= 2) { add('imp', 3); add('orc', 2); add('skel', 2); }
        if (waveNum >= 3) { add('caster', 2); add('bomber', 2); add('shaman', 1); add('beetle', 1); }
        if (waveNum >= 4) { add('troll', 2); add('brute', 1); add('wraith', 2); }
        if (waveNum >= 6) { add('troll', 2); add('brute', 2); add('bomber', 1); add('beetle', 2); }
        if (waveNum >= 9) { add('wraith', 2); add('beetle', 2); }
        return table[Math.floor(Math.random() * table.length)] || 'goblin';
      }

      function spawnEnemy() {
        const isBoss = (state.wave % 3 === 0) && state.spawnLeft === 1;
        const kind = pickEnemyKind(state.wave, isBoss);
        const def = ENEMY_TYPES[kind] || ENEMY_TYPES.goblin;
        const scale = waveHpScale(state.wave);
        const spd = def.speed[0] + Math.random() * Math.max(0, def.speed[1] - def.speed[0]);

        state.enemies.push({
          id: state.nextId++,
          kind,
          isBoss: !!def.boss,
          isHeavy: !!def.heavy,
          isCaster: !!def.caster,
          isBomber: !!def.bomber,
          icon: def.icon,
          color: def.color,
          shape: def.shape || null,
          spriteKey: def.sprite,
          drawH: def.drawH,
          castleDmg: def.castle,
          x: Math.round(W * (0.07 + Math.random() * 0.86)),
          y: BATTLE_BOTTOM + 12 + Math.random() * 28,
          hp: Math.round(def.hp * scale),
          maxHp: Math.round(def.hp * scale),
          atk: Math.round(def.atk * scale),
          speed: spd,
          range: def.range,
          r: def.r,
          freezeTimer: 0,
          flash: 0,
          atkTimer: 0.15
        });
      }

      function openUpgradeDraft() {
        state.drafting = true;
        SFX.waveClear();
        // Retire 1★ soldiers into bonus coins so waves never infinitely snowball; 2★/3★ Elites stay as Champions!
        const kept = [];
        let retiredCount = 0;
        for (const s of state.soldiers) {
          if ((s.stars || 1) >= 2) kept.push(s);
          else if (state.veteransChance > 0 && Math.random() < state.veteransChance) kept.push(s);
          else retiredCount += 1;
        }
        state.soldiers = kept;
        if (retiredCount > 0) {
          state.gold += retiredCount * 3;
          showToast(`🎖️ ${retiredCount} 名 1★ 士兵凱旋換回 +$${retiredCount * 3}，${kept.length} 名留守！`);
        }
        // Clear between-wave carry that used to snowball (combo badge, shake slam, merge chain)
        state.comboCount = 0;
        state.comboTimer = 0;
        state.sameChainCount = 0;
        state.sameChainTimer = 0;
        state.lastSoldierType = null;
        state.shakeMeter = Math.min(state.shakeMeter, 35);
        updateUI();
        const isBossClear = state.wave % 3 === 0;
        const bounty = isBossClear ? (14 + state.wave * 3) : (6 + state.wave * 2);
        state.gold += bounty;
        if (state.wave >= 12 && !state.campaignWon) {
          state.campaignWon = true;
          const m = loadMeta();
          m.wins = (m.wins || 0) + 1;
          m.bestWave = Math.max(m.bestWave || 1, state.wave);
          saveMeta(m);
          showToast('🏰 守住第十二波！邊關暫時穩固，可繼續無盡守城。');
        }
        if (typeof setShopOpen === 'function') setShopOpen(false);
        const taken = new Set(state.relicIds);
        let pool = UPGRADE_POOL.filter(u => !(u.unique && taken.has(u.id)) && !(u.id === 'side_walls' && state.sideWalls));
        pool = pool.sort(() => Math.random() - 0.5);
        // After a boss, try to include one rare/economy/defense pick so the 3-choice stays distinct
        if (isBossClear) {
          const rare = pool.filter(u => u.tag === '稀有兵' || u.tag === '經濟' || u.tag === '城防');
          const rest = pool.filter(u => !rare.includes(u));
          pool = [...rare.slice(0, 1), ...rest];
        }
        pool = pool.slice(0, 3);
        // Never open a frozen draft with fewer than 3 tappable choices
        if (pool.length < 3) {
          const extra = UPGRADE_POOL.filter(u => !pool.some(p => p.id === u.id))
            .sort(() => Math.random() - 0.5);
          pool = pool.concat(extra).slice(0, 3);
        }

        if (!upgradeChoices || !upgradeModal) {
          state.drafting = false;
          showToast('三選一開啟失敗，自動繼續下一波。');
          state.wave += 1;
          state.rearmTimer = 2.4;
          return;
        }
        upgradeChoices.innerHTML = '';
        pool.forEach(u => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'upgrade-pick';
          btn.innerHTML = `
            <div class="upgrade-ico">${u.icon}</div>
            <div class="upgrade-name">${u.name}</div>
            <div class="upgrade-desc">${u.tag ? '【' + u.tag + '】 ' : ''}${u.desc}</div>
          `;
          btn.addEventListener('click', () => applyUpgrade(u));
          upgradeChoices.appendChild(btn);
        });
        if (!upgradeChoices.children || upgradeChoices.children.length === 0) {
          state.drafting = false;
          showToast('沒有可選升級，自動繼續下一波。');
          state.wave += 1;
          state.rearmTimer = 2.4;
          return;
        }

        upgradeModal.classList.remove('hidden');
        upgradeModal.classList.add('flex');
      }

      function applyUpgrade(u) {
        state.relics.push(u.icon);
        state.relicIds.push(u.id);
        if (u.id === 'add_meteor') state.bag.push('meteor', 'meteor');
        else if (u.id === 'add_warcry') state.bag.push('warcry', 'warcry');
        else if (u.id === 'add_mage') state.bag.push('mage', 'mage');
        else if (u.id === 'add_blizzard') state.bag.push('blizzard', 'blizzard');
        else if (u.id === 'add_hound') state.bag.push('hound', 'hound', 'hound');
        else if (u.id === 'add_spear') state.bag.push('spear', 'spear');
        else if (u.id === 'add_bombard') state.bag.push('bombard', 'bombard');
        else if (u.id === 'add_priest') state.bag.push('priest', 'priest');
        else if (u.id === 'add_banner') state.bag.push('banner', 'banner');
        else if (u.id === 'add_frost') state.bag.push('frost', 'frost');
        else if (u.id === 'add_alchemist') state.bag.push('alchemist', 'alchemist');
        else if (u.id === 'turbo_push') state.pusherSpeedMult += 0.35;
        else if (u.id === 'side_walls') state.sideWalls = true;
        else if (u.id === 'twin_drop') state.twinDrop += 1;
        else if (u.id === 'army_buff') state.armyMult += 0.25;
        else if (u.id === 'wide_gate') state.gateWidthMult += 0.45;
        else if (u.id === 'gate_slow') state.gateSpeedMult *= 0.55;
        else if (u.id === 'veterans') state.veteransChance = 0.4;
        else if (u.id === 'wall_repair') state.baseHp = Math.min(state.maxBaseHp, state.baseHp + 30);
        else if (u.id === 'gold_cache') state.gold += 28;
        else if (u.id === 'ammo_crate') state.ammo += 10;
        else if (u.id === 'rally') {
          const yb0 = BATTLE_TOP;
          const yh = BATTLE_BOTTOM - BATTLE_TOP;
          spawnSoldier('shield', Math.round(W * 0.3), yb0 + Math.round(yh * 0.36));
          spawnSoldier('knight', Math.round(W * 0.5), yb0 + Math.round(yh * 0.36));
          spawnSoldier('archer', Math.round(W * 0.7), yb0 + Math.round(yh * 0.22));
        } else if (u.id === 'keep_elite') {
          const ones = state.soldiers.filter(s => (s.stars || 1) === 1);
          if (ones.length) {
            const lucky = ones[Math.floor(Math.random() * ones.length)];
            lucky.stars = 2;
            lucky.maxHp = Math.round(lucky.maxHp * 1.3);
            lucky.hp = lucky.maxHp;
            lucky.atk = Math.round(lucky.atk * 1.25);
            addFloatText(lucky.x, lucky.y - 14, '晉升 2★!', '#fde047');
          }
        }

        state.ammo += 6;
        upgradeModal.classList.add('hidden');
        upgradeModal.classList.remove('flex');
        state.drafting = false;
        const nextWave = state.wave + 1;
        state.wave = nextWave;
        saveBest();
        ensureGarrison();
        state.rearmTimer = (nextWave % 3 === 0) ? 3.8 : 3.2;
        state.waveActive = false;
        state.spawnLeft = 0;
        showToast((nextWave % 3 === 0)
          ? `整軍 ${state.rearmTimer.toFixed(0)} 秒：第 ${nextWave} 波 BOSS 即將壓境…`
          : `整軍 ${state.rearmTimer.toFixed(0)} 秒：第 ${nextWave} 波即將開始，把握時間落幣！`);
        updateUI();
      }

      function ensureGarrison() {
        if (state.soldiers.length > 0) return;
        const yb0 = BATTLE_TOP;
        const yh = BATTLE_BOTTOM - BATTLE_TOP;
        const frontY = yb0 + Math.round(yh * 0.36);
        const backY = yb0 + Math.round(yh * 0.22);
        spawnSoldier('shield', Math.round(W * 0.28), frontY);
        spawnSoldier('knight', Math.round(W * 0.50), frontY);
        spawnSoldier('archer', Math.round(W * 0.72), backY);
        showToast('守軍重新列陣：3 名預備隊上場，趕緊補兵！');
      }

      // ==========================================
      // 8. MAIN UPDATE LOOP (PUSHER + FALLING COINS + SOLDIER WAR)
      // ==========================================
      function update(dt) {
        if (state.paused || state.gameOver || state.drafting) return;

        if (state.dropCooldown > 0) state.dropCooldown -= dt;
        // Drag-to-drop with the same interval as Space — cannot dump the bag in one second.
        if (state.dragDropCooldown > 0) state.dragDropCooldown -= dt;
        if (state.isDragging && state.dragDropCooldown <= 0 && state.ammo > 0 && state.dropCooldown <= 0) {
          dropPlayerCoin(state.dropXRatio * W);
          state.dragDropCooldown = 0.32;
        }

        if (state.rearmTimer > 0) {
          state.rearmTimer -= dt;
          if (state.rearmTimer <= 0) {
            state.rearmTimer = 0;
            startWave(state.wave);
          }
        }

        // Slow emergency coin trickle only when nearly empty (< 6 coins)
        state.ammoRegenTimer += dt;
        if (state.ammoRegenTimer >= 3.2) {
          state.ammoRegenTimer = 0;
          if (state.ammo < 6) { state.ammo += 1; updateUI(); }
        }

        if (state.comboTimer > 0) {
          state.comboTimer -= dt;
          if (state.comboTimer <= 0) { state.comboCount = 0; updateUI(); }
        }
        if (state.screenShake > 0) state.screenShake = Math.max(0, state.screenShake - dt * 28);
        if (state.blizzardFlash > 0) state.blizzardFlash = Math.max(0, state.blizzardFlash - dt);
        if (state.sameChainTimer > 0) {
          state.sameChainTimer -= dt;
          if (state.sameChainTimer <= 0) {
            state.sameChainCount = 0;
            state.lastSoldierType = null;
          }
        }
        // Moving x2 Golden Gate along bottom edge of pusher
        state.gatePhase += dt * 0.48 * (state.gateSpeedMult || 1);
        const halfGate = getGateHalfWidth();
        const cbMove = getCatchBounds();
        const minGX = cbMove.left + halfGate + 4;
        const maxGX = cbMove.right - halfGate - 4;
        state.gateX = minGX + ((Math.sin(state.gatePhase) + 1) / 2) * Math.max(10, maxGX - minGX);

        // --- A. TOP COIN PUSHER PHYSICS ---
        state.prevPusherY = state.pusherY;
        state.pusherPhase += dt * 2.35 * state.pusherSpeedMult;
        const osc = (Math.sin(state.pusherPhase) + 1) / 2;
        state.pusherY = PUSHER_MIN_Y + osc * (PUSHER_MAX_Y - PUSHER_MIN_Y);
        const pusherDeltaY = state.pusherY - state.prevPusherY;
        const pusherVelY = pusherDeltaY / Math.max(0.001, dt);

        for (const c of state.coins) {
          if (c.glow > 0) c.glow -= dt;
          c.x += c.vx * dt;
          c.y += c.vy * dt;
          const damp = Math.pow(0.04, dt);
          c.vx *= damp;
          c.vy *= damp;

          if (c.tier === 'upper') {
            // Ride forward with the moving shelf; when shelf retracts, back wall scrapes coins forward off the lip!
            if (pusherDeltaY > 0) {
              c.y += pusherDeltaY * 0.92;
            } else {
              c.y += pusherDeltaY * 0.25;
            }
            if (c.y - c.r * 0.7 < BED_TOP + 6) {
              c.y = BED_TOP + 6 + c.r * 0.7;
              c.vy = Math.max(c.vy, 28);
            }
            // Tumble off the front lip of the moving pusher shelf onto the lower deck!
            if (c.y > state.pusherY - 2) {
              c.tier = 'lower';
              c.y = state.pusherY + c.r * 0.85;
              c.vy = Math.max(c.vy, 95);
              SFX.clink();
            }
          } else {
            // Lower deck coins get shoved forward by the front brass edge of the pusher shelf!
            const effR = c.r * getDepthScale(c.y);
            if (c.y - effR < state.pusherY) {
              c.y = state.pusherY + effR;
              if (pusherVelY > 0) c.vy = Math.max(c.vy, pusherVelY * 1.12);
            }
            if (c.y - effR < BED_TOP) c.y = BED_TOP + effR;
          }
        }

        for (let iter = 0; iter < 3; iter++) {
          for (let i = 0; i < state.coins.length; i++) {
            const a = state.coins[i];
            for (let j = i + 1; j < state.coins.length; j++) {
              const b = state.coins[j];
              if (a.tier !== b.tier) continue;
              const dx = b.x - a.x;
              const dy = b.y - a.y;
              const dist = Math.hypot(dx, dy) || 0.001;
              const minD = a.r + b.r;
              if (dist < minD) {
                const overlap = (minD - dist) * 0.52;
                const nx = dx / dist;
                const ny = dy / dist;
                a.x -= nx * overlap; a.y -= ny * overlap;
                b.x += nx * overlap; b.y += ny * overlap;
                const relVy = (a.vy - b.vy) * ny;
                if (relVy > 0) {
                  const imp = relVy * 0.65;
                  a.vy -= imp * ny * 0.4;
                  b.vy += imp * ny * 0.9;
                  if (imp > 28 && iter === 0) SFX.clink();
                }
              }
            }
          }
        }

        for (let i = state.coins.length - 1; i >= 0; i--) {
          const c = state.coins[i];
          if (c.y >= BED_BOTTOM - 2) {
            state.coins.splice(i, 1);
            launchCoinIntoBattlefield(c);
            continue;
          }
          const railL = getRailLeft(c.y);
          const railR = getRailRight(c.y);
          const effR = c.r * getDepthScale(c.y);
          if (state.sideWalls) {
            if (c.x - effR < railL) { c.x = railL + effR; c.vx = Math.abs(c.vx) * 0.4; }
            if (c.x + effR > railR) { c.x = railR - effR; c.vx = -Math.abs(c.vx) * 0.4; }
          } else {
            // Coins stay tightly inside the diagonal brass rails; only the very front corners can slip out
            if (c.x - effR < railL) { c.x = railL + effR; c.vx = Math.abs(c.vx) * 0.35; }
            if (c.x + effR > railR) { c.x = railR - effR; c.vx = -Math.abs(c.vx) * 0.35; }
          }
        }

        // --- B. FALLING COINS ANIMATION (DROP INTO BATTLEFIELD) ---
        const DROP_GRAV = 1850;
        for (let i = state.fallingDrops.length - 1; i >= 0; i--) {
          const d = state.fallingDrops[i];
          d.vy += DROP_GRAV * dt;
          d.x += d.vx * dt;
          d.y += d.vy * dt;
          d.rot += (d.rotV || 0) * dt;
          d.vx += (d.landX - d.x) * 5.5 * dt;
          d.vx *= Math.pow(0.18, dt);
          if (d.y >= d.landY && d.vy > 0) {
            d.y = d.landY;
            d.bounces = (d.bounces || 0) + 1;
            addParticles(d.x, d.landY, '#c4a574', 3);
            const bounceV = -d.vy * 0.32;
            if (d.bounces >= (d.maxBounces || 2) || Math.abs(bounceV) < 90) {
              d.x = d.landX;
              d.y = d.landY;
              d.tx = d.x;
              d.ty = d.y;
              state.fallingDrops.splice(i, 1);
              resolveBattlefieldLanding(d);
              continue;
            }
            d.vy = bounceV;
            d.rotV = (d.rotV || 0) * 0.45;
          }
        }

        // --- C. BOTTOM SOLDIER VS MONSTER BATTLEFIELD ---
        if (state.waveActive && state.spawnLeft > 0) {
          state.spawnTimer -= dt;
          if (state.spawnTimer <= 0) {
            if (state.enemies.length >= MAX_LIVE_ENEMIES) {
              state.spawnTimer = 0.2;
            } else {
              let batch = state.wave === 1 ? 4 : (4 + Math.min(4, Math.floor(state.wave / 2)));
              if (Math.random() < 0.3) batch += 1;
              batch = Math.min(batch, state.spawnLeft, MAX_LIVE_ENEMIES - state.enemies.length);
              for (let b = 0; b < batch; b++) {
                spawnEnemy();
                state.spawnLeft -= 1;
              }
              state.spawnTimer = state.wave === 1 ? 0.58 : Math.max(0.22, 0.62 - state.wave * 0.04);
            }
          }
        } else if (state.waveActive && state.spawnLeft === 0 && state.enemies.length === 0) {
          state.waveActive = false;
          openUpgradeDraft();
          return;
        }

        // Banner aura: nearby allies gain attack
        for (const s of state.soldiers) s.auraMul = 1;
        for (const s of state.soldiers) {
          if (!s.auraAtk) continue;
          for (const ally of state.soldiers) {
            if (Math.hypot(ally.x - s.x, ally.y - s.y) <= 72) {
              ally.auraMul = Math.max(ally.auraMul || 1, s.auraAtk);
            }
          }
        }

        // Soldiers AI
        for (const s of state.soldiers) {
          if (s.flash > 0) s.flash -= dt;
          if (s.frenzyTimer > 0) s.frenzyTimer -= dt;
          s.cdTimer -= dt * (s.frenzyTimer > 0 ? 1.85 : 1);

          // Find nearest enemy
          let target = null;
          let bestD = Infinity;
          for (const e of state.enemies) {
            const d = Math.hypot(e.x - s.x, e.y - s.y);
            if (d < bestD) { bestD = d; target = e; }
          }

          if (s.heal && s.cdTimer <= 0) {
            let patient = null;
            let worst = 0.92;
            for (const ally of state.soldiers) {
              if (ally.id === s.id) continue;
              const ratio = ally.hp / Math.max(1, ally.maxHp);
              if (ratio < worst && Math.hypot(ally.x - s.x, ally.y - s.y) <= s.range + 20) {
                worst = ratio;
                patient = ally;
              }
            }
            if (patient) {
              s.cdTimer = s.cd;
              const healAmt = Math.round(Math.max(10, patient.maxHp * 0.16));
              patient.hp = Math.min(patient.maxHp, patient.hp + healAmt);
              addParticles(patient.x, patient.y, '#fde68a', 5);
              addFloatText(patient.x, patient.y - 12, `+${healAmt}`, '#fde68a');
            }
          }

          if (target) {
            if (bestD <= s.range + target.r) {
              if (s.cdTimer <= 0) {
                s.cdTimer = s.cd;
                if (s.proj) {
                  const dx = target.x - s.x;
                  const dy = target.y - s.y;
                  const len = Math.hypot(dx, dy) || 1;
                  state.projectiles.push({
                    x: s.x, y: s.y,
                    vx: (dx / len) * 260,
                    vy: (dy / len) * 260,
                    dmg: Math.round(s.atk * (s.auraMul || 1)),
                    color: s.proj,
                    r: s.aoe ? 5.5 : 3.5,
                    aoe: s.aoe,
                    pierce: false,
                    chill: s.chill || 0,
                    lootGold: !!s.lootGold,
                    hitIds: new Set()
                  });
                } else {
                  SFX.hit();
                  hurtEnemy(target, Math.round(s.atk * (s.auraMul || 1)), '#fca5a5', { lootGold: !!s.lootGold, chill: s.chill || 0 });
                }
              }
            }
          }
          const yb = battleYBounds();
          s.x = Math.max(Math.round(W * 0.06), Math.min(W - Math.round(W * 0.06), s.x));
          s.y = Math.max(yb.top, Math.min(yb.bot, s.y));
        }

        // Soft crowd spacing so dozens of troops form ranks instead of one pile.
        if (state.soldiers.length > 1) {
          const yb2 = battleYBounds();
          for (let i = 0; i < state.soldiers.length; i++) {
            const a = state.soldiers[i];
            for (let j = i + 1; j < state.soldiers.length; j++) {
              const b = state.soldiers[j];
              const dx = b.x - a.x;
              const dy = b.y - a.y;
              const dist = Math.hypot(dx, dy) || 0.001;
              const minD = (a.r + b.r) * 0.95;
              if (dist < minD) {
                const push = (minD - dist) * 0.22;
                const nx = dx / dist;
                const ny = dy / dist;
                a.x -= nx * push; a.y -= ny * push;
                b.x += nx * push; b.y += ny * push;
              }
            }
          }
          for (const s of state.soldiers) {
            s.x = Math.max(Math.round(W * 0.06), Math.min(W - Math.round(W * 0.06), s.x));
            s.y = Math.max(yb2.top, Math.min(yb2.bot, s.y));
          }
        }

        // Projectiles
        for (let i = state.projectiles.length - 1; i >= 0; i--) {
          const p = state.projectiles[i];
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          if (p.x < 0 || p.x > W + 20 || p.y < BATTLE_TOP - 10 || p.y > BATTLE_BOTTOM + 10) {
            state.projectiles.splice(i, 1);
            continue;
          }
          let consumed = false;
          for (const e of [...state.enemies]) {
            if (p.hitIds.has(e.id)) continue;
            if (Math.hypot(e.x - p.x, e.y - p.y) <= e.r + p.r + 4) {
              p.hitIds.add(e.id);
              if (p.aoe) {
                addParticles(p.x, p.y, '#fb923c', 8);
                for (const other of [...state.enemies]) {
                  if (Math.hypot(other.x - p.x, other.y - p.y) <= 48) {
                    hurtEnemy(other, p.dmg, '#fb923c', { chill: p.chill || 0, lootGold: !!p.lootGold });
                  }
                }
              } else {
                hurtEnemy(e, p.dmg, p.color, { chill: p.chill || 0, lootGold: !!p.lootGold });
              }
              if (!p.pierce) { consumed = true; break; }
            }
          }
          if (consumed) state.projectiles.splice(i, 1);
        }

        // Enemies AI (clash with soldiers or attack the rear wall at the top)
        const gateY = castleBreakY();
        for (const e of state.enemies) {
          if (e.flash > 0) e.flash -= dt;
          if (e.freezeTimer > 0) { e.freezeTimer -= dt; continue; }

          // Check nearest soldier within enemy attack range (ranged casters shoot from afar!)
          let blocker = null;
          let minD = (e.range || 38) + e.r + 6;
          for (const s of state.soldiers) {
            const d = Math.hypot(s.x - e.x, s.y - e.y);
            if (d < minD) { minD = d; blocker = s; }
          }

          if (blocker) {
            e.atkTimer -= dt;
            if (e.atkTimer <= 0) {
              e.atkTimer = e.isBoss ? 1.05 : (e.isCaster ? 1.35 : 0.95);
              if (e.isCaster) {
                const dx = blocker.x - e.x;
                const dy = blocker.y - e.y;
                const len = Math.hypot(dx, dy) || 1;
                state.enemyProjectiles.push({
                  x: e.x, y: e.y,
                  vx: (dx / len) * 200,
                  vy: (dy / len) * 200,
                  dmg: e.atk
                });
              } else if (e.isBomber) {
                // Suicide Bomber explodes and damages ALL nearby soldiers!
                SFX.meteor();
                state.screenShake = Math.max(state.screenShake, 6);
                addParticles(e.x, e.y, '#f97316', 18);
                addFloatText(e.x, e.y - 12, '💥 自爆!', '#fb923c');
                for (const s of [...state.soldiers]) {
                  if (Math.hypot(s.x - e.x, s.y - e.y) <= 58) {
                    s.hp -= e.atk;
                    s.flash = 0.18;
                    if (s.hp <= 0) {
                      addParticles(s.x, s.y, s.color, 8);
                      state.soldiers = state.soldiers.filter(u => u.id !== s.id);
                    }
                  }
                }
                state.enemies = state.enemies.filter(en => en.id !== e.id);
                updateUI();
              } else if (e.isHeavy || e.isBoss) {
                // AoE Cleave / Ground Slam hits all nearby soldiers!
                const cleaveR = e.isBoss ? 68 : 44;
                addParticles(blocker.x, blocker.y, '#f43f5e', e.isBoss ? 12 : 6);
                for (const s of [...state.soldiers]) {
                  if (Math.hypot(s.x - e.x, s.y - e.y) <= cleaveR) {
                    s.hp -= e.atk;
                    s.flash = 0.16;
                    if (s.hp <= 0) {
                      addParticles(s.x, s.y, s.color, 8);
                      state.soldiers = state.soldiers.filter(u => u.id !== s.id);
                    }
                  }
                }
                updateUI();
              } else {
                blocker.hp -= e.atk;
                blocker.flash = 0.14;
                if (blocker.hp <= 0) {
                  addParticles(blocker.x, blocker.y, blocker.color, 8);
                  state.soldiers = state.soldiers.filter(s => s.id !== blocker.id);
                  updateUI();
                }
              }
            }
          } else if (e.y - e.r > gateY) {
            e.y -= e.speed * dt;
          } else {
            e.atkTimer -= dt;
            if (e.atkTimer <= 0) {
              e.atkTimer = e.isBoss ? 1.7 : 1.4;
              const dmg = e.castleDmg || (e.isBoss ? 16 : 6);
              state.baseHp = Math.max(0, state.baseHp - dmg);
              state.screenShake = Math.max(state.screenShake, e.isBoss ? 9 : 4);
              addFloatText(e.x, gateY + 10, `-${dmg} 城堡`, '#fb7185');
              SFX.meteor();

              if (e.isBoss && state.coins.filter(c => c.type === 'stone').length < 3) {
                const sx = BED_LEFT + 36 + Math.random() * (BED_RIGHT - BED_LEFT - 72);
                spawnBoardCoin('stone', sx, PUSHER_MAX_Y + 14, 40);
                showToast('🪨 Boss 砸機！上方推幣機掉落詛咒石！');
              }

              updateUI();
              if (state.baseHp <= 0) { triggerGameOver(); return; }
            }
          }
        }

        // Enemy ranged shadow bolts
        for (let i = state.enemyProjectiles.length - 1; i >= 0; i--) {
          const ep = state.enemyProjectiles[i];
          ep.x += ep.vx * dt;
          ep.y += ep.vy * dt;
          if (ep.x < -10 || ep.x > W + 10 || ep.y < BATTLE_TOP - 10 || ep.y > BATTLE_BOTTOM + 10) {
            state.enemyProjectiles.splice(i, 1);
            continue;
          }
          let hit = false;
          for (const s of state.soldiers) {
            if (Math.hypot(s.x - ep.x, s.y - ep.y) <= s.r + 5) {
              s.hp -= ep.dmg;
              s.flash = 0.14;
              addParticles(s.x, s.y, '#c084fc', 5);
              if (s.hp <= 0) {
                state.soldiers = state.soldiers.filter(u => u.id !== s.id);
                updateUI();
              }
              hit = true;
              break;
            }
          }
          if (hit) state.enemyProjectiles.splice(i, 1);
        }

        // Meteors, Particles, Floating Texts
        for (let i = state.meteors.length - 1; i >= 0; i--) {
          state.meteors[i].life -= dt;
          if (state.meteors[i].life <= 0) state.meteors.splice(i, 1);
        }
        for (let i = state.particles.length - 1; i >= 0; i--) {
          const p = state.particles[i];
          p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
          if (p.life <= 0) state.particles.splice(i, 1);
        }
        for (let i = state.floatTexts.length - 1; i >= 0; i--) {
          const f = state.floatTexts[i];
          f.y -= 26 * dt; f.life -= dt;
          if (f.life <= 0) state.floatTexts.splice(i, 1);
        }
      }

      function triggerGameOver() {
        state.gameOver = true;
        saveBest();
        gameOverText.textContent = `你成功守住了 ${state.wave - 1} 波怪獸軍團，收集了 ${state.relics.length} 項強化！最高紀錄：第 ${state.bestWave} 波。`;
        gameOverModal.classList.remove('hidden');
        gameOverModal.classList.add('flex');
        updateUI();
      }

      // ==========================================
      // 9. RENDERER (TOP: PUSHER | BOTTOM: ARMY WAR)
      // ==========================================
      function drawSilhouette(x, y, w, h, color, shape, flash) {
        ctx.save();
        if (flash) ctx.globalAlpha = 1;
        const ox = x - w / 2;
        const oy = y - h * 0.56;
        ctx.fillStyle = color;
        ctx.strokeStyle = '#0b0f16';
        ctx.lineWidth = 1;
        const midX = x;
        const midY = oy + h * 0.45;
        if (shape === 'slime') {
          ctx.beginPath();
          ctx.ellipse(midX, midY + h * 0.12, w * 0.42, h * 0.36, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,0.35)';
          ctx.beginPath();
          ctx.ellipse(midX - w * 0.1, midY, w * 0.14, h * 0.1, -0.4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#0b0f16';
          ctx.beginPath();
          ctx.arc(midX - w * 0.1, midY + h * 0.04, Math.max(1.2, w * 0.06), 0, Math.PI * 2);
          ctx.arc(midX + w * 0.12, midY + h * 0.04, Math.max(1.2, w * 0.06), 0, Math.PI * 2);
          ctx.fill();
        } else if (shape === 'wolf' || shape === 'hound') {
          ctx.beginPath();
          ctx.ellipse(midX, midY + h * 0.1, w * 0.4, h * 0.2, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillRect(midX + w * 0.18, midY - h * 0.08, w * 0.22, h * 0.22);
          ctx.beginPath();
          ctx.moveTo(midX + w * 0.36, midY - h * 0.08);
          ctx.lineTo(midX + w * 0.5, midY + h * 0.02);
          ctx.lineTo(midX + w * 0.34, midY + h * 0.08);
          ctx.fill();
          ctx.fillRect(midX - w * 0.28, midY + h * 0.22, w * 0.08, h * 0.18);
          ctx.fillRect(midX - w * 0.08, midY + h * 0.22, w * 0.08, h * 0.18);
          ctx.fillRect(midX + w * 0.1, midY + h * 0.22, w * 0.08, h * 0.16);
          ctx.fillRect(midX + w * 0.26, midY + h * 0.22, w * 0.08, h * 0.16);
        } else if (shape === 'imp') {
          ctx.beginPath();
          ctx.moveTo(midX, midY - h * 0.28);
          ctx.lineTo(midX + w * 0.22, midY + h * 0.28);
          ctx.lineTo(midX - w * 0.22, midY + h * 0.28);
          ctx.closePath();
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(midX - w * 0.1, midY - h * 0.22);
          ctx.lineTo(midX - w * 0.2, midY - h * 0.42);
          ctx.lineTo(midX - w * 0.02, midY - h * 0.28);
          ctx.moveTo(midX + w * 0.1, midY - h * 0.22);
          ctx.lineTo(midX + w * 0.2, midY - h * 0.42);
          ctx.lineTo(midX + w * 0.02, midY - h * 0.28);
          ctx.fill();
        } else if (shape === 'troll') {
          ctx.fillRect(midX - w * 0.28, midY - h * 0.1, w * 0.56, h * 0.5);
          ctx.beginPath();
          ctx.arc(midX, midY - h * 0.22, w * 0.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillRect(midX - w * 0.4, midY, w * 0.14, h * 0.32);
          ctx.fillRect(midX + w * 0.26, midY, w * 0.14, h * 0.32);
        } else if (shape === 'skel') {
          ctx.fillStyle = '#e7e5e4';
          ctx.fillRect(midX - w * 0.1, midY - h * 0.08, w * 0.2, h * 0.4);
          ctx.beginPath();
          ctx.arc(midX, midY - h * 0.22, w * 0.14, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#d6d3d1';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(midX + w * 0.18, midY, w * 0.22, -0.9, 0.9);
          ctx.stroke();
        } else if (shape === 'shaman') {
          ctx.beginPath();
          ctx.moveTo(midX, midY - h * 0.15);
          ctx.lineTo(midX + w * 0.26, midY + h * 0.38);
          ctx.lineTo(midX - w * 0.26, midY + h * 0.38);
          ctx.closePath();
          ctx.fill();
          ctx.beginPath();
          ctx.arc(midX, midY - h * 0.22, w * 0.13, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillRect(midX + w * 0.14, midY - h * 0.35, 2, h * 0.55);
          ctx.beginPath();
          ctx.arc(midX + w * 0.15, midY - h * 0.38, w * 0.08, 0, Math.PI * 2);
          ctx.fill();
        } else if (shape === 'brute') {
          ctx.fillRect(midX - w * 0.36, midY - h * 0.08, w * 0.72, h * 0.5);
          ctx.fillRect(midX - w * 0.2, midY - h * 0.32, w * 0.4, h * 0.28);
          ctx.fillStyle = '#f5f5f4';
          ctx.fillRect(midX - w * 0.3, midY - h * 0.02, w * 0.1, h * 0.08);
          ctx.fillRect(midX + w * 0.2, midY - h * 0.02, w * 0.1, h * 0.08);
        } else if (shape === 'spear') {
          ctx.fillRect(midX - w * 0.14, midY - h * 0.06, w * 0.28, h * 0.42);
          ctx.beginPath();
          ctx.arc(midX, midY - h * 0.2, w * 0.12, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#99f6e4';
          ctx.fillRect(midX + w * 0.06, midY - h * 0.4, 2, h * 0.7);
          ctx.beginPath();
          ctx.moveTo(midX + w * 0.07, midY - h * 0.42);
          ctx.lineTo(midX + w * 0.2, midY - h * 0.28);
          ctx.lineTo(midX + w * 0.02, midY - h * 0.28);
          ctx.closePath();
          ctx.fill();
        } else if (shape === 'priest') {
          ctx.fillStyle = '#fef3c7';
          ctx.beginPath();
          ctx.moveTo(midX, midY - h * 0.12);
          ctx.lineTo(midX + w * 0.26, midY + h * 0.38);
          ctx.lineTo(midX - w * 0.26, midY + h * 0.38);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = '#f5c542';
          ctx.beginPath();
          ctx.arc(midX, midY - h * 0.22, w * 0.13, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillRect(midX - 1, midY - h * 0.42, 2, h * 0.14);
          ctx.fillRect(midX - w * 0.08, midY - h * 0.36, w * 0.16, 2);
        } else if (shape === 'bombard') {
          ctx.fillRect(midX - w * 0.2, midY - h * 0.02, w * 0.4, h * 0.36);
          ctx.beginPath();
          ctx.arc(midX, midY - h * 0.16, w * 0.13, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#1e1b4b';
          ctx.fillRect(midX + w * 0.08, midY - h * 0.08, w * 0.32, h * 0.12);
        } else if (shape === 'rogue') {
          ctx.fillRect(midX - w * 0.1, midY - h * 0.08, w * 0.2, h * 0.44);
          ctx.beginPath();
          ctx.arc(midX, midY - h * 0.2, w * 0.11, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#e9d5ff';
          ctx.beginPath();
          ctx.moveTo(midX + w * 0.1, midY);
          ctx.lineTo(midX + w * 0.32, midY + h * 0.04);
          ctx.lineTo(midX + w * 0.1, midY + h * 0.1);
          ctx.closePath();
          ctx.fill();
        } else if (shape === 'banner') {
          ctx.fillRect(midX - w * 0.1, midY - h * 0.08, w * 0.2, h * 0.44);
          ctx.beginPath(); ctx.arc(midX, midY - h * 0.22, w * 0.11, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#7f1d1d';
          ctx.fillRect(midX + w * 0.04, midY - h * 0.5, 3, h * 0.7);
          ctx.fillRect(midX + w * 0.04, midY - h * 0.5, w * 0.28, h * 0.22);
        } else if (shape === 'frost') {
          ctx.fillRect(midX - w * 0.12, midY - h * 0.06, w * 0.24, h * 0.4);
          ctx.beginPath(); ctx.arc(midX, midY - h * 0.22, w * 0.12, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#e0f2fe';
          ctx.beginPath();
          ctx.moveTo(midX, midY - h * 0.48);
          ctx.lineTo(midX + w * 0.14, midY - h * 0.22);
          ctx.lineTo(midX - w * 0.14, midY - h * 0.22);
          ctx.closePath(); ctx.fill();
        } else if (shape === 'alchemist') {
          ctx.fillRect(midX - w * 0.12, midY - h * 0.06, w * 0.24, h * 0.4);
          ctx.beginPath(); ctx.arc(midX, midY - h * 0.2, w * 0.11, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#a3e635';
          ctx.fillRect(midX + w * 0.1, midY, w * 0.16, h * 0.2);
        } else if (shape === 'bat') {
          ctx.beginPath(); ctx.arc(midX, midY, w * 0.12, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath();
          ctx.moveTo(midX - w * 0.12, midY);
          ctx.lineTo(midX - w * 0.4, midY - h * 0.16);
          ctx.lineTo(midX - w * 0.12, midY + h * 0.08);
          ctx.moveTo(midX + w * 0.12, midY);
          ctx.lineTo(midX + w * 0.4, midY - h * 0.16);
          ctx.lineTo(midX + w * 0.12, midY + h * 0.08);
          ctx.fill();
        } else if (shape === 'beetle') {
          ctx.beginPath(); ctx.ellipse(midX, midY + h * 0.06, w * 0.28, h * 0.22, 0, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(midX, midY - h * 0.1, w * 0.14, 0, Math.PI * 2); ctx.fill();
        } else if (shape === 'wraith') {
          ctx.globalAlpha = 0.85;
          ctx.beginPath();
          ctx.moveTo(midX, midY + h * 0.3);
          ctx.lineTo(midX + w * 0.22, midY);
          ctx.lineTo(midX, midY - h * 0.28);
          ctx.lineTo(midX - w * 0.22, midY);
          ctx.closePath(); ctx.fill();
          ctx.globalAlpha = 1;
        } else if (shape === 'stoneboss' || shape === 'colossus') {
          ctx.fillRect(midX - w * 0.28, midY - h * 0.1, w * 0.56, h * 0.48);
          ctx.fillRect(midX - w * 0.18, midY - h * 0.36, w * 0.36, h * 0.28);
        } else if (shape === 'witch') {
          ctx.fillRect(midX - w * 0.14, midY - h * 0.04, w * 0.28, h * 0.42);
          ctx.beginPath(); ctx.arc(midX, midY - h * 0.18, w * 0.13, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#2e1065';
          ctx.beginPath();
          ctx.moveTo(midX, midY - h * 0.55);
          ctx.lineTo(midX + w * 0.22, midY - h * 0.16);
          ctx.lineTo(midX - w * 0.22, midY - h * 0.16);
          ctx.closePath(); ctx.fill();
        } else if (shape === 'shield') {
          ctx.beginPath();
          ctx.moveTo(midX, midY - h * 0.1);
          ctx.lineTo(midX + w * 0.28, midY);
          ctx.lineTo(midX, midY + h * 0.4);
          ctx.lineTo(midX - w * 0.28, midY);
          ctx.closePath();
          ctx.fill();
          ctx.beginPath();
          ctx.arc(midX, midY - h * 0.22, w * 0.12, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Generic humanoid fallback (knight / archer / mage / etc.)
          ctx.fillRect(midX - w * 0.16, midY - h * 0.06, w * 0.32, h * 0.42);
          ctx.beginPath();
          ctx.arc(midX, midY - h * 0.2, w * 0.13, 0, Math.PI * 2);
          ctx.fill();
          if (shape === 'archer') {
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(midX + w * 0.16, midY, w * 0.2, -1, 1);
            ctx.stroke();
          } else if (shape === 'mage') {
            ctx.fillRect(midX + w * 0.12, midY - h * 0.4, 2, h * 0.55);
          } else if (shape === 'knight') {
            ctx.fillRect(midX + w * 0.14, midY - h * 0.05, w * 0.2, 3);
          }
        }
        ctx.restore();
      }

      function crowdScale() {
        const n = state.soldiers.length + state.enemies.length;
        if (n > 70) return 0.78;
        if (n > 45) return 0.86;
        if (n > 28) return 0.93;
        return 1;
      }

      function render() {
        ctx.save();
        if (state.screenShake > 0.2) {
          ctx.translate((Math.random() - 0.5) * state.screenShake * 1.4, (Math.random() - 0.5) * state.screenShake * 1.4);
        }
        ctx.clearRect(-20, -20, W + 40, H + 40);

        ctx.imageSmoothingEnabled = false;
        const nowSec = performance.now() * 0.001;

        // --- A. TOP COIN PUSHER MACHINE (native-wide on desktop, original on phone) ---
        ctx.fillStyle = '#141218';
        ctx.fillRect(0, 0, W, PUSHER_PANEL_H);
        const pusherBg = (!isMobileLayout() && imgReady(ASSETS.bg_pusher_wide))
          ? ASSETS.bg_pusher_wide
          : ASSETS.bg_pusher;
        if (!drawImageCover(pusherBg, 0, 0, W, PUSHER_PANEL_H, 'top')) {
          ctx.fillStyle = '#3b2414';
          ctx.fillRect(0, 0, W, PUSHER_PANEL_H);
        }

        // Side Walls glow along diagonal rails if upgraded
        if (state.sideWalls) {
          ctx.lineWidth = 3;
          ctx.strokeStyle = '#38bdf8';
          ctx.beginPath();
          ctx.moveTo(getRailLeft(BED_TOP), BED_TOP); ctx.lineTo(getRailLeft(BED_BOTTOM), BED_BOTTOM);
          ctx.moveTo(getRailRight(BED_TOP), BED_TOP); ctx.lineTo(getRailRight(BED_BOTTOM), BED_BOTTOM);
          ctx.stroke();
        }

        // Helper to draw a perspective-scaled pixel coin
        const drawSingleCoin = (c) => {
          const def = COIN_TYPES[c.type];
          const spr = ASSETS['c_' + c.type];
          const sc = getDepthScale(c.y);
          const rr = c.r * sc;
          ctx.beginPath();
          ctx.ellipse(c.x, c.y + rr * 0.72, rr * 0.92, rr * 0.42, 0, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0,0,0,0.45)';
          ctx.fill();
          if (imgReady(spr)) {
            const sz = rr * 2.15;
            ctx.drawImage(spr, Math.round(c.x - sz / 2), Math.round(c.y - sz / 2), Math.round(sz), Math.round(sz));
          } else {
            ctx.beginPath();
            ctx.arc(c.x, c.y, rr, 0, Math.PI * 2);
            ctx.fillStyle = def.fill;
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = def.stroke;
            ctx.stroke();
            ctx.font = `${Math.round(rr * 0.92)}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(def.icon, c.x, c.y + 1);
          }
        };

        // 1) Draw Lower Deck Coins first
        state.coins.filter(c => c.tier !== 'upper').sort((a, b) => a.y - b.y).forEach(drawSingleCoin);

        // 2) Draw the moving pusher as a solid wood plate (texture locked to the front, no stretch)
        drawPusherPlate();

        // 3) Draw Upper Shelf Coins riding ON TOP of the moving pusher shelf!
        state.coins.filter(c => c.tier === 'upper').sort((a, b) => a.y - b.y).forEach(drawSingleCoin);

        // Visible aim cue: a ghost coin, a column down to the lip, and a landing mark in the allied zone.
        const aimY = BED_TOP + 20;
        const aimX = Math.max(getRailLeft(aimY) + 16, Math.min(getRailRight(aimY) - 16, state.dropXRatio * W));
        ctx.strokeStyle = 'rgba(250, 204, 21, 0.7)';
        ctx.setLineDash([5, 4]);
        ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(aimX, BED_TOP); ctx.lineTo(aimX, BED_BOTTOM); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(250, 204, 21, 0.28)';
        ctx.beginPath(); ctx.arc(aimX, aimY, 11, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#f5c542';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(aimX, aimY, 11, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(aimX, aimY - 16); ctx.lineTo(aimX - 5, aimY - 8); ctx.lineTo(aimX + 5, aimY - 8);
        ctx.closePath();
        ctx.fillStyle = '#f5c542';
        ctx.fill();

        // Subtle highlight right along the wooden cliff drop edge
        ctx.strokeStyle = 'rgba(250, 204, 21, 0.55)';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(getRailLeft(BED_BOTTOM), BED_BOTTOM); ctx.lineTo(getRailRight(BED_BOTTOM), BED_BOTTOM); ctx.stroke();

        // Draw Left/Right Dead MISS Gutters + Center Catch Zone inside the dark drop pit!
        const gHalf = getGateHalfWidth();
        const pitH = Math.max(20, PUSHER_PANEL_H - BED_BOTTOM - 4);
        const cb = getCatchBounds();
        const railLBot = getRailLeft(BED_BOTTOM);
        const railRBot = getRailRight(BED_BOTTOM);

        // Dark wood drop trough under the lip
        ctx.fillStyle = '#1a1008';
        ctx.fillRect(Math.round(railLBot), BED_BOTTOM + 3, Math.max(0, Math.round(railRBot - railLBot)), pitH);
        // Red-cloth miss gutters
        ctx.fillStyle = '#6b1c1c';
        ctx.fillRect(Math.round(railLBot), BED_BOTTOM + 3, Math.max(0, Math.round(cb.left - railLBot)), pitH);
        ctx.fillRect(Math.round(cb.right), BED_BOTTOM + 3, Math.max(0, Math.round(railRBot - cb.right)), pitH);
        ctx.fillStyle = 'rgba(40, 12, 12, 0.35)';
        ctx.fillRect(Math.round(railLBot), BED_BOTTOM + 3, Math.max(0, Math.round(cb.left - railLBot)), 3);
        ctx.fillRect(Math.round(cb.right), BED_BOTTOM + 3, Math.max(0, Math.round(railRBot - cb.right)), 3);
        ctx.font = isMobileLayout() ? '800 9px "Noto Sans TC", sans-serif' : '800 11px "Noto Sans TC", sans-serif';
        ctx.fillStyle = '#f0c7c7';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if (cb.left - railLBot > 24) ctx.fillText('漏幣', (railLBot + cb.left) / 2, BED_BOTTOM + 3 + pitH / 2);
        if (railRBot - cb.right > 24) ctx.fillText('漏幣', (cb.right + railRBot) / 2, BED_BOTTOM + 3 + pitH / 2);

        // Brass lip around the catch, not a flat green HTML box
        ctx.strokeStyle = 'rgba(184, 134, 46, 0.7)';
        ctx.lineWidth = 2;
        ctx.strokeRect(Math.round(cb.left), BED_BOTTOM + 3, Math.round(cb.right - cb.left), pitH);
        drawX2Gate(state.gateX - gHalf, BED_BOTTOM + 3, gHalf * 2, pitH);

        // Clean Divider Bar between Pusher Panel and Castle Battlefield
        ctx.fillStyle = '#181412';
        ctx.fillRect(0, PUSHER_PANEL_H, W, BATTLE_TOP - PUSHER_PANEL_H);
        ctx.strokeStyle = '#785a28';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, PUSHER_PANEL_H); ctx.lineTo(W, PUSHER_PANEL_H);
        ctx.moveTo(0, BATTLE_TOP); ctx.lineTo(W, BATTLE_TOP);
        ctx.stroke();

        ctx.font = isMobileLayout() ? '800 10px Inter, Noto Sans TC, sans-serif' : '800 13px Inter, Noto Sans TC, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if (state.sameChainCount >= 1 && state.lastSoldierType && state.sameChainTimer > 0) {
          const nextStar = state.sameChainCount + 1;
          ctx.fillStyle = '#34d399';
          ctx.fillText(`✨ 連跌合成中：再落 1 枚 ${COIN_TYPES[state.lastSoldierType].icon} 合成 ${nextStar}★ 精英！`, W / 2, (PUSHER_PANEL_H + BATTLE_TOP) / 2);
        } else {
          ctx.fillStyle = '#fde047';
          ctx.fillText('▼ 跌入下方移動 x2 黃金槽＝雙倍爆兵／地圖砲 ▼', W / 2, (PUSHER_PANEL_H + BATTLE_TOP) / 2);
        }

        // --- B. BOTTOM MOBILE WAR BATTLEFIELD (16-BIT PIXEL ART CASTLE BG) ---
        {
          const battleH = BATTLE_BOTTOM - BATTLE_TOP;
          ctx.fillStyle = '#2d4c2b';
          ctx.fillRect(0, BATTLE_TOP, W, battleH);
          if (!drawBattleBackground(0, BATTLE_TOP, W, battleH)) {
            ctx.fillStyle = '#2d4c2b';
            ctx.fillRect(0, BATTLE_TOP, W, battleH);
          }
        }

        if (state.blizzardFlash > 0) {
          ctx.fillStyle = `rgba(56, 189, 248, ${state.blizzardFlash * 0.45})`;
          ctx.fillRect(0, BATTLE_TOP, W, BATTLE_BOTTOM - BATTLE_TOP);
        }

        // Allied-zone landing preview so aim on the tray maps to a place on the field.
        {
          const battleH = Math.max(100, BATTLE_BOTTOM - BATTLE_TOP);
          const normX = Math.max(0, Math.min(1, (aimX - BED_LEFT) / Math.max(1, BED_RIGHT - BED_LEFT)));
          const landX = Math.round(W * 0.06 + normX * W * 0.88);
          const landY = BATTLE_TOP + Math.round(battleH * 0.30);
          ctx.save();
          ctx.strokeStyle = 'rgba(250, 204, 21, 0.55)';
          ctx.setLineDash([3, 4]);
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(landX, BATTLE_TOP + 8);
          ctx.lineTo(landX, landY);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.beginPath();
          ctx.arc(landX, landY, 9, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = 'rgba(250, 204, 21, 0.16)';
          ctx.fill();
          ctx.restore();
        }

        // Meteor Explosions
        for (const m of state.meteors) {
          const a = Math.max(0, m.life / m.maxLife);
          ctx.beginPath();
          ctx.arc(m.x, m.y, m.r * (1.25 - a * 0.4), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(249, 115, 22, ${a * 0.45})`;
          ctx.fill();
          ctx.strokeStyle = `rgba(254, 215, 170, ${a})`;
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }

        // Draw Soldiers (16-bit Pixel Art Garrison Defenders!)
        const unitScale = crowdScale();
        const sortedSoldiers = [...state.soldiers].sort((a, b) => a.y - b.y);
        for (const s of sortedSoldiers) {
          const bob = Math.sin(nowSec * 5 + s.id) * 1.4;
          const spr = pickUnitSprite(s.type, 'south');
          const hasSpr = imgReady(spr);
          const drawH = ((s.r * 2.5) + (s.stars >= 2 ? 6 : 0)) * unitScale;
          const aspect = hasSpr ? (spr.naturalWidth / Math.max(1, spr.naturalHeight)) : 0.85;
          const drawW = drawH * aspect;

          // Ground shadow + Elite Golden Ring
          ctx.beginPath();
          ctx.ellipse(s.x, s.y + drawH * 0.36, drawW * 0.42, drawH * 0.16, 0, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
          ctx.fill();
          if (s.frenzyTimer > 0 || (s.stars && s.stars >= 2)) {
            ctx.strokeStyle = s.frenzyTimer > 0 ? '#facc15' : '#fde047';
            ctx.lineWidth = 2;
            ctx.stroke();
          }

          if (hasSpr) {
            ctx.save();
            if (s.flash > 0) ctx.filter = 'brightness(2.4)';
            ctx.drawImage(spr, Math.round(s.x - drawW / 2), Math.round(s.y - drawH * 0.56 + bob), Math.round(drawW), Math.round(drawH));
            ctx.restore();
          } else {
            drawSilhouette(s.x, s.y + bob, drawW, drawH, s.color, s.shape || s.type, s.flash > 0);
          }

          if (s.stars && s.stars >= 2) {
            ctx.font = 'bold 9px Inter, sans-serif';
            ctx.fillStyle = '#fde047';
            ctx.textAlign = 'center';
            ctx.fillText('★'.repeat(s.stars), s.x, s.y - drawH * 0.62 - 6);
          }

          const bw = 24;
          const hpY = s.y - drawH * 0.62;
          ctx.fillStyle = '#090d16';
          ctx.fillRect(s.x - bw / 2, hpY, bw, 4);
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(s.x - bw / 2, hpY, bw * Math.max(0, s.hp / s.maxHp), 4);
        }

        // Draw Enemies (16-bit Pixel Art Monster Horde!)
        const sortedEnemies = [...state.enemies].sort((a, b) => a.y - b.y);
        for (const e of sortedEnemies) {
          const bob = e.freezeTimer > 0 ? 0 : Math.abs(Math.sin(nowSec * 7 + e.id)) * 2.2;
          const spr = pickUnitSprite(e.kind, 'north') || (e.spriteKey && imgReady(ASSETS[e.spriteKey]) ? ASSETS[e.spriteKey] : null);
          const hasSpr = imgReady(spr);
          const drawH = (e.drawH || (e.isBoss ? 58 : (e.isHeavy ? 40 : 32))) * unitScale;
          const aspect = hasSpr ? (spr.naturalWidth / Math.max(1, spr.naturalHeight)) : 0.9;
          const drawW = drawH * aspect;

          ctx.beginPath();
          ctx.ellipse(e.x, e.y + drawH * 0.36, drawW * 0.42, drawH * 0.16, 0, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
          ctx.fill();

          if (hasSpr) {
            ctx.save();
            if (e.flash > 0) ctx.filter = 'brightness(2.5)';
            else if (e.freezeTimer > 0) ctx.filter = 'hue-rotate(155deg) saturate(1.8) brightness(1.25)';
            else if (e.isBomber) ctx.filter = 'hue-rotate(-45deg) saturate(2.1)';
            ctx.drawImage(spr, Math.round(e.x - drawW / 2), Math.round(e.y - drawH * 0.56 - bob), Math.round(drawW), Math.round(drawH));
            ctx.restore();
          } else {
            const col = e.freezeTimer > 0 ? '#7dd3fc' : (e.color || '#86efac');
            drawSilhouette(e.x, e.y - bob, drawW, drawH, col, e.shape || e.kind || 'goblin', e.flash > 0);
          }

          if (e.isBomber) {
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('💣', e.x, e.y - drawH * 0.62 - 6);
          }

          const bw = e.isBoss ? 48 : 26;
          const hpY = e.y - drawH * 0.62;
          ctx.fillStyle = '#090d16';
          ctx.fillRect(e.x - bw / 2, hpY, bw, 4);
          ctx.fillStyle = e.isBoss ? '#facc15' : '#f43f5e';
          ctx.fillRect(e.x - bw / 2, hpY, bw * Math.max(0, e.hp / e.maxHp), 4);
        }

        // Projectiles
        for (const p of state.projectiles) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
        }
        for (const ep of state.enemyProjectiles) {
          ctx.beginPath();
          ctx.arc(ep.x, ep.y, 4.5, 0, Math.PI * 2);
          ctx.fillStyle = '#c084fc';
          ctx.fill();
        }

        // Falling coins: drop from the pusher lip, bounce, then resolve on settle
        for (const d of state.fallingDrops) {
          const def = COIN_TYPES[d.type] || { r: 14, fill: '#f59e0b' };
          const spr = ASSETS['c_' + d.type];
          const sz = def.r * 2.15;
          const air = Math.max(0, d.landY - d.y);
          const shR = Math.max(4, def.r * (0.7 - Math.min(0.4, air / 160)));
          ctx.globalAlpha = 0.28 * (1 - Math.min(0.7, air / 220));
          ctx.beginPath();
          ctx.ellipse(d.x, d.landY + 2, shR * 1.15, shR * 0.45, 0, 0, Math.PI * 2);
          ctx.fillStyle = '#000';
          ctx.fill();
          ctx.globalAlpha = 1;
          ctx.save();
          ctx.translate(d.x, d.y);
          ctx.rotate(d.rot || 0);
          const squash = (d.y >= d.landY - 3 && d.vy > 0) ? 0.92 : 1;
          if (imgReady(spr)) {
            ctx.drawImage(spr, Math.round(-sz / 2), Math.round(-sz * squash / 2), Math.round(sz), Math.round(sz * squash));
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, def.r * squash, 0, Math.PI * 2);
            ctx.fillStyle = def.fill;
            ctx.fill();
          }
          ctx.restore();
        }

        // Particles & Float Texts
        for (const pt of state.particles) {
          ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2);
          ctx.fillStyle = pt.color;
          ctx.fill();
        }
        ctx.globalAlpha = 1;

        ctx.font = isMobileLayout() ? '800 11px Inter, Noto Sans TC, sans-serif' : '800 13px Inter, Noto Sans TC, sans-serif';
        ctx.textAlign = 'center';
        for (const f of state.floatTexts) {
          ctx.globalAlpha = Math.max(0, f.life / f.maxLife);
          ctx.fillStyle = f.color;
          ctx.fillText(f.text, f.x, f.y);
        }
        ctx.globalAlpha = 1;

        ctx.restore();
      }

      // ==========================================
      // 10. UI SYNC & CONTROLS
      // ==========================================
      function updateUI() {
        hudWave.textContent = state.wave;
        if (hudChapter) hudChapter.textContent = chapterName(state.wave);
        hudHp.textContent = state.baseHp;
        hudAmmo.textContent = state.ammo;
        hudGold.textContent = state.gold;
        if (hudBest) hudBest.textContent = `最高：第 ${state.bestWave} 波`;
        const blocked = state.paused || state.gameOver || state.drafting;
        btnBuySoldier.disabled = blocked || state.gold < 20;
        btnBuySkill.disabled = blocked || state.gold < 50;
        btnBuyAmmo.disabled = blocked || state.gold < 16;
        if (btnRerollShop) btnRerollShop.disabled = blocked || state.gold < 8;
        const coinThumb = (type) => {
          const src = ASSET_URIS['c_' + type] || (imgReady(ASSETS['c_' + type]) ? ASSETS['c_' + type].src : '');
          if (src) return `<img src="${src}" alt="" class="px-icon shop-coin-ic" width="20" height="20">`;
          return COIN_TYPES[type].icon;
        };
        buySoldierLabel.innerHTML = `${coinThumb(state.nextShopSoldier)} 買${SOLDIER_STATS[state.nextShopSoldier].name}幣`;
        buySkillLabel.innerHTML = `${coinThumb(state.nextShopSkill)} 買大招幣`;
        const buyAmmoLabel = document.getElementById('buyAmmoLabel');
        if (buyAmmoLabel) buyAmmoLabel.innerHTML = `${coinThumb('gold')} +8普通幣`;

        refillQueue();
        nextCoinQueue.innerHTML = state.queue.slice(0, 3).map((k, idx) => {
          const def = COIN_TYPES[k];
          const uri = ASSET_URIS['c_' + k] || (imgReady(ASSETS['c_' + k]) ? ASSETS['c_' + k].src : '');
          const inner = uri ? `<img src="${uri}" alt="${def.name}" class="px-icon queue-coin-img" />` : def.icon;
          return `<span class="queue-coin${idx === 0 ? ' is-next' : ''}" title="${def.name}">${inner}</span>`;
        }).join('');

        if (state.comboCount >= 2) {
          comboBadge.textContent = state.comboCount >= 5 ? `🔥 爆兵 x${state.comboCount}!` : `連召 x${state.comboCount}!`;
          comboBadge.style.opacity = '1';
          comboBadge.style.transform = 'scale(1)';
        } else {
          comboBadge.style.opacity = '0';
          comboBadge.style.transform = 'scale(0.9)';
        }

        const pct = Math.floor(state.shakeMeter);
        shakeMeterText.textContent = pct >= 100 ? 'READY!' : `${pct}%`;
        btnShake.disabled = pct < 100 || state.paused || state.gameOver || state.drafting;
        btnDropCenter.disabled = state.ammo <= 0 || state.paused || state.gameOver || state.drafting;

        relicSummary.textContent = state.relics.length
          ? `軍團 ${state.soldiers.length}/${ARMY_CAP} · 敵 ${state.enemies.length} · ${state.relics.join('')}`
          : `我方軍團：${state.soldiers.length}/${ARMY_CAP}　敵軍：${state.enemies.length}`;
      }

      function resizeCanvas() {
        computeLayout();
        if (stageWrap && stageWrap.style && typeof stageWrap.style.setProperty === 'function') {
          stageWrap.style.setProperty('--battle-top', BATTLE_TOP + 'px');
        }
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.max(1, Math.floor(W * dpr));
        canvas.height = Math.max(1, Math.floor(H * dpr));
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        render();
      }

      function resetGame() {
        state.wave = 1;
        state.baseHp = 100;
        const bonus = metaBonuses(loadMeta());
        state.ammo = 20 + bonus.ammo;
        state.gold = 30 + bonus.gold;
        state.metaVanguardStar = !!bonus.vanguardStar;
        state.nextShopSoldier = 'knight';
        state.nextShopSkill = 'meteor';
        state.shakeMeter = 35;
        state.paused = false;
        state.gameOver = false;
        state.drafting = false;
        state.relics = [];
        state.armyMult = 1;
        state.pusherSpeedMult = 1;
        state.sideWalls = false;
        state.twinDrop = 0;
        state.dropCooldown = 0;
        state.rearmTimer = 0;
        state.veteransChance = 0;
        state.gateSpeedMult = 1;
        state.relicIds = [];
        state.campaignWon = false;
        state.gateWidthMult = 1;
        state.lastSoldierType = null;
        state.sameChainCount = 0;
        state.sameChainTimer = 0;
        state.bag = START_BAG.concat(bonus.bag);
        state.queue = [];
        state.fallingDrops = [];
        state.soldiers = [];
        state.enemies = [];
        state.projectiles = [];
        state.enemyProjectiles = [];
        state.meteors = [];
        state.particles = [];
        state.floatTexts = [];
        state.comboCount = 0;

        btnPause.textContent = '⏸';
        gameOverModal.classList.add('hidden');
        gameOverModal.classList.remove('flex');
        upgradeModal.classList.add('hidden');
        upgradeModal.classList.remove('flex');

        refillQueue();
        seedInitialCoins();
        // Opening garrison: 2 ranks across the FULL width, just under the rear wall.
        const yb0 = BATTLE_TOP;
        const yh = BATTLE_BOTTOM - BATTLE_TOP;
        const frontY = yb0 + Math.round(yh * 0.36);
        const midY   = yb0 + Math.round(yh * 0.30);
        const backY  = yb0 + Math.round(yh * 0.22);
        const edgeL = isMobileLayout() ? 0.16 : 0.14;
        const edgeR = isMobileLayout() ? 0.80 : 0.82;
        const lerpX = (t) => Math.round(W * (edgeL + t * (edgeR - edgeL)));
        spawnSoldier('shield',  lerpX(0.00), frontY);
        spawnSoldier('shield',  lerpX(0.35), frontY);
        spawnSoldier('knight',  lerpX(0.53), midY);
        spawnSoldier('spear',   lerpX(0.71), frontY);
        spawnSoldier('hound',   lerpX(1.00), frontY);
        spawnSoldier('archer',  lerpX(0.18), backY);
        spawnSoldier('mage',    lerpX(0.53), backY);
        spawnSoldier('priest',  lerpX(0.84), backY);
        if (state.metaVanguardStar && state.soldiers[0]) {
          const s = state.soldiers[0];
          s.stars = 2;
          s.maxHp = Math.round(s.maxHp * 1.3);
          s.hp = s.maxHp;
          s.atk = Math.round(s.atk * 1.25);
        }
        startWave(1);
        updateUI();
      }

      // Pointer drag/tap on top pusher drops coins smoothly!
      canvas.addEventListener('pointerdown', (ev) => {
        const rect = canvas.getBoundingClientRect();
        const x = ev.clientX - rect.left;
        state.dropXRatio = Math.max(0.08, Math.min(0.92, x / rect.width));
        state.isDragging = true;
        state.dragDropCooldown = 0.32;
        dropPlayerCoin(x);
      });
      canvas.addEventListener('pointermove', (ev) => {
        const rect = canvas.getBoundingClientRect();
        state.dropXRatio = Math.max(0.08, Math.min(0.92, (ev.clientX - rect.left) / rect.width));
      });
      window.addEventListener('pointerup', () => { state.isDragging = false; });
      window.addEventListener('pointercancel', () => { state.isDragging = false; });

      btnDropCenter.addEventListener('click', () => {
        dropPlayerCoin(state.dropXRatio * W);
      });
      btnShake.addEventListener('click', triggerMachineShake);

      const shopSoldiers = ['knight', 'archer', 'shield', 'mage', 'spear', 'priest', 'hound', 'bombard', 'rogue', 'banner', 'frost', 'alchemist'];
      const shopSkills = ['meteor', 'blizzard', 'warcry'];
      function rotateShopStock() {
        state.nextShopSoldier = shopSoldiers[Math.floor(Math.random() * shopSoldiers.length)];
        state.nextShopSkill = shopSkills[Math.floor(Math.random() * shopSkills.length)];
      }
      function rerollShop() {
        if (state.gold < 8 || state.paused || state.gameOver || state.drafting) return;
        state.gold -= 8;
        rotateShopStock();
        SFX.coinDrop();
        showToast('商店貨單已刷新！');
        updateUI();
      }
      btnBuySoldier.addEventListener('click', () => {
        if (state.gold < 20 || state.paused || state.gameOver || state.drafting) return;
        state.gold -= 20;
        dropSpecialCoin(state.nextShopSoldier);
        state.nextShopSoldier = shopSoldiers[Math.floor(Math.random() * shopSoldiers.length)];
        updateUI();
      });
      btnBuySkill.addEventListener('click', () => {
        if (state.gold < 50 || state.paused || state.gameOver || state.drafting) return;
        state.gold -= 50;
        dropSpecialCoin(state.nextShopSkill);
        state.nextShopSkill = shopSkills[Math.floor(Math.random() * shopSkills.length)];
        updateUI();
      });
      btnBuyAmmo.addEventListener('click', () => {
        if (state.gold < 16 || state.paused || state.gameOver || state.drafting) return;
        state.gold -= 16;
        state.ammo += 8;
        SFX.coinDrop();
        showToast('🪙 已補充 +8 枚普通投幣！');
        updateUI();
      });
      if (btnRerollShop) btnRerollShop.addEventListener('click', rerollShop);
      if (btnToggleShop) {
        btnToggleShop.addEventListener('click', (ev) => {
          ev.stopPropagation();
          setShopOpen(!isShopOpen());
        });
      }
      document.addEventListener('pointerdown', (ev) => {
        if (!isShopOpen()) return;
        const t = ev.target;
        if (shopPanel && shopPanel.contains(t)) return;
        if (btnToggleShop && btnToggleShop.contains(t)) return;
        setShopOpen(false);
      });

      btnMute.addEventListener('click', () => {
        SFX.muted = !SFX.muted;
        btnMute.textContent = SFX.muted ? '🔇' : '🔊';
      });
      btnPause.addEventListener('click', () => {
        state.paused = !state.paused;
        btnPause.textContent = state.paused ? '▶' : '⏸';
        updateUI();
      });
      function renderCamp() {
        if (!campList) return;
        const m = loadMeta();
        const best = Math.max(m.bestWave || 1, state.bestWave || 1);
        const items = [
          `<li><strong class="c-gold">最高到達：</strong>第 ${best} 波　通關次數（第 12 波）：${m.wins || 0}</li>`,
          ...META_UNLOCKS.map(u => {
            const on = best >= u.at;
            return `<li>${on ? '✅' : '🔒'} <strong>第 ${u.at} 波：</strong>${u.name}${on ? '（已生效於下一局開場）' : ''}</li>`;
          })
        ];
        campList.innerHTML = items.join('');
      }
      const openCamp = () => {
        renderCamp();
        if (!campModal) return;
        campModal.classList.remove('hidden');
        campModal.classList.add('flex');
      };
      const closeCamp = () => {
        if (!campModal) return;
        campModal.classList.add('hidden');
        campModal.classList.remove('flex');
      };
      if (btnCamp) btnCamp.addEventListener('click', openCamp);
      if (btnCloseCamp) btnCloseCamp.addEventListener('click', closeCamp);
      if (btnCloseCamp2) btnCloseCamp2.addEventListener('click', closeCamp);

      btnHelp.addEventListener('click', () => {
        helpModal.classList.remove('hidden');
        helpModal.classList.add('flex');
      });
      const closeHelp = () => {
        helpModal.classList.add('hidden');
        helpModal.classList.remove('flex');
      };
      btnCloseHelp.addEventListener('click', closeHelp);
      btnCloseHelp2.addEventListener('click', closeHelp);
      btnRestart.addEventListener('click', resetGame);

      window.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
          e.preventDefault();
          if (e.repeat) return;
          dropPlayerCoin(state.dropXRatio * W);
        }
        else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') { state.dropXRatio = Math.max(0.1, state.dropXRatio - 0.08); }
        else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { state.dropXRatio = Math.min(0.9, state.dropXRatio + 0.08); }
        else if (e.key === 's' || e.key === 'S') { triggerMachineShake(); }
        else if (e.key === 'p' || e.key === 'P') { btnPause.click(); }
        else if (e.key === 'Escape') { setShopOpen(false); }
      });

      let rafId = null;
      let lastTs = 0;
      function loop(ts) {
        if (!lastTs) lastTs = ts;
        const dt = Math.min(0.05, (ts - lastTs) / 1000);
        lastTs = ts;
        update(dt);
        render();
        rafId = requestAnimationFrame(loop);
      }

      window.addEventListener('resize', resizeCanvas);
      if (typeof ResizeObserver === 'function' && stageWrap) {
        const stageRo = new ResizeObserver(() => resizeCanvas());
        stageRo.observe(stageWrap);
      }
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => resizeCanvas());
      }
      function boot() {
        resizeCanvas();
        resetGame();
        if (rafId) cancelAnimationFrame(rafId);
        lastTs = 0;
        rafId = requestAnimationFrame(loop);
        // Hidden screenshot/self-check hook. Normal play never sets ?qa=.
        try {
          const qa = new URLSearchParams(location.search).get('qa');
          if (qa === 'draft2') {
            state.wave = 2;
            state.spawnLeft = 0;
            state.enemies = [];
            state.waveActive = true;
            state.drafting = false;
            openUpgradeDraft();
          } else if (qa === 'preview') {
            state.paused = true;
          }
        } catch (_) {}
      }
      if (document.readyState === 'complete') boot();
      else window.addEventListener('load', boot);

      // Hidden QA hook for self-checks (no effect on a normal play session).
      try {
        window.__coinfrontQa = {
          get state() { return state; },
          openUpgradeDraft,
          applyUpgrade,
          startWave,
          update,
          spawnEnemy,
          UPGRADE_POOL,
          pickBossKind,
          waveRosterCount
        };
      } catch (_) {}
    })();
