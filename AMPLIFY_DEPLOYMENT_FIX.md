# 🚀 Amplify Deployment Fix Guide

## 🔧 Issue Fixed
The deployment was failing because Amplify was configured for a static site, but Next.js with API routes requires serverless deployment.

## ✅ What I've Fixed

### 1. **Updated `amplify.yml`**
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - echo "Installing dependencies..."
        - npm install
    build:
      commands:
        - echo "Building Next.js application..."
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

### 2. **Kept Next.js Configuration**
- Removed static export (would break API routes)
- Kept standard Next.js configuration for serverless deployment

## 🚀 Next Steps

### 1. **Commit and Push Changes**
```bash
git add .
git commit -m "Fix Amplify deployment configuration"
git push origin main
```

### 2. **Configure Environment Variables in Amplify**
Go to your Amplify app dashboard:
1. **App Settings** → **Environment Variables**
2. Add these variables:

```env
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password
BUSINESS_EMAIL=your-business-email@example.com
NEXT_PUBLIC_BASE_URL=https://your-amplify-domain.amplifyapp.com
```

### 3. **Redeploy**
1. Go to your Amplify app dashboard
2. Click **"Redeploy this version"** or push new changes
3. Monitor the build logs

## 📋 Expected Build Output

You should now see:
```
✅ Installing dependencies...
✅ Building Next.js application...
✅ Build completed successfully
```

Instead of the previous error:
```
❌ Can't find required-server-files.json in build output directory
```

## 🔍 Troubleshooting

### If Build Still Fails:

#### 1. **Check Build Logs**
- Go to Amplify dashboard → Build history
- Look for specific error messages

#### 2. **Common Issues:**
- **Missing environment variables**: Add all required env vars
- **Build timeout**: Increase build timeout in Amplify settings
- **Memory issues**: Upgrade to larger build instance

#### 3. **Verify Dependencies**
Make sure all dependencies are in `package.json`:
```json
{
  "dependencies": {
    "next": "15.5.4",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "stripe": "^19.1.0",
    "nodemailer": "^7.0.9",
    "@stripe/stripe-js": "^8.0.0"
  }
}
```

## 🎯 Webhook Setup for Production

After successful deployment:

### 1. **Update Webhook URL**
In your Stripe dashboard:
- **Endpoint URL**: `https://your-amplify-domain.amplifyapp.com/api/webhook`

### 2. **Test Webhook**
1. Make a test payment
2. Check Amplify function logs
3. Verify emails are sent

## ✅ Success Indicators

Your deployment is successful when:
- ✅ Build completes without errors
- ✅ App is accessible at your Amplify URL
- ✅ Stripe payments work
- ✅ Email notifications work
- ✅ Webhook receives payment events

## 🚨 Important Notes

### **API Routes Limitation**
- Next.js API routes work in Amplify serverless environment
- Webhooks will work correctly
- Email sending will work in production

### **Environment Variables**
- **Never commit** `.env.local` to git
- **Always set** environment variables in Amplify dashboard
- **Use production** Stripe keys for live deployment

### **Domain Configuration**
- Update `NEXT_PUBLIC_BASE_URL` to your actual Amplify domain
- Update Stripe webhook URL to match your domain

## 🎉 Ready to Deploy!

Your configuration is now fixed and ready for deployment. The build should complete successfully and your app will work with:
- ✅ Stripe payments
- ✅ Email notifications
- ✅ Webhook processing
- ✅ Mobile-responsive design

Push your changes and redeploy! 🚀
