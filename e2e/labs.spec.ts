import { test, expect } from '@playwright/test';

/**
 * ENG-12 smoke tests for the interactive labs: opening a lab from the menu, the
 * OSI packet simulation lifecycle, and the IPv4 / VLSM / STP calculators whose
 * pure logic is unit-tested but whose wiring to the UI only an end-to-end run
 * covers. Each test drives one lab through a real, deterministic interaction.
 */

test.describe('interactive labs', () => {
  test('runs, pauses, resumes and resets the OSI packet simulation', async ({ page }) => {
    await page.goto('/#/osi');

    const start = page.getByRole('button', { name: 'Avvia Simulazione' });
    await expect(start).toBeVisible();
    await start.click();

    // Starting swaps the control to Pause; pausing freezes the run (timer-independent).
    const pause = page.getByRole('button', { name: 'Pausa' });
    await expect(pause).toBeVisible();
    await pause.click();

    const resume = page.getByRole('button', { name: 'Riprendi' });
    await expect(resume).toBeVisible();

    // Reset returns the simulator to its idle state.
    await page.getByRole('button', { name: 'Reset' }).click();
    await expect(start).toBeVisible();
  });

  test('computes an IPv4 subnet live in the fundamentals lab', async ({ page }) => {
    await page.goto('/#/fundamentals');

    const calculator = page.locator('section[aria-labelledby="subnet-title"]');
    await expect(calculator).toBeVisible();
    // Defaults: 192.168.10.42 /24 -> network 192.168.10.0.
    await expect(calculator).toContainText('192.168.10.0');

    // Widening the prefix recomputes the network without a submit button.
    await calculator.getByLabel('Prefisso CIDR').fill('16');
    await expect(calculator).toContainText('192.168.0.0');
  });

  test('plans VLSM allocations from the base block', async ({ page }) => {
    await page.goto('/#/fundamentals');

    const planner = page.locator('section[aria-labelledby="vlsm-title"]');
    await expect(planner).toBeVisible();
    // The default plan allocates inside the 192.168.1.0/24 base block.
    await expect(planner).toContainText('192.168.1.');

    // Changing the base block re-plans every allocation live.
    await planner.getByLabel('Blocco di partenza').fill('10.10.0.0');
    await expect(planner).toContainText('10.10.0.');
  });

  test('converges STP and exposes the active cost standard', async ({ page }) => {
    await page.goto('/#/access');

    const stp = page.locator('section[aria-labelledby="stp-converge-title"]');
    await expect(stp).toBeVisible();

    // A root bridge is elected and labelled.
    await expect(stp.getByText('ROOT').first()).toBeVisible();

    // The short table (802.1D-1998, 16-bit) is the default; switching to long
    // makes the 32-bit standard the one shown to the student.
    await expect(stp).toContainText('16 bit');
    await stp.getByLabel('Metodo di costo').selectOption('long');
    await expect(stp).toContainText('32 bit');
  });

  test('opens a lab from the navigation menu', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1, name: 'OSI Cyber Explorer' })).toBeVisible();

    await page.getByRole('button', { name: /Percorso CCNA/ }).click();
    await page
      .locator('#nav-panel-ccna')
      .getByRole('link', { name: /Connettività IP/ })
      .click();

    await expect(page).toHaveURL(/#\/routing$/);
    await expect(page).toHaveTitle(/Connettività IP — OSI Cyber Explorer/);
  });
});
