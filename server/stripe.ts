import Stripe from "stripe";

const stripeSecret = process.env.STRIPE_SECRET_KEY || "sk_test_placeholder";
export const stripe = new Stripe(stripeSecret);

export async function createStripeCustomer(email: string, name?: string) {
  return stripe.customers.create({
    email,
    name,
  });
}

export async function createMonthlySubscription(customerId: string) {
  return stripe.subscriptions.create({
    customer: customerId,
    items: [
      {
        price: process.env.STRIPE_MONTHLY_PRICE_ID || "price_test_monthly",
      },
    ],
  });
}

export async function createLifetimeSubscription(customerId: string) {
  return stripe.invoices.create({
    customer: customerId,
    collection_method: "send_invoice",
    days_until_due: 7,
  });
}

export async function applyStripeDiscount(customerId: string, couponCode: string) {
  try {
    return await stripe.customers.update(customerId, {
      description: `Coupon applied: ${couponCode}`,
    });
  } catch (error) {
    console.error("Failed to apply coupon:", error);
    return null;
  }
}

export async function getStripeSubscription(subscriptionId: string) {
  return stripe.subscriptions.retrieve(subscriptionId);
}

export async function cancelStripeSubscription(subscriptionId: string) {
  return stripe.subscriptions.cancel(subscriptionId);
}
