import { test, expect } from '@playwright/test';
import { CatalogPage } from '../../../pages/catalog/CatalogPage';
import { ProductDetailsPage } from '../../../pages/catalog/ProductDetailsPage';

test('visitor searches for a product and sees matching results', { tag: ['@ui', '@catalog', '@regression', '@smoke'] }, async ({ page }) => {
  const catalogPage = new CatalogPage(page);

  await catalogPage.goto();
  await catalogPage.search('Pliers');

  await expect(catalogPage.searchCompleted).toBeVisible();
  await expect(catalogPage.productNames.first()).toBeVisible();
  await expect(catalogPage.productNames.filter({ hasText: /^\s*Pliers\s*$/ })).toBeVisible();
});

test('visitor searches for a product with no matches', { tag: ['@ui', '@catalog', '@regression'] }, async ({ page }) => {
  const catalogPage = new CatalogPage(page);

  await catalogPage.goto();
  await catalogPage.search('xxx');

  await expect(catalogPage.searchResultCount).toHaveText("0 products found for 'xxx'");
  await expect(catalogPage.productNames).toHaveCount(0);
});

test('visitor opens a product from search results and views its details', { tag: ['@ui', '@catalog', '@regression'] }, async ({ page }) => {
  const catalogPage = new CatalogPage(page);

  await catalogPage.goto();
  await catalogPage.search('Pliers');
  await expect(catalogPage.searchCompleted).toBeVisible();
  await catalogPage.openProduct('Combination Pliers');

  const productDetailsPage = new ProductDetailsPage(page);

  await expect(page).toHaveURL(/\/product\/.+/);
  await expect(productDetailsPage.productName).toHaveText('Combination Pliers');
  await expect(productDetailsPage.addToCartButton).toBeVisible();
  await expect(productDetailsPage.unitPrice).toHaveText('14.15');
  await expect(productDetailsPage.category).toHaveText('Pliers');
  await expect(productDetailsPage.brand).toHaveText('ForgeFlex Tools');
  await expect(productDetailsPage.description).toBeVisible();
  await expect(productDetailsPage.description).toContainText('gripping, bending, and cutting wire');
  await expect(productDetailsPage.productImage).toBeVisible();
  await expect(productDetailsPage.productImage).toHaveAttribute('alt', 'Combination Pliers');
  await expect(productDetailsPage.productImage).toHaveAttribute('src', /\/pliers01\.avif$/);
  await expect.poll(() => productDetailsPage.productImage.evaluate((image: HTMLImageElement) =>
    image.complete && image.naturalWidth > 0), { message: 'Selected product image loads successfully' }).toBe(true);
});
