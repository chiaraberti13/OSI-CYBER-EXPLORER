// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { REDACTED_JSON_VALUE } from '../lib/automation';
import { useStore } from '../store';
import AutomationLab from './AutomationLab';

afterEach(() => {
  cleanup();
});

describe('AutomationLab secret warning', () => {
  it.each([
    ['it', /non sostituisce un secret scanner/i],
    ['en', /does not replace a secret scanner/i],
  ] as const)('keeps the %s warning explicit and renders only the redacted value', (language, warning) => {
    useStore.setState({ language });
    render(<AutomationLab />);

    fireEvent.change(screen.getByRole('textbox', { name: 'JSON inspector' }), {
      target: { value: '{"client_secret":"never-render-this-value"}' },
    });

    const sensitiveRow = screen.getByText('$.client_secret').closest('tr');
    expect(sensitiveRow).toBeTruthy();
    expect(within(sensitiveRow!).getByText(REDACTED_JSON_VALUE)).toBeTruthy();
    const warningNote = screen.getByText(warning);
    expect(warningNote).toBeTruthy();
    expect(warningNote.parentElement?.textContent).not.toContain('never-render-this-value');
  });
});
