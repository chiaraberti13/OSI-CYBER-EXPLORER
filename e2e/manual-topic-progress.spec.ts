import { expect, test } from '@playwright/test';

/**
 * EDU-PROG — the manual lets a learner record each topic (argomento) as studied, a finer
 * unit than a whole chapter. The per-topic toggle feeds a chapter "topics studied" tally,
 * persists across reloads in this browser, and is cleared by the single reset control.
 * This is formative self-tracking: no score, no answer key, no exam simulation.
 */
test.describe('per-topic study progress (EDU-PROG)', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('marks a topic studied, shows the chapter tally, and persists across reload', async ({ page }) => {
    await page.goto('/#/manual/osi-model');

    const firstTopic = page.getByTestId('topic-studied-osi-why-layers');
    await expect(firstTopic).toHaveAttribute('aria-pressed', 'false');

    // No chapter tally until at least one topic is studied.
    await expect(page.getByTestId('chapter-topic-progress')).toHaveCount(0);

    await firstTopic.click();
    await expect(page.getByTestId('topic-studied-osi-why-layers')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('chapter-topic-progress')).toContainText('1/4');
    // Marking a topic studied does not mark the whole chapter complete.
    await expect(page.getByRole('button', { name: 'Segna come completato' })).toHaveAttribute('aria-pressed', 'false');

    // Progress is remembered for this browser after a reload.
    await page.reload();
    await expect(page.getByTestId('topic-studied-osi-why-layers')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('chapter-topic-progress')).toContainText('1/4');

    // The single reset control clears topic progress too.
    await page.getByRole('button', { name: 'Azzera progresso' }).click();
    await expect(page.getByTestId('topic-studied-osi-why-layers')).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByTestId('chapter-topic-progress')).toHaveCount(0);
  });
});
