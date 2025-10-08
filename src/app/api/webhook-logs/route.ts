import { NextResponse } from 'next/server';
import { config } from '../../../config/keys';

// Simple in-memory log storage (resets on each deployment)
let webhookLogs: string[] = [];

export function addWebhookLog(message: string) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}`;
  webhookLogs.push(logEntry);
  
  // Keep only last 50 logs to prevent memory issues
  if (webhookLogs.length > 50) {
    webhookLogs = webhookLogs.slice(-50);
  }
  
  console.log(logEntry); // Also log to console
}

export async function GET() {
  try {
    const status = {
      status: 'webhook-logs',
      timestamp: new Date().toISOString(),
      totalLogs: webhookLogs.length,
      logs: webhookLogs,
      config: {
        webhookSecret: config.stripe.webhookSecret ? 'present' : 'missing',
        webhookSecretPreview: config.stripe.webhookSecret ? config.stripe.webhookSecret.substring(0, 8) + '...' : 'missing',
        emailUser: config.email.user ? 'present' : 'missing',
        emailPassword: config.email.password ? 'present' : 'missing'
      }
    };

    return NextResponse.json(status);
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
