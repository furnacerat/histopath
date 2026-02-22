// Vercel serverless function: handles Stripe webhooks
// POST /api/stripe-webhook
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2024-11-20.acacia',
});

const supabase = createClient(
    process.env.VITE_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || '' // service role bypasses RLS
);

export const config = { api: { bodyParser: false } };

async function getRawBody(req) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        req.on('data', chunk => chunks.push(chunk));
        req.on('end', () => resolve(Buffer.concat(chunks)));
        req.on('error', reject);
    });
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const sig = req.headers['stripe-signature'];
    const rawBody = await getRawBody(req);

    let event;
    try {
        event = stripe.webhooks.constructEvent(
            rawBody,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET || ''
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    try {
        switch (event.type) {
            // Payment succeeded → grant access
            case 'checkout.session.completed': {
                const session = event.data.object;
                const userId = session.metadata?.supabase_user_id;
                const customerId = session.customer;

                if (userId) {
                    await supabase
                        .from('profiles')
                        .update({ plan: 'pro', stripe_customer_id: customerId })
                        .eq('id', userId);

                    console.log(`✅ Granted pro access to user ${userId}`);
                }
                break;
            }

            // Subscription renewed → keep access
            case 'invoice.payment_succeeded': {
                const invoice = event.data.object;
                const customerId = invoice.customer;

                if (customerId) {
                    await supabase
                        .from('profiles')
                        .update({ plan: 'pro' })
                        .eq('stripe_customer_id', customerId);
                }
                break;
            }

            // Subscription cancelled or payment failed → revoke access
            case 'customer.subscription.deleted':
            case 'invoice.payment_failed': {
                const obj = event.data.object;
                const customerId = obj.customer;

                if (customerId) {
                    await supabase
                        .from('profiles')
                        .update({ plan: 'free' })
                        .eq('stripe_customer_id', customerId);

                    console.log(`🔒 Revoked access for Stripe customer ${customerId}`);
                }
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        res.status(200).json({ received: true });
    } catch (err) {
        console.error('Error processing webhook:', err);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
}
