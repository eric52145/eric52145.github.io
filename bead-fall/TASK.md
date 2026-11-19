# 珠落出陣 Beadfall — 任務清單

## 目標
在 `bead-fall/` 下交付可玩的手機網頁遊戲 demo，不改動 repo 其他路徑。

## 小任務
- [x] index.html：結構、viewport、安全區、標題與 UI 骨架
- [x] styles.css：深色街機／寶石盤風格、手機優先、轉盤與戰場
- [x] game.js：轉珠、生成／合成、出陣戰鬥、三選一、敗北重開
- [x] README.md：繁中說明如何開啟與規則摘要
- [x] `node --check game.js` 通過 + 邏輯 smoke test
- [ ] PR 僅含 `bead-fall/**`，合併後驗證 live URL HTTP 200

## 完成條件
完整一局：轉珠 → 出怪／合成 → 自動戰鬥 → 三選一升級輪盤 → 爬樓 → 敗北再來。
