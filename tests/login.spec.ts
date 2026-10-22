import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL;
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD;
const TEST_NEGATIVE_USER_EMAIL = process.env.TEST_NEGATIVE_USER_EMAIL;

test('registered user can login successfully', async ({ page }) => {
  if (!TEST_USER_EMAIL?.trim()) {
    throw new Error('Missing or blank required environment variable: TEST_USER_EMAIL');
  }
  if (!TEST_USER_PASSWORD?.trim()) {
    throw new Error('Missing or blank required environment variable: TEST_USER_PASSWORD');
  }

  const loginPage = new LoginPage(page);

  await loginPage.goto();

  await loginPage.login(
    TEST_USER_EMAIL,
    TEST_USER_PASSWORD
  );

  await expect(page).toHaveURL(/\/account$/);

  await expect(
  page.getByRole('heading', { name: 'My account' })
  ).toBeVisible();

});

test('customer cannot sign in with an incorrect password', async ({ page }) => {
  if (!TEST_NEGATIVE_USER_EMAIL?.trim()) {
    throw new Error('Missing or blank required environment variable: TEST_NEGATIVE_USER_EMAIL');
  }
  if (TEST_NEGATIVE_USER_EMAIL.trim().toLowerCase() === TEST_USER_EMAIL?.trim().toLowerCase()) {
    throw new Error('Negative authentication requires a different customer account');
  }

  const loginPage = new LoginPage(page);

  await loginPage.goto();

  await loginPage.login(
    TEST_NEGATIVE_USER_EMAIL,
    'IncorrectPassword123*'
  );

  await expect(loginPage.loginErrorMessage).toBeVisible();
  await expect(loginPage.loginErrorMessage).toHaveText('Invalid email or password');
});

test('signed-in customer logs out', async ({ page }) => {
  if (!TEST_USER_EMAIL?.trim()) {
    throw new Error('Missing or blank required environment variable: TEST_USER_EMAIL');
  }
  if (!TEST_USER_PASSWORD?.trim()) {
    throw new Error('Missing or blank required environment variable: TEST_USER_PASSWORD');
  }

  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.login(
    TEST_USER_EMAIL,
    TEST_USER_PASSWORD
  );

  await expect(page).toHaveURL(/\/account$/);
  await loginPage.logout();

  await expect(page.getByRole('link', { name: 'Sign in', exact: true })).toBeVisible();
});

test('unauthenticated visitor cannot access /account', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await page.goto('/account');

  await expect(page).toHaveURL(/\/auth\/login$/);
  await expect(loginPage.loginButton).toBeVisible();
});
