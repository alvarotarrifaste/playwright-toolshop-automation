import type { Page, Locator } from '@playwright/test';

export class CatalogPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly searchCompleted: Locator;
  readonly searchResultCount: Locator;
  readonly productNames: Locator;
  readonly categoryCheckboxes: Locator;
  readonly selectedCategoryCheckboxes: Locator;
  readonly filterCompleted: Locator;
  readonly brandCheckboxes: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.getByPlaceholder('Search', { exact: true });
    this.searchButton = page.getByRole('button', { name: 'Search', exact: true });
    this.searchCompleted = page.locator('[data-test="search_completed"]');
    this.searchResultCount = page.locator('[data-test="search-result-count"]');
    this.productNames = page.locator('[data-test="product-name"]');
    this.categoryCheckboxes = page.locator('input[name="category_id"]');
    this.selectedCategoryCheckboxes = page.locator('input[name="category_id"]:checked');
    this.filterCompleted = page.locator('[data-test="filter_completed"]');
    this.brandCheckboxes = page.locator('input[name="brand_id"]');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  async search(term: string): Promise<void> {
    await this.searchInput.fill(term);
    await this.searchButton.click();
  }

  async openProduct(name: string): Promise<void> {
    await this.productNames.and(this.page.getByText(name, { exact: true })).click();
  }

  categoryCheckbox(name: string): Locator {
    return this.categoryCheckboxes.and(this.page.getByRole('checkbox', { name, exact: true }));
  }

  async selectCategory(name: string): Promise<void> {
    await this.categoryCheckbox(name).check();
  }

  async clearCategory(name: string): Promise<void> {
    await this.categoryCheckbox(name).uncheck();
  }

  brandCheckbox(name: string): Locator {
    return this.brandCheckboxes.and(this.page.getByRole('checkbox', { name, exact: true }));
  }

  async selectBrand(name: string): Promise<void> {
    await this.brandCheckbox(name).check();
  }

  async clearBrand(name: string): Promise<void> {
    await this.brandCheckbox(name).uncheck();
  }

  async goToNextPage(): Promise<void> {
    await this.page.getByRole('button', { name: 'Next', exact: true }).click();
  }

  async goToPreviousPage(): Promise<void> {
    await this.page.getByRole('button', { name: 'Previous', exact: true }).click();
  }

  async goToPage(pageNumber: number): Promise<void> {
    await this.page.getByRole('button', { name: `Page-${pageNumber}`, exact: true }).click();
  }
}
