-- ONLYFRAME: run this complete file in the new project's SQL Editor.
-- Rerunning preserves existing submissions and admin membership.
BEGIN;
CREATE SEQUENCE IF NOT EXISTS public.submission_code_seq;
CREATE TABLE IF NOT EXISTS public.design_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_code TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    plan TEXT NOT NULL CHECK (plan IN ('BASIC', 'CUSTOM', 'PREMIUM')),
    plan_name TEXT NOT NULL,
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
CREATE INDEX IF NOT EXISTS design_submissions_created_at_idx ON public.design_submissions (created_at DESC);
CREATE INDEX IF NOT EXISTS design_submissions_plan_idx ON public.design_submissions (plan);

CREATE OR REPLACE FUNCTION public.generate_submission_code()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
    IF NEW.submission_code IS NULL OR NEW.submission_code = '' THEN
        NEW.submission_code := 'DES-' || to_char(timezone('UTC', now()), 'YYYYMMDD') || '-'
            || lpad(nextval('public.submission_code_seq')::text, 6, '0');
    END IF;
    RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trigger_generate_submission_code ON public.design_submissions;
CREATE TRIGGER trigger_generate_submission_code BEFORE INSERT ON public.design_submissions
FOR EACH ROW EXECUTE FUNCTION public.generate_submission_code();

-- Signing in alone does not grant access to participant data.
CREATE TABLE IF NOT EXISTS public.research_admins (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.research_admins ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.research_admins FROM anon, authenticated;
GRANT SELECT ON public.research_admins TO authenticated;
DROP POLICY IF EXISTS "Admins can read own membership" ON public.research_admins;
CREATE POLICY "Admins can read own membership" ON public.research_admins
FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));

CREATE OR REPLACE FUNCTION public.is_research_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
    SELECT EXISTS (SELECT 1 FROM public.research_admins WHERE user_id = (SELECT auth.uid()));
$$;
REVOKE ALL ON FUNCTION public.is_research_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_research_admin() TO authenticated;

ALTER TABLE public.design_submissions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.design_submissions FROM anon, authenticated;
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT INSERT ON public.design_submissions TO anon, authenticated;
GRANT SELECT, UPDATE (status) ON public.design_submissions TO authenticated;
GRANT USAGE ON SEQUENCE public.submission_code_seq TO anon, authenticated;

DROP POLICY IF EXISTS "Public can submit designs" ON public.design_submissions;
CREATE POLICY "Public can submit designs" ON public.design_submissions FOR INSERT TO anon, authenticated
WITH CHECK (
    status = 'pending' AND base_price = 0 AND final_price = 0
    AND plan IN ('BASIC', 'CUSTOM', 'PREMIUM') AND plan = design_data->>'plan'
    AND length(btrim(customer_name)) BETWEEN 1 AND 100
    AND length(btrim(customer_email)) BETWEEN 3 AND 254
    AND jsonb_typeof(design_data) = 'object'
    AND (design_data->'card'->>'widthMm')::numeric BETWEEN 50 AND 63
    AND (design_data->'card'->>'heightMm')::numeric BETWEEN 70 AND 90
    AND (plan <> 'BASIC' OR coalesce(design_data->'text'->>'content', '') = '')
    AND (plan = 'PREMIUM' OR (
        design_data->>'backgroundId' = 'bg-transparent'
        AND coalesce(design_data->'customBgUrl', 'null'::jsonb) = 'null'::jsonb
        AND coalesce(design_data->'stickers', '[]'::jsonb) = '[]'::jsonb
    ))
);
DROP POLICY IF EXISTS "Admins can view all submissions" ON public.design_submissions;
CREATE POLICY "Admins can view all submissions" ON public.design_submissions
FOR SELECT TO authenticated USING ((SELECT public.is_research_admin()));
DROP POLICY IF EXISTS "Admins can update submission status" ON public.design_submissions;
CREATE POLICY "Admins can update submission status" ON public.design_submissions
FOR UPDATE TO authenticated USING ((SELECT public.is_research_admin()))
WITH CHECK ((SELECT public.is_research_admin()));

-- Preserve the prototype's public image-link behavior. Database rows are private.
-- Only PNG/JPEG/WEBP images, at most 5 MB per file, are accepted by these buckets.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
    ('card-images', 'card-images', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp']),
    ('design-previews', 'design-previews', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Allow public upload to card-images" ON storage.objects;
CREATE POLICY "Allow public upload to card-images" ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'card-images');
DROP POLICY IF EXISTS "Allow public upload to design-previews" ON storage.objects;
CREATE POLICY "Allow public upload to design-previews" ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'design-previews');

-- Public URLs serve the images; anonymous object listing is not granted.
DROP POLICY IF EXISTS "Allow public read from card-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read from design-previews" ON storage.objects;
DROP POLICY IF EXISTS "Research admins can read image objects" ON storage.objects;
CREATE POLICY "Research admins can read image objects" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id IN ('card-images', 'design-previews') AND (SELECT public.is_research_admin()));
COMMIT;
