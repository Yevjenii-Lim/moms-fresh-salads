import { NextRequest, NextResponse } from 'next/server';
import { config } from '../../../config/keys';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Test checkout endpoint called');
    
    // Test basic request parsing
    const body = await request.json();
    console.log('📦 Request body received:', {
      hasItems: !!body.items,
      itemsLength: body.items?.length || 0,
      hasCustomerInfo: !!body.customerInfo,
      customerEmail: body.customerInfo?.email,
      subtotal: body.subtotal,
      tax: body.tax,
      total: body.total
    });

    // Test Stripe configuration
    console.log('🔧 Stripe config test:', {
      stripeKeyPresent: !!config.stripe.secretKey,
      stripeKeyValid: config.hasValidStripeKey,
      stripeKeyPreview: config.stripe.secretKey ? config.stripe.secretKey.substring(0, 8) + '...' : 'missing'
    });

    // Test basic Stripe import
    const Stripe = require('stripe');
    console.log('✅ Stripe import successful');

    // Test Stripe initialization
    const stripe = new Stripe(config.stripe.secretKey, {
      apiVersion: '2025-09-30.clover',
    });
    console.log('✅ Stripe client initialized');

    return NextResponse.json({ 
      success: true, 
      message: 'Test successful',
      config: {
        stripeKeyPresent: !!config.stripe.secretKey,
        stripeKeyValid: config.hasValidStripeKey
      }
    });

  } catch (error) {
    console.error('❌ Test checkout error:', error);
    return NextResponse.json(
      { 
        error: 'Test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
