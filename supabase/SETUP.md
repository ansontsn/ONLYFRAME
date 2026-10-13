# ONLYFRAME 免費雲端設定

本資料夾提供初始化 SQL、網站後台管理者設定，以及串接步驟。請依序完成正式專案與代管設定；程式建置成功不代表已發布網站已連上雲端。

## 1. 建立專案

在 [Supabase Dashboard](https://supabase.com/dashboard) 建立組織，方案選 **Free**，再按 **New project**。

- 專案名稱：`ONLYFRAME`
- Region：選亞洲且靠近台灣的區域。
- Database password：自行產生並保存，不用傳給任何人。
- 保持 Data API 啟用。

等待專案建立完成。帳號、專案與網站管理者是不同設定：登入 Supabase Dashboard 不會自動取得 ONLYFRAME 網站後台權限。

## 2. 初始化資料庫與圖片儲存

進入專案的 **SQL Editor**，新增查詢，貼上 [schema.sql](./schema.sql) 全部內容，再按 **Run**。

此腳本建立：

- `design_submissions`：受試者方案、設計 JSON、圖片連結及提交資訊。
- `research_admins`：網站後台的管理者名單。
- `card-images` 與 `design-previews`：兩個圖片儲存桶，每張最多 5 MB，支援 PNG／JPEG／WEBP。
- RLS：受試者可新增設計；只有指定的管理者能讀取所有紀錄及更新處理狀態。一般登入帳號不具後台權限。

重跑腳本會更新這些權限，不刪除已保存的設計與管理者名單。

本版圖片沿用原型的公開網址模式，持有圖片連結即可檢視；姓名、Email 與整筆設計紀錄受資料表 RLS 保護。匿名使用者不能列出圖片物件清單。

## 3. 建立網站後台管理者

1. 到 **Authentication → Users**，使用 **Add user / Create user** 建立網站後台帳號，填入你選定的 Email 與密碼，讓該帳號的 Email 確認完成。
2. 在 SQL Editor 貼上 [setup-admin.sql](./setup-admin.sql)，將 `admin_email` 變數中的 `YOUR_ADMIN_EMAIL` 改為上一步的 Email，再 Run。
3. 若找不到帳號，SQL 會明確報錯；不要把「0 rows」當成已設定管理者。
4. 使用這組網站帳號在 ONLYFRAME `/admin` 登入。不要使用資料庫密碼登入網站。

受試者提交設計不需要建立登入帳號。研究期間可以關閉 Auth 的一般使用者註冊，管理者仍由 Dashboard 建立。

## 4. 網站連線設定

從專案的 **Connect** 面板取得 **Project URL** 與 **Publishable key**。

在網站專案建立 `.env.local`：

```env
VITE_SUPABASE_URL=https://你的專案.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_你的公開金鑰
```

這兩項是前端公開設定。不要使用 `sb_secret_`、`service_role`、資料庫密碼或 Supabase 管理 API token；它們不能放在 `VITE_` 變數。程式支援舊版 `VITE_SUPABASE_ANON_KEY`，新專案用 Publishable key 即可。

雲端代管網站還必須在代管平台的 **Environment variables** 填入上述同名變數，再重新部署。Vite 在建置時讀取它們；只設定電腦上的 `.env.local` 不會改變已發布的網站。

使用 Vercel 時：

1. 在 Dashboard 選擇 ONLYFRAME 的網站專案，進入 **Settings → Environment Variables**。
2. 新增 `VITE_SUPABASE_URL` 與 `VITE_SUPABASE_PUBLISHABLE_KEY`，各填入正式專案的公開值，選擇 **Production** 與 **Preview**，按 **Save**。
3. 到 **Deployments**，選擇最新 `main` 的部署，從 **⋯ → Redeploy** 重新建置並等待 **Ready**。已存在的部署不會自動套用剛修改的環境變數。
4. 重新開啟正式網站 `/admin`，應看到帳號登入且不再有「展示模式直接進入」。使用先前建立的網站帳號登入，確認能看到標示「非研究樣本」的連線測試資料。
5. 正式蒐集前清除或排除所有測試紀錄；測試資料不可視為受試者樣本。

`pnpm run build` 會先檢查連線設定。設定不完整或使用高權限金鑰時會停止建置，避免將它包進網站。完全未設定時仍保留既有本機展示模式。

## 5. 正式連線驗證

依序檢查：

1. 在網站選 BASIC／CUSTOM／PREMIUM、上傳小卡、完成設計並送出。
2. 在 Supabase **Table Editor → design_submissions** 確認新紀錄出現，`plan` 與 `design_data.plan` 為最後選擇的方案。
3. 在 **Storage** 確認小卡與 PNG 預覽已上傳，DB 的圖片連結指向此專案。
4. 換另一個瀏覽器登入網站 `/admin`，應能讀取同一份雲端設計並更新狀態。
5. 未登入者與未列入 `research_admins` 的登入者不能讀取受試者清單。

雲端提交不會要求匿名 SELECT；上傳或寫入失敗會明確顯示錯誤，不以本機資料冒充雲端成功。新紀錄使用 UUID，舊版必填欄位 `base_price`／`final_price` 維持 0。

## 官方文件

- [React 專案建立與公開環境設定](https://supabase.com/docs/guides/getting-started/quickstarts/reactjs)
- [公開與高權限 API keys](https://supabase.com/docs/guides/getting-started/api-keys)
- [INSERT 與可選的 SELECT 回傳](https://supabase.com/docs/reference/javascript/insert)
- [RLS 存取權限](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [圖片桶與公開／私有存取](https://supabase.com/docs/guides/storage/buckets/fundamentals)
- [Vercel 環境變數與重新部署](https://vercel.com/docs/environment-variables/managing-environment-variables)
