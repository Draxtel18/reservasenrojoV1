import { test, expect } from '@playwright/test';

test('the cover leads to independent section pages and back', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Ver reportaje', exact: false }).first()).toHaveAttribute('href', '/reportaje');
  await page.getByRole('link', { name: 'Ver reportaje', exact: false }).first().click();
  await expect(page).toHaveURL(/\/reportaje$/);
  await expect(page.locator('h1')).toHaveText('Reportaje audiovisual');
  await expect(page.locator('.cinema')).toBeVisible();
  await page.reload();
  await expect(page.locator('.cinema')).toBeVisible();
  await page.getByRole('link', { name: 'Volver a la portada', exact: true }).first().click();
  await expect(page).toHaveURL(/\/$/);
});

test('all seven formats are real deep links with their own content', async ({ page }) => {
  const titles: Record<string, string> = {
    reportaje: 'Reportaje audiovisual', comic: 'Cómic periodístico', podcast: 'Podcast',
    participa: 'Gamificación', cronologia: 'Cronología', lectura: 'Reportaje escrito', equipo: 'Sobre nosotros',
  };
  for (const [route, title] of Object.entries(titles)) {
    const response = await page.goto(`/${route}`);
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toHaveText(title);
    await expect(page.getByRole('link', { name: 'Volver a la portada', exact: true }).first()).toBeVisible();
  }
  await expect(page.locator('.profile')).toHaveCount(9);
  const response = await page.goto('/seccion-inexistente');
  expect(response?.status()).toBe(404);
});

test('logo uses a transparent PNG without redrawing the artwork', async ({ page }) => {
  await page.goto('/');
  const logo = page.locator('.brand img');
  await expect(logo).toHaveAttribute('src', /logo-transparent\.png/);
  const alpha = await page.evaluate(async () => {
    const image = new Image();
    image.src = '/media/logo-transparent.png';
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
    const context = canvas.getContext('2d')!;
    context.drawImage(image, 0, 0);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    return { corner: pixels[3], ink: Array.from(pixels).filter((value, index) => index % 4 === 3 && value > 240).length };
  });
  expect(alpha.corner).toBe(0);
  expect(alpha.ink).toBeGreaterThan(1000);
});

test('footer names pending social profiles without fake links', async ({ page }) => {
  await page.goto('/comic');
  const social = page.getByRole('region', { name: 'Redes sociales' });
  await expect(social.getByRole('img', { name: 'Facebook', exact: false })).toBeVisible();
  await expect(social.getByRole('img', { name: 'Instagram', exact: false })).toBeVisible();
  await expect(social).toContainText('Próximamente');
  await expect(social.getByRole('link')).toHaveCount(0);
});

test('back to top repeats even when the home hash already matches', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  for (let attempt = 0; attempt < 3; attempt++) {
    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
    await page.getByRole('link', { name: 'Volver al inicio ↑', exact: true }).click();
    await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(5);
  }
});

test('back to top scrolls smoothly on every activation and respects the footer pause choice', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  for (let attempt = 0; attempt < 3; attempt++) {
    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
    const start = await page.evaluate(() => scrollY);
    expect(start).toBeGreaterThan(500);
    await page.evaluate(() => {
      const samples: number[] = [];
      (window as Window & { scrollSamples?: number[] }).scrollSamples = samples;
      const record = () => {
        samples.push(scrollY);
        if (samples.length < 240 && scrollY > 0) requestAnimationFrame(record);
      };
      document.querySelector('.back-top')!.addEventListener('click', () => requestAnimationFrame(record), { once: true });
    });
    await page.getByRole('link', { name: 'Volver al inicio ↑', exact: true }).click();
    // Sample in animation frames: automation transport can outlast the animation.
    await expect.poll(() => page.evaluate(top =>
      (window as Window & { scrollSamples?: number[] }).scrollSamples?.some(y => y > 0 && y < top), start)).toBe(true);
    await expect.poll(() => page.evaluate(() => scrollY), { timeout: 8000 }).toBeLessThan(5);
  }
  await page.getByRole('button', { name: 'Pausar animaciones', exact: true }).click();
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
  await page.getByRole('link', { name: 'Volver al inicio ↑', exact: true }).click();
  expect(await page.evaluate(() => scrollY)).toBeLessThan(5);
  await page.goto('/comic');
  await page.getByRole('link', { name: 'Volver al inicio ↑', exact: true }).click();
  await expect(page).toHaveURL(/\/#inicio$/);
  await expect(page.locator('h1')).toHaveText('Reservas en rojo');
});

test('motion is choreographed, answers react and the footer can pause all effects', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const portal = page.locator('.portal-link').first();
  await portal.scrollIntoViewIfNeeded();
  await portal.hover();
  await expect.poll(() => portal.locator('.portal-arrow').evaluate(element => getComputedStyle(element).transform)).not.toBe('none');
  await page.goto('/participa');
  await page.getByRole('button', { name: 'Piura', exact: true }).click();
  await expect(page.locator('.quiz-feedback')).toContainText('Respuesta correcta.');
  await page.getByRole('button', { name: 'Pausar animaciones', exact: true }).click();
  await expect.poll(() => page.locator('main').evaluate(element => element.getAnimations({ subtree: true }).filter(animation => animation.playState === 'running').length)).toBe(0);
  await expect(page.locator('h1')).toBeVisible();
});
