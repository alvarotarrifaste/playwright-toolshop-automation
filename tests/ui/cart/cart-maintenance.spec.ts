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

test('visitor removes the final cart item and sees a persisted empty cart without checkout controls', { tag: ['@ui', '@cart', '@regression'] }, async ({ page }) => {
  const catalog = new CatalogPage(page);
  const details = new ProductDetailsPage(page);
  const cart = new CartPage(page);
  await catalog.goto();
  await catalog.search('Combination Pliers');
  await expect(catalog.searchCompleted).toBeVisible();
  await catalog.openProduct('Combination Pliers');
  const created = page.waitForResponse(response => response.request().method() === 'POST'
    && new URL(response.url()).pathname === '/carts');
  await details.addToCart();
  const creation = await created;
  const ownedCart = await creation.json() as { id: string };
  expect(typeof ownedCart.id === 'string' && ownedCart.id.length > 0, 'Own cart identity is generated').toBe(true);
  await cart.open();
  await expect(cart.productNames).toHaveText(['Combination Pliers']);
  await expect(cart.productQuantities).toHaveValue('1');
  await expect(cart.total).toHaveText('$14.15');

  await cart.removeProduct('Combination Pliers');
  await expect(cart.emptyCartMessage).toBeVisible();
  await expect(cart.productNames).toHaveCount(0);
  await expect(cart.productQuantities).toHaveCount(0);
  await expect(cart.total).toHaveCount(0);
  await expect(cart.proceedButton).toHaveCount(0);
  await expect(cart.cartQuantityBadge).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => sessionStorage.getItem('cart_quantity')), { message: 'Empty cart quantity is zero' }).toBe('0');
  expect(await page.evaluate(id => sessionStorage.getItem('cart_id') === id, ownedCart.id), 'Empty cart identity is retained').toBe(true);

  const read = page.waitForResponse(response => response.request().method() === 'GET'
    && new URL(response.url()).pathname === `/carts/${ownedCart.id}`);
  await page.reload();
  const response = await read;
  expect(response.status(), 'Empty cart still exists on the backend').toBe(200);
  const persisted = await response.json() as { id: string; cart_items: unknown[] };
  expect(persisted.id === ownedCart.id, 'Readback is the same owned empty cart').toBe(true);
  expect(persisted.cart_items).toEqual([]);
  await expect(cart.emptyCartMessage).toBeVisible();
  await expect(cart.productNames).toHaveCount(0);
  await expect(cart.total).toHaveCount(0);
  await expect(cart.proceedButton).toHaveCount(0);
  await expect(cart.cartQuantityBadge).toHaveCount(0);
});
