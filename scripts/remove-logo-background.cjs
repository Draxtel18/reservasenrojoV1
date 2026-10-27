// Deterministic extraction explicitly authorized by the owner. No generated pixels.
const sharp = require('sharp');
const assert = require('node:assert/strict');

async function main() {
  const { data, info } = await sharp('public/media/logo.jpeg').ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const original = Buffer.from(data);
  const { width, height } = info;
  const count = width * height;
  const background = new Uint8Array(count);
  const queue = new Int32Array(count);
  let head = 0, tail = 0;
  function white(pixel) {
    const i = pixel * 4;
    const min = Math.min(data[i], data[i + 1], data[i + 2]);
    const max = Math.max(data[i], data[i + 1], data[i + 2]);
    return min >= 235 && max - min < 22;
  }
  function add(pixel) {
    if (!background[pixel] && white(pixel)) {
      background[pixel] = 1;
      queue[tail++] = pixel;
    }
  }
  // Exterior-connected paper only; retain enclosed highlights inside the bag.
  for (let x = 0; x < width; x++) { add(x); add((height - 1) * width + x); }
  for (let y = 0; y < height; y++) { add(y * width); add(y * width + width - 1); }
  // Letter counters are paper too, but disconnected from the exterior.
  for (let y = 260; y < 660; y++) for (let x = 390; x < width; x++) {
    // The drop's enclosed white reflection is artwork, not a letter counter.
    if (!(x >= 960 && x <= 1040 && y >= 500 && y <= 630)) add(y * width + x);
  }
  while (head < tail) {
    const p = queue[head++];
    const x = p % width;
    if (x > 0) add(p - 1);
    if (x < width - 1) add(p + 1);
    if (p >= width) add(p - width);
    if (p < count - width) add(p + width);
  }
  for (let p = 0; p < count; p++) if (background[p]) data[p * 4 + 3] = 0;
  for (let p = width; p < count - width; p++) {
    if (background[p] || p % width === 0 || p % width === width - 1) continue;
    if (![p - 1, p + 1, p - width, p + width].some(neighbor => background[neighbor])) continue;
    const i = p * 4;
    const min = Math.min(data[i], data[i + 1], data[i + 2]);
    // Fade white matte contamination at the boundary; never recolor the ink.
    if (min > 100) data[i + 3] = Math.min(255, Math.round((255 - min) * 1.5));
  }
  // Leave all retained RGB samples and their positions exactly unchanged.
  let retained = 0;
  for (let i = 0; i < data.length; i += 4) {
    assert.deepEqual(data.subarray(i, i + 3), original.subarray(i, i + 3));
    if (data[i + 3]) retained++;
  }
  assert(retained > 100000 && retained < count / 2);
  assert.equal(data[3], 0);
  assert.equal(data[(575 * width + 985) * 4 + 3], 255, 'Keep the drop reflection');
  assert.equal(data[(330 * width + 460) * 4 + 3], 0, 'Remove paper inside the R counter');
  await sharp(data, { raw: { width, height, channels: 4 } }).png().toFile('public/media/logo-transparent.png');
  for (const [name, color] of [['light', '#f2f2f2'], ['dark', '#0d0d0d']]) {
    await sharp({ create: { width, height, channels: 3, background: color } })
      .composite([{ input: 'public/media/logo-transparent.png' }])
      .png().toFile(`.taste-skill/logo-${name}-proof.png`);
  }
  console.log(JSON.stringify({ width, height, retained, transparent: count - retained, retainedRGB: 'unchanged' }));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
