import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const { outputText } = ts.transpileModule(readFileSync(new URL('../src/utils/textBox.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
});
const { resizeTextBox, MIN_TEXT_BOX_MM } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
const start = { xMm: 42.5, yMm: 50, widthMm: 30, heightMm: 12, rotation: 0, fontSizeMm: 7 };
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-8, `${a} differs from ${b}`);
const point = (box, sx, sy) => {
  const r = box.rotation * Math.PI / 180;
  return { x: box.xMm + sx * box.widthMm / 2 * Math.cos(r) - sy * box.heightMm / 2 * Math.sin(r),
    y: box.yMm + sx * box.widthMm / 2 * Math.sin(r) + sy * box.heightMm / 2 * Math.cos(r) };
};

for (const rotation of [0, 45, 90, -120]) {
  test(`all six resize handles keep the opposite edge/corner fixed at ${rotation} degrees`, () => {
    for (const handle of ['w','e','nw','ne','sw','se']) {
      const original = { ...start, rotation };
      const sx = handle.includes('w') ? -1 : 1;
      const sy = handle.includes('n') ? -1 : handle.includes('s') ? 1 : 0;
      const fixed = point(original, -sx, -sy);
      const radians = rotation * Math.PI / 180;
      const dx = sx * 10 * Math.cos(radians) - sy * 6 * Math.sin(radians);
      const dy = sx * 10 * Math.sin(radians) + sy * 6 * Math.cos(radians);
      const resized = resizeTextBox(original, handle, dx, dy, 85, 115);
      near(resized.widthMm, 40);
      near(resized.heightMm, sy === 0 ? 12 : 18);
      const after = point({ ...original, ...resized }, -sx, -sy);
      near(after.x, fixed.x);
      near(after.y, fixed.y);
      assert.equal(original.fontSizeMm, 7);
      assert.equal(resized.fontSizeMm, undefined, 'resizing must never change font size');
    }
  });
}

test('dragging a handle across the fixed edge keeps dimensions positive without flipping', () => {
  const resized = resizeTextBox(start, 'nw', 100, 100, 85, 115);
  assert.equal(resized.widthMm, MIN_TEXT_BOX_MM);
  assert.equal(resized.heightMm, MIN_TEXT_BOX_MM);
  near(resized.xMm + resized.widthMm / 2, start.xMm + start.widthMm / 2);
  near(resized.yMm + resized.heightMm / 2, start.yMm + start.heightMm / 2);
});

test('dimensions stay within the physical frame limits', () => {
  const resized = resizeTextBox(start, 'se', 500, 500, 85, 115);
  assert.equal(resized.widthMm, 85);
  assert.equal(resized.heightMm, 115);
});
