# 🔗 Stripe Webhook Setup Guide

## 📋 Overview
This guide will help you set up Stripe webhooks to ensure emails are sent **only after successful payment completion**.

## 🎯 What This Fixes
- ✅ **Emails sent only after payment** (not when checkout session is created)
- ✅ **Reliable email delivery** using Stripe webhooks
- ✅ **Better customer experience** - no premature emails
- ✅ **Proper order confirmation flow**

## 🚀 Setup Steps

### 1. Access Stripe Dashboard
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Sign in to your Stripe account
3. Navigate to **Developers** → **Webhooks**

### 2. Create New Webhook Endpoint
1. Click **"Add endpoint"**
2. **Endpoint URL**: `https://your-domain.com/api/webhook`
   - For local testing: `https://your-ngrok-url.ngrok.io/api/webhook`
3. **Description**: "Mom's Fresh Salads - Order Completion Webhook"

### 3. Select Events to Listen For
Select these specific events:
- ✅ `checkout.session.completed` - **This is the key event!**

### 4. Get Webhook Secret
1. After creating the webhook, click on it
2. Go to **"Signing secret"**
3. Click **"Reveal"** and copy the secret
4. It looks like: `whsec_1234567890abcdef...`

### 5. Add to Environment Variables
Add this to your `.env.local` file:

```env
# Stripe Webhook Secret (from step 4)
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Business email for notifications (optional)
BUSINESS_EMAIL=your-business-email@example.com
```

## 🧪 Testing the Webhook

### Local Testing with ngrok
1. **Install ngrok**: `npm install -g ngrok`
2. **Start your app**: `npm run dev`
3. **Expose local server**: `ngrok http 3000`
4. **Update webhook URL** in Stripe to use the ngrok URL
5. **Test a payment** and check if emails are sent

### Test Payment Flow
1. Add items to cart
2. Go through checkout process
3. Complete payment with test card: `4242 4242 4242 4242`
4. **Check emails are sent AFTER payment completion**

## 📧 Email Flow

### Before (❌ Wrong)
```
1. Customer clicks "Checkout"
2. Checkout session created
3. ❌ Email sent immediately (before payment!)
4. Customer completes payment
5. Customer gets duplicate emails
```

### After (✅ Correct)
```
1. Customer clicks "Checkout"
2. Checkout session created
3. Customer completes payment
4. ✅ Stripe sends webhook
5. ✅ Email sent only after successful payment
```

## 🔍 Monitoring Webhooks

### Stripe Dashboard
1. Go to **Developers** → **Webhooks**
2. Click on your webhook endpoint
3. View **"Recent deliveries"** to see webhook attempts
4. Check for any failed deliveries

### Console Logs
Look for these messages in your app logs:
```
✅ Checkout session created, emails will be sent after payment completion
Payment completed for session: cs_test_...
✅ Emails sent successfully after payment completion
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Webhook Not Receiving Events
- ✅ Check webhook URL is correct
- ✅ Ensure webhook is enabled in Stripe
- ✅ Verify `STRIPE_WEBHOOK_SECRET` is set correctly

#### 2. Emails Not Sending
- ✅ Check Gmail credentials in `.env.local`
- ✅ Verify `GMAIL_USER` and `GMAIL_APP_PASSWORD`
- ✅ Check webhook logs in Stripe dashboard

#### 3. Webhook Signature Verification Failed
- ✅ Ensure `STRIPE_WEBHOOK_SECRET` matches the one from Stripe
- ✅ Check webhook endpoint URL is exactly correct

### Debug Commands
```bash
# Check webhook endpoint
curl -X POST https://your-domain.com/api/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'

# Check environment variables
echo $STRIPE_WEBHOOK_SECRET
```

## 📝 Environment Variables Summary

Your `.env.local` should contain:

```env
# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email Configuration
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password
BUSINESS_EMAIL=your-business-email@example.com

# App Configuration
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

## ✅ Verification Checklist

- [ ] Webhook endpoint created in Stripe
- [ ] `checkout.session.completed` event selected
- [ ] Webhook secret added to `.env.local`
- [ ] Test payment completed successfully
- [ ] Customer confirmation email received
- [ ] Business notification email received
- [ ] Emails sent only AFTER payment completion
- [ ] No duplicate emails sent

## 🎉 Success!

Once everything is set up correctly:
1. **Customers** will receive confirmation emails only after successful payment
2. **You** will receive business notification emails for new orders
3. **No premature emails** will be sent during checkout
4. **Reliable email delivery** through Stripe webhooks

## 📞 Need Help?

If you encounter any issues:
1. Check the Stripe webhook logs in your dashboard
2. Verify all environment variables are set correctly
3. Test with a simple payment using Stripe test cards
4. Check your application logs for error messages

The webhook system ensures a professional and reliable email confirmation process! 🚀
