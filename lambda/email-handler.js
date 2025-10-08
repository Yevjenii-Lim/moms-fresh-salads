const AWS = require('aws-sdk');
const nodemailer = require('nodemailer');

// Configure AWS SES (or use other email service)
const ses = new AWS.SES({ region: 'us-east-1' });

exports.handler = async (event) => {
    console.log('🚀 Lambda function triggered at:', new Date().toISOString());
    console.log('📋 Event received:', typeof event, event ? 'has data' : 'no data');
    
    if (!event) {
        console.log('❌ No event received');
        return { statusCode: 400, body: 'No event received' };
    }
    
    console.log('📋 Received EventBridge event:', JSON.stringify(event, null, 2));
    console.log('🔍 Event source:', event.source);
    console.log('📊 Event detail type:', event['detail-type']);
    
    try {
        // Extract Stripe event data
        const stripeEvent = event.detail;
        
        if (stripeEvent.type === 'checkout.session.completed') {
            console.log('✅ Processing checkout.session.completed event');
            const session = stripeEvent.data.object;
            console.log('💰 Session ID:', session.id);
            console.log('💰 Amount:', session.amount_total);
            
            // Extract order data from metadata
            const orderData = {
                sessionId: session.id,
                customerInfo: {
                    name: session.metadata.customerName || 'Customer',
                    email: session.customer_email || session.metadata.customerEmail,
                    phone: session.metadata.customerPhone || '',
                    address: session.metadata.customerAddress || '',
                    instructions: session.metadata.customerInstructions || ''
                },
                items: JSON.parse(session.metadata.orderItems || '[]'),
                subtotal: session.metadata.subtotal || '0',
                tax: session.metadata.tax || '0',
                total: session.metadata.total || '0',
                amountTotal: (session.amount_total / 100).toFixed(2)
            };
            
            // Send emails
            console.log('📧 Sending confirmation emails...');
            await sendOrderConfirmationEmail(orderData);
            await sendBusinessNotificationEmail(orderData);
            
            console.log('🎉 Order confirmation emails sent successfully');
            console.log('✅ Lambda execution completed at:', new Date().toISOString());
            
            return {
                statusCode: 200,
                body: JSON.stringify({ 
                    message: 'Emails sent successfully',
                    orderId: session.id 
                })
            };
        }
        
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Event processed, no action needed' })
        };
        
    } catch (error) {
        console.error('Error processing EventBridge event:', error);
        
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: 'Failed to process event',
                details: error.message 
            })
        };
    }
};

async function sendOrderConfirmationEmail(orderData) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD
        }
    });
    
    const orderItemsHtml = orderData.items.map(item => 
        `<li>${item.quantity}x ${item.name} - $${item.price}</li>`
    ).join('');
    
    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: orderData.customerInfo.email,
        subject: `Order Confirmation - ${orderData.sessionId}`,
        html: `
            <h2>Thank you for your order!</h2>
            <p>Dear ${orderData.customerInfo.name},</p>
            
            <p>Your order has been confirmed and payment processed successfully.</p>
            
            <h3>Order Details:</h3>
            <ul>
                ${orderItemsHtml}
            </ul>
            
            <p><strong>Subtotal:</strong> $${orderData.subtotal}</p>
            <p><strong>Tax:</strong> $${orderData.tax}</p>
            <p><strong>Total:</strong> $${orderData.total}</p>
            
            <h3>Customer Information:</h3>
            <p><strong>Name:</strong> ${orderData.customerInfo.name}</p>
            <p><strong>Email:</strong> ${orderData.customerInfo.email}</p>
            <p><strong>Phone:</strong> ${orderData.customerInfo.phone}</p>
            <p><strong>Address:</strong> ${orderData.customerInfo.address}</p>
            ${orderData.customerInfo.instructions ? `<p><strong>Special Instructions:</strong> ${orderData.customerInfo.instructions}</p>` : ''}
            
            <p>We'll prepare your order and notify you when it's ready!</p>
            
            <p>Best regards,<br>Mom's Fresh Salads</p>
        `
    };
    
    return transporter.sendMail(mailOptions);
}

async function sendBusinessNotificationEmail(orderData) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD
        }
    });
    
    const orderItemsHtml = orderData.items.map(item => 
        `<li>${item.quantity}x ${item.name} - $${item.price}</li>`
    ).join('');
    
    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: process.env.BUSINESS_EMAIL || process.env.GMAIL_USER,
        subject: `New Order Received - ${orderData.sessionId}`,
        html: `
            <h2>New Order Received!</h2>
            
            <h3>Order Details:</h3>
            <ul>
                ${orderItemsHtml}
            </ul>
            
            <p><strong>Subtotal:</strong> $${orderData.subtotal}</p>
            <p><strong>Tax:</strong> $${orderData.tax}</p>
            <p><strong>Total:</strong> $${orderData.total}</p>
            
            <h3>Customer Information:</h3>
            <p><strong>Name:</strong> ${orderData.customerInfo.name}</p>
            <p><strong>Email:</strong> ${orderData.customerInfo.email}</p>
            <p><strong>Phone:</strong> ${orderData.customerInfo.phone}</p>
            <p><strong>Address:</strong> ${orderData.customerInfo.address}</p>
            ${orderData.customerInfo.instructions ? `<p><strong>Special Instructions:</strong> ${orderData.customerInfo.instructions}</p>` : ''}
            
            <p><strong>Order ID:</strong> ${orderData.sessionId}</p>
            <p><strong>Payment Status:</strong> Completed</p>
        `
    };
    
    return transporter.sendMail(mailOptions);
}
