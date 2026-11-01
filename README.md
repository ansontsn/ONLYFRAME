# ONLYFRAME v3 — 本機改版

保留來源 `../onlyframe-v3-landing-backup`，本資料夾為獨立的 React + TypeScript + Tailwind 改版。本機驗證記錄見 `qa/`；GitHub 推送與線上部署狀態需分別確認。

## 啟動

```powershell
cd 'D:\Users\User\Documents\ChatGPT\畢業專題\onlyframe-v3-redesign'
npm ci
npm run dev
```

已安裝依賴時，直接執行 `npm run dev`。開啟終端機印出的本機網址。

```powershell
npm test
npm run build
npm run preview
```

`dist/` 是可執行的建置產物，請透過 HTTP 預覽。不要直接用檔案網址開啟 `dist/index.html`。

## 改版

- 暖白、深灰、莓紅的共用按鈕、字體、邊框、留白與響應式配置。
- 首頁使用既有卡片及共用 `AcrylicFramePreview` 製作完整框體示意；首屏色票可實際更新框色。設計範例皆標示概念示意。
- 三種方案使用同卡、同角度、同尺寸的預覽及相同卡片份量。權限與降級確認規則沿用原程式。
- 桌機約 60% 預覽／40% 淺色工具面板。五個工具入口不橫向捲動；尺寸及配置摘要可展開；文字細節隨選取狀態出現。
- 手機採正常頁面流動，提供預覽／工具跳轉入口，確認及下載按鈕不固定遮擋內容。
- 確認頁可展開完整文字、貼飾配置與毫米座標，返回修改會保留設計。PNG 匯出使用成品顯示並等待字體就緒。
- 主要導覽為設計靈感／開始設計／關於 ONLYFRAME；後台入口移至頁尾。

## 驗證與限制

詳細結果、截圖與原始機器報告請見 `qa/VALIDATION.md`、`qa/browser-results.json`、`qa/`。

瀏覽器驗證使用本機 Chrome headless，包含手機觸控模擬。`scripts/preview-qa.mjs` 需 Playwright；本機使用 Codex 已附的執行環境，不新增專案依賴。其他環境可透過 `PLAYWRIGHT_MODULE` 指定模組路徑，`CHROME_PATH` 指定 Chrome。

該腳本會攔截所有 Supabase 網路請求。提交及設計編號的完整流程僅在第二個隔離 Vite 執行個體測試，透過執行期的編譯定義使用既有本機展示儲存；不改寫任何 `.env`，也不寫入正式資料庫。

Supabase 設定、schema、權限程式與資料序列化維持來源版本。本機成功不代表正式雲端送件、正式後台授權、實際產品材質或製程已驗證。

首頁小卡圖片沿用來源專案，不代表實體 ONLYFRAME 成品。產品尺寸、材質、厚度、結構與適配性均待實體驗證。本網站為畢業專題研究原型，非實際販售。
