import { test, expect, type Locator } from '@playwright/test';

async function clickControl(control: Locator) {
  await control.scrollIntoViewIfNeeded();
  // Synchronize iframe hit-testing after browser-driven scrolling, not a fixed delay.
  await control.page().evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => resolve())));
  await control.click();
}

const api = `window.__videoCalls=[]; window.YT={Player:class {
  constructor(element, options){this.options=options;this.time=0;this.volume=80;this.muted=false;this.state=2;window.__failVideo=()=>options.events.onError({data:101});
    setTimeout(()=>options.events.onReady({target:this}),0);}
  playVideo(){window.__videoCalls.push('play');this.state=1;this.options.events.onStateChange({data:1});}
  pauseVideo(){window.__videoCalls.push('pause');this.state=2;this.options.events.onStateChange({data:2});}
  getCurrentTime(){return this.time;} getDuration(){return 120;}
  seekTo(time){this.time=time;window.__videoCalls.push('seek:'+time);}
  setVolume(volume){this.volume=volume;window.__videoCalls.push('volume:'+volume);}
  mute(){this.muted=true;window.__videoCalls.push('mute');}
  unMute(){this.muted=false;window.__videoCalls.push('unmute');}
  isMuted(){return this.muted;} getVolume(){return this.volume;}
  destroy(){window.__videoCalls.push('destroy');}
}};window.onYouTubeIframeAPIReady();`;

test('custom video controls operate the official API only after user activation', async ({ page }) => {
  let requests = 0;
  await page.route('https://www.youtube.com/iframe_api', route => { requests++; return route.fulfill({ contentType: 'application/javascript', body: api }); });
  await page.route('https://www.youtube-nocookie.com/**', route => route.fulfill({ contentType: 'text/html', body: '<html><body>Provider fixture</body></html>' }));
  await page.goto('/reportaje');
  expect(requests).toBe(0);
  await expect(page.locator('.cinema iframe')).toHaveCount(0);
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'enabled');
  await clickControl(page.getByRole('button', { name: 'Reproducir reportaje', exact: true }));
  await expect(page.getByRole('button', { name: 'Pausar video', exact: true })).toBeEnabled();
  expect(requests).toBe(1);
  await expect(page.getByText('0:00 / 2:00', { exact: true })).toBeVisible();
  await clickControl(page.getByRole('button', { name: 'Pausar video', exact: true }));
  await clickControl(page.getByRole('button', { name: 'Reproducir video', exact: true }));
  await clickControl(page.getByRole('button', { name: 'Silenciar', exact: true }));
  await clickControl(page.getByRole('button', { name: 'Activar sonido', exact: true }));
  const volume = page.getByRole('slider', { name: 'Volumen', exact: true });
  await volume.focus(); await volume.press('End');
  const seek = page.getByRole('slider', { name: 'Posición del video', exact: true });
  await seek.focus(); await seek.press('End');
  const calls = await page.evaluate(() => (window as Window & { __videoCalls?: string[] }).__videoCalls);
  expect(calls).toEqual(expect.arrayContaining(['play', 'pause', 'mute', 'unmute', 'volume:100', 'seek:120']));
  await clickControl(page.getByRole('button', { name: 'Pantalla completa', exact: true }));
  await expect(page.getByRole('button', { name: 'Salir de pantalla completa', exact: true })).toBeVisible();
  await page.evaluate(() => (window as Window & { __failVideo?: () => void }).__failVideo?.());
  await expect(page.getByRole('button', { name: 'Salir de pantalla completa', exact: true })).toBeEnabled();
  await clickControl(page.getByRole('button', { name: 'Salir de pantalla completa', exact: true }));
  await page.getByRole('link', { name: 'Equipo', exact: true }).first().click();
  await expect(page).toHaveURL(/\/equipo$/);
  expect(await page.evaluate(() => (window as Window & { __videoCalls?: string[] }).__videoCalls)).toContain('destroy');
});

test('blocked player API gives an honest external fallback', async ({ page }) => {
  await page.route('https://www.youtube.com/iframe_api', route => route.abort());
  await page.route('https://www.youtube-nocookie.com/**', route => route.fulfill({ contentType: 'text/html', body: '<html></html>' }));
  await page.goto('/reportaje');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'enabled');
  await clickControl(page.getByRole('button', { name: 'Reproducir reportaje', exact: true }));
  await expect(page.getByRole('status')).toContainText('No se pudo cargar');
  await expect(page.getByRole('link', { name: /Abrir en YouTube/ })).toHaveAttribute('href', 'https://www.youtube.com/watch?v=w7axbt3LLbg');
  await expect(page.getByRole('button', { name: 'Reproducir video', exact: true })).toBeDisabled();
});

test('a slow player does not start automatically after the visitor scrolls away', async ({ page }) => {
  const deferred = api.replace('setTimeout(()=>options.events.onReady({target:this}),0);', 'window.__readyVideo=()=>options.events.onReady({target:this});');
  await page.route('https://www.youtube.com/iframe_api', route => route.fulfill({ contentType: 'application/javascript', body: deferred }));
  await page.route('https://www.youtube-nocookie.com/**', route => route.fulfill({ contentType: 'text/html', body: '<html></html>' }));
  await page.goto('/reportaje');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'enabled');
  await clickControl(page.getByRole('button', { name: 'Reproducir reportaje', exact: true }));
  await expect.poll(() => page.evaluate(() => typeof (window as Window & { __readyVideo?: () => void }).__readyVideo)).toBe('function');
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
  await expect.poll(() => page.locator('.cinema iframe').evaluate(element => element.getBoundingClientRect().bottom)).toBeLessThan(0);
  await page.evaluate(() => (window as Window & { __readyVideo?: () => void }).__readyVideo?.());
  await expect(page.getByRole('button', { name: 'Reproducir video', exact: true })).toBeEnabled();
  expect(await page.evaluate(() => (window as Window & { __videoCalls?: string[] }).__videoCalls)).not.toContain('play');
});
