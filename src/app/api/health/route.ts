import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      stripeKey: process.env.STRIPE_SECRET_KEY ? 'present' : 'missing',
      gmailUser: process.env.GMAIL_USER ? 'present' : 'missing',
      version: '1.0.0'
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
