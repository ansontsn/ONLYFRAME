import { loadEnv } from 'vite';
import ts from 'typescript';
import { readFileSync } from 'node:fs';
const { outputText } = ts.transpileModule(readFileSync(new URL('../src/utils/supabaseConfig.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
});
const { resolveSupabaseConfig } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
const env = { ...loadEnv('production', process.cwd(), 'VITE_SUPABASE_'), ...process.env };
const config = resolveSupabaseConfig(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY, env.VITE_SUPABASE_ANON_KEY);
if (config.mode === 'invalid') {
  console.error(config.error); // Never log the supplied key.
  process.exit(1);
}
console.log(config.mode === 'cloud' ? 'Supabase: cloud configuration validated (public key only).' : 'Supabase: local demo mode; no cloud project configured.');
