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

test('the portal comic card shows the real cover without an embedded reader trigger', async ({ page }) => {
  await page.goto('/');
  const card = page.locator('#comic .portal-link');
  await expect(card).toHaveRole('link');
  const cover = card.locator('.comic-cover');
  await expect(cover.locator('img')).toHaveCount(1);
  const source = new URL((await cover.locator('img').getAttribute('src'))!, page.url());
  expect(source.searchParams.get('url') ?? source.pathname).toContain('/comic/los-vampiros/01.webp');
  await expect(cover.locator('figcaption')).toContainText('10 páginas');
  await expect(card.getByRole('button')).toHaveCount(0);
  await expect(card.locator('svg[aria-label*="Ilustración ficticia"]')).toHaveCount(0);
});

test('every published format is a real deep link with its own content', async ({ page }) => {
  const titles: Record<string, string> = {
    reportaje: 'Reportaje audiovisual', comic: 'Cómic periodístico',
    participa: 'Experiencia periodística gamificada', cronologia: 'Cronología', equipo: 'Sobre nosotros',
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

test('logo uses transparent WebP without redrawing the artwork', async ({ page }) => {
  await page.goto('/');
  const logo = page.locator('.brand img');
  await expect(logo).toHaveAttribute('src', /logo-transparent\.webp/);
  const alpha = await page.evaluate(async () => {
    const image = new Image();
    image.src = '/media/logo-transparent.webp';
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

test('all raster content uses working WebP sources on every route', async ({ page, request }) => {
  const sources = new Set<string>();
  // The 404 page has no raster images by design, so locked routes are not listed here.
  for (const route of ['/', '/reportaje', '/comic', '/participa', '/cronologia', '/equipo']) {
    await page.goto(route);
    const images = await page.locator('img').evaluateAll(elements => elements.map(image => image.getAttribute('src')!));
    expect(images.length).toBeGreaterThan(0);
    for (const src of images) {
      const url = new URL(src, page.url());
      const source = url.searchParams.get('url') || url.pathname;
      expect(source).toMatch(/\.webp$/);
      sources.add(source);
    }
  }
  for (const source of sources) {
    const response = await request.get(source);
    expect(response.status(), source).toBe(200);
    expect(response.headers()['content-type'], source).toContain('image/webp');
    const bytes = await response.body();
    expect(bytes.subarray(0, 4).toString()).toBe('RIFF');
    expect(bytes.subarray(8, 12).toString()).toBe('WEBP');
  }
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

test('back to top scrolls smoothly on every activation and across routes', async ({ page }) => {
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
  await page.goto('/comic');
  await page.getByRole('link', { name: 'Volver al inicio ↑', exact: true }).click();
  await expect(page).toHaveURL(/\/#inicio$/);
  await expect(page.locator('h1')).toHaveText('Reservas en rojo');
});

test('motion is choreographed and the home portal reacts', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const portal = page.locator('.portal-link').first();
  await portal.scrollIntoViewIfNeeded();
  await portal.hover();
  await expect.poll(() => portal.locator('.portal-arrow').evaluate(element => getComputedStyle(element).transform)).not.toBe('none');
  await page.goto('/participa');
  await expect(page.getByRole('button', { name: /animaciones/i })).toHaveCount(0);
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'enabled');
  await expect(page.locator('h1')).toBeVisible();
});
