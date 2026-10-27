import { test, expect } from '@playwright/test';

// Authentication payloads and tokens must not enter request traces.
test.use({ baseURL: process.env.API_BASE_URL, trace: 'off' });

test.beforeAll(() => {
  if (!process.env.API_BASE_URL?.trim()) {
    throw new Error('Account security requires injected API_BASE_URL');
  }
});

test('T-AUTH-005: three invalid passwords lock only the dedicated customer on subsequent login', { tag: ['@api', '@auth', '@regression'] }, async ({ request }) => {
  const email = process.env.TEST_LOCK_USER_EMAIL;
  const password = process.env.TEST_LOCK_USER_PASSWORD;
  const positiveEmail = process.env.TEST_USER_EMAIL;
  const positivePassword = process.env.TEST_USER_PASSWORD;
  const negativeEmail = process.env.TEST_NEGATIVE_USER_EMAIL;
  if (!email?.trim() || !password?.trim() || !positiveEmail?.trim() || !positivePassword?.trim() || !negativeEmail?.trim()) {
    throw new Error('Locking requires injected locking, positive and negative customer configuration');
  }
  if (new Set([email, positiveEmail, negativeEmail].map(value => value.trim().toLowerCase())).size !== 3) {
    throw new Error('Locking, positive and negative customers must be distinct');
  }

  // Successful login proves usability and starts a consecutive-failure sequence.
  const initial = await request.post('/users/login', {
    data: { email, password }, maxRedirects: 0,
  }).catch(() => { throw new Error('Initial locking-customer login failed; transport details suppressed'); });
  expect(initial.status(), 'Dedicated customer starts unlocked').toBe(200);

  const wrongPassword = 'LocalWrongPassword13!'; // Deliberate non-secret negative input.
  for (let attempt = 1; attempt <= 3; attempt++) {
    const rejected = await request.post('/users/login', {
      data: { email, password: wrongPassword }, maxRedirects: 0,
    }).catch(() => { throw new Error('Invalid login request failed; transport details suppressed'); });
    expect(rejected.status(), `Invalid attempt ${attempt} is rejected before subsequent-login locking`).toBe(401);
    const body: unknown = await rejected.json().catch(() => { throw new Error('Invalid login body was not JSON; raw body suppressed'); });
    expect(JSON.stringify(body) === JSON.stringify({ error: 'Unauthorized' }), 'Invalid login contains only the expected rejection').toBe(true);
  }

  // The fourth attempt is locked; even correct credentials cannot bypass it.
  for (const candidate of [wrongPassword, password]) {
    const locked = await request.post('/users/login', {
      data: { email, password: candidate }, maxRedirects: 0,
    }).catch(() => { throw new Error('Locked login request failed; transport details suppressed'); });
    expect(locked.status(), 'Subsequent login is locked regardless of password correctness').toBe(423);
    const body: unknown = await locked.json().catch(() => { throw new Error('Locked login body was not JSON; raw body suppressed'); });
    expect(JSON.stringify(body) === JSON.stringify({ error: 'Account locked, too many failed attempts. Please contact the administrator.' }),
      'Locked login contains only the documented account-lock error').toBe(true);
  }

  const positive = await request.post('/users/login', {
    data: { email: positiveEmail, password: positivePassword }, maxRedirects: 0,
  }).catch(() => { throw new Error('Positive-customer isolation check failed; transport details suppressed'); });
  expect(positive.status(), 'Locking another customer does not block the positive customer').toBe(200);
  // The controlled reset/seed and teardown own the persisted lock; no local unlock.
});

test('T-API-AUTH-002: explicit API logout invalidates the same token for protected customer access', { tag: ['@api', '@auth', '@regression'] }, async ({ request }) => {
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;
  if (!email?.trim() || !password?.trim()) {
    throw new Error('API logout requires injected TEST_USER_EMAIL and TEST_USER_PASSWORD');
  }

  const login = await request.post('/users/login', {
    data: { email, password }, maxRedirects: 0,
  }).catch(() => { throw new Error('Logout prerequisite login failed; transport details suppressed'); });
  expect(login.status(), 'Logout prerequisite authenticates').toBe(200);
  const auth = await login.json().catch(() => { throw new Error('Logout login body was not JSON; raw body suppressed'); }) as { access_token?: unknown };
  expect(typeof auth.access_token === 'string' && auth.access_token.trim().length > 0, 'Login supplies a nonempty token').toBe(true);
  const headers = { Authorization: `Bearer ${auth.access_token}` };

  const before = await request.get('/users/me', { headers, maxRedirects: 0 })
    .catch(() => { throw new Error('Pre-logout profile request failed; transport details suppressed'); });
  expect(before.status(), 'The token can access the protected resource before logout').toBe(200);

  const logout = await request.get('/users/logout', { headers, maxRedirects: 0 })
    .catch(() => { throw new Error('Explicit logout request failed; transport details suppressed'); });
  expect(logout.status(), 'Explicit logout succeeds').toBe(200);
  const confirmation: unknown = await logout.json().catch(() => { throw new Error('Logout body was not JSON; raw body suppressed'); });
  expect(JSON.stringify(confirmation) === JSON.stringify({ message: 'Successfully logged out' }), 'Logout confirms invalidation').toBe(true);

  const after = await request.get('/users/me', { headers, maxRedirects: 0 })
    .catch(() => { throw new Error('Post-logout profile request failed; transport details suppressed'); });
  expect(after.status(), 'The exact same token loses protected access after explicit logout').toBe(401);
  const denied: unknown = await after.json().catch(() => { throw new Error('Post-logout body was not JSON; raw body suppressed'); });
  expect(JSON.stringify(denied) === JSON.stringify({ message: 'Unauthorized' }), 'Revoked token returns only the protected-route authorization error').toBe(true);
});
