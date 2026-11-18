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
  getOption(module, option){
    if (module !== 'captions') return null;
    if (option === 'tracklist') return Array.isArray(window.__captionTracks) ? window.__captionTracks : [{languageCode:'es'}];
    if (option === 'track') return window.__captionCurrent || {};
    return null;
  }
  setOption(module, option, value){ window.__videoCalls.push('caption:set:'+JSON.stringify(value)); }
  loadModule(module){ window.__videoCalls.push('caption:load:'+module); }
  unloadModule(module){ window.__videoCalls.push('caption:unload:'+module); }
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
  await expect(page.getByRole('link', { name: /Abrir en YouTube/ })).toHaveAttribute('href', 'https://www.youtube.com/watch?v=-KErtns1Jv0');
  // The page must offer exactly one external YouTube link: the one the error status names.
  await expect(page.locator('a[href^="https://www.youtube.com/watch"]')).toHaveCount(1);
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

test('video resumes locally only after activation and can restart without affecting other media', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('reservas:progress:v1:video--KErtns1Jv0', JSON.stringify({ position: 38 }));
    localStorage.setItem('reservas:progress:v1:comic-la-espera', JSON.stringify({ position: 2 }));
  });
  let requests = 0;
  await page.route('https://www.youtube.com/iframe_api', route => { requests++; return route.fulfill({ contentType: 'application/javascript', body: api }); });
  await page.route('https://www.youtube-nocookie.com/**', route => route.fulfill({ contentType: 'text/html', body: '<html>Provider fixture</html>' }));
  await page.goto('/reportaje');
  await expect(page.getByText('Punto guardado: 0:38', { exact: true })).toBeVisible();
  expect(requests).toBe(0);
  await clickControl(page.getByRole('button', { name: 'Reproducir reportaje', exact: true }));
  await expect(page.getByText('0:38 / 2:00', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => (window as Window & { __videoCalls?: string[] }).__videoCalls)).toContain('seek:38');
  const seek = page.getByRole('slider', { name: 'Posición del video', exact: true });
  await seek.focus(); await seek.press('ArrowRight');
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('reservas:progress:v1:video--KErtns1Jv0')!).position)).toBe(39);
  await clickControl(page.getByRole('button', { name: 'Reiniciar video desde el comienzo', exact: true }));
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('reservas:progress:v1:video--KErtns1Jv0')!).position)).toBe(0);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('reservas:progress:v1:comic-la-espera')!).position)).toBe(2);
});

test('video ignores invalid saved positions and handles blocked storage without invented transcript', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('reservas:progress:v1:video--KErtns1Jv0', JSON.stringify({ position: 99999 })));
  await page.route('https://www.youtube.com/iframe_api', route => route.fulfill({ contentType: 'application/javascript', body: api }));
  await page.route('https://www.youtube-nocookie.com/**', route => route.fulfill({ contentType: 'text/html', body: '<html>Provider fixture</html>' }));
  await page.goto('/reportaje');
  await expect(page.getByText('Capítulos y transcripción', { exact: true })).toBeVisible();
  await expect(page.getByText(/Pendientes de incorporar y revisar/)).toBeVisible();
  await clickControl(page.getByRole('button', { name: 'Reproducir reportaje', exact: true }));
  await expect(page.getByText('0:00 / 2:00', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => (window as Window & { __videoCalls?: string[] }).__videoCalls)).not.toContain('seek:99999');
  await page.evaluate(() => {
    Storage.prototype.getItem = () => { throw new DOMException('Blocked', 'SecurityError'); };
    Storage.prototype.setItem = () => { throw new DOMException('Blocked', 'SecurityError'); };
  });
  await page.getByRole('slider', { name: 'Posición del video', exact: true }).focus();
  await page.getByRole('slider', { name: 'Posición del video', exact: true }).press('ArrowRight');
  await expect(page.getByRole('button', { name: 'Pausar video', exact: true })).toBeEnabled();
  await expect(page.getByText('0:01 / 2:00', { exact: true })).toBeVisible();
});

