import { test, expect } from '@playwright/test';

test('comic demo can be read, navigated and closed with focus restored', async ({ page }) => {
  await page.goto('/comic');
  await page.getByRole('button', { name: 'Explorar cómic', exact: true }).click();
  const reader = page.getByRole('dialog');
  await expect(reader).toContainText('ficticio');
  await expect(reader.getByText('Página 1 de 3', { exact: true })).toBeVisible();
  await reader.getByRole('button', { name: 'Página siguiente', exact: true }).click();
  await expect(reader.getByText('Página 2 de 3', { exact: true })).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await expect(reader.getByText('Página 3 de 3', { exact: true })).toBeVisible();
  await expect(reader.getByRole('button', { name: 'Página siguiente', exact: true })).toHaveCount(0);
  await reader.getByRole('button', { name: 'Cerrar cómic', exact: true }).click();
  await expect(reader).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Explorar cómic', exact: true })).toBeFocused();
});

test('podcast demo has real playable audio and a labeled transcript', async ({ page }) => {
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

test('editorial demo fills chronology article and exactly nine fictional profiles', async ({ page }) => {
  await page.goto('/cronologia');
  await expect(page.locator('#cronologia')).toContainText('ficticio');
  await expect(page.locator('.demo-timeline-item')).toHaveCount(5);
  await page.goto('/lectura');
  await expect(page.locator('article')).toContainText('ficticio');
  expect((await page.locator('article').innerText()).split(/\s+/).length).toBeGreaterThan(300);
  await page.goto('/equipo');
  await expect(page.locator('.profile')).toHaveCount(9);
  await expect(page.locator('#equipo')).toContainText('ficticios');
  await expect(page.locator('.profile-name')).not.toContainText(Array(9).fill('Nombre por confirmar'));
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

test('comic cover typography keeps readable contrast and a real display title', async ({ page }) => {
  await page.goto('/comic');
  const cover = page.locator('.comic-cover');
  await expect.poll(() => cover.evaluate(element => getComputedStyle(element).color)).toBe('rgb(242, 242, 242)');
  const title = cover.getByText('La espera', { exact: true });
  expect(await title.evaluate(element => Number.parseFloat(getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(30);
});
