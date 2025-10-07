// Updated processPayment method for real Stripe payments
async processPayment(customerInfo) {
    try {
        showNotification('Processing payment...', 'info');
        
        // Create order object
        const order = {
            id: Date.now(),
            items: [...this.items],
            customer: customerInfo,
            subtotal: this.getSubtotal(),
            tax: this.getTax(),
            total: this.getTotal(),
            status: 'pending',
            timestamp: new Date().toISOString()
        };
        
        // Step 1: Create payment intent on your backend
        const response = await fetch('/.netlify/functions/create-payment-intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: this.getTotal(),
                currency: 'usd',
                orderId: order.id
            })
        });
        
        const { clientSecret } = await response.json();
        
        // Step 2: Confirm payment with Stripe
        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: cardElement, // You'd need to add Stripe Elements
                billing_details: {
                    name: `${customerInfo.firstName} ${customerInfo.lastName}`,
                    email: customerInfo.email,
                    phone: customerInfo.phone,
                    address: {
                        line1: customerInfo.address
                    }
                }
            }
        });
        
        if (error) {
            throw new Error(error.message);
        }
        
        if (paymentIntent.status === 'succeeded') {
            // Step 3: Confirm payment on your backend
            await fetch('/.netlify/functions/confirm-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    paymentIntentId: paymentIntent.id,
                    orderData: order
                })
            });
            
            // Update order status
            order.status = 'confirmed';
            order.paymentIntentId = paymentIntent.id;
            
            // Clear cart and show success
            this.clear();
            this.closeCheckout();
            this.showOrderConfirmation(order);
            
            showNotification('Payment successful!', 'success');
        }
        
    } catch (error) {
        console.error('Payment failed:', error);
        showNotification(`Payment failed: ${error.message}`, 'error');
    }
}
