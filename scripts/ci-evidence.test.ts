import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { JSONReport } from '@playwright/test/reporter';
import { compactResults, sensitiveText, scanCandidate } from './ci-evidence';

// Synthetic canaries only: never reproduce controlled credentials in tests.
const canary = 'synthetic-private+value&42';
const syntheticJwt = ['{"alg":"HS256"}', '{"sub":"synthetic"}']
  .map(value => Buffer.from(value).toString('base64url')).join('.') + '.synthetic-signature';

test('artifact scan rejects credential encodings and authentication material', () => {
  for (const text of [canary, encodeURIComponent(canary), Buffer.from(canary).toString('base64'),
    canary.replaceAll('&', '&amp;'), 'Authorization: Basic synthetic-value',
    'Cookie: session=synthetic-value', 'Set-Cookie: session=synthetic-value',
    '{"access_token":"synthetic-value"}', '{"password":"synthetic-value"}',
    '{"name":"Authorization","value":"synthetic-value"}', '{"cookies":[{"value":"synthetic-value"}]}',
    'Bearer synthetic-value', syntheticJwt]) {
    assert.equal(sensitiveText(text, [canary]), true);
  }
  assert.equal(sensitiveText('{"status":"failed","retry":0}', [canary]), false);
});

test('candidate scan rejects nested secrets and opaque diagnostics; clean text can pass', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'toolshop-evidence-'));
  try {
    assert.equal(scanCandidate(directory, [canary]), 'absent');
    fs.writeFileSync(path.join(directory, 'result.json'), '{"status":"passed"}');
    assert.equal(scanCandidate(directory, [canary]), 'clean');
    fs.mkdirSync(path.join(directory, 'nested'));
    const sensitive = path.join(directory, 'nested', 'error.txt');
    fs.writeFileSync(sensitive, canary);
    assert.equal(scanCandidate(directory, [canary]), 'sensitive-or-uninspectable');
    fs.unlinkSync(sensitive);
    const opaque = path.join(directory, 'trace.zip');
    fs.writeFileSync(opaque, Buffer.from([0x50, 0x4b, 3, 4]));
    assert.equal(scanCandidate(directory, [canary]), 'sensitive-or-uninspectable');
    fs.unlinkSync(opaque);
    fs.writeFileSync(path.join(directory, 'index.html'), '<template id="playwrightReportBase64">opaque</template>');
    assert.equal(scanCandidate(directory, [canary]), 'sensitive-or-uninspectable');
  } finally {
    // mkdtemp creates this exact target inside the OS temp directory.
    assert.equal(path.dirname(path.resolve(directory)), path.resolve(os.tmpdir()));
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('compact failure results preserve outcome/retry and exclude sensitive failure channels', () => {
  const report = {
    config: { workers: 1, metadata: { actualWorkers: 1 }, forbidOnly: true, projects: [{ retries: 0 }] },
    errors: [{ message: canary }],
    stats: { expected: 0, unexpected: 1, flaky: 0, skipped: 0 },
    suites: [{ specs: [{ title: 'Synthetic failure', file: 'api-authorization.spec.ts', tests: [{
      status: 'unexpected', results: [{ status: 'failed', retry: 0, error: { message: canary },
        stdout: [{ text: canary }], stderr: [{ text: canary }],
        steps: [{ title: canary }], attachments: [{ body: canary }] }],
    }] }] }],
  } as unknown as JSONReport;
  const compact = compactResults(report, 1, canary);
  assert.equal(compact.exitCode, 1);
  assert.equal(compact.unexpected, 1);
  assert.equal(compact.globalErrors, 1);
  assert.deepEqual(compact.tests[0].results, [{ status: 'failed', retry: 0 }]);
  assert.equal(JSON.stringify(compact).includes(canary), false);
  assert.equal(sensitiveText(JSON.stringify(compact), [canary]), false);
});
