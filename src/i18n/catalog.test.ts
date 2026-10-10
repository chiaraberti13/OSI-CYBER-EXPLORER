import { describe, expect, it as test } from 'vitest';
import { en, formatSearchResultCount, it } from './index';

function leafKeys(value: object, prefix = ''): string[] {
  return Object.entries(value).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof child === 'object' && child !== null
      ? leafKeys(child, path)
      : [path];
  });
}

describe('typed UI catalogs', () => {
  test('keep Italian and English key sets identical', () => {
    expect(leafKeys(en).sort()).toEqual(leafKeys(it).sort());
  });

  test('contain no blank UI labels', () => {
    for (const catalog of [it, en]) {
      const values = Object.values(catalog).flatMap(section => Object.values(section)) as string[];
      expect(values.every(value => value.trim().length > 0)).toBe(true);
    }
  });

  test.each([
    ['it', 1, '1 risultato'],
    ['it', 2, '2 risultati'],
    ['en', 1, '1 result'],
    ['en', 2, '2 results'],
  ] as const)('formats %s result counts', (language, count, expected) => {
    expect(formatSearchResultCount(language, count)).toBe(expected);
  });
});
