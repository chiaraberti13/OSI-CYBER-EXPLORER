import { expect, test } from '@playwright/test';

test.describe('offline eJPT host/network audit lab (EJPT-05)', () => {
  test('collects a minimized manifest, records custody, transfers and cleans up', async ({ page }) => {
    const externalRequests: string[] = [];
    page.on('request', (request) => {
      if (!request.url().startsWith('http://127.0.0.1:4173/')) externalRequests.push(request.url());
    });
    await page.setViewportSize({ width: 320, height: 900 });
    await page.goto('/#/auditlab');
    await page.getByRole('button', { name: 'English' }).click();
    await expect(
      page.getByRole('heading', { level: 1, name: 'Host and network audit: evidence collection' })
    ).toBeVisible();

    const collect = page.getByRole('button', { name: 'Collect selected evidence' });
    await expect(collect).toBeDisabled();
    await page.getByRole('checkbox', { name: /I confirm authorization and use of fixtures only/i }).check();
    await collect.click();
    await expect(page.getByText('ens33 192.0.2.44/24', { exact: false })).toBeVisible();
    await expect(page.getByText(/passwords\/hashes omitted and not collected/i)).toBeVisible();
    await expect(page.getByText(/Fixture SHA-256: [a-f0-9]{64}/i).first()).toBeVisible();
    await page.getByRole('button', { name: 'Simulate authorized transfer' }).click();
    await expect(page.getByText(/Fixture transfer verified with SHA-256/i)).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Chain of custody' })).toBeVisible();
    await expect(page.getByText(/synthetic-host → analyst-fixture/i)).toBeVisible();
    await expect(page.getByText(/Minimized evidence manifest/)).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    expect(externalRequests).toEqual([]);

    await page.getByRole('button', { name: 'Clear session' }).click();
    await expect(page.getByText('No fixture data collected.')).toBeVisible();
    await expect(page.getByText(/Session cleared/)).toBeVisible();
  });

  test('supports the Windows fixture and only an inert analyst-to-host transfer in Italian', async ({ page }) => {
    await page.goto('/#/auditlab');
    await page.getByRole('combobox', { name: 'Sistema fixture' }).selectOption('windows');
    await page.getByRole('checkbox', { name: /Confermo autorizzazione/i }).check();
    await page.getByRole('combobox', { name: 'Direzione del trasferimento simulato' }).selectOption('analyst-to-host');
    await page.getByRole('button', { name: 'Simula trasferimento autorizzato' }).click();
    await expect(page.getByText('validation-note.txt')).toBeVisible();
    await expect(page.getByText(/analyst-fixture → synthetic-host/i)).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
});
