# Stripe Checkout Setup Guide

This guide will help you set up real payments using Stripe Checkout.

## 🚀 What's Been Implemented

✅ **Stripe Checkout Integration** - Secure payment processing  
✅ **Netlify Function** - Server-side checkout session creation  
✅ **Frontend Integration** - Seamless checkout flow  
✅ **Success/Cancel Handling** - Proper payment result processing  

## 📋 Setup Steps

### 1. Stripe Account Setup

1. **Create Stripe Account:**
   - Go to [stripe.com](https://stripe.com)
   - Sign up for a free account
   - Complete account verification

2. **Get Your API Keys:**
   - Go to [Stripe Dashboard → Developers → API Keys](https://dashboard.stripe.com/apikeys)
   - Copy your **Publishable Key** (starts with `pk_live_` or `pk_test_`)
   - Copy your **Secret Key** (starts with `sk_live_` or `sk_test_`)

3. **Update Frontend Key:**
   - Open `script.js` line 2
   - Replace the current key with your publishable key:
   ```javascript
   const stripe = Stripe('pk_live_YOUR_ACTUAL_KEY_HERE');
   ```

### 2. Netlify Environment Variables

1. **Go to Netlify Dashboard:**
   - Select your site
   - Go to **Site settings → Environment variables**

2. **Add Environment Variables:**
   ```
   STRIPE_SECRET_KEY = sk_live_YOUR_SECRET_KEY_HERE
   ```

3. **Redeploy:**
   - Go to **Deploys** tab
   - Click **Trigger deploy → Deploy site**

### 3. Domain Configuration

1. **Add Domain to Stripe:**
   - Go to [Stripe Dashboard → Settings → Domains](https://dashboard.stripe.com/settings/domains)
   - Add your custom domain (e.g., `momsfreshsalads.com`)

2. **Test Domain:**
   - For testing, you can use `localhost:8888` or your Netlify URL

## 🧪 Testing

### Test Mode (Recommended First)

1. **Use Test Keys:**
   - Use `pk_test_` and `sk_test_` keys
   - Test with Stripe test card numbers:
     - **Success:** `4242 4242 4242 4242`
     - **Decline:** `4000 0000 0000 0002`
     - **3D Secure:** `4000 0025 0000 3155`

2. **Test Flow:**
   - Add items to cart
   - Fill out checkout form
   - Click "Pay Now"
   - Should redirect to Stripe Checkout
   - Use test card to complete payment
   - Should redirect back with success message

### Live Mode

1. **Switch to Live Keys:**
   - Use `pk_live_` and `sk_live_` keys
   - Update environment variables
   - Redeploy site

2. **Real Payments:**
   - Test with small amounts first
   - Monitor Stripe Dashboard for transactions

## 🔧 How It Works

### Customer Flow:
1. **Add Items** → Shopping cart
2. **Checkout** → Fill customer information
3. **Pay Now** → Redirects to Stripe Checkout
4. **Payment** → Secure Stripe-hosted page
5. **Success** → Redirects back with confirmation

### Technical Flow:
1. **Frontend** → Creates checkout session via Netlify function
2. **Netlify Function** → Calls Stripe API to create session
3. **Stripe** → Returns checkout URL
4. **Customer** → Completes payment on Stripe
5. **Stripe** → Redirects back to your site
6. **Frontend** → Shows success message

## 📊 Order Management

### Viewing Orders:
- Orders are saved in browser localStorage
- Open browser console and run:
  ```javascript
  JSON.parse(localStorage.getItem('moms-salads-orders'))
  ```

### Stripe Dashboard:
- View all transactions at [dashboard.stripe.com](https://dashboard.stripe.com)
- See customer details, amounts, and payment status
- Download reports and manage refunds

## 🚨 Important Notes

### Security:
- ✅ Secret keys are stored securely in Netlify
- ✅ Never commit secret keys to GitHub
- ✅ Stripe handles all sensitive payment data

### Compliance:
- ✅ PCI DSS compliant (handled by Stripe)
- ✅ GDPR compliant (Stripe handles data)
- ✅ Secure checkout flow

### Fees:
- Stripe charges 2.9% + 30¢ per transaction
- No monthly fees
- Transparent pricing

## 🆘 Troubleshooting

### Common Issues:

1. **"Invalid API Key":**
   - Check that you're using the correct key type (test vs live)
   - Ensure no extra spaces in the key

2. **"Domain not allowed":**
   - Add your domain to Stripe dashboard
   - Check for typos in domain name

3. **Function not found:**
   - Ensure Netlify function is deployed
   - Check function name matches exactly

4. **Payment not processing:**
   - Check browser console for errors
   - Verify environment variables are set
   - Test with Stripe test cards first

### Support:
- **Stripe Documentation:** [stripe.com/docs](https://stripe.com/docs)
- **Netlify Functions:** [docs.netlify.com/functions](https://docs.netlify.com/functions)

## 🎉 You're Ready!

Once you complete these steps, your website will have:
- ✅ Real payment processing
- ✅ Secure checkout flow
- ✅ Professional payment experience
- ✅ Automatic order tracking

Your customers can now make real purchases with their credit cards!
