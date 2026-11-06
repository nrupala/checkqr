// CheckQR smoke test — loads the real page script from index.html and
// exercises its core behaviour: per-type payload formatting, the canvas
// pattern generator (deterministic per payload), and history handling.
// Run: node tests/smoke.test.js   (no dependencies; Node 18+)
'use strict';
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

let passed = 0;
function ok(name, cond) {
  assert.ok(cond, name);
  passed += 1;
  console.log('ok -', name);
}

// --- (a) Page structure: core UI elements and logic hooks exist ---
for (const id of ['qrType', 'qrData', 'qrSize', 'qrcode', 'qrHistory',
  'batchData', 'batchResults']) {
  ok(`page has #${id}`, html.includes(`id="${id}"`));
}
for (const fn of ['generateQR', 'downloadQR', 'updateQrType', 'batchGenerate',
  'clearHistory', 'showTab']) {
  ok(`page wires ${fn}()`, html.includes(`${fn}(`));
}
ok('page declares a version', /<meta name="version" content="\d+\.\d+\.\d+">/.test(html));
for (const t of ['url', 'text', 'vcard', 'wifi', 'email', 'credential']) {
  ok(`type option "${t}" exists`, html.includes(`value="${t}"`));
}

// --- (b) Load the page's own inline script with minimal DOM stubs ---
const store = new Map();
const localStorageStub = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};
function makeCanvas() {
  const canvas = {
    width: 0, height: 0, fills: [],
    getContext() {
      return {
        fillStyle: '',
        fillRect: (x, y, w, h) => canvas.fills.push([x, y, w, h]),
      };
    },
    toDataURL() { return 'data:image/png;base64,STUB'; },
  };
  return canvas;
}
const elements = new Map();
function element(id) {
  if (!elements.has(id)) {
    elements.set(id, {
      id, value: '', textContent: '', innerHTML: '', placeholder: '',
      children: [],
      classList: { add() {}, remove() {} },
      appendChild(child) { this.children.push(child); },
    });
  }
  return elements.get(id);
}
const alerts = [];
const context = {
  console,
  btoa: (s) => Buffer.from(s, 'binary').toString('base64'),
  localStorage: localStorageStub,
  document: {
    getElementById: (id) => element(id),
    querySelectorAll: () => [],
    querySelector: (sel) => {
      if (sel === '#qrcode canvas') {
        const kids = element('qrcode').children;
        return kids.length ? kids[kids.length - 1] : null;
      }
      return null;
    },
    createElement: (tag) => (tag === 'canvas' ? makeCanvas() : { click() {}, style: {} }),
  },
  alert: (msg) => alerts.push(String(msg)),
};
vm.createContext(context);
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
assert.ok(scriptMatch, 'index.html carries an inline script');
vm.runInContext(scriptMatch[1], context);
const run = (expr) => vm.runInContext(expr, context);

// --- (c) The pattern generator is deterministic and sized as requested ---
run("generateQRCode('https://example.com', 200)");
const canvas1 = element('qrcode').children[element('qrcode').children.length - 1];
ok('generator appends a canvas to #qrcode', !!canvas1);
ok('canvas is the requested size', canvas1.width === 200 && canvas1.height === 200);
ok('generator paints modules (finder + data)', canvas1.fills.length > 50);
const fillsA = JSON.stringify(canvas1.fills);
run("generateQRCode('https://example.com', 200)");
const canvas2 = element('qrcode').children[element('qrcode').children.length - 1];
ok('same payload produces the identical pattern', JSON.stringify(canvas2.fills) === fillsA);
run("generateQRCode('https://example.org/different', 200)");
const canvas3 = element('qrcode').children[element('qrcode').children.length - 1];
ok('different payload produces a different pattern', JSON.stringify(canvas3.fills) !== fillsA);
run("generateQRCode('x', 120)");
const canvas4 = element('qrcode').children[element('qrcode').children.length - 1];
ok('size parameter is honoured', canvas4.width === 120 && canvas4.height === 120);

// --- (d) generateQR formats the payload per type and records history ---
element('qrType').value = 'url';
element('qrData').value = 'example.com/page';
element('qrSize').value = '200';
run('generateQR()');
let hist = run('history');
ok('one history entry after generate', hist.length === 1);
ok('URL payload gains the https:// scheme', hist[0].data === 'https://example.com/page');
ok('history entry records type and size', hist[0].type === 'url' && hist[0].size === 200);
ok('history persisted to localStorage',
  JSON.parse(store.get('checkqr_history')).length === 1);

element('qrType').value = 'url';
element('qrData').value = 'https://already.example/x';
run('generateQR()');
hist = run('history');
ok('an https:// URL is left unchanged', hist[0].data === 'https://already.example/x');
ok('newest entry is first in history', hist.length === 2);

element('qrType').value = 'credential';
element('qrData').value = '{"id":"CA-2024-001","name":"AWS Cert"}';
run('generateQR()');
hist = run('history');
const expectedToken = Buffer.from('{"id":"CA-2024-001","name":"AWS Cert"}', 'binary')
  .toString('base64').substring(0, 20);
ok('credential payload becomes a checkinfo.me verify URL',
  hist[0].data === `https://checkinfo.me/verify?t=${expectedToken}`);

element('qrType').value = 'text';
element('qrData').value = '   ';
run('generateQR()');
ok('empty input is rejected with an alert', alerts.some((a) => a.includes('Enter data')));
ok('rejected input adds no history entry', run('history').length === 3);

// --- (e) Type switch updates the input placeholder ---
element('qrType').value = 'wifi';
run('updateQrType()');
ok('wifi placeholder shows the WIFI: payload shape',
  element('qrData').placeholder.startsWith('WIFI:S:'));
element('qrType').value = 'vcard';
run('updateQrType()');
ok('vcard placeholder shows a VCARD payload',
  element('qrData').placeholder.startsWith('BEGIN:VCARD'));

// --- (f) regen restores a history entry into the form; clear empties it ---
run('regen(0)');
ok('regen restores the entry payload into the form',
  element('qrData').value === run('history')[0].data);
run('clearHistory()');
ok('clearHistory empties the history', run('history').length === 0);
ok('clearHistory persists the empty history',
  JSON.parse(store.get('checkqr_history')).length === 0);
ok('empty history renders its placeholder text',
  element('qrHistory').innerHTML === 'No history');

// --- (g) Batch mode renders one tile per non-empty line ---
element('batchData').value = 'https://a.example/1\n\nhttps://a.example/2\n';
run('batchGenerate()');
const batchHtml = element('batchResults').innerHTML;
ok('batch renders a tile per line', (batchHtml.match(/<img /g) || []).length === 2);

// --- (h) handshake.js: register / send / receive round-trip ---
global.localStorage = localStorageStub;
const Handshake = require(path.join(root, 'handshake.js'));
const a = new Handshake();
a.register('checkqr', { version: '1.0.1', capabilities: ['generate'] });
ok('handshake send to a named peer succeeds',
  a.send({ name: 'checkverify' }, { action: 'verify-url', data: { url: 'https://example.com' } }) === true);
const b = new Handshake();
b.register('checkverify', { version: '1.0.1', capabilities: ['verify'] });
const inbox = b.receive();
ok('handshake delivers the queued message to its addressee',
  inbox.length === 1 && inbox[0].message.action === 'verify-url' && inbox[0].from === 'checkqr');

console.log(`\nPASS — ${passed} assertions`);
