import { test, expect } from '@playwright/test';
import { CatalogPage } from '../pages/CatalogPage';
import { ProductDetailsPage } from '../pages/ProductDetailsPage';
import { CartPage } from '../pages/CartPage';
import { LoginPage } from '../pages/LoginPage';

const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL;
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD;

test('visitor adds a product to cart and sees the selected product and quantity', async ({ page }) => {
  const productName = 'Combination Pliers';
  const catalogPage = new CatalogPage(page);
  const productDetailsPage = new ProductDetailsPage(page);
  const cartPage = new CartPage(page);

  await catalogPage.goto();
  await catalogPage.search('Pliers');
  await expect(catalogPage.searchCompleted).toBeVisible();
  await catalogPage.openProduct(productName);

  await expect(productDetailsPage.productName).toHaveText(productName);
  await expect(productDetailsPage.quantity).toHaveValue('1');
  await productDetailsPage.addToCart();
  await cartPage.open();

  await expect(page).toHaveURL(/\/checkout$/);
  await expect(cartPage.productNames).toHaveText([productName]);
  await expect(cartPage.productQuantities).toHaveValue('1');
});

test('authenticated user adds a product to cart and sees the selected product and quantity', async ({ page }) => {
  if (!TEST_USER_EMAIL?.trim()) {
    throw new Error('Missing or blank required environment variable: TEST_USER_EMAIL');
  }
  if (!TEST_USER_PASSWORD?.trim()) {
    throw new Error('Missing or blank required environment variable: TEST_USER_PASSWORD');
  }

  const productName = 'Combination Pliers';
  const loginPage = new LoginPage(page);
  const catalogPage = new CatalogPage(page);
  const productDetailsPage = new ProductDetailsPage(page);
  const cartPage = new CartPage(page);

  await loginPage.goto();
  await loginPage.login(TEST_USER_EMAIL, TEST_USER_PASSWORD);
  await expect(page).toHaveURL(/\/account$/);
  await expect(page.getByRole('heading', { name: 'My account' })).toBeVisible();

  await catalogPage.goto();
  await catalogPage.search(productName);
  await expect(catalogPage.searchCompleted).toBeVisible();
  await catalogPage.openProduct(productName);

  await expect(productDetailsPage.productName).toHaveText(productName);
  await expect(productDetailsPage.quantity).toHaveValue('1');
  await productDetailsPage.addToCart();
  await cartPage.open();

  await expect(page).toHaveURL(/\/checkout$/);
  await expect(cartPage.productNames).toHaveText([productName]);
  await expect(cartPage.productQuantities).toHaveValue('1');
  await expect(loginPage.userMenu).toBeVisible();
});
