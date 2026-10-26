import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import dotenv from 'dotenv';
import type { JSONReport, JSONReportSuite } from '@playwright/test/reporter';

const root = path.resolve(__dirname, '..');
const privateDir = path.join(root, '.sut');
const publicDir = path.join(privateDir, 'ci-public');
const rawResults = path.join(privateDir, 'ci-results.json');
const consoleLog = path.join(privateDir, 'ci-console.log');
const compactFile = path.join(privateDir, 'ci-summary.json');

// An allowlist, not a redacted copy of a rich report: never copy errors, steps,
// stdout/stderr, attachments, config/environment, request data or absolute paths.
export function compactResults(report: JSONReport, exitCode: number, log: string) {
  const tests: { title: string; layer: 'API' | 'UI'; outcome: string; results: { status: string; retry: number }[] }[] = [];
  function visit(suites: JSONReportSuite[]) {
    for (const suite of suites) {
      for (const spec of suite.specs) {
        for (const test of spec.tests) {
          tests.push({
            title: spec.title,
            layer: spec.file.endsWith('api-authorization.spec.ts') ? 'API' : 'UI',
            outcome: ['expected', 'unexpected', 'flaky', 'skipped'].includes(test.status) ? test.status : 'unknown',
            results: test.results.map(result => ({
              status: ['passed', 'failed', 'timedOut', 'skipped', 'interrupted'].includes(result.status || '') ? result.status! : 'unknown',
              retry: result.retry,
            })),
          });
        }
      }
      visit(suite.suites || []);
    }
  }
  visit(report.suites);
  return {
    format: 'toolshop-ci-results-v1', exitCode,
    total: tests.length, ui: tests.filter(test => test.layer === 'UI').length,
    api: tests.filter(test => test.layer === 'API').length,
    expected: report.stats.expected, unexpected: report.stats.unexpected,
    flaky: report.stats.flaky, skipped: report.stats.skipped,
    globalErrors: report.errors.length,
    workers: report.config.workers,
    actualWorkers: report.config.metadata.actualWorkers,
    configuredRetries: report.config.projects.map(project => project.retries),
    forbidOnly: report.config.forbidOnly,
    resetSeedConfirmed: log.includes('Controlled database reset and seeded; accounts, lock counters and catalog restored.'),
    tests,
  };
}

export function sensitiveText(text: string, secrets: string[]): boolean {
  const escaped = (value: string) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
  const variants = secrets.filter(value => value.length > 0).flatMap(value => [
    value, encodeURIComponent(value), JSON.stringify(value).slice(1, -1), escaped(value), Buffer.from(value).toString('base64'),
  ]);
  return variants.some(value => text.includes(value))
    || /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/.test(text)
    || /\bBearer\s+[A-Za-z0-9._~+/=-]{4,}/i.test(text)
    || /\b(?:authorization|proxy-authorization|cookie|set-cookie)["']?\s*[:=]\s*["']?[^\s"',}\]]+/i.test(text)
    || /["'](?:authorization|cookie|set-cookie)["']\s*,\s*["']value["']\s*:\s*["'][^"']+/i.test(text)
    || /["']cookies["']\s*:\s*\[(?!\s*\])/i.test(text)
    || /\b(?:access_token|refresh_token|password|client_secret)["']?\s*[:=]\s*["'][^"']+/i.test(text);
}

