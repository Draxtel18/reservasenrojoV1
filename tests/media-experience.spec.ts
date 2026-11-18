import { test, expect, Page } from '@playwright/test';

const comicKey = 'reservas:progress:v1:comic-la-espera';
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
  for (const name of ['Cerrar lector', 'Página anterior', 'Página siguiente']) {
    const bounds = await dialog.getByRole('button', { name, exact: true }).boundingBox();
    expect(bounds!.y).toBeGreaterThanOrEqual(0);
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(844);
  }
  await page.screenshot({ path: testInfo.outputPath('comic-mobile.png') });
  await swipe(page, -20, -120);
  await expect(dialog).toContainText('Página 1 de 3');
  await swipe(page, -120, 10, 2);
  await expect(dialog).toContainText('Página 1 de 3');
  await dialog.getByRole('button', { name: 'Ampliar viñeta', exact: true }).click();
  await swipe(page, -120, 10);
  await expect(dialog).toContainText('Página 1 de 3');
  await dialog.getByRole('button', { name: 'Ajustar viñeta', exact: true }).click();
  await swipe(page, -120, 10);
  await expect(dialog).toContainText('Página 2 de 3');
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await page.reload();
  await trigger.click();
  await expect(dialog).toContainText('Página 2 de 3');
  await dialog.getByRole('button', { name: 'Volver al inicio', exact: true }).click();
  await expect(dialog).toContainText('Página 1 de 3');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await dialog.getByRole('button', { name: 'Cerrar cómic', exact: true }).click();
  await expect(trigger).toBeFocused();
});

test('comic clamps corrupt progress and survives blocked storage', async ({ page }) => {
  await page.goto('/comic');
  await page.evaluate(key => localStorage.setItem(key, JSON.stringify({ position: 9999.9 })), comicKey);
  await page.getByRole('button', { name: 'Explorar cómic', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('Página 3 de 3');
  await page.keyboard.press('Escape');
  await page.evaluate(key => localStorage.setItem(key, '{broken'), comicKey);
  await page.getByRole('button', { name: 'Explorar cómic', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('Página 1 de 3');
  await page.keyboard.press('Escape');
  await page.evaluate(() => { Storage.prototype.getItem = () => { throw new Error('blocked'); }; Storage.prototype.setItem = () => { throw new Error('blocked'); }; });
  await page.getByRole('button', { name: 'Explorar cómic', exact: true }).click();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('dialog')).toContainText('Página 2 de 3');
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('comic story remains readable', async ({ page }) => {
    await page.goto('/comic');
    const story = page.getByRole('region', { name: 'Historia del cómic sin JavaScript' });
    await expect(story.getByRole('heading', { level: 3 })).toHaveText(['La sala de espera', 'Las preguntas', 'Una red de apoyo']);
  });
});
