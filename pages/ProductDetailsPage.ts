import type { Page, Locator } from '@playwright/test';

export class ProductDetailsPage {
  readonly productName: Locator;
  readonly addToCartButton: Locator;
  readonly quantity: Locator;

  constructor(page: Page) {
    this.productName = page.locator('[data-test="product-name"]');
    this.addToCartButton = page.locator('[data-test="add-to-cart"]');
    this.quantity = page.locator('[data-test="quantity"]');
  }

  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
  }
}
