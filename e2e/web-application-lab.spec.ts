import { expect, test } from '@playwright/test';

test.describe('offline eJPT web application fixture (EJPT-06)', () => {
  test('collects scoped evidence, remediates findings, and passes regressions without external requests', async ({
    page
  }) => {
    const externalRequests: string[] = [];
    page.on('request', (request) => {
      if (!request.url().startsWith('http://127.0.0.1:4173/')) externalRequests.push(request.url());
    });
    await page.setViewportSize({ width: 320, height: 900 });
    await page.goto('/#/weblab');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Web application pentest: fixture offline' })
    ).toBeVisible();
    const inspect = page.getByRole('button', { name: 'Ispeziona risposta HTTP' });
    await expect(inspect).toBeDisabled();
    await page.getByRole('checkbox', { name: /Confermo lo scope/i }).check();
    await inspect.click();
    await expect(page.getByText(/Content-Security-Policy: \(missing\)/)).toBeVisible();
    await page.getByRole('button', { name: 'Scopri percorsi fixture' }).click();
    await expect(page.getByText(/401 \/admin\//)).toBeVisible();
    await page.getByRole('button', { name: 'Invia tentativo login sintetico' }).click();
    await expect(page.getByText(/POST \/login/)).toBeVisible();
    await page.getByRole('button', { name: 'Verifica accesso al profilo fixture-user-02' }).click();
    await expect(page.getByText(/IDOR\/BOLA/).first()).toBeVisible();
    await expect(page.getByText(/200 OK/).last()).toBeVisible();
    await page.getByRole('button', { name: 'Applica remediation fixture' }).click();
    await page.getByRole('button', { name: 'Esegui test di regressione' }).click();
    await expect(page.getByRole('heading', { name: /Esito regressioni: PASS/ })).toBeVisible();
    await expect(page.getByText(/429 Too Many Requests/)).toBeVisible();
    await expect(page.getByText(/403 Forbidden/)).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    expect(externalRequests).toEqual([]);
  });

  test('supports the English route and reset behavior', async ({ page }) => {
    await page.goto('/#/weblab');
    await page.getByRole('button', { name: 'English' }).click();
    await expect(
      page.getByRole('heading', { level: 1, name: 'Web application pentest: offline fixture' })
    ).toBeVisible();
    await page.getByRole('checkbox', { name: /I confirm scope/i }).check();
    await page.getByRole('button', { name: 'Inspect HTTP response' }).click();
    await expect(page.getByText(/HTTP\/1\.1 200 OK/).first()).toBeVisible();
    await page.getByRole('button', { name: 'Reset session' }).click();
    await expect(page.getByText('No evidence yet. Confirm scope and start a check.')).toBeVisible();
  });
});
