import { test, expect } from '@playwright/test';

test('reading and chronology carry real content with explicit pending states', async ({ page }) => {
  await page.goto('/lectura');
  await expect(page.locator('.article-index a')).toHaveCount(3);
  await expect(page.locator('article h3')).toHaveText(['El punto de partida', 'Qué busca el proyecto', 'Lo que falta por incorporar']);
  await expect(page.locator('#lectura')).toContainText('Autoría y fecha pendientes');
  await expect(page.locator('#lectura')).not.toContainText('Lorem Ipsum');

  await page.goto('/cronologia');
  await expect(page.locator('.demo-timeline-item')).toHaveCount(5);
  await expect(page.locator('#cronologia')).toContainText('No es una secuencia de hechos verificados');
  await expect(page.locator('#cronologia')).toContainText('Fechas y fuentes pendientes');
  await expect(page.locator('#cronologia')).not.toContainText('Lorem Ipsum');
});
