import { expect, test } from '@playwright/test';

test.describe('offline eJPT password and hash lab (EJPT-04)', () => {
  test('compares bounded online controls and synthetic offline KDF cost without external requests', async ({
    page
  }) => {
    const externalRequests: string[] = [];
    page.on('request', (request) => {
      if (!request.url().startsWith('http://127.0.0.1:4173/')) externalRequests.push(request.url());
    });
    await page.setViewportSize({ width: 320, height: 900 });
    await page.goto('/#/passwordlab');
    await page.getByRole('button', { name: 'English' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Password & hash workbench' })).toBeVisible();

    const scope = page.getByRole('checkbox', { name: /I confirm I will use only synthetic fixtures/i });
    await expect(page.getByRole('button', { name: 'Simulate online attempts' })).toBeDisabled();
    await scope.check();
    await page.getByRole('button', { name: 'Simulate online attempts' }).click();
    await expect(page.getByText('Requests throttled by rate limit')).toBeVisible();

    await page.getByRole('checkbox', { name: /Rate limit:/i }).uncheck();
    await page.getByRole('checkbox', { name: /Lock account after 5 failures/i }).check();
    await page.getByRole('combobox', { name: 'Simulated attempts against one account' }).selectOption('8');
    await page.getByRole('button', { name: 'Simulate online attempts' }).click();
    await expect(page.getByText(/ACCOUNT_LOCKOUT_REJECT: fixture-user-01/)).toHaveCount(3);

    await page.getByRole('combobox', { name: 'Strategy to compare' }).selectOption('password-spray');
    await page.getByRole('combobox', { name: 'Synthetic accounts in sample' }).selectOption('5');
    await page.getByRole('button', { name: 'Simulate online attempts' }).click();
    await expect(page.getByText('Alert: failures distributed across accounts')).toBeVisible();
    await expect(page.getByText(/CORRELATED_FAILURES: 5 synthetic accounts/)).toBeVisible();

    await page.getByRole('combobox', { name: 'Synthetic candidate budget' }).selectOption('100');
    await page.getByRole('button', { name: 'Compare offline profiles' }).click();
    await expect(page.getByText('Weak sample found within budget')).toBeVisible();
    await expect(page.getByText('Sample not found within budget')).toBeVisible();
    await expect(page.getByText(/no hash is computed/i)).toBeVisible();
    expect(externalRequests).toEqual([]);

    const noHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
    expect(noHorizontalOverflow).toBe(true);

    await page.getByRole('button', { name: 'Reset simulation' }).click();
    await expect(page.getByRole('button', { name: 'Simulate online attempts' })).toBeDisabled();
  });

  test('provides the offline fixture controls in Italian', async ({ page }) => {
    await page.goto('/#/passwordlab');
    await page.getByRole('checkbox', { name: /Confermo che opero solo sulle fixture/i }).check();
    await page.getByRole('button', { name: 'Confronta i profili offline' }).click();
    await expect(page.getByText('Campione debole trovato nel budget')).toBeVisible();
    await expect(page.getByText('Campione non trovato nel budget')).toBeVisible();
    await expect(page.getByText(/nessun hash viene calcolato/i)).toBeVisible();
  });
});
