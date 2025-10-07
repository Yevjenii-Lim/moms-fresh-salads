// Netlify Function to handle Stripe webhooks for order notifications
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const sig = event.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let stripeEvent;

    // Skip signature verification if webhook secret is not set (for testing)
    if (!endpointSecret) {
      console.log('No webhook secret set, skipping signature verification');
      stripeEvent = JSON.parse(event.body);
    } else {
      try {
        stripeEvent = stripe.webhooks.constructEvent(event.body, sig, endpointSecret);
      } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Webhook signature verification failed' })
        };
      }
    }

    // Handle successful payment
    if (stripeEvent.type === 'checkout.session.completed') {
      const session = stripeEvent.data.object;
      
      console.log('Payment successful for session:', session.id);
      
      // Extract order details from session metadata
      const orderDetails = {
        sessionId: session.id,
        customerEmail: session.customer_details?.email,
        customerName: session.customer_details?.name,
        customerPhone: session.customer_details?.phone,
        amountTotal: session.amount_total / 100, // Convert from cents
        currency: session.currency,
        paymentStatus: session.payment_status,
        timestamp: new Date().toISOString()
      };

      // Send email notification to business owner
      await sendOrderNotification(orderDetails);
      
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          received: true, 
          message: 'Order notification sent',
          orderId: session.id
        })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true })
    };

  } catch (error) {
    console.error('Webhook error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Webhook processing failed' })
    };
  }
};

// Function to send order notification email
async function sendOrderNotification(orderDetails) {
  const nodemailer = require('nodemailer');
  
  // Create transporter (using Gmail for now)
  const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER, // Your Gmail address
      pass: process.env.GMAIL_APP_PASSWORD // Gmail App Password
    }
  });

  // Email content
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: 'yevhenii.lim27@gmail.com', // Your business email
    subject: `🍽️ New Order Received - $${orderDetails.amountTotal}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">🍽️ New Order Received!</h2>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #27ae60; margin-top: 0;">Order Details</h3>
          <p><strong>Order ID:</strong> ${orderDetails.sessionId}</p>
          <p><strong>Customer Name:</strong> ${orderDetails.customerName || 'Not provided'}</p>
          <p><strong>Customer Email:</strong> ${orderDetails.customerEmail || 'Not provided'}</p>
          <p><strong>Customer Phone:</strong> ${orderDetails.customerPhone || 'Not provided'}</p>
          <p><strong>Total Amount:</strong> $${orderDetails.amountTotal} ${orderDetails.currency.toUpperCase()}</p>
          <p><strong>Payment Status:</strong> ${orderDetails.paymentStatus}</p>
          <p><strong>Order Time:</strong> ${new Date(orderDetails.timestamp).toLocaleString()}</p>
        </div>
        
        <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #27ae60; margin-top: 0;">📋 Next Steps:</h4>
          <ol>
            <li>Check your Stripe dashboard for full order details</li>
            <li>Prepare the order for the customer</li>
            <li>Contact customer if needed: ${orderDetails.customerEmail || orderDetails.customerPhone}</li>
            <li>Update order status in your system</li>
          </ol>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #7f8c8d;">
          <p>This is an automated notification from Mom's Fresh Salads</p>
          <p>Order ID: ${orderDetails.sessionId}</p>
        </div>
      </div>
    `
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log('Order notification email sent:', result.messageId);
    return result;
  } catch (error) {
    console.error('Failed to send order notification email:', error);
    throw error;
  }
}
