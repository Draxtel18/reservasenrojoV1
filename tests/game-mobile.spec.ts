import { test, expect, devices, type Page } from '@playwright/test';

const PORTRAIT = { width: 412, height: 915 };
const LANDSCAPE = { width: 915, height: 412 };

// The device preset also pins a browser type, which a per-file use() cannot switch.
const { defaultBrowserType: _, ...phone } = devices['Pixel 7'];
test.use(phone);

const expandedState = () => document.fullscreenElement !== null;

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
  await page.waitForTimeout(400);
  expect(await page.evaluate(expandedState)).toBe(false);

  await page.setViewportSize(PORTRAIT);
  await showGame(page);
  await page.setViewportSize(LANDSCAPE);
  // A rotation carries no gesture, so a browser that refuses fullscreen is a valid outcome.
  const entered = await expect
    .poll(() => page.evaluate(expandedState), { timeout: 4000 })
    .toBe(true)
    .then(() => true)
    .catch(() => false);
  // Either way the frame takes the viewport height instead of cropping the game.
  const box = await page.locator('#participa iframe').boundingBox();
  expect(box!.height).toBeGreaterThan(LANDSCAPE.height * 0.9);
  if (entered) {
    await expect(page.getByRole('button', { name: 'Reducir el juego' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Abrir en una pestaña nueva' })).toHaveCount(0);
  } else {
    await expect(page.getByRole('button', { name: 'Ampliar el juego' })).toHaveAttribute('aria-pressed', 'false');
  }

  // Turning the phone back restores the inline stage and its controls.
  await page.setViewportSize(PORTRAIT);
  await expect.poll(() => page.evaluate(expandedState)).toBe(false);
  await expect(page.getByRole('button', { name: 'Ampliar el juego' })).toHaveAttribute('aria-pressed', 'false');
});

test('portrait keeps the resize control so the game never traps the phone', async ({ page }) => {
  await page.setViewportSize(PORTRAIT);
  await page.goto('/participa');
  await showGame(page);
  const enlarge = page.getByRole('button', { name: 'Ampliar el juego' });
  await enlarge.click();
  const entered = await expect
    .poll(() => page.evaluate(expandedState), { timeout: 4000 })
    .toBe(true)
    .then(() => true)
    .catch(() => false);
  if (entered) {
    const reduce = page.getByRole('button', { name: 'Reducir el juego' });
    await expect(reduce).toBeVisible();
    await expect(reduce).toHaveAttribute('aria-pressed', 'true');
    await reduce.click();
    await expect.poll(() => page.evaluate(expandedState)).toBe(false);
    await expect(page.getByRole('button', { name: 'Ampliar el juego' })).toHaveAttribute('aria-pressed', 'false');
  } else {
    await expect(enlarge).toHaveAttribute('aria-pressed', 'false');
  }
});