test('subtitles toggle drives the provider caption module and reports missing tracks', async ({ page }) => {
  await page.route('https://www.youtube.com/iframe_api', route => route.fulfill({ contentType: 'application/javascript', body: api }));
  await page.route('https://www.youtube-nocookie.com/**', route => route.fulfill({ contentType: 'text/html', body: '<html>Provider fixture</html>' }));
  await page.goto('/reportaje');
  await clickControl(page.getByRole('button', { name: 'Reproducir reportaje', exact: true }));
  const captions = page.getByRole('button', { name: 'Activar subtítulos', exact: true });
  await expect(captions).toBeEnabled();
  await clickControl(captions);
  expect(await page.evaluate(() => (window as Window & { __videoCalls?: string[] }).__videoCalls)).toContain('caption:set:{"languageCode":"es"}');
  await expect(page.getByRole('button', { name: 'Desactivar subtítulos', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await clickControl(page.getByRole('button', { name: 'Desactivar subtítulos', exact: true }));
  expect(await page.evaluate(() => (window as Window & { __videoCalls?: string[] }).__videoCalls)).toContain('caption:unload:captions');
  await expect(page.getByRole('button', { name: 'Activar subtítulos', exact: true })).toHaveAttribute('aria-pressed', 'false');

  // An explicit empty tracklist means the provider exposes no captions for this video.
  await page.addInitScript(() => { (window as unknown as { __captionTracks?: unknown }).__captionTracks = []; });
  await page.goto('/reportaje');
  await clickControl(page.getByRole('button', { name: 'Reproducir reportaje', exact: true }));
  await expect(page.getByRole('button', { name: 'Activar subtítulos', exact: true })).toBeEnabled();
  await clickControl(page.getByRole('button', { name: 'Activar subtítulos', exact: true }));
  await expect(page.getByRole('status')).toContainText('no expone pistas de subtítulos');
  await expect(page.getByRole('button', { name: 'Activar subtítulos', exact: true })).toHaveAttribute('aria-pressed', 'false');
  expect(await page.evaluate(() => (window as Window & { __videoCalls?: string[] }).__videoCalls)).not.toContain('caption:set:{"languageCode":"es"}');
});

test('captions already active are detected on ready and can be turned off', async ({ page }) => {
  await page.addInitScript(() => { (window as Window & { __captionCurrent?: unknown }).__captionCurrent = { languageCode: 'es' }; });
  await page.route('https://www.youtube.com/iframe_api', route => route.fulfill({ contentType: 'application/javascript', body: api }));
  await page.route('https://www.youtube-nocookie.com/**', route => route.fulfill({ contentType: 'text/html', body: '<html>Provider fixture</html>' }));
  await page.goto('/reportaje');
  await clickControl(page.getByRole('button', { name: 'Reproducir reportaje', exact: true }));
  // Detection happens asynchronously: provider ready plus one delayed retry.
  await expect(page.getByRole('button', { name: 'Desactivar subtítulos', exact: true })).toHaveAttribute('aria-pressed', 'true', { timeout: 10000 });
  await clickControl(page.getByRole('button', { name: 'Desactivar subtítulos', exact: true }));
  const calls = await page.evaluate(() => (window as Window & { __videoCalls?: string[] }).__videoCalls ?? []);
  expect(calls).toContain('caption:unload:captions');
  // Detecting an already-active track must never re-assert it through the provider.
  expect(calls.filter(call => call.startsWith('caption:set:'))).toEqual([]);
  await expect(page.getByRole('button', { name: 'Activar subtítulos', exact: true })).toHaveAttribute('aria-pressed', 'false');
});

test('a delayed provider seek cannot overwrite the saved video position with zero', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('reservas:progress:v1:video--KErtns1Jv0', JSON.stringify({ position: 38 })));
  const delayedSeek = api.replace('this.time=time;window.__videoCalls.push(\'seek:\'+time);', 'window.__videoCalls.push(\'seek:\'+time);');
  await page.route('https://www.youtube.com/iframe_api', route => route.fulfill({ contentType: 'application/javascript', body: delayedSeek }));
  await page.route('https://www.youtube-nocookie.com/**', route => route.fulfill({ contentType: 'text/html', body: '<html>Provider fixture</html>' }));
  await page.goto('/reportaje');
  await clickControl(page.getByRole('button', { name: 'Reproducir reportaje', exact: true }));
  await expect(page.getByText('0:38 / 2:00', { exact: true })).toBeVisible();
  await clickControl(page.getByRole('button', { name: 'Pausar video', exact: true }));
  await page.getByRole('link', { name: 'Equipo', exact: true }).first().click();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('reservas:progress:v1:video--KErtns1Jv0')!).position)).toBe(38);
});
