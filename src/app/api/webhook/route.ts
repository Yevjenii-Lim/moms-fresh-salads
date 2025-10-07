import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import nodemailer from 'nodemailer';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

interface OrderData {
  sessionId: string;
  customerInfo: {
    name: string;
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
}

// Email sending function
async function sendOrderConfirmationEmail(orderData: OrderData) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // Customer confirmation email
    const customerEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #4c7c5c; margin: 0;">🍃 Mom's Fresh Salads</h1>
          <p style="color: #666; margin: 10px 0 0 0;">Thank you for your order!</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #333; margin: 0 0 15px 0;">Order Confirmation</h2>
          <p><strong>Order ID:</strong> ${orderData.sessionId}</p>
          <p><strong>Customer:</strong> ${orderData.customerInfo.name}</p>
          <p><strong>Email:</strong> ${orderData.customerInfo.email}</p>
          <p><strong>Phone:</strong> ${orderData.customerInfo.phone}</p>
          <p><strong>Delivery Address:</strong></p>
          <p style="background: white; padding: 10px; border-radius: 5px; margin: 5px 0;">${orderData.customerInfo.address}</p>
          ${orderData.customerInfo.instructions ? `<p><strong>Special Instructions:</strong> ${orderData.customerInfo.instructions}</p>` : ''}
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #333;">Order Details:</h3>
          <div style="background: white; padding: 15px; border-radius: 5px; border: 1px solid #ddd;">
            ${orderData.items.map((item) => `
              <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #eee;">
                <span>${item.quantity}x ${item.name}</span>
                <span>$${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div style="background: #4c7c5c; color: white; padding: 15px; border-radius: 5px; text-align: right;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span>Subtotal:</span>
            <span>$${orderData.subtotal}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span>Tax:</span>
            <span>$${orderData.tax}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 1.1em; border-top: 1px solid rgba(255,255,255,0.3); padding-top: 5px;">
            <span>Total:</span>
            <span>$${orderData.total}</span>
          </div>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #666; margin: 0;">Thank you for choosing Mom's Fresh Salads!</p>
          <p style="color: #666; margin: 5px 0 0 0;">We'll prepare your order with fresh, healthy ingredients.</p>
        </div>
      </div>
    `;

    // Business notification email
    const businessEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #e74c3c; margin: 0;">🚨 New Order Received!</h1>
          <p style="color: #666; margin: 10px 0 0 0;">Mom's Fresh Salads - Order Notification</p>
        </div>
        
        <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ffc107;">
          <h2 style="color: #856404; margin: 0 0 15px 0;">Order Details</h2>
          <p><strong>Order ID:</strong> ${orderData.sessionId}</p>
          <p><strong>Customer:</strong> ${orderData.customerInfo.name}</p>
          <p><strong>Email:</strong> ${orderData.customerInfo.email}</p>
          <p><strong>Phone:</strong> ${orderData.customerInfo.phone}</p>
          <p><strong>Delivery Address:</strong></p>
          <p style="background: white; padding: 10px; border-radius: 5px; margin: 5px 0;">${orderData.customerInfo.address}</p>
          ${orderData.customerInfo.instructions ? `<p><strong>Special Instructions:</strong> ${orderData.customerInfo.instructions}</p>` : ''}
          <p><strong>Total Amount:</strong> $${orderData.total}</p>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #333;">Items Ordered:</h3>
          <div style="background: white; padding: 15px; border-radius: 5px; border: 1px solid #ddd;">
            ${orderData.items.map((item) => `
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
                <div>
                  <strong>${item.quantity}x ${item.name}</strong><br>
                  <small style="color: #666;">${item.description}</small>
                </div>
                <span style="font-weight: bold;">$${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div style="background: #d4edda; padding: 15px; border-radius: 5px; border-left: 4px solid #28a745;">
          <p style="margin: 0; color: #155724;"><strong>Action Required:</strong> Please prepare this order and contact the customer if needed.</p>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #666; margin: 0;">Order received at: ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `;

    // Send customer email
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: orderData.customerInfo.email,
      subject: `Order Confirmation - Mom's Fresh Salads`,
      html: customerEmailHtml,
    });

    // Send business notification email
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.BUSINESS_EMAIL || process.env.GMAIL_USER,
      subject: `🚨 New Order Received - $${orderData.total}`,
      html: businessEmailHtml,
    });

    console.log(`Order confirmation email sent to: ${orderData.customerInfo.email}`);
    console.log('Business notification email sent');
    
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle successful payment
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      console.log('Payment completed for session:', session.id);

      // Extract order data from session metadata
      const orderData = {
        sessionId: session.id,
        customerInfo: {
          name: session.metadata?.customerName || session.customer_details?.name || 'N/A',
          email: session.customer_details?.email || 'N/A',
          phone: session.metadata?.customerPhone || session.customer_details?.phone || 'N/A',
          address: session.metadata?.customerAddress || 'N/A',
          instructions: session.metadata?.specialInstructions || '',
        },
        items: session.metadata?.items ? JSON.parse(session.metadata.items) : [],
        subtotal: session.metadata?.subtotal || '0.00',
        tax: session.metadata?.tax || '0.00',
        total: session.metadata?.total || '0.00',
      };

      // Send confirmation emails only after successful payment
      try {
        await sendOrderConfirmationEmail(orderData);
        console.log('✅ Emails sent successfully after payment completion');
      } catch (error) {
        console.error('❌ Failed to send emails after payment:', error);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
