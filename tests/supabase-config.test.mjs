import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import ts from 'typescript';
const { outputText } = ts.transpileModule(readFileSync(new URL('../src/utils/supabaseConfig.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
});
const { resolveSupabaseConfig } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
const url = 'https://onlyframe-test.supabase.co';
const jwt = role => `eyJhbGciOiJIUzI1NiJ9.${Buffer.from(JSON.stringify({ role })).toString('base64url')}.signature`;

test('empty and placeholder settings keep the explicit local demo mode', () => {
  assert.equal(resolveSupabaseConfig().mode, 'demo');
  assert.equal(resolveSupabaseConfig('https://your-project.supabase.co', 'sb_publishable_your-publishable-key').mode, 'demo');
});
test('accepts the new public key and legacy anon JWT', () => {
  assert.equal(resolveSupabaseConfig(url, 'sb_publishable_test_public_key').mode, 'cloud');
  assert.equal(resolveSupabaseConfig(url, '', jwt('anon')).mode, 'cloud');
  assert.equal(resolveSupabaseConfig(url, 'sb_publishable_your-publishable-key', jwt('anon')).mode, 'cloud');
});
test('partial or invalid configuration cannot silently fall back to local storage', () => {
  assert.equal(resolveSupabaseConfig(url).mode, 'invalid');
  assert.equal(resolveSupabaseConfig('', 'sb_publishable_test_key').mode, 'invalid');
  assert.equal(resolveSupabaseConfig('not-a-url', 'sb_publishable_test_key').mode, 'invalid');
  assert.equal(resolveSupabaseConfig('http://remote.example', 'sb_publishable_test_key').mode, 'invalid');
});
test('privileged credentials cannot create a browser client or appear in errors', () => {
  for (const key of ['sb_secret_test_forbidden_key', jwt('service_role'), jwt('authenticated'), 'unknown']) {
    const config = resolveSupabaseConfig(url, key);
    assert.equal(config.mode, 'invalid');
    assert.equal(config.key, '');
    assert.ok(!config.error.includes(key));
  }
});
test('production preflight stops before bundling a secret key and redacts it', () => {
  const secret = 'sb_secret_FORBIDDEN_BUILD_TEST';
  const run = spawnSync(process.execPath, ['scripts/check-cloud-config.mjs'], {
    cwd: new URL('..', import.meta.url), encoding: 'utf8',
    env: { ...process.env, VITE_SUPABASE_URL: url, VITE_SUPABASE_PUBLISHABLE_KEY: secret, VITE_SUPABASE_ANON_KEY: '' },
  });
  assert.equal(run.status, 1);
  assert.ok(!`${run.stdout}${run.stderr}`.includes(secret));
  assert.match(run.stderr, /Publishable key/);
});
