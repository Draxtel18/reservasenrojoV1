import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const samples: { kind: string; section: string; opacity: number; transform: string }[] = [];
    (window as Window & { motionSamples?: typeof samples }).motionSamples = samples;
    let frame = 0;
    function sample() {
      if (++frame % 4 === 0 && samples.length < 500) {
        document.querySelectorAll<HTMLElement>('[data-motion-enter], [data-reveal]').forEach(element => {
          if (element.getAnimations().some(animation => animation.playState === 'running')) {
            samples.push({ kind: element.dataset.motionEnter || element.dataset.reveal || '',
              section: element.closest('section')?.id || '', opacity: Number(getComputedStyle(element).opacity), transform: getComputedStyle(element).transform });
          }
        });
      }
      requestAnimationFrame(sample);
    }
    requestAnimationFrame(sample);
  });
});

test('home has a visible title entrance and offscreen chapters reveal while scrolling', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'enabled');
  await expect.poll(() => page.evaluate(() => (window as Window & { motionSamples?: { kind: string; opacity: number }[] })
    .motionSamples?.some(sample => sample.kind === 'title' && sample.opacity > 0 && sample.opacity < 1))).toBe(true);
  const image = page.locator('.portal-cronologia [data-reveal="media"]');
  await expect(image).toHaveAttribute('data-motion-state', 'pending');
  await image.evaluate(element => window.scrollTo({ top: element.getBoundingClientRect().top + scrollY - innerHeight * .6, behavior: 'instant' }));
  await expect(image).toHaveClass(/revealed/);
  await expect.poll(() => page.evaluate(() => (window as Window & { motionSamples?: { section: string; opacity: number }[] })
    .motionSamples?.some(sample => sample.section === 'cronologia' && sample.opacity > 0 && sample.opacity < 1))).toBe(true);
  await expect.poll(() => image.evaluate(element => getComputedStyle(element).opacity)).toBe('1');
});

test('approved full choreography stays active without a pause control, across navigation and reload', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'enabled');
  await expect(page.locator('html')).toHaveAttribute('data-motion-style', 'full');
  await expect(page.locator('header').getByRole('button', { name: /animaciones/ })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /animaciones/i })).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => (window as Window & { motionSamples?: { opacity: number }[] })
    .motionSamples?.some(sample => sample.opacity > 0 && sample.opacity < 1))).toBe(true);
  await expect.poll(() => page.evaluate(() => (window as Window & { motionSamples?: { kind: string; transform: string }[] })
    .motionSamples?.some(sample => sample.kind === 'title' && sample.transform !== 'none'))).toBe(true);
  expect(await page.locator('.hero-photo img').evaluate(element => getComputedStyle(element).animationName)).toBe('photo-drift');
  await page.getByRole('link', { name: 'Equipo', exact: true }).first().click();
  await expect(page.locator('h1')).toHaveText('Sobre nosotros');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'enabled');
  await expect.poll(() => page.evaluate(() => (window as Window & { motionSamples?: { kind: string }[] })
    .motionSamples?.some(sample => sample.kind === 'page'))).toBe(true);
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'enabled');
  await expect(page.getByRole('button', { name: /animaciones/i })).toHaveCount(0);
  await expect(page.locator('h1')).toBeVisible();
});
