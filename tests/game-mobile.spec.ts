import { test, expect, devices, type Page } from '@playwright/test';

const PORTRAIT = { width: 412, height: 915 };
const LANDSCAPE = { width: 915, height: 412 };

// The device preset also pins a browser type, which a per-file use() cannot switch.
const { defaultBrowserType: _, ...phone } = devices['Pixel 7'];
test.use(phone);

const expandedState = () => document.fullscreenElement !== null || document.querySelector('[data-expanded="true"]') !== null;

// Park the stage in view without the page's smooth scrolling racing the rotation.
async function showGame(page: Page) {
  await page.locator('#participa iframe').evaluate(element => {
    window.scrollTo({ top: window.scrollY + element.getBoundingClientRect().top - 60, behavior: 'instant' as ScrollBehavior });
  });
}

test('rotating to landscape expands the game and hides the resize control', async ({ page }) => {
  await page.setViewportSize(PORTRAIT);
  await page.goto('/participa');
  // Rotating while the game is off screen must not hijack the page.
  await page.locator('footer').scrollIntoViewIfNeeded();
  await page.setViewportSize(LANDSCAPE);
  await page.waitForTimeout(300);
  await expect(page.locator('[data-expanded="true"]')).toHaveCount(0);

  await page.setViewportSize(PORTRAIT);
  await showGame(page);
  await page.setViewportSize(LANDSCAPE);
  await expect.poll(() => page.evaluate(expandedState)).toBe(true);
  // The game takes the whole viewport instead of being cropped, and no control floats over it.
  const box = await page.locator('#participa iframe').boundingBox();
  expect(box!.height).toBeGreaterThan(LANDSCAPE.height * 0.9);
  await expect(page.getByRole('button', { name: 'Reducir el juego' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Abrir en una pestaña nueva' })).toHaveCount(0);

  // Turning the phone back restores the inline stage and its controls.
  await page.setViewportSize(PORTRAIT);
  await expect.poll(() => page.evaluate(expandedState)).toBe(false);
  await expect(page.getByRole('button', { name: 'Ampliar el juego' })).toHaveAttribute('aria-pressed', 'false');
});

test('without fullscreen the game expands as an overlay and native back closes it', async ({ page }) => {
  await page.addInitScript(() => {
    Element.prototype.requestFullscreen = () => Promise.reject(new Error('fullscreen unavailable'));
  });
  await page.setViewportSize(PORTRAIT);
  await page.goto('/participa');
  const url = page.url();
  await showGame(page);
  await page.getByRole('button', { name: 'Ampliar el juego' }).click();
  await expect(page.locator('[data-overlay="true"]')).toHaveCount(1);
  const box = await page.locator('#participa iframe').boundingBox();
  expect(box!.height).toBeGreaterThan(PORTRAIT.height * 0.9);
  await expect(page.getByRole('button', { name: 'Reducir el juego' })).toHaveCount(0);

  await page.goBack();
  await expect(page.locator('[data-overlay="true"]')).toHaveCount(0);
  await expect(page).toHaveURL(url);

  // Leaving the overlay without the back button must not leave its history entry behind.
  await page.getByRole('button', { name: 'Ampliar el juego' }).click();
  await expect(page.locator('[data-overlay="true"]')).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-overlay="true"]')).toHaveCount(0);
  await expect(page).toHaveURL(url);
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
});
