import { test, expect } from '@playwright/test';
import { CatalogPage } from '../../../pages/catalog/CatalogPage';

test('visitor browses next previous and numbered catalog pages with the expected product sets', { tag: ['@ui', '@catalog', '@regression'] }, async ({ page }) => {
  const catalogPage = new CatalogPage(page);
  const firstPageProducts = [
    'Combination Pliers', 'Pliers', 'Bolt Cutters', 'Long Nose Pliers', 'Slip Joint Pliers',
    'Claw Hammer with Shock Reduction Grip', 'Hammer', 'Claw Hammer', 'Thor Hammer',
  ];
  const secondPageProducts = [
    'Sledgehammer', 'Claw Hammer with Fiberglass Handle', 'Court Hammer', 'Wood Saw',
    'Adjustable Wrench', 'Angled Spanner', 'Open-end Spanners (Set)', 'Phillips Screwdriver', 'Mini Screwdriver',
  ];
  const lastPageProducts = [
    'Washers', 'Drawer Tool Cabinet', 'Tool Cabinet', 'Leather toolbelt', 'Sheet Sander',
    'Belt Sander', 'Circular Saw', 'Cordless Drill 24V', 'Cordless Drill 12V',
  ];

  await catalogPage.goto();
  await expect(catalogPage.productNames).toHaveCount(firstPageProducts.length);
  for (const name of firstPageProducts) {
    await expect(catalogPage.productNames.and(page.getByText(name, { exact: true }))).toBeVisible();
  }
  await expect(page.getByRole('button', { name: 'Page-5', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Page-6', exact: true })).toHaveCount(0);

  await catalogPage.goToNextPage();
  await expect(catalogPage.productNames).toHaveCount(secondPageProducts.length);
  for (const name of secondPageProducts) {
    await expect(catalogPage.productNames.and(page.getByText(name, { exact: true }))).toBeVisible();
  }

  await catalogPage.goToPreviousPage();
  await expect(catalogPage.productNames).toHaveCount(firstPageProducts.length);
  for (const name of firstPageProducts) {
    await expect(catalogPage.productNames.and(page.getByText(name, { exact: true }))).toBeVisible();
  }

  await catalogPage.goToPage(5);
  await expect(catalogPage.productNames).toHaveCount(lastPageProducts.length);
  for (const name of lastPageProducts) {
    await expect(catalogPage.productNames.and(page.getByText(name, { exact: true }))).toBeVisible();
  }

  await catalogPage.goToPage(1);
  await expect(catalogPage.productNames).toHaveCount(firstPageProducts.length);
  for (const name of firstPageProducts) {
    await expect(catalogPage.productNames.and(page.getByText(name, { exact: true }))).toBeVisible();
  }
});
