import { test, expect } from '@playwright/test';

// Structure only. The exact copy and the entry counts belong to the editorial
// data, so asserting them turns every real-data change into a red build.
test('reading and chronology render their content without placeholder text', async ({ page }) => {
  await page.goto('/lectura');
  await expect(page.locator('#lectura')).toBeVisible();
  await expect(page.locator('.article-index a').first()).toBeVisible();
  await expect(page.locator('.demo-article-part').first()).toBeVisible();
  await expect(page.locator('#lectura')).not.toContainText('Lorem Ipsum');

  await page.goto('/cronologia');
  await expect(page.locator('.demo-timeline-item').first()).toBeVisible();
  await expect(page.locator('#cronologia')).not.toContainText('Lorem Ipsum');
});
