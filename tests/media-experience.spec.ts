import { test, expect, Page } from '@playwright/test';

const comicKey = 'reservas:progress:v1:comic-los-vampiros';
const audioKey = 'reservas:progress:v1:podcast-la-espera';
async function swipe(page: Page, dx: number, dy: number, touches = 1) {
  await page.locator('[data-comic-body]').evaluate((element, gesture) => {
    const points = Array.from({ length: gesture.touches }, (_, identifier) => new Touch({ identifier, target: element, clientX: 250, clientY: 200 }));
    element.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, touches: points }));
    element.dispatchEvent(new TouchEvent('touchend', { bubbles: true, touches: [], changedTouches: [new Touch({ identifier: 0, target: element, clientX: 250 + gesture.dx, clientY: 200 + gesture.dy })] }));
  }, { dx, dy, touches });
}

test('mobile comic keeps controls visible, distinguishes gestures and resumes locally', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/comic');
  const trigger = page.getByRole('button', { name: 'Explorar cómic', exact: true });
  await trigger.click();
  const dialog = page.getByRole('dialog');
  const body = page.locator('[data-comic-body]');
  await expect(body).toBeVisible();
  await body.evaluate(element => { element.scrollTop = element.scrollHeight; });
  const active = dialog.locator('[data-thumb][aria-current="page"]');
  await expect(active).toHaveAttribute('aria-label', 'Ir a la página 1');
  for (const control of [
    dialog.getByRole('button', { name: 'Cerrar lector', exact: true }),
    dialog.getByRole('button', { name: 'Página anterior', exact: true }),
    dialog.getByRole('button', { name: 'Página siguiente', exact: true }),
    active,
  ]) {
    await expect.poll(async () => {
      const box = await control.boundingBox();
      return box !== null && box.y >= 0 && box.y + box.height <= 844;
    }).toBe(true);
  }
  await expect(dialog.getByRole('button', { name: 'Ver página completa', exact: true })).toBeHidden();
  await page.screenshot({ path: testInfo.outputPath('comic-mobile.png') });
  await swipe(page, -20, -120);
  await expect(dialog).toContainText('Página 1 de 10');
  await swipe(page, -120, 10, 2);
  await expect(dialog).toContainText('Página 1 de 10');
  await swipe(page, -120, 10);
  await expect(dialog).toContainText('Página 2 de 10');
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await page.reload();
  await trigger.click();
  await expect(dialog).toContainText('Página 2 de 10');
  await dialog.getByRole('button', { name: 'Ir a la página 1', exact: true }).click();
  await expect(dialog).toContainText('Página 1 de 10');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await expect(dialog).toContainText('Página 3 de 10');
  await page.keyboard.press('End');
  await expect(dialog).toContainText('Página 10 de 10');
  await dialog.getByRole('button', { name: 'Cerrar cómic', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test('comic clamps corrupt progress and survives blocked storage', async ({ page }) => {
  await page.goto('/comic');
  await page.evaluate(key => localStorage.setItem(key, JSON.stringify({ position: 9999.9 })), comicKey);
  await page.getByRole('button', { name: 'Explorar cómic', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('Página 10 de 10');
  await page.keyboard.press('Escape');
  await page.evaluate(key => localStorage.setItem(key, '{broken'), comicKey);
  await page.getByRole('button', { name: 'Explorar cómic', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('Página 1 de 10');
  await page.keyboard.press('Escape');
  await page.evaluate(() => { Storage.prototype.getItem = () => { throw new Error('blocked'); }; Storage.prototype.setItem = () => { throw new Error('blocked'); }; });
  await page.getByRole('button', { name: 'Explorar cómic', exact: true }).click();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('dialog')).toContainText('Página 2 de 10');
});

test('custom podcast controls use real WAV events and resume without autoplay', async ({ page }, testInfo) => {
  await page.goto('/podcast');
  const audio = page.locator('audio').first();
  await expect.poll(() => audio.evaluate(e => (e as HTMLAudioElement).duration)).toBeGreaterThan(85);
  await expect.poll(() => audio.evaluate(e => (e as HTMLAudioElement).duration)).toBeLessThan(87);
  expect(await audio.evaluate(e => (e as HTMLAudioElement).paused)).toBe(true);
  await page.getByRole('button', { name: 'Reproducir audio', exact: true }).click();
  await expect.poll(() => audio.evaluate(e => (e as HTMLAudioElement).currentTime)).toBeGreaterThan(.1);
  await page.getByRole('button', { name: 'Pausar audio', exact: true }).click();
  expect(await audio.evaluate(e => (e as HTMLAudioElement).paused)).toBe(true);
  await page.getByLabel('Velocidad del audio').selectOption('1.5');
  expect(await audio.evaluate(e => (e as HTMLAudioElement).playbackRate)).toBe(1.5);
  await page.getByRole('slider', { name: 'Posición del audio', exact: true }).fill('30');
  await page.getByRole('button', { name: 'Avanzar 15 segundos', exact: true }).click();
  await expect.poll(() => audio.evaluate(e => (e as HTMLAudioElement).currentTime)).toBeCloseTo(45, 0);
  await page.getByRole('button', { name: 'Retroceder 15 segundos', exact: true }).click();
  await expect.poll(() => audio.evaluate(e => (e as HTMLAudioElement).currentTime), { timeout: 15000 }).toBeCloseTo(30, 0);
  await page.getByRole('button', { name: 'Silenciar audio', exact: true }).click();
  expect(await audio.evaluate(e => (e as HTMLAudioElement).muted)).toBe(true);
  await page.getByRole('slider', { name: 'Volumen del audio', exact: true }).fill('0.4');
  expect(await audio.evaluate(e => (e as HTMLAudioElement).volume)).toBe(.4);
  await page.reload();
  await expect.poll(() => audio.evaluate(e => (e as HTMLAudioElement).currentTime), { timeout: 15000 }).toBeCloseTo(30, 0);
  expect(await audio.evaluate(e => (e as HTMLAudioElement).paused)).toBe(true);
  await page.getByRole('button', { name: 'Volver al inicio del audio', exact: true }).click();
  await expect.poll(() => audio.evaluate(e => (e as HTMLAudioElement).currentTime)).toBe(0);
  await page.getByRole('button', { name: 'Retroceder 15 segundos', exact: true }).click();
  expect(await audio.evaluate(e => (e as HTMLAudioElement).currentTime)).toBe(0);
  await page.getByText('Transcripción', { exact: true }).click();
  await expect(page.locator('details[open] p')).toHaveCount(5);
  await page.locator('[aria-label="Reproductor de audio"]').screenshot({ path: testInfo.outputPath('podcast-controls.png') });
});

test('audio fixture error and ended events reset honestly without overwriting comic', async ({ page }) => {
  await page.goto('/podcast');
  await page.evaluate(([comic, audio]) => { localStorage.setItem(comic, JSON.stringify({ position: 1 })); localStorage.setItem(audio, JSON.stringify({ position: 999999 })); }, [comicKey, audioKey]);
  await page.reload();
  const audio = page.locator('audio').first();
  await expect.poll(() => audio.evaluate(e => (e as HTMLAudioElement).duration)).toBeGreaterThan(85);
  expect(await audio.evaluate(e => (e as HTMLAudioElement).currentTime)).toBeLessThan(86);
  await audio.evaluate(e => e.dispatchEvent(new Event('ended')));
  await expect.poll(() => page.evaluate(key => JSON.parse(localStorage.getItem(key)!).position, audioKey)).toBe(0);
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).position, comicKey)).toBe(1);
  await audio.evaluate(e => e.dispatchEvent(new Event('error')));
  await expect(page.locator('[aria-label="Reproductor de audio"]').getByRole('alert')).toContainText('No se pudo');
});

test('audio accepts malformed or blocked local storage without blocking playback', async ({ page }) => {
  await page.goto('/podcast');
  await page.evaluate(key => localStorage.setItem(key, '{broken'), audioKey);
  await page.reload();
  const audio = page.locator('audio').first();
  await expect.poll(() => audio.evaluate(e => (e as HTMLAudioElement).duration)).toBeGreaterThan(85);
  expect(await audio.evaluate(e => (e as HTMLAudioElement).currentTime)).toBe(0);
  await page.evaluate(() => { Storage.prototype.getItem = () => { throw new Error('blocked'); }; Storage.prototype.setItem = () => { throw new Error('blocked'); }; });
  await page.getByRole('button', { name: 'Reproducir audio', exact: true }).click();
  await expect.poll(() => audio.evaluate(e => (e as HTMLAudioElement).currentTime)).toBeGreaterThan(.1);
  await page.getByRole('button', { name: 'Pausar audio', exact: true }).click();
});

test('audio rejection fixture and route cleanup do not leave playback behind', async ({ page }) => {
  await page.goto('/podcast');
  const audio = page.locator('audio').first();
  await expect.poll(() => audio.evaluate(e => (e as HTMLAudioElement).duration)).toBeGreaterThan(85);
  await audio.evaluate(e => { (e as HTMLAudioElement).play = () => Promise.reject(new DOMException('Fixture denial', 'NotAllowedError')); });
  await page.getByRole('button', { name: 'Reproducir audio', exact: true }).click();
  await expect(page.locator('[aria-label="Reproductor de audio"]').getByRole('alert')).toContainText('No se pudo reproducir');
  await page.reload();
  await page.getByRole('button', { name: 'Reproducir audio', exact: true }).click();
  await expect.poll(() => audio.evaluate(e => (e as HTMLAudioElement).paused)).toBe(false);
  await audio.evaluate(e => { (window as unknown as { detachedAudio: HTMLAudioElement }).detachedAudio = e as HTMLAudioElement; });
  await page.locator('a[href="/"]').first().click();
  await expect.poll(() => page.evaluate(() => (window as unknown as { detachedAudio: HTMLAudioElement }).detachedAudio.paused)).toBe(true);
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('comic story and native podcast remain accessible', async ({ page }) => {
    await page.goto('/comic');
    const story = page.getByRole('region', { name: 'Cómic sin JavaScript' });
    const pages = story.getByRole('link');
    await expect(pages).toHaveCount(10);
    await expect(pages.first()).toHaveAttribute('href', '/comic/los-vampiros/01.webp');
    await expect(pages.first()).toHaveAccessibleName(/Portada del cómic/);
    await page.goto('/podcast');
    await expect(page.locator('audio')).toHaveAttribute('controls', '');
    await page.getByText('Transcripción', { exact: true }).click();
    await expect(page.locator('details[open] p')).toHaveCount(5);
  });
});
