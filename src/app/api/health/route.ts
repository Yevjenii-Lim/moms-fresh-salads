import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      stripeKey: process.env.STRIPE_SECRET_KEY ? 'present' : 'missing',
      gmailUser: process.env.GMAIL_USER ? 'present' : 'missing',
      gmailPassword: process.env.GMAIL_APP_PASSWORD ? 'present' : 'missing',
      stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'present' : 'missing',
      // Debug info (first few characters only for security)
      stripeKeyPreview: process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.substring(0, 10) + '...' : 'not found',
      version: '1.0.1',
      deploymentTrigger: 'env-vars-fix'
    };

    return NextResponse.json(healthCheck);
  } catch (error) {
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
