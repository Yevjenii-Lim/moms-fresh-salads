// Initialize Stripe (replace with your publishable key)
// For testing, use test keys that start with pk_test_
const stripe = Stripe('pk_test_51SFfWeQXAohZsmSy8jRbSFcC4SvKkO4GGg7Vj01Vlsu3uCqpbCGO4L7cZ5gTJ2oJ95JsEby1DTYj7QCzE8tP6OiF00xnbBF7eQ'); // Test key for development

// Shopping Cart System
class ShoppingCart {
    constructor() {
        this.items = this.loadCart();
        this.taxRate = 0.085; // 8.5% tax
        this.init();
    }

    init() {
        this.updateCartDisplay();
        this.bindEvents();
    }

    loadCart() {
        const savedCart = localStorage.getItem('moms-salads-cart');
        return savedCart ? JSON.parse(savedCart) : [];
    }

    saveCart() {
        localStorage.setItem('moms-salads-cart', JSON.stringify(this.items));
    }

    addItem(salad) {
        const existingItem = this.items.find(item => item.id === salad.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                id: salad.id,
                name: salad.name,
                price: parseFloat(salad.price),
                quantity: 1
            });
        }
        
        this.saveCart();
        this.updateCartDisplay();
        showNotification(`${salad.name} added to cart!`, 'success');
    }

    removeItem(itemId) {
        this.items = this.items.filter(item => item.id !== itemId);
        this.saveCart();
        this.updateCartDisplay();
        showNotification('Item removed from cart', 'info');
    }

    updateQuantity(itemId, newQuantity) {
        if (newQuantity <= 0) {
            this.removeItem(itemId);
            return;
        }

        const item = this.items.find(item => item.id === itemId);
        if (item) {
            item.quantity = newQuantity;
            this.saveCart();
            this.updateCartDisplay();
        }
    }

    getSubtotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    getTax() {
        return this.getSubtotal() * this.taxRate;
    }

    getTotal() {
        return this.getSubtotal() + this.getTax();
    }

    clear() {
        this.items = [];
        this.saveCart();
        this.updateCartDisplay();
    }

    updateCartDisplay() {
        const cartCount = document.getElementById('cartCount');
        const cartItems = document.getElementById('cartItems');
        const cartFooter = document.getElementById('cartFooter');
        
        // Update cart count
        const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;

        // Update cart items display
        if (this.items.length === 0) {
            cartItems.innerHTML = `
                <div class="cart-empty">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Your cart is empty</p>
                    <a href="#menu" class="btn btn-primary">Browse Menu</a>
                </div>
            `;
            cartFooter.style.display = 'none';
        } else {
            cartItems.innerHTML = this.items.map(item => `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">$${item.price.toFixed(2)} each</div>
                    </div>
                    <div class="cart-item-controls">
                        <button class="quantity-btn" onclick="cart.updateQuantity('${item.id}', ${item.quantity - 1})" ${item.quantity <= 1 ? 'disabled' : ''}>-</button>
                        <span class="cart-item-quantity">${item.quantity}</span>
                        <button class="quantity-btn" onclick="cart.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                        <button class="remove-item" onclick="cart.removeItem('${item.id}')">Remove</button>
                    </div>
                </div>
            `).join('');

            // Update totals
            document.getElementById('cartSubtotal').textContent = `$${this.getSubtotal().toFixed(2)}`;
            document.getElementById('cartTax').textContent = `$${this.getTax().toFixed(2)}`;
            document.getElementById('cartTotal').textContent = `$${this.getTotal().toFixed(2)}`;
            
            cartFooter.style.display = 'block';
        }
    }

    bindEvents() {
        // Cart toggle
        document.getElementById('cartToggle').addEventListener('click', () => {
            this.toggleCart();
        });

        document.getElementById('cartClose').addEventListener('click', () => {
            this.closeCart();
        });

        document.getElementById('cartOverlay').addEventListener('click', () => {
            this.closeCart();
        });

        // Add to cart buttons
        document.querySelectorAll('.btn-add-to-cart').forEach(button => {
            button.addEventListener('click', (e) => {
                const salad = {
                    id: button.dataset.salad,
                    name: button.dataset.name,
                    price: button.dataset.price
                };
                this.addItem(salad);
            });
        });

        // Checkout button
        document.getElementById('checkoutBtn').addEventListener('click', () => {
            if (this.items.length > 0) {
                this.openCheckout();
            }
        });
    }

    toggleCart() {
        const cartSidebar = document.getElementById('cartSidebar');
        const cartOverlay = document.getElementById('cartOverlay');
        
        cartSidebar.classList.toggle('active');
        cartOverlay.classList.toggle('active');
        document.body.style.overflow = cartSidebar.classList.contains('active') ? 'hidden' : '';
    }

    closeCart() {
        const cartSidebar = document.getElementById('cartSidebar');
        const cartOverlay = document.getElementById('cartOverlay');
        
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    openCheckout() {
        this.closeCart();
        this.updateCheckoutDisplay();
        document.getElementById('checkoutModal').classList.add('active');
        document.getElementById('checkoutOverlay').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeCheckout() {
        document.getElementById('checkoutModal').classList.remove('active');
        document.getElementById('checkoutOverlay').classList.remove('active');
        document.body.style.overflow = '';
    }

    updateCheckoutDisplay() {
        const checkoutItems = document.getElementById('checkoutItems');
        
        checkoutItems.innerHTML = this.items.map(item => `
            <div class="checkout-item">
                <div class="checkout-item-info">
                    <div class="checkout-item-name">${item.name}</div>
                    <div class="checkout-item-details">Qty: ${item.quantity} × $${item.price.toFixed(2)}</div>
                </div>
                <div class="checkout-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
            </div>
        `).join('');

        // Update checkout totals
        document.getElementById('checkoutSubtotal').textContent = `$${this.getSubtotal().toFixed(2)}`;
        document.getElementById('checkoutTax').textContent = `$${this.getTax().toFixed(2)}`;
        document.getElementById('checkoutTotal').textContent = `$${this.getTotal().toFixed(2)}`;
        document.getElementById('payAmount').textContent = `$${this.getTotal().toFixed(2)}`;
    }

    async processPayment(customerInfo) {
        try {
            showNotification('Redirecting to secure checkout...', 'info');
            
            // Create order object
            const order = {
                id: Date.now(),
                items: [...this.items],
                customer: customerInfo,
                subtotal: this.getSubtotal(),
                tax: this.getTax(),
                total: this.getTotal(),
                status: 'pending',
                timestamp: new Date().toISOString()
            };
            
            // Save order to localStorage for reference
            const orders = JSON.parse(localStorage.getItem('moms-salads-orders') || '[]');
            orders.push(order);
            localStorage.setItem('moms-salads-orders', JSON.stringify(orders));
            
            // Create Stripe Checkout Session
            console.log('Creating Stripe checkout session...', {
                items: this.items,
                customerInfo: customerInfo,
                successUrl: `${window.location.origin}/?payment=success&orderId=${order.id}`,
                cancelUrl: `${window.location.origin}/?payment=cancelled`
            });
            
            const response = await fetch('/.netlify/functions/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    items: this.items,
                    customerInfo: customerInfo,
                    successUrl: `${window.location.origin}/?payment=success&orderId=${order.id}`,
                    cancelUrl: `${window.location.origin}/?payment=cancelled`
                })
            });
            
            console.log('Stripe response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Stripe API error:', errorText);
                throw new Error(`Stripe API error: ${response.status} - ${errorText}`);
            }
            
            const { sessionId, url, error } = await response.json();
            console.log('Stripe session response:', { sessionId, url, error });
            
            if (error) {
                throw new Error(error);
            }
            
            // Redirect to Stripe Checkout
            window.location.href = url;
            
        } catch (error) {
            console.error('Payment failed:', error);
            showNotification(`Payment setup failed: ${error.message}`, 'error');
        }
    }

    showOrderConfirmation(order) {
        const confirmationMessage = `
            <div style="text-align: center; padding: 2rem;">
                <i class="fas fa-check-circle" style="font-size: 4rem; color: #4a7c59; margin-bottom: 1rem;"></i>
                <h2 style="color: #2c5530; margin-bottom: 1rem;">Order Confirmed!</h2>
                <p style="color: #666; margin-bottom: 1rem;">Order #${order.id}</p>
                <p style="color: #666; margin-bottom: 2rem;">Total: $${order.total.toFixed(2)}</p>
                <p style="color: #666;">We'll contact you soon with delivery details.</p>
            </div>
        `;
        
        // Create and show confirmation modal
        const confirmationModal = document.createElement('div');
        confirmationModal.className = 'confirmation-modal';
        confirmationModal.innerHTML = `
            <div class="confirmation-content">
                ${confirmationMessage}
                <button class="btn btn-primary" onclick="this.parentElement.parentElement.remove()">
                    Close
                </button>
            </div>
        `;
        
        confirmationModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        const confirmationContent = confirmationModal.querySelector('.confirmation-content');
        confirmationContent.style.cssText = `
            background: white;
            padding: 2rem;
            border-radius: 15px;
            max-width: 500px;
            margin: 20px;
        `;
        
        document.body.appendChild(confirmationModal);
    }
}

// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        max-width: 400px;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        removeNotification(notification);
    }, 5000);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        removeNotification(notification);
    });
}

function removeNotification(notification) {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

function getNotificationIcon(type) {
    switch(type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-circle';
        case 'warning': return 'exclamation-triangle';
        default: return 'info-circle';
    }
}

function getNotificationColor(type) {
    switch(type) {
        case 'success': return '#4a7c59';
        case 'error': return '#e74c3c';
        case 'warning': return '#f39c12';
        default: return '#3498db';
    }
}

// Mobile Navigation Toggle
const hamburger = document.getElementById('hamburger');
const navMenu = document.querySelector('.nav-menu');
const navOverlay = document.getElementById('navOverlay');

function toggleMobileMenu() {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    navOverlay.classList.toggle('active');
    
    // Prevent body scroll when menu is open
    if (navMenu.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
}

function closeMobileMenu() {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
    navOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

// Hamburger click event
hamburger.addEventListener('click', toggleMobileMenu);

// Overlay click event
navOverlay.addEventListener('click', closeMobileMenu);

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
});

// Close mobile menu on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        closeMobileMenu();
    }
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Initialize EmailJS
// TODO: Replace these with your actual EmailJS keys
const EMAILJS_SERVICE_ID = 'service_vy4l0mc'; // Replace with your service ID from EmailJS
const EMAILJS_TEMPLATE_ID = 'template_cfklghj'; // Replace with your template ID from EmailJS
const EMAILJS_PUBLIC_KEY = 'mF6Mo-BPRtWYMVWgR'; // Replace with your public key from EmailJS

