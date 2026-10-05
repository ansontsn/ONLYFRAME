import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = readFileSync(new URL('../src/data/tiers.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
});
const { TIER_OPTIONS, normalizeDesignForTier, getTierSwitchWarning } =
  await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

const design = {
  tier: 'PREMIUM', cardWidthMm: 55, cardHeightMm: 85, cardSizePreset: '55 × 85 mm',
  frameStyleId: 'acrylic-classic', frameColorId: 'pink',
  backgroundId: 'bg-galaxy', customBgUrl: 'data:image/png;base64,background',
  photocardUrl: 'data:image/png;base64,card', photocardName: 'my-card.png', isCustomPhoto: true,
  stickers: [{ id: 'one', xMm: 12, yMm: 40, widthMm: 9, heightMm: 9, rotation: 45 },
    { id: 'two', xMm: 72, yMm: 70, widthMm: 6, heightMm: 6, rotation: -30 }],
  text: { content: 'MY COLLECTION', font: 'Cinzel', fontSizeMm: 5, xMm: 42.5, yMm: 98, rotation: 10 },
};

test('research tiers increase from appearance to text to background and decoration', () => {
  assert.deepEqual(Object.values(TIER_OPTIONS).map(p => [p.text, p.background, p.stickers]),
    [[false, false, false], [true, false, false], [true, true, true]]);
});

for (const tier of ['BASIC', 'CUSTOM', 'PREMIUM']) {
  test(`${tier} accepts an uploaded card and retains frame appearance and physical size`, () => {
    const clean = normalizeDesignForTier({ ...design, tier });
    for (const key of ['photocardUrl', 'photocardName', 'isCustomPhoto', 'frameStyleId', 'frameColorId', 'cardWidthMm', 'cardHeightMm', 'cardSizePreset']) {
      assert.deepEqual(clean[key], design[key]);
    }
    if (tier !== 'PREMIUM') {
      assert.equal(clean.backgroundId, 'bg-transparent');
      assert.equal(clean.customBgUrl, null);
      assert.deepEqual(clean.stickers, []);
    } else {
      assert.equal(clean.backgroundId, design.backgroundId);
      assert.equal(clean.customBgUrl, design.customBgUrl);
      assert.deepEqual(clean.stickers, design.stickers);
    }
    assert.equal(clean.text.content, tier === 'BASIC' ? '' : design.text.content);
    if (tier !== 'BASIC') assert.deepEqual(clean.text, design.text);
    assert.equal(design.stickers.length, 2, 'normalization must not mutate the original');
  });
}

test('only downgrades require a warning, including PREMIUM directly to BASIC', () => {
  for (const [from, to] of [['BASIC','CUSTOM'], ['CUSTOM','PREMIUM'], ['BASIC','PREMIUM'], ['CUSTOM','CUSTOM']]) {
    assert.equal(getTierSwitchWarning(from, to), null);
  }
  assert.match(getTierSwitchWarning('PREMIUM', 'CUSTOM'), /主題背景與所有裝飾元素/);
  assert.match(getTierSwitchWarning('CUSTOM', 'BASIC'), /文字、主題背景與所有裝飾元素/);
  assert.match(getTierSwitchWarning('PREMIUM', 'BASIC'), /文字、主題背景與所有裝飾元素/);
});

test('downgraded elements cannot reappear on subsequent upgrades', () => {
  const custom = normalizeDesignForTier({ ...design, tier: 'CUSTOM' });
  const upgraded = normalizeDesignForTier({ ...custom, tier: 'PREMIUM' });
  assert.equal(upgraded.backgroundId, 'bg-transparent');
  assert.deepEqual(upgraded.stickers, []);
  assert.equal(upgraded.text.content, design.text.content);
  const basic = normalizeDesignForTier({ ...upgraded, tier: 'BASIC' });
  const all = normalizeDesignForTier({ ...basic, tier: 'PREMIUM' });
  assert.equal(all.text.content, '');
  assert.deepEqual(all.stickers, []);
});

test('updates from stale background and sticker controls are stripped at restricted tiers', () => {
  for (const tier of ['BASIC', 'CUSTOM']) {
    const restricted = normalizeDesignForTier({ ...design, tier });
    const staleUpdate = normalizeDesignForTier({ ...restricted, stickers: design.stickers, backgroundId: design.backgroundId, customBgUrl: design.customBgUrl });
    assert.deepEqual(staleUpdate.stickers, []);
    assert.equal(staleUpdate.backgroundId, 'bg-transparent');
    assert.equal(staleUpdate.customBgUrl, null);
  }
});
