import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-02-25.clover',
});

const supabase = createClient(
  process.env.SB_URL!,
  process.env.SB_SERVICE_ROLE_KEY!
);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        const userId = session.metadata?.user_id;
        const productId = session.metadata?.product_id;

        if (!userId || !productId) {
          console.error('Missing user_id or product_id in session metadata');
          return NextResponse.json(
            { error: 'Missing metadata' },
            { status: 400 }
          );
        }

        const { data: product, error: productError } = await supabase
          .from('products')
          .select('price')
          .eq('id', productId)
          .single();

        if (productError) {
          console.error('Error fetching product:', productError);
          return NextResponse.json(
            { error: 'Product not found' },
            { status: 404 }
          );
        }

        const { error: purchaseError } = await supabase
          .from('purchases')
          .insert([
            {
              user_id: userId,
              product_id: productId,
              stripe_session_id: session.id,
              stripe_payment_intent: session.payment_intent as string,
              amount: product.price,
              status: 'completed',
              purchased_at: new Date().toISOString(),
            },
          ]);

        if (purchaseError) {
          console.error('Error creating purchase:', purchaseError);
          return NextResponse.json(
            { error: 'Failed to create purchase record' },
            { status: 500 }
          );
        }

        console.log('Purchase completed:', {
          userId,
          productId,
          sessionId: session.id,
        });

        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment succeeded:', paymentIntent.id);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.error('Payment failed:', paymentIntent.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
