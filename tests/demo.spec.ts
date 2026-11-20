import { test, expect } from '@playwright/test';

test('comic demo can be read, navigated and closed with focus restored', async ({ page }) => {
  await page.goto('/comic');
  const trigger = page.getByRole('button', { name: 'Explorar cómic', exact: true });
  await trigger.click();
  const reader = page.getByRole('dialog');
  await expect(reader.getByRole('heading', { name: 'Los vampiros', exact: true })).toBeVisible();
  await expect(reader.getByText('Página 1 de 10', { exact: true })).toBeVisible();
  const previous = reader.getByRole('button', { name: 'Página anterior', exact: true });
  await expect(previous).toBeDisabled();
  await reader.getByRole('button', { name: 'Página siguiente', exact: true }).click();
  await expect(reader.getByText('Página 2 de 10', { exact: true })).toBeVisible();
  await expect(previous).toBeEnabled();
  await page.keyboard.press('ArrowRight');
  await expect(reader.getByText('Página 3 de 10', { exact: true })).toBeVisible();
  await page.keyboard.press('End');
  await expect(reader.getByText('Página 10 de 10', { exact: true })).toBeVisible();
  await reader.getByRole('button', { name: 'Cerrar cómic', exact: true }).click();
  await expect(reader).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

// Pending: /podcast is gated by comingSoonFormats, so the demo audio cannot be reached.
// Restore this coverage by deleting the format from comingSoonFormats, not by rewriting the test.
test.fixme('podcast demo has real playable audio and a labeled transcript', async ({ page }) => {
  await page.goto('/podcast');
  await expect(page.locator('#podcast')).toContainText('sintética');
  const audio = page.locator('audio');
  await expect(audio).toHaveCount(1);
  await expect(audio).not.toHaveAttribute('autoplay');
  await expect.poll(() => audio.evaluate(element => (element as HTMLAudioElement).duration)).toBeGreaterThan(15);
  await audio.evaluate(async element => { const player = element as HTMLAudioElement; player.muted = true; await player.play(); });
  await expect.poll(() => audio.evaluate(element => (element as HTMLAudioElement).currentTime)).toBeGreaterThan(.1);
  await audio.evaluate(element => (element as HTMLAudioElement).pause());
  await expect(page.getByText('Transcripción', { exact: true })).toBeVisible();
});

test('photo captions sit outside the image clipping frame with breathing room', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const figure = page.locator('.portal-reportaje .portal-media');
  await expect(figure.locator('.photo-frame img')).toHaveCount(1);
  await figure.scrollIntoViewIfNeeded();
  const gap = await figure.evaluate(element => element.querySelector('figcaption')!.getBoundingClientRect().top
    - element.querySelector('.photo-frame')!.getBoundingClientRect().bottom);
  expect(gap).toBeGreaterThanOrEqual(15);
});

test('comic cover is the real first page artwork instead of a demo placeholder', async ({ page }) => {
  await page.goto('/comic');
  const cover = page.locator('.comic-cover');
  const image = cover.locator('img');
  await expect(image).toHaveCount(1);
  const source = new URL((await image.getAttribute('src'))!, page.url());
  expect(source.searchParams.get('url') ?? source.pathname).toContain('/comic/los-vampiros/01.webp');
  await expect(image).toHaveAttribute('alt', /^Portada del cómic/);
  const caption = cover.locator('figcaption');
  await expect(caption).toContainText('Cómic periodístico');
  await expect(caption).toContainText('10 páginas');
  await expect(page.getByText('La espera')).toHaveCount(0);
  await expect(page.locator('svg[aria-label*="Ilustración ficticia"]')).toHaveCount(0);
});
