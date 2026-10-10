import type { Language } from '../types';
import { en } from './en';
import { it, type UiMessages } from './it';

export { en, it };
export type { UiMessages };

export const UI_MESSAGES = { it, en } satisfies Record<Language, UiMessages>;

export function uiMessages(language: Language): UiMessages {
  return UI_MESSAGES[language];
}

export function formatSearchResultCount(language: Language, count: number): string {
  const copy = uiMessages(language).navigation;
  return `${count} ${count === 1 ? copy.result : copy.resultsCount}`;
}
