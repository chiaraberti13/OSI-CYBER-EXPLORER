import { expect, test } from '@playwright/test';

/**
 * EDU-PROG — the manual card index shows a "resume studying" summary once the learner has
 * any progress: it aggregates topics studied across the manual and links straight to the
 * chapter to pick back up (the first not yet completed). It is a navigation aid over
 * existing progress — no score, no exam simulation — and is hidden for a first-time visitor.
 */
test.describe('resume-studying summary (EDU-PROG)', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('appears after progress and links to the next chapter to study', async ({ page }) => {
    await page.goto('/#/manual');
    // A first-time visitor sees the plain chapter chooser, no resume summary.
    await expect(page.getByTestId('resume-summary')).toHaveCount(0);

    // Study a topic and complete the first chapter.
    await page.goto('/#/manual/osi-model');
    await page.getByTestId('topic-studied-osi-why-layers').click();
    await page.getByRole('button', { name: 'Segna come completato' }).click();

    // Back on the index, the resume summary is shown and points at the next chapter.
    await page.getByRole('link', { name: 'Tutti i capitoli' }).click();
    const summary = page.getByTestId('resume-summary');
    await expect(summary).toBeVisible();
    await expect(summary).toContainText(/Argomenti studiati: 1\/\d+/);

    const resume = page.getByTestId('resume-link');
    await expect(resume).toHaveAttribute('href', '#/manual/ethernet-switching');
    await resume.click();
    await expect(page.getByRole('heading', { level: 2, name: /Ethernet/ })).toBeVisible();

    // Study one topic of this chapter (without completing it), then return to the index:
    // the chapter card now shows its in-progress topic tally (EDU-PROG).
    await page.getByTestId('topic-studied-ethernet-frame-mac').click();
    await page.getByRole('link', { name: 'Tutti i capitoli' }).click();
    await expect(page.getByTestId('card-topic-progress-ethernet-switching')).toContainText('1/3');
    // The completed first chapter shows no card tally (it already reads "Completed").
    await expect(page.getByTestId('card-topic-progress-osi-model')).toHaveCount(0);
  });
});
