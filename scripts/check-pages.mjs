import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { chromium } from '@playwright/test';

// Serve only the generated artifact, under the actual repository path.
// No SPA fallback: missing files must fail exactly as they would on Pages.
const base = '/persona-lab/';
const root = resolve('dist');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json' };
const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    assert.ok(pathname.startsWith(base));
    const file = resolve(root, pathname.slice(base.length) || 'index.html');
    assert.ok(file.startsWith(root + sep));
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
let browser;
try {
  browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => {
    if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
    if (response.url().startsWith(origin) && !new URL(response.url()).pathname.startsWith(base)) {
      errors.push(`Request escaped repository path: ${response.url()}`);
    }
  });
  page.on('requestfailed', request => errors.push(request.url()));
  for (const hash of ['', '#workspace', '#results']) {
    await page.goto(origin + base + hash);
    await page.waitForURL(`**/workshop/mock/index.html${hash}`);
    assert.match(await page.title(), /clickable paper prototype/);
    await page.locator('#preview img').waitFor();
    await page.waitForFunction(() => {
      const image = document.querySelector('#preview img');
      return image?.complete && image.naturalWidth > 0;
    });
    assert.ok((await page.locator('#preview img').getAttribute('src')).includes(hash.slice(1) || 'landing'));
  }
  for (const view of ['Landing', 'Workspace', 'Results']) {
    await page.getByRole('link', { name: view, exact: true }).click();
    await page.waitForFunction(() => {
      const image = document.querySelector('#preview img');
      return image?.complete && image.naturalWidth > 0;
    });
    assert.equal(new URL(page.url()).hash, '#' + view.toLowerCase());
    for (const href of await page.locator('a[href]').evaluateAll(links => links.map(link => link.href))) {
      const url = new URL(href);
      assert.ok(url.pathname.startsWith(base), href);
      assert.equal((await fetch(href)).status, 200, href);
    }
  }
  await page.getByRole('link', { name: 'Back to workspace', exact: true }).click();
  assert.equal(new URL(page.url()).hash, '#workspace');
  assert.deepEqual(errors, []);
  console.log('Pages smoke check passed: root redirect, deep links, three paper images, navigation, and repository paths.');
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
