import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { config } from '../../../config/keys';

// Initialize Stripe with configuration
const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2024-06-20',
});

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Simple checkout test started');
    
    // Test with minimal data
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Test Salad',
            description: 'A simple test salad'
          },
          unit_amount: 1000 // $10.00
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: `${request.nextUrl.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/cancel`
    });

    console.log('✅ Simple checkout session created:', session.id);

    return NextResponse.json({ 
      success: true, 
      sessionId: session.id,
      url: session.url 
    });
    
  } catch (error) {
    console.error('❌ Simple checkout error:', error);
    return NextResponse.json(
      { 
        error: 'Simple checkout failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
