import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/**
 * QA-20 — end-to-end coverage of the eJPT study track (PENTEST-01/02/03).
 *
 * The three eJPT chapters are deep-linked, and each is checked for the
 * cert label (`eJPT (INE/eLearnSecurity)`), the three-topic "On this
 * page" rail, and the primary guided-exercise action that sends the student into
 * the reused interactive lab. Every chapter is also scanned for WCAG 2.2 AA
 * violations, so the new offensive content stays accessible like the rest.
 */

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

const EJPT_CERT_LABEL = 'eJPT (INE/eLearnSecurity)';

const EJPT_CHAPTERS = [
  { id: 'pentest-methodology', title: 'Metodologia di penetration testing (eJPT)' },
  { id: 'web-app-pentest', title: 'Penetration testing delle applicazioni web (eJPT)' },
  { id: 'exploitation-post-exploitation', title: 'Exploitation e post-exploitation (eJPT)' }
] as const;

test.describe('eJPT study track (QA-20)', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  for (const chapter of EJPT_CHAPTERS) {
    test(`teaches ${chapter.id} with the eJPT cert label, topic index and guided exercises`, async ({ page }) => {
      await page.goto(`/#/manual/${chapter.id}`);

      // The deep link opens the exact chapter: its h2 is focused and addressable.
      const heading = page.getByRole('heading', { level: 2, name: chapter.title });
      await expect(heading).toBeVisible();

      // Extension chapters of the eJPT path carry the cert label (toolbar + card).
      await expect(page.getByText(EJPT_CERT_LABEL).first()).toBeVisible();

      // The "On this page" rail lists the three topics of the chapter.
      const topicRail = page.getByRole('navigation', { name: 'In questa pagina' });
      await expect(topicRail.getByRole('button')).toHaveCount(3);

      // Each topic surfaces its guided exercise, the primary practical action that
      // reuses an existing interactive lab (attackpaths, ports, inspection, …).
      const guidedActions = page.locator('[data-manual-action="guided-exercise"]');
      await expect(guidedActions).toHaveCount(3);
      await expect(guidedActions.first()).toContainText('Fai l’esercizio guidato');

      // The offensive content stays WCAG 2.2 AA accessible.
      const axe = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
      expect(axe.violations).toEqual([]);
    });
  }

  test('lists the eJPT chapters in the desktop chapter navigation', async ({ page }) => {
    await page.goto('/#/manual');
    const chapterNav = page.getByRole('navigation', { name: 'Capitoli del manuale' });
    await expect(chapterNav).toBeVisible();
    for (const chapter of EJPT_CHAPTERS) {
      await expect(chapterNav.getByRole('button', { name: chapter.title })).toBeVisible();
    }
  });
});
