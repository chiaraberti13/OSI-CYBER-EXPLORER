import { expect, test } from '@playwright/test';

test.describe('offline eJPT pivoting lab (EJPT-03)', () => {
  test('compares a host route with a single-port mapping, enforces scope, and tears down', async ({ page }) => {
    const externalRequests: string[] = [];
    page.on('request', (request) => {
      if (!request.url().startsWith('http://127.0.0.1:4173/')) externalRequests.push(request.url());
    });

    await page.goto('/#/pivotlab');
    await expect(page.getByRole('heading', { level: 1, name: 'Pivoting: route o port forwarding?' })).toBeVisible();
    await expect(page.getByRole('img', { name: /198\.51\.100\.10.*203\.0\.113\.25/ })).toBeVisible();

    const setup = page.getByRole('button', { name: 'Attiva la simulazione' });
    await expect(setup).toBeDisabled();
    await page.getByRole('checkbox', { name: /Confermo l’autorizzazione/i }).check();
    await setup.click();
    await expect(page.getByText(/203\.0\.113\.25\/32 via 198\.51\.100\.20/)).toBeVisible();
    await page.getByRole('button', { name: 'Simula il flusso selezionato' }).click();
    await expect(page.getByText(/Il tester instrada l’host \/32 al pivot/)).toBeVisible();

    await page.getByRole('button', { name: 'Esegui teardown' }).click();
    await page.getByRole('combobox', { name: 'Servizio richiesto' }).selectOption('22');
    await setup.click();
    await page.getByRole('button', { name: 'Simula il flusso selezionato' }).click();
    await expect(page.getByText(/La destinazione TCP\/22 è fuori scope/)).toBeVisible();
    await page.getByRole('button', { name: 'Esegui teardown' }).click();
    await expect(page.getByText(/203\.0\.113\.25\/32 via 198\.51\.100\.20/)).toHaveCount(0);

    await page.getByRole('combobox', { name: 'Meccanismo da simulare' }).selectOption('port-forward');
    await page.getByRole('combobox', { name: 'Servizio richiesto' }).selectOption('443');
    await setup.click();
    await expect(page.getByText(/198\.51\.100\.20:8443 → 203\.0\.113\.25:443\/TCP/)).toBeVisible();
    await expect(page.getByText(/203\.0\.113\.25\/32 via 198\.51\.100\.20/)).toHaveCount(0);
    await page.getByRole('button', { name: 'Simula il flusso selezionato' }).click();
    await expect(page.getByText(/Il tester contatta il listener fixture/)).toBeVisible();
    await page.getByRole('button', { name: 'Esegui teardown' }).click();

    expect(externalRequests).toEqual([]);
  });

  test('expires a short lease automatically and is available in English', async ({ page }) => {
    await page.goto('/#/pivotlab');
    await page.getByRole('button', { name: 'English' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Pivoting: route or port forwarding?' })).toBeVisible();
    await page.getByRole('checkbox', { name: /I confirm authorization/i }).check();
    await page.getByRole('button', { name: 'Enable simulation' }).click();
    await page.getByRole('button', { name: 'Advance by 5 minutes' }).click();
    await expect(page.getByText(/Lease expired: route or mapping removed automatically/)).toBeVisible();
    await expect(page.getByText(/203\.0\.113\.25\/32 via 198\.51\.100\.20/)).toHaveCount(0);
  });
});
