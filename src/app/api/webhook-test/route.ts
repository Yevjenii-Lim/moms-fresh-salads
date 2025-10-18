import { NextRequest, NextResponse } from 'next/server';
import { addWebhookLog } from '../webhook-logs/route';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Webhook test endpoint called');
    addWebhookLog('🧪 Webhook test endpoint called');
    
    const body = await request.text();
    console.log('📦 Request body length:', body.length);
    addWebhookLog(`📦 Request body length: ${body.length}`);
    
    const headers = Object.fromEntries(request.headers.entries());
    console.log('📋 Request headers:', headers);
    addWebhookLog(`📋 Request headers: ${JSON.stringify(headers)}`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Webhook test successful',
      timestamp: new Date().toISOString(),
      bodyLength: body.length,
      hasStripeSignature: !!headers['stripe-signature']
    });

  } catch (error) {
    console.error('❌ Webhook test error:', error);
    addWebhookLog(`❌ Webhook test error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Webhook test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}