import { test, expect } from '@playwright/test';
import { CatalogPage } from '../pages/CatalogPage';
import { ProductDetailsPage } from '../pages/ProductDetailsPage';
import { CartPage } from '../pages/CartPage';

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
