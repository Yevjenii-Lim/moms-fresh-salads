import { NextResponse } from 'next/server';
import { config } from '../../../config/keys';

export async function GET() {
  try {
    console.log('🧪 Webhook test endpoint called');
    
    const testResult = {
      status: 'webhook-test',
      timestamp: new Date().toISOString(),
      config: {
        webhookSecret: config.stripe.webhookSecret ? 'present' : 'missing',
        webhookSecretPreview: config.stripe.webhookSecret ? config.stripe.webhookSecret.substring(0, 8) + '...' : 'missing',
        emailUser: config.email.user ? 'present' : 'missing',
        emailPassword: config.email.password ? 'present' : 'missing',
        hasValidWebhookSecret: config.hasValidWebhookSecret,
        hasValidEmailConfig: config.hasValidEmailConfig
      }
    };

    console.log('✅ Webhook test result:', testResult);
    
    return NextResponse.json(testResult);
  } catch (error) {
    console.error('❌ Webhook test error:', error);
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
