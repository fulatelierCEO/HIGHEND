import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, price, type, features, image_url } = body;

    if (!name || !price || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: name, price, and type are required' },
        { status: 400 }
      );
    }

    const priceInCents = Math.round(parseFloat(price) * 100);

    const stripeProduct = await stripe.products.create({
      name,
      description: description || undefined,
      images: image_url ? [image_url] : undefined,
      metadata: {
        type,
      },
    });

    const stripePrice = await stripe.prices.create({
      product: stripeProduct.id,
      unit_amount: priceInCents,
      currency: 'usd',
      recurring: type === 'saas' ? { interval: 'month' } : undefined,
    });

    const { data: product, error: dbError } = await supabase
      .from('products')
      .insert({
        name,
        description,
        type,
        price: parseFloat(price),
        stripe_price_id: stripePrice.id,
        stripe_product_id: stripeProduct.id,
        status: 'live',
        image_url,
        features,
      })
      .select()
      .single();

    if (dbError) {
      await stripe.products.update(stripeProduct.id, { active: false });
      throw new Error(`Database error: ${dbError.message}`);
    }

    return NextResponse.json({
      success: true,
      product,
      stripeProduct,
      stripePrice,
    });
  } catch (error: any) {
    console.error('Product creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create product' },
      { status: 500 }
    );
  }
}
