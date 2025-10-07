# Email Setup Guide - Contact Form

This guide will help you set up email functionality for your contact form to send messages to `yevhenii.lim27@gmail.com`.

## 📧 Current Setup

Your contact form is now configured with **two methods** for sending emails:

1. **Netlify Forms** (Automatic - works out of the box)
2. **Custom Email Function** (More control - requires setup)

## 🚀 Method 1: Netlify Forms (Recommended - Easiest)

### How it works:
- Netlify automatically detects forms with `data-netlify="true"`
- Form submissions are stored in Netlify dashboard
- You can set up email notifications

### Setup Steps:

1. **Deploy your site to Netlify**
2. **Go to Netlify Dashboard:**
   - Select your site
   - Go to **Forms** tab
   - You'll see "contact" form listed

3. **Set up email notifications:**
   - Click on your "contact" form
   - Go to **Settings & usage**
   - Click **Add notification**
   - Choose **Email notification**
   - Enter your email: `yevhenii.lim27@gmail.com`
   - Save settings

4. **Test the form:**
   - Fill out the contact form on your website
   - Submit it
   - Check your email for the notification

### Benefits:
- ✅ Works immediately after deployment
- ✅ No additional setup required
- ✅ Spam protection included
- ✅ Form submissions stored in dashboard

## 🔧 Method 2: Custom Email Function (Advanced)

### Setup with Gmail SMTP:

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password:**
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"

3. **Add Environment Variables to Netlify:**
   ```
   SMTP_HOST = smtp.gmail.com
   SMTP_PORT = 587
   SMTP_USER = yevhenii.lim27@gmail.com
   SMTP_PASS = your_app_password_here
   ```

4. **Update the email function** to use SMTP (see code below)

### Alternative: Use EmailJS (Easiest for custom function)

1. **Sign up at [EmailJS.com](https://www.emailjs.com)**
2. **Create email service** (Gmail)
3. **Get your credentials:**
   - Service ID
   - Template ID
   - Public Key

4. **Add to Netlify environment variables:**
   ```
   EMAILJS_SERVICE_ID = your_service_id
   EMAILJS_TEMPLATE_ID = your_template_id
   EMAILJS_PUBLIC_KEY = your_public_key
   ```

## 📝 Email Template

The contact form sends emails with this format:

```
Subject: [Mom's Fresh Salads] [Customer's Subject]

Name: [Customer Name]
Email: [Customer Email]
Phone: [Customer Phone]
Subject: [Customer Subject]

Message:
[Customer Message]

---
This message was sent from the contact form on your website.
Time: [Timestamp]
```

## 🧪 Testing

### Local Testing:
1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Test the form:**
   - Go to `http://localhost:3000` (or your live server URL)
   - Scroll to contact section
   - Fill out the form
   - Submit and check console for logs

### Production Testing:
1. **Deploy to Netlify**
2. **Test the live form**
3. **Check your email** for notifications

## 🔍 Form Fields

Your contact form includes:
- ✅ **Name** (required)
- ✅ **Email** (required)
- ✅ **Phone** (optional)
- ✅ **Subject** (required)
- ✅ **Message** (required)
- ✅ **Spam protection** (honeypot field)

## 🚨 Troubleshooting

### Form not submitting:
- Check browser console for errors
- Verify form has `data-netlify="true"`
- Ensure all required fields are filled

### Emails not received:
- Check spam folder
- Verify email address in Netlify settings
- Check Netlify function logs

### Custom function errors:
- Check environment variables are set
- Verify SMTP credentials
- Check function logs in Netlify dashboard

## 📊 Monitoring

### Netlify Dashboard:
- View all form submissions
- See submission details
- Export data if needed

### Email Notifications:
- Instant notifications to your email
- Formatted with customer details
- Timestamp included

## 🎯 Next Steps

1. **Deploy to Netlify** to activate form handling
2. **Set up email notifications** in Netlify dashboard
3. **Test the contact form** on your live site
4. **Monitor form submissions** and respond to customers

Your contact form is now ready to send messages directly to your email address!
