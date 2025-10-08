import { NextResponse } from 'next/server';
import { config } from '../../../config/keys';

export async function GET() {
  try {
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      // Configuration status
      stripeKey: config.stripe.secretKey ? 'present' : 'missing',
      gmailUser: config.email.user ? 'present' : 'missing',
      gmailPassword: config.email.password ? 'present' : 'missing',
      stripePublishableKey: config.stripe.publishableKey ? 'present' : 'missing',
      // Configuration validation
      hasValidStripeKey: config.hasValidStripeKey,
      hasValidEmailConfig: config.hasValidEmailConfig,
      // Environment variables status (for debugging)
      envStripeKey: process.env.STRIPE_SECRET_KEY ? 'present' : 'missing',
      envGmailUser: process.env.GMAIL_USER ? 'present' : 'missing',
      envGmailPassword: process.env.GMAIL_APP_PASSWORD ? 'present' : 'missing',
      // System info
      totalEnvVars: Object.keys(process.env).length,
      firstTenEnvVars: Object.keys(process.env).slice(0, 10),
               version: '2.0.1',
               deploymentTrigger: 'fix-deployment-cache-issue'
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
