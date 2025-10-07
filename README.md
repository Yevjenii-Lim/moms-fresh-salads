# 🍽️ Mom's Fresh Salads - Next.js Version

A modern, responsive salad ordering website built with Next.js, TypeScript, and Tailwind CSS.

## ✨ Features

- 🛒 **Shopping Cart** - Add/remove items, quantity management
- 💳 **Stripe Integration** - Secure payment processing
- 📱 **Responsive Design** - Works on all devices
- 📧 **Email Notifications** - Contact form and order notifications
- 🎨 **Modern UI** - Beautiful, clean interface with Tailwind CSS
- ⚡ **Fast Performance** - Server-side rendering and optimization
- 🔒 **Type Safety** - Full TypeScript support

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Stripe account
- Gmail account with App Password

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Yevjenii-Lim/moms-fresh-salads.git
   cd moms-fresh-salads/moms-fresh-salads-nextjs
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` with your actual values:
   ```env
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
   GMAIL_USER=your-gmail@gmail.com
   GMAIL_APP_PASSWORD=your-16-character-app-password
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── create-checkout-session/route.ts
│   │   └── send-email/route.ts
│   ├── success/page.tsx
│   ├── cancel/page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/ (future components)
└── lib/ (utilities)
```

## 🔧 Configuration

### Stripe Setup

1. **Create a Stripe account** at [stripe.com](https://stripe.com)
2. **Get your API keys** from the Stripe Dashboard
3. **Add keys to environment variables**

### Email Setup

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password:**
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. **Add credentials to environment variables**

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables
   - Deploy!

### AWS Amplify

1. **Push to GitHub**
2. **Connect to Amplify:**
   - Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
   - Create new app from GitHub
   - Add environment variables
   - Deploy!

### Netlify

1. **Push to GitHub**
2. **Connect to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Import from Git
   - Add environment variables
   - Deploy!

## 📱 Features Overview

### Shopping Cart
- Add/remove items
- Quantity management
- Real-time price calculation
- Tax calculation (8%)

### Payment Processing
- Stripe Checkout integration
- Secure payment handling
- Order confirmation
- Email notifications

### Contact Form
- Name, email, phone, subject, message
- Email notifications to business owner
- Form validation

### Responsive Design
- Mobile-first approach
- Touch-friendly interface
- Optimized for all screen sizes

## 🔒 Security

- Environment variables for sensitive data
- Stripe handles payment security
- Form validation and sanitization
- HTTPS in production

## 📊 Performance

- Server-side rendering (SSR)
- Image optimization
- Code splitting
- Lazy loading
- Tailwind CSS for minimal bundle size

## 🧪 Testing

### Test Payment
Use Stripe test card: `4242 4242 4242 4242`

### Test Email
1. Go to `/api/send-email` endpoint
2. Send a test email
3. Check your inbox

## 🐛 Troubleshooting

### Common Issues

#### Build Errors
- Check Node.js version (18+)
- Clear `.next` folder and rebuild
- Check TypeScript errors

#### Stripe Issues
- Verify API keys are correct
- Check Stripe dashboard for errors
- Ensure test/live keys match environment

#### Email Issues
- Verify Gmail App Password
- Check spam folder
- Test email configuration

### Getting Help

1. Check the console for errors
2. Review environment variables
3. Check Stripe/email service status
4. Review deployment logs

## 📈 Future Enhancements

- [ ] User authentication
- [ ] Order history
- [ ] Admin dashboard
- [ ] Inventory management
- [ ] Delivery tracking
- [ ] Reviews and ratings
- [ ] Loyalty program
- [ ] Multi-language support

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support, email info@momsfreshsalads.com or create an issue on GitHub.

---

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**