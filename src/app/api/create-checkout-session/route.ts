import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { config } from '../../../config/keys';

// Initialize Stripe with configuration
const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2025-09-30.clover',
});

console.log('Configuration check:', {
  stripeKey: config.stripe.secretKey ? 'present' : 'missing',
  gmailUser: config.email.user ? 'present' : 'missing',
  gmailPassword: config.email.password ? 'present' : 'missing',
  hasValidStripeKey: config.hasValidStripeKey,
  stripeInitialized: 'yes',
  deploymentVersion: '2.0.1-fix-deployment-cache'
});

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
    const { items, customerInfo, subtotal, tax, total }: {
      items: CartItem[];
      customerInfo: CustomerInfo;
      subtotal: number;
      tax: number;
      total: number;
    } = await request.json();

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
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
      console.log('🚀 Deployment version: 2.0.1-fix-deployment-cache - ' + new Date().toISOString());
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