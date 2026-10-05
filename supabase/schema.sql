-- ==============================================================================
-- ONLYFRAME 畢業專題 - Supabase Database & Storage 完整架構設定
-- ==============================================================================

-- 1. 建立序號產生器（用於生成人類易讀之訂單編號，例如：DES-20260922-0001）
CREATE SEQUENCE IF NOT EXISTS submission_code_seq;

-- 2. 建立主要資料表：design_submissions
CREATE TABLE IF NOT EXISTS public.design_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_code TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    plan TEXT NOT NULL,
    plan_name TEXT NOT NULL,
    -- Legacy columns retained for existing databases; new research records use 0.
    base_price INTEGER NOT NULL DEFAULT 0,
    final_price INTEGER NOT NULL DEFAULT 0,
    card_image_url TEXT DEFAULT '',
    frame_style TEXT DEFAULT '',
    frame_color TEXT DEFAULT '',
    background TEXT DEFAULT '',
    decorations TEXT DEFAULT '',
    custom_text TEXT DEFAULT '',
    font TEXT DEFAULT '',
    design_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    preview_image_url TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled'))
);

-- 3. 自動生成格式化設計編號觸發函式 (DES-YYYYMMDD-XXXX)
CREATE OR REPLACE FUNCTION public.generate_submission_code()
RETURNS TRIGGER AS $$
DECLARE
    date_part TEXT;
    seq_num TEXT;
BEGIN
    IF NEW.submission_code IS NULL OR NEW.submission_code = '' THEN
        date_part := to_char(timezone('utc', now()), 'YYYYMMDD');
        seq_num := lpad(nextval('submission_code_seq')::text, 4, '0');
        NEW.submission_code := 'DES-' || date_part || '-' || seq_num;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_submission_code ON public.design_submissions;
CREATE TRIGGER trigger_generate_submission_code
BEFORE INSERT ON public.design_submissions
FOR EACH ROW
EXECUTE FUNCTION public.generate_submission_code();

-- 4. 啟用 Row Level Security (RLS)
ALTER TABLE public.design_submissions ENABLE ROW LEVEL SECURITY;

-- 一般消費者（anon）只能新增送出設計，無法直接讀取他人資料
DROP POLICY IF EXISTS "Public can submit designs" ON public.design_submissions;
CREATE POLICY "Public can submit designs"
    ON public.design_submissions
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- 管理者（已登入 authenticated 用戶）可以讀取所有設計
DROP POLICY IF EXISTS "Admins can view all submissions" ON public.design_submissions;
CREATE POLICY "Admins can view all submissions"
    ON public.design_submissions
    FOR SELECT
    TO authenticated
    USING (true);

-- 管理者可以更新訂單狀態 (待處理、製作中、已完成、已取消)
DROP POLICY IF EXISTS "Admins can update submission status" ON public.design_submissions;
CREATE POLICY "Admins can update submission status"
    ON public.design_submissions
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 5. 建立 Storage Buckets (card-images 與 design-previews)
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('card-images', 'card-images', true),
    ('design-previews', 'design-previews', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 6. Storage Row Level Security 政策
-- 允許一般使用者上傳小卡與打樣預覽圖片
DROP POLICY IF EXISTS "Allow public upload to card-images" ON storage.objects;
CREATE POLICY "Allow public upload to card-images"
    ON storage.objects FOR INSERT
    TO anon, authenticated
    WITH CHECK (bucket_id = 'card-images');

DROP POLICY IF EXISTS "Allow public upload to design-previews" ON storage.objects;
CREATE POLICY "Allow public upload to design-previews"
    ON storage.objects FOR INSERT
    TO anon, authenticated
    WITH CHECK (bucket_id = 'design-previews');

-- 允許公開讀取圖片檔案
DROP POLICY IF EXISTS "Allow public read from card-images" ON storage.objects;
CREATE POLICY "Allow public read from card-images"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'card-images');

DROP POLICY IF EXISTS "Allow public read from design-previews" ON storage.objects;
CREATE POLICY "Allow public read from design-previews"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'design-previews');
