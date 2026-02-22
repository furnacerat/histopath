// Vercel serverless function: creates a Stripe Customer Portal session
// POST /api/create-portal-session
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2024-11-20.acacia',
});

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { customerId, returnUrl } = req.body;

    if (!customerId) {
        return res.status(400).json({ error: 'Missing customerId' });
    }

    try {
        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: returnUrl,
        });

        res.status(200).json({ url: session.url });
    } catch (err) {
        console.error('Stripe portal error:', err);
        res.status(500).json({ error: err.message });
    }
}