// Fail closed on archives, screenshots, embedded base64 reports, symlinks,
// oversized files, and other opaque data. No archive/image parser is introduced.
// A raw candidate is uploaded only if EVERY file is inspectable and clean.
export function scanCandidate(directory: string, secrets: string[]): 'clean' | 'absent' | 'sensitive-or-uninspectable' {
  if (!fs.existsSync(directory)) return 'absent';
  let files = 0;
  function inspect(file: string): boolean {
    const stat = fs.lstatSync(file);
    if (stat.isSymbolicLink() || sensitiveText(path.basename(file), secrets)) return false;
    if (stat.isDirectory()) return fs.readdirSync(file).every(name => inspect(path.join(file, name)));
    if (!stat.isFile() || stat.size > 10 * 1024 * 1024 || !/\.(?:json|xml|txt|md|html|css|js)$/i.test(file)) return false;
    files++;
    const bytes = fs.readFileSync(file);
    const text = bytes.toString('utf8');
    if (!Buffer.from(text).equals(bytes) || text.includes('\0')) return false;
    if (/playwrightReportBase64|data:[^\s"']*;base64,|[A-Za-z0-9+/]{256,}={0,2}/.test(text)) return false;
    return !sensitiveText(text, secrets);
  }
  return inspect(directory) ? (files ? 'clean' : 'absent') : 'sensitive-or-uninspectable';
}

function controlledSecrets(): string[] {
  const controlled = dotenv.parse(fs.readFileSync(path.join(root, '.env.controlled')));
  if (!controlled.TEST_USER_EMAIL || !controlled.TEST_USER_PASSWORD || !controlled.TEST_NEGATIVE_USER_EMAIL) {
    throw new Error('Controlled credential scan inputs unavailable');
  }
  return [...Object.values(controlled), ...Object.entries(process.env)
    .filter(([key]) => /PASSWORD|TOKEN|SECRET|COOKIE|AUTHORIZATION|TEST_.*EMAIL/i.test(key))
    .map(([, value]) => value || '')].filter(value => value.length >= 4);
}

function run(args: string[]): number {
  fs.mkdirSync(privateDir, { recursive: true });
  // Remove only these known files so an early failure cannot publish stale results.
  for (const file of [rawResults, compactFile]) fs.rmSync(file, { force: true });
  const fd = fs.openSync(consoleLog, 'w', 0o600);
  let exitCode: number;
  try {
    const child = spawnSync(process.execPath, [require.resolve('tsx/cli'), 'scripts/toolshop.ts', 'test', ...args], {
      cwd: root, windowsHide: true, stdio: ['ignore', fd, fd], timeout: 600000,
      env: { ...process.env, TOOLSHOP_CI_EVIDENCE: '1', PLAYWRIGHT_HTML_OPEN: 'never' },
    });
    exitCode = child.status ?? 1;
  } finally { fs.closeSync(fd); }
  try {
    const report = JSON.parse(fs.readFileSync(rawResults, 'utf8')) as JSONReport;
    const compact = compactResults(report, exitCode, fs.readFileSync(consoleLog, 'utf8'));
    fs.writeFileSync(compactFile, JSON.stringify(compact, null, 2) + '\n', { mode: 0o600 });
    console.log(`Controlled results: ${compact.total} tests (${compact.ui} UI + ${compact.api} API); expected=${compact.expected}, unexpected=${compact.unexpected}, flaky=${compact.flaky}, skipped=${compact.skipped}; exit=${exitCode}.`);
  } catch {
    fs.writeFileSync(compactFile, JSON.stringify({ format: 'toolshop-ci-results-v1', exitCode, reportAvailable: false }) + '\n');
    console.log('Controlled result details unavailable; raw output withheld.');
    if (exitCode === 0) exitCode = 1;
  }
  console.log('Raw console, HTML, JSON and diagnostics retained locally; public artifacts require a separate successful scan.');
  return exitCode;
}

function scan() {
  const secrets = controlledSecrets();
  // Fixed managed target; check absolute containment before recursive removal.
  if (!publicDir.startsWith(privateDir + path.sep) || fs.lstatSync(privateDir).isSymbolicLink()
    || (fs.existsSync(publicDir) && fs.lstatSync(publicDir).isSymbolicLink())) throw new Error('Unsafe evidence staging path');
  fs.rmSync(publicDir, { recursive: true, force: true });
  fs.mkdirSync(path.join(publicDir, 'summary'), { recursive: true });
  const candidates = {
    summary: compactFile,
    html: path.join(root, 'playwright-report'),
    diagnostics: path.join(root, 'test-results'),
  };
  const decisions = Object.fromEntries(Object.entries(candidates).map(([name, file]) => [name, scanCandidate(file, secrets)]));
  if (decisions.summary !== 'clean') throw new Error('Compact evidence withheld: missing, sensitive or uninspectable');
  for (const [name, file] of Object.entries(candidates)) {
    if (decisions[name] !== 'clean') continue;
    if (name === 'summary') fs.copyFileSync(file, path.join(publicDir, name, 'results.json'));
    else fs.cpSync(file, path.join(publicDir, name), { recursive: true });
  }
  const hashes: Record<string, string> = {};
  function hashFiles(directory: string) {
    for (const name of fs.readdirSync(directory)) {
      const file = path.join(directory, name);
      if (fs.statSync(file).isDirectory()) hashFiles(file);
      else hashes[path.relative(publicDir, file).replaceAll(path.sep, '/')] = createHash('sha256').update(fs.readFileSync(file)).digest('hex');
    }
  }
  hashFiles(publicDir);
  fs.writeFileSync(path.join(publicDir, 'summary', 'scan.json'), JSON.stringify({ decisions, sha256: hashes }, null, 2) + '\n');
  // Re-scan exact staged bytes, including the manifest, immediately before upload.
  for (const name of Object.keys(candidates)) {
    if (decisions[name] === 'clean' && scanCandidate(path.join(publicDir, name), secrets) !== 'clean') throw new Error('Staged evidence scan failed');
  }
  for (const name of Object.keys(candidates)) {
    const clean = decisions[name] === 'clean';
    console.log(`CI artifact ${name}: ${clean ? 'clean; approved for upload' : 'withheld (' + decisions[name] + ')'}; sensitive values are never printed.`);
    if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `${name}=${clean}\n`);
  }
  const notice = 'Raw diagnostics containing sensitive content or opaque data are withheld; underlying test exit/result is preserved. Full diagnostics remain local.\n';
  console.log(notice.trim());
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,
    `### CI evidence security scan\n\nSummary: ${decisions.summary}. HTML: ${decisions.html}. Diagnostics: ${decisions.diagnostics}.\n\n${notice}`);
}

if (require.main === module) {
  try {
    const [action, ...args] = process.argv.slice(2);
    if (action === 'run') process.exitCode = run(args);
    else if (action === 'scan') scan();
    else throw new Error('Expected run or scan');
  } catch {
    // Never echo parser errors, process errors, file contents or matched values.
    console.error('CI evidence operation failed closed; raw details withheld.');
    process.exitCode = 1;
  }
}