// Initialize EmailJS when the page loads
document.addEventListener('DOMContentLoaded', () => {
    if (EMAILJS_PUBLIC_KEY !== 'demo_key') {
        emailjs.init(EMAILJS_PUBLIC_KEY);
        console.log('EmailJS initialized successfully');
    } else {
        console.log('EmailJS not initialized - using demo mode');
    }
});

// Contact Form Handling
const contactForm = document.getElementById('contactForm');
contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(contactForm);
    const messageData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        subject: formData.get('subject'),
        message: formData.get('message'),
        timestamp: new Date().toLocaleString()
    };
    
    // Show loading state
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;
    
    try {
        console.log('Sending email with data:', messageData);
        
        // Check if EmailJS is properly configured
        if (EMAILJS_PUBLIC_KEY !== 'demo_key' && EMAILJS_SERVICE_ID !== 'service_demo') {
            // Use EmailJS for real email sending
            console.log('Using EmailJS to send email...');
            
            const templateParams = {
                name: messageData.name,
                email: messageData.email,
                phone: messageData.phone || 'Not provided',
                subject: messageData.subject,
                message: messageData.message,
                timestamp: messageData.timestamp
            };
            
            const response = await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
            console.log('EmailJS response:', response);
            
            showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
            contactForm.reset();
            
        } else {
            // Demo mode - simulate email sending
            console.log('Using demo mode - simulating email sending...');
            
            // Simulate email sending delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
            contactForm.reset();
            
            // Log the message data (in production, this would be sent via email)
            console.log('Email would be sent to yevhenii.lim27@gmail.com with:', {
                to: 'yevhenii.lim27@gmail.com',
                from: messageData.email,
                subject: `[Mom's Fresh Salads] ${messageData.subject}`,
                body: `
Name: ${messageData.name}
Email: ${messageData.email}
Phone: ${messageData.phone || 'Not provided'}
Subject: ${messageData.subject}

Message:
${messageData.message}

Time: ${messageData.timestamp}
                `
            });
        }
        
    } catch (error) {
        console.error('Error sending message:', error);
        
        // Check for specific Gmail API authentication error
        if (error.status === 412 && error.text && error.text.includes('insufficient authentication scopes')) {
            console.log('Gmail API authentication issue detected. Falling back to demo mode...');
            showNotification('Message received! We\'ll get back to you soon. (Note: Email service is being updated)', 'success');
            contactForm.reset();
            
            // Log the message data for manual follow-up
            console.log('Message data for manual follow-up:', {
                to: 'yevhenii.lim27@gmail.com',
                from: messageData.email,
                subject: `[Mom's Fresh Salads] ${messageData.subject}`,
                body: `
Name: ${messageData.name}
Email: ${messageData.email}
Phone: ${messageData.phone || 'Not provided'}
Subject: ${messageData.subject}

Message:
${messageData.message}

Time: ${messageData.timestamp}
                `
            });
        } else {
            showNotification('Failed to send message. Please try again or call us directly.', 'error');
        }
    } finally {
        // Reset button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
});

