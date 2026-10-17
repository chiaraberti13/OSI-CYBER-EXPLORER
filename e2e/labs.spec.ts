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

    const feedback = page.locator('p[role="status"][aria-live="polite"]');
    await expect(feedback).toContainText('Simulazione pronta.');

    await page.getByRole('button', { name: 'Velocità 2x' }).click();
    await expect(feedback).toContainText('Velocità della simulazione impostata su 2x.');

    const start = page.getByRole('button', { name: 'Avvia Simulazione' });
    await expect(start).toBeVisible();
    await start.click();
    await expect(feedback).toContainText('Simulazione avviata.');

    // Starting swaps the control to Pause; pausing freezes the run (timer-independent).
    const pause = page.getByRole('button', { name: 'Pausa' });
    await expect(pause).toBeVisible();
    await pause.click();
    await expect(feedback).toContainText('Simulazione in pausa.');

    const resume = page.getByRole('button', { name: 'Riprendi' });
    await expect(resume).toBeVisible();
    await resume.click();
    await expect(feedback).toContainText('Simulazione ripresa.');

    // Reset returns the simulator to its idle state.
    await page.getByRole('button', { name: 'Reset' }).click();
    await expect(feedback).toContainText('Simulazione reimpostata.');
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
    await page.goto('/#/osi');
    await expect(page.getByRole('heading', { level: 1, name: 'Pila OSI' })).toBeVisible();

    // IA-13: labs open from the "Laboratori" dropdown in the top bar (CCNA area subheading).
    await page.getByRole('button', { name: /Laboratori/ }).click();
    await page
      .locator('#primary-labs-menu')
      .getByRole('link', { name: /Connettività IP/ })
      .click();

    await expect(page).toHaveURL(/#\/routing$/);
    await expect(page).toHaveTitle(/Connettività IP — OSI Cyber Explorer/);
  });
});
