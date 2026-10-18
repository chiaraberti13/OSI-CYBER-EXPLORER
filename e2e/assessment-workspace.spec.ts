import { expect, test } from '@playwright/test';

test.describe('offline eJPT assessment workspace (EJPT-01)', () => {
  test('gates the evidence chain by scope and produces the bilingual report without external requests', async ({
    page
  }) => {
    const externalRequests: string[] = [];
    page.on('request', (request) => {
      if (!request.url().startsWith('http://127.0.0.1:4173/')) externalRequests.push(request.url());
    });

    await page.goto('/#/assessment');
    await expect(page.getByRole('heading', { level: 1, name: 'Workspace di assessment' })).toBeVisible();
    await expect(page.getByText('web-01.example.test', { exact: false })).toBeVisible();

    const phase = (name: string) => page.getByRole('heading', { name }).locator('xpath=ancestor::article');
    await expect(phase('OSINT da fixture').getByRole('button')).toBeDisabled();
    await page.getByRole('checkbox', { name: /Confermo di lavorare esclusivamente/i }).check();

    for (const name of [
      'OSINT da fixture',
      'Host discovery',
      'Porte e servizi',
      'Ipotesi sul sistema operativo',
      'Vulnerability assessment'
    ]) {
      await phase(name).getByRole('button').click();
    }

    await expect(page.locator('p').filter({ hasText: 'Fuori scope, escluso:' })).toContainText('198.51.100.20');
    const report = page.locator('pre[aria-label="Report bilingue pronto"]');
    await expect(report).toContainText('# Report assessment (simulazione)');
    await expect(report).toContainText('# Assessment report (simulation)');
    await expect(report).toContainText('Source: fixture://services/web-01.json');
    await expect(report).toContainText('confidence: 45%');
    expect(externalRequests).toEqual([]);
  });
});
