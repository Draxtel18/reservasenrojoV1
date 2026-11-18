import { test, expect } from '@playwright/test';

test('the editorial shell has eight sections, all formats and nine team profiles', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect(page.locator('main > section')).toHaveCount(8);
  await expect(page.locator('h1')).toHaveText('Reservas en rojo');
  await expect(page.locator('#formatos a')).toHaveCount(7);
  expect(await page.locator('body').innerText()).not.toMatch(/[\u2013\u2014]/);
  await page.goto('/equipo');
  await expect(page.locator('.profile')).toHaveCount(9);
  await expect(page.locator('.profile-name')).toHaveCount(9);
  await expect(page.locator('audio')).toHaveCount(0);
  await page.goto('/cronologia');
  await expect(page.locator('.demo-timeline-item')).toHaveCount(17);
  await page.goto('/lectura');
  await expect(page.locator('#lectura')).toContainText('pendientes de incorporación');
});

test('documentary loads the real privacy-enhanced embed only on request', async ({ page }) => {
  await page.goto('/reportaje');
  await expect(page.locator('.cinema iframe')).toHaveCount(0);
  await page.getByRole('button', { name: 'Reproducir reportaje' }).click();
  const iframe = page.getByTitle('Reportaje audiovisual: Reservas en rojo');
  await expect(iframe).toHaveAttribute('src', /youtube-nocookie\.com\/embed\/-KErtns1Jv0\?/);
  const source = new URL((await iframe.getAttribute('src'))!);
  expect(source.searchParams.get('autoplay')).toBe('0');
  expect(source.searchParams.get('controls')).toBe('0');
  expect(source.searchParams.get('enablejsapi')).toBe('1');
  expect(source.searchParams.get('origin')).toBe(new URL(page.url()).origin);
  await expect(iframe).toHaveAttribute('allowfullscreen', '');
  const box = await iframe.boundingBox();
  expect(box!.width / box!.height).toBeCloseTo(16 / 9, 1);
});

test('comic identifies its imagined narrative and restores keyboard focus', async ({ page }) => {
  await page.goto('/comic');
  await page.getByRole('button', { name: 'Explorar cómic' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog')).toContainText('ciudad imaginaria');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Explorar cómic' })).toBeFocused();
});

test('the gamification section embeds the project game', async ({ page }) => {
  await page.goto('/participa');
  const game = page.locator('#participa iframe');
  await expect(game).toHaveCount(1);
  await expect(game).toHaveAttribute('src', 'https://yeicotjj.github.io/gamificacion-donar-sangre/');
  expect((await game.getAttribute('title'))?.trim().length).toBeGreaterThan(0);
  await expect(game).toHaveAttribute('loading', 'lazy');
  await expect(page.locator('.quiz')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Salva vidas, decide bien' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Abrir en una pestaña nueva' })).toHaveAttribute('href', 'https://yeicotjj.github.io/gamificacion-donar-sangre/');
  await expect(page.locator('#participa img')).toHaveCount(0);
  const enlarge = page.getByRole('button', { name: 'Ampliar el juego' });
  await expect(enlarge).toBeVisible();
  await expect(enlarge).toBeEnabled();
  await enlarge.click();
  const entered = await page
    .waitForFunction(() => document.fullscreenElement !== null, undefined, { timeout: 4000 })
    .then(() => true)
    .catch(() => false);
  if (entered) {
    await expect(page.getByRole('button', { name: 'Reducir el juego' })).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: 'Reducir el juego' }).click();
    await expect.poll(() => page.evaluate(() => document.fullscreenElement === null)).toBe(true);
    await expect(page.getByRole('button', { name: 'Ampliar el juego' })).toHaveAttribute('aria-pressed', 'false');
  } else {
    // Headless without a usable Fullscreen API: the control must not fake success.
    await expect(page.getByRole('button', { name: 'Ampliar el juego' })).toHaveAttribute('aria-pressed', 'false');
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('mobile menu, anchors and escape work without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const menu = page.locator('.menu-button');
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await page.locator('#navigation').getByRole('link', { name: 'Equipo', exact: true }).click();
  await expect(page).toHaveURL(/\/equipo$/);
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await menu.click();
  await page.locator('#navigation a').first().focus();
  await page.keyboard.press('Escape');
  await expect(menu).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('reduced motion preserves visible content, local fonts and keyboard skip link', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Saltar al contenido' })).toBeFocused();
  await page.evaluate(() => document.fonts.ready);
  expect(await page.locator('body').evaluate(element => getComputedStyle(element).fontFamily)).toMatch(/montserrat/i);
  expect(await page.locator('h1').evaluate(element => getComputedStyle(element).animationName)).toBe('none');
  for (const section of await page.locator('main > section').all()) {
    const headingId = await section.getAttribute('aria-labelledby');
    await expect(page.locator(`#${headingId}`)).toBeVisible();
  }
});
