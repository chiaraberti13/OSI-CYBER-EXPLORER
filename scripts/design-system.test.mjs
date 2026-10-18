import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const css = await readFile(new URL('../src/index.css', import.meta.url), 'utf8');
const theme = css.match(/@theme\s*\{([\s\S]*?)\n\}/)?.[1];
assert.ok(theme, 'src/index.css must declare the Tailwind design tokens');

const tokens = Object.fromEntries(
  [...theme.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(([, name, value]) => [name, value.trim()])
);

function resolveColor(name) {
  const value = tokens[name];
  assert.ok(value, `Missing design token ${name}`);
  const direct = value.match(/^#([\da-f]{6})$/i);
  if (direct) return direct[1];
  const reference = value.match(/^var\((--[\w-]+)\)$/);
  assert.ok(reference, `Expected ${name} to be a literal hex color or a token alias`);
  return resolveColor(reference[1]);
}

function luminance(name) {
  const channels = resolveColor(name)
    .match(/.{2}/g)
    .map((hex) => parseInt(hex, 16) / 255);
  const linear = channels.map((channel) => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4));
  return linear.reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
}

function contrast(foreground, background) {
  const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

test('semantic text and feedback colors meet WCAG AA on app surfaces', () => {
  const surfaces = ['--color-canvas', '--color-surface', '--color-surface-subtle'];
  const foregrounds = [
    '--color-ink-primary',
    '--color-ink-secondary',
    '--color-ink-muted',
    '--color-accent',
    '--color-accent-strong',
    '--color-success',
    '--color-warning',
    '--color-danger',
    '--color-info'
  ];

  for (const foreground of foregrounds) {
    for (const background of surfaces) {
      assert.ok(
        contrast(foreground, background) >= 4.5,
        `${foreground} on ${background} has contrast ${contrast(foreground, background).toFixed(2)}:1 (needs 4.5:1)`
      );
    }
  }
});

test('common low-contrast Tailwind text utilities resolve to AA-safe semantic tokens', () => {
  for (const name of [
    '--color-slate-400',
    '--color-slate-500',
    '--color-indigo-500',
    '--color-emerald-500',
    '--color-emerald-600',
    '--color-amber-500',
    '--color-amber-600',
    '--color-red-500'
  ]) {
    assert.ok(tokens[name]?.startsWith('var(--color-'), `${name} must alias a semantic token`);
    assert.ok(contrast(name, '--color-canvas') >= 4.5, `${name} must meet AA on the canvas`);
  }
});

// UX-28: the manual's new cards ship a dark palette (opt-in via data-theme="dark").
// Verify its text/background pairings meet WCAG AA, matching the light-theme gate.
const darkBlock = css.match(/:root\[data-theme='dark'\]\s*\{([\s\S]*?)\n\}/)?.[1];
const darkTokens = Object.fromEntries(
  [...(darkBlock ?? '').matchAll(/(--[\w-]+):\s*(#[\da-fA-F]{6})\s*;/g)].map(([, name, value]) => [
    name,
    value.slice(1)
  ])
);

function luminanceHex(hex) {
  const channels = hex.match(/.{2}/g).map((part) => parseInt(part, 16) / 255);
  const linear = channels.map((channel) => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4));
  return linear.reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
}

function contrastHex(foreground, background) {
  const values = [luminanceHex(darkTokens[foreground]), luminanceHex(darkTokens[background])].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

test('dark manual theme text meets WCAG AA on its surfaces and colored tiles (UX-28)', () => {
  assert.ok(darkBlock, "src/index.css must declare the dark theme tokens under :root[data-theme='dark']");

  const pairs = [
    ['--color-dark-ink-primary', '--color-dark-surface'],
    ['--color-dark-ink-secondary', '--color-dark-surface'],
    ['--color-dark-ink-soft', '--color-dark-surface'],
    ['--color-dark-ink-muted', '--color-dark-surface'],
    ['--color-dark-accent', '--color-dark-surface'],
    ['--color-dark-ink-primary', '--color-dark-canvas'],
    ['--color-dark-ink-secondary', '--color-dark-canvas'],
    // Objectives / guided-lab tile (indigo).
    ['--color-dark-accent', '--color-dark-tile-objectives-bg'],
    ['--color-dark-ink-secondary', '--color-dark-tile-objectives-bg'],
    // Example tile (success).
    ['--color-dark-tile-example-ink', '--color-dark-tile-example-bg'],
    ['--color-dark-tile-example-body', '--color-dark-tile-example-bg'],
    ['--color-dark-ink-secondary', '--color-dark-tile-example-bg'],
    // Common-mistakes tile (warning).
    ['--color-dark-tile-mistakes-ink', '--color-dark-tile-mistakes-bg'],
    ['--color-dark-tile-mistakes-body', '--color-dark-tile-mistakes-bg'],
    ['--color-dark-ink-secondary', '--color-dark-tile-mistakes-bg']
  ];

  for (const [foreground, background] of pairs) {
    assert.ok(darkTokens[foreground], `Missing dark token ${foreground}`);
    assert.ok(darkTokens[background], `Missing dark token ${background}`);
    const ratio = contrastHex(foreground, background);
    assert.ok(ratio >= 4.5, `${foreground} on ${background} has contrast ${ratio.toFixed(2)}:1 (needs 4.5:1)`);
  }
});

test('global layout and interaction styles consume the shared design tokens', () => {
  assert.match(css, /background-color:\s*var\(--color-canvas\)/);
  assert.match(css, /color:\s*var\(--color-ink-secondary\)/);
  assert.match(css, /outline:\s*2px solid var\(--color-accent\)/);
  for (const name of ['--font-sans', '--font-mono', '--radius-xl', '--shadow-sm']) {
    assert.ok(tokens[name], `Missing typography or elevation token ${name}`);
  }
});
