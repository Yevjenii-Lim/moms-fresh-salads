# 🚀 Next.js Deployment Guide

This guide covers deploying your Mom's Fresh Salads Next.js application to various platforms.

## 📋 Prerequisites

- Next.js application built and tested locally
- Environment variables configured
- Stripe account with API keys
- Gmail account with App Password

## 🎯 Deployment Options

### 1. Vercel (Recommended for Next.js)

Vercel is the company behind Next.js and offers the best integration.

#### Steps:
1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Initial Next.js version"
   git push origin main
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login with GitHub
   - Click "New Project"
   - Import your repository
   - Configure environment variables:
     ```
     STRIPE_SECRET_KEY=sk_test_your_key
     NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
     GMAIL_USER=your-email@gmail.com
     GMAIL_APP_PASSWORD=your-app-password
     ```
   - Click "Deploy"

3. **Custom Domain (Optional):**
   - Go to Project Settings → Domains
   - Add your custom domain
   - Update DNS records as instructed

### 2. AWS Amplify

#### Steps:
1. **Push to GitHub** (same as above)

2. **Deploy to Amplify:**
   - Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
   - Click "New app" → "Host web app"
   - Connect GitHub repository
   - Select branch: `main`
   - Build settings (auto-detected):
     ```yaml
     version: 1
     frontend:
       phases:
         preBuild:
           commands:
             - npm install
         build:
           commands:
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

3. **Environment Variables:**
   - Go to App Settings → Environment variables
   - Add all required variables

4. **Deploy:**
   - Click "Save and deploy"

### 3. Netlify

#### Steps:
1. **Build Configuration:**
   Create `netlify.toml`:
   ```toml
   [build]
     command = "npm run build"
     publish = ".next"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. **Deploy:**
   - Go to [netlify.com](https://netlify.com)
   - Import from Git
   - Add environment variables
   - Deploy

### 4. Railway

#### Steps:
1. **Connect GitHub:**
   - Go to [railway.app](https://railway.app)
   - Connect your GitHub account
   - Select your repository

2. **Configure:**
   - Add environment variables
   - Railway auto-detects Next.js
   - Deploy automatically

## 🔧 Environment Variables

### Required Variables:
```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Email Configuration
GMAIL_USER=your-gmail@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password

# Optional: Webhook Secret
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### Production Variables:
When ready for production, replace test keys with live keys:
```env
STRIPE_SECRET_KEY=sk_live_your_live_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_stripe_publishable_key
```

## 🧪 Testing After Deployment

### 1. Basic Functionality:
- [ ] Website loads correctly
- [ ] Navigation works
- [ ] Menu items display
- [ ] Cart functionality works

### 2. Payment Testing:
- [ ] Add items to cart
- [ ] Proceed to checkout
- [ ] Fill customer information
- [ ] Use test card: `4242 4242 4242 4242`
- [ ] Complete payment
- [ ] Check success page

### 3. Email Testing:
- [ ] Submit contact form
- [ ] Check email delivery
- [ ] Verify email content

### 4. Mobile Testing:
- [ ] Test on mobile devices
- [ ] Check responsive design
- [ ] Test touch interactions

## 🔍 Troubleshooting

### Common Issues:

#### Build Failures:
- Check Node.js version (18+)
- Verify all dependencies are installed
- Check for TypeScript errors
- Review build logs

#### Environment Variables:
- Ensure all required variables are set
- Check for typos in variable names
- Verify values are correct
- Redeploy after adding variables

#### Stripe Issues:
- Verify API keys are correct
- Check Stripe dashboard for errors
- Ensure test/live keys match environment
- Test with Stripe test cards

#### Email Issues:
- Verify Gmail App Password
- Check spam folder
- Test email configuration
- Review email service logs

### Performance Optimization:

#### Next.js Optimizations:
- Enable image optimization
- Use dynamic imports for large components
- Implement proper caching
- Optimize bundle size

#### CDN Configuration:
- Configure proper caching headers
- Enable gzip compression
- Use CDN for static assets
- Implement proper redirects

## 📊 Monitoring

### Analytics:
- Google Analytics integration
- Performance monitoring
- Error tracking
- User behavior analysis

### Logs:
- Application logs
- Error logs
- Performance metrics
- Security monitoring

## 🔒 Security

### Best Practices:
- Use HTTPS in production
- Secure environment variables
- Implement proper CORS
- Regular security updates
- Monitor for vulnerabilities

### Stripe Security:
- Use webhooks for payment verification
- Implement proper error handling
- Secure API key storage
- Regular security audits

## 📈 Scaling

### Performance:
- Implement caching strategies
- Use CDN for static assets
- Optimize database queries
- Monitor performance metrics

### Infrastructure:
- Auto-scaling configuration
- Load balancing
- Database optimization
- Backup strategies

## 🆘 Support

### Getting Help:
- Check deployment platform documentation
- Review Next.js documentation
- Check Stripe documentation
- Contact platform support

### Useful Resources:
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [AWS Amplify Documentation](https://docs.aws.amazon.com/amplify/)
- [Stripe Documentation](https://stripe.com/docs)

---

**Ready to deploy your Next.js salad website! 🚀**
