# 🚀 AWS Amplify Deployment Guide

## Overview
This guide will help you deploy your Mom's Fresh Salads website to AWS Amplify.

## Prerequisites
- AWS Account (free tier available)
- GitHub repository: `https://github.com/Yevjenii-Lim/moms-fresh-salads.git`
- Stripe account with API keys
- Gmail account with App Password

## Step 1: Create AWS Account
1. Go to https://aws.amazon.com/
2. Click "Create an AWS Account"
3. Follow the signup process (free tier includes 12 months free)

## Step 2: Deploy to Amplify

### 2.1 Access Amplify Console
1. Go to https://console.aws.amazon.com/amplify/
2. Sign in with your AWS credentials

### 2.2 Create New App
1. Click **"New app"** → **"Host web app"**
2. Choose **"GitHub"** as your source
3. Click **"Authorize"** to connect your GitHub account
4. Select repository: `Yevjenii-Lim/moms-fresh-salads`
5. Select branch: `main`
6. Click **"Next"**

### 2.3 Configure Build Settings
Amplify will auto-detect your settings using the `amplify.yml` file.

**Build settings should be:**
- Build command: `npm install` (handled by amplify.yml)
- Output directory: `.` (root directory)

### 2.4 Review and Deploy
1. Review your settings
2. Click **"Save and deploy"**
3. Wait for the build to complete (5-10 minutes)

## Step 3: Configure Environment Variables

### 3.1 Add Environment Variables
1. Go to your Amplify app dashboard
2. Click **"Environment variables"** in the left sidebar
3. Add these variables:

```
STRIPE_SECRET_KEY = sk_test_your_stripe_secret_key
GMAIL_USER = your-gmail@gmail.com
GMAIL_APP_PASSWORD = your-16-character-app-password
STRIPE_WEBHOOK_SECRET = whsec_your_webhook_secret (optional)
```

### 3.2 Redeploy After Adding Variables
1. Go to **"Deployments"** tab
2. Click **"Redeploy this version"** to apply environment variables

## Step 4: Test Your Deployment

### 4.1 Test Basic Functionality
1. Visit your Amplify app URL
2. Test the website functionality
3. Try adding items to cart
4. Test the contact form

### 4.2 Test Payment System
1. Add the $1 test item to cart
2. Proceed to checkout
3. Use Stripe test card: `4242 4242 4242 4242`
4. Complete the payment

### 4.3 Test Email Notifications
1. Go to `https://your-app-url.amplifyapp.com/test-email.html`
2. Click "Send Test Email"
3. Check if you receive the test email

## Step 5: Custom Domain (Optional)

### 5.1 Add Custom Domain
1. Go to **"Domain management"** in Amplify
2. Click **"Add domain"**
3. Enter your domain name
4. Follow the DNS configuration instructions

### 5.2 Update DNS Records
Update your domain's DNS records as instructed by Amplify:
- Add CNAME record pointing to Amplify
- Wait for SSL certificate provisioning

## Step 6: Production Setup

### 6.1 Switch to Live Stripe Keys
1. Get your live Stripe keys from Stripe Dashboard
2. Update environment variables in Amplify:
   - `STRIPE_SECRET_KEY` = your live secret key
   - Update your website to use live publishable key

### 6.2 Set Up Webhooks
1. In Stripe Dashboard, go to **"Webhooks"**
2. Add endpoint: `https://your-app-url.amplifyapp.com/.netlify/functions/stripe-webhook`
3. Select events: `checkout.session.completed`
4. Copy the webhook secret to Amplify environment variables

## Troubleshooting

### Common Issues:

#### Build Fails
- Check the build logs in Amplify console
- Ensure all dependencies are in `package.json`
- Verify `amplify.yml` configuration

#### Environment Variables Not Working
- Redeploy after adding environment variables
- Check variable names match exactly (case-sensitive)
- Verify no extra spaces in values

#### Functions Not Working
- Check function logs in Amplify console
- Verify environment variables are set
- Test functions individually

#### Email Not Working
- Verify Gmail App Password is correct
- Check spam folder
- Test with the email test page

### Getting Help:
- AWS Amplify Documentation: https://docs.aws.amazon.com/amplify/
- AWS Support (if you have a support plan)
- Check build logs in Amplify console for detailed error messages

## Cost Information
- AWS Amplify: Free tier includes 1000 build minutes/month
- AWS Lambda (functions): Free tier includes 1M requests/month
- Custom domains: Free SSL certificates included
- Data transfer: First 15GB/month free

## Next Steps After Deployment:
1. Test all functionality thoroughly
2. Set up monitoring and alerts
3. Configure backup strategies
4. Set up staging environment for testing
5. Implement analytics tracking

## Security Best Practices:
1. Never commit API keys to repository
2. Use environment variables for all secrets
3. Enable AWS CloudTrail for audit logging
4. Set up proper IAM permissions
5. Regularly rotate API keys and passwords
