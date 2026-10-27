// Explicitly test ordinary motion, while preserving the inspector's separate
// reduced-motion pass. This never changes the visitor's OS preference.
import { homedir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const skillRoot = process.env.TASTE_SKILL_ROOT || join(homedir(), '.agents/skills/design-taste-frontend');
const { Browser } = await import(pathToFileURL(join(skillRoot, 'scripts/lib/cdp.mjs')).href);

const newPage = Browser.prototype.newPage;
Browser.prototype.newPage = async function (options = {}) {
  const page = await newPage.call(this, options);
  await page.send('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-motion', value: options.reducedMotion ? 'reduce' : 'no-preference' }],
  });
  return page;
};
await import(pathToFileURL(join(skillRoot, 'scripts/inspect.mjs')).href);
