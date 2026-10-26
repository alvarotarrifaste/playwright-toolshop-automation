import { test, expect } from '@playwright/test';
import { CatalogPage } from '../../../pages/catalog/CatalogPage';
import { ProductDetailsPage } from '../../../pages/catalog/ProductDetailsPage';
import { CartPage } from '../../../pages/cart/CartPage';

test('visitor updates a cart quantity and sees the saved quantity and recalculated totals', { tag: ['@ui', '@cart', '@regression'] }, async ({ page }) => {
  const productName = 'Combination Pliers';
  const catalogPage = new CatalogPage(page);
  const productDetailsPage = new ProductDetailsPage(page);
  const cartPage = new CartPage(page);

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
  await expect(cartPage.productPrices).toHaveText(['$14.15']);
  await expect(cartPage.linePrices).toHaveText(['$14.15']);
  await expect(cartPage.total).toHaveText('$14.15');

  await cartPage.updateQuantity(2);
  await expect(cartPage.quantityUpdatedMessage).toBeVisible();
  await expect(cartPage.productNames).toHaveText([productName]);
  await expect(cartPage.productQuantities).toHaveValue('2');
  await expect(cartPage.linePrices).toHaveText(['$28.30']);
  await expect(cartPage.total).toHaveText('$28.30');

  await page.reload();
  await expect(page).toHaveURL(/\/checkout$/);
  await expect(cartPage.productNames).toHaveText([productName]);
  await expect(cartPage.productQuantities).toHaveValue('2');
  await expect(cartPage.productPrices).toHaveText(['$14.15']);
  await expect(cartPage.linePrices).toHaveText(['$28.30']);
  await expect(cartPage.total).toHaveText('$28.30');
});

test('visitor removes a cart product and sees the remaining product and recalculated total', { tag: ['@ui', '@cart', '@regression'] }, async ({ page }) => {
  const removedProduct = 'Combination Pliers';
  const remainingProduct = 'Pliers';
  const catalogPage = new CatalogPage(page);
  const productDetailsPage = new ProductDetailsPage(page);
  const cartPage = new CartPage(page);

  await catalogPage.goto();
  await catalogPage.search(removedProduct);
  await expect(catalogPage.searchCompleted).toBeVisible();
  await catalogPage.openProduct(removedProduct);
  await expect(productDetailsPage.productName).toHaveText(removedProduct);
  await expect(productDetailsPage.quantity).toHaveValue('1');
  await productDetailsPage.addToCart();
  await cartPage.open();
  await expect(cartPage.productNames).toHaveText([removedProduct]);
  await expect(cartPage.productQuantities).toHaveValue('1');

  await catalogPage.goto();
  await catalogPage.search(remainingProduct);
  await expect(catalogPage.searchCompleted).toBeVisible();
  await catalogPage.openProduct(remainingProduct);
  await expect(productDetailsPage.productName).toHaveText(remainingProduct);
  await expect(productDetailsPage.quantity).toHaveValue('1');
  await productDetailsPage.addToCart();
  await cartPage.open();

  await expect(page).toHaveURL(/\/checkout$/);
  await expect(cartPage.productNames).toHaveText([removedProduct, remainingProduct]);
  await expect(cartPage.productQuantities).toHaveCount(2);
  await expect(cartPage.productQuantities.nth(0)).toHaveValue('1');
  await expect(cartPage.productQuantities.nth(1)).toHaveValue('1');
  await expect(cartPage.linePrices).toHaveText(['$14.15', '$12.01']);
  await expect(cartPage.total).toHaveText('$26.16');

  await cartPage.removeProduct(removedProduct);
  await expect(cartPage.productNames).toHaveText([remainingProduct]);
  await expect(cartPage.productQuantities).toHaveValue('1');
  await expect(cartPage.linePrices).toHaveText(['$12.01']);
  await expect(cartPage.total).toHaveText('$12.01');

  await page.reload();
  await expect(page).toHaveURL(/\/checkout$/);
  await expect(cartPage.productNames).toHaveText([remainingProduct]);
  await expect(cartPage.productQuantities).toHaveValue('1');
  await expect(cartPage.linePrices).toHaveText(['$12.01']);
  await expect(cartPage.total).toHaveText('$12.01');
});
