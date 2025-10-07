// Netlify Function to create Stripe Checkout Session
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Function to send order notification email
async function sendOrderNotification(orderDetails) {
  const nodemailer = require('nodemailer');
  
  // Create transporter (using Gmail)
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
          <h4 style="color: #27ae60; margin-top: 0;">📋 Order Items:</h4>
          <p>${orderDetails.orderSummary}</p>
          <p><strong>Subtotal:</strong> $${orderDetails.subtotal}</p>
          <p><strong>Tax:</strong> $${orderDetails.tax}</p>
          <p><strong>Total:</strong> $${orderDetails.total}</p>
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

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  try {
    const { items, customerInfo, successUrl, cancelUrl } = JSON.parse(event.body);
    
    // Create line items for Stripe Checkout
    const lineItems = items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          description: `Fresh salad made with love`,
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));

    // Add tax as a separate line item
    const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
    const taxAmount = subtotal * 0.085; // 8.5% tax
    
    if (taxAmount > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Tax (8.5%)',
          },
          unit_amount: Math.round(taxAmount * 100),
        },
        quantity: 1,
      });
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerInfo.email,
      metadata: {
        orderId: Date.now().toString(),
        customerName: `${customerInfo.firstName} ${customerInfo.lastName}`,
        customerPhone: customerInfo.phone,
        customerAddress: customerInfo.address,
        specialInstructions: customerInfo.instructions || '',
        orderItems: JSON.stringify(items),
        orderSummary: items.map(item => 
          `${item.quantity}x ${item.name} - $${(item.price * item.quantity).toFixed(2)}`
        ).join(' | '),
        subtotal: subtotal.toFixed(2),
        tax: taxAmount.toFixed(2),
        total: (subtotal + taxAmount).toFixed(2),
        itemCount: items.reduce((sum, item) => sum + item.quantity, 0)
      },
      shipping_address_collection: {
        allowed_countries: ['US'],
      },
      phone_number_collection: {
        enabled: true,
      },
    });

    // Send immediate email notification (for testing)
    try {
      await sendOrderNotification({
        sessionId: session.id,
        customerEmail: customerInfo.email,
        customerName: `${customerInfo.firstName} ${customerInfo.lastName}`,
        customerPhone: customerInfo.phone,
        amountTotal: (subtotal + taxAmount),
        currency: 'usd',
        paymentStatus: 'pending',
        timestamp: new Date().toISOString(),
        orderItems: items,
        orderSummary: items.map(item => 
          `${item.quantity}x ${item.name} - $${(item.price * item.quantity).toFixed(2)}`
        ).join(' | '),
        subtotal: subtotal.toFixed(2),
        tax: taxAmount.toFixed(2),
        total: (subtotal + taxAmount).toFixed(2)
      });
      console.log('Order notification email sent successfully');
    } catch (emailError) {
      console.error('Failed to send order notification email:', emailError);
      // Don't fail the checkout if email fails
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ 
        sessionId: session.id, 
        url: session.url 
      })
    };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ error: error.message })
    };
  }
};
