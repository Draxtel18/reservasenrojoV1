import { test, expect } from '@playwright/test';

test('favicon is served as a real PNG, not an ICO alias', async ({ page, request }) => {
  await page.goto('/');
  const icon = page.locator('link[rel="icon"]');
  await expect(icon).toHaveCount(1);
  await expect(icon).toHaveAttribute('href', '/favicon-mark.png');
  await expect(icon).toHaveAttribute('type', 'image/png');
  const response = await request.get('/favicon-mark.png');
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('image/png');
  expect(Array.from((await response.body()).subarray(0, 8))).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
});

test('favicon mark has transparent background and fills a square icon', async ({ page }) => {
  await page.goto('/');
  const pixels = await page.evaluate(async () => {
    const image = new Image();
    image.src = document.querySelector<HTMLLinkElement>('link[rel="icon"]')!.href;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
    const context = canvas.getContext('2d')!;
    context.drawImage(image, 0, 0);
    const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let transparent = 0, red = 0, minX = canvas.width, maxX = 0, minY = canvas.height, maxY = 0;
    for (let y = 0; y < canvas.height; y++) for (let x = 0; x < canvas.width; x++) {
      const i = (y * canvas.width + x) * 4;
      if (data[i + 3] === 0) transparent++;
      if (data[i + 3] > 200 && data[i] > 110 && data[i + 1] < 70 && data[i + 2] < 90) {
        red++; minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
      }
    }
    return { width: canvas.width, height: canvas.height, corner: data[3], transparent, red, spanX: maxX - minX, spanY: maxY - minY };
  });
  expect(pixels.width).toBe(pixels.height);
  expect(pixels.width).toBe(64);
  expect(pixels.corner).toBe(0);
  expect(pixels.transparent).toBeGreaterThan(500);
  expect(pixels.red).toBeGreaterThan(500);
  expect(pixels.spanX).toBeGreaterThan(25);
  expect(pixels.spanY).toBeGreaterThan(45);
});

test('footer links only the supplied Facebook and TikTok profiles using icons', async ({ page }) => {
  await page.goto('/comic');
  const social = page.getByRole('region', { name: 'Redes sociales' });
  await expect(social.getByRole('link')).toHaveCount(2);
  for (const [name, href] of [
    ['Facebook', 'https://www.facebook.com/reservas.en.rojo/'],
    ['TikTok', 'https://www.tiktok.com/@reserva.en.rojo?_r=1&_t=ZS-9AuDf2ImlkL'],
  ]) {
    const link = social.getByRole('link', { name: `${name} (otra pestaña)`, exact: true });
    await expect(link).toHaveAttribute('href', href);
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', /noopener/);
    await expect(link.locator('svg')).toBeVisible();
  }
  await expect(social).not.toContainText('Próximamente');
  await expect(social.getByRole('link', { name: /Instagram/ })).toHaveCount(0);
});

test('legacy paused preference cannot disable full default motion', async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('reservas-motion', 'reduced'));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'enabled');
  await expect(page.locator('html')).toHaveAttribute('data-motion-style', 'full');
  await expect(page.getByRole('button', { name: /animaciones/i })).toHaveCount(0);
  expect(await page.locator('.hero-photo img').evaluate(element => getComputedStyle(element).animationName)).toBe('photo-drift');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'enabled');
});
