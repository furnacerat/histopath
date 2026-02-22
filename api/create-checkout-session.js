// Vercel serverless function: creates a Stripe Checkout Session
// POST /api/create-checkout-session
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2024-11-20.acacia',
});

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { priceId, userId, userEmail, successUrl, cancelUrl } = req.body;

    if (!priceId || !userId) {
        return res.status(400).json({ error: 'Missing priceId or userId' });
    }

    try {
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [{ price: priceId, quantity: 1 }],
            customer_email: userEmail,
            metadata: { supabase_user_id: userId },
            success_url: successUrl,
            cancel_url: cancelUrl,
            allow_promotion_codes: true,
        });

        res.status(200).json({ url: session.url });
    } catch (err) {
        console.error('Stripe checkout error:', err);
        res.status(500).json({ error: err.message });
    }
}
