import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: Request) {
  try {
    const { quantity, message } = await req.json();
    const origin = req.headers.get('origin') || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Invítame a ${quantity} café${quantity > 1 ? 's' : ''}`,
              description: 'Gracias por apoyar a Olian Labs para que sigamos siendo independientes.',
            },
            unit_amount: 500, // 5€ per coffee
          },
          quantity: quantity,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/apoyar-proyecto?success=true`,
      cancel_url: `${origin}/apoyar-proyecto?cancel=true`,
      metadata: {
        coffees_received: quantity.toString(),
        support_message: message || '',
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe Session Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
