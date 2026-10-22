const fs = require('node:fs');
const path = require('node:path');
const { spawnSync, spawn } = require('node:child_process');
const dotenv = require('dotenv');

const root = path.resolve(__dirname, '..');
const state = path.join(root, '.sut');
const upstream = path.join(state, 'upstream');
const composeFile = path.join(state, 'compose.json');
const lock = require('../environment/toolshop.lock.json');
const project = 'toolshop-controlled';
const ui = 'http://localhost:4200';
const api = 'http://localhost:8091';
const controlledEnv = path.join(root, '.env.controlled');
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: root, encoding: 'utf8', timeout: 120000, windowsHide: true,
    ...options,
  });
  if (result.error || result.status !== 0) {
    // Do not dump command arguments, environment or raw process output: these
    // can include seeded credentials or application data.
    throw new Error(`${command} operation failed (${result.error?.code || result.status}).`);
  }
  return result.stdout?.trim() || '';
}

function dockerAvailable() {
  try {
    if (run('docker', ['info', '--format', '{{.OSType}}']) !== 'linux') throw new Error('Linux containers required.');
    run('docker', ['compose', 'version']);
  } catch {
    throw new Error('Docker Engine with Linux containers and Compose v2 must be installed and running.');
  }
}

function verifyCheckout() {
  const actual = run('git', ['-C', upstream, 'rev-parse', 'HEAD']);
  if (actual !== lock.commit) throw new Error('SUT checkout does not match the committed version lock.');
  if (run('git', ['-C', upstream, 'status', '--porcelain'])) {
    throw new Error('SUT checkout has local changes. Preserve/review them before provisioning.');
  }
  if (run('git', ['-C', upstream, 'remote', 'get-url', 'origin']) !== lock.repository) {
    throw new Error('SUT origin is not the locked official upstream.');
  }
}

function provision() {
  fs.mkdirSync(state, { recursive: true });
  if (!fs.existsSync(upstream)) {
    console.log(`Fetching official Toolshop ${lock.tag}...`);
    run('git', ['clone', '--depth', '1', '--branch', lock.tag, lock.repository, upstream], { timeout: 300000 });
  }
  verifyCheckout();
  if (!fs.existsSync(controlledEnv)) {
    // Read public defaults from the pinned external source, never embed them in
    // automation source or documentation. The generated file is Git-ignored.
    const seeder = fs.readFileSync(path.join(upstream, 'sprint5/API/database/seeders/UserSeeder.php'), 'utf8');
    const users = [...seeder.matchAll(/'email'\s*=>\s*'([^']+)'[\s\S]*?'password'\s*=>\s*app\('hash'\)->make\('([^']+)'\)/g)];
    if (users.length < 3) throw new Error('Pinned seeder account format is not supported.');
    const values = { BASE_URL: ui, TEST_USER_EMAIL: users[1][1], TEST_USER_PASSWORD: users[1][2], TEST_NEGATIVE_USER_EMAIL: users[2][1] };
    fs.writeFileSync(controlledEnv, Object.entries(values).map(([key, value]) => `${key}=${JSON.stringify(value)}`).join('\n') + '\n', { mode: 0o600, flag: 'wx' });
    console.log('Created ignored .env.controlled from pinned seeded accounts; values are not logged.');
  }
  console.log(`SUT verified: tag ${lock.tag}, commit ${lock.commit}.`);
}

function prepareCompose() {
  // Normalize the pinned official production Compose, then keep only the four
  // required services. Application source remains external and unmodified.
  const official = JSON.parse(run('docker', ['compose', '-f', path.join(upstream, 'docker-compose.prod.yml'), 'config', '--format', 'json'], {
    env: { ...process.env, SPRINT: 'sprint5', DISABLE_LOGGING: 'true' },
  }));
  const services = {};
  for (const [name, image] of Object.entries(lock.images)) {
    if (!official.services[name] || !/@sha256:[a-f0-9]{64}$/.test(image)) throw new Error('Invalid locked SUT service.');
    services[name] = { ...official.services[name], image, platform: lock.servicePlatforms?.[name] || lock.platform };
    delete services[name].build;
    delete services[name].ports;
  }
  services['angular-ui'].ports = [{ target: 4200, published: '4200', host_ip: '127.0.0.1', protocol: 'tcp' }];
  services.web.ports = [{ target: 80, published: '8091', host_ip: '127.0.0.1', protocol: 'tcp' }];
  // Compose can normalize global resources with an upstream project name. Scope
  // all generated resources to this automation project's fixed lifecycle name.
  const volumes = Object.fromEntries(Object.keys(official.volumes || {}).map(name => [name, {}]));
  fs.writeFileSync(composeFile, JSON.stringify({ services, volumes }, null, 2) + '\n', { mode: 0o600 });
}

function compose(args, options) {
  if (!fs.existsSync(composeFile)) throw new Error('No controlled Compose state. Run npm run sut:up first.');
  const generated = JSON.parse(fs.readFileSync(composeFile, 'utf8'));
  for (const [service, image] of Object.entries(lock.images)) {
    if (generated.services[service]?.image !== image) throw new Error('Generated Compose image lock differs. Run sut:up again.');
  }
  return run('docker', ['compose', '-p', project, '-f', composeFile, ...args], options);
}

