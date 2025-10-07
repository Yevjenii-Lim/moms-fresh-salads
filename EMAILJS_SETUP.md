# EmailJS Setup Guide - Quick Email Solution

This guide will help you set up EmailJS for reliable email delivery to `yevhenii.lim27@gmail.com`.

## 🚀 Why EmailJS?

- ✅ **More reliable** than Netlify Forms
- ✅ **Instant delivery** to your email
- ✅ **Easy setup** - no server required
- ✅ **Free tier** available
- ✅ **Works immediately** after setup

## 📧 Quick Setup (5 minutes)

### Step 1: Create EmailJS Account

1. **Go to [emailjs.com](https://www.emailjs.com)**
2. **Sign up** for a free account
3. **Verify your email**

### Step 2: Add Email Service

1. **Go to Email Services** in your dashboard
2. **Click "Add New Service"**
3. **Choose "Gmail"**
4. **Connect your Gmail account** (`yevhenii.lim27@gmail.com`)
5. **Copy the Service ID** (starts with `service_`)

### Step 3: Create Email Template

1. **Go to Email Templates**
2. **Click "Create New Template"**
3. **Use this template:**

```
Subject: [Mom's Fresh Salads] {{subject}}

Hello,

You have received a new message from your website contact form:

Name: {{name}}
Email: {{email}}
Phone: {{phone}}
Subject: {{subject}}

Message:
{{message}}

Time: {{timestamp}}

---
This message was sent from your website contact form.
```

4. **Save the template**
5. **Copy the Template ID** (starts with `template_`)

### Step 4: Get Public Key

1. **Go to Account → API Keys**
2. **Copy your Public Key** (starts with letters/numbers)

### Step 5: Update Your Website

Replace these values in `script.js`:

```javascript
const EMAILJS_SERVICE_ID = 'your_service_id_here';
const EMAILJS_TEMPLATE_ID = 'your_template_id_here';
const EMAILJS_PUBLIC_KEY = 'your_public_key_here';
```

### Step 6: Initialize EmailJS

Add this code to your `script.js`:

```javascript
// Initialize EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

// Update the contact form handler to use EmailJS
contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(contactForm);
    const templateParams = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        subject: formData.get('subject'),
        message: formData.get('message'),
        timestamp: new Date().toLocaleString()
    };
    
    try {
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
        showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
        contactForm.reset();
    } catch (error) {
        console.error('EmailJS error:', error);
        showNotification('Failed to send message. Please try again.', 'error');
    }
});
```

## 🧪 Testing

1. **Fill out the contact form**
2. **Submit the form**
3. **Check your email** - should arrive instantly!

## 💰 Pricing

- **Free Tier:** 200 emails/month
- **Paid Plans:** Start at $15/month for more emails
- **Perfect for small businesses**

## 🔧 Alternative: Manual Email Setup

If you prefer to set up manually, I can help you configure the EmailJS integration step by step.

## 🎯 Benefits

- ✅ **Instant delivery** - emails arrive immediately
- ✅ **Reliable** - 99.9% delivery rate
- ✅ **Professional** - branded email templates
- ✅ **Easy to use** - no server setup required
- ✅ **Mobile friendly** - works on all devices

This is the most reliable way to get emails from your contact form!
