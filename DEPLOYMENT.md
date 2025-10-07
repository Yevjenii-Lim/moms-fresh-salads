# Deployment Guide - Mom's Fresh Salads

This guide will help you deploy your website with CI/CD using GitHub and Netlify.

## Prerequisites

- ✅ Custom domain name purchased
- ✅ GitHub account
- ✅ Netlify account
- ✅ Stripe account (for payments)

## Step-by-Step Deployment

### 1. GitHub Repository Setup

1. **Create GitHub Repository:**
   - Go to [GitHub.com](https://github.com)
   - Click "New repository"
   - Name: `moms-fresh-salads`
   - Description: "Mom's Fresh Salads - E-commerce website"
   - Make it Public
   - Don't initialize with README (we have one)

2. **Connect Local Repository:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/moms-fresh-salads.git
   git push -u origin main
   ```

### 2. Netlify Setup

1. **Connect to GitHub:**
   - Go to [Netlify.com](https://netlify.com)
   - Sign up/Login
   - Click "New site from Git"
   - Choose "GitHub"
   - Authorize Netlify
   - Select your repository

2. **Build Settings:**
   - Build command: `echo 'Static site - no build required'`
   - Publish directory: `.` (root)
   - Base directory: (leave empty)

3. **Deploy:**
   - Click "Deploy site"
   - Wait for deployment to complete

### 3. Custom Domain Configuration

1. **Add Custom Domain:**
   - In Netlify dashboard → Site settings → Domain management
   - Click "Add custom domain"
   - Enter your domain (e.g., `momsfreshsalads.com`)

2. **DNS Configuration:**
   Netlify will provide DNS records. Configure these in your domain registrar:

   **For Root Domain (momsfreshsalads.com):**
   ```
   Type: A
   Name: @
   Value: 75.2.60.5
   ```

   **For WWW Subdomain:**
   ```
   Type: CNAME
   Name: www
   Value: your-site-name.netlify.app
   ```

3. **SSL Certificate:**
   - Netlify automatically provides free SSL
   - Enable "Force HTTPS" in Site settings → Domain management

### 4. Environment Variables (Optional)

If you want to use environment variables for sensitive data:

1. **In Netlify Dashboard:**
   - Site settings → Environment variables
   - Add variables like:
     - `STRIPE_PUBLISHABLE_KEY`
     - `STRIPE_SECRET_KEY`

2. **Update script.js to use environment variables:**
   ```javascript
   const stripe = Stripe(process.env.STRIPE_PUBLISHABLE_KEY);
   ```

### 5. Form Handling

Your contact form will work automatically with Netlify Forms:

1. **Enable Forms:**
   - Site settings → Forms
   - Forms are automatically detected

2. **View Submissions:**
   - Netlify dashboard → Forms
   - View all form submissions

### 6. CI/CD Pipeline

Your GitHub Actions workflow will automatically:

1. **Trigger on:**
   - Push to `main` branch
   - Pull requests to `main`

2. **Actions:**
   - Checkout code
   - Setup Node.js
   - Install dependencies
   - Build site
   - Deploy to Netlify

### 7. Testing Your Deployment

1. **Test the website:**
   - Visit your custom domain
   - Test all functionality:
     - Navigation
     - Shopping cart
     - Contact form
     - Mobile responsiveness

2. **Test CI/CD:**
   - Make a small change to your code
   - Commit and push to GitHub
   - Watch Netlify automatically deploy

## Production Checklist

- [ ] Custom domain configured and working
- [ ] HTTPS enabled
- [ ] Stripe keys updated for production
- [ ] Contact form working
- [ ] Shopping cart functional
- [ ] Mobile responsive
- [ ] All links working
- [ ] Images optimized
- [ ] SEO meta tags added
- [ ] Analytics configured (optional)

## Troubleshooting

### Common Issues:

1. **Domain not working:**
   - Check DNS propagation (can take 24-48 hours)
   - Verify DNS records are correct
   - Check domain registrar settings

2. **Build failures:**
   - Check Netlify build logs
   - Verify all files are committed
   - Check for syntax errors

3. **Stripe not working:**
   - Verify publishable key is correct
   - Check Stripe dashboard for errors
   - Ensure domain is added to Stripe allowed origins

### Support:

- **Netlify Docs:** [docs.netlify.com](https://docs.netlify.com)
- **GitHub Actions:** [docs.github.com/actions](https://docs.github.com/actions)
- **Stripe Docs:** [stripe.com/docs](https://stripe.com/docs)

## Next Steps

1. **Analytics:** Add Google Analytics or similar
2. **SEO:** Optimize meta tags and content
3. **Performance:** Optimize images and code
4. **Backup:** Regular backups of your code
5. **Monitoring:** Set up uptime monitoring

Your website is now live with professional CI/CD! 🎉
