import type { Page, Locator } from '@playwright/test';

export class CheckoutPage {
  readonly loginEmail: Locator;
  readonly loginPassword: Locator;
  readonly loginSubmit: Locator;
  readonly guestOption: Locator;
  readonly signedInNotice: Locator;
  readonly continueToBillingButton: Locator;
  readonly billingHeading: Locator;
  readonly billingStreet: Locator;
  readonly billingProceedButton: Locator;
  readonly paymentMethod: Locator;
  readonly billingCountry: Locator;
  readonly billingPostalCode: Locator;
  readonly billingHouseNumber: Locator;
  readonly billingCity: Locator;
  readonly billingState: Locator;
  readonly paymentSuccess: Locator;
  readonly confirmButton: Locator;
  readonly orderConfirmation: Locator;

  constructor(page: Page) {
    const checkout = page.locator('app-checkout');
    const identity = checkout.locator('app-login');
    // Guest email has the same label; scope credential controls to the sign-in tab.
    const signIn = identity.locator('#signin-tab');
    this.loginEmail = signIn.locator('[data-test="email"]');
    this.loginPassword = signIn.locator('[data-test="password"]');
    this.loginSubmit = signIn.locator('[data-test="login-submit"]');
    this.guestOption = identity.getByRole('tab', { name: 'Continue as Guest', exact: true });
    this.signedInNotice = identity.getByText(/you are already logged in/);
    this.continueToBillingButton = identity.locator('[data-test="proceed-2"]');
    this.billingHeading = checkout.getByRole('heading', { name: 'Billing Address', exact: true });
    this.billingStreet = checkout.locator('app-address [data-test="street"]');
    this.billingProceedButton = checkout.locator('[data-test="proceed-3"]');
    this.paymentMethod = checkout.locator('[data-test="payment-method"]');
    this.billingCountry = checkout.locator('app-address [data-test="country"]');
    this.billingPostalCode = checkout.locator('app-address [data-test="postal_code"]');
    this.billingHouseNumber = checkout.locator('app-address [data-test="house_number"]');
    this.billingCity = checkout.locator('app-address [data-test="city"]');
    this.billingState = checkout.locator('app-address [data-test="state"]');
    this.paymentSuccess = checkout.locator('[data-test="payment-success-message"]');
    this.confirmButton = checkout.locator('[data-test="finish"]');
    this.orderConfirmation = checkout.locator('#order-confirmation');
  }

  async proceedToBilling(): Promise<void> {
    await this.continueToBillingButton.click();
  }

  async enterBillingLocation(country: string, postcode: string, houseNumber: string): Promise<void> {
    await this.billingCountry.selectOption(country);
    await this.billingPostalCode.fill(postcode);
    await this.billingHouseNumber.fill(houseNumber);
  }

  async proceedToPayment(): Promise<void> {
    await this.billingProceedButton.click();
  }

  async selectCashOnDelivery(): Promise<void> {
    await this.paymentMethod.selectOption('cash-on-delivery');
  }

  async confirm(): Promise<void> {
    await this.confirmButton.click();
  }
}
