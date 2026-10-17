import type { Page, Locator } from '@playwright/test';

export class ProductDetailsPage {
  readonly productName: Locator;
  readonly addToCartButton: Locator;

  constructor(page: Page) {
    this.productName = page.locator('[data-test="product-name"]');
    this.addToCartButton = page.locator('[data-test="add-to-cart"]');
  }
}