function diagnostics() {
  if (!fs.existsSync(composeFile)) return;
  try {
    // Service status only. Full container logs/config may contain test data.
    console.error(compose(['ps', '--all']));
  } catch { console.error('Container status unavailable.'); }
  console.error('Inspect further with docker compose -p toolshop-controlled -f .sut/compose.json logs --tail=50 (review before sharing).');
}

async function bounded(label, check, timeout = 180000) {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    try { if (await check()) { console.log(`${label} ready.`); return; } } catch { /* retry within deadline */ }
    await sleep(2000);
  }
  throw new Error(`${label} did not become ready within ${timeout / 1000}s.`);
}

async function ready() {
  const running = compose(['ps', '--status', 'running', '--services']).split(/\r?\n/);
  if (Object.keys(lock.images).some(service => !running.includes(service))) {
    throw new Error('A required controlled service is not running.');
  }
  await bounded('API', async () => {
    const response = await fetch(`${api}/status`, { signal: AbortSignal.timeout(3000) });
    const body = await response.json();
    return response.ok && typeof body.version === 'string';
  });
  await bounded('Frontend', async () => {
    const response = await fetch(ui, { signal: AbortSignal.timeout(3000) });
    return response.ok && (await response.text()).includes('<app-root');
  });
}

async function reset() {
  await bounded('Database', () => {
    compose(['exec', '-T', 'mariadb', 'sh', '-c', 'mysqladmin ping -h 127.0.0.1 -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" --silent'], { timeout: 5000 });
    return true;
  }, 120000);
  compose(['exec', '-T', 'laravel-api', 'php', 'artisan', 'config:clear']);
  compose(['exec', '-T', 'laravel-api', 'php', 'artisan', 'migrate:fresh', '--seed', '--force']);
  compose(['exec', '-T', 'laravel-api', 'php', 'artisan', 'cache:clear']);
  await ready();
  await bounded('Seeded catalog', async () => {
    const response = await fetch(`${api}/products`, { signal: AbortSignal.timeout(3000) });
    const body = await response.json();
    return response.ok && Array.isArray(body.data) && body.data.length > 0;
  });
  console.log('Controlled database reset and seeded; accounts, lock counters and catalog restored.');
}

async function test(args) {
  const values = { ...dotenv.parse(fs.readFileSync(controlledEnv)), ...process.env };
  for (const key of ['TEST_USER_EMAIL', 'TEST_USER_PASSWORD', 'TEST_NEGATIVE_USER_EMAIL']) {
    if (!values[key]?.trim()) throw new Error(`Missing controlled environment variable: ${key}`);
  }
  if (values.TEST_USER_EMAIL.trim().toLowerCase() === values.TEST_NEGATIVE_USER_EMAIL.trim().toLowerCase()) {
    throw new Error('Controlled positive and negative accounts must be different.');
  }
  await ready();
  await reset();
  console.log(`Running Chromium against ${ui}, all scenarios, one worker, zero retries.`);
  return await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [require.resolve('@playwright/test/cli'), 'test', '--project=chromium', '--workers=1', '--retries=0', '--forbid-only', ...args], {
      cwd: root, stdio: 'inherit', windowsHide: true,
      env: { ...values, BASE_URL: ui, PLAYWRIGHT_HTML_OPEN: 'never' },
    });
    child.on('error', reject);
    child.on('exit', code => resolve(code ?? 1));
  });
}

async function main() {
  const [action, ...args] = process.argv.slice(2);
  if (!['provision', 'up', 'ready', 'reset', 'down', 'test'].includes(action)) throw new Error('Use provision, up, ready, reset, down or test.');
  fs.mkdirSync(state, { recursive: true });
  const operationLock = path.join(state, 'operation.lock');
  try { fs.mkdirSync(operationLock); } catch { throw new Error('Another controlled lifecycle operation is running. If it was interrupted, remove .sut/operation.lock after confirming no operation is active.'); }
  try {
    if (action === 'provision') { provision(); return; }
    dockerAvailable();
    if (action === 'up') {
      provision();
      prepareCompose();
      console.log('Pulling locked images and starting controlled services...');
      compose(['pull'], { timeout: 600000 });
      compose(['up', '-d'], { timeout: 120000 });
      await ready();
    } else if (action === 'down') {
      if (!fs.existsSync(composeFile)) { console.log('No controlled services have been provisioned.'); return; }
      compose(['down', '--volumes', '--remove-orphans']);
      console.log('Controlled containers, network and volumes removed; checkout/images retained.');
    } else {
      verifyCheckout();
      if (action === 'ready') await ready();
      if (action === 'reset') await reset();
      if (action === 'test') process.exitCode = await test(args);
    }
  } catch (error) {
    diagnostics();
    throw error;
  } finally { fs.rmdirSync(operationLock); }
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
