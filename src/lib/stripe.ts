const priceId = (import.meta as any).env?.VITE_STRIPE_PRICE_ID || '';

/**
 * Redirects the current user to Stripe Checkout.
 * Creates a session via our Vercel API route, then redirects to the Stripe-hosted checkout URL.
 */
export async function redirectToCheckout(userId: string, userEmail: string): Promise<void> {
    const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            priceId,
            userId,
            userEmail,
            successUrl: `${window.location.origin}?payment=success`,
            cancelUrl: `${window.location.origin}?payment=cancelled`,
        }),
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to create checkout session');
    }

    const { url } = await response.json();
    window.location.href = url; // Redirect directly to Stripe-hosted checkout
}

/**
 * Opens the Stripe customer portal so users can manage/cancel their subscription.
 */
export async function redirectToCustomerPortal(stripeCustomerId: string): Promise<void> {
    const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            customerId: stripeCustomerId,
            returnUrl: window.location.origin,
        }),
    });

    if (!response.ok) throw new Error('Failed to open customer portal');
    const { url } = await response.json();
    window.location.href = url;
}
