# 💳 Stripe Payment Setup Guide

## 🚀 Quick Setup

### 1. Create Stripe Account
1. Go to [stripe.com](https://stripe.com)
2. Sign up for a free account
3. Verify your email and complete setup
4. **Important:** Make sure you're in **Test Mode** (toggle in top right)

### 2. Get API Keys
1. Go to [Dashboard > API Keys](https://dashboard.stripe.com/apikeys)
2. Copy both keys:
   - **Publishable key** (starts with `pk_test_...`)
   - **Secret key** (starts with `sk_test_...`)

### 3. Create Environment File
Create `.env.local` in your project root:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_actual_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key_here

# Email Configuration (Optional)
GMAIL_USER=your-gmail@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password
```

### 4. Restart Development Server
```bash
npm run dev
```

## 🧪 Testing Payments

### Test Cards (Use these for testing)
- **Success:** `4242 4242 4242 4242`
- **Declined:** `4000 0000 0000 0002`
- **Requires Authentication:** `4000 0025 0000 3155`

**Other test card details:**
- **Expiry:** Any future date (e.g., 12/25)
- **CVC:** Any 3 digits (e.g., 123)
- **ZIP:** Any 5 digits (e.g., 12345)

### Test Flow
1. **Add items to cart** (use the $1.00 test item)
2. **Click "Checkout"**
3. **Fill customer information**
4. **Click "Pay Now"**
5. **Use test card:** `4242 4242 4242 4242`
6. **Complete payment**
7. **Redirect to success page**

## 🔍 Troubleshooting

### Common Issues

#### "Neither apiKey nor config.authenticator provided"
- **Solution:** Check that `.env.local` exists and has correct keys
- **Verify:** Keys start with `sk_test_` and `pk_test_`
- **Restart:** Development server after adding keys

#### Payment fails
- **Check:** You're using test cards (not real cards)
- **Verify:** Stripe account is in test mode
- **Review:** Browser console for errors

#### Environment variables not loading
- **Ensure:** File is named exactly `.env.local`
- **Location:** In project root (same level as `package.json`)
- **Restart:** Development server
- **Check:** No spaces around `=` in .env file

## 📊 Payment Features

### What's Included
✅ **Secure Checkout:** Stripe-hosted checkout page
✅ **Multiple Payment Methods:** Credit/debit cards
✅ **Order Management:** Complete order details in metadata
✅ **Success/Cancel Pages:** Proper redirect handling
✅ **Email Notifications:** Customer confirmation emails
✅ **Mobile Responsive:** Works on all devices

### Order Information Captured
- Customer name, email, phone
- Delivery address
- Special instructions
- Complete order items and quantities
- Subtotal, tax, and total
- Stripe session ID for tracking

## 🚀 Going Live (Production)

### When Ready for Real Payments
1. **Switch to Live Mode** in Stripe Dashboard
2. **Get Live API Keys** (starts with `sk_live_` and `pk_live_`)
3. **Update Environment Variables**
4. **Test with Small Amounts** first
5. **Set up Webhooks** for production monitoring

### Production Checklist
- [ ] Switch to live API keys
- [ ] Test with real payment methods
- [ ] Set up webhook endpoints
- [ ] Configure email notifications
- [ ] Review Stripe dashboard regularly

## 💡 Tips

### Development
- Always use test mode during development
- Use the $1.00 test item for quick testing
- Check Stripe dashboard for payment logs
- Use browser dev tools to debug issues

### Security
- Never commit `.env.local` to git
- Use environment variables in production
- Regularly rotate API keys
- Monitor for suspicious activity

## 📞 Support

### Stripe Resources
- [Stripe Documentation](https://stripe.com/docs)
- [Test Cards Reference](https://stripe.com/docs/testing#cards)
- [Stripe Dashboard](https://dashboard.stripe.com)

### Common Test Scenarios
1. **Successful Payment:** Use `4242 4242 4242 4242`
2. **Declined Payment:** Use `4000 0000 0000 0002`
3. **Insufficient Funds:** Use `4000 0000 0000 9995`
4. **Expired Card:** Use `4000 0000 0000 0069`

---

**Ready to accept payments! 🎉**

Your Stripe integration is now ready for testing and production use.
