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

    // Check if we can see ANY environment variables at all
    const sampleEnvVars = {
      NODE_ENV: process.env.NODE_ENV ? 'present' : 'missing',
      PATH: process.env.PATH ? 'present' : 'missing',
      AWS_REGION: process.env.AWS_REGION ? 'present' : 'missing',
      AWS_LAMBDA_FUNCTION_NAME: process.env.AWS_LAMBDA_FUNCTION_NAME ? 'present' : 'missing',
      // Try some Amplify-specific vars
      AMPLIFY_APP_ID: process.env.AMPLIFY_APP_ID ? 'present' : 'missing',
      AMPLIFY_BRANCH: process.env.AMPLIFY_BRANCH ? 'present' : 'missing',
    };

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
      // Show sample environment variables to debug
      sampleEnvVars: sampleEnvVars,
      // Show total count of all env vars
      totalEnvVars: Object.keys(process.env).length,
      // Show first 10 env var names for debugging
      firstTenEnvVars: Object.keys(process.env).slice(0, 10),
      version: '1.0.4',
      deploymentTrigger: 'debug-env-injection'
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
