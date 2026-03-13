import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { PurchaseThankYouEmail } from '@/lib/email-templates';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
});

const resend = new Resend(process.env.RESEND_API_KEY!);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
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
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      const customerId = session.customer as string;
      const customerEmail = session.customer_details?.email;
      const customerName = session.customer_details?.name || 'Valued Customer';
      const amountTotal = session.amount_total ? session.amount_total / 100 : 0;

      const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
        limit: 1,
      });

      if (!lineItems.data.length) {
        throw new Error('No line items found in session');
      }

      const priceId = lineItems.data[0].price?.id;

      if (!priceId) {
        throw new Error('No price ID found in line items');
      }

      const { data: product, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('stripe_price_id', priceId)
        .maybeSingle();

      if (productError || !product) {
        throw new Error(`Product not found for price ID: ${priceId}`);
      }

      let userId: string | null = null;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .maybeSingle();

      if (profile) {
        userId = profile.id;
      } else {
        const { data: profileByEmail, error: profileByEmailError } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', customerEmail)
          .maybeSingle();

        if (profileByEmail) {
          userId = profileByEmail.id;

          await supabase
            .from('profiles')
            .update({ stripe_customer_id: customerId })
            .eq('id', userId);
        }
      }

      const purchaseData = {
        user_id: userId,
        product_id: product.id,
        stripe_session_id: session.id,
        purchase_date: new Date().toISOString(),
      };

      const { error: purchaseError } = await supabase
        .from('user_purchases')
        .insert(purchaseData);

      if (purchaseError) {
        console.error('Error creating user_purchase:', purchaseError);
      }

      const { error: legacyPurchaseError } = await supabase
        .from('purchases')
        .insert({
          user_id: userId,
          product_id: product.id,
          stripe_session_id: session.id,
          stripe_payment_intent: session.payment_intent as string,
          amount: amountTotal,
          status: 'completed',
          purchased_at: new Date().toISOString(),
        });

      if (legacyPurchaseError) {
        console.error('Error creating purchase record:', legacyPurchaseError);
      }

      if (product.type === 'saas' && userId) {
        await supabase
          .from('profiles')
          .update({ is_subscribed: true })
          .eq('id', userId);
      }

      if (customerEmail) {
        const emailHtml = PurchaseThankYouEmail({
          customerName,
          productName: product.name,
          productType: product.type === 'template' ? 'template' : 'saas',
          amount: amountTotal,
          purchaseDate: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
        });

        await resend.emails.send({
          from: 'Atelier <support@fulatelier.com>',
          to: customerEmail,
          subject: `Thank you for your purchase - ${product.name}`,
          html: emailHtml,
        });
      }

      return NextResponse.json({
        received: true,
        userId,
        productId: product.id,
        emailSent: !!customerEmail,
      });
    } catch (error: any) {
      console.error('Error processing checkout.session.completed:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}
