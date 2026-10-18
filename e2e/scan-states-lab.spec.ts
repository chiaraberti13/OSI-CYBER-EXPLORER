import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

/**
 * LAB-01 — the port-state decoder, the first interactive lab built for the eJPT
 * scanning methodology. It opens by deep link, compares the three states for a
 * protocol, switches TCP↔UDP, and stays WCAG 2.2 AA accessible.
 */
test.describe('port-state decoder (LAB-01)', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('decodes the TCP and UDP scan states and stays accessible', async ({ page }) => {
    await page.goto('/#/scanstates');

    const heading = page.getByRole('heading', { level: 1, name: 'Decodificatore degli stati di porta' });
    await expect(heading).toBeVisible();

    // TCP by default: the three states each surface their response.
    await expect(page.getByText('SYN-ACK', { exact: false }).first()).toBeVisible();
    await expect(page.getByText('RST', { exact: false }).first()).toBeVisible();

    // Switching to UDP shows the UDP-specific evidence (ICMP port unreachable).
    const udp = page.getByRole('button', { name: 'UDP' });
    await udp.click();
    await expect(udp).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByText('ICMP port unreachable', { exact: false }).first()).toBeVisible();

    const axe = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    expect(axe.violations).toEqual([]);
  });
});
