import type { Page, Locator } from '@playwright/test';

export class ProductDetailsPage {
  readonly productName: Locator;
  readonly addToCartButton: Locator;
  readonly quantity: Locator;
  readonly unitPrice: Locator;
  readonly category: Locator;
  readonly brand: Locator;
  readonly description: Locator;
  readonly productImage: Locator;

  constructor(page: Page) {
    this.productName = page.locator('[data-test="product-name"]');
    this.addToCartButton = page.locator('[data-test="add-to-cart"]');
    this.quantity = page.locator('[data-test="quantity"]');
    this.unitPrice = page.getByLabel('unit-price', { exact: true });
    this.category = page.getByLabel('category', { exact: true });
    this.brand = page.getByLabel('brand', { exact: true });
    this.description = page.locator('[data-test="product-description"]');
    this.productImage = page.getByRole('figure').getByRole('img');
  }

  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
  }
}