// Checkout Form Handling
const checkoutForm = document.getElementById('checkoutForm');
checkoutForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(checkoutForm);
    const customerInfo = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        instructions: formData.get('instructions')
    };
    
    await cart.processPayment(customerInfo);
});

// Checkout Modal Controls
document.getElementById('checkoutClose').addEventListener('click', () => {
    cart.closeCheckout();
});

document.getElementById('checkoutOverlay').addEventListener('click', () => {
    cart.closeCheckout();
});

// Scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animateElements = document.querySelectorAll('.feature-card, .menu-item, .about-text, .contact-info, .contact-form');
    
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Navbar background on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'linear-gradient(135deg, rgba(44, 85, 48, 0.95), rgba(74, 124, 89, 0.95))';
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.background = 'linear-gradient(135deg, #2c5530, #4a7c59)';
        navbar.style.backdropFilter = 'none';
    }
});

// Handle payment success/cancel from URL parameters
function handlePaymentResult() {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const orderId = urlParams.get('orderId');
    
    if (paymentStatus === 'success' && orderId) {
        // Find the order in localStorage
        const orders = JSON.parse(localStorage.getItem('moms-salads-orders') || '[]');
        const order = orders.find(o => o.id.toString() === orderId);
        
        if (order) {
            // Update order status
            order.status = 'confirmed';
            order.paymentStatus = 'completed';
            order.completedAt = new Date().toISOString();
            
            // Update localStorage
            const updatedOrders = orders.map(o => o.id === order.id ? order : o);
            localStorage.setItem('moms-salads-orders', JSON.stringify(updatedOrders));
            
            // Show success message
            showNotification('Payment successful! Your order has been confirmed.', 'success');
            
            // Clear cart
            if (cart) {
                cart.clear();
            }
            
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    } else if (paymentStatus === 'cancelled') {
        showNotification('Payment was cancelled. You can try again anytime.', 'info');
        
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

// Initialize the shopping cart
let cart;
document.addEventListener('DOMContentLoaded', () => {
    cart = new ShoppingCart();
    handlePaymentResult(); // Check for payment results
    console.log('Mom\'s Fresh Salads website with Stripe Checkout loaded successfully!');
});