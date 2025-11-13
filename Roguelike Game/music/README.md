# 背景音樂說明

## 📁 音樂文件放置

請將背景音樂文件放在此文件夾中，文件名為：
- `bgm.mp3` （MP3 格式，推薦）
- `bgm.ogg` （OGG 格式，備用）

## 🎵 推薦音樂來源

### 免費音樂資源（無版權）

1. **Incompetech** (https://incompetech.com/)
   - 大量免費音樂
   - 需要註明來源
   - 推薦類型：Dark, Mysterious, Fantasy

2. **Free Music Archive** (https://freemusicarchive.org/)
   - 完全免費
   - 多種授權方式
   - 搜索關鍵字：dungeon, dark, medieval

3. **Purple Planet Music** (https://www.purple-planet.com/)
   - 免費下載
   - 無需註冊
   - 推薦分類：Adventure, Dark

4. **YouTube Audio Library**
   - 完全免費
   - 搜索「Dark Ambient」、「Medieval」

### 推薦曲風
- 🏰 中世紀/奇幻風格
- 🌑 黑暗氛圍
- ⚔️ 冒險/探索音樂
- 🎭 輕度緊張感

### 音樂規格建議
- **格式**: MP3（320kbps）或 OGG
- **長度**: 2-5 分鐘（會自動循環）
- **音量**: 適中（代碼中已設置為 30%）
- **文件大小**: 建議 < 5MB

## 🔧 如何添加音樂

1. 下載免費音樂文件
2. 將文件重命名為 `bgm.mp3`
3. 放入此 `music` 文件夾
4. 重新載入遊戲頁面

## 🎮 音樂控制

- **開關按鈕**: 右上角 🔊/🔇 按鈕
- **音量**: 預設 30%（可在 game.js 中修改）
- **循環播放**: 自動循環
- **記憶設置**: 關閉音樂後下次開啟會記住

## 📝 版權注意

使用音樂時請確保：
- ✅ 使用無版權音樂
- ✅ 使用 CC0 授權音樂
- ✅ 使用免費授權音樂（需註明來源）
- ❌ 不要使用有版權的商業音樂

## 🎼 推薦音樂範例

### Incompetech 推薦曲目：
1. "Dark Fog" - Kevin MacLeod
2. "Creepy" - Kevin MacLeod
3. "Curse of the Scarab" - Kevin MacLeod
4. "Gregorian Chant" - Kevin MacLeod

### 使用時請在遊戲中註明：
```
Music: "曲名" by Kevin MacLeod (incompetech.com)
Licensed under Creative Commons: By Attribution 4.0 License
http://creativecommons.org/licenses/by/4.0/
```

## 🔊 音量調整

如需調整音量，請編輯 `game.js` 文件：
```javascript
bgMusic.volume = 0.3; // 0.0 到 1.0 之間，0.3 = 30%
```

## 🎵 多首音樂

如果想要添加多首音樂隨機播放，可以：
1. 放入多個文件：bgm1.mp3, bgm2.mp3, bgm3.mp3
2. 修改 game.js 添加隨機選擇邏輯

## ❓ 常見問題

**Q: 音樂無法播放？**
A: 
- 確認文件名正確 (bgm.mp3)
- 確認文件格式正確
- 某些瀏覽器需要用戶互動後才能播放
- 點擊音樂按鈕手動開啟

**Q: 音量太大/太小？**
A: 修改 game.js 中的 `bgMusic.volume` 值

**Q: 想要換音樂？**
A: 直接替換 bgm.mp3 文件即可

**Q: 支援哪些格式？**
A: MP3（推薦）、OGG、WAV（不推薦，文件太大）

## 🎮 享受遊戲！

添加合適的背景音樂可以大大提升遊戲體驗！
祝您在深淵探險者中玩得開心！🗡️⚔️🛡️
