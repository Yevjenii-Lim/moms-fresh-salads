# Development Guide - Mom's Fresh Salads

This guide will help you set up a local development environment with live reloading.

## 🚀 Quick Start

### Option 1: Using npm scripts (Recommended)

1. **Start live server:**
   ```bash
   npm run dev
   ```
   This will:
   - Start live-server on port 3000
   - Automatically open your browser
   - Watch for file changes and reload automatically

2. **Alternative live server with hot reload:**
   ```bash
   npm run dev:hot
   ```
   This provides enhanced file watching and faster reloads.

### Option 2: Using npx directly

```bash
npx live-server . --port=3000 --open=/
```

### Option 3: Using serve (Static server)

```bash
npm run serve
```
This starts a static server without live reload.

## 🔧 Development Features

### Live Reload
- ✅ **Automatic browser refresh** when you save files
- ✅ **CSS changes** update instantly
- ✅ **JavaScript changes** reload the page
- ✅ **HTML changes** refresh automatically

### File Watching
- ✅ Watches all files in the project directory
- ✅ Detects changes in HTML, CSS, and JavaScript
- ✅ Supports nested directories

### Browser Sync
- ✅ Opens automatically in your default browser
- ✅ Works on `http://localhost:3000`
- ✅ Mobile testing support

## 📱 Testing on Mobile

### Local Network Access
1. **Find your local IP:**
   ```bash
   # On macOS/Linux
   ifconfig | grep "inet " | grep -v 127.0.0.1
   
   # On Windows
   ipconfig | findstr "IPv4"
   ```

2. **Access from mobile:**
   - Connect your phone to the same WiFi network
   - Visit `http://YOUR_IP:3000` on your phone
   - Test mobile responsiveness in real-time

### Browser Dev Tools
- **Chrome DevTools:** F12 or Ctrl+Shift+I
- **Mobile simulation:** Click device icon in DevTools
- **Test different screen sizes** and orientations

## 🛠️ Development Workflow

### 1. Start Development Server
```bash
npm run dev
```

### 2. Make Changes
- Edit HTML, CSS, or JavaScript files
- Save your changes
- Browser automatically refreshes

### 3. Test Features
- ✅ Navigation and mobile menu
- ✅ Shopping cart functionality
- ✅ Checkout process
- ✅ Responsive design
- ✅ Stripe integration (with test keys)

### 4. Debug Issues
- **Browser Console:** Check for JavaScript errors
- **Network Tab:** Monitor API calls
- **Elements Tab:** Inspect HTML/CSS

## 🔍 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start live server with auto-reload |
| `npm run dev:hot` | Enhanced live server with hot reload |
| `npm run serve` | Static server without live reload |
| `npm start` | Basic serve command |
| `npm run build` | Build command (no-op for static site) |

## 🎯 Development Tips

### CSS Development
- Changes to `styles.css` update instantly
- Use browser DevTools for quick CSS testing
- Test responsive design with different viewport sizes

### JavaScript Development
- JavaScript changes trigger page reload
- Use `console.log()` for debugging
- Test mobile interactions on actual devices

### HTML Development
- HTML changes refresh the page
- Test form submissions and navigation
- Verify mobile menu functionality

## 🚨 Troubleshooting

### Port Already in Use
If port 3000 is busy:
```bash
npx live-server . --port=3001 --open=/
```

### Browser Doesn't Open
- Manually visit `http://localhost:3000`
- Check if browser is set as default

### Changes Not Reflecting
- Check file is saved
- Hard refresh browser (Ctrl+F5 or Cmd+Shift+R)
- Check browser console for errors

### Mobile Testing Issues
- Ensure devices are on same network
- Check firewall settings
- Try different port if needed

## 📁 Project Structure

```
salads/
├── index.html          # Main HTML file
├── styles.css          # All CSS styles
├── script.js           # JavaScript functionality
├── package.json        # Project configuration
├── netlify/            # Netlify functions
│   └── functions/
├── .github/            # GitHub Actions
└── README.md           # Project documentation
```

## 🔗 Useful URLs

- **Local Development:** http://localhost:3000
- **GitHub Repository:** https://github.com/Yevjenii-Lim/moms-fresh-salads
- **Stripe Dashboard:** https://dashboard.stripe.com
- **Netlify Dashboard:** https://app.netlify.com

## 🎉 Happy Coding!

Your development environment is now set up with live reloading. Make changes to any file and see them instantly in your browser!
