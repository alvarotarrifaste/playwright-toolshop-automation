import { test, expect } from '@playwright/test';
import { CatalogPage } from '../../../pages/catalog/CatalogPage';
import { ProductDetailsPage } from '../../../pages/catalog/ProductDetailsPage';
import { CartPage } from '../../../pages/cart/CartPage';
import { LoginPage } from '../../../pages/authentication/LoginPage';

const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL;
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD;

test('visitor adds a product to cart and sees the selected product and quantity', { tag: ['@ui', '@cart', '@regression', '@smoke'] }, async ({ page }) => {
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

test('authenticated user adds a product to cart and sees the selected product and quantity', { tag: ['@ui', '@cart', '@regression'] }, async ({ page }) => {
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

test('visitor adds the same product again and sees one saved cart line with accumulated quantity and totals', { tag: ['@ui', '@cart', '@regression'] }, async ({ page }) => {
  const catalog = new CatalogPage(page);
  const details = new ProductDetailsPage(page);
  const cart = new CartPage(page);

  await catalog.goto();
  await catalog.search('Combination Pliers');
  await expect(catalog.searchCompleted).toBeVisible();
  await catalog.openProduct('Combination Pliers');
  await expect(details.quantity).toHaveValue('1');
  await details.addToCart();
  await cart.open();
  await expect(cart.productNames).toHaveText(['Combination Pliers']);
  await expect(cart.productQuantities).toHaveValue('1');
  await expect(cart.total).toHaveText('$14.15');

  await catalog.goto();
  await catalog.search('Combination Pliers');
  await expect(catalog.searchCompleted).toBeVisible();
  await catalog.openProduct('Combination Pliers');
  await expect(details.quantity).toHaveValue('1');
  await details.addToCart();
  await cart.open();
  await expect(cart.productNames).toHaveText(['Combination Pliers']);
  await expect(cart.productQuantities).toHaveCount(1);
  await expect(cart.productQuantities).toHaveValue('2');
  await expect(cart.productPrices).toHaveText(['$14.15']);
  await expect(cart.linePrices).toHaveText(['$28.30']);
  await expect(cart.total).toHaveText('$28.30');
  await expect(cart.cartQuantityBadge).toHaveText('2');

  await page.reload();
  await expect(cart.productNames).toHaveText(['Combination Pliers']);
  await expect(cart.productQuantities).toHaveCount(1);
  await expect(cart.productQuantities).toHaveValue('2');
  await expect(cart.linePrices).toHaveText(['$28.30']);
  await expect(cart.total).toHaveText('$28.30');
});
