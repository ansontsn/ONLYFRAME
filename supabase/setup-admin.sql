-- Run after schema.sql and creating the website admin in Authentication > Users.
-- The website login is separate from your Supabase Dashboard account.
DO $$
DECLARE
    admin_email TEXT := 'YOUR_ADMIN_EMAIL';
    admin_id UUID;
BEGIN
    IF position('@' IN admin_email) = 0 THEN
        RAISE EXCEPTION '請先將 YOUR_ADMIN_EMAIL 替換為網站後台管理者 Email。';
    END IF;
    SELECT id INTO admin_id FROM auth.users WHERE lower(email) = lower(btrim(admin_email));
    IF admin_id IS NULL THEN
        RAISE EXCEPTION '找不到此 Email 的使用者。請先到 Authentication > Users 建立網站後台帳號。';
    END IF;
    INSERT INTO public.research_admins(user_id) VALUES (admin_id) ON CONFLICT (user_id) DO NOTHING;
END;
$$;
