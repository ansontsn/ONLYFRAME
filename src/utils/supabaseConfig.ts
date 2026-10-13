export const resolveSupabaseConfig = (urlValue = '', publishableValue = '', legacyAnonValue = '') => {
  const url = urlValue.trim();
  const isPlaceholder = (value: string) => !value || /your-project|your-anon-key|your-publishable-key/.test(value);
  const key = !isPlaceholder(publishableValue.trim()) ? publishableValue.trim() : legacyAnonValue.trim();
  if (isPlaceholder(url) && isPlaceholder(key)) return { mode: 'demo' as const, url: '', key: '', error: '' };
  const invalid = (error: string) => ({ mode: 'invalid' as const, url: '', key: '', error });
  if (isPlaceholder(url) || isPlaceholder(key)) return invalid('雲端設定不完整，請同時設定 Project URL 與 Publishable key。');
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && !(parsed.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(parsed.hostname))) {
      return invalid('Supabase Project URL 必須使用 HTTPS。');
    }
  } catch { return invalid('Supabase Project URL 格式不正確。'); }
  let isPublicKey = /^sb_publishable_[A-Za-z0-9_-]+$/.test(key);
  if (!isPublicKey) {
    try {
      const payload = key.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      isPublicKey = JSON.parse(atob(payload)).role === 'anon';
    } catch { /* Unknown and privileged keys must never create a browser client. */ }
  }
  if (!isPublicKey) return invalid('網站只能使用 Publishable key 或舊版 anon key，不能使用 Secret／service_role key。');
  return { mode: 'cloud' as const, url, key, error: '' };
};
