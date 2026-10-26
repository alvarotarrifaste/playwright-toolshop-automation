import { test, expect } from '@playwright/test';

// Only this API spec opts out: traces can retain login payloads and bearer tokens.
// The existing controlled Chromium project also runs request-only tests.
test.use({ baseURL: 'http://localhost:8091', trace: 'off' });

test('T-API-AUTH-001: current customer resource rejects anonymous access and returns the authenticated customer', async ({ request }) => {
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;
  if (!email?.trim() || !password?.trim()) {
    throw new Error('API authorization requires injected TEST_USER_EMAIL and TEST_USER_PASSWORD');
  }

  const anonymous = await request.get('/users/me', { maxRedirects: 0 }).catch(() => {
    throw new Error('Anonymous profile request failed; transport details suppressed');
  });
  expect(anonymous.status(), 'Anonymous profile status').toBe(401);
  const denied: unknown = await anonymous.json().catch(() => {
    throw new Error('Anonymous profile did not return JSON; raw body suppressed');
  });
  // Exact error-only shape also rejects accidental customer identity disclosure.
  expect(JSON.stringify(denied) === JSON.stringify({ message: 'Unauthorized' }),
    'Anonymous response contains only the authorization error').toBe(true);

  const login = await request.post('/users/login', {
    data: { email, password },
    maxRedirects: 0,
  }).catch(() => {
    throw new Error('Customer login request failed; transport details suppressed');
  });
  expect(login.status(), 'Seeded customer login status').toBe(200);
  const auth = await login.json().catch(() => {
    throw new Error('Login did not return JSON; raw body suppressed');
  }) as { access_token?: unknown; token_type?: unknown };
  // Boolean assertions prevent token/identity values appearing in failure diffs.
  expect(auth?.token_type === 'bearer', 'Login supplies the confirmed bearer token type').toBe(true);
  expect(typeof auth?.access_token === 'string' && auth.access_token.trim().length > 0,
    'Login supplies a nonempty access token').toBe(true);

  const profile = await request.get('/users/me', {
    headers: { Authorization: `Bearer ${auth.access_token}` },
    maxRedirects: 0,
  }).catch(() => {
    throw new Error('Authenticated profile request failed; transport details suppressed');
  });
  expect(profile.status(), 'Authenticated profile status').toBe(200);
  const customer = await profile.json().catch(() => {
    throw new Error('Authenticated profile did not return JSON; raw body suppressed');
  }) as { id?: unknown; email?: unknown; first_name?: unknown; last_name?: unknown };
  expect(customer?.email === email, 'Profile belongs to the injected customer').toBe(true);
  expect(customer?.first_name === 'Jane' && customer?.last_name === 'Doe',
    'Profile matches the pinned positive customer identity').toBe(true);
  expect(typeof customer?.id === 'string' && customer.id.length > 0,
    'Profile contains a customer resource ID without assuming a generated value').toBe(true);
});
