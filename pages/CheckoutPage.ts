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
  }

  async proceedToBilling(): Promise<void> {
    await this.continueToBillingButton.click();
  }
}
