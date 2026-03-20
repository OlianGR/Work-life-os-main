import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sendThankYouEmail } from '@/lib/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

export async function POST(req: Request) {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    let event: Stripe.Event;

    try {
        if (!signature || !webhookSecret) {
            throw new Error('Stripe Signature or Webhook Secret is missing.');
        }
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const coffeesReceived = parseInt(session.metadata?.coffees_received || '0', 10);
        const supportMessage = session.metadata?.support_message || '';
        const customerEmail = session.customer_details?.email;
        const customerName = session.customer_details?.name || 'amigo';

        if (coffeesReceived > 0) {
            console.log(`Donación recibida: ${coffeesReceived} cafés de ${customerEmail}.`);

            // 1. Update database
            const { error } = await supabaseAdmin.rpc('increment_coffee_count', {
                p_amount: coffeesReceived
            });

            if (error) {
                console.error('Error updating site statistics:', error);
            }

            // 2. Send Thank You Email via Resend
            if (customerEmail) {
                try {
                    await sendThankYouEmail(customerEmail, customerName, coffeesReceived, supportMessage);
                    console.log(`Email de agradecimiento enviado a: ${customerEmail}`);
                } catch (emailErr) {
                    console.error('Failed to send thank you email:', emailErr);
                }
            }
        }
    }

    return NextResponse.json({ received: true });
}

// Disable Next.js default body parsing for webhooks
export const config = {
    api: {
        bodyParser: false,
    },
};
