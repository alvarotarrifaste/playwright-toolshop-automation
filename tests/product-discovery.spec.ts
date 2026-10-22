import { test, expect } from '@playwright/test';
import { CatalogPage } from '../pages/CatalogPage';
import { ProductDetailsPage } from '../pages/ProductDetailsPage';

test('visitor searches for a product and sees matching results', async ({ page }) => {
  const catalogPage = new CatalogPage(page);

  await catalogPage.goto();
  await catalogPage.search('Pliers');

  await expect(catalogPage.searchCompleted).toBeVisible();
  await expect(catalogPage.productNames.first()).toBeVisible();
  await expect(catalogPage.productNames.filter({ hasText: /^\s*Pliers\s*$/ })).toBeVisible();
});

test('visitor searches for a product with no matches', async ({ page }) => {
  const catalogPage = new CatalogPage(page);

  await catalogPage.goto();
  await catalogPage.search('xxx');

  await expect(catalogPage.searchResultCount).toHaveText("0 products found for 'xxx'");
  await expect(catalogPage.productNames).toHaveCount(0);
});

test('visitor opens a product from search results and views its details', async ({ page }) => {
  const catalogPage = new CatalogPage(page);

  await catalogPage.goto();
  await catalogPage.search('Pliers');
  await expect(catalogPage.searchCompleted).toBeVisible();
  await catalogPage.openProduct('Combination Pliers');

  const productDetailsPage = new ProductDetailsPage(page);

  await expect(page).toHaveURL(/\/product\/.+/);
  await expect(productDetailsPage.productName).toHaveText('Combination Pliers');
  await expect(productDetailsPage.addToCartButton).toBeVisible();
});
