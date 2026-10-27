import { test, expect } from '@playwright/test';

test('the editorial shell has eight sections, all formats and nine clearly fictional profiles', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect(page.locator('main > section')).toHaveCount(8);
  await expect(page.locator('h1')).toHaveText('Reservas en rojo');
  await expect(page.locator('#formatos a')).toHaveCount(7);
  expect(await page.locator('body').innerText()).not.toMatch(/[\u2013\u2014]/);
  await page.goto('/equipo');
  await expect(page.locator('.profile')).toHaveCount(9);
  await expect(page.locator('.profile')).toContainText(Array(9).fill('Perfil ficticio'));
  await expect(page.locator('audio')).toHaveCount(0);
  await page.goto('/cronologia');
  await expect(page.locator('.demo-timeline-item')).toHaveCount(5);
  await page.goto('/lectura');
  await expect(page.locator('#lectura')).toContainText('Ficción editorial');
});

test('documentary loads the real privacy-enhanced embed only on request', async ({ page }) => {
  await page.goto('/reportaje');
  await expect(page.locator('.cinema iframe')).toHaveCount(0);
  await page.getByRole('button', { name: 'Reproducir reportaje' }).click();
  const iframe = page.getByTitle('Reportaje audiovisual: Reservas en rojo');
  await expect(iframe).toHaveAttribute('src', /youtube-nocookie\.com\/embed\/w7axbt3LLbg\?/);
  const source = new URL((await iframe.getAttribute('src'))!);
  expect(source.searchParams.get('autoplay')).toBe('0');
  expect(source.searchParams.get('controls')).toBe('0');
  expect(source.searchParams.get('enablejsapi')).toBe('1');
  expect(source.searchParams.get('origin')).toBe(new URL(page.url()).origin);
  await expect(iframe).toHaveAttribute('allowfullscreen', '');
  const box = await iframe.boundingBox();
  expect(box!.width / box!.height).toBeCloseTo(16 / 9, 1);
});

test('comic demo is labeled fictional and restores keyboard focus', async ({ page }) => {
  await page.goto('/comic');
  await page.getByRole('button', { name: 'Explorar cómic' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog')).toContainText('ficticio');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Explorar cómic' })).toBeFocused();
});

test('quiz provides feedback, prevents double scoring, progresses, reports and resets', async ({ page }) => {
  await page.goto('/participa');
  const quiz = page.locator('.quiz');
  for (const [index, answer] of ['Piura', 'El acceso a la sangre en emergencias', 'Fuentes y evidencia verificables'].entries()) {
    await expect(quiz).toContainText(`Pregunta ${index + 1} de 3`);
    await quiz.getByRole('button', { name: answer, exact: true }).click();
    await expect(quiz).toContainText('Respuesta correcta.');
    await expect(quiz.locator('.answer:disabled')).toHaveCount(3);
    await quiz.getByRole('button', { name: index === 2 ? 'Ver resultado' : 'Siguiente pregunta' }).click();
  }
  await expect(quiz.locator('.score')).toHaveText('3 de 3');
  await quiz.getByRole('button', { name: 'Reiniciar cuestionario' }).click();
  await expect(quiz).toContainText('Pregunta 1 de 3');
  await quiz.getByRole('button', { name: 'Lima', exact: true }).click();
  await expect(quiz).toContainText('Revisemos la respuesta.');
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
