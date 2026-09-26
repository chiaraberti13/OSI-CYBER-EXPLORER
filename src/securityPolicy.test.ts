import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';

const eslint = new ESLint({ cwd: process.cwd() });

async function ruleIdsFor(code: string, filePath = 'src/security-policy-fixture.tsx'): Promise<string[]> {
  const [result] = await eslint.lintText(code, { filePath });
  return result.messages.map(message => message.ruleId ?? 'parse-error');
}

describe('frontend security policy', () => {
  it.each([
    ['dangerouslySetInnerHTML', "export const View = () => <div dangerouslySetInnerHTML={{ __html: '<b>x</b>' }} />;", 'no-restricted-syntax'],
    ['spread dangerouslySetInnerHTML', "const unsafe = { dangerouslySetInnerHTML: { __html: '<b>x</b>' } }; export const View = () => <div {...unsafe} />;", 'no-restricted-syntax'],
    ['iframe srcDoc', "export const Frame = () => <iframe srcDoc='<script>bad()</script>' />;", 'no-restricted-syntax'],
    ['innerHTML', "document.body.innerHTML = '<img src=x>';", 'no-restricted-syntax'],
    ['insertAdjacentHTML', "document.body.insertAdjacentHTML('beforeend', '<p>x</p>');", 'no-restricted-syntax'],
    ['setHTMLUnsafe', "document.body.setHTMLUnsafe('<p>x</p>');", 'no-restricted-syntax'],
    ['document.write', "document.write('<script>bad()</script>');", 'no-restricted-syntax'],
    ['eval', "export const result = eval('1 + 1');", 'no-eval'],
    ['Function constructor', "export const build = new Function('return 1');", 'no-new-func'],
    ['string timer', "setTimeout('run()', 10);", 'no-implied-eval'],
    ['fetch', "void fetch('/api/data');", 'no-restricted-syntax'],
    ['window.fetch', "void window.fetch('/api/data');", 'no-restricted-syntax'],
    ['computed fetch', "void globalThis['fetch']('/api/data');", 'no-restricted-syntax'],
    ['XMLHttpRequest', 'const request = new XMLHttpRequest(); request.open(\'GET\', \'/api\');', 'no-restricted-syntax'],
    ['WebSocket', "export const socket = new WebSocket('wss://example.com');", 'no-restricted-syntax'],
    ['sendBeacon', "navigator.sendBeacon('/telemetry', 'event');", 'no-restricted-syntax'],
    ['localStorage', "localStorage.setItem('extra-state', 'value');", 'no-restricted-syntax'],
    ['computed localStorage', "window['localStorage'].setItem('extra-state', 'value');", 'no-restricted-syntax'],
    ['sessionStorage', "sessionStorage.setItem('state', 'value');", 'no-restricted-syntax'],
    ['indexedDB', "indexedDB.open('unreviewed');", 'no-restricted-syntax'],
    ['document.cookie', "document.cookie = 'tracking=true';", 'no-restricted-syntax'],
  ])('blocks %s', async (_name, code, expectedRule) => {
    expect(await ruleIdsFor(code)).toContain(expectedRule);
  });

  it('allows React text rendering and pure local computation', async () => {
    const rules = await ruleIdsFor(`
      export function SafeView({ text }: { text: string }) {
        const normalized = text.trim();
        return <p>{normalized}</p>;
      }
    `);

    expect(rules).toEqual([]);
  });

  it('allows localStorage only inside the reviewed store boundary', async () => {
    const storeRules = await ruleIdsFor(
      'export const approvedPreferenceStorage = localStorage;',
      'src/store.ts',
    );
    const componentRules = await ruleIdsFor(
      'export const unreviewedStorage = localStorage;',
      'src/components/UnreviewedStorage.ts',
    );

    expect(storeRules).not.toContain('no-restricted-syntax');
    expect(componentRules).toContain('no-restricted-syntax');
  });
});
