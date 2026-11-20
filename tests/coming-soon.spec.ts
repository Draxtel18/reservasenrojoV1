import { test, expect } from '@playwright/test';

// Formats whose content is still mocked. They must be unreachable from every
// navigation surface and must answer with the 404 page, never with demo data.
const locked = ['/podcast', '/lectura'];
const published = ['/reportaje', '/comic', '/participa', '/cronologia', '/equipo'];

test('locked formats answer with the not-found page instead of mocked content', async ({ page }) => {
  for (const route of locked) {
    const response = await page.goto(route);
    expect(response?.status(), route).toBe(404);
    await expect(page.locator('main h1')).toHaveText('Página no encontrada');
    await expect(page.locator('main')).not.toContainText('Lorem Ipsum');
    await expect(page.locator('#contenido')).toHaveCount(1);
    await expect(page.getByRole('link', { name: 'Volver a la portada' }).first()).toHaveAttribute('href', '/');
  }
});

test('the cover keeps locked cards visible without an entry point', async ({ page }) => {
  await page.goto('/');
  for (const [selector, label] of [['.portal-podcast', 'Podcast'], ['.portal-lectura', 'Reportaje escrito']] as const) {
    const portal = page.locator(selector);
    await expect(portal.locator('a')).toHaveCount(0);
    await expect(portal.getByText('Próximamente')).toBeVisible();
    await expect(portal).toContainText(label === 'Podcast' ? 'Escuchar para entender' : 'Detrás de la urgencia');
  }
  await expect(page.locator('.portal-reportaje a.portal-link')).toHaveAttribute('href', '/reportaje');
  await expect(page.locator('#formatos a[href="/podcast"], #formatos a[href="/lectura"]')).toHaveCount(0);
  await expect(page.locator('body')).not.toContainText('Lorem Ipsum');
});

test('no navigation surface links to a locked format', async ({ page }) => {
  for (const route of ['/', ...published]) {
    await page.goto(route);
    await expect(page.locator('a[href="/podcast"], a[href="/lectura"]'), route).toHaveCount(0);
  }
  await page.goto('/cronologia');
  await expect(page.locator('.chapter-navigation a').last()).toHaveAttribute('href', /^\/(reportaje|comic|participa|equipo)$/);
});

test('published formats still resolve with their own content', async ({ page }) => {
  const titles: Record<string, string> = {
    '/reportaje': 'Reportaje audiovisual', '/comic': 'Cómic periodístico',
    '/participa': 'Experiencia periodística gamificada', '/cronologia': 'Cronología', '/equipo': 'Sobre nosotros',
  };
  for (const [route, title] of Object.entries(titles)) {
    const response = await page.goto(route);
    expect(response?.status(), route).toBe(200);
    await expect(page.locator('main h1')).toHaveText(title);
  }
  expect((await page.goto('/seccion-inexistente'))?.status()).toBe(404);
});
