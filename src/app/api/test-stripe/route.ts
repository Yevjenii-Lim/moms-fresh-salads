import { NextRequest, NextResponse } from 'next/server';
import { config } from '../../../config/keys';

export async function GET() {
  try {
    console.log('🧪 Testing Stripe configuration...');
    
    // Test 1: Check configuration loading
    const configStatus = {
      stripeKeyPresent: !!config.stripe.secretKey,
      stripeKeyValid: config.hasValidStripeKey,
      stripeKeyPreview: config.stripe.secretKey ? config.stripe.secretKey.substring(0, 10) + '...' : 'missing',
      emailConfigValid: config.hasValidEmailConfig,
      nodeEnv: process.env.NODE_ENV
    };
    
    console.log('🔧 Configuration status:', configStatus);
    
    // Test 2: Try importing Stripe
    let stripeImport;
    try {
      const Stripe = require('stripe');
      stripeImport = 'success';
      console.log('✅ Stripe import successful');
    } catch (error) {
      console.error('❌ Stripe import failed:', error);
      stripeImport = 'failed';
    }
    
    // Test 3: Try initializing Stripe
    let stripeInit;
    try {
      const Stripe = require('stripe');
      const stripe = new Stripe(config.stripe.secretKey, {
        apiVersion: '2025-09-30.clover',
      });
      stripeInit = 'success';
      console.log('✅ Stripe initialization successful');
    } catch (error) {
      console.error('❌ Stripe initialization failed:', error);
      stripeInit = 'failed';
      stripeInit = error instanceof Error ? error.message : 'Unknown error';
    }
    
    return NextResponse.json({
      status: 'test-complete',
      timestamp: new Date().toISOString(),
      tests: {
        configStatus,
        stripeImport,
        stripeInit
      }
    });
    
  } catch (error) {
    console.error('❌ Test endpoint error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
