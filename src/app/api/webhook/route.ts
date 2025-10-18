import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import nodemailer from 'nodemailer';
import { config } from '../../../config/keys';
import { addWebhookLog } from '../webhook-logs/route';

interface OrderData {
  sessionId: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
    instructions: string;
  };
  orderSummary: string;
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

// Telegram notification function
async function sendTelegramNotification(orderData: OrderData) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    if (!botToken || !chatId) {
      console.log('⚠️ Telegram credentials not configured');
      addWebhookLog('⚠️ Telegram credentials not configured');
      return;
    }

    console.log('📱 Sending Telegram notification...');
    addWebhookLog('📱 Sending Telegram notification...');

    const message = `
🛒 *New Order Received*

👤 *Customer:* ${orderData.customerInfo.name}
📧 *Email:* ${orderData.customerInfo.email}
📞 *Phone:* ${orderData.customerInfo.phone}
📍 *Address:* ${orderData.customerInfo.address}
${orderData.customerInfo.instructions ? `📝 *Instructions:* ${orderData.customerInfo.instructions}` : ''}

🛍️ *Order Details:*
💰 *Total:* $${orderData.total}
📋 *Items:* ${orderData.orderSummary}
📊 *Breakdown:* $${orderData.subtotal} + $${orderData.tax} tax

🆔 *Order ID:* ${orderData.sessionId}
⏰ *Time:* ${new Date().toLocaleString()}
    `.trim();

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    if (response.ok) {
      console.log('✅ Telegram notification sent successfully');
      addWebhookLog('✅ Telegram notification sent successfully');
    } else {
      const error = await response.text();
      console.error('❌ Telegram notification failed:', error);
      addWebhookLog(`❌ Telegram notification failed: ${error}`);
    }
  } catch (error) {
    console.error('❌ Telegram notification error:', error);
    addWebhookLog(`❌ Telegram notification error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Email sending function using AWS SES SMTP
async function sendOrderConfirmationEmail(orderData: OrderData) {
  console.log('📧 Creating AWS SES SMTP email transporter...');
  addWebhookLog('📧 Creating AWS SES SMTP email transporter...');
  
  // Use AWS SES SMTP
  const transporter = nodemailer.createTransport({
    host: 'email-smtp.us-east-1.amazonaws.com',
    port: 587,
    secure: false, // Use TLS
    auth: {
      user: process.env.AWS_SES_SMTP_USER || config.email.user,
      pass: process.env.AWS_SES_SMTP_PASSWORD || config.email.password,
    },
  });
  
  console.log('📧 AWS SES SMTP email transporter created successfully');
  addWebhookLog('📧 AWS SES SMTP email transporter created successfully');

  // Customer email
  const customerEmailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2d5a27;">Thank you for your order!</h2>
      <p>Hi ${orderData.customerInfo.name},</p>
      <p>Your order has been confirmed and is being prepared.</p>
      
      <h3>Order Details:</h3>
      <p><strong>Order ID:</strong> ${orderData.sessionId}</p>
      <p><strong>Total:</strong> $${orderData.total}</p>
      
      <h3>Items:</h3>
      <p>${orderData.orderSummary}</p>
      <p><strong>Breakdown:</strong> $${orderData.subtotal} + $${orderData.tax} tax = $${orderData.total}</p>
      
      <p>Thank you for choosing Mom's Fresh Salads!</p>
    </div>
  `;


  // Send customer email (don't fail if this fails)
  try {
    console.log('📧 Sending customer email to:', orderData.customerInfo.email);
    addWebhookLog(`📧 Sending customer email to: ${orderData.customerInfo.email}`);
    
    await transporter.sendMail({
      from: `Mom's Fresh Salads <${config.email.sender}>`,
      to: orderData.customerInfo.email,
      subject: 'Order Confirmation - Mom\'s Fresh Salads',
      html: customerEmailHtml,
    });

    console.log('✅ Customer email sent successfully');
    addWebhookLog('✅ Customer email sent successfully');
  } catch (error) {
    console.error('⚠️ Customer email failed (may be unverified):', error);
    addWebhookLog(`⚠️ Customer email failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    // Check if it's an email verification error
    if (error instanceof Error && error.message.includes('Email address is not verified')) {
      console.log('📧 Email verification required. Please verify this email in AWS SES:');
      console.log(`📧 Customer email: ${orderData.customerInfo.email}`);
      addWebhookLog(`📧 Email verification required for: ${orderData.customerInfo.email}`);
      addWebhookLog('📧 To fix: Go to AWS SES → Verified identities → Add this email');
    }
    
    // Don't throw - continue to send business notification
  }

  // Send Telegram notification for business (even if customer email fails)
  await sendTelegramNotification(orderData);
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
          name: session.metadata?.customerName || 'Customer',
          email: session.customer_email || '',
          phone: session.metadata?.customerPhone || '',
          address: session.metadata?.customerAddress || '',
          instructions: session.metadata?.specialInstructions || ''
        },
        orderSummary: session.metadata?.orderSummary || '',
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
