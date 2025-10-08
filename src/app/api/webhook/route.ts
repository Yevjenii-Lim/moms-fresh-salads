import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import nodemailer from 'nodemailer';
import { config } from '../../../config/keys';
import { addWebhookLog } from '../webhook-logs/route';
import { SES } from '@aws-sdk/client-ses';
import { defaultProvider } from '@aws-sdk/credential-provider-node';

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

// Email sending function using AWS SES
async function sendOrderConfirmationEmail(orderData: OrderData) {
  console.log('📧 Creating SES email transporter...');
  addWebhookLog('📧 Creating SES email transporter...');
  
  // Use AWS SES instead of Gmail
  const ses = new SES({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: defaultProvider(),
  });
  
  const transporter = nodemailer.createTransport({
    SES: { ses, aws: require('@aws-sdk/client-ses') },
  } as any);
  
  console.log('📧 SES email transporter created successfully');
  addWebhookLog('📧 SES email transporter created successfully');

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
    console.log('📧 Sending customer email to:', orderData.customerInfo.email);
    addWebhookLog(`📧 Sending customer email to: ${orderData.customerInfo.email}`);
    
    // Send customer confirmation
    await transporter.sendMail({
      from: `Mom's Fresh Salads <${config.email.user}>`,
      to: orderData.customerInfo.email,
      subject: 'Order Confirmation - Mom\'s Fresh Salads',
      html: customerEmailHtml,
    });

    console.log('📧 Customer email sent successfully');
    addWebhookLog('📧 Customer email sent successfully');

    console.log('📧 Sending business notification email...');
    addWebhookLog('📧 Sending business notification email...');

    // Send business notification
    await transporter.sendMail({
      from: `Mom's Fresh Salads <${config.email.user}>`,
      to: config.email.user, // Send to business email
      subject: `New Order - ${orderData.customerInfo.firstName} ${orderData.customerInfo.lastName}`,
      html: businessEmailHtml,
    });

    console.log('✅ Both emails sent successfully');
    addWebhookLog('✅ Both emails sent successfully');
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    addWebhookLog(`❌ Email sending failed in function: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🎣 Webhook received at:', new Date().toISOString());
    console.log('🔧 Webhook secret status:', config.stripe.webhookSecret ? 'present' : 'missing');
    
    addWebhookLog('🎣 Webhook received');
    addWebhookLog(`🔧 Webhook secret: ${config.stripe.webhookSecret ? 'present' : 'missing'}`);
    
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    console.log('📋 Request details:', {
      hasBody: !!body,
      bodyLength: body.length,
      hasSignature: !!signature,
      signaturePreview: signature ? signature.substring(0, 20) + '...' : 'none'
    });

    if (!signature) {
      console.log('❌ No signature found');
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      console.log('🔐 Verifying webhook signature...');
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        config.stripe.webhookSecret
      );
      console.log('✅ Webhook signature verified successfully');
    } catch (err) {
      console.log('❌ Webhook signature verification failed:', err);
      console.log('❌ Error details:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        webhookSecretPresent: !!config.stripe.webhookSecret,
        webhookSecretPreview: config.stripe.webhookSecret ? config.stripe.webhookSecret.substring(0, 8) + '...' : 'missing'
      });
      
      addWebhookLog(`❌ Signature verification failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log('✅ Webhook signature verified');
    console.log('📊 Event type:', event.type);
    
    addWebhookLog('✅ Signature verified successfully');
    addWebhookLog(`📊 Event type: ${event.type}`);

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
      try {
        await sendOrderConfirmationEmail(orderData);
        console.log('🎉 Order processed successfully - emails sent!');
      } catch (emailError) {
        console.error('❌ Email sending failed:', emailError);
        // Don't fail the webhook if email fails
        console.log('⚠️ Continuing despite email failure');
        addWebhookLog(`❌ Email sending failed: ${emailError instanceof Error ? emailError.message : 'Unknown error'}`);
      }
      
      return NextResponse.json({ received: true });
    }

    if (event.type === 'charge.succeeded') {
      console.log('🎯 Processing charge.succeeded');
      addWebhookLog('🎯 Processing charge.succeeded event');
      
      const charge = event.data.object as Stripe.Charge;
      console.log('💰 Charge ID:', charge.id);
      console.log('💰 Amount:', charge.amount);
      console.log('💰 Customer Email:', charge.billing_details.email);
      
      addWebhookLog(`💰 Charge ID: ${charge.id}`);
      addWebhookLog(`💰 Amount: ${charge.amount}`);
      addWebhookLog(`💰 Customer Email: ${charge.billing_details.email || 'none'}`);

      // Create basic order data from charge information
      const orderData = {
        sessionId: charge.id, // Use charge ID as session ID
        customerInfo: {
          firstName: charge.billing_details.name?.split(' ')[0] || 'Customer',
          lastName: charge.billing_details.name?.split(' ').slice(1).join(' ') || '',
          email: charge.billing_details.email || '',
          phone: charge.billing_details.phone || '',
          address: charge.billing_details.address ? 
            `${charge.billing_details.address.line1 || ''} ${charge.billing_details.address.city || ''} ${charge.billing_details.address.state || ''} ${charge.billing_details.address.postal_code || ''}`.trim() : '',
          instructions: ''
        },
        items: [{
          id: '1',
          name: 'Salad Order',
          description: 'Fresh salad order',
          price: (charge.amount / 100),
          quantity: 1
        }],
        subtotal: (charge.amount / 100).toFixed(2),
        tax: '0.00',
        total: (charge.amount / 100).toFixed(2),
        amountTotal: (charge.amount / 100).toFixed(2)
      };

      addWebhookLog(`📦 Order data created for: ${orderData.customerInfo.email}`);
      addWebhookLog(`📦 Total amount: $${orderData.total}`);

      // Send confirmation emails
      console.log('📧 Sending confirmation emails for charge...');
      addWebhookLog('📧 Attempting to send confirmation emails...');
      
      try {
        await sendOrderConfirmationEmail(orderData);
        console.log('🎉 Charge processed successfully - emails sent!');
        addWebhookLog('🎉 Emails sent successfully!');
      } catch (emailError) {
        console.error('❌ Email sending failed for charge:', emailError);
        // Don't fail the webhook if email fails
        console.log('⚠️ Continuing despite email failure');
        addWebhookLog(`❌ Email sending failed: ${emailError instanceof Error ? emailError.message : 'Unknown error'}`);
        addWebhookLog(`❌ Error stack: ${emailError instanceof Error ? emailError.stack : 'No stack trace'}`);
      }
      
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
