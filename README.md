# Mom's Fresh Salads

A beautiful, responsive website for a fresh salad business with e-commerce functionality.

## Features

- 🥗 **Responsive Design** - Works perfectly on all devices
- 🛒 **Shopping Cart** - Add items, manage quantities, and checkout
- 💳 **Payment Integration** - Stripe payment processing
- 📱 **Mobile-First** - Optimized for mobile users
- 🎨 **Modern UI** - Clean, professional design
- 📧 **Contact Form** - Customer inquiry handling

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Custom CSS with Flexbox/Grid
- **Icons**: Font Awesome
- **Fonts**: Google Fonts (Poppins)
- **Payments**: Stripe
- **Hosting**: Netlify with CI/CD

## Getting Started

### Local Development

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd salads
   ```

2. Open `index.html` in your browser or use a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   ```

3. Visit `http://localhost:8000` to view the website

### Production Deployment

This project is configured for automatic deployment to Netlify:

1. Push changes to the `main` branch
2. Netlify automatically builds and deploys
3. Custom domain is configured for production

## Configuration

### Stripe Setup

1. Get your Stripe publishable key from [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Update the key in `script.js` line 2:
   ```javascript
   const stripe = Stripe('pk_live_your_actual_key_here');
   ```

### Custom Domain

The website is configured to work with a custom domain. Update the following if needed:
- Contact information in `index.html`
- Business hours and address
- Social media links

## File Structure

```
salads/
├── index.html          # Main HTML file
├── styles.css          # All CSS styles
├── script.js           # JavaScript functionality
├── README.md           # This file
├── .gitignore          # Git ignore rules
└── netlify.toml        # Netlify configuration
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email orders@momsfreshsalads.com or call (555) 123-SALAD.
