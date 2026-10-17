import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { STUDY_MANUAL } from '../src/content/studyManual';

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

      // The "On this page" rail lists one button per topic of the chapter. The
      // expected counts are derived from the dataset (ENG-31), so adding a topic or a
      // guided exercise never forces a hand-edit here.
      const data = STUDY_MANUAL.find((c) => c.id === chapter.id);
      if (!data) throw new Error(`missing chapter ${chapter.id}`);
      const topicCount = data.topics.length;
      const guidedCount = data.topics.reduce((n, topic) => n + (topic.guidedLabs?.length ?? 0), 0);

      const topicRail = page.getByRole('navigation', { name: 'In questa pagina' });
      await expect(topicRail.getByRole('button')).toHaveCount(topicCount);

      // Each guided exercise is the primary practical action that reuses an existing
      // interactive lab (attackpaths, ports, inspection, …).
      const guidedActions = page.locator('[data-manual-action="guided-exercise"]');
      await expect(guidedActions).toHaveCount(guidedCount);
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
      await expect(chapterNav.getByRole('link', { name: chapter.title })).toBeVisible();
    }
  });
});
