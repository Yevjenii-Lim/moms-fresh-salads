import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { config } from '../../../config/keys';

// Initialize Stripe with configuration and custom HTTP settings
const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2025-09-30.clover',
  timeout: 30000, // 30 second timeout
  maxNetworkRetries: 3,
  httpClient: Stripe.createFetchHttpClient(),
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
  image?: string;
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

// Email sending function (moved to webhook)
// async function sendOrderConfirmationEmail(orderData: {
  sessionId: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
    instructions: string;
  };
  items: CartItem[];
  total: number;
  subtotal: number;
  tax: number;
}) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.email.user,
        pass: config.email.password,
      },
    });

    // Customer email
    const customerEmailHtml = `
      <h2>Thank you for your order!</h2>
      <p>Hi ${orderData.customerInfo.name},</p>
      <p>We've received your order and are preparing it for you.</p>
      
      <h3>Order Details:</h3>
      <p><strong>Order ID:</strong> ${orderData.sessionId}</p>
      
      <h3>Items:</h3>
      ${orderData.items.map(item => `
        <div style="border: 1px solid #ddd; padding: 10px; margin: 5px 0;">
          <strong>${item.name}</strong><br>
          Quantity: ${item.quantity}<br>
          Price: $${item.price.toFixed(2)} each
        </div>
      `).join('')}
      
      <p><strong>Subtotal:</strong> $${orderData.subtotal.toFixed(2)}</p>
      <p><strong>Tax:</strong> $${orderData.tax.toFixed(2)}</p>
      <p><strong>Total:</strong> $${orderData.total.toFixed(2)}</p>
      
      <p>We'll send you another email when your order is ready for pickup!</p>
      <p>Thank you for choosing Mom&apos;s Fresh Salads!</p>
    `;

    // Business email
    const businessEmailHtml = `
      <h2>New Order Received</h2>
      <p><strong>Order ID:</strong> ${orderData.sessionId}</p>
      
      <h3>Customer Information:</h3>
      <p><strong>Name:</strong> ${orderData.customerInfo.name}</p>
      <p><strong>Email:</strong> ${orderData.customerInfo.email}</p>
      <p><strong>Phone:</strong> ${orderData.customerInfo.phone}</p>
      <p><strong>Address:</strong> ${orderData.customerInfo.address}</p>
      ${orderData.customerInfo.instructions ? `<p><strong>Special Instructions:</strong> ${orderData.customerInfo.instructions}</p>` : ''}
      
      <h3>Order Items:</h3>
      ${orderData.items.map(item => `
        <div style="border: 1px solid #ddd; padding: 10px; margin: 5px 0;">
          <strong>${item.name}</strong><br>
          Quantity: ${item.quantity}<br>
          Price: $${item.price.toFixed(2)} each
        </div>
      `).join('')}
      
      <p><strong>Subtotal:</strong> $${orderData.subtotal.toFixed(2)}</p>
      <p><strong>Tax:</strong> $${orderData.tax.toFixed(2)}</p>
      <p><strong>Total:</strong> $${orderData.total.toFixed(2)}</p>
    `;

    // Send customer email
    await transporter.sendMail({
      from: config.email.user,
      to: orderData.customerInfo.email,
      subject: `Order Confirmation - ${orderData.sessionId}`,
      html: customerEmailHtml,
    });

    // Send business email
    await transporter.sendMail({
      from: config.email.user,
      to: config.email.user, // Send to business email
      subject: `New Order - ${orderData.sessionId}`,
      html: businessEmailHtml,
    });

    console.log('Order confirmation email sent to:', orderData.customerInfo.email);
    console.log('Business notification email sent');

  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Create checkout session called - version 2.0.1');
    console.log('🔧 Configuration status:', {
      stripeKeyPresent: !!config.stripe.secretKey,
      stripeKeyValid: config.hasValidStripeKey,
      emailConfigValid: config.hasValidEmailConfig,
      nodeEnv: process.env.NODE_ENV
    });

    const { items, customerInfo, subtotal, tax, total }: {
      items: CartItem[];
      customerInfo: CustomerInfo;
      subtotal: number;
      tax: number;
      total: number;
    } = await request.json();

    console.log('📦 Request data received:', {
      itemsCount: items.length,
      items: items.map(item => ({ id: item.id, name: item.name, price: item.price, quantity: item.quantity })),
      customerEmail: customerInfo.email,
      total: total
    });

    // Create Stripe checkout session
    console.log('🎯 Creating Stripe checkout session...');
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

    // Emails will be sent via webhook after payment completion
    console.log('✅ Checkout session created - emails will be sent via webhook after payment');

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('❌ Error creating checkout session:', error);
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
      configStatus: {
        stripeKeyPresent: !!config.stripe.secretKey,
        stripeKeyValid: config.hasValidStripeKey,
        emailConfigValid: config.hasValidEmailConfig
      }
    });
    return NextResponse.json(
      { 
        error: 'Failed to create checkout session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}