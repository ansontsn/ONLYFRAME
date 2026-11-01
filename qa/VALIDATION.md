# ONLYFRAME 本機改版驗證

日期：2026-11-01（台北）

新版：`D:\Users\User\Documents\ChatGPT\畢業專題\onlyframe-v3-redesign`

來源備份：`D:\Users\User\Documents\ChatGPT\畢業專題\onlyframe-v3-landing-backup`。原資料夾未修改。來源內容 96 個檔案在工作結束時與 SHA-256 清單相符（不含 .git 與工具目錄）。

## 實作重點

- 首頁、方案頁、編輯器及確認頁統一暖白 #F7F5F2、深灰 #141414、莓紅 #C8386C，搭配共用字型、按鈕、邊框與圓角。
- 首屏一個主框與兩個較小範例，沿用來源小卡與共用 React 預覽渲染。光澤、透明邊緣、厚度與自然投影為 CSS 概念效果，明確標示非實體照片。色票實際更新主框底色。
- 完整框體作品前移；三方案同卡、同尺寸、同角度、同渲染條件比較；維持原先 CUSTOM 預設與方案切換規則。
- 桌機約 60% 大型預覽與 40% 淺色工具面板，五個工具不橫向捲動。尺寸與配置摘要收為可展開內容。文字及貼飾細節依選取狀態顯示。
- 手機工具與預覽之間有定位入口，確認／下載按鈕在正常頁面流中，不固定遮擋內容。
- 確認頁可查看完整文字與貼飾的毫米位置、大小及角度。下載等待字體就緒，並排除編輯控制點。
- 後台入口移至頁尾。保留正式登入及管理者授權程式。本機展示成功頁明確指出資料僅存本機。
- `src/lib/supabase.ts`、`src/data/tiers.ts`、型別、毫米／文字框工具、環境設定與資料庫 schema 已逐檔與來源比對相同。未變更提交格式或雲端設定。

## 參考頁可確認的內容與限制

1. [犀牛盾 Design Your Own](https://rhinoshield.tw/design-your-own)：頁面內容可讀取貼圖、文字、照片三種創作入口，以及拖曳、縮放、調色與即時預覽的介紹。
2. [CASETiFY Custom Phone Case](https://www.casetify.com/product/phone-case-customization)：頁面內容可讀取 Custom Studio 的 Text、Sticker、Photo 分類與 Customize Inspiration 的商品入口。

以上是實際取得的頁面文字及入口資訊，沒有操作這兩個網站的互動編輯器，也未確認它們所有動態畫面或手機版細節。新版的成品展示構圖是依本次需求設計，不複製其圖片、品牌識別或版面。

## 測試結果

| 項目 | 結果 | 證據 |
|---|---|---|
| 乾淨安裝 | 通過，146 個既有鎖定套件 | npm ci --ignore-scripts --no-audit --no-fund |
| 既有測試 | 19 / 19 通過 | [unit-tests.txt](unit-tests.txt) |
| 正式建置 | TypeScript 與 Vite 通過 | [build.txt](build.txt) |
| pnpm frozen lockfile | 通過 | lockfile-only / frozen-lockfile / ignore-scripts / offline |
| Chrome 瀏覽器 | 53 項檢查通過；應用程式錯誤 0 | [browser-results.json](browser-results.json) |
| 備份與核心程式保留 | 通過 | [preservation-results.json](preservation-results.json)、[source-backup-sha256.json](source-backup-sha256.json) |

建置仍有單一 JavaScript chunk 大於 500 kB 的提示（約 537 kB，gzip 約 155 kB），未阻止建置。原始備份的 pnpm 鎖檔缺少已宣告的 Phosphor 依賴；新版沿用相同 package.json / package-lock.json，補齊 pnpm 鎖檔後完成 frozen 檢查，沒有新增依賴。

## 實際操作範圍

- 桌機 1440 × 1000、手機 390 × 844，另檢查 360、768、1024 px。首頁、方案、編輯器、確認頁皆無水平溢出；1024 px 的次要展示框位置已修正。
- 首頁框色即時更新；完整框體靈感入口；三方案預覽尺寸相同。
- 小卡示例切換、上傳圖片與即時預覽；三種方案均保留圖片。
- 超出支援尺寸時阻擋確認，恢復合法尺寸後可繼續。
- 文字輸入、桌機滑鼠與手機模擬觸控拖曳、文字框控制點縮放、毫米寬高、自動換行。
- 貼飾加入、桌機滑鼠與手機模擬觸控拖曳、縮放、旋轉、複製及刪除；背景即時更新。
- 降級提醒取消時保留設計，確認後移除限制元素；上傳圖片與框體外觀保留。
- 確認頁展開配置、返回修改保留設計；兩處 PNG 下載皆實際取得檔案並檢查 PNG 標頭與像素尺寸。
- 正式設定下的後台保持登入入口，未登入不提供展示模式略過。

## 提交、設計編號與後台

正式 Supabase 全程被瀏覽器攔截，實測沒有正式寫入請求，也未使用正式帳號登入。

提交的完整路徑只在第二個隔離 Vite 執行個體驗證：用編譯期測試定義將三個雲端設定值設為空字串，沿用既有本機展示模式，不寫入 .env 或更動 backend。使用測試名稱與 example.invalid 信箱，成功產生 DES 格式設計編號、保存毫米資料與 PNG，再由本機展示後台讀取同筆資料並開啟明細。這些結果僅證明本機展示流程，不代表正式雲端送件或正式管理權限已驗證。

## 實際截圖

[可直接開啟的截圖總覽](index.html)

| 畫面 | 桌機實際截圖 | 手機模擬實際截圖 |
|---|---|---|
| 首頁 | [1440 × 2544](desktop-home.png) | [390 × 3718](mobile-home.png) |
| 方案比較 | [1440 × 1519](desktop-tiers.png) | [390 × 3222](mobile-tiers.png) |
| 編輯器 | [1440 × 1406](desktop-editor.png) | [390 × 2090](mobile-editor.png) |
| 文字編輯 | [1440 × 1485](desktop-text.png) | [390 × 3072](mobile-text.png) |
| 確認頁 | [1440 × 1685](desktop-confirmation.png) | [390 × 2494](mobile-confirmation.png) |
| 正式設定的登入入口 | [1440 × 1000](desktop-admin-login.png) | [390 × 844](mobile-admin-login.png) |

首屏截圖：[桌機](desktop-home-viewport.png)、[手機](mobile-home-viewport.png)。

匯出成果：[桌機 PNG](desktop-export.png)（975 × 1320）、[手機 PNG](mobile-export.png)（725 × 980）。

隔離本機驗證：[送件表單](local-demo-submit-form.png)、[本機儲存成功](local-demo-success.png)、[本機後台明細](local-demo-admin-detail.png)。

## 尚未驗證

- 正式 Supabase 圖片上傳、寫入、雲端讀回及正式管理者登入／授權，依本次限制未執行。
- 手機檢查採 Chrome 觸控與 viewport 模擬，未使用實體手機或 Safari。
- 產品材質、厚度、結構、製程、實際卡片適配及列印色彩未經實體打樣驗證。

未發布、未推送 GitHub、未部署。所有本次啟動的預覽／測試伺服器均在測試後關閉；可由專案的 start-local.cmd 或 npm run dev 重新啟動。
