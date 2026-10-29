# ONLYFRAME v2

這是 ONLYFRAME 原始 React/Vite 專案的改版，保留既有客製編輯器、即時預覽、送件與管理功能，並更新消費者首頁與設計流程。

## 本機啟動

```bash
npm install
npm run dev
```

## 建置

```bash
npm run build
```

Vite 產物輸出至 `dist/`。Netlify 建置指令使用 `npm run build`，發布目錄使用 `dist`；`public/_redirects` 已包含 SPA 路徑回退設定。

若要啟用 Supabase，依照 [雲端設定指引](supabase/SETUP.md) 初始化資料表與網站管理者，複製 `.env.example` 為 `.env.local`，填入 `VITE_SUPABASE_URL` 與 `VITE_SUPABASE_PUBLISHABLE_KEY`。舊版 `VITE_SUPABASE_ANON_KEY` 仍可使用。不要將 `.env.local` 或服務端密鑰提交到 Git；已發布網站也需要在代管平台設定同名環境變數並重新部署。

## 改版內容

- 更新首頁主視覺、價值主張與一致的「開始設計」行動按鈕。
- 增加一般展示與 ONLYFRAME 概念的示意比較、三步設計流程、方案功能比較、風格案例、規格與材質說明。
- 方案選擇、設計編輯、預覽確認頁增加流程進度提示，可返回修改。
- 保留原有客製化編輯器、方案功能權限、圖片預覽匯出、設計送件、Supabase 與管理頁功能。
- 網站功能、尺寸與製造方式為研究 Prototype 測試內容。

首頁風格照片沿用原專案內的示例圖片，不代表實際 ONLYFRAME 成品。
