import { test, expect } from '@playwright/test';

/**
 * ENG-12 smoke tests for the interactive labs: opening a lab from the menu, the
 * OSI packet simulation lifecycle, and the IPv4 / VLSM / STP calculators whose
 * pure logic is unit-tested but whose wiring to the UI only an end-to-end run
 * covers. Each test drives one lab through a real, deterministic interaction.
 */

test.describe('interactive labs', () => {
  test('verifies IPv6 static-route selection and floating-route failover', async ({ page }) => {
    await page.goto('/#/routing');

    const lab = page.locator('section[aria-labelledby="ipv6-static-lab-title"]');
    await expect(lab).toBeVisible();
    const result = lab.locator('[aria-live="polite"]');
    await expect(result).toContainText('2001:db8:0:12::2 [AD 1]');
    await lab.getByLabel('Link primario IPv6 disponibile').uncheck();
    await expect(result).toContainText('2001:db8:0:13::2 [AD 200]');
    await expect(result).toContainText('Floating route attiva');
    await lab.getByLabel('Destinazione di prova').selectOption('host');
    await expect(result).toContainText('2001:db8:20::50/128');
    await expect(result).toContainText('2001:db8:0:13::2 [AD 200]');
    await lab.getByLabel('Destinazione di prova').selectOption('default');
    await expect(result).toContainText('::/0 via 2001:db8:0:13::2 [AD 200]');
  });

  test('compares NAT modes and diagnoses dynamic-pool and configuration failures', async ({ page }) => {
    await page.goto('/#/services');

    const nat = page.locator('section[aria-labelledby="nat-title"]');
    await expect(nat).toBeVisible();
    const result = nat.locator('[aria-live="polite"]');
    await expect(result).toContainText('10.10.10.42 → 198.51.100.20');
    await expect(nat).toContainText('198.51.100.10:49152');
    await expect(nat.getByLabel('Inside local IPv4')).toHaveAttribute('aria-invalid', 'false');

    await nat.getByLabel('Modalità di traduzione').selectOption('static');
    await expect(result).toContainText('10.10.10.42 → 198.51.100.50');
    await nat.getByLabel('Modalità di traduzione').selectOption('dynamic');

    await nat.getByLabel('ACL NAT corrisponde alla subnet inside').uncheck();
    await expect(result).toContainText('ACL senza corrispondenza');
    await nat.getByLabel('ACL NAT corrisponde alla subnet inside').check();
    await nat.getByLabel('Interfacce inside/outside assegnate correttamente').uncheck();
    await expect(result).toContainText('Ruoli inside/outside mancanti o invertiti');
    await nat.getByLabel('Interfacce inside/outside assegnate correttamente').check();
    await nat.getByLabel('Esaurisci il pool dinamico').check();
    await expect(result).toContainText('Pool pubblico esaurito');
  });

  test('configures NTP roles, selects redundant sources, and distinguishes local clock fallback', async ({ page }) => {
    await page.goto('/#/services');

    const lab = page.locator('section[aria-labelledby="ntp-config-title"]');
    const status = lab.getByTestId('ntp-status');
    await expect(status).toContainText('Sincronizzato con una sorgente upstream');
    await expect(status).toContainText('192.0.2.123');
    await expect(status).toContainText('3');

    await lab.getByLabel('Ruolo del dispositivo').selectOption('server');
    await expect(status).toContainText('Sincronizzato con una sorgente upstream');
    await expect(status).toContainText('Può servire client downstream');
    await lab.getByLabel('Ruolo del dispositivo').selectOption('client');

    await lab.getByLabel('192.0.2.123 · preferita · stratum 2').uncheck();
    await expect(status).toContainText('192.0.2.124');
    await expect(status).toContainText('4');
    await lab.getByLabel('192.0.2.124 · stratum 3').uncheck();
    await expect(status).toContainText('Non sincronizzato');
    await expect(status).toContainText('16');
    await expect(status).toContainText('Non serve client downstream');

    await lab.getByLabel('Ruolo del dispositivo').selectOption('server');
    await expect(status).toContainText('Orologio locale annunciato come master');
    await expect(status).toContainText('8');
    await expect(status).toContainText('Può servire client downstream');
    await expect(lab).toContainText('show ntp associations');
    await expect(lab).toContainText('show ntp status');
    await expect(lab).toContainText('ntp master 8');

    await page.getByRole('button', { name: 'English' }).click();
    await expect(lab.getByRole('heading', { name: 'Configure and verify NTP' })).toBeVisible();
    await expect(status).toContainText('Local clock advertised as master');
    await expect(lab).toContainText('unreachable');
  });

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
