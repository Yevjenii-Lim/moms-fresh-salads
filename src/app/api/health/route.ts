import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get all environment variables that start with common prefixes
    const allEnvVars = Object.keys(process.env)
      .filter(key => key.includes('STRIPE') || key.includes('GMAIL'))
      .reduce((acc, key) => {
        acc[key] = process.env[key] ? 'present' : 'missing';
        return acc;
      }, {} as Record<string, string>);

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
      // Show all environment variables with STRIPE/GMAIL in the name
      allStripeGmailVars: allEnvVars,
      // Show total count of all env vars
      totalEnvVars: Object.keys(process.env).length,
      version: '1.0.3',
      deploymentTrigger: 'manual-redeploy-fix'
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
