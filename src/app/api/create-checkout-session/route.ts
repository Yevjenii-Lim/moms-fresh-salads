import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { SSMClient, GetParametersCommand } from '@aws-sdk/client-ssm';

// Initialize Stripe with fallback to hardcoded values for now
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_51SFfWqHnVjBVIfuofgwchTR1tAdOz38UFFcQr6TpQzcvNmxbVJkL...', {
  apiVersion: '2025-09-30.clover',
});

// AWS SSM client for parameter store
const ssmClient = new SSMClient({ region: process.env.AWS_REGION || 'us-east-1' });

// Function to get environment variables from SSM Parameter Store
async function getEnvironmentVariables() {
  try {
    const command = new GetParametersCommand({
      Names: [
        '/amplify/moms-fresh-salads/main/STRIPE_SECRET_KEY',
        '/amplify/moms-fresh-salads/main/GMAIL_USER', 
        '/amplify/moms-fresh-salads/main/GMAIL_APP_PASSWORD'
      ],
      WithDecryption: true
    });
    
    const response = await ssmClient.send(command);
    
    const envVars: Record<string, string> = {};
    response.Parameters?.forEach(param => {
      if (param.Name && param.Value) {
        const key = param.Name.split('/').pop();
        if (key) envVars[key] = param.Value;
      }
    });
    
    return envVars;
  } catch (error) {
    console.error('Error fetching parameters from SSM:', error);
    // Fallback to hardcoded values for development
    return {
      STRIPE_SECRET_KEY: 'sk_test_51SFfWqHnVjBVIfuofgwchTR1tAdOz38UFFcQr6TpQzcvNmxbVJkL...',
      GMAIL_USER: 'yevhenii.lim27@gmail.com',
      GMAIL_APP_PASSWORD: 'xltwktluzwnbbcsj'
    };
  }
}

interface CartItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  quantity: number;
}

interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  instructions?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Get environment variables from SSM Parameter Store
    const envVars = await getEnvironmentVariables();
    
    // Initialize Stripe with the correct secret key
    const stripeWithCorrectKey = new Stripe(envVars.STRIPE_SECRET_KEY, {
      apiVersion: '2025-09-30.clover',
    });
    
    const { items, customerInfo, subtotal, tax, total }: {
      items: CartItem[];
      customerInfo: CustomerInfo;
      subtotal: number;
      tax: number;
      total: number;
    } = await request.json();

    // Create Stripe checkout session
    const session = await stripeWithCorrectKey.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map((item: CartItem) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            description: item.description,
            // Only include images if they are valid URLs (not emojis)
            ...(item.image && item.image.startsWith('http') ? { images: [item.image] } : {}),
          },
          unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${request.nextUrl.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/cancel`,
      customer_email: customerInfo.email,
      metadata: {
        orderId: Date.now().toString(),
        customerName: `${customerInfo.firstName} ${customerInfo.lastName}`,
        customerPhone: customerInfo.phone,
        customerAddress: customerInfo.address,
        specialInstructions: customerInfo.instructions || '',
        items: JSON.stringify(items),
        orderSummary: items.map((item: CartItem) =>
          `${item.quantity}x ${item.name} - $${(item.price * item.quantity).toFixed(2)}`
        ).join(' | '),
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2),
        itemCount: items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0)
      },
      phone_number_collection: {
        enabled: true,
      },
    });

    // Log order details for debugging
    console.log('Order created:', {
      sessionId: session.id,
      customerEmail: customerInfo.email,
      customerName: `${customerInfo.firstName} ${customerInfo.lastName}`,
      customerPhone: customerInfo.phone,
      amountTotal: total,
      orderItems: items,
      orderSummary: items.map((item: CartItem) =>
        `${item.quantity}x ${item.name} - $${(item.price * item.quantity).toFixed(2)}`
      ).join(' | '),
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2)
    });

    // For local development: Send emails immediately
    // In production: Emails will be sent via EventBridge after successful payment
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Development mode: Emails will be sent via EventBridge after payment completion');
      console.log('📧 To test emails locally, complete the EventBridge setup or use the test-email page');
    } else {
      console.log('✅ Checkout session created, emails will be sent via EventBridge after payment completion');
      console.log('🚀 Deployment version: ' + new Date().toISOString());
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}