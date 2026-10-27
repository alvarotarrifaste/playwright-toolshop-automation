import { test, expect } from '@playwright/test';
import { CatalogPage } from '../../../pages/catalog/CatalogPage';

test('visitor selects a category and clears it to restore the initial product page', { tag: ['@ui', '@catalog', '@regression'] }, async ({ page }) => {
  const catalogPage = new CatalogPage(page);
  const pliersProducts = [
    'Combination Pliers', 'Pliers', 'Bolt Cutters', 'Long Nose Pliers', 'Slip Joint Pliers',
  ];
  const initialPageProducts = [
    ...pliersProducts, 'Claw Hammer with Shock Reduction Grip', 'Hammer', 'Claw Hammer', 'Thor Hammer',
  ];

  await catalogPage.goto();
  await expect(catalogPage.productNames).toHaveCount(initialPageProducts.length);
  for (const name of initialPageProducts) {
    await expect(catalogPage.productNames.and(page.getByText(name, { exact: true }))).toBeVisible();
  }
  await expect(catalogPage.categoryCheckbox('Pliers')).not.toBeChecked();

  await catalogPage.selectCategory('Pliers');
  await expect(catalogPage.filterCompleted).toBeVisible();
  await expect(catalogPage.categoryCheckbox('Pliers')).toBeChecked();
  await expect(catalogPage.productNames).toHaveCount(pliersProducts.length);
  for (const name of pliersProducts) {
    await expect(catalogPage.productNames.and(page.getByText(name, { exact: true }))).toBeVisible();
  }

  await catalogPage.clearCategory('Pliers');
  await expect(catalogPage.categoryCheckbox('Pliers')).not.toBeChecked();
  await expect(catalogPage.selectedCategoryCheckboxes).toHaveCount(0);
  await expect(catalogPage.productNames).toHaveCount(initialPageProducts.length);
  for (const name of initialPageProducts) {
    await expect(catalogPage.productNames.and(page.getByText(name, { exact: true }))).toBeVisible();
  }
});

test('visitor searches after category filtering and sees matching products with the category cleared', { tag: ['@ui', '@catalog', '@regression'] }, async ({ page }) => {
  const catalogPage = new CatalogPage(page);
  const pliersProducts = [
    'Combination Pliers', 'Pliers', 'Bolt Cutters', 'Long Nose Pliers', 'Slip Joint Pliers',
  ];
  const hammerSearchProducts = [
    'Claw Hammer with Shock Reduction Grip', 'Hammer', 'Claw Hammer', 'Thor Hammer',
    'Claw Hammer with Fiberglass Handle', 'Court Hammer',
  ];

  await catalogPage.goto();
  await catalogPage.selectCategory('Pliers');
  await expect(catalogPage.filterCompleted).toBeVisible();
  await expect(catalogPage.categoryCheckbox('Pliers')).toBeChecked();
  await expect(catalogPage.productNames).toHaveCount(pliersProducts.length);
  for (const name of pliersProducts) {
    await expect(catalogPage.productNames.and(page.getByText(name, { exact: true }))).toBeVisible();
  }

  await catalogPage.search('Hammer');
  await expect(catalogPage.searchCompleted).toBeVisible();
  await expect(catalogPage.categoryCheckbox('Pliers')).not.toBeChecked();
  await expect(catalogPage.selectedCategoryCheckboxes).toHaveCount(0);
  await expect(catalogPage.searchResultCount).toHaveText("6 products found for 'Hammer'");
  await expect(catalogPage.productNames).toHaveCount(hammerSearchProducts.length);
  for (const name of hammerSearchProducts) {
    await expect(catalogPage.productNames.and(page.getByText(name, { exact: true }))).toBeVisible();
  }
});

test('visitor selects a brand and clears it to restore the default product grid', { tag: ['@ui', '@catalog', '@regression'] }, async ({ page }) => {
  const catalogPage = new CatalogPage(page);
  const mightyCraftProducts = [
    'Bolt Cutters', 'Long Nose Pliers', 'Slip Joint Pliers', 'Claw Hammer', 'Chisels Set',
    'Screws', 'Drawer Tool Cabinet', 'Belt Sander', 'Cordless Drill 12V',
  ];

  await catalogPage.goto();
  await expect(catalogPage.productNames).toHaveCount(9);
  await expect(catalogPage.productNames.and(page.getByText('Combination Pliers', { exact: true }))).toBeVisible();
  const initialProductNames = (await catalogPage.productNames.allTextContents()).map(name => name.trim());
  await expect(catalogPage.brandCheckbox('MightyCraft Hardware')).not.toBeChecked();

  await catalogPage.selectBrand('MightyCraft Hardware');
  await expect(catalogPage.filterCompleted).toBeVisible();
  await expect(catalogPage.brandCheckbox('MightyCraft Hardware')).toBeChecked();
  await expect(catalogPage.productNames).toHaveCount(mightyCraftProducts.length);
  for (const name of mightyCraftProducts) {
    await expect(catalogPage.productNames.and(page.getByText(name, { exact: true }))).toBeVisible();
  }

  await catalogPage.clearBrand('MightyCraft Hardware');
  await expect(catalogPage.brandCheckbox('MightyCraft Hardware')).not.toBeChecked();
  await expect(catalogPage.productNames).toHaveCount(initialProductNames.length);
  for (const name of initialProductNames) {
    await expect(catalogPage.productNames.and(page.getByText(name, { exact: true }))).toBeVisible();
  }
});

test('visitor combines category and brand filters and sees only their product intersection', { tag: ['@ui', '@catalog', '@regression'] }, async ({ page }) => {
  const catalogPage = new CatalogPage(page);
  const pliersProducts = [
    'Combination Pliers', 'Pliers', 'Bolt Cutters', 'Long Nose Pliers', 'Slip Joint Pliers',
  ];
  const mightyCraftPliers = ['Bolt Cutters', 'Long Nose Pliers', 'Slip Joint Pliers'];

  await catalogPage.goto();
  await catalogPage.selectCategory('Pliers');
  await expect(catalogPage.filterCompleted).toBeVisible();
  await expect(catalogPage.categoryCheckbox('Pliers')).toBeChecked();
  await expect(catalogPage.productNames).toHaveCount(pliersProducts.length);
  for (const name of pliersProducts) {
    await expect(catalogPage.productNames.and(page.getByText(name, { exact: true }))).toBeVisible();
  }

  await catalogPage.selectBrand('MightyCraft Hardware');
  await expect(catalogPage.categoryCheckbox('Pliers')).toBeChecked();
  await expect(catalogPage.brandCheckbox('MightyCraft Hardware')).toBeChecked();
  await expect(catalogPage.productNames).toHaveCount(mightyCraftPliers.length);
  for (const name of mightyCraftPliers) {
    await expect(catalogPage.productNames.and(page.getByText(name, { exact: true }))).toBeVisible();
  }
});
