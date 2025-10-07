# 📧 Email Notification Setup Guide

## 🚀 Quick Setup for Gmail

### 1. Enable 2-Factor Authentication
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Click **"2-Step Verification"**
3. Follow the setup process (requires phone number)

### 2. Generate App Password
1. Go back to [Google Account Security](https://myaccount.google.com/security)
2. Click **"App passwords"** (under 2-Step Verification)
3. Select **"Mail"** as the app
4. Select **"Other"** as the device and name it "Mom's Fresh Salads"
5. **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)

### 3. Update Environment Variables
Add these to your `.env.local` file:

```env
# Gmail Configuration
GMAIL_USER=your-gmail@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password
```

**Important:** 
- Use your actual Gmail address
- Use the 16-character app password (not your regular password)
- Remove spaces from the app password

### 4. Restart Development Server
```bash
npm run dev
```

## 📧 Email Features

### What Emails Are Sent

#### 1. **Order Confirmation Email** (to Customer)
- ✅ Beautiful HTML email with your brand colors
- ✅ Complete order details and items
- ✅ Customer information and delivery address
- ✅ Order summary with tax calculation
- ✅ Next steps and contact information

#### 2. **Business Notification Email** (to You)
- ✅ New order alert with customer details
- ✅ Order summary and total amount
- ✅ Delivery address and special instructions
- ✅ Timestamp of the order

### Email Content Includes:
- 🍽️ **Branded header** with your logo and colors
- 📋 **Order details** (ID, date, customer info)
- 🛒 **Itemized order** with quantities and prices
- 💰 **Order summary** (subtotal, tax, total)
- 📍 **Delivery address** and special instructions
- ⏰ **Next steps** for customer
- 📞 **Contact information**

## 🧪 Testing Email Notifications

### Test Flow:
1. **Place a test order** with the $1.00 test item
2. **Use your real email** in the checkout form
3. **Complete payment** with test card `4242 4242 4242 4242`
4. **Check your email** for confirmation
5. **Check your business email** for notification

### Expected Results:
- ✅ Customer receives beautiful confirmation email
- ✅ Business owner receives notification email
- ✅ Console shows "Order confirmation email sent" message

## 🔍 Troubleshooting

### Common Issues

#### "Invalid login" or "Authentication failed"
- **Check:** Gmail username is correct (full email address)
- **Verify:** App password is 16 characters without spaces
- **Ensure:** 2-Factor Authentication is enabled
- **Try:** Generating a new app password

#### Emails not sending
- **Check:** `.env.local` file exists and has correct values
- **Restart:** Development server after adding email config
- **Verify:** Gmail account is not locked or restricted
- **Check:** Console for error messages

#### Emails going to spam
- **Tell customers:** To check spam/junk folder
- **Consider:** Using a business email domain for better deliverability
- **Add:** SPF and DKIM records for your domain (advanced)

### Debug Steps:
1. **Check console logs** for email sending status
2. **Verify environment variables** are loaded
3. **Test with a simple email** first
4. **Check Gmail security settings**

## 📱 Email Templates

### Customer Confirmation Email Features:
- 🎨 **Professional design** matching your website
- 📊 **Order table** with items and quantities
- 💳 **Payment confirmation** and order ID
- 🚚 **Delivery information** and next steps
- 📞 **Contact details** for support

### Business Notification Email Features:
- 🚨 **Alert format** for immediate attention
- 👤 **Customer contact information**
- 🛒 **Order summary** for quick review
- 📍 **Delivery address** and special requests
- ⏰ **Timestamp** for order tracking

## 🚀 Going Live (Production)

### Production Considerations:
- **Use business email** instead of personal Gmail
- **Set up email domain** for better deliverability
- **Monitor email delivery** rates
- **Consider email service** like SendGrid or Mailgun for high volume

### Advanced Setup (Optional):
- **Custom email domain** (orders@momsfreshsalads.com)
- **Email templates** with your branding
- **Automated follow-up** emails
- **Order status updates** via email

## 💡 Tips

### Best Practices:
- **Test emails** with real email addresses
- **Check spam folders** during testing
- **Keep app passwords secure** and rotate regularly
- **Monitor email delivery** in production

### Security:
- **Never commit** `.env.local` to git
- **Use app passwords** instead of regular passwords
- **Enable 2FA** on your Gmail account
- **Regularly review** Gmail security settings

---

**Ready to send beautiful order confirmation emails! 📧✨**

Your customers will now receive professional, branded emails for every order.
