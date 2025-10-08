import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import nodemailer from 'nodemailer';
import { config } from '../../../config/keys';

interface OrderData {
  sessionId: string;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    instructions: string;
  };
  items: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    quantity: number;
  }>;
  subtotal: string;
  tax: string;
  total: string;
  amountTotal: string;
}

// Initialize Stripe with configuration and custom HTTP settings
const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2025-09-30.clover',
  timeout: 30000,
  maxNetworkRetries: 3,
  httpClient: Stripe.createFetchHttpClient(),
});

// Email sending function
async function sendOrderConfirmationEmail(orderData: OrderData) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.email.user,
      pass: config.email.password,
    },
  });

  // Customer email
  const customerEmailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2d5a27;">Thank you for your order!</h2>
      <p>Hi ${orderData.customerInfo.firstName},</p>
      <p>Your order has been confirmed and is being prepared.</p>
      
      <h3>Order Details:</h3>
      <p><strong>Order ID:</strong> ${orderData.sessionId}</p>
      <p><strong>Total:</strong> $${orderData.total}</p>
      
      <h3>Items:</h3>
      <ul>
      ${orderData.items.map((item) => 
        `<li>${item.quantity}x ${item.name} - $${(item.price * item.quantity).toFixed(2)}</li>`
      ).join('')}
      </ul>
      
      <p>Thank you for choosing Mom's Fresh Salads!</p>
    </div>
  `;

  // Business notification email
  const businessEmailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2d5a27;">New Order Received</h2>
      
      <h3>Customer Information:</h3>
      <p><strong>Name:</strong> ${orderData.customerInfo.firstName} ${orderData.customerInfo.lastName}</p>
      <p><strong>Email:</strong> ${orderData.customerInfo.email}</p>
      <p><strong>Phone:</strong> ${orderData.customerInfo.phone}</p>
      <p><strong>Address:</strong> ${orderData.customerInfo.address}</p>
      ${orderData.customerInfo.instructions ? `<p><strong>Instructions:</strong> ${orderData.customerInfo.instructions}</p>` : ''}
      
      <h3>Order Details:</h3>
      <p><strong>Order ID:</strong> ${orderData.sessionId}</p>
      <p><strong>Subtotal:</strong> $${orderData.subtotal}</p>
      <p><strong>Tax:</strong> $${orderData.tax}</p>
      <p><strong>Total:</strong> $${orderData.total}</p>
      
      <h3>Items:</h3>
      <ul>
      ${orderData.items.map((item) => 
        `<li>${item.quantity}x ${item.name} - $${(item.price * item.quantity).toFixed(2)}</li>`
      ).join('')}
      </ul>
    </div>
  `;

  try {
    // Send customer confirmation
    await transporter.sendMail({
      from: config.email.user,
      to: orderData.customerInfo.email,
      subject: 'Order Confirmation - Mom\'s Fresh Salads',
      html: customerEmailHtml,
    });

    // Send business notification
    await transporter.sendMail({
      from: config.email.user,
      to: config.email.user, // Send to business email
      subject: `New Order - ${orderData.customerInfo.firstName} ${orderData.customerInfo.lastName}`,
      html: businessEmailHtml,
    });

    console.log('✅ Both emails sent successfully');
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🎣 Webhook received');
    
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.log('❌ No signature found');
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        config.stripe.webhookSecret
      );
    } catch (err) {
      console.log('❌ Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log('✅ Webhook signature verified');
    console.log('📊 Event type:', event.type);

    if (event.type === 'checkout.session.completed') {
      console.log('🎯 Processing checkout.session.completed');
      
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('💰 Session ID:', session.id);
      console.log('💰 Amount:', session.amount_total);

      // Extract order data from metadata
      const orderData = {
        sessionId: session.id,
        customerInfo: {
          firstName: session.metadata?.customerName?.split(' ')[0] || 'Customer',
          lastName: session.metadata?.customerName?.split(' ').slice(1).join(' ') || '',
          email: session.customer_email || '',
          phone: session.metadata?.customerPhone || '',
          address: session.metadata?.customerAddress || '',
          instructions: session.metadata?.specialInstructions || ''
        },
        items: JSON.parse(session.metadata?.items || '[]'),
        subtotal: session.metadata?.subtotal || '0',
        tax: session.metadata?.tax || '0',
        total: session.metadata?.total || '0',
        amountTotal: ((session.amount_total || 0) / 100).toFixed(2)
      };

      // Send confirmation emails
      console.log('📧 Sending confirmation emails...');
      await sendOrderConfirmationEmail(orderData);
      
      console.log('🎉 Order processed successfully - emails sent!');
      
      return NextResponse.json({ received: true });
    }

    console.log('ℹ️ Event type not handled:', event.type);
    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
